import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { BG, t, theme } from '../styles/theme';

const AVATARS = [
  { id: 'doraemon',     emoji: '🤖', name: 'Doraemon',     color: '#3b82f6', delay: '0s'   },
  { id: 'chhota_bheem', emoji: '💪', name: 'Chhota Bheem', color: '#f59e0b', delay: '.3s'  },
  { id: 'dora',         emoji: '🌟', name: 'Dora',         color: '#10b981', delay: '.6s'  },
  { id: 'spiderman',    emoji: '🕷️', name: 'Spider-Man',   color: '#ef4444', delay: '.9s'  },
];

export default function Register() {
  const [tab,      setTab]     = useState<'child' | 'parent'>('child');
  const [name,     setName]    = useState('');
  const [age,      setAge]     = useState('');
  const [language, setLang]    = useState('english');
  const [avatar,   setAvatar]  = useState('doraemon');
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const navigate = useNavigate();

  // ── If user already registered, go straight to select-character ──
  const existingUserId = localStorage.getItem('user_id');
  const existingName   = localStorage.getItem('name');

  const handleSubmit = async () => {
    setError('');
    if (!name.trim())                             { setError('Please enter your name.');         return; }
    if (!age || Number(age) < 4 || Number(age) > 18) { setError('Please enter a valid age (4–18).'); return; }

    setLoading(true);
    try {
      const res = await registerUser({ name: name.trim(), age: Number(age), language, avatar });
      localStorage.setItem('user_id',  String(res.data.user_id));
      localStorage.setItem('name',     res.data.name);
      localStorage.setItem('avatar',   avatar);
      localStorage.setItem('language', language);
      navigate('/select-character');
    } catch (e: any) {
      setError('Registration failed. Make sure the backend is running on port 8000.');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <BG />

      {/* NAV */}
      <nav style={t.nav}>
        <div style={t.logo}><div style={t.logoBox}>🎮</div><span style={t.logoText}>LevelUpLearning</span></div>
        <button style={{ ...t.btnGlass, padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/')}>← Home</button>
      </nav>

      {/* Returning user banner */}
      {existingUserId && existingName && (
        <div style={s.returningBanner}>
          <span>👋 Welcome back, <strong>{existingName}</strong>!</span>
          <button style={{ ...t.btnPrimary, padding: '7px 18px', fontSize: 13 }} onClick={() => navigate('/chat')}>
            Continue as {existingName} →
          </button>
        </div>
      )}

      <div style={s.wrap}>

        {/* LEFT */}
        <div style={s.left}>
          <div style={s.eyebrow}>🎮 Start your learning adventure</div>
          <h1 style={s.title}>
            Create your<br />
            <span style={t.gradText}>free profile</span>
          </h1>
          <p style={{ ...t.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 28, maxWidth: 360 }}>
            Takes 30 seconds. No email needed for children.
            Ask questions, earn XP and level up every day — completely free.
          </p>

          {[
            { icon: '⭐', text: 'Earn +10 XP for every text question'       },
            { icon: '🎤', text: 'Earn +20 XP for voice and image questions'  },
            { icon: '🏆', text: 'Unlock 6 badges as you reach milestones'    },
            { icon: '🌐', text: 'Switch between English and Hindi anytime'   },
            { icon: '🔒', text: 'Parent controls to keep learning safe'      },
          ].map(f => (
            <div key={f.text} style={s.featureRow}>
              <div style={s.featureIcon}>{f.icon}</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* RIGHT — Form */}
        <div style={s.right}>
          <div style={s.formCard}>

            {/* Tabs */}
            <div style={s.tabs}>
              <div style={{ ...s.tab, ...(tab === 'child'  ? s.tabActive : {}) }} onClick={() => setTab('child')}>
                👦 Child Profile
              </div>
              <div style={{ ...s.tab, ...(tab === 'parent' ? s.tabActive : {}) }} onClick={() => setTab('parent')}>
                👨 Parent Login
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={s.errorBox}>{error}</div>
            )}

            {tab === 'child' ? (
              <>
                {/* Name */}
                <div style={s.formGroup}>
                  <label style={s.label}>Your Name</label>
                  <input
                    style={t.input}
                    placeholder="e.g. Uday Kiran"
                    value={name}
                    onChange={e => { setName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                {/* Age */}
                <div style={s.formGroup}>
                  <label style={s.label}>Age</label>
                  <input
                    style={t.input}
                    placeholder="Enter your age (4–18)"
                    type="number" min={4} max={18}
                    value={age}
                    onChange={e => { setAge(e.target.value); setError(''); }}
                  />
                </div>

                {/* Language */}
                <div style={s.formGroup}>
                  <label style={s.label}>Language</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['english', 'hindi'] as const).map(l => (
                      <button key={l}
                        style={{ ...s.langBtn, ...(language === l ? s.langBtnActive : {}) }}
                        onClick={() => setLang(l)}>
                        {l === 'english' ? '🇬🇧 English' : '🇮🇳 Hindi'}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 6 }}>
                    You can switch language anytime in the chat
                  </div>
                </div>

                {/* Avatar */}
                <div style={s.formGroup}>
                  <label style={s.label}>Choose Your Hero (you can change later)</label>
                  <div style={s.avatarGrid}>
                    {AVATARS.map(a => (
                      <div key={a.id}
                        style={{ ...s.avatarCard, ...(avatar === a.id ? { borderColor: a.color, background: `${a.color}18` } : {}) }}
                        onClick={() => setAvatar(a.id)}>
                        <div style={{ fontSize: 30, animation: 'floatY 3s ease-in-out infinite', animationDelay: a.delay }}>
                          {a.emoji}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, marginTop: 6, color: avatar === a.id ? a.color : theme.muted }}>
                          {a.name}
                        </div>
                        {avatar === a.id && (
                          <div style={{ ...s.check, background: a.color }}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15, opacity: loading ? .7 : 1 }}
                  onClick={handleSubmit}
                  disabled={loading}>
                  {loading ? '⏳ Creating your profile...' : '🚀 Start My Adventure!'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 11, color: theme.muted, marginTop: 12 }}>
                  Free forever · No credit card · No ads
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: theme.muted, marginBottom: 20, lineHeight: 1.7 }}>
                  Log in with your parent account to access settings, view your child's progress, set daily time limits and manage content filters.
                </p>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input style={t.input} placeholder="parent@email.com" type="email" />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <input style={t.input} placeholder="••••••••" type="password" />
                </div>
                <button style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15 }}
                  onClick={() => navigate('/parent')}>
                  Sign In to Parent Dashboard →
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: theme.muted, marginTop: 14 }}>
                  First time? Use your child's profile PIN to access parental controls.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: any = {
  page:           { ...t.page, minHeight: '100vh' },
  returningBanner:{ position: 'relative', zIndex: 20, background: 'rgba(45,212,191,.12)', border: '1px solid rgba(45,212,191,.25)', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: theme.text },
  wrap:           { position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 48px', gap: 48, maxWidth: 1100, margin: '0 auto' },
  left:           {},
  eyebrow:        { display: 'inline-block', padding: '5px 14px', borderRadius: 20, background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.3)', fontSize: 12, fontWeight: 800, color: '#a78bfa', marginBottom: 18 },
  title:          { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(30px,4vw,46px)', color: theme.text, lineHeight: 1.1, marginBottom: 14 },
  featureRow:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 },
  featureIcon:    { width: 32, height: 32, borderRadius: 8, background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 },
  right:          {},
  formCard:       { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(24px)', borderRadius: 24, padding: 28 },
  tabs:           { display: 'flex', background: 'rgba(0,0,0,.3)', borderRadius: 40, padding: 4, marginBottom: 20 },
  tab:            { flex: 1, padding: '9px', borderRadius: 36, textAlign: 'center', fontSize: 13, fontWeight: 800, cursor: 'pointer', color: theme.muted, transition: 'all .2s' },
  tabActive:      { background: '#7c5cfc', color: '#fff' },
  errorBox:       { background: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 14 },
  formGroup:      { marginBottom: 16 },
  label:          { display: 'block', fontSize: 11, fontWeight: 800, color: theme.muted, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 7 },
  langBtn:        { flex: 1, padding: '10px', borderRadius: 10, background: theme.glass, border: `1px solid ${theme.gb}`, color: theme.muted, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Nunito',sans-serif" },
  langBtnActive:  { background: 'rgba(124,92,252,.25)', borderColor: 'rgba(124,92,252,.5)', color: theme.text },
  avatarGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  avatarCard:     { padding: '14px 10px', borderRadius: 14, border: `1px solid ${theme.gb}`, background: theme.glass, cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all .2s' },
  check:          { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 },
};