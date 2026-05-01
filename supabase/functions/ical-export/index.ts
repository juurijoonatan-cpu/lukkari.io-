import ical from "npm:ical-generator@7";
import { preflight, requirePro, readJson, json, errorResponse, cors } from "../_shared/auth.ts";

interface Session {
  course_code: string;
  topic?: string;
  duration_min?: number;
  day?: string;
  time?: string;
  date?: string;            // optional ISO date if AI provided one
}

interface Week {
  week_no: number;
  start_date?: string;      // optional ISO Monday of that week
  sessions: Session[];
}

const DAY_INDEX: Record<string, number> = {
  Ma: 1, Ti: 2, Ke: 3, To: 4, Pe: 5, La: 6, Su: 0,
};

function nextMonday(from: Date): Date {
  const d = new Date(from);
  const day = d.getDay();
  const diff = (8 - day) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sessionDate(week: Week, baseMonday: Date, session: Session): Date | null {
  if (session.date) return new Date(session.date);
  const start = week.start_date
    ? new Date(week.start_date)
    : new Date(baseMonday.getTime() + (week.week_no - 1) * 7 * 86400000);
  const dayIdx = session.day ? DAY_INDEX[session.day] : null;
  if (dayIdx == null) return null;
  const sunday = new Date(start);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  const result = new Date(sunday);
  result.setDate(sunday.getDate() + dayIdx);
  if (session.time) {
    const [hh, mm] = session.time.split(":").map(Number);
    result.setHours(hh || 8, mm || 0, 0, 0);
  } else {
    result.setHours(16, 0, 0, 0);
  }
  return result;
}

Deno.serve(async (req) => {
  const pre = preflight(req); if (pre) return pre;

  try {
    const { sb, user } = await requirePro(req);
    const { study_plan_id } = await readJson<{ study_plan_id: string }>(req);
    if (!study_plan_id) return json({ error: "study_plan_id_missing" }, 400);

    const { data: plan } = await sb
      .from("study_plans")
      .select("id, ai_recommendation, school_year")
      .eq("id", study_plan_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!plan?.ai_recommendation) return json({ error: "no_recommendation" }, 404);

    const weeks = ((plan.ai_recommendation as { weeks?: Week[] })?.weeks ?? []) as Week[];
    const baseMonday = nextMonday(new Date());

    const cal = ical({
      name: `Lukkari.io ${plan.school_year}`,
      prodId: { company: "lukkari.io", product: "study-plan", language: "FI" },
      timezone: "Europe/Helsinki",
    });

    for (const week of weeks) {
      for (const session of week.sessions ?? []) {
        const start = sessionDate(week, baseMonday, session);
        if (!start) continue;
        const end = new Date(start.getTime() + (session.duration_min ?? 60) * 60000);
        cal.createEvent({
          start, end,
          summary: `${session.course_code}${session.topic ? ` — ${session.topic}` : ""}`,
          description: `lukkari.io AI-suositus${session.topic ? ` · ${session.topic}` : ""}`,
        });
      }
    }

    return new Response(cal.toString(), {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="lukkari-${plan.school_year || "plan"}.ics"`,
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
});
