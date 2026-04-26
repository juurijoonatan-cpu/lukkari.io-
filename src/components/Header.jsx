import { Ico } from './icons';
import { SchoolPicker } from './SchoolPicker';

const CHROME = "linear-gradient(145deg, #c8c8d0 0%, #f0f0f8 38%, #e4e4ec 56%, #9898a4 80%, #d4d4de 100%)";

const SPARKS = [
  { size: 14, x: -18, y: -10, rot: 15,  delay: 0.1, opacity: 0.75 },
  { size: 9,  x: -8,  y:  8,  rot: -22, delay: 0.2, opacity: 0.55 },
  { size: 11, x:  4,  y: -14, rot: 40,  delay: 0.0, opacity: 0.65 },
];

function HeaderSparks() {
  return (
    <div style={{ position: "relative", pointerEvents: "none", width: 0, height: 0, zIndex: 2 }}>
      {SPARKS.map((s, i) => (
        <svg key={i} width={s.size} height={s.size} viewBox="0 0 24 24"
          style={{
            position: "absolute",
            left: s.x, top: s.y,
            opacity: s.opacity,
            transform: `rotate(${s.rot}deg)`,
            animation: `spark-in 0.5s cubic-bezier(.4,0,.2,1) forwards ${s.delay}s, spark-spin 12s linear infinite ${s.delay}s`,
          }}>
          <defs>
            <linearGradient id={`hsc${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#d8d8e4"/>
              <stop offset="50%"  stopColor="#ffffff"/>
              <stop offset="100%" stopColor="#a0a0b0"/>
            </linearGradient>
          </defs>
          <path fill={`url(#hsc${i})`}
            d="M12,2 L13.4,10.6 L22,12 L13.4,13.4 L12,22 L10.6,13.4 L2,12 L10.6,10.6 Z"/>
        </svg>
      ))}
    </div>
  );
}

export function Header({ tab, setTab, onGear, schoolId, setSchoolId, isPro }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 60,
      background: isPro ? "rgba(6,6,18,0.80)" : "rgba(255,255,255,0.42)",
      borderBottom: isPro ? "1px solid rgba(255,255,255,0.09)" : "1.5px solid rgba(255,255,255,0.72)",
      backdropFilter: "blur(28px) saturate(1.5)",
      WebkitBackdropFilter: "blur(28px) saturate(1.5)",
      position: "sticky", top: 0, zIndex: 100,
      overflow: "visible",
      transition: "background 0.4s ease, border-color 0.4s ease",
    }}>
      {/* Header video — clipped via dedicated overflow:hidden container so dropdowns can escape header bounds */}
      {isPro && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          <video autoPlay loop muted playsInline
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.28,
            }}
            src="/138770-770553751_medium.mp4"
          />
        </div>
      )}

      {/* Content layer above video */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", position: "relative", zIndex: 1,
      }}>
        {/* Left: logo + school picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="fr" style={{
            fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em",
            color: isPro ? "#f0ede8" : "var(--ink)",
            transition: "color 0.3s",
          }}>
            Lukkari<span style={{ color: "var(--accent)" }}>.</span>
            <span style={{ color: isPro ? "#a09c98" : "var(--ink-s)" }}>io</span>
          </span>
          <div className="school-picker-header">
            <SchoolPicker schoolId={schoolId} setSchoolId={setSchoolId} isPro={isPro} dropdownZ={200}/>
          </div>
        </div>

        {/* Center: tab pill with chrome "Pro" label */}
        <div className="tab-pill">
          <button className={"tab-btn" + (tab === "free" ? " on" : "")} onClick={() => setTab("free")}
            style={{ color: tab === "free" ? undefined : (isPro ? "#a09c98" : undefined) }}>
            Free
          </button>
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <button className={"tab-btn" + (tab === "pro" ? " on" : "")} onClick={() => setTab("pro")}
              style={{
                color: tab === "pro" && isPro ? undefined : (isPro ? "#a09c98" : undefined),
                ...(tab === "pro" ? {
                  background: CHROME,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                } : {}),
              }}>
              Pro
            </button>
            {isPro && (
              <div style={{ position: "absolute", left: "100%", top: "50%", transform: "translateY(-50%)" }}>
                <HeaderSparks />
              </div>
            )}
          </div>
        </div>

        {/* Right: gear */}
        <button className="icon-btn" onClick={onGear} style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isPro ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)",
          border: isPro ? "1.5px solid rgba(255,255,255,0.14)" : "1.5px solid rgba(255,255,255,0.8)",
          color: isPro ? "#a09c98" : "var(--ink-s)",
          transition: "all 0.3s",
        }} title="Asetukset">{Ico.gear}</button>
      </div>
    </header>
  );
}
