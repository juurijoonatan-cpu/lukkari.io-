import { useState } from 'react';
import { Ico } from '../../icons';

const FEATURES = [
  {
    icon: Ico.sparkle,
    title: 'Kurssisuosittelija',
    desc: 'Tekoäly ehdottaa juuri sinulle sopivat kurssit. Ehdotukset huomioivat ylioppilaskirjoitukset, hakukohteet ja oman painotuksesi.',
    badge: 'Tärkein',
  },
  {
    icon: Ico.book,
    title: 'Lukusuunnitelma',
    desc: 'Selkeä viikkosuunnitelma kursseittain. Tekoäly kertoo mitä opiskella ensin ja kuinka kauan.',
  },
  {
    icon: Ico.timer,
    title: 'Lukuaikataulu kokeisiin',
    desc: 'Syötä koepäivä, saat kertausaikataulun. Tasainen tahti, ei viime hetken pänttäämistä.',
  },
  {
    icon: Ico.conflict,
    title: 'Konfliktianalyysi',
    desc: 'Tunnistaa aikatauluristiriidat automaattisesti, ennen kuin niistä ehtii tulla ongelma.',
  },
  {
    icon: Ico.calendar,
    title: 'Kalenteri-synkronointi',
    desc: 'Vie lukujärjestys suoraan Google tai Apple kalenteriin yhdellä klikkauksella.',
  },
  {
    icon: Ico.download,
    title: 'PDF-export',
    desc: 'Tallenna tai tulosta lukujärjestys siistinä PDF-tiedostona.',
  },
  {
    icon: Ico.shield,
    title: 'Pilvivarmuuskopio',
    desc: 'Kurssivalintasi tallessa pilvessä. Vaihda laitetta huoletta, valinnat seuraavat mukana.',
  },
];

function FeatureCard({ feature, index }) {
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
          <span className="pi-feature-title">{feature.title}</span>
          {feature.badge && <span className="pi-feature-badge">{feature.badge}</span>}
        </div>
        <p className="pi-feature-desc">{feature.desc}</p>
      </div>
    </div>
  );
}

export function ProInfoFeatures() {
  return (
    <section>
      <span className="pi-section-label">Mitä saat Prolla</span>
      <div className="pi-features-grid">
        {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i}/>)}
      </div>
    </section>
  );
}
