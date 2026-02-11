import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = ({
    initialTargetTime,
    initialTimerMode,
    playSound,
    showToast,
    vibrate,
    finalSound,
    WARNING_SOUNDS,
    availableSounds,
    volume,
    voiceAnnouncements = false,
    voiceAnnouncementMilestones = [600, 300, 60],
    voiceFinalWarning = 30,
    voiceSelection = '',
    pomodoroWorkTime = 25 * 60,
    pomodoroBreakTime = 5 * 60,
    onSessionComplete
}) => {
    // --- Timer State ---
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timerMode, setTimerMode] = useState(initialTimerMode || 'stopwatch');
    const [targetTime, setTargetTime] = useState(initialTargetTime || (5 * 60));
    const [triggeredEvents, setTriggeredEvents] = useState(new Set());
    const [laps, setLaps] = useState([]);

    // --- Pomodoro State ---
    const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
    const [pomodoroPhase, setPomodoroPhase] = useState('work'); // 'work' or 'break'
    const [pomodoroCount, setPomodoroCount] = useState(0);

    // --- Refs for Worker Callback ---
    const triggeredRef = useRef(triggeredEvents);
    useEffect(() => { triggeredRef.current = triggeredEvents; }, [triggeredEvents]);

    const targetTimeRef = useRef(targetTime);
    useEffect(() => { targetTimeRef.current = targetTime; }, [targetTime]);

    const startTimeRef = useRef(null);
    const workerRef = useRef(null);
    const lastTickRef = useRef(0);
    const playSoundRef = useRef(playSound);
    useEffect(() => { playSoundRef.current = playSound; }, [playSound]);
    const voiceAnnouncementsRef = useRef(voiceAnnouncements);
    useEffect(() => { 
        voiceAnnouncementsRef.current = voiceAnnouncements; 
        // Pre-warm voices when toggled on
        if (voiceAnnouncements && 'speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }, [voiceAnnouncements]);
    const voiceMilestonesRef = useRef(voiceAnnouncementMilestones);
    useEffect(() => { voiceMilestonesRef.current = voiceAnnouncementMilestones; }, [voiceAnnouncementMilestones]);
    const voiceFinalWarningRef = useRef(voiceFinalWarning);
    useEffect(() => { voiceFinalWarningRef.current = voiceFinalWarning; }, [voiceFinalWarning]);
    const voiceSelectionRef = useRef(voiceSelection);
    useEffect(() => { voiceSelectionRef.current = voiceSelection; }, [voiceSelection]);

    // --- Helpers ---
    const safeTriggerAdd = useCallback((id) => {
        setTriggeredEvents(prev => {
            const next = new Set(prev);
            next.add(id);
            triggeredRef.current = next;
            return next;
        });
    }, []);

    const finalSoundRef = useRef(finalSound);
    const availableSoundsRef = useRef(availableSounds);
    const warningSoundsRef = useRef(WARNING_SOUNDS);
    useEffect(() => { finalSoundRef.current = finalSound; }, [finalSound]);
    useEffect(() => { availableSoundsRef.current = availableSounds; }, [availableSounds]);
    useEffect(() => { warningSoundsRef.current = WARNING_SOUNDS; }, [WARNING_SOUNDS]);

    const checkTriggers = useCallback((currentMs, prevMs, warnings) => {
        const target = targetTimeRef.current * 1000;
        const triggered = triggeredRef.current;
        const soundMap = availableSoundsRef.current || {};
        const builtIn = warningSoundsRef.current || {};
        const play = playSoundRef.current;

        // 1. Check Intermediate Warnings
        (warnings || []).forEach(w => {
            const wTime = (w.triggerTime ?? 0) * 1000;
            if ((prevMs < wTime && currentMs >= wTime) && !triggered.has(w.id)) {
                const src = soundMap[w.soundKey] || builtIn[w.soundKey];
                if (src && play) play(src);
                vibrate([100]);
                safeTriggerAdd(w.id);
            }
        });

        // 2. Check Final Target
        if (target > 0) {
            if ((prevMs < target && currentMs >= target) && !triggered.has('FINAL')) {
                if (finalSoundRef.current && play) play(finalSoundRef.current);
                vibrate([200, 100, 200]);
                safeTriggerAdd('FINAL');

                // Pomodoro auto-cycle logic
                if (pomodoroEnabled) {
                    setTimeout(() => {
                        if (pomodoroPhase === 'work') {
                            if (onSessionComplete) {
                                onSessionComplete({
                                    duration: pomodoroWorkTime * 1000,
                                    mode: 'pomodoro',
                                    timestamp: Date.now()
                                });
                            }
                            setPomodoroPhase('break');
                            setTargetTime(pomodoroBreakTime);
                            setPomodoroCount(c => c + 1);
                            resetForCycle();
                            showToast('Great work! Take a 5 min break 🎉', 'success');
                        } else {
                            setPomodoroPhase('work');
                            setTargetTime(pomodoroWorkTime);
                            resetForCycle();
                            showToast('Break over! Back to work 💪', 'info');
                        }
                    }, 1000);
                }
            }
        }

        // 3. Spoken Announcements
        if (voiceAnnouncementsRef.current && 'speechSynthesis' in window) {
            const speakText = (text, rate = 0.9, pitch = 1.0) => {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === voiceSelectionRef.current);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                } else if (voices.length > 0) {
                    utterance.voice = voices[0];
                }
                utterance.volume = volume / 100;
                utterance.rate = rate;
                utterance.pitch = pitch;
                window.speechSynthesis.speak(utterance);
            };

            const formatMilestoneText = (seconds, isElapsed) => {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                const suffix = isElapsed ? 'elapsed' : 'remaining';
                if (mins > 0 && secs > 0) return `${mins} minute${mins > 1 ? 's' : ''} and ${secs} seconds ${suffix}`;
                if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ${suffix}`;
                return `${secs} seconds ${suffix}`;
            };

            if (timerMode === 'countdown' || pomodoroEnabled) {
                const remainingMs = Math.max(0, targetTimeRef.current * 1000 - currentMs);
                const remainingSec = Math.floor(remainingMs / 1000);
                const prevRemainingSec = Math.floor(Math.max(0, targetTimeRef.current * 1000 - prevMs) / 1000);

                const milestones = voiceMilestonesRef.current || [];
                for (const milestone of milestones) {
                    if (remainingSec === milestone && prevRemainingSec > milestone) {
                        speakText(formatMilestoneText(milestone, false));
                        break;
                    }
                }

                const finalWarning = voiceFinalWarningRef.current || 30;
                if (remainingSec === finalWarning && prevRemainingSec > finalWarning) {
                    speakText(`Warning! ${finalWarning} seconds remaining!`, 1.0, 1.1);
                }
            } else {
                const elapsedSec = Math.floor(currentMs / 1000);
                const prevElapsedSec = Math.floor(prevMs / 1000);

                const milestones = voiceMilestonesRef.current || [];
                for (const milestone of milestones) {
                    if (elapsedSec === milestone && prevElapsedSec < milestone) {
                        speakText(formatMilestoneText(milestone, true));
                        break;
                    }
                }
            }
        }
    }, [vibrate, safeTriggerAdd, pomodoroEnabled, pomodoroPhase, pomodoroBreakTime, pomodoroWorkTime, showToast, volume, timerMode]);

    const resetForCycle = () => {
        setElapsedTime(0);
        lastTickRef.current = 0;
        setTriggeredEvents(new Set());
        triggeredRef.current = new Set();
        startTimeRef.current = Date.now();
    };

    // --- Worker Lifecycle ---
    useEffect(() => {
        const WorkerFactory = new URL('./../timer.worker.js', import.meta.url);
        const worker = new Worker(WorkerFactory);
        workerRef.current = worker;

        return () => worker.terminate();
    }, []);

    // Warnings Ref for worker callback
    const warningsRef = useRef([]);
    const updateWarnings = (ws) => { warningsRef.current = ws; };

    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.onmessage = (e) => {
                if (e.data === 'TICK') {
                    if (!startTimeRef.current) return;
                    const now = Date.now();
                    const currentElapsed = now - startTimeRef.current;
                    const prevElapsed = lastTickRef.current;
                    setElapsedTime(currentElapsed);
                    checkTriggers(currentElapsed, prevElapsed, warningsRef.current);
                    lastTickRef.current = currentElapsed;
                }
            };
        }
    }, [checkTriggers]);

    useEffect(() => {
        if (isRunning) {
            if (!startTimeRef.current) {
                startTimeRef.current = Date.now() - elapsedTime;
            }
            workerRef.current.postMessage('START');
        } else {
            workerRef.current.postMessage('STOP');
            startTimeRef.current = null;
        }
    }, [isRunning, elapsedTime]);

    // --- Actions ---
    const toggleTimer = useCallback(() => setIsRunning(v => !v), []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setElapsedTime(0);
        lastTickRef.current = 0;
        setTriggeredEvents(new Set());
        triggeredRef.current = new Set();
        setLaps([]);
        if (workerRef.current) workerRef.current.postMessage('STOP');
        showToast('Timer reset', 'info', 5000);
    }, [showToast]);

    const handleLap = useCallback(() => {
        if (!isRunning) return;
        const total = elapsedTime;
        const prevLapTotal = laps.length > 0 ? laps[0].time : 0;
        const split = total - prevLapTotal;
        const newLap = {
            id: Date.now(),
            number: laps.length + 1,
            time: total,
            split: split
        };
        setLaps(prev => [newLap, ...prev]);
        showToast(`Lap ${newLap.number}: ${(split / 1000).toFixed(1)}s`, 'info', 1500);
    }, [isRunning, elapsedTime, laps, showToast]);

    return {
        elapsedTime,
        isRunning,
        timerMode,
        setTimerMode,
        targetTime,
        setTargetTime,
        triggeredEvents,
        laps,
        setLaps,
        pomodoroEnabled,
        setPomodoroEnabled,
        pomodoroPhase,
        pomodoroCount,
        setPomodoroCount,
        toggleTimer,
        resetTimer,
        handleLap,
        updateWarnings
    };
};
