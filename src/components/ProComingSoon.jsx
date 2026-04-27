import { useState, useCallback } from 'react';
import { Ico } from './icons';

const FEATURES = [
  { icon: Ico.sparkle, label: "Kurssisuosittelija", desc: "AI suosittelee kurssit juuri sinulle — ylioppilaskirjoitukset ja hakukohteet huomioiden.", badge: "Tärkein" },
  { icon: Ico.book,    label: "Lukusuunnitelma",    desc: "AI rakentaa selkeän suunnitelman: mitä opiskella ensin ja kuinka paljon aikaa kuhunkin." },
  { icon: Ico.timer,   label: "Lukuaikataulu kokeisiin", desc: "Syötä koepäivä, saat optimaalisen kertausaikataulun — tasainen tahti, ei viime hetken pänttäystä." },
  { icon: Ico.conflict, label: "Konfliktianalyysi", desc: "Tunnistaa automaattisesti aikatauluristiriidat ennen kuin ne aiheuttavat ongelmia." },
  { icon: Ico.calendar, label: "Kalenteri-export",  desc: "Vie lukujärjestyksesi suoraan Google- tai Apple-kalenteriin." },
  { icon: Ico.download, label: "PDF-export",        desc: "Tallenna tai tulosta lukujärjestyksesi näyttävänä PDF:nä." },
  { icon: Ico.shield,   label: "Pilvivarmuuskopio", desc: "Kurssivalintasi tallessa pilvipalvelussa — vaihda laitetta huoletta." },
];

const CHROME = "linear-gradient(145deg, #c8c8d0 0%, #f0f0f8 38%, #e4e4ec 56%, #9898a4 80%, #d4d4de 100%)";

export function ProComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const tryDemo = useCallback(() => {
    localStorage.setItem("lukkari.proDemo", "1");
    window.location.hash = "/pro-app";
  }, []);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 20px 80px", position: "relative" }}>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: CHROME, borderRadius: 99, padding: "5px 16px",
          marginBottom: 22, boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
        }}>
          <span style={{ color: "rgba(20,18,30,0.85)", display: "flex" }}>{Ico.star}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(20,18,30,0.85)", letterSpacing: "0.06em" }}>BETA</span>
        </div>

        <h1 className="fr" style={{ fontSize: 58, fontWeight: 500, letterSpacing: "-0.03em", color: "#f0ede8", marginBottom: 14, lineHeight: 1.05 }}>
          Lukkari <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Pro</span>
        </h1>
        <p style={{ fontSize: 15, color: "#a09c98", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.7 }}>
          AI analysoi lukujärjestyksesi, rakentaa lukusuunnitelman ja optimoi kokeisiin valmistautumisen.
        </p>

        {/* Primary CTA */}
        <button onClick={tryDemo} style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "15px 36px", borderRadius: 99, border: "none",
          background: "linear-gradient(135deg, rgba(240,237,232,0.96), rgba(210,205,225,0.92))",
          color: "rgba(8,6,22,0.88)", fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
          cursor: "pointer", fontFamily: "'Inter', sans-serif",
          boxShadow: "0 6px 28px rgba(200,180,255,0.30), 0 1px 0 rgba(255,255,255,0.9) inset",
          transition: "all 0.16s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(200,180,255,0.42), 0 1px 0 rgba(255,255,255,0.9) inset"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(200,180,255,0.30), 0 1px 0 rgba(255,255,255,0.9) inset"; }}
        >
          <span style={{ display: "flex" }}>{Ico.sparkle}</span>
          Tutustu demoon
          <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
        </button>
        <p style={{ fontSize: 11, color: "#605c58", marginTop: 11 }}>
          Ei rekisteröitymistä · näet heti miltä se näyttää
        </p>
      </div>

      {/* Feature list — liquid glass card */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 24, padding: "28px 24px",
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
        marginBottom: 20,
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#605c58", marginBottom: 20 }}>
          Mitä Pro sisältää
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0",
              borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11, flexShrink: 0, marginTop: 1,
                background: CHROME,
                border: "1px solid rgba(255,255,255,0.75)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.8) inset",
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                  <span className="fr" style={{ fontSize: 14, fontWeight: 500, color: "#f0ede8" }}>{f.label}</span>
                  {f.badge && (
                    <span style={{
                      fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                      background: CHROME, color: "rgba(20,18,30,0.9)", borderRadius: 99, padding: "2px 7px",
                    }}>{f.badge}</span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#605c58", lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#605c58", marginBottom: 10 }}>Tulossa myöhemmin:</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["Drive-integraatio", "Projektianalyysi", "Tiimitili"].map(tag => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 500, color: "rgba(180,160,255,0.55)",
                background: "rgba(120,90,255,0.08)", border: "1px solid rgba(120,90,255,0.16)",
                borderRadius: 99, padding: "3px 10px",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Kiinnostuitko? */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 22, padding: "28px 24px",
        backdropFilter: "blur(40px) saturate(1.4)",
        WebkitBackdropFilter: "blur(40px) saturate(1.4)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
        textAlign: "center",
      }}>
        <p className="fr" style={{ fontSize: 22, fontWeight: 500, color: "#f0ede8", marginBottom: 6 }}>
          Kiinnostuitko?
        </p>
        {submitted ? (
          <p style={{ fontSize: 13, color: "#a09c98", marginTop: 8 }}>
            Kiitos! Olet listalla — ilmoitamme heti kun avaamme.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#605c58", marginBottom: 18, lineHeight: 1.6 }}>
              Jätä sähköpostisi — kerromme kun Pro avaa ovensa virallisesti.
            </p>
            <div style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
              <input type="email" placeholder="sinun@email.fi" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && email.trim() && setSubmitted(true)}
                style={{
                  flex: 1, padding: "11px 16px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  fontSize: 13, outline: "none", color: "#f0ede8", fontFamily: "inherit",
                  transition: "border-color .14s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.24)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
              />
              <button onClick={() => email.trim() && setSubmitted(true)} disabled={!email.trim()} style={{
                padding: "11px 18px", borderRadius: 12, border: "none",
                background: email.trim()
                  ? "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))"
                  : "rgba(255,255,255,0.07)",
                color: email.trim() ? "white" : "#605c58",
                fontSize: 13, fontWeight: 600,
                cursor: email.trim() ? "pointer" : "default",
                boxShadow: email.trim() ? "0 4px 16px oklch(0.62 0.13 45 / 0.4)" : "none",
                fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .14s",
              }}>Ilmoittaudu</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
