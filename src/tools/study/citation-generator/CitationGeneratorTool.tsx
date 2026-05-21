import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function CitationGeneratorTool() {
  const [author, setAuthor] = useState('Nom, Prenom');
  const [title, setTitle] = useState('Titre de la ressource');
  const [site, setSite] = useState('DIVLAB');
  const [year, setYear] = useState('2026');
  const [url, setUrl] = useState('https://ecosystem.divlabs-tech.com');
  const [status, setStatus] = useState('');
  const citation = useMemo(() => `${author}. "${title}." ${site}, ${year}, ${url}.`, [author, site, title, url, year]);

  return (
    <div className="tool-body">
      <div className="helper-note">Genere une citation web simple pour bibliographies rapides et travaux scolaires.</div>
      <div className="two-column">
        <label className="field">Auteur<input value={author} onChange={(event) => setAuthor(event.target.value)} /></label>
        <label className="field">Titre<input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="field">Site<input value={site} onChange={(event) => setSite(event.target.value)} /></label>
        <label className="field">Annee<input value={year} onChange={(event) => setYear(event.target.value)} /></label>
        <label className="field">URL<input value={url} onChange={(event) => setUrl(event.target.value)} /></label>
      </div>
      <div className="result-box">{citation}</div>
      <button className="primary-button" type="button" onClick={async () => setStatus((await copyToClipboard(citation)) ? 'Citation copiee.' : 'Rien a copier.')}>Copier</button>
      <div className="status">{status}</div>
    </div>
  );
}
