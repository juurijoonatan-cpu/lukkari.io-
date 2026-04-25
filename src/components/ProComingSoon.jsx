import { useState, useEffect, useCallback, useRef } from 'react';
import { Ico } from './icons';
import { PTINTS } from '../data/schools';

const FEATURES = [
  { icon: Ico.bolt,     pi: 0, label: "Wilma-automaatio",  title: "Wilma-automaatio",    desc: "JavaScript-skripti, jonka voit ajaa selaimen konsolissa. Se navigoi Wilmaan ja klikkaa kurssivalinnat automaattisesti puolestasi — pohjautuen Lukkari.io-suunnittelmaasi.", badge: "Tärkein ominaisuus" },
  { icon: Ico.conflict, pi: 4, label: "Konfliktianalyysi",  title: "Konfliktianalyysi",   desc: "Sovellus tunnistaa automaattisesti jos olet valinnut kaksi kurssia samalle palkille samalla periodilla." },
  { icon: Ico.calendar, pi: 3, label: "Kalenteri",          title: "Kalenteri-synkronointi", desc: "Vie lukujärjestyksesi suoraan Google- tai Apple-kalenteriin ICS-tiedostona." },
  { icon: Ico.download, pi: 1, label: "PDF-export",         title: "PDF-export",          desc: "Tulosta tai tallenna lukujärjestyksesi näyttävänä PDF-tiedostona." },
  { icon: Ico.shield,   pi: 2, label: "Varmuuskopiointi",   title: "Varmuuskopiointi",    desc: "Tallenna ja synkronoi lukujärjestyksesi pilvipalveluun — ei enää pelkoa tietojen menettämisestä." },
];

