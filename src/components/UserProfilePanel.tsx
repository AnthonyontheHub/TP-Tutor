/* src/components/UserProfilePanel.tsx */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useMasteryStore } from '../store/masteryStore';
import type { UserProfile } from '../types/mastery';
import { useAuthStore } from '../store/authStore';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';
import InsightLedger from './InsightLedger';

interface Props {
  onClose: () => void;
  isOpen?: boolean;
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
    studentName, setStudentName, profile, updateProfile, setProfileImage,
    profileImage, getStatusSummary,
    earnedCeremonialRanks, streakShields
  } = useMasteryStore();
  const { logout, user, isGuest } = useAuthStore();
  
  const summary = getStatusSummary();
  
  const [activeTab, setActiveTab] = useState<TabID>('IDENTITY');
  const [isEditing, setIsEditing] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [editableProfile, setEditableProfile] = useState(profile);

  useEffect(() => {
    if (!isEditing) {
      setEditableProfile(profile);
    }
  }, [profile, isEditing]);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      await setProfileImage(croppedImage);
      setImageSrc(null);
    }
    
    if (editableProfile.firstName !== profile.firstName && editableProfile.firstName) {
       setStudentName(editableProfile.firstName);
    }
    
    await updateProfile(editableProfile);
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

  const handleFieldChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setEditableProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: keyof UserProfile, value: string) => {
    const current = (editableProfile[field] as string[]) || [];
    if (current.includes(value)) {
      handleFieldChange(field, current.filter(v => v !== value) as any);
    } else {
      handleFieldChange(field, [...current, value] as any);
    }
  };
  
  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
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
      className="side-panel flex flex-col"
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header justify-between shrink-0">
        <h2 className="text-[0.9rem] font-black tracking-[0.15em] text-[var(--gold)]">{studentName?.toUpperCase() || 'USER'} PROFILE</h2>
        <div className="flex gap-2 items-center">
          {isEditing ? (
            <div className="edit-controls">
              <button type="button" onClick={handleSave} className="save-button px-3 py-1 text-[0.7rem]">Save</button>
              <button type="button" onClick={handleCancel} className="cancel-button px-3 py-1 text-[0.7rem]">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={handleEdit} className="edit-icon-button bg-transparent border-none cursor-pointer text-base" aria-label="Edit profile">✏️</button>
          )}
          <button type="button" onClick={onClose} className="close-button" aria-label="Close profile">✕</button>
        </div>
      </header>

      <div className="side-panel-content hide-scrollbar flex-1 overflow-y-auto flex flex-col p-0">
        <div className="p-5 shrink-0 text-center bg-white/[0.02] border-b border-[var(--border)]">
          {isEditing && imageSrc && (
            <div className="crop-container relative h-[150px] mb-5">
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

          <div className="profile-image-container mb-3">
            <div className="profile-image w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#222] flex items-center justify-center border-2 border-[var(--gold)]">
              {(isEditing && imageSrc) ? null : (profileImage ? <img src={profileImage} alt="Profile photo" className="w-full h-full object-cover" /> : <span className="text-[2rem]">👤</span>)}
            </div>
            {isEditing && (
              <label 
                className="profile-image-upload cursor-pointer bg-[var(--gold)] text-black px-2 py-0.5 rounded mt-2 inline-block font-bold text-[0.6rem]"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') (e.currentTarget.querySelector('input') as HTMLInputElement)?.click(); }}
              >
                Change Photo
                <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} aria-label="Change profile photo" />
              </label>
            )}
          </div>
          <h1 className="profile-name text-[1.2rem] my-1">{profile.firstName} {profile.lastName}</h1>
          <div className="text-[var(--gold)] text-[0.5rem] font-black tracking-[0.1em] opacity-80 uppercase">
            SYNC MODE: {isGuest ? 'LOCAL' : 'CLOUD'}
          </div>
        </div>

        <div className="p-5 shrink-0">
          <div className="profile-section border border-[var(--gold)] rounded-lg p-4">
            <h3 className="section-title text-[var(--gold)] mt-0 mx-0 mb-4 text-[0.7rem] uppercase">Ranks & Badges</h3>
            
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[0.6rem] tracking-[0.1em] opacity-50 mb-1 uppercase">CURRENT RANK</div>
                <div className="text-base font-black text-white">{summary.rankTitle}</div>
                <motion.button 
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLedger(true)}
                  aria-label={`View insight ledger. Current level ${summary.level}, ${summary.xp} XP`}
                  className="bg-[var(--gold)]/[0.1] border border-[var(--gold)] rounded py-1 px-2 mt-1 cursor-pointer"
                >
                  <div className="text-[0.7rem] text-[var(--gold)] font-extrabold">Level {summary.level} • {summary.xp} XP</div>
                </motion.button>
              </div>
              <div className="text-right">
                <div className="text-[0.6rem] tracking-[0.1em] opacity-50 mb-1 uppercase">STREAK SHIELDS</div>
                <div className="flex gap-2 items-center justify-end">
                  <span className="text-[0.75rem] font-black text-[var(--gold)] mr-1">{streakShields} / 2</span>
                  <div className="flex gap-1">
                    {[0, 1].map(i => (
                      <div key={i} className={`text-[1.1rem] transition-all duration-300 ease-in-out ${i < streakShields ? 'opacity-100' : 'opacity-10 grayscale brightness-[0.4]'}`}>🛡️</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {earnedCeremonialRanks.length > 0 && (
              <div className="mt-4">
                <div className="text-[0.6rem] tracking-[0.1em] opacity-50 mb-2 uppercase">CEREMONIAL TITLES</div>
                <div className="grid gap-1.5">
                  {earnedCeremonialRanks.map(r => (
                    <div key={r.id} className="text-[0.7rem] bg-[var(--gold)]/[0.1] p-[4px_8px] rounded border-l-2 border-[var(--gold)]">
                      <span className="font-extrabold">{r.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="sticky bg-[#0a0a0a] border-b border-[var(--border)] top-0 z-10">
          <div className="profile-tabs hide-scrollbar flex overflow-x-auto whitespace-nowrap scroll-smooth px-1 bg-[#0a0a0a]">
            {tabs.map(tab => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 bg-transparent border-none text-[0.8rem] font-black uppercase tracking-[0.08em] whitespace-nowrap cursor-pointer transition-all duration-200 shrink-0 inline-flex border-b-2 ${
                  activeTab === tab ? 'text-[var(--gold)] border-[var(--gold)]' : 'text-[#555] border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* Scroll Indicator Gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-[11]" />
        </div>

        <div className="p-5 flex-1">
          {/* TAB: Identity */}
          {activeTab === 'IDENTITY' && (
            <div className="tab-content">
              <div className="field-group">
                <label htmlFor="profile-firstName">First Name</label>
                <input id="profile-firstName" type="text" value={editableProfile.firstName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('firstName', e.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="profile-lastName">Last Name</label>
                <input id="profile-lastName" type="text" value={editableProfile.lastName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('lastName', e.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="profile-tpName">Toki Pona Name</label>
                <input id="profile-tpName" type="text" value={editableProfile.tpName || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('tpName', e.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="profile-age">Age</label>
                <input id="profile-age" type="number" value={editableProfile.age || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('age', e.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="profile-sex">Sex</label>
                <select id="profile-sex" value={editableProfile.sex || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('sex', e.target.value as any)}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-location">Location</label>
                <input id="profile-location" type="text" value={editableProfile.locationString || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('locationString', e.target.value)} />
              </div>
              <div className="field-group">
                <label htmlFor="profile-difficulty">Difficulty</label>
                <select id="profile-difficulty" value={editableProfile.difficulty || 'Beginner'} disabled={!isEditing} onChange={(e) => handleFieldChange('difficulty', e.target.value as any)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-interests">Interests (comma separated)</label>
                <input 
                  id="profile-interests"
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
                <label htmlFor="profile-mbti">MBTI Type</label>
                <select id="profile-mbti" value={editableProfile.mbti || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('mbti', e.target.value)}>
                  <option value="">Select...</option>
                  {MBTI_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-enneagram">Enneagram</label>
                <select id="profile-enneagram" value={editableProfile.enneagram || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('enneagram', e.target.value)}>
                  <option value="">Select...</option>
                  {ENNEAGRAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="mb-5 border border-white/[0.05] p-[15px] rounded-lg bg-white/[0.02]">
                <h4 className="text-[0.65rem] text-[var(--gold)] tracking-[0.1em] mt-0 mb-[15px] uppercase">BIG FIVE TRAITS</h4>
                <div className="grid gap-3">
                  {[
                    { label: 'Openness', field: 'bigFiveOpenness' as const },
                    { label: 'Conscientiousness', field: 'bigFiveConscientiousness' as const },
                    { label: 'Extraversion', field: 'bigFiveExtraversion' as const },
                    { label: 'Agreeableness', field: 'bigFiveAgreeableness' as const },
                    { label: 'Neuroticism', field: 'bigFiveNeuroticism' as const }
                  ].map(trait => (
                    <div key={trait.field} className="field-group mb-0">
                      <label htmlFor={`profile-${trait.field}`}>{trait.label}</label>
                      <select id={`profile-${trait.field}`} value={editableProfile[trait.field] || ''} disabled={!isEditing} onChange={(e) => handleFieldChange(trait.field, e.target.value as any)}>
                        <option value="">Select...</option>
                        {BIG_FIVE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="profile-attachment">Attachment Style</label>
                <select id="profile-attachment" value={editableProfile.attachmentStyle || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('attachmentStyle', e.target.value)}>
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
                <label htmlFor="profile-religion">Religion</label>
                <select id="profile-religion" value={editableProfile.religion || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('religion', e.target.value)}>
                  <option value="">Select...</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {editableProfile.religion === 'Other' && (
                <div className="field-group">
                  <label htmlFor="profile-religionOther">Custom Religion</label>
                  <input id="profile-religionOther" type="text" value={editableProfile.religionOther || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('religionOther', e.target.value)} placeholder="Enter your religion..." />
                </div>
              )}
              
              <div className="field-group">
                <label>Political Identity (Multi-select)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {POLITICAL_IDENTITIES.map(id => {
                    const isSelected = (editableProfile.politicalIdentity || []).includes(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        aria-pressed={isSelected}
                        onClick={() => isEditing && toggleMultiSelect('politicalIdentity', id)}
                        className={`px-3 py-1.5 rounded-[20px] border text-[0.7rem] transition-all duration-200 ${
                          isSelected ? 'border-[var(--gold)] bg-[var(--gold)] text-black font-black' : 'border-white/10 bg-transparent text-[#888] font-medium'
                        } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>
              {(editableProfile.politicalIdentity || []).includes('Other') && (
                <div className="field-group">
                  <label htmlFor="profile-politicalOther">Custom Political Identity</label>
                  <input id="profile-politicalOther" type="text" value={editableProfile.politicalIdentityOther || ''} readOnly={!isEditing} onChange={(e) => handleFieldChange('politicalIdentityOther', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* TAB: Health */}
          {activeTab === 'HEALTH' && (
            <div className="tab-content">
              <div className="field-group">
                <label htmlFor="profile-bloodType">Blood Type</label>
                <select id="profile-bloodType" value={editableProfile.bloodType || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('bloodType', e.target.value)}>
                  <option value="">Select...</option>
                  {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-diet">Diet Pattern</label>
                <select id="profile-diet" value={editableProfile.dietPattern || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('dietPattern', e.target.value)}>
                  <option value="">Select...</option>
                  {DIET_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-workout">Workout Style</label>
                <select id="profile-workout" value={editableProfile.workoutStyle || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('workoutStyle', e.target.value)}>
                  <option value="">Select...</option>
                  {WORKOUT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-activity">Activity Level</label>
                <select id="profile-activity" value={editableProfile.activityLevel || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('activityLevel', e.target.value)}>
                  <option value="">Select...</option>
                  {ACTIVITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-chronic">Chronic Conditions</label>
                <textarea 
                  id="profile-chronic"
                  value={editableProfile.chronicConditions || ''} 
                  readOnly={!isEditing} 
                  onChange={(e) => handleFieldChange('chronicConditions', e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Asthma"
                />
              </div>
            </div>
          )}

          {/* TAB: Media */}
          {activeTab === 'MEDIA' && (
            <div className="tab-content grid gap-6">
              {[
                { label: 'BOOKS', field: 'bookGenres', options: BOOK_GENRES },
                { label: 'TV & FILM', field: 'tvGenres', options: TV_GENRES },
                { label: 'MUSIC', field: 'musicGenres', options: MUSIC_GENRES },
                { label: 'GAMING', field: 'gamingGenres', options: GAMING_GENRES },
                { label: 'PLATFORMS', field: 'gamingPlatforms', options: GAMING_PLATFORMS }
              ].map(section => (
                <div key={section.label}>
                  <h4 className="text-[0.65rem] text-[var(--gold)] tracking-[0.1em] mt-0 mb-3 uppercase">{section.label}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {section.options.map(opt => {
                      const isSelected = (editableProfile[section.field as keyof typeof editableProfile] as string[] || []).includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          aria-pressed={isSelected}
                          onClick={() => isEditing && toggleMultiSelect(section.field as keyof UserProfile, opt)}
                          className={`px-2.5 py-1 rounded border transition-all duration-100 text-[0.6rem] ${
                            isSelected ? 'border-[var(--gold)] bg-[var(--gold)]/20 text-[var(--gold)] font-black' : 'border-white/5 bg-white/[0.02] text-[#666] font-medium'
                          } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
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
                <label htmlFor="profile-chronotype">Chronotype</label>
                <select id="profile-chronotype" value={editableProfile.chronotype || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('chronotype', e.target.value)}>
                  <option value="">Select...</option>
                  {CHRONOTYPES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-workSchedule">Work Schedule</label>
                <select id="profile-workSchedule" value={editableProfile.workSchedule || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('workSchedule', e.target.value)}>
                  <option value="">Select...</option>
                  {WORK_SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-livingSituation">Living Situation</label>
                <select id="profile-livingSituation" value={editableProfile.livingSituation || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('livingSituation', e.target.value)}>
                  <option value="">Select...</option>
                  {LIVING_SITUATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="profile-social">Social Preference</label>
                <select id="profile-social" value={editableProfile.socialPreference || ''} disabled={!isEditing} onChange={(e) => handleFieldChange('socialPreference', e.target.value)}>
                  <option value="">Select...</option>
                  {SOCIAL_PREFERENCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Sections at bottom of each tab */}
        <div className="p-[0_20px_20px_20px] shrink-0">
          {isEditing && (
            <button type="button" onClick={handleSave} className="w-full p-4 bg-[var(--gold)] text-black border-none rounded-lg font-black tracking-widest cursor-pointer">
              SAVE PROFILE
            </button>
          )}
        </div>

        <div className="auth-section p-5 border-t border-[var(--border)] shrink-0">
          {isGuest || !user ? (
            <button type="button" onClick={handleGoogleSignIn} className="google-signin-button w-full p-3 bg-white text-black border-none rounded-lg flex items-center justify-center gap-2.5 font-bold cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              SIGN IN WITH GOOGLE
            </button>
          ) : (
             <button type="button" onClick={() => logout()} className="logout-button w-full p-3 bg-red-500/10 text-[#ff4d4d] border border-[#ff4d4d] rounded-lg font-bold cursor-pointer">LOG OUT</button>
          )}
        </div>
      </div>
      
      {showLedger && (
        <InsightLedger onClose={() => setShowLedger(false)} />
      )}

      <style>{`
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
