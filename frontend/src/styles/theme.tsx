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

export const t: any = {
  page:     { background: theme.bg, color: theme.text, fontFamily: "'DM Sans', sans-serif", minHeight: '100vh', overflowX: 'hidden', position: 'relative' },
  blob:     { position: 'fixed', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none', animation: 'blobPulse 10s ease-in-out infinite alternate' },
  grid:     { position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(124,92,252,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(124,92,252,.035) 1px,transparent 1px)', backgroundSize: '52px 52px' },
  card:     { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(20px)', borderRadius: 20, padding: 24 },
  cardSm:   { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(16px)', borderRadius: 14, padding: '12px 16px' },
  btnPrimary:  { padding: '13px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#7c5cfc,#4c1d95)', border: 'none', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnGlass:    { padding: '8px 16px', borderRadius: 40, background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(12px)', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  btnDanger:   { padding: '10px 22px', borderRadius: 50, background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.35)', color: '#fca5a5', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
  input:    { width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 12, color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 400, outline: 'none' },
  nav:      { position: 'sticky' as const, top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, background: 'rgba(6,4,18,.8)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  logo:     { fontFamily: "'Fredoka One', cursive", fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 },
  logoBox:  { width: 30, height: 30, background: 'linear-gradient(135deg,#7c5cfc,#2dd4bf)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 },
  logoText: { background: 'linear-gradient(90deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  gradText: { fontFamily: "'Fredoka One', cursive", background: 'linear-gradient(135deg,#a78bfa,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  pill:          { padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-block' },
  pillPurple:    { background: 'rgba(124,92,252,.18)', border: '1px solid rgba(124,92,252,.35)', color: '#c4b5fd' },
  pillTeal:      { background: 'rgba(45,212,191,.12)', border: '1px solid rgba(45,212,191,.3)',  color: '#5eead4' },
  pillGold:      { background: 'rgba(251,191,36,.12)', border: '1px solid rgba(251,191,36,.3)',  color: '#fcd34d' },
};

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fredoka+One&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  input::placeholder { color: rgba(240,237,255,.28) !important; }
  input:focus        { border-color: rgba(124,92,252,.6) !important; }
  button { transition: opacity .15s, transform .1s; }
  button:hover  { opacity: .9; }
  button:active { transform: scale(.97); opacity: 1; }
  ::-webkit-scrollbar       { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,92,252,.3); border-radius: 2px; }

  @keyframes blobPulse  { from{opacity:.35;transform:scale(1)}  to{opacity:.6;transform:scale(1.1)} }
  @keyframes floatY     { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes xpPop      { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-28px)} }
  @keyframes typeBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes pulseCta   { 0%{box-shadow:0 0 0 0 rgba(124,92,252,.5)} 50%{box-shadow:0 0 0 12px rgba(124,92,252,0)} 100%{box-shadow:0 0 0 0 rgba(124,92,252,0)} }
  @keyframes micPulse   { 0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)} 70%{box-shadow:0 0 0 14px rgba(239,68,68,0)} 100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
  @keyframes scaleIn    { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes spin       { to{transform:rotate(360deg)} }

  @media (max-width:768px) {
    .two-col   { grid-template-columns: 1fr !important; }
    .four-stat { grid-template-columns: 1fr 1fr !important; }
    .hero-grid { grid-template-columns: 1fr 1fr !important; }
    .chat-grid { grid-template-columns: 1fr !important; }
    .hide-mob  { display: none !important; }
  }
  @media (max-width:480px) {
    .four-stat { grid-template-columns: 1fr 1fr !important; }
  }
`;

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