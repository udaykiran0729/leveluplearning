import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import img1 from '../assests/img-1.png';
import img2 from '../assests/img-2.png';

const FEATURES = [
  { icon: '🤖', title: 'AI Answers',       desc: 'Groq LLaMA 3.3 generates clear, age-appropriate explanations instantly.',        iconStyle: { background: 'rgba(124,92,252,.2)',  border: '1px solid rgba(124,92,252,.3)' } },
  { icon: '🎤', title: 'Voice & Image',     desc: 'Speak your question or snap a homework photo — OCR reads and explains it.',       iconStyle: { background: 'rgba(45,212,191,.15)', border: '1px solid rgba(45,212,191,.25)' } },
  { icon: '⭐', title: 'XP & Levels',       desc: 'Earn points, hit milestones and collect 6 unique badges as you grow.',            iconStyle: { background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.25)' } },
  { icon: '🌐', title: 'English & Hindi',   desc: 'Full bilingual support — one tap switches language across the entire app.',       iconStyle: { background: 'rgba(244,114,182,.12)',border: '1px solid rgba(244,114,182,.25)' } },
  { icon: '📊', title: 'Dashboard',         desc: 'Visual progress charts and ML-powered topic recommendations.',                    iconStyle: { background: 'rgba(59,130,246,.12)', border: '1px solid rgba(59,130,246,.25)' } },
  { icon: '🔒', title: 'Parental Controls', desc: 'PIN-protected time limits, content filters and safe topic settings.',             iconStyle: { background: 'rgba(239,68,68,.12)',  border: '1px solid rgba(239,68,68,.25)' } },
];

const STEPS = [
  { title: 'Create your profile',  desc: 'Enter your name, age and language. No email needed for children — parents log in separately to manage settings and time limits.', tag: 'Takes 30 seconds'       },
  { title: 'Pick your hero',       desc: 'Choose Doraemon, Chhota Bheem, Dora or Spider-Man. Each answers in their own unique personality, voice and style.',               tag: '4 characters available' },
  { title: 'Ask anything',         desc: 'Type a question, speak it, or upload a photo of your textbook. The AI reads, understands and explains with audio playback.',      tag: 'Text · Voice · Image OCR' },
  { title: 'Earn XP and level up', desc: 'Every question earns points. Hit milestones to unlock levels and badges. The ML engine tracks your topics and recommends next.', tag: '6 badges · 4 levels'     },
];

const NAV_LINKS = [
  { label: 'Home',         scrollTo: 'sec-home'     },
  { label: 'How it works', scrollTo: 'sec-how'      },
  { label: 'Dashboard',    scrollTo: null           },   // navigates to /auth

];

export default function Splash() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(0);

  useEffect(() => {}, []);

  const scrollTo = (id: string | null, navIdx: number) => {
    setActiveNav(navIdx);
    if (!id) { navigate('/auth'); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
          {NAV_LINKS.map((link, i) => (
            <div
              key={link.label}
              style={{ ...s.nl, ...(activeNav === i ? s.nlAct : {}) }}
              onClick={() => scrollTo(link.scrollTo, i)}
            >
              {link.label}
            </div>
          ))}
        </div>

        <div style={s.navR}>
          <button style={s.btnOut} onClick={() => navigate('/auth')}>Sign in</button>
          <button style={s.btnIn}  onClick={() => navigate('/auth')}>Get Started →</button>
        </div>
      </nav>

      {/* ══ SECTION 1 — HERO ══ */}
      <section id="sec-home" style={s.secHero}>

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
            <button style={s.hbg} onClick={() => scrollTo('sec-how', 1)}>See how it works ↓</button>
          </div>

        </div>

        {/* Image 1 */}
        <div style={s.heroRight}>
          <div style={s.img1Wrap}>
            <img src={img1} alt="Students learning with gamification" style={s.img1} />
          </div>
        </div>

      </section>

      {/* ══ SECTION 2 — FEATURES + IMAGE 2 ══ */}
      <section id="sec-features" style={s.secFeatures}>

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

        {/* Image 2 */}
        <div style={s.featRight}>
          <div style={s.img2Wrap}>
            <img src={img2} alt="Heroes teaching in classroom" style={s.img2} />
          </div>
        </div>

      </section>

      {/* ══ SECTION 3 — HOW IT WORKS ══ */}
      <section id="sec-how" style={s.secHow}>
        <div style={{ ...s.secTitle, textAlign: 'center' as const, marginBottom: 36 }}>How it works</div>
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



    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const s: any = {
  page:        { background: '#060412', color: '#f0edff', fontFamily: "'DM Sans',sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' },
  blob:        { position: 'fixed', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', animation: 'blobPulse 10s ease-in-out infinite alternate' },
  grid:        { position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,92,252,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,252,.035) 1px,transparent 1px)', backgroundSize: '52px 52px' },

  nav:         { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', height: 64, background: 'rgba(6,4,18,.8)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  logo:        { display: 'flex', alignItems: 'center', gap: 8 },
  logoBox:     { width: 32, height: 32, background: 'linear-gradient(135deg,#7c5cfc,#2dd4bf)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 },
  logoText:    { fontFamily: "'Fredoka One',cursive", fontSize: 20, background: 'linear-gradient(90deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navLinks:    { display: 'flex', gap: 2 },
  nl:          { padding: '7px 16px', borderRadius: 40, fontSize: 13, fontWeight: 700, color: 'rgba(240,237,255,.5)', cursor: 'pointer', border: '1px solid transparent', transition: 'all .2s' },
  nlAct:       { color: '#f0edff', background: 'rgba(255,255,255,.055)', borderColor: 'rgba(255,255,255,.09)' },
  navR:        { display: 'flex', gap: 8 },
  btnOut:      { padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', color: '#f0edff' },
  btnIn:       { padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', boxShadow: '0 0 20px rgba(124,92,252,.35)' },

  secHero:     { position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: 'calc(100vh - 64px)', padding: '40px 48px', gap: 48, maxWidth: 1200, margin: '0 auto' },
  heroLeft:    {},
  eyebrow:     { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 40, background: 'rgba(124,92,252,.12)', border: '1px solid rgba(124,92,252,.3)', fontSize: 12, fontWeight: 800, color: '#a78bfa', letterSpacing: '.5px', marginBottom: 22 },
  dot:         { width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', animation: 'dotPulse 2s infinite' },
  heroTitle:   { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(36px,5vw,60px)', lineHeight: 1.05, letterSpacing: '-.5px', marginBottom: 18, display: 'flex', flexDirection: 'column' },
  ht1:         { color: '#fff' },
  ht2:         { background: 'linear-gradient(135deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc:    { fontSize: 15, color: 'rgba(240,237,255,.5)', maxWidth: 440, lineHeight: 1.8, marginBottom: 28 },
  heroBtns:    { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 },
  hbp:         { padding: '14px 36px', borderRadius: 50, background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 28px rgba(124,92,252,.45)', transition: '.2s' },
  hbg:         { padding: '14px 28px', borderRadius: 50, background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', color: '#f0edff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: '.2s' },

  heroRight:   { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img1Wrap:    { position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(124,92,252,.3)', boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 40px rgba(124,92,252,.2)' },
  img1:        { width: '100%', maxWidth: 480, display: 'block', borderRadius: 24 },

  secFeatures: { position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' },
  featLeft:    {},
  secLabel:    { fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#a78bfa', marginBottom: 10 },
  secTitle:    { fontFamily: "'Fredoka One',cursive", fontSize: 32, color: '#fff', marginBottom: 8, lineHeight: 1.2 },
  secSub:      { fontSize: 14, color: 'rgba(240,237,255,.5)', lineHeight: 1.7, marginBottom: 28, maxWidth: 380 },
  featGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fc:          { background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.09)', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '18px 16px', transition: '.3s', position: 'relative', overflow: 'hidden' },
  fcIcon:      { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 },
  fcTitle:     { fontFamily: "'Fredoka One',cursive", fontSize: 14, color: '#fff', marginBottom: 5 },
  fcDesc:      { fontSize: 12, color: 'rgba(240,237,255,.5)', lineHeight: 1.6 },

  featRight:   { position: 'relative' },
  img2Wrap:    { position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(45,212,191,.25)', boxShadow: '0 24px 64px rgba(0,0,0,.6), 0 0 40px rgba(45,212,191,.15)' },
  img2:        { width: '100%', display: 'block', borderRadius: 24 },

  secHow:      { position: 'relative', zIndex: 10, maxWidth: 800, margin: '0 auto', padding: '0 48px 80px' },
  step:        { display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20, padding: '22px 0', borderBottom: '1px solid rgba(255,255,255,.05)' },
  stepN:       { width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'rgba(124,92,252,.18)', border: '1px solid rgba(124,92,252,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#a78bfa' },
  stepTitle:   { fontFamily: "'Fredoka One',cursive", fontSize: 16, color: '#fff', marginBottom: 4 },
  stepDesc:    { fontSize: 13, color: 'rgba(240,237,255,.5)', lineHeight: 1.65 },
  stepTag:     { display: 'inline-block', marginTop: 8, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: 'rgba(124,92,252,.1)', border: '1px solid rgba(124,92,252,.2)', color: '#a78bfa' },



};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  html { scroll-behavior: smooth; }
  @keyframes blobPulse { from{opacity:.35;transform:scale(1)} to{opacity:.6;transform:scale(1.1)} }
  @keyframes dotPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  .feat-card:hover { transform:translateY(-4px)!important; border-color:rgba(124,92,252,.35)!important; box-shadow:0 16px 32px rgba(0,0,0,.4)!important; }
  button:hover { opacity:.9; }
  nav div[style*="cursor: pointer"]:hover { color:#f0edff!important; background:rgba(255,255,255,.055)!important; border-color:rgba(255,255,255,.09)!important; }
`;