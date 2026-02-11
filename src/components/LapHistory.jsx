import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Flag, ChevronDown, ChevronUp } from 'lucide-react';

const LapHistory = ({ laps, setLaps, formatLapTime, variant = 'sidebar' }) => {
    if (laps.length === 0) return null;

    const [collapsed, setCollapsed] = useState(false);
    const isBelow = variant === 'below';

    const header = (
        <div className="lap-history-header">
            <button
                type="button"
                onClick={isBelow ? () => setCollapsed(c => !c) : undefined}
                className={`lap-history-title-btn ${isBelow ? 'lap-history-title-btn-clickable' : ''}`}
                aria-expanded={isBelow ? !collapsed : undefined}
            >
                <Flag size={12} style={{ color: 'var(--accent-cyan)' }} />
                <span>Laps ({laps.length})</span>
                {isBelow && (collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
            </button>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLaps([]); }}
                className="lap-history-clear-btn"
                title="Clear Laps"
                aria-label="Clear all laps"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );

    const content = (
        <div className="lap-history-list">
            <AnimatePresence>
                {laps.map((lap, idx) => (
                    <motion.div
                        key={lap.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`lap-history-item ${idx === 0 ? 'lap-history-item-latest' : ''}`}
                    >
                        <span className="lap-history-num">#{laps.length - idx}</span>
                        <div className="lap-history-times">
                            <span className="lap-history-time">{formatLapTime(lap.time)}</span>
                            <span className="lap-history-split">+{formatLapTime(lap.split)}</span>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    if (isBelow) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`lap-history lap-history-below ${collapsed ? 'lap-history-collapsed' : ''}`}
            >
                <div className="lap-history-panel">
                    {header}
                    {!collapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                        >
                            {content}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lap-history lap-history-sidebar"
        >
            <div className="glass-panel lap-history-panel">
                {header}
                {content}
            </div>
        </motion.div>
    );
};

export default LapHistory;
