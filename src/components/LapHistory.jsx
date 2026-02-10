import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Flag } from 'lucide-react';

const LapHistory = ({ laps, setLaps, formatLapTime }) => {
    if (laps.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
                position: 'fixed',
                left: '24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '220px',
                maxHeight: '55vh',
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div className="glass-panel" style={{
                padding: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid var(--glass-border)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}>
                        <Flag size={12} style={{ color: 'var(--accent-cyan)' }} />
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--text-muted)',
                        }}>
                            Laps ({laps.length})
                        </span>
                    </div>
                    <button
                        onClick={() => setLaps([])}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-red)',
                            opacity: 0.5,
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                        title="Clear Laps"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    overflowY: 'auto',
                    maxHeight: 'calc(55vh - 60px)',
                    paddingRight: '4px',
                }}>
                    <AnimatePresence>
                        {laps.map((lap, idx) => (
                            <motion.div
                                key={lap.id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ delay: idx * 0.03 }}
                                style={{
                                    padding: '8px 10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderRadius: 'var(--radius-sm)',
                                    background: idx === 0 ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <span style={{
                                    fontWeight: 700,
                                    color: 'var(--accent-cyan)',
                                    fontSize: '0.7rem',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    minWidth: '28px',
                                }}>
                                    #{laps.length - idx}
                                </span>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '1px',
                                }}>
                                    <span style={{
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        color: 'var(--text-primary)',
                                    }}>
                                        {formatLapTime(lap.time)}
                                    </span>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted)',
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}>
                                        +{formatLapTime(lap.split)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default LapHistory;
