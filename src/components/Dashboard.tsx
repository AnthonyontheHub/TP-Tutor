import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SettingsDrawer from './SettingsDrawer'; 
import UserProfileDrawer from './UserProfileDrawer'; 
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

export default function Dashboard({ onStartSession, onAskLina }: { onStartSession: () => void; onAskLina: (p: string) => void }) {
  const { studentName, currentStreak, vocabulary, savedPhrases } = useMasteryStore();
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleSortClick = (mode: any) => {
    if (sortMode === mode) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortMode(mode); setSortDirection('asc'); }
  };

  const handleDailyReview = () => {
    const reviewWords = vocabulary.filter(w => w.status === 'practicing' || w.status === 'introduced').map(w => w.word);
    onAskLina(`toki Lina! Please quiz me on: ${reviewWords.slice(0,10).join(', ')}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setIsProfileOpen(true)} className="dashboard__profile-trigger">👤 {studentName.toUpperCase()}</button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={() => setIsSettingsOpen(true)} className="dashboard__icon-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        <button onClick={handleDailyReview} className="btn-review">⚡ START DAILY REVIEW</button>
        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '15px 0' }}>
              {['All', 'Noun', 'Verb', 'Adj'].map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)} className={`btn-toggle ${posFilter === pos ? 'active' : ''}`} style={{ fontSize: '0.7rem', padding: '6px 12px' }}>{pos}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '10px 0' }}>
               {['alphabetical', 'frequency', 'status'].map(m => (
                 <button key={m} onClick={() => handleSortClick(m)} className={`btn-toggle ${sortMode === m ? 'active' : ''}`} style={{ fontSize: '0.6rem', padding: '5px 10px' }}>
                   {m.toUpperCase()} {sortMode === m ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                 </button>
               ))}
            </div>
            <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} sortMode={sortMode} sortDirection={sortDirection} posFilter={posFilter} />
          </>
        ) : (
          <div style={{ padding: '20px 0' }}>
            {savedPhrases.length === 0 ? <p>No phrases saved.</p> : savedPhrases.map((p, i) => <div key={i} style={{ background: '#222', padding: '15px', borderRadius: '8px', margin: '10px 0' }}>{p}</div>)}
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
      {isProfileOpen && <UserProfileDrawer onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
