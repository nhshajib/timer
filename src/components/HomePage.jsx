import React from 'react';
import { motion } from 'framer-motion';
import { Timer, Clock, Settings } from 'lucide-react';

const HomePage = ({ onSelectStopwatch, onSelectCountdown, onOpenSettings }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px 100px',
        position: 'relative',
      }}
    >
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onOpenSettings}
        aria-label="Open Settings"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
        whileHover={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings size={18} />
        Settings
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Antigravity Timer
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
            fontWeight: 500,
          }}
        >
          Focus. Track. Repeat.
        </p>
      </motion.div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          onClick={onSelectStopwatch}
          aria-label="Open Stopwatch"
          whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '24px 20px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            textAlign: 'left',
            transition: 'box-shadow 0.2s',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Timer size={26} strokeWidth={2.2} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>Stopwatch</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Count up. Lap and track time.
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.35 }}
          onClick={onSelectCountdown}
          aria-label="Open Countdown"
          whileHover={{ scale: 1.02, boxShadow: '0 12px 40px rgba(34, 211, 238, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '24px 20px',
            background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            textAlign: 'left',
            transition: 'box-shadow 0.2s',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(34, 211, 238, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={26} strokeWidth={2.2} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>Countdown</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Set a target. Get alerted when time’s up.
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default HomePage;
