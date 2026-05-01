export function StepPlaceholder({ title, description, onNext, onBack, nextLabel = 'HYPPÄÄ YLI →' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 24, padding: '32px 28px',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
    }}>
      <h2 className="fr" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: '#a09c98', marginBottom: 26, lineHeight: 1.6 }}>
        {description}
      </p>
      <div style={{
        background: 'rgba(120,90,255,0.08)',
        border: '1px solid rgba(120,90,255,0.20)',
        borderRadius: 14, padding: '18px 20px', marginBottom: 24,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(180,160,255,0.85)', lineHeight: 1.6 }}>
          Tämä askel aktivoituu seuraavassa päivityksessä. Voit hypätä yli toistaiseksi —
          AI-suunnitelma generoituu silti perustietojen pohjalta.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            flex: '0 0 auto', padding: '12px 18px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.11)',
            background: 'transparent', color: '#a09c98',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >← EDELLINEN</button>
        <button
          onClick={onNext}
          style={{
            flex: 1, padding: '12px 20px', borderRadius: 13, border: 'none',
            background: 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
            color: 'rgba(8,6,22,0.90)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.07em',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            boxShadow: '0 6px 24px rgba(200,180,255,0.24)',
          }}
        >{nextLabel}</button>
      </div>
    </div>
  );
}
