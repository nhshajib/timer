import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Plus, Trash2, Volume2, X } from 'lucide-react';
import './index.css';

// --- AUDIO IMPORTS (Strict Mapping) ---
import firstWarning from './assets/first warning.mp3';
import secondWarning from './assets/seond warning.mp3'; // Typo preserved as requested
import finalWarning1 from './assets/final warning.mp3';
import finalWarning2 from './assets/final warning 2.mp3';

const SOUND_LIBRARY = {
  "First Warning": firstWarning,
  "Second Warning": secondWarning,
  "Final Warning 1": finalWarning1,
  "Final Warning 2": finalWarning2
};

const DEFAULT_DURATION = 5 * 60 * 1000; // 5 minutes

function App() {
  // --- STATE ---
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Warnings: { id, minutes, soundKey }
  const [warnings, setWarnings] = useState([]);
  const [triggeredWarnings, setTriggeredWarnings] = useState(new Set());

  // Final Alarm Setting: "Randomize" or specific key
  const [finalAlarmSelection, setFinalAlarmSelection] = useState("Randomize");

  // Refs for timing accuracy and audio
  const endTimeRef = useRef(null);
  const rafRef = useRef(null);
  const activeAudioRef = useRef(null); // Keep track to stop if needed (optional)

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft;
      }

      const tick = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTimeRef.current - now);

        setTimeLeft(remaining);

        if (remaining <= 0) {
          handleFinalAlarm();
          setIsRunning(false);
          endTimeRef.current = null;
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      endTimeRef.current = null;
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);

  // --- WARNING LOGIC ---
  // We check warnings in a separate effect that runs when timeLeft changes
  // To avoid spamming, we use a simple floor check or a "triggered" set.
  // Since requestAnimationFrame is high freq, we need to be careful.
  // Better approach: When passing a second boundary.

  const lastSecondRef = useRef(Math.ceil(timeLeft / 1000));

  useEffect(() => {
    const currentSecond = Math.ceil(timeLeft / 1000);

    // Check if we crossed a second boundary downwards
    if (currentSecond < lastSecondRef.current) {
      // We just ticked down a second
      checkWarnings(currentSecond);
    }
    lastSecondRef.current = currentSecond;
  }, [timeLeft]);

  const checkWarnings = (secondsRemaining) => {
    // 1. Check Warning List
    const minutesRemaining = Math.floor(secondsRemaining / 60);

    // Only trigger if we are exactly at the minute mark (secondsRemaining % 60 === 0) 
    // OR just simple "minutes remaining" check if we want it at X minutes 00 seconds.
    // User asked: "If timeLeft matches a warning's Minutes Remaining". 
    // Usually means at exactly X:00.

    if (secondsRemaining % 60 === 0 && secondsRemaining > 0) {
      const matchingWarning = warnings.find(w => w.minutes === minutesRemaining);
      if (matchingWarning) {
        playSound(matchingWarning.soundKey);
      }
    }
  };

  const handleFinalAlarm = () => {
    let soundToPlay;
    if (finalAlarmSelection === "Randomize") {
      const opts = ["Final Warning 1", "Final Warning 2"];
      const pick = opts[Math.floor(Math.random() * opts.length)];
      soundToPlay = SOUND_LIBRARY[pick];
    } else {
      soundToPlay = SOUND_LIBRARY[finalAlarmSelection];
    }

    if (soundToPlay) {
      const audio = new Audio(soundToPlay);
      audio.play().catch(e => console.error(e));
    }
  };

  const playSound = (soundKey) => {
    const file = SOUND_LIBRARY[soundKey];
    if (file) {
      const audio = new Audio(file);
      audio.play().catch(e => console.error(e));
    }
  };

  // --- ACTIONS ---
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    endTimeRef.current = null;
    setTriggeredWarnings(new Set());
    lastSecondRef.current = Math.ceil(duration / 1000);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`app-wrapper ${timeLeft === 0 ? 'alert-pulse' : ''}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="antigravity-card backdrop-blur-xl"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="text-xs tracking-[0.2em] text-cyan-400 font-bold">ANTIGRAVITY // SYS.V2</div>
          <Settings
            size={20}
            className="cursor-pointer text-white/50 hover:text-white transition-colors"
            onClick={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* MAIN DISPLAY */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-8">
          <motion.div
            className={`timer-display ${isRunning ? 'breathe' : ''}`}
            onTap={toggleTimer}
          >
            {formatTime(timeLeft)}
          </motion.div>

          <div className="mt-4 text-white/30 text-sm tracking-widest uppercase">
            {isRunning ? 'Temporal Flux Active' : 'System Standby'}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex justify-center gap-8 pb-12">
          <button className="control-pod" onClick={resetTimer} title="Reset">
            <RotateCcw size={24} />
          </button>

          <button className={`control-pod ${isRunning ? 'active' : ''}`} onClick={toggleTimer} title="Start/Stop">
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
        </div>

      </motion.div>

      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="settings-overlay"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="settings-modal"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight">CONFIGURATION</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="icon-btn">
                  <X size={24} />
                </button>
              </div>

              {/* SECTION 1: FINAL ALARM */}
              <div className="mb-8">
                <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Zero-Point Event (Final Alarm)</label>
                <select
                  className="holo-select"
                  value={finalAlarmSelection}
                  onChange={(e) => setFinalAlarmSelection(e.target.value)}
                >
                  <option value="Randomize">Randomize Protocol</option>
                  <option value="Final Warning 1">Final Warning 1</option>
                  <option value="Final Warning 2">Final Warning 2</option>
                </select>
              </div>

              {/* SECTION 2: WARNINGS */}
              <div className="flex-1 overflow-y-auto">
                <label className="text-xs text-white/50 uppercase tracking-widest mb-4 block">Proximity Alerts</label>

                <div className="space-y-3">
                  {warnings.map((warning) => (
                    <div key={warning.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                      {/* Minutes Input */}
                      <div className="flex flex-col gap-1 w-20">
                        <label className="text-[10px] text-white/30 text-center">MIN</label>
                        <input
                          type="number"
                          className="holo-input"
                          value={warning.minutes}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setWarnings(curr => curr.map(w => w.id === warning.id ? { ...w, minutes: val } : w));
                          }}
                        />
                      </div>

                      {/* Sound Select */}
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-[10px] text-white/30 ml-1">AUDIO SIGNATURE</label>
                        <select
                          className="holo-select text-sm py-2"
                          value={warning.soundKey}
                          onChange={(e) => {
                            setWarnings(curr => curr.map(w => w.id === warning.id ? { ...w, soundKey: e.target.value } : w));
                          }}
                        >
                          {Object.keys(SOUND_LIBRARY).map(key => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      </div>

                      {/* Controls */}
                      <div className="flex items-end gap-1 h-full pb-1">
                        <button
                          className="icon-btn hover:text-cyan-400"
                          onClick={() => playSound(warning.soundKey)}
                          title="Test Audio"
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                        <button
                          className="icon-btn hover:text-red-400"
                          onClick={() => setWarnings(curr => curr.filter(w => w.id !== warning.id))}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="add-btn"
                  onClick={() => {
                    setWarnings([...warnings, {
                      id: Date.now(),
                      minutes: 1,
                      soundKey: "First Warning"
                    }]);
                  }}
                >
                  <Plus size={18} />
                  <span>ADD ALERT VECTOR</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
