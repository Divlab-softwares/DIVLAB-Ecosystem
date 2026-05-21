import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function toSentenceCase(value: string) {
  return value.toLowerCase().replace(/(^\s*\p{L}|[.!?]\s+\p{L})/gu, (match) => match.toUpperCase());
}

export function CaseConverterTool() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  async function copyText() {
    setStatus((await copyToClipboard(text)) ? 'Texte copié.' : 'Rien à copier.');
  }

  return (
    <div className="tool-body">
      <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Texte à convertir..." />
      <div className="button-row">
        <button className="secondary-button" type="button" onClick={() => setText(text.toUpperCase())}>
          MAJUSCULES
        </button>
        <button className="secondary-button" type="button" onClick={() => setText(text.toLowerCase())}>
          minuscules
        </button>
        <button className="secondary-button" type="button" onClick={() => setText(toSentenceCase(text))}>
          Phrase
        </button>
        <button className="secondary-button" type="button" onClick={() => setText(toTitleCase(text))}>
          Titre
        </button>
        <button className="primary-button" type="button" onClick={copyText}>
          Copier
        </button>
        <button className="danger-button" type="button" onClick={() => setText('')}>
          Reset
        </button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
