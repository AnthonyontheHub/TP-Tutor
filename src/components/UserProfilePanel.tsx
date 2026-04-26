/* src/components/UserProfilePanel.tsx */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';
import type { LoreCategory } from '../types/mastery';
// Import signInWithPopup for Google authentication
import { signInWithPopup } from "firebase/auth";
// Import auth and googleProvider from firebase configuration
import { auth, googleProvider } from '../services/firebase';

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

  const handleAddLore = () => {
    if (!loreDetail.trim()) return;
    addLore(loreCategory, loreDetail);
    setLoreDetail('');
  };

  const handleSwitchProfile = () => {
    if (!switchName.trim()) return;
    switchProfile(switchName);
    setSwitchName('');
    onClose();
  };

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

  // Handler for Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userCredential = result.user;
      setUser(userCredential); // Assuming setUser updates the authStore with user info
      console.log("Google sign-in successful:", userCredential);
      // Optionally, you might want to fetch user data from Firestore here
    } catch (error) {
      console.error("Google sign-in failed:", error);
      // Handle error, e.g., show a message to the user
    }
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
          <div style={{ marginTop: '16px' }}>
            {isGuest ? (
              <button
                onClick={() => signIn()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', background: 'white', color: 'black', border: 'none', borderRadius: '2px', padding: '10px 16px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                SIGN IN WITH GOOGLE
              </button>
            ) : (
              <button
                onClick={() => logout()}
                style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '2px', padding: '10px 16px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '0.1em' }}
              >
                LOG OUT
              </button>
            )}
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
                <option key={age} value={String(age)}>{age}</option>
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

        {/* Conditionally render the Google Sign-In button if the user is not logged in */}
        {!user && (
          <button 
            onClick={handleGoogleSignIn}
            style={{ 
              background: '#4285F4', // Google blue
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              padding: '12px 24px', 
              fontWeight: 700, 
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto 20px auto', // Center the button
              width: 'fit-content' // Ensure button size is content-based
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.35 12.3845C23.35 11.5938 23.2875 10.7625 23.1469 9.91125H12V14.1038H18.1838C18.0338 14.7938 17.7112 15.4162 17.2538 15.9112C16.7962 16.4062 16.2225 16.7662 15.5512 16.9762C14.8762 17.1838 14.1712 17.2988 13.4512 17.2988C10.995 17.2988 8.7525 16.3388 7.0875 14.6662C5.4225 12.9938 4.5825 10.7512 4.5825 8.55125C4.5825 7.25625 4.95 6.05625 5.64 5.00625C6.33 3.95625 7.25625 3.10125 8.34 2.47125C9.43125 1.84125 10.6612 1.5 11.9362 1.5C13.9762 1.5 15.9262 2.14125 17.4562 3.43125L15.5512 5.33625C14.7562 4.61625 13.7812 4.19375 12.7238 4.19375C10.995 4.19375 9.40125 5.06625 8.34 6.58125C7.27375 8.09625 6.87375 9.95125 7.01625 11.7988C7.16125 13.6438 8.02125 15.3262 9.4575 16.5262C10.8938 17.7262 12.7312 18.3712 14.58 18.2662C15.7312 18.2212 16.8412 17.9212 17.82 17.3662C18.7988 16.8112 19.6312 16.0462 20.2312 15.1288C20.8312 14.2262 21.1838 13.2112 21.1838 12.1462C21.1838 11.7412 21.1538 11.3512 21.1162 10.9738C21.0762 10.5962 21.0162 10.2338 20.9362 9.88125L23.35 12.3845Z" fill="#FBBC05"/>
              <path d="M12 23.5C14.8 23.5 17.3333 22.5333 19.2467 20.8333C21.16 19.1333 22.56 16.9167 23.35 14.3033L19.7167 12.0633C19.2033 13.8867 18.1167 15.3333 16.5833 16.31C15.05 17.2867 13.1833 17.79 11.25 17.6367C9.71667 17.5433 8.23333 17.1567 6.95 16.5267C5.66667 15.8967 4.61667 15.0567 3.86667 13.9767C3.11667 12.8967 2.61667 11.6767 2.43167 10.4267C2.24667 9.1767 2.38167 7.9167 2.83167 6.7167L6.46667 8.9367C6.78333 9.7367 6.88333 10.5833 6.88333 11.4267C6.88333 12.9567 6.55667 14.4867 5.90667 15.8567C5.25667 17.2267 4.31667 18.3717 3.13167 19.2367C1.94667 20.0967 0.57167 20.6317 0 20.7967C3.55 22.2967 7.68333 23.5 12 23.5Z" fill="#34A853"/>
              <path d="M23.35 12.3845C23.35 11.5938 23.2875 10.7625 23.1469 9.91125H12V14.1038H18.1838C18.0338 14.7938 17.7112 15.4162 17.2538 15.9112C16.7962 16.4062 16.2225 16.7662 15.5512 16.9762C14.8762 17.1838 14.1712 17.2988 13.4512 17.2988C10.995 17.2988 8.7525 16.3388 7.0875 14.6662C5.4225 12.9938 4.5825 10.7512 4.5825 8.55125C4.5825 7.25625 4.95 6.05625 5.64 5.00625C6.33 3.95625 7.25625 3.10125 8.34 2.47125C9.43125 1.84125 10.6612 1.5 11.9362 1.5C13.9762 1.5 15.9262 2.14125 17.4562 3.43125L15.5512 5.33625C14.7562 4.61625 13.7812 4.19375 12.7238 4.19375C10.995 4.19375 9.40125 5.06625 8.34 6.58125C7.27375 8.09625 6.87375 9.95125 7.01625 11.7988C7.16125 13.6438 8.02125 15.3262 9.4575 16.5262C10.8938 17.7262 12.7312 18.3712 14.58 18.2662C15.7312 18.2212 16.8412 17.9212 17.82 17.3662C18.7988 16.8112 19.6312 16.0462 20.2312 15.1288C20.8312 14.2262 21.1838 13.2112 21.1838 12.1462C21.1838 11.7412 21.1538 11.3512 21.1162 10.9738C21.0762 10.5962 21.0162 10.2338 20.9362 9.88125L23.35 12.3845Z" fill="#FBBC05"/>
              <path d="M12 1.5C14.6458 1.5 17.0458 2.43125 18.8938 4.19375L15.5512 7.52625C14.7562 7.07625 13.7812 6.81125 12.7238 6.81125C10.995 6.81125 9.40125 5.93875 8.34 4.42375C7.27375 2.90875 6.87375 1.05375 7.01625 0.00625C7.16125 -0.94375 8.02125 -2.62625 9.4575 -3.82625C10.8938 -5.02625 12.7312 -5.67125 14.58 -5.56625C15.7312 -5.52125 16.8412 -5.22125 17.82 -4.66625C18.7988 -4.11125 19.6312 -3.34625 20.2312 -2.44375C20.8312 -1.54125 21.1838 -0.52625 21.1838 0.53625C21.1838 0.93125 21.1538 1.32125 21.1162 1.69875C21.0762 2.07625 21.0162 2.43875 20.9362 2.79125L18.5212 0.61125C17.9112 0.01125 17.1612 -0.31375 16.2812 -0.31375C15.0812 -0.31375 13.7812 0.39875 12.9012 1.65875C12.0212 2.91875 11.6012 4.42375 11.6512 5.93875C11.6512 7.45375 12.0212 8.95875 12.9012 10.2188C13.7812 11.4788 15.0812 12.1912 16.2812 12.1912C17.0912 12.1912 17.8412 11.9138 18.4612 11.4388C19.0812 10.9638 19.5612 10.3112 19.8412 9.55875L22.1562 11.6988C22.7762 10.8788 23.2038 9.9388 23.35 8.9063C23.4962 7.8738 23.35 6.7163 23.35 5.5313C23.35 4.1463 23.1663 2.8088 22.7838 1.5563L23.35 0.3063L23.35 12.3845Z" fill="#FABC05"/>
            </svg>
            Sign in with Google
          </button>
        )}

        <div style={{ paddingBottom: '40px', textAlign: 'center', opacity: 0.3, fontSize: '0.6rem', letterSpacing: '0.1em' }}>
           SYSTEM ID: {user?.uid || 'LOCAL_HOST'}
        </div>
      </div>
    </motion.div>
  );
}
