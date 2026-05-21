import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

function encodeUtf8(value: string) {
  return btoa(String.fromCodePoint(...new TextEncoder().encode(value)));
}

function decodeUtf8(value: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(value), (char) => char.charCodeAt(0)));
}

export function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function run(mode: 'encode' | 'decode') {
    try {
      setOutput(mode === 'encode' ? encodeUtf8(input) : decodeUtf8(input));
      setError('');
    } catch {
      setError('Impossible de décoder cette valeur Base64.');
    }
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Texte ou Base64..." />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => run('encode')}>
            Encoder
          </button>
          <button className="secondary-button" type="button" onClick={() => run('decode')}>
            Décoder
          </button>
          <button className="danger-button" type="button" onClick={() => setInput('')}>
            Clear
          </button>
        </div>
      </div>
      <div className="panel">
        <div className={error ? 'result-box error' : 'result-box'}>{error || output || 'Résultat.'}</div>
        <button
          className="secondary-button"
          type="button"
          onClick={async () => setStatus((await copyToClipboard(output)) ? 'Copié.' : 'Rien à copier.')}
        >
          Copier
        </button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
}
