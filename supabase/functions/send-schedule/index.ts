// Sends the user's timetable as a minimal HTML email via Brevo.
// Public endpoint, no auth — Brevo's per-day quota is the natural rate limit.

const BREVO_KEY    = Deno.env.get("BREVO_API_KEY") ?? "";
const SENDER_EMAIL = Deno.env.get("BREVO_SENDER_EMAIL") ?? "";
const SENDER_NAME  = Deno.env.get("BREVO_SENDER_NAME")  ?? "Lukkari.io";

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
  name: string;
  periodCount: number;
  palkkiCount: number;
  days: string[];
  times: string[];
  rotation: number[][];
}

function renderEmail(opts: {
  school: School;
  selections: Record<string, string>;
  year: string;
}) {
  const { school, selections, year } = opts;

  const periodBlocks: string[] = [];
  for (let pi = 0; pi < school.periodCount; pi++) {
    const rows: string[] = [];
    for (let bi = 0; bi < school.palkkiCount; bi++) {
      const v = selections[`p${pi + 1}-b${bi + 1}`]?.trim();
      if (!v) continue;
      rows.push(`
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #ececec;width:48px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;color:#9a958e;">${bi + 1}</td>
          <td style="padding:8px 0;border-bottom:1px solid #ececec;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1814;">${escapeHtml(v)}</td>
        </tr>`);
    }
    if (!rows.length) {
      rows.push(`<tr><td colspan="2" style="padding:10px 0;color:#aaa6a0;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-style:italic;">— ei kursseja —</td></tr>`);
    }
    periodBlocks.push(`
      <div style="margin:0 0 28px;">
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a958e;margin-bottom:6px;">Periodi</div>
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1;letter-spacing:-0.02em;color:#1a1814;margin-bottom:14px;">${pi + 1}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          ${rows.join("")}
        </table>
      </div>`);
  }

  // Week grid (compact)
  const weekHeader = `
    <tr>
      <th style="padding:6px 4px;border-bottom:1px solid #1a1814;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#9a958e;text-align:left;font-weight:600;">Aika</th>
      ${school.days.map((d) => `<th style="padding:6px 4px;border-bottom:1px solid #1a1814;font-family:Helvetica,Arial,sans-serif;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#9a958e;text-align:left;font-weight:600;">${escapeHtml(d)}</th>`).join("")}
    </tr>`;

  const weekTables: string[] = [];
  for (let pi = 0; pi < school.periodCount; pi++) {
    const bodyRows = school.times.map((t, ti) => {
      const cells = school.days.map((_, di) => {
        const beam = school.rotation[ti]?.[di];
        if (!beam) return `<td style="padding:6px 4px;border-bottom:1px solid #f0eee9;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#cdc9c2;">—</td>`;
        const c = selections[`p${pi + 1}-b${beam}`]?.trim();
        const text = c ? escapeHtml(c) : `(${beam})`;
        return `<td style="padding:6px 4px;border-bottom:1px solid #f0eee9;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:${c ? "#1a1814" : "#cdc9c2"};">${text}</td>`;
      }).join("");
      return `
        <tr>
          <td style="padding:6px 4px;border-bottom:1px solid #f0eee9;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:12px;color:#5a544e;white-space:nowrap;">${escapeHtml(t)}</td>
          ${cells}
        </tr>`;
    }).join("");

    weekTables.push(`
      <div style="margin:0 0 22px;">
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a958e;margin-bottom:8px;">Periodi ${pi + 1}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <thead>${weekHeader}</thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`);
  }

  return `<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lukujärjestyksesi — Lukkari.io</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;">
    <tr><td align="center" style="padding:48px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;">

        <!-- Brand bar -->
        <tr><td style="padding:32px 40px 0;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:-0.01em;color:#1a1814;">
            Lukkari<span style="color:#c97a3a;">.</span>io
          </div>
        </td></tr>

        <!-- Hero -->
        <tr><td style="padding:36px 40px 28px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a958e;margin-bottom:14px;">Lukujärjestyksesi</div>
          <h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:1.05;letter-spacing:-0.025em;color:#1a1814;font-weight:500;">
            ${escapeHtml(school.name)}
          </h1>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#5a544e;letter-spacing:0.04em;">${escapeHtml(year)}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#1a1814;"></div></td></tr>

        <!-- Periods -->
        <tr><td style="padding:36px 40px 8px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a958e;margin-bottom:24px;">Section 01 · Periodit</div>
          ${periodBlocks.join("")}
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px 36px;"><div style="height:1px;background:#1a1814;"></div></td></tr>

        <!-- Week view -->
        <tr><td style="padding:0 40px 36px;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#9a958e;margin-bottom:24px;">Section 02 · Viikkonäkymä</div>
          ${weekTables.join("")}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 40px 40px;">
          <div style="height:1px;background:#ececec;margin-bottom:20px;"></div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9a958e;line-height:1.6;">
            Lukkari.io — kaikki tiedot tallennetaan vain laitteellesi.<br>
            Ei tiliä. Ei seurantaa.
          </div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9a958e;margin-top:14px;">
            <a href="https://lukkari.io" style="color:#c97a3a;text-decoration:none;">lukkari.io</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderText(opts: { school: School; selections: Record<string, string>; year: string }) {
  const { school, selections, year } = opts;
  const lines: string[] = [];
  lines.push(`LUKUJÄRJESTYS — ${school.name} ${year}`);
  lines.push("Viety Lukkari.io:sta\n");
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
  lines.push("\n— Lukkari.io");
  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

  if (!BREVO_KEY || !SENDER_EMAIL) {
    return json({ error: "Sähköpostipalvelua ei ole konfiguroitu." }, 500);
  }

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "Virheellinen pyyntö." }, 400); }

  const email = String(body.email ?? "").trim().toLowerCase();
  const school = body.school as School | undefined;
  const selections = body.selections as Record<string, string> | undefined;
  const year = String(body.year ?? "").trim();

  if (!isEmail(email))                      return json({ error: "Virheellinen sähköpostiosoite." }, 400);
  if (!school || !school.name)              return json({ error: "Koulutiedot puuttuvat." }, 400);
  if (!selections || typeof selections !== "object") return json({ error: "Lukujärjestys puuttuu." }, 400);

  const html = renderEmail({ school, selections, year });
  const text = renderText({ school, selections, year });

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
      subject: `Lukujärjestyksesi — ${school.name} ${year}`.trim(),
      htmlContent: html,
      textContent: text,
      tags: ["lukkari", "schedule_export"],
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
