import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { TRIAGE_PROMPT } from "../_shared/prompts.ts";

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY")!;

const COURSE_REGEX = /\b(äi|aei|ai|ma|maa|mab|en|ena|enb|ru|rua|rub|fi|fy|ke|bi|hi|yh|us|ps|ge|te|li|mu|ku)\s*0?(\d{1,2})\b/i;

const SUBJECT_NORM: Record<string, string> = {
  ai: "ÄI", aei: "ÄI", "äi": "ÄI",
  ma: "MAA", maa: "MAA", mab: "MAB",
  en: "ENA", ena: "ENA", enb: "ENB",
  ru: "RUA", rua: "RUA", rub: "RUB",
  fi: "FI", fy: "FY", ke: "KE", bi: "BI",
  hi: "HI", yh: "YH", us: "UE", ps: "PS",
  ge: "GE", te: "TE", li: "LI", mu: "MU", ku: "KU",
};

function localCourseCode(message: string): string | null {
  const m = message.match(COURSE_REGEX);
  if (!m) return null;
  const subject = SUBJECT_NORM[m[1].toLowerCase()];
  if (!subject) return null;
  const num = m[2].length === 1 ? `0${m[2]}` : m[2];
  return /^M[A-Z]/.test(subject) ? `${subject}${num}` : `${subject}${parseInt(m[2], 10)}`;
}

const TRIAGE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    intent: { type: "string", enum: ["review","study","explain","schedule","summarize","exam","other"] },
    course_code: { type: ["string","null"] },
    topics: { type: "array", items: { type: "string" }, maxItems: 8 },
    needs_note_ingestion: { type: "boolean" },
    urgency: { type: "string", enum: ["low","normal","high"] },
    tone: { type: "string", enum: ["neutral","stressed","curious"] },
  },
  required: ["intent","course_code","topics","needs_note_ingestion","urgency","tone"],
};

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no_json_in_response");
  return JSON.parse(match[0]);
}

interface TriageBody {
  message: string;
  has_attachment?: boolean;
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;

  try {
    const { sb, user } = await requirePro(req);
    await checkAndIncrementUsage(sb, user.id, "triage-message", 300);

    const { message, has_attachment } = await readJson<TriageBody>(req);
    if (!message?.trim()) return json({ error: "message_missing" }, 400);

    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 240,
        response_format: {
          type: "json_schema",
          json_schema: { name: "triage", strict: true, schema: TRIAGE_SCHEMA },
        },
        messages: [
          { role: "system", content: TRIAGE_PROMPT },
          { role: "user", content: `Viesti: "${message}"\nLiitteenä kuva: ${has_attachment ? "kyllä" : "ei"}` },
        ],
      }),
    });

    if (!oaiRes.ok) {
      const detail = await oaiRes.json().catch(() => ({}));
      return json({ error: "openai_error", detail: detail?.error?.message }, 502);
    }

    const oaiData = await oaiRes.json();
    const content = oaiData.choices?.[0]?.message?.content?.trim() || "";
    const triage = extractJson(content) as Record<string, unknown>;

    // Local fallback: if model didn't catch a course code, try regex.
    const fallbackCode = triage.course_code ?? localCourseCode(message);

    return json({
      ok: true,
      intent: (triage.intent as string) ?? "other",
      course_code: (fallbackCode as string | null) ?? null,
      topics: (triage.topics as string[]) ?? [],
      needs_note_ingestion: !!triage.needs_note_ingestion || !!has_attachment,
      urgency: (triage.urgency as string) ?? "normal",
      tone: (triage.tone as string) ?? "neutral",
    });
  } catch (err) {
    return errorResponse(err);
  }
});
