/**
 * ProDeviceMockup — premium hero section for the Pro landing page.
 * Real device mockup render (dual iPhones) with app screenshots composited in.
 */
import { useCallback } from 'react';
import { ProInfoStats }    from './info/ProInfoStats';
import { ProInfoFlow }     from './info/ProInfoFlow';
import { ProInfoFeatures } from './info/ProInfoFeatures';
import { ProInfoSignup }   from './info/ProInfoSignup';
import { useLang }         from '../../i18n/i18n';
import './info/proInfo.css';
import './ProDeviceMockup.css';

/* ── Floating glow orbs ── */
function SceneOrbs() {
  return (
    <div className="pdm-orbs" aria-hidden>
      <div className="pdm-orb pdm-orb-1"/>
      <div className="pdm-orb pdm-orb-2"/>
      <div className="pdm-orb pdm-orb-3"/>
    </div>
  );
}

/* ── Main export ── */
export function ProDeviceMockup() {
  const { lang } = useLang();
  const fi = lang !== 'en';

  const handleDemo = useCallback(() => {
    window.location.hash = '/pro-app';
  }, []);

  const PILLS = fi
    ? ['AI-lukusuunnitelmat', 'Aikatauluanalyysi', 'Tenttimuistutukset', 'Älykäs kertaus']
    : ['AI Study Plans', 'Schedule Analysis', 'Exam Reminders', 'Smart Revision'];

  return (
    <div className="pi pdm-root">

      {/* ── HERO ── */}
      <section className="pdm-hero">
        <SceneOrbs />

        <div className="pdm-hero-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor"/>
          </svg>
          Lukkari Pro · Beta
        </div>

        <h1 className="pdm-hero-h1">
          {fi ? <>Opiskelusi.<br/><em>AI-tasolla.</em></> : <>Your studies.<br/><em>AI-powered.</em></>}
        </h1>

        <p className="pdm-hero-sub">
          {fi
            ? 'Tekoäly rakentaa lukujärjestyksesi, optimoi kurssivalintasi ja muistuttaa tenteistä automaattisesti.'
            : 'AI builds your schedule, optimises course choices and reminds you of exams — automatically.'
          }
        </p>

        <div className="pdm-cta-row">
          <button className="pdm-cta-primary" onClick={handleDemo}>
            {fi ? 'Kokeile demoa' : 'Try the demo'}
            <span className="pdm-cta-arrow">→</span>
          </button>
        </div>

        <p className="pdm-hero-foot">
          {fi
            ? 'Ei rekisteröitymistä · Demo aukeaa heti · Ilmainen beta'
            : 'No sign-up · Opens instantly · Free beta'
          }
        </p>

        <div className="pdm-pills-row">
          {PILLS.map(p => (
            <span key={p} className="pdm-feature-pill">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── DEVICE STAGE — single composed mockup image ── */}
      <section className="pdm-stage">
        <div className="pdm-stage-glow" aria-hidden/>
        <div className="pdm-mockup-wrap">
          <img
            src="/app-screens/dual-phones.png"
            alt="Lukkari Pro on iPhone"
            className="pdm-mockup-img"
            draggable={false}
          />
        </div>

        {/* Floating tags */}
        <div className="pdm-tag pdm-tag-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="#c8b8ff"/>
          </svg>
          AI Mentor
        </div>
        <div className="pdm-tag pdm-tag-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3dbf8a" strokeWidth="2"/>
            <path d="M3 10h18M9 4v4M15 4v4" stroke="#3dbf8a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Auto-Schedule
        </div>
        <div className="pdm-tag pdm-tag-3">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#f4845f" strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke="#f4845f" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Exam Alerts
        </div>
      </section>

      {/* ── INFO SECTIONS ── */}
      <div className="pdm-sections" style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
        <ProInfoStats />
        <ProInfoFlow />
        <ProInfoFeatures />
        <ProInfoSignup />
      </div>

    </div>
  );
}
