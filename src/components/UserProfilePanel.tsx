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
  const { profile, updateProfile, setProfileImage, profileImage } = useMasteryStore();
  const { logout, user, isGuest, signIn } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(profile);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleSave = () => {
    updateProfile(editableProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableProfile(profile);
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

  const saveCroppedImage = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      setProfileImage(croppedImage);
      setImageSrc(null);
    }
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
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>USER PROFILE</h2>
        <button onClick={onClose} className="close-button">✕</button>
      </header>

      <div className="side-panel-content">
        {imageSrc && (
          <div className="crop-container">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="crop-controls">
              <button onClick={saveCroppedImage}>Save Photo</button>
              <button onClick={() => setImageSrc(null)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div className="profile-image-container">
            <div className="profile-image">
              {profileImage ? <img src={profileImage} alt="Profile" /> : '👤'}
            </div>
            <label className="profile-image-upload">
              📷
              <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <h3 style={{ margin: '12px 0 4px', color: 'white' }}>{profile.firstName} {profile.lastName}</h3>
          <div style={{ color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>
            NEURAL LINK: {isGuest ? 'LOCAL' : 'CLOUD'}
          </div>
        </div>

        {!isEditing ? (
          <button onClick={handleEdit} className="edit-button">Edit Profile</button>
        ) : (
          <div className="edit-controls">
            <button onClick={handleSave} className="save-button">Save</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        )}

        <div className="profile-fields">
          <div className="field-group">
            <div className="field">
              <label>First Name</label>
              <input type="text" value={editableProfile.firstName || ''} onChange={(e) => handleFieldChange('firstName', e.target.value)} disabled={!isEditing} />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input type="text" value={editableProfile.lastName || ''} onChange={(e) => handleFieldChange('lastName', e.target.value)} disabled={!isEditing} />
            </div>
          </div>
          <div className="field">
            <label>toki pona Name</label>
            <input type="text" value={editableProfile.tokiPonaName || ''} onChange={(e) => handleFieldChange('tokiPonaName', e.target.value)} disabled={!isEditing} />
          </div>
          <div className="field">
            <label>Difficulty</label>
            <select value={editableProfile.difficulty || 'Beginner'} onChange={(e) => handleFieldChange('difficulty', e.target.value)} disabled={!isEditing}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="field">
            <label>Interests</label>
            <input type="text" value={(editableProfile.interests || []).join(', ')} onChange={(e) => handleFieldChange('interests', e.target.value.split(',').map(s => s.trim()))} disabled={!isEditing} placeholder="e.g., philosophy, coding, art" />
          </div>
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
          <div className="system-id">SYSTEM ID: {user?.uid || 'LOCAL_HOST'}</div>
        </div>
      </div>
    </motion.div>
  );
}
