import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

const words = 'divlab outil simple rapide clair moderne interface collection ecosystem texte creation developpement quotidien business etude'.split(' ');

export function LoremGeneratorTool() {
  const [paragraphs, setParagraphs] = useState(3);
  const [status, setStatus] = useState('');
  const output = useMemo(() => {
    return Array.from({ length: paragraphs }, (_, index) => {
      const sentence = Array.from({ length: 32 }, (__, wordIndex) => words[(index * 7 + wordIndex) % words.length]).join(' ');
      return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
    }).join('\n\n');
  }, [paragraphs]);

  return (
    <div className="tool-body">
      <div className="helper-note">Genere du faux texte propre pour tester une maquette, une carte ou un bloc de contenu.</div>
      <label className="field">
        Nombre de paragraphes: {paragraphs}
        <input type="range" min="1" max="8" value={paragraphs} onChange={(event) => setParagraphs(Number(event.target.value))} />
      </label>
      <div className="result-box">{output}</div>
      <button className="primary-button" type="button" onClick={async () => setStatus((await copyToClipboard(output)) ? 'Texte copie.' : 'Rien a copier.')}>
        Copier le texte
      </button>
      <div className="status">{status}</div>
    </div>
  );
}
