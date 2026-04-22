import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

interface DashboardProps {
  onStartSession: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function Dashboard({ onStartSession, onOpenSettings, onOpenProfile, onAskLina, isSandboxMode }: DashboardProps) {
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
        
        <div className="dashboard__view-toggle" style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? '#3b82f6' : '#222', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: viewMode === 'phrasebook' ? '#3b82f6' : '#222', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>PHRASEBOOK</button>
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
            {savedPhrases.length === 0 ? <p>No phrases saved yet.</p> : savedPhrases.map((p, i) => (
              <div key={i} style={{ background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #10b981' }}>{p}</div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
