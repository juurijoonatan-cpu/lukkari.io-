import { useLang, SUPPORTED_LANGS } from '../i18n/i18n';

export function LanguageToggle({ isPro }) {
  const { lang, setLang, t } = useLang();

  return (
    <div
      role="group"
      aria-label={t('lang.toggle')}
      className="lang-toggle"
      data-pro={isPro ? '1' : '0'}
    >
      {SUPPORTED_LANGS.map((code, i) => (
        <span key={code} style={{ display: 'contents' }}>
          {i > 0 && <span className="sep" aria-hidden>/</span>}
          <button
            type="button"
            className={`lt-btn${lang === code ? ' is-on' : ''}`}
            aria-pressed={lang === code}
            aria-label={t(`lang.${code}`)}
            onClick={() => setLang(code)}
          >{t(`lang.${code}`)}</button>
        </span>
      ))}
    </div>
  );
}
