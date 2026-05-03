import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';

const FI_MONTHS = ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu','Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'];

function buildGrid(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y, m, 1);
  const dow = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = dow - 1; i >= 0; i--) cells.push({ d: prevMonthDays - i, muted: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - daysInMonth - dow + 1, muted: true });
  return cells;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function CalendarTab() {
  const today = new Date();
  const cells = buildGrid(today);
  const dayNames = ['ma','ti','ke','to','pe','la','su'];
  const td = today.getDate();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // Fetch upcoming active exam plans joined with course code
      const { data } = await supabase
        .from('exam_plans')
        .select('id, exam_date, course_id, courses(course_code, subject)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gte('exam_date', toDateKey(today))
        .order('exam_date', { ascending: true })
        .limit(20);

      if (!cancelled) {
        setExams(data || []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build a set of day numbers (current month) that have exams
  const examDays = new Set();
  const examsByDay = {};
  for (const e of exams) {
    if (!e.exam_date) continue;
    const d = new Date(e.exam_date + 'T00:00:00');
    if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
      examDays.add(d.getDate());
      const day = d.getDate();
      if (!examsByDay[day]) examsByDay[day] = [];
      examsByDay[day].push(e.courses?.course_code || '?');
    }
  }

  // Upcoming exams (all months, next 60 days)
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 60);
  const upcoming = exams.filter(e => {
    if (!e.exam_date) return false;
    const d = new Date(e.exam_date + 'T00:00:00');
    return d <= cutoff;
  });

  return (
    <div className="pb-cal">
      <div className="pb-cal-month">
        <span>{FI_MONTHS[today.getMonth()]} <em>{today.getFullYear()}</em></span>
      </div>
      <div className="pb-cal-grid">
        {dayNames.map(n => <div key={n} className="pb-cal-dn">{n}</div>)}
        {cells.map((c, i) => {
          const hasExam = !c.muted && examDays.has(c.d);
          return (
            <div
              key={i}
              className={`pb-cal-dt${c.muted ? ' is-muted' : ''}${!c.muted && c.d === td ? ' is-today' : ''}${hasExam ? ' has-exam' : ''}`}
              title={hasExam ? examsByDay[c.d]?.join(', ') : undefined}
            >
              {c.d}
              {hasExam && <span className="pb-cal-exam-dot" aria-hidden/>}
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="pb-cal-note">Ladataan koepäiviä…</p>
      )}

      {!loading && upcoming.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--pb-ink-f)', textTransform: 'uppercase', marginBottom: 10 }}>
            Tulevat kokeet
          </div>
          {upcoming.map(e => {
            const d = new Date(e.exam_date + 'T00:00:00');
            const label = d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'long' });
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  flexShrink: 0, padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(240,96,96,0.12)', border: '1px solid rgba(240,96,96,0.25)',
                  fontSize: 10, fontWeight: 700, color: 'oklch(0.65 0.16 20)',
                }}>
                  {e.courses?.course_code || '?'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--pb-ink-s)' }}>{label}</div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && upcoming.length === 0 && (
        <p className="pb-cal-note">
          Ei tulevia kokeita. Lisää koepäiviä Mentor-chatissa tai onboardingin kautta.
        </p>
      )}
    </div>
  );
}
