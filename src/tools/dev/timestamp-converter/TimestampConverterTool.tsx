import { useMemo, useState } from 'react';

export function TimestampConverterTool() {
  const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));
  const date = useMemo(() => new Date(timestamp * 1000), [timestamp]);

  return (
    <div className="tool-body">
      <div className="helper-note">Convertit un timestamp Unix en date lisible et donne aussi l'heure actuelle.</div>
      <label className="field">Timestamp Unix en secondes<input type="number" value={timestamp} onChange={(event) => setTimestamp(Number(event.target.value))} /></label>
      <div className="metric-grid">
        <div className="metric"><strong>{Number.isFinite(date.getTime()) ? date.toLocaleString() : 'Date invalide'}</strong><span>Date locale</span></div>
        <div className="metric"><strong>{Number.isFinite(date.getTime()) ? date.toISOString() : 'Date invalide'}</strong><span>ISO UTC</span></div>
        <div className="metric"><strong>{Math.floor(Date.now() / 1000)}</strong><span>Maintenant</span></div>
      </div>
    </div>
  );
}
