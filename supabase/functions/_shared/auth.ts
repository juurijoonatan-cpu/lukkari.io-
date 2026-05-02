import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  return null;
}

export class HttpError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, payload: unknown) {
    super(typeof payload === "string" ? payload : JSON.stringify(payload));
    this.status = status;
    this.payload = payload;
  }
}

export interface AuthResult {
  sb: SupabaseClient;
  user: { id: string; email?: string | null };
}

export async function requirePro(req: Request): Promise<AuthResult> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new HttpError(401, { error: "unauthorized" });
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: { user }, error } = await sb.auth.getUser(auth.slice(7));
  if (error || !user) throw new HttpError(401, { error: "unauthorized" });

  const { data: profile } = await sb
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  const status = profile?.subscription_status || "";
  if (!["active", "trialing"].includes(status)) {
    throw new HttpError(402, { error: "pro_required" });
  }

  return { sb, user: { id: user.id, email: user.email } };
}

export async function checkAndIncrementUsage(
  sb: SupabaseClient,
  userId: string,
  feature: string,
  monthlyLimit = 300
): Promise<void> {
  const month = new Date().toISOString().slice(0, 7);

  const { data } = await sb
    .from("usage_counters")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .eq("month", month)
    .maybeSingle();

  const current = data?.count ?? 0;
  if (current >= monthlyLimit) {
    throw new HttpError(429, { error: "rate_limit", limit: monthlyLimit });
  }

  await sb.from("usage_counters").upsert(
    { user_id: userId, feature, month, count: current + 1 },
    { onConflict: "user_id,feature,month" }
  );
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, { error: "invalid_json" });
  }
}

export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return json(err.payload, err.status);
  }
  console.error(err);
  return json({ error: "internal_error" }, 500);
}
