import { PTINTS } from '../data/schools';

export function WeekPreview({ school, selections }) {
  const { periodCount, times, days, rotation, palkkiCount } = school;
  const hasAny = Object.values(selections).some(v => v?.trim());
  if (!hasAny) return null;
  const hasWeekData = rotation?.length && times?.length && days?.length;

  return (
    <div style={{ marginTop: 28 }}>
      <h2 className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)", marginBottom: 16 }}>
        Viikkokaavio
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: periodCount }, (_, pi) => {
          const t = PTINTS[pi];
          const prefix = `p${pi + 1}-b`;
          let count = 0;
          for (let bi = 1; bi <= palkkiCount; bi++) {
            if (selections[prefix + bi]?.trim()) count++;
          }
          if (count === 0) return null;

          return (
            <div key={pi} className="glass" style={{ borderRadius: 20, padding: "18px 20px 16px", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span className="fr" style={{ fontSize: 22, fontWeight: 500, fontStyle: "italic", color: t.l }}>{pi + 1}.</span>
                  <span className="fr" style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>periodi</span>
                </div>
                <div style={{ width: 20, height: 2, borderRadius: 99, background: t.l, opacity: .6 }}/>
                <span style={{
                  background: t.bg, border: `1px solid ${t.b}`, borderRadius: 99,
                  padding: "2px 10px", fontSize: 9, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.1em", color: t.l,
                }}>{t.name}</span>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 10, fontWeight: 600, color: t.l }}>
                  {count} {count === 1 ? "kurssi" : "kurssia"}
                </span>
              </div>

              {hasWeekData && <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: "3px 3px", width: "100%", minWidth: 340 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 72, padding: "0 6px 6px 0" }}/>
                      {days.map((d, di) => (
                        <th key={di} style={{ textAlign: "center", padding: "0 2px 6px" }}>
                          <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-s)" }}>{d}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {times.map((time, ti) => (
                      <tr key={ti}>
                        <td style={{ padding: "1px 6px 1px 0", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                          <span style={{ fontSize: 9, fontWeight: 500, color: "var(--ink-f)", fontVariantNumeric: "tabular-nums" }}>{time}</span>
                        </td>
                        {days.map((_, di) => {
                          const beam = rotation[ti]?.[di];
                          const course = beam ? selections[prefix + beam]?.trim() : null;
                          const has = !!course;
                          return (
                            <td key={di} style={{ textAlign: "center", padding: 1 }}>
                              <div style={{
                                height: 34, minWidth: 54, borderRadius: 7,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: !beam ? "transparent" : has ? t.bg : "rgba(255,255,255,0.32)",
                                border: !beam ? "none" : has ? `1.5px solid ${t.b}` : "1px solid rgba(200,195,190,0.28)",
                                transition: "all .14s",
                              }}>
                                {!beam ? null : has ? (
                                  <span className="fr" style={{ fontSize: course.length > 5 ? 9 : 11, fontWeight: 500, color: "var(--ink)" }}>{course}</span>
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
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
