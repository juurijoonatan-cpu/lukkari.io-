import { useState } from 'react';
import { Ico } from '../../icons';
import { useT } from '../../../i18n/i18n';

const FEATURES = [
  { key: 'f1', icon: Ico.sparkle,  badge: 'pro.features.badgeMain' },
  { key: 'f2', icon: Ico.book },
  { key: 'f3', icon: Ico.timer },
  { key: 'f4', icon: Ico.conflict },
  { key: 'f5', icon: Ico.calendar },
  { key: 'f6', icon: Ico.download },
  { key: 'f7', icon: Ico.shield },
];

function FeatureCard({ feature, index, t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="pi-feature"
      data-hovered={hovered ? '1' : '0'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animation: `node-in 0.5s ease forwards ${index * 0.08 + 0.2}s`,
        opacity: 0,
      }}>
      <div className="pi-feature-icon" aria-hidden>
        <svg width="22" height="22" viewBox={feature.icon.props.viewBox}
          fill={feature.icon.props.fill} stroke={feature.icon.props.stroke}
          strokeWidth={feature.icon.props.strokeWidth}
          strokeLinecap={feature.icon.props.strokeLinecap}
          strokeLinejoin={feature.icon.props.strokeLinejoin}>
          {feature.icon.props.children}
        </svg>
      </div>
      <div className="pi-feature-body">
        <div className="pi-feature-head">
          <span className="pi-feature-title">{t(`pro.features.${feature.key}.title`)}</span>
          {feature.badge && <span className="pi-feature-badge">{t(feature.badge)}</span>}
        </div>
        <p className="pi-feature-desc">{t(`pro.features.${feature.key}.desc`)}</p>
      </div>
    </div>
  );
}

export function ProInfoFeatures() {
  const t = useT();
  return (
    <section>
      <span className="pi-section-label">{t('pro.features.label')}</span>
      <div className="pi-features-grid">
        {FEATURES.map((f, i) => <FeatureCard key={f.key} feature={f} index={i} t={t}/>)}
      </div>
    </section>
  );
}
