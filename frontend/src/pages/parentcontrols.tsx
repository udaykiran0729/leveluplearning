import { useState } from 'react';
import { setParentSettings, verifyParentPin } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Unlock, Shield, Clock, X, Check, AlertCircle } from 'lucide-react';
import { BG, t, theme } from '../styles/theme';

const TOPICS = [
  { id: 'violence', label: 'Violence' },
  { id: 'gambling', label: 'Gambling' },
  { id: 'drugs',    label: 'Drugs'    },
  { id: 'adult',    label: 'Adult'    },
  { id: 'politics', label: 'Politics' },
  { id: 'horror',   label: 'Horror'   },
];

type Screen = 'lock' | 'setup' | 'settings';

export default function ParentControls() {
  const [screen,  setScreen]  = useState<Screen>('lock');
  const [pin,     setPin]     = useState('');
  const [pinErr,  setPinErr]  = useState('');
  const [minutes, setMinutes] = useState(60);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [custom,  setCustom]  = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const navigate = useNavigate();
  const userId   = localStorage.getItem('user_id') || '1';
  const name     = localStorage.getItem('name')    || 'Friend';

  const verify = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits.'); return; }
    setPinErr('');
    try {
      const r = await verifyParentPin({ user_id: userId, password: pin });
      if (r.data.valid) setScreen('settings');
      else setPinErr('Incorrect PIN. Try again.');
    } catch { setScreen('setup'); }
  };

  const createPin = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits.'); return; }
    setSaving(true);
    try {
      await setParentSettings({ user_id: userId, password: pin, max_daily_minutes: 60, blocked_topics: '[]' });
      setScreen('settings');
    } catch { setPinErr('Could not save. Check backend connection.'); }
    setSaving(false);
  };

  const save = async () => {
    setSaving(true);
    const all = [...blocked];
    custom.split(',').map(c => c.trim()).filter(Boolean).forEach(c => { if (!all.includes(c)) all.push(c); });
    try {
      await setParentSettings({ user_id: userId, password: pin, max_daily_minutes: minutes, blocked_topics: JSON.stringify(all) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Save failed. Check backend.'); }
    setSaving(false);
  };

  const timeLabel = (m: number) => m < 60 ? `${m} min` : m === 60 ? '1 hour' : `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`;

  return (
    <div style={{ ...t.page, minHeight: '100vh' }}>
      <BG />

      {/* NAV — Lucide icons */}
      <nav style={t.nav}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted, fontWeight: 500 }}>
            <Lock size={12} color={theme.muted as string} />
            Parental Controls
          </div>
          <button style={t.btnGlass} onClick={() => navigate('/chat')}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </nav>

      <div style={s.wrap}>

        {/* ── LOCK SCREEN ── */}
        {screen === 'lock' && (
          <div style={s.centerCard}>
            <div style={s.iconRing}>
              <Lock size={22} color={theme.purple2} />
            </div>
            <h2 style={s.cardTitle}>Parent Access</h2>
            <p style={s.cardSub}>Enter your PIN to manage {name}'s settings.</p>

            {/* PIN dots */}
            <div style={s.pinDots}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: pin.length > i ? theme.purple : 'rgba(255,255,255,.15)', transition: 'background .2s' }} />
              ))}
            </div>

            <input
              style={{ ...t.input, textAlign: 'center', letterSpacing: '0.2em', fontSize: 20, marginBottom: 10 }}
              type="password" placeholder="· · · ·" value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }}
              onKeyDown={e => e.key === 'Enter' && verify()} />

            {pinErr && (
              <div style={s.errBox}>
                <AlertCircle size={14} />
                <span>{pinErr}</span>
              </div>
            )}

            <button style={{ ...t.btnPrimary, width: '100%', padding: 13, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={verify}>
              <Unlock size={15} /> Unlock Settings
            </button>
            <button style={{ ...t.btnGlass, width: '100%', padding: 12, justifyContent: 'center' }}
              onClick={() => setScreen('setup')}>
              First time? Create a PIN
            </button>
          </div>
        )}

        {/* ── SETUP SCREEN ── */}
        {screen === 'setup' && (
          <div style={s.centerCard}>
            <div style={s.iconRing}>
              <Shield size={22} color={theme.purple2} />
            </div>
            <h2 style={s.cardTitle}>Create a PIN</h2>
            <p style={s.cardSub}>Set a PIN only you know. Minimum 4 digits.</p>

            <input
              style={{ ...t.input, textAlign: 'center', letterSpacing: '0.2em', fontSize: 20, marginBottom: 10 }}
              type="password" placeholder="· · · ·" value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }} />

            {pinErr && (
              <div style={s.errBox}>
                <AlertCircle size={14} />
                <span>{pinErr}</span>
              </div>
            )}

            <button
              style={{ ...t.btnPrimary, width: '100%', padding: 13, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.6 : 1 }}
              onClick={createPin} disabled={saving}>
              {saving ? 'Saving...' : <><Check size={15} /> Create PIN & Continue</>}
            </button>
            <button style={{ ...t.btnGlass, width: '100%', padding: 12, justifyContent: 'center' }}
              onClick={() => setScreen('lock')}>
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        )}

        {/* ── SETTINGS SCREEN ── */}
        {screen === 'settings' && (
          <div style={s.settingsWrap}>

            {/* Access confirmation */}
            <div style={s.accessBanner}>
              <Check size={14} color={theme.green} />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Parent access granted</span>
              <span style={{ fontSize: 12, color: theme.muted, marginLeft: 'auto' }}>Managing {name}'s account</span>
            </div>

            {/* Time limit */}
            <div style={t.card}>
              <div style={s.settingHead}>
                <div style={s.settingIcon}><Clock size={16} color={theme.purple2} /></div>
                <div>
                  <div style={s.settingTitle}>Daily Screen Time</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>Maximum learning time per day</div>
                </div>
                <div style={{ marginLeft: 'auto', fontFamily: "'Fredoka One',cursive", fontSize: 26, color: theme.text }}>
                  {timeLabel(minutes)}
                </div>
              </div>
              <input type="range" min={10} max={180} step={5} value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                style={{ width: '100%', accentColor: theme.purple, marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.muted, marginBottom: 14 }}>
                <span>10 min</span><span>1 hour</span><span>3 hours</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[30, 60, 90, 120].map(m => (
                  <button key={m}
                    style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${minutes === m ? theme.purple : theme.gb}`, background: minutes === m ? 'rgba(124,92,252,.2)' : theme.glass, color: minutes === m ? theme.text : theme.muted, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
                    onClick={() => setMinutes(m)}>
                    {m < 60 ? `${m}m` : `${m / 60}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Content filter */}
            <div style={t.card}>
              <div style={s.settingHead}>
                <div style={s.settingIcon}><Shield size={16} color={theme.purple2} /></div>
                <div>
                  <div style={s.settingTitle}>Content Filters</div>
                  <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>Block specific topic categories</div>
                </div>
              </div>
              <div style={s.topicGrid}>
                {TOPICS.map(tp => {
                  const on = blocked.includes(tp.id);
                  return (
                    <button key={tp.id}
                      style={{ ...s.topicBtn, ...(on ? s.topicOn : s.topicOff) }}
                      onClick={() => setBlocked(p => on ? p.filter(x => x !== tp.id) : [...p, tp.id])}>
                      {on && <X size={12} />}
                      {tp.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ borderTop: `1px solid ${theme.gb}`, paddingTop: 16, marginTop: 8 }}>
                <label style={s.formLabel}>Custom blocked words (comma separated)</label>
                <input style={t.input} placeholder="e.g. weapons, bad words"
                  value={custom} onChange={e => setCustom(e.target.value)} />
                <p style={{ fontSize: 11, color: 'rgba(240,237,255,.3)', marginTop: 6 }}>
                  These words will be blocked across text, voice, and image inputs.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div style={{ ...t.card, background: 'linear-gradient(135deg,rgba(124,92,252,.1),rgba(45,212,191,.05))' }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: theme.text, marginBottom: 12 }}>
                Current Settings
              </div>
              {[
                { label: 'Daily limit',    value: timeLabel(minutes)                              },
                { label: 'Blocked topics', value: blocked.length > 0 ? blocked.join(', ') : 'None' },
                { label: 'Child account',  value: name                                             },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.gb}`, fontSize: 13 }}>
                  <span style={{ color: theme.muted }}>{r.label}</span>
                  <span style={{ color: theme.text, fontWeight: 500, maxWidth: '55%', textAlign: 'right' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button
              style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: saved ? '#10b981' : undefined, opacity: saving ? 0.6 : 1 }}
              onClick={save} disabled={saving || saved}>
              {saved ? <><Check size={15} /> Saved!</> : saving ? 'Saving...' : 'Save Settings'}
            </button>

          </div>
        )}
      </div>
    </div>
  );
}

const s: any = {
  wrap:         { position: 'relative', zIndex: 10, maxWidth: 500, margin: '0 auto', padding: '40px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  centerCard:   { ...t.card, width: '100%', textAlign: 'center', padding: '36px 28px' },
  iconRing:     { width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' },
  cardTitle:    { fontFamily: "'Fredoka One',cursive", fontSize: 26, color: theme.text, marginBottom: 8 },
  cardSub:      { fontSize: 14, color: theme.muted, marginBottom: 22, lineHeight: 1.6 },
  pinDots:      { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 18 },
  errBox:       { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#fca5a5', marginBottom: 12, textAlign: 'left' },
  settingsWrap: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  accessBanner: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 14, width: '100%' },
  settingHead:  { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  settingIcon:  { width: 36, height: 36, borderRadius: 10, background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingTitle: { fontFamily: "'Fredoka One',cursive", fontSize: 16, color: theme.text },
  topicGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 8 },
  topicBtn:     { padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 12, border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .2s' },
  topicOn:      { background: 'rgba(239,68,68,.12)', borderColor: 'rgba(239,68,68,.4)', color: '#fca5a5' },
  topicOff:     { background: theme.glass, borderColor: theme.gb, color: theme.muted },
  formLabel:    { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,237,255,.4)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 },
};