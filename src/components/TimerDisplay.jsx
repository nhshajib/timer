import React from 'react';
import { motion } from 'framer-motion';

const TimerDisplay = ({
    elapsedTime,
    isRunning,
    timerMode,
    targetTime,
    formatTime,
    clockScale,
    activeColor,
    progressPercent
}) => {
    // Circular progress ring dimensions
    const size = 400 * clockScale;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercent / 100) * circumference;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '40px 20px',
            minHeight: '400px'
        }}>
            {/* CIRCULAR PROGRESS RING */}
            <svg
                width={size}
                height={size}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.3))',
                    transition: 'all 0.3s ease'
                }}
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(96, 165, 250, 0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${activeColor})`
                    }}
                />
            </svg>

            {/* MAIN TIMER DISPLAY */}
            <motion.div
                animate={{
                    scale: isRunning ? [1, 1.02, 1] : 1,
                }}
                transition={{
                    duration: 2,
                    repeat: isRunning ? Infinity : 0,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    fontSize: `calc(5rem * ${clockScale})`,
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    textShadow: `0 0 30px ${activeColor}40, 0 2px 10px rgba(0,0,0,0.3)`,
                    transition: 'font-size 0.3s ease, color 0.3s ease',
                    userSelect: 'none'
                }}
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Timer: ${formatTime(elapsedTime)}${isRunning ? ', running' : ', stopped'}`}
                role="timer"
            >
                {formatTime(elapsedTime)}
            </motion.div>

            {/* Timer Mode Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                style={{
                    position: 'relative',
                    marginTop: '16px',
                    fontSize: `calc(0.85rem * ${clockScale})`,
                    fontWeight: 500,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'font-size 0.3s ease'
                }}
            >
                {timerMode === 'countdown' ? `Target: ${formatTime(targetTime * 1000)}` : 'Stopwatch'}
            </motion.div>
        </div>
    );
};

export default TimerDisplay;
