import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, X, Upload, Trash2, Clock, Bell, Music, Settings as SettingsIcon, Palette, RotateCcw, BarChart2 } from 'lucide-react';
import StatsDashboard from './StatsDashboard';

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

    // Admin Upload State
    const [adminPass, setAdminPass] = useState("");
    const [file, setFile] = useState(null);
    const [customFilename, setCustomFilename] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");

    // Voice Selection State
    const [availableVoices, setAvailableVoices] = useState([]);
    const [tempVoiceSelection, setTempVoiceSelection] = useState(voiceSelection);

    // Load available voices
    React.useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // Sync temp selection with prop
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
                setUploadStatus("✓ Success!");
                onUpload(data.filename);
                setFile(null);
                setCustomFilename("");
                setTimeout(() => setUploadStatus(""), 2000);
            } else {
                setUploadStatus(data.error || "Upload failed");
            }
        } catch (e) {
            setUploadStatus("Error: Server offline? Make sure 'npm run start:server' is running.");
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
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon }
    ];

    const setQuickPreset = (minutes) => {
        setTargetTime(minutes * 60);
    };

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
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="modal-card"
                    onClick={e => e.stopPropagation()}
                    style={{ maxWidth: '600px', width: '90%' }}
                >
                    {/* Header */}
                    <div className="modal-header">
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Settings</h2>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tab Bar */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        padding: '0 10px',
                        gap: '4px',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
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
                                        color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                                        padding: '12px 14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem',
                                        whiteSpace: 'nowrap',
                                        fontWeight: isActive ? 600 : 400,
                                        borderBottom: isActive ? '2px solid #60a5fa' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                        marginBottom: '-1px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                                    }}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="modal-content" style={{ minHeight: '300px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Timer Tab */}
                                {activeTab === 'timer' && (
                                    <div>
                                        {/* Quick Presets */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label className="text-label" style={{ display: 'block', marginBottom: '12px' }}>Quick Presets</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {[5, 10, 15, 25, 30].map(min => (
                                                    <button
                                                        key={min}
                                                        onClick={() => setQuickPreset(min)}
                                                        className="btn-circle small"
                                                        style={{
                                                            background: targetTime === min * 60 ? 'var(--accent-primary)' : 'rgba(96, 165, 250, 0.1)',
                                                            color: targetTime === min * 60 ? 'white' : '#60a5fa',
                                                            borderRadius: '12px',
                                                            padding: '8px 16px',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {min} min
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Custom Duration */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <label className="text-label" style={{ color: '#60a5fa' }}>Target Duration (Final Alarm)</label>
                                                <div
                                                    onClick={() => playSound(finalSound)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        opacity: 0.7,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '4px 8px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(96, 165, 250, 0.1)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                                    title="Test Final Alarm Sound"
                                                >
                                                    <Play size={16} />
                                                    <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Test</span>
                                                </div>
                                            </div>
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
                                    </div>
                                )}

                                {/* Alerts Tab */}
                                {activeTab === 'alerts' && (
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
                                                <button
                                                    className="btn-circle small"
                                                    onClick={() => playSound(allSounds[newSound])}
                                                    style={{
                                                        background: 'rgba(96, 165, 250, 0.15)',
                                                        color: '#60a5fa',
                                                        borderRadius: '12px',
                                                        width: 'auto',
                                                        padding: '0 12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    title="Test this sound"
                                                >
                                                    <Play size={16} />
                                                </button>
                                                <button className="btn-circle small" onClick={addWarning} style={{ background: 'var(--accent-primary)', color: 'white', borderRadius: '12px', width: 'auto', padding: '0 16px' }}>
                                                    <Plus size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Alert List */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                            {warnings.map(w => (
                                                <div key={w.id} className="setting-row">
                                                    <div style={{ fontWeight: 700, color: 'white', width: '70px', fontFamily: 'monospace' }}>
                                                        {Math.floor(w.triggerTime / 60)}:{String(w.triggerTime % 60).padStart(2, '0')}
                                                    </div>
                                                    <div style={{ flex: 1, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>{w.soundKey}</div>
                                                    <div
                                                        onClick={() => playSound(allSounds[w.soundKey] || WARNING_SOUNDS[w.soundKey])}
                                                        style={{
                                                            cursor: 'pointer',
                                                            opacity: 0.7,
                                                            marginRight: 8,
                                                            padding: '4px',
                                                            borderRadius: '6px',
                                                            background: 'rgba(96, 165, 250, 0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                                                        title="Test Sound"
                                                    >
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
                                )}

                                {/* Sounds Tab */}
                                {activeTab === 'sounds' && (
                                    <div>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '12px' }}>Sound Library</label>

                                        {/* Sound Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                            {Object.entries(allSounds).map(([name, src]) => (
                                                <div
                                                    key={name}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        padding: '12px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '8px',
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {name}
                                                    </div>
                                                    <button
                                                        onClick={() => playSound(src)}
                                                        className="btn-circle small"
                                                        style={{
                                                            background: 'rgba(96, 165, 250, 0.15)',
                                                            color: '#60a5fa',
                                                            borderRadius: '8px',
                                                            padding: '6px',
                                                            width: '100%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Play size={14} />
                                                        <span style={{ fontSize: '0.75rem' }}>Play</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Voice Announcements Section */}
                                        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <label className="text-label" style={{ display: 'block', marginBottom: '12px' }}>Voice Announcements</label>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                                                {/* Enable/Disable Toggle */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Enable Voice Feedback</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Spoken updates at key moments</div>
                                                    </div>
                                                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={voiceAnnouncements}
                                                            onChange={(e) => setVoiceAnnouncements(e.target.checked)}
                                                            style={{ opacity: 0, width: 0, height: 0 }}
                                                        />
                                                        <span style={{
                                                            position: 'absolute', cursor: 'pointer', top: 0, bottom: 0, left: 0, right: 0,
                                                            backgroundColor: voiceAnnouncements ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                                            transition: '0.3s', borderRadius: '24px'
                                                        }}>
                                                            <span style={{
                                                                position: 'absolute', height: '18px', width: '18px',
                                                                left: voiceAnnouncements ? '28px' : '3px', bottom: '3px',
                                                                backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                            }} />
                                                        </span>
                                                    </label>
                                                </div>

                                                {voiceAnnouncements && (
                                                    <>
                                                        {/* Quick Presets */}
                                                        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Quick Presets</div>
                                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                <button
                                                                    onClick={() => setVoiceAnnouncementMilestones([600, 300, 60])}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(96, 165, 250, 0.15)',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '6px',
                                                                        color: '#60a5fa', cursor: 'pointer', fontWeight: 500
                                                                    }}
                                                                >
                                                                    Standard (10m, 5m, 1m)
                                                                </button>
                                                                <button
                                                                    onClick={() => setVoiceAnnouncementMilestones([900, 600, 300, 60])}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(96, 165, 250, 0.15)',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '6px',
                                                                        color: '#60a5fa', cursor: 'pointer', fontWeight: 500
                                                                    }}
                                                                >
                                                                    Detailed (15m, 10m, 5m, 1m)
                                                                </button>
                                                                <button
                                                                    onClick={() => setVoiceAnnouncementMilestones([300, 60])}
                                                                    style={{
                                                                        padding: '6px 12px', fontSize: '0.75rem', background: 'rgba(96, 165, 250, 0.15)',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '6px',
                                                                        color: '#60a5fa', cursor: 'pointer', fontWeight: 500
                                                                    }}
                                                                >
                                                                    Minimal (5m, 1m)
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Announcement Milestones */}
                                                        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Announce When Remaining Time Reaches</div>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                                {voiceAnnouncementMilestones.sort((a, b) => b - a).map((seconds, idx) => {
                                                                    const mins = Math.floor(seconds / 60);
                                                                    const secs = seconds % 60;
                                                                    const label = mins > 0 ? (secs > 0 ? `${mins}m ${secs}s` : `${mins}m`) : `${secs}s`;
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            style={{
                                                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                                                padding: '6px 10px', background: 'rgba(96, 165, 250, 0.2)',
                                                                                border: '1px solid rgba(96, 165, 250, 0.4)', borderRadius: '8px',
                                                                                fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa'
                                                                            }}
                                                                        >
                                                                            {label}
                                                                            <X
                                                                                size={14}
                                                                                style={{ cursor: 'pointer', opacity: 0.7 }}
                                                                                onClick={() => {
                                                                                    setVoiceAnnouncementMilestones(voiceAnnouncementMilestones.filter((_, i) => i !== idx));
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            {/* Add Custom Milestone */}
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    min="5"
                                                                    max="3600"
                                                                    placeholder="Seconds"
                                                                    id="newMilestone"
                                                                    style={{
                                                                        flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                                                        borderRadius: '8px', color: 'white', padding: '6px 10px', fontSize: '0.85rem'
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const input = document.getElementById('newMilestone');
                                                                        const value = parseInt(input.value);
                                                                        if (value && value >= 5 && value <= 3600 && !voiceAnnouncementMilestones.includes(value)) {
                                                                            setVoiceAnnouncementMilestones([...voiceAnnouncementMilestones, value]);
                                                                            input.value = '';
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        padding: '6px 12px', background: 'rgba(96, 165, 250, 0.2)',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '8px',
                                                                        color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                                    }}
                                                                >
                                                                    <Plus size={14} />
                                                                    Add
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Final Warning */}
                                                        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Final Warning</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Special announcement when time is almost up</div>
                                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                                {[30, 15, 10, 5].map(sec => (
                                                                    <button
                                                                        key={sec}
                                                                        onClick={() => setVoiceFinalWarning(sec)}
                                                                        style={{
                                                                            flex: 1, padding: '8px', background: voiceFinalWarning === sec ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)',
                                                                            border: `1px solid ${voiceFinalWarning === sec ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                                                                            borderRadius: '8px', color: voiceFinalWarning === sec ? '#ef4444' : 'rgba(255,255,255,0.7)',
                                                                            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                                        }}
                                                                    >
                                                                        {sec}s
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Voice Selection */}
                                                        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Voice Character</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>Choose the voice that announces your milestones</div>
                                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                                <select
                                                                    value={tempVoiceSelection}
                                                                    onChange={(e) => setTempVoiceSelection(e.target.value)}
                                                                    style={{
                                                                        flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                                                                        borderRadius: '8px', color: 'white', padding: '8px 12px', fontSize: '0.85rem',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    <option value="">Default System Voice</option>
                                                                    {availableVoices.map((voice, idx) => {
                                                                        // Categorize voices
                                                                        let category = '';
                                                                        const name = voice.name.toLowerCase();
                                                                        if (name.includes('female') || name.includes('woman') || name.includes('zira') || name.includes('samantha')) {
                                                                            category = '👩 ';
                                                                        } else if (name.includes('male') || name.includes('man') || name.includes('david') || name.includes('daniel')) {
                                                                            category = '👨 ';
                                                                        }

                                                                        return (
                                                                            <option key={idx} value={voice.name}>
                                                                                {category}{voice.name} ({voice.lang})
                                                                            </option>
                                                                        );
                                                                    })}
                                                                </select>
                                                                <button
                                                                    onClick={() => {
                                                                        const voice = availableVoices.find(v => v.name === tempVoiceSelection);
                                                                        const utterance = new SpeechSynthesisUtterance("5 minutes remaining");
                                                                        if (voice) utterance.voice = voice;
                                                                        utterance.volume = volume / 100;
                                                                        utterance.rate = 0.9;
                                                                        utterance.pitch = 1.0;
                                                                        window.speechSynthesis.speak(utterance);
                                                                    }}
                                                                    style={{
                                                                        padding: '8px 12px', background: 'rgba(96, 165, 250, 0.2)',
                                                                        border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '8px',
                                                                        color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                                    }}
                                                                >
                                                                    <Play size={14} />
                                                                    Preview
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => setVoiceSelection(tempVoiceSelection)}
                                                                style={{
                                                                    width: '100%', padding: '8px', background: 'rgba(34, 197, 94, 0.2)',
                                                                    border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px',
                                                                    color: '#22c55e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                                                }}
                                                            >
                                                                ✓ Save Voice Selection
                                                            </button>
                                                        </div>

                                                        {/* Test Voice */}
                                                        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Test Current Settings</div>
                                                            <button
                                                                onClick={() => {
                                                                    const voice = availableVoices.find(v => v.name === voiceSelection);
                                                                    const text = "5 minutes remaining";
                                                                    const utterance = new SpeechSynthesisUtterance(text);
                                                                    if (voice) utterance.voice = voice;
                                                                    utterance.volume = volume / 100;
                                                                    utterance.rate = 0.9;
                                                                    utterance.pitch = 1.0;
                                                                    window.speechSynthesis.speak(utterance);
                                                                }}
                                                                style={{
                                                                    width: '100%', padding: '10px', background: 'rgba(96, 165, 250, 0.15)',
                                                                    border: '1px solid rgba(96, 165, 250, 0.3)', borderRadius: '8px',
                                                                    color: '#60a5fa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                                }}
                                                            >
                                                                <Play size={14} />
                                                                Test Voice Announcement
                                                            </button>
                                                        </div>

                                                        {/* How It Works */}
                                                        <div style={{ background: 'rgba(96, 165, 250, 0.05)', padding: '12px', borderRadius: '8px' }}>
                                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa', marginBottom: '6px' }}>How It Works</div>
                                                            <ul style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                                                                <li>Announces when remaining time reaches each milestone</li>
                                                                <li>Final warning plays at your chosen threshold</li>
                                                                <li>Uses natural language (e.g., "5 minutes" instead of "300 seconds")</li>
                                                                <li>Volume follows your master volume setting</li>
                                                            </ul>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'visuals' && (
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {/* Clock Scale */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Clock Size</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <input
                                                    type="range"
                                                    min="0.4"
                                                    max="2.5"
                                                    step="0.05"
                                                    value={clockScale}
                                                    onChange={(e) => setClockScale(parseFloat(e.target.value))}
                                                    style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, minWidth: '40px' }}>
                                                    {Math.round(clockScale * 100)}%
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                                                Adjusts both the clock text and the progress ring size.
                                            </div>
                                        </div>

                                        {/* Color Thresholds */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Stage Colors (Time-Based)</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>
                                                Change the timer color as you get closer to the target.
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {[...colorThresholds].sort((a, b) => b.time - a.time).map((t) => (
                                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '10px' }}>
                                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', minWidth: '70px' }}>Below</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <input
                                                                type="number"
                                                                value={t.time}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    const newThresholds = colorThresholds.map(thresh =>
                                                                        thresh.id === t.id ? { ...thresh, time: val } : thresh
                                                                    );
                                                                    setColorThresholds(newThresholds);
                                                                }}
                                                                style={{
                                                                    width: '60px',
                                                                    background: 'rgba(255,255,255,0.1)',
                                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                                    color: 'white',
                                                                    borderRadius: '6px',
                                                                    padding: '4px 8px',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 700,
                                                                    textAlign: 'center'
                                                                }}
                                                            />
                                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>sec</span>
                                                        </div>

                                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                                            <input
                                                                type="color"
                                                                value={t.color}
                                                                onChange={(e) => {
                                                                    const newThresholds = colorThresholds.map(thresh =>
                                                                        thresh.id === t.id ? { ...thresh, color: e.target.value } : thresh
                                                                    );
                                                                    setColorThresholds(newThresholds);
                                                                }}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    border: 'none',
                                                                    background: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: 0
                                                                }}
                                                            />

                                                            {t.type !== 'warning' && t.type !== 'final' ? (
                                                                <button
                                                                    onClick={() => setColorThresholds(prev => prev.filter(p => p.id !== t.id))}
                                                                    style={{ background: 'none', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer', opacity: 0.6 }}
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            ) : (
                                                                <div style={{ width: '24px' }} />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setColorThresholds(prev => [
                                                        ...prev,
                                                        { id: Date.now(), time: 10, color: '#ec4899', type: 'custom' }
                                                    ])}
                                                    style={{
                                                        width: '100%',
                                                        borderRadius: '10px',
                                                        background: 'rgba(96, 165, 250, 0.1)',
                                                        border: '1px dashed rgba(96, 165, 250, 0.3)',
                                                        color: '#60a5fa',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600,
                                                        padding: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Plus size={16} /> Add New Stage
                                                </button>
                                            </div>
                                        </div>

                                        {/* Reset Button */}
                                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                            <button
                                                onClick={onResetVisuals}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: '#f87171',
                                                    borderRadius: '12px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <RotateCcw size={16} />
                                                Reset Visuals to Default
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Stats Tab */}
                                {activeTab === 'stats' && (
                                    <StatsDashboard
                                        sessionHistory={sessionHistory}
                                        pomodoroCount={pomodoroCount}
                                    />
                                )}

                                {/* Preferences Tab */}
                                {activeTab === 'preferences' && (
                                    <div>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '12px' }}>App Preferences</label>

                                        {/* Volume Control */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Volume Control</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Music size={16} style={{ color: '#60a5fa' }} />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={volume || 100}
                                                    onChange={(e) => setVolume(parseInt(e.target.value))}
                                                    style={{
                                                        flex: 1,
                                                        accentColor: '#60a5fa',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#60a5fa', minWidth: '45px' }}>
                                                    {volume || 100}%
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => playSound("Single Beep")}
                                                className="btn-circle small"
                                                style={{
                                                    marginTop: '12px',
                                                    background: 'rgba(96, 165, 250, 0.15)',
                                                    color: '#60a5fa',
                                                    borderRadius: '12px',
                                                    width: '100%',
                                                    padding: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <Play size={14} />
                                                <span style={{ fontSize: '0.85rem' }}>Test Volume</span>
                                            </button>
                                        </div>

                                        {/* Export & Save */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Session Management</div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={exportLaps}
                                                    className="btn-circle small"
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(34, 197, 94, 0.15)',
                                                        color: '#4ade80',
                                                        borderRadius: '12px',
                                                        width: 'auto',
                                                        padding: '8px 12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Export Laps (CSV)
                                                </button>
                                                <button
                                                    onClick={saveSession}
                                                    className="btn-circle small"
                                                    style={{
                                                        flex: 1,
                                                        background: 'rgba(96, 165, 250, 0.15)',
                                                        color: '#60a5fa',
                                                        borderRadius: '12px',
                                                        width: 'auto',
                                                        padding: '8px 12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    Save Session
                                                </button>
                                            </div>
                                        </div>

                                        {/* Appearance & Accessibility */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Appearance & Accessibility</div>

                                            {/* Theme Toggle */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Light Mode</span>
                                                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={theme === 'light'}
                                                        onChange={(e) => setTheme(e.target.checked ? 'light' : 'dark')}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute',
                                                        cursor: 'pointer',
                                                        top: 0, bottom: 0, left: 0, right: 0,
                                                        backgroundColor: theme === 'light' ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                                        transition: '0.3s', borderRadius: '24px'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute', height: '18px', width: '18px',
                                                            left: theme === 'light' ? '28px' : '3px', bottom: '3px',
                                                            backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                        }} />
                                                    </span>
                                                </label>
                                            </div>

                                            {/* High Contrast */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>High Contrast</span>
                                                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={highContrast}
                                                        onChange={(e) => setHighContrast(e.target.checked)}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute', cursor: 'pointer', top: 0, bottom: 0, left: 0, right: 0,
                                                        backgroundColor: highContrast ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                                        transition: '0.3s', borderRadius: '24px'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute', height: '18px', width: '18px',
                                                            left: highContrast ? '28px' : '3px', bottom: '3px',
                                                            backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                        }} />
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Reduced Motion */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Reduced Motion</span>
                                                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={reducedMotion}
                                                        onChange={(e) => setReducedMotion(e.target.checked)}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute', cursor: 'pointer', top: 0, bottom: 0, left: 0, right: 0,
                                                        backgroundColor: reducedMotion ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                                        transition: '0.3s', borderRadius: '24px'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute', height: '18px', width: '18px',
                                                            left: reducedMotion ? '28px' : '3px', bottom: '3px',
                                                            backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                        }} />
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Vibration */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Vibration</span>
                                                <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={vibrationEnabled}
                                                        onChange={(e) => setVibrationEnabled(e.target.checked)}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute', cursor: 'pointer', top: 0, bottom: 0, left: 0, right: 0,
                                                        backgroundColor: vibrationEnabled ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                                        transition: '0.3s', borderRadius: '24px'
                                                    }}>
                                                        <span style={{
                                                            position: 'absolute', height: '18px', width: '18px',
                                                            left: vibrationEnabled ? '28px' : '3px', bottom: '3px',
                                                            backgroundColor: 'white', transition: '0.3s', borderRadius: '50%'
                                                        }} />
                                                    </span>
                                                </label>
                                            </div>


                                        </div>

                                        {/* Mobile Features */}
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white', marginBottom: '12px' }}>Mobile Features</div>
                                            <button
                                                onClick={toggleFullscreen}
                                                style={{
                                                    width: '100%', padding: '10px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)',
                                                    borderRadius: '12px', color: '#a78bfa', cursor: 'pointer', marginBottom: '8px', fontSize: '0.85rem'
                                                }}
                                            >
                                                {isFullscreen ? '✕ Exit Fullscreen' : '⛶ Enter Fullscreen'}
                                            </button>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                                                Screen wake lock is managed automatically
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            className="btn-circle"
                            onClick={onClose}
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', padding: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer'
                            }}
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
