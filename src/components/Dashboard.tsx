import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 
import SettingsDrawer from './SettingsDrawer'; 

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);
  
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 

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
          
          {/* THE NEW ICON CLUSTER */}
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
             <button 
               onClick={onStartSession}
               style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0' }}
               title="Chat with Lina"
             >
               💬
             </button>
             <button 
               onClick={() => setIsSettingsOpen(true)}
               style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0', color: isSandboxMode ? '#aaa' : 'var(--text)' }}
               title="Settings"
             >
               ⚙️
             </button>
          </div>

          <span className="dashboard__student" style={{ display: 'block' }}>{studentName.toUpperCase()}</span>
          <span className="dashboard__date">SYNCED {lastUpdated}</span>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary />
        <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
        <PhraseGrid onAskLina={onAskLina} />
      </main>

      {/* Notice the footer block is completely gone! */}

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