function ProFlowDiagram() {
  const containerRef = useRef(null);
  const centerRef    = useRef(null);
  const nodeRefs     = useRef([]);
  const [lines, setLines]     = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const compute = useCallback(() => {
    const con = containerRef.current;
    const cen = centerRef.current;
    if (!con || !cen) return;
    const cRect   = con.getBoundingClientRect();
    const cenRect = cen.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const x1 = cenRect.left + cenRect.width  / 2 - cRect.left;
    const y1 = cenRect.bottom - cRect.top;

    const computed = nodeRefs.current.map((ref, i) => {
      if (!ref) return null;
      const r  = ref.getBoundingClientRect();
      const x2 = r.left + r.width / 2 - cRect.left;
      const y2 = r.top - cRect.top;
      const cy = y1 + (y2 - y1) * 0.52;
      return { d: `M ${x1},${y1} C ${x1},${cy} ${x2},${cy} ${x2},${y2}`, x2, y2, t: PTINTS[FEATURES[i].pi] };
    }).filter(Boolean);

    setSvgSize({ w: cRect.width, h: cRect.height });
    setLines(computed);
  }, []);

  useEffect(() => {
    const id = setTimeout(compute, 80);
    window.addEventListener("resize", compute);
    return () => { clearTimeout(id); window.removeEventListener("resize", compute); };
  }, [compute]);

  return (
    <div ref={containerRef} style={{ position: "relative", paddingBottom: 4 }}>
      {svgSize.w > 0 && (
        <svg width={svgSize.w} height={svgSize.h}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 1, overflow: "visible" }}>
          <defs>
            {FEATURES.map((_, i) => {
              const t = PTINTS[FEATURES[i].pi];
              return (
                <linearGradient key={i} id={`lg${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor={t.lRaw} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={t.lRaw} stopOpacity="0.85"/>
                </linearGradient>
              );
            })}
          </defs>
          {lines.map((line, i) => (
            <g key={i}>
              <path d={line.d} fill="none" stroke={line.t.glow} strokeWidth={8}
                style={{ filter: "blur(3px)", opacity: 0.6 }}/>
              <path d={line.d} fill="none" stroke={`url(#lg${i})`} strokeWidth={1.8}
                strokeDasharray="500" strokeDashoffset="500"
                style={{ animation: `flow-in 0.9s cubic-bezier(.4,0,.2,1) forwards ${i * 0.11 + 0.1}s` }}/>
              <circle cx={line.x2} cy={line.y2} r={4} fill={line.t.lRaw}
                style={{ opacity: 0, animation: `node-in 0.3s ease forwards ${i * 0.11 + 0.8}s` }}/>
            </g>
          ))}
        </svg>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36, position: "relative", zIndex: 2 }}>
        <div ref={centerRef} style={{
          background: "rgba(255,255,255,0.75)",
          border: "2px solid rgba(255,255,255,0.96)",
          borderRadius: 22, padding: "18px 32px",
          backdropFilter: "blur(30px) saturate(1.9)",
          WebkitBackdropFilter: "blur(30px) saturate(1.9)",
          boxShadow: "0 14px 44px rgba(80,40,10,0.14), 0 2px 0 rgba(255,255,255,0.95) inset",
          textAlign: "center",
          animation: "center-in .45s ease forwards",
        }}>
          <div className="fr" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)" }}>
            Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "var(--ink-s)" }}>io</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-s)", marginTop: 3, fontWeight: 500 }}>Suunnittele kurssisi</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, position: "relative", zIndex: 2 }}>
        {FEATURES.map((f, i) => {
          const t = PTINTS[f.pi];
          return (
            <div key={i} ref={el => nodeRefs.current[i] = el} style={{
              background: "rgba(255,255,255,0.60)",
              border: `1.5px solid ${t.b}`,
              borderRadius: 18, padding: "14px 10px",
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
              boxShadow: "0 6px 20px rgba(80,40,10,0.08), 0 1.5px 0 rgba(255,255,255,0.85) inset",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center",
              opacity: 0,
              animation: `node-in 0.5s ease forwards ${i * 0.1 + 0.25}s`,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: t.bg, border: `1.5px solid ${t.b}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.l }}>
                {f.icon}
              </div>
              <span className="fr" style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSignup = () => {
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.88)",
          borderRadius: 99, padding: "6px 16px", marginBottom: 20, backdropFilter: "blur(12px)",
        }}>
          <span style={{ color: "var(--accent)", display: "flex" }}>{Ico.star}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-s)", letterSpacing: "0.04em" }}>TULOSSA PIAN</span>
        </div>
        <h1 className="fr" style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.025em", color: "var(--ink)", marginBottom: 14, lineHeight: 1.05 }}>
          Lukkari <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Pro</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--ink-s)", maxWidth: 400, margin: "0 auto", lineHeight: 1.65 }}>
          Automaattinen kurssivalinta Wilmaan ja paljon muuta. Lukuvuosisuunnittelu muutamassa minuutissa.
        </p>
      </div>

      <div className="glass" style={{ borderRadius: 24, padding: "24px 20px 28px", marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-s)", marginBottom: 20, textAlign: "center" }}>
          Mitä Pro tekee
        </div>
        <ProFlowDiagram />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {FEATURES.map((f, i) => {
          const t = PTINTS[f.pi];
          return (
            <div key={i} className="glass" style={{ borderRadius: 16, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", color: t.l, border: `1.5px solid ${t.b}` }}>{f.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <span className="fr" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{f.title}</span>
                  {f.badge && (
                    <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--accent)", color: "white", borderRadius: 99, padding: "2px 6px" }}>{f.badge}</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--ink-s)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass" style={{ borderRadius: 20, padding: "28px 28px", textAlign: "center" }}>
        <p className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>Kiinnostuitko?</p>
        {submitted ? (
          <p style={{ fontSize: 14, color: "var(--ink-s)", marginTop: 8 }}>Kiitos! Kerromme kun Pro on saatavilla.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--ink-s)", marginBottom: 20 }}>Ilmoita sähköpostisi — kerromme heti kun Pro on saatavilla.</p>
            <div style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
              <input type="email" placeholder="sinun@email.fi" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignup()}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.88)", background: "rgba(255,255,255,0.65)", fontSize: 13, outline: "none", color: "var(--ink)", fontFamily: "inherit" }}
              />
              <button onClick={handleSignup} disabled={!email.trim()} style={{
                padding: "10px 18px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))",
                color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 4px 16px oklch(0.62 0.13 45 / 0.35)",
                opacity: email.trim() ? 1 : 0.5, transition: "opacity .14s", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>Ilmoittaudu</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
