import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode, onOpenLogbook, onOpenMasteryCourt }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  onOpenLogbook: () => void;
  onOpenMasteryCourt?: () => void;
}) {
  const {
    resetAsNewUser, masterAllVocab, randomizeVocab, isMainProfile,
    knowledgeCheckFrequency, setKnowledgeCheckFrequency, clearAllSavedPhrases,
    resetLearningProgress, fogOfWar, setFogOfWar, resetProgress
  } = useMasteryStore();
  const { logout } = useAuthStore();

  const [localSandbox, setLocalSandbox] = useState(isSandboxMode);
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('TP_GEMINI_KEY') || '');
  const [localFreq, setLocalFreq] = useState(knowledgeCheckFrequency);
  const [localFogOfWar, setLocalFogOfWar] = useState(fogOfWar);

  useEffect(() => {
    if (isOpen) {
      setLocalSandbox(isSandboxMode);
      setLocalApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
      setLocalFreq(knowledgeCheckFrequency);
      setLocalFogOfWar(fogOfWar);
    }
  }, [isOpen, isSandboxMode, knowledgeCheckFrequency, fogOfWar]);

  if (!isOpen) return null;

  const isMainUser = isMainProfile;

  const handleSave = async () => {
    setIsSandboxMode(localSandbox);
    localStorage.setItem('TP_GEMINI_KEY', localApiKey);
    await setKnowledgeCheckFrequency(localFreq);
    setFogOfWar(localFogOfWar);
    onClose();
  };

  const handleResetProgress = async () => {
    if(confirm("Reset all lesson progress and vocabulary? Your profile and saved phrases will be kept.")) {
      resetProgress();
      onClose();
    }
  };

  const handleNukeAccount = async () => {
    if(confirm("WARNING: Reset EVERYTHING and start over as a new user? All progress, phrases, and your profile will be completely erased.")) {
      await resetAsNewUser();
      onClose();
    }
  };

  const handleRandomize = async () => {
    if(confirm("Randomize all vocabulary mastery? This will update your progress across all devices (unless Sandbox is ON).")) {
      await randomizeVocab();
      onClose();
    }
  };

  const handleMasterAll = async () => {
    if(confirm("Master all vocabulary? This will update your progress across all devices (unless Sandbox is ON).")) {
      await masterAllVocab();
      onClose();
    }
  };

  const handleClearPhrases = async () => {
    if(confirm("Clear all saved phrases? This will update your progress across all devices (unless Sandbox is ON).")) {
      await clearAllSavedPhrases();
      onClose();
    }
  };

  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '32px', letterSpacing: '0.1em' }}>SETTINGS</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '20px', opacity: 0.8 }}>TEACHER'S LOGBOOK & MASTERY</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <button 
            onClick={onOpenLogbook}
            className="btn-review"
            style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
          >
            VIEW TEACHER'S LOGBOOK
          </button>
          {onOpenMasteryCourt && (
            <button 
              onClick={onOpenMasteryCourt}
              className="btn-review"
              style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
            >
              MASTERY COURT
            </button>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>CORE CONFIGURATION</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SANDBOX MODE</span>
            <button 
              onClick={() => isMainUser && setLocalSandbox(!localSandbox)} 
              disabled={!isMainUser}
              className="btn-settings" 
              style={{ 
                margin: 0,
                width: 'auto',
                padding: '8px 16px',
                background: '#1a1a1a',
                border: '1px solid #d4af37',
                color: '#d4af37',
                opacity: isMainUser ? 1 : 0.5,
                cursor: isMainUser ? 'pointer' : 'not-allowed'
              }}
            >
              {localSandbox ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5 }}>GEMINI API KEY</span>
            <input 
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="settings-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5 }}>KNOWLEDGE CHECK FREQUENCY</span>
            <select 
              value={localFreq}
              onChange={(e) => setLocalFreq(e.target.value as any)}
              className="settings-input"
              style={{ width: '100%', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="daily">Daily</option>
              <option value="session">Every Session</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>FOG OF WAR</span>
            <button 
              onClick={() => setLocalFogOfWar(localFogOfWar === 'Strict' ? 'Visible' : 'Strict')} 
              className="btn-settings" 
              style={{ 
                margin: 0,
                width: 'auto',
                padding: '8px 16px',
                background: '#1a1a1a',
                border: '1px solid #d4af37',
                color: '#d4af37',
              }}
            >
              {localFogOfWar.toUpperCase()}
            </button>
          </div>

          <button onClick={handleSave} className="btn-review" style={{ width: '100%', marginTop: '10px' }}>
            SAVE SETTINGS
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px', color: '#ef4444' }}>DANGER ZONE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <button onClick={handleResetProgress} className="btn-settings" style={{ background: '#1a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}>Reset Progress (Keep Profile)</button>
          <button onClick={handleRandomize} className="btn-settings" style={{ background: '#1a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}>Randomize Word XP Points</button>
          <button onClick={handleMasterAll} className="btn-settings" style={{ background: '#1a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}>Master Everything (Full XP)</button>
          
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #7f1d1d' }}>
            <p className="settings-label" style={{ color: '#7f1d1d', marginBottom: '12px' }}>TOTAL WIPE</p>
            <button 
              onClick={handleNukeAccount} 
              className="btn-settings" 
              style={{ background: '#450a0a', color: '#f87171', border: '1px solid #7f1d1d' }}
            >
              Nuke Account & Erase Profile
            </button>
          </div>
        </div>
      </section>

      <button onClick={onClose} className="btn-review" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE SETTINGS
      </button>
    </div>
  );
}
