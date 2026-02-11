import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Upload, Trash2, Clock, Bell, Music, Settings as SettingsIcon, Palette, RotateCcw, BarChart2, Sun, Moon, Volume2, Maximize, Minimize, Smartphone } from 'lucide-react';
import StatsDashboard from './StatsDashboard';

const Toggle = ({ checked, onChange, color = 'var(--accent-primary)' }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '22px', flexShrink: 0 }}>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
            position: 'absolute', cursor: 'pointer', top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: checked ? color : 'rgba(255,255,255,0.12)',
            transition: '0.3s', borderRadius: '22px',
        }}>
            <span style={{
                position: 'absolute', height: '16px', width: '16px',
                left: checked ? '24px' : '3px', bottom: '3px',
                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
        </span>
    </label>
);

const SectionCard = ({ children, style }) => (
    <div style={{
        padding: '14px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        ...style,
    }}>
        {children}
    </div>
);

const SettingsOverlay = ({
    isOpen,
    onClose,
    targetTime,
    setTargetTime,
    warnings,
    setWarnings,
    playSound,
    availableSounds,
    onUpload,
    finalSound,
    WARNING_SOUNDS,
    volume,
    setVolume,
    exportLaps,
    saveSession,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    vibrationEnabled,
    setVibrationEnabled,
    toggleFullscreen,
    isFullscreen,
    clockScale,
    setClockScale,
    colorThresholds,
    setColorThresholds,
    onResetVisuals,
    theme,
    setTheme,
    sessionHistory,
    pomodoroCount,
    voiceAnnouncements,
    setVoiceAnnouncements,
    voiceAnnouncementMilestones,
    setVoiceAnnouncementMilestones,
    voiceFinalWarning,
    setVoiceFinalWarning,
    voiceSelection,
    setVoiceSelection
}) => {
    const [activeTab, setActiveTab] = useState('timer');
    const [newMin, setNewMin] = useState(1);
    const [newSec, setNewSec] = useState(0);
    const [newSound, setNewSound] = useState("Single Beep");

    const [adminPass, setAdminPass] = useState("");
    const [file, setFile] = useState(null);
    const [customFilename, setCustomFilename] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    const [availableVoices, setAvailableVoices] = useState([]);
    const [tempVoiceSelection, setTempVoiceSelection] = useState(voiceSelection);

    React.useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    React.useEffect(() => {
        setTempVoiceSelection(voiceSelection);
    }, [voiceSelection]);

    if (!isOpen) return null;

    const handleUpload = async () => {
        if (!file) return setUploadStatus("No file selected.");
        if (!customFilename.trim()) return setUploadStatus("Please enter a filename.");

        setUploadStatus("Uploading...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('customFilename', customFilename.trim());

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'x-admin-password': adminPass },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setUploadStatus("Success!");
                onUpload(data.filename);
                setFile(null);
                setCustomFilename("");
                setTimeout(() => setUploadStatus(""), 2000);
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
        setWarnings(prev => [...prev, newW].sort((a, b) => a.triggerTime - b.triggerTime));
        setNewMin(1);
        setNewSec(0);
    };

    const allSounds = { ...WARNING_SOUNDS, ...availableSounds };
    const targetMin = Math.floor(targetTime / 60);
    const targetSec = targetTime % 60;

    const tabs = [
        { id: 'timer', label: 'Timer', icon: Clock },
        { id: 'alerts', label: 'Alerts', icon: Bell },
        { id: 'sounds', label: 'Sounds', icon: Music },
        { id: 'visuals', label: 'Visuals', icon: Palette },
        { id: 'stats', label: 'Stats', icon: BarChart2 },
        { id: 'preferences', label: 'Prefs', icon: SettingsIcon }
    ];

    const setQuickPreset = (minutes) => {
        setTargetTime(minutes * 60);
    };

    const accentColor = 'var(--accent-primary)';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="modal-card"
                    onClick={e => e.stopPropagation()}
                    style={{ maxWidth: '560px', width: '92%' }}
                >
                    <div className="modal-header">
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Settings</h2>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--glass-border)',
                        padding: '0 12px',
                        gap: '2px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}>
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        padding: '10px 12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '0.78rem',
                                        whiteSpace: 'nowrap',
                                        fontWeight: isActive ? 600 : 500,
                                        borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                        marginBottom: '-1px',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <Icon size={14} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="modal-content" style={{ minHeight: '280px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeTab === 'timer' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div>
                                            <label className="text-label" style={{ display: 'block', marginBottom: '10px' }}>Quick Presets</label>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {[5, 10, 15, 25, 30, 45, 60].map(min => (
                                                    <button
                                                        key={min}
                                                        onClick={() => setQuickPreset(min)}
                                                        style={{
                                                            background: targetTime === min * 60 ? 'var(--accent-primary)' : 'rgba(99, 102, 241, 0.08)',
                                                            color: targetTime === min * 60 ? 'white' : 'var(--accent-primary)',
                                                            border: `1px solid ${targetTime === min * 60 ? 'transparent' : 'rgba(99, 102, 241, 0.15)'}`,
                                                            borderRadius: 'var(--radius-sm)',
                                                            padding: '7px 14px',
                                                            fontSize: '0.82rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        {min}m
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <SectionCard>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <label className="text-label" style={{ color: 'var(--accent-primary)' }}>Target Duration</label>
                                                <div
                                                    onClick={() => playSound(finalSound)}
                                                    title="Test final alarm sound"
                                                    style={{
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        background: 'rgba(99, 102, 241, 0.08)',
                                                        transition: 'all 0.2s',
                                                        color: 'var(--accent-primary)',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    <Play size={12} />
                                                    Test
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input type="number" className="input-modern" value={targetMin}
                                                    onChange={e => setTargetTime((Math.max(0, parseInt(e.target.value) || 0) * 60) + targetSec)}
                                                    style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace" }}
                                                />
                                                <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-dim)' }}>:</span>
                                                <input type="number" className="input-modern" value={targetSec}
                                                    onChange={e => setTargetTime((targetMin * 60) + Math.max(0, parseInt(e.target.value) || 0))}
                                                    style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace" }}
                                                />
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                                Timer will alert but continue counting
                                            </div>
                                        </SectionCard>
                                    </div>
                                )}

                                {activeTab === 'alerts' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <label className="text-label">Intermediate Alerts</label>

                                        <SectionCard>
                                            <div style={{ fontSize: '0.78rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Play sound after:</div>
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                                <input type="number" className="input-modern" placeholder="Min" value={newMin} onChange={e => setNewMin(e.target.value)} style={{ flex: 1 }} />
                                                <input type="number" className="input-modern" placeholder="Sec" value={newSec} onChange={e => setNewSec(e.target.value)} style={{ flex: 1 }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <select className="input-modern" value={newSound} onChange={e => setNewSound(e.target.value)} style={{ flex: 2 }}>
                                                    {Object.keys(allSounds).map(k => <option key={k} value={k}>{k}</option>)}
                                                </select>
                                                <button
                                                    className="btn-icon"
                                                    onClick={() => playSound(allSounds[newSound] ?? newSound)}
                                                    style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}
                                                    title="Test sound"
                                                >
                                                    <Play size={14} />
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    onClick={addWarning}
                                                    style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', color: 'white' }}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </SectionCard>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {warnings.map(w => (
                                                <div key={w.id} className="setting-row">
                                                    <div style={{
                                                        fontWeight: 700, color: 'var(--text-primary)', width: '60px',
                                                        fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem'
                                                    }}>
                                                        {Math.floor(w.triggerTime / 60)}:{String(w.triggerTime % 60).padStart(2, '0')}
                                                    </div>
                                                    <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{w.soundKey}</div>
                                                    <button
                                                        onClick={() => playSound(allSounds[w.soundKey] ?? WARNING_SOUNDS[w.soundKey] ?? w.soundKey)}
                                                        style={{
                                                            cursor: 'pointer', background: 'transparent', border: 'none',
                                                            color: 'var(--accent-primary)', padding: '4px', display: 'flex',
                                                        }}
                                                        title="Test sound"
                                                    >
                                                        <Play size={13} />
                                                    </button>
                                                    <button className="btn-ghost-danger" onClick={() => setWarnings(warnings.filter(x => x.id !== w.id))}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {warnings.length === 0 && (
                                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '20px 10px' }}>
                                                    No intermediate alerts set
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'sounds' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <label className="text-label">Sound Library</label>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                                            {Object.entries(allSounds).map(([name, src]) => (
                                                <SectionCard key={name} style={{ padding: '10px' }}>
                                                    <div style={{
                                                        fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)',
                                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        marginBottom: '6px',
                                                    }}>
                                                        {name}
                                                    </div>
                                                    <button
                                                        onClick={() => playSound(src)}
                                                        style={{
                                                            background: 'rgba(99, 102, 241, 0.08)',
                                                            color: 'var(--accent-primary)',
                                                            border: '1px solid rgba(99, 102, 241, 0.12)',
                                                            borderRadius: '6px',
                                                            padding: '5px',
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 600,
                                                            fontFamily: 'inherit',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <Play size={11} />
                                                        Play
                                                    </button>
                                                </SectionCard>
                                            ))}
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                                            <label className="text-label" style={{ display: 'block', marginBottom: '10px' }}>Voice Announcements</label>
                                            <SectionCard>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: voiceAnnouncements ? '14px' : 0 }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Voice Feedback</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Spoken updates at key moments</div>
                                                    </div>
                                                    <Toggle checked={voiceAnnouncements} onChange={(val) => {
                                                        setVoiceAnnouncements(val);
                                                        if (val && 'speechSynthesis' in window) {
                                                            window.speechSynthesis.cancel();
                                                            const utterance = new SpeechSynthesisUtterance("Voice feedback enabled");
                                                            utterance.volume = volume / 100;
                                                            utterance.rate = 0.9;
                                                            const voices = window.speechSynthesis.getVoices();
                                                            if (voices.length > 0) {
                                                                const selected = voices.find(v => v.name === voiceSelection);
                                                                if (selected) utterance.voice = selected;
                                                            }
                                                            window.speechSynthesis.speak(utterance);
                                                        }
                                                    }} />
                                                </div>

                                                {voiceAnnouncements && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Presets</div>
                                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                {[
                                                                    { label: 'Standard', milestones: [600, 300, 60] },
                                                                    { label: 'Detailed', milestones: [900, 600, 300, 60] },
                                                                    { label: 'Minimal', milestones: [300, 60] },
                                                                ].map(preset => (
                                                                    <button key={preset.label} onClick={() => setVoiceAnnouncementMilestones(preset.milestones)}
                                                                        style={{
                                                                            padding: '5px 10px', fontSize: '0.72rem', fontFamily: 'inherit',
                                                                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                                                                            borderRadius: '6px', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 500,
                                                                        }}
                                                                    >
                                                                        {preset.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Active Milestones</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {voiceAnnouncementMilestones.sort((a, b) => b - a).map((seconds, idx) => {
                                                                    const mins = Math.floor(seconds / 60);
                                                                    const secs = seconds % 60;
                                                                    const label = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins}m`) : `${secs}s`;
                                                                    return (
                                                                        <div key={idx} style={{
                                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                                            padding: '4px 8px', background: 'rgba(99,102,241,0.1)',
                                                                            border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px',
                                                                            fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)',
                                                                        }}>
                                                                            {label}
                                                                            <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }}
                                                                                onClick={() => setVoiceAnnouncementMilestones(voiceAnnouncementMilestones.filter((_, i) => i !== idx))}
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <input type="number" min="5" max="3600" placeholder="Seconds" id="newMilestone" className="input-modern" style={{ flex: 1, fontSize: '0.82rem' }} />
                                                            <button onClick={() => {
                                                                const input = document.getElementById('newMilestone');
                                                                const value = parseInt(input.value);
                                                                if (value && value >= 5 && value <= 3600 && !voiceAnnouncementMilestones.includes(value)) {
                                                                    setVoiceAnnouncementMilestones([...voiceAnnouncementMilestones, value]);
                                                                    input.value = '';
                                                                }
                                                            }} style={{
                                                                padding: '8px 12px', background: 'rgba(99,102,241,0.1)',
                                                                border: '1px solid rgba(99,102,241,0.15)', borderRadius: '8px',
                                                                color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.75rem',
                                                                fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit',
                                                            }}>
                                                                <Plus size={12} /> Add
                                                            </button>
                                                        </div>

                                                        <div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Final Warning At</div>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                {[30, 15, 10, 5].map(sec => (
                                                                    <button key={sec} onClick={() => setVoiceFinalWarning(sec)}
                                                                        style={{
                                                                            flex: 1, padding: '6px', fontFamily: 'inherit',
                                                                            background: voiceFinalWarning === sec ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.03)',
                                                                            border: `1px solid ${voiceFinalWarning === sec ? 'rgba(248,113,113,0.3)' : 'var(--glass-border)'}`,
                                                                            borderRadius: '6px', color: voiceFinalWarning === sec ? 'var(--accent-red)' : 'var(--text-secondary)',
                                                                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                                                                        }}
                                                                    >
                                                                        {sec}s
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Voice</div>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <select
                                                                    value={tempVoiceSelection}
                                                                    onChange={(e) => setTempVoiceSelection(e.target.value)}
                                                                    className="input-modern"
                                                                    style={{ flex: 1, fontSize: '0.82rem' }}
                                                                >
                                                                    <option value="">Default System Voice</option>
                                                                    {availableVoices.map((voice, idx) => (
                                                                        <option key={idx} value={voice.name}>
                                                                            {voice.name} ({voice.lang})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <button onClick={() => {
                                                                    window.speechSynthesis.cancel();
                                                                    const voice = availableVoices.find(v => v.name === tempVoiceSelection);
                                                                    const utterance = new SpeechSynthesisUtterance("Testing voice feedback. 5 minutes remaining.");
                                                                    if (voice) utterance.voice = voice;
                                                                    utterance.volume = volume / 100;
                                                                    utterance.rate = 0.9;
                                                                    window.speechSynthesis.speak(utterance);
                                                                }} className="btn-icon" style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}>
                                                                    <Play size={14} />
                                                                </button>
                                                            </div>
                                                            <button onClick={() => {
                                                                    setVoiceSelection(tempVoiceSelection);
                                                                }}
                                                                style={{
                                                                    width: '100%', padding: '7px', marginTop: '8px',
                                                                    background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)',
                                                                    borderRadius: '6px', color: 'var(--accent-green)', cursor: 'pointer',
                                                                    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                                                                }}
                                                            >
                                                                Save Voice
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </SectionCard>
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                                            <label className="text-label" style={{ display: 'block', marginBottom: '10px' }}>Upload Custom Sound</label>
                                            <SectionCard>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <input type="password" className="input-modern" placeholder="Admin Password"
                                                        value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ fontSize: '0.82rem' }} />
                                                    <input type="text" className="input-modern" placeholder="Sound Name"
                                                        value={customFilename} onChange={e => setCustomFilename(e.target.value)} style={{ fontSize: '0.82rem' }} />
                                                    <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])}
                                                        style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }} />
                                                    <button onClick={handleUpload}
                                                        style={{
                                                            padding: '8px', background: 'var(--accent-primary)', border: 'none',
                                                            borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.82rem',
                                                            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            gap: '6px', fontFamily: 'inherit',
                                                        }}
                                                    >
                                                        <Upload size={14} /> Upload
                                                    </button>
                                                    {uploadStatus && <div style={{ fontSize: '0.78rem', color: 'var(--accent-green)', textAlign: 'center' }}>{uploadStatus}</div>}
                                                </div>
                                            </SectionCard>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'visuals' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="text-label">Theme</label>
                                            <button
                                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                                                    borderRadius: 'var(--radius-full)', cursor: 'pointer', color: 'var(--accent-primary)',
                                                    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                                                }}
                                            >
                                                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                                                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                            </button>
                                        </div>

                                        <SectionCard>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Clock Scale</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <input
                                                    type="range" min="0.5" max="2.0" step="0.1" value={clockScale}
                                                    onChange={e => setClockScale(parseFloat(e.target.value))}
                                                    style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                                                />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", minWidth: '40px', textAlign: 'right' }}>
                                                    {clockScale.toFixed(1)}x
                                                </span>
                                            </div>
                                        </SectionCard>

                                        <SectionCard>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Color Thresholds</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {colorThresholds.map((threshold, idx) => (
                                                    <div key={threshold.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <input
                                                            type="color" value={threshold.color}
                                                            onChange={e => {
                                                                const updated = [...colorThresholds];
                                                                updated[idx] = { ...threshold, color: e.target.value };
                                                                setColorThresholds(updated);
                                                            }}
                                                            style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                                {threshold.type === 'final' ? 'Final (0s)' : `Warning (${threshold.time}s remaining)`}
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="number" value={threshold.time}
                                                            onChange={e => {
                                                                const updated = [...colorThresholds];
                                                                updated[idx] = { ...threshold, time: parseInt(e.target.value) || 0 };
                                                                setColorThresholds(updated);
                                                            }}
                                                            className="input-modern"
                                                            style={{ width: '70px', fontSize: '0.82rem', textAlign: 'center' }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>

                                        <button onClick={onResetVisuals} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            padding: '8px', background: 'transparent', border: '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-secondary)',
                                            fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
                                        }}>
                                            <RotateCcw size={13} /> Reset Visuals
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'stats' && (
                                    <StatsDashboard sessionHistory={sessionHistory} pomodoroCount={pomodoroCount} />
                                )}

                                {activeTab === 'preferences' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <SectionCard>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Volume2 size={15} style={{ color: 'var(--accent-primary)' }} />
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Volume</span>
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
                                                    {volume}%
                                                </span>
                                            </div>
                                            <input
                                                type="range" min="0" max="100" value={volume}
                                                onChange={e => setVolume(parseInt(e.target.value))}
                                                style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                                            />
                                        </SectionCard>

                                        <SectionCard>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>High Contrast</span>
                                                    <Toggle checked={highContrast} onChange={setHighContrast} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Reduced Motion</span>
                                                    <Toggle checked={reducedMotion} onChange={setReducedMotion} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Vibration</span>
                                                    <Toggle checked={vibrationEnabled} onChange={setVibrationEnabled} />
                                                </div>
                                            </div>
                                        </SectionCard>

                                        <SectionCard>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '10px' }}>Actions</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <button onClick={toggleFullscreen} style={{
                                                    width: '100%', padding: '8px', fontFamily: 'inherit',
                                                    background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)',
                                                    borderRadius: '8px', color: 'var(--accent-purple)', cursor: 'pointer',
                                                    fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', gap: '6px',
                                                }}>
                                                    {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                                                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                                </button>
                                                <button onClick={exportLaps} style={{
                                                    width: '100%', padding: '8px', fontFamily: 'inherit',
                                                    background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)',
                                                    borderRadius: '8px', color: 'var(--accent-cyan)', cursor: 'pointer',
                                                    fontSize: '0.78rem', fontWeight: 600,
                                                }}>
                                                    Export Laps (CSV)
                                                </button>
                                                <button onClick={saveSession} style={{
                                                    width: '100%', padding: '8px', fontFamily: 'inherit',
                                                    background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                                                    borderRadius: '8px', color: 'var(--accent-green)', cursor: 'pointer',
                                                    fontSize: '0.78rem', fontWeight: 600,
                                                }}>
                                                    Save Session
                                                </button>
                                            </div>
                                        </SectionCard>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--glass-border)' }}>
                        <button
                            onClick={onClose}
                            className="btn-block"
                            style={{ fontSize: '0.9rem' }}
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SettingsOverlay;
