import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from './supabase';

const ua = () => (typeof navigator !== 'undefined' ? navigator.userAgent : null);
const cleanEmail = (e) => (e || '').trim().toLowerCase();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function callMailer(payload) {
  try {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/send-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'network' };
  }
}

export async function sendScheduleEmail({ email, school, selections, year }) {
  const e = cleanEmail(email);
  if (!isEmail(e)) return { ok: false, error: 'invalid_email' };
  if (!school || !selections) return { ok: false, error: 'missing_schedule' };
  return callMailer({ type: 'schedule', email: e, school, selections, year });
}

export async function sendWelcomeEmail({ email }) {
  const e = cleanEmail(email);
  if (!isEmail(e)) return { ok: false, error: 'invalid_email' };
  return callMailer({ type: 'welcome', email: e });
}

export async function recordSubscribe({
  email,
  source,
  school = null,
  year = null,
  palkitFilled,
  scheduleText = null,
  sendWelcome = true,
}) {
  const e = cleanEmail(email);
  if (!isEmail(e)) return { ok: false, error: 'invalid_email' };

  const sb = supabase
    .from('subscribers')
    .insert({
      email: e,
      source,
      consent_at: new Date().toISOString(),
      school_id:   school?.id ?? null,
      school_name: school?.name ?? null,
      year:        year ?? null,
      palkit_filled: typeof palkitFilled === 'number' ? palkitFilled : null,
      user_agent:  ua(),
    });

  const welcome = sendWelcome
    ? sendWelcomeEmail({ email: e })
    : Promise.resolve({ ok: true, skipped: true });

  const [sbRes, wRes] = await Promise.allSettled([sb, welcome]);
  const stored   = sbRes.status === 'fulfilled' && !sbRes.value.error;
  const welcomed = wRes.status === 'fulfilled' && wRes.value?.ok;

  if (!stored && !welcomed) return { ok: false, error: 'subscribe_failed' };
  return { ok: true, stored, welcomed };
}

export async function recordDownload({
  action,
  school,
  year,
  palkitFilled,
  scheduleText,
  email = null,
}) {
  try {
    await supabase.from('downloads').insert({
      action,
      email: email ? cleanEmail(email) : null,
      school_id:   school?.id ?? null,
      school_name: school?.name ?? null,
      year:        year ?? null,
      palkit_filled: typeof palkitFilled === 'number' ? palkitFilled : null,
      schedule_text: scheduleText ?? null,
      user_agent:  ua(),
    });
  } catch {
    // Telemetry-style — never block the user UI on this.
  }
}
