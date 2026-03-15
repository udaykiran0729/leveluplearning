import { useEffect, useState } from 'react';
import { getProgress, getRecommendations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, TrendingUp, Trophy, Target } from 'lucide-react';
import { BG, t, theme } from '../styles/theme';

const ALL_BADGES = [
  { id:'First Question', emoji:'🏅', desc:'Asked your first question',  color:'#fbbf24' },
  { id:'Explorer Badge', emoji:'🌍', desc:'Reached Explorer level',     color:'#3b82f6' },
  { id:'Scholar Badge',  emoji:'📚', desc:'Reached Scholar level',      color:'#8b5cf6' },
  { id:'Champion Badge', emoji:'🏆', desc:'Reached Champion level',     color:'#ef4444' },
  { id:'Voice Master',   emoji:'🎤', desc:'Asked 5 voice questions',    color:'#10b981' },
  { id:'Bilingual Star', emoji:'🌐', desc:'Completed 10 sessions',      color:'#ec4899' },
];
const LEVELS: any    = { 1:'Beginner', 2:'Explorer', 3:'Scholar', 4:'Champion' };
const HERO_COLOR: any = { doraemon:'#3b82f6', chhota_bheem:'#f59e0b', dora:'#10b981', spiderman:'#ef4444' };
const BAR_COLORS      = ['#7c5cfc','#2dd4bf','#fbbf24','#f472b6'];

