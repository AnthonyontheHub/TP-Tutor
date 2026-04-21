import { useState } from 'react';
import MasteryGrid from './MasteryGrid';
import ProgressSummary from './ProgressSummary';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

export default function Dashboard({ onAskLina, isSandboxMode }: { onAskLina: (p: string) => void, isSandboxMode: boolean }) {
  // 1. LIFTED STATE: These drive the sorting and filtering
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [sortMode, setSortMode] = useState<'word' | 'status' | 'partOfSpeech'>('word');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [posFilter, setPosFilter] = useState<string>('All');

  const { vocabulary } = useMasteryStore();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>TP-TUTOR DASHBOARD</h1>
        <ProgressSummary vocabulary={vocabulary} />
      </header>

      {/* TABS FOR CATEGORIES (Mastery Status) */}
      <nav className="category-tabs">
        <button onClick={() => setActiveFilter(null)} className={!activeFilter ? 'active' : ''}>ALL</button>
        <button onClick={() => setActiveFilter('unlocked')} className={activeFilter === 'unlocked' ? 'active' : ''}>UNLOCKED</button>
        <button onClick={() => setActiveFilter('learning')} className={activeFilter === 'learning' ? 'active' : ''}>LEARNING</button>
        <button onClick={() => setActiveFilter('mastered')} className={activeFilter === 'mastered' ? 'active' : ''}>MASTERED</button>
      </nav>

      <main className="dashboard-content">
        <MasteryGrid 
          onAskLina={onAskLina}
          isSandboxMode={isSandboxMode}
          // PASSING THE STATE DOWN
          activeFilter={activeFilter}
          sortMode={sortMode}
          sortDirection={sortDirection}
          posFilter={posFilter}
          // PASSING THE SETTERS DOWN
          setSortMode={setSortMode}
          setSortDirection={setSortDirection}
          setPosFilter={setPosFilter}
        />
      </main>
    </div>
  );
}
