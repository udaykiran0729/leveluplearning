import { useState, useRef, useEffect } from 'react';
import { askVoiceCharacter, askImage, getRecommendations } from '../services/api';
import { useNavigate } from 'react-router-dom';

type Msg = {
  role:      'user' | 'assistant';
  text:      string;
  image?:    string;
  levelUp?:  boolean;
  newBadge?: string;
  points?:   number;
};

const CHAR_INFO: any = {
  doraemon:     { emoji: '🤖', color: '#3b82f6', bg: '#eff6ff' },
  chhota_bheem: { emoji: '💪', color: '#f59e0b', bg: '#fffbeb' },
  dora:         { emoji: '🌟', color: '#10b981', bg: '#ecfdf5' },
  spiderman:    { emoji: '🕷️', color: '#ef4444', bg: '#fef2f2' },
};

// Browser SpeechRecognition
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function Chat() {
  const [messages,    setMessages]    = useState<Msg[]>([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [tab,         setTab]         = useState<'text' | 'voice' | 'image'>('text');
  const [listening,   setListening]   = useState(false);
  const [points,      setPoints]      = useState(0);
  const [level,       setLevel]       = useState(1);
  const [levelName,   setLevelName]   = useState('Beginner');
  const [recs,        setRecs]        = useState<string[]>([]);
  const [xpAnim,      setXpAnim]      = useState('');
  const [imgPreview,  setImgPreview]  = useState<string | null>(null);
  const [imgFile,     setImgFile]     = useState<File | null>(null);

  const fileRef   = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recogRef  = useRef<any>(null);
  const navigate  = useNavigate();

  const userId    = localStorage.getItem('user_id')  || '1';
  const character = localStorage.getItem('avatar')   || 'doraemon';
  const language  = localStorage.getItem('language') || 'english';
  const name      = localStorage.getItem('name')     || 'Friend';
  const ci        = CHAR_INFO[character] || CHAR_INFO.doraemon;

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      text: `Hi ${name}! I'm ${character.replace(/_/g, ' ')}! Ask me anything — text, voice, or send a photo of your homework! 🎉`,
    }]);
    getRecommendations(Number(userId))
      .then(r => setRecs(r.data.recommendations || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Play audio from base64 ──────────────────────────────────────────────────
  const playAudio = (base64: string) => {
    try {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.play();
    } catch (e) { console.log('Audio play failed', e); }
  };

  // ── Handle API response ─────────────────────────────────────────────────────
  const handleResponse = (d: any, userMsg: Msg) => {
    setMessages(m => [...m, userMsg, {
      role:     'assistant',
      text:     d.answer,
      levelUp:  d.level_up,
      newBadge: d.new_badge,
      points:   d.points,
    }]);
    setPoints(d.points || 0);
    setLevel(d.level || 1);
    setLevelName(d.level_name || 'Beginner');
    setXpAnim(`+${d.points_earned} XP`);
    setTimeout(() => setXpAnim(''), 2000);
    if (d.audio_base64) playAudio(d.audio_base64);
  };

  // ── Send text ───────────────────────────────────────────────────────────────
  const sendText = async (question?: string) => {
    const q = (question || input).trim();
    if (!q) return;
    setInput('');
    setLoading(true);
    try {
      const res = await askVoiceCharacter({ user_id: userId, question: q, character, language });
      handleResponse(res.data, { role: 'user', text: q });
    } catch {
      setMessages(m => [...m,
        { role: 'user',      text: q },
        { role: 'assistant', text: 'Oops! Something went wrong. Try again! 😊' },
      ]);
    }
    setLoading(false);
  };

  // ── Voice input via browser SpeechRecognition ───────────────────────────────
  const startVoice = () => {
    if (!SpeechRecognition) {
      alert('Voice input only works in Chrome browser!');
      return;
    }
    const recog       = new SpeechRecognition();
    recog.lang        = language === 'hindi' ? 'hi-IN' : 'en-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recogRef.current  = recog;

    recog.onstart  = () => setListening(true);
    recog.onend    = () => setListening(false);
    recog.onerror  = () => { setListening(false); alert('Could not hear you. Try again!'); };
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendText(transcript);
    };
    recog.start();
  };

  const stopVoice = () => {
    recogRef.current?.stop();
    setListening(false);
  };

  // ── Image input ─────────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const sendImage = async () => {
    if (!imgFile) return;
    setLoading(true);
    try {
      const res = await askImage({ user_id: userId, language, character }, imgFile);
      handleResponse(res.data, {
        role:  'user',
        text:  `📸 ${imgFile.name}`,
        image: imgPreview || undefined,
      });
    } catch {
      setMessages(m => [...m,
        { role: 'user',      text: `📸 ${imgFile.name}`, image: imgPreview || undefined },
        { role: 'assistant', text: 'Could not read image. Try a clearer photo! 📸' },
      ]);
    }
    setImgPreview(null);
    setImgFile(null);
    setLoading(false);
  };

  return (
    <div style={s.page}>

{/* ── Header ── */}
<div style={{ ...s.header, background: `linear-gradient(135deg, ${ci.color}, #4c1d95)` }}>
  <div style={s.heroRow}>
    <div style={{ ...s.heroAvatar, background: ci.bg }}>{ci.emoji}</div>
    <div>
      <div style={s.heroName}>{character.replace(/_/g, ' ').toUpperCase()}</div>
      <div style={s.heroLevel}>⭐ Level {level} · {levelName} · {points} XP</div>
    </div>
  </div>
  <div style={s.headerRight}>
    {xpAnim && <div style={s.xpPop}>{xpAnim}</div>}

    {/* ── Language Toggle ── */}
    <button style={s.langToggle} onClick={() => {
      const newLang = language === 'english' ? 'hindi' : 'english';
      localStorage.setItem('language', newLang);
      window.location.reload();
    }}>
      {language === 'english' ? '🇮🇳 HI' : '🇬🇧 EN'}
    </button>

    <button style={s.iconBtn} onClick={() => navigate('/dashboard')} title="Dashboard">📊</button>
    <button style={s.iconBtn} onClick={() => navigate('/parent')} title="Parent Controls">🔒</button>
  </div>
</div>
      {/* ── XP Bar ── */}
      <div style={s.xpBar}>
        <div style={{ ...s.xpFill, width: `${Math.min(100, (points % 100))}%`, background: ci.color }} />
      </div>

      {/* ── Recommended Topics ── */}
      {recs.length > 0 && (
        <div style={s.recs}>
          <span style={s.recsLabel}>🤖 Try:</span>
          {recs.map(r => (
            <button key={r} style={{ ...s.recChip, background: ci.color + '22', color: ci.color }}
              onClick={() => sendText(r)}>
              {r}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div style={s.messages}>
        {messages.map((m, i) => (
          <div key={i} style={m.role === 'user' ? s.userRow : s.botRow}>

            {m.role === 'assistant' && (
              <div style={{ ...s.botAvatar, background: ci.bg }}>{ci.emoji}</div>
            )}

            <div style={m.role === 'user' ? { ...s.bubble, ...s.userBubble } : { ...s.bubble, ...s.botBubble }}>
              {m.image && (
                <img src={m.image} alt="upload"
                  style={{ width: '100%', borderRadius: 8, marginBottom: 6, maxHeight: 160, objectFit: 'cover' }} />
              )}
              <span style={{ fontSize: 14, lineHeight: 1.6 }}>{m.text}</span>
              {m.levelUp  && <div style={s.levelBanner}>🎉 LEVEL UP! You reached {m.points} XP!</div>}
              {m.newBadge && <div style={s.badgeBanner}>🏆 New Badge: {m.newBadge}!</div>}
            </div>

          </div>
        ))}

        {loading && (
          <div style={s.botRow}>
            <div style={{ ...s.botAvatar, background: ci.bg }}>{ci.emoji}</div>
            <div style={{ ...s.bubble, ...s.botBubble }}>
              <span style={s.dots}>Thinking<span className="dot">...</span></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={s.inputArea}>

        {/* Tabs */}
        <div style={s.tabs}>
          {(['text', 'voice', 'image'] as const).map(t => (
            <button key={t} style={tab === t
              ? { ...s.tab, borderColor: ci.color, color: ci.color, background: ci.bg }
              : s.tab}
              onClick={() => setTab(t)}>
              {t === 'text' ? '⌨️ Text' : t === 'voice' ? '🎤 Voice' : '📸 Image'}
            </button>
          ))}
        </div>

        {/* Text Tab */}
        {tab === 'text' && (
          <div style={s.textRow}>
            <input style={s.textInput} placeholder="Ask me anything..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendText()}
              disabled={loading} />
            <button style={{ ...s.sendBtn, background: ci.color }}
              onClick={() => sendText()} disabled={loading}>
              ➤
            </button>
          </div>
        )}

        {/* Voice Tab */}
        {tab === 'voice' && (
          <div style={s.voiceArea}>
            {listening ? (
              <>
                <div style={s.listeningDot} />
                <div style={s.listeningText}>Listening... speak now!</div>
                <button style={{ ...s.voiceBtn, background: '#ef4444' }} onClick={stopVoice}>
                  ⏹ Stop
                </button>
              </>
            ) : (
              <>
                <div style={s.micIcon}>🎤</div>
                <div style={s.voiceHint}>
                  {language === 'hindi' ? 'Hindi mein bolo!' : 'Tap and speak!'}
                </div>
                <button style={{ ...s.voiceBtn, background: ci.color }} onClick={startVoice} disabled={loading}>
                  🎤 Start Speaking
                </button>
              </>
            )}
          </div>
        )}

        {/* Image Tab */}
        {tab === 'image' && (
          <div style={s.imageArea}>
            <input type="file" ref={fileRef} accept="image/*"
              style={{ display: 'none' }} onChange={handleImageSelect} />

            {imgPreview ? (
              <div style={s.previewBox}>
                <img src={imgPreview} alt="preview" style={s.previewImg} />
                <div style={s.previewBtns}>
                  <button style={s.clearBtn} onClick={() => { setImgPreview(null); setImgFile(null); }}>
                    ✕ Clear
                  </button>
                  <button style={{ ...s.askBtn, background: ci.color }}
                    onClick={sendImage} disabled={loading}>
                    {loading ? '⏳ Reading...' : '🔍 Explain This!'}
                  </button>
                </div>
              </div>
            ) : (
              <button style={{ ...s.uploadBtn, borderColor: ci.color, color: ci.color }}
                onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 32 }}>📸</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>Upload Homework / Textbook</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                  Tap to select a photo
                </div>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const s: any = {
  page:          { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6', overflow: 'hidden' },
  header:        { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  heroRow:       { display: 'flex', alignItems: 'center', gap: 10 },
  heroAvatar:    { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  heroName:      { color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 0.5 },
  heroLevel:     { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  headerRight:   { display: 'flex', alignItems: 'center', gap: 6 },
  xpPop:         { background: '#fbbf24', color: '#78350f', padding: '3px 10px', borderRadius: 20, fontWeight: 800, fontSize: 12 },
  xpBar:         { height: 4, background: '#e5e7eb', flexShrink: 0 },
  xpFill:        { height: '100%', transition: 'width 0.5s ease', borderRadius: '0 4px 4px 0' },
  recs:          { background: '#fff', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flexShrink: 0, borderBottom: '1px solid #f3f4f6' },
  recsLabel:     { fontSize: 11, color: '#9ca3af', fontWeight: 600 },
  recChip:       { border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
  messages:      { flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  userRow:       { display: 'flex', justifyContent: 'flex-end' },
  botRow:        { display: 'flex', alignItems: 'flex-start', gap: 8 },
  botAvatar:     { width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, marginTop: 2 },
  bubble:        { maxWidth: '78%', padding: '10px 14px', borderRadius: 16, wordBreak: 'break-word' },
  userBubble:    { background: '#7c3aed', color: '#fff', borderRadius: '16px 16px 4px 16px' },
  botBubble:     { background: '#fff', color: '#1f2937', borderRadius: '4px 16px 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  levelBanner:   { background: '#fef3c7', color: '#92400e', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginTop: 8 },
  badgeBanner:   { background: '#d1fae5', color: '#065f46', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginTop: 4 },
  dots:          { color: '#9ca3af', fontSize: 14 },
  inputArea:     { background: '#fff', borderTop: '1px solid #e5e7eb', padding: '10px 14px 14px', flexShrink: 0 },
  tabs:          { display: 'flex', gap: 6, marginBottom: 10 },
  tab:           { flex: 1, padding: '8px 4px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#6b7280' },
  textRow:       { display: 'flex', gap: 8 },
  textInput:     { flex: 1, padding: '11px 14px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 14, outline: 'none' },
  sendBtn:       { padding: '11px 16px', borderRadius: 12, color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer', fontWeight: 700 },
  voiceArea:     { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 8 },
  listeningDot:  { width: 14, height: 14, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' },
  listeningText: { color: '#ef4444', fontWeight: 700, fontSize: 14 },
  micIcon:       { fontSize: 40 },
  voiceHint:     { color: '#6b7280', fontSize: 13 },
  voiceBtn:      { padding: '11px 28px', borderRadius: 12, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  imageArea:     { padding: '4px 0' },
  uploadBtn:     { width: '100%', padding: '16px', borderRadius: 14, background: '#fafafa', border: '2px dashed', cursor: 'pointer', textAlign: 'center' },
  previewBox:    { display: 'flex', flexDirection: 'column', gap: 8 },
  previewImg:    { width: '100%', borderRadius: 10, maxHeight: 120, objectFit: 'cover' },
  previewBtns:   { display: 'flex', gap: 8 },
  clearBtn:      { flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#ef4444' },
  askBtn:     { flex: 2, padding: '10px', borderRadius: 10, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 },
  langToggle: { background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
};