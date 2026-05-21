import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

export function QrCodeTool() {
  const [value, setValue] = useState('https://divlab.local');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value.trim()) return;
    QRCode.toCanvas(canvasRef.current, value, { width: 240, margin: 2 }, (err) => {
      setError(err ? 'Impossible de générer ce QR code.' : '');
    });
  }, [value]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'divlab-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="URL ou texte..." />
        <div className="button-row">
          <button className="primary-button" type="button" onClick={download}>
            Télécharger PNG
          </button>
          <button className="danger-button" type="button" onClick={() => setValue('')}>
            Clear
          </button>
        </div>
        <div className="status error">{error}</div>
      </div>
      <div className="qr-output">{value.trim() ? <canvas ref={canvasRef} /> : 'Ajoute du texte pour générer un QR code.'}</div>
    </div>
  );
}
