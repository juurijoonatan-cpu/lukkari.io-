import { useState, useEffect, useRef } from 'react';
import { SCHOOLS } from '../data/schools';
import { Ico } from './icons';

const CUSTOM_KEY = "lukkari.customSchool";

function loadCustomSchool() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}"); } catch { return {}; }
}

function saveCustomSchool(obj) {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(obj)); } catch {}
}

export function SchoolPicker({ schoolId, setSchoolId, isPro, dropdownZ = 50 }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("list"); // 'list' | 'form'
  const [customName, setCustomName] = useState("");
  const [customPeriods, setCustomPeriods] = useState(4);
  const [customPalkkis, setCustomPalkkis] = useState(6);
  const wrapRef = useRef(null);

  const custom = loadCustomSchool();
  const school = schoolId === "custom"
    ? { id: "custom", name: custom.name || "Oma koulu" }
    : (SCHOOLS.find(s => s.id === schoolId) || SCHOOLS[0]);

  useEffect(() => {
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setMode("list");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openCustomForm = () => {
    const c = loadCustomSchool();
    setCustomName(c.name || "");
    setCustomPeriods(c.periodCount || 4);
    setCustomPalkkis(c.palkkiCount || 6);
    setMode("form");
  };

  const saveCustom = () => {
    if (!customName.trim()) return;
    saveCustomSchool({ name: customName.trim(), periodCount: customPeriods, palkkiCount: customPalkkis });
    setSchoolId("custom");
    setOpen(false);
    setMode("list");
  };

  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 9, boxSizing: "border-box",
    background: "rgba(255,255,255,0.88)", border: "1.5px solid rgba(200,195,190,0.5)",
    fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1f1d1a",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", zIndex: dropdownZ }}>
      <button onClick={() => { setOpen(o => !o); setMode("list"); }} style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "8px 14px 8px 16px", borderRadius: 99, cursor: "pointer",
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        color: isPro ? (open ? "#f0ede8" : "#a09c98") : "#1f1d1a",
        background: isPro
          ? (open ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)")
          : (open ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.60)"),
        border: open
          ? `1.5px solid ${isPro ? "rgba(255,255,255,0.22)" : "oklch(0.60 0.13 45)"}`
          : `1.5px solid ${isPro ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.90)"}`,
        boxShadow: open
          ? `0 0 0 4px ${isPro ? "rgba(255,255,255,0.06)" : "oklch(0.60 0.13 45 / 0.15)"}, 0 4px 20px rgba(80,40,10,0.12)`
          : `0 2px 10px ${isPro ? "rgba(0,0,0,0.3)" : "rgba(80,40,10,0.07)"}`,
        backdropFilter: "blur(20px)",
        transition: "all .2s",
      }}>
        {school.name}
        <span style={{
          color: open ? (isPro ? "#f0ede8" : "oklch(0.60 0.13 45)") : (isPro ? "#605c58" : "#797470"),
          transition: "transform .2s, color .2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          display: "flex",
        }}>{Ico.chevron}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          borderRadius: 18, minWidth: 240,
          background: "rgba(255,255,255,0.72)",
          border: "1.5px solid rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          boxShadow: "0 20px 60px rgba(80,40,10,0.18), 0 1.5px 0 rgba(255,255,255,0.9) inset",
          overflow: "hidden",
        }}>
          {mode === "list" ? (
            <>
              {SCHOOLS.map((s, i) => (
                <button key={s.id} onClick={() => { setSchoolId(s.id); setOpen(false); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "12px 16px",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.55)",
                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                  fontSize: 13, fontWeight: s.id === schoolId ? 600 : 400,
                  color: s.id === schoolId ? "#1f1d1a" : "#797470",
                  background: s.id === schoolId ? "rgba(255,255,255,0.65)" : "transparent",
                  textAlign: "left", transition: "background .12s",
                }}
                onMouseEnter={e => { if (s.id !== schoolId) e.currentTarget.style.background = "rgba(255,255,255,0.40)"; }}
                onMouseLeave={e => { if (s.id !== schoolId) e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{s.name}</span>
                  {s.id === schoolId && (
                    <span style={{ color: "oklch(0.60 0.13 45)", display: "flex" }}>{Ico.check}</span>
                  )}
                </button>
              ))}
              {/* Custom school option */}
              <button onClick={openCustomForm} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "12px 16px",
                border: "none", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: schoolId === "custom" ? 600 : 400,
                color: schoolId === "custom" ? "#1f1d1a" : "#797470",
                background: schoolId === "custom" ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.10)",
                textAlign: "left", transition: "background .12s",
              }}
              onMouseEnter={e => { if (schoolId !== "custom") e.currentTarget.style.background = "rgba(255,255,255,0.40)"; }}
              onMouseLeave={e => { if (schoolId !== "custom") e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
              >
                <span>{schoolId === "custom" && custom.name ? custom.name : "✏️ Oma koulu…"}</span>
                <span style={{ fontSize: 11, color: "oklch(0.60 0.13 45)" }}>
                  {schoolId === "custom" ? Ico.check : "›"}
                </span>
              </button>
            </>
          ) : (
            /* Inline custom school form */
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#1f1d1a", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>Oma koulu</p>
              <div>
                <label style={{ fontSize: 11, color: "#797470", fontFamily: "inherit", display: "block", marginBottom: 4 }}>Koulun nimi</label>
                <input
                  style={inputSt}
                  placeholder="esim. Tapiolan lukio"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && saveCustom()}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#797470", fontFamily: "inherit", display: "block", marginBottom: 4 }}>
                    Periodeja <strong style={{ color: "#1f1d1a" }}>{customPeriods}</strong>
                  </label>
                  <input type="range" min={2} max={8} value={customPeriods}
                    onChange={e => setCustomPeriods(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "oklch(0.60 0.13 45)" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#797470", fontFamily: "inherit", display: "block", marginBottom: 4 }}>
                    Palkkeja <strong style={{ color: "#1f1d1a" }}>{customPalkkis}</strong>
                  </label>
                  <input type="range" min={2} max={12} value={customPalkkis}
                    onChange={e => setCustomPalkkis(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "oklch(0.60 0.13 45)" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveCustom} disabled={!customName.trim()} style={{
                  flex: 1, padding: "9px", borderRadius: 10, border: "none",
                  background: customName.trim() ? "oklch(0.60 0.13 45)" : "rgba(200,195,190,0.3)",
                  color: customName.trim() ? "white" : "#a09c98",
                  fontSize: 12, fontWeight: 600, cursor: customName.trim() ? "pointer" : "default",
                  fontFamily: "inherit", transition: "all .12s",
                }}>Tallenna</button>
                <button onClick={() => setMode("list")} style={{
                  padding: "9px 14px", borderRadius: 10,
                  background: "transparent", border: "1px solid rgba(200,195,190,0.5)",
                  color: "#797470", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>Peruuta</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
