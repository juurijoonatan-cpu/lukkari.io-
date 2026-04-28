import { useState, useEffect, useCallback, useRef } from 'react';
import { Ico } from './icons';
import { ProInfoHero } from './pro/info/ProInfoHero';
import './pro/info/proInfo.css';

const FEATURES = [
  { icon: Ico.sparkle, label: "Kurssisuosittelija",     title: "Kurssisuosittelija",        desc: "Tekoäly ehdottaa juuri sinulle sopivat kurssit. Ehdotukset huomioivat ylioppilaskirjoitukset, hakukohteet ja oman painotuksesi.", badge: "Tärkein" },
  { icon: Ico.book,    label: "Lukusuunnitelma",         title: "Lukusuunnitelma",            desc: "Selkeä viikkosuunnitelma kursseittain. Tekoäly kertoo mitä opiskella ensin ja kuinka kauan." },
  { icon: Ico.timer,   label: "Lukuaikataulu kokeisiin", title: "Lukuaikataulu kokeisiin",    desc: "Syötä koepäivä, saat kertausaikataulun. Tasainen tahti, ei viime hetken pänttäämistä." },
  { icon: Ico.conflict, label: "Konfliktianalyysi",      title: "Konfliktianalyysi",          desc: "Tunnistaa aikatauluristiriidat automaattisesti, ennen kuin niistä ehtii tulla ongelma." },
  { icon: Ico.calendar, label: "Kalenteri-export",       title: "Kalenteri-synkronointi",     desc: "Vie lukujärjestys suoraan Google tai Apple kalenteriin yhdellä klikkauksella." },
  { icon: Ico.download, label: "PDF-export",             title: "PDF-export",                 desc: "Tallenna tai tulosta lukujärjestys siistinä PDF-tiedostona." },
  { icon: Ico.shield,   label: "Pilvivarmuuskopio",      title: "Pilvivarmuuskopio",          desc: "Kurssivalintasi tallessa pilvessä. Vaihda laitetta huoletta, valinnat seuraavat mukana." },
];

const CHROME = "linear-gradient(145deg, #c8c8d0 0%, #f0f0f8 38%, #e4e4ec 56%, #9898a4 80%, #d4d4de 100%)";

