import { useState, useEffect } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../../utils/supabase';
import { currentSchoolYear } from '../../../utils/year';

export function Step5Review({ user, draft, onBack, onFinish }) {
  const [generating, setGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [planId, setPlanId] = useState(draft.study_plan_id || null);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ courses: 0, books: 0, events: 0 });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [{ data: plan }, { count: bookCount }, { count: eventCount }] = await Promise.all([
        supabase.from('study_plans')
          .select('id, ai_recommendation')
          .eq('user_id', user.id)
          .eq('school_year', currentSchoolYear())
          .maybeSingle(),
        supabase.from('book_tocs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('external_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      if (cancelled) return;
      if (plan) {
        setPlanId(plan.id);
        if (plan.ai_recommendation) setRecommendation(plan.ai_recommendation);
      }
      const courseQuery = plan
        ? await supabase.from('courses').select('id', { count: 'exact', head: true }).eq('study_plan_id', plan.id)
        : { count: 0 };
      if (cancelled) return;
      setCounts({
        courses: courseQuery.count ?? 0,
        books: bookCount ?? 0,
        events: eventCount ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, [user]);

  const generate = async () => {
    if (generating) return;
    if (!planId) { setError('Suunnitelmaa ei ole vielä tallennettu — palaa askeleeseen 1.'); return; }
    setGenerating(true); setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/generate-study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ study_plan_id: planId }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error === 'rate_limit' ? 'Kuukausiraja täynnä (10/kk).' : `Generointi epäonnistui (${res.status})`);
      setGenerating(false);
      return;
    }

    const body = await res.json();
    setRecommendation(body.recommendation);
    await supabase.from('profiles').update({
      onboarded_at: new Date().toISOString(),
    }).eq('id', user.id);
    setGenerating(false);
  };

  return (
    <div style={panelStyle}>
      <h2 className="fr" style={titleStyle}>Yhteenveto & generointi</h2>
      <p style={leadStyle}>
        Tarkasta tiedot ja generoi viikoittainen lukusuunnitelma. AI yhdistää lukujärjestyksen, kirjat ja kalenterit.
      </p>

      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginBottom: 22 }}>
        <dt style={dtStyle}>NIMI</dt>
        <dd style={ddStyle}>{draft.full_name || '—'}</dd>
        <dt style={dtStyle}>LUKIOLUOKKA</dt>
        <dd style={ddStyle}>{draft.grade || '—'}</dd>
        <dt style={dtStyle}>KOULU</dt>
        <dd style={ddStyle}>{draft.school_id || '—'}</dd>
        <dt style={dtStyle}>YO-VALMISTUMINEN</dt>
        <dd style={ddStyle}>{draft.graduation_target || '—'}</dd>
        <dt style={dtStyle}>KURSSEJA / KIRJOJA / TAPAHTUMIA</dt>
        <dd style={ddStyle}>{counts.courses} / {counts.books} / {counts.events}</dd>
      </dl>

      {recommendation ? (
        <div style={{
          background: 'rgba(120,90,255,0.06)',
          border: '1px solid rgba(120,90,255,0.20)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 18,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(180,160,255,0.85)', marginBottom: 8 }}>
            Suunnitelma valmis ({recommendation.weeks?.length || 0} viikkoa).
          </p>
          {recommendation.weeks?.slice(0, 2).map(w => (
            <div key={w.week_no} style={{ fontSize: 11, color: '#a09c98', marginBottom: 4 }}>
              Vk {w.week_no}: {w.sessions?.length || 0} sessiota
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={generating}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 13, border: 'none',
            background: generating
              ? 'rgba(200,195,210,0.12)'
              : 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
            color: generating ? '#a09c98' : 'rgba(8,6,22,0.90)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.07em',
            cursor: generating ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
            boxShadow: generating ? 'none' : '0 6px 24px rgba(200,180,255,0.24)',
            marginBottom: 14,
          }}
        >
          {generating ? 'GENEROIDAAN…' : 'GENEROI LUKUSUUNNITELMA'}
        </button>
      )}

      {error && <p style={errorStyle}>{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} disabled={generating} style={backBtnStyle}>← EDELLINEN</button>
        <button
          onClick={onFinish}
          disabled={generating}
          style={{
            ...nextBtnStyle,
            opacity: recommendation ? 1 : 0.7,
          }}
        >
          {recommendation ? 'SIIRRY PRO-NÄKYMÄÄN →' : 'OHITA & SIIRRY →'}
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
const dtStyle = { fontSize: 11, color: '#605c58', letterSpacing: '0.04em' };
const ddStyle = { fontSize: 13, color: '#f0ede8', margin: 0 };
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
