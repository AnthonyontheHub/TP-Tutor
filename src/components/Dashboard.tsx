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
  const { studentName, currentStreak, vocabulary, savedPhrases, removePhrase, updatePhraseComment } = useMasteryStore();
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!studentName || studentName === 'Student') return <SetupScreen />;

  const handleDailyReview = () => {
    const reviewWords = vocabulary.filter(w => w.status === 'practicing' || w.status === 'introduced').map(w => w.word);
    onAskLina(`toki Lina! Please quiz me on: ${reviewWords.slice(0,10).join(', ')}`);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '0 5px' }}>
              <label htmlFor="pos-filter" style={{ fontWeight: 'bold' }}>Filter POS:</label>
              <select 
                id="pos-filter"
                value={posFilter} 
                onChange={(e) => setPosFilter(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', background: '#222', color: '#fff', border: '1px solid #444', outline: 'none' }}
              >
                <option value="All">All Parts of Speech</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="phrase">Phrase</option>
              </select>
            </div>
            
            <MasteryGrid 
              onAskLina={onAskLina} 
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
            <PhraseGrid onAskLina={onAskLina} activeFilter={activeFilter} selectedWords={[]} />
            
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              SAVED PHRASES
            </h3>
            {savedPhrases.length === 0 ? <p style={{ color: '#888' }}>No phrases saved yet.</p> : savedPhrases.map((p, i) => {
              // Backward compatibility mapping
              const phraseObj = typeof p === 'string' ? { id: p, text: p, comment: '' } : p;
              
              return (
                <div key={phraseObj.id} style={{ background: '#111', borderLeft: '4px solid #10b981', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#eee', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{phraseObj.text}</span>
                    <button onClick={() => removePhrase(phraseObj.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                  </div>
                  <input 
                    value={phraseObj.comment || ''}
                    onChange={(e) => updatePhraseComment(phraseObj.id, e.target.value)}
                    placeholder="Add a comment or translation..."
                    style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '8px', color: 'white', width: '100%', outline: 'none' }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
      {isProfileOpen && <UserProfileDrawer onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
}
