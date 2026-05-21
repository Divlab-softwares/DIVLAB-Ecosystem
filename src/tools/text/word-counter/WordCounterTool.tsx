import { useMemo, useState } from 'react';

export function WordCounterTool() {
  const [text, setText] = useState('');
  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return {
      words,
      chars: text.length,
      charsNoSpaces: text.replace(/\s/g, '').length,
      sentences: text.split(/[.!?]+/).filter((item) => item.trim()).length,
      reading: Math.max(1, Math.ceil(words / 220)),
    };
  }, [text]);

  return (
    <div className="tool-body">
      <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Colle ton texte ici..." />
      <div className="metric-grid">
        <Metric label="Mots" value={stats.words} />
        <Metric label="Caractères" value={stats.chars} />
        <Metric label="Sans espaces" value={stats.charsNoSpaces} />
        <Metric label="Phrases" value={stats.sentences} />
        <Metric label="Lecture min." value={stats.reading} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
