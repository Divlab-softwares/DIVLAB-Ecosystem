import { useMemo, useState } from 'react';

export function MarginCalculatorTool() {
  const [cost, setCost] = useState(100);
  const [price, setPrice] = useState(150);
  const metrics = useMemo(() => {
    const profit = price - cost;
    return {
      profit,
      marginRate: price ? (profit / price) * 100 : 0,
      markupRate: cost ? (profit / cost) * 100 : 0,
    };
  }, [cost, price]);

  return (
    <div className="tool-body">
      <div className="form-row">
        <label className="field">
          Coût
          <input type="number" value={cost} onChange={(event) => setCost(Number(event.target.value))} />
        </label>
        <label className="field">
          Prix de vente
          <input type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
        </label>
      </div>
      <div className="metric-grid">
        <div className="metric">
          <strong>{metrics.profit.toFixed(2)}</strong>
          <span>Bénéfice</span>
        </div>
        <div className="metric">
          <strong>{metrics.marginRate.toFixed(2)}%</strong>
          <span>Taux de marge commerciale</span>
        </div>
        <div className="metric">
          <strong>{metrics.markupRate.toFixed(2)}%</strong>
          <span>Taux de marque sur coût</span>
        </div>
      </div>
    </div>
  );
}
