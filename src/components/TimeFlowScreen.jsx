import React from 'react';
import { Play, Pause, RotateCcw, Settings, Keyboard, Flag } from 'lucide-react';
import LapHistory from './LapHistory';

const TimeFlowScreen = ({
  timerMode,
  setTimerMode,
  isRunning,
  elapsedTime,
  targetTime,
  setTargetTime,
  toggleTimer,
  handleReset,
  handleLap,
  formatTime,
  formatLapTime,
  progressPercent,
  isOvertime,
  overtimeMs,
  formatOvertime,
  onOpenSettings,
  onOpenShortcuts,
  clockColor,
  laps,
  setLaps,
  pomodoroEnabled,
  pomodoroPhase,
  pomodoroCount,
  focusMode,
}) => {
  const isCountdown = timerMode === 'countdown';
  const totalTargetSec = targetTime;
  const inputHours = Math.floor(totalTargetSec / 3600);
  const inputMinutes = Math.floor((totalTargetSec % 3600) / 60);
  const inputSeconds = totalTargetSec % 60;

  const displayTimeMs = isCountdown
    ? Math.max(0, targetTime * 1000 - elapsedTime)
    : elapsedTime;
  const hours = Math.floor(displayTimeMs / 3600000);
  const minutes = Math.floor((displayTimeMs % 3600000) / 60000);
  const seconds = Math.floor((displayTimeMs % 60000) / 1000);

  const showInput = isCountdown && !isRunning && elapsedTime === 0;
  const progress = isCountdown && totalTargetSec > 0
    ? Math.min(100, (elapsedTime / 1000 / totalTargetSec) * 100)
    : 0;

  const canReset = elapsedTime > 0 || (timerMode === 'stopwatch' && !isRunning);

  const switchMode = (mode) => {
    setTimerMode(mode);
    if (isRunning) handleReset();
  };

  const handleInputChange = (type, value) => {
    if (isRunning) return;
    const num = Math.max(0, parseInt(value, 10) || 0);
    let h = inputHours, m = inputMinutes, s = inputSeconds;
    if (type === 'hours' && num <= 23) h = num;
    if (type === 'minutes' && num <= 59) m = num;
    if (type === 'seconds' && num <= 59) s = num;
    setTargetTime(h * 3600 + m * 60 + s);
  };

  const clockSizeStyle = {
    fontSize: 'calc(clamp(4.5rem, 18vw, 11rem) * var(--clock-scale, 1))',
  };

  const inputClass = {
    width: 88,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '12px 14px',
    textAlign: 'center',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: 600,
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  };

  return (
    <div className="timer-page">
      {(!focusMode || !isRunning) && (
      <header className="timer-page-header">
        <div className="timer-header-inner">
          <h1 className="timer-app-title">Antigravity Timer</h1>
          <div className="timer-mode-pill">
            <button
              type="button"
              onClick={() => switchMode('countdown')}
              className={timerMode === 'countdown' ? 'active' : ''}
            >
              Timer
            </button>
            <button
              type="button"
              onClick={() => switchMode('stopwatch')}
              className={timerMode === 'stopwatch' ? 'active' : ''}
            >
              Stopwatch
            </button>
          </div>
          <div className="timer-header-actions">
            <button
              type="button"
              className="timer-settings-btn"
              onClick={onOpenShortcuts}
              aria-label="Keyboard shortcuts"
              title="Shortcuts (?)"
            >
              <Keyboard size={18} />
            </button>
            <button
              type="button"
              className="timer-settings-btn"
              onClick={onOpenSettings}
              aria-label="Settings"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>
      )}

      {focusMode && isRunning && (
        <button
          type="button"
          className="timer-focus-mode-settings"
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings (S)"
        >
          <Settings size={18} />
        </button>
      )}

      <main className="timer-main">
        <div className="timer-main-inner">
          <div className="timer-screen-main">
            {isRunning || (isCountdown && elapsedTime > 0) ? (
              <div className={`timer-clock-wrap timer-overtime-wrap ${isOvertime ? 'overtime-active' : ''}`} style={{ textAlign: 'center' }}>
                <div
                  className={`timer-clock-display timer-clock ${isOvertime ? 'overtime' : ''}`}
                  style={{
                    ...clockSizeStyle,
                    color: isOvertime ? undefined : (clockColor || undefined),
                  }}
                >
                  {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                {pomodoroEnabled && !isOvertime && (
                  <div className={`timer-pomodoro-badge timer-pomodoro-${pomodoroPhase}`} role="status">
                    <span>{pomodoroPhase === 'work' ? 'Work' : 'Break'}</span>
                    {pomodoroCount > 0 && <span className="timer-pomodoro-count">#{pomodoroCount}</span>}
                  </div>
                )}
                {isOvertime && overtimeMs > 0 && (
                  <div className="timer-overtime-badge" role="status" aria-live="polite">
                    <span className="overtime-value">{formatOvertime(overtimeMs)}</span>
                    <span>Overtime</span>
                  </div>
                )}
              </div>
            ) : !showInput ? (
              <div className="timer-clock-wrap" style={{ textAlign: 'center' }}>
                <div className="timer-clock-display" style={clockSizeStyle}>
                  {formatTime(elapsedTime)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div className="timer-clock-wrap" style={{ marginBottom: 48 }}>
                <div className="timer-clock-display" style={{ ...clockSizeStyle, color: 'var(--text-primary)' }}>
                  {inputHours > 0 && `${inputHours.toString().padStart(2, '0')}:`}
                  {inputMinutes.toString().padStart(2, '0')}:{inputSeconds.toString().padStart(2, '0')}
                </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={inputHours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Hours
                    </span>
                  </div>
                  {inputHours > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 300, opacity: 0.5 }}>:</span>}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={inputMinutes}
                      onChange={(e) => handleInputChange('minutes', e.target.value)}
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Minutes
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 300, opacity: 0.5 }}>:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={inputSeconds}
                      onChange={(e) => handleInputChange('seconds', e.target.value)}
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Seconds
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="timer-progress-wrap">
            <div className="timer-progress-track">
              <div
                className="timer-progress-bar"
                style={{ width: `${progress}%`, background: isOvertime ? '#dc2626' : 'var(--accent-primary)' }}
              />
            </div>
          </div>

          <div className="timer-control-bar">
            {isRunning && (
              <button
                type="button"
                className="timer-control-btn btn-control-lap"
                onClick={handleLap}
                title="Record lap"
              >
                <Flag size={20} strokeWidth={2.25} />
                <span className="btn-label">Lap</span>
              </button>
            )}
            <button
              type="button"
              className="timer-control-btn btn-control-reset"
              onClick={handleReset}
              disabled={!canReset}
              title="Reset"
            >
              <RotateCcw size={20} strokeWidth={2.25} />
              <span className="btn-label">Reset</span>
            </button>
            <button
              type="button"
              className="timer-control-btn btn-control-primary"
              onClick={toggleTimer}
              title={isRunning ? 'Pause' : 'Start'}
            >
              {isRunning ? (
                <Pause size={28} strokeWidth={2.5} fill="currentColor" />
              ) : (
                <Play size={28} strokeWidth={2.5} fill="currentColor" className="play-icon-offset" />
              )}
              <span className="btn-label">{isRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>

          {laps && laps.length > 0 && (
            <LapHistory
              laps={laps}
              setLaps={setLaps}
              formatLapTime={formatLapTime}
              variant="below"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TimeFlowScreen;
