import { useState, useRef, useEffect } from 'react';
// We rely on direct paths for now, assuming public or correctly served assets. 
// For better production builds, we would import these, but dynamic imports with spaces can be tricky.
// We will use the paths provided by the user relative to src/assets, assuming they are available via URL.

const SOUND_MAP = {
    'soft': '/src/assets/first warning.mp3',
    'urgent': '/src/assets/second warning.mp3',
    'final_warning_1': '/src/assets/final warning.mp3',
    'final_warning_2': '/src/assets/final warning 2.mp3',
};

export const useTimer = () => {
    // Load duration from local storage (Default 5 minutes / 300000 ms)
    const [duration, setDuration] = useState(() => {
        try {
            const saved = localStorage.getItem('antigravity-duration');
            return saved ? parseInt(saved, 10) : 300000;
        } catch (e) {
            console.error(e);
            return 300000;
        }
    });

    // Initialize timeLeft to duration
    const [timeLeft, setTimeLeft] = useState(duration);

    const [isRunning, setIsRunning] = useState(false);
    const [isAlerting, setIsAlerting] = useState(false);

    // Load warnings from local storage
    const [warnings, setWarnings] = useState(() => {
        try {
            const saved = localStorage.getItem('antigravity-warnings');
            const parsed = saved ? JSON.parse(saved) : [];
            // Migration: If soundFile is missing but sound exists, map it?
            // Or just allow mixed for now. We will use soundFile moving forward.
            return parsed;
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const [triggeredWarnings, setTriggeredWarnings] = useState(new Set());
    const intervalRef = useRef(null);
    const warningsRef = useRef(warnings);
    const endTimeRef = useRef(null);
    const lastTickRef = useRef(timeLeft);
    const audioInstanceRef = useRef(null);

    // Save duration whenever it changes
    useEffect(() => {
        localStorage.setItem('antigravity-duration', duration.toString());
    }, [duration]);

    useEffect(() => {
        warningsRef.current = warnings;
        localStorage.setItem('antigravity-warnings', JSON.stringify(warnings));
    }, [warnings]);

    const playSound = (path) => {
        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current = null;
        }
        const audio = new Audio(path);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed', e));
        audioInstanceRef.current = audio;
    };

    const triggerAlarm = (final = false, specificSoundKey = null) => {
        console.log(final ? "FINAL ALARM" : `Warning Triggered: ${specificSoundKey}`);

        if (final) {
            // Randomize final alarm
            const keys = ['final_warning_1', 'final_warning_2'];
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            playSound(SOUND_MAP[randomKey]);
        } else if (specificSoundKey && SOUND_MAP[specificSoundKey]) {
            playSound(SOUND_MAP[specificSoundKey]);
        } else {
            // Fallback default
            playSound(SOUND_MAP['soft']);
        }

        setIsAlerting(true);
        setTimeout(() => {
            setIsAlerting(false);
        }, 2000);
    };

    const startPause = () => {
        if (timeLeft === 0) return;

        if (isRunning) {
            // Pause
            setIsRunning(false);
            clearInterval(intervalRef.current);
        } else {
            // Start
            setIsRunning(true);
            endTimeRef.current = Date.now() + timeLeft;
            lastTickRef.current = timeLeft;
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, endTimeRef.current - now);
                const prevMetric = lastTickRef.current;

                if (remaining === 0) {
                    clearInterval(intervalRef.current);
                    setIsRunning(false);
                    setTimeLeft(0);
                    triggerAlarm(true);
                    return;
                }

                // Check warnings
                warningsRef.current.forEach(warning => {
                    // Logic: If we were previously ABOVE the warning time, and now we are ON or BELOW it
                    if (prevMetric > warning.time && remaining <= warning.time && !triggeredWarnings.has(warning.id)) {
                        triggerAlarm(false, warning.soundFile);
                        setTriggeredWarnings(prevSet => new Set(prevSet).add(warning.id));
                    }
                });

                lastTickRef.current = remaining;
                setTimeLeft(remaining);
            }, 20);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, triggeredWarnings]);

    const reset = () => {
        setIsRunning(false);
        setTimeLeft(duration);
        setTriggeredWarnings(new Set());
        setIsAlerting(false);
        endTimeRef.current = null;
        if (audioInstanceRef.current) {
            audioInstanceRef.current.pause();
            audioInstanceRef.current = null;
        }
    };

    const setTotalDuration = (minutes) => {
        const ms = minutes * 60 * 1000;
        setDuration(ms);
        setTimeLeft(ms);
        setTriggeredWarnings(new Set());
        setIsRunning(false);
        endTimeRef.current = null;
    };

    // Warning management
    const addWarning = (minutes, soundKey = 'soft') => {
        const timeInMs = minutes * 60 * 1000;
        if (warnings.some(w => w.time === timeInMs)) return;
        const newWarning = { id: Date.now().toString(), time: timeInMs, minutes, soundFile: soundKey };
        setWarnings(prev => [...prev, newWarning]);
    };

    const updateWarning = (id, updates) => {
        setWarnings(prev => prev.map(w => {
            if (w.id !== id) return w;
            const newW = { ...w, ...updates };
            // If minutes changed, recalculate time
            if (updates.minutes !== undefined) {
                newW.time = updates.minutes * 60 * 1000;
            }
            return newW;
        }));
    };

    const removeWarning = (id) => {
        setWarnings(prev => prev.filter(w => w.id !== id));
    };

    const formatTime = (ms) => {
        if (ms < 0) ms = 0;
        const minutes = Math.floor((ms / 60000) % 60);
        const seconds = Math.floor((ms / 1000) % 60);
        const centiseconds = Math.floor((ms / 10) % 100);

        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            centiseconds: centiseconds.toString().padStart(2, '0')
        };
    };

    const progress = duration > 0 ? timeLeft / duration : 0;

    return {
        timeLeft,
        duration,
        isRunning,
        isAlerting,
        progress,
        startPause,
        reset,
        setTotalDuration,
        formatTime,
        warnings,
        addWarning,
        updateWarning,
        removeWarning,
        SOUND_MAP
    };
};
