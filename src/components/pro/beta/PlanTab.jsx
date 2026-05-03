import { useCallback, useEffect, useState } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../../utils/supabase';
import { currentSchoolYear } from '../../../utils/year';

const FI_DAYS = { Ma: 'Ma', Ti: 'Ti', Ke: 'Ke', To: 'To', Pe: 'Pe', La: 'La', Su: 'Su' };

function WeekCard({ week }) {
  const { week_no, sessions = [] } = week;
  if (!sessions.length) return null;
  return (
    <div style={{
      borderRadius: 14,
      background: 'var(--pb-glass-bg)',
      border: '1px solid var(--pb-glass-bd)',
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pb-ink-f)', textTransform: 'uppercase', marginBottom: 10 }}>
        Viikko {week_no}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sessions.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              flexShrink: 0, width: 36, textAlign: 'right',
              fontSize: 10, fontWeight: 600, color: 'var(--pb-accent)',
              paddingTop: 2,
            }}>{FI_DAYS[s.day] || s.day}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--pb-ink)' }}>
                {s.course_code}
                <span style={{ fontWeight: 400, color: 'var(--pb-ink-s)', marginLeft: 6 }}>{s.topic}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--pb-ink-f)', marginTop: 1 }}>
                {s.time} · {s.duration_min} min
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlanTab() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    const { data } = await supabase
      .from('study_plans')
      .select('id, status, ai_recommendation, school_year')
      .eq('user_id', session.user.id)
      .eq('school_year', currentSchoolYear())
      .maybeSingle();

    setPlan(data || null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = useCallback(async () => {
    if (!plan?.id) return;
    setGenerating(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Kirjautuminen vaaditaan.');
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/generate-study-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ study_plan_id: plan.id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Virhe ${res.status}`);
      }
      await load();
    } catch (err) {
      setError(err.message || 'Tuntematon virhe.');
    } finally {
      setGenerating(false);
    }
  }, [plan, load]);

  if (loading) {
    return <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 12, color: 'var(--pb-ink-f)' }}>Ladataan…</div>;
  }

  if (!plan) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--pb-ink-s)', lineHeight: 1.6, marginBottom: 16 }}>
          Suunnitelmaa ei löydy tälle lukuvuodelle.<br/>
          Käy ensin <a href="#/onboarding" style={{ color: 'var(--pb-accent)' }}>perehdytys</a> läpi.
        </div>
      </div>
    );
  }

  const weeks = plan.ai_recommendation?.weeks;

  if (!weeks?.length) {
    return (
      <div style={{ padding: '16px 0' }}>
        <p style={{ fontSize: 12, color: 'var(--pb-ink-s)', lineHeight: 1.6, marginBottom: 20 }}>
          AI-opiskelusuunnitelma luo henkilökohtaisen viikoittaisen aikataulun kurssiesi, kirjojesi ja kalenterisi perusteella.
        </p>
        {error && (
          <p style={{ fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, lineHeight: 1.5 }}>
            {error}
          </p>
        )}
        <button
          onClick={generate}
          disabled={generating}
          style={{
            width: '100%', padding: '13px 20px', borderRadius: 13, border: 'none',
            background: generating ? 'rgba(200,195,210,0.12)' : 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
            color: generating ? 'var(--pb-ink-f)' : 'rgba(8,6,22,0.90)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            cursor: generating ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: generating ? 'none' : '0 4px 20px rgba(200,180,255,0.18)',
            transition: 'all 0.14s',
          }}
        >
          {generating ? 'Luodaan suunnitelmaa…' : 'LUO AI-OPISKELUSUUNNITELMA'}
        </button>
      </div>
    );
  }

  // Show the current week and future weeks only
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeekNo = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  const upcomingWeeks = weeks.filter(w => w.week_no >= currentWeekNo);
  const displayWeeks = upcomingWeeks.length ? upcomingWeeks : weeks.slice(0, 4);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pb-ink-f)', textTransform: 'uppercase' }}>
          Opiskelusuunnitelma · {plan.school_year}
        </div>
        <button
          onClick={generate}
          disabled={generating}
          style={{
            background: 'none', border: 'none', fontSize: 10, color: 'var(--pb-ink-f)',
            cursor: generating ? 'default' : 'pointer', fontFamily: 'inherit',
            textDecoration: 'underline', textUnderlineOffset: 3, padding: 0,
          }}
        >
          {generating ? 'Päivitetään…' : 'Päivitä'}
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, lineHeight: 1.5 }}>
          {error}
        </p>
      )}
      {displayWeeks.map(w => <WeekCard key={w.week_no} week={w}/>)}
      {upcomingWeeks.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--pb-ink-f)', textAlign: 'center', marginTop: 8 }}>
          Kaikki suunnitellut viikot on käyty läpi. Päivitä suunnitelma saadaksesi lisää.
        </p>
      )}
    </div>
  );
}
