import { useT } from '../../../i18n/i18n';

const STAT_KEYS = ['s1', 's2', 's3', 's4'];

export function ProInfoStats() {
  const t = useT();

  return (
    <section className="pi-card pi-stats">
      <div className="pi-stats-head">
        <span className="pi-pill-quiet">{t('pro.stats.label')}</span>
        <h2 className="pi-stats-title">
          {t('pro.stats.titleA')}<em>{t('pro.stats.titleEm')}</em>{t('pro.stats.titleB')}
        </h2>
        <p className="pi-stats-sub">{t('pro.stats.sub')}</p>
      </div>

      <div className="pi-stats-grid">
        {STAT_KEYS.map(k => (
          <div className="pi-stat" key={k}>
            <div className="pi-stat-value">{t(`pro.stats.${k}.value`)}</div>
            <div className="pi-stat-label">{t(`pro.stats.${k}.label`)}</div>
            <div className="pi-stat-desc">{t(`pro.stats.${k}.desc`)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
