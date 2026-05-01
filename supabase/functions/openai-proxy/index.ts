import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { MENTOR_SYSTEM_PROMPT } from "../_shared/prompts.ts";

const OPENAI_KEY   = Deno.env.get("OPENAI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAX_REQUESTS = 300;
const MAX_HISTORY  = 8;

const SYSTEM_PROMPT = MENTOR_SYSTEM_PROMPT;

interface HistoryMsg { role: "user" | "assistant"; content: string }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Verify user JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Kirjautuminen vaaditaan." }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SVC);
    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authErr || !user) return json({ error: "Virheellinen istunto." }, 401);

    // Load profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, ai_requests_this_month, requests_reset_at")
      .eq("id", user.id)
      .single();

    if (!profile) return json({ error: "Profiilia ei löydy." }, 404);

    // Check subscription
    if (!["active", "trialing"].includes(profile.subscription_status)) {
      return json({ error: "Pro-tilaus vaaditaan." }, 403);
    }

    // Reset monthly counter if needed
    const resetAt = new Date(profile.requests_reset_at);
    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    let currentRequests = profile.ai_requests_this_month;
    if (resetAt < monthStart) {
      currentRequests = 0;
      await supabase.from("profiles").update({
        ai_requests_this_month: 0,
        requests_reset_at: monthStart.toISOString(),
      }).eq("id", user.id);
    }

    // Rate limit
    if (currentRequests >= MAX_REQUESTS) {
      return json({ error: `Kuukausiraja (${MAX_REQUESTS} kyselyä) täynnä. Resetoituu ensi kuussa.` }, 429);
    }

    // Parse body
    const body = await req.json();
    const prompt: string | undefined = body.prompt;
    const scheduleContext: string | undefined = body.scheduleContext;
    const triage = body.triage as Record<string, unknown> | undefined;
    const history = (Array.isArray(body.history) ? body.history : []) as HistoryMsg[];
    if (!prompt?.trim()) return json({ error: "Kysymys puuttuu." }, 400);

    const triageNote = triage
      ? `[mentor-meta] intent=${triage.intent ?? "?"} course=${triage.course_code ?? "—"} urgency=${triage.urgency ?? "normal"} tone=${triage.tone ?? "neutral"}`
      : null;

    const contextBlock = [
      scheduleContext ? scheduleContext : "Opiskelijalla ei ole vielä tallennettuja kurssivalintoja.",
      triageNote,
    ].filter(Boolean).join("\n\n");

    const trimmedHistory = history.slice(-MAX_HISTORY).filter(m =>
      (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
    );

    // Call OpenAI
    const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextBlock },
          ...trimmedHistory,
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!oaiRes.ok) {
      const err = await oaiRes.json().catch(() => ({}));
      return json({ error: err?.error?.message || "OpenAI-virhe." }, 502);
    }

    const oaiData = await oaiRes.json();
    const content = oaiData.choices?.[0]?.message?.content?.trim() || "";

    // Increment counter
    await supabase.from("profiles")
      .update({ ai_requests_this_month: currentRequests + 1 })
      .eq("id", user.id);

    return json({ content, requestsUsed: currentRequests + 1 });

  } catch (e) {
    return json({ error: "Palvelinvirhe." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
