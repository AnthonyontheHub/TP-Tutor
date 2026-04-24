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

export default function Dashboard({ onStartSession, onAskLina, isSandboxMode, setIsSandboxMode }: {
  onStartSession: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { studentName, currentStreak, vocabulary, savedPhrases } = useMasteryStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<string>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusPhraseId, setFocusPhraseId] = useState<string | null>(null);

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleDailyReview = () => {
    const practicingWords = vocabulary
      .filter(w => w.status === 'practicing')
      .sort((a, b) => a.confidenceScore - b.confidenceScore) // lowest scores first
      .slice(0, 6)
      .map(w => `${w.word} (score: ${w.confidenceScore})`);
    const introducedWords = vocabulary
      .filter(w => w.status === 'introduced')
      .slice(0, 4)
      .map(w => w.word);

    if (practicingWords.length === 0 && introducedWords.length === 0) {
      onAskLina(`toki Lina! I have no words to review right now — either I haven't started yet or everything is mastered. What should we work on?`);
      return;
    }

    const parts: string[] = [];
    if (practicingWords.length > 0) parts.push(`Practicing (lowest scores first): ${practicingWords.join(', ')}`);
    if (introducedWords.length > 0) parts.push(`Introduced (need more practice): ${introducedWords.join(', ')}`);

    onAskLina(`toki Lina! Let's do a daily review. Please follow the 3-phase lesson structure.\n\n${parts.join('\n')}\n\nStart with Phase 1 — warm up my practicing words.`);
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
    </div>
  );
}
