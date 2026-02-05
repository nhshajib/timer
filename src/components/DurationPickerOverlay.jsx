import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import '../index.css';

const DurationPickerOverlay = ({ isOpen, onClose, onSetDuration, currentDurationMinutes }) => {
    const [value, setValue] = useState(currentDurationMinutes || 5);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSetDuration(value);
        onClose();
    };

    const PRESETS = [5, 10, 15, 20, 30, 60];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-backdrop" onClick={onClose} style={{ alignItems: 'center' }}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '400px' }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Set Duration</h2>
                            <button className="modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="duration-grid">
                            {PRESETS.map(preset => (
                                <div
                                    key={preset}
                                    className={`duration-option ${value === preset ? 'active' : ''}`}
                                    onClick={() => setValue(preset)}
                                >
                                    {preset}m
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                CUSTOM MINUTES
                            </label>
                            <div className="input-time-wrapper">
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="custom-duration-input"
                                    autoFocus
                                    min="1"
                                />
                            </div>

                            <button type="submit" className="add-warning-btn" style={{ background: 'var(--text-primary)', color: 'var(--bg-app)', border: 'none' }}>
                                <Check size={20} />
                                <span>START TIMER</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DurationPickerOverlay;
