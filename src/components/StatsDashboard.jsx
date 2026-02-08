import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Clock, CheckCircle, Zap, Trophy, TrendingUp } from 'lucide-react';

const StatsDashboard = ({ sessionHistory, pomodoroCount }) => {
    // Basic Aggregations
    const totalElapsedTimeMs = sessionHistory.reduce((acc, session) => acc + (session.duration || 0), 0);
    const totalFocusMinutes = Math.floor(totalElapsedTimeMs / 60000);
    const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

    const completedPomodoros = pomodoroCount || 0;
    const totalSessions = sessionHistory.length;

    const stats = [
        { label: 'Focus Time', value: `${totalFocusHours}h`, sub: `${totalFocusMinutes}m`, icon: Clock, color: '#3b82f6' },
        { label: 'Pomodoros', value: completedPomodoros, sub: 'Completed', icon: Zap, color: '#fbbf24' },
        { label: 'Sessions', value: totalSessions, sub: 'Total runs', icon: CheckCircle, color: '#10b981' },
        { label: 'Laps', value: sessionHistory.reduce((acc, s) => acc + (s.lapsCount || 0), 0), sub: 'Recorded', icon: Trophy, color: '#8b5cf6' }
    ];

    return (
        <div className="stats-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-panel"
                        style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <stat.icon size={18} style={{ color: stat.color }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase' }}>{stat.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.4 }}>{stat.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent History List */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <TrendingUp size={18} style={{ color: '#3b82f6' }} />
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase' }}>Recent Activity</h3>
                </div>

                {sessionHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '0.875rem' }}>
                        No focus sessions recorded yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sessionHistory.slice(-5).reverse().map((session, idx) => (
                            <div key={session.id || idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: idx === sessionHistory.slice(-5).length - 1 ? 0 : '12px',
                                borderBottom: idx === sessionHistory.slice(-5).length - 1 ? 'none' : '1px solid var(--glass-border)'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                                        {session.mode === 'pomodoro' ? 'Pomodoro Work' : 'Focus Session'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                        {new Date(session.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                                        {Math.floor(session.duration / 60000)}m
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
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
