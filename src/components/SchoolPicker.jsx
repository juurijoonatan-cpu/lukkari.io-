import { useState, useEffect, useRef } from 'react';
import { SCHOOLS } from '../data/schools';
import { Ico } from './icons';

export function SchoolPicker({ schoolId, setSchoolId }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const school = SCHOOLS.find(s => s.id === schoolId) || SCHOOLS[0];

  useEffect(() => {
    const h = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", zIndex: 200 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "8px 14px 8px 16px", borderRadius: 99, cursor: "pointer",
        fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
        color: "#1f1d1a",
        background: open ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.60)",
        border: open ? "1.5px solid oklch(0.60 0.13 45)" : "1.5px solid rgba(255,255,255,0.90)",
        boxShadow: open
          ? "0 0 0 4px oklch(0.60 0.13 45 / 0.15), 0 4px 20px rgba(80,40,10,0.12)"
          : "0 2px 10px rgba(80,40,10,0.07)",
        backdropFilter: "blur(20px)",
        transition: "all .2s",
      }}>
        {school.name}
        <span style={{
          color: open ? "oklch(0.60 0.13 45)" : "#797470",
          transition: "transform .2s, color .2s",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          display: "flex",
        }}>{Ico.chevron}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          borderRadius: 18, overflow: "hidden", minWidth: 230,
          background: "rgba(255,255,255,0.72)",
          border: "1.5px solid rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px) saturate(1.8)",
          WebkitBackdropFilter: "blur(32px) saturate(1.8)",
          boxShadow: "0 20px 60px rgba(80,40,10,0.18), 0 1.5px 0 rgba(255,255,255,0.9) inset",
        }}>
          {SCHOOLS.map((s, i) => (
            <button key={s.id} onClick={() => { setSchoolId(s.id); setOpen(false); }} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "12px 16px",
              border: "none",
              borderBottom: i < SCHOOLS.length - 1 ? "1px solid rgba(255,255,255,0.55)" : "none",
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
        </div>
      )}
    </div>
  );
}
