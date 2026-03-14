import { useEffect, useState } from 'react';
import { getProgress, getRecommendations } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const ALL_BADGES = [
  { id: 'First Question', emoji: '🏅', desc: 'Asked first question',   color: '#f59e0b' },
  { id: 'Explorer Badge', emoji: '🌍', desc: 'Reached Explorer level', color: '#3b82f6' },
  { id: 'Scholar Badge',  emoji: '📚', desc: 'Reached Scholar level',  color: '#8b5cf6' },
  { id: 'Champion Badge', emoji: '🏆', desc: 'Reached Champion level', color: '#ef4444' },
  { id: 'Voice Master',   emoji: '🎤', desc: 'Asked 5 voice questions',color: '#10b981' },
  { id: 'Bilingual Star', emoji: '🌐', desc: '10 sessions completed',  color: '#ec4899' },
];

const LEVEL_COLORS: any = {
  1: { bg: '#eff6ff', text: '#1d4ed8', bar: '#3b82f6', name: 'Beginner'  },
  2: { bg: '#ecfdf5', text: '#065f46', bar: '#10b981', name: 'Explorer'  },
  3: { bg: '#faf5ff', text: '#6b21a8', bar: '#8b5cf6', name: 'Scholar'   },
  4: { bg: '#fff7ed', text: '#9a3412', bar: '#f97316', name: 'Champion'  },
};

