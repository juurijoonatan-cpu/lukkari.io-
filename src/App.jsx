import { useState, useEffect, useCallback } from 'react';
import { SCHOOLS } from './data/schools';
import { loadState, saveState, clearStoredSelections } from './utils/storage';
import { Header } from './components/Header';
import { SchoolPicker } from './components/SchoolPicker';
import { ChoiceGrid } from './components/ChoiceGrid';
import { WeekPreview } from './components/WeekPreview';
import { SettingsPanel } from './components/SettingsPanel';
import { ProComingSoon } from './components/ProComingSoon';
import { ConfirmClear } from './components/ConfirmClear';

export default function App() {
  const [tab, setTab] = useState("free");
  const [schoolId, setSchoolId] = useState("otaniemi");
  const [selections, setSelections] = useState({});
  const [year, setYear] = useState("2026–2027");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (s) {
      if (s.schoolId) setSchoolId(s.schoolId);
      if (s.selections) setSelections(s.selections);
      if (s.year) setYear(s.year);
    }
  }, []);

  useEffect(() => {
    saveState({ schoolId, selections, year });
  }, [schoolId, selections, year]);

  const onChange = useCallback((k, v) => {
    setSelections(prev => {
      const n = { ...prev };
      if (!v.trim()) delete n[k]; else n[k] = v;
      return n;
    });
  }, []);

  const doClear = useCallback(() => {
    setSelections({});
    clearStoredSelections();
    setConfirmClear(false);
    setSettingsOpen(false);
  }, []);

  const school = SCHOOLS.find(s => s.id === schoolId) || SCHOOLS[0];
  const filledCount = Object.values(selections).filter(v => v?.trim()).length;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Header tab={tab} setTab={setTab} onGear={() => setSettingsOpen(true)}/>
      <SettingsPanel
        open={settingsOpen} onClose={() => setSettingsOpen(false)}
        school={school} selections={selections}
        year={year} setYear={setYear}
        onClear={() => setConfirmClear(true)}
        filledCount={filledCount}
      />

      {tab === "pro" ? <ProComingSoon/> : (
        <main style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 80px" }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px 20px", marginBottom: 14 }}>
              <SchoolPicker schoolId={schoolId} setSchoolId={setSchoolId}/>
              <div style={{ height: 14, width: 1, background: "rgba(200,195,190,0.45)" }}/>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-f)" }}>{year}</span>
            </div>
            <h1 className="fr" style={{ fontSize: 48, fontWeight: 500, letterSpacing: "-0.025em", lineHeight: 1.05, color: "var(--ink)" }}>
              {school.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              <p style={{ fontSize: 13, color: "var(--ink-s)" }}>Täytä palkit, näe lukujärjestyksesi</p>
              {filledCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.85)",
                  borderRadius: 99, padding: "2px 10px", color: "var(--accent)",
                  backdropFilter: "blur(6px)",
                }}>{filledCount} kurssia kirjattu</span>
              )}
            </div>
            {school.note && (
              <p style={{ fontSize: 11, color: "var(--ink-f)", marginTop: 6, fontStyle: "italic" }}>{school.note}</p>
            )}
          </div>

          <div className="glass" style={{ borderRadius: 24, padding: "24px 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
              <h2 className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Kurssimatriisi</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "var(--ink-f)", fontWeight: 500 }}>
                  {school.palkkiCount} palkkia · {school.periodCount} periodia
                </span>
                {filledCount > 0 && (
                  <button onClick={() => setConfirmClear(true)} style={{
                    fontSize: 11, color: "var(--ink-f)", background: "transparent", border: "none",
                    cursor: "pointer", padding: "2px 6px", borderRadius: 6,
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}>Tyhjennä</button>
                )}
              </div>
            </div>
            <ChoiceGrid school={school} selections={selections} onChange={onChange}/>
          </div>

          <WeekPreview school={school} selections={selections}/>
        </main>
      )}

      {filledCount > 0 && tab === "free" && !settingsOpen && (
        <div style={{
          position: "fixed", bottom: 20, right: 20,
          background: "rgba(255,255,255,0.72)", border: "1.5px solid rgba(255,255,255,0.92)",
          borderRadius: 99, backdropFilter: "blur(12px)",
          padding: "6px 14px", display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
          pointerEvents: "none",
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "oklch(0.58 0.15 150)" }}/>
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-s)" }}>Tallennettu</span>
        </div>
      )}

      {confirmClear && <ConfirmClear onConfirm={doClear} onCancel={() => setConfirmClear(false)}/>}
    </div>
  );
}
