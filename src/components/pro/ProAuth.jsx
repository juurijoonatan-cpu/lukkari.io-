import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { isDemoAllowed, enableDemo } from '../../utils/demo';

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
      from { transform:rotate(0deg); }
      to   { transform:rotate(360deg); }
    }
  `;
  document.head.appendChild(el);
}
injectProKeyframes();

function GlowingOrb() {
  return (
    <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 28px", flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: -22, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(120,90,255,0.38) 0%, rgba(80,50,200,0.15) 45%, transparent 70%)",
        filter: "blur(18px)", animation: "orb-pulse 3.5s ease-in-out infinite", pointerEvents: "none",
      }}/>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", position: "relative",
        background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.68) 0%, rgba(200,180,255,0.52) 15%, rgba(100,70,220,0.88) 45%, rgba(35,20,100,0.97) 72%, rgba(8,6,20,1) 100%)",
        boxShadow: "0 0 28px rgba(110,80,230,0.52), 0 0 56px rgba(80,50,190,0.26), inset 0 1.5px 0 rgba(255,255,255,0.22)",
      }}>
        <div style={{
          position: "absolute", top: 15, left: 18, width: 20, height: 12, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.78) 0%, transparent 100%)",
          filter: "blur(2.5px)", transform: "rotate(-18deg)",
        }}/>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

async function checkAndRoute() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", session.user.id)
      .single();
    const active = ["active", "trialing"].includes(profile?.subscription_status || "");
    window.location.hash = active ? "/pro-app" : "/pro-subscribe";
  } catch {
    // profiles table not yet set up — send to subscribe page
    window.location.hash = "/pro-subscribe";
  }
}

export function ProAuth({ initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [ageOk, setAgeOk] = useState(false);
  const [tosOk, setTosOk] = useState(false);

  useEffect(() => {
    document.body.classList.add("pro-dark");
    const storedError = sessionStorage.getItem("pro_auth_error");
    if (storedError) {
      sessionStorage.removeItem("pro_auth_error");
      setError(storedError);
    } else {
      checkAndRoute();
    }
    return () => document.body.classList.remove("pro-dark");
  }, []);

  const goBack = useCallback(() => {
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) { setError(err.message); setLoading(false); return; }
    await checkAndRoute();
    setLoading(false);
  }, [email, password]);

  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (!ageOk || !tosOk) {
      setError("Vahvista ikäraja ja hyväksy käyttöehdot ennen tilin luomista.");
      return;
    }
    if (password.length < 8) { setError("Salasanan tulee olla vähintään 8 merkkiä."); return; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: `${window.location.origin}/#/pro-login` },
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setInfo("Tarkista sähköpostisi ja vahvista osoite ennen kirjautumista.");
    setLoading(false);
  }, [email, password, ageOk, tosOk]);

  const previewDemo = useCallback(() => {
    if (!enableDemo()) return;
    window.location.hash = "/pro-app";
  }, []);
  const showDemoButton = isDemoAllowed();

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 11, boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.11)",
    color: "#f0ede8", fontSize: 13, outline: "none", fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.14s",
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#08080f", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <video autoPlay loop muted playsInline
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.36, zIndex: 0, pointerEvents: "none" }}
        src="/260037_medium.mp4"
      />
      <div style={{
        position: "relative", zIndex: 1,
        width: "calc(100% - 32px)", maxWidth: 400,
        background: "rgba(10,8,22,0.83)", border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 26, backdropFilter: "blur(40px) saturate(1.3)", WebkitBackdropFilter: "blur(40px) saturate(1.3)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.06) inset",
        padding: "clamp(28px,7vw,50px) clamp(22px,6vw,40px) clamp(24px,6vw,38px)",
        animation: "pro-fade-in 0.45s cubic-bezier(.4,0,.2,1) forwards",
      }}>
        <GlowingOrb />

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1 className="fr" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1.1, margin: 0 }}>
            Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "#605c58" }}>io</span>{" "}
            <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Pro</span>
          </h1>
          <p style={{ fontSize: 11, color: "#605c58", marginTop: 5, letterSpacing: "0.02em" }}>
            AI-pohjainen kurssisuosittelija
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 24 }}>
          {[["login","Kirjaudu"], ["register","Luo tili"]].map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setError(null); setInfo(null); }} style={{
              flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
              background: tab === t ? "rgba(255,255,255,0.10)" : "transparent",
              color: tab === t ? "#f0ede8" : "#605c58",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Inter', sans-serif", transition: "all 0.14s",
              boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.25)" : "none",
            }}>{label}</button>
          ))}
        </div>

        <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            <input type="email" placeholder="sähköposti@esimerkki.fi" value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              autoComplete={tab === "login" ? "email" : "email"}
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.26)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"}
            />
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} placeholder="Salasana" value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                style={{ ...inputStyle, paddingRight: 42 }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.26)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"}
              />
              <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#605c58",
                display: "flex", padding: 3,
              }}><EyeIcon open={showPw}/></button>
            </div>
          </div>

          {tab === "login" && (
            <div style={{ textAlign: "right", marginBottom: 14 }}>
              <button type="button" onClick={async () => {
                if (!email.trim()) { setError("Kirjoita sähköpostiosoitteesi ensin."); return; }
                setLoading(true);
                await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/#/pro-login` });
                setInfo("Salasanan palautuslinkki lähetetty sähköpostiisi.");
                setLoading(false);
              }} style={{ background: "none", border: "none", fontSize: 11, color: "#605c58", cursor: "pointer", fontFamily: "inherit" }}>
                Unohdin salasanani
              </button>
            </div>
          )}

          {tab === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <label style={{
                display: "flex", gap: 9, alignItems: "flex-start",
                fontSize: 11, color: "#a09c98", lineHeight: 1.5, cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={ageOk}
                  onChange={e => { setAgeOk(e.target.checked); setError(null); }}
                  style={{ marginTop: 2, flexShrink: 0, accentColor: "var(--accent)" }}
                />
                <span>Olen vähintään 13-vuotias.</span>
              </label>
              <label style={{
                display: "flex", gap: 9, alignItems: "flex-start",
                fontSize: 11, color: "#a09c98", lineHeight: 1.5, cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={tosOk}
                  onChange={e => { setTosOk(e.target.checked); setError(null); }}
                  style={{ marginTop: 2, flexShrink: 0, accentColor: "var(--accent)" }}
                />
                <span>
                  Hyväksyn{" "}
                  <a href="#/kayttoehdot" target="_blank" rel="noreferrer" style={{ color: "#d4cfc8", textDecoration: "underline" }}>
                    käyttöehdot
                  </a>{" "}ja olen lukenut{" "}
                  <a href="#/tietosuoja" target="_blank" rel="noreferrer" style={{ color: "#d4cfc8", textDecoration: "underline" }}>
                    tietosuojaselosteen
                  </a>.
                </span>
              </label>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 11, color: "oklch(0.72 0.14 20)", marginBottom: 12, background: "rgba(255,80,60,0.09)", border: "1px solid rgba(255,80,60,0.18)", borderRadius: 8, padding: "8px 12px", lineHeight: 1.5 }}>{error}</p>
          )}
          {info && (
            <p style={{ fontSize: 11, color: "oklch(0.72 0.13 150)", marginBottom: 12, background: "rgba(60,200,100,0.07)", border: "1px solid rgba(60,200,100,0.18)", borderRadius: 8, padding: "8px 12px", lineHeight: 1.5 }}>{info}</p>
          )}

          {(() => {
            const blocked = loading || !email.trim() || !password || (tab === "register" && (!ageOk || !tosOk));
            return (
              <button type="submit" disabled={blocked} style={{
                width: "100%", padding: "13px 20px", borderRadius: 13, border: "none",
                background: blocked
                  ? "rgba(200,195,210,0.12)"
                  : "linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))",
                color: blocked ? "#a09c98" : "rgba(8,6,22,0.90)",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.09em",
                cursor: blocked ? "default" : "pointer",
                fontFamily: "'Inter', sans-serif",
                boxShadow: blocked ? "none" : "0 4px 20px rgba(200,180,255,0.22)",
                transition: "all 0.14s",
              }}>
                {loading ? "Odota…" : tab === "login" ? "KIRJAUDU SISÄÄN" : "LUO TILI"}
              </button>
            );
          })()}
        </form>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <button onClick={goBack} style={{
            background: "none", border: "none", cursor: "pointer", color: "#605c58",
            fontSize: 11, fontFamily: "'Inter', sans-serif",
            display: "flex", alignItems: "center", gap: 5, transition: "color 0.14s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#a09c98"}
          onMouseLeave={e => e.currentTarget.style.color = "#605c58"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Takaisin etusivulle
          </button>
        </div>

        {showDemoButton && (
          <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <button onClick={previewDemo} style={{
              background: "rgba(120,90,255,0.10)",
              border: "1px solid rgba(120,90,255,0.28)",
              color: "rgba(180,160,255,0.95)",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              borderRadius: 99, padding: "6px 14px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", transition: "all 0.14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,90,255,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(120,90,255,0.10)"; }}
            >ESIKATSELE PRO DEMONA →</button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.13)", marginTop: 18, letterSpacing: "0.08em" }}>
          VERSION 0.1 · BETA
        </p>
      </div>
    </div>
  );
}
