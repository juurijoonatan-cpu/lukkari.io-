/**
 * Translation dictionary. Add a key to BOTH `fi` and `en`. If a key is
 * missing in `en`, the Finnish value is used as fallback (avoids broken UI).
 *
 * Convention: keys are dotted (header.tabs.free) so they group naturally and
 * stay greppable across components.
 */
export const STRINGS = {
  fi: {
    /* shared */
    'lang.fi': 'FI',
    'lang.en': 'EN',
    'lang.toggle': 'Vaihda kieli',

    /* header */
    'header.tab.free': 'Vapaa',
    'header.tab.pro':  'Pro',
    'header.settings': 'Asetukset',
  },

  en: {
    /* shared */
    'lang.fi': 'FI',
    'lang.en': 'EN',
    'lang.toggle': 'Switch language',

    /* header */
    'header.tab.free': 'Free',
    'header.tab.pro':  'Pro',
    'header.settings': 'Settings',
  },
};
