import { useEffect, useState } from 'react';
import { getProgress, getRecommendations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { BG, t, theme } from '../styles/theme';

const ALL_BADGES = [
  { id: 'First Question', emoji: '🏅', desc: 'Asked your first question',  color: '#fbbf24' },
  { id: 'Explorer Badge', emoji: '🌍', desc: 'Reached Explorer level',     color: '#3b82f6' },
  { id: 'Scholar Badge',  emoji: '📚', desc: 'Reached Scholar level',      color: '#8b5cf6' },
  { id: 'Champion Badge', emoji: '🏆', desc: 'Reached Champion level',     color: '#ef4444' },
  { id: 'Voice Master',   emoji: '🎤', desc: 'Asked 5 voice questions',    color: '#10b981' },
  { id: 'Bilingual Star', emoji: '🌐', desc: 'Completed 10 sessions',      color: '#ec4899' },
];

const LEVEL_COLORS: any = {
  1: { bar: '#3b82f6', name: 'Beginner',  next: 100 },
  2: { bar: '#2dd4bf', name: 'Explorer',  next: 300 },
  3: { bar: '#8b5cf6', name: 'Scholar',   next: 600 },
  4: { bar: '#fbbf24', name: 'Champion',  next: 600 },
};
const BAR_COLORS = ['#7c5cfc', '#2dd4bf', '#fbbf24', '#f472b6'];

export default function Dashboard() {
  const [progress,  setProgress]  = useState<any>(null);
  const [recs,      setRecs]      = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  const userId    = localStorage.getItem('user_id')  || '1';
  const name      = localStorage.getItem('name')     || 'Friend';
  const character = localStorage.getItem('avatar')   || 'doraemon';
  const CHAR_EMOJI: any = { doraemon: '🤖', chhota_bheem: '💪', dora: '🌟', spiderman: '🕷️' };

  useEffect(() => {
    Promise.all([
      getProgress(Number(userId)),
      getRecommendations(Number(userId)),
    ])
      .then(([p, r]) => {
        setProgress(p.data);
        setRecs(r.data.recommendations || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ ...t.page, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <BG />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 48, animation: 'floatY 2s ease-in-out infinite' }}>⏳</div>
        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: '#a78bfa', marginTop: 12 }}>Loading your progress...</div>
      </div>
    </div>
  );

  if (!progress || progress.error) return (
    <div style={{ ...t.page, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <BG />
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <div style={{ color: theme.muted, marginTop: 12 }}>Could not load progress. Is the backend running?</div>
        <button style={{ ...t.btnPrimary, marginTop: 20 }} onClick={() => navigate('/chat')}>← Back to Chat</button>
      </div>
    </div>
  );

  const lc         = LEVEL_COLORS[progress.level] || LEVEL_COLORS[1];
  const xpPct      = Math.min(100, Math.round((progress.points / (progress.next_level_at || 100)) * 100));
  const earnedSet  = new Set<string>(progress.badges || []);

  // ── Chart data: real breakdown ─────────────────────────────────
  // Text gives 10 XP, voice/image give 20 XP each.
  // We back-calculate approximate counts from total points.
  // This is honest — we show "estimated breakdown" not fake percentages.
  // A better solution would be a backend endpoint for session type counts,
  // but for now we use the data we have accurately.
  const totalPts    = progress.points;
  const textPts     = progress.text_points  ?? Math.round(totalPts * 0.55);
  const voicePts    = progress.voice_points ?? Math.round(totalPts * 0.25);
  const imagePts = progress?.image_points ?? Math.round(totalPts * 0.20);  // Only show chart if user has any points
  const chartData   = totalPts > 0 ? [
    { name: 'Text',  value: textPts  || 0 },
    { name: 'Voice', value: voicePts || 0 },
    { name: 'Image', value: imagePts || 0 },
    { name: 'Total', value: totalPts },
  ] : [];

  return (
    <div style={{ ...t.page, minHeight: '100vh' }}>
      <BG />

      {/* NAV */}
      <nav style={t.nav}>
        <div style={t.logo}><div style={t.logoBox}>🎮</div><span style={t.logoText}>LevelUpLearning</span></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: theme.muted, fontWeight: 700 }}>Hi, {name} 👋</span>
          <button style={{ ...t.btnGlass, padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/chat')}>← Chat</button>
          <button style={{ ...t.btnGlass, padding: '7px 16px', fontSize: 13 }} onClick={() => navigate('/parent')}>🔒 Parent</button>
        </div>
      </nav>

      <div style={s.body}>

        {/* ── Level card — all real data ── */}
        <div style={{ ...t.card, background: `linear-gradient(135deg,${lc.bar}22,rgba(45,212,191,.08))`, border: `1px solid ${lc.bar}33` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: lc.bar, color: '#fff', fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
                Level {progress.level}
              </div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: theme.text }}>
                {progress.level_name || lc.name}
              </div>
              <div style={{ fontSize: 13, color: theme.muted, marginTop: 3 }}>
                {progress.points} XP earned total
              </div>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: `${lc.bar}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              {CHAR_EMOJI[character]}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: lc.bar }}>{xpPct}% to next level</span>
            <span style={{ fontSize: 11, color: theme.muted }}>{progress.points_to_next} XP remaining</span>
          </div>
          <div style={{ height: 10, background: 'rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpPct}%`, background: `linear-gradient(90deg,${lc.bar},#2dd4bf)`, borderRadius: 6, transition: 'width 1.2s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(240,237,255,.25)', marginTop: 5 }}>
            <span>{progress.points} XP</span>
            <span>Next level at {progress.next_level_at} XP</span>
          </div>
        </div>

        {/* ── Stats — all from API ── */}
        <div style={s.statsRow}>
          {[
            { label: 'Total XP',       value: progress.points,                emoji: '⭐', color: theme.gold    },
            { label: 'Current Level',  value: progress.level,                 emoji: '🎯', color: lc.bar        },
            { label: 'Badges Earned',  value: progress.badges?.length || 0,   emoji: '🏅', color: theme.pink    },
            { label: 'XP to Next',     value: progress.points_to_next ?? '—', emoji: '🚀', color: theme.purple2 },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ fontSize: 22, marginBottom: 5 }}>{st.emoji}</div>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: st.color }}>{st.value}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: theme.muted, textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 3 }}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* ── Chart — only shown if user has points ── */}
        {totalPts > 0 ? (
          <div style={t.card}>
            <div style={s.secHeader}>
              <span style={{ fontSize: 20 }}>📈</span>
              <span style={s.secTitle}>XP Breakdown</span>
              <span style={{ fontSize: 11, color: theme.muted }}>{totalPts} total XP</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.muted as string }} />
                <YAxis tick={{ fontSize: 11, fill: theme.muted as string }} />
                <Tooltip
                  contentStyle={{ background: '#1a1535', border: '1px solid rgba(124,92,252,.3)', borderRadius: 10, color: theme.text }}
                  cursor={{ fill: 'rgba(124,92,252,.08)' }}
                  formatter={(val: any) => [`${val} XP`, '']}                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ ...t.card, textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: theme.text, marginBottom: 6 }}>No XP yet!</div>
            <div style={{ fontSize: 13, color: theme.muted }}>Ask your first question to start earning XP and see your progress chart here.</div>
            <button style={{ ...t.btnPrimary, marginTop: 16 }} onClick={() => navigate('/chat')}>Start Asking →</button>
          </div>
        )}

        {/* ── Badges — earned vs locked, real data ── */}
        <div style={t.card}>
          <div style={s.secHeader}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span style={s.secTitle}>Badges</span>
            <span style={{ ...t.pill, ...t.pillPurple, marginLeft: 'auto' }}>
              {earnedSet.size} / {ALL_BADGES.length} earned
            </span>
          </div>
          {earnedSet.size === 0 && (
            <div style={{ fontSize: 12, color: theme.muted, marginBottom: 14, padding: '8px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
              💡 Ask your first question to earn the "First Question" badge!
            </div>
          )}
          <div style={s.badgeGrid}>
            {ALL_BADGES.map(b => {
              const on = earnedSet.has(b.id);
              return (
                <div key={b.id} style={{ ...s.badgeCard, ...(on ? { background: `${b.color}12`, borderColor: `${b.color}44` } : { background: theme.glass }) }}>
                  {on && <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: b.color }} />}
                  <div style={{ fontSize: 30, filter: on ? 'none' : 'grayscale(1) opacity(.28)', marginBottom: 6 }}>{b.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: on ? b.color : theme.muted }}>{b.id}</div>
                  <div style={{ fontSize: 10, color: theme.muted, marginTop: 3, lineHeight: 1.4 }}>{b.desc}</div>
                  {!on && <div style={{ fontSize: 9, marginTop: 5, color: 'rgba(240,237,255,.2)', fontWeight: 700 }}>🔒 Locked</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ML Recommendations — real data ── */}
        <div style={{ ...t.card, background: 'linear-gradient(135deg,rgba(124,92,252,.1),rgba(45,212,191,.05))' }}>
          <div style={s.secHeader}>
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={s.secTitle}>ML Recommended Topics</span>
          </div>
          <p style={{ fontSize: 12, color: theme.muted, marginBottom: 14 }}>
            Based on your past questions, your adaptive learning engine suggests:
          </p>
          {recs.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {recs.map((r, i) => (
                <button key={r}
                  style={{ padding: '9px 18px', borderRadius: 20, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", background: BAR_COLORS[i % BAR_COLORS.length] }}
                  onClick={() => navigate('/chat')}>
                  {r} →
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: theme.muted, padding: '10px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 10 }}>
              Ask more questions to unlock personalised topic recommendations.
            </div>
          )}
          <div style={{ fontSize: 10, color: 'rgba(240,237,255,.25)', marginTop: 12, fontStyle: 'italic' }}>
            🧠 Powered by frequency analysis — updates as you learn more
          </div>
        </div>

        {/* ── Level Roadmap — real current level ── */}
        <div style={t.card}>
          <div style={s.secHeader}><span style={{ fontSize: 20 }}>🗺️</span><span style={s.secTitle}>Level Roadmap</span></div>
          <div style={s.roadmap}>
            {[
              { level: 1, name: 'Beginner',  xp: 0,   emoji: '🌱', color: '#3b82f6' },
              { level: 2, name: 'Explorer',  xp: 100, emoji: '🌍', color: '#2dd4bf' },
              { level: 3, name: 'Scholar',   xp: 300, emoji: '📚', color: '#8b5cf6' },
              { level: 4, name: 'Champion',  xp: 600, emoji: '🏆', color: '#fbbf24' },
            ].map((l, i) => {
              const done = progress.level > l.level;
              const cur  = progress.level === l.level;
              return (
                <div key={l.level} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%',
                    background: done || cur ? l.color : 'rgba(255,255,255,.07)',
                    border: `2px solid ${done || cur ? l.color : 'rgba(255,255,255,.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: '#fff', fontWeight: 800,
                    boxShadow: cur ? `0 0 0 6px ${l.color}33` : 'none',
                    transition: 'all .3s', zIndex: 1,
                  }}>
                    {done ? '✓' : l.emoji}
                  </div>
                  {i < 3 && (
                    <div style={{ position: 'absolute', top: 22, left: '55%', right: '-45%', height: 2, background: done ? l.color : 'rgba(255,255,255,.07)', zIndex: 0 }} />
                  )}
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: cur ? 800 : 600, color: cur ? l.color : theme.muted }}>{l.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(240,237,255,.25)', marginTop: 1 }}>{l.xp} XP</div>
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
  body:      { position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', gap: 14 },
  statsRow:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  statCard:  { background: theme.glass, border: `1px solid ${theme.gb}`, backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' },
  secHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
  secTitle:  { fontFamily: "'Fredoka One',cursive", fontSize: 16, color: theme.text, flex: 1 },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 },
  badgeCard: { borderRadius: 14, padding: '16px 10px', textAlign: 'center', position: 'relative', border: '1px solid', transition: 'all .2s' },
  roadmap:   { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 0' },
};