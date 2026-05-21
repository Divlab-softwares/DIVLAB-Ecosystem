import { useEffect, useState } from 'react';

type Todo = { id: number; label: string; done: boolean };
const storageKey = 'divlab-todos';

export function TodoListTool() {
  const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem(storageKey) || '[]') as Todo[]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [todos]);

  function addTodo() {
    if (!label.trim()) return;
    setTodos((current) => [{ id: Date.now(), label: label.trim(), done: false }, ...current]);
    setLabel('');
  }

  return (
    <div className="tool-body">
      <div className="helper-note">Liste rapide sauvegardee dans ce navigateur pour suivre les petites actions du jour.</div>
      <div className="form-row">
        <label className="field">Nouvelle tache<input value={label} onChange={(event) => setLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addTodo()} /></label>
        <button className="primary-button" type="button" onClick={addTodo}>Ajouter</button>
      </div>
      <div className="table-like">
        {todos.length ? todos.map((todo) => (
          <label className="check-row" key={todo.id}>
            <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => current.map((item) => item.id === todo.id ? { ...item, done: !item.done } : item))} />
            <span>{todo.label}</span>
            <button className="danger-button" type="button" onClick={() => setTodos((current) => current.filter((item) => item.id !== todo.id))}>Supprimer</button>
          </label>
        )) : <div className="empty-state">Aucune tache pour le moment.</div>}
      </div>
    </div>
  );
}
