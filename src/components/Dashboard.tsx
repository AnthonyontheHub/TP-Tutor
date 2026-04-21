import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SettingsDrawer from './SettingsDrawer'; 
import UserProfileDrawer from './UserProfileDrawer'; 
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

const POS_CATEGORIES = ['All', 'Noun', 'Verb', 'Adj', 'Particle', 'Pre-verb', 'Preposition', 'Number'];

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const { studentName, currentStreak, savedPhrases, vocabulary } = useMasteryStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Prevent background scroll when drawers are open
  useEffect(() => {
    if (isSettingsOpen || isProfileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSettingsOpen, isProfileOpen]);

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleSortClick = (mode: any) => {
    if (sortMode === mode) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortMode(mode); setSortDirection('asc'); }
  };

  const handleDailyReview = () => {
    const reviewWords = vocabulary.filter(w => w.status === 'practicing' || w.status === 'introduced').map(w => w.word);
    if (reviewWords.length === 0) onAskLina("toki Lina! My practice queue is empty. Teach me something new?");
    else onAskLina(`toki Lina! Daily review quiz for: ${reviewWords.slice(0,10).join(', ')}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setIsProfileOpen(true)} className="dashboard__profile-trigger">
            👤 {studentName.toUpperCase()}
          </button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={() => setIsSettingsOpen(true)} className="dashboard__icon-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        {/* Progress Bar stays visible always */}
        <div style={{ marginTop: '20px' }}>
          <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        </div>

        <button onClick={handleDailyReview} className="btn-review" style={{ marginTop: '24px' }}>
          ⚡ START DAILY REVIEW
        </button>

        <div className="dashboard__view-toggle" style={{ marginTop: '12px' }}>
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div className="pos-filter-bar">
              {POS_CATEGORIES.map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)} className={`btn-pos ${posFilter === pos ? 'active' : ''}`}>{pos}</button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
              {['alphabetical', 'frequency', 'status'].map(m => (
                <button key={m} onClick={() => handleSortClick(m)} className={`btn-pos ${sortMode === m ? 'active' : ''}`} style={{ fontSize: '0.6rem' }}>
                  {m.toUpperCase()} {sortMode === m ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>

            <MasteryGrid onAskLina={onAskLina} isSandboxMode={true} activeFilter={activeFilter} sortMode={sortMode} sortDirection={sortDirection} posFilter={posFilter} />
          </>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#666' }}>
            Phrasebook coming soon...
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={true} setIsSandboxMode={() => {}} />}
      {isProfileOpen && <UserProfileDrawer onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
