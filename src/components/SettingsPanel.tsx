import { useMasteryStore } from '../store/masteryStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { 
    widgetDensity, setWidgetDensity,
    fogOfWar, setFogOfWar,
    showCircuitPaths, setShowCircuitPaths,
    resetAsNewUser, masterAllVocab, randomizeVocab
  } = useMasteryStore();

  if (!isOpen) return null;

  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '32px', letterSpacing: '0.1em' }}>SYSTEM CONFIGURATION</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>DASHBOARD VISUALS</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>WIDGET DENSITY</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Adjust information level on tiles</div>
            </div>
            <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setWidgetDensity('Compact')}
                style={{ 
                  border: 'none', background: widgetDensity === 'Compact' ? 'var(--gold)' : 'transparent', 
                  color: widgetDensity === 'Compact' ? 'black' : 'white', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' 
                }}
              >COMPACT</button>
              <button 
                onClick={() => setWidgetDensity('Expanded')}
                style={{ 
                  border: 'none', background: widgetDensity === 'Expanded' ? 'var(--gold)' : 'transparent', 
                  color: widgetDensity === 'Expanded' ? 'black' : 'white', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' 
                }}
              >EXPANDED</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>FOG OF WAR</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Visibility of future curriculum nodes</div>
            </div>
            <div style={{ display: 'flex', background: 'var(--surface)', padding: '4px', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setFogOfWar('Strict')}
                style={{ 
                  border: 'none', background: fogOfWar === 'Strict' ? 'var(--gold)' : 'transparent', 
                  color: fogOfWar === 'Strict' ? 'black' : 'white', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' 
                }}
              >STRICT</button>
              <button 
                onClick={() => setFogOfWar('Visible')}
                style={{ 
                  border: 'none', background: fogOfWar === 'Visible' ? 'var(--gold)' : 'transparent', 
                  color: fogOfWar === 'Visible' ? 'black' : 'white', padding: '6px 12px', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' 
                }}
              >VISIBLE</button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>CIRCUIT PATHS</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Render neural connection streams</div>
            </div>
            <button 
              onClick={() => setShowCircuitPaths(!showCircuitPaths)}
              style={{ 
                border: '1px solid var(--border)', background: showCircuitPaths ? 'var(--gold)' : 'transparent', 
                color: showCircuitPaths ? 'black' : 'white', padding: '8px 16px', fontSize: '0.7rem', fontWeight: 900, borderRadius: '4px', cursor: 'pointer' 
              }}
            >
              {showCircuitPaths ? 'ACTIVE' : 'DISABLED'}
            </button>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>DEVELOPER PROTOCOLS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button onClick={() => setIsSandboxMode(!isSandboxMode)} className="btn-secondary" style={{ borderColor: isSandboxMode ? 'var(--gold)' : 'var(--border)' }}>
            SANDBOX: {isSandboxMode ? 'ON' : 'OFF'}
          </button>
          <button onClick={randomizeVocab} className="btn-secondary">RANDOMIZE SYNC</button>
          <button onClick={masterAllVocab} className="btn-secondary">FORCE TOTAL MASTERY</button>
          <button onClick={resetAsNewUser} className="btn-secondary" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>WIPE NEURAL CACHE</button>
        </div>
      </section>

      <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE CONFIGURATION
      </button>
    </div>
  );
}
