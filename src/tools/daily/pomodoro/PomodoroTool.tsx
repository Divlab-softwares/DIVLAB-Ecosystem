import { useEffect, useMemo, useState } from 'react';

const modes = {
  focus: { label: 'Focus', minutes: 25 },
  break: { label: 'Pause', minutes: 5 },
};

type Mode = keyof typeof modes;

export function PomodoroTool() {
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(modes.focus.minutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const display = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setRunning(false);
    setSecondsLeft(modes[nextMode].minutes * 60);
  }

  return (
    <div className="tool-body">
      <div className="chip-row">
        {(Object.keys(modes) as Mode[]).map((item) => (
          <button
            className={mode === item ? 'primary-button' : 'secondary-button'}
            type="button"
            key={item}
            onClick={() => switchMode(item)}
          >
            {modes[item].label}
          </button>
        ))}
      </div>
      <div className="timer">{display}</div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => setRunning((value) => !value)}>
          {running ? 'Pause' : 'Démarrer'}
        </button>
        <button className="secondary-button" type="button" onClick={() => setSecondsLeft(modes[mode].minutes * 60)}>
          Reset
        </button>
      </div>
    </div>
  );
}
