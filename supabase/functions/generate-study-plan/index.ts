import { preflight, requirePro, readJson, json, errorResponse, checkAndIncrementUsage } from "../_shared/auth.ts";
import { STUDY_PLAN_SYSTEM_PROMPT } from "../_shared/prompts.ts";

const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY")!;

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no_json_in_response");
  return JSON.parse(match[0]);
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;

  try {
    const { sb, user } = await requirePro(req);
    await checkAndIncrementUsage(sb, user.id, "generate-study-plan", 10);

    const { study_plan_id } = await readJson<{ study_plan_id: string }>(req);
    if (!study_plan_id) return json({ error: "study_plan_id_missing" }, 400);

    const { data: plan } = await sb
      .from("study_plans")
      .select("id, school_year, school_id, schedule_parsed, goals")
      .eq("id", study_plan_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!plan) return json({ error: "plan_not_found" }, 404);

    const [{ data: courses }, { data: tocs }, { data: events }, { data: profile }] = await Promise.all([
      sb.from("courses").select("course_code, subject, course_name, period, palkki, book_toc_id").eq("study_plan_id", study_plan_id),
      sb.from("book_tocs").select("course_code, parsed").eq("user_id", user.id),
      sb.from("external_events").select("title, starts_at, ends_at, rrule, category").eq("user_id", user.id),
      sb.from("profiles").select("grade, graduation_target").eq("id", user.id).maybeSingle(),
    ]);

    const userPayload = {
      profile: {
        grade: profile?.grade ?? null,
        graduation_target: profile?.graduation_target ?? null,
      },
      study_plan: {
        school_year: plan.school_year,
        school_id: plan.school_id,
        goals: plan.goals,
        schedule_parsed: plan.schedule_parsed,
      },
      courses: courses ?? [],
      book_tocs: tocs ?? [],
      external_events: events ?? [],
    };

    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 2400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: STUDY_PLAN_SYSTEM_PROMPT },
          { role: "user", content: `Käyttäjän tiedot JSON:na:\n${JSON.stringify(userPayload)}` },
        ],
      }),
    });

    if (!oaiRes.ok) {
      const detail = await oaiRes.json().catch(() => ({}));
      return json({ error: "openai_error", detail: detail?.error?.message }, 502);
    }

    const oaiData = await oaiRes.json();
    const content = oaiData.choices?.[0]?.message?.content?.trim() || "";
    const recommendation = extractJson(content);

    await sb.from("study_plans")
      .update({ ai_recommendation: recommendation, status: "active" })
      .eq("id", study_plan_id);

    return json({ ok: true, recommendation });
  } catch (err) {
    return errorResponse(err);
  }
});
