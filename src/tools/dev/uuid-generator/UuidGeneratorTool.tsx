import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function UuidGeneratorTool() {
  const [count, setCount] = useState(5);
  const [ids, setIds] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const output = ids.join('\n');

  function generate() {
    setIds(Array.from({ length: count }, () => crypto.randomUUID()));
  }

  return (
    <div className="tool-body">
      <div className="helper-note">Cree des identifiants uniques pour tests, bases de donnees, prototypes et fixtures.</div>
      <label className="field">Nombre d'UUID<input type="number" min="1" max="50" value={count} onChange={(event) => setCount(Number(event.target.value))} /></label>
      <div className="result-box">{output || 'Les UUID apparaitront ici.'}</div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={generate}>Generer</button>
        <button className="secondary-button" type="button" onClick={async () => setStatus((await copyToClipboard(output)) ? 'UUID copies.' : 'Rien a copier.')}>Copier</button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
