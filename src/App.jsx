import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Bell, Trash2, Plus, X, Upload } from 'lucide-react';
import './index.css';

// --- AUDIO IMPORTS ---
import singleBeep from './assets/single_beep.mp3';
import doubleBeep from './assets/double_beep.mp3';
import finalSound from './assets/final_warning.mp3';

import beep1 from './assets/beep1.mp3';

const WARNING_SOUNDS = {
  "Single Beep": singleBeep,
  "Double Beep": doubleBeep,
  "Beep 1": beep1
};

import SettingsOverlay from './components/SettingsOverlay';
import ToastContainer from './components/Toast';


function App() {
  // --- STATE ---
  // Target Time in SECONDS (Final Alarm)
  const [targetTime, setTargetTime] = useState(() => {
    return parseInt(localStorage.getItem('stopwatch-target') || (5 * 60));
  });

  // Warnings: { id, triggerTime (sec), soundKey }
  const [warnings, setWarnings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stopwatch-warnings') || '[]'); } catch { return []; }
  });

  // Custom Sounds State
  const [availableSounds, setAvailableSounds] = useState({});

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Advanced Features State
  // Timer Presets: { id, name, targetTime, warnings }
  const [presets, setPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('timer-presets') || '[]'); } catch { return []; }
  });

  // Session History: { id, date, duration, laps }
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('session-history') || '[]'); } catch { return []; }
  });

  // Volume Control (0-100)
  const [volume, setVolume] = useState(() => {
    return parseInt(localStorage.getItem('timer-volume') || '100');
  });

  // Visual Customization State
  const [clockScale, setClockScale] = useState(() => {
    return parseFloat(localStorage.getItem('timer-clock-scale') || '1.0');
  });
  const [colorThresholds, setColorThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('timer-color-thresholds');
      return saved ? JSON.parse(saved) : [
        { id: 1, time: 30, color: '#fbbf24', type: 'warning' }, // Default yellow < 30s
        { id: 2, time: 0, color: '#ef4444', type: 'final' }    // Default red at 0
      ];
    } catch {
      return [
        { id: 1, time: 30, color: '#fbbf24', type: 'warning' },
        { id: 2, time: 0, color: '#ef4444', type: 'final' }
      ];
    }
  });

  // Apply Visual custom persistence
  useEffect(() => {
    localStorage.setItem('timer-clock-scale', clockScale.toString());
    document.documentElement.style.setProperty('--clock-scale', clockScale.toString());
  }, [clockScale]);

  useEffect(() => {
    localStorage.setItem('timer-color-thresholds', JSON.stringify(colorThresholds));
  }, [colorThresholds]);

  // Save preset
  const savePreset = (name) => {
    const preset = {
      id: Date.now(),
      name,
      targetTime,
      warnings: [...warnings]
    };
    const newPresets = [...presets, preset];
    setPresets(newPresets);
    localStorage.setItem('timer-presets', JSON.stringify(newPresets));
    showToast(`Preset "${name}" saved`, 'success');
  };

  // Load preset
  const loadPreset = (preset) => {
    setTargetTime(preset.targetTime);
    setWarnings(preset.warnings);
    showToast(`Preset "${preset.name}" loaded`, 'info');
  };

  // Delete preset
  const deletePreset = (id) => {
    const newPresets = presets.filter(p => p.id !== id);
    setPresets(newPresets);
    localStorage.setItem('timer-presets', JSON.stringify(newPresets));
    showToast('Preset deleted', 'info');
  };

  // Save session to history
  const saveSession = () => {
    if (laps.length === 0 && elapsedTime === 0) return;

    const session = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: elapsedTime,
      laps: [...laps],
      targetTime
    };
    const newHistory = [session, ...sessionHistory].slice(0, 20); // Keep last 20 sessions
    setSessionHistory(newHistory);
    localStorage.setItem('session-history', JSON.stringify(newHistory));
    showToast('Session saved to history', 'success');
  };

  // Export laps as CSV
  const exportLaps = () => {
    if (laps.length === 0) {
      showToast('No laps to export', 'warning');
      return;
    }

    const csvContent = [
      ['Lap', 'Split Time', 'Total Time'].join(','),
      ...laps.reverse().map(lap => [
        lap.number,
        formatLapTime(lap.split),
        formatLapTime(lap.time)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timer-laps-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Laps exported as CSV', 'success');
  };

  // Persist volume changes
  useEffect(() => {
    localStorage.setItem('timer-volume', volume.toString());
  }, [volume]);

  // Mobile & Accessibility State (moved functions and useEffects after main state declarations)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wakeLock, setWakeLock] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('reduced-motion') === 'true';
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('high-contrast') === 'true';
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    return localStorage.getItem('vibration-enabled') !== 'false'; // Default true
  });


  const fetchSounds = async () => {
    // Only fetch custom sounds in development mode
    if (!import.meta.env.DEV) {
      // In production, load custom sounds from public folder
      // These should be committed to Git and deployed with the app
      try {
        // Attempt to load a manifest file if it exists
        const res = await fetch('/custom_sounds/manifest.json');
        if (res.ok) {
          const files = await res.json();
          const soundMap = {};
          files.forEach(f => {
            soundMap[f] = `/custom_sounds/${f}`;
          });
          setAvailableSounds(soundMap);
        }
      } catch (e) {
        // No manifest, that's okay - just use built-in sounds
        console.log("No custom sounds manifest found");
      }
      return;
    }

    // Development mode: fetch from API
    try {
      const res = await fetch('/api/sounds');
      if (res.ok) {
        const files = await res.json();
        const soundMap = {};
        files.forEach(f => {
          soundMap[f] = `/custom_sounds/${f}`;
        });
        setAvailableSounds(soundMap);
      }
    } catch (e) {
      console.log("Audio server offline or unreachable");
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  // Elapsed Time in MILLISECONDS
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Track triggered events to play once. Set<string|number> (ID or 'FINAL')
  const [triggeredEvents, setTriggeredEvents] = useState(new Set());

  // Track Laps: { id, number, time, split }
  const [laps, setLaps] = useState([]);

  // Refs
  const startTimeRef = useRef(null);   // The timestamp when timer started (adjusted for pauses)
  const workerRef = useRef(null);
  const lastTickRef = useRef(0);       // The elapsed time at the LAST tick (for crossing detection)

  // --- PHASE 6: MOBILE & ACCESSIBILITY FUNCTIONS ---
  // Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        showToast('Fullscreen enabled', 'info', 2000);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        showToast('Fullscreen disabled', 'info', 2000);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      showToast('Fullscreen not supported', 'warning');
    }
  };

  // Wake Lock (keep screen awake)
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        showToast('Screen will stay awake', 'success', 2000);
      }
    } catch (err) {
      console.error('Wake lock error:', err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
      showToast('Screen wake lock released', 'info', 2000);
    }
  };

  // Request wake lock when timer starts
  useEffect(() => {
    if (isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [isRunning]);

  // Vibration on alerts
  const vibrate = (pattern = [200]) => {
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Persist accessibility settings
  useEffect(() => {
    localStorage.setItem('reduced-motion', reducedMotion.toString());
    if (reducedMotion) {
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-base', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    } else {
      document.documentElement.style.setProperty('--transition-fast', '150ms cubic-bezier(0.4, 0, 0.2, 1)');
      document.documentElement.style.setProperty('--transition-base', '300ms cubic-bezier(0.4, 0, 0.2, 1)');
      document.documentElement.style.setProperty('--transition-slow', '500ms cubic-bezier(0.4, 0, 0.2, 1)');
    }
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem('high-contrast', highContrast.toString());
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('vibration-enabled', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('stopwatch-target', targetTime);
    localStorage.setItem('stopwatch-warnings', JSON.stringify(warnings));
  }, [targetTime, warnings]);

  // Reset loop if not running
  useEffect(() => {
    if (!isRunning && elapsedTime === 0) {
      setTriggeredEvents(new Set());
    }
  }, [targetTime]); // Simple trigger

  const playSound = (fileOrKey, fadeIn = true) => {
    // Check if it's a key first
    let src = fileOrKey;
    if (WARNING_SOUNDS[fileOrKey]) src = WARNING_SOUNDS[fileOrKey];
    if (availableSounds[fileOrKey]) src = availableSounds[fileOrKey];

    // If it's a direct file object (from import) it works, if it's a string URL it works
    const audio = new Audio(src);
    audio.volume = fadeIn ? 0 : (volume / 100);

    // Fade in effect
    if (fadeIn) {
      const targetVolume = volume / 100;
      const fadeSteps = 20;
      const fadeInterval = 50; // ms
      let currentStep = 0;

      const fadeTimer = setInterval(() => {
        currentStep++;
        audio.volume = (currentStep / fadeSteps) * targetVolume;
        if (currentStep >= fadeSteps) clearInterval(fadeTimer);
      }, fadeInterval);
    }

    audio.play().catch(e => console.error(e));
  };

  // --- WORKER & TIMER LOGIC ---

  // Keep refs updated for worker callback
  const warningsRef = useRef(warnings);
  useEffect(() => { warningsRef.current = warnings; }, [warnings]);

  const triggeredRef = useRef(triggeredEvents);
  useEffect(() => { triggeredRef.current = triggeredEvents; }, [triggeredEvents]);

  const targetTimeRef = useRef(targetTime);
  useEffect(() => { targetTimeRef.current = targetTime; }, [targetTime]);

  // Available Sounds Ref for playback logic
  const allSoundsRef = useRef({ ...WARNING_SOUNDS });
  useEffect(() => { allSoundsRef.current = { ...WARNING_SOUNDS, ...availableSounds }; }, [availableSounds]);

  useEffect(() => {
    // Initialize Worker
    const WorkerFactory = new URL('./timer.worker.js', import.meta.url);
    const worker = new Worker(WorkerFactory);
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data === 'TICK') {
        if (!startTimeRef.current) return;

        const now = Date.now();
        const currentElapsed = now - startTimeRef.current;
        const prevElapsed = lastTickRef.current;

        setElapsedTime(currentElapsed);

        // CHECK TRIGGERS
        checkTriggers(currentElapsed, prevElapsed);

        lastTickRef.current = currentElapsed;
      }
    };

    return () => worker.terminate();
  }, []);

  const checkTriggers = (currentMs, prevMs) => {
    const activeWarnings = warningsRef.current;
    const triggered = triggeredRef.current;
    const target = targetTimeRef.current * 1000;
    const soundMap = allSoundsRef.current;

    // 1. Check Intermediate Warnings
    activeWarnings.forEach(w => {
      const wTime = w.triggerTime * 1000;
      // Logic: Did we cross the threshold in this tick window?
      // prev < wTime <= current
      // Also duplicate check using set
      if ((prevMs < wTime && currentMs >= wTime) && !triggered.has(w.id)) {
        // Play using lookup
        const src = soundMap[w.soundKey] || WARNING_SOUNDS[w.soundKey];
        if (src) playSound(src);
        vibrate([100]); // Short vibration for intermediate alerts
        safeTriggerAdd(w.id);
      }
    });

    // 2. Check Final Target
    if (target > 0) {
      if ((prevMs < target && currentMs >= target) && !triggered.has('FINAL')) {
        playSound(finalSound);
        vibrate([200, 100, 200]); // Pattern vibration for final alarm
        safeTriggerAdd('FINAL');
        // Note: We do NOT stop the timer as requested.
      }
    }
  };

  const safeTriggerAdd = (id) => {
    // We use the functional update to ensure UI reflects it, 
    // AND we must update the ref immediately if we want to be safe within the same loop 
    // (though loop is single-threaded JS, messages are serial).
    // Since playSound is async-ish (fire and forget), logic is fine.
    setTriggeredEvents(prev => {
      const next = new Set(prev);
      next.add(id);
      triggeredRef.current = next; // Manually sync ref for next instant check
      return next;
    });
  };

  // --- CONTROLS ---
  useEffect(() => {
    if (isRunning) {
      // Start/Resume
      if (!startTimeRef.current) {
        // Determine start time based on current elapsed
        // elapsed = now - start  =>  start = now - elapsed
        startTimeRef.current = Date.now() - elapsedTime;
      }
      lastTickRef.current = elapsedTime;
      if (workerRef.current) workerRef.current.postMessage('START');
    } else {
      // Pause
      if (workerRef.current) workerRef.current.postMessage('STOP');
      startTimeRef.current = null;
      // We keep current elapsedTime in state
    }
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    lastTickRef.current = 0;
    setTriggeredEvents(new Set());
    triggeredRef.current = new Set();
    setLaps([]); // Clear laps
    if (workerRef.current) workerRef.current.postMessage('STOP');
    showToast('Timer reset', 'info', 2000);
  };

  const handleLap = () => {
    const now = elapsedTime;
    const lastLapTime = laps.length > 0 ? laps[0].time : 0; // laps[0] is most recent (since we unshift)
    const split = now - lastLapTime;

    const newLap = {
      id: Date.now(),
      number: laps.length + 1,
      time: now,
      split: split
    };
    // Add to front (newest first)
    setLaps(prev => [newLap, ...prev]);
    showToast(`Lap ${newLap.number} recorded`, 'success', 2000);
  };

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          toggleTimer();
          break;
        case 'r':
          e.preventDefault();
          resetTimer();
          break;
        case 'l':
          e.preventDefault();
          if (isRunning) handleLap();
          break;
        case 's':
          e.preventDefault();
          setIsSettingsOpen(true);
          break;
        case 'escape':
          e.preventDefault();
          setIsSettingsOpen(false);
          break;
        case '1':
          e.preventDefault();
          setTargetTime(5 * 60);
          showToast('Timer set to 5 minutes', 'info', 2000);
          break;
        case '2':
          e.preventDefault();
          setTargetTime(10 * 60);
          showToast('Timer set to 10 minutes', 'info', 2000);
          break;
        case '3':
          e.preventDefault();
          setTargetTime(15 * 60);
          showToast('Timer set to 15 minutes', 'info', 2000);
          break;
        case '4':
          e.preventDefault();
          setTargetTime(25 * 60);
          showToast('Timer set to 25 minutes', 'info', 2000);
          break;
        case '5':
          e.preventDefault();
          setTargetTime(30 * 60);
          showToast('Timer set to 30 minutes', 'info', 2000);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, elapsedTime, laps]); // Dependencies for functions that use these states


  // --- RENDER HELPERS ---
  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000); // Floor for stopwatch (0...1...2)
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Detailed format for laps
  const formatLapTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const d = Math.floor((ms % 1000) / 100);
    return `${m}:${s.toString().padStart(2, '0')}.${d}`;
  };

  const getNextAlert = () => {
    const currentSec = elapsedTime / 1000;

    // Find next intermediate warning > current
    // Sort ascending
    const nextWarning = warnings
      .filter(w => w.triggerTime > currentSec)
      .sort((a, b) => a.triggerTime - b.triggerTime)[0];

    // Also check target
    const target = targetTime;
    const targetPending = target > currentSec;

    if (nextWarning) {
      const diff = Math.ceil(nextWarning.triggerTime - currentSec);
      return `Alert in ${diff}s`;
    } else if (targetPending) {
      const diff = Math.ceil(target - currentSec);
      return `Target in ${diff}s`;
    } else {
      if (triggeredEvents.has('FINAL')) {
        const overtimeMs = elapsedTime - (targetTime * 1000);
        return `Overtime: +${formatTime(overtimeMs)}`;
      }
      return "Running...";
    }
  };

  // --- UI HELPERS ---
  const getCurrentColor = () => {
    const remaining = targetTime - (elapsedTime / 1000);
    // Sort thresholds by time descending
    const sorted = [...colorThresholds].sort((a, b) => b.time - a.time);

    // Default color (Blue)
    let color = 'rgba(96, 165, 250, 0.7)';
    for (const threshold of sorted) {
      if (remaining <= threshold.time) {
        color = threshold.color;
      }
    }
    return color;
  };

  const isNearEnd = () => {
    const remaining = targetTime - (elapsedTime / 1000);
    return remaining <= 30 && remaining > -1; // 30s warning window
  };

  const isOvertime = triggeredEvents.has('FINAL');
  const activeColor = getCurrentColor();

  // Calculate progress percentage for ring
  const progressPercent = targetTime > 0 ? Math.min((elapsedTime / 1000) / targetTime * 100, 100) : 0;

  // Pill Shape Constants (ViewBox 1000x500)
  const pillW = 900;
  const pillH = 460;
  const pillR = pillH / 2;
  const pillStraight = pillW - (pillR * 2);
  const pillCircumference = (2 * pillStraight) + (2 * Math.PI * pillR);
  const strokeDashoffset = pillCircumference - (progressPercent / 100) * pillCircumference;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* CENTERED TIMER AND ALERT */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative' }}>

        {/* PAUSE INDICATOR OVERLAY */}
        <AnimatePresence>
          {!isRunning && elapsedTime > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                top: '-60px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '2px solid #fbbf24',
                borderRadius: '12px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#fbbf24',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                zIndex: 30
              }}
            >
              ⏸ Paused
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN TIMER DISPLAY */}
        <motion.div
          animate={{ scale: isRunning ? 1.05 : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0, repeatType: "reverse" }}
          className={`text-huge`}
          style={{ position: 'relative', zIndex: 20 }}
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Timer: ${formatTime(elapsedTime)}${isRunning ? ', running' : ', stopped'}`}
          role="timer"
        >
          {formatTime(elapsedTime)}
        </motion.div>

        {/* PROGRESS RING - HUD Pill Shape (Properly Layered & Responsive) */}
        <svg
          viewBox="0 0 1000 500"
          style={{
            position: 'absolute',
            width: 'min(95vw, 1600px)',
            height: 'auto',
            aspectRatio: '2 / 1',
            pointerEvents: 'none',
            opacity: 0.9,
            zIndex: 10,
            transform: `scale(${clockScale})`,
            transformOrigin: 'center center',
            transition: 'transform var(--transition-base)'
          }}
        >
          {/* Background Path */}
          <path
            d={`M ${500 - pillStraight / 2},20 L ${500 + pillStraight / 2},20 A ${pillR},${pillR} 0 0 1 ${500 + pillStraight / 2},${pillH + 20} L ${500 - pillStraight / 2},${pillH + 20} A ${pillR},${pillR} 0 0 1 ${500 - pillStraight / 2},20 Z`}
            fill="none"
            stroke="rgba(96, 165, 250, 0.1)"
            strokeWidth="4"
          />
          {/* Progress Path */}
          <motion.path
            d={`M ${500 - pillStraight / 2},20 L ${500 + pillStraight / 2},20 A ${pillR},${pillR} 0 0 1 ${500 + pillStraight / 2},${pillH + 20} L ${500 - pillStraight / 2},${pillH + 20} A ${pillR},${pillR} 0 0 1 ${500 - pillStraight / 2},20 Z`}
            fill="none"
            stroke={activeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={pillCircumference}
            initial={{ strokeDashoffset: pillCircumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 12px ${activeColor})`
            }}
          />
        </svg>



        {/* NEXT ALERT PILL - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert-pill"
          style={{
            background: `${activeColor}22`,
            color: activeColor,
            border: `1px solid ${activeColor}44`,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${activeColor}33`
          }}
        >
          <Bell size={14} fill="currentColor" />
          <span>
            {getNextAlert()}
          </span>
        </motion.div>
      </div>

      {/* LAP LIST (Bottom Left Corner) */}
      {laps.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '140px',
          left: '20px',
          width: '320px',
          maxHeight: '300px',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          zIndex: 5
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Laps
          </div>
          <AnimatePresence>
            {laps.map((lap) => (
              <motion.div
                key={lap.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>#{lap.number}</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>+{formatLapTime(lap.split)}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 400, opacity: 0.8, fontSize: '0.85rem' }}>{formatLapTime(lap.time)}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CONTROL BAR */}
      <div style={{ position: 'fixed', bottom: '40px', zIndex: 10 }}>
        <div className="control-bar">
          {/* LEFT BUTTON: Lap (Running) vs Reset (Paused) */}
          {isRunning ? (
            <button className="btn-circle small" onClick={handleLap} style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}>
              <Plus size={24} strokeWidth={3} />
            </button>
          ) : (
            <button className="btn-circle small" onClick={resetTimer}>
              <RotateCcw size={24} />
            </button>
          )}

          <button className="btn-circle btn-primary" onClick={toggleTimer}>
            {isRunning ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>

          <button className="btn-circle small" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={24} />
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '12px',
          padding: '8px 12px',
          fontSize: '0.7rem',
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          zIndex: 5
        }}>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Space</kbd> Play/Pause</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>R</kbd> Reset</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>L</kbd> Lap</span>
          <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>S</kbd> Settings</span>
        </div>
      </div>

      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targetTime={targetTime}
        setTargetTime={setTargetTime}
        warnings={warnings}
        setWarnings={setWarnings}
        playSound={playSound}
        availableSounds={availableSounds}
        onUpload={fetchSounds}
        finalSound={finalSound}
        WARNING_SOUNDS={WARNING_SOUNDS}
        volume={volume}
        setVolume={setVolume}
        exportLaps={exportLaps}
        saveSession={saveSession}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        reducedMotion={reducedMotion}
        setReducedMotion={setReducedMotion}
        vibrationEnabled={vibrationEnabled}
        setVibrationEnabled={setVibrationEnabled}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        clockScale={clockScale}
        setClockScale={setClockScale}
        colorThresholds={colorThresholds}
        setColorThresholds={setColorThresholds}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
