import { useState } from 'react';
import './askAI.css';

const DEFAULT_SUGGESTIONS = [
  'Tee mulle lukusuunnitelma viikoks',
  'Onko aikataulussani konflikteja?',
];

export function AskAI({ onAsk, suggestions = DEFAULT_SUGGESTIONS, headline }) {
  const [v, setV] = useState('');

  const submit = (q) => {
    const t = (q ?? v).trim();
    if (!t) return;
    onAsk?.(t);
    setV('');
  };

  return (
    <section className="pb-lg pb-w-ask">
      <div className="pb-w-ask-label">Kysy mentorilta</div>
      <div className="pb-w-ask-title">
        {headline?.before}<em>{headline?.em || 'Mistä aloitat?'}</em>{headline?.after}
      </div>
      <div className="pb-suggest">
        {suggestions.map((s, i) => (
          <button key={i} className="pb-sugg-chip" onClick={() => submit(s)}>{s}</button>
        ))}
      </div>
      <div className="pb-ask-input">
        <input
          type="text"
          inputMode="text"
          placeholder="Kysy mitä tahansa…"
          value={v}
          onChange={e => setV(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        />
        <button className="pb-ask-send" onClick={() => submit()} aria-label="Lähetä">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
