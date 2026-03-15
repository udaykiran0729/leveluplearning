import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Zap, Mic, Globe, Shield, BarChart2, Gamepad2 } from 'lucide-react';
import { registerUser } from '../services/api';
import { BG, t, theme } from '../styles/theme';

const FEATURES = [
  { Icon: Zap,          text: '+10 XP for every text question asked'           },
  { Icon: Mic,          text: '+20 XP for voice and image questions'           },
  { Icon: CheckCircle2, text: 'Unlock 6 badges as you reach milestones'       },
  { Icon: Globe,        text: 'Switch between English and Hindi anytime'      },
  { Icon: Shield,       text: 'Parental controls with PIN and content filters' },
  { Icon: BarChart2,    text: 'ML-powered topic recommendations'              },
];

export default function Register() {
  const [tab,     setTab]  = useState<'child' | 'parent'>('child');
  const [name,    setName] = useState('');
  const [age,     setAge]  = useState('');
  const [lang,    setLang] = useState('english');
  const [loading, setLoad] = useState(false);
  const [error,   setErr]  = useState('');
  const navigate = useNavigate();

  const existingId   = localStorage.getItem('user_id');
  const existingName = localStorage.getItem('name');

  const submit = async () => {
    setErr('');
    if (!name.trim())                                { setErr('Please enter your name.'); return; }
    if (!age || Number(age) < 4 || Number(age) > 14){ setErr('Age must be between 4 and 14.'); return; }
    setLoad(true);
    try {
      const res = await registerUser({ name: name.trim(), age: Number(age), language: lang, avatar: 'doraemon' });
      localStorage.setItem('user_id',  String(res.data.user_id));
      localStorage.setItem('name',     res.data.name);
      localStorage.setItem('language', lang);
      localStorage.setItem('avatar',   'doraemon');
      navigate('/select-character');
    } catch {
      setErr('Cannot connect to backend. Make sure the server is running on port 8000.');
    }
    setLoad(false);
  };

  return (
    <div style={{ ...t.page, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BG />

      {/* NAV */}
      <nav style={{ ...t.nav, flexShrink: 0 }}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {existingId && existingName && (
            <span style={{ fontSize: 13, color: theme.muted }}>Welcome back, {existingName}</span>
          )}
          <button style={t.btnGlass} onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Home
          </button>
          {existingId && (
            <button style={{ ...t.btnGlass, background: 'rgba(124,92,252,.2)', borderColor: 'rgba(124,92,252,.4)', color: theme.text }}
              onClick={() => navigate('/chat')}>Continue →</button>
          )}
        </div>
      </nav>

      {/* Body */}
      <div style={s.body}>

        {/* ── LEFT — text only, no images ── */}
        <div style={s.left}>

          {/* Icon badge */}
          <div style={s.iconBadge}>
            <Gamepad2 size={28} color={theme.purple2} />
          </div>

          <p style={s.eyebrow}>Create Account</p>
          <h1 style={s.title}>
            Start your<br />
            <span style={t.gradText}>learning adventure</span>
          </h1>
          <p style={{ fontSize: 15, color: theme.muted, lineHeight: 1.8, marginBottom: 32, maxWidth: 360 }}>
            Free to use. No email required for children.
            Takes under 30 seconds to get started.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={s.featureRow}>
                <div style={s.featureIcon}>
                  <f.Icon size={14} color={theme.purple2} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 14, color: 'rgba(240,237,255,.75)', lineHeight: 1.4 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Step indicator */}
          <div style={s.stepRow}>
            <div style={s.stepActive}>1</div>
            <div style={s.stepLine} />
            <div style={s.stepInactive}>2</div>
            <div style={s.stepLine} />
            <div style={s.stepInactive}>3</div>
            <span style={{ fontSize: 12, color: theme.muted, marginLeft: 8 }}>Profile → Hero → Chat</span>
          </div>
        </div>

        {/* ── RIGHT — form ── */}
        <div style={s.right}>
          <div style={s.formCard}>

            {/* Tabs */}
            <div style={s.tabs}>
              {(['child', 'parent'] as const).map(tb => (
                <div key={tb} style={{ ...s.tab, ...(tab === tb ? s.tabActive : {}) }} onClick={() => setTab(tb)}>
                  {tb === 'child' ? 'Child Profile' : 'Parent Login'}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={s.errBox}>
                <AlertCircle size={14} /><span>{error}</span>
              </div>
            )}

            {tab === 'child' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={s.lbl}>Name</label>
                  <input style={t.input} placeholder="Your first name" value={name}
                    onChange={e => { setName(e.target.value); setErr(''); }}
                    onKeyDown={e => e.key === 'Enter' && submit()} />
                </div>
                <div>
                  <label style={s.lbl}>Age</label>
                  <input style={t.input} placeholder="4 – 14" type="number" min={4} max={14}
                    value={age} onChange={e => { setAge(e.target.value); setErr(''); }} />
                </div>
                <div>
                  <label style={s.lbl}>Language</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ id: 'english', label: '🇬🇧  English' }, { id: 'hindi', label: '🇮🇳  Hindi' }].map(l => (
                      <button key={l.id}
                        style={{ ...s.langBtn, ...(lang === l.id ? s.langBtnOn : {}) }}
                        onClick={() => setLang(l.id)}>
                        {lang === l.id && <CheckCircle2 size={12} color={theme.purple2} />}
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <p style={s.hint}>You can switch anytime in the chat.</p>
                </div>
                <div style={s.nextNote}>
                  You will choose your hero character on the next screen.
                </div>
                <button
                  style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1, animation: 'pulseCta 2.5s ease-in-out infinite 2s' }}
                  onClick={submit} disabled={loading}>
                  {loading
                    ? <><div style={s.spin} />Creating profile...</>
                    : 'Get Started →'
                  }
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(240,237,255,.25)' }}>
                  Free forever · No credit card · No ads
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7 }}>
                  Log in to view progress, set daily time limits and manage content filters.
                </p>
                <div>
                  <label style={s.lbl}>Email</label>
                  <input style={t.input} placeholder="you@example.com" type="email" />
                </div>
                <div>
                  <label style={s.lbl}>Password</label>
                  <input style={t.input} placeholder="••••••••" type="password" />
                </div>
                <button style={{ ...t.btnPrimary, width: '100%', padding: 14, fontSize: 15 }}
                  onClick={() => navigate('/parent')}>Sign In →</button>
                <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(240,237,255,.3)' }}>
                  First time? Set your PIN in Parental Controls.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s: any = {
  body:        { flex: 1, position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0, padding: '0 56px 40px', gap: 56, alignItems: 'center' },
  left:        { display: 'flex', flexDirection: 'column', justifyContent: 'center' },

  iconBadge:   { width: 56, height: 56, borderRadius: 16, background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  eyebrow:     { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.purple2, marginBottom: 10 },
  title:       { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,3.5vw,48px)', color: theme.text, lineHeight: 1.1, marginBottom: 14 },
  featureRow:  { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: { width: 30, height: 30, borderRadius: 8, background: 'rgba(124,92,252,.12)', border: '1px solid rgba(124,92,252,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  stepRow:     { display: 'flex', alignItems: 'center', marginTop: 28, gap: 4 },
  stepActive:  { width: 26, height: 26, borderRadius: '50%', background: theme.purple, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepInactive:{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', color: theme.muted, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepLine:    { width: 20, height: 1, background: 'rgba(255,255,255,.12)' },

  right:       { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formCard:    { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(24px)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 420 },
  tabs:        { display: 'flex', background: 'rgba(0,0,0,.3)', borderRadius: 40, padding: 4, marginBottom: 24, gap: 4 },
  tab:         { flex: 1, padding: '9px', borderRadius: 36, textAlign: 'center', fontSize: 13, fontWeight: 500, cursor: 'pointer', color: theme.muted, transition: 'all .2s' },
  tabActive:   { background: '#7c5cfc', color: '#fff', fontWeight: 600 },
  errBox:      { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#fca5a5', marginBottom: 8 },
  lbl:         { display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(240,237,255,.4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 },
  langBtn:     { flex: 1, padding: '10px', borderRadius: 10, background: theme.glass, border: `1px solid ${theme.gb}`, color: theme.muted, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  langBtnOn:   { background: 'rgba(124,92,252,.2)', borderColor: 'rgba(124,92,252,.5)', color: theme.text },
  hint:        { fontSize: 11, color: 'rgba(240,237,255,.28)', marginTop: 6 },
  nextNote:    { background: 'rgba(124,92,252,.08)', border: '1px solid rgba(124,92,252,.2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center', fontSize: 13, color: theme.muted },
  spin:        { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' },
};