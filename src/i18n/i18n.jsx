import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from './strings';

const LANG_KEY = 'lukkari.lang';
export const SUPPORTED_LANGS = ['fi', 'en', 'sv'];

function detectInitial() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch {}
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language || '';
    if (/^sv/i.test(nav)) return 'sv';
    if (/^en/i.test(nav)) return 'en';
  }
  return 'fi';
}

const LangCtx = createContext({
  lang: 'fi',
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial);

  useEffect(() => {
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const dict = STRINGS[lang] || STRINGS.fi;
    const fallback = STRINGS.fi;
    const t = (key, vars) => {
      let s = dict[key];
      if (s == null) s = fallback[key];
      if (s == null) s = key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
        }
      }
      return s;
    };
    return {
      lang,
      setLang: (next) => SUPPORTED_LANGS.includes(next) && setLangState(next),
      t,
    };
  }, [lang]);

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

export function useT() {
  return useContext(LangCtx).t;
}
