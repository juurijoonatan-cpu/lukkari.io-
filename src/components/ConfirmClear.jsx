import { useT } from '../i18n/i18n';

export function ConfirmClear({ onConfirm, onCancel }) {
  const t = useT();
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(20,10,5,0.28)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div className="glass" onClick={e => e.stopPropagation()} style={{ borderRadius: 20, padding: "28px 28px", maxWidth: 320, width: "100%" }}>
        <h3 className="fr" style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>{t('confirm.title')}</h3>
        <p style={{ fontSize: 13, color: "var(--ink-s)", lineHeight: 1.55, marginBottom: 22 }}>{t('confirm.body')}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "8px 18px", borderRadius: 99, border: "1.5px solid rgba(200,195,190,0.7)", background: "transparent", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--ink-s)" }}>{t('common.cancel')}</button>
          <button onClick={onConfirm} style={{ padding: "8px 18px", borderRadius: 99, border: "none", background: "oklch(0.50 0.15 25)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t('common.clear')}</button>
        </div>
      </div>
    </div>
  );
}
