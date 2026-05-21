import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

export function GradientGeneratorTool() {
  const [from, setFrom] = useState('#0b91d2');
  const [to, setTo] = useState('#111111');
  const [angle, setAngle] = useState(135);
  const [status, setStatus] = useState('');
  const css = useMemo(() => `linear-gradient(${angle}deg, ${from}, ${to})`, [angle, from, to]);

  return (
    <div className="tool-body">
      <div className="helper-note">Compose un degrade CSS lisible et copie directement la valeur a coller dans ton style.</div>
      <div className="form-row">
        <label className="field">Couleur depart<input type="color" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="field">Couleur fin<input type="color" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <label className="field">Angle<input type="number" value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
      </div>
      <div className="gradient-preview" style={{ background: css }}>{css}</div>
      <button className="primary-button" type="button" onClick={async () => setStatus((await copyToClipboard(css)) ? 'CSS copie.' : 'Rien a copier.')}>Copier le CSS</button>
      <div className="status">{status}</div>
    </div>
  );
}
