// Demo-tilan staattiset vastaukset. Kun isDemoActive() = true, ProBeta käyttää
// näitä Edge Functions -kutsujen sijaan, jotta julkinen demo ei kuluta API-budjettia.

export const MOCK_STUDY_PLAN = {
  weeks: [
    {
      week_no: 1,
      sessions: [
        { course_code: 'YH1', topic: 'kpl 1 — johdanto', duration_min: 60, day: 'Ma', time: '16:00' },
        { course_code: 'MAA02', topic: 'derivaatat', duration_min: 60, day: 'Ti', time: '17:00' },
        { course_code: 'ENA3', topic: 'Reading 1.1–1.3', duration_min: 45, day: 'Ke', time: '15:30' },
      ],
    },
    {
      week_no: 2,
      sessions: [
        { course_code: 'YH1', topic: 'kpl 2 — demokratia', duration_min: 60, day: 'Ma', time: '16:00' },
        { course_code: 'MAA02', topic: 'integraalit', duration_min: 75, day: 'To', time: '17:00' },
      ],
    },
  ],
};

const RULES = [
  { match: /tarkasta|kerta|review/i, reply: 'Hyvä, käydään kertaus läpi. Aloita kappaleen ydinkohdista, sitten siirry tehtäviin yksi kerrallaan. Demo-vastaus.' },
  { match: /selit|expla/i, reply: 'Tämä aihe käsittelee perustavan tason ymmärrystä. Kokeile selittää se itsellesi ääneen — siitä huomaat, mihin jäät jumiin. Demo-vastaus.' },
  { match: /aikatau|suunni|plan/i, reply: 'Aikataulu: 45 min keskittynyt jakso, 10 min tauko. Toista 2× — tämä riittää yhden kappaleen sisäistämiseen. Demo-vastaus.' },
  { match: /yo|yliopp|yli\b/i, reply: 'YO-kirjoituksia varten kannattaa keskittyä matematiikkaan, äidinkieleen ja yhden valitun reaalin syvälliseen hallintaan. Demo-vastaus.' },
];

export function mockChatReply(prompt) {
  const rule = RULES.find(r => r.match.test(prompt));
  if (rule) return rule.reply;
  return `Demo-vastaus kysymykseesi: "${prompt.slice(0, 80)}${prompt.length > 80 ? '…' : ''}". Pro-tilauksessa saat oikean AI-vastauksen.`;
}
