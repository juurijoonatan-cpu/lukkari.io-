import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { SCHOOLS } from './data/schools';
import { loadState, saveState, clearStoredSelections } from './utils/storage';
import { Header } from './components/Header';
import { SchoolPicker } from './components/SchoolPicker';
import { ChoiceGrid } from './components/ChoiceGrid';
import { WeekPreview } from './components/WeekPreview';
import { SettingsPanel } from './components/SettingsPanel';
import { ProComingSoon } from './components/ProComingSoon';
import { ConfirmClear } from './components/ConfirmClear';
import { WishlistPanel } from './components/WishlistPanel';
import { Footer } from './components/Footer';
import { Ico } from './components/icons';
import { useT } from './i18n/i18n';
import { currentSchoolYear } from './utils/year';

const LegalPanel = lazy(() => import('./components/LegalPanel').then(m => ({ default: m.LegalPanel })));
const ProAuth = lazy(() => import('./components/pro/ProAuth').then(m => ({ default: m.ProAuth })));
const ProBeta = lazy(() => import('./components/pro/beta/ProBeta').then(m => ({ default: m.ProBeta })));
const ProSubscribe = lazy(() => import('./components/pro/ProSubscribe').then(m => ({ default: m.ProSubscribe })));
const OnboardingShell = lazy(() => import('./components/pro/onboarding/OnboardingShell').then(m => ({ default: m.OnboardingShell })));

const ProFallback = () => <div style={{ minHeight: '100dvh', background: '#08080f' }} />;

const LEGAL_KEYS = ["tietosuoja", "kayttoehdot", "evasteet"];
const PRO_ROUTES = ["pro-login", "pro-register", "pro-app", "pro-subscribe", "onboarding"];
const isOnboardingHash = (h) => h === "onboarding" || h.startsWith("onboarding/");

function Orbs() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 720, height: 720, borderRadius: "50%", top: -260, left: -200, filter: "blur(100px)", background: "radial-gradient(circle, oklch(0.78 0.16 45 / 0.52) 0%, transparent 68%)", animation: "orb-a 20s ease-in-out infinite" }}/>
      <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", top: -60, right: -140, filter: "blur(85px)", background: "radial-gradient(circle, oklch(0.78 0.13 340 / 0.40) 0%, transparent 68%)", animation: "orb-b 25s ease-in-out infinite" }}/>
      <div style={{ position: "absolute", width: 420, height: 420, borderRadius: "50%", bottom: -60, left: "38%", filter: "blur(75px)", background: "radial-gradient(circle, oklch(0.80 0.12 80 / 0.34) 0%, transparent 68%)", animation: "orb-c 28s ease-in-out infinite 5s" }}/>
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", bottom: 200, right: 60, filter: "blur(65px)", background: "radial-gradient(circle, oklch(0.80 0.10 240 / 0.28) 0%, transparent 65%)", animation: "orb-a 22s ease-in-out infinite 10s" }}/>
    </div>
  );
}

function ShareButton() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = "https://lukkari.io/";
    if (navigator.share) {
      try { await navigator.share({ title: "Lukkari.io", text: t('app.shareText'), url }); }
      catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    }
  }, [t]);

  return (
    <button onClick={share} style={{
      display: "flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600,
      background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.85)",
      borderRadius: 99, padding: "4px 11px 4px 9px",
      color: copied ? "oklch(0.52 0.12 150)" : "var(--ink-s)",
      cursor: "pointer", backdropFilter: "blur(6px)",
      transition: "color 0.14s",
    }}>
      {copied ? Ico.check : Ico.share}
      <span>{copied ? t('app.shareCopied') : t('app.share')}</span>
    </button>
  );
}

export default function App() {
  const t = useT();
  const [tab, setTab] = useState("free");
  const [schoolId, setSchoolId] = useState("otaniemi");
  const [selections, setSelections] = useState({});
  const [year, setYear] = useState(() => currentSchoolYear());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [legalDoc, setLegalDoc] = useState(null);
  const [proRoute, setProRoute] = useState(null);

  const isPro = tab === "pro";

  // Hash routing for legal + pro pages
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash.replace(/^#\/?/, "");
      setLegalDoc(LEGAL_KEYS.includes(h) ? h : null);
      const proHash = isOnboardingHash(h) ? "onboarding" : (PRO_ROUTES.includes(h) ? h : null);
      setProRoute(proHash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const openLegal = useCallback((key) => {
    window.location.hash = `/${key}`;
  }, []);

  const closeLegal = useCallback(() => {
    if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
    setLegalDoc(null);
  }, []);

  useEffect(() => {
    const s = loadState();
    if (s) {
      if (s.schoolId) setSchoolId(s.schoolId);
      if (s.selections) setSelections(s.selections);
      if (s.year) setYear(s.year);
      if (s.wishlist) setWishlist(s.wishlist);
    }
  }, []);

  useEffect(() => {
    saveState({ schoolId, selections, year, wishlist });
  }, [schoolId, selections, year, wishlist]);

  useEffect(() => {
    document.body.classList.toggle('pro-dark', isPro);
    return () => document.body.classList.remove('pro-dark');
  }, [isPro]);

  const onChange = useCallback((k, v) => {
    setSelections(prev => {
      const n = { ...prev };
      if (!v.trim()) delete n[k]; else n[k] = v;
      return n;
    });
  }, []);

  const doClear = useCallback(() => {
    setSelections({});
    clearStoredSelections();
    setConfirmClear(false);
    setSettingsOpen(false);
  }, []);

  const school = schoolId === "custom"
    ? (() => {
        try {
          const c = JSON.parse(localStorage.getItem("lukkari.customSchool") || "{}");
          return { id: "custom", name: c.name || t('app.customSchool'), palkkiCount: c.palkkiCount || 6, periodCount: c.periodCount || 4, times: c.times || [], days: c.days || [], rotation: c.rotation || [] };
        } catch { return { id: "custom", name: t('app.customSchool'), palkkiCount: 6, periodCount: 4, times: [], days: [], rotation: [] }; }
      })()
    : (SCHOOLS.find(s => s.id === schoolId) || SCHOOLS[0]);
  const filledCount = Object.values(selections).filter(v => v?.trim()).length;

  // Pro routes completely replace main UI
  if (proRoute) {
    const ProView = (() => {
      switch (proRoute) {
        case "pro-login":     return <ProAuth initialTab="login" />;
        case "pro-register":  return <ProAuth initialTab="register" />;
        case "pro-subscribe": return <ProSubscribe />;
        case "onboarding":    return <OnboardingShell />;
        case "pro-app":       return <ProBeta />;
        default: return null;
      }
    })();
    return <Suspense fallback={<ProFallback />}>{ProView}</Suspense>;
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {!isPro && <Orbs />}

      {/* Pro wave video background */}
      {isPro && (
        <video key="pro-bg" autoPlay loop muted playsInline
          style={{
            position: "fixed", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", zIndex: 0, opacity: 0.55, pointerEvents: "none",
          }}
          src="/260037_medium.mp4"
        />
      )}

      <Header
        tab={tab} setTab={setTab} onGear={() => setSettingsOpen(true)}
        schoolId={schoolId} setSchoolId={setSchoolId}
        isPro={isPro}
      />

      <SettingsPanel
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        school={school} selections={selections}
        year={year} setYear={setYear}
        onClear={() => setConfirmClear(true)}
        filledCount={filledCount}
      />

      {isPro ? <ProComingSoon/> : (
        <main className="main-pad" style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 80px" }}>
          <div style={{ marginBottom: 36 }}>
            {/* SchoolPicker visible on mobile only (hidden on desktop where it's in header) */}
            <div className="school-picker-main" style={{ marginBottom: 14, alignItems: "center", flexWrap: "wrap", gap: "8px 20px" }}>
              <SchoolPicker schoolId={schoolId} setSchoolId={setSchoolId}/>
              <div style={{ height: 14, width: 1, background: "rgba(200,195,190,0.45)" }}/>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-f)" }}>{year}</span>
            </div>
            {/* Desktop: year label below header (SchoolPicker is in header) */}
            <div className="school-picker-header" style={{ marginBottom: 14, alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-f)" }}>{year}</span>
            </div>
            <h1 className="fr" style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, color: "var(--ink)" }}>
              {school.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "var(--ink-s)" }}>{t('app.tagline')}</p>
              {filledCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.85)",
                  borderRadius: 99, padding: "2px 10px", color: "var(--accent)",
                  backdropFilter: "blur(6px)",
                }}>{t('app.coursesLogged', { n: filledCount })}</span>
              )}
              <ShareButton />
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 24, padding: "24px 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
              <h2 className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>{t('app.matrix')}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "var(--ink-f)", fontWeight: 500 }}>
                  {t('app.gridSummary', { p: school.palkkiCount, pe: school.periodCount })}
                </span>
                {filledCount > 0 && (
                  <button onClick={() => setConfirmClear(true)} style={{
                    fontSize: 11, color: "var(--ink-f)", background: "transparent", border: "none",
                    cursor: "pointer", padding: "2px 6px", borderRadius: 6,
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}>{t('common.clear')}</button>
                )}
              </div>
            </div>
            <ChoiceGrid school={school} selections={selections} onChange={onChange}/>
          </div>

          <WeekPreview school={school} selections={selections}/>
        </main>
      )}

      <Footer isPro={isPro} onOpenLegal={openLegal}/>

      {legalDoc && (
        <Suspense fallback={null}>
          <LegalPanel docKey={legalDoc} onClose={closeLegal}/>
        </Suspense>
      )}

      {filledCount > 0 && !isPro && !settingsOpen && (
        <div style={{
          position: "fixed", bottom: 20, left: 20,
          background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(255,255,255,0.92)",
          borderRadius: 99, backdropFilter: "blur(12px)",
          padding: "6px 14px", display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
          pointerEvents: "none", zIndex: 70,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "oklch(0.58 0.15 150)" }}/>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-s)" }}>{t('app.saved')}</span>
        </div>
      )}

      {!isPro && <WishlistPanel wishlist={wishlist} setWishlist={setWishlist} selections={selections}/>}

      {confirmClear && <ConfirmClear onConfirm={doClear} onCancel={() => setConfirmClear(false)}/>}
    </div>
  );
}
