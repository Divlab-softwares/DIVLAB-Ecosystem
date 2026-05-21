import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function SlugGeneratorTool() {
  const [text, setText] = useState('Nouvel outil DIVLAB tres utile');
  const [status, setStatus] = useState('');
  const slug = useMemo(() => slugify(text), [text]);

  return (
    <div className="tool-body">
      <div className="helper-note">Transforme un titre en URL propre, utile pour blogs, pages produit et noms de fichiers.</div>
      <label className="field">
        Titre ou phrase
        <textarea value={text} onChange={(event) => setText(event.target.value)} />
      </label>
      <div className="result-box">{slug || 'Le slug apparaitra ici.'}</div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={async () => setStatus((await copyToClipboard(slug)) ? 'Slug copie.' : 'Rien a copier.')}>
          Copier le slug
        </button>
        <button className="danger-button" type="button" onClick={() => setText('')}>
          Effacer
        </button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
