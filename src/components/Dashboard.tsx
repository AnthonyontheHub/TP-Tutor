import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import SettingsDrawer from './SettingsDrawer'; 
import UserProfileDrawer from './UserProfileDrawer'; 
import SetupScreen from './SetupScreen'; // <-- NEW IMPORT
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onStartSession: () => void;
  onAskLina: (prompt: string) => void;
}

const POS_CATEGORIES = ['All', 'Noun', 'Verb', 'Adj', 'Particle', 'Pre-verb', 'Preposition', 'Number'];

const POS_DESCRIPTIONS: Record<string, { en: string, tp: string }> = {
  'All': { en: 'The complete dictionary.', tp: 'nimi ale' },
  'Noun': { en: 'Person, place, thing, or concept.', tp: 'nimi ijo (Acts as the head of a phrase)' },
  'Verb': { en: 'Action or state of being.', tp: 'nimi pali (Usually follows the particle "li" or "o")' },
  'Adj': { en: 'Describes or modifies another word.', tp: 'nimi ante (Always comes strictly AFTER the word it modifies)' },
  'Particle': { en: 'Grammatical marker that structures the sentence.', tp: 'li, e, la, pi, o (These have no direct English translation)' },
  'Pre-verb': { en: 'Auxiliary verb (e.g., want to, can, start to).', tp: 'wile, ken, kama, awen... (Placed directly before the main verb)' },
  'Preposition': { en: 'Shows location, direction, or relation (in, to, from).', tp: 'lon, tawa, tan, kepeken, sama' },
  'Number': { en: 'Quantifier or numeral.', tp: 'nimi nanpa (wan, tu, mute, ale...)' }
};

export default function Dashboard({ onStartSession, onAskLina }: Props) {
  const { studentName, currentStreak, savedPhrases, vocabulary } = useMasteryStore();
  const [isSandboxMode, setIsSandboxMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 
  const [isProfileOpen, setIsProfileOpen] = useState(false); 
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'phrasebook'>('grid');
  const [posFilter, setPosFilter] = useState('All');
  
  const [sortMode, setSortMode] = useState<'alphabetical' | 'status' | 'frequency' | 'length' | 'type'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // INTERCEPT: Show Setup Screen if user has not set a name yet
  if (!studentName || studentName === 'Student') {
    return <SetupScreen />;
  }

  const handleSortClick = (mode: 'alphabetical' | 'status' | 'frequency' | 'length' | 'type') => {
    if (sortMode === mode) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortMode(mode);
      setSortDirection('asc');
    }
  };

  const handleDailyReview = () => {
    const reviewWords = vocabulary
      .filter(w => w.status === 'practicing' || w.status === 'introduced')
      .sort(() => 0.5 - Math.random()) 
      .slice(0, 10)
      .map(w => w.word);

    if (reviewWords.length === 0) {
      onAskLina("toki Lina! I want to do a daily review, but my practice queue is empty. Can you teach me a new word?");
      return;
    }
    onAskLina(`toki Lina! Please give me a rapid-fire daily review quiz testing these words: ${reviewWords.join(', ')}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #333' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>TOKI PONA</h1>
          <button 
            onClick={() => setIsProfileOpen(true)} 
            style={{ background: 'none', border: 'none', padding: 0, margin: '4px 0 0 0', fontSize: '0.75rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            👤 {studentName.toUpperCase()}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {currentStreak > 0 && (
            <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.8rem', background: '#332a11', padding: '4px 8px', borderRadius: '12px' }}>
              🔥 {currentStreak} Day{currentStreak > 1 ? 's' : ''}
            </div>
          )}
          <button onClick={onStartSession} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>💬</button>
          <button onClick={() => setIsSettingsOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main" style={{ padding: '20px' }}>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => setViewMode('grid')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', background: viewMode === 'grid' ? '#3b82f6' : '#222', color: 'white' }}>VOCAB GRID</button>
          <button onClick={() => setViewMode('phrasebook')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', background: viewMode === 'phrasebook' ? '#10b981' : '#222', color: 'white' }}>PHRASEBOOK ({savedPhrases.length})</button>
        </div>

        {viewMode === 'grid' ? (
          <>
            <button onClick={handleDailyReview} style={{ width: '100%', padding: '12px', marginBottom: '20px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
              ⚡ START DAILY REVIEW
            </button>
            
            <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginTop: '15px', scrollbarWidth: 'none' }}>
              {POS_CATEGORIES.map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)} style={{ whiteSpace: 'nowrap', fontSize: '0.7rem', padding: '6px 12px', borderRadius: '20px', border: '1px solid #444', background: posFilter === pos ? '#fff' : '#222', color: posFilter === pos ? '#000' : '#aaa', cursor: 'pointer', fontWeight: posFilter === pos ? 'bold' : 'normal' }}>
                  {pos}
                </button>
              ))}
            </div>

            <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px', fontSize: '0.75rem', color: '#ccc', marginBottom: '15px', borderLeft: '4px solid #3b82f6' }}>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{posFilter}:</strong> {POS_DESCRIPTIONS[posFilter].en} <br/>
              <span style={{ color: '#8b5cf6', fontStyle: 'italic', display: 'inline-block', marginTop: '4px' }}>Toki Pona: {POS_DESCRIPTIONS[posFilter].tp}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', margin: '10px 0 15px 0' }}>
              {['alphabetical', 'frequency', 'status', 'length', 'type'].map(m => (
                <button key={m} onClick={() => handleSortClick(m as any)} style={{ fontSize: '0.6rem', background: sortMode === m ? '#3b82f6' : 'none', color: 'white', border: '1px solid #444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: sortMode === m ? 'bold' : 'normal' }}>
                  {m.toUpperCase()} {sortMode === m ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>

            <MasteryGrid onAskLina={onAskLina} isSandboxMode={isSandboxMode} activeFilter={activeFilter} sortMode={sortMode} sortDirection={sortDirection} posFilter={posFilter} />
          </>
        ) : (
          <div style={{ padding: '0 10px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>lipu pi toki pona</h2>
            {savedPhrases.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>You haven't saved any phrases yet.<br/>Use the Sentence Builder in the Vocab Grid to save your favorites!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {savedPhrases.map((phrase, idx) => (
                  <div key={idx} style={{ background: '#222', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 'bold' }}>{phrase}</div>
                    <button onClick={() => onAskLina(`toki Lina! Please review my saved phrase: "${phrase}"`)} style={{ marginTop: '10px', fontSize: '0.7rem', padding: '6px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>PRACTICE THIS</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {isSettingsOpen && <SettingsDrawer onClose={() => setIsSettingsOpen(false)} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
      {isProfileOpen && <UserProfileDrawer onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
            }
