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
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSortClick = (mode: 'alphabetical' | 'status' | 'unlocked') => {
    if (sortMode === mode) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMode(mode);
      setSortDirection('asc');
    }
  };

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

      <main className="dashboard__main" style={{ padding: '20px' }}>
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', margin: '15px 0' }}>
          {['alphabetical', 'status', 'unlocked'].map(m => (
            <button 
              key={m} 
              onClick={() => handleSortClick(m as any)} 
              style={{ fontSize: '0.6rem', background: sortMode === m ? '#333' : 'none', color: 'white', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              {m.toUpperCase()} {sortMode === m ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
        <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} sortMode={sortMode} sortDirection={sortDirection} />
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
    </div>
  );
}
