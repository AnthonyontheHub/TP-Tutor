import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 
import SettingsDrawer from './SettingsDrawer'; 
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);
  
  // NEW: Sandbox is now TRUE by default
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">TOKI PONA</h1>
          <p className="dashboard__subtitle">
            MASTERY MAP — {curriculumLevel.toUpperCase()}
          </p>
        </div>
        <div className="dashboard__header-right" style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
             <button onClick={onStartSession} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0' }}>💬</button>
             <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0' }}>⚙️</button>
          </div>
          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        <MasteryGrid 
          onAskLina={onAskLina} 
          isSandboxMode={isSandboxMode} 
          activeFilter={activeFilter} 
        />
        
        {/* PhraseGrid now tracks what you are filtering for */}
        <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} />
      </main>

      {isSettingsOpen && (
        <SettingsDrawer 
          onClose={() => setIsSettingsOpen(false)} 
          isSandboxMode={isSandboxMode}
          setIsSandboxMode={setIsSandboxMode}
        />
      )}
    </div>
  );
}
