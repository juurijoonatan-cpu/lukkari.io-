import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../utils/supabase';
import { isDemoAllowed, enableDemo } from '../../utils/demo';

const FEATURES = [
  "Kurssisuosittelija — AI suosittelee kurssit juuri sinulle",
  "Lukusuunnitelma — AI rakentaa aikataulun opinnoille",
  "Lukuaikataulu kokeisiin — syötä koepäivä, saat kertausaikataulun",
  "Konfliktianalyysi — tunnistaa aikatauluristiriidat",
  "Kalenteri-export (Google / Apple)",
  "PDF-tulostus lukujärjestyksestä",
  "Pilvitallennus & varmuuskopiointi",
  "300 AI-kyselyä kuukaudessa",
];

export function ProSubscribe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'

  useEffect(() => {
    document.body.classList.add("pro-dark");
    return () => document.body.classList.remove("pro-dark");
  }, []);

  const goBack = useCallback(() => {
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const handleSubscribe = useCallback(async () => {
    setLoading(true); setError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.hash = "/pro-login"; return; }

    try {
      const res = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ billing }),
        }
      );
      if (!res.ok) {
        if (res.status === 404 || res.status >= 500) {
          setError("Maksuintegraatio (Stripe) ei ole vielä otettu käyttöön. Voit kuitenkin esikatsella Pro-näkymää alta.");
        } else {
          let msg = `Virhe ${res.status} kassalle siirryttäessä.`;
          try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
          setError(msg);
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setError(data.error || "Virhe kassalle siirryttäessä.");
      setLoading(false);
    } catch {
      setError("Verkkovirhe — Edge Functions ei välttämättä ole vielä otettu käyttöön. Voit kuitenkin esikatsella Pro-näkymää alta.");
      setLoading(false);
    }
  }, [billing]);

  const previewDemo = useCallback(() => {
    if (!enableDemo()) return;
    window.location.hash = "/pro-app";
  }, []);
  const showDemoButton = isDemoAllowed();

  const CHROME = "linear-gradient(145deg, #c8c8d0 0%, #f0f0f8 38%, #e4e4ec 56%, #9898a4 80%, #d4d4de 100%)";

  return (
    <div style={{ minHeight: "100dvh", background: "#08080f", position: "relative", overflow: "hidden" }}>
      <video autoPlay loop muted playsInline
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28, zIndex: 0, pointerEvents: "none" }}
        src="/260037_medium.mp4"
      />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10, height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(8,6,22,0.80)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
      }}>
        <span className="fr" style={{ fontSize: 16, fontWeight: 500, color: "#f0ede8" }}>
          Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "#a09c98" }}>io</span>{" "}
          <span style={{ color: "var(--accent)", fontStyle: "italic", fontSize: 14 }}>Pro</span>
        </span>
        <button onClick={goBack} style={{
          fontSize: 11, color: "#605c58", background: "none", border: "none",
          cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "color 0.14s",
        }}
        onMouseEnter={e => e.currentTarget.style.color = "#a09c98"}
        onMouseLeave={e => e.currentTarget.style.color = "#605c58"}
        >← Etusivu</button>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px 80px", position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: CHROME, borderRadius: 99, padding: "4px 14px", marginBottom: 18,
            boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="rgba(20,18,30,0.85)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(20,18,30,0.85)", letterSpacing: "0.08em" }}>LUKKARI PRO</span>
          </div>
          <h1 className="fr" style={{ fontSize: 42, fontWeight: 500, letterSpacing: "-0.03em", color: "#f0ede8", lineHeight: 1.05, marginBottom: 12 }}>
            Lukuvuosisuunnittelu <span style={{ color: "var(--accent)", fontStyle: "italic" }}>älykkäästi</span>
          </h1>
          <p style={{ fontSize: 14, color: "#a09c98", lineHeight: 1.7 }}>
            AI analysoi kurssivalintasi ja suosittelee optimaalisen polun ylioppilaskirjoituksiin.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 99, padding: 3, gap: 2 }}>
            {[["monthly","Kuukausittain"], ["yearly","Vuosittain"]].map(([b, label]) => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "7px 18px", borderRadius: 99, border: "none",
                background: billing === b ? "rgba(255,255,255,0.12)" : "transparent",
                color: billing === b ? "#f0ede8" : "#605c58",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.14s",
              }}>
                {label}
                {b === "yearly" && <span style={{ fontSize: 9, marginLeft: 5, color: "oklch(0.72 0.13 150)", fontWeight: 700 }}>−37%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing card */}
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 24, padding: "32px 28px",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset",
          marginBottom: 16,
        }}>
          {/* Price */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
              <span className="fr" style={{ fontSize: 52, fontWeight: 500, color: "#f0ede8", lineHeight: 1 }}>
                {billing === "monthly" ? "3,99" : "2,49"}
              </span>
              <div style={{ paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: "#a09c98", fontWeight: 500 }}>€</span>
                <span style={{ fontSize: 12, color: "#605c58", display: "block" }}>/kk</span>
              </div>
            </div>
            {billing === "yearly" && (
              <p style={{ fontSize: 11, color: "oklch(0.72 0.13 150)" }}>
                Laskutetaan €29.90/vuosi · Säästät €17.98 vuodessa
              </p>
            )}
            <p style={{ fontSize: 11, color: "#605c58", marginTop: 4 }}>
              7 päivän ilmainen kokeilujakso · Ei sitoutumista
            </p>
          </div>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  background: "rgba(100,80,220,0.22)", border: "1px solid rgba(100,80,220,0.40)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(180,160,255,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: "#d4cfc8", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>

          {error && (
            <p style={{ fontSize: 11, color: "oklch(0.72 0.14 20)", marginBottom: 14, background: "rgba(255,80,60,0.09)", border: "1px solid rgba(255,80,60,0.18)", borderRadius: 8, padding: "8px 12px" }}>{error}</p>
          )}

          <button onClick={handleSubscribe} disabled={loading} style={{
            width: "100%", padding: "15px 20px", borderRadius: 14, border: "none",
            background: loading
              ? "rgba(200,195,210,0.12)"
              : "linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))",
            color: loading ? "#a09c98" : "rgba(8,6,22,0.90)",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.07em",
            cursor: loading ? "default" : "pointer",
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? "none" : "0 6px 24px rgba(200,180,255,0.24)",
            transition: "all 0.14s",
          }}>
            {loading ? "Siirrytään kassalle…" : "ALOITA 7 PVÄ ILMAINEN KOKEILU"}
          </button>
          <p style={{ textAlign: "center", fontSize: 10, color: "#605c58", marginTop: 12 }}>
            Ei luottokorttia kokeilujaksolle · Peruuta milloin tahansa
          </p>
        </div>

        {showDemoButton && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={previewDemo} style={{
              background: "rgba(120,90,255,0.10)",
              border: "1px solid rgba(120,90,255,0.28)",
              color: "rgba(180,160,255,0.95)",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
              borderRadius: 99, padding: "8px 18px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", transition: "all 0.14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(120,90,255,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(120,90,255,0.10)"; }}
            >ESIKATSELE PRO DEMONA →</button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.04em" }}>
          Maksu käsitellään turvallisesti Stripe-palvelun kautta
        </p>
      </main>
    </div>
  );
}
