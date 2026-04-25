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
  const { profile, updateProfile, lore, addLore, deleteLore, currentStreak, savedPhrases, getStatusSummary, clearLocalData, switchProfile, setProfileImage } = useMasteryStore();
  const { logout, setUser, signIn, isGuest, user } = useAuthStore();

  const [loreCategory, setLoreCategory] = useState<LoreCategory>('Work');
  const [loreDetail, setLoreDetail] = useState('');
  const [switchName, setSwitchName] = useState('');
  const [zipInput, setZipInput] = useState(profile.zip || '');
  const [isLookupLoading, setIsLookupLoading] = useState(false);

  const summary = getStatusSummary();
  const totalLearned = summary.introduced + summary.practicing + summary.confident + summary.mastered;

  const handleZipLookup = async (zip: string) => {
    setZipInput(zip);
    if (zip.length === 5) {
      setIsLookupLoading(true);
      try {
        const resp = await fetch(`https://api.zippopotam.us/us/${zip}`);
        if (resp.ok) {
          const data = await resp.json();
          const place = data.places[0];
          const city = place['place name'];
          const state = place['state abbreviation'];
          updateProfile({ zip, city, state, locationString: `${city}, ${state}` });
        }
      } catch (e) {
        console.error("Zip lookup failed", e);
      } finally {
        setIsLookupLoading(false);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
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
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer', padding: '8px' }}
        >✕</button>
      </header>

      <div className="side-panel-content">
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px auto' }}>
            <div style={{ 
              width: '100%', height: '100%', background: 'var(--surface)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '2.5rem',
              border: '2px solid var(--gold)',
              boxShadow: '0 0 20px rgba(255, 191, 0, 0.2)',
              overflow: 'hidden'
            }}>
              {useMasteryStore.getState().profileImage ? <img src={useMasteryStore.getState().profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            <label style={{ 
              position: 'absolute', bottom: 0, right: 0, 
              background: 'var(--gold)', color: 'black', 
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              📷
              <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <EditableField 
            label="Display Name" 
            value={profile.name} 
            onSave={(val) => updateProfile({ name: val })} 
          />
          <div style={{ color: 'var(--gold)', fontSize: '0.6rem', marginTop: '8px', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>
            NEURAL LINK: {isGuest ? 'LOCAL' : 'CLOUD'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="glass-panel" style={{ padding: '12px' }}>
            <label className="section-title" style={{ fontSize: '0.55rem' }}>Age</label>
            <select 
              value={profile.age} 
              onChange={(e) => updateProfile({ age: e.target.value })}
              className="sort-select"
              style={{ width: '100%', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '1rem', fontWeight: 700 }}
            >
              <option value="">Select...</option>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
          <div className="glass-panel" style={{ padding: '12px' }}>
            <label className="section-title" style={{ fontSize: '0.55rem' }}>Sex</label>
            <select 
              value={profile.sex} 
              onChange={(e) => updateProfile({ sex: e.target.value })}
              className="sort-select"
              style={{ width: '100%', border: 'none', background: 'transparent', padding: '4px 0', fontSize: '1rem', fontWeight: 700 }}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
              <option value="Hidden">Private</option>
            </select>
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '24px', padding: '12px' }}>
          <label className="section-title" style={{ fontSize: '0.55rem' }}>Location (Zip Code)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="text" 
              maxLength={5}
              value={zipInput}
              onChange={(e) => handleZipLookup(e.target.value)}
              placeholder="90210"
              className="settings-input"
              style={{ flex: '0 0 80px', marginBottom: 0, padding: '8px', fontSize: '1rem', fontWeight: 900, textAlign: 'center' }}
            />
            <div style={{ flex: 1 }}>
               {isLookupLoading ? (
                 <span style={{ fontSize: '0.7rem', color: '#666' }}>SYNCING GEODATA...</span>
               ) : (
                 <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>
                   {profile.city ? `${profile.city}, ${profile.state}` : 'Enter Zip...'}
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Switch Profile</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              value={switchName}
              onChange={(e) => setSwitchName(e.target.value)}
              placeholder="Enter name..."
              className="settings-input"
              style={{ flex: 1, marginBottom: 0, padding: '8px', fontSize: '0.85rem' }}
              onKeyDown={(e) => e.key === 'Enter' && handleSwitchProfile()}
            />
            <button 
              onClick={handleSwitchProfile}
              style={{ background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '2px', padding: '0 12px', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}
            >
              SWITCH
            </button>
          </div>
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

        <div style={{ paddingBottom: '40px', textAlign: 'center', opacity: 0.3, fontSize: '0.6rem', letterSpacing: '0.1em' }}>
           SYSTEM ID: {user?.uid || 'LOCAL_HOST'}
        </div>
      </div>
    </motion.div>
  );
}
