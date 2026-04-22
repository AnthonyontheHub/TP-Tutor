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

export default function Dashboard({ onStartSession, onAskLina }: { onStartSession: () => void; onAskLina: (p: string) => void }) {
  const { studentName, savedPhrases, deletePhrase, updatePhraseComment } = useMasteryStore();
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!studentName || studentName === 'Student') return <SetupScreen />;

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
        
        <div className="dashboard__view-toggle">
          <button onClick={() => setViewMode('grid')} className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} className={`btn-toggle ${viewMode === 'phrasebook' ? 'active' : ''}`}>PHRASEBOOK</button>
        </div>

        {viewMode === 'grid' ? (
          <MasteryGrid onAskLina={onAskLina} activeFilter={activeFilter} />
        ) : (
          <div style={{ padding: '20px 0' }}>
            <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} selectedWords={[]} />
            
            <h3 style={{ marginTop: '40px', color: '#fff', fontSize: '1.2rem', borderBottom: '1px solid #333', paddingBottom: '10px' }}>SAVED PHRASES</h3>
            {savedPhrases.length === 0 ? <p style={{ color: '#444' }}>No phrases saved.</p> : savedPhrases.map((p) => (
              <div key={p.id} style={{ background: '#111', padding: '15px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #222' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>{p.text}</div>
                  <button onClick={() => deletePhrase(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                </div>
                <textarea 
                  placeholder="Add a comment..."
                  value={p.comment}
                  onChange={(e) => updatePhraseComment(p.id, e.target.value)}
                  style={{ width: '100%', background: '#0a0a0a', border: '1px solid #333', color: '#888', padding: '8px', borderRadius: '6px', marginTop: '10px', fontSize: '0.8rem', fontFamily: 'inherit' }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {isProfileOpen && <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={true} setIsSandboxMode={() => {}} />}
    </div>
  );
}
