import { useState, useRef, useEffect } from 'react';
import { askVoiceCharacter, askImage, getRecommendations, getProgress } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BG, t, theme } from '../styles/theme';

type Msg = { role: 'user' | 'assistant'; text: string; image?: string; levelUp?: boolean; newBadge?: string; };

const CHAR_INFO: any = {
  doraemon:     { emoji: '🤖', color: '#3b82f6', bg: 'rgba(59,130,246,.15)'  },
  chhota_bheem: { emoji: '💪', color: '#f59e0b', bg: 'rgba(245,158,11,.15)'  },
  dora:         { emoji: '🌟', color: '#10b981', bg: 'rgba(16,185,129,.15)'  },
  spiderman:    { emoji: '🕷️', color: '#ef4444', bg: 'rgba(239,68,68,.15)'   },
};

const ALL_BADGES = [
  { id: 'First Question', e: '🏅', c: '#fbbf24' },
  { id: 'Explorer Badge', e: '🌍', c: '#3b82f6' },
  { id: 'Scholar Badge',  e: '📚', c: '#8b5cf6' },
  { id: 'Champion Badge', e: '🏆', c: '#ef4444' },
  { id: 'Voice Master',   e: '🎤', c: '#10b981' },
  { id: 'Bilingual Star', e: '🌐', c: '#ec4899' },
];

const LEVEL_NAMES: any = { 1: 'Beginner', 2: 'Explorer', 3: 'Scholar', 4: 'Champion' };
const LEVEL_COLORS: any = { 1: '#3b82f6', 2: '#2dd4bf', 3: '#a78bfa', 4: '#fbbf24' };
const NEXT_AT: any = { 1: 100, 2: 300, 3: 600, 4: 600 };

