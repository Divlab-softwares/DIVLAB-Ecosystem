import { useMemo, useState } from 'react';

type GradeRow = { id: number; label: string; grade: number; coefficient: number };

export function AverageCalculatorTool() {
  const [rows, setRows] = useState<GradeRow[]>([
    { id: 1, label: 'Maths', grade: 14, coefficient: 2 },
    { id: 2, label: 'Projet', grade: 16, coefficient: 3 },
  ]);

  const average = useMemo(() => {
    const totalCoefficient = rows.reduce((sum, row) => sum + row.coefficient, 0);
    const total = rows.reduce((sum, row) => sum + row.grade * row.coefficient, 0);
    return totalCoefficient ? total / totalCoefficient : 0;
  }, [rows]);

  function updateRow(id: number, patch: Partial<GradeRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <div className="tool-body">
      <div className="table-like">
        {rows.map((row) => (
          <div className="form-row" key={row.id}>
            <label className="field">
              Matière
              <input value={row.label} onChange={(event) => updateRow(row.id, { label: event.target.value })} />
            </label>
            <label className="field">
              Note
              <input
                type="number"
                value={row.grade}
                onChange={(event) => updateRow(row.id, { grade: Number(event.target.value) })}
              />
            </label>
            <label className="field">
              Coef.
              <input
                type="number"
                min="0"
                value={row.coefficient}
                onChange={(event) => updateRow(row.id, { coefficient: Number(event.target.value) })}
              />
            </label>
          </div>
        ))}
      </div>
      <div className="button-row">
        <button
          className="secondary-button"
          type="button"
          onClick={() => setRows((current) => [...current, { id: Date.now(), label: '', grade: 0, coefficient: 1 }])}
        >
          Ajouter une ligne
        </button>
        <button className="danger-button" type="button" onClick={() => setRows([])}>
          Reset
        </button>
      </div>
      <div className="metric">
        <strong>{average.toFixed(2)} / 20</strong>
        <span>Moyenne pondérée</span>
      </div>
    </div>
  );
}