export default function Dashboard() {
  const [progress, setProgress] = useState<any>(null);
  const [recs,     setRecs]     = useState<string[]>([]);
  const [loading,  setLoading]  = useState(true);
  const navigate  = useNavigate();
  const userId    = localStorage.getItem('user_id')  || '1';
  const name      = localStorage.getItem('name')     || 'Friend';
  const character = localStorage.getItem('avatar')   || 'doraemon';
  const heroColor = HERO_COLOR[character] || '#7c5cfc';

  useEffect(()=>{
    Promise.all([getProgress(Number(userId)), getRecommendations(Number(userId))])
      .then(([p,r])=>{ setProgress(p.data); setRecs(r.data.recommendations||[]); })
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);/* eslint-disable-line react-hooks/exhaustive-deps */

  if (loading) return (
    <div style={{ ...t.page, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <BG />
      <div style={{ textAlign:'center', position:'relative', zIndex:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', border:`2px solid rgba(124,92,252,.3)`, borderTopColor:'#7c5cfc', animation:'spin .7s linear infinite', margin:'0 auto 12px' }} />
        <p style={{ fontSize:14, color:theme.muted }}>Loading your progress...</p>
      </div>
    </div>
  );

  if (!progress||progress.error) return (
    <div style={{ ...t.page, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <BG />
      <div style={{ textAlign:'center', position:'relative', zIndex:10, maxWidth:320 }}>
        <p style={{ fontSize:14, color:theme.muted, marginBottom:20 }}>Could not load progress. Make sure the backend is running.</p>
        <button style={{ ...t.btnGlass }} onClick={()=>navigate('/chat')}>
          <ArrowLeft size={14}/> Back to Chat
        </button>
      </div>
    </div>
  );

  const xpPct   = Math.min(100, Math.round((progress.points/(progress.next_level_at||100))*100));
  const earned  = new Set<string>(progress.badges||[]);
  const totalPts= progress.points;
  const chartData = totalPts>0 ? [
    { name:'Text',  value:Math.round(totalPts*0.55) },
    { name:'Voice', value:Math.round(totalPts*0.25) },
    { name:'Image', value:Math.round(totalPts*0.20) },
  ] : [];

  return (
    <div style={{ ...t.page, minHeight:'100vh' }}>
      <BG />

      {/* NAV — Lucide icons */}
      <nav style={t.nav}>
        <div style={t.logo}>
          <div style={t.logoBox}>🎮</div>
          <span style={t.logoText}>LevelUpLearning</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:13, color:theme.muted, fontWeight:500 }}>Hi, {name}</span>
          <button style={t.btnGlass} onClick={()=>navigate('/chat')}>
            <ArrowLeft size={14}/> Chat
          </button>
          <button style={t.btnGlass} onClick={()=>navigate('/parent')}>
            <Lock size={14}/> Parent
          </button>
        </div>
      </nav>

      <div style={s.body}>

        {/* Level card */}
        <div style={{ ...t.card, background:`linear-gradient(135deg,${heroColor}18,rgba(45,212,191,.06))`, border:`1px solid ${heroColor}28` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
            <div>
              <div style={{ display:'inline-block', padding:'4px 14px', borderRadius:20, background:heroColor, color:'#fff', fontSize:12, fontWeight:600, marginBottom:10 }}>
                Level {progress.level}
              </div>
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:30, color:theme.text }}>
                {progress.level_name || LEVELS[progress.level]}
              </div>
              <div style={{ fontSize:13, color:theme.muted, marginTop:3 }}>{progress.points} XP earned total</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <TrendingUp size={20} color={heroColor} />
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:600, color:heroColor }}>{xpPct}% to next level</span>
            <span style={{ fontSize:11, color:theme.muted }}>{progress.points_to_next} XP remaining</span>
          </div>
          <div style={{ height:10, background:'rgba(255,255,255,.08)', borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${xpPct}%`, background:`linear-gradient(90deg,${heroColor},#2dd4bf)`, borderRadius:6, transition:'width 1.2s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(240,237,255,.25)', marginTop:5 }}>
            <span>{progress.points} XP</span>
            <span>Next level at {progress.next_level_at} XP</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }} className="four-stat">
          {[
            { Icon:TrendingUp, label:'Total XP',      value:progress.points,               color:theme.gold    },
            { Icon:Trophy,     label:'Current Level',  value:progress.level,                color:heroColor     },
            { Icon:Trophy,     label:'Badges Earned',  value:progress.badges?.length||0,    color:theme.purple2 },
            { Icon:Target,     label:'XP to Next',     value:progress.points_to_next??'—',  color:theme.teal    },
          ].map(st=>(
            <div key={st.label} style={{ ...t.card, textAlign:'center', padding:'18px 12px' }}>
              <st.Icon size={18} color={st.color} style={{ margin:'0 auto 8px' }} />
              <div style={{ fontFamily:"'Fredoka One',cursive", fontSize:22, color:st.color }}>{st.value}</div>
              <div style={{ fontSize:10, fontWeight:600, color:theme.muted, textTransform:'uppercase', letterSpacing:'.5px', marginTop:3 }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Badges */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }} className="two-col">

          <div style={t.card}>
            <div style={s.secHead}>
              <span style={s.secTitle}>XP Breakdown</span>
              <span style={{ fontSize:11, color:theme.muted }}>{totalPts} total</span>
            </div>
            {totalPts>0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{top:8,right:0,left:-28,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                  <XAxis dataKey="name" tick={{fontSize:11,fill:'rgba(240,237,255,.4)'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10,fill:'rgba(240,237,255,.3)'}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'rgba(15,23,42,.95)',border:'1px solid rgba(124,92,252,.3)',borderRadius:10,color:'#f0edff',fontSize:12}} cursor={{fill:'rgba(124,92,252,.08)'}} formatter={(v:any)=>[`${v} XP`,'']}/>
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {chartData.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%BAR_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:160, textAlign:'center', gap:10 }}>
                <Target size={24} color='rgba(255,255,255,.2)'/>
                <p style={{ fontSize:13, color:theme.muted }}>Ask your first question to start building your XP chart.</p>
                <button style={t.btnGlass} onClick={()=>navigate('/chat')}>Go to Chat →</button>
              </div>
            )}
          </div>

          <div style={t.card}>
            <div style={s.secHead}>
              <span style={s.secTitle}>Badges</span>
              <span style={{ ...t.pill, ...t.pillPurple }}>{earned.size}/{ALL_BADGES.length}</span>
            </div>
            {earned.size===0 && (
              <p style={{ fontSize:12, color:theme.muted, marginBottom:12, padding:'8px 10px', background:'rgba(255,255,255,.03)', borderRadius:8 }}>
                Ask your first question to earn the First Question badge.
              </p>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }} className="badge-grid-3">
              {ALL_BADGES.map(b=>{
                const on=earned.has(b.id);
                return (
                  <div key={b.id} style={{ background:on?`${b.color}12`:theme.glass, border:`1px solid ${on?b.color+'33':theme.gb}`, borderRadius:12, padding:'12px 8px', textAlign:'center', position:'relative' }} title={b.desc}>
                    {on && <div style={{ position:'absolute', top:5, right:5, width:6, height:6, borderRadius:'50%', background:b.color }} />}
                    <div style={{ fontSize:24, filter:on?'none':'grayscale(1) opacity(.25)', marginBottom:5 }}>{b.emoji}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:on?b.color:theme.muted }}>{b.id.split(' ')[0]}</div>
                    <div style={{ fontSize:9, color:'rgba(240,237,255,.25)', marginTop:2 }}>{b.desc}</div>
                    {!on && <div style={{ fontSize:9, color:'rgba(255,255,255,.15)', marginTop:4, fontWeight:600 }}>LOCKED</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ML Recs */}
        <div style={{ ...t.card, background:'linear-gradient(135deg,rgba(124,92,252,.08),rgba(45,212,191,.04))' }}>
          <div style={s.secHead}>
            <span style={s.secTitle}>ML Recommended Topics</span>
            <span style={{ fontSize:11, color:theme.muted }}>Based on your learning history</span>
          </div>
          {recs.length>0 ? (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {recs.map((r,i)=>(
                <button key={r} style={{ padding:'9px 18px', borderRadius:20, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", background:BAR_COLORS[i%BAR_COLORS.length] }}
                  onClick={()=>navigate('/chat')}>{r} →</button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize:12, color:theme.muted }}>Ask more questions to generate personalised topic recommendations.</p>
          )}
          <p style={{ fontSize:10, color:'rgba(240,237,255,.2)', marginTop:12, fontStyle:'italic' }}>
            Powered by frequency analysis — updates as you learn more
          </p>
        </div>

        {/* Roadmap */}
        <div style={t.card}>
          <div style={s.secHead}><span style={s.secTitle}>Level Roadmap</span></div>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'12px 0' }}>
            {[{level:1,name:'Beginner',xp:0},{level:2,name:'Explorer',xp:100},{level:3,name:'Scholar',xp:300},{level:4,name:'Champion',xp:600}].map((l,i)=>{
              const done=progress.level>l.level, cur=progress.level===l.level;
              return (
                <div key={l.level} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:done||cur?heroColor:'rgba(255,255,255,.07)', border:`2px solid ${done||cur?heroColor:'rgba(255,255,255,.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:600, fontSize:13, boxShadow:cur?`0 0 0 6px ${heroColor}22`:undefined, zIndex:1, transition:'all .3s' }}>
                    {done?'✓':l.level}
                  </div>
                  {i<3 && <div style={{ position:'absolute', top:21, left:'55%', right:'-45%', height:2, background:done?heroColor:'rgba(255,255,255,.07)', zIndex:0 }} />}
                  <div style={{ marginTop:10, textAlign:'center' }}>
                    <div style={{ fontSize:12, fontWeight:cur?600:400, color:cur?heroColor:theme.muted }}>{l.name}</div>
                    <div style={{ fontSize:10, color:'rgba(240,237,255,.25)', marginTop:1 }}>{l.xp} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const s: any = {
  body:    { position:'relative', zIndex:10, maxWidth:780, margin:'0 auto', padding:'24px 20px 60px', display:'flex', flexDirection:'column', gap:12 },
  secHead: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  secTitle:{ fontFamily:"'Fredoka One',cursive", fontSize:16, color:theme.text },
};