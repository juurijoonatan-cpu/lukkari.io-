import { Ico } from './icons';
import { SchoolPicker } from './SchoolPicker';
import { useT } from '../i18n/i18n';

export function Header({ tab, setTab, onGear, schoolId, setSchoolId, isPro }) {
  const t = useT();
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 60,
      background: isPro ? "rgba(4,3,10,0.55)" : "rgba(255,255,255,0.42)",
      borderBottom: isPro ? "1px solid rgba(255,255,255,0.07)" : "1.5px solid rgba(255,255,255,0.72)",
      backdropFilter: isPro ? "blur(40px) saturate(1.4)" : "blur(28px) saturate(1.5)",
      WebkitBackdropFilter: isPro ? "blur(40px) saturate(1.4)" : "blur(28px) saturate(1.5)",
      boxShadow: isPro ? "0 1px 0 rgba(255,255,255,0.05) inset" : undefined,
      position: "sticky", top: 0, zIndex: 100,
      overflow: "visible",
      transition: "background 0.4s ease, border-color 0.4s ease",
    }}>
      {/* Header video — clipped so dropdowns can escape */}
      {isPro && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <video autoPlay loop muted playsInline
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.18,
            }}
            src="/138770-770553751_medium.mp4"
          />
        </div>
      )}

      {/* Content */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", position: "relative", zIndex: 1,
      }}>
        {/* Left: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="fr" style={{
            fontSize: 22,
            fontWeight: isPro ? 700 : 500,
            letterSpacing: isPro ? "-0.03em" : "-0.02em",
            color: isPro ? "#ffffff" : "var(--ink)",
            transition: "color 0.3s, font-weight 0.3s",
          }}>
            Lukkari<span style={{
              color: isPro ? "rgba(255,255,255,0.35)" : "var(--accent)",
            }}>.</span>
            <span style={{ color: isPro ? "rgba(255,255,255,0.35)" : "var(--ink-s)" }}>io</span>
          </span>
          {!isPro && (
            <div className="school-picker-header">
              <SchoolPicker schoolId={schoolId} setSchoolId={setSchoolId} isPro={isPro} dropdownZ={200}/>
            </div>
          )}
        </div>

        {/* Center: tab pill */}
        <div className="tab-pill">
          <button
            className={"tab-btn" + (tab === "free" ? " on" : "")}
            onClick={() => setTab("free")}
            style={{ color: tab === "free" ? undefined : (isPro ? "rgba(255,255,255,0.38)" : undefined) }}
          >
            {t('header.tab.free')}
          </button>
          <button
            className={"tab-btn" + (tab === "pro" ? " on" : "")}
            onClick={() => setTab("pro")}
            style={{
              color: tab === "pro"
                ? (isPro ? "#ffffff" : undefined)
                : (isPro ? "rgba(255,255,255,0.38)" : undefined),
              fontWeight: tab === "pro" && isPro ? 700 : undefined,
              letterSpacing: tab === "pro" && isPro ? "-0.01em" : undefined,
            }}
          >
            {t('header.tab.pro')}
          </button>
        </div>

        {/* Right: gear */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="icon-btn" onClick={onGear} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: isPro ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.5)",
            border: isPro ? "1px solid rgba(255,255,255,0.12)" : "1.5px solid rgba(255,255,255,0.8)",
            color: isPro ? "rgba(255,255,255,0.55)" : "var(--ink-s)",
            transition: "all 0.3s",
          }} title={t('header.settings')}>{Ico.gear}</button>
        </div>
      </div>
    </header>
  );
}