function FeatureCard({ feature, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 20,
        padding: "18px 20px",
        display: "flex", gap: 16, alignItems: "flex-start",
        backdropFilter: "blur(16px) saturate(1.4)",
        WebkitBackdropFilter: "blur(16px) saturate(1.4)",
        transformOrigin: "center top",
        transform: hovered
          ? "perspective(900px) rotateX(2deg) rotateY(0deg) translateZ(12px)"
          : "perspective(900px) rotateX(5deg) rotateY(-2deg)",
        boxShadow: hovered
          ? "0 40px 80px rgba(0,0,0,0.65), 0 2px 0 rgba(255,255,255,0.10) inset"
          : "0 20px 50px rgba(0,0,0,0.50), 0 2px 0 rgba(255,255,255,0.07) inset",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
        cursor: "default",
        opacity: 0,
        animation: `node-in 0.5s ease forwards ${index * 0.1 + 0.3}s`,
      }}>
      <div style={{
        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
        background: CHROME,
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.8) inset",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(20,18,30,0.82)",
      }}>
        <svg width="22" height="22" viewBox={feature.icon.props.viewBox}
          fill={feature.icon.props.fill} stroke={feature.icon.props.stroke}
          strokeWidth={feature.icon.props.strokeWidth}
          strokeLinecap={feature.icon.props.strokeLinecap}
          strokeLinejoin={feature.icon.props.strokeLinejoin}>
          {feature.icon.props.children}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
          <span className="fr" style={{ fontSize: 15, fontWeight: 500, color: "#f0ede8" }}>{feature.title}</span>
          {feature.badge && (
            <span style={{
              fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
              background: CHROME, color: "rgba(20,18,30,0.9)",
              borderRadius: 99, padding: "2px 7px",
            }}>{feature.badge}</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#a09c98", lineHeight: 1.6 }}>{feature.desc}</p>
      </div>
    </div>
  );
}

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
      return { d: `M ${x1},${y1} C ${x1},${cy} ${x2},${cy} ${x2},${y2}`, x2, y2 };
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
            <linearGradient id="chrome-line" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.15)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.60)"/>
            </linearGradient>
          </defs>
          {lines.map((line, i) => (
            <g key={i}>
              <path d={line.d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7}
                style={{ filter: "blur(3px)" }}/>
              <path d={line.d} fill="none" stroke="url(#chrome-line)" strokeWidth={1.5}
                strokeDasharray="600" strokeDashoffset="600"
                style={{ animation: `flow-in 0.9s cubic-bezier(.4,0,.2,1) forwards ${i * 0.11 + 0.1}s` }}/>
              <circle cx={line.x2} cy={line.y2} r={3.5} fill="rgba(255,255,255,0.7)"
                style={{ opacity: 0, animation: `node-in 0.3s ease forwards ${i * 0.11 + 0.8}s` }}/>
            </g>
          ))}
        </svg>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24, position: "relative", zIndex: 2 }}>
        <div ref={centerRef} style={{
          background: "rgba(255,255,255,0.06)",
          border: "1.5px solid rgba(255,255,255,0.18)",
          borderRadius: 22, padding: "16px 28px",
          backdropFilter: "blur(30px) saturate(1.4)",
          WebkitBackdropFilter: "blur(30px) saturate(1.4)",
          boxShadow: "0 14px 44px rgba(0,0,0,0.4), 0 2px 0 rgba(255,255,255,0.08) inset",
          textAlign: "center",
          animation: "center-in .45s ease forwards",
        }}>
          <div className="fr" style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em", color: "#f0ede8" }}>
            Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "#a09c98" }}>io</span>
          </div>
          <div style={{ fontSize: 11, color: "#605c58", marginTop: 2, fontWeight: 500 }}>Suunnittele kurssisi</div>
        </div>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, position: "relative", zIndex: 2,
      }}>
        {FEATURES.map((f, i) => (
          <div key={i} ref={el => nodeRefs.current[i] = el} style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16, padding: "12px 8px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.35), 0 1.5px 0 rgba(255,255,255,0.08) inset",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textAlign: "center",
            opacity: 0,
            animation: `node-in 0.5s ease forwards ${i * 0.08 + 0.25}s`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              background: CHROME,
              border: "1px solid rgba(255,255,255,0.75)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.8) inset",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "rgba(20,18,30,0.82)",
            }}>
              <svg width="16" height="16" viewBox={f.icon.props.viewBox}
                fill={f.icon.props.fill} stroke={f.icon.props.stroke}
                strokeWidth={f.icon.props.strokeWidth}
                strokeLinecap={f.icon.props.strokeLinecap}
                strokeLinejoin={f.icon.props.strokeLinejoin}>
                {f.icon.props.children}
              </svg>
            </div>
            <span className="fr" style={{ fontSize: 10, fontWeight: 500, color: "#a09c98", lineHeight: 1.3 }}>{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tryDemo = useCallback(() => {
    try { localStorage.setItem("lukkari.proDemo", "1"); } catch {}
    window.location.hash = "/pro-app";
  }, []);

  return (
    <div className="pi pro-pad" style={{ maxWidth: 760, margin: "0 auto", padding: "56px 20px 80px", position: "relative" }}>

      <ProInfoHero onTryDemo={tryDemo} />

      {/* Flow diagram */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 24, padding: "24px 20px 28px", marginBottom: 28,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#605c58", marginBottom: 20, textAlign: "center" }}>
          Mitä Pro tekee
        </div>
        <ProFlowDiagram />
      </div>

      {/* 3D feature cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 28 }}>
        {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i}/>)}
      </div>

      {/* Signup */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 20, padding: "28px",
        textAlign: "center",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}>
        <p className="fr" style={{ fontSize: 22, fontWeight: 500, color: "#f0ede8", marginBottom: 6 }}>Kiinnostuitko?</p>
        {submitted ? (
          <p style={{ fontSize: 14, color: "#a09c98", marginTop: 8 }}>Kiitos! Olet listalla — ilmoitamme heti kun avaamme.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#a09c98", marginBottom: 20, lineHeight: 1.6 }}>
              Jätä sähköpostisi — kerromme kun Pro avaa ovensa virallisesti.
            </p>
            <div className="email-row" style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
              <input type="email" placeholder="sinun@email.fi" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email.trim() && setSubmitted(true)}
                style={{
                  flex: 1, padding: "10px 16px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 13, outline: "none", color: "#f0ede8", fontFamily: "inherit",
                  transition: "border-color .14s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.24)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"}
              />
              <button onClick={() => email.trim() && setSubmitted(true)} disabled={!email.trim()} style={{
                padding: "10px 18px", borderRadius: 12, border: "none",
                background: email.trim()
                  ? "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))"
                  : "rgba(255,255,255,0.08)",
                color: email.trim() ? "white" : "#605c58",
                fontSize: 13, fontWeight: 600, cursor: email.trim() ? "pointer" : "default",
                boxShadow: email.trim() ? "0 4px 16px oklch(0.62 0.13 45 / 0.4)" : "none",
                transition: "all .14s", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>Ilmoittaudu</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
