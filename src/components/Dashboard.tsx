import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

export default function Dashboard({ onStartSession, onAskLina, isSandboxMode }: { onStartSession: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const { studentName, currentStreak } = useMasteryStore();
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button className="dashboard__profile-trigger">👤 {studentName.toUpperCase()}</button>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div style={{ marginBottom: '20px' }}>
              <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} style={{ width: '100%', padding: '12px', background: '#111', color: 'white', borderRadius: '8px', border: '1px solid #333' }}>
                <option value="All">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
              </select>
            </div>
            <MasteryGrid 
              onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} 
              sortMode={sortMode} sortDirection={sortDirection} posFilter={posFilter}
              setSortMode={setSortMode} setSortDirection={setSortDirection} setPosFilter={setPosFilter}
            />
          </>
        ) : (
          <PhraseGrid onAskLina={onAskLina} />
        )}
      </main>
    </div>
  );
}
