const FI_DAYS = ['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'];

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5)  return ['Hyvää', 'yötä'];
  if (h < 11) return ['Hyvää', 'huomenta'];
  if (h < 17) return ['Hyvää', 'iltapäivää'];
  if (h < 22) return ['Hyvää', 'iltaa'];
  return ['Hyvää', 'yötä'];
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="14" y2="17"/>
    </svg>
  );
}

export function Topbar({ name, period, onToggleTheme, onOpenMenu }) {
  const now = new Date();
  const [hi, partOfDay] = greeting(now);
  const day = FI_DAYS[now.getDay()];
  const wk = isoWeek(now);
  const sub = period
    ? `${day} · viikko ${wk} · jakso ${period}`
    : `${day} · viikko ${wk}`;

  return (
    <div className="pb-topbar">
      <div className="pb-greet">
        <div className="hello">
          {hi} <em>{partOfDay}</em>{name ? `, ${name}.` : '.'}
        </div>
        <div className="sub">{sub}</div>
      </div>
      <div className="pb-actions">
        <button className="pb-icon-pill" onClick={onToggleTheme} aria-label="Vaihda teema" title="Vaihda teema">
          <ThemeIcon/>
        </button>
        <button className="pb-icon-pill" onClick={onOpenMenu} aria-label="Avaa paneeli" title="Avaa paneeli">
          <MenuIcon/>
        </button>
      </div>
    </div>
  );
}
