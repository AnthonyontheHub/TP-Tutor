import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode, onOpenLogbook, onOpenSessionHistory, onOpenMasteryCourt, onOpenStoicArchive }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  onOpenLogbook: () => void;
  onOpenSessionHistory?: () => void;
  onOpenMasteryCourt?: () => void;
  onOpenStoicArchive?: () => void;
}) {
  const {
    resetAsNewUser, masterAllVocab, randomizeVocab, isMainProfile,
    knowledgeCheckFrequency, setKnowledgeCheckFrequency, clearAllSavedPhrases,
    resetLearningProgress
  } = useMasteryStore();
  const { logout } = useAuthStore();

  const [localSandbox, setLocalSandbox] = useState(isSandboxMode);
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('TP_GEMINI_KEY') || '');
  const [localFreq, setLocalFreq] = useState(knowledgeCheckFrequency);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const DANGER_CONFIG: Record<string, { label: string; confirmWord: string; warning: string }> = {
    randomize:    { label: 'RANDOMIZE NEURAL SYNC',      confirmWord: 'randomize', warning: 'This will randomize all vocabulary mastery statuses.' },
    masterAll:    { label: 'FORCE TOTAL MASTERY',         confirmWord: 'master',    warning: 'This will mark all vocabulary as mastered.' },
    clearPhrases: { label: 'CLEAR ALL SAVED PHRASES',     confirmWord: 'clear',     warning: 'This will permanently delete all your saved phrases.' },
    resetLearning:{ label: 'RESET LEARNING PROGRESS',     confirmWord: 'reset',     warning: 'Your profile is kept, but all vocab progress and streaks are wiped.' },
    wipeAll:      { label: 'WIPE EVERYTHING',             confirmWord: 'wipe',      warning: 'Wipes ALL local and cloud data. You will be signed out.' },
  };

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

  const handleConfirm = async () => {
    if (pendingAction === 'randomize') { randomizeVocab(); }
    else if (pendingAction === 'masterAll') { masterAllVocab(); }
    else if (pendingAction === 'clearPhrases') { clearAllSavedPhrases(); }
    else if (pendingAction === 'resetLearning') {
      await resetLearningProgress();
      setIsSandboxMode(false);
      onClose();
    }
    else if (pendingAction === 'wipeAll') {
      await resetAsNewUser();
      setIsSandboxMode(false);
      await logout();
    }
    setPendingAction(null);
    setConfirmInput('');
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
          {onOpenSessionHistory && (
            <button
              onClick={onOpenSessionHistory}
              className="btn-review"
              style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
            >
              VIEW SESSION HISTORY
            </button>
          )}
          {onOpenMasteryCourt && (
            <button
              onClick={onOpenMasteryCourt}
              className="btn-review"
              style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
            >
              MASTERY COURT
            </button>
          )}
          {onOpenStoicArchive && (
            <button
              onClick={onOpenStoicArchive}
              className="btn-review"
              style={{ width: '100%', background: '#111', border: '1px solid #222', color: 'var(--gold)' }}
            >
              📖 STOIC ARCHIVE
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
          {(['randomize', 'masterAll', 'clearPhrases', 'resetLearning', 'wipeAll'] as const).map(actionKey => (
            <div key={actionKey}>
              {pendingAction === actionKey ? (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 800 }}>{DANGER_CONFIG[actionKey].warning}</div>
                  <div style={{ fontSize: '0.65rem', color: '#888' }}>Type <strong style={{ color: 'white' }}>{DANGER_CONFIG[actionKey].confirmWord}</strong> to confirm</div>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={e => setConfirmInput(e.target.value)}
                    placeholder={DANGER_CONFIG[actionKey].confirmWord}
                    autoFocus
                    style={{ background: '#111', border: '1px solid #333', color: 'white', borderRadius: '4px', padding: '6px 10px', fontSize: '0.8rem', fontFamily: 'var(--font)' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleConfirm}
                      disabled={confirmInput !== DANGER_CONFIG[actionKey].confirmWord}
                      style={{ flex: 1, padding: '8px', background: confirmInput === DANGER_CONFIG[actionKey].confirmWord ? '#ef4444' : '#333', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 900, fontSize: '0.75rem', cursor: confirmInput === DANGER_CONFIG[actionKey].confirmWord ? 'pointer' : 'not-allowed', letterSpacing: '0.05em' }}
                    >
                      CONFIRM
                    </button>
                    <button
                      onClick={() => { setPendingAction(null); setConfirmInput(''); }}
                      style={{ padding: '8px 14px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setPendingAction(actionKey); setConfirmInput(''); }} className="btn-settings" style={{ width: '100%', background: '#1a1a1a', border: '1px solid #d4af37', color: '#d4af37' }}>
                  {DANGER_CONFIG[actionKey].label}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <button onClick={onClose} className="btn-review" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE SETTINGS
      </button>
    </div>
  );
}
