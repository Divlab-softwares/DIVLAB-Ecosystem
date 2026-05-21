import { useState } from 'react';

export function RandomPickerTool() {
  const [items, setItems] = useState('Design\nDeveloppement\nMarketing\nFinance');
  const [picked, setPicked] = useState('');

  function pick() {
    const list = items.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    setPicked(list.length ? list[Math.floor(Math.random() * list.length)] : '');
  }

  return (
    <div className="tool-body">
      <div className="helper-note">Choisit un element au hasard dans une liste: idees, noms, gagnants, priorites ou options.</div>
      <textarea value={items} onChange={(event) => setItems(event.target.value)} />
      <button className="primary-button" type="button" onClick={pick}>Choisir au hasard</button>
      <div className="metric"><strong>{picked || 'Aucun choix'}</strong><span>Resultat</span></div>
    </div>
  );
}
