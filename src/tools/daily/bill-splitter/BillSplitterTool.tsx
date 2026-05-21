import { useMemo, useState } from 'react';

export function BillSplitterTool() {
  const [amount, setAmount] = useState(25000);
  const [people, setPeople] = useState(4);
  const [tip, setTip] = useState(10);
  const total = useMemo(() => amount * (1 + tip / 100), [amount, tip]);
  const perPerson = people > 0 ? total / people : 0;

  return (
    <div className="tool-body">
      <div className="helper-note">Partage une facture ou une addition avec pourboire, ideal pour sorties et petits budgets communs.</div>
      <div className="form-row">
        <label className="field">Montant<input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label>
        <label className="field">Personnes<input type="number" min="1" value={people} onChange={(event) => setPeople(Number(event.target.value))} /></label>
        <label className="field">Pourboire %<input type="number" value={tip} onChange={(event) => setTip(Number(event.target.value))} /></label>
      </div>
      <div className="metric-grid">
        <div className="metric"><strong>{total.toFixed(0)}</strong><span>Total avec pourboire</span></div>
        <div className="metric"><strong>{perPerson.toFixed(0)}</strong><span>Par personne</span></div>
      </div>
    </div>
  );
}
