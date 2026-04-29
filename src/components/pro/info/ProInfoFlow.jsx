import { Ico } from '../../icons';

const STEPS = [
  {
    n: '01',
    icon: Ico.calendar,
    title: 'Lisää kurssisi',
    desc: 'Täytä lukujärjestyksesi ilmaisversiossa. Vie hetken ja tallentuu selaimeesi.',
  },
  {
    n: '02',
    icon: Ico.sparkle,
    title: 'AI analysoi',
    desc: 'Tekoäly vertaa valintojasi ylioppilaskirjoituksiin, hakukohteisiin ja painotukseesi.',
  },
  {
    n: '03',
    icon: Ico.book,
    title: 'Saat suunnitelman',
    desc: 'Henkilökohtaiset kurssisuositukset ja viikkokohtainen lukusuunnitelma.',
  },
];

export function ProInfoFlow() {
  return (
    <section className="pi-card pi-flow">
      <span className="pi-section-label">Näin Pro toimii</span>

      <div className="pi-flow-steps">
        {STEPS.map((s, i) => (
          <div key={s.n} className="pi-step">
            <div className="pi-step-num">{s.n}</div>
            <div className="pi-step-icon" aria-hidden>
              <svg width="22" height="22" viewBox={s.icon.props.viewBox}
                fill={s.icon.props.fill} stroke={s.icon.props.stroke}
                strokeWidth={s.icon.props.strokeWidth}
                strokeLinecap={s.icon.props.strokeLinecap}
                strokeLinejoin={s.icon.props.strokeLinejoin}>
                {s.icon.props.children}
              </svg>
            </div>
            <h3 className="pi-step-title">{s.title}</h3>
            <p className="pi-step-desc">{s.desc}</p>
            {i < STEPS.length - 1 && <div className="pi-step-arrow" aria-hidden>→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
