import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { currentSchoolYear } from '../../../utils/year';
import { SCHOOLS } from '../../../data/schools';

const GRADES = [
  ['lk1', '1. vuosi'],
  ['lk2', '2. vuosi'],
  ['lk3', '3. vuosi'],
  ['lk4', '4. vuosi'],
];

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 11, boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.11)',
  color: '#f0ede8', fontSize: 13, outline: 'none', fontFamily: "'Inter', sans-serif",
  transition: 'border-color 0.14s',
};

export function Step1Basics({ user, draft, setDraft, onNext }) {
  const [fullName, setFullName] = useState(draft.full_name || '');
  const [grade, setGrade] = useState(draft.grade || 'lk1');
  const [schoolId, setSchoolId] = useState(draft.school_id || SCHOOLS[0]?.id || '');
  const [graduationTarget, setGraduationTarget] = useState(draft.graduation_target || '');
  const [yoSubjects, setYoSubjects] = useState(draft.yo_subjects || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, grade, graduation_target')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      if (data.full_name) setFullName(data.full_name);
      if (data.grade) setGrade(data.grade);
      if (data.graduation_target) setGraduationTarget(data.graduation_target);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const valid = fullName.trim().length > 1 && schoolId && grade;

  const save = async () => {
    if (!valid || saving) return;
    setSaving(true); setError(null);

    const { error: pErr } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      grade,
      graduation_target: graduationTarget || null,
    }).eq('id', user.id);

    if (pErr) { setError(pErr.message); setSaving(false); return; }

    const yo = yoSubjects.split(',').map(s => s.trim()).filter(Boolean);
    const { error: sErr } = await supabase.from('study_plans').upsert({
      user_id: user.id,
      school_year: currentSchoolYear(),
      school_id: schoolId,
      goals: { yo_subjects: yo },
      status: 'draft',
    }, { onConflict: 'user_id,school_year' });

    if (sErr) { setError(sErr.message); setSaving(false); return; }

    setDraft({ ...draft, full_name: fullName.trim(), grade, school_id: schoolId, graduation_target: graduationTarget, yo_subjects: yo });
    setSaving(false);
    onNext();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 24, padding: '32px 28px',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset',
    }}>
      <h2 className="fr" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Perustiedot
      </h2>
      <p style={{ fontSize: 13, color: '#a09c98', marginBottom: 26, lineHeight: 1.5 }}>
        Aloitetaan: kuka olet ja missä opiskelet. Voit muokata tietoja myöhemmin.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ fontSize: 11, color: '#a09c98', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            KOKO NIMI
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Etu- ja sukunimi"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: '#a09c98', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            LUKIOLUOKKA
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {GRADES.map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => setGrade(code)}
                style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none',
                  background: grade === code ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                  color: grade === code ? '#f0ede8' : '#a09c98',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", transition: 'all 0.14s',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, color: '#a09c98', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            KOULU
          </label>
          <select
            value={schoolId}
            onChange={e => setSchoolId(e.target.value)}
            style={{ ...inputStyle, appearance: 'none' }}
          >
            {SCHOOLS.map(s => (
              <option key={s.id} value={s.id} style={{ background: '#0a0820' }}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 11, color: '#a09c98', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            TAVOITELTU YO-VALMISTUMINEN
          </label>
          <input
            type="month"
            value={graduationTarget ? graduationTarget.slice(0, 7) : ''}
            onChange={e => setGraduationTarget(e.target.value ? `${e.target.value}-01` : '')}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: '#a09c98', display: 'block', marginBottom: 6, letterSpacing: '0.04em' }}>
            YO-AINEET (vapaaehtoinen, pilkulla erotettuna)
          </label>
          <input
            type="text"
            value={yoSubjects}
            onChange={e => setYoSubjects(e.target.value)}
            placeholder="esim. ÄI, MAA, ENA, FY"
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ fontSize: 11, color: 'oklch(0.72 0.14 20)', background: 'rgba(255,80,60,0.09)', border: '1px solid rgba(255,80,60,0.18)', borderRadius: 8, padding: '8px 12px' }}>
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={!valid || saving}
          style={{
            marginTop: 6, width: '100%', padding: '14px 20px', borderRadius: 13, border: 'none',
            background: (!valid || saving)
              ? 'rgba(200,195,210,0.12)'
              : 'linear-gradient(135deg, rgba(240,237,232,0.94), rgba(210,205,225,0.90))',
            color: (!valid || saving) ? '#a09c98' : 'rgba(8,6,22,0.90)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.07em',
            cursor: (!valid || saving) ? 'default' : 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: (!valid || saving) ? 'none' : '0 6px 24px rgba(200,180,255,0.24)',
            transition: 'all 0.14s',
          }}
        >
          {saving ? 'TALLENNETAAN…' : 'SEURAAVA →'}
        </button>
      </div>
    </div>
  );
}