export default function Dashboard() {
  const [progress,  setProgress]  = useState<any>(null);
  const [recs,      setRecs]      = useState<string[]>([]);
  const [loading,   setLoading]   = useState(true);
  const navigate                  = useNavigate();

  const userId    = localStorage.getItem('user_id')  || '1';
  const name      = localStorage.getItem('name')     || 'Friend';
  const character = localStorage.getItem('avatar')   || 'doraemon';

  const CHAR_EMOJI: any = {
    doraemon: '🤖', chhota_bheem: '💪', dora: '🌟', spiderman: '🕷️',
  };

  useEffect(() => {
    Promise.all([
      getProgress(Number(userId)),
      getRecommendations(Number(userId)),
    ]).then(([p, r]) => {
      setProgress(p.data);
      setRecs(r.data.recommendations || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={s.loadPage}>
      <div style={s.loadSpinner}>⏳</div>
      <div style={s.loadText}>Loading your progress...</div>
    </div>
  );

  if (!progress || progress.error) return (
    <div style={s.loadPage}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={s.loadText}>Could not load progress.</div>
      <button style={s.retryBtn} onClick={() => navigate('/chat')}>← Back to Chat</button>
    </div>
  );

  const lc         = LEVEL_COLORS[progress.level] || LEVEL_COLORS[1];
  const xpPct      = Math.min(100, Math.round((progress.points / (progress.next_level_at || 100)) * 100));
  const earnedSet  = new Set<string>(progress.badges || []);

  // Chart data — points breakdown
  const chartData = [
    { name: 'Text',  value: Math.max(1, Math.floor(progress.points * 0.5)) },
    { name: 'Voice', value: Math.max(1, Math.floor(progress.points * 0.3)) },
    { name: 'Image', value: Math.max(1, Math.floor(progress.points * 0.2)) },
    { name: 'Total', value: progress.points },
  ];

  const BAR_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f97316'];

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={{ ...s.header, background: `linear-gradient(135deg, ${lc.bar}, #4c1d95)` }}>
        <button style={s.backBtn} onClick={() => navigate('/chat')}>← Chat</button>
        <div style={s.headerCenter}>
          <span style={{ fontSize: 22 }}>{CHAR_EMOJI[character]}</span>
          <span style={s.headerTitle}>{name}'s Dashboard</span>
        </div>
        <button style={s.parentBtn} onClick={() => navigate('/parent')}>🔒</button>
      </div>

      <div style={s.scroll}>

        {/* ── Level Card ── */}
        <div style={{ ...s.card, ...s.levelCard, background: lc.bg, border: `2px solid ${lc.bar}33` }}>
          <div style={s.levelTop}>
            <div>
              <div style={{ ...s.levelBadge, background: lc.bar }}> Level {progress.level} </div>
              <div style={{ ...s.levelName, color: lc.text }}>{progress.level_name || lc.name}</div>
              <div style={s.levelXP}>{progress.points} XP earned</div>
            </div>
            <div style={{ ...s.bigEmoji, background: lc.bar + '22' }}>{CHAR_EMOJI[character]}</div>
          </div>

          {/* XP Bar */}
          <div style={s.xpLabel}>
            <span style={{ color: lc.text, fontWeight: 700 }}>{xpPct}% to next level</span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>{progress.points_to_next} XP left</span>
          </div>
          <div style={s.xpBarBg}>
            <div style={{ ...s.xpBarFill, width: `${xpPct}%`, background: lc.bar }} />
          </div>
          <div style={s.xpRange}>
            <span>0</span>
            <span>{progress.next_level_at} XP</span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={s.statsRow}>
          {[
            { label: 'Total XP',    value: progress.points,                emoji: '⭐' },
            { label: 'Level',       value: progress.level,                  emoji: '🎯' },
            { label: 'Badges',      value: progress.badges?.length || 0,    emoji: '🏅' },
            { label: 'Next Level',  value: `${progress.points_to_next} XP`, emoji: '🚀' },
          ].map(stat => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statEmoji}>{stat.emoji}</div>
              <div style={s.statValue}>{stat.value}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Chart ── */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>📈</span>
            <span style={s.sectionTitle}>XP by Input Type</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Badges ── */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🏆</span>
            <span style={s.sectionTitle}>Badges</span>
            <span style={s.badgeCount}>{earnedSet.size}/{ALL_BADGES.length}</span>
          </div>
          <div style={s.badgeGrid}>
            {ALL_BADGES.map(b => {
              const earned = earnedSet.has(b.id);
              return (
                <div key={b.id} style={earned
                  ? { ...s.badgeCard, ...s.badgeEarned, borderColor: b.color + '66', background: b.color + '11' }
                  : { ...s.badgeCard, ...s.badgeLocked }}>
                  <div style={{ fontSize: 32, filter: earned ? 'none' : 'grayscale(1) opacity(0.35)' }}>
                    {b.emoji}
                  </div>
                  <div style={{ ...s.badgeName, color: earned ? b.color : '#9ca3af' }}>{b.id}</div>
                  <div style={s.badgeDesc}>{b.desc}</div>
                  {earned && <div style={{ ...s.earnedDot, background: b.color }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ML Recommendations ── */}
        <div style={{ ...s.card, ...s.mlCard }}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🤖</span>
            <span style={s.sectionTitle}>ML Recommended Topics</span>
          </div>
          <p style={s.mlDesc}>
            Based on your past questions, your AI learning engine suggests:
          </p>
          <div style={s.mlChips}>
            {recs.length > 0 ? recs.map((r, i) => (
              <button key={r} style={{ ...s.mlChip, background: BAR_COLORS[i % BAR_COLORS.length] }}
                onClick={() => {
                  navigate('/chat');
                  setTimeout(() => {
                    localStorage.setItem('autoQuestion', r);
                  }, 100);
                }}>
                {r} →
              </button>
            )) : (
              ['Science', 'Mathematics', 'History'].map((r, i) => (
                <button key={r} style={{ ...s.mlChip, background: BAR_COLORS[i] }}
                  onClick={() => navigate('/chat')}>
                  {r} →
                </button>
              ))
            )}
          </div>
          <div style={s.mlNote}>
            🧠 Powered by frequency analysis ML engine
          </div>
        </div>

        {/* ── Level Roadmap ── */}
        <div style={s.card}>
          <div style={s.sectionHeader}>
            <span style={s.sectionIcon}>🗺️</span>
            <span style={s.sectionTitle}>Level Roadmap</span>
          </div>
          <div style={s.roadmap}>
            {[
              { level: 1, name: 'Beginner',  xp: 0,   emoji: '🌱', color: '#3b82f6' },
              { level: 2, name: 'Explorer',  xp: 100, emoji: '🌍', color: '#10b981' },
              { level: 3, name: 'Scholar',   xp: 300, emoji: '📚', color: '#8b5cf6' },
              { level: 4, name: 'Champion',  xp: 600, emoji: '🏆', color: '#f97316' },
            ].map((l, i) => {
              const done    = progress.level > l.level;
              const current = progress.level === l.level;
              return (
                <div key={l.level} style={s.roadmapItem}>
                  <div style={{
                    ...s.roadmapDot,
                    background:  done || current ? l.color : '#e5e7eb',
                    boxShadow:   current ? `0 0 0 4px ${l.color}33` : 'none',
                    transform:   current ? 'scale(1.2)' : 'scale(1)',
                  }}>
                    {done ? '✓' : l.emoji}
                  </div>
                  {i < 3 && <div style={{ ...s.roadmapLine, background: done ? l.color : '#e5e7eb' }} />}
                  <div style={s.roadmapLabel}>
                    <div style={{ fontWeight: current ? 800 : 600, fontSize: 12, color: current ? l.color : '#6b7280' }}>
                      {l.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{l.xp} XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

const s: any = {
  page:         { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f3f4f6', overflow: 'hidden' },
  loadPage:     { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 },
  loadSpinner:  { fontSize: 48 },
  loadText:     { fontSize: 16, color: '#6b7280' },
  retryBtn:     { padding: '10px 20px', borderRadius: 10, background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer' },
  header:       { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  backBtn:      { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  headerCenter: { display: 'flex', alignItems: 'center', gap: 8 },
  headerTitle:  { color: '#fff', fontWeight: 800, fontSize: 16 },
  parentBtn:    { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 16 },
  scroll:       { flex: 1, overflowY: 'auto', padding: '14px 14px 0' },
  card:         { background: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  levelCard:    { padding: 20 },
  levelTop:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  levelBadge:   { display: 'inline-block', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 800 },
  levelName:    { fontSize: 26, fontWeight: 800, marginTop: 6 },
  levelXP:      { fontSize: 13, color: '#6b7280', marginTop: 2 },
  bigEmoji:     { width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 },
  xpLabel:      { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  xpBarBg:      { height: 12, background: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  xpBarFill:    { height: '100%', borderRadius: 8, transition: 'width 1.2s ease' },
  xpRange:      { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 },
  statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 },
  statCard:     { background: '#fff', borderRadius: 14, padding: '12px 8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statEmoji:    { fontSize: 22, marginBottom: 4 },
  statValue:    { fontWeight: 800, fontSize: 16, color: '#1f2937' },
  statLabel:    { fontSize: 10, color: '#9ca3af', marginTop: 2, fontWeight: 600 },
  sectionHeader:{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIcon:  { fontSize: 20 },
  sectionTitle: { fontWeight: 800, fontSize: 15, color: '#1f2937', flex: 1 },
  badgeCount:   { background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  badgeGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  badgeCard:    { borderRadius: 14, padding: '14px 8px', textAlign: 'center', position: 'relative', border: '2px solid transparent' },
  badgeEarned:  {},
  badgeLocked:  { background: '#f9fafb' },
  badgeName:    { fontSize: 11, fontWeight: 700, marginTop: 6 },
  badgeDesc:    { fontSize: 10, color: '#9ca3af', marginTop: 3 },
  earnedDot:    { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%' },
  mlCard:       { background: 'linear-gradient(135deg, #faf5ff, #eff6ff)' },
  mlDesc:       { fontSize: 13, color: '#6b7280', marginBottom: 12, marginTop: -4 },
  mlChips:      { display: 'flex', flexWrap: 'wrap', gap: 8 },
  mlChip:       { padding: '9px 18px', borderRadius: 20, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  mlNote:       { fontSize: 11, color: '#9ca3af', marginTop: 12, fontStyle: 'italic' },
  roadmap:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 0' },
  roadmapItem:  { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' },
  roadmapDot:   { width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 800, zIndex: 1, transition: 'all 0.3s' },
  roadmapLine:  { position: 'absolute', top: 21, left: '60%', right: '-40%', height: 3, zIndex: 0 },
  roadmapLabel: { marginTop: 8, textAlign: 'center' },
};
