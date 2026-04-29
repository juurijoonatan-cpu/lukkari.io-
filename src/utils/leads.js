import { supabase, SUPABASE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from './supabase';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

const ua = () => (typeof navigator !== 'undefined' ? navigator.userAgent : null);

const cleanEmail = (e) => (e || '').trim().toLowerCase();

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function postWeb3Forms(payload) {
  if (!WEB3FORMS_KEY) return { ok: false, skipped: true };
  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return { ok: false, error: data.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'network' };
  }
}

export async function recordSubscribe({
  email,
  source,
  school,
  year,
  palkitFilled,
  scheduleText,
  notify = true,
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

  const w3f = notify
    ? postWeb3Forms({
        subject: `Lukkari.io — uusi tilaaja: ${e}`,
        from_name: 'Lukkari.io',
        email: e,
        message: [
          `Sähköposti: ${e}`,
          source ? `Lähde: ${source}` : null,
          school?.name ? `Koulu: ${school.name}` : null,
          year ? `Lukuvuosi: ${year}` : null,
          typeof palkitFilled === 'number' ? `Kursseja täytetty: ${palkitFilled}` : null,
          'Markkinointisuostumus: Kyllä',
          scheduleText ? `\nLukujärjestys:\n${scheduleText}` : null,
        ].filter(Boolean).join('\n'),
      })
    : Promise.resolve({ ok: true, skipped: true });

  const [sbRes, w3fRes] = await Promise.allSettled([sb, w3f]);
  const stored = sbRes.status === 'fulfilled' && !sbRes.value.error;
  const notified = w3fRes.status === 'fulfilled' && w3fRes.value.ok;

  if (!stored && !notified) {
    return { ok: false, error: 'storage_and_notify_failed' };
  }
  return { ok: true, stored, notified };
}

export async function sendScheduleEmail({ email, school, selections, year }) {
  const e = cleanEmail(email);
  if (!isEmail(e)) return { ok: false, error: 'invalid_email' };
  if (!school || !selections) return { ok: false, error: 'missing_schedule' };

  try {
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/send-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email: e, school, selections, year }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error || `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'network' };
  }
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
