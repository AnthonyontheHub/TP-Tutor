/* src/components/Dashboard.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import type { MasteryStatus } from '../types/mastery';
import type { AppView } from '../App';

export default function Dashboard({ onStartSession, onAskLina, isSandboxMode, setIsSandboxMode, setView }: {
  onStartSession: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
  setView: (v: AppView) => void;
}) {
  const { studentName, currentStreak, vocabulary, savedPhrases, reviewVibe, setReviewVibe } = useMasteryStore();

  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<string>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusPhraseId, setFocusPhraseId] = useState<string | null>(null);

  const handleDailyReview = () => {
    let targetWords: string[] = [];

    if (reviewVibe === 'chill') {
      targetWords = vocabulary
        .filter(w => w.status === 'confident' || w.status === 'mastered')
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 8)
        .map(w => w.word);
    } else {
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

  const handleSaved = (phraseId: string) => {
    setFocusPhraseId(phraseId);
    setViewMode('phrasebook');
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setView('profile')} className="dashboard__profile-trigger">👤 {studentName?.toUpperCase() || 'STUDENT'}</button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && <div className="dashboard__streak">🔥 {currentStreak}</div>}
          <button onClick={() => setView('instructions')} className="dashboard__icon-btn">?</button>
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={() => setView('settings')} className="dashboard__icon-btn">⚙️</button>
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
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setReviewVibe('chill')}
              style={{ 
                border: 'none', 
                background: reviewVibe === 'chill' ? 'white' : 'transparent', 
                color: reviewVibe === 'chill' ? 'black' : '#666',
                borderRadius: '8px',
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
                background: reviewVibe === 'deep' ? 'white' : 'transparent', 
                color: reviewVibe === 'deep' ? 'black' : '#666',
                borderRadius: '8px',
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

            <h3 className="section-title" style={{ marginTop: '30px', marginBottom: '15px' }}>
              SAVED PHRASES
            </h3>
            {savedPhrases.length === 0 ? <p style={{ color: '#888' }}>No phrases saved yet.</p> : savedPhrases.map((p, i) => (
              <div key={i} className="glass-panel" style={{ borderLeft: '4px solid var(--green)', marginBottom: '10px' }}>
                {typeof p === 'string' ? p : p.tp}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
