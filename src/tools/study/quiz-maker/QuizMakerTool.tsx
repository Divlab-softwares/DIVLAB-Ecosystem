import { useState } from 'react';

type Question = { prompt: string; answer: string };

export function QuizMakerTool() {
  const [raw, setRaw] = useState('Capitale du Cameroun? | Yaounde\n2 + 2? | 4');
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const questions: Question[] = raw.split(/\r?\n/).map((line) => {
    const [prompt = '', answer = ''] = line.split('|');
    return { prompt: prompt.trim(), answer: answer.trim() };
  }).filter((item) => item.prompt && item.answer);
  const active = questions[current % Math.max(questions.length, 1)];

  return (
    <div className="tool-body">
      <div className="helper-note">Cree un mini quiz depuis des lignes au format "question | reponse", puis revise carte par carte.</div>
      <textarea value={raw} onChange={(event) => { setRaw(event.target.value); setCurrent(0); setRevealed(false); }} />
      <div className="preview-box">
        <strong>{active?.prompt || 'Ajoute au moins une question.'}</strong>
        <p>{revealed ? active?.answer : 'Clique sur reveler pour voir la reponse.'}</p>
      </div>
      <div className="button-row">
        <button className="primary-button" type="button" onClick={() => setRevealed((value) => !value)}>Reveler / cacher</button>
        <button className="secondary-button" type="button" onClick={() => { setCurrent((value) => value + 1); setRevealed(false); }}>Question suivante</button>
      </div>
    </div>
  );
}
