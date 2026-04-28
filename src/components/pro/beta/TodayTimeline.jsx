import { formatToday, buildTodayLessons } from './scheduleHelpers';
import './todayTimeline.css';

export function TodayTimeline({ school, selections }) {
  const { day, month } = formatToday();
  const { lessons, period, weekend } = buildTodayLessons(school, selections);
  const filledCount = lessons.filter(l => l.label).length;

  return (
    <section className="pb-lg pb-w-today">
      <header className="pb-today-head">
        <div>
          <div className="pb-today-label">Tänään</div>
          <div className="pb-today-date">{day}. <em>{month}</em></div>
        </div>
        <div className="pb-day-pill">
          {weekend ? 'Viikonloppu' : period
            ? `Jakso ${period} · ${filledCount}/${lessons.length} tuntia`
            : `${lessons.length} tuntia`}
        </div>
      </header>

      <div className="pb-timeline">
        {weekend ? (
          <p className="pb-empty">Ei tunteja tänään — nauti viikonlopusta.</p>
        ) : !lessons.length ? (
          <p className="pb-empty">Lisää koulun tiedot nähdäksesi päivän aikataulun.</p>
        ) : (
          lessons.map((l, i) => (
            <div key={i} className={`pb-lesson${l.live ? ' is-live' : ''}`}>
              <div className="pb-lesson-time">
                {timeFrom(l.time)}<small>{timeTo(l.time)}</small>
              </div>
              <div className="pb-lesson-body">
                <div className="pb-lesson-name">
                  {l.label || <span className="pb-lesson-empty">Palkki {l.palkki} · ei valintaa</span>}
                </div>
                <div className="pb-lesson-meta">
                  {l.label ? `Palkki ${l.palkki}` : 'Lisää kurssi vapaa-versiossa'}
                </div>
              </div>
              <div className="pb-lesson-swatch" style={{ background: l.swatch }} aria-hidden/>
              {l.live && <div className="pb-lesson-live">Käynnissä</div>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function timeFrom(t) {
  const m = t.match(/^(\d{1,2}[.:]\d{2})/);
  return m ? m[1] : t;
}
function timeTo(t) {
  const m = t.match(/[–-]\s*(\d{1,2}[.:]\d{2})/);
  return m ? `– ${m[1]}` : '';
}
