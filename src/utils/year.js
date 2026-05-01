// Suomalainen lukuvuosi: elokuu–heinäkuu.
// Esim. 1.4.2026 → "2025–2026", 1.9.2026 → "2026–2027".
// Käytetään en-dash (U+2013) yhteensopivuuden takia muiden tiedostojen kanssa.
export function currentSchoolYear(now = new Date()) {
  const y = now.getFullYear();
  return now.getMonth() >= 7
    ? `${y}–${y + 1}`
    : `${y - 1}–${y}`;
}

// Returns three options around the current school year for UI selection.
export function schoolYearOptions(now = new Date()) {
  const cur = currentSchoolYear(now);
  const [a, b] = cur.split('–').map(Number);
  return [
    `${a - 1}–${b - 1}`,
    cur,
    `${a + 1}–${b + 1}`,
  ];
}
