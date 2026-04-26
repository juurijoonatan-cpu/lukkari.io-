import { useState, useEffect, useCallback } from 'react';
import { getProKey, setProKey } from '../../utils/storage';

function injectProKeyframes() {
  if (document.getElementById("pro-kf")) return;
  const el = document.createElement("style");
  el.id = "pro-kf";
  el.textContent = `
    @keyframes orb-pulse {
      0%,100% { opacity:0.72; transform:scale(1); }
      50% { opacity:1; transform:scale(1.10); }
    }
    @keyframes pro-fade-in {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes orb-rotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(el);
}
injectProKeyframes();

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function GlowingOrb() {
  return (
    <div style={{ position: "relative", width: 88, height: 88, margin: "0 auto 32px", flexShrink: 0 }}>
      {/* Outer ambient glow */}
      <div style={{
        position: "absolute", inset: -24, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,90,255,0.40) 0%, rgba(80,50,200,0.18) 45%, transparent 70%)",
        filter: "blur(18px)",
        animation: "orb-pulse 3.5s ease-in-out infinite",
        pointerEvents: "none",
      }}/>
      {/* Inner secondary glow ring */}
      <div style={{
        position: "absolute", inset: -8, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(140,110,255,0.22) 0%, transparent 65%)",
        filter: "blur(8px)",
        animation: "orb-pulse 3.5s ease-in-out infinite 0.4s",
        pointerEvents: "none",
      }}/>
      {/* Sphere */}
      <div style={{
        width: 88, height: 88, borderRadius: "50%", position: "relative",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.70) 0%, rgba(200,180,255,0.55) 15%, rgba(100,70,220,0.88) 45%, rgba(35,20,100,0.97) 72%, rgba(8,6,20,1) 100%)",
        boxShadow: "0 0 28px rgba(110,80,230,0.55), 0 0 56px rgba(80,50,190,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)",
      }}>
        {/* Specular highlight */}
        <div style={{
          position: "absolute", top: 16, left: 20,
          width: 22, height: 13, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.80) 0%, transparent 100%)",
          filter: "blur(2.5px)",
          transform: "rotate(-18deg)",
        }}/>
        {/* Secondary soft highlight */}
        <div style={{
          position: "absolute", bottom: 18, right: 16,
          width: 10, height: 8, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(180,160,255,0.35) 0%, transparent 100%)",
          filter: "blur(3px)",
        }}/>
      </div>
    </div>
  );
}

export function ProLogin() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("pro-dark");
    if (getProKey()) window.location.hash = "/pro-app";
    return () => document.body.classList.remove("pro-dark");
  }, []);

  const goBack = useCallback(() => {
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) { setError("Anna OpenAI API-avaimesi."); return; }
    if (!trimmed.startsWith("sk-")) { setError("Avain ei ole oikeassa muodossa — sen tulee alkaa sk-…"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { "Authorization": `Bearer ${trimmed}` },
      });
      if (res.ok) {
        setProKey(trimmed);
        window.location.hash = "/pro-app";
      } else if (res.status === 401 || res.status === 403) {
        setError("Virheellinen API-avain — tarkista avain OpenAI-dashboardista.");
      } else {
        setError(`Virhe (${res.status}) — yritä uudelleen.`);
      }
    } catch {
      setError("Verkkovirhe — tarkista internetyhteytesi.");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const inputBase = {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#f0ede8", fontSize: 13, outline: "none",
    fontFamily: "'Courier New', 'Menlo', monospace",
    letterSpacing: "0.04em", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "#08080f",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Wave video background */}
      <video autoPlay loop muted playsInline
        style={{
          position: "fixed", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.38, zIndex: 0, pointerEvents: "none",
        }}
        src="/260037_medium.mp4"
      />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "calc(100% - 32px)", maxWidth: 400,
        background: "rgba(10,8,22,0.82)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 28,
        backdropFilter: "blur(40px) saturate(1.3)",
        WebkitBackdropFilter: "blur(40px) saturate(1.3)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset",
        padding: "clamp(28px, 7vw, 52px) clamp(22px, 6vw, 44px) clamp(24px, 6vw, 40px)",
        animation: "pro-fade-in 0.5s cubic-bezier(.4,0,.2,1) forwards",
      }}>
        <GlowingOrb />

        <h1 className="fr" style={{
          fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em",
          color: "#f0ede8", marginBottom: 8, textAlign: "center", lineHeight: 1.1,
        }}>
          Lukkari<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.</span>
          <span style={{ color: "#a09c98" }}>io</span>{" "}
          <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Pro</span>
        </h1>
        <p style={{ fontSize: 12, color: "#605c58", textAlign: "center", marginBottom: 28, lineHeight: 1.5 }}>
          Anna OpenAI API-avaimesi kirjautuaksesi
        </p>

        <form onSubmit={handleSubmit}>
          {/* API key input with eye toggle */}
          <div style={{ position: "relative", marginBottom: error ? 10 : 16 }}>
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setError(null); }}
              placeholder="sk-..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                ...inputBase,
                paddingRight: 44,
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <button
              type="button"
              onClick={() => setShowKey(s => !s)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#605c58", padding: 4, display: "flex",
              }}
              tabIndex={-1}
            >
              <EyeIcon open={showKey} />
            </button>
          </div>

          {error && (
            <p style={{
              fontSize: 11, color: "oklch(0.72 0.14 20)", marginBottom: 14,
              background: "rgba(255,80,60,0.09)", border: "1px solid rgba(255,80,60,0.18)",
              borderRadius: 8, padding: "8px 12px", lineHeight: 1.5,
            }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 20px", borderRadius: 14, border: "none",
              background: loading
                ? "rgba(200,195,210,0.18)"
                : "linear-gradient(135deg, rgba(240,237,232,0.94) 0%, rgba(210,205,225,0.90) 100%)",
              color: loading ? "#a09c98" : "rgba(8,6,22,0.88)",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.10em",
              cursor: loading ? "default" : "pointer",
              fontFamily: "'Inter', sans-serif",
              boxShadow: loading ? "none" : "0 4px 20px rgba(200,180,255,0.22)",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Tarkistetaan…" : "KIRJAUDU SISÄÄN"}
          </button>
        </form>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <button
            onClick={goBack}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#605c58", fontSize: 11, fontFamily: "'Inter', sans-serif",
              display: "flex", alignItems: "center", gap: 5,
              transition: "color 0.14s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#a09c98"}
            onMouseLeave={e => e.currentTarget.style.color = "#605c58"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Takaisin etusivulle
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 20, letterSpacing: "0.08em" }}>
          VERSION 0.1 · BETA
        </p>
      </div>
    </div>
  );
}
