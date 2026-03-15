import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BG, t, theme } from '../styles/theme';

const HEROES = [
  { id: 'doraemon',     emoji: '🤖', name: 'Doraemon',     power: 'Magic Pocket',      desc: 'Cheerful, curious and always helpful!',    color: '#3b82f6', bg: 'rgba(59,130,246,.15)',  delay: '0s'   },
  { id: 'chhota_bheem', emoji: '💪', name: 'Chhota Bheem', power: 'Super Strength',    desc: 'Brave, simple and super enthusiastic!',    color: '#f59e0b', bg: 'rgba(245,158,11,.15)',  delay: '.15s' },
  { id: 'dora',         emoji: '🌟', name: 'Dora',         power: 'Bilingual Explorer', desc: 'Energetic explorer who loves adventure!', color: '#10b981', bg: 'rgba(16,185,129,.15)',  delay: '.3s'  },
  { id: 'spiderman',    emoji: '🕷️', name: 'Spider-Man',   power: 'Spider Sense',      desc: 'Cool, witty and always motivating!',       color: '#ef4444', bg: 'rgba(239,68,68,.15)',   delay: '.45s' },
];

export default function SelectCharacter() {
  const [selected, setSelected] = useState('doraemon');
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Friend';
  const hero = HEROES.find(h => h.id === selected)!;

  const handleStart = () => {
    localStorage.setItem('avatar', selected);
    navigate('/chat');
  };

  return (
    <div style={s.page}>
      <BG />

      {/* NAV */}
      <nav style={t.nav}>
        <div style={t.logo}><div style={t.logoBox}>🎮</div><span style={t.logoText}>LevelUpLearning</span></div>
        <button style={{ ...t.btnGlass, padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/auth')}>← Back</button>
      </nav>

      <div style={s.wrap}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.eyebrow}>Step 2 of 2</div>
          <h1 style={s.title}>Hi {name}!<br /><span style={t.gradText}>Choose your hero</span></h1>
          <p style={{ ...t.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Your hero will answer every question in their own unique voice and personality. You can change this anytime.
          </p>
        </div>

        {/* Hero grid */}
        <div style={s.grid}>
          {HEROES.map(h => (
            <div key={h.id}
              style={{
                ...s.heroCard,
                borderColor: selected === h.id ? h.color : theme.gb,
                background:  selected === h.id ? h.bg : theme.glass,
                boxShadow:   selected === h.id ? `0 0 32px ${h.color}33, 0 16px 40px rgba(0,0,0,.4)` : 'none',
                animation:   `scaleIn .4s ${h.delay} ease both`,
              }}
              onClick={() => setSelected(h.id)}>

              {/* Selected indicator */}
              {selected === h.id && (
                <div style={{ ...s.selectedBadge, background: h.color }}>✓ Selected</div>
              )}

              {/* Emoji */}
              <div style={{ fontSize: 54, animation: 'floatY 3s ease-in-out infinite', animationDelay: h.delay, marginBottom: 14 }}>
                {h.emoji}
              </div>

              <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: selected === h.id ? h.color : theme.text, marginBottom: 4 }}>
                {h.name}
              </h3>
              <p style={{ fontSize: 12, color: theme.muted, marginBottom: 10, lineHeight: 1.5 }}>{h.desc}</p>

              {/* Power badge */}
              <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${h.color}20`, border: `1px solid ${h.color}44`, color: h.color }}>
                ⚡ {h.power}
              </div>
            </div>
          ))}
        </div>

        {/* Preview bar + CTA */}
        <div style={s.preview}>
          <div style={{ ...s.previewCard, borderColor: `${hero.color}44` }}>
            <span style={{ fontSize: 32 }}>{hero.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: hero.color }}>{hero.name} will answer your questions!</div>
              <div style={{ fontSize: 12, color: theme.muted, marginTop: 2 }}>{hero.desc}</div>
            </div>
          </div>
          <button style={{ ...t.btnPrimary, padding: '14px 40px', fontSize: 16, background: `linear-gradient(135deg,${hero.color},${hero.color}aa)` }}
            onClick={handleStart}>
            Go with {hero.name}! 🚀
          </button>
        </div>

      </div>
    </div>
  );
}

const s: any = {
  page:         { ...t.page },
  wrap:         { position: 'relative', zIndex: 10, maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 },
  header:       { textAlign: 'center' },
  eyebrow:      { display: 'inline-block', padding: '5px 14px', borderRadius: 20, background: 'rgba(124,92,252,.15)', border: '1px solid rgba(124,92,252,.3)', fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 14 },
  title:        { fontFamily: "'Fredoka One',cursive", fontSize: 'clamp(28px,4vw,44px)', color: theme.text, lineHeight: 1.1, marginBottom: 12 },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, width: '100%' },
  heroCard:     { background: theme.glass, border: '2px solid', backdropFilter: 'blur(20px)', borderRadius: 20, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all .25s', position: 'relative' },
  selectedBadge:{ position: 'absolute', top: -1, right: -1, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: '0 18px 0 10px' },
  preview:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 560 },
  previewCard:  { width: '100%', background: theme.glass, border: '1px solid', backdropFilter: 'blur(16px)', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 },
};