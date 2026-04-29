import { useT } from '../i18n/i18n';

export function Footer({ isPro, onOpenLegal }) {
  const t = useT();
  const linkColor = isPro ? "#a09c98" : "var(--ink-s)";
  const linkHoverColor = isPro ? "#f0ede8" : "var(--ink)";
  const sepColor = isPro ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";

  const linkStyle = {
    fontSize: 11, fontWeight: 500, color: linkColor,
    background: "transparent", border: "none", padding: "4px 6px",
    cursor: "pointer", fontFamily: "inherit",
    transition: "color 0.14s",
  };

  const link = (key, label) => (
    <button style={linkStyle}
      onMouseEnter={e => e.currentTarget.style.color = linkHoverColor}
      onMouseLeave={e => e.currentTarget.style.color = linkColor}
      onClick={() => onOpenLegal(key)}>{label}</button>
  );

  return (
    <footer style={{
      maxWidth: 1120, margin: "0 auto",
      padding: "28px 24px 32px",
      borderTop: `1px solid ${sepColor}`,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 12,
      position: "relative", zIndex: 2,
    }}>
      <div style={{ fontSize: 11, color: linkColor, fontWeight: 500 }}>
        © {new Date().getFullYear()} Lukkari.io
      </div>
      <nav style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {link("tietosuoja", t('footer.privacy'))}
        <span style={{ color: sepColor, alignSelf: "center", fontSize: 11 }}>·</span>
        {link("kayttoehdot", t('footer.terms'))}
        <span style={{ color: sepColor, alignSelf: "center", fontSize: 11 }}>·</span>
        {link("evasteet", t('footer.cookies'))}
      </nav>
    </footer>
  );
}
