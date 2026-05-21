import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function TextCleanerTool() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState('');

  function clean() {
    const lines = text
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    setResult([...new Set(lines)].join('\n'));
  }

  async function copyResult() {
    setStatus((await copyToClipboard(result)) ? 'Résultat copié.' : 'Rien à copier.');
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Texte brut..." />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={clean}>
            Nettoyer
          </button>
          <button className="danger-button" type="button" onClick={() => setText('')}>
            Effacer
          </button>
        </div>
      </div>
      <div className="panel">
        <div className="result-box">{result || 'Le texte nettoyé apparaîtra ici.'}</div>
        <button className="secondary-button" type="button" onClick={copyResult}>
          Copier le résultat
        </button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
}
