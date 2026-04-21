import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SettingsDrawer from './SettingsDrawer'; 
import UserProfileDrawer from './UserProfileDrawer'; 
import SetupScreen from './SetupScreen';

export default function Dashboard({ onStartSession, onAskLina }: any) {
  const { studentName, currentStreak, vocabulary } = useMasteryStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [activeFilter, setActiveFilter] = useState<any>(null);

  if (!studentName || studentName === 'Student') return <SetupScreen />;

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
          <MasteryGrid onAskLina={onAskLina} activeFilter={activeFilter} />
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#666' }}>Phrasebook active.</div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} />}
      {isProfileOpen && <UserProfileDrawer onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
