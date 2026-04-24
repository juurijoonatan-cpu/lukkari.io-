export function buildTextExport(school, selections, year) {
  const lines = [];
  lines.push(`LUKUJÄRJESTYS — ${school.name} ${year}`);
  lines.push(`Viety Lukkari.io:sta\n`);
  for (let pi = 0; pi < school.periodCount; pi++) {
    lines.push(`${pi + 1}. PERIODI`);
    let any = false;
    for (let bi = 0; bi < school.palkkiCount; bi++) {
      const v = selections[`p${pi + 1}-b${bi + 1}`]?.trim();
      if (v) { lines.push(`  Palkki ${bi + 1}: ${v}`); any = true; }
    }
    if (!any) lines.push("  (ei kursseja kirjattu)");
    lines.push("");
  }
  lines.push("\nVIIKKONÄKYMÄ");
  for (let pi = 0; pi < school.periodCount; pi++) {
    lines.push(`\n${pi + 1}. periodi:`);
    const header = "  " + "Aika".padEnd(14) + school.days.map(d => d.padEnd(10)).join("");
    lines.push(header);
    for (let ti = 0; ti < school.times.length; ti++) {
      const row = school.days.map((_, di) => {
        const beam = school.rotation[ti]?.[di];
        if (!beam) return "—".padEnd(10);
        const c = selections[`p${pi + 1}-b${beam}`]?.trim();
        return (c || `(${beam})`).substring(0, 9).padEnd(10);
      });
      lines.push("  " + school.times[ti].padEnd(14) + row.join(""));
    }
  }
  return lines.join("\n");
}
