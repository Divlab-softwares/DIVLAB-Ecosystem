import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function JsonFormatterTool() {
  const [input, setInput] = useState('{"name":"DIVLAB","tools":16}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  function transform(mode: 'pretty' | 'min') {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, mode === 'pretty' ? 2 : 0));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'JSON invalide.');
    }
  }

  async function copyOutput() {
    setStatus((await copyToClipboard(output)) ? 'JSON copié.' : 'Rien à copier.');
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => transform('pretty')}>
            Formater
          </button>
          <button className="secondary-button" type="button" onClick={() => transform('min')}>
            Minifier
          </button>
          <button className="danger-button" type="button" onClick={() => setInput('')}>
            Clear
          </button>
        </div>
      </div>
      <div className="panel">
        <div className={error ? 'result-box error' : 'result-box'}>{error || output || 'Résultat JSON.'}</div>
        <button className="secondary-button" type="button" onClick={copyOutput}>
          Copier
        </button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
}
