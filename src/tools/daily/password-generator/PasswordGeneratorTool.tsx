import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

const pools = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%&*?+-_',
};

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  function generate() {
    const chars = Object.values(pools).join('');
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (byte) => chars[byte % chars.length]).join(''));
  }

  return (
    <div className="tool-body">
      <label className="field">
        Longueur: {length}
        <input
          type="range"
          min="8"
          max="48"
          value={length}
          onChange={(event) => setLength(Number(event.target.value))}
        />
      </label>
      <div className="result-box">{password || 'Clique sur générer pour créer un mot de passe.'}</div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={generate}>
          Générer
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={async () => setStatus((await copyToClipboard(password)) ? 'Mot de passe copié.' : 'Rien à copier.')}
        >
          Copier
        </button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
