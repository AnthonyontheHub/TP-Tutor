import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode, onOpenLogbook }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  onOpenLogbook: () => void;
}) {
  const { 
    resetAsNewUser, masterAllVocab, randomizeVocab, isMainProfile,
    knowledgeCheckFrequency, setKnowledgeCheckFrequency, clearAllSavedPhrases,
    vocabulary
  } = useMasteryStore();
  const { logout } = useAuthStore();

  const [localSandbox, setLocalSandbox] = useState(isSandboxMode);
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('TP_GEMINI_KEY') || '');
  const [localFreq, setLocalFreq] = useState(knowledgeCheckFrequency);

  useEffect(() => {
    if (isOpen) {
      setLocalSandbox(isSandboxMode);
      setLocalApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
      setLocalFreq(knowledgeCheckFrequency);
    }
  }, [isOpen, isSandboxMode, knowledgeCheckFrequency]);

  if (!isOpen) return null;

  const isMainUser = isMainProfile;

  const handleSave = () => {
    setIsSandboxMode(localSandbox);
    localStorage.setItem('TP_GEMINI_KEY', localApiKey);
    setKnowledgeCheckFrequency(localFreq);
    onClose();
  };

  const handleReset = async () => {
    if(confirm("Wipe all local and cloud data? This will also sign you out.")) {
      await resetAsNewUser();
      await logout();
    }
  };

  const handleRandomize = async () => {
    if(confirm("Randomize all vocabulary mastery? This will also sign you out.")) {
      randomizeVocab();
      await logout();
    }
  };

  const handleMasterAll = async () => {
    if(confirm("Master all vocabulary? This will also sign you out.")) {
      masterAllVocab();
      await logout();
    }
  };

  const handleClearPhrases = async () => {
    if(confirm("Clear all saved phrases? This will also sign you out.")) {
      clearAllSavedPhrases();
      await logout();
    }
  };

  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '32px', letterSpacing: '0.1em' }}>SETTINGS</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: '20px', opacity: 0.8 }}>TEACHER'S LOGBOOK</h2>
        <button 
          onClick={onOpenLogbook}
          className="btn-review"
          style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
        >
          VIEW TEACHER'S LOGBOOK
        </button>
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
                color: localSandbox ? 'var(--gold)' : 'white',
                opacity: isMainUser ? 1 : 0.5,
                cursor: isMainUser ? 'pointer' : 'not-allowed'
              }}
            >
              {localSandbox ? 'ACTIVE' : 'OFFLINE'}
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

          <button onClick={handleSave} className="btn-review" style={{ width: '100%', marginTop: '10px' }}>
            SAVE SETTINGS
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px', color: '#ef4444' }}>DANGER ZONE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <button onClick={handleRandomize} className="btn-settings">RANDOMIZE NEURAL SYNC</button>
          <button onClick={handleMasterAll} className="btn-settings">FORCE TOTAL MASTERY</button>
          <button onClick={handleClearPhrases} className="btn-settings">CLEAR ALL SAVED PHRASES</button>
          <button 
            onClick={handleReset} 
            className="btn-settings" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            PURGE NEURAL CACHE
          </button>
        </div>
      </section>

      <button onClick={onClose} className="btn-review" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE SETTINGS
      </button>
    </div>
  );
}
