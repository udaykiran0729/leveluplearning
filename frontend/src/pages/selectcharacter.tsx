import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { BG, t, theme } from '../styles/theme';

// ── All 4 local character images ──────────────────────────────────────────────
// All files go in: frontend/src/assests/characters/
import doraemonImg from '../assests/characters/doraemon.png';
import doraImg     from '../assests/characters/dora.png';
import spideyImg   from '../assests/characters/spiderman.png';

// Chhota Bheem still uses URL (no local file uploaded yet)
const BHEEM_URL = 'https://www.pngplay.com/wp-content/uploads/7/Chhota-Bheem-Transparent-PNG.png';
const BHEEM_FB  = 'https://www.pngplay.com/wp-content/uploads/7/Chhota-Bheem-Background-PNG-Image.png';

const HEROES = [
  {
    id:    'doraemon',
    name:  'Doraemon',
    power: 'Magic Pocket',
    desc:  'Cheerful and always helpful. Uses fun analogies to explain everything.',
    color: '#3b82f6',
    delay: '0s',
    localImg: doraemonImg,
    isLocal:  true,
  },
  {
    id:    'chhota_bheem',
    name:  'Chhota Bheem',
    power: 'Super Strength',
    desc:  'Brave and enthusiastic. Short, punchy answers full of energy.',
    color: '#f59e0b',
    delay: '.2s',
    localImg: BHEEM_URL,
    isLocal:  false,
  },
  {
    id:    'dora',
    name:  'Dora',
    power: 'Bilingual Explorer',
    desc:  'Energetic explorer. Loves asking you to repeat key words.',
    color: '#10b981',
    delay: '.4s',
    localImg: doraImg,
    isLocal:  true,
  },
  {
    id:    'spiderman',
    name:  'Spider-Man',
    power: 'Spider Sense',
    desc:  'Cool and witty. Uses superhero analogies to make topics exciting.',
    color: '#ef4444',
    delay: '.6s',
    localImg: spideyImg,
    isLocal:  true,
  },
];

const PAGE_CSS = `
  @keyframes waveAnim {
    0%   { transform: translateY(0px)    rotate(0deg)   scale(1.05); }
    12%  { transform: translateY(-10px)  rotate(-20deg) scale(1.10); }
    28%  { transform: translateY(-14px)  rotate(18deg)  scale(1.12); }
    44%  { transform: translateY(-8px)   rotate(-13deg) scale(1.09); }
    60%  { transform: translateY(-4px)   rotate(10deg)  scale(1.07); }
    78%  { transform: translateY(-1px)   rotate(-5deg)  scale(1.06); }
    100% { transform: translateY(0px)    rotate(0deg)   scale(1.05); }
  }
  @keyframes floatChar {
    0%,100% { transform: translateY(0px);   }
    50%     { transform: translateY(-12px); }
  }
  @keyframes glowPulse {
    0%,100% { opacity: 0.35; } 50% { opacity: 0.70; }
  }
  .cimg {
    animation: floatChar 3.5s ease-in-out infinite;
    transform-origin: bottom center;
  }
  .cimg.waving {
    animation: waveAnim 0.92s cubic-bezier(.36,.07,.19,.97) forwards !important;
  }
  /* Remove white background from local PNG images */
  .local-img { mix-blend-mode: multiply; }
  .hcard {
    transition: transform 0.28s cubic-bezier(.34,1.5,.64,1),
                box-shadow 0.28s, border-color 0.28s, background 0.28s;
  }
  .hcard:hover { transform: translateY(-8px) scale(1.02) !important; }
`;

