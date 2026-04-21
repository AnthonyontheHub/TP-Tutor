import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 
import SettingsDrawer from './SettingsDrawer'; 
import type { MasteryStatus } from '../types/mastery';

export type SortMode = 'alphabetical' | 'status' | 'unlocked';

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

  return (
    <div className="dashboard">
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
        
        {/* NEW: Sort Options UI */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.7rem', color: '#666', alignSelf: 'center' }}>SORT BY:</span>
          {(['alphabetical', 'status', 'unlocked'] as SortMode[]).map(mode => (
            <button 
              key={mode}
              onClick={() => setSortMode(mode)}
              style={{ 
                background: sortMode === mode ? '#333' : 'transparent',
                color: sortMode === mode ? 'white' : '#666',
                border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer'
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

      {isSettingsOpen && (
        <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      )}
    </div>
  );
}
