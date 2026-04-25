/* src/components/UserProfilePanel.tsx */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';
import type { LoreCategory } from '../types/mastery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function EditableField({ 
  label, 
  value, 
  onSave 
}: { 
  label: string; 
  value: string; 
  onSave: (val: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  if (isEditing) {
    return (
      <div className="glass-panel" style={{ padding: '12px' }}>
        <label className="section-title" style={{ fontSize: '0.55rem' }}>{label}</label>
        <input 
          autoFocus
          type="text" 
          value={tempValue} 
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={() => { setIsEditing(false); onSave(tempValue); }}
          onKeyDown={(e) => { 
            if (e.key === 'Enter') { setIsEditing(false); onSave(tempValue); }
            if (e.key === 'Escape') { setIsEditing(false); setTempValue(value); }
          }}
          className="settings-input"
          style={{ marginBottom: 0, padding: '8px', fontSize: '0.85rem' }}
        />
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '12px', cursor: 'pointer' }} onClick={() => setIsEditing(true)}>
      <label className="section-title" style={{ fontSize: '0.55rem' }}>{label}</label>
      <div style={{ fontSize: '1rem', color: 'white', fontWeight: 700, padding: '4px 0' }}>{value || '---'}</div>
    </div>
  );
}

export default function UserProfilePanel({ onClose }: Props) {
  const { profile, updateProfile, lore, addLore, deleteLore, currentStreak, savedPhrases, getStatusSummary, clearLocalData } = useMasteryStore();
  const { logout, setUser, signIn, isGuest, user } = useAuthStore();

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
      className="side-panel"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>USER PROFILE</h2>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content">
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', height: '80px', background: 'var(--surface)', 
            borderRadius: '2px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 16px auto',
            border: '1px solid var(--gold)',
            boxShadow: '0 0 15px rgba(255, 191, 0, 0.1)'
          }}>
            {user?.photoURL ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.6rem', fontWeight: 900, textTransform: 'uppercase' }}>{profile.name || 'Student'}</h2>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', marginTop: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>Neural Link: {isGuest ? 'LOCAL ONLY' : 'CLOUD SYNC ACTIVE'}</div>
        </div>

        {isGuest && (
          <div className="glass-panel" style={{ marginBottom: '32px', border: '1px solid var(--gold)', background: 'rgba(255, 191, 0, 0.05)' }}>
            <p style={{ fontSize: '0.8rem', color: '#fff', marginBottom: '12px', textAlign: 'center', fontWeight: 700 }}>Guest mode: progress is local only.</p>
            <button 
              onClick={() => signIn()}
              className="btn-review" 
              style={{ margin: 0, padding: '10px', fontSize: '0.75rem', boxShadow: 'none' }}
            >
              LINK GOOGLE ACCOUNT
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '32px' }}>
          <EditableField 
            label="Age" 
            value={profile.age} 
            onSave={(val) => updateProfile({ age: val })} 
          />
          <EditableField 
            label="Sex" 
            value={profile.sex} 
            onSave={(val) => updateProfile({ sex: val })} 
          />
          <EditableField 
            label="Location" 
            value={profile.location} 
            onSave={(val) => updateProfile({ location: val })} 
          />
        </div>

        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Biographical Data (Lore)</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select 
              value={loreCategory} 
              onChange={(e) => setLoreCategory(e.target.value as LoreCategory)}
              className="sort-select"
              style={{ flex: '0 0 auto', width: '90px', fontSize: '0.75rem', padding: '8px' }}
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
              placeholder="Add lore..."
              className="settings-input"
              style={{ flex: 1, marginBottom: 0, padding: '8px', fontSize: '0.85rem' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLore()}
            />
            <button 
              onClick={handleAddLore}
              style={{ background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '2px', padding: '0 12px', fontWeight: 900, fontSize: '0.7rem' }}
            >
              ADD
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lore.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '2px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', marginRight: '10px' }}>{entry.category}</span>
                  <span style={{ color: '#ccc' }}>{entry.detail}</span>
                </div>
                <button 
                  onClick={() => deleteLore(entry.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          <button 
            onClick={() => {
              clearLocalData();
              setUser(null);
              logout();
              onClose();
            }}
            className="btn-danger"
            style={{ 
              textAlign: 'center', 
              padding: '12px', 
              fontSize: '0.8rem',
              letterSpacing: '0.1em'
            }}
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>
    </motion.div>
  );
}
