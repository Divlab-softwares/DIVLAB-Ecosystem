import { useMemo, useState } from 'react';

export function HourlyRateTool() {
  const [monthlyTarget, setMonthlyTarget] = useState(800000);
  const [days, setDays] = useState(20);
  const [hours, setHours] = useState(6);
  const rate = useMemo(() => monthlyTarget / Math.max(days * hours, 1), [days, hours, monthlyTarget]);

  return (
    <div className="tool-body">
      <div className="helper-note">Estime un taux horaire minimal a partir d'un objectif mensuel et du temps facturable.</div>
      <div className="form-row">
        <label className="field">Objectif mensuel<input type="number" value={monthlyTarget} onChange={(event) => setMonthlyTarget(Number(event.target.value))} /></label>
        <label className="field">Jours facturables<input type="number" value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
        <label className="field">Heures par jour<input type="number" value={hours} onChange={(event) => setHours(Number(event.target.value))} /></label>
      </div>
      <div className="metric"><strong>{rate.toFixed(0)}</strong><span>Taux horaire estime</span></div>
    </div>
  );
}
