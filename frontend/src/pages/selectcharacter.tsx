import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CHARACTERS = [
  {
    id:    'doraemon',
    name:  'Doraemon',
    emoji: '🤖',
    color: '#3b82f6',
    bg:    '#eff6ff',
    desc:  'Cheerful & always helpful!',
    power: 'Magic Pocket',
  },
  {
    id:    'chhota_bheem',
    name:  'Chhota Bheem',
    emoji: '💪',
    color: '#f59e0b',
    bg:    '#fffbeb',
    desc:  'Brave & super strong!',
    power: 'Super Strength',
  },
  {
    id:    'dora',
    name:  'Dora',
    emoji: '🌟',
    color: '#10b981',
    bg:    '#ecfdf5',
    desc:  'Explorer & adventurer!',
    power: 'Bilingual Explorer',
  },
  {
    id:    'spiderman',
    name:  'Spider-Man',
    emoji: '🕷️',
    color: '#ef4444',
    bg:    '#fef2f2',
    desc:  'Cool, witty & motivating!',
    power: 'Spider Sense',
  },
];

export default function SelectCharacter() {
  const [selected, setSelected] = useState('doraemon');
  const navigate                = useNavigate();
  const name                    = localStorage.getItem('name') || 'Friend';

  const char = CHARACTERS.find(c => c.id === selected)!;

  const handleStart = () => {
    localStorage.setItem('avatar', selected);
    navigate('/chat');
  };

  return (
    <div style={s.page}>
      <div style={s.top}>
        <h1 style={s.title}>Hi {name}! 👋</h1>
        <p style={s.sub}>Choose your learning hero!</p>
      </div>

      <div style={s.grid}>
        {CHARACTERS.map(c => (
          <div key={c.id}
            style={selected === c.id
              ? { ...s.card, border: `3px solid ${c.color}`, background: c.bg }
              : s.card}
            onClick={() => setSelected(c.id)}>
            <div style={s.emoji}>{c.emoji}</div>
            <div style={{ ...s.charName, color: c.color }}>{c.name}</div>
            <div style={s.charDesc}>{c.desc}</div>
            <div style={{ ...s.power, background: c.color + '22', color: c.color }}>
              ⚡ {c.power}
            </div>
            {selected === c.id && (
              <div style={{ ...s.selected, background: c.color }}>✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      <div style={s.bottom}>
        <div style={s.preview}>
          <span style={s.previewEmoji}>{char.emoji}</span>
          <div>
            <div style={s.previewName}>{char.name} will answer your questions!</div>
            <div style={s.previewDesc}>{char.desc}</div>
          </div>
        </div>
        <button style={{ ...s.btn, background: char.color }} onClick={handleStart}>
          Go with {char.name}! 🚀
        </button>
      </div>
    </div>
  );
}

const s: any = {
  page:        { minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' },
  top:         { textAlign: 'center', marginBottom: 24 },
  title:       { color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 },
  sub:         { color: '#c4b5fd', fontSize: 15, marginTop: 6 },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 420 },
  card:        { background: '#fff', borderRadius: 16, padding: '18px 12px', textAlign: 'center', cursor: 'pointer', border: '3px solid transparent', position: 'relative', transition: 'all 0.2s' },
  emoji:       { fontSize: 44 },
  charName:    { fontWeight: 800, fontSize: 15, marginTop: 8 },
  charDesc:    { fontSize: 11, color: '#6b7280', marginTop: 4 },
  power:       { fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 20, marginTop: 8, display: 'inline-block' },
  selected:    { position: 'absolute', top: -1, right: -1, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: '0 14px 0 10px' },
  bottom:      { width: '100%', maxWidth: 420, marginTop: 20 },
  preview:     { background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  previewEmoji:{ fontSize: 36 },
  previewName: { color: '#fff', fontWeight: 700, fontSize: 14 },
  previewDesc: { color: '#c4b5fd', fontSize: 12, marginTop: 2 },
  btn:         { width: '100%', padding: '16px', borderRadius: 16, color: '#fff', border: 'none', fontSize: 17, fontWeight: 800, cursor: 'pointer', letterSpacing: 0.3 },
};
