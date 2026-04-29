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

    'common.cancel': 'Peruuta',
    'common.save':   'Tallenna',
    'common.add':    'Lisää',
    'common.clear':  'Tyhjennä',
    'common.close':  'Sulje',

    /* header */
    'header.tab.free': 'Vapaa',
    'header.tab.pro':  'Pro',
    'header.settings': 'Asetukset',

    /* footer */
    'footer.privacy': 'Tietosuojaseloste',
    'footer.terms':   'Käyttöehdot',
    'footer.cookies': 'Evästekäytäntö',

    /* free app shell */
    'app.tagline':         'Täytä palkit, näe lukujärjestyksesi',
    'app.coursesLogged':   '{n} kurssia kirjattu',
    'app.matrix':          'Kurssimatriisi',
    'app.gridSummary':     '{p} palkkia · {pe} periodia',
    'app.saved':           'Tallennettu',
    'app.share':           'Jaa kaverille',
    'app.shareCopied':     'Linkki kopioitu!',
    'app.shareText':       'Suunnittele lukuvuotesi kurssit helposti!',
    'app.weekView':        'Viikkokaavio',
    'app.period':          'periodi',
    'app.coursesOne':      'kurssi',
    'app.coursesMany':     'kursseja',
    'app.customSchool':    'Oma koulu',

    /* choice grid */
    'grid.legend':         'Väri = palkki · Sarakkeet = periodit',
    'grid.tabHint':        'Tab → seuraava solu',

    /* confirm clear */
    'confirm.title':       'Tyhjennä kaikki?',
    'confirm.body':        'Kaikki kurssikirjaukset poistetaan pysyvästi. Tätä ei voi perua.',

    /* wishlist */
    'wishlist.title':      'Kurssilista',
    'wishlist.placeholder':'Lisää kurssi (esim. MAA4)',
    'wishlist.empty':      'Lisää haluamasi kurssit listaan',
    'wishlist.allAdded':   'Kaikki kurssit lisätty ruudukkoon',
    'wishlist.summary':    '{done} / {total} lisätty · {missing} puuttuu',

    /* settings panel */
    'settings.year':           'Lukuvuosi',
    'settings.export':         'Vie & jaa',
    'settings.exportHint':     'lisää ensin kursseja',
    'settings.email':          'Lähetä sähköpostiin',
    'settings.download':       'Lataa tekstitiedostona',
    'settings.copy':           'Kopioi leikepöydälle',
    'settings.copied':         'Kopioitu!',
    'settings.print':          'Tulosta / Tallenna PDF:ksi',
    'settings.export.hint':    'Saat lukujärjestyksesi sähköpostiisi siistinä koosteena.',
    'settings.export.consent': 'Liity samalla Lukkari.io-listalle. Saat tiedon uusista ominaisuuksista.',
    'settings.export.send':    'Lähetä lukujärjestys',
    'settings.export.sent':    'Lähetetty. Tarkista sähköpostisi.',
    'settings.export.failed':  'Lähetys epäonnistui.',
    'settings.list.title':     'Liity Lukkari.io-listalle',
    'settings.list.thanks':    'Kiitos! Olet nyt listalla.',
    'settings.list.hint':      'Saat tiedon uusista ominaisuuksista. Ei spämmejä.',
    'settings.list.placeholder': 'sähköpostisi@esim.fi',
    'settings.list.consent':   'Suostun, että Lukkari.io käyttää sähköpostiani markkinointiviestintään. Voin peruuttaa suostumukseni milloin tahansa.',
    'settings.list.error':     'Jokin meni pieleen, yritä uudelleen.',
    'settings.list.sending':   'Lähetetään',
    'settings.list.join':      'Liity listalle',
    'settings.school':         'Koulu',
    'settings.manage':         'Hallinta',
    'settings.clearAll':       'Tyhjennä kaikki kurssit',
    'settings.foot1':          'Lukkari.io. Kaikki tiedot tallennetaan vain tällä laitteella.',
    'settings.foot2':          'Ei tiliä. Ei seurantaa.',

    /* school picker / custom school */
    'sp.custom.title':         'Oma koulu',
    'sp.custom.optionLabel':   '✏️ Oma koulu',
    'sp.custom.name':          'Koulun nimi',
    'sp.custom.namePh':        'esim. Tapiolan lukio',
    'sp.custom.periods':       'Periodeja',
    'sp.custom.palkkit':       'Palkkeja',
    'sp.custom.rotation':      'Tuntikiertokaavio',
    'sp.custom.time':          'Aika',

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

    'common.cancel': 'Cancel',
    'common.save':   'Save',
    'common.add':    'Add',
    'common.clear':  'Clear',
    'common.close':  'Close',

    /* header */
    'header.tab.free': 'Free',
    'header.tab.pro':  'Pro',
    'header.settings': 'Settings',

    /* footer */
    'footer.privacy': 'Privacy policy',
    'footer.terms':   'Terms of service',
    'footer.cookies': 'Cookie policy',

    /* free app shell */
    'app.tagline':         'Fill the slots, see your timetable',
    'app.coursesLogged':   '{n} courses logged',
    'app.matrix':          'Course matrix',
    'app.gridSummary':     '{p} slots · {pe} periods',
    'app.saved':           'Saved',
    'app.share':           'Share with a friend',
    'app.shareCopied':     'Link copied!',
    'app.shareText':       'Plan your school year courses easily!',
    'app.weekView':        'Weekly view',
    'app.period':          'period',
    'app.coursesOne':      'course',
    'app.coursesMany':     'courses',
    'app.customSchool':    'Custom school',

    /* choice grid */
    'grid.legend':         'Color = slot · Columns = periods',
    'grid.tabHint':        'Tab → next cell',

    /* confirm clear */
    'confirm.title':       'Clear everything?',
    'confirm.body':        'All course entries will be permanently deleted. This cannot be undone.',

    /* wishlist */
    'wishlist.title':      'Course list',
    'wishlist.placeholder':'Add a course (e.g. MAA4)',
    'wishlist.empty':      'Add the courses you want to your list',
    'wishlist.allAdded':   'All courses added to the grid',
    'wishlist.summary':    '{done} / {total} added · {missing} missing',

    /* settings panel */
    'settings.year':           'School year',
    'settings.export':         'Export & share',
    'settings.exportHint':     'add courses first',
    'settings.email':          'Send by email',
    'settings.download':       'Download as text file',
    'settings.copy':           'Copy to clipboard',
    'settings.copied':         'Copied!',
    'settings.print':          'Print / Save as PDF',
    'settings.export.hint':    'You will receive your timetable as a clean email summary.',
    'settings.export.consent': 'Also join the Lukkari.io list. Get updates on new features.',
    'settings.export.send':    'Send timetable',
    'settings.export.sent':    'Sent. Check your email.',
    'settings.export.failed':  'Sending failed.',
    'settings.list.title':     'Join the Lukkari.io list',
    'settings.list.thanks':    'Thanks! You are now on the list.',
    'settings.list.hint':      'Get updates on new features. No spam.',
    'settings.list.placeholder': 'your@email.com',
    'settings.list.consent':   'I consent to Lukkari.io using my email for marketing communications. I can withdraw my consent at any time.',
    'settings.list.error':     'Something went wrong, please try again.',
    'settings.list.sending':   'Sending',
    'settings.list.join':      'Join the list',
    'settings.school':         'School',
    'settings.manage':         'Manage',
    'settings.clearAll':       'Clear all courses',
    'settings.foot1':          'Lukkari.io. All data is stored only on this device.',
    'settings.foot2':          'No account. No tracking.',

    /* school picker / custom school */
    'sp.custom.title':         'Custom school',
    'sp.custom.optionLabel':   '✏️ Custom school',
    'sp.custom.name':          'School name',
    'sp.custom.namePh':        'e.g. My High School',
    'sp.custom.periods':       'Periods',
    'sp.custom.palkkit':       'Slots',
    'sp.custom.rotation':      'Class rotation table',
    'sp.custom.time':          'Time',

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
