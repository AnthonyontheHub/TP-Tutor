/* src/components/UserProfilePanel.tsx */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      resolve(canvas.toDataURL('image/jpeg'));
    };
    image.onerror = (error) => reject(error);
  });
};

export default function UserProfilePanel({ onClose }: Props) {
  const { studentName, profile, updateProfile, setProfileImage, profileImage, lore, addLore, deleteLore } = useMasteryStore();
  const { logout, user, isGuest } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(profile);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loreInput, setLoreInput] = useState('');
  const [loreCategory, setLoreCategory] = useState<'Work' | 'Hobbies' | 'Pets' | 'Projects' | 'Lifestyle'>('Work');

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfileImage(croppedImage);
      setImageSrc(null);
    }
    updateProfile(editableProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setImageSrc(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditableProfile(profile);
    setIsEditing(true);
  };

  const handleFieldChange = (field: keyof typeof editableProfile, value: any) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddLore = () => {
    if (!loreInput.trim()) return;
    addLore(loreCategory, loreInput.trim());
    setLoreInput('');
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
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
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>{studentName?.toUpperCase() || 'ANTHONY'} PROFILE</h2>
        <div>
          {isEditing ? (
            <div className="edit-controls">
              <button onClick={handleSave} className="save-button">Save</button>
              <button onClick={handleCancel} className="cancel-button">Cancel</button>
            </div>
          ) : (
            <button onClick={handleEdit} className="edit-icon-button">✏️</button>
          )}
        </div>
        <button onClick={onClose} className="close-button">✕</button>
      </header>

      <div className="side-panel-content" style={{ touchAction: 'pan-y' }}>
        {isEditing && imageSrc && (
          <div className="crop-container" style={{ position: 'relative', height: '200px', marginBottom: '20px' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="profile-image-container">
            <div className="profile-image">
              {(isEditing && imageSrc) ? null : (profileImage ? <img src={profileImage} alt="Profile" /> : <span style={{fontSize: '3rem'}}>👤</span>)}
            </div>
            {isEditing && (
              <label className="profile-image-upload" style={{ cursor: 'pointer', background: 'var(--gold)', color: 'black', padding: '4px 8px', borderRadius: '4px', marginTop: '8px', display: 'inline-block', fontWeight: 'bold' }}>
                Change Photo
                <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
          <div style={{ color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>
            SYNC MODE: {isGuest ? 'LOCAL' : 'CLOUD'}
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Personal Details</h3>
          <div className="profile-fields">
            {isEditing ? (
              <>
                <div className="field">
                  <label>Toki Pona Name</label>
                  <input type="text" value={editableProfile.tpName || ''} onChange={(e) => handleFieldChange('tpName', e.target.value)} />
                </div>
                <div className="field">
                  <label>Age</label>
                  <input type="text" value={editableProfile.age || ''} onChange={(e) => handleFieldChange('age', e.target.value)} />
                </div>
                <div className="field">
                  <label>Sex</label>
                  <input type="text" value={editableProfile.sex || ''} onChange={(e) => handleFieldChange('sex', e.target.value)} />
                </div>
                <div className="field">
                  <label>Location</label>
                  <input type="text" value={editableProfile.locationString || ''} onChange={(e) => handleFieldChange('locationString', e.target.value)} />
                </div>
              </>
            ) : (
              <div style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p><strong>Toki Pona Name:</strong> {profile.tpName || 'Not set'}</p>
                <p><strong>Age:</strong> {profile.age || 'Not provided'}</p>
                <p><strong>Sex:</strong> {profile.sex || 'Not provided'}</p>
                <p><strong>Location:</strong> {profile.locationString || 'Not provided'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section" style={{ border: '1px solid var(--gold)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
          <h3 className="section-title" style={{ color: 'var(--gold)' }}>Lore Builder</h3>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px' }}>
            Add personal details to help Lina contextualize your learning.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {lore.map((l) => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 'bold', marginRight: '8px' }}>[{l.category}]</span>
                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{l.detail}</span>
                </div>
                <button onClick={() => deleteLore(l.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <select 
              value={loreCategory} 
              onChange={(e) => setLoreCategory(e.target.value as any)}
              style={{ padding: '8px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '4px' }}
            >
              <option value="Work">Work</option>
              <option value="Hobbies">Hobbies</option>
              <option value="Pets">Pets</option>
              <option value="Projects">Projects</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>
            <input 
              type="text" 
              value={loreInput} 
              onChange={(e) => setLoreInput(e.target.value)} 
              placeholder="e.g. I have a dog named Rex"
              style={{ flex: 1, padding: '8px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '4px' }}
            />
            <button onClick={handleAddLore} style={{ padding: '8px 16px', background: 'var(--gold)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Add
            </button>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Learning Profile</h3>
          <div className="profile-fields">
            {isEditing ? (
              <>
                <div className="field">
                  <label>Difficulty</label>
                  <select value={editableProfile.difficulty || 'Beginner'} onChange={(e) => handleFieldChange('difficulty', e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="field">
                  <label>Interests</label>
                  <input type="text" value={(editableProfile.interests || []).join(', ')} onChange={(e) => handleFieldChange('interests', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., philosophy, coding, art" />
                </div>
              </>
            ) : (
              <div style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p><strong>Difficulty:</strong> {profile.difficulty || 'Beginner'}</p>
                <p><strong>Interests:</strong> {(profile.interests || []).join(', ') || 'None listed'}</p>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div style={{ marginTop: '24px' }}>
            <button onClick={handleSave} style={{ width: '100%', padding: '12px', background: 'var(--gold)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 900, letterSpacing: '1px' }}>
              SAVE PROFILE
            </button>
          </div>
        )}

      </div>
      <div className="auth-section">
        {isGuest || !user ? (
          <button onClick={handleGoogleSignIn} className="google-signin-button">
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            SIGN IN WITH GOOGLE
          </button>
        ) : (
           <button onClick={() => logout()} className="logout-button">LOG OUT</button>
        )}
      </div>
    </motion.div>
  );
}
