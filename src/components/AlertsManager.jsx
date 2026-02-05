import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trash2, Plus, Check } from 'lucide-react';
import '../index.css';

const AlertsManager = ({ isOpen, onClose, warnings, onAddWarning, onUpdateWarning, onRemoveWarning, SOUND_MAP }) => {

    const previewSound = (key) => {
        // Create new audio instance for immediate testing
        const path = SOUND_MAP[key];
        if (!path) return;

        const audio = new Audio(path);
        audio.volume = 1.0;
        audio.play().catch(e => console.error("Preview failed:", e));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#1c1c1f', maxWidth: '600px' }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ fontSize: '1.5rem' }}>Configuration</h2>
                            <button className="modal-close" onClick={onClose}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="warning-list" style={{ gap: '20px' }}>
                            {warnings.length === 0 && (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                                    No alerts configured. Add one below.
                                </div>
                            )}

                            {warnings.sort((a, b) => b.time - a.time).map(warning => (
                                <div key={warning.id} className="warning-row-redesigned">

                                    <div className="warning-input-group">
                                        <label className="input-label">WARN AT (MINS)</label>
                                        <input
                                            type="number"
                                            value={warning.minutes}
                                            className="input-time-large"
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) {
                                                    onUpdateWarning(warning.id, { minutes: val });
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="warning-input-group" style={{ flex: 1 }}>
                                        <label className="input-label">SOUND PROFILE</label>
                                        <select
                                            className="select-sound-large"
                                            value={warning.soundFile || 'soft'}
                                            onChange={(e) => onUpdateWarning(warning.id, { soundFile: e.target.value })}
                                        >
                                            <option value="soft">Soft Warning</option>
                                            <option value="urgent">Urgent Warning</option>
                                        </select>
                                    </div>

                                    <div className="warning-actions">
                                        <button
                                            className="btn-action-large play"
                                            onClick={() => previewSound(warning.soundFile || 'soft')}
                                            title="Play Sound"
                                        >
                                            <Play size={20} fill="currentColor" />
                                            <span>TEST</span>
                                        </button>

                                        <button
                                            className="btn-action-large delete"
                                            onClick={() => onRemoveWarning(warning.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="add-warning-btn"
                                onClick={() => onAddWarning(5, 'soft')}
                                style={{ marginTop: 0 }}
                            >
                                <Plus size={20} />
                                <span>Add New Alert</span>
                            </button>

                            <button
                                className="save-btn"
                                onClick={onClose}
                            >
                                <Check size={20} />
                                <span>Save & Close</span>
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AlertsManager;
