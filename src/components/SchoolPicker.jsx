import { SCHOOLS } from '../data/schools';

export function SchoolPicker({ schoolId, setSchoolId }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-s)" }}>Koulu</span>
      <div style={{ position: "relative" }}>
        <select value={schoolId} onChange={e => setSchoolId(e.target.value)} style={{
          background: "rgba(255,255,255,0.62)", border: "1.5px solid rgba(255,255,255,0.88)",
          borderRadius: 99, padding: "5px 30px 5px 14px", fontSize: 13, fontWeight: 500,
          color: "var(--ink)", cursor: "pointer", outline: "none",
          backdropFilter: "blur(8px)", appearance: "none",
        }}>
          {SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="10" height="7" viewBox="0 0 10 7">
          <path d="M1 1l4 4 4-4" stroke="var(--ink-s)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
