import { useState } from 'react';
import { setParentSettings, verifyParentPin } from '../services/api';
import { useNavigate } from 'react-router-dom';

const PRESET_TOPICS = [
  { id: 'violence',  label: 'Violence',    emoji: '⚔️'  },
  { id: 'gambling',  label: 'Gambling',    emoji: '🎰'  },
  { id: 'drugs',     label: 'Drugs',       emoji: '💊'  },
  { id: 'adult',     label: 'Adult',       emoji: '🔞'  },
  { id: 'politics',  label: 'Politics',    emoji: '🏛️'  },
  { id: 'horror',    label: 'Horror',      emoji: '👻'  },
];

type Screen = 'lock' | 'setup' | 'settings';

export default function ParentControls() {
  const [screen,    setScreen]  = useState<Screen>('lock');
  const [pin,       setPin]     = useState('');
  const [pinError,  setPinErr]  = useState('');
  const [minutes,   setMinutes] = useState(60);
  const [blocked,   setBlocked] = useState<string[]>([]);
  const [custom,    setCustom]  = useState('');
  const [saving,    setSaving]  = useState(false);
  const [saved,     setSaved]   = useState(false);
  const navigate                = useNavigate();

  const userId = localStorage.getItem('user_id') || '1';
  const name   = localStorage.getItem('name')    || 'Friend';

  // ── Verify existing PIN ──────────────────────────────────────────────────
  const verifyPin = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits'); return; }
    setPinErr('');
    try {
      const res = await verifyParentPin({ user_id: userId, password: pin });
      if (res.data.valid) setScreen('settings');
      else setPinErr('Wrong PIN. Try again!');
    } catch {
      // First time — go to setup
      setScreen('setup');
    }
  };

  // ── Create new PIN ───────────────────────────────────────────────────────
  const createPin = async () => {
    if (pin.length < 4) { setPinErr('PIN must be at least 4 digits'); return; }
    setSaving(true);
    try {
      await setParentSettings({
        user_id: userId, password: pin,
        max_daily_minutes: 60,
        blocked_topics: '[]',
      });
      setScreen('settings');
    } catch { setPinErr('Error creating PIN. Try again.'); }
    setSaving(false);
  };

  // ── Save settings ────────────────────────────────────────────────────────
  const saveSettings = async () => {
    setSaving(true);
    const allBlocked = [...blocked];
    if (custom.trim()) {
      custom.split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
        if (!allBlocked.includes(t)) allBlocked.push(t);
      });
    }
    try {
      await setParentSettings({
        user_id:           userId,
        password:          pin,
        max_daily_minutes: minutes,
        blocked_topics:    JSON.stringify(allBlocked),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save. Try again!'); }
    setSaving(false);
  };

  const toggleTopic = (id: string) => {
    setBlocked(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const timeLabel = (m: number) => {
    if (m < 60) return `${m} minutes`;
    return m === 60 ? '1 hour' : `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}`;
  };

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/chat')}>← Back</button>
        <h2 style={s.headerTitle}>🔒 Parental Controls</h2>
        <div style={{ width: 60 }} />
      </div>

      <div style={s.scroll}>

        {/* ══ LOCK SCREEN ══ */}
        {screen === 'lock' && (
          <div style={s.centerCard}>
            <div style={s.lockIcon}>🔐</div>
            <h3 style={s.lockTitle}>Parent Access</h3>
            <p style={s.lockSub}>Enter your PIN to manage {name}'s settings</p>

            <div style={s.pinRow}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  ...s.pinDot,
                  background: pin.length > i ? '#7c3aed' : '#e5e7eb',
                }} />
              ))}
            </div>

            <input style={s.pinInput} type="password" placeholder="Enter PIN (min 4 digits)"
              value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }}
              onKeyDown={e => e.key === 'Enter' && verifyPin()} />

            {pinError && <div style={s.errorMsg}>{pinError}</div>}

            <button style={s.primaryBtn} onClick={verifyPin}>
              🔓 Unlock Settings
            </button>
            <button style={s.secondaryBtn} onClick={() => setScreen('setup')}>
              First time? Create PIN
            </button>
          </div>
        )}

        {/* ══ SETUP SCREEN ══ */}
        {screen === 'setup' && (
          <div style={s.centerCard}>
            <div style={s.lockIcon}>🔑</div>
            <h3 style={s.lockTitle}>Create Parent PIN</h3>
            <p style={s.lockSub}>Set a PIN only you know</p>

            <input style={s.pinInput} type="password" placeholder="Create PIN (min 4 digits)"
              value={pin} maxLength={8}
              onChange={e => { setPin(e.target.value); setPinErr(''); }} />

            {pinError && <div style={s.errorMsg}>{pinError}</div>}

            <button style={saving ? s.disabledBtn : s.primaryBtn}
              onClick={createPin} disabled={saving}>
              {saving ? '⏳ Saving...' : '✅ Create PIN & Continue'}
            </button>
            <button style={s.secondaryBtn} onClick={() => setScreen('lock')}>
              ← Back
            </button>
          </div>
        )}

        {/* ══ SETTINGS SCREEN ══ */}
        {screen === 'settings' && (
          <>
            {/* Access granted banner */}
            <div style={s.accessBanner}>
              <span>✅ Parent access granted</span>
              <span style={s.accessSub}>Managing {name}'s account</span>
            </div>

            {/* Time Limit */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardIcon}>⏱️</span>
                <div>
                  <div style={s.cardTitle}>Daily Screen Time</div>
                  <div style={s.cardSub}>Limit learning session duration</div>
                </div>
              </div>
              <div style={s.timeDisplay}>
                <span style={s.timeBig}>{timeLabel(minutes)}</span>
                <span style={s.timeNote}>per day</span>
              </div>
              <input type="range" min={10} max={180} step={5} value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                style={s.slider} />
              <div style={s.sliderLabels}>
                <span>10 min</span>
                <span>1 hour</span>
                <span>3 hours</span>
              </div>
              <div style={s.timePresets}>
                {[30, 60, 90, 120].map(m => (
                  <button key={m} style={minutes === m ? s.presetActive : s.preset}
                    onClick={() => setMinutes(m)}>
                    {m < 60 ? `${m}m` : `${m / 60}h`}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Filter */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardIcon}>🛡️</span>
                <div>
                  <div style={s.cardTitle}>Content Filter</div>
                  <div style={s.cardSub}>Block specific topic categories</div>
                </div>
              </div>
              <div style={s.topicGrid}>
                {PRESET_TOPICS.map(t => {
                  const on = blocked.includes(t.id);
                  return (
                    <button key={t.id}
                      style={on ? s.topicOn : s.topicOff}
                      onClick={() => toggleTopic(t.id)}>
                      <span style={{ fontSize: 22 }}>{t.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{t.label}</span>
                      <div style={{ ...s.topicStatus, background: on ? '#ef4444' : '#e5e7eb', color: on ? '#fff' : '#9ca3af' }}>
                        {on ? 'Blocked' : 'Allowed'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom blocked topics */}
              <div style={s.customRow}>
                <div style={s.customLabel}>Custom blocked words (comma separated):</div>
                <input style={s.customInput} placeholder="e.g. weapons, bad words"
                  value={custom} onChange={e => setCustom(e.target.value)} />
              </div>
            </div>

            {/* Safety Summary */}
            <div style={s.summaryCard}>
              <div style={s.summaryTitle}>📋 Current Settings</div>
              <div style={s.summaryRow}>
                <span>⏱️ Daily limit</span>
                <span style={s.summaryVal}>{timeLabel(minutes)}</span>
              </div>
              <div style={s.summaryRow}>
                <span>🚫 Blocked topics</span>
                <span style={s.summaryVal}>
                  {blocked.length > 0 ? blocked.join(', ') : 'None'}
                </span>
              </div>
              <div style={s.summaryRow}>
                <span>👤 Child account</span>
                <span style={s.summaryVal}>{name}</span>
              </div>
            </div>

            {/* Save Button */}
            <button style={saved ? s.savedBtn : saving ? s.disabledBtn : s.primaryBtn}
              onClick={saveSettings} disabled={saving || saved}>
              {saved ? '✅ Settings Saved!' : saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>

            <div style={{ height: 24 }} />
          </>
        )}
      </div>
    </div>
  );
}

const s: any = {
  page:         { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6', overflow: 'hidden' },
  header:       { background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  backBtn:      { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  headerTitle:  { color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 },
  scroll:       { flex: 1, overflowY: 'auto', padding: 16 },
  centerCard:   { background: '#fff', borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  lockIcon:     { fontSize: 56, marginBottom: 12 },
  lockTitle:    { fontSize: 22, fontWeight: 800, color: '#1f2937', margin: '0 0 8px' },
  lockSub:      { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  pinRow:       { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 },
  pinDot:       { width: 14, height: 14, borderRadius: '50%', transition: 'background 0.2s' },
  pinInput:     { width: '100%', padding: '13px 16px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 10, textAlign: 'center', letterSpacing: 4 },
  errorMsg:     { color: '#ef4444', fontSize: 13, marginBottom: 10, fontWeight: 600 },
  primaryBtn:   { width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 10 },
  secondaryBtn: { width: '100%', padding: '12px', borderRadius: 12, background: '#fff', color: '#7c3aed', border: '2px solid #7c3aed', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  disabledBtn:  { width: '100%', padding: '14px', borderRadius: 12, background: '#c4b5fd', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'not-allowed', marginBottom: 10 },
  savedBtn:     { width: '100%', padding: '14px', borderRadius: 12, background: '#10b981', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'default', marginBottom: 10 },
  accessBanner: { background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1.5px solid #6ee7b7', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 2 },
  accessSub:    { fontSize: 12, color: '#065f46' },
  card:         { background: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  cardHeader:   { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  cardIcon:     { fontSize: 28 },
  cardTitle:    { fontWeight: 800, fontSize: 15, color: '#1f2937' },
  cardSub:      { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  timeDisplay:  { textAlign: 'center', marginBottom: 12 },
  timeBig:      { fontSize: 32, fontWeight: 800, color: '#7c3aed' },
  timeNote:     { fontSize: 14, color: '#9ca3af', marginLeft: 8 },
  slider:       { width: '100%', accentColor: '#7c3aed', marginBottom: 4 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 12 },
  timePresets:  { display: 'flex', gap: 8 },
  preset:       { flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280' },
  presetActive: { flex: 1, padding: '8px', borderRadius: 10, border: '1.5px solid #7c3aed', background: '#ede9fe', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#7c3aed' },
  topicGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 },
  topicOn:      { padding: '12px 6px', borderRadius: 12, border: '2px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  topicOff:     { padding: '12px 6px', borderRadius: 12, border: '2px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  topicStatus:  { fontSize: 10, padding: '2px 8px', borderRadius: 20, marginTop: 6, fontWeight: 700 },
  customRow:    { borderTop: '1px solid #f3f4f6', paddingTop: 14 },
  customLabel:  { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
  customInput:  { width: '100%', padding: '11px 14px', borderRadius: 10, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  summaryCard:  { background: 'linear-gradient(135deg, #faf5ff, #eff6ff)', borderRadius: 16, padding: 16, marginBottom: 14, border: '1px solid #e9d5ff' },
  summaryTitle: { fontWeight: 800, fontSize: 14, color: '#4c1d95', marginBottom: 10 },
  summaryRow:   { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 },
  summaryVal:   { fontWeight: 700, color: '#1f2937', maxWidth: '55%', textAlign: 'right' },
};
