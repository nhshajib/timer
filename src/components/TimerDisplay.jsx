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
    const size = Math.min(340, 340 * clockScale);
    const strokeWidth = 4;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercent / 100) * circumference;

    const glowSize = Math.min(20, 8 + (progressPercent / 100) * 12);
    const glowOpacity = 0.3 + (progressPercent / 100) * 0.4;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '20px',
            userSelect: 'none',
        }}>
            <svg
                width={size}
                height={size}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    transition: 'all 0.3s ease',
                }}
            >
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent-primary)" />
                        <stop offset="50%" stopColor="var(--accent-blue)" />
                        <stop offset="100%" stopColor="var(--accent-cyan)" />
                    </linearGradient>
                    <filter id="progressGlow">
                        <feGaussianBlur stdDeviation={glowSize / 3} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--glass-border)"
                    strokeWidth={strokeWidth}
                />

                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={progressPercent > 90 ? activeColor : "url(#progressGradient)"}
                    strokeWidth={strokeWidth + 1}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ type: "spring", stiffness: 60, damping: 25 }}
                    filter="url(#progressGlow)"
                    style={{ opacity: glowOpacity + 0.3 }}
                />

                {progressPercent > 0 && (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={progressPercent > 90 ? activeColor : "url(#progressGradient)"}
                        strokeWidth={strokeWidth * 3}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ type: "spring", stiffness: 60, damping: 25 }}
                        style={{ opacity: 0.08 }}
                    />
                )}
            </svg>

            <motion.div
                animate={{
                    scale: isRunning ? [1, 1.008, 1] : 1,
                }}
                transition={{
                    duration: 3,
                    repeat: isRunning ? Infinity : 0,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: `${size * 0.7}px`,
                    justifyContent: 'center',
                }}
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Timer: ${formatTime(elapsedTime)}${isRunning ? ', running' : ', stopped'}`}
                role="timer"
            >
                <div
                    className="timer-font"
                    style={{
                        fontSize: `calc(4.5rem * ${clockScale})`,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        color: 'var(--text-primary)',
                        transition: 'font-size 0.3s ease',
                    }}
                >
                    {formatTime(elapsedTime)}
                </div>

                <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    transition: 'all 0.3s ease',
                }}>
                    {timerMode === 'countdown'
                        ? `Target ${formatTime(targetTime * 1000)}`
                        : timerMode === 'pomodoro'
                            ? 'Pomodoro'
                            : 'Stopwatch'
                    }
                </div>
            </motion.div>
        </div>
    );
};

export default TimerDisplay;
