/**
 * ProDeviceMockup — premium hero section for the Pro landing page.
 * Phone + laptop CSS device frames with REAL app screenshots inside.
 * Tsemppi-style: phones at angles, scattered, glassmorphism overlays.
 */
import { useCallback } from 'react';
import { ProInfoStats }    from './info/ProInfoStats';
import { ProInfoFlow }     from './info/ProInfoFlow';
import { ProInfoFeatures } from './info/ProInfoFeatures';
import { ProInfoSignup }   from './info/ProInfoSignup';
import { enableDemo }      from '../../utils/demo';
import { useT }            from '../../i18n/i18n';
import './info/proInfo.css';
import './ProDeviceMockup.css';

/* ── Floating sparks / glow orbs ── */
function SceneOrbs() {
  return (
    <div className="pdm-orbs" aria-hidden>
      <div className="pdm-orb pdm-orb-1"/>
      <div className="pdm-orb pdm-orb-2"/>
      <div className="pdm-orb pdm-orb-3"/>
    </div>
  );
}

/* ── Feature pills row ── */
const PILLS_FI = ['AI-lukusuunnitelmat','Kurssipäällekkäisyysanalyysi','Tenttimuistutukset','Älykäs kertausaikataulu'];
const PILLS_EN = ['AI Study Plans','Course Conflict Analysis','Exam Reminders','Smart Revision Schedule'];

/* ── Phone device with real screenshot ── */
function PhoneFrame({ src, className = '', alt = '' }) {
  return (
    <div className={`pdm-phone ${className}`}>
      {/* Dynamic island */}
      <div className="pdm-phone-island"/>
      <div className="pdm-phone-inner">
        <img
          src={src}
          alt={alt}
          className="pdm-phone-screenshot"
          draggable={false}
        />
      </div>
      <div className="pdm-phone-home"/>
      {/* Side buttons */}
      <div className="pdm-phone-btn pdm-phone-vol1"/>
      <div className="pdm-phone-btn pdm-phone-vol2"/>
      <div className="pdm-phone-btn pdm-phone-power"/>
    </div>
  );
}

/* ── Laptop device with real screenshot ── */
function LaptopFrame({ src }) {
  return (
    <div className="pdm-laptop">
      <div className="pdm-laptop-lid">
        <div className="pdm-laptop-cam"/>
        <div className="pdm-laptop-display">
          <img
            src={src}
            alt="Lukkari Pro dashboard"
            className="pdm-laptop-screenshot"
            draggable={false}
          />
        </div>
      </div>
      <div className="pdm-laptop-base">
        <div className="pdm-laptop-trackpad"/>
      </div>
    </div>
  );
}

/* ── Main export ── */
export function ProDeviceMockup() {
  const t = useT();
  const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'fi';
  const PILLS = lang === 'en' ? PILLS_EN : PILLS_FI;

  const tryDemo = useCallback(() => {
    if (!enableDemo()) {
      window.location.hash = '/pro';
      return;
    }
    window.location.hash = '/pro-app';
  }, []);

  return (
    <div className="pi pdm-root">

      {/* ── HERO ── */}
      <section className="pdm-hero">
        <SceneOrbs />

        {/* Badge */}
        <div className="pdm-hero-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor"/>
          </svg>
          Lukkari Pro · Beta
        </div>

        {/* Headline */}
        <h1 className="pdm-hero-h1">
          {lang === 'en' ? <>Your studies.<br/><em>AI-powered.</em></> : <>Opiskelusi.<br/><em>AI-tasolla.</em></>}
        </h1>

        <p className="pdm-hero-sub">
          {lang === 'en'
            ? 'AI builds your schedule, optimises course choices and reminds you of exams — automatically.'
            : 'Tekoäly rakentaa lukujärjestyksesi, optimoi kurssivalintasi ja muistuttaa tenteistä automaattisesti.'
          }
        </p>

        {/* CTA row */}
        <div className="pdm-cta-row">
          <button className="pdm-cta-primary" onClick={tryDemo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor"/>
            </svg>
            {lang === 'en' ? 'Try the demo' : 'Kokeile demoa'}
            <span>→</span>
          </button>
          <a className="pdm-cta-secondary" href="#/pro-register">
            {lang === 'en' ? 'Sign up free' : 'Rekisteröidy ilmaiseksi'}
          </a>
        </div>

        <p className="pdm-hero-foot">
          {lang === 'en'
            ? 'No signup needed · Demo opens instantly · Free beta'
            : 'Ei rekisteröitymistä · Demo aukeaa heti · Ilmainen beta'
          }
        </p>

        {/* Feature pills */}
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

      {/* ── DEVICE STAGE ── */}
      <section className="pdm-stage">
        {/* Glow beneath devices */}
        <div className="pdm-stage-glow" aria-hidden/>

        <div className="pdm-stage-inner">
          {/* Laptop — center back */}
          <div className="pdm-laptop-wrap">
            <LaptopFrame src="/app-screens/desktop2.jpg" />
          </div>

          {/* Phone left — dark mode, angled left */}
          <div className="pdm-phone-wrap pdm-phone-left">
            <PhoneFrame
              src="/app-screens/phone-dark.jpg"
              alt="Lukkari Pro dark mode"
              className="pdm-phone-dark"
            />
          </div>

          {/* Phone right — warm/light mode, angled right */}
          <div className="pdm-phone-wrap pdm-phone-right">
            <PhoneFrame
              src="/app-screens/phone-warm.jpg"
              alt="Lukkari Pro warm mode"
              className="pdm-phone-warm"
            />
          </div>
        </div>

        {/* Floating label tags */}
        <div className="pdm-tag pdm-tag-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="#c8b8ff"/>
          </svg>
          AI Mentor
        </div>
        <div className="pdm-tag pdm-tag-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3dbf8a" strokeWidth="2"/>
            <path d="M3 10h18M9 4v4M15 4v4" stroke="#3dbf8a" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Auto-Schedule
        </div>
        <div className="pdm-tag pdm-tag-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#f4845f" strokeWidth="2"/>
            <path d="M12 7v5l3 3" stroke="#f4845f" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Exam Alerts
        </div>
      </section>

      {/* ── REST OF SECTIONS ── */}
      <div className="pdm-sections" style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 80px' }}>
        <ProInfoStats />
        <ProInfoFlow />
        <ProInfoFeatures />
        <ProInfoSignup />
      </div>

    </div>
  );
}
