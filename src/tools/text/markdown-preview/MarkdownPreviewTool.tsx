import { useMemo, useState } from 'react';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br />');
}

export function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState('# Titre DIVLAB\n\nTexte avec **gras**, *italique* et `code`.');
  const html = useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <div className="tool-body two-column">
      <div className="panel">
        <div className="helper-note">Apercu rapide Markdown pour notes simples: titres, gras, italique et code inline.</div>
        <textarea value={markdown} onChange={(event) => setMarkdown(event.target.value)} />
      </div>
      <div className="preview-box markdown-preview" dangerouslySetInnerHTML={{ __html: html || 'Apercu Markdown' }} />
    </div>
  );
}
