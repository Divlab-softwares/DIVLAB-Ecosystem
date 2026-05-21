import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

async function digest(value: string, algorithm: AlgorithmIdentifier) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function HashGeneratorTool() {
  const [input, setInput] = useState('DIVLAB');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');

  async function generate() {
    setOutput(await digest(input, algorithm));
  }

  return (
    <div className="tool-body">
      <div className="helper-note">Genere une empreinte SHA pour verifier une chaine ou comparer deux contenus.</div>
      <div className="form-row">
        <label className="field">Texte<textarea value={input} onChange={(event) => setInput(event.target.value)} /></label>
        <label className="field">Algorithme<select value={algorithm} onChange={(event) => setAlgorithm(event.target.value)}><option>SHA-1</option><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></label>
      </div>
      <div className="result-box">{output || 'Clique sur generer pour obtenir le hash.'}</div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => void generate()}>Generer</button>
        <button className="secondary-button" type="button" onClick={async () => setStatus((await copyToClipboard(output)) ? 'Hash copie.' : 'Rien a copier.')}>Copier</button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
