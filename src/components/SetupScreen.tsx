/* src/components/SetupScreen.tsx */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

export default function SetupScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [location, setLocation] = useState('');
  const [tempImg, setTempImg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setStudentName = useMasteryStore((s) => s.setStudentName);
  const updateProfile = useMasteryStore((s) => s.updateProfile);
  const setProfileImage = useMasteryStore((s) => s.setProfileImage);
  const setHasCompletedSetup = useMasteryStore((s) => s.setHasCompletedSetup);

  const handleFinish = () => {
    if (name.trim()) {
      setStudentName(name.trim());
      updateProfile({ age, sex: sex || null, locationString: location });
      if (tempImg) setProfileImage(tempImg);
      setHasCompletedSetup(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTempImg(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="modal-backdrop" style={{ zIndex: 5000 }}>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ padding: '32px', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', letterSpacing: '0.2em', marginBottom: '8px' }}>
            STEP {step} OF 3
          </div>
          <div className="progress-bar-track" style={{ height: '4px', background: 'rgba(255,255,255,0.05)' }}>
            <div className="progress-bar-fill" style={{ width: `${(step/3)*100}%`, background: 'var(--cyan)' }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px', textAlign: 'center' }}>toki!</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginBottom: '24px' }}>Let's set up your student profile.</p>
              
              <label className="section-title">What is your name?</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="settings-input"
                style={{ fontSize: '1.1rem', padding: '16px', textAlign: 'center' }}
                autoFocus
              />
              <button onClick={nextStep} disabled={!name.trim()} className="btn-review" style={{ width: '100%', marginTop: '12px' }}>NEXT</button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>A bit more info...</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="section-title">Age</label>
                  <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="settings-input" />
                </div>
                <div>
                  <label className="section-title">Sex</label>
                  <input value={sex} onChange={(e) => {
                    const v = e.target.value;
                    setSex(v === 'Male' || v === 'Female' || v === 'Other' ? v : '');
                  }} placeholder="Male/Female/Other" className="settings-input" />
                </div>
              </div>
              <label className="section-title">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where are you from?" className="settings-input" />

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={prevStep} className="btn-toggle" style={{ flex: 1 }}>BACK</button>
                <button onClick={nextStep} className="btn-review" style={{ flex: 2, margin: 0 }}>NEXT</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', textAlign: 'center' }}>Final touch</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '20px' }}>Upload a profile photo (optional).</p>
              
              <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 24px auto' }}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    width: '100%', height: '100%', background: 'var(--surface)', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', 
                    cursor: 'pointer', border: '2px solid var(--border)', overflow: 'hidden'
                  }}
                >
                  {tempImg ? <img src={tempImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: '0', right: '0', background: 'var(--cyan)', 
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', border: '4px solid var(--bg)', color: 'black', fontSize: '1rem'
                }}>
                  +
                </div>
              </div>

              {tempImg && (
                <div className="glass-panel" style={{ padding: '10px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '4px' }}>Editor Placeholder</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>[ Pinch to Zoom / Drag to Pan ]</div>
                </div>
              )}

              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={prevStep} className="btn-toggle" style={{ flex: 1 }}>BACK</button>
                <button onClick={handleFinish} className="btn-review" style={{ flex: 2, margin: 0 }}>FINISH</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
