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

const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
const ENNEAGRAM_TYPES = ['Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5', 'Type 6', 'Type 7', 'Type 8', 'Type 9'];
const BIG_FIVE_LEVELS = ['Low', 'Medium', 'High'];
const ATTACHMENT_STYLES = ['Secure', 'Anxious-Preoccupied', 'Dismissive-Avoidant', 'Fearful-Avoidant'];
const RELIGIONS = ['Atheist', 'Agnostic', 'Christian', 'Catholic', 'Muslim', 'Jewish', 'Buddhist', 'Hindu', 'Spiritual / Non-Religious', 'Secular Humanist', 'Other'];
const POLITICAL_IDENTITIES = ['Liberal', 'Progressive', 'Socialist', 'Social Democrat', 'Libertarian', 'Centrist', 'Independent', 'Conservative', 'Anarchist', 'Green', 'Other'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const DIET_PATTERNS = ['One Meal a Day (OMAD)', 'Two Meals a Day (TMAD)', 'Three Meals a Day', 'Intermittent Fasting', 'Intuitive Eating', 'Other'];
const WORKOUT_STYLES = ['Strength Training', 'Cardio', 'HIIT', 'Yoga / Flexibility', 'Mixed / Cross Training', 'Sedentary', 'Other'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'];
const BOOK_GENRES = ['Science Fiction', 'Fantasy', 'Horror', 'Mystery / Thriller', 'Historical Fiction', 'Literary Fiction', 'Romance', 'Non-Fiction', 'Biography', 'Philosophy', 'Self-Help', 'History', 'Science', 'Politics', 'Religion / Spirituality', 'Graphic Novels'];
const TV_GENRES = ['Sci-Fi', 'Fantasy', 'Drama', 'Crime / Mystery', 'Comedy', 'Documentary', 'Action', 'Horror', 'Superhero', 'Anime', 'Reality', 'Historical'];
const MUSIC_GENRES = ['Rock', 'Alternative', 'Pop', 'Hip-Hop / Rap', 'R&B', 'Country', 'Electronic / EDM', 'Classical', 'Jazz', 'Latin', 'Metal', 'Indie', 'Folk', 'Soundtrack / Score'];
const GAMING_GENRES = ['RPG', 'Strategy', 'FPS', 'Action / Adventure', 'Simulation', 'Sports', 'Puzzle', 'Horror', 'Open World', 'Fighting', 'Platformer'];
const GAMING_PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Mobile', 'Cloud Gaming', 'Retro / Emulation'];
const CHRONOTYPES = ['Early Bird', 'Night Owl', 'Intermediate'];
const WORK_SCHEDULES = ['Traditional 9–5', 'Shift Work', 'Remote', 'Freelance / Variable', 'Student', 'Unemployed', 'Retired'];
const LIVING_SITUATIONS = ['Alone', 'With Partner', 'With Roommates', 'With Family', 'Other'];
const SOCIAL_PREFERENCES = ['Strong Introvert', 'Mild Introvert', 'Ambivert', 'Mild Extrovert', 'Strong Extrovert'];

type TabID = 'IDENTITY' | 'PERSONA' | 'BELIEFS' | 'HEALTH' | 'MEDIA' | 'DAILY';

export default function UserProfilePanel({ onClose }: Props) {
  const { 
    studentName, profile, updateProfile, setProfileImage,
    profileImage, getStatusSummary,
    earnedCeremonialRanks, streakShields
  } = useMasteryStore();
  const { logout, user, isGuest } = useAuthStore();
  
  const summary = getStatusSummary();
  
  const [activeTab, setActiveTab] = useState<TabID>('IDENTITY');
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(profile);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

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

  const toggleMultiSelect = (field: keyof typeof editableProfile, value: string) => {
    const current = (editableProfile[field] as string[]) || [];
    if (current.includes(value)) {
      handleFieldChange(field, current.filter(v => v !== value));
    } else {
      handleFieldChange(field, [...current, value]);
    }
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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const tabs: TabID[] = ['IDENTITY', 'PERSONA', 'BELIEFS', 'HEALTH', 'MEDIA', 'DAILY'];

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between', flexShrink: 0 }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>{studentName?.toUpperCase() || 'ANTHONY'} PROFILE</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isEditing ? (
            <div className="edit-controls">
              <button onClick={handleSave} className="save-button" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>Save</button>
              <button onClick={handleCancel} className="cancel-button" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={handleEdit} className="edit-icon-button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>✏️</button>
          )}
          <button onClick={onClose} className="close-button">✕</button>
        </div>
      </header>

      <div className="side-panel-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ padding: '20px', flexShrink: 0, textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
          {isEditing && imageSrc && (
            <div className="crop-container" style={{ position: 'relative', height: '150px', marginBottom: '20px' }}>
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

          <div className="profile-image-container" style={{ marginBottom: '12px' }}>
            <div className="profile-image" style={{ width: '80px', height: '80px', margin: '0 auto', borderRadius: '50%', overflow: 'hidden', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--gold)' }}>
              {(isEditing && imageSrc) ? null : (profileImage ? <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize: '2rem'}}>👤</span>)}
            </div>
            {isEditing && (
              <label className="profile-image-upload" style={{ cursor: 'pointer', background: 'var(--gold)', color: 'black', padding: '2px 8px', borderRadius: '4px', marginTop: '8px', display: 'inline-block', fontWeight: 'bold', fontSize: '0.6rem' }}>
                Change Photo
                <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <h1 className="profile-name" style={{ fontSize: '1.2rem', margin: '4px 0' }}>{profile.firstName} {profile.lastName}</h1>
          <div style={{ color: 'var(--gold)', fontSize: '0.5rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.8 }}>
            SYNC MODE: {isGuest ? 'LOCAL' : 'CLOUD'}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="profile-tabs" style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          background: '#0a0a0a', 
          borderBottom: '1px solid var(--border)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 5 
        }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                color: activeTab === tab ? 'var(--gold)' : '#666',
                borderBottom: activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.65rem',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
                display: 'inline-flex'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          {/* TAB: Identity */}
          {activeTab === 'IDENTITY' && (
            <div className="tab-content">
              <div className="field-group">
                <label>First Name</label>
                <input type="text" value={editableProfile.firstName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('firstName', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Last Name</label>
                <input type="text" value={editableProfile.lastName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('lastName', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Toki Pona Name</label>
                <input type="text" value={editableProfile.tpName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('tpName', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Age</label>
                <input type="number" value={editableProfile.age || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('age', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Sex</label>
                <select value={editableProfile.sex || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('sex', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field-group">
                <label>Location</label>
                <input type="text" value={editableProfile.locationString || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('locationString', e.target.value)} />
              </div>
              <div className="field-group">
                <label>Difficulty</label>
                <select value={editableProfile.difficulty || 'Beginner'} disabled={!isEditing} onChange={(e) => handleFieldChange('difficulty', e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="field-group">
                <label>Interests (comma separated)</label>
                <input 
                  type="text" 
                  value={(editableProfile.interests || []).join(', ')} 
                  readOnly={!isEditing}
                  onChange={(e) => handleFieldChange('interests', e.target.value.split(',').map(s => s.trim()))} 
                />
              </div>
            </div>
          )}

          {/* TAB: Personality */}
          {activeTab === 'PERSONA' && (
            <div className="tab-content">
              <div className="field-group">
                <label>MBTI Type</label>
                <select value={editableProfile.mbti || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('mbti', e.target.value)}>
                  <option value="">Select...</option>
                  {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Enneagram</label>
                <select value={editableProfile.enneagram || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('enneagram', e.target.value)}>
                  <option value="">Select...</option>
                  {ENNEAGRAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', marginTop: 0, marginBottom: '15px' }}>BIG FIVE TRAITS</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { label: 'Openness', field: 'bigFiveOpenness' },
                    { label: 'Conscientiousness', field: 'bigFiveConscientiousness' },
                    { label: 'Extraversion', field: 'bigFiveExtraversion' },
                    { label: 'Agreeableness', field: 'bigFiveAgreeableness' },
                    { label: 'Neuroticism', field: 'bigFiveNeuroticism' }
                  ].map(trait => (
                    <div key={trait.field} className="field-group" style={{ marginBottom: 0 }}>
                      <label>{trait.label}</label>
                      <select value={(editableProfile as any)[trait.field] || ''} disabled={!isEditing} onChange={(e) => handleFieldChange(trait.field as any, e.target.value)}>
                        <option value="">Select...</option>
                        {BIG_FIVE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label>Attachment Style</label>
                <select value={editableProfile.attachmentStyle || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('attachmentStyle', e.target.value)}>
                  <option value="">Select...</option>
                  {ATTACHMENT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* TAB: Beliefs */}
          {activeTab === 'BELIEFS' && (
            <div className="tab-content">
              <div className="field-group">
                <label>Religion</label>
                <select value={editableProfile.religion || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('religion', e.target.value)}>
                  <option value="">Select...</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {editableProfile.religion === 'Other' && (
                <div className="field-group">
                  <label>Custom Religion</label>
                  <input type="text" value={editableProfile.religionOther || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('religionOther', e.target.value)} placeholder="Enter your religion..." />
                </div>
              )}
              
              <div className="field-group">
                <label>Political Identity (Multi-select)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {POLITICAL_IDENTITIES.map(id => {
                    const isSelected = (editableProfile.politicalIdentity || []).includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => isEditing && toggleMultiSelect('politicalIdentity', id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: '1px solid',
                          borderColor: isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                          background: isSelected ? 'var(--gold)' : 'transparent',
                          color: isSelected ? 'black' : '#888',
                          fontSize: '0.7rem',
                          fontWeight: isSelected ? 900 : 500,
                          cursor: isEditing ? 'pointer' : 'default',
                          transition: 'all 0.2s'
                        }}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>
              {(editableProfile.politicalIdentity || []).includes('Other') && (
                <div className="field-group">
                  <label>Custom Political Identity</label>
                  <input type="text" value={editableProfile.politicalIdentityOther || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('politicalIdentityOther', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* TAB: Health */}
          {activeTab === 'HEALTH' && (
            <div className="tab-content">
              <div className="field-group">
                <label>Blood Type</label>
                <select value={editableProfile.bloodType || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('bloodType', e.target.value)}>
                  <option value="">Select...</option>
                  {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Diet Pattern</label>
                <select value={editableProfile.dietPattern || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('dietPattern', e.target.value)}>
                  <option value="">Select...</option>
                  {DIET_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Workout Style</label>
                <select value={editableProfile.workoutStyle || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('workoutStyle', e.target.value)}>
                  <option value="">Select...</option>
                  {WORKOUT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Activity Level</label>
                <select value={editableProfile.activityLevel || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('activityLevel', e.target.value)}>
                  <option value="">Select...</option>
                  {ACTIVITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Chronic Conditions</label>
                <textarea 
                  value={editableProfile.chronicConditions || ''} 
                  readOnly={!isEditing} 
                  onChange={(e) => handleFieldChange('chronicConditions', e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Asthma"
                  style={{ width: '100%', padding: '10px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '4px', minHeight: '80px' }}
                />
              </div>
            </div>
          )}

          {/* TAB: Media */}
          {activeTab === 'MEDIA' && (
            <div className="tab-content" style={{ display: 'grid', gap: '24px' }}>
              {[
                { label: 'BOOKS', field: 'bookGenres', options: BOOK_GENRES },
                { label: 'TV & FILM', field: 'tvGenres', options: TV_GENRES },
                { label: 'MUSIC', field: 'musicGenres', options: MUSIC_GENRES },
                { label: 'GAMING', field: 'gamingGenres', options: GAMING_GENRES },
                { label: 'PLATFORMS', field: 'gamingPlatforms', options: GAMING_PLATFORMS }
              ].map(section => (
                <div key={section.label}>
                  <h4 style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', marginTop: 0, marginBottom: '12px' }}>{section.label}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {section.options.map(opt => {
                      const isSelected = (editableProfile[section.field as keyof typeof editableProfile] as string[] || []).includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => isEditing && toggleMultiSelect(section.field as any, opt)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: isSelected ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                            background: isSelected ? 'rgba(255,191,0,0.2)' : 'rgba(255,255,255,0.02)',
                            color: isSelected ? 'var(--gold)' : '#666',
                            fontSize: '0.6rem',
                            fontWeight: isSelected ? 900 : 500,
                            cursor: isEditing ? 'pointer' : 'default',
                            transition: 'all 0.1s'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: Daily Life */}
          {activeTab === 'DAILY' && (
            <div className="tab-content">
              <div className="field-group">
                <label>Chronotype</label>
                <select value={editableProfile.chronotype || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('chronotype', e.target.value)}>
                  <option value="">Select...</option>
                  {CHRONOTYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Work Schedule</label>
                <select value={editableProfile.workSchedule || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('workSchedule', e.target.value)}>
                  <option value="">Select...</option>
                  {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Living Situation</label>
                <select value={editableProfile.livingSituation || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('livingSituation', e.target.value)}>
                  <option value="">Select...</option>
                  {LIVING_SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Social Preference</label>
                <select value={editableProfile.socialPreference || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('socialPreference', e.target.value)}>
                  <option value="">Select...</option>
                  {SOCIAL_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Sections at bottom of each tab */}
        <div style={{ padding: '0 20px 20px 20px', flexShrink: 0 }}>
          <div className="profile-section" style={{ border: '1px solid var(--gold)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <h3 className="section-title" style={{ color: 'var(--gold)', margin: '0 0 16px 0', fontSize: '0.7rem' }}>Ranks & Badges</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>CURRENT RANK</div>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{summary.rankTitle}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '2px' }}>Level {summary.level} • {summary.xp} XP</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '4px' }}>STREAK SHIELDS</div>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  {[0, 1].map(i => (
                    <div key={i} style={{ fontSize: '1rem', opacity: i < streakShields ? 1 : 0.2 }}>🛡️</div>
                  ))}
                </div>
              </div>
            </div>

            {earnedCeremonialRanks.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '8px' }}>CEREMONIAL TITLES</div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {earnedCeremonialRanks.map(r => (
                    <div key={r.id} style={{ fontSize: '0.7rem', background: 'rgba(255,191,0,0.1)', padding: '4px 8px', borderRadius: '4px', borderLeft: '2px solid var(--gold)' }}>
                      <span style={{ fontWeight: 800 }}>{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <button onClick={handleSave} style={{ width: '100%', padding: '16px', background: 'var(--gold)', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 900, letterSpacing: '1px', cursor: 'pointer' }}>
              SAVE PROFILE
            </button>
          )}
        </div>

        <div className="auth-section" style={{ padding: '20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {isGuest || !user ? (
            <button onClick={handleGoogleSignIn} className="google-signin-button" style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 700, cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              SIGN IN WITH GOOGLE
            </button>
          ) : (
             <button onClick={() => logout()} className="logout-button" style={{ width: '100%', padding: '12px', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>LOG OUT</button>
          )}
        </div>
      </div>
      
      <style>{`
        .field-group {
          margin-bottom: 16px;
        }
        .field-group label {
          display: block;
          font-size: 0.6rem;
          color: #666;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }
        .field-group input[type="text"],
        .field-group input[type="number"],
        .field-group select {
          width: 100%;
          padding: 10px;
          background: #111;
          color: white;
          border: 1px solid #333;
          border-radius: 4px;
          font-size: 0.85rem;
          box-sizing: border-box;
        }
        .field-group input[readonly],
        .field-group select[disabled] {
          background: transparent;
          border-color: transparent;
          padding-left: 0;
          cursor: default;
        }
        .side-panel-content::-webkit-scrollbar {
          display: none;
        }
        .profile-tabs::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
