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
  const { studentName, vocabulary } = useMasteryStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen]   = useState(false);

  const [activeFilter,   setActiveFilter]   = useState<MasteryStatus | null>(null);
  const [viewMode,       setViewMode]       = useState<'grid' | 'phrasebook'>('grid');
  const [sortMode,       setSortMode]       = useState<string>('alphabetical');
  const [sortDirection,  setSortDirection]  = useState<'asc' | 'desc'>('asc');

  if (!studentName) return <SetupScreen />;

  const handleDailyReview = () => {
    const practicingWords = vocabulary
      .filter(w => w.status === 'practicing')
      .slice(0, 6)
      .map(w => w.word);
    const introducedWords = vocabulary
      .filter(w => w.status === 'introduced')
      .slice(0, 4)
      .map(w => w.word);

    if (practicingWords.length === 0 && introducedWords.length === 0) {
      onAskLina(`toki Lina! I have no words to review right now — either I haven't started yet or everything is mastered. What should we work on?`);
      return;
    }

    const parts: string[] = [];
    if (practicingWords.length > 0) parts.push(`Practicing: ${practicingWords.join(', ')}`);
    if (introducedWords.length > 0) parts.push(`Introduced: ${introducedWords.join(', ')}`);

    onAskLina(`toki Lina! Let's do a daily review.\n\n${parts.join('\n')}\n\nPlease quiz me on these words.`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button onClick={() => setIsProfileOpen(true)} className="dashboard__profile-trigger">👤 {studentName.toUpperCase()}</button>
        </div>
        <div className="dashboard__header-right">
          <button onClick={onStartSession} className="dashboard__icon-btn">💬</button>
          <button onClick={() => setIsSettingsOpen(true)} className="dashboard__icon-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        <button onClick={handleDailyReview} className="btn-review">⚡ START DAILY REVIEW</button>

        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASES</button>
        </div>

        {viewMode === 'grid' ? (
          <MasteryGrid
            onAskLina={onAskLina}
            isSandboxMode={isSandboxMode}
            activeFilter={activeFilter}
            sortMode={sortMode}
            sortDirection={sortDirection}
            setSortMode={setSortMode}
            setSortDirection={setSortDirection}
          />
        ) : (
          <div style={{ padding: '20px 0' }}>
            <PhraseGrid
              onAskLina={onAskLina}
              activeFilter={activeFilter}
              selectedWords={[]}
            />
          </div>
        )}
      </main>

      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />
      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
