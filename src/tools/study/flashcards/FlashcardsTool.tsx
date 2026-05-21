import { useEffect, useState } from 'react';

type Card = { id: number; question: string; answer: string };
const storageKey = 'divlab-flashcards';

export function FlashcardsTool() {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as Card[]) : [];
  });
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [revealedId, setRevealedId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cards));
  }, [cards]);

  function addCard() {
    if (!question.trim() || !answer.trim()) return;
    setCards((current) => [{ id: Date.now(), question, answer }, ...current]);
    setQuestion('');
    setAnswer('');
  }

  return (
    <div className="tool-body">
      <div className="form-row">
        <label className="field">
          Question
          <input value={question} onChange={(event) => setQuestion(event.target.value)} />
        </label>
        <label className="field">
          Réponse
          <input value={answer} onChange={(event) => setAnswer(event.target.value)} />
        </label>
        <button className="primary-button" type="button" onClick={addCard}>
          Ajouter
        </button>
      </div>
      <div className="table-like">
        {cards.length ? (
          cards.map((card) => (
            <button
              className="tool-card"
              type="button"
              key={card.id}
              onClick={() => setRevealedId((current) => (current === card.id ? null : card.id))}
            >
              <strong>{card.question}</strong>
              <span>{revealedId === card.id ? card.answer : 'Cliquer pour révéler la réponse.'}</span>
            </button>
          ))
        ) : (
          <div className="empty-state">Aucune fiche pour le moment.</div>
        )}
      </div>
    </div>
  );
}
