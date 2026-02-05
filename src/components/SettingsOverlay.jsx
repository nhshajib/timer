import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertTriangle, Play, Music } from 'lucide-react';
import '../index.css';

const SettingsOverlay = ({ isOpen, onClose, warnings, onAddWarning, onRemoveWarning }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedSound, setSelectedSound] = useState('soft');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue) return;
        const minutes = parseInt(inputValue);
        if (!isNaN(minutes) && minutes > 0) {
            onAddWarning(minutes, selectedSound);
            setInputValue('');
        }
    };

    const previewSound = () => {
        // Quick mapping matching the assets we created
        let filename = 'first warning.mp3';
        if (selectedSound === 'urgent') filename = 'second warning.mp3';

        new Audio(`/src/assets/${filename}`).play().catch(e => console.log(e));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="overlay-backdrop"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="holographic-overlay"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="overlay-header">
                            <span className="overlay-title">SYSTEM CONFIGURATION</span>
                            <button className="close-button" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overlay-content">
                            <div className="warning-input-section">
                                <label className="section-label">ADD WARNING INTERRUPT</label>
                                <form onSubmit={handleSubmit} className="input-group">
                                    <input
                                        type="number"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="MIN"
                                        className="holo-input"
                                        min="1"
                                        style={{ flex: 0.5 }}
                                    />

                                    <div className="sound-select-container" style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                        <select
                                            value={selectedSound}
                                            onChange={(e) => setSelectedSound(e.target.value)}
                                            className="holo-input holo-select"
                                        >
                                            <option value="soft">Warning Soft</option>
                                            <option value="urgent">Warning Urgent</option>
                                        </select>

                                        <button type="button" className="preview-button" onClick={previewSound}>
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                    </div>

                                    <button type="submit" className="add-button">
                                        <Plus size={20} />
                                    </button>
                                </form>
                            </div>

                            <div className="warnings-list-section">
                                <label className="section-label">ACTIVE INTERRUPTS</label>
                                <div className="warnings-list">
                                    {warnings.length === 0 ? (
                                        <div className="empty-state">NO ACTIVE INTERRUPTS</div>
                                    ) : (
                                        warnings.map((warning) => (
                                            <div key={warning.id} className="warning-item">
                                                <div className="warning-info">
                                                    <AlertTriangle size={14} className="text-cyan" />
                                                    <span>{warning.minutes}:00</span>
                                                    <span className="warning-sound-badge">
                                                        <Music size={10} className="mr-1" />
                                                        {warning.soundFile === 'urgent' ? 'URGENT' : 'SOFT'}
                                                    </span>
                                                </div>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => onRemoveWarning(warning.id)}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsOverlay;
