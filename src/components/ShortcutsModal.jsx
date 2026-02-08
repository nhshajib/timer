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
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '20px',
                        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), transparent)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Keyboard size={20} style={{ color: '#60a5fa' }} />
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                Keyboard Shortcuts
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Shortcuts List */}
                    <div style={{ padding: '16px 24px 24px' }}>
                        {shortcuts.map((shortcut, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: idx < shortcuts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                            >
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                    {shortcut.description}
                                </span>
                                <kbd style={{
                                    background: 'rgba(96, 165, 250, 0.15)',
                                    border: '1px solid rgba(96, 165, 250, 0.3)',
                                    color: '#60a5fa',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    fontFamily: 'monospace',
                                    fontWeight: 600
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
