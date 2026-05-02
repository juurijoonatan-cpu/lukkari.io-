import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { TIMETABLE_PROMPT } from "../_shared/prompts.ts";

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

function mediaTypeFor(path: string): "image/png" | "image/jpeg" | "image/webp" {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no_json_in_response");
  return JSON.parse(match[0]);
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;

  try {
    const { sb, user } = await requirePro(req);
    await checkAndIncrementUsage(sb, user.id, "parse-schedule-image", 20);

    const { study_plan_id } = await readJson<{ study_plan_id: string }>(req);
    if (!study_plan_id) return json({ error: "study_plan_id_missing" }, 400);

    const { data: plan } = await sb
      .from("study_plans")
      .select("id, schedule_image_path")
      .eq("id", study_plan_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!plan?.schedule_image_path) return json({ error: "no_schedule_image" }, 404);

    const { data: signed, error: sErr } = await sb.storage
      .from("schedules")
      .createSignedUrl(plan.schedule_image_path, 60);
    if (sErr || !signed) return json({ error: "signed_url_failed" }, 500);

    const imgRes = await fetch(signed.signedUrl);
    if (!imgRes.ok) return json({ error: "image_fetch_failed" }, 500);
    const buffer = await imgRes.arrayBuffer();
    if (buffer.byteLength === 0) return json({ error: "image_empty" }, 400);

    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaTypeFor(plan.schedule_image_path), data: base64 } },
          { type: "text", text: TIMETABLE_PROMPT },
        ],
      }],
    });

    const raw = (response.content[0] as { text?: string })?.text ?? "";
    const parsed = extractJson(raw);

    await sb.from("study_plans").update({ schedule_parsed: parsed }).eq("id", study_plan_id);

    return json({ ok: true, parsed });
  } catch (err) {
    return errorResponse(err);
  }
});
