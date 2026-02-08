import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const LapHistory = ({ laps, setLaps, formatLapTime }) => {
    if (laps.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            left: '40px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '240px',
            maxHeight: '60vh',
            overflowY: 'auto',
            paddingRight: '12px',
            zIndex: 5
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lap History</h3>
                <button
                    onClick={() => setLaps([])}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}
                    title="Clear Laps"
                >
                    <Trash2 size={14} />
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <AnimatePresence>
                    {laps.map((lap, idx) => (
                        <motion.div
                            key={lap.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-panel"
                            style={{
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>#{laps.length - idx}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{formatLapTime(lap.time)}</span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 600 }}>+{formatLapTime(lap.split)}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LapHistory;
