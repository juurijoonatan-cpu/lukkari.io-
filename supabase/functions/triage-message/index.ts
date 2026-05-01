import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { TRIAGE_PROMPT } from "../_shared/prompts.ts";

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY")!;

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
        response_format: { type: "json_object" },
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
    const triage = extractJson(content) as {
      intent?: string;
      course_code?: string | null;
      topics?: string[];
      needs_note_ingestion?: boolean;
    };

    return json({
      ok: true,
      intent: triage.intent ?? "other",
      course_code: triage.course_code ?? null,
      topics: triage.topics ?? [],
      needs_note_ingestion: !!triage.needs_note_ingestion,
    });
  } catch (err) {
    return errorResponse(err);
  }
});
