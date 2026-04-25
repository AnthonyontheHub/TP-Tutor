import { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';
import type { LoreCategory } from '../types/mastery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ isOpen, onClose }: Props) {
  const { profile, updateProfile, lore, addLore, deleteLore, currentStreak, savedPhrases, getStatusSummary } = useMasteryStore();
  const { logout } = useAuthStore();
  const dragControls = useDragControls();

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          className="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="drawer"
          className="profile-drawer"
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.3 }}
          onDragEnd={(_, info) => { if (info.offset.y > 120) onClose(); }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          onClick={(e) => e.stopPropagation()}
          style={{ padding: '0 24px 24px' }}
        >
          {/* Drag handle */}
          <div
            style={{ padding: '12px 0 6px', cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="drawer__handle" style={{ margin: '0 auto' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px auto', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              👤
            </div>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.8rem' }}>{profile.name || 'Student'}</h2>
            <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>Toki Pona Student</div>
          </div>

          {/* Standard Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>Age</label>
              <input 
                type="text" 
                value={profile.age} 
                onChange={(e) => updateProfile({ age: e.target.value })}
                placeholder="e.g. 25"
                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>Sex</label>
              <input 
                type="text" 
                value={profile.sex} 
                onChange={(e) => updateProfile({ sex: e.target.value })}
                placeholder="M/F/X"
                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>Location</label>
              <input 
                type="text" 
                value={profile.location} 
                onChange={(e) => updateProfile({ location: e.target.value })}
                placeholder="e.g. Tokyo, Japan"
                style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px', color: 'white', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Lore Builder */}
          <div style={{ marginBottom: '32px' }}>
            <h3 className="section-title" style={{ marginBottom: '12px', color: '#3b82f6' }}>Lore Builder</h3>
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <select 
                  value={loreCategory} 
                  onChange={(e) => setLoreCategory(e.target.value as LoreCategory)}
                  style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: 'white', padding: '8px', fontSize: '0.8rem' }}
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
                  style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '0.85rem' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLore()}
                />
                <button 
                  onClick={handleAddLore}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 'bold', fontSize: '0.8rem' }}
                >
                  ADD
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lore.map((entry) => (
                  <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '8px 12px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
                    <div style={{ fontSize: '0.8rem' }}>
                      <span style={{ color: '#666', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', marginRight: '8px' }}>{entry.category}</span>
                      <span style={{ color: '#ccc' }}>{entry.detail}</span>
                    </div>
                    <button 
                      onClick={() => deleteLore(entry.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {lore.length === 0 && <div style={{ textAlign: 'center', color: '#444', fontSize: '0.75rem', padding: '10px' }}>No lore entries yet.</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Current Streak</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>🔥 {currentStreak} Days</div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Vocabulary Progress</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>{totalLearned} <span style={{ fontSize: '1rem', color: '#888' }}>/ 124 Words</span></div>
            </div>

            <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>Saved Phrases</div>
              <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' }}>{savedPhrases.length} <span style={{ fontSize: '1rem', color: '#888' }}>Phrases</span></div>
            </div>

            <button 
              onClick={() => {
                useMasteryStore.getState().clearLocalData();
                useAuthStore.getState().setUser(null);
                logout();
                onClose();
              }}
              style={{
                marginTop: '12px',
                padding: '14px',
                background: 'transparent',
                color: '#ef4444',
                border: '1px solid #7f1d1d',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f0000'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
