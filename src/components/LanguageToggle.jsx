import { useLang } from '../i18n/i18n';

export function LanguageToggle({ isPro }) {
  const { lang, setLang, t } = useLang();
  const next = lang === 'fi' ? 'en' : 'fi';

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      title={t('lang.toggle')}
      aria-label={t('lang.toggle')}
      className="lang-toggle"
      data-pro={isPro ? '1' : '0'}
    >
      <span className={lang === 'fi' ? 'is-on' : ''}>{t('lang.fi')}</span>
      <span className="sep" aria-hidden>/</span>
      <span className={lang === 'en' ? 'is-on' : ''}>{t('lang.en')}</span>
    </button>
  );
}
