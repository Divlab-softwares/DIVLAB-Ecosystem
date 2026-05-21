import { useMemo, useState } from 'react';

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DateCalculatorTool() {
  const [start, setStart] = useState(toInputDate(new Date()));
  const [days, setDays] = useState(30);
  const result = useMemo(() => {
    const date = new Date(`${start}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date;
  }, [days, start]);

  return (
    <div className="tool-body">
      <div className="helper-note">Ajoute ou retire des jours a une date pour planifier une echeance, une livraison ou un rappel.</div>
      <div className="form-row">
        <label className="field">Date de depart<input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
        <label className="field">Jours a ajouter<input type="number" value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
      </div>
      <div className="metric"><strong>{Number.isFinite(result.getTime()) ? result.toLocaleDateString() : 'Date invalide'}</strong><span>Date obtenue</span></div>
    </div>
  );
}
