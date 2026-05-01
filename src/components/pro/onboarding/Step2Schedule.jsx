import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../../utils/supabase';
import { currentSchoolYear } from '../../../utils/year';

export function Step2Schedule({ user, draft, setDraft, onNext, onBack }) {
  const fileRef = useRef(null);
  const [planId, setPlanId] = useState(draft.study_plan_id || null);
  const [parsed, setParsed] = useState(draft.schedule_parsed || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || planId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('study_plans')
        .select('id, schedule_parsed')
        .eq('user_id', user.id)
        .eq('school_year', currentSchoolYear())
        .maybeSingle();
      if (cancelled || !data) return;
      setPlanId(data.id);
      if (data.schedule_parsed) setParsed(data.schedule_parsed);
    })();
    return () => { cancelled = true; };
  }, [user, planId]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true); setError(null);

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${user.id}/${currentSchoolYear()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('schedules').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) { setError(upErr.message); setUploading(false); return; }

    let activePlanId = planId;
    if (!activePlanId) {
      const { data: row, error: pErr } = await supabase.from('study_plans').upsert({
        user_id: user.id,
        school_year: currentSchoolYear(),
        schedule_image_path: path,
        status: 'draft',
      }, { onConflict: 'user_id,school_year' }).select('id').single();
      if (pErr) { setError(pErr.message); setUploading(false); return; }
      activePlanId = row.id;
      setPlanId(activePlanId);
    } else {
      await supabase.from('study_plans')
        .update({ schedule_image_path: path })
        .eq('id', activePlanId);
    }

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/parse-schedule-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ study_plan_id: activePlanId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === 'rate_limit' ? 'Kuukausiraja täynnä' : `Parsinta epäonnistui (${res.status})`);
      setUploading(false);
      return;
    }

    const body = await res.json();
    setParsed(body.parsed);
    setDraft({ ...draft, study_plan_id: activePlanId, schedule_parsed: body.parsed });
    setUploading(false);
  };

  return (
    <div style={panelStyle}>
      <h2 className="fr" style={titleStyle}>Lukujärjestys-kuva</h2>
      <p style={leadStyle}>
        Ota tai lataa kuva oman koulusi tuntikiertokaaviosta. AI tunnistaa palkit ja periodit automaattisesti.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        style={{
          width: '100%', padding: '14px 20px', borderRadius: 13, border: '1px dashed rgba(255,255,255,0.18)',
          background: uploading ? 'rgba(255,255,255,0.04)' : 'rgba(120,90,255,0.10)',
          color: '#d4cfc8', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
          cursor: uploading ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
          marginBottom: 16,
        }}
      >
        {uploading ? 'PARSITAAN…' : (parsed ? 'KORVAA KUVA' : 'KUVAA TAI LATAA KUVA')}
      </button>

      {parsed && (
        <div style={{
          background: 'rgba(120,90,255,0.06)',
          border: '1px solid rgba(120,90,255,0.20)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 18,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(180,160,255,0.85)', marginBottom: 8 }}>
            Tunnistettu: {parsed.name || '—'} · {parsed.palkkiCount} palkkia · {parsed.periodCount || parsed.rotation?.length || '?'} jaksoa
          </p>
          {Array.isArray(parsed.rotation) && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${parsed.days?.length || 5}, 1fr)`, gap: 4, fontSize: 11, color: '#a09c98' }}>
              {parsed.days?.map(d => <div key={d} style={{ textAlign: 'center', fontWeight: 600 }}>{d}</div>)}
              {parsed.rotation.flatMap((row, i) =>
                row.map((cell, j) => (
                  <div key={`${i}-${j}`} style={{
                    background: cell ? 'rgba(255,255,255,0.06)' : 'transparent',
                    borderRadius: 6, padding: 4, textAlign: 'center',
                    color: cell ? '#f0ede8' : '#605c58',
                  }}>{cell ?? '–'}</div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={errorStyle}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={backBtnStyle}>← EDELLINEN</button>
        <button onClick={onNext} style={nextBtnStyle}>
          {parsed ? 'SEURAAVA →' : 'HYPPÄÄ YLI →'}
        </button>
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