const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function Chat() {
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [tab,        setTab]        = useState<'text' | 'voice' | 'image'>('text');
  const [listening,  setListening]  = useState(false);
  const [points,     setPoints]     = useState(0);
  const [level,      setLevel]      = useState(1);
  const [levelName,  setLevelName]  = useState('Beginner');
  const [nextAt,     setNextAt]     = useState(100);
  const [badges,     setBadges]     = useState<string[]>([]);
  const [recs,       setRecs]       = useState<string[]>([]);
  const [xpAnim,     setXpAnim]     = useState('');
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgFile,    setImgFile]    = useState<File | null>(null);
  const [panelLoading, setPanelLoading] = useState(true);

  const fileRef   = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recogRef  = useRef<any>(null);
  const navigate  = useNavigate();

  const userId    = localStorage.getItem('user_id')  || '1';
  const character = localStorage.getItem('avatar')   || 'doraemon';
  const language  = localStorage.getItem('language') || 'english';
  const name      = localStorage.getItem('name')     || 'Friend';
  const ci        = CHAR_INFO[character] || CHAR_INFO.doraemon;

  // ── Load real progress from backend on mount ──────────────────
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      text: `Hi ${name}! I'm ${character.replace(/_/g, ' ')}! Ask me anything — type, speak, or send a photo of your homework! 🎉`,
    }]);

    // Fetch real progress
    getProgress(Number(userId))
      .then(r => {
        const p = r.data;
        if (!p.error) {
          setPoints(p.points);
          setLevel(p.level);
          setLevelName(p.level_name);
          setNextAt(p.next_level_at);
          setBadges(p.badges || []);
        }
      })
      .catch(() => {})
      .finally(() => setPanelLoading(false));

    // Fetch real ML recommendations
    getRecommendations(Number(userId))
      .then(r => setRecs(r.data.recommendations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const playAudio = (b64: string) => {
    try { new Audio(`data:audio/mp3;base64,${b64}`).play(); } catch {}
  };

  // ── Update state from API response ────────────────────────────
  const handleResponse = (d: any, userMsg: Msg) => {
    setMessages(m => [...m, userMsg, {
      role: 'assistant',
      text: d.answer,
      levelUp:  d.level_up,
      newBadge: d.new_badge,
    }]);
    if (typeof d.points    === 'number') setPoints(d.points);
    if (typeof d.level     === 'number') setLevel(d.level);
    if (d.level_name)                    setLevelName(d.level_name);
    if (d.next_level_at)                 setNextAt(d.next_level_at);
    if (Array.isArray(d.badges))         setBadges(d.badges);
    setXpAnim(`+${d.points_earned} XP`);
    setTimeout(() => setXpAnim(''), 2000);
    if (d.audio_base64) playAudio(d.audio_base64);
  };

  // ── Send text question ─────────────────────────────────────────
  const sendText = async (q?: string) => {
    const question = (q || input).trim();
    if (!question) return;
    setInput(''); setLoading(true);
    try {
      const r = await askVoiceCharacter({ user_id: userId, question, character, language });
      handleResponse(r.data, { role: 'user', text: question });
    } catch {
      setMessages(m => [...m,
        { role: 'user',      text: question },
        { role: 'assistant', text: 'Oops! Something went wrong. Check if backend is running! 😊' },
      ]);
    }
    setLoading(false);
  };

  // ── Voice input ────────────────────────────────────────────────
  const startVoice = () => {
    if (!SpeechRec) { alert('Voice input works in Chrome browser only!'); return; }
    const r = new SpeechRec();
    r.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
    recogRef.current = r;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => { setListening(false); alert('Could not hear you. Try again!'); };
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendText(transcript);
    };
    r.start();
  };

  // ── Image upload ───────────────────────────────────────────────
  const sendImage = async () => {
    if (!imgFile) return;
    setLoading(true);
    try {
      const r = await askImage({ user_id: userId, language, character }, imgFile);
      handleResponse(r.data, { role: 'user', text: `📸 ${imgFile.name}`, image: imgPreview || undefined });
    } catch {
      setMessages(m => [...m,
        { role: 'user',      text: `📸 ${imgFile.name}`, image: imgPreview || undefined },
        { role: 'assistant', text: 'Could not read image. Try a clearer photo of text! 📸' },
      ]);
    }
    setImgPreview(null); setImgFile(null); setLoading(false);
  };

  // ── XP progress % within current level ────────────────────────
  const prevAt  = NEXT_AT[Math.max(1, level - 1) as keyof typeof NEXT_AT] || 0;
  const xpInLvl = points - (level > 1 ? [0,0,100,300,600][level] || 0 : 0);
  const xpRange = nextAt - (level > 1 ? [0,0,100,300,600][level] || 0 : 0);
  const xpPct   = nextAt > 0 ? Math.min(100, Math.round((points / nextAt) * 100)) : 100;
  const lc      = LEVEL_COLORS[level] || '#7c5cfc';

  return (
    <div style={{ ...t.page, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <BG />

      {/* ── NAV ── */}
      <nav style={{ ...t.nav, flexShrink: 0 }}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Real XP bar */}
          <div style={s.xpWrap}>
            <span style={{ fontSize: 11, fontWeight: 800, color: theme.gold }}>⭐ {points} XP</span>
            <div style={s.xpTrack}>
              <div style={{ ...s.xpFill, width: `${xpPct}%`, background: lc }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: theme.muted }}>{LEVEL_NAMES[level]}</span>
          </div>
          {/* Language toggle */}
          <button style={{ ...t.btnGlass, padding: '6px 12px', fontSize: 12 }}
            onClick={() => {
              const nl = language === 'english' ? 'hindi' : 'english';
              localStorage.setItem('language', nl);
              window.location.reload();
            }}>
            {language === 'english' ? '🇮🇳 HI' : '🇬🇧 EN'}
          </button>
          {/* XP animation */}
          {xpAnim && <div style={s.xpPop}>{xpAnim} ⭐</div>}
          <button style={{ ...t.btnGlass, padding: '6px 12px', fontSize: 12 }} onClick={() => navigate('/dashboard')}>📊</button>
          <button style={{ ...t.btnGlass, padding: '6px 12px', fontSize: 12 }} onClick={() => navigate('/parent')}>🔒</button>
        </div>
      </nav>

      {/* XP progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,.06)', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${xpPct}%`, background: `linear-gradient(90deg,${lc},#2dd4bf)`, transition: 'width .6s' }} />
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 260px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* Chat column */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ML Recommendations strip — real data */}
          {recs.length > 0 && (
            <div style={s.recsStrip}>
              <span style={{ fontSize: 11, fontWeight: 800, color: theme.muted, flexShrink: 0 }}>🤖 Try:</span>
              {recs.map(r => (
                <button key={r}
                  style={{ ...s.recChip, background: `${ci.color}18`, border: `1px solid ${ci.color}33`, color: ci.color }}
                  onClick={() => sendText(r)}>
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8, alignItems: 'flex-end',
              }}>
                {m.role === 'assistant' && (
                  <div style={{ ...s.msgAv, background: ci.bg, border: `1px solid ${ci.color}44` }}>{ci.emoji}</div>
                )}
                <div style={{
                  ...s.bubble,
                  ...(m.role === 'user'
                    ? { ...s.bubbleUser, background: `linear-gradient(135deg,${ci.color},${ci.color}99)` }
                    : s.bubbleBot),
                }}>
                  {m.image && (
                    <img src={m.image} alt="upload"
                      style={{ width: '100%', borderRadius: 8, marginBottom: 6, maxHeight: 140, objectFit: 'cover' }} />
                  )}
                  <span style={{ fontSize: 13, lineHeight: 1.65 }}>{m.text}</span>
                  {m.levelUp  && <div style={s.levelBanner}>🎉 LEVEL UP! You reached {levelName}!</div>}
                  {m.newBadge && <div style={s.badgeBanner}>🏆 New Badge Unlocked: {m.newBadge}!</div>}
                </div>
                {m.role === 'user' && <div style={s.msgAv}>😊</div>}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ ...s.msgAv, background: ci.bg, border: `1px solid ${ci.color}44` }}>{ci.emoji}</div>
                <div style={s.bubbleBot}>
                  <div style={{ display: 'flex', gap: 4, padding: '4px 2px' }}>
                    {[0, .2, .4].map(d => (
                      <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: ci.color, opacity: .7, animation: `typeBounce 1.2s ${d}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={s.inputArea}>
            <div style={s.inputTabs}>
              {(['text', 'voice', 'image'] as const).map(tb => (
                <button key={tb}
                  style={{ ...s.inputTab, ...(tab === tb ? { background: `${ci.color}22`, borderColor: ci.color, color: theme.text } : {}) }}
                  onClick={() => setTab(tb)}>
                  {tb === 'text' ? '⌨️ Text' : tb === 'voice' ? '🎤 Voice' : '📸 Image'}
                </button>
              ))}
            </div>

            {tab === 'text' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...t.input, flex: 1 }}
                  placeholder={`Ask ${character.replace(/_/g, ' ')} anything...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && sendText()}
                  disabled={loading} />
                <button
                  style={{ ...s.sendBtn, background: `linear-gradient(135deg,${ci.color},${ci.color}88)` }}
                  onClick={() => sendText()} disabled={loading}>
                  ➤
                </button>
              </div>
            )}

            {tab === 'voice' && (
              <div style={s.voiceArea}>
                <div style={{ ...s.micRing, ...(listening ? s.micListening : { background: `linear-gradient(135deg,${ci.color},${ci.color}88)` }) }}
                  onClick={listening ? () => { recogRef.current?.stop(); setListening(false); } : startVoice}>
                  {listening ? '⏹' : '🎤'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: listening ? '#ef4444' : theme.muted }}>
                  {listening ? 'Listening... tap to stop' : (language === 'hindi' ? 'Hindi mein bolo!' : 'Tap the mic and speak!')}
                </div>
              </div>
            )}

            {tab === 'image' && (
              <div>
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setImgFile(f);
                    const reader = new FileReader();
                    reader.onload = ev => setImgPreview(ev.target?.result as string);
                    reader.readAsDataURL(f);
                  }} />
                {imgPreview ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <img src={imgPreview} alt="preview" style={{ width: '100%', maxHeight: 110, objectFit: 'cover', borderRadius: 10, border: `1px solid ${ci.color}44` }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ ...t.btnDanger, flex: 1, padding: 10 }} onClick={() => { setImgPreview(null); setImgFile(null); }}>✕ Clear</button>
                      <button style={{ ...t.btnPrimary, flex: 2, padding: 10, fontSize: 13, background: `linear-gradient(135deg,${ci.color},${ci.color}88)` }}
                        onClick={sendImage} disabled={loading}>
                        {loading ? '⏳ Reading image...' : '🔍 Explain This!'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button style={{ ...s.uploadBtn, borderColor: ci.color, color: ci.color }}
                    onClick={() => fileRef.current?.click()}>
                    <div style={{ fontSize: 28 }}>📸</div>
                    <div style={{ fontWeight: 700, marginTop: 6 }}>Upload Homework / Textbook</div>
                    <div style={{ fontSize: 11, opacity: .6, marginTop: 3 }}>Best for text-based images, notes or printed pages</div>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel — 100% real data from API ── */}
        <div style={s.rightPanel}>

          {panelLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: theme.muted, fontSize: 13 }}>Loading...</div>
          ) : (
            <>
              {/* Level + XP */}
              <div style={s.panelTitle}>Progress</div>
              <div style={{ background: `linear-gradient(135deg,${lc}22,rgba(45,212,191,.08))`, border: `1px solid ${lc}33`, borderRadius: 14, padding: '14px 12px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 20, background: lc, color: '#fff', fontSize: 11, fontWeight: 800 }}>Level {level}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: lc }}>{xpPct}%</span>
                </div>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: theme.text }}>{LEVEL_NAMES[level]}</div>
                <div style={{ fontSize: 11, color: theme.muted, margin: '3px 0 8px' }}>
                  {points} / {nextAt} XP — {nextAt - points} to next level
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${xpPct}%`, background: `linear-gradient(90deg,${lc},#2dd4bf)`, borderRadius: 3, transition: 'width .8s' }} />
                </div>
              </div>

              {/* Badges — earned vs locked from real API data */}
              <div style={s.panelTitle}>Badges ({badges.length}/{ALL_BADGES.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 14 }}>
                {ALL_BADGES.map(b => {
                  const earned = badges.includes(b.id);
                  return (
                  <div key={b.id} title={b.id} style={{
                    background: earned ? `${b.c}12` : theme.glass,
                    border: `1px solid ${earned ? b.c + '44' : theme.gb}`,
                    borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                  }}>
                      <div style={{ fontSize: 18, filter: earned ? 'none' : 'grayscale(1) opacity(.28)' }}>{b.e}</div>
                      <div style={{ fontSize: 8, fontWeight: 800, color: earned ? b.c : theme.muted, marginTop: 3 }}>
                        {b.id.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ML Suggestions — real data */}
              <div style={s.panelTitle}>🤖 ML Suggestions</div>
              {(recs.length > 0 ? recs : ['Science', 'Maths', 'History']).map(r => (
                <button key={r} style={s.mlChip} onClick={() => sendText(r)}>{r} →</button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s: any = {
  xpWrap:      { display: 'flex', alignItems: 'center', gap: 8, background: theme.glass, border: `1px solid ${theme.gb}`, borderRadius: 40, padding: '6px 14px' },
  xpTrack:     { width: 70, height: 5, background: 'rgba(255,255,255,.1)', borderRadius: 3, overflow: 'hidden' },
  xpFill:      { height: '100%', borderRadius: 3, transition: 'width .6s' },
  xpPop:       { background: theme.gold, color: '#78350f', fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 20, animation: 'xpPop 2s ease forwards', whiteSpace: 'nowrap' },
  recsStrip:   { background: 'rgba(6,4,18,.5)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${theme.gb}`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 },
  recChip:     { border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 800, fontFamily: "'Nunito',sans-serif" },
  messages:    { flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 },
  msgAv:       { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 },
  bubble:      { maxWidth: '72%', padding: '10px 14px', borderRadius: 16, wordBreak: 'break-word' },
  bubbleBot:   { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(12px)', color: theme.text, borderBottomLeftRadius: 4 },
  bubbleUser:  { color: '#fff', borderBottomRightRadius: 4, boxShadow: '0 4px 16px rgba(0,0,0,.3)' },
  levelBanner: { background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: theme.gold, marginTop: 8 },
  badgeBanner: { background: 'rgba(45,212,191,.12)', border: '1px solid rgba(45,212,191,.25)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 800, color: theme.teal, marginTop: 5 },
  inputArea:   { background: 'rgba(6,4,18,.6)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${theme.gb}`, padding: '10px 14px 14px', flexShrink: 0 },
  inputTabs:   { display: 'flex', gap: 6, marginBottom: 10 },
  inputTab:    { flex: 1, padding: '7px 4px', borderRadius: 10, border: `1.5px solid ${theme.gb}`, background: theme.glass, cursor: 'pointer', fontSize: 12, fontWeight: 800, color: theme.muted, fontFamily: "'Nunito',sans-serif" },
  sendBtn:     { width: 44, height: 44, borderRadius: 12, border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  voiceArea:   { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 8 },
  micRing:     { width: 60, height: 60, borderRadius: '50%', border: 'none', color: '#fff', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  micListening:{ background: '#ef4444', animation: 'micPulse 1.5s infinite' },
  uploadBtn:   { width: '100%', padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,.03)', border: '2px dashed', cursor: 'pointer', textAlign: 'center', fontFamily: "'Nunito',sans-serif", fontSize: 13 },
  rightPanel:  { background: 'rgba(6,4,18,.5)', backdropFilter: 'blur(20px)', borderLeft: `1px solid ${theme.gb}`, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 2 },
  panelTitle:  { fontSize: 10, fontWeight: 900, letterSpacing: 1, color: 'rgba(240,237,255,.35)', textTransform: 'uppercase', marginBottom: 8, marginTop: 10 },
  mlChip:      { width: '100%', padding: '8px 12px', borderRadius: 10, background: 'rgba(124,92,252,.1)', border: '1px solid rgba(124,92,252,.2)', color: '#a78bfa', fontSize: 11, fontWeight: 800, cursor: 'pointer', textAlign: 'left', fontFamily: "'Nunito',sans-serif", marginBottom: 5 },
};