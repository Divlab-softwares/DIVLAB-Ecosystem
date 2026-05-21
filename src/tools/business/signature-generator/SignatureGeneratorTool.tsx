import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function SignatureGeneratorTool() {
  const [name, setName] = useState('Nom Prenom');
  const [role, setRole] = useState('Fonction');
  const [email, setEmail] = useState('divlabsoftware@gmail.com');
  const [phone, setPhone] = useState('+237 652509674');
  const [status, setStatus] = useState('');

  const html = useMemo(
    () =>
      `<table style="font-family:Arial,sans-serif;color:#17211f"><tr><td style="border-left:4px solid #1f7a8c;padding-left:12px"><strong>${name}</strong><br/><span>${role}</span><br/><a href="mailto:${email}">${email}</a><br/><span>${phone}</span></td></tr></table>`,
    [email, name, phone, role],
  );

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <label className="field">
          Nom
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          Fonction
          <input value={role} onChange={(event) => setRole(event.target.value)} />
        </label>
        <label className="field">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="field">
          Téléphone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
      </div>
      <div className="panel">
        <div className="preview-box" dangerouslySetInnerHTML={{ __html: html }} />
        <div className="result-box">{html}</div>
        <button
          className="primary-button"
          type="button"
          onClick={async () => setStatus((await copyToClipboard(html)) ? 'HTML copié.' : 'Rien à copier.')}
        >
          Copier HTML
        </button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
}
