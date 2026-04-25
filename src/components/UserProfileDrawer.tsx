/* src/components/UserProfileDrawer.tsx */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';
import type { LoreCategory } from '../types/mastery';

interface Props {
  isOpen: boolean; // Kept for compatibility but we use view switching now
  onClose: () => void;
}

export default function UserProfileDrawer({ onClose }: Props) {
  const { profile, updateProfile, lore, addLore, deleteLore, currentStreak, savedPhrases, getStatusSummary, clearLocalData } = useMasteryStore();
  const { logout, setUser } = useAuthStore();

  const [loreCategory, setLoreCategory] = useState<LoreCategory>('Work');
  const [loreDetail, setLoreDetail] = useState('');

  const summary = getStatusSummary();
  const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;

  const handleAddLore = () => {
    if (!loreDetail.trim()) return;
    addLore(loreCategory, loreDetail);
    setLoreDetail('');
  };

  return (
    <motion.div
      className="full-screen-view"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="view-header">
        <button onClick={onClose} className="btn-back">
          <span>←</span> BACK
        </button>
        <h2 style={{ marginLeft: '16px', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em' }}>USER PROFILE</h2>
      </header>

      <div className="view-content">
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ 
            width: '90px', height: '90px', background: 'var(--surface)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px auto',
            border: '2px solid var(--cyan)',
            boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)'
          }}>
            👤
          </div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem', fontWeight: 900 }}>{profile.name || 'Student'}</h2>
          <div style={{ color: 'var(--cyan)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>TOKI PONA STUDENT</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div className="glass-panel">
            <label className="section-title">Age</label>
            <input 
              type="text" 
              value={profile.age} 
              onChange={(e) => updateProfile({ age: e.target.value })}
              placeholder="e.g. 25"
              className="settings-input"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="glass-panel">
            <label className="section-title">Sex</label>
            <input 
              type="text" 
              value={profile.sex} 
              onChange={(e) => updateProfile({ sex: e.target.value })}
              placeholder="M/F/X"
              className="settings-input"
              style={{ marginBottom: 0 }}
            />
          </div>
          <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
            <label className="section-title">Location</label>
            <input 
              type="text" 
              value={profile.location} 
              onChange={(e) => updateProfile({ location: e.target.value })}
              placeholder="e.g. Tokyo, Japan"
              className="settings-input"
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ color: 'var(--cyan)' }}>Lore Builder</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <select 
              value={loreCategory} 
              onChange={(e) => setLoreCategory(e.target.value as LoreCategory)}
              className="sort-select"
              style={{ flex: '0 0 auto', width: '100px' }}
            >
              <option value="Work">Work</option>
              <option value="Hobbies">Hobbies</option>
              <option value="Pets">Pets</option>
              <option value="Projects">Projects</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
            <input 
              type="text" 
              value={loreDetail}
              onChange={(e) => setLoreDetail(e.target.value)}
              placeholder="Tell jan Lina something..."
              className="settings-input"
              style={{ flex: 1, marginBottom: 0 }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLore()}
            />
            <button 
              onClick={handleAddLore}
              style={{ background: 'var(--cyan)', color: '#000', border: 'none', borderRadius: '12px', padding: '0 16px', fontWeight: 'bold', fontSize: '0.8rem' }}
            >
              ADD
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lore.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--cyan)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem', marginRight: '10px' }}>{entry.category}</span>
                  <span style={{ color: '#eee' }}>{entry.detail}</span>
                </div>
                <button 
                  onClick={() => deleteLore(entry.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            ))}
            {lore.length === 0 && <div style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', padding: '10px' }}>No lore entries yet.</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--amber)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Current Streak</div>
            <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 900 }}>🔥 {currentStreak} Days</div>
          </div>

          <div className="glass-panel" style={{ borderLeft: '4px solid var(--green)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Vocabulary Progress</div>
            <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 900 }}>{totalLearned} <span style={{ fontSize: '1.2rem', color: '#444' }}>/ 124</span></div>
          </div>

          <button 
            onClick={() => {
              clearLocalData();
              setUser(null);
              logout();
              onClose();
            }}
            className="btn-danger"
            style={{ 
              marginTop: '12px', 
              textAlign: 'center', 
              padding: '16px', 
              borderRadius: '16px',
              fontSize: '0.9rem',
              letterSpacing: '0.05em'
            }}
          >
            SIGN OUT OF ACCOUNT
          </button>
        </div>
      </div>
    </motion.div>
  );
}
