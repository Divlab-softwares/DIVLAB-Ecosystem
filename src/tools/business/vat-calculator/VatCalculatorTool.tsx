import { useMemo, useState } from 'react';

export function VatCalculatorTool() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(19.25);
  const values = useMemo(() => ({ tax: amount * rate / 100, total: amount * (1 + rate / 100) }), [amount, rate]);

  return (
    <div className="tool-body">
      <div className="helper-note">Ajoute une TVA ou taxe a un montant hors taxe pour obtenir le total a facturer.</div>
      <div className="form-row">
        <label className="field">Montant HT<input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
        <label className="field">Taxe %<input type="number" value={rate} onChange={(event) => setRate(Number(event.target.value))} /></label>
      </div>
      <div className="metric-grid">
        <div className="metric"><strong>{values.tax.toFixed(0)}</strong><span>Taxe</span></div>
        <div className="metric"><strong>{values.total.toFixed(0)}</strong><span>Total TTC</span></div>
      </div>
    </div>
  );
}
