import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const AVATARS = [
  { id: 'doraemon',     emoji: '🤖', name: 'Doraemon' },
  { id: 'chhota_bheem', emoji: '💪', name: 'Chhota Bheem' },
  { id: 'dora',         emoji: '🌟', name: 'Dora' },
  { id: 'spiderman',    emoji: '🕷️', name: 'Spider-Man' },
];

export default function Register() {
  const [name, setName]       = useState('');
  const [age, setAge]         = useState('');
  const [language, setLang]   = useState('english');
  const [avatar, setAvatar]   = useState('doraemon');
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const handleSubmit = async () => {
    if (!name.trim()) return alert('Please enter your name!');
    if (!age || Number(age) < 4 || Number(age) > 18)
      return alert('Please enter a valid age (4–18)!');
    setLoading(true);
    try {
      const res = await registerUser({ name, age, language, avatar });
      localStorage.setItem('user_id',  String(res.data.user_id));
      localStorage.setItem('name',     res.data.name);
      localStorage.setItem('avatar',   avatar);
      localStorage.setItem('language', language);
      navigate('/select-character');
    } catch (e) {
      alert('Registration failed. Make sure backend is running on port 8000!');
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoRow}>
          <span style={s.logoIcon}>🎮</span>
          <div>
            <h1 style={s.logoTitle}>LevelUpLearning</h1>
            <p style={s.logoSub}>Learn. Play. Level Up!</p>
          </div>
        </div>

        {/* Name */}
        <label style={s.label}>Your Name</label>
        <input style={s.input} placeholder="e.g. Arjun" value={name}
          onChange={e => setName(e.target.value)} />

        {/* Age */}
        <label style={s.label}>Your Age</label>
        <input style={s.input} placeholder="e.g. 10" type="number"
          min={4} max={18} value={age}
          onChange={e => setAge(e.target.value)} />

        {/* Language */}
        <label style={s.label}>Language</label>
        <div style={s.toggleRow}>
          {['english', 'hindi'].map(l => (
            <button key={l}
              style={language === l ? s.toggleActive : s.toggle}
              onClick={() => setLang(l)}>
              {l === 'english' ? '🇬🇧 English' : '🇮🇳 Hindi'}
            </button>
          ))}
        </div>

        {/* Avatar */}
        <label style={s.label}>Choose Your Hero</label>
        <div style={s.avatarGrid}>
          {AVATARS.map(a => (
            <button key={a.id}
              style={avatar === a.id ? s.avatarActive : s.avatar}
              onClick={() => setAvatar(a.id)}>
              <div style={s.avatarEmoji}>{a.emoji}</div>
              <div style={s.avatarName}>{a.name}</div>
              {avatar === a.id && <div style={s.checkmark}>✓</div>}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button style={loading ? s.submitDisabled : s.submit}
          onClick={handleSubmit} disabled={loading}>
          {loading ? '⏳ Creating Profile...' : '🚀 Start My Adventure!'}
        </button>
      </div>
    </div>
  );
}

const s: any = {
  page:          { minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:          { background: '#fff', borderRadius: 24, padding: '28px 24px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' },
  logoRow:       { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  logoIcon:      { fontSize: 44 },
  logoTitle:     { margin: 0, fontSize: 22, fontWeight: 800, color: '#4c1d95' },
  logoSub:       { margin: 0, fontSize: 12, color: '#7c3aed' },
  label:         { display: 'block', fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 6, marginTop: 14 },
  input:         { width: '100%', padding: '12px 14px', borderRadius: 12, border: '2px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' },
  toggleRow:     { display: 'flex', gap: 8 },
  toggle:        { flex: 1, padding: '10px', borderRadius: 12, border: '2px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  toggleActive:  { flex: 1, padding: '10px', borderRadius: 12, border: '2px solid #7c3aed', background: '#ede9fe', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#4c1d95' },
  avatarGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 },
  avatar:        { padding: '14px 8px', borderRadius: 14, border: '2px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer', textAlign: 'center', position: 'relative' },
  avatarActive:  { padding: '14px 8px', borderRadius: 14, border: '2px solid #7c3aed', background: '#ede9fe', cursor: 'pointer', textAlign: 'center', position: 'relative' },
  avatarEmoji:   { fontSize: 36 },
  avatarName:    { fontSize: 12, fontWeight: 600, marginTop: 6, color: '#374151' },
  checkmark:     { position: 'absolute', top: 6, right: 8, background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  submit:        { width: '100%', padding: '15px', borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginTop: 20, letterSpacing: 0.3 },
  submitDisabled:{ width: '100%', padding: '15px', borderRadius: 14, background: '#c4b5fd', color: '#fff', border: 'none', fontSize: 16, fontWeight: 800, cursor: 'not-allowed', marginTop: 20 },
};
