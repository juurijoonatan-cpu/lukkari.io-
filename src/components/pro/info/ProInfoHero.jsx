import { Ico } from '../../icons';

const SPARKS = [
  { size: 22, x: -48, y: -18, rot: 12,  delay: 0.0,  opacity: 0.85 },
  { size: 13, x:  16, y: -28, rot: -30, delay: 0.15, opacity: 0.65 },
  { size: 17, x:  52, y:  -8, rot: 55,  delay: 0.08, opacity: 0.75 },
  { size: 9,  x: -20, y:  18, rot: 20,  delay: 0.22, opacity: 0.50 },
  { size: 11, x:  30, y:  14, rot: -15, delay: 0.18, opacity: 0.60 },
];

function ChromeStar({ size, opacity, rot, delay, id }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden
      style={{
        opacity, transform: `rotate(${rot}deg)`,
        animation: `spark-in 0.55s cubic-bezier(.4,0,.2,1) forwards ${delay}s, spark-spin 14s linear infinite ${delay}s`,
        display: 'block',
      }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#d4d4de"/>
          <stop offset="42%"  stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#9898a8"/>
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`}
        d="M12,2 L13.4,10.6 L22,12 L13.4,13.4 L12,22 L10.6,13.4 L2,12 L10.6,10.6 Z"/>
    </svg>
  );
}

function HeroSparks() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden>
      {SPARKS.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `calc(50% + ${s.x}px)`,
          top:  `calc(50% + ${s.y}px)`,
        }}>
          <ChromeStar {...s} id={`hs${i}`}/>
        </div>
      ))}
    </div>
  );
}

export function ProInfoHero({ onTryDemo }) {
  return (
    <section className="pi-hero">
      <HeroSparks />
      <span className="pi-pill">
        <span style={{ display: 'flex' }}>{Ico.star}</span>
        BETA
      </span>
      <h1 className="pi-hero-title">
        Lukkari <em>Pro</em>
      </h1>
      <p className="pi-hero-sub">
        Tekoäly suunnittelee opintosi puolestasi. Sinä keskityt opiskeluun.
        Saat henkilökohtaiset kurssisuositukset, valmiit lukusuunnitelmat
        ja selkeät kertausaikataulut kokeisiin.
      </p>

      <button className="pi-cta" onClick={onTryDemo}>
        <span style={{ display: 'flex' }}>{Ico.sparkle}</span>
        Tutustu demoon
        <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
      </button>

      <p className="pi-hero-foot">
        Ei rekisteröitymistä. Demo aukeaa heti.
      </p>
    </section>
  );
}
