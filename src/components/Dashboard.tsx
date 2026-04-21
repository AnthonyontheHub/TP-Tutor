import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 
import SettingsDrawer from './SettingsDrawer'; 
import type { MasteryStatus } from '../types/mastery';

export type SortMode = 'alphabetical' | 'status' | 'unlocked' | 'usage';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);
  
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');

  const handleBuildSentence = () => {
    const sentence = selectedWords.join(' ');
    onAskLina(`toki Lina! I'm trying to build a sentence with these words: "${sentence}". Is this correct? Can you give me variations?`);
    setSelectedWords([]); 
  };

  return (
    <div className="dashboard" style={{ paddingBottom: selectedWords.length > 0 ? '160px' : '40px' }}>
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <p className="dashboard__subtitle">MASTERY MAP — {curriculumLevel.toUpperCase()}</p>
        </div>
        <div className="dashboard__header-right">
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
             <button onClick={onStartSession} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>💬</button>
             <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>⚙️</button>
          </div>
          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={(status) => { setActiveFilter(status); setSelectedWords([]); }} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '12px', marginTop: '-10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6rem', color: '#555', alignSelf: 'center', fontWeight: 'bold', marginRight: '4px' }}>SORT:</span>
          {(['alphabetical', 'status', 'unlocked', 'usage'] as SortMode[]).map(mode => (
            <button 
              key={mode} 
              onClick={() => setSortMode(mode)} 
              style={{ 
                background: sortMode === mode ? '#3b82f6' : 'transparent', 
                color: sortMode === mode ? 'white' : '#666', 
                border: sortMode === mode ? '1px solid #3b82f6' : '1px solid #333', 
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.55rem', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {mode.toUpperCase()}
            </button>
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

      {selectedWords.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#161616', border: '1px solid #3b82f6', borderRadius: '16px', padding: '20px', boxShadow: '0 12px 48px rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'bold' }}>SENTENCE BUILDER</span>
            <button onClick={() => setSelectedWords([])} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '20px' }}>CLEAR</button>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>{selectedWords.join(' ')}</div>
          <button onClick={handleBuildSentence} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold' }}>ASK LINA</button>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      )}
    </div>
  );
}
