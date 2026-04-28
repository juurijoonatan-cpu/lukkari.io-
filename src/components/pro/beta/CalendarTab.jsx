const FI_MONTHS = ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu','Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'];

function buildGrid(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y, m, 1);
  const dow = (first.getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();

  const cells = [];
  for (let i = dow - 1; i >= 0; i--) cells.push({ d: prevMonthDays - i, muted: true });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ d: i });
  while (cells.length % 7 !== 0) cells.push({ d: cells.length - daysInMonth - dow + 1, muted: true });
  return cells;
}

export function CalendarTab() {
  const today = new Date();
  const cells = buildGrid(today);
  const dayNames = ['ma','ti','ke','to','pe','la','su'];
  const td = today.getDate();

  return (
    <div className="pb-cal">
      <div className="pb-cal-month">
        <span>{FI_MONTHS[today.getMonth()]} <em>{today.getFullYear()}</em></span>
      </div>
      <div className="pb-cal-grid">
        {dayNames.map(n => <div key={n} className="pb-cal-dn">{n}</div>)}
        {cells.map((c, i) => (
          <div
            key={i}
            className={`pb-cal-dt${c.muted ? ' is-muted' : ''}${!c.muted && c.d === td ? ' is-today' : ''}`}
          >{c.d}</div>
        ))}
      </div>
      <p className="pb-cal-note">
        Kokeet ja tehtävät näytetään täällä, kun yhdistät kalenterin (tulossa).
      </p>
    </div>
  );
}
