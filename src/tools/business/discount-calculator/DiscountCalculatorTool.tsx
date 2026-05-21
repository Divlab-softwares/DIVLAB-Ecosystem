import { useMemo, useState } from 'react';

export function DiscountCalculatorTool() {
  const [price, setPrice] = useState(50000);
  const [discount, setDiscount] = useState(15);
  const result = useMemo(() => ({ saved: price * discount / 100, final: price * (1 - discount / 100) }), [discount, price]);

  return (
    <div className="tool-body">
      <div className="helper-note">Calcule rapidement un prix apres remise pour devis, boutiques et promotions.</div>
      <div className="form-row">
        <label className="field">Prix initial<input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></label>
        <label className="field">Remise %<input type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} /></label>
      </div>
      <div className="metric-grid">
        <div className="metric"><strong>{result.saved.toFixed(0)}</strong><span>Economie</span></div>
        <div className="metric"><strong>{result.final.toFixed(0)}</strong><span>Prix final</span></div>
      </div>
    </div>
  );
}
