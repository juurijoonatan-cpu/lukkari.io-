import { useState, useRef, useEffect } from 'react';
import { Ico } from './icons';
import { useT } from '../i18n/i18n';

const IcoList = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6"  x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6"  x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

function normalize(s) {
  return s.trim().toLowerCase();
}

function isInGrid(courseName, selections) {
  const n = normalize(courseName);
  return Object.values(selections).some(v => normalize(v || "") === n);
}

export function WishlistPanel({ wishlist, setWishlist, selections }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const missing = wishlist.filter(c => !isInGrid(c, selections)).length;

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const add = () => {
    const v = input.trim();
    if (!v) return;
    if (wishlist.some(c => normalize(c) === normalize(v))) { setInput(""); return; }
    setWishlist(prev => [...prev, v]);
    setInput("");
  };

  const remove = (i) => setWishlist(prev => prev.filter((_, idx) => idx !== i));

  const done = wishlist.length - missing;

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 78,
          background: "rgba(20,10,5,0.12)",
          backdropFilter: "blur(1px)",
        }}/>
      )}

      {/* Expanded panel */}
      <div style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 79,
        width: open ? 290 : 52,
        borderRadius: open ? 24 : 99,
        background: "rgba(255,255,255,0.78)",
        border: "1.5px solid rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        boxShadow: "0 8px 32px rgba(80,40,10,0.12), 0 1.5px 0 rgba(255,255,255,0.9) inset",
        overflow: "hidden",
        transition: "width .28s cubic-bezier(.4,0,.2,1), border-radius .28s cubic-bezier(.4,0,.2,1)",
        maxHeight: open ? "min(520px, 70vh)" : 52,
        transitionProperty: "width, border-radius, max-height",
        transitionDuration: ".28s",
        transitionTimingFunction: "cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
      }}>

        {/* Header / pill trigger */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center",
          padding: open ? "14px 16px 10px" : 0,
          height: open ? "auto" : 52,
          cursor: open ? "default" : "pointer",
          flexShrink: 0,
        }} onClick={!open ? () => setOpen(true) : undefined}>
          {open ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--ink-s)", display: "flex" }}>{IcoList}</span>
                <span className="fr" style={{ fontSize: 16, fontWeight: 500, color: "var(--ink)" }}>{t('wishlist.title')}</span>
                {wishlist.length > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: missing > 0 ? "var(--accent)" : "oklch(0.58 0.15 150)", color: "white", borderRadius: 99, padding: "1px 7px", minWidth: 18, textAlign: "center" }}>
                    {done}/{wishlist.length}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.6)", border: "1.5px solid rgba(255,255,255,0.85)",
                color: "var(--ink-s)", cursor: "pointer",
              }}>{Ico.close}</button>
            </>
          ) : (
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--ink-s)", display: "flex" }}>{IcoList}</span>
              {missing > 0 && (
                <span style={{
                  position: "absolute", top: -8, right: -10,
                  fontSize: 9, fontWeight: 700,
                  background: "var(--accent)", color: "white",
                  borderRadius: 99, padding: "1px 5px", minWidth: 16, textAlign: "center",
                  lineHeight: 1.6,
                }}>{missing}</span>
              )}
            </div>
          )}
        </div>

        {/* Body — only visible when open */}
        {open && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Add input */}
            <div style={{ display: "flex", gap: 6 }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && add()}
                placeholder={t('wishlist.placeholder')}
                maxLength={30}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: 10,
                  border: "1.5px solid rgba(255,255,255,0.85)",
                  background: "rgba(255,255,255,0.65)",
                  fontSize: 12, fontFamily: "inherit", color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button onClick={add} disabled={!input.trim()} style={{
                padding: "8px 12px", borderRadius: 10, border: "none",
                background: input.trim()
                  ? "linear-gradient(135deg, oklch(0.62 0.13 45), oklch(0.57 0.15 20))"
                  : "rgba(255,255,255,0.4)",
                color: input.trim() ? "white" : "var(--ink-f)",
                fontSize: 12, fontWeight: 600, cursor: input.trim() ? "pointer" : "default",
                transition: "all .14s", fontFamily: "inherit", whiteSpace: "nowrap",
              }}>{t('common.add')}</button>
            </div>

            {/* Course list */}
            {wishlist.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--ink-f)", textAlign: "center", padding: "12px 0" }}>
                {t('wishlist.empty')}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {wishlist.map((course, i) => {
                  const found = isInGrid(course, selections);
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 10,
                      background: found ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)",
                      border: `1.5px solid ${found ? "rgba(255,255,255,0.85)" : "rgba(200,195,190,0.4)"}`,
                      transition: "all .14s",
                    }}>
                      {/* Status indicator */}
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: found ? "oklch(0.58 0.15 150)" : "rgba(200,195,190,0.3)",
                        border: found ? "none" : "1.5px solid rgba(200,195,190,0.5)",
                      }}>
                        {found ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(160,155,150,0.6)" }}/>
                        )}
                      </div>
                      <span style={{
                        flex: 1, fontSize: 13, fontWeight: 500,
                        color: found ? "var(--ink)" : "var(--ink-s)",
                        fontFamily: "'Fraunces', serif",
                      }}>{course}</span>
                      <button onClick={() => remove(i)} style={{
                        width: 20, height: 20, borderRadius: "50%", border: "none",
                        background: "transparent", color: "var(--ink-f)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", fontSize: 14, lineHeight: 1,
                        flexShrink: 0,
                      }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary footer */}
            {wishlist.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(200,195,190,0.3)", paddingTop: 10, marginTop: 4 }}>
                <p style={{ fontSize: 11, color: "var(--ink-f)", textAlign: "center" }}>
                  {done === wishlist.length
                    ? t('wishlist.allAdded')
                    : t('wishlist.summary', { done, total: wishlist.length, missing })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
