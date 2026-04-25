import { useMasteryStore } from '../store/masteryStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { 
    resetAsNewUser, masterAllVocab, randomizeVocab
  } = useMasteryStore();

  if (!isOpen) return null;

  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '32px', letterSpacing: '0.1em' }}>SYSTEM CONFIGURATION</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>DEVELOPER PROTOCOLS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <button 
            onClick={() => setIsSandboxMode(!isSandboxMode)} 
            className="btn-settings" 
            style={{ color: isSandboxMode ? 'var(--gold)' : 'white' }}
          >
            SANDBOX MODE: {isSandboxMode ? 'ACTIVE' : 'OFFLINE'}
          </button>
          <button onClick={randomizeVocab} className="btn-settings">RANDOMIZE NEURAL SYNC</button>
          <button onClick={masterAllVocab} className="btn-settings">FORCE TOTAL MASTERY</button>
          <button 
            onClick={() => { if(confirm("Wipe all local and cloud data?")) resetAsNewUser(); }} 
            className="btn-settings" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            PURGE NEURAL CACHE
          </button>
        </div>
      </section>

      <button onClick={onClose} className="btn-review" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE CONFIGURATION
      </button>
    </div>
  );
}
