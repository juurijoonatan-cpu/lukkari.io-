import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { isDemoActive } from '../../../utils/demo';
import { loadState } from '../../../utils/storage';
import { SCHOOLS } from '../../../data/schools';
import { currentSchoolYear } from '../../../utils/year';
import { Background } from './Background';
import { Topbar } from './Topbar';
import { AIOrb } from './AIOrb';
import { TodayTimeline } from './TodayTimeline';
import { ProgressRing } from './ProgressRing';
import { AskAI } from './AskAI';
import { SidePanel } from './SidePanel';
import { buildTodayLessons } from './scheduleHelpers';
import './proBeta.css';

const THEME_KEY = 'lukkari.proTheme';

function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark' || t === 'light') return t;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

function readDisplayName(session) {
  return session?.user?.user_metadata?.name
      || session?.user?.user_metadata?.full_name
      || session?.user?.email?.split('@')[0]
      || null;
}

function progressFromSelections(school, selections) {
  if (!school) return { code: '—', percent: 0, lines: [] };
  const total = school.periodCount * school.palkkiCount;
  const filled = Object.values(selections || {}).filter(v => v?.trim()).length;
  const pct = total ? (filled / total) * 100 : 0;
  return {
    code: school.name,
    percent: pct,
    lines: [
      { label: 'Kursseja täytetty', value: `${filled} / ${total}` },
      { label: 'Periodeja',         value: school.periodCount },
      { label: 'Palkkeja',          value: school.palkkiCount },
    ],
  };
}

// Pick the most prominent course for the AIOrb headline.
// Uses today's live/next lesson first, then falls back to the most-filled period.
function computeFocusCourse(school, selections, lessons) {
  if (!school || !selections) return null;

  // Prefer the currently live or first upcoming lesson today
  const live = lessons.find(l => l.live && l.label);
  if (live) return live.label;

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const upcoming = lessons.find(l => l.from != null && l.from > nowMin && l.label);
  if (upcoming) return upcoming.label;

  // Fallback: most-filled period, first course
  let bestPeriod = 1, best = -1;
  for (let pi = 1; pi <= school.periodCount; pi++) {
    let n = 0;
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      if (selections[`p${pi}-b${bi}`]?.trim()) n++;
    }
    if (n > best) { best = n; bestPeriod = pi; }
  }
  for (let bi = 1; bi <= school.palkkiCount; bi++) {
    const v = selections[`p${bestPeriod}-b${bi}`]?.trim();
    if (v) return v;
  }
  return null;
}

// Build context-aware quick-ask suggestions from actual course selections.
function computeSuggestions(school, selections) {
  if (!school || !selections) return DEFAULT_SUGGESTIONS;

  const courses = [];
  for (let pi = 1; pi <= school.periodCount; pi++) {
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      const v = selections[`p${pi}-b${bi}`]?.trim();
      if (v && !courses.includes(v)) courses.push(v);
    }
  }
  if (!courses.length) return DEFAULT_SUGGESTIONS;

  const suggestions = [];
  if (courses[0]) suggestions.push(`Auta minua ${courses[0]}:n kanssa`);
  if (courses[1]) suggestions.push(`Milloin aloittaa ${courses[1]} kertaus?`);
  suggestions.push('Tee mulle lukusuunnitelma tälle viikolle');
  return suggestions.slice(0, 3);
}

const DEFAULT_SUGGESTIONS = [
  'Tee mulle lukusuunnitelma tälle viikolle',
  'Onko aikataulussani konflikteja?',
  'Mistä aloittaisin tänään?',
];

export function ProApp() {
  const [theme, setTheme] = useState(readTheme);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState('mentor');
  const [seedQuestion, setSeedQuestion] = useState(null);

  const [schedule, setSchedule] = useState({});
  const [school, setSchool] = useState(null);
  const [name, setName] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const isDemo = isDemoActive();
    setDemoMode(isDemo);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        if (!isDemo) { window.location.hash = '/pro-login'; return; }
        return;
      }
      setName(readDisplayName(session));
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status, onboarded_at')
        .eq('id', session.user.id)
        .maybeSingle();
      const status = data?.subscription_status || '';
      const active = ['active', 'trialing'].includes(status);
      if (!active && !isDemo) {
        window.location.hash = '/pro-subscribe';
        return;
      }
      if (!isDemo && active && !data?.onboarded_at) {
        const { data: plan } = await supabase
          .from('study_plans')
          .select('id, status')
          .eq('user_id', session.user.id)
          .eq('school_year', currentSchoolYear())
          .maybeSingle();
        if (!plan || plan.status !== 'active') {
          window.location.hash = '/onboarding';
        }
      }
    });

    const s = loadState() || {};
    setSchedule(s);
    setSchool(SCHOOLS.find(x => x.id === (s.schoolId || 'otaniemi')) || SCHOOLS[0]);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }, []);

  const openPanel = useCallback((nextTab = 'mentor') => {
    setTab(nextTab);
    setPanelOpen(true);
  }, []);

  const ask = useCallback((q) => {
    setSeedQuestion(q);
    openPanel('mentor');
  }, [openPanel]);

  const { period, lessons = [] } = buildTodayLessons(school, schedule?.selections);
  const progress = progressFromSelections(school, schedule?.selections);

  const focusCourse = useMemo(
    () => computeFocusCourse(school, schedule?.selections, lessons),
    [school, schedule, lessons],
  );

  const suggestions = useMemo(
    () => computeSuggestions(school, schedule?.selections),
    [school, schedule],
  );

  const orbHeadline = focusCourse
    ? { before: 'Tänään keskittyisin ', em: focusCourse, after: '.' }
    : { before: 'Avaa ', em: 'mentor', after: ' aloittaaksesi.' };

  return (
    <div className="pro-beta" data-theme={theme}>
      <Background theme={theme}/>
      <Topbar
        name={name}
        period={period}
        onToggleTheme={toggleTheme}
        onOpenMenu={() => openPanel('mentor')}
      />
      {demoMode && (
        <div className="pb-demo-banner" role="note">
          Demo-tila —{' '}
          <a href="#/pro-register">Luo tili</a>
          {' · '}
          <a href="#/pro-login">Kirjaudu</a>
        </div>
      )}
      <div className="pb-canvas">
        <AIOrb
          headline={orbHeadline}
          footText="Avaa mentor saadaksesi henkilökohtaisia neuvoja"
          onOpen={() => openPanel('mentor')}
        />
        <TodayTimeline school={school} selections={schedule?.selections}/>
        <ProgressRing
          courseCode={progress.code}
          percent={progress.percent}
          lines={progress.lines}
        />
        <AskAI
          headline={{ before: 'Mitä teen ', em: 'seuraavaksi', after: '?' }}
          suggestions={suggestions}
          onAsk={ask}
        />
      </div>
      <SidePanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        tab={tab}
        onTabChange={setTab}
        school={school}
        schedule={schedule}
        seedQuestion={seedQuestion}
        onSeedConsumed={() => setSeedQuestion(null)}
      />
    </div>
  );
}

// Keep legacy export name so the lazy import in App.jsx still works without a change.
export { ProApp as ProBeta };
