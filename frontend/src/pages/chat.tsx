import { useState, useRef, useEffect } from 'react';
import { askVoiceCharacter, askImage, getRecommendations, getProgress } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Lock, Languages, Send, Mic, MicOff, ImageIcon, Type, X, Upload } from 'lucide-react';
import { BG, t, theme } from '../styles/theme';

type Msg = { role:'user'|'assistant'; text:string; image?:string; levelUp?:boolean; newBadge?:string; };

const CHAR: any = {
  doraemon:     { emoji:'🤖', color:'#3b82f6', bg:'rgba(59,130,246,.15)'  },
  chhota_bheem: { emoji:'💪', color:'#f59e0b', bg:'rgba(245,158,11,.15)'  },
  dora:         { emoji:'🌟', color:'#10b981', bg:'rgba(16,185,129,.15)'  },
  spiderman:    { emoji:'🕷️', color:'#ef4444', bg:'rgba(239,68,68,.15)'   },
};
const LEVEL: any = { 1:'Beginner', 2:'Explorer', 3:'Scholar', 4:'Champion' };
// NEXT level thresholds are read from API (next_level_at) — not used as constant
const BADGES_DEF = [
  { id:'First Question', e:'🏅', c:'#fbbf24' },
  { id:'Explorer Badge', e:'🌍', c:'#3b82f6' },
  { id:'Scholar Badge',  e:'📚', c:'#8b5cf6' },
  { id:'Champion Badge', e:'🏆', c:'#ef4444' },
  { id:'Voice Master',   e:'🎤', c:'#10b981' },
  { id:'Bilingual Star', e:'🌐', c:'#ec4899' },
];
const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function Chat() {
  const [msgs,      setMsgs]      = useState<Msg[]>([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState<'text'|'voice'|'image'>('text');
  const [listening, setListen]    = useState(false);
  const [points,    setPoints]    = useState(0);
  const [level,     setLevel]     = useState(1);
  const [nextAt,    setNextAt]    = useState(100);
  const [badges,    setBadges]    = useState<string[]>([]);
  const [recs,      setRecs]      = useState<string[]>([]);
  const [xpPop,     setXpPop]     = useState('');
  const [imgPrev,   setImgPrev]   = useState<string|null>(null);
  const [imgFile,   setImgFile]   = useState<File|null>(null);
  const [panelLoad, setPanelLoad] = useState(true);

  const fileRef   = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recogRef  = useRef<any>(null);
  const navigate  = useNavigate();

  const userId    = localStorage.getItem('user_id')  || '1';
  const character = localStorage.getItem('avatar')   || 'doraemon';
  const name      = localStorage.getItem('name')     || 'Friend';
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');
  const ci        = CHAR[character] || CHAR.doraemon;
  const xpPct     = Math.min(100, Math.round((points / nextAt) * 100));
  const lc        = ci.color;

  useEffect(() => {
    setMsgs([{ role:'assistant', text: language === 'hindi'
      ? `नमस्ते ${name}! मैं ${character.replace(/_/g,' ')} हूँ! मुझसे कुछ भी पूछो — टाइप करो, बोलो, या होमवर्क की फोटो भेजो! 🎉`
      : `Hi ${name}! I'm ${character.replace(/_/g,' ')}! Ask me anything — type, speak, or send a photo of your homework! 🎉`
    }]);
    getProgress(Number(userId))
      .then(r => { if (!r.data.error) { setPoints(r.data.points); setLevel(r.data.level); setNextAt(r.data.next_level_at); setBadges(r.data.badges||[]); } })
      .catch(()=>{}).finally(()=>setPanelLoad(false));
    getRecommendations(Number(userId)).then(r=>setRecs(r.data.recommendations||[])).catch(()=>{});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-set welcome message when language changes
  useEffect(() => {
    setMsgs(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role:'assistant', text: language === 'hindi'
          ? `नमस्ते ${name}! मैं ${character.replace(/_/g,' ')} हूँ! मुझसे कुछ भी पूछो! 🎉`
          : `Hi ${name}! I'm ${character.replace(/_/g,' ')}! Ask me anything! 🎉`
        }];
      }
      return prev; // don't reset if conversation already started
    });
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyRes = (d: any, userMsg: Msg) => {
    setMsgs(m=>[...m, userMsg, { role:'assistant', text:d.answer, levelUp:d.level_up, newBadge:d.new_badge }]);
    if (typeof d.points==='number') setPoints(d.points);
    if (typeof d.level==='number')  setLevel(d.level);
    if (d.next_level_at) setNextAt(d.next_level_at);
    if (Array.isArray(d.badges)) setBadges(d.badges);
    setXpPop(`+${d.points_earned} XP`);
    setTimeout(()=>setXpPop(''), 2000);
    if (d.audio_base64) { try { new Audio(`data:audio/mp3;base64,${d.audio_base64}`).play(); } catch{} }
  };

  const sendText = async (q?: string) => {
    const question=(q||input).trim(); if (!question) return;
    setInput(''); setLoading(true);
    try { const r=await askVoiceCharacter({user_id:userId,question,character,language}); applyRes(r.data,{role:'user',text:question}); }
    catch { setMsgs(m=>[...m,{role:'user',text:question},{role:'assistant',text:'Unable to reach the server. Please check your backend connection.'}]); }
    setLoading(false);
  };

  const startVoice = () => {
    if (!SpeechRec) { alert('Voice input requires Chrome browser.'); return; }
    const r=new SpeechRec(); r.lang=language==='hindi'?'hi-IN':'en-IN';
    recogRef.current=r;
    r.onstart=()=>setListen(true); r.onend=()=>setListen(false);
    r.onerror=()=>{ setListen(false); };
    r.onresult=(e:any)=>{ const tx=e.results[0][0].transcript; setInput(tx); sendText(tx); };
    r.start();
  };

  const sendImage = async () => {
    if (!imgFile) return; setLoading(true);
    try { const r=await askImage({user_id:userId,language,character},imgFile); applyRes(r.data,{role:'user',text:imgFile.name,image:imgPrev||undefined}); }
    catch { setMsgs(m=>[...m,{role:'user',text:imgFile.name},{role:'assistant',text:'Could not read image. Try a clearer photo with visible text.'}]); }
    setImgPrev(null); setImgFile(null); setLoading(false);
  };

  return (
    <div style={{ ...t.page, height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <BG />

      {/* ── NAV — Lucide icons only ── */}
      <nav style={{ ...t.nav, flexShrink:0 }}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* XP capsule */}
          <div style={s.xpCapsule}>
            <span style={{ fontSize:12, fontWeight:600, color:theme.gold }}>{points} XP</span>
            <div style={s.xpMiniTrack}>
              <div style={{ height:'100%', width:`${xpPct}%`, background:lc, borderRadius:2, transition:'width .6s' }} />
            </div>
            <span style={{ fontSize:11, color:theme.muted, fontWeight:500 }}>{LEVEL[level]}</span>
          </div>
          {/* XP pop */}
          {xpPop && <div style={s.xpFloat}>{xpPop}</div>}
          {/* Language toggle — Lucide icon */}
          <button style={t.btnGlass}
            onClick={()=>{
              const nl = language === 'english' ? 'hindi' : 'english';
              localStorage.setItem('language', nl);
              setLanguage(nl);
            }}>
            <Languages size={14} />
            <span>{language === 'english' ? 'EN' : 'HI'}</span>
          </button>
          {/* Dashboard — Lucide icon */}
          <button style={t.btnGlass} onClick={()=>navigate('/dashboard')}>
            <BarChart2 size={14} />
            <span className="hide-mob">Dashboard</span>
          </button>
          {/* Parent — Lucide icon */}
          <button style={t.btnGlass} onClick={()=>navigate('/parent')}>
            <Lock size={14} />
            <span className="hide-mob">Parent</span>
          </button>
        </div>
      </nav>

      {/* Thin XP bar */}
      <div style={{ height:3, background:'rgba(255,255,255,.06)', flexShrink:0 }}>
        <div style={{ height:'100%', width:`${xpPct}%`, background:`linear-gradient(90deg,${lc},#2dd4bf)`, transition:'width .6s' }} />
      </div>

      {/* Layout */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 260px', overflow:'hidden' }} className="chat-grid">

        {/* Chat */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Recs */}
          {recs.length>0 && (
            <div style={s.recsStrip}>
              <span style={{ fontSize:11, color:theme.muted, fontWeight:500, flexShrink:0 }}>Try:</span>
              {recs.map(r=>(
                <button key={r} style={{ ...s.recChip, background:`${ci.color}18`, border:`1px solid ${ci.color}30`, color:ci.color }}
                  onClick={()=>sendText(r)}>{r}</button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={s.messages}>
            {msgs.map((m,i)=>(
              <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start', gap:8, alignItems:'flex-end' }}>
                {m.role==='assistant' && (
                  <div style={{ ...s.av, background:ci.bg, border:`1px solid ${ci.color}44` }}>{ci.emoji}</div>
                )}
                <div style={{ ...s.bubble, ...(m.role==='user' ? { ...s.bubbleUser, background:`linear-gradient(135deg,${ci.color},${ci.color}99)` } : s.bubbleBot) }}>
                  {m.image && <img src={m.image} alt="" style={{ width:'100%', borderRadius:8, marginBottom:6, maxHeight:140, objectFit:'cover' }} />}
                  <span style={{ fontSize:14, lineHeight:1.65 }}>{m.text}</span>
                  {m.levelUp  && <div style={s.toastLevel}>🎉 Level Up — you are now {LEVEL[level]}!</div>}
                  {m.newBadge && <div style={s.toastBadge}>🏆 Badge unlocked: {m.newBadge}</div>}
                </div>
                {m.role==='user' && <div style={{ ...s.av, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}>😊</div>}
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <div style={{ ...s.av, background:ci.bg, border:`1px solid ${ci.color}44` }}>{ci.emoji}</div>
                <div style={s.bubbleBot}>
                  <div style={{ display:'flex', gap:5 }}>
                    {[0,.2,.4].map(d=>(
                      <div key={d} style={{ width:6, height:6, borderRadius:'50%', background:ci.color, opacity:.7, animation:`typeBounce 1.2s ${d}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input zone */}
          <div style={s.inputZone}>
            {/* Tabs — Lucide icons */}
            <div style={s.inputTabs}>
              {([
                { id:'text',  Icon:Type,      label:'Text'  },
                { id:'voice', Icon:Mic,       label:'Voice' },
                { id:'image', Icon:ImageIcon, label:'Image' },
              ] as any[]).map(tb=>(
                <button key={tb.id}
                  style={{ ...s.inputTab, ...(tab===tb.id ? { background:`${ci.color}20`, borderColor:ci.color, color:theme.text } : {}) }}
                  onClick={()=>setTab(tb.id)}>
                  <tb.Icon size={13} />
                  {tb.label}
                </button>
              ))}
            </div>

            {tab==='text' && (
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...t.input, flex:1, borderRadius:14 }}
                  placeholder={`Ask ${character.replace(/_/g,' ')} anything...`}
                  value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&!loading&&sendText()} disabled={loading} />
                <button style={{ ...s.sendBtn, background:`linear-gradient(135deg,${ci.color},${ci.color}88)` }}
                  onClick={()=>sendText()} disabled={loading}>
                  <Send size={16} color="#fff" />
                </button>
              </div>
            )}

            {tab==='voice' && (
              <div style={s.voiceZone}>
                <button
                  style={{ ...s.micBtn, ...(listening ? s.micActive : { borderColor:ci.color, color:ci.color }) }}
                  onClick={listening?()=>{recogRef.current?.stop();setListen(false);}:startVoice}>
                  {listening ? <MicOff size={22}/> : <Mic size={22}/>}
                </button>
                <p style={{ fontSize:13, color:listening?theme.red:theme.muted, fontWeight:listening?600:400 }}>
                  {listening ? 'Listening — click to stop' : (language==='hindi'?'Hindi mein bolo':'Tap and speak')}
                </p>
              </div>
            )}

            {tab==='image' && (
              <div>
                <input type="file" ref={fileRef} accept="image/*" style={{ display:'none' }}
                  onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; setImgFile(f); const r=new FileReader(); r.onload=ev=>setImgPrev(ev.target?.result as string); r.readAsDataURL(f); }} />
                {imgPrev ? (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <img src={imgPrev} alt="" style={{ height:56, width:80, objectFit:'cover', borderRadius:8, border:`1px solid ${ci.color}44` }} />
                    <div style={{ flex:1, fontSize:12, color:theme.muted }}>{imgFile?.name}</div>
                    <button style={{ ...t.btnGlass, padding:'6px 8px' }} onClick={()=>{setImgPrev(null);setImgFile(null);}}>
                      <X size={14}/>
                    </button>
                    <button style={{ ...t.btnPrimary, padding:'9px 18px', fontSize:13, background:`linear-gradient(135deg,${ci.color},${ci.color}88)` }}
                      onClick={sendImage} disabled={loading}>
                      {loading?'Reading...':'Explain →'}
                    </button>
                  </div>
                ) : (
                  <button style={{ ...s.uploadBtn, borderColor:ci.color, color:ci.color }}
                    onClick={()=>fileRef.current?.click()}>
                    <Upload size={18} />
                    <span style={{ fontSize:13, fontWeight:500 }}>Upload a homework or textbook photo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={s.rightPanel} className="hide-mob">
          {panelLoad ? (
            <div style={{ textAlign:'center', padding:'40px 0', fontSize:12, color:theme.muted }}>Loading...</div>
          ) : (
            <>
              {/* Level */}
              <div style={s.panelSection}>
                <p style={s.panelLabel}>Progress</p>
                <div style={{ background:`linear-gradient(135deg,${lc}20,rgba(45,212,191,.06))`, border:`1px solid ${lc}30`, borderRadius:14, padding:'14px 12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontFamily:"'Fredoka One',cursive", fontSize:18, color:theme.text }}>{LEVEL[level]}</span>
                    <span style={{ ...t.pill, ...t.pillPurple, padding:'2px 10px', fontSize:11 }}>Lv {level}</span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,.08)', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
                    <div style={{ height:'100%', width:`${xpPct}%`, background:lc, borderRadius:3, transition:'width .8s' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:theme.muted }}>
                    <span>{points} XP</span>
                    <span>{nextAt - points} to next</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div style={s.panelSection}>
                <p style={s.panelLabel}>Badges · {badges.length}/{BADGES_DEF.length}</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                  {BADGES_DEF.map(b=>{
                    const on=badges.includes(b.id);
                    return (
                      <div key={b.id} style={{ background:on?`${b.c}12`:theme.glass, border:`1px solid ${on?b.c+'33':theme.gb}`, borderRadius:10, padding:'8px 4px', textAlign:'center' }} title={b.id}>
                        <div style={{ fontSize:18, filter:on?'none':'grayscale(1) opacity(.28)' }}>{b.e}</div>
                        <div style={{ fontSize:8, fontWeight:600, color:on?b.c:theme.muted, marginTop:3 }}>{b.id.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ML Recs */}
              <div style={s.panelSection}>
                <p style={s.panelLabel}>ML Suggestions</p>
                {(recs.length>0?recs:['Science','Maths','History']).map(r=>(
                  <button key={r} style={s.recRow} onClick={()=>sendText(r)}>
                    <span style={{ fontSize:12, color:theme.muted, fontWeight:500 }}>{r}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,.2)' }}>→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s: any = {
  xpCapsule:   { display:'flex', alignItems:'center', gap:8, padding:'6px 14px', background:theme.glass, border:`1px solid ${theme.gb}`, borderRadius:40 },
  xpMiniTrack: { width:60, height:4, background:'rgba(255,255,255,.1)', borderRadius:2, overflow:'hidden' },
  xpFloat:     { fontSize:11, fontWeight:700, color:theme.text, padding:'3px 10px', background:theme.glass, border:`1px solid ${theme.gb}`, borderRadius:20, animation:'xpPop 2s ease forwards', whiteSpace:'nowrap' },
  recsStrip:   { background:'rgba(6,4,18,.5)', backdropFilter:'blur(12px)', borderBottom:`1px solid ${theme.gb}`, padding:'8px 16px', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', flexShrink:0 },
  recChip:     { border:'none', borderRadius:20, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600, fontFamily:"'DM Sans',sans-serif" },
  messages:    { flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:12 },
  av:          { width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 },
  bubble:      { maxWidth:'72%', padding:'10px 14px', borderRadius:16, wordBreak:'break-word' },
  bubbleBot:   { background:theme.glass, border:`1px solid ${theme.gb}`, backdropFilter:'blur(12px)', color:theme.text, borderBottomLeftRadius:4 },
  bubbleUser:  { color:'#fff', borderBottomRightRadius:4, boxShadow:'0 4px 16px rgba(0,0,0,.3)' },
  toastLevel:  { background:'rgba(251,191,36,.12)', border:'1px solid rgba(251,191,36,.25)', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, color:theme.gold, marginTop:8 },
  toastBadge:  { background:'rgba(45,212,191,.1)', border:'1px solid rgba(45,212,191,.2)', borderRadius:8, padding:'5px 10px', fontSize:11, fontWeight:600, color:theme.teal, marginTop:5 },
  inputZone:   { background:'rgba(6,4,18,.6)', backdropFilter:'blur(16px)', borderTop:`1px solid ${theme.gb}`, padding:'10px 14px 16px', flexShrink:0 },
  inputTabs:   { display:'flex', gap:6, marginBottom:10 },
  inputTab:    { display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:10, border:`1.5px solid ${theme.gb}`, background:theme.glass, cursor:'pointer', fontSize:12, fontWeight:500, color:theme.muted, fontFamily:"'DM Sans',sans-serif" },
  sendBtn:     { width:44, height:44, borderRadius:12, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  voiceZone:   { display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0', gap:8 },
  micBtn:      { width:56, height:56, borderRadius:'50%', border:'1.5px solid', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' },
  micActive:   { borderColor:theme.red, color:theme.red, animation:'micPulse 1.5s infinite' },
  uploadBtn:   { width:'100%', padding:'14px', borderRadius:14, background:'rgba(255,255,255,.03)', border:'2px dashed', cursor:'pointer', textAlign:'center', fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:10 },
  rightPanel:  { background:'rgba(6,4,18,.5)', backdropFilter:'blur(20px)', borderLeft:`1px solid ${theme.gb}`, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column' },
  panelSection:{ marginBottom:18 },
  panelLabel:  { fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(240,237,255,.3)', marginBottom:8 },
  recRow:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', borderRadius:8, border:`1px solid ${theme.gb}`, background:'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", width:'100%', marginBottom:5 },
};