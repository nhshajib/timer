import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_PRESETS = [5, 10, 15, 25, 30, 45, 60];

const PresetBar = ({ isCountdown, isRunning, elapsedTime, onPresetSelect, customPresets = [] }) => {
    if (!isCountdown || isRunning || elapsedTime > 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="timer-preset-bar"
        >
            {DEFAULT_PRESETS.map(min => (
                <button
                    key={`d-${min}`}
                    type="button"
                    onClick={() => onPresetSelect(min)}
                    className="timer-preset-btn"
                    aria-label={`Set ${min} minute timer`}
                >
                    {min}m
                </button>
            ))}
            {(customPresets || []).filter((p) => p && (p.minutes ?? p.min) > 0).map((p) => (
                <button
                    key={p.id || `c-${(p.minutes ?? p.min)}-${p.label || ''}`}
                    type="button"
                    onClick={() => onPresetSelect(p.minutes ?? p.min)}
                    className="timer-preset-btn timer-preset-custom"
                    aria-label={`Set ${p.label} (${p.minutes} min)`}
                    title={`${p.minutes} min`}
                >
                    {p.label}
                </button>
            ))}
        </motion.div>
    );
};

export default PresetBar;
