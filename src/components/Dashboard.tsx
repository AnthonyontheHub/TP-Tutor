import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onStartSession: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function Dashboard({ onStartSession, onOpenSettings, onOpenProfile, onAskLina, isSandboxMode }: Props) {
  const { studentName, currentStreak, vocabulary, savedPhrases } = useMasteryStore();
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={onOpenProfile} className="dashboard__profile-trigger">👤 {studentName.toUpperCase()}</button>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={onOpenSettings} className="dashboard__icon-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <MasteryGrid 
            onAskLina={onAskLina} 
            isSandboxMode={isSandboxMode} 
            activeFilter={activeFilter} 
            posFilter={posFilter}
            setPosFilter={setPosFilter}
            sortMode="alphabetical"
            sortDirection="asc"
            setSortMode={() => {}}
            setSortDirection={() => {}}
          />
        ) : (
          <div style={{ padding: '20px 0' }}>
            {savedPhrases.length === 0 ? <p>No saved phrases.</p> : savedPhrases.map((p, i) => (
              <div key={i} style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>{p}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