export default function SelectCharacter() {
  const [selected, setSelected] = useState('doraemon');
  const [waving,   setWaving]   = useState<string | null>(null);
  const [bheemFb,  setBheemFb]  = useState(false);
  const navigate = useNavigate();

  const name = localStorage.getItem('name') || 'Friend';
  const hero = HEROES.find(h => h.id === selected)!;

  const pick = (id: string) => {
    setSelected(id);
    setWaving(id);
    setTimeout(() => setWaving(null), 950);
  };

  const getBheemSrc = () => bheemFb ? BHEEM_FB : BHEEM_URL;

  return (
    <div style={{ ...t.page, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <BG />
      <style>{PAGE_CSS}</style>

      {/* NAV */}
      <nav style={{ ...t.nav, flexShrink: 0 }}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: theme.muted }}>Step 2 of 2</span>
          <button style={t.btnGlass} onClick={() => navigate('/auth')}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </nav>

      {/* Full-screen body */}
      <div style={s.body}>

        {/* Header */}
        <div style={s.header}>
          <p style={s.eyebrow}>Character Selection</p>
          <h1 style={s.title}>Hi {name}, choose your hero.</h1>
          <p style={{ fontSize: 14, color: theme.muted, lineHeight: 1.65 }}>
            Each hero answers in a unique personality and speaking style.&nbsp;
            <span style={{ color: theme.purple2, fontWeight: 600 }}>Click to see them wave! 👋</span>
          </p>
        </div>

        {/* 4 hero cards */}
        <div style={s.grid}>
          {HEROES.map(h => {
            const isSel  = selected === h.id;
            const isWave = waving   === h.id;
            const imgSrc = h.id === 'chhota_bheem' ? getBheemSrc() : h.localImg;

            return (
              <div
                key={h.id}
                className="hcard"
                style={{
                  ...s.card,
                  borderColor: isSel ? h.color : 'rgba(255,255,255,.08)',
                  background: isSel
                    ? `linear-gradient(170deg,${h.color}1a 0%,rgba(6,4,18,.98) 55%)`
                    : 'rgba(255,255,255,.04)',
                  boxShadow: isSel
                    ? `0 0 0 1.5px ${h.color}, 0 24px 56px ${h.color}25`
                    : '0 4px 24px rgba(0,0,0,.3)',
                  transform: isSel ? 'translateY(-8px) scale(1.015)' : 'none',
                }}
                onClick={() => pick(h.id)}>

                {/* Check badge */}
                {isSel && (
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 3, width: 24, height: 24, borderRadius: '50%', background: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${h.color}` }}>
                    <Check size={13} color="#fff" strokeWidth={2.5} />
                  </div>
                )}

                {/* Glow disc */}
                <div style={{ position: 'absolute', bottom: '30%', left: '50%', transform: 'translateX(-50%)', width: 110, height: 110, borderRadius: '50%', background: h.color, filter: 'blur(36px)', opacity: isSel ? 0.25 : 0.07, animation: isSel ? 'glowPulse 2s ease-in-out infinite' : 'none', pointerEvents: 'none', zIndex: 0 }} />

                {/* Character image */}
                <div style={s.imgBox}>
                  <img
                    src={imgSrc}
                    alt={h.name}
                    className={`cimg${isWave ? ' waving' : ''}${h.isLocal ? ' local-img' : ''}`}
                    style={{
                      height:         '100%',
                      width:          '100%',
                      objectFit:      'contain',
                      objectPosition: 'bottom center',
                      animationDelay: h.delay,
                      filter:         `drop-shadow(0 6px 20px ${h.color}55)`,
                      position:       'relative',
                      zIndex:         1,
                    }}
                    onError={e => {
                      if (h.id === 'chhota_bheem') setBheemFb(true);
                    }}
                  />
                </div>

                {/* Text */}
                <div style={s.cardText}>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: isSel ? h.color : theme.text, marginBottom: 6 }}>
                    {h.name}
                  </div>
                  <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.55, marginBottom: 12, minHeight: 34 }}>
                    {h.desc}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${h.color}18`, border: `1px solid ${h.color}30`, color: h.color }}>
                    ⚡ {h.power}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div style={s.bottomBar}>
          <div style={{ ...s.previewPill, borderColor: `${hero.color}33` }}>
            <img
              src={hero.id === 'chhota_bheem' ? getBheemSrc() : hero.localImg}
              alt={hero.name}
              className={hero.isLocal ? 'local-img' : ''}
              style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0, filter: `drop-shadow(0 2px 8px ${hero.color}66)` }}
            />
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: theme.text }}>{hero.name}</span>
              <span style={{ fontSize: 13, color: theme.muted }}> — {hero.desc}</span>
            </div>
          </div>
          <button
            style={{ ...t.btnPrimary, padding: '14px 40px', fontSize: 16, background: `linear-gradient(135deg,${hero.color},${hero.color}cc)`, boxShadow: `0 0 32px ${hero.color}44`, minWidth: 240, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, animation: 'pulseCta 2.5s ease-in-out infinite' }}
            onClick={() => { localStorage.setItem('avatar', selected); navigate('/chat'); }}>
            Continue with {hero.name} →
          </button>
        </div>

      </div>
    </div>
  );
}

const s: any = {
  body:        { position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 28px 22px', gap: 18, overflow: 'hidden' },
  header:      { textAlign: 'center', flexShrink: 0 },
  eyebrow:     { fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.purple2, marginBottom: 8 },
  title:       { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(26px,3.5vw,44px)', color: theme.text, marginBottom: 6 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, flex: 1, minHeight: 0 },
  card:        { backdropFilter: 'blur(20px)', borderRadius: 22, border: '1.5px solid', padding: '18px 14px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  imgBox:      { flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', minHeight: 0, overflow: 'hidden', marginBottom: 12 },
  cardText:    { flexShrink: 0, textAlign: 'center' },
  bottomBar:   { flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.07)', flexWrap: 'wrap' },
  previewPill: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, background: theme.glass, border: '1px solid', backdropFilter: 'blur(14px)', borderRadius: 14, padding: '10px 16px', overflow: 'hidden' },
};