import './progressRing.css';

export function ProgressRing({ courseCode = '—', percent = 0, lines = [] }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <section className="pb-lg pb-w-progress">
      <div className="pb-w-prog-label">Kurssin eteneminen</div>
      <div className="pb-w-prog-title">{courseCode}</div>
      <div className="pb-ring-row">
        <div className="pb-ring" style={{ '--pct': pct }}>
          <div className="pb-ring-num">{pct}<small>%</small></div>
        </div>
        <div className="pb-ring-info">
          {lines.length ? lines.map((l, i) => (
            <div key={i} className="pb-ring-line">
              <span>{l.label}</span>
              <span style={l.accent ? { color: 'var(--pb-accent)' } : null}>{l.value}</span>
            </div>
          )) : (
            <div className="pb-ring-line">
              <span>Ei dataa vielä</span>
              <span>—</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
