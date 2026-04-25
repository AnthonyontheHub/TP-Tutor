/* src/components/Dashboard.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import SettingsDrawer from './SettingsDrawer';
import UserProfileDrawer from './UserProfileDrawer';
import SetupScreen from './SetupScreen';
import type { MasteryStatus } from '../types/mastery';

import Instructions from './Instructions';

export default function Dashboard({ onStartSession, onAskLina, isSandboxMode, setIsSandboxMode }: {
  onStartSession: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { studentName, currentStreak, vocabulary, savedPhrases, reviewVibe, setReviewVibe } = useMasteryStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<string>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusPhraseId, setFocusPhraseId] = useState<string | null>(null);

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleDailyReview = () => {
    let targetWords: string[] = [];

    if (reviewVibe === 'chill') {
      // Prioritize confident and mastered words for a light review
      targetWords = vocabulary
        .filter(w => w.status === 'confident' || w.status === 'mastered')
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 8)
        .map(w => w.word);
    } else {
      // Deep mode: prioritize Introduced or Not Started
      targetWords = vocabulary
        .filter(w => w.status === 'introduced' || w.status === 'not_started')
        .sort((a, b) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999))
        .slice(0, 6)
        .map(w => w.word);
    }

    if (targetWords.length === 0) {
      onAskLina(`toki jan Lina! I'm in ${reviewVibe} mode but I have no words that fit that criteria. What should we work on instead?`);
      return;
    }

    onAskLina(`toki jan Lina! Let's do a daily review in **${reviewVibe.toUpperCase()}** mode. Focus on these words: ${targetWords.join(', ')}. Please follow the standard 3-phase lesson structure.`);
  };

  // Called by MasteryGrid after saving a phrase — switch to phrasebook and open note editor.
  const handleSaved = (phraseId: string) => {
    setFocusPhraseId(phraseId);
    setViewMode('phrasebook');
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setIsProfileOpen(true)} className="dashboard__profile-trigger">👤 {studentName.toUpperCase()}</button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={() => setIsHelpOpen(true)} className="dashboard__icon-btn">?</button>
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={() => setIsSettingsOpen(true)} className="dashboard__icon-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button 
            onClick={handleDailyReview} 
            className="btn-review" 
            style={{ flex: 1, marginBottom: 0 }}
          >
            ⚡ START DAILY REVIEW
          </button>
          <div style={{ display: 'flex', background: '#111', borderRadius: '10px', padding: '4px', border: '1px solid #222' }}>
            <button 
              onClick={() => setReviewVibe('chill')}
              style={{ 
                border: 'none', 
                background: reviewVibe === 'chill' ? '#3b82f6' : 'transparent', 
                color: reviewVibe === 'chill' ? 'white' : '#666',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              CHILL
            </button>
            <button 
              onClick={() => setReviewVibe('deep')}
              style={{ 
                border: 'none', 
                background: reviewVibe === 'deep' ? '#ec4899' : 'transparent', 
                color: reviewVibe === 'deep' ? 'white' : '#666',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              DEEP
            </button>
          </div>
        </div>

        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div className="grid-toolbar">
              <select
                id="pos-filter"
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="sort-select"
              >
                <option value="All">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="number">Number</option>
                <option value="phrase">Phrase</option>
              </select>
            </div>

            <MasteryGrid
              onAskLina={onAskLina}
              onSaved={handleSaved}
              isSandboxMode={isSandboxMode}
              activeFilter={activeFilter}
              sortMode={sortMode}
              sortDirection={sortDirection}
              posFilter={posFilter}
              setSortMode={setSortMode}
              setSortDirection={setSortDirection}
              setPosFilter={setPosFilter}
            />
          </>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <PhraseGrid
              onAskLina={onAskLina}
              activeFilter={activeFilter}
              selectedWords={[]}
              focusPhraseId={focusPhraseId}
              clearFocusPhrase={() => setFocusPhraseId(null)}
            />

            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              SAVED PHRASES
            </h3>
            {savedPhrases.length === 0 ? <p style={{ color: '#888' }}>No phrases saved yet.</p> : savedPhrases.map((p, i) => (
              <div key={i} style={{ background: '#111', borderLeft: '4px solid #10b981', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#eee' }}>
                {typeof p === 'string' ? p : p.tp}
              </div>
            ))}
          </div>
        )}
      </main>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <Instructions isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
