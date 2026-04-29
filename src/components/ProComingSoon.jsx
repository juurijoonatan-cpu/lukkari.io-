import { useState, useCallback } from 'react';
import { ProInfoHero } from './pro/info/ProInfoHero';
import { ProInfoStats } from './pro/info/ProInfoStats';
import { ProInfoFlow } from './pro/info/ProInfoFlow';
import { ProInfoFeatures } from './pro/info/ProInfoFeatures';
import './pro/info/proInfo.css';

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

      <ProInfoStats />

      <ProInfoFlow />

      <ProInfoFeatures />

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
          <p style={{ fontSize: 14, color: "#a09c98", marginTop: 8 }}>Kiitos. Olet listalla, ilmoitamme heti kun avaamme.</p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#a09c98", marginBottom: 20, lineHeight: 1.6 }}>
              Jätä sähköpostisi. Kerromme kun Pro avaa ovensa virallisesti.
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
