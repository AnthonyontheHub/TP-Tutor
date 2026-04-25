/* src/components/Dashboard.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import CurriculumRoadmap from './CurriculumRoadmap';
import SentenceBuilder from './SentenceBuilder';
import { fetchQuickTranslation, resolveApiKey, buildOfflineTranslation } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';
import type { AppPanel } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

export type DashboardView = 'vocab' | 'roadmap' | 'phrasebook';

export default function Dashboard({ onTogglePanel, activePanels, onAskLina, isSandboxMode, setIsSandboxMode }: {
  onTogglePanel: (p: AppPanel) => void;
  activePanels: AppPanel[];
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { studentName, currentStreak, vocabulary, savedPhrases, reviewVibe, setReviewVibe, selectedWords, setSelectedWords, savePhrase, lessonFilter, setLessonFilter } = useMasteryStore();

  const [activeView, setActiveView] = useState<DashboardView>('vocab');
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<string>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusPhraseId, setFocusPhraseId] = useState<string | null>(null);

  // Translation & Builder State
  const [translation, setTranslation] = useState<string | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTranslation(null);
    setIsAutoTranslating(false);
    if (confirmTimer.current) { clearTimeout(confirmTimer.current); confirmTimer.current = null; }
    setSavedConfirm(false);

    if (selectedWords.length === 0) return;

    if (isSandboxMode) {
      setTranslation(buildOfflineTranslation(selectedWords, vocabulary));
      return;
    }

    const apiKey = resolveApiKey();
    if (!apiKey) {
      setTranslation(buildOfflineTranslation(selectedWords, vocabulary));
      return;
    }

    setIsAutoTranslating(true);
    let active = true;
    const timer = setTimeout(async () => {
      const transResult = await fetchQuickTranslation(apiKey, selectedWords.join(' '));
      if (active) {
        setTranslation(transResult ?? buildOfflineTranslation(selectedWords, vocabulary));
        setIsAutoTranslating(false);
      }
    }, 900);

    return () => { active = false; clearTimeout(timer); setIsAutoTranslating(false); };
  }, [selectedWords, isSandboxMode, vocabulary]);

  const handleDailyReview = () => {
    let targetWords: string[] = [];
    if (reviewVibe === 'chill') {
      targetWords = vocabulary
        .filter(w => w.status === 'confident' || w.status === 'mastered')
        .sort((a, b) => b.baseScore - a.baseScore)
        .slice(0, 8)
        .map(w => w.word);
    } else {
      targetWords = vocabulary
        .filter(w => w.status === 'introduced' || w.status === 'not_started')
        .sort((a, b) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999))
        .slice(0, 6)
        .map(w => w.word);
    }

    if (targetWords.length === 0) {
      onAskLina(`toki jan Lina! I'm in ${reviewVibe} mode but I have no words that fit that criteria. What should we work on instead?`);
      return;
    }
    onAskLina(`toki jan Lina! Let's do a daily review in **${reviewVibe.toUpperCase()}** mode. Focus on these words: ${targetWords.join(', ')}. Please follow the standard 3-phase lesson structure.`);
  };

  const handleSaved = (phraseId: string) => {
    setFocusPhraseId(phraseId);
    setActiveView('phrasebook');
  };

  const handleSaveSentence = () => {
    const sentence = selectedWords.join(' ');
    savePhrase({ id: sentence, tp: sentence, en: translation ?? '', notes: '' });
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setSavedConfirm(true);
    confirmTimer.current = setTimeout(() => {
      setSavedConfirm(false);
      confirmTimer.current = null;
      setSelectedWords([]);
    }, 800);
  };

  const getActiveStyle = (p: AppPanel) => activePanels.includes(p) ? { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 10px var(--gold-glow)' } : {};

  return (
    <div className="dashboard">
      {/* Row 1: Mastery Counters */}
      <header className="dashboard__header" style={{ marginBottom: '8px' }}>
        <div className="dashboard__header-left">
          <h1 className="dashboard__title">TOKI PONA</h1>
          <button 
            onClick={() => onTogglePanel('profile')} 
            className="dashboard__profile-trigger"
            style={getActiveStyle('profile')}
          >
            👤 {studentName?.toUpperCase() || 'STUDENT'}
          </button>
        </div>
        <div className="dashboard__header-right">
          {currentStreak > 0 && (
            <div 
              className="dashboard__streak" 
              onClick={() => onTogglePanel('achievements')}
              style={getActiveStyle('achievements')}
            >
              🔥 {currentStreak}
            </div>
          )}
          <button onClick={() => onTogglePanel('instructions')} className="dashboard__icon-btn" style={getActiveStyle('instructions')}>?</button>
          <button onClick={() => onTogglePanel('chat')} className="dashboard__icon-btn" style={getActiveStyle('chat')}>💬</button>
          <button onClick={() => onTogglePanel('settings')} className="dashboard__icon-btn" style={getActiveStyle('settings')}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main">
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        {/* Row 2: Review Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div className="mobile-action-row" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleDailyReview} className="btn-review" style={{ flex: 1, marginBottom: 0 }}>
              ⚡ START DAILY REVIEW
            </button>
            <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '4px', padding: '4px', border: '1px solid var(--border)', flex: 1 }}>
              <button 
                onClick={() => setReviewVibe('chill')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'chill' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'chill' ? 'black' : '#666', borderRadius: '2px', padding: '6px 8px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
              >
                CHILL
              </button>
              <button 
                onClick={() => setReviewVibe('deep')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'deep' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'deep' ? 'black' : '#666', borderRadius: '2px', padding: '6px 8px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
              >
                DEEP
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: 3-Way Navigation Switcher */}
        <div className="dashboard__view-toggle" style={{ 
          marginBottom: '16px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '4px', 
          padding: '4px', 
          background: 'var(--surface)', 
          borderRadius: '4px', 
          border: '1px solid var(--border)' 
        }}>
          <button 
            onClick={() => setActiveView('vocab')} 
            className={`btn-toggle ${activeView === 'vocab' ? 'active' : ''}`}
            style={{ fontSize: '0.65rem', padding: '10px 4px', margin: 0, width: '100%', background: activeView === 'vocab' ? 'var(--gold)' : 'transparent', color: activeView === 'vocab' ? 'black' : 'inherit' }}
          >
            VOCAB
          </button>
          <button 
            onClick={() => setActiveView('roadmap')} 
            className={`btn-toggle ${activeView === 'roadmap' ? 'active' : ''}`}
            style={{ fontSize: '0.65rem', padding: '10px 4px', margin: 0, width: '100%', background: activeView === 'roadmap' ? 'var(--gold)' : 'transparent', color: activeView === 'roadmap' ? 'black' : 'inherit' }}
          >
            ROADMAP
          </button>
          <button 
            onClick={() => setActiveView('phrasebook')} 
            className={`btn-toggle ${activeView === 'phrasebook' ? 'active' : ''}`}
            style={{ fontSize: '0.65rem', padding: '10px 4px', margin: 0, width: '100%', background: activeView === 'phrasebook' ? 'var(--gold)' : 'transparent', color: activeView === 'phrasebook' ? 'black' : 'inherit' }}
          >
            PHRASEBOOK
          </button>
        </div>

        {/* Row 4: Filter Bar (Only visible when activeView === 'vocab') */}
        {activeView === 'vocab' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid-toolbar"
          >
            <select value={posFilter} onChange={(e) => { setPosFilter(e.target.value); setLessonFilter(null); }} className="sort-select">
              <option value="All">All Parts of Speech</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="number">Number</option>
              <option value="phrase">Phrase</option>
            </select>
          </motion.div>
        )}

        {/* Main Viewport */}
        <div className="dashboard__content-area" style={{ position: 'relative', minHeight: '400px' }}>
          {lessonFilter && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ 
                background: 'rgba(251, 191, 36, 0.05)', 
                border: '1px solid var(--gold)', 
                borderRadius: '4px', 
                padding: '8px 12px', 
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 800 }}>
                FILTERED BY LESSON WORDS ({lessonFilter.length})
              </span>
              <button 
                onClick={() => setLessonFilter(null)}
                style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900 }}
              >
                CLEAR X
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'vocab' && (
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
              )}
              {activeView === 'roadmap' && (
                <CurriculumRoadmap onSetActiveView={setActiveView} onAskLina={onAskLina} />
              )}
              {activeView === 'phrasebook' && (
                <div style={{ padding: '0' }}>
                  <PhraseGrid
                    onAskLina={onAskLina}
                    activeFilter={activeFilter}
                    selectedWords={[]}
                    focusPhraseId={focusPhraseId}
                    clearFocusPhrase={() => setFocusPhraseId(null)}
                  />
                  <h3 className="section-title" style={{ marginTop: '30px', marginBottom: '15px' }}>SAVED PHRASES</h3>
                  {savedPhrases.length === 0 ? (
                    <p style={{ color: '#888' }}>No phrases saved yet.</p>
                  ) : (
                    savedPhrases.map((p, i) => (
                      <div key={i} className="glass-panel" style={{ borderLeft: '4px solid var(--green)', marginBottom: '10px' }}>
                        {typeof p === 'string' ? p : p.tp}
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <SentenceBuilder 
          translation={translation}
          isAutoTranslating={isAutoTranslating}
          onSave={handleSaveSentence}
          onPractice={(s) => { onAskLina(`toki jan Lina! Let's practice this: "${s}"`); setSelectedWords([]); }}
          onExplain={(s) => { onAskLina(`toki jan Lina! Can you explain the grammar of this phrase: "${s}"?`); setSelectedWords([]); }}
          onRemoveLast={() => {
            const newWords = [...selectedWords];
            newWords.pop();
            setSelectedWords(newWords);
          }}
        />
      </main>
    </div>
  );
}
