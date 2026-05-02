import { useState, useEffect, useRef } from 'react';
import ICAL from 'ical.js';
import { supabase } from '../../../utils/supabase';

const CATEGORY_OPTIONS = [
  ['hobby', 'Harrastus'],
  ['sport', 'Treeni'],
  ['work', 'Työ'],
];

export function Step3Calendar({ user, onNext, onBack }) {
  const fileRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [manual, setManual] = useState({ title: '', day: 'Ma', start: '17:00', end: '19:00', category: 'sport' });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('external_events')
        .select('id, title, starts_at, ends_at, source, category')
        .eq('user_id', user.id)
        .order('starts_at', { ascending: true })
        .limit(50);
      if (!cancelled) setEvents(data || []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleIcs = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImporting(true); setError(null);

    try {
      const text = await file.text();
      const jcal = ICAL.parse(text);
      const comp = new ICAL.Component(jcal);
      const rows = comp.getAllSubcomponents('vevent').slice(0, 200).map(v => {
        const ev = new ICAL.Event(v);
        return {
          user_id: user.id,
          source: 'ics',
          title: ev.summary || '(nimetön)',
          starts_at: ev.startDate.toJSDate().toISOString(),
          ends_at: ev.endDate.toJSDate().toISOString(),
          rrule: v.getFirstPropertyValue('rrule')?.toString() ?? null,
          category: 'hobby',
        };
      });
      if (rows.length === 0) {
        setError('Tiedostosta ei löytynyt tapahtumia.');
      } else {
        const { error: insErr } = await supabase.from('external_events').insert(rows);
        if (insErr) setError(insErr.message);
        else {
          const { data } = await supabase
            .from('external_events')
            .select('id, title, starts_at, ends_at, source, category')
            .eq('user_id', user.id)
            .order('starts_at', { ascending: true })
            .limit(50);
          setEvents(data || []);
        }
      }
    } catch (err) {
      setError(err.message || 'ICS-tiedoston luku epäonnistui.');
    }
    setImporting(false);
  };

  const addManual = async () => {
    if (!manual.title.trim() || !user) return;
    const today = new Date();
    const dayMap = { Ma: 1, Ti: 2, Ke: 3, To: 4, Pe: 5, La: 6, Su: 0 };
    const target = new Date(today);
    const offset = (dayMap[manual.day] - today.getDay() + 7) % 7;
    target.setDate(today.getDate() + offset);
    const [sh, sm] = manual.start.split(':').map(Number);
    const [eh, em] = manual.end.split(':').map(Number);
    const starts = new Date(target); starts.setHours(sh, sm, 0, 0);
    const ends = new Date(target); ends.setHours(eh, em, 0, 0);

    const { error: insErr } = await supabase.from('external_events').insert({
      user_id: user.id,
      source: 'manual',
      title: manual.title.trim(),
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      rrule: 'FREQ=WEEKLY',
      category: manual.category,
    });
    if (insErr) { setError(insErr.message); return; }
    setManual({ ...manual, title: '' });
    const { data } = await supabase
      .from('external_events').select('id, title, starts_at, ends_at, source, category')
      .eq('user_id', user.id).order('starts_at', { ascending: true }).limit(50);
    setEvents(data || []);
  };

  const remove = async (id) => {
    await supabase.from('external_events').delete().eq('id', id);
    setEvents(events.filter(e => e.id !== id));
  };

  return (
    <div style={panelStyle}>
      <h2 className="fr" style={titleStyle}>Kalenteri & harrastukset</h2>
      <p style={leadStyle}>
        Lisää treenit ja harrastukset ICS-tiedostosta tai käsin. AI varaa lukuajat näiden ulkopuolelta.
      </p>

      <input ref={fileRef} type="file" accept=".ics,text/calendar" onChange={handleIcs} style={{ display: 'none' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
        style={uploadBtnStyle(importing)}
      >
        {importing ? 'IMPORTOIDAAN…' : 'IMPORTOI ICS-TIEDOSTOSTA'}
      </button>

      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '14px 16px', marginBottom: 16,
      }}>
        <p style={{ fontSize: 11, color: '#a09c98', marginBottom: 10, letterSpacing: '0.04em' }}>LISÄÄ MANUAALISESTI</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            value={manual.title}
            onChange={e => setManual({ ...manual, title: e.target.value })}
            placeholder="Esim. Jääkiekko"
            style={smallInputStyle}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={manual.day} onChange={e => setManual({ ...manual, day: e.target.value })} style={{ ...smallInputStyle, flex: 1 }}>
              {['Ma','Ti','Ke','To','Pe','La','Su'].map(d => <option key={d} value={d} style={{ background: '#0a0820' }}>{d}</option>)}
            </select>
            <input type="time" value={manual.start} onChange={e => setManual({ ...manual, start: e.target.value })} style={{ ...smallInputStyle, flex: 1 }} />
            <input type="time" value={manual.end} onChange={e => setManual({ ...manual, end: e.target.value })} style={{ ...smallInputStyle, flex: 1 }} />
          </div>
          <select value={manual.category} onChange={e => setManual({ ...manual, category: e.target.value })} style={smallInputStyle}>
            {CATEGORY_OPTIONS.map(([v, l]) => <option key={v} value={v} style={{ background: '#0a0820' }}>{l}</option>)}
          </select>
          <button
            onClick={addManual}
            disabled={!manual.title.trim()}
            style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.11)',
              background: manual.title.trim() ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
              color: manual.title.trim() ? '#f0ede8' : '#605c58',
              fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif",
              cursor: manual.title.trim() ? 'pointer' : 'default',
            }}
          >Lisää</button>
        </div>
      </div>

      {events.length > 0 && (
        <div style={{ marginBottom: 16, maxHeight: 220, overflowY: 'auto' }}>
          <p style={{ fontSize: 11, color: '#a09c98', marginBottom: 8, letterSpacing: '0.04em' }}>
            TALLENNETUT TAPAHTUMAT ({events.length})
          </p>
          {events.map(ev => (
            <div key={ev.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 10px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 6,
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#f0ede8' }}>{ev.title}</div>
                <div style={{ fontSize: 10, color: '#605c58' }}>
                  {new Date(ev.starts_at).toLocaleString('fi-FI', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} · {ev.source}
                </div>
              </div>
              <button onClick={() => remove(ev.id)} style={{
                background: 'none', border: 'none', color: '#605c58', cursor: 'pointer', fontSize: 12,
              }}>×</button>
            </div>
          ))}
        </div>
      )}

      {error && <p style={errorStyle}>{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={backBtnStyle}>← EDELLINEN</button>
        <button onClick={onNext} style={nextBtnStyle}>SEURAAVA →</button>
      </div>
    </div>
  );
}

const panelStyle = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 24, padding: '32px 28px',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
};
const titleStyle = { fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 };
const leadStyle = { fontSize: 13, color: '#a09c98', marginBottom: 18, lineHeight: 1.5 };
const errorStyle = { fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 };
const smallInputStyle = {
  padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.11)',
  background: 'rgba(255,255,255,0.04)', color: '#f0ede8', fontSize: 12,
  fontFamily: "'Inter', sans-serif", outline: 'none',
};
const uploadBtnStyle = (importing) => ({
  width: '100%', padding: '14px 20px', borderRadius: 13, border: '1px dashed rgba(255,255,255,0.18)',
  background: importing ? 'rgba(255,255,255,0.04)' : 'rgba(120,90,255,0.10)',
  color: '#d4cfc8', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
  cursor: importing ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
  marginBottom: 14,
});
const backBtnStyle = {
  flex: '0 0 auto', padding: '12px 18px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.11)',
  background: 'transparent', color: '#a09c98',
  fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
};
const nextBtnStyle = {
  flex: 1, padding: '12px 20px', borderRadius: 13, border: 'none',
  background: 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
  color: 'rgba(8,6,22,0.90)',
  fontSize: 12, fontWeight: 700, letterSpacing: '0.07em',
  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  boxShadow: '0 6px 24px rgba(200,180,255,0.24)',
};
