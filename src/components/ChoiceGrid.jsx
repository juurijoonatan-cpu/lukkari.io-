import { useRef, useCallback } from 'react';
import { PTINTS } from '../data/schools';

export function ChoiceGrid({ school, selections, onChange }) {
  const refs = useRef({});

  const jump = useCallback((e, pi, bi) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const { palkkiCount, periodCount } = school;
    const dir = e.shiftKey ? -1 : 1;
    let np = pi, nb = bi + dir;
    if (nb > palkkiCount) { nb = 1; np = pi + 1; }
    else if (nb < 1) { nb = palkkiCount; np = pi - 1; }
    if (np > periodCount) { np = 1; nb = 1; }
    else if (np < 1) { np = periodCount; nb = palkkiCount; }
    refs.current[`p${np}-b${nb}`]?.focus();
  }, [school]);

  return (
    <div className="mx-scroll">
      <table style={{ borderCollapse: "separate", borderSpacing: "5px 4px", width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ width: 72 }}></th>
            {Array.from({ length: school.periodCount }, (_, pi) => {
              const t = PTINTS[pi];
              return (
                <th key={pi} style={{ textAlign: "center", padding: "0 2px 12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <span className="fr" style={{ fontSize: 24, fontWeight: 500, color: t.l, fontStyle: "italic", lineHeight: 1 }}>{pi + 1}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-f)" }}>periodi</span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: school.palkkiCount }, (_, bi) => (
            <tr key={bi}>
              <td style={{ padding: "1px 8px 1px 0", verticalAlign: "middle" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1 }}>
                  <span className="fr" style={{ fontSize: 19, fontWeight: 500, color: "var(--ink-s)", fontStyle: "italic" }}>{bi + 1}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-f)", marginTop: 1 }}>palkki</span>
                </div>
              </td>
              {Array.from({ length: school.periodCount }, (_, pi) => {
                const k = `p${pi + 1}-b${bi + 1}`, v = selections[k] || "", filled = v.trim().length > 0, t = PTINTS[pi];
                return (
                  <td key={pi} style={{ padding: 0 }}>
                    <div style={{
                      height: 54, borderRadius: 10,
                      background: filled ? t.bg : "rgba(255,255,255,0.42)",
                      border: `1.5px solid ${filled ? t.b : "rgba(255,255,255,0.82)"}`,
                      transition: "all .14s",
                      display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                    }}>
                      <input
                        ref={el => { if (el) refs.current[k] = el; else delete refs.current[k]; }}
                        className="ci"
                        type="text" value={v} placeholder="+"
                        maxLength={20}
                        onChange={e => onChange(k, e.target.value)}
                        onKeyDown={e => jump(e, pi + 1, bi + 1)}
                        style={{ fontSize: v.length > 8 ? 12 : 15 }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--ink-f)" }}>Tab-näppäimellä seuraavaan soluun →</span>
      </div>
    </div>
  );
}
