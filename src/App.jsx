import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Bell, Trash2, Plus, X, Upload } from 'lucide-react';
import './index.css';

// --- AUDIO IMPORTS ---
import singleBeep from './assets/single_beep.mp3';
import doubleBeep from './assets/double_beep.mp3';
import finalSound from './assets/final_warning.mp3';

const WARNING_SOUNDS = {
  "Single Beep": singleBeep,
  "Double Beep": doubleBeep
};

// --- SETTINGS OVERLAY ---
const SettingsModal = ({ isOpen, onClose, targetTime, setTargetTime, warnings, setWarnings, playSound, availableSounds, onUpload }) => {
  const [newMin, setNewMin] = useState(1);
  const [newSec, setNewSec] = useState(0);
  const [newSound, setNewSound] = useState("Single Beep");

  // Admin Upload State
  const [adminPass, setAdminPass] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return setUploadStatus("No file selected.");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'x-admin-password': adminPass },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setUploadStatus("Success!");
        onUpload(data.filename); // Callback to refresh list
        setFile(null);
      } else {
        setUploadStatus(data.error || "Upload failed");
      }
    } catch (e) {
      setUploadStatus("Error: Server offline?");
    }
  };

  const addWarning = () => {
    const totalSec = (parseInt(newMin) || 0) * 60 + (parseInt(newSec) || 0);
    if (totalSec <= 0) return;

    const newW = { id: Date.now(), triggerTime: totalSec, soundKey: newSound };
    // Sort by time ascending (earliest first)
    setWarnings(prev => [...prev, newW].sort((a, b) => a.triggerTime - b.triggerTime));
    setNewMin(1); setNewSec(0);
  };

  // Merge default + available
  const allSounds = { ...WARNING_SOUNDS, ...availableSounds };

  const targetMin = Math.floor(targetTime / 60);
  const targetSec = targetTime % 60;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="modal-overlay" onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="modal-card" onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Flight Config</h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            {/* Target Duration Setting */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
              <label className="text-label" style={{ display: 'block', marginBottom: '12px', color: '#60a5fa' }}>Target Duration (Final Alarm)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="number" className="input-modern" value={targetMin}
                  onChange={e => setTargetTime((Math.max(0, parseInt(e.target.value) || 0) * 60) + targetSec)}
                  style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)' }}>:</span>
                <input type="number" className="input-modern" value={targetSec}
                  onChange={e => setTargetTime((targetMin * 60) + Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}
                />
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Timer will alert but continue counting.
              </div>
            </div>

            {/* Warnings List */}
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '12px' }}>Intermediate Alerts</label>

              {/* Creator */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'rgba(255,255,255,0.6)' }}>Play sound after:</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="number" className="input-modern" placeholder="Min" value={newMin} onChange={e => setNewMin(e.target.value)} style={{ flex: 1 }} />
                  <input type="number" className="input-modern" placeholder="Sec" value={newSec} onChange={e => setNewSec(e.target.value)} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="input-modern" value={newSound} onChange={e => setNewSound(e.target.value)} style={{ flex: 2 }}>
                    {Object.keys(allSounds).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <button className="btn-circle small" onClick={addWarning} style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', width: 'auto', padding: '0 16px' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {warnings.map(w => (
                  <div key={w.id} className="setting-row">
                    <div style={{ fontWeight: 700, color: 'white', width: '70px', fontFamily: 'monospace' }}>
                      {Math.floor(w.triggerTime / 60)}:{String(w.triggerTime % 60).padStart(2, '0')}
                    </div>
                    <div style={{ flex: 1, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{w.soundKey}</div>
                    <div onClick={() => playSound(allSounds[w.soundKey] || WARNING_SOUNDS[w.soundKey])} style={{ cursor: 'pointer', opacity: 0.5, marginRight: 8 }} title="Test Sound">
                      <Play size={14} />
                    </div>
                    <div className="btn-ghost-danger" onClick={() => setWarnings(warnings.filter(x => x.id !== w.id))}>
                      <Trash2 size={18} />
                    </div>
                  </div>
                ))}
                {warnings.length === 0 && <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.9rem', padding: '10px' }}>No intermediate alerts set.</div>}
              </div>
            </div>

            {/* ADMIN UPLOAD */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <label className="text-label" style={{ display: 'block', marginBottom: '12px', color: '#fca5a5' }}>Admin: Import Audio</label>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px' }}>
                <input type="password" placeholder="Admin Password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
                  className="input-modern" style={{ marginBottom: '8px', fontSize: '0.9rem' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label className="input-modern" style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <Upload size={16} />
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file ? file.name : "Select Audio..."}
                    </span>
                    <input type="file" accept="audio/*" hidden onChange={e => setFile(e.target.files[0])} />
                  </label>
                  <button onClick={handleUpload} className="btn-circle small" style={{ borderRadius: '12px', width: 'auto', padding: '0 16px', background: 'var(--accent-primary)', color: 'white' }}>
                    Upload
                  </button>
                </div>
                {uploadStatus && <div style={{ fontSize: '0.8rem', marginTop: '8px', color: uploadStatus.includes('Success') ? '#4ade80' : '#f87171' }}>{uploadStatus}</div>}
              </div>
            </div>

            <button className="btn-block" onClick={onClose} style={{ marginTop: '20px' }}>Done</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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

  const fetchSounds = async () => {
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

  const playSound = (fileOrKey) => {
    // Check if it's a key first
    let src = fileOrKey;
    if (WARNING_SOUNDS[fileOrKey]) src = WARNING_SOUNDS[fileOrKey];
    if (availableSounds[fileOrKey]) src = availableSounds[fileOrKey];

    // If it's a direct file object (from import) it works, if it's a string URL it works
    const audio = new Audio(src);
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
        safeTriggerAdd(w.id);
      }
    });

    // 2. Check Final Target
    if (target > 0) {
      if ((prevMs < target && currentMs >= target) && !triggered.has('FINAL')) {
        playSound(finalSound);
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
  };

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
      return triggeredEvents.has('FINAL') ? "Overtime" : "Running...";
    }
  };

  // --- UI HELPERS ---
  const isNearEnd = () => {
    const remaining = targetTime - (elapsedTime / 1000);
    return remaining <= 30 && remaining > -1; // 30s warning window
  };

  const isOvertime = triggeredEvents.has('FINAL');

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

      {/* MAIN TIMER DISPLAY */}
      <motion.div
        animate={{ scale: isRunning ? 1.05 : 1 }}
        transition={{ duration: 1, repeat: isRunning ? Infinity : 0, repeatType: "reverse" }}
        className={`text-huge ${isNearEnd() || isOvertime ? 'text-alert' : ''}`}
      >
        {formatTime(elapsedTime)}
      </motion.div>

      {/* NEXT ALERT PILL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="alert-pill"
        style={{
          background: isOvertime ? 'rgba(239, 68, 68, 0.2)' : undefined,
          color: isOvertime ? '#fca5a5' : undefined
        }}
      >
        <Bell size={14} fill="currentColor" />
        {(!isRunning && isOvertime) ?
          `Overtime: +${formatTime(elapsedTime - (targetTime * 1000))}`
          : getNextAlert()
        }
      </motion.div>

      {/* LAP LIST (Scrollable Area) */}
      <div style={{
        flex: 1, width: '100%', maxWidth: '90%', overflowY: 'auto', marginTop: '20px', marginBottom: '120px', padding: '0 20px',
        maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
      }}>
        <AnimatePresence>
          {laps.map((lap) => (
            <motion.div
              key={lap.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex', justifyContent: 'space-between', padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.9)',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '1.2rem', // Bigger Font
                fontWeight: 500
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>Lap {lap.number}</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>+{formatLapTime(lap.split)}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 400, opacity: 0.8 }}>{formatLapTime(lap.time)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

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
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        targetTime={targetTime}
        setTargetTime={setTargetTime}
        warnings={warnings}
        setWarnings={setWarnings}
        playSound={playSound}
        availableSounds={availableSounds}
        onUpload={fetchSounds}
      />
    </div>
  );
}

export default App;
