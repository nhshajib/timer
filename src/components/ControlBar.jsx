import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, Plus, Settings, Keyboard } from 'lucide-react';

const ControlBar = ({
    isRunning,
    toggleTimer,
    resetTimer,
    handleLap,
    setIsSettingsOpen,
    timerMode,
    setTimerMode,
    onShowShortcuts,
}) => {
    const modes = [
        { id: 'stopwatch', label: 'Stopwatch' },
        { id: 'countdown', label: 'Countdown' },
    ];

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '32px',
            zIndex: 10,
            pointerEvents: 'none',
        }}>
            {!isRunning && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="mode-switcher"
                    style={{ pointerEvents: 'auto' }}
                >
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            className={`mode-tab ${timerMode === mode.id ? 'active' : ''}`}
                            onClick={() => setTimerMode(mode.id)}
                        >
                            {mode.label}
                        </button>
                    ))}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="control-bar"
                style={{ pointerEvents: 'auto' }}
            >
                {isRunning ? (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-icon accent-cyan"
                        onClick={handleLap}
                        title="Add Lap"
                    >
                        <Plus size={20} strokeWidth={2.5} />
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="btn-icon"
                        onClick={resetTimer}
                        title="Reset"
                    >
                        <RotateCcw size={18} />
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-icon primary"
                    onClick={toggleTimer}
                    title={isRunning ? 'Pause' : 'Start'}
                >
                    {isRunning
                        ? <Pause size={26} fill="currentColor" />
                        : <Play size={26} fill="currentColor" style={{ marginLeft: '3px' }} />
                    }
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn-icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title="Settings"
                >
                    <Settings size={18} />
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ControlBar;
