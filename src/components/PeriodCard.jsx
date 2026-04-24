import { PTINTS } from '../data/schools';

export function PeriodCard({ pi, school, selections }) {
  const t = PTINTS[pi];
  const { rotation, times, days, palkkiCount } = school;
  const count = Array.from({ length: palkkiCount }, (_, bi) => selections[`p${pi + 1}-b${bi + 1}`]?.trim() ? 1 : 0).reduce((a, b) => a + b, 0);

  return (
    <div className="glass" style={{ borderRadius: 20, padding: "20px 18px", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span className="fr" style={{ fontSize: 26, fontWeight: 500, fontStyle: "italic", color: t.l }}>{pi + 1}.</span>
        <span className="fr" style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)" }}>periodi</span>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: t.l }}>
          {count} {count === 1 ? "kurssi" : "kurssia"}
        </span>
      </div>
      <div style={{ height: 2, width: 32, borderRadius: 99, background: t.l, opacity: .65, marginBottom: 14 }}/>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: "3px 2px", width: "100%", minWidth: 260 }}>
          <thead>
            <tr>
              <th style={{ width: 60, padding: "0 4px 5px 0" }}/>
              {days.map((d, di) => (
                <th key={di} style={{ textAlign: "center", padding: "0 1px 5px" }}>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-s)" }}>{d}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time, ti) => (
              <tr key={ti}>
                <td style={{ padding: "1px 5px 1px 0", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 9, fontWeight: 500, color: "var(--ink-f)", fontVariantNumeric: "tabular-nums" }}>{time}</span>
                </td>
                {days.map((_, di) => {
                  const beam = rotation[ti]?.[di];
                  const ck = beam ? `p${pi + 1}-b${beam}` : null;
                  const course = ck ? selections[ck]?.trim() : null;
                  const has = course && course.length > 0;
                  return (
                    <td key={di} style={{ textAlign: "center", padding: 1 }}>
                      <div style={{
                        height: 34, minWidth: 48, borderRadius: 7,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: beam === null ? "transparent" : has ? t.bg : "rgba(255,255,255,0.32)",
                        border: beam === null ? "none" : has ? `1px solid ${t.b}` : "1px solid rgba(200,195,190,0.35)",
                      }}>
                        {beam === null ? null : has ? (
                          <span className="fr" style={{ fontSize: course.length > 6 ? 10 : 12, fontWeight: 500, color: "var(--ink)" }}>{course}</span>
                        ) : (
                          <span style={{ fontSize: 9, color: "var(--ink-f)", fontWeight: 500 }}>{beam}.</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
