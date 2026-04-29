import { useState } from 'react';

/**
 * Submit a Pro waitlist signup. Tomorrow this hits Web3Forms via:
 *   POST https://api.web3forms.com/submit
 *   { access_key, email, subject, from_name }
 * For now it returns success so the UI flow is testable without a key.
 */
async function submitEmail(email) {
  const key = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!key) {
    // Demo path: fake success so the UI can be developed without the key.
    await new Promise(r => setTimeout(r, 350));
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        subject: 'Lukkari Pro waitlist signup',
        from_name: 'Lukkari.io',
        email,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return { ok: false, error: data.message || `Virhe ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || 'Verkkoyhteys ei toimi.' };
  }
}

export function ProInfoSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', error: null });

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    if (!valid || state.status === 'sending') return;
    setState({ status: 'sending', error: null });
    const r = await submitEmail(email.trim());
    if (r.ok) {
      setState({ status: 'sent', error: null });
    } else {
      setState({ status: 'idle', error: r.error || 'Yritä uudelleen.' });
    }
  };

  return (
    <section className="pi-card pi-signup">
      <p className="pi-signup-title">Kiinnostuitko?</p>

      {state.status === 'sent' ? (
        <p className="pi-signup-ok">
          Kiitos. Olet listalla, ilmoitamme heti kun avaamme.
        </p>
      ) : (
        <>
          <p className="pi-signup-sub">
            Jätä sähköpostisi. Kerromme kun Pro avaa ovensa virallisesti.
          </p>
          <form
            className="pi-signup-row email-row"
            onSubmit={e => { e.preventDefault(); submit(); }}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="sinun@email.fi"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={state.status === 'sending'}
              className="pi-signup-input"
            />
            <button
              type="submit"
              disabled={!valid || state.status === 'sending'}
              className="pi-signup-btn"
              data-active={valid && state.status !== 'sending' ? '1' : '0'}>
              {state.status === 'sending' ? 'Lähetetään' : 'Ilmoittaudu'}
            </button>
          </form>
          {state.error && (
            <p className="pi-signup-err">{state.error}</p>
          )}
        </>
      )}
    </section>
  );
}
