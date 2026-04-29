// One Brevo-backed mailer — handles every transactional email Lukkari sends.
// type: 'schedule'  → user receives their timetable
// type: 'welcome'   → user receives waitlist welcome with a call-to-action

const BREVO_KEY    = Deno.env.get("BREVO_API_KEY") ?? "";
const SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
const SENDER_NAME  = Deno.env.get("BREVO_SENDER_NAME")  ?? "Lukkari.io";
const CONTACT_PHONE = Deno.env.get("LUKKARI_CONTACT_PHONE") ?? "040 038 9999";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

interface School {
  id?: string;
  name: string;
  periodCount: number;
  palkkiCount: number;
  days: string[];
  times: string[];
  rotation: number[][];
}

// ── Shared design tokens ─────────────────────────────────────────────
const BG = "#f5f3ee";
const INK = "#1a1814";
const INK_S = "#5a544e";
const INK_F = "#9a958e";
const ACCENT = "#c97a3a";
const HAIR = "#ececec";

const wrap = (inner: string, preheader = "") => `<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lukkari.io</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:32px 40px 0;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:-0.01em;color:${INK};">
            Lukkari<span style="color:${ACCENT};">.</span>io
          </div>
        </td></tr>
        ${inner}
        <tr><td style="padding:0 40px 40px;">
          <div style="height:1px;background:${HAIR};margin-bottom:20px;"></div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${INK_F};line-height:1.6;">
            Lukkari.io — kaikki tiedot tallennetaan vain laitteellesi.<br>
            Ei tiliä. Ei seurantaa.
          </div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${INK_F};margin-top:14px;">
            <a href="https://lukkari.io" style="color:${ACCENT};text-decoration:none;">lukkari.io</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const labelKicker = (text: string) => `
  <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${INK_F};">${escapeHtml(text)}</div>`;

// ── Schedule export (type=schedule) ───────────────────────────────────
function renderScheduleHtml(opts: {
  school: School;
  selections: Record<string, string>;
  year: string;
}) {
  const { school, selections, year } = opts;

  // Per-period course list (no palkki numbers — sorted alphabetically for legibility)
  const periodLists: string[] = [];
  for (let pi = 0; pi < school.periodCount; pi++) {
    const courses: string[] = [];
    for (let bi = 0; bi < school.palkkiCount; bi++) {
      const v = selections[`p${pi + 1}-b${bi + 1}`]?.trim();
      if (v) courses.push(v);
    }
    courses.sort((a, b) => a.localeCompare(b, "fi"));
    const rows = courses.length
      ? courses.map((c) =>
          `<tr><td style="padding:9px 0;border-bottom:1px solid ${HAIR};font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${INK};">${escapeHtml(c)}</td></tr>`
        ).join("")
      : `<tr><td style="padding:10px 0;color:${INK_F};font-family:Helvetica,Arial,sans-serif;font-size:13px;font-style:italic;">— ei kursseja —</td></tr>`;

    periodLists.push(`
      <div style="margin:0 0 28px;">
        ${labelKicker("Periodi " + (pi + 1))}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:8px;">${rows}</table>
      </div>`);
  }

  // Week view: per period, for each day list time → course (skip empty cells entirely)
  const weekBlocks: string[] = [];
  for (let pi = 0; pi < school.periodCount; pi++) {
    const dayBlocks: string[] = [];
    for (let di = 0; di < school.days.length; di++) {
      const dayRows: string[] = [];
      for (let ti = 0; ti < school.times.length; ti++) {
        const beam = school.rotation[ti]?.[di];
        if (!beam) continue;
        const c = selections[`p${pi + 1}-b${beam}`]?.trim();
        if (!c) continue;
        dayRows.push(`
          <tr>
            <td style="padding:7px 12px 7px 0;border-bottom:1px solid ${HAIR};font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;color:${INK_S};white-space:nowrap;width:80px;">${escapeHtml(school.times[ti])}</td>
            <td style="padding:7px 0;border-bottom:1px solid ${HAIR};font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK};">${escapeHtml(c)}</td>
          </tr>`);
      }
      if (!dayRows.length) continue;
      dayBlocks.push(`
        <div style="margin:0 0 18px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${INK_S};margin-bottom:6px;">${escapeHtml(school.days[di])}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${dayRows.join("")}</table>
        </div>`);
    }
    if (!dayBlocks.length) continue;
    weekBlocks.push(`
      <div style="margin:0 0 32px;">
        ${labelKicker("Viikko · Periodi " + (pi + 1))}
        <div style="margin-top:14px;">${dayBlocks.join("")}</div>
      </div>`);
  }

  const inner = `
    <tr><td style="padding:36px 40px 28px;">
      ${labelKicker("Lukujärjestyksesi")}
      <h1 style="margin:8px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;letter-spacing:-0.025em;color:${INK};font-weight:500;">
        ${escapeHtml(school.name)}
      </h1>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK_S};letter-spacing:0.04em;">${escapeHtml(year)}</div>
    </td></tr>
    <tr><td style="padding:0 40px;"><div style="height:1px;background:${INK};"></div></td></tr>
    <tr><td style="padding:36px 40px 8px;">
      ${labelKicker("Periodit")}
      <div style="height:18px;"></div>
      ${periodLists.join("")}
    </td></tr>
    ${weekBlocks.length ? `
      <tr><td style="padding:0 40px 36px;"><div style="height:1px;background:${INK};"></div></td></tr>
      <tr><td style="padding:0 40px 24px;">
        ${labelKicker("Viikkonäkymä")}
        <div style="height:18px;"></div>
        ${weekBlocks.join("")}
      </td></tr>` : ""}
  `;

  return wrap(inner, `Lukujärjestyksesi — ${school.name} ${year}`);
}

