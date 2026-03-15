import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import img1 from '../assests/img-1.png';
import img2 from '../assests/img-2.png';

export default function Splash() {
  const navigate = useNavigate();
  const [s1, setS1] = useState(0);
  const [s2, setS2] = useState(0);
  const [s3, setS3] = useState(0);

  useEffect(() => {
    const tick = (setter: React.Dispatch<React.SetStateAction<number>>, target: number, step: number) => {
      let c = 0;
      const iv = setInterval(() => {
        c += step;
        if (c >= target) { c = target; clearInterval(iv); }
        setter(c);
      }, 24);
    };
    tick(setS1, 248,   5);
    tick(setS2, 3140,  60);
    tick(setS3, 24800, 480);
  }, []);

  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* BG blobs */}
      <div style={{ ...s.blob, width: 550, height: 550, background: '#4c1d95', top: -160, left: -120 }} />
      <div style={{ ...s.blob, width: 460, height: 460, background: '#0e7490', bottom: -100, right: -80, animationDelay: '4s' }} />
      <div style={{ ...s.blob, width: 300, height: 300, background: '#9d174d', top: '35%', right: '8%', animationDelay: '8s' }} />
      <div style={s.grid} />

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.logoBox}>🎮</div>
          <span style={s.logoText}>LevelUpLearning</span>
        </div>
        <div style={s.navLinks}>
          {['Home', 'How it works', 'Dashboard', 'Pricing'].map((l, i) => (
            <div key={l} style={{ ...s.nl, ...(i === 0 ? s.nlAct : {}) }}>{l}</div>
          ))}
        </div>
        <div style={s.navR}>
          <button style={s.btnOut}>Sign in</button>
          <button style={s.btnIn} onClick={() => navigate('/auth')}>Get Started →</button>
        </div>
      </nav>

      {/* ══ SECTION 1 — HERO ══ */}
      <section style={s.secHero}>

        {/* LEFT */}
        <div style={s.heroLeft}>
          <div style={s.eyebrow}>
            <div style={s.dot} />
            AI-powered · Free for children aged 6–14
          </div>

          <h1 style={s.heroTitle}>
            <span style={s.ht1}>Learning that feels</span>
            <span style={s.ht2}>like a game.</span>
          </h1>

          <p style={s.heroDesc}>
            Ask any question by voice, text or homework photo. Get fun, age-appropriate answers.
            Earn XP, unlock badges and level up — the more you learn, the more you win.
          </p>

          <div style={s.heroBtns}>
            <button style={s.hbp} onClick={() => navigate('/auth')}>🚀 Start Learning Free</button>
            <button style={s.hbg}>See how it works ↓</button>
          </div>

          <div style={s.statsStrip}>
            {[
              { val: fmt(s1), label: 'Students' },
              { val: fmt(s2), label: 'Questions' },
              { val: fmt(s3), label: 'XP Earned' },
              { val: '4',    label: 'Heroes'    },
            ].map((st, i) => (
              <div key={i} style={{ ...s.si, ...(i > 0 ? s.siDivider : {}) }}>
                <div style={s.sv}>{st.val}</div>
                <div style={s.sl}>{st.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Image 1: gaming leaderboard scene */}
        <div style={s.heroRight}>
          <div style={s.img1Wrap}>
            <img src={img1} alt="Students learning with gamification" style={s.img1} />
            {/* Floating badge top-left */}
            <div style={{ ...s.imgBadge, top: 16, left: 16 }}>
              <div style={s.ibLabel}>Live score</div>
              <div style={{ ...s.ibVal, color: '#fbbf24' }}>+50 XP ⭐</div>
            </div>
            {/* Floating badge bottom-right */}
            <div style={{ ...s.imgBadge, bottom: 16, right: 16, textAlign: 'right' }}>
              <div style={s.ibLabel}>Current level</div>
              <div style={{ ...s.ibVal, color: '#2dd4bf' }}>Level 2 Explorer</div>
            </div>
          </div>
        </div>

      </section>

      {/* ══ SECTION 2 — FEATURES + IMAGE 2 ══ */}
      <section style={s.secFeatures}>

        {/* LEFT — 6 feature cards */}
        <div style={s.featLeft}>
          <div style={s.secLabel}>What you get</div>
          <div style={s.secTitle}>Everything a curious<br />mind needs</div>
          <p style={s.secSub}>
            Six powerful features working together to make learning feel less like homework
            and more like levelling up.
          </p>
          <div style={s.featGrid}>
            {FEATURES.map(f => (
              <div key={f.title} style={s.fc} className="feat-card">
                <div style={{ ...s.fcIcon, ...f.iconStyle }}>{f.icon}</div>
                <h4 style={s.fcTitle}>{f.title}</h4>
                <p style={s.fcDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Image 2: classroom with characters */}
        <div style={s.featRight}>
          <div style={s.img2Wrap}>
            <img src={img2} alt="Heroes teaching in classroom" style={s.img2} />
            {/* Top-right badge */}
            <div style={s.img2Badge}>
              <div style={s.img2BadgeVal}>🏆 4</div>
              <div style={s.img2BadgeLbl}>Hero Tutors</div>
            </div>
          </div>
          {/* Floating card bottom-left */}
          <div style={s.img2Card}>
            <div style={s.icTitle}>Active subjects</div>
            {[
              { color: '#7c5cfc', text: 'Science & Physics' },
              { color: '#2dd4bf', text: 'Mathematics' },
              { color: '#fbbf24', text: 'History & Geography' },
            ].map(r => (
              <div key={r.text} style={s.icRow}>
                <div style={{ ...s.icDot, background: r.color }} />
                <span style={s.icText}>{r.text}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ══ SECTION 3 — HOW IT WORKS ══ */}
      <section style={s.secHow}>
        <div style={{ ...s.secTitle, textAlign: 'center', marginBottom: 36 }}>How it works</div>
        <div>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...s.step, ...(i === STEPS.length - 1 ? { borderBottom: 'none' } : {}) }}>
              <div style={s.stepN}>{i + 1}</div>
              <div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
                <span style={s.stepTag}>{step.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER CTA ══ */}
      <section style={s.secCta}>
        <div style={s.ctaBox}>
          <div style={{ ...s.secTitle, textAlign: 'center', marginBottom: 10 }}>
            Ready to start learning?
          </div>
          <p style={{ ...s.heroDesc, textAlign: 'center', margin: '0 auto 28px' }}>
            Join hundreds of students already earning XP and levelling up their knowledge every day.
            It is completely free.
          </p>
          <div style={{ ...s.heroBtns, justifyContent: 'center' }}>
            <button style={s.hbp} onClick={() => navigate('/auth')}>🚀 Get Started Free</button>
            <button style={s.hbg} onClick={() => navigate('/auth')}>Sign in →</button>
          </div>
          <div style={s.ctaNote}>Free forever · No credit card · No ads</div>
        </div>
      </section>

    </div>
  );
}

/* ─── Data ─────────────────────────────────────────────────── */
const FEATURES = [
  { icon: '🤖', title: 'AI Answers',        desc: 'Groq LLaMA 3.3 generates clear, age-appropriate explanations instantly.',         iconStyle: { background: 'rgba(124,92,252,.2)',  border: '1px solid rgba(124,92,252,.3)' } },
  { icon: '🎤', title: 'Voice & Image',      desc: 'Speak your question or snap a homework photo — OCR reads and explains it.',        iconStyle: { background: 'rgba(45,212,191,.15)', border: '1px solid rgba(45,212,191,.25)' } },
  { icon: '⭐', title: 'XP & Levels',        desc: 'Earn points, hit milestones and collect 6 unique badges as you grow.',             iconStyle: { background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)' } },
  { icon: '🌐', title: 'English & Hindi',    desc: 'Full bilingual support — one tap switches language across the entire app.',        iconStyle: { background: 'rgba(244,114,182,.12)',border: '1px solid rgba(244,114,182,.25)' } },
  { icon: '📊', title: 'Dashboard',          desc: 'Visual progress charts and ML-powered topic recommendations.',                     iconStyle: { background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)' } },
  { icon: '🔒', title: 'Parental Controls',  desc: 'PIN-protected time limits, content filters and safe topic settings.',              iconStyle: { background: 'rgba(239,68,68,.12)',  border: '1px solid rgba(239,68,68,.25)' } },
];

const STEPS = [
  { title: 'Create your profile',    desc: 'Enter your name, age and language. No email needed for children — parents log in separately to manage settings and time limits.',        tag: 'Takes 30 seconds' },
  { title: 'Pick your hero',         desc: 'Choose Doraemon, Chhota Bheem, Dora or Spider-Man. Each answers in their own unique personality, voice and style.',                     tag: '4 characters available' },
  { title: 'Ask anything',           desc: 'Type a question, speak it, or upload a photo of your textbook. The AI reads, understands and explains with audio playback.',            tag: 'Text · Voice · Image OCR' },
  { title: 'Earn XP and level up',   desc: 'Every question earns points. Hit milestones to unlock levels and badges. The ML engine tracks your topics and recommends what to learn.', tag: '6 badges · 4 levels' },
];

/* ─── Styles ────────────────────────────────────────────────── */
const s: any = {
  page:        { background: '#060412', color: '#f0edff', fontFamily: "'Nunito',sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' },
  blob:        { position: 'fixed', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', animation: 'blobPulse 10s ease-in-out infinite alternate' },
  grid:        { position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,92,252,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,252,.035) 1px,transparent 1px)', backgroundSize: '52px 52px' },

  /* nav */
  nav:         { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', height: 64, background: 'rgba(6,4,18,.8)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  logo:        { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox:     { width: 32, height: 32, background: 'linear-gradient(135deg,#7c5cfc,#2dd4bf)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoText:    { fontFamily: "'Fredoka One',cursive", fontSize: 20, background: 'linear-gradient(90deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navLinks:    { display: 'flex', gap: 2 },
  nl:          { padding: '7px 16px', borderRadius: 40, fontSize: 13, fontWeight: 700, color: 'rgba(240,237,255,.5)', cursor: 'pointer', border: '1px solid transparent' },
  nlAct:       { color: '#f0edff', background: 'rgba(255,255,255,.055)', borderColor: 'rgba(255,255,255,.09)' },
  navR:        { display: 'flex', gap: 8 },
  btnOut:      { padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', color: '#f0edff' },
  btnIn:       { padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(124,92,252,.35)' },

  /* hero section */
  secHero:     { position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 48px', gap: 48, maxWidth: 1200, margin: '0 auto' },
  heroLeft:    {},
  eyebrow:     { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, background: 'rgba(124,92,252,.12)', border: '1px solid rgba(124,92,252,.3)', fontSize: 12, fontWeight: 800, color: '#a78bfa', letterSpacing: '.5px', marginBottom: 22 },
  dot:         { width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'dotPulse 2s infinite' },
  heroTitle:   { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(36px,5vw,60px)', lineHeight: 1.05, letterSpacing: '-.5px', marginBottom: 18, display: 'flex', flexDirection: 'column' },
  ht1:         { color: '#fff' },
  ht2:         { background: 'linear-gradient(135deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc:    { fontSize: 15, color: 'rgba(240,237,255,.5)', maxWidth: 440, lineHeight: 1.8, marginBottom: 28 },
  heroBtns:    { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 },
  hbp:         { padding: '14px 36px', borderRadius: 50, background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 28px rgba(124,92,252,.45)' },
  hbg:         { padding: '14px 28px', borderRadius: 50, background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', color: '#f0edff', fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  statsStrip:  { display: 'flex', gap: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 18, overflow: 'hidden', backdropFilter: 'blur(16px)' },
  si:          { padding: '16px 20px', textAlign: 'center', flex: 1 },
  siDivider:   { borderLeft: '1px solid rgba(255,255,255,.07)' },
  sv:          { fontFamily: "'Fredoka One',cursive", fontSize: 24, color: '#fff', lineHeight: 1 },
  sl:          { fontSize: 10, fontWeight: 800, color: 'rgba(240,237,255,.5)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 3 },

  /* image 1 */
  heroRight:   { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img1Wrap:    { position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(124,92,252,.3)', boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 40px rgba(124,92,252,.2)' },
  img1:        { width: '100%', maxWidth: 480, display: 'block', borderRadius: 24 },
  imgBadge:    { position: 'absolute', background: 'rgba(6,4,18,.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(124,92,252,.35)', borderRadius: 14, padding: '10px 14px' },
  ibLabel:     { fontSize: 10, fontWeight: 900, color: 'rgba(240,237,255,.5)', letterSpacing: '.5px', textTransform: 'uppercase' },
  ibVal:       { fontFamily: "'Fredoka One',cursive", fontSize: 18, marginTop: 2 },

  /* features section */
  secFeatures: { position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' },
  featLeft:    {},
  secLabel:    { fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 10 },
  secTitle:    { fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#fff', marginBottom: 8, lineHeight: 1.2 },
  secSub:      { fontSize: 14, color: 'rgba(240,237,255,.5)', lineHeight: 1.7, marginBottom: 28, maxWidth: 380 },
  featGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fc:          { background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '18px 16px' },
  fcIcon:      { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 },
  fcTitle:     { fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#fff', marginBottom: 5 },
  fcDesc:      { fontSize: 12, color: 'rgba(240,237,255,.5)', lineHeight: 1.6 },

  /* image 2 */
  featRight:   { position: 'relative' },
  img2Wrap:    { position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(45,212,191,.25)', boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 40px rgba(45,212,191,.15)' },
  img2:        { width: '100%', display: 'block', borderRadius: 24 },
  img2Badge:   { position: 'absolute', top: 16, right: 16, background: 'rgba(6,4,18,.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(251,191,36,.35)', borderRadius: 12, padding: '8px 12px', textAlign: 'center' },
  img2BadgeVal:{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#fbbf24' },
  img2BadgeLbl:{ fontSize: 9, fontWeight: 800, color: 'rgba(240,237,255,.5)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 },
  img2Card:    { position: 'absolute', bottom: -16, left: -16, background: 'rgba(6,4,18,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(124,92,252,.3)', borderRadius: 16, padding: '14px 18px', minWidth: 190 },
  icTitle:     { fontSize: 11, fontWeight: 900, color: 'rgba(240,237,255,.4)', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8 },
  icRow:       { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 },
  icDot:       { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  icText:      { fontSize: 12, fontWeight: 700, color: '#f0edff' },

  /* how it works */
  secHow:      { position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', padding: '0 48px 80px' },
  step:        { display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20, padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,.05)' },
  stepN:       { width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(124,92,252,.18)', border: '1px solid rgba(124,92,252,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#a78bfa' },
  stepTitle:   { fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff', marginBottom: 4 },
  stepDesc:    { fontSize: 13, color: 'rgba(240,237,255,.5)', lineHeight: 1.65 },
  stepTag:     { display: 'inline-block', marginTop: 8, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: 'rgba(124,92,252,.1)', border: '1px solid rgba(124,92,252,.2)', color: '#a78bfa' },

  /* footer cta */
  secCta:      { position: 'relative', zIndex: 10, maxWidth: 700, margin: '0 auto', padding: '0 40px 80px', textAlign: 'center' },
  ctaBox:      { background: 'linear-gradient(135deg,rgba(124,92,252,.18),rgba(45,212,191,.08))', border: '1px solid rgba(124,92,252,.28)', backdropFilter: 'blur(20px)', borderRadius: 28, padding: '48px 40px' },
  ctaNote:     { fontSize: 11, color: 'rgba(240,237,255,.25)', marginTop: 14, fontWeight: 700 },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  @keyframes blobPulse { from{opacity:.35;transform:scale(1)} to{opacity:.6;transform:scale(1.1)} }
  @keyframes dotPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  .feat-card:hover { transform:translateY(-4px)!important; border-color:rgba(124,92,252,.35)!important; box-shadow:0 16px 32px rgba(0,0,0,.4)!important; }
  button:hover { opacity:.92; }
`;
