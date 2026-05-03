import { useCallback } from 'react';
import { ProInfoStats }    from './info/ProInfoStats';
import { ProInfoFlow }     from './info/ProInfoFlow';
import { ProInfoFeatures } from './info/ProInfoFeatures';
import { ProInfoSignup }   from './info/ProInfoSignup';
import { useLang }         from '../../i18n/i18n';
import './info/proInfo.css';
import './ProDeviceMockup.css';

function SceneOrbs() {
  return (
    <div className="pdm-orbs" aria-hidden>
      <div className="pdm-orb pdm-orb-1"/>
      <div className="pdm-orb pdm-orb-2"/>
      <div className="pdm-orb pdm-orb-3"/>
    </div>
  );
}

export function ProDeviceMockup() {
  const { lang } = useLang();
  const fi = lang !== 'en';

  const handleDemo = useCallback(() => {
    window.location.hash = '/pro-app';
  }, []);

  return (
    <div className="pi pdm-root">

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
      </section>

      <section className="pdm-stage">
        <div className="pdm-stage-glow" aria-hidden/>
        <div className="pdm-mockup-wrap">
          <img
            src="/app-screens/dual-phones.png"
            alt="Lukkari Pro on iPhone"
            className="pdm-mockup-phone"
            draggable={false}
          />
        </div>
      </section>

      <div className="pdm-sections" style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
        <ProInfoStats />
        <ProInfoFlow />
        <ProInfoFeatures />
        <div className="pdm-laptop-section">
          <img
            src="/app-screens/laptop-mockup.png"
            alt="Lukkari Pro on laptop"
            className="pdm-mockup-laptop"
            draggable={false}
          />
        </div>
        <ProInfoSignup />
      </div>

    </div>
  );
}
