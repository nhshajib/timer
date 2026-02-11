import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import SettingsOverlay from './components/SettingsOverlay';
import ToastContainer from './components/Toast';
import ShortcutsModal from './components/ShortcutsModal';
import TimerDisplay from './components/TimerDisplay';
import ControlBar from './components/ControlBar';
import LapHistory from './components/LapHistory';

// --- HOOKS ---
import { useTimer } from './hooks/useTimer';

// --- AUDIO ASSETS ---
import singleBeep from './assets/single_beep.mp3';
import doubleBeep from './assets/double_beep.mp3';
import finalSound from './assets/final_warning.mp3';
import beep1 from './assets/beep1.mp3';

const WARNING_SOUNDS = {
  "Single Beep": singleBeep,
  "Double Beep": doubleBeep,
  "Beep 1": beep1
};

function App() {
  // --- PERSISTENT SETTINGS STATE ---
  const [warnings, setWarnings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stopwatch-warnings') || '[]'); } catch { return []; }
  });
  const [availableSounds, setAvailableSounds] = useState({});
  const [toasts, setToasts] = useState([]);
  const [presets, setPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('timer-presets') || '[]'); } catch { return []; }
  });
  const [sessionHistory, setSessionHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('session-history') || '[]'); } catch { return []; }
  });
  const [volume, setVolume] = useState(() => parseInt(localStorage.getItem('timer-volume') || '100'));

  // Advanced Settings
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reduced-motion') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('high-contrast') === 'true');
  const [vibrationEnabled, setVibrationEnabled] = useState(() => localStorage.getItem('vibration-enabled') !== 'false');
  const [voiceAnnouncements, setVoiceAnnouncements] = useState(() => localStorage.getItem('voice-announcements') === 'true');
  const [voiceAnnouncementMilestones, setVoiceAnnouncementMilestones] = useState(() => {
    try {
      const saved = localStorage.getItem('voice-announcement-milestones');
      return saved ? JSON.parse(saved) : [600, 300, 60]; // Default: 10min, 5min, 1min
    } catch { return [600, 300, 60]; }
  });
  const [voiceFinalWarning, setVoiceFinalWarning] = useState(() => parseInt(localStorage.getItem('voice-final-warning') || '30'));
  const [voiceSelection, setVoiceSelection] = useState(() => localStorage.getItem('voice-selection') || '');

  // Theme State: 'dark' or 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('timer-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('timer-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // Visual Customization
  const DEFAULT_COLORS = [
    { id: 1, time: 30, color: '#fbbf24', type: 'warning' },
    { id: 2, time: 0, color: '#ef4444', type: 'final' }
  ];
  const [clockScale, setClockScale] = useState(() => parseFloat(localStorage.getItem('timer-clock-scale') || '1.0'));
  const [colorThresholds, setColorThresholds] = useState(() => {
    try {
      const saved = localStorage.getItem('timer-color-thresholds');
      return saved ? JSON.parse(saved) : DEFAULT_COLORS;
    } catch { return DEFAULT_COLORS; }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // --- HELPERS (TOAST/SOUND/VIBRATE) ---
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const vibrate = useCallback((pattern = [200]) => {
    if (vibrationEnabled && 'vibrate' in navigator) navigator.vibrate(pattern);
  }, [vibrationEnabled]);

  const playSound = useCallback((fileOrKey) => {
    if (fileOrKey == null) return;
    const src = WARNING_SOUNDS[fileOrKey] || availableSounds[fileOrKey] || (typeof fileOrKey === 'string' ? fileOrKey : null);
    if (!src || typeof src !== 'string') return;
    const audio = new Audio(src);
    audio.volume = volume / 100;
    audio.play().catch(e => console.warn('Audio play failed (may be blocked by browser):', e?.message || e));
  }, [availableSounds, volume]);

  // Unlock audio on first timer start so warning sounds can play (browser autoplay policy)
  const audioUnlockedRef = useRef(false);
  const prevRunningRef = useRef(false);
  useEffect(() => {
    const isRunning = timer?.isRunning ?? false;
    if (isRunning && !prevRunningRef.current && !audioUnlockedRef.current) {
      audioUnlockedRef.current = true;
      const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silent.volume = 0;
      silent.play().catch(() => {});
    }
    prevRunningRef.current = isRunning;
  }, [timer?.isRunning]);

  // --- CORE TIMER HOOK ---
  const timer = useTimer({
    initialTargetTime: parseInt(localStorage.getItem('stopwatch-target') || (5 * 60)),
    initialTimerMode: localStorage.getItem('timer-mode') || 'stopwatch',
    playSound,
    showToast,
    vibrate,
    finalSound,
    WARNING_SOUNDS,
    availableSounds,
    volume,
    voiceAnnouncements,
    voiceAnnouncementMilestones,
    voiceFinalWarning,
    voiceSelection,
    onSessionComplete: (session) => {
      setSessionHistory(prev => {
        const next = [...prev, { ...session, id: Date.now(), lapsCount: timer.laps.length }];
        localStorage.setItem('session-history', JSON.stringify(next));
        return next;
      });
      showToast('Focus session recorded! 🚀', 'success');
    }
  });

  // Sync warnings with hook ref
  useEffect(() => {
    timer.updateWarnings(warnings);
  }, [warnings, timer]);

  // Sync persistence
  useEffect(() => {
    localStorage.setItem('stopwatch-target', timer.targetTime);
    localStorage.setItem('stopwatch-warnings', JSON.stringify(warnings));
    localStorage.setItem('timer-mode', timer.timerMode);
    localStorage.setItem('timer-volume', volume.toString());
    localStorage.setItem('timer-clock-scale', clockScale.toString());
    localStorage.setItem('timer-color-thresholds', JSON.stringify(colorThresholds));
    localStorage.setItem('reduced-motion', reducedMotion.toString());
    localStorage.setItem('high-contrast', highContrast.toString());
    localStorage.setItem('vibration-enabled', vibrationEnabled.toString());
    localStorage.setItem('voice-announcements', voiceAnnouncements.toString());
    localStorage.setItem('voice-announcement-milestones', JSON.stringify(voiceAnnouncementMilestones));
    localStorage.setItem('voice-final-warning', voiceFinalWarning.toString());
    localStorage.setItem('voice-selection', voiceSelection);
    localStorage.setItem('session-history', JSON.stringify(sessionHistory));
    document.documentElement.style.setProperty('--clock-scale', clockScale.toString());
  }, [timer.targetTime, warnings, timer.timerMode, volume, clockScale, colorThresholds, reducedMotion, highContrast, vibrationEnabled, sessionHistory, voiceAnnouncements, voiceAnnouncementMilestones, voiceFinalWarning, voiceSelection]);

  // --- AUDIO DISCOVERY ---
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const endpoint = import.meta.env.DEV ? '/api/sounds' : '/custom_sounds/manifest.json';
        const res = await fetch(endpoint);
        if (res.ok) {
          const files = await res.json();
          const soundMap = {};
          files.forEach(f => { soundMap[f] = `/custom_sounds/${f}`; });
          setAvailableSounds(soundMap);
        }
      } catch (e) { console.log("Audio discovery unreachable"); }
    };
    fetchSounds();
  }, []);

  // --- KEYBOARD SHORTCUTS ---
  // Wrap resetTimer to save session if it was long enough
  const handleReset = useCallback(() => {
    if (timer.elapsedTime > 60000 && !timer.pomodoroEnabled) { // > 1 minute
      setSessionHistory(prev => {
        const next = [...prev, {
          id: Date.now(),
          duration: timer.elapsedTime,
          mode: timer.timerMode,
          timestamp: Date.now(),
          lapsCount: timer.laps.length
        }];
        localStorage.setItem('session-history', JSON.stringify(next));
        return next;
      });
      showToast('Focus session saved! 📊', 'success');
    }
    timer.resetTimer();
  }, [timer.elapsedTime, timer.pomodoroEnabled, timer.timerMode, timer.laps.length, timer.resetTimer, showToast]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); timer.toggleTimer(); break;
        case 'r': handleReset(); break;
        case 'l': timer.handleLap(); break;
        case 's': setIsSettingsOpen(prev => !prev); break;
        case '?': e.preventDefault(); setIsShortcutsOpen(true); break;
        case 'escape': setIsSettingsOpen(false); setIsShortcutsOpen(false); break;
        case '1': timer.setTargetTime(5 * 60); timer.toggleTimer(); break;
        case '2': timer.setTargetTime(10 * 60); timer.toggleTimer(); break;
        case '3': timer.setTargetTime(15 * 60); timer.toggleTimer(); break;
        case '4': timer.setTargetTime(25 * 60); timer.toggleTimer(); break;
        case '5': timer.setTargetTime(30 * 60); timer.toggleTimer(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [timer]);

  // --- UI HELPERS ---
  const formatTime = (elapsedMs) => {
    const displayMs = timer.timerMode === 'countdown' ? Math.max(0, (timer.targetTime * 1000) - elapsedMs) : elapsedMs;
    const totalSec = Math.floor(displayMs / 1000);
    return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
  };

  const formatLapTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}.${Math.floor((ms % 1000) / 100)}`;
  };

  const getCurrentColor = () => {
    const remaining = timer.targetTime - (timer.elapsedTime / 1000);
    const sorted = [...colorThresholds].sort((a, b) => b.time - a.time);
    let color = 'rgba(96, 165, 250, 0.7)';
    for (const threshold of sorted) {
      if (remaining <= threshold.time) color = threshold.color;
    }
    return color;
  };

  const progressPercent = Math.min(100, (timer.elapsedTime / (timer.targetTime * 1000)) * 100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error(`Error attempting to enable full-screen mode: ${e.message} (${e.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportLaps = () => {
    if (timer.laps.length === 0) {
      showToast('No laps to export!', 'error');
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,Duration (ms)\n"
      + timer.laps.map(l => `${l.id},${new Date(l.timestamp).toLocaleTimeString()},${l.duration}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `timer_laps_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laps exported! 📄', 'success');
  };

  const saveSession = () => {
    if (timer.elapsedTime < 1000) {
      showToast('Session too short to save!', 'error');
      return;
    }
    setSessionHistory(prev => {
      const next = [...prev, {
        id: Date.now(),
        duration: timer.elapsedTime,
        mode: timer.timerMode,
        timestamp: Date.now(),
        lapsCount: timer.laps.length
      }];
      localStorage.setItem('session-history', JSON.stringify(next));
      return next;
    });
    showToast('Session saved! 💾', 'success');
  };

  const onResetVisuals = () => {
    setClockScale(1.0);
    setColorThresholds(DEFAULT_COLORS);
    showToast('Visuals reset to default! ✨', 'info');
  };

  const onUpload = (filename) => {
    setAvailableSounds(prev => ({ ...prev, [filename]: `/custom_sounds/${filename}` }));
    showToast(`New sound added: ${filename}`, 'success');
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      <AnimatePresence>
        {timer.isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 40%, ${getCurrentColor()}, transparent 70%)`,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <LapHistory laps={timer.laps} setLaps={timer.setLaps} formatLapTime={formatLapTime} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'relative',
        flex: 1,
      }}>
        <TimerDisplay
          elapsedTime={timer.elapsedTime}
          isRunning={timer.isRunning}
          timerMode={timer.timerMode}
          targetTime={timer.targetTime}
          formatTime={formatTime}
          clockScale={clockScale}
          activeColor={getCurrentColor()}
          progressPercent={progressPercent}
        />

        <AnimatePresence>
          {!timer.isRunning && timer.elapsedTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.15)',
                color: 'var(--accent-amber)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              PAUSED
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ControlBar
        isRunning={timer.isRunning}
        toggleTimer={timer.toggleTimer}
        resetTimer={handleReset}
        handleLap={timer.handleLap}
        setIsSettingsOpen={setIsSettingsOpen}
        timerMode={timer.timerMode}
        setTimerMode={timer.setTimerMode}
        onShowShortcuts={() => setIsShortcutsOpen(true)}
      />

      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targetTime={timer.targetTime}
        setTargetTime={timer.setTargetTime}
        warnings={warnings}
        setWarnings={setWarnings}
        playSound={playSound}
        availableSounds={availableSounds}
        onUpload={onUpload}
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
        onResetVisuals={onResetVisuals}
        theme={theme}
        setTheme={setTheme}
        sessionHistory={sessionHistory}
        pomodoroCount={timer.pomodoroCount}
        voiceAnnouncements={voiceAnnouncements}
        setVoiceAnnouncements={setVoiceAnnouncements}
        voiceAnnouncementMilestones={voiceAnnouncementMilestones}
        setVoiceAnnouncementMilestones={setVoiceAnnouncementMilestones}
        voiceFinalWarning={voiceFinalWarning}
        setVoiceFinalWarning={setVoiceFinalWarning}
        voiceSelection={voiceSelection}
        setVoiceSelection={setVoiceSelection}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
