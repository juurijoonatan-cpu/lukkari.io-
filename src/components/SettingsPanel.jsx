import { useState } from 'react';
import { Ico } from './icons';
import { buildTextExport } from '../utils/export';
import { recordSubscribe, recordDownload, sendScheduleEmail } from '../utils/leads';

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || '').trim());

export function SettingsPanel({ open, onClose, school, selections, year, setYear, onClear, filledCount }) {
  const [copied, setCopied] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareConsent, setShareConsent] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle'); // idle | sending | done | error

  // Real server-side email send via Supabase Edge Function + Brevo
  const [exportOpen, setExportOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState('');
  const [exportConsent, setExportConsent] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle'); // idle | sending | sent | error
  const [exportError, setExportError] = useState(null);

  const handleEmail = () => {
    setExportOpen(o => !o);
    setExportStatus('idle');
    setExportError(null);
  };

  const handleEmailSend = async () => {
    if (exportStatus === 'sending') return;
    if (!isValidEmail(exportEmail)) return;

    setExportStatus('sending');
    setExportError(null);
    const text = buildTextExport(school, selections, year);

    const tasks = [
      sendScheduleEmail({ email: exportEmail, school, selections, year }),
    ];
    if (exportConsent) {
      tasks.push(recordSubscribe({
        email: exportEmail,
        source: 'export_email',
        school, year,
        palkitFilled: filledCount,
        scheduleText: text,
        notify: false, // Brevo already delivers a richer email; skip Web3Forms duplicate.
      }));
    }
    recordDownload({ action: 'email', school, year, palkitFilled: filledCount, scheduleText: text, email: exportEmail });

    const [sendRes] = await Promise.all(tasks);
    if (sendRes?.ok) {
      setExportStatus('sent');
      setTimeout(() => {
        setExportOpen(false);
        setExportStatus('idle');
        setExportConsent(false);
        setExportEmail('');
      }, 2400);
    } else {
      setExportStatus('error');
      setExportError(sendRes?.error || 'Lähetys epäonnistui.');
    }
  };

  const handleDownload = () => {
    const text = buildTextExport(school, selections, year);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lukkari-${school.id}-${year}.txt`; a.click();
    URL.revokeObjectURL(url);
    recordDownload({ action: 'download', school, year, palkitFilled: filledCount, scheduleText: text });
  };

  const handleCopy = async () => {
    const text = buildTextExport(school, selections, year);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      recordDownload({ action: 'copy', school, year, palkitFilled: filledCount, scheduleText: text });
    } catch {}
  };

  const handlePrint = () => {
    recordDownload({ action: 'print', school, year, palkitFilled: filledCount });
    window.print();
  };

  const handleSubscribe = async () => {
    if (!isValidEmail(shareEmail) || !shareConsent || shareStatus === 'sending') return;
    setShareStatus('sending');
    const text = filledCount > 0 ? buildTextExport(school, selections, year) : '';
    const r = await recordSubscribe({
      email: shareEmail,
      source: 'settings_panel',
      school, year,
      palkitFilled: filledCount,
      scheduleText: text,
    });
    setShareStatus(r.ok ? 'done' : 'error');
  };

  const settingBtn = (icon, label, onClick, danger) => (
    <button onClick={onClick} className={`setting-btn${danger ? " danger" : ""}`}>
      <span style={{ color: danger ? "oklch(0.52 0.18 25)" : "var(--ink-s)", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(20,10,5,0.18)",
        backdropFilter: "blur(2px)",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition: "opacity .22s",
      }}/>
      <div className="glass" style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 91,
        width: 320,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        borderRadius: "24px 0 0 24px",
        borderRight: "none",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.6)",
        }}>
          <span className="fr" style={{ fontSize: 20, fontWeight: 500, color: "var(--ink)" }}>Asetukset</span>
          <button className="icon-btn" onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            border: "1.5px solid rgba(255,255,255,0.8)",
            color: "var(--ink-s)",
          }}>{Ico.close}</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <div className="sec-label">Lukuvuosi</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["2025–2026","2026–2027","2027–2028"].map(y => (
                <button key={y} onClick={() => setYear(y)} style={{
                  flex: 1, padding: "7px 4px", borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${year === y ? "var(--accent)" : "rgba(255,255,255,0.8)"}`,
                  background: year === y ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)",
                  color: year === y ? "var(--accent)" : "var(--ink-s)",
                  transition: "all .14s", fontFamily: "inherit",
                }}>{y}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="sec-label">
              Vie & jaa
              {filledCount === 0 && <span style={{ marginLeft: 6, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--ink-f)" }}>— lisää ensin kursseja</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: filledCount === 0 ? 0.45 : 1, pointerEvents: filledCount === 0 ? "none" : "all" }}>
              {settingBtn(Ico.mail, "Lähetä sähköpostiin", handleEmail)}
              {exportOpen && (
                <div style={{
                  background: "rgba(255,255,255,0.45)",
                  border: "1.5px solid rgba(255,255,255,0.8)",
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {exportStatus === 'sent' ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0" }}>
                      <span style={{ color: "var(--accent)", display: "flex" }}>{Ico.check}</span>
                      <span style={{ fontSize: 13, color: "var(--ink)" }}>Lähetetty. Tarkista sähköpostisi.</span>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 11, color: "var(--ink-s)", lineHeight: 1.6 }}>
                        Saat lukujärjestyksesi sähköpostiisi siistinä koosteena.
                      </p>
                      <input
                        type="email"
                        value={exportEmail}
                        onChange={e => { setExportEmail(e.target.value); setExportError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleEmailSend()}
                        placeholder="sinun@email.fi"
                        autoComplete="email"
                        disabled={exportStatus === 'sending'}
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 10,
                          border: "1.5px solid rgba(255,255,255,0.8)",
                          background: "rgba(255,255,255,0.6)",
                          fontSize: 13, fontFamily: "inherit", color: "var(--ink)",
                          outline: "none",
                        }}
                      />
                      <label style={{
                        display: "flex", gap: 8, alignItems: "flex-start",
                        fontSize: 11, color: "var(--ink-s)", lineHeight: 1.5, cursor: "pointer",
                      }}>
                        <input
                          type="checkbox"
                          checked={exportConsent}
                          onChange={e => setExportConsent(e.target.checked)}
                          style={{ marginTop: 2, flexShrink: 0, accentColor: "var(--accent)" }}
                        />
                        Liity samalla Lukkari.io-listalle. Saat tiedon uusista ominaisuuksista.
                      </label>
                      {exportError && (
                        <p style={{ fontSize: 11, color: "oklch(0.52 0.18 25)" }}>{exportError}</p>
                      )}
                      <button
                        onClick={handleEmailSend}
                        disabled={exportStatus === 'sending' || !isValidEmail(exportEmail)}
                        style={{
                          width: "100%", padding: "9px 14px", borderRadius: 10,
                          border: "1.5px solid rgba(255,255,255,0.8)",
                          background: (exportStatus === 'sending' || !isValidEmail(exportEmail))
                            ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.8)",
                          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                          color: (exportStatus === 'sending' || !isValidEmail(exportEmail)) ? "var(--ink-f)" : "var(--ink)",
                          cursor: (exportStatus === 'sending' || !isValidEmail(exportEmail)) ? "default" : "pointer",
                          transition: "all .14s",
                        }}
                      >
                        {exportStatus === 'sending' ? 'Lähetetään…' : 'Lähetä lukujärjestys'}
                      </button>
                    </>
                  )}
                </div>
              )}
              {settingBtn(Ico.download, "Lataa tekstitiedostona", handleDownload)}
              {settingBtn(copied ? Ico.check : Ico.copy, copied ? "Kopioitu!" : "Kopioi leikepöydälle", handleCopy)}
              {settingBtn(Ico.print, "Tulosta / Tallenna PDF:ksi", handlePrint)}
            </div>
          </div>

          <div>
            <div className="sec-label">Liity Lukkari.io-listalle</div>
            {shareStatus === 'done' ? (
              <div style={{
                background: "rgba(255,255,255,0.55)", border: "1.5px solid rgba(255,255,255,0.8)",
                borderRadius: 12, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ color: "var(--accent)", display: "flex" }}>{Ico.check}</span>
                <span style={{ fontSize: 13, color: "var(--ink)" }}>Kiitos! Olet nyt listalla.</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 11, color: "var(--ink-s)", lineHeight: 1.6 }}>
                  Saat tiedon uusista ominaisuuksista. Ei spämmejä.
                </p>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  placeholder="sähköpostisi@esim.fi"
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 10,
                    border: "1.5px solid rgba(255,255,255,0.8)",
                    background: "rgba(255,255,255,0.55)",
                    fontSize: 13, fontFamily: "inherit", color: "var(--ink)",
                    outline: "none",
                  }}
                />
                <label style={{
                  display: "flex", gap: 8, alignItems: "flex-start",
                  fontSize: 11, color: "var(--ink-s)", lineHeight: 1.5, cursor: "pointer",
                }}>
                  <input
                    type="checkbox"
                    checked={shareConsent}
                    onChange={e => setShareConsent(e.target.checked)}
                    style={{ marginTop: 2, flexShrink: 0, accentColor: "var(--accent)" }}
                  />
                  Suostun, että Lukkari.io käyttää sähköpostiani markkinointiviestintään. Voin peruuttaa suostumukseni milloin tahansa.
                </label>
                {shareStatus === 'error' && (
                  <p style={{ fontSize: 11, color: "oklch(0.52 0.18 25)" }}>Jokin meni pieleen — yritä uudelleen.</p>
                )}
                <button
                  onClick={handleSubscribe}
                  disabled={!shareEmail || !shareConsent || shareStatus === 'sending'}
                  style={{
                    width: "100%", padding: "9px 14px", borderRadius: 10,
                    border: "1.5px solid rgba(255,255,255,0.8)",
                    background: (!shareEmail || !shareConsent) ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)",
                    fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                    color: (!shareEmail || !shareConsent) ? "var(--ink-f)" : "var(--ink)",
                    cursor: (!shareEmail || !shareConsent) ? "default" : "pointer",
                    transition: "all .14s",
                  }}
                >
                  {shareStatus === 'sending' ? 'Lähetetään…' : 'Liity listalle'}
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="sec-label">Koulu</div>
            <div style={{ background: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.8)", borderRadius: 12, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: "var(--ink-s)", padding: "3px 0", display: "flex", justifyContent: "space-between" }}>
                <span>{school.name}</span>
                <span style={{ color: "var(--ink-f)" }}>{school.palkkiCount}P</span>
              </div>
            </div>
          </div>

          <div>
            <div className="sec-label">Hallinta</div>
            {settingBtn(Ico.trash, "Tyhjennä kaikki kurssit", onClear, true)}
          </div>

          <div style={{ marginTop: "auto", padding: "12px 0 0", borderTop: "1px solid rgba(200,195,190,0.3)" }}>
            <p style={{ fontSize: 11, color: "var(--ink-f)", lineHeight: 1.5 }}>
              Lukkari.io — kaikki tiedot tallennetaan vain tällä laitteella.<br/>
              Ei tiliä. Ei seurantaa.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
