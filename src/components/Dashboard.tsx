import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SettingsDrawer from './SettingsDrawer'; 
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'unlocked'>('alphabetical');

  return (
    <div className="dashboard">
      <header className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #333' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>TOKI PONA</h1>
          <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6 }}>{studentName.toUpperCase()}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onStartSession} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>💬</button>
          <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>⚙️</button>
        </div>
      </header>

      <main style={{ padding: '20px' }}>
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '15px 0' }}>
          {['alphabetical', 'status', 'unlocked'].map(m => (
            <button key={m} onClick={() => setSortMode(m as any)} style={{ fontSize: '0.6rem', background: sortMode === m ? '#333' : 'none', color: 'white', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px' }}>{m.toUpperCase()}</button>
          ))}
        </div>
        <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} sortMode={sortMode} />
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
    </div>
  );
}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '15px 0' }}>
          {['alphabetical', 'status', 'unlocked'].map(m => (
            <button key={m} onClick={() => setSortMode(m as any)} style={{ fontSize: '0.6rem', background: sortMode === m ? '#333' : 'none', color: 'white', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px' }}>{m.toUpperCase()}</button>
          ))}
        </div>

        <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} sortMode={sortMode} />
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
    </div>
  );
}
          <button onClick={() => { onAskLina(`Is this correct: "${selectedWords.join(' ')}"?`); setSelectedWords([]); }} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>ASK LINA</button>
        </div>
      )}

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
    </div>
  );
}
  );
}
      )}

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      )}
    </div>
  );
}
             <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>⚙️</button>
          </div>
          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={(status) => { setActiveFilter(status); setSelectedWords([]); }} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px', marginTop: '-10px' }}>
          <span style={{ fontSize: '0.65rem', color: '#555', alignSelf: 'center', fontWeight: 'bold' }}>SORT:</span>
          {(['alphabetical', 'status', 'unlocked'] as SortMode[]).map(mode => (
            <button key={mode} onClick={() => setSortMode(mode)} style={{ background: sortMode === mode ? '#333' : 'transparent', color: sortMode === mode ? 'white' : '#666', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem', cursor: 'pointer' }}>{mode.toUpperCase()}</button>
          ))}
        </div>

        <MasteryGrid 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
          activeFilter={activeFilter} 
          selectedWords={selectedWords} 
          setSelectedWords={setSelectedWords} 
          sortMode={sortMode} 
        />
        
        <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} selectedWords={selectedWords} />
      </main>

      {selectedWords.length > 1 && (
        <div style={{ 
          position: 'fixed', bottom: '24px', left: '16px', right: '16px', 
          background: '#161616', border: '1px solid #3b82f6', borderRadius: '16px', 
          padding: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.9)', zIndex: 2000, 
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>SENTENCE BUILDER</span>
            <button onClick={() => setSelectedWords([])} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px' }}>CLEAR</button>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{selectedWords.join(' ')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => { onAskLina(`toki Lina! Is this correct: "${selectedWords.join(' ')}"?`); setSelectedWords([]); }} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold' }}>ASK LINA</button>
            <button onClick={() => onAskLina(`toki Lina, what does "${selectedWords.join(' ')}" mean?`)} style={{ background: '#222', color: 'white', border: '1px solid #444', borderRadius: '8px', padding: '12px', fontWeight: 'bold' }}>DEFINE COMBO</button>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      )}
    </div>
  );
}
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
          activeFilter={activeFilter} 
          selectedWords={selectedWords} 
          setSelectedWords={setSelectedWords} 
          sortMode={sortMode}
          sortDirection={sortDirection}
        />
        
        <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} selectedWords={selectedWords} />
      </main>

      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#161616', border: '1px solid #3b82f6', borderRadius: '16px', padding: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.9)', zIndex: 2000 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>SENTENCE BUILDER</span>
            <button onClick={() => setSelectedWords([])} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '0.7rem' }}>CLEAR</button>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>{selectedWords.join(' ')}</div>
          <button onClick={() => { onAskLina(`Practice: ${selectedWords.join(' ')}`); setSelectedWords([]); }} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold' }}>ASK LINA</button>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      )}
    </div>
  );
}
