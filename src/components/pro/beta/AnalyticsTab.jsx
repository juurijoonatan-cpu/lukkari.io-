import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';

const INTENT_LABELS = {
  review:    'Kertaus',
  study:     'Opiskelu',
  explain:   'Selitys',
  schedule:  'Aikataulu',
  summarize: 'Tiivistelmä',
  exam:      'Koe',
  other:     'Muu',
};

const INTENT_COLOR = {
  review:    '#7b6cf6',
  study:     '#4fa3e8',
  explain:   '#f0c040',
  schedule:  '#5cce8a',
  summarize: '#e07de0',
  exam:      '#f06060',
  other:     '#888',
};

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
      <div style={{ width: 80, fontSize: 11, color: '#a09c98', textAlign: 'right', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: color || '#7b6cf6',
          transition: 'width 0.5s ease',
        }}/>
      </div>
      <div style={{ width: 26, fontSize: 11, color: '#a09c98', textAlign: 'right', flexShrink: 0 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.11em', color: '#605c58', textTransform: 'uppercase', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function UsageGauge({ used, limit }) {
  const pct = Math.min(100, limit > 0 ? Math.round((used / limit) * 100) : 0);
  const color = pct >= 90 ? '#f06060' : pct >= 70 ? '#f0c040' : '#5cce8a';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: '#d4cfc8', fontWeight: 600 }}>{used} / {limit} kyselyä</span>
        <span style={{ color: '#605c58' }}>{pct}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: color, transition: 'width 0.5s ease',
        }}/>
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: '#605c58' }}>Resetoituu kuun alussa</div>
    </div>
  );
}

function ScheduleCoverage({ school, schedule }) {
  if (!school) return <div style={{ fontSize: 12, color: '#605c58' }}>Koulu ei asetettu.</div>;

  const total = school.periodCount * school.palkkiCount;
  const selections = schedule?.selections || {};
  const periodData = [];

  for (let pi = 1; pi <= school.periodCount; pi++) {
    let filled = 0;
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      if (selections[`p${pi}-b${bi}`]?.trim()) filled++;
    }
    periodData.push({ label: `P${pi}`, filled, total: school.palkkiCount });
  }

  const totalFilled = Object.values(selections).filter(v => v?.trim()).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
        <span style={{ color: '#d4cfc8', fontWeight: 600 }}>Kursseja täytetty</span>
        <span style={{ color: '#a09c98' }}>{totalFilled} / {total}</span>
      </div>
      {periodData.map(({ label, filled, total: ptotal }) => (
        <Bar key={label} label={label} value={filled} max={ptotal} color="#7b6cf6"/>
      ))}
    </div>
  );
}

export function AnalyticsTab({ school, schedule }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const [{ data: prof }, { data: evts }] = await Promise.all([
        supabase.from('profiles')
          .select('ai_requests_this_month, requests_reset_at')
          .eq('id', session.user.id)
          .maybeSingle(),
        supabase.from('ai_events')
          .select('event_type, intent, course_code, urgency, tone, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (!cancelled) {
        setProfile(prof);
        setEvents(evts || []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Aggregate intent counts from chat events
  const intentCounts = {};
  const courseCounts = {};
  for (const e of events) {
    if (e.event_type === 'chat' && e.intent) {
      intentCounts[e.intent] = (intentCounts[e.intent] || 0) + 1;
    }
    if (e.course_code) {
      courseCounts[e.course_code] = (courseCounts[e.course_code] || 0) + 1;
    }
  }
  const maxIntent = Math.max(1, ...Object.values(intentCounts));
  const sortedIntents = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]);
  const sortedCourses = Object.entries(courseCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCourse = Math.max(1, ...sortedCourses.map(([, n]) => n));

  const chatCount = events.filter(e => e.event_type === 'chat').length;

  if (loading) {
    return <div style={{ padding: '32px 0', textAlign: 'center', fontSize: 12, color: '#605c58' }}>Ladataan…</div>;
  }

  return (
    <div style={{ padding: '0 2px' }}>

      <Section title="AI-käyttö tässä kuussa">
        <UsageGauge used={profile?.ai_requests_this_month ?? 0} limit={300}/>
      </Section>

      <Section title="Lukujärjestys — täyttöaste">
        <ScheduleCoverage school={school} schedule={schedule}/>
      </Section>

      {sortedIntents.length > 0 && (
        <Section title={`Kyselytyypit (${chatCount} chat-viestiä)`}>
          {sortedIntents.map(([intent, count]) => (
            <Bar
              key={intent}
              label={INTENT_LABELS[intent] || intent}
              value={count}
              max={maxIntent}
              color={INTENT_COLOR[intent] || '#7b6cf6'}
            />
          ))}
        </Section>
      )}

      {sortedCourses.length > 0 && (
        <Section title="Kysellyimmät kurssit">
          {sortedCourses.map(([code, count]) => (
            <Bar key={code} label={code} value={count} max={maxCourse} color="#4fa3e8"/>
          ))}
        </Section>
      )}

      {events.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '28px 16px',
          fontSize: 12, color: '#605c58', lineHeight: 1.6,
        }}>
          Ei vielä AI-kyselyitä.<br/>Aloita mentori-chatista saadaksesi analytiikkaa.
        </div>
      )}
    </div>
  );
}
