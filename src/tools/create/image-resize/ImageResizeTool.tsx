import { useRef, useState } from 'react';

export function ImageResizeTool() {
  const [width, setWidth] = useState(800);
  const [quality, setQuality] = useState(0.85);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const fileRef = useRef<File | null>(null);

  async function resize() {
    const file = fileRef.current;
    if (!file) {
      setStatus('Choisis une image.');
      return;
    }
    const bitmap = await createImageBitmap(file);
    const ratio = width / bitmap.width;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = Math.round(bitmap.height * ratio);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', quality);
    setPreview(url);
    setStatus(`${canvas.width} x ${canvas.height}px`);
  }

  function download() {
    if (!preview) return;
    const link = document.createElement('a');
    link.download = 'divlab-image.jpg';
    link.href = preview;
    link.click();
  }

  return (
    <div className="tool-body">
      <div className="form-row">
        <label className="field">
          Image
          <input type="file" accept="image/*" onChange={(event) => (fileRef.current = event.target.files?.[0] ?? null)} />
        </label>
        <label className="field">
          Largeur
          <input type="number" min="64" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        </label>
        <label className="field">
          Qualité: {quality}
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => void resize()}>
          Redimensionner
        </button>
        <button className="secondary-button" type="button" onClick={download}>
          Télécharger
        </button>
      </div>
      <div className="image-preview preview-box">{preview ? <img src={preview} alt="Aperçu redimensionné" /> : 'Aperçu image'}</div>
      <div className="status">{status}</div>
    </div>
  );
}
