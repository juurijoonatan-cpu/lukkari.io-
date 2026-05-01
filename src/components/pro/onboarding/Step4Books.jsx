import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../../utils/supabase';

export function Step4Books({ user, onNext, onBack }) {
  const [tocs, setTocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const [pendingCode, setPendingCode] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('book_tocs')
        .select('id, course_code, parsed, image_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!cancelled) setTocs(data || []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true); setError(null);

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const cc = pendingCode.trim().toUpperCase().replace(/\s+/g, '') || `book-${Date.now()}`;
    const path = `${user.id}/${cc}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('book-tocs').upload(path, file, { contentType: file.type });
    if (upErr) { setError(upErr.message); setUploading(false); return; }

    const { data: row, error: insErr } = await supabase.from('book_tocs').insert({
      user_id: user.id,
      course_code: pendingCode.trim() || null,
      image_path: path,
    }).select('id').single();

    if (insErr) { setError(insErr.message); setUploading(false); return; }

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/parse-book-toc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ book_toc_id: row.id }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === 'rate_limit' ? 'Kuukausiraja täynnä' : `Parsinta epäonnistui (${res.status})`);
    } else {
      const body = await res.json();
      const next = await supabase
        .from('book_tocs').select('id, course_code, parsed, image_path')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setTocs(next.data || []);
      setPendingCode('');
      // body.parsed referenced for future linking step
      void body;
    }

    if (fileRef.current) fileRef.current.value = '';
    setUploading(false);
  };

  return (
    <div style={panelStyle}>
      <h2 className="fr" style={titleStyle}>Kirjojen sisällysluettelot</h2>
      <p style={leadStyle}>
        Kuvaa kunkin kurssikirjan sisällysluettelo. AI käyttää lukuja tarkkojen kertaussessioiden luomiseen.
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={pendingCode}
          onChange={e => setPendingCode(e.target.value)}
          placeholder="Kurssikoodi, esim. YH1"
          style={inputStyle}
        />
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={upload} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.11)',
            background: uploading ? 'rgba(255,255,255,0.04)' : 'rgba(120,90,255,0.14)',
            color: uploading ? '#605c58' : '#d4cfc8',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
            cursor: uploading ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap',
          }}
        >
          {uploading ? 'PARSITAAN…' : 'LATAA KUVA'}
        </button>
      </div>

      {tocs.length > 0 && (
        <div style={{ marginBottom: 18, maxHeight: 240, overflowY: 'auto' }}>
          {tocs.map(toc => {
            const chapters = toc.parsed?.chapters || [];
            return (
              <div key={toc.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ede8' }}>
                    {toc.course_code || '—'} · {toc.parsed?.title || 'Ilman otsikkoa'}
                  </span>
                  <span style={{ fontSize: 10, color: '#605c58' }}>{chapters.length} lukua</span>
                </div>
                {chapters.length > 0 && (
                  <p style={{ fontSize: 11, color: '#a09c98', marginTop: 6 }}>
                    {chapters.slice(0, 4).map(c => `${c.num}. ${c.title}`).join(' · ')}
                    {chapters.length > 4 ? ` · +${chapters.length - 4}` : ''}
                  </p>
                )}
              </div>
            );
          })}
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
const leadStyle = { fontSize: 13, color: '#a09c98', marginBottom: 22, lineHeight: 1.5 };
const errorStyle = { fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 };
const inputStyle = {
  flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.11)',
  background: 'rgba(255,255,255,0.04)', color: '#f0ede8', fontSize: 12,
  fontFamily: "'Inter', sans-serif", outline: 'none',
};
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
