import { useState, useRef, useEffect } from 'react';

export const useStopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Load initial state from localStorage if available
    const [warnings, setWarnings] = useState(() => {
        try {
            const saved = localStorage.getItem('antigravity-warnings');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error(e);
            return [];
        }
    });

    const [triggeredWarnings, setTriggeredWarnings] = useState(new Set()); // Track triggered IDs
    const [isAlerting, setIsAlerting] = useState(false); // New state for Red Alert visual
    const warningsRef = useRef(warnings); // Ref to access latest warnings in interval
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/src/assets/alert.mp3');
        audioRef.current.volume = 0.5;
    }, []);

    // Update ref and persistence when warnings change
    useEffect(() => {
        warningsRef.current = warnings;
        localStorage.setItem('antigravity-warnings', JSON.stringify(warnings));
    }, [warnings]);

    const triggerWarning = (id) => {
        console.log(`Warning ${id} triggered!`);

        // Play Audio
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed', e));
        }

        // Trigger Visual Alert (Red Pulse)
        setIsAlerting(true);
        setTimeout(() => {
            setIsAlerting(false);
        }, 2000); // 2 seconds pulse
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 10;

                    // Check warnings
                    warningsRef.current.forEach(warning => {
                        if (newTime >= warning.time && !triggeredWarnings.has(warning.id)) {
                            triggerWarning(warning.id);
                            setTriggeredWarnings(prev => new Set(prev).add(warning.id));
                        }
                    });

                    return newTime;
                });
            }, 10);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, triggeredWarnings]); // dependency on triggeredWarnings to ensure set is fresh-ish, though set update function handles it. 

    const startPause = () => {
        setIsRunning(!isRunning);
    };

    const reset = () => {
        setIsRunning(false);
        setTime(0);
        setTriggeredWarnings(new Set());
        setIsAlerting(false);
    };

    const addWarning = (minutes) => {
        const timeInMs = minutes * 60 * 1000;
        const newWarning = { id: Date.now(), time: timeInMs, minutes };
        setWarnings(prev => [...prev, newWarning]);
    };

    const removeWarning = (id) => {
        setWarnings(prev => prev.filter(w => w.id !== id));
    };

    const formatTime = () => {
        const minutes = Math.floor((time / 60000) % 60);
        const seconds = Math.floor((time / 1000) % 60);
        const centiseconds = Math.floor((time / 10) % 100);

        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            centiseconds: centiseconds.toString().padStart(2, '0')
        };
    };

    return { time, isRunning, startPause, reset, formatTime, warnings, addWarning, removeWarning, isAlerting };
};
