import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";
import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { NOTE_INGEST_PROMPT } from "../_shared/prompts.ts";

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

interface IngestBody {
  image_path: string;
  course_code?: string;
  course_id?: string;
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;

  try {
    const { sb, user } = await requirePro(req);
    await checkAndIncrementUsage(sb, user.id, "ingest-note", 100);

    const { image_path, course_code, course_id } = await readJson<IngestBody>(req);
    if (!image_path) return json({ error: "image_path_missing" }, 400);
    if (!image_path.startsWith(`${user.id}/`)) return json({ error: "forbidden_path" }, 403);

    const { data: signed, error: sErr } = await sb.storage
      .from("notes")
      .createSignedUrl(image_path, 60);
    if (sErr || !signed) return json({ error: "signed_url_failed" }, 500);

    const imgRes = await fetch(signed.signedUrl);
    if (!imgRes.ok) return json({ error: "image_fetch_failed" }, 500);
    const buffer = await imgRes.arrayBuffer();
    if (buffer.byteLength === 0) return json({ error: "image_empty" }, 400);

    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaTypeFor(image_path), data: base64 } },
          { type: "text", text: NOTE_INGEST_PROMPT },
        ],
      }],
    });

    const raw = (response.content[0] as { text?: string })?.text ?? "";
    const parsed = extractJson(raw) as { ocr_text?: string; topics?: string[] };

    const { data: row, error: insErr } = await sb.from("ingested_notes").insert({
      user_id: user.id,
      course_id: course_id ?? null,
      course_code: course_code ?? null,
      image_path,
      ocr_text: parsed.ocr_text ?? null,
      topics: parsed.topics ?? null,
    }).select("id").single();

    if (insErr) return json({ error: "insert_failed", detail: insErr.message }, 500);

    return json({ ok: true, id: row.id, ocr_text: parsed.ocr_text, topics: parsed.topics ?? [] });
  } catch (err) {
    return errorResponse(err);
  }
});
