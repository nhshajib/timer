import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Zap, Trophy, TrendingUp } from 'lucide-react';

const StatsDashboard = ({ sessionHistory, pomodoroCount }) => {
    const totalElapsedTimeMs = sessionHistory.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalFocusMinutes = Math.floor(totalElapsedTimeMs / 60000);
    const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

    const completedPomodoros = pomodoroCount || 0;
    const totalSessions = sessionHistory.length;

    const stats = [
        { label: 'Focus Time', value: `${totalFocusHours}h`, sub: `${totalFocusMinutes}m`, icon: Clock, color: 'var(--accent-primary)' },
        { label: 'Pomodoros', value: completedPomodoros, sub: 'Completed', icon: Zap, color: 'var(--accent-amber)' },
        { label: 'Sessions', value: totalSessions, sub: 'Total runs', icon: CheckCircle, color: 'var(--accent-green)' },
        { label: 'Laps', value: sessionHistory.reduce((acc, s) => acc + (s.lapsCount || 0), 0), sub: 'Recorded', icon: Trophy, color: 'var(--accent-purple)' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        style={{
                            padding: '14px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <stat.icon size={14} style={{ color: stat.color }} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {stat.label}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                                {stat.value}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>{stat.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{
                padding: '14px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <TrendingUp size={14} style={{ color: 'var(--accent-primary)' }} />
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                        Recent Activity
                    </h3>
                </div>

                {sessionHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        No focus sessions recorded yet
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {sessionHistory.slice(-5).reverse().map((session, idx) => (
                            <div key={session.id || idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: idx === Math.min(sessionHistory.length, 5) - 1 ? 0 : '10px',
                                borderBottom: idx === Math.min(sessionHistory.length, 5) - 1 ? 'none' : '1px solid var(--glass-border)',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                        {session.mode === 'pomodoro' ? 'Pomodoro Work' : 'Focus Session'}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                        {new Date(session.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                                        {Math.floor(session.duration / 60000)}m
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                                        {session.lapsCount} Laps
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsDashboard;
