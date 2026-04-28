const FI_MONTHS = ['tammikuuta','helmikuuta','maaliskuuta','huhtikuuta','toukokuuta','kesäkuuta','heinäkuuta','elokuuta','syyskuuta','lokakuuta','marraskuuta','joulukuuta'];
const SWATCHES = [
  'oklch(0.65 0.16 45)',
  'oklch(0.60 0.13 150)',
  'oklch(0.66 0.15 80)',
  'oklch(0.58 0.13 240)',
  'oklch(0.65 0.14 340)',
  'oklch(0.62 0.16 20)',
  'oklch(0.60 0.13 200)',
  'oklch(0.64 0.14 120)',
  'oklch(0.62 0.14 300)',
];

export function formatToday(d = new Date()) {
  return { day: d.getDate(), month: FI_MONTHS[d.getMonth()] };
}

/**
 * Derive today's lessons from school + selections.
 * Mon=0..Fri=4. Returns [] for weekends.
 * Picks current period as the one with the most filled palkit, falling back to 1.
 */
export function buildTodayLessons(school, selections) {
  if (!school?.rotation?.length || !school?.times?.length) return { lessons: [], period: null };
  const now = new Date();
  const dow = now.getDay();
  if (dow === 0 || dow === 6) return { lessons: [], period: null, weekend: true };
  const dayIdx = dow - 1;

  // Pick the period with the most filled palkit
  let period = 1, best = -1;
  for (let pi = 1; pi <= school.periodCount; pi++) {
    let n = 0;
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      if (selections?.[`p${pi}-b${bi}`]?.trim()) n++;
    }
    if (n > best) { best = n; period = pi; }
  }

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const lessons = school.times.map((t, slot) => {
    const palkki = school.rotation[slot]?.[dayIdx] ?? null;
    const label = palkki ? selections?.[`p${period}-b${palkki}`]?.trim() : null;
    const [from, to] = parseTimes(t);
    const live = from != null && to != null && nowMin >= from && nowMin < to;
    return {
      time: t,
      from, to, live,
      palkki,
      label: label || null,
      swatch: palkki ? SWATCHES[(palkki - 1) % SWATCHES.length] : null,
    };
  }).filter(l => l.palkki); // skip null slots in rotation

  return { lessons, period };
}

function parseTimes(t) {
  // "8.15–9.45" -> [495, 585]
  const m = t.match(/(\d{1,2})[.:](\d{2})\s*[–-]\s*(\d{1,2})[.:](\d{2})/);
  if (!m) return [null, null];
  return [
    parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
    parseInt(m[3], 10) * 60 + parseInt(m[4], 10),
  ];
}