function renderScheduleText(opts: { school: School; selections: Record<string, string>; year: string }) {
  const { school, selections, year } = opts;
  const lines: string[] = [];
  lines.push(`LUKUJÄRJESTYKSESI — ${school.name}`);
  lines.push(year);
  lines.push("");
  for (let pi = 0; pi < school.periodCount; pi++) {
    const courses: string[] = [];
    for (let bi = 0; bi < school.palkkiCount; bi++) {
      const v = selections[`p${pi + 1}-b${bi + 1}`]?.trim();
      if (v) courses.push(v);
    }
    if (!courses.length) continue;
    courses.sort((a, b) => a.localeCompare(b, "fi"));
    lines.push(`PERIODI ${pi + 1}`);
    courses.forEach((c) => lines.push(`  ${c}`));
    lines.push("");
  }
  lines.push("—");
  lines.push("Lukkari.io");
  return lines.join("\n");
}

// ── Waitlist welcome (type=welcome) ───────────────────────────────────
function renderWelcomeHtml() {
  const phoneDigits = CONTACT_PHONE.replace(/\s+/g, "");
  const inner = `
    <tr><td style="padding:36px 40px 28px;">
      ${labelKicker("Tervetuloa")}
      <h1 style="margin:8px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.05;letter-spacing:-0.025em;color:${INK};font-weight:500;">
        Olet listalla.
      </h1>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK_S};letter-spacing:0.04em;line-height:1.65;margin-top:14px;">
        Ilmoitamme heti kun Lukkari Pro avaa ovensa.<br>
        Kiitos että olet mukana alkumetreiltä.
      </div>
    </td></tr>
    <tr><td style="padding:0 40px;"><div style="height:1px;background:${INK};"></div></td></tr>
    <tr><td style="padding:32px 40px 12px;">
      ${labelKicker("Haluatko olla mukana enemmän")}
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;letter-spacing:-0.01em;color:${INK};margin-top:14px;">
        Lukkari rakennetaan yhdessä — opiskelijoiden, kotien ja tukijoiden kanssa.
      </div>
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK_S};line-height:1.7;margin-top:14px;">
        Jos kiinnostaa tukea projektia tai keskustella sijoitusmahdollisuuksista, ole yhteydessä suoraan.
      </div>
    </td></tr>
    <tr><td style="padding:18px 40px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:18px 22px;background:${INK};border-radius:14px;">
            <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#bdb6ad;">Soita tai vastaa tähän viestiin</div>
            <div style="margin-top:6px;">
              <a href="tel:${phoneDigits}" style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;letter-spacing:-0.01em;color:#ffffff;text-decoration:none;">${escapeHtml(CONTACT_PHONE)}</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  `;
  return wrap(inner, "Olet Lukkari.io-listalla — kiitos.");
}

function renderWelcomeText() {
  return [
    "OLET LISTALLA.",
    "",
    "Ilmoitamme heti kun Lukkari Pro avaa ovensa.",
    "Kiitos että olet mukana alkumetreiltä.",
    "",
    "—",
    "",
    "Haluatko olla mukana enemmän?",
    "Lukkari rakennetaan yhdessä — opiskelijoiden, kotien ja tukijoiden kanssa.",
    "",
    "Jos kiinnostaa tukea projektia tai keskustella sijoitusmahdollisuuksista,",
    `soita ${CONTACT_PHONE} tai vastaa tähän viestiin.`,
    "",
    "—",
    "Lukkari.io",
  ].join("\n");
}

// ── HTTP entry ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

  if (!BREVO_KEY || !SENDER_EMAIL) {
    return json({ error: "Sähköpostipalvelua ei ole konfiguroitu." }, 500);
  }

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "Virheellinen pyyntö." }, 400); }

  const type = String(body.type ?? "schedule");
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return json({ error: "Virheellinen sähköpostiosoite." }, 400);

  let subject: string;
  let htmlContent: string;
  let textContent: string;
  let tag: string;

  if (type === "welcome") {
    subject     = "Olet Lukkari.io-listalla";
    htmlContent = renderWelcomeHtml();
    textContent = renderWelcomeText();
    tag         = "waitlist_welcome";
  } else if (type === "schedule") {
    const school = body.school as School | undefined;
    const selections = body.selections as Record<string, string> | undefined;
    const year = String(body.year ?? "").trim();
    if (!school?.name)                                 return json({ error: "Koulutiedot puuttuvat." }, 400);
    if (!selections || typeof selections !== "object") return json({ error: "Lukujärjestys puuttuu." }, 400);
    subject     = `Lukujärjestyksesi — ${school.name} ${year}`.trim();
    htmlContent = renderScheduleHtml({ school, selections, year });
    textContent = renderScheduleText({ school, selections, year });
    tag         = "schedule_export";
  } else {
    return json({ error: `Tuntematon tyyppi: ${type}` }, 400);
  }

  const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_KEY,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email }],
      replyTo: { email: SENDER_EMAIL, name: SENDER_NAME },
      subject,
      htmlContent,
      textContent,
      tags: ["lukkari", tag],
    }),
  });

  if (!brevoRes.ok) {
    const err = await brevoRes.json().catch(() => ({}));
    const detail = err?.message || err?.code || `HTTP ${brevoRes.status}`;
    return json({ error: `Brevo: ${detail}` }, 502);
  }

  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
