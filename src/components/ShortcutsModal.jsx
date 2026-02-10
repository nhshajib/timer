import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
    { key: 'Space', description: 'Play / Pause timer' },
    { key: 'R', description: 'Reset timer' },
    { key: 'L', description: 'Record lap (while running)' },
    { key: 'S', description: 'Open settings' },
    { key: 'Esc', description: 'Close settings / modals' },
    { key: '1-5', description: 'Quick set timer (5/10/15/25/30 min)' },
    { key: '?', description: 'Show this help' }
];

const ShortcutsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="modal-overlay"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '380px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-2xl)',
                        boxShadow: 'var(--shadow-lg), var(--shadow-glow-blue)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 20px',
                        borderBottom: '1px solid var(--glass-border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Keyboard size={16} style={{ color: 'var(--accent-primary)' }} />
                            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                                Keyboard Shortcuts
                            </h2>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <X size={16} />
                        </button>
                    </div>

                    <div style={{ padding: '12px 20px 20px' }}>
                        {shortcuts.map((shortcut, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 0',
                                borderBottom: idx < shortcuts.length - 1 ? '1px solid var(--glass-border)' : 'none',
                            }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                    {shortcut.description}
                                </span>
                                <kbd style={{
                                    background: 'rgba(99, 102, 241, 0.08)',
                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                    color: 'var(--accent-primary)',
                                    padding: '3px 8px',
                                    borderRadius: '5px',
                                    fontSize: '0.72rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: 600,
                                }}>
                                    {shortcut.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShortcutsModal;
