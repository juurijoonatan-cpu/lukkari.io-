import { useEffect, useRef, useState } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../../utils/supabase';
import { isDemoActive } from '../../../utils/demo';
import { mockChatReply } from '../../../utils/proMockData';
import { callProxy, buildScheduleContext } from '../proAi';
import { triageMessage, fetchCourseContext, loadConversation, saveConversation } from '../proTriage';

const HISTORY_LIMIT = 6;

function toHistory(messages) {
  return messages
    .filter(m => m.role === 'me' || m.role === 'ai')
    .slice(-HISTORY_LIMIT)
    .map(m => ({ role: m.role === 'me' ? 'user' : 'assistant', content: m.text }));
}

async function uploadNote(userId, file, courseCode) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeCode = (courseCode || 'note').replace(/[^A-Z0-9]/gi, '').toUpperCase() || 'NOTE';
  const path = `${userId}/${safeCode}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('notes').upload(path, file, { contentType: file.type });
  if (upErr) throw new Error(upErr.message);
  return path;
}

async function callIngestNote(path, courseCode) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/ingest-note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ image_path: path, course_code: courseCode || null }),
  });
  if (!res.ok) return null;
  return res.json();
}

export function MentorChat({ school, schedule, seedQuestion, onSeedConsumed }) {
  const [messages, setMessages] = useState(() => ([
    { role: 'mentor-hello', text: 'Hei! Olen mentor. Kysy kursseista, kokeista tai lähetä muistiinpanon kuva — autan tarkistamaan ja kertaamaan.' },
  ]));
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
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
    if ((!q && !pendingFile) || busy) return;

    const captionedText = q || (pendingFile ? `[muistiinpanon kuva: ${pendingFile.name}]` : '');
    const updated = [...messages, { role: 'me', text: captionedText, ts: Date.now() }];
    setMessages(updated);
    setInput('');
    setBusy(true);

    if (demo) {
      setPendingFile(null);
      setTimeout(() => {
        setMessages(m => [...m, { role: 'ai', text: mockChatReply(q), ts: Date.now() }]);
        setBusy(false);
      }, 600);
      return;
    }

    try {
      const triage = userId ? await triageMessage(q, !!pendingFile) : null;

      let noteHint = '';
      if (pendingFile && userId) {
        try {
          const path = await uploadNote(userId, pendingFile, triage?.course_code);
          const ingest = await callIngestNote(path, triage?.course_code);
          if (ingest?.ocr_text) {
            noteHint = `Käyttäjän juuri lähettämä muistiinpano (OCR):\n${ingest.ocr_text}\nAiheet: ${(ingest.topics || []).join(', ') || '—'}`;
          }
        } catch (err) {
          noteHint = `(muistiinpanon ingestio epäonnistui: ${err.message})`;
        }
        setPendingFile(null);
      }

      const baseCtx = buildScheduleContext(school, schedule?.selections, schedule?.year) || '';
      const courseCtx = userId && triage?.course_code
        ? await fetchCourseContext(userId, triage.course_code)
        : '';
      const ctx = [baseCtx, courseCtx, noteHint].filter(Boolean).join('\n\n');

      const { content } = await callProxy(q || 'Tarkista oheinen muistiinpano.', ctx || null, {
        triage,
        history: toHistory(messages),
      });

      const next = [...updated, { role: 'ai', text: content, ts: Date.now() }];
      setMessages(next);

      if (userId) {
        const persistMessages = next.filter(m => m.role === 'me' || m.role === 'ai');
        const cid = await saveConversation(userId, conversationId, persistMessages, 'general');
        if (cid && cid !== conversationId) setConversationId(cid);
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: `Virhe: ${err.message || 'tuntematon'}`, ts: Date.now() }]);
      setPendingFile(null);
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

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setPendingFile(f);
    if (fileRef.current) fileRef.current.value = '';
  };

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

      {pendingFile && (
        <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--ink-s, #a09c98)' }}>
          Liitteenä: {pendingFile.name}{' '}
          <button onClick={() => setPendingFile(null)} style={{ background: 'none', border: 'none', color: '#605c58', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <form className="pb-mentor-input" onSubmit={e => { e.preventDefault(); send(); }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickFile}
          disabled={busy || demo}
          style={{ display: 'none' }}
        />
        {!demo && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            aria-label="Liitä muistiinpanon kuva"
            style={{
              background: 'none', border: 'none', color: '#605c58', cursor: busy ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', padding: '0 8px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 1 1-8.48-8.48l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
        )}
        <input
          type="text"
          placeholder={pendingFile ? 'Kerro mihin liittyy (esim. yh05)…' : 'Kysy tai kerro tehtävistä…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy}
        />
        <button type="submit" className="pb-mentor-send" aria-label="Lähetä" disabled={busy || (!input.trim() && !pendingFile)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
