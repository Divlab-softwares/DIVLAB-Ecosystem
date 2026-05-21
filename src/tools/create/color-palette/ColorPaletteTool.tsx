import { useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
}

export function ColorPaletteTool() {
  const [colors, setColors] = useState(['#0b91d2', '#111111', '#ffffff', '#eef5fa', '#63717a']);
  const [status, setStatus] = useState('');
  const output = colors.join(' ');

  return (
    <div className="tool-body">
      <div className="helper-note">Genere une palette simple et copie les couleurs pour CSS, maquettes ou presentations.</div>
      <div className="swatch-grid">
        {colors.map((color) => <div className="swatch" style={{ background: color }} key={color}><span>{color}</span></div>)}
      </div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => setColors(Array.from({ length: 5 }, randomColor))}>Nouvelle palette</button>
        <button className="secondary-button" type="button" onClick={async () => setStatus((await copyToClipboard(output)) ? 'Palette copiee.' : 'Rien a copier.')}>Copier</button>
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
