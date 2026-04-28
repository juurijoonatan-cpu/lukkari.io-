const STATS = [
  {
    value: '300+',
    label: 'AI-kyselyä',
    desc: 'Pro-tilauksella kuukaudessa. Riittää koko lukuvuoden suunnitteluun.',
  },
  {
    value: 'Suomeksi',
    label: 'Alusta asti',
    desc: 'Rakennettu suomalaisille opiskelijoille. Wilman aikataulujen päälle.',
  },
  {
    value: '0 €',
    label: 'Demo',
    desc: 'Kokeile ilman tiliä. Ei sähköpostia, ei sitoutumista.',
  },
  {
    value: '24/7',
    label: 'Selaimessa',
    desc: 'Toimii puhelimella, läppärillä ja tabletilla. Ei asennusta.',
  },
];

export function ProInfoStats() {
  return (
    <section className="pi-card pi-stats">
      <div className="pi-stats-head">
        <span className="pi-pill-quiet">Miksi Pro</span>
        <h2 className="pi-stats-title">
          Tehty <em>opiskelijalle</em>, ei koululle.
        </h2>
        <p className="pi-stats-sub">
          Lukkari Pro ei ole kalenteri. Se on opintoassistentti, joka
          ymmärtää suomalaisen lukion rakenteen ja auttaa sinua
          valitsemaan oikein.
        </p>
      </div>

      <div className="pi-stats-grid">
        {STATS.map((s, i) => (
          <div className="pi-stat" key={i}>
            <div className="pi-stat-value">{s.value}</div>
            <div className="pi-stat-label">{s.label}</div>
            <div className="pi-stat-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
