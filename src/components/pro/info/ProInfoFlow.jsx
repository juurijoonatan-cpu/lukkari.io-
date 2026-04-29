import { Ico } from '../../icons';
import { useT } from '../../../i18n/i18n';

const STEPS = [
  { n: '01', key: 's1', icon: Ico.calendar },
  { n: '02', key: 's2', icon: Ico.sparkle },
  { n: '03', key: 's3', icon: Ico.book },
];

export function ProInfoFlow() {
  const t = useT();

  return (
    <section className="pi-card pi-flow">
      <span className="pi-section-label">{t('pro.flow.label')}</span>

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
            <h3 className="pi-step-title">{t(`pro.flow.${s.key}.title`)}</h3>
            <p className="pi-step-desc">{t(`pro.flow.${s.key}.desc`)}</p>
            {i < STEPS.length - 1 && <div className="pi-step-arrow" aria-hidden>→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
