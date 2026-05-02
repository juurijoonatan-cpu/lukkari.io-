import { useCallback, useEffect, useState } from 'react';
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

export function ProBeta() {
  const [theme, setTheme] = useState(readTheme);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState('mentor');
  const [seedQuestion, setSeedQuestion] = useState(null);

  const [schedule, setSchedule] = useState({});
  const [school, setSchool] = useState(null);
  const [name, setName] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  // Theme: persist + reflect on data attribute
  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  // Auth + subscription gate (matches the previous ProApp behavior)
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
        // No active subscription / no profile row → vaadi tilaus, älä päästä Beta:an
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

  const { period } = buildTodayLessons(school, schedule?.selections);
  const progress = progressFromSelections(school, schedule?.selections);

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
          Demo-tila — kirjaudu käyttääksesi oikeaa AI:ta.{' '}
          <a href="#/pro-register">Luo tili</a>
          {' · '}
          <a href="#/pro-login">Kirjaudu</a>
        </div>
      )}
      <div className="pb-canvas">
        <AIOrb
          headline={{ before: 'Tänään keskittyisin ', em: 'matikkaan', after: '.' }}
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
