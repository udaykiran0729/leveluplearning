import { useState } from 'react';
import { setParentSettings, verifyParentPin } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BG, t, theme } from '../styles/theme';

const TOPICS = [
  { id: 'violence', label: 'Violence',  emoji: '⚔️' },
  { id: 'gambling', label: 'Gambling',  emoji: '🎰' },
  { id: 'drugs',    label: 'Drugs',     emoji: '💊' },
  { id: 'adult',    label: 'Adult',     emoji: '🔞' },
  { id: 'politics', label: 'Politics',  emoji: '🏛️' },
  { id: 'horror',   label: 'Horror',    emoji: '👻' },
];

type Screen = 'lock' | 'setup' | 'settings';

export default function ParentControls() {
  const [screen,   setScreen]   = useState<Screen>('lock');
  const [pin,      setPin]      = useState('');
  const [pinErr,   setPinErr]   = useState('');
  const [minutes,  setMinutes]  = useState(60);
  const [blocked,  setBlocked]  = useState<string[]>([]);
  const [custom,   setCustom]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id') || '1';
  const name   = localStorage.getItem('name')    || 'Friend';

  const verifyPin = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits'); return; }
    setPinErr('');
    try {
      const r = await verifyParentPin({ user_id: userId, password: pin });
      if (r.data.valid) setScreen('settings'); else setPinErr('Wrong PIN. Try again!');
    } catch { setScreen('setup'); }
  };

  const createPin = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits'); return; }
    setSaving(true);
    try { await setParentSettings({ user_id: userId, password: pin, max_daily_minutes: 60, blocked_topics: '[]' }); setScreen('settings'); }
    catch { setPinErr('Error creating PIN. Try again.'); }
    setSaving(false);
  };

  const save = async () => {
    setSaving(true);
    const all = [...blocked];
    custom.split(',').map(t => t.trim()).filter(Boolean).forEach(t => { if (!all.includes(t)) all.push(t); });
    try {
      await setParentSettings({ user_id: userId, password: pin, max_daily_minutes: minutes, blocked_topics: JSON.stringify(all) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save.'); }
    setSaving(false);
  };

  const timeLabel = (m: number) => m < 60 ? `${m} min` : m === 60 ? '1 hour' : `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`;

  return (
    <div style={{ ...t.page, minHeight: '100vh' }}>
      <BG />

      {/* NAV */}
      <nav style={t.nav}>
        <div style={t.logo}><div style={t.logoBox}>🎮</div><span style={t.logoText}>LevelUpLearning</span></div>
        <button style={{ ...t.btnGlass, padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/chat')}>← Back</button>
      </nav>

      <div style={s.wrap}>

        {/* LOCK SCREEN */}
        {screen === 'lock' && (
          <div style={s.centerCard}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔐</div>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: theme.text, marginBottom: 8 }}>Parent Access</h2>
            <p style={{ fontSize: 13, color: theme.muted, marginBottom: 28, textAlign: 'center' }}>Enter your PIN to manage {name}'s settings</p>
            <div style={s.pinDots}>
              {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: pin.length > i ? '#7c5cfc' : 'rgba(255,255,255,.15)', transition: 'background .2s' }} />)}
            </div>
            <input style={{ ...t.input, textAlign: 'center', letterSpacing: 6, fontSize: 18, marginBottom: 10 }} type="password" placeholder="Enter PIN" value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }} onKeyDown={e => e.key === 'Enter' && verifyPin()} />
            {pinErr && <div style={s.errMsg}>{pinErr}</div>}
            <button style={{ ...t.btnPrimary, width: '100%', padding: 14, marginBottom: 10 }} onClick={verifyPin}>🔓 Unlock Settings</button>
            <button style={{ ...t.btnGlass, width: '100%', padding: 12 }} onClick={() => setScreen('setup')}>First time? Create PIN</button>
          </div>
        )}

        {/* SETUP SCREEN */}
        {screen === 'setup' && (
          <div style={s.centerCard}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔑</div>
            <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 26, color: theme.text, marginBottom: 8 }}>Create Parent PIN</h2>
            <p style={{ fontSize: 13, color: theme.muted, marginBottom: 24, textAlign: 'center' }}>Set a PIN only you know</p>
            <input style={{ ...t.input, textAlign: 'center', letterSpacing: 6, fontSize: 18, marginBottom: 10 }} type="password" placeholder="Create PIN (min 4 digits)" value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }} />
            {pinErr && <div style={s.errMsg}>{pinErr}</div>}
            <button style={{ ...t.btnPrimary, width: '100%', padding: 14, marginBottom: 10, opacity: saving ? .6 : 1 }} onClick={createPin} disabled={saving}>
              {saving ? '⏳ Saving...' : '✅ Create PIN & Continue'}
            </button>
            <button style={{ ...t.btnGlass, width: '100%', padding: 12 }} onClick={() => setScreen('lock')}>← Back</button>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {screen === 'settings' && (
          <div style={s.settingsWrap}>

            <div style={s.accessBanner}>
              <span style={{ fontWeight: 800 }}>✅ Parent access granted</span>
              <span style={{ fontSize: 12, color: '#5eead4', marginTop: 2 }}>Managing {name}'s account</span>
            </div>

            {/* Time limit */}
            <div style={t.card}>
              <div style={s.cardHeader}>
                <span style={{ fontSize: 26 }}>⏱️</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: theme.text }}>Daily Screen Time</div>
                  <div style={{ fontSize: 12, color: theme.muted }}>Limit learning session duration</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 34, color: '#7c5cfc' }}>{timeLabel(minutes)}</span>
                <span style={{ fontSize: 13, color: theme.muted, marginLeft: 8 }}>per day</span>
              </div>
              <input type="range" min={10} max={180} step={5} value={minutes} onChange={e => setMinutes(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#7c5cfc', marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.muted, marginBottom: 12 }}>
                <span>10 min</span><span>1 hour</span><span>3 hours</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[30, 60, 90, 120].map(m => (
                  <button key={m} style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${minutes === m ? '#7c5cfc' : theme.gb}`, background: minutes === m ? 'rgba(124,92,252,.2)' : theme.glass, color: minutes === m ? theme.text : theme.muted, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                    onClick={() => setMinutes(m)}>
                    {m < 60 ? `${m}m` : `${m / 60}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Content filter */}
            <div style={t.card}>
              <div style={s.cardHeader}>
                <span style={{ fontSize: 26 }}>🛡️</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: theme.text }}>Content Filter</div>
                  <div style={{ fontSize: 12, color: theme.muted }}>Block specific topic categories</div>
                </div>
              </div>
              <div style={s.topicGrid}>
                {TOPICS.map(tp => {
                  const on = blocked.includes(tp.id);
                  return (
                    <div key={tp.id} style={{ ...s.topicBtn, ...(on ? s.topicOn : s.topicOff) }}
                      onClick={() => setBlocked(p => on ? p.filter(x => x !== tp.id) : [...p, tp.id])}>
                      <span style={{ fontSize: 22 }}>{tp.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{tp.label}</span>
                      <div style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, marginTop: 5, background: on ? 'rgba(239,68,68,.3)' : 'rgba(255,255,255,.08)', color: on ? '#fca5a5' : theme.muted }}>
                        {on ? 'Blocked' : 'Allowed'}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: `1px solid ${theme.gb}`, paddingTop: 14, marginTop: 6 }}>
                <label style={s.fLabel}>Custom blocked words (comma separated):</label>
                <input style={t.input} placeholder="e.g. weapons, bad words" value={custom} onChange={e => setCustom(e.target.value)} />
              </div>
            </div>

            {/* Summary */}
            <div style={{ ...t.card, background: 'linear-gradient(135deg,rgba(124,92,252,.12),rgba(45,212,191,.06))' }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: theme.text, marginBottom: 10 }}>📋 Current Settings</div>
              {[
                { label: '⏱️ Daily limit',    value: timeLabel(minutes) },
                { label: '🚫 Blocked topics', value: blocked.length > 0 ? blocked.join(', ') : 'None' },
                { label: '👤 Child account',  value: name },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.muted, marginBottom: 6 }}>
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 700, color: theme.text, maxWidth: '55%', textAlign: 'right' }}>{r.value}</span>
                </div>
              ))}
            </div>

            <button style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15, background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : saving ? undefined : undefined, opacity: saving ? .6 : 1 }}
              onClick={save} disabled={saving || saved}>
              {saved ? '✅ Settings Saved!' : saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s: any = {
  wrap:        { position: 'relative', zIndex: 10, maxWidth: 480, margin: '0 auto', padding: '32px 16px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  centerCard:  { ...t.card, width: '100%', textAlign: 'center', padding: 32 },
  pinDots:     { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 },
  errMsg:      { color: '#fca5a5', fontSize: 13, fontWeight: 800, marginBottom: 10 },
  settingsWrap:{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 },
  accessBanner:{ width: '100%', background: 'linear-gradient(135deg,rgba(45,212,191,.15),rgba(45,212,191,.05))', border: '1px solid rgba(45,212,191,.3)', borderRadius: 14, padding: '12px 16px', display: 'flex', flexDirection: 'column' },
  cardHeader:  { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  topicGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 },
  topicBtn:    { borderRadius: 12, padding: '12px 6px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1.5px solid', transition: 'all .2s' },
  topicOn:     { background: 'rgba(239,68,68,.12)', borderColor: 'rgba(239,68,68,.4)' },
  topicOff:    { background: theme.glass, borderColor: theme.gb },
  fLabel:      { fontSize: 11, fontWeight: 800, color: theme.muted, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8, display: 'block' },
};