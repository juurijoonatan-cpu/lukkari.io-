import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../../utils/supabase';

export function buildScheduleContext(school, selections, year) {
  if (!school || !selections || !Object.keys(selections).length) return null;
  const lines = [`Koulu: ${school.name}`, `Lukuvuosi: ${year || "2026–2027"}`, ""];
  for (let pi = 1; pi <= school.periodCount; pi++) {
    const courses = [];
    for (let bi = 1; bi <= school.palkkiCount; bi++) {
      const v = selections[`p${pi}-b${bi}`];
      if (v?.trim()) courses.push(`  Palkki ${bi}: ${v.trim()}`);
    }
    if (courses.length) lines.push(`Periodi ${pi}:\n${courses.join("\n")}`);
  }
  return lines.join("\n");
}

function demoResponse(prompt, scheduleContext) {
  const ctx = scheduleContext ? `\n\n*(Analysoin lukujärjestyksesi: näen kurssivalintasi useammasta periodista — hyvä alku!)*` : "";
  return `**Tämä on demo-vastaus.** Edge Functions -taustaa ei ole vielä otettu käyttöön, joten oikeaa AI-vastausta ei voi vielä antaa.

Kysymyksesi: *"${prompt.slice(0, 140)}${prompt.length > 140 ? "…" : ""}"*${ctx}

Kun taustapalvelu on otettu käyttöön, saat tähän personoidun analyysin lukujärjestyksestäsi:
- **Kurssisuositukset** ylioppilaskirjoituksia silmällä pitäen
- **Konfliktianalyysi** — tunnistaa päällekkäiset valinnat ja liian tiiviit periodit
- **Tasapaino-analyysi** reaal-, kieli- ja taitoaineiden välillä
- **Aikataulutus**: missä järjestyksessä kurssit kannattaa suorittaa

Kaikki vastaukset perustuvat OpenAI gpt-4o-mini -malliin, ja saat 300 kyselyä kuukaudessa Pro-tilauksella.`;
}

export async function callProxy(prompt, scheduleContext) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { content: demoResponse(prompt, scheduleContext), demo: true };

  try {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/openai-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt, scheduleContext }),
    });
    if (!res.ok) {
      if (res.status === 404 || res.status >= 500) {
        return { content: demoResponse(prompt, scheduleContext), demo: true };
      }
      let msg = `Virhe ${res.status}`;
      try { const j = await res.json(); if (j.error) msg = j.error; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    return { content: data.content, demo: false };
  } catch (err) {
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      return { content: demoResponse(prompt, scheduleContext), demo: true };
    }
    throw err;
  }
}
