import { Ico } from './icons';

export function Header({ tab, setTab, onGear }) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", height: 60,
      background: "rgba(255,255,255,0.42)",
      borderBottom: "1.5px solid rgba(255,255,255,0.72)",
      backdropFilter: "blur(28px) saturate(1.5)",
      WebkitBackdropFilter: "blur(28px) saturate(1.5)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <span className="fr" style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
        Lukkari<span style={{ color: "var(--accent)" }}>.</span><span style={{ color: "var(--ink-s)" }}>io</span>
      </span>
      <div className="tab-pill">
        <button className={"tab-btn" + (tab === "free" ? " on" : "")} onClick={() => setTab("free")}>Free</button>
        <button className={"tab-btn" + (tab === "pro" ? " on" : "")} onClick={() => setTab("pro")}>Pro</button>
      </div>
      <button className="icon-btn" onClick={onGear} style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.5)",
        border: "1.5px solid rgba(255,255,255,0.8)",
        color: "var(--ink-s)",
      }} title="Asetukset">{Ico.gear}</button>
    </header>
  );
}
