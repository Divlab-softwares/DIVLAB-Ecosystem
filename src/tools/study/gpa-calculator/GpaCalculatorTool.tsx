import { useMemo, useState } from 'react';

type Course = { id: number; name: string; grade: string; credits: number };
const points: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

export function GpaCalculatorTool() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: 'Projet', grade: 'A', credits: 3 },
    { id: 2, name: 'Analyse', grade: 'B', credits: 4 },
  ]);
  const gpa = useMemo(() => {
    const credits = courses.reduce((sum, item) => sum + item.credits, 0);
    const score = courses.reduce((sum, item) => sum + points[item.grade] * item.credits, 0);
    return credits ? score / credits : 0;
  }, [courses]);

  function update(id: number, patch: Partial<Course>) {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, ...patch } : course));
  }

  return (
    <div className="tool-body">
      <div className="helper-note">Calcule un GPA simple sur 4.0 a partir des notes A, B, C, D et F.</div>
      {courses.map((course) => (
        <div className="form-row" key={course.id}>
          <label className="field">Cours<input value={course.name} onChange={(event) => update(course.id, { name: event.target.value })} /></label>
          <label className="field">Note<select value={course.grade} onChange={(event) => update(course.id, { grade: event.target.value })}>{Object.keys(points).map((grade) => <option key={grade}>{grade}</option>)}</select></label>
          <label className="field">Credits<input type="number" min="0" value={course.credits} onChange={(event) => update(course.id, { credits: Number(event.target.value) })} /></label>
        </div>
      ))}
      <button className="secondary-button" type="button" onClick={() => setCourses((current) => [...current, { id: Date.now(), name: '', grade: 'A', credits: 1 }])}>Ajouter un cours</button>
      <div className="metric"><strong>{gpa.toFixed(2)} / 4.00</strong><span>GPA estime</span></div>
    </div>
  );
}
