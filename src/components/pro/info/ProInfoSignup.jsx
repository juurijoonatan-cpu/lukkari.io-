import { useState } from 'react';
import { recordSubscribe } from '../../../utils/leads';
import { useT } from '../../../i18n/i18n';

export function ProInfoSignup() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', error: null });

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    if (!valid || state.status === 'sending') return;
    setState({ status: 'sending', error: null });
    const r = await recordSubscribe({
      email: email.trim(),
      source: 'pro_info_waitlist',
      sendWelcome: true,
    });
    if (r.ok) {
      setState({ status: 'sent', error: null });
    } else {
      setState({ status: 'idle', error: t('pro.signup.errRetry') });
    }
  };

  return (
    <section className="pi-card pi-signup">
      <p className="pi-signup-title">{t('pro.signup.title')}</p>

      {state.status === 'sent' ? (
        <p className="pi-signup-ok">{t('pro.signup.ok')}</p>
      ) : (
        <>
          <p className="pi-signup-sub">{t('pro.signup.sub')}</p>
          <form
            className="pi-signup-row email-row"
            onSubmit={e => { e.preventDefault(); submit(); }}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t('pro.signup.placeholder')}
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
              {state.status === 'sending' ? t('pro.signup.btnSending') : t('pro.signup.btn')}
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
