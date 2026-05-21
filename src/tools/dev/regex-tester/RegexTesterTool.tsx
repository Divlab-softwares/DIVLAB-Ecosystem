import { useMemo, useState } from 'react';

export function RegexTesterTool() {
  const [pattern, setPattern] = useState('\\bDIVLAB\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState('DIVLAB ecosystem aide DIVLAB a creer des outils.');

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(text.matchAll(regex)).map((match) => match[0]);
      return { error: '', matches };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Regex invalide.', matches: [] };
    }
  }, [flags, pattern, text]);

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <div className="helper-note">Teste une expression reguliere sur un texte et liste les correspondances trouvees.</div>
        <label className="field">Regex<input value={pattern} onChange={(event) => setPattern(event.target.value)} /></label>
        <label className="field">Flags<input value={flags} onChange={(event) => setFlags(event.target.value)} /></label>
        <textarea value={text} onChange={(event) => setText(event.target.value)} />
      </div>
      <div className={result.error ? 'result-box error' : 'result-box'}>
        {result.error || (result.matches.length ? result.matches.join('\n') : 'Aucune correspondance.')}
      </div>
    </div>
  );
}
