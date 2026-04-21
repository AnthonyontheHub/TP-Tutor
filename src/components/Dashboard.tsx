import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; // NEW IMPORT

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);

  const [isSandboxMode, setIsSandboxMode] = useState(false);

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
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
             <span style={{ fontSize: '0.7rem', color: isSandboxMode ? 'var(--text)' : 'var(--text-muted)' }}>
               {isSandboxMode ? 'SANDBOX ON (OFFLINE)' : 'SANDBOX OFF'}
             </span>
             <input 
               type="checkbox" 
               checked={isSandboxMode} 
               onChange={(e) => setIsSandboxMode(e.target.checked)}
               style={{ cursor: 'pointer' }}
             />
          </div>
          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary />
        <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
        
        {/* NEW: The Phrases section placed right below the vocab grid */}
        <PhraseGrid onAskLina={onAskLina} />
      </main>

      <footer className="dashboard__footer">
        <button className="btn-start" onClick={onStartSession}>
          ▶&nbsp;&nbsp;START SESSION
        </button>
      </footer>
    </div>
  );
}
