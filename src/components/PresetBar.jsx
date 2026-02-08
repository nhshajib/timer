import React from 'react';
import { motion } from 'framer-motion';

const PresetBar = ({ isRunning, elapsedTime, setTargetTime, setisRunning, showToast }) => {
    if (isRunning || elapsedTime > 0) return null;

    const presets = [5, 10, 15, 25, 30];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                gap: '12px',
                marginTop: '32px',
                marginBottom: '32px',
                zIndex: 50,
                position: 'relative'
            }}
        >
            {presets.map(min => (
                <button
                    key={min}
                    onClick={() => {
                        setTargetTime(min * 60);
                        setisRunning(true);
                        showToast(`Started ${min} minute timer`, 'success', 2000);
                    }}
                    style={{
                        background: 'rgba(96, 165, 250, 0.15)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        color: '#60a5fa',
                        padding: '10px 18px',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backdropFilter: 'blur(12px)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(96, 165, 250, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {min}m
                </button>
            ))}
        </motion.div>
    );
};

export default PresetBar;
