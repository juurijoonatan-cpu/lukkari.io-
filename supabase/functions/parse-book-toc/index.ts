import Anthropic from "npm:@anthropic-ai/sdk@0.30.1";
import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { BOOK_TOC_PROMPT } from "../_shared/prompts.ts";

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
    await checkAndIncrementUsage(sb, user.id, "parse-book-toc", 60);

    const { book_toc_id } = await readJson<{ book_toc_id: string }>(req);
    if (!book_toc_id) return json({ error: "book_toc_id_missing" }, 400);

    const { data: toc } = await sb
      .from("book_tocs")
      .select("id, image_path")
      .eq("id", book_toc_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!toc?.image_path) return json({ error: "no_image" }, 404);

    const { data: signed, error: sErr } = await sb.storage
      .from("book-tocs")
      .createSignedUrl(toc.image_path, 60);
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
          { type: "image", source: { type: "base64", media_type: mediaTypeFor(toc.image_path), data: base64 } },
          { type: "text", text: BOOK_TOC_PROMPT },
        ],
      }],
    });

    const raw = (response.content[0] as { text?: string })?.text ?? "";
    const parsed = extractJson(raw) as { course_code?: string };

    await sb.from("book_tocs").update({
      parsed,
      ...(parsed.course_code ? { course_code: parsed.course_code } : {}),
    }).eq("id", book_toc_id);

    return json({ ok: true, parsed });
  } catch (err) {
    return errorResponse(err);
  }
});
