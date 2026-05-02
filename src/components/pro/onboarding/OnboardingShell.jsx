import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Step1Basics } from './Step1Basics';
import { Step2Schedule } from './Step2Schedule';
import { Step3Calendar } from './Step3Calendar';
import { Step4Books } from './Step4Books';
import { Step5Review } from './Step5Review';

const STEPS = [Step1Basics, Step2Schedule, Step3Calendar, Step4Books, Step5Review];

function readStepFromHash() {
  const m = window.location.hash.match(/^#\/onboarding\/step\/(\d+)/);
  const n = m ? parseInt(m[1], 10) : 1;
  return Math.min(Math.max(n, 1), STEPS.length);
}

export function OnboardingShell() {
  const [step, setStep] = useState(() => readStepFromHash());
  const [user, setUser] = useState(null);
  const [draft, setDraft] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('pro-dark');
    return () => document.body.classList.remove('pro-dark');
  }, []);

  useEffect(() => {
    const sync = () => setStep(readStepFromHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.hash = '/pro-login';
        return;
      }
      if (cancelled) return;
      setUser(session.user);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const goNext = useCallback(() => {
    const next = Math.min(step + 1, STEPS.length);
    window.location.hash = `/onboarding/step/${next}`;
  }, [step]);

  const goBack = useCallback(() => {
    const prev = Math.max(step - 1, 1);
    window.location.hash = `/onboarding/step/${prev}`;
  }, [step]);

  const finish = useCallback(() => {
    window.location.hash = '/pro-app';
  }, []);

  if (loading) return null;

  const StepComponent = STEPS[step - 1];

  return (
    <div style={{ minHeight: '100dvh', background: '#08080f', color: '#f0ede8', position: 'relative', overflow: 'hidden' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 10, height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(8,6,22,0.80)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
      }}>
        <span className="fr" style={{ fontSize: 16, fontWeight: 500, color: '#f0ede8' }}>
          Lukkari<span style={{ color: 'var(--accent)' }}>.</span><span style={{ color: '#a09c98' }}>io</span>{' '}
          <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontSize: 14 }}>Pro</span>
        </span>
        <span style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.06em' }}>
          ASKEL {step}/{STEPS.length}
        </span>
      </header>

      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          width: `${(step / STEPS.length) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent), rgba(180,160,255,0.9))',
          transition: 'width 0.28s cubic-bezier(.4,0,.2,1)',
        }}/>
      </div>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 16px 80px' }}>
        <StepComponent
          user={user}
          draft={draft}
          setDraft={setDraft}
          onNext={goNext}
          onBack={goBack}
          onFinish={finish}
          step={step}
          totalSteps={STEPS.length}
        />
      </main>
    </div>
  );
}
