import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function UrlCodecTool() {
  const [input, setInput] = useState('https://ecosystem.divlabs-tech.com/text/TextFormater?font=Segoe UI');
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');

  function run(mode: 'encode' | 'decode') {
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch {
      setOutput('Valeur URL invalide pour ce decodage.');
    }
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <div className="helper-note">Encode ou decode une URL pour la rendre utilisable dans une requete, un lien ou une API.</div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => run('encode')}>Encoder</button>
          <button className="secondary-button" type="button" onClick={() => run('decode')}>Decoder</button>
        </div>
      </div>
      <div className="panel">
        <div className="result-box">{output || 'Resultat URL.'}</div>
        <button className="secondary-button" type="button" onClick={async () => setStatus((await copyToClipboard(output)) ? 'Resultat copie.' : 'Rien a copier.')}>Copier</button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
}
