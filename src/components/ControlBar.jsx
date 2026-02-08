import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Plus, Settings } from 'lucide-react';

const ControlBar = ({
    isRunning,
    lastResetState,
    toggleTimer,
    resetTimer,
    undoReset,
    handleLap,
    setIsSettingsOpen
}) => {
    return (
        <div style={{ position: 'fixed', bottom: '40px', zIndex: 10 }}>
            <div className="control-bar">
                {/* LEFT BUTTON: Lap (Running) vs Reset/Undo (Paused) */}
                {isRunning ? (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-circle small"
                        onClick={handleLap}
                        style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)' }}
                    >
                        <Plus size={24} strokeWidth={3} />
                    </motion.button>
                ) : lastResetState ? (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-circle small"
                        onClick={undoReset}
                        style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)' }}
                        title="Undo Reset"
                    >
                        <RotateCcw size={24} style={{ transform: 'scaleX(-1)' }} />
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-circle small"
                        onClick={resetTimer}
                    >
                        <RotateCcw size={24} />
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-circle btn-primary"
                    onClick={toggleTimer}
                >
                    {isRunning ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn-circle small"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings size={24} />
                </motion.button>
            </div>
        </div>
    );
};

export default ControlBar;
