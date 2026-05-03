import { lazy, Suspense, useEffect } from 'react';
import { MentorChat } from './MentorChat';
import './sidePanel.css';

const CalendarTab   = lazy(() => import('./CalendarTab').then(m => ({ default: m.CalendarTab })));
const PlanTab       = lazy(() => import('./PlanTab').then(m => ({ default: m.PlanTab })));
const AnalyticsTab  = lazy(() => import('./AnalyticsTab').then(m => ({ default: m.AnalyticsTab })));

const TABS = [
  { id: 'mentor',    label: 'Mentor' },
  { id: 'cal',       label: 'Kalenteri' },
  { id: 'plan',      label: 'Suunnitelma' },
  { id: 'analytics', label: 'Analyysi' },
];

export function SidePanel({
  open, onClose,
  tab, onTabChange,
  school, schedule,
  seedQuestion, onSeedConsumed,
}) {
  // Lock body scroll while open (mobile bottom-sheet ergonomics)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`pb-scrim${open ? ' is-open' : ''}`} onClick={onClose}/>
      <aside className={`pb-side${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <div className="pb-side-inner">
          <div className="pb-side-grip" aria-hidden/>
          <header className="pb-side-head">
            <div className="pb-side-title">{TABS.find(t => t.id === tab)?.label || 'Mentor'}</div>
            <button className="pb-side-close" onClick={onClose} aria-label="Sulje">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </header>
          <div className="pb-side-tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                className={`pb-side-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => onTabChange?.(t.id)}
              >{t.label}</button>
            ))}
          </div>
          <div className="pb-side-body">
            {/* Lazy: only the active tab is mounted */}
            {open && tab === 'mentor' && (
              <MentorChat
                school={school}
                schedule={schedule}
                seedQuestion={seedQuestion}
                onSeedConsumed={onSeedConsumed}
              />
            )}
            {open && tab === 'cal' && (
              <Suspense fallback={<div className="pb-side-loading">Ladataan…</div>}>
                <CalendarTab/>
              </Suspense>
            )}
            {open && tab === 'plan' && (
              <Suspense fallback={<div className="pb-side-loading">Ladataan…</div>}>
                <PlanTab/>
              </Suspense>
            )}
            {open && tab === 'analytics' && (
              <Suspense fallback={<div className="pb-side-loading">Ladataan…</div>}>
                <AnalyticsTab school={school} schedule={schedule}/>
              </Suspense>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
