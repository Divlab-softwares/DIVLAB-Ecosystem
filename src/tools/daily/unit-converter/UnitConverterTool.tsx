import { useMemo, useState } from 'react';

const converters = {
  kmMi: { label: 'Kilomètres vers miles', run: (value: number) => value * 0.621371, suffix: 'mi' },
  miKm: { label: 'Miles vers kilomètres', run: (value: number) => value / 0.621371, suffix: 'km' },
  kgLb: { label: 'Kilogrammes vers livres', run: (value: number) => value * 2.20462, suffix: 'lb' },
  lbKg: { label: 'Livres vers kilogrammes', run: (value: number) => value / 2.20462, suffix: 'kg' },
  cF: { label: 'Celsius vers Fahrenheit', run: (value: number) => value * 1.8 + 32, suffix: '°F' },
  fC: { label: 'Fahrenheit vers Celsius', run: (value: number) => (value - 32) / 1.8, suffix: '°C' },
};

type ConverterId = keyof typeof converters;

export function UnitConverterTool() {
  const [value, setValue] = useState(1);
  const [converter, setConverter] = useState<ConverterId>('kmMi');
  const result = useMemo(() => converters[converter].run(value), [converter, value]);

  return (
    <div className="tool-body">
      <div className="form-row">
        <label className="field">
          Valeur
          <input type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} />
        </label>
        <label className="field">
          Conversion
          <select value={converter} onChange={(event) => setConverter(event.target.value as ConverterId)}>
            {Object.entries(converters).map(([id, item]) => (
              <option value={id} key={id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="metric">
        <strong>
          {Number.isFinite(result) ? result.toFixed(2) : '0'} {converters[converter].suffix}
        </strong>
        <span>Résultat</span>
      </div>
    </div>
  );
}
