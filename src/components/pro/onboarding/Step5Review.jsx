import { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { currentSchoolYear } from '../../../utils/year';

export function Step5Review({ user, draft, onBack, onFinish }) {
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState(null);

  const finalize = async () => {
    if (finalizing) return;
    setFinalizing(true); setError(null);

    const { error: sErr } = await supabase.from('study_plans').update({
      status: 'active',
    }).eq('user_id', user.id).eq('school_year', currentSchoolYear());

    if (sErr) { setError(sErr.message); setFinalizing(false); return; }

    await supabase.from('profiles').update({
      onboarded_at: new Date().toISOString(),
    }).eq('id', user.id);

    setFinalizing(false);
    onFinish();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 24, padding: '32px 28px',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
    }}>
      <h2 className="fr" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Yhteenveto
      </h2>
      <p style={{ fontSize: 13, color: '#a09c98', marginBottom: 24, lineHeight: 1.5 }}>
        Tarkasta tiedot ja viimeistele suunnitelma. Voit muokata yksittäisiä kohtia myöhemmin Pro-näkymästä.
      </p>

      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 16px', marginBottom: 24 }}>
        <dt style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.04em' }}>NIMI</dt>
        <dd style={{ fontSize: 13, color: '#f0ede8', margin: 0 }}>{draft.full_name || '—'}</dd>
        <dt style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.04em' }}>LUKIOLUOKKA</dt>
        <dd style={{ fontSize: 13, color: '#f0ede8', margin: 0 }}>{draft.grade || '—'}</dd>
        <dt style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.04em' }}>KOULU</dt>
        <dd style={{ fontSize: 13, color: '#f0ede8', margin: 0 }}>{draft.school_id || '—'}</dd>
        <dt style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.04em' }}>YO-VALMISTUMINEN</dt>
        <dd style={{ fontSize: 13, color: '#f0ede8', margin: 0 }}>{draft.graduation_target || '—'}</dd>
        <dt style={{ fontSize: 11, color: '#605c58', letterSpacing: '0.04em' }}>YO-AINEET</dt>
        <dd style={{ fontSize: 13, color: '#f0ede8', margin: 0 }}>
          {draft.yo_subjects?.length ? draft.yo_subjects.join(', ') : '—'}
        </dd>
      </dl>

      <div style={{
        background: 'rgba(120,90,255,0.08)',
        border: '1px solid rgba(120,90,255,0.20)',
        borderRadius: 14, padding: '14px 18px', marginBottom: 20,
      }}>
        <p style={{ fontSize: 12, color: 'rgba(180,160,255,0.85)', lineHeight: 1.6 }}>
          Suunnitelma luodaan kevyenä versiona. Lukujärjestyskuvan, ICS-kalenterin ja kirja-TOC:ien
          aktivointi tuo AI:lle enemmän kontekstia ja parempia suosituksia.
        </p>
      </div>

      {error && (
        <p style={{ fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onBack}
          disabled={finalizing}
          style={{
            flex: '0 0 auto', padding: '12px 18px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.11)',
            background: 'transparent', color: '#a09c98',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
            cursor: finalizing ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
          }}
        >← EDELLINEN</button>
        <button
          onClick={finalize}
          disabled={finalizing}
          style={{
            flex: 1, padding: '14px 20px', borderRadius: 13, border: 'none',
            background: finalizing
              ? 'rgba(200,195,210,0.12)'
              : 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
            color: finalizing ? '#a09c98' : 'rgba(8,6,22,0.90)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.07em',
            cursor: finalizing ? 'default' : 'pointer', fontFamily: "'Inter', sans-serif",
            boxShadow: finalizing ? 'none' : '0 6px 24px rgba(200,180,255,0.24)',
          }}
        >
          {finalizing ? 'VIIMEISTELLÄÄN…' : 'VIIMEISTELE & SIIRRY PRO-NÄKYMÄÄN'}
        </button>
      </div>
    </div>
  );
}
