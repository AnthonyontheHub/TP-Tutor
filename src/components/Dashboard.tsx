import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import SettingsDrawer from './SettingsDrawer'; 
import UserProfileDrawer from './UserProfileDrawer'; 
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

export default function Dashboard({ onStartSession, onAskLina }: { onStartSession: () => void; onAskLina: (p: string) => void }) {
  const { studentName, currentStreak, vocabulary, savedPhrases, profileImage } = useMasteryStore();
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleDailyReview = () => {
    const reviewWords = vocabulary.filter(w => w.status === 'practicing' || w.status === 'introduced').map(w => w.word);
    onAskLina(`toki Lina! Please quiz me on: ${reviewWords.slice(0,10).join(', ')}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setIsProfileOpen(true)} className="dashboard__profile-trigger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              {profileImage ? <img src={profileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
            </div>
            {studentName.toUpperCase()}
          </button>
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
          <MasteryGrid 
            onAskLina={onAskLina} 
            isSandboxMode={isSandboxMode} 
            activeFilter={activeFilter} 
            sortMode={sortMode} 
            sortDirection={sortDirection} 
            posFilter={posFilter}
            setSortMode={setSortMode}
            setSortDirection={setSortDirection}
            setPosFilter={setPosFilter} 
          />
        ) : (
          <div style={{ padding: '20px 0' }}>
            <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} selectedWords={[]} />
            
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              SAVED PHRASES
            </h3>
            {savedPhrases.length === 0 ? <p style={{ color: '#888' }}>No phrases saved yet.</p> : savedPhrases.map((p, i) => (
              <div key={i} style={{ background: '#111', borderLeft: '4px solid #10b981', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#eee' }}>{p}</div>
            ))}
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
