// ─── LevelUpLearning — Shared Design System ───────────────────
// Import this in every page: import { theme, css, BG } from '../styles/theme';

export const theme = {
  bg:      '#060412',
  glass:   'rgba(255,255,255,0.055)',
  gb:      'rgba(255,255,255,0.09)',
  purple:  '#7c5cfc',
  purple2: '#a78bfa',
  teal:    '#2dd4bf',
  gold:    '#fbbf24',
  pink:    '#f472b6',
  red:     '#ef4444',
  green:   '#22c55e',
  text:    '#f0edff',
  muted:   'rgba(240,237,255,0.5)',
};

// ─── Reusable inline style objects ────────────────────────────
export const t: any = {
  page:     { background: theme.bg, color: theme.text, fontFamily: "'Nunito',sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' },
  blob:     { position: 'fixed', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', animation: 'blobPulse 10s ease-in-out infinite alternate' },
  grid:     { position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,92,252,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,252,.035) 1px,transparent 1px)', backgroundSize: '52px 52px' },

  /* glass card */
  card:     { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(20px)', borderRadius: 20, padding: 24 },
  cardSm:   { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(16px)', borderRadius: 14, padding: '12px 16px' },

  /* typography */
  heading:  { fontFamily: "'Fredoka One',cursive", color: theme.text },
  gradText: { fontFamily: "'Fredoka One',cursive", background: 'linear-gradient(135deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  muted:    { color: theme.muted },
  label:    { fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: theme.muted },

  /* buttons */
  btnPrimary: { padding: '13px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 28px rgba(124,92,252,.4)' },
  btnGlass:   { padding: '13px 28px', borderRadius: 50, background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(12px)', color: theme.text, fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  btnDanger:  { padding: '10px 22px', borderRadius: 50, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.35)', color: '#fca5a5', fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 800, cursor: 'pointer' },

  /* inputs */
  input:    { width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 12, color: theme.text, fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600, outline: 'none' },

  /* nav */
  nav:      { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, background: 'rgba(6,4,18,.8)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  logo:     { fontFamily: "'Fredoka One',cursive", fontSize: 19, display: 'flex', alignItems: 'center', gap: 8 },
  logoBox:  { width: 30, height: 30, background: 'linear-gradient(135deg,#7c5cfc,#2dd4bf)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 },
  logoText: { background: 'linear-gradient(90deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },

  /* pills / badges */
  pill:     { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-block' },
  pillPurple: { background: 'rgba(124,92,252,.18)', border: '1px solid rgba(124,92,252,.35)', color: '#c4b5fd' },
  pillTeal:   { background: 'rgba(45,212,191,.12)', border: '1px solid rgba(45,212,191,.3)',  color: '#5eead4' },
  pillGold:   { background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.3)',  color: '#fcd34d' },
  pillGreen:  { background: 'rgba(34,197,94,.12)',  border: '1px solid rgba(34,197,94,.3)',   color: '#86efac' },
  pillRed:    { background: 'rgba(239,68,68,.12)',  border: '1px solid rgba(239,68,68,.3)',   color: '#fca5a5' },

  /* level colours */
  level: {
    1: { bg: 'rgba(59,130,246,.15)',  border: 'rgba(59,130,246,.4)',  text: '#93c5fd', name: 'Beginner'  },
    2: { bg: 'rgba(45,212,191,.15)',  border: 'rgba(45,212,191,.4)',  text: '#5eead4', name: 'Explorer'  },
    3: { bg: 'rgba(124,92,252,.15)',  border: 'rgba(124,92,252,.4)',  text: '#c4b5fd', name: 'Scholar'   },
    4: { bg: 'rgba(251,191,36,.15)',  border: 'rgba(251,191,36,.4)',  text: '#fcd34d', name: 'Champion'  },
  },
};

// ─── Global keyframes injected once per page ──────────────────
export const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes blobPulse  { from{opacity:.35;transform:scale(1)}  to{opacity:.6;transform:scale(1.1)} }
  @keyframes floatY     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dotPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
  @keyframes xpPop      { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-28px)} }
  @keyframes typeBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes pulseCta   { 0%{box-shadow:0 0 0 0 rgba(124,92,252,.6)} 50%{box-shadow:0 0 0 12px rgba(124,92,252,0)} 100%{box-shadow:0 0 0 0 rgba(124,92,252,0)} }
  @keyframes micPulse   { 0%{box-shadow:0 0 0 0 rgba(239,68,68,.6)} 70%{box-shadow:0 0 0 16px rgba(239,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
  @keyframes slideIn    { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInL   { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
  input::placeholder { color: rgba(240,237,255,.28) !important; }
  input:focus { border-color: rgba(124,92,252,.6) !important; }
  button { transition: transform .15s, box-shadow .15s, opacity .15s; }
  button:hover { opacity: .92; transform: translateY(-1px); }
  button:active { transform: scale(.97) !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,92,252,.3); border-radius: 2px; }
`;

// ─── Background blobs (reusable component) ────────────────────
export function BG() {
  return (
    <>
      <style>{css}</style>
      <div style={{ ...t.blob, width: 520, height: 520, background: '#4c1d95', top: -140, left: -110 }} />
      <div style={{ ...t.blob, width: 440, height: 440, background: '#0e7490', bottom: -100, right: -80, animationDelay: '4s' }} />
      <div style={{ ...t.blob, width: 280, height: 280, background: '#9d174d', top: '38%', right: '8%', animationDelay: '7s' }} />
      <div style={t.grid} />
    </>
  );
}

// ─── Nav bar (reusable component) ─────────────────────────────
interface NavProps {
  onBack?: () => void;
  right?: React.ReactNode;
}
export function Nav({ onBack, right }: NavProps) {
  return (
    <nav style={t.nav}>
      <div style={t.logo}>
        <div style={t.logoBox}>🎮</div>
        <span style={t.logoText}>LevelUpLearning</span>
      </div>
      {right || <div />}
    </nav>
  );
}