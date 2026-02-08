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
    const [lastResetState, setLastResetState] = useState(null);

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
    const voiceAnnouncementsRef = useRef(voiceAnnouncements);
    useEffect(() => { voiceAnnouncementsRef.current = voiceAnnouncements; }, [voiceAnnouncements]);
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

    const checkTriggers = useCallback((currentMs, prevMs, warnings) => {
        const target = targetTimeRef.current * 1000;
        const triggered = triggeredRef.current;
        const soundMap = availableSounds || {};

        // 1. Check Intermediate Warnings
        warnings.forEach(w => {
            const wTime = w.triggerTime * 1000;
            if ((prevMs < wTime && currentMs >= wTime) && !triggered.has(w.id)) {
                const src = soundMap[w.soundKey] || WARNING_SOUNDS[w.soundKey];
                if (src) playSound(src);
                vibrate([100]);
                safeTriggerAdd(w.id);
            }
        });

        // 2. Check Final Target
        if (target > 0) {
            if ((prevMs < target && currentMs >= target) && !triggered.has('FINAL')) {
                playSound(finalSound);
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

        // 3. Spoken Announcements (Milestone-based)
        if (voiceAnnouncementsRef.current && 'speechSynthesis' in window && timerMode === 'countdown') {
            const remainingMs = Math.max(0, targetTimeRef.current * 1000 - currentMs);
            const remainingSec = Math.floor(remainingMs / 1000);
            const prevRemainingSec = Math.floor(Math.max(0, targetTimeRef.current * 1000 - prevMs) / 1000);

            // Check milestones
            const milestones = voiceMilestonesRef.current || [];
            for (const milestone of milestones) {
                if (remainingSec <= milestone && prevRemainingSec > milestone) {
                    const mins = Math.floor(milestone / 60);
                    const secs = milestone % 60;
                    let text = "";
                    if (mins > 0 && secs > 0) text = `${mins} minute${mins > 1 ? 's' : ''} and ${secs} seconds remaining`;
                    else if (mins > 0) text = `${mins} minute${mins > 1 ? 's' : ''} remaining`;
                    else text = `${secs} seconds remaining`;

                    const utterance = new SpeechSynthesisUtterance(text);
                    const voices = window.speechSynthesis.getVoices();
                    const selectedVoice = voices.find(v => v.name === voiceSelectionRef.current);
                    if (selectedVoice) utterance.voice = selectedVoice;
                    utterance.volume = volume / 100;
                    utterance.rate = 0.9;
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                    break; // Only announce one milestone per tick
                }
            }

            // Final warning (special announcement)
            const finalWarning = voiceFinalWarningRef.current || 30;
            if (remainingSec <= finalWarning && prevRemainingSec > finalWarning) {
                const text = `Warning! ${finalWarning} seconds remaining!`;
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === voiceSelectionRef.current);
                if (selectedVoice) utterance.voice = selectedVoice;
                utterance.volume = volume / 100;
                utterance.rate = 1.0; // Slightly faster for urgency
                utterance.pitch = 1.1; // Slightly higher pitch for urgency
                window.speechSynthesis.speak(utterance);
            }
        }
    }, [availableSounds, WARNING_SOUNDS, playSound, vibrate, safeTriggerAdd, finalSound, pomodoroEnabled, pomodoroPhase, pomodoroBreakTime, pomodoroWorkTime, showToast, volume, timerMode]);

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
        if (elapsedTime > 0 || laps.length > 0) {
            setLastResetState({
                elapsedTime,
                laps: [...laps],
                triggeredEvents: new Set(triggeredEvents)
            });
        }
        setIsRunning(false);
        setElapsedTime(0);
        lastTickRef.current = 0;
        setTriggeredEvents(new Set());
        triggeredRef.current = new Set();
        setLaps([]);
        if (workerRef.current) workerRef.current.postMessage('STOP');
        showToast('Timer reset', 'info', 5000);
    }, [elapsedTime, laps, triggeredEvents, showToast]);

    const undoReset = useCallback(() => {
        if (!lastResetState) return;
        setElapsedTime(lastResetState.elapsedTime);
        setLaps(lastResetState.laps);
        setTriggeredEvents(lastResetState.triggeredEvents);
        triggeredRef.current = lastResetState.triggeredEvents;
        lastTickRef.current = lastResetState.elapsedTime;
        setLastResetState(null);
        showToast('Reset undone', 'success', 2000);
    }, [lastResetState, showToast]);

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
        lastResetState,
        pomodoroEnabled,
        setPomodoroEnabled,
        pomodoroPhase,
        pomodoroCount,
        setPomodoroCount,
        toggleTimer,
        resetTimer,
        undoReset,
        handleLap,
        updateWarnings
    };
};
