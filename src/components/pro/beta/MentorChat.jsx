import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { isDemoActive } from '../../../utils/demo';
import { mockChatReply } from '../../../utils/proMockData';
import { callProxy, buildScheduleContext } from '../proAi';
import { triageMessage, fetchCourseContext, loadConversation, saveConversation } from '../proTriage';

export function MentorChat({ school, schedule, seedQuestion, onSeedConsumed }) {
  const [messages, setMessages] = useState(() => ([
    { role: 'mentor-hello', text: 'Hei! Olen mentor. Kysy kursseista, kokeista tai lukusuunnitelmasta.' },
  ]));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const demo = isDemoActive();

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      setUserId(session.user.id);
      const existing = await loadConversation(session.user.id, 'general');
      if (cancelled) return;
      if (existing?.messages?.length) {
        setMessages([
          { role: 'mentor-hello', text: 'Hei! Jatketaan siitä mihin viimeksi jäit.' },
          ...existing.messages,
        ]);
        setConversationId(existing.id);
      }
    })();
    return () => { cancelled = true; };
  }, [demo]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const updated = [...messages, { role: 'me', text: q, ts: Date.now() }];
    setMessages(updated);
    setInput('');
    setBusy(true);

    if (demo) {
      setTimeout(() => {
        setMessages(m => [...m, { role: 'ai', text: mockChatReply(q), ts: Date.now() }]);
        setBusy(false);
      }, 600);
      return;
    }

    try {
      const triage = userId ? await triageMessage(q) : null;
      const baseCtx = buildScheduleContext(school, schedule?.selections, schedule?.year) || '';
      const courseCtx = userId && triage?.course_code
        ? await fetchCourseContext(userId, triage.course_code)
        : '';
      const ctx = [baseCtx, courseCtx, triage?.intent ? `Aikomus: ${triage.intent}` : '']
        .filter(Boolean).join('\n\n');

      const { content } = await callProxy(q, ctx || null);
      const next = [...updated, { role: 'ai', text: content, ts: Date.now() }];
      setMessages(next);

      if (userId) {
        const persistMessages = next.filter(m => m.role === 'me' || m.role === 'ai');
        const cid = await saveConversation(userId, conversationId, persistMessages, 'general');
        if (cid && cid !== conversationId) setConversationId(cid);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: `Virhe: ${err.message || 'tuntematon'}`, ts: Date.now() }]);
    } finally {
      setBusy(false);
    }
  };

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
