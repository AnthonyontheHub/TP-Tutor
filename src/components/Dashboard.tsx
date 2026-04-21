import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 
import SettingsDrawer from './SettingsDrawer'; 
import type { MasteryStatus } from '../types/mastery';

export type SortMode = 'alphabetical' | 'status' | 'unlocked' | 'usage';
export type SortDirection = 'asc' | 'desc';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}

export default function Dashboard({ onStartSession, onAskLina, isSandboxMode, setIsSandboxMode }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSortClick = (mode: SortMode) => {
    if (sortMode === mode) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMode(mode);
      setSortDirection('asc');
    }
  };

  return (
    <div className="dashboard" style={{ paddingBottom: selectedWords.length > 0 ? '180px' : '40px' }}>
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <p className="dashboard__subtitle">MASTERY MAP — {curriculumLevel.toUpperCase()}</p>
        </div>
        <div className="dashboard__header-right">
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
             <button onClick={onStartSession} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem' }}>💬</button>
             <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem' }}>⚙️</button>
          </div>
          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={(status) => { setActiveFilter(status); setSelectedWords([]); }} />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(['alphabetical', 'status', 'unlocked', 'usage'] as SortMode[]).map(mode => (
            <button 
              key={mode} 
              onClick={() => handleSortClick(mode)} 
              style={{ 
                background: sortMode === mode ? '#3b82f6' : '#111', 
                color: sortMode === mode ? 'white' : '#666', 
                border: '1px solid #333', padding: '6px 10px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold'
              }}
            >
              {mode.toUpperCase()} {sortMode === mode && (sortDirection === 'asc' ? '↑' : '↓')}
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
