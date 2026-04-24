import { PeriodCard } from './PeriodCard';

export function WeekPreview({ school, selections }) {
  return (
    <div style={{ marginTop: 52 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 className="fr" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ink)" }}>Viikkonäkymä</h2>
        <p style={{ fontSize: 13, color: "var(--ink-s)", marginTop: 4 }}>Sama kiertokaavio joka viikko — kurssit vaihtuvat periodeittain</p>
      </div>
      <div className="wk-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,440px),1fr))", gap: 14 }}>
        {Array.from({ length: school.periodCount }, (_, pi) => (
          <PeriodCard key={pi} pi={pi} school={school} selections={selections}/>
        ))}
      </div>
    </div>
  );
}
