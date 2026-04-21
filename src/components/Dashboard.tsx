import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid'; 

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const studentName = useMasteryStore((s) => s.studentName);
  const curriculumLevel = useMasteryStore((s) => s.curriculumLevel);
  const lastUpdated = useMasteryStore((s) => s.lastUpdated);
  
  // To power our "Cheat Code" button
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  const [isSandboxMode, setIsSandboxMode] = useState(false);

  function handleMasterAll() {
    if (confirm("Are you sure you want to instantly master all words for testing?")) {
      vocabulary.forEach(word => {
        updateVocabStatus(word.id, 'mastered');
      });
    }
  }

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
          
          {/* CHEAT BUTTON & SANDBOX TOGGLE */}
          <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
             
             {/* TEMPORARY TESTING BUTTON */}
             <button 
               onClick={handleMasterAll}
               style={{ background: '#FFD700', color: '#000', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer' }}
             >
               ⚡ MASTER ALL (TESTING)
             </button>

             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      <footer className="dashboard__footer">
        <button className="btn-start" onClick={onStartSession}>
          ▶&nbsp;&nbsp;START SESSION
        </button>
      </footer>
    </div>
  );
}
