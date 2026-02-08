import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />
    };

    const colors = {
        success: {
            bg: 'rgba(34, 197, 94, 0.15)',
            border: 'rgba(34, 197, 94, 0.3)',
            text: '#4ade80',
            icon: '#22c55e'
        },
        error: {
            bg: 'rgba(239, 68, 68, 0.15)',
            border: 'rgba(239, 68, 68, 0.3)',
            text: '#f87171',
            icon: '#ef4444'
        },
        warning: {
            bg: 'rgba(251, 191, 36, 0.15)',
            border: 'rgba(251, 191, 36, 0.3)',
            text: '#fbbf24',
            icon: '#f59e0b'
        },
        info: {
            bg: 'rgba(96, 165, 250, 0.15)',
            border: 'rgba(96, 165, 250, 0.3)',
            text: '#60a5fa',
            icon: '#3b82f6'
        }
    };

    const style = colors[type] || colors.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
                background: style.bg,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${style.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '300px',
                maxWidth: '500px',
                boxShadow: `0 8px 24px ${style.border}`,
                color: style.text,
                fontSize: '0.9rem',
                fontWeight: 500
            }}
        >
            <div style={{ color: style.icon, display: 'flex', alignItems: 'center' }}>
                {icons[type]}
            </div>
            <div style={{ flex: 1 }}>{message}</div>
            <button
                onClick={onClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: style.text,
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {toasts.map(toast => (
                    <div key={toast.id} style={{ pointerEvents: 'auto' }}>
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export { Toast, ToastContainer };
export default ToastContainer;
