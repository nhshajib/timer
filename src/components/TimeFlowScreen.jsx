import React from 'react';
import { Play, Pause, RotateCcw, Settings, Keyboard, Flag } from 'lucide-react';
import LapHistory from './LapHistory';
import { useIsMobile } from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
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
  const activeDisplayHasHours = hours > 0;
  const inputDisplayHasHours = inputHours > 0;

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

  const getClockStyle = (hasHours) => {
    if (isMobile && hasHours) {
      return {
        fontSize: 'min(calc(clamp(2.05rem, 11vw, 3.35rem) * var(--clock-scale, 1)), 22vh)',
      };
    }
    if (isMobile) {
      return {
        fontSize: 'min(calc(clamp(3rem, 17vw, 4.6rem) * var(--clock-scale, 1)), 30vh)',
      };
    }
    if (hasHours) {
      return {
        fontSize: 'min(calc(clamp(3.2rem, 10.8vw, 8rem) * var(--clock-scale, 1)), 26vh)',
      };
    }
    return {
      fontSize: 'min(calc(clamp(4.5rem, 18vw, 11rem) * var(--clock-scale, 1)), 30vh)',
    };
  };

  const handlePrimaryPointerDown = (event) => {
    if (!isMobile) return;
    if (event.pointerType && event.pointerType !== 'touch') return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
    }
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

  const renderLapButton = () => (
    <button
      type="button"
      className="timer-control-btn btn-control-lap"
      onClick={handleLap}
      title="Record lap"
    >
      <Flag size={20} strokeWidth={2.25} />
      <span className="btn-label">Lap</span>
    </button>
  );

  const renderResetButton = () => (
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
  );

  const renderPrimaryButton = () => (
    <button
      type="button"
      className="timer-control-btn btn-control-primary"
      onClick={toggleTimer}
      onPointerDown={handlePrimaryPointerDown}
      title={isRunning ? 'Pause' : 'Start'}
    >
      {isRunning ? (
        <Pause size={28} strokeWidth={2.5} fill="currentColor" />
      ) : (
        <Play size={28} strokeWidth={2.5} fill="currentColor" className="play-icon-offset" />
      )}
      <span className="btn-label">{isRunning ? 'Pause' : 'Start'}</span>
    </button>
  );

  return (
    <div className={`timer-page ${isMobile ? 'timer-page-mobile-native' : ''}`}>
      {(!focusMode || !isRunning) && (
      <header className={`timer-page-header ${isMobile ? 'timer-page-header-mobile' : ''}`}>
        <div className={`timer-header-inner ${isMobile ? 'timer-header-inner-mobile' : ''}`}>
          <div className="timer-header-brand">
            <h1 className="timer-app-title">Antigravity Timer</h1>
          </div>
          <div className="timer-header-actions">
            {!isMobile && (
              <button
                type="button"
                className="timer-settings-btn"
                onClick={onOpenShortcuts}
                aria-label="Keyboard shortcuts"
                title="Shortcuts (?)"
              >
                <Keyboard size={18} />
              </button>
            )}
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
          <div className={`timer-mode-pill ${isMobile ? 'timer-mode-pill-mobile' : ''}`}>
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

      <main className={`timer-main ${isMobile ? 'timer-main-mobile-native' : ''}`}>
        <div className={`timer-main-inner ${isMobile ? 'timer-main-inner-mobile-native' : ''}`}>
          <div className={`timer-screen-main ${isMobile ? 'timer-screen-main-mobile-native' : ''}`}>
            {isRunning || (isCountdown && elapsedTime > 0) ? (
              <div className={`timer-clock-wrap timer-overtime-wrap ${isOvertime ? 'overtime-active' : ''}`} style={{ textAlign: 'center' }}>
                <div
                  className={`timer-clock-display timer-clock ${isOvertime ? 'overtime' : ''} ${activeDisplayHasHours ? 'timer-clock-display-hours' : ''}`}
                  style={{
                    ...getClockStyle(activeDisplayHasHours),
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
                <div className={`timer-clock-display ${activeDisplayHasHours ? 'timer-clock-display-hours' : ''}`} style={getClockStyle(activeDisplayHasHours)}>
                  {formatTime(elapsedTime)}
                </div>
              </div>
            ) : (
              <div className="timer-input-view" style={{ textAlign: 'center', width: '100%' }}>
                <div className="timer-clock-wrap timer-clock-wrap-input" style={{ marginBottom: 48 }}>
                <div className={`timer-clock-display ${inputDisplayHasHours ? 'timer-clock-display-hours' : ''}`} style={{ ...getClockStyle(inputDisplayHasHours), color: 'var(--text-primary)' }}>
                  {inputHours > 0 && `${inputHours.toString().padStart(2, '0')}:`}
                  {inputMinutes.toString().padStart(2, '0')}:{inputSeconds.toString().padStart(2, '0')}
                </div>
                </div>
                <div className="timer-input-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                  <div className="timer-input-unit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={inputHours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      className="timer-input-field"
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span className="timer-input-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Hours
                    </span>
                  </div>
                  {inputHours > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 300, opacity: 0.5 }}>:</span>}
                  <div className="timer-input-unit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={inputMinutes}
                      onChange={(e) => handleInputChange('minutes', e.target.value)}
                      className="timer-input-field"
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span className="timer-input-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Minutes
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 300, opacity: 0.5 }}>:</span>
                  <div className="timer-input-unit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={inputSeconds}
                      onChange={(e) => handleInputChange('seconds', e.target.value)}
                      className="timer-input-field"
                      style={inputClass}
                      disabled={isRunning}
                    />
                    <span className="timer-input-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                      Seconds
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="timer-progress-wrap">
            {isMobile && isCountdown && totalTargetSec > 0 && (
              <div className="timer-progress-meta" aria-hidden="true">
                <span>Session Progress</span>
                <span>{`${Math.round(progress)}%`}</span>
              </div>
            )}
            <div className="timer-progress-track">
              <div
                className="timer-progress-bar"
                style={{ width: `${progress}%`, background: isOvertime ? '#dc2626' : 'var(--accent-primary)' }}
              />
            </div>
          </div>

          {isMobile ? (
            <div className={`timer-control-bar timer-control-bar-mobile-native ${isRunning ? 'timer-control-bar-mobile-running' : 'timer-control-bar-mobile-idle'}`}>
              {isRunning && renderLapButton()}
              {renderResetButton()}
              {renderPrimaryButton()}
            </div>
          ) : (
            <div className="timer-control-bar">
              {isRunning && renderLapButton()}
              {renderResetButton()}
              {renderPrimaryButton()}
            </div>
          )}

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
