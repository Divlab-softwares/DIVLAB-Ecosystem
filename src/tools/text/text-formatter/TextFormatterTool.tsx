import { useMemo, useState } from 'react';
import { copyToClipboard } from '../../../utils/clipboard';

const commonFonts = [
  'Inter',
  'Arial',
  'Arial Black',
  'Aptos',
  'Calibri',
  'Cambria',
  'Candara',
  'Century Gothic',
  'Consolas',
  'Corbel',
  'Courier New',
  'Franklin Gothic Medium',
  'Garamond',
  'Georgia',
  'Gill Sans',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Microsoft Sans Serif',
  'Palatino Linotype',
  'Segoe UI',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'system-ui',
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
];

export function TextFormatterTool() {
  const [text, setText] = useState('DIVLAB rend les petits outils simples et rapides.');
  const [font, setFont] = useState(commonFonts[0]);
  const [customFonts, setCustomFonts] = useState<string[]>([]);
  const [styles, setStyles] = useState({ bold: false, italic: false, underline: false, strike: false });
  const [status, setStatus] = useState('');

  const fonts = useMemo(() => [...customFonts, ...commonFonts], [customFonts]);

  async function copyText() {
    setStatus((await copyToClipboard(text)) ? 'Texte copie dans le presse-papiers.' : 'Ajoute du texte avant de copier.');
  }

  async function loadFont(file: File | undefined) {
    if (!file) return;

    try {
      const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      const font = new FontFace(fontName, `url(${URL.createObjectURL(file)})`);
      await font.load();
      document.fonts.add(font);
      setCustomFonts((current) => [fontName, ...current.filter((item) => item !== fontName)]);
      setFont(fontName);
      setStatus(`Police "${fontName}" chargee pour cette session.`);
    } catch {
      setStatus('Impossible de charger cette police. Essaie un fichier TTF, OTF, WOFF ou WOFF2 valide.');
    }
  }

  return (
    <div className="tool-body">
      <div className="helper-note">
        Ecris ton texte, choisis une police, puis active les styles. Les polices importees restent dans ton navigateur
        pendant la session; charge uniquement des fichiers que tu as le droit d'utiliser.
      </div>

      <label className="field">
        Texte a formatter
        <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Saisis ton texte..." />
      </label>

      <div className="controls-grid">
        <label className="field">
          Police du texte
          <select value={font} onChange={(event) => setFont(event.target.value)} aria-label="Choisir une police">
            {fonts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Charger une police legale
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
            onChange={(event) => void loadFont(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="button-row" aria-label="Options de mise en forme">
        <button
          className={styles.bold ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => setStyles((current) => ({ ...current, bold: !current.bold }))}
          title="Rendre le texte plus epais"
        >
          Gras
        </button>
        <button
          className={styles.italic ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => setStyles((current) => ({ ...current, italic: !current.italic }))}
          title="Incliner le texte"
        >
          Italique
        </button>
        <button
          className={styles.underline ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => setStyles((current) => ({ ...current, underline: !current.underline }))}
          title="Souligner le texte"
        >
          Souligne
        </button>
        <button
          className={styles.strike ? 'primary-button' : 'secondary-button'}
          type="button"
          onClick={() => setStyles((current) => ({ ...current, strike: !current.strike }))}
          title="Barrer le texte"
        >
          Barre
        </button>
        <button className="secondary-button" type="button" onClick={copyText}>
          Copier le texte
        </button>
        <button className="danger-button" type="button" onClick={() => setText('')}>
          Effacer
        </button>
      </div>

      <div
        className="preview-box text-preview"
        style={{
          fontFamily: font,
          fontWeight: styles.bold ? 800 : 400,
          fontStyle: styles.italic ? 'italic' : 'normal',
          textDecoration: `${styles.underline ? 'underline ' : ''}${styles.strike ? 'line-through' : ''}`,
        }}
      >
        {text || 'Apercu du texte formatte'}
      </div>
      <div className="status">{status}</div>
    </div>
  );
}
