import React from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const TimeFlowScreen = ({
  timerMode,
  setTimerMode,
  isRunning,
  elapsedTime,
  targetTime,
  setTargetTime,
  toggleTimer,
  handleReset,
  formatTime,
  progressPercent,
  isOvertime,
  overtimeMs,
  formatOvertime,
  onOpenSettings,
  clockColor,
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

  const setPreset = (mins) => {
    if (isRunning) return;
    setTargetTime(mins * 60);
    handleReset();
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

  const clockStyle = {
    fontSize: 'calc(clamp(5.5rem, 22vw, 15rem) * var(--clock-scale, 1))',
    fontWeight: 400,
    lineHeight: 1,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.04em',
    fontVariantNumeric: 'tabular-nums',
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      <header
        style={{
          width: '100%',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              margin: 0,
              transition: 'color 0.2s',
            }}
          >
            Antigravity Timer
          </h1>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s',
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 48px' }}>
        <div style={{ maxWidth: 640, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div className="timer-mode-pill" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: 5 }}>
              <button
                type="button"
                onClick={() => switchMode('countdown')}
                style={{
                  padding: '12px 48px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(timerMode === 'countdown'
                    ? { background: 'white', color: 'black', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }),
                }}
              >
                Timer
              </button>
              <button
                type="button"
                onClick={() => switchMode('stopwatch')}
                style={{
                  padding: '12px 48px',
                  borderRadius: 9999,
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(timerMode === 'stopwatch'
                    ? { background: 'white', color: 'black', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }
                    : { background: 'transparent', color: 'var(--text-muted)' }),
                }}
              >
                Stopwatch
              </button>
            </div>
          </div>

          <div className="timer-screen-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
            {isRunning || (isCountdown && elapsedTime > 0) ? (
              <div className={`timer-overtime-wrap ${isOvertime ? 'overtime-active' : ''}`} style={{ textAlign: 'center' }}>
                <div
                  className={`timer-clock ${isOvertime ? 'overtime' : ''}`}
                  style={{
                    ...clockStyle,
                    color: isOvertime ? 'var(--accent-red)' : (clockColor || 'var(--text-primary)'),
                  }}
                >
                  {hours > 0 && `${hours.toString().padStart(2, '0')}:`}
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
                {isOvertime && overtimeMs > 0 && (
                  <div className="timer-overtime-badge" role="status" aria-live="polite">
                    <span className="overtime-value">{formatOvertime(overtimeMs)}</span>
                    <span>Overtime</span>
                  </div>
                )}
              </div>
            ) : !showInput ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...clockStyle, color: 'var(--text-primary)' }}>
                  {formatTime(elapsedTime)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ ...clockStyle, color: 'var(--text-primary)', marginBottom: 48 }}>
                  {inputHours > 0 && `${inputHours.toString().padStart(2, '0')}:`}
                  {inputMinutes.toString().padStart(2, '0')}:{inputSeconds.toString().padStart(2, '0')}
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

          <div style={{ width: '100%', maxWidth: 420, marginBottom: 32 }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
              <div
                className="timer-progress-bar"
                style={{ height: '100%', width: `${progress}%`, background: isOvertime ? 'var(--accent-red)' : 'var(--accent-primary)', borderRadius: 9999 }}
              />
            </div>
          </div>

          {isCountdown && !isRunning && elapsedTime === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 36, flexWrap: 'wrap' }}>
              {[1, 5, 10, 25].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  className="timer-preset-btn"
                  onClick={() => setPreset(mins)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9999,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {mins} min
                </button>
              ))}
            </div>
          )}

          <div className="timer-control-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 8 }}>
            <button
              type="button"
              className="timer-control-btn timer-control-reset"
              onClick={handleReset}
              disabled={!canReset}
              title="Reset"
              style={{
                width: 88,
                height: 88,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 22,
                border: '1px solid rgba(255,255,255,0.14)',
                background: canReset ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                color: canReset ? 'var(--text-secondary)' : 'var(--text-muted)',
                cursor: canReset ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              <RotateCcw size={28} strokeWidth={2} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Reset</span>
            </button>
            <button
              type="button"
              className="timer-control-btn timer-control-play-pause"
              onClick={toggleTimer}
              title={isRunning ? 'Pause' : 'Start'}
              style={{
                width: 116,
                height: 116,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                borderRadius: 58,
                border: 'none',
                background: 'white',
                color: 'black',
                cursor: 'pointer',
                boxShadow: '0 6px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.12)',
                transition: 'transform 0.15s, box-shadow 0.2s',
              }}
            >
              {isRunning ? (
                <Pause size={40} strokeWidth={2} fill="black" />
              ) : (
                <Play size={40} strokeWidth={2} fill="black" style={{ marginLeft: 6 }} />
              )}
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {isRunning ? 'Pause' : 'Start'}
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimeFlowScreen;
