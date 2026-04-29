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

    /* ── Pro info page ── */

    /* hero */
    'pro.hero.beta':  'BETA',
    'pro.hero.brand': 'Lukkari',
    'pro.hero.brandPro': 'Pro',
    'pro.hero.sub':
      'Tekoäly suunnittelee opintosi puolestasi. Sinä keskityt opiskeluun. ' +
      'Saat henkilökohtaiset kurssisuositukset, valmiit lukusuunnitelmat ' +
      'ja selkeät kertausaikataulut kokeisiin.',
    'pro.hero.cta':   'Tutustu demoon',
    'pro.hero.foot':  'Ei rekisteröitymistä. Demo aukeaa heti.',

    /* stats */
    'pro.stats.label':    'Miksi Pro',
    'pro.stats.titleA':   'Tehty ',
    'pro.stats.titleEm':  'opiskelijalle',
    'pro.stats.titleB':   ', ei koululle.',
    'pro.stats.sub':
      'Lukkari Pro ei ole kalenteri. Se on opintoassistentti, joka ymmärtää ' +
      'suomalaisen lukion rakenteen ja auttaa sinua valitsemaan oikein.',
    'pro.stats.s1.value': '300+',
    'pro.stats.s1.label': 'AI-kyselyä',
    'pro.stats.s1.desc':  'Pro-tilauksella kuukaudessa. Riittää koko lukuvuoden suunnitteluun.',
    'pro.stats.s2.value': 'Suomeksi',
    'pro.stats.s2.label': 'Alusta asti',
    'pro.stats.s2.desc':  'Rakennettu suomalaisille opiskelijoille. Wilman aikataulujen päälle.',
    'pro.stats.s3.value': '0 €',
    'pro.stats.s3.label': 'Demo',
    'pro.stats.s3.desc':  'Kokeile ilman tiliä. Ei sähköpostia, ei sitoutumista.',
    'pro.stats.s4.value': '24/7',
    'pro.stats.s4.label': 'Selaimessa',
    'pro.stats.s4.desc':  'Toimii puhelimella, läppärillä ja tabletilla. Ei asennusta.',

    /* flow */
    'pro.flow.label':     'Näin Pro toimii',
    'pro.flow.s1.title':  'Lisää kurssisi',
    'pro.flow.s1.desc':   'Täytä lukujärjestyksesi ilmaisversiossa. Vie hetken ja tallentuu selaimeesi.',
    'pro.flow.s2.title':  'AI analysoi',
    'pro.flow.s2.desc':   'Tekoäly vertaa valintojasi ylioppilaskirjoituksiin, hakukohteisiin ja painotukseesi.',
    'pro.flow.s3.title':  'Saat suunnitelman',
    'pro.flow.s3.desc':   'Henkilökohtaiset kurssisuositukset ja viikkokohtainen lukusuunnitelma.',

    /* features */
    'pro.features.label':       'Mitä saat Prolla',
    'pro.features.badgeMain':   'Tärkein',
    'pro.features.f1.title':    'Kurssisuosittelija',
    'pro.features.f1.desc':     'Tekoäly ehdottaa juuri sinulle sopivat kurssit. Ehdotukset huomioivat ylioppilaskirjoitukset, hakukohteet ja oman painotuksesi.',
    'pro.features.f2.title':    'Lukusuunnitelma',
    'pro.features.f2.desc':     'Selkeä viikkosuunnitelma kursseittain. Tekoäly kertoo mitä opiskella ensin ja kuinka kauan.',
    'pro.features.f3.title':    'Lukuaikataulu kokeisiin',
    'pro.features.f3.desc':     'Syötä koepäivä, saat kertausaikataulun. Tasainen tahti, ei viime hetken pänttäämistä.',
    'pro.features.f4.title':    'Konfliktianalyysi',
    'pro.features.f4.desc':     'Tunnistaa aikatauluristiriidat automaattisesti, ennen kuin niistä ehtii tulla ongelma.',
    'pro.features.f5.title':    'Kalenteri-synkronointi',
    'pro.features.f5.desc':     'Vie lukujärjestys suoraan Google tai Apple kalenteriin yhdellä klikkauksella.',
    'pro.features.f6.title':    'PDF-export',
    'pro.features.f6.desc':     'Tallenna tai tulosta lukujärjestys siistinä PDF-tiedostona.',
    'pro.features.f7.title':    'Pilvivarmuuskopio',
    'pro.features.f7.desc':     'Kurssivalintasi tallessa pilvessä. Vaihda laitetta huoletta, valinnat seuraavat mukana.',

    /* signup */
    'pro.signup.title':         'Kiinnostuitko?',
    'pro.signup.sub':           'Jätä sähköpostisi. Kerromme kun Pro avaa ovensa virallisesti.',
    'pro.signup.ok':            'Kiitos. Olet listalla, saat tervetuloviestin sähköpostiisi.',
    'pro.signup.placeholder':   'sinun@email.fi',
    'pro.signup.btn':           'Ilmoittaudu',
    'pro.signup.btnSending':    'Lähetetään',
    'pro.signup.errRetry':      'Yritä uudelleen hetken kuluttua.',
    'pro.signup.errNet':        'Verkkoyhteys ei toimi.',
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

    /* ── Pro info page ── */

    /* hero */
    'pro.hero.beta':  'BETA',
    'pro.hero.brand': 'Lukkari',
    'pro.hero.brandPro': 'Pro',
    'pro.hero.sub':
      'AI plans your studies for you. You focus on learning. ' +
      'Get personalized course recommendations, ready made study plans ' +
      'and clear revision schedules for your exams.',
    'pro.hero.cta':   'Try the demo',
    'pro.hero.foot':  'No signup needed. The demo opens instantly.',

    /* stats */
    'pro.stats.label':    'Why Pro',
    'pro.stats.titleA':   'Built for ',
    'pro.stats.titleEm':  'students',
    'pro.stats.titleB':   ', not schools.',
    'pro.stats.sub':
      'Lukkari Pro is not a calendar. It is a study assistant that ' +
      'understands the Finnish upper secondary system and helps you ' +
      'pick the right path.',
    'pro.stats.s1.value': '300+',
    'pro.stats.s1.label': 'AI requests',
    'pro.stats.s1.desc':  'Per month with Pro. Enough to plan a full school year.',
    'pro.stats.s2.value': 'Finnish',
    'pro.stats.s2.label': 'Native',
    'pro.stats.s2.desc':  'Built for Finnish students. Designed around Wilma timetables.',
    'pro.stats.s3.value': '€0',
    'pro.stats.s3.label': 'Demo',
    'pro.stats.s3.desc':  'Try without an account. No email, no commitment.',
    'pro.stats.s4.value': '24/7',
    'pro.stats.s4.label': 'In the browser',
    'pro.stats.s4.desc':  'Works on phone, laptop and tablet. No install.',

    /* flow */
    'pro.flow.label':     'How Pro works',
    'pro.flow.s1.title':  'Add your courses',
    'pro.flow.s1.desc':   'Build your timetable in the free version. Takes a moment and saves to your browser.',
    'pro.flow.s2.title':  'AI analyzes',
    'pro.flow.s2.desc':   'AI compares your choices against matriculation exams, university targets and your focus areas.',
    'pro.flow.s3.title':  'Get your plan',
    'pro.flow.s3.desc':   'Personalized course recommendations and a weekly study plan.',

    /* features */
    'pro.features.label':       'What you get with Pro',
    'pro.features.badgeMain':   'Top pick',
    'pro.features.f1.title':    'Course recommender',
    'pro.features.f1.desc':     'AI suggests courses that fit you. Recommendations factor in matriculation exams, university targets and your own focus.',
    'pro.features.f2.title':    'Study plan',
    'pro.features.f2.desc':     'A clear weekly plan per course. AI tells you what to study first and for how long.',
    'pro.features.f3.title':    'Exam revision schedule',
    'pro.features.f3.desc':     'Enter the exam date, get a revision schedule. Steady pace, no last minute cramming.',
    'pro.features.f4.title':    'Conflict analysis',
    'pro.features.f4.desc':     'Spots schedule conflicts automatically, before they turn into a problem.',
    'pro.features.f5.title':    'Calendar sync',
    'pro.features.f5.desc':     'Export your timetable straight to Google or Apple Calendar in one click.',
    'pro.features.f6.title':    'PDF export',
    'pro.features.f6.desc':     'Save or print your timetable as a clean PDF.',
    'pro.features.f7.title':    'Cloud backup',
    'pro.features.f7.desc':     'Your course choices safe in the cloud. Switch devices freely, choices follow you.',

    /* signup */
    'pro.signup.title':         'Interested?',
    'pro.signup.sub':           'Drop your email. We will let you know when Pro launches officially.',
    'pro.signup.ok':            'Thanks. You are on the list, a welcome email is on its way.',
    'pro.signup.placeholder':   'your@email.com',
    'pro.signup.btn':           'Notify me',
    'pro.signup.btnSending':    'Sending',
    'pro.signup.errRetry':      'Please try again in a moment.',
    'pro.signup.errNet':        'Network error.',
  },
};
