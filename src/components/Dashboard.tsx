/* src/components/Dashboard.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import type { MasteryStatus } from '../types/mastery';
import type { AppPanel } from '../App';


export default function Dashboard({ onTogglePanel, activePanels, onAskLina, isSandboxMode, setIsSandboxMode }: {
  onTogglePanel: (p: AppPanel) => void;
  activePanels: AppPanel[];
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
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

  const getActiveStyle = (p: AppPanel) => activePanels.includes(p) ? { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 10px var(--gold-glow)' } : {};

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button 
            onClick={() => onTogglePanel('profile')} 
            className="dashboard__profile-trigger"
            style={getActiveStyle('profile')}
          >
            👤 {studentName?.toUpperCase() || 'STUDENT'}
          </button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && (
            <div 
              className="dashboard__streak" 
              onClick={() => onTogglePanel('achievements')}
              style={getActiveStyle('achievements')}
            >
              🔥 {currentStreak}
            </div>
          )}
          <button onClick={() => onTogglePanel('instructions')} className="dashboard__icon-btn" style={getActiveStyle('instructions')}>?</button>
          <button onClick={() => onTogglePanel('chat')} className="dashboard__icon-btn" style={getActiveStyle('chat')}>💬</button>
          <button onClick={() => onTogglePanel('settings')} className="dashboard__icon-btn" style={getActiveStyle('settings')}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        {/* 1. Top Status Bar: The master counter */}
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        {/* 2. Action Row & 3. Roadmap Integration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <div className="mobile-action-row" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDailyReview} className="btn-review" style={{ flex: 1, marginBottom: 0 }}>
              ⚡ START DAILY REVIEW
            </button>
            <button 
              onClick={() => onTogglePanel('roadmap')} 
              className="btn-review" 
              style={{ 
                flex: 1,
                background: 'var(--surface)', 
                color: 'var(--gold)', 
                border: '1px solid var(--border)',
                boxShadow: 'none',
                marginBottom: 0
              }}
            >
              🗺️ ROADMAP
            </button>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '4px', padding: '4px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setReviewVibe('chill')}
              style={{ flex: 1, border: 'none', background: reviewVibe === 'chill' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'chill' ? 'black' : '#666', borderRadius: '2px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
            >
              CHILL MODE
            </button>
            <button 
              onClick={() => setReviewVibe('deep')}
              style={{ flex: 1, border: 'none', background: reviewVibe === 'deep' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'deep' ? 'black' : '#666', borderRadius: '2px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
            >
              DEEP MODE
            </button>
          </div>
        </div>

        {/* 4. Tabbed Navigation */}
        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <div className="grid-toolbar">
              <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="sort-select">
                <option value="All">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="number">Number</option>
                <option value="phrase">Phrase</option>
              </select>
            </div>
            {/* 5. Standard Vocab Grid */}
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
            <h3 className="section-title" style={{ marginTop: '30px', marginBottom: '15px' }}>SAVED PHRASES</h3>
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
