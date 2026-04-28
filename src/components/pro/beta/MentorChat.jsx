import { useEffect, useRef, useState } from 'react';
import { callProxy, buildScheduleContext } from '../proAi';

export function MentorChat({ school, schedule, seedQuestion, onSeedConsumed }) {
  const [messages, setMessages] = useState(() => ([
    { role: 'mentor-hello', text: 'Hei! Olen mentor. Kysy kursseista, kokeista tai lukusuunnitelmasta.' },
  ]));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setMessages(m => [...m, { role: 'me', text: q }]);
    setInput('');
    setBusy(true);
    try {
      const ctx = buildScheduleContext(school, schedule?.selections, schedule?.year);
      const { content } = await callProxy(q, ctx);
      setMessages(m => [...m, { role: 'ai', text: content }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: `Virhe: ${err.message || 'tuntematon'}` }]);
    } finally {
      setBusy(false);
    }
  };

  // Consume a seed question coming from the AskAI widget
  useEffect(() => {
    if (seedQuestion) {
      send(seedQuestion);
      onSeedConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuestion]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  return (
    <div className="pb-mentor">
      <div className="pb-chat" ref={scrollRef}>
        {messages.map((m, i) => {
          if (m.role === 'mentor-hello') {
            return (
              <div key={i} className="pb-mentor-hello">
                <div className="pb-mentor-role">Mentor</div>
                <div className="pb-mentor-msg">{m.text}</div>
              </div>
            );
          }
          return (
            <div key={i} className={`pb-bub pb-bub-${m.role}`}>{m.text}</div>
          );
        })}
        {busy && <div className="pb-bub pb-bub-ai pb-bub-typing">Ajattelen…</div>}
      </div>
      <form className="pb-mentor-input" onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          type="text"
          placeholder="Kysy tai kerro tehtävistä…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="pb-mentor-send" aria-label="Lähetä" disabled={busy || !input.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
