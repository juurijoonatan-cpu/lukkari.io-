import { useState, useEffect, useCallback, useRef } from 'react';
import { loadState } from '../../utils/storage';
import { supabase } from '../../utils/supabase';
import { SCHOOLS, PTINTS } from '../../data/schools';

function buildScheduleContext(school, selections, year) {
  if (!school || !selections || !Object.keys(selections).length) return null;
  const lines = [`Koulu: ${school.name}`, `Lukuvuosi: ${year || "2026–2027"}`, ""];
  for (let pi = 1; pi <= school.periodCount; pi++) {
    const courses = [];
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      const v = selections[`p${pi}-b${bi}`];
      if (v?.trim()) courses.push(`  Palkki ${bi}: ${v.trim()}`);
    }
    if (courses.length) lines.push(`Periodi ${pi}:\n${courses.join("\n")}`);
  }
  return lines.join("\n");
}

async function callProxy(prompt, scheduleContext) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Istunto vanhentunut — kirjaudu uudelleen.");
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt, scheduleContext }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Virhe ${res.status}`);
  return data.content;
}

function ScheduleSummary({ school, selections, year }) {
  if (!school) return null;
  const filled = Object.entries(selections || {}).filter(([, v]) => v?.trim());
  if (!filled.length) {
    return (
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "#605c58", textAlign: "center" }}>
          Ei kursseja tallennettuna —{" "}
          <button onClick={() => { history.replaceState(null, "", window.location.pathname); window.dispatchEvent(new HashChangeEvent("hashchange")); }}
            style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>
            lisää kursseja ilmaisversiossa
          </button>.
        </p>
      </div>
    );
  }
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <span className="fr" style={{ fontSize: 15, fontWeight: 500, color: "#f0ede8" }}>{school.name}</span>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#605c58" }}>{year}</span>
      </div>
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
        {Array.from({ length: school.periodCount }, (_, pi) => {
          const courses = Array.from({ length: school.palkkiCount }, (_, bi) => {
            const v = (selections || {})[`p${pi + 1}-b${bi + 1}`];
            return v?.trim() ? { label: v.trim(), bi } : null;
          }).filter(Boolean);
          if (!courses.length) return null;
          return (
            <div key={pi} style={{ flexShrink: 0, minWidth: 120 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#605c58", marginBottom: 6 }}>P{pi + 1}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {courses.map(({ label, bi }, idx) => {
                  const t = PTINTS[bi % PTINTS.length];
                  return (
                    <span key={idx} style={{
                      fontSize: 10, fontWeight: 500, color: t.l,
                      background: `color-mix(in oklch, ${t.l} 12%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${t.l} 30%, transparent)`,
                      borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap",
                      maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis",
                    }}>{label}</span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 10, color: "#605c58", marginTop: 12 }}>
        {filled.length} kurssia · {school.periodCount} periodia
      </p>
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "orb-rotate 0.9s linear infinite", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

const SUGGESTED = [
  "Mitä kursseja suosittelisit minulle ylioppilaskirjoituksia varten?",
  "Onko aikataulussani konflikteja tai liian tiivistä rakennetta?",
  "Miten tasapainottaa reaal- ja kieliaineet parhaiten?",
  "Mitkä kurssit kannattaa ottaa ensin?",
];

export function ProApp() {
  const [schedule, setSchedule] = useState(null);
  const [school, setSchool] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [hasResponse, setHasResponse] = useState(false);
  const [requestsUsed, setRequestsUsed] = useState(null);
  const intervalRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("pro-dark");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { window.location.hash = "/pro-login"; return; }
      // Check subscription
      supabase.from("profiles").select("subscription_status").eq("id", session.user.id).single().then(({ data }) => {
        if (!["active", "trialing"].includes(data?.subscription_status || "")) {
          window.location.hash = "/pro-subscribe";
        }
      });
    });
    const s = loadState();
    setSchedule(s || {});
    const sc = SCHOOLS.find(x => x.id === (s?.schoolId || "otaniemi")) || SCHOOLS[0];
    setSchool(sc);
    return () => {
      document.body.classList.remove("pro-dark");
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goToFree = useCallback(() => {
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    history.replaceState(null, "", window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }, []);

  const startTypewriter = useCallback((text) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let i = 0;
    setDisplayedText("");
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) { clearInterval(intervalRef.current); intervalRef.current = null; }
      else if (responseRef.current) responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }, 11);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    const q = prompt.trim();
    if (!q || aiLoading) return;
    setAiLoading(true); setAiError(null); setHasResponse(false); setDisplayedText("");
    try {
      const context = buildScheduleContext(school, schedule?.selections, schedule?.year);
      const text = await callProxy(q, context);
      setHasResponse(true);
      startTypewriter(text);
      setRequestsUsed(r => (r || 0) + 1);
    } catch (err) {
      if (err.message?.includes("istunto") || err.message?.includes("Virheellinen")) {
        window.location.hash = "/pro-login";
        return;
      }
      if (err.message?.includes("tilaus")) {
        window.location.hash = "/pro-subscribe";
        return;
      }
      setAiError(err.message || "Tuntematon virhe — yritä uudelleen.");
    } finally {
      setAiLoading(false);
    }
  }, [prompt, aiLoading, school, schedule, startTypewriter]);

  return (
    <div style={{ minHeight: "100dvh", background: "#08080f", position: "relative" }}>
      <video autoPlay loop muted playsInline
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.20, zIndex: 0, pointerEvents: "none" }}
        src="/260037_medium.mp4"
      />

      <header style={{
        position: "sticky", top: 0, zIndex: 10, height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(8,6,22,0.84)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
      }}>
        <span className="fr" style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em", color: "#f0ede8" }}>
          Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "#a09c98" }}>io</span>{" "}
          <span style={{ color: "var(--accent)", fontStyle: "italic", fontSize: 15 }}>Pro</span>
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {requestsUsed !== null && (
            <span style={{ fontSize: 10, color: "#605c58", fontWeight: 500 }}>{requestsUsed}/300 kyselyä</span>
          )}
          <button onClick={goToFree} style={{
            fontSize: 11, fontWeight: 500, color: "#605c58", background: "none", border: "none",
            cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: "6px 8px", transition: "color 0.14s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#a09c98"}
          onMouseLeave={e => e.currentTarget.style.color = "#605c58"}
          >Vapaa versio</button>
          <button onClick={signOut} style={{
            fontSize: 11, fontWeight: 600, color: "#a09c98",
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 99, cursor: "pointer", fontFamily: "'Inter', sans-serif",
            padding: "6px 14px", transition: "all 0.14s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "#f0ede8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#a09c98"; }}
          >Kirjaudu ulos</button>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 22 }}>
          <h1 className="fr" style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em", color: "#f0ede8", lineHeight: 1.1, marginBottom: 5 }}>
            Kurssi<span style={{ color: "var(--accent)", fontStyle: "italic" }}>suosittelija</span>
          </h1>
          <p style={{ fontSize: 12, color: "#605c58" }}>AI analysoi lukujärjestyksesi ja antaa personoituja suosituksia</p>
        </div>

        <ScheduleSummary school={school} selections={schedule?.selections} year={schedule?.year} />

        {/* AI card */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: "22px 22px 20px",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 9, flexShrink: 0,
              background: "linear-gradient(135deg, rgba(130,100,255,0.35), rgba(80,50,200,0.50))",
              border: "1px solid rgba(130,100,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,180,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
              </svg>
            </div>
            <span className="fr" style={{ fontSize: 15, fontWeight: 500, color: "#f0ede8" }}>Kysy AI:lta</span>
          </div>

          {/* Suggested questions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {SUGGESTED.map((s, i) => (
              <button key={i} onClick={() => setPrompt(s)} style={{
                fontSize: 10, color: "#a09c98",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 99, padding: "4px 11px", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f0ede8"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#a09c98"; }}
              >{s}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder="Kysy kurssivalinnoista, aikataulusta, ylioppilaskirjoituksista…"
              rows={2}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 12,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)",
                color: "#f0ede8", fontSize: 13, outline: "none",
                fontFamily: "'Inter', sans-serif", resize: "none", lineHeight: 1.5,
                transition: "border-color 0.14s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"}
            />
            <button type="submit" disabled={!prompt.trim() || aiLoading} style={{
              padding: "11px 18px", borderRadius: 12, border: "none", flexShrink: 0,
              background: (prompt.trim() && !aiLoading)
                ? "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))"
                : "rgba(255,255,255,0.06)",
              color: (prompt.trim() && !aiLoading) ? "white" : "#605c58",
              fontSize: 12, fontWeight: 600, cursor: (prompt.trim() && !aiLoading) ? "pointer" : "default",
              fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.14s",
              boxShadow: (prompt.trim() && !aiLoading) ? "0 4px 16px oklch(0.62 0.13 45 / 0.38)" : "none",
            }}>
              {aiLoading ? <><SpinnerIcon/> Analysoidaan…</> : "Analysoi"}
            </button>
          </form>

          {(hasResponse || aiLoading || aiError) && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {aiError ? (
                <p style={{ fontSize: 12, color: "oklch(0.72 0.14 20)", background: "rgba(255,80,60,0.08)", border: "1px solid rgba(255,80,60,0.16)", borderRadius: 10, padding: "10px 14px" }}>{aiError}</p>
              ) : (
                <div ref={responseRef} style={{
                  fontSize: 13, color: "#d4cfc8", lineHeight: 1.72,
                  maxHeight: 420, overflowY: "auto",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                  {displayedText}
                  {aiLoading && !displayedText && <span style={{ color: "#605c58", display: "flex", alignItems: "center", gap: 7 }}><SpinnerIcon/> Ajatellaan…</span>}
                  {hasResponse && intervalRef.current && (
                    <span style={{ display: "inline-block", width: 2, height: "1em", background: "var(--accent)", marginLeft: 1, verticalAlign: "text-bottom", animation: "orb-pulse 0.85s ease-in-out infinite" }}/>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.10)", textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
          Vastauksesi generoidaan OpenAI gpt-4o-mini-mallilla · Tietoja ei lähetetä Lukkari.io:n palvelimille
        </p>
      </main>
    </div>
  );
}
