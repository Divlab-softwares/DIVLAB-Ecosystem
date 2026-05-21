import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

function csvToJson(csv: string) {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((item) => item.trim());
  return rows.map((row) =>
    Object.fromEntries(row.split(',').map((cell, index) => [headers[index] || `col${index + 1}`, cell.trim()])),
  );
}

function jsonToCsv(json: string) {
  const rows = JSON.parse(json) as Record<string, unknown>[];
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return [headers.join(','), ...rows.map((row) => headers.map((header) => String(row[header] ?? '')).join(','))].join('\n');
}

export function CsvJsonTool() {
  const [input, setInput] = useState('name,role\nDIVLAB,Maison mère');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function convert(mode: 'csv-json' | 'json-csv') {
    try {
      setOutput(mode === 'csv-json' ? JSON.stringify(csvToJson(input), null, 2) : jsonToCsv(input));
      setError('');
    } catch {
      setError('Format invalide pour cette conversion.');
    }
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => convert('csv-json')}>
            CSV vers JSON
          </button>
          <button className="secondary-button" type="button" onClick={() => convert('json-csv')}>
            JSON vers CSV
          </button>
          <button className="danger-button" type="button" onClick={() => setInput('')}>
            Clear
          </button>
        </div>
      </div>
      <div className="panel">
        <div className={error ? 'result-box error' : 'result-box'}>{error || output || 'Résultat.'}</div>
        <button className="secondary-button" type="button" onClick={() => void copyToClipboard(output)}>
          Copier
        </button>
      </div>
    </div>
  );
}
