/* src/components/Dashboard.tsx */
import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import CurriculumRoadmap from './CurriculumRoadmap';
import SentenceBuilder from './SentenceBuilder';
import ProveIt from './ProveIt';
import ChallengeWidget from './ChallengeWidget';
import OperationalIntelligenceWidget from './OperationalIntelligenceWidget';
import { SessionOverlay } from './SessionOverlay';
import TrainingHub from './TrainingHub';
import FlashcardMode from './FlashcardMode';
import DualDrillMode from './DualDrillMode';
import ConfusionDrill from './ConfusionDrill';
import CompositionMode from './CompositionMode';
import SRSWidget from './SRSWidget';
import InfoTooltip from './InfoTooltip';
import { fetchQuickTranslation, resolveApiKey, buildOfflineTranslation } from '../services/linaService';
import type { MasteryStatus, VocabWord } from '../types/mastery';
import type { AppPanel } from '../App';
import { motion, AnimatePresence } from 'framer-motion';

export type DashboardView = 'vocab' | 'roadmap' | 'archive';

export default function Dashboard({ onTogglePanel, activePanels, onAskLina, isSandboxMode, chatCount }: {
  onTogglePanel: (p: AppPanel) => void;
  activePanels: AppPanel[];
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  chatCount: number;
}) {
  const { studentName, profile, profileImage, currentStreak, vocabulary, curriculums, reviewVibe, setReviewVibe, selectedWords, setSelectedWords, savePhrase, lessonFilter, setLessonFilter, calculateDecay, checkAssessments, knowledgeCheckFrequency, lastKnowledgeCheckDate, setLastKnowledgeCheckDate, currentPositionNodeId, recordActivityCompletion, activeActivity, setActiveActivity } = useMasteryStore();

  const [activeView, setActiveView] = useState<DashboardView>('vocab');
  const [showTrainingHub, setShowTrainingHub] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showDualDrill, setShowDualDrill] = useState(false);
  const [showConfusionDrill, setShowConfusionDrill] = useState(false);
  const [showComposition, setShowComposition] = useState(false);
  const [showDrillsMenu, setShowDrillsMenu] = useState(false);
  const drillsMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | null>(null);
  const [posFilter, setPosFilter] = useState('All');
  const [sortMode, setSortMode] = useState<string>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [focusPhraseId, setFocusPhraseId] = useState<string | null>(null);
  const [assessmentWord, setAssessmentWord] = useState<VocabWord | null>(null);
  const [hasShownCheck, setHasShownCheck] = useState(false);

  // Translation & Builder State
  const [translation, setTranslation] = useState<string | null>(null);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [showSaveNote, setShowSaveNote] = useState(false);
  const [saveNoteInput, setSaveNoteInput] = useState('');
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [showProveIt, setShowProveIt] = useState(false);
  const [externalPhrase, setExternalPhrase] = useState<{ tp: string; en: string } | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drillsMenuRef.current && !drillsMenuRef.current.contains(event.target as Node)) {
        setShowDrillsMenu(false);
      }
    };
    if (showDrillsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDrillsMenu]);

  const handleOpenExternalPhrase = (tp: string, en: string) => {
    setExternalPhrase({ tp, en });
    setShowSaveNote(true);
    setSaveNoteInput('');
  };

  useEffect(() => {
    calculateDecay();
    const interval = setInterval(() => {
      if (knowledgeCheckFrequency === 'never') return;
      if (knowledgeCheckFrequency === 'daily' && lastKnowledgeCheckDate === new Date().toDateString()) return;
      if (knowledgeCheckFrequency === 'session' && hasShownCheck) return;
      
      // Guard: Don't interrupt active activities or sessions
      if (activeActivity || chatCount > 0) return;

      checkAssessments((word) => {
        setAssessmentWord(word);
        setHasShownCheck(true);
        setLastKnowledgeCheckDate(new Date().toDateString());
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [knowledgeCheckFrequency, lastKnowledgeCheckDate, hasShownCheck, checkAssessments, setLastKnowledgeCheckDate, calculateDecay, activeActivity, chatCount]);

  useEffect(() => {
    setTranslation(null);
    setIsAutoTranslating(false);
    if (confirmTimer.current) { clearTimeout(confirmTimer.current); confirmTimer.current = null; }
    setSavedConfirm(false);
    setShowSaveNote(false);
    setSaveNoteInput('');

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
    if (activeView === 'vocab' || activeView === 'archive') {
      let prompt = '';

      if (activeView === 'archive') {
        if (reviewVibe === 'chill') {
          prompt = "Let's practice my saved phrases.";
        } else if (reviewVibe === 'deep') {
          prompt = "Set up a roleplay using everyday phrases.";
        } else if (reviewVibe === 'intense') {
          prompt = "Let's analyze a random block from my discography.";
        } else {
          prompt = "[SYSTEM: Balanced Archive Practice. Pick something random from my saves or library.]";
        }
      } else {
        if (reviewVibe === 'chill') {
          const targetWords = vocabulary
            .filter(w => w.status === 'confident' || w.status === 'mastered')
            .sort((a, b) => b.baseScore - a.baseScore)
            .slice(0, 8)
            .map(w => w.word);
          prompt = `[SYSTEM: Daily Review in **CHILL** mode. Words: ${targetWords.join(', ')}. Keep it light.]`;
        } else if (reviewVibe === 'deep') {
          const targetWords = vocabulary
            .filter(w => w.status === 'introduced' || w.status === 'not_started')
            .sort((a, b) => (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999))
            .slice(0, 6)
            .map(w => w.word);
          prompt = `[SYSTEM: Daily Review in **DEEP** mode. Focus on new concepts/words: ${targetWords.join(', ')}. Follow 3-phase structure.]`;
        } else if (reviewVibe === 'intense') {
          const targetWords = vocabulary
            .filter(w => w.status !== 'mastered')
            .sort((a, b) => {
              if (a.baseScore !== b.baseScore) return a.baseScore - b.baseScore;
              return (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999);
            })
            .slice(0, 10)
            .map(w => w.word);
          prompt = `[SYSTEM: Daily Review in **INTENSE** mode. Target weak points and common words: ${targetWords.join(', ')}. Push the student hard.]`;
        } else {
          // Balanced review if no vibe (fallback)
          const targetWords = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 8).map(w => w.word);
          prompt = `[SYSTEM: Balanced Vocab Practice. Mix of all levels: ${targetWords.join(', ')}.]`;
        }
      }

      onAskLina(prompt);
    } else if (activeView === 'roadmap') {
      const activeNode = curriculums.flatMap(l => l.nodes).find(n => n.id === useMasteryStore.getState().currentPositionNodeId);
      const nodeTitle = activeNode?.title || 'Current Module';

      if (reviewVibe === 'chill') { // REVIEW
        onAskLina(`[SYSTEM: Roadmap Lesson - REVIEW. Mix items from "${nodeTitle}" with previously introduced words. Keep it easy and relaxed.]`);
      } else if (reviewVibe === 'deep') { // NEW CONCEPT
        onAskLina(`[SYSTEM: Roadmap Lesson - NEW CONCEPT. Focus strictly on current module items for "${nodeTitle}". Follow 3-phase structure.]`);
      } else if (reviewVibe === 'intense') { // QUIZ
        onAskLina(`[SYSTEM: Roadmap Lesson - QUIZ / LEVEL UP. Conduct a proficiency test on the current module "${nodeTitle}".]`);
      } else {
        onAskLina(`[SYSTEM: Roadmap Lesson. Continue "${nodeTitle}" with a mix of new material and past review.]`);
      }
    }
  };

  const handleSaveSentence = () => {
    const tp = externalPhrase ? externalPhrase.tp : selectedWords.join(' ');
    const en = externalPhrase ? externalPhrase.en : (translation ?? '');
    savePhrase({ id: tp, tp, en, notes: saveNoteInput });
    setExternalPhrase(null);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setSavedConfirm(true);
    setShowSaveNote(false);
    setActiveView('archive');
    setSaveNoteInput('');
    confirmTimer.current = setTimeout(() => {
      setSavedConfirm(false);
      confirmTimer.current = null;
      if (!externalPhrase) setSelectedWords([]);
    }, 800);
  };

  const getActiveStyle = (p: AppPanel) => activePanels.includes(p) ? { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 10px var(--gold-glow)' } : {};

  return (
    <div className="dashboard">
      <style>{`
        .dashboard__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0 12px;
          height: var(--header-height);
          gap: 8px;
        }

        .dashboard__header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .dashboard__header-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .dashboard__control-bar {
          display: flex;
          flex-direction: column;
          background: var(--surface);
          border: 1px solid var(--border);
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 0; /* Connected to grid toolbar */
        }

        .dashboard__quick-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          margin-bottom: 12px;
        }

        @media (min-width: 768px) {
          .dashboard__header {
            padding: 0 20px;
          }
          .dashboard__control-bar {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .dashboard__tabs {
            flex: 1;
            max-width: 400px;
          }
          .dashboard__review-group {
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      `}</style>

      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title" style={{ margin: 0, fontSize: '1rem' }}>TOKI PONA</h1>
          
          <button 
            onClick={() => onTogglePanel('profile')} 
            className="dashboard__profile-trigger"
            style={{ 
              ...getActiveStyle('profile'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 10px 2px 2px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 1,
              minWidth: 0,
              height: '32px'
            }}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile"
                style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
            ) : (
              <span style={{ fontSize: '1rem', marginLeft: '4px' }}>👤</span>
            )} 
            <span style={{ fontSize: '0.65rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {(profile?.tpName || studentName)?.toUpperCase() || 'STUDENT'}
            </span>
          </button>
        </div>

        <div className="dashboard__header-right">
          {currentStreak > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                className="dashboard__streak" 
                onClick={() => onTogglePanel('achievements')}
                style={{ ...getActiveStyle('achievements'), margin: 0, padding: '4px 8px', fontSize: '0.75rem', height: '32px', display: 'flex', alignItems: 'center' }}
              >
                🔥 {currentStreak}
              </div>
              <InfoTooltip text="Earn a streak by studying daily. Streaks apply a multiplier to your XP gains (up to 1.75x)." />
            </div>
          )}
          
          <OperationalIntelligenceWidget 
            onAskLina={onAskLina}
            onOpenAchievements={() => onTogglePanel('achievements')}
          />
          
          <button onClick={() => onTogglePanel('settings')} className="dashboard__icon-btn" style={{ ...getActiveStyle('settings'), width: '32px', height: '32px', fontSize: '0.9rem' }}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main" style={{ paddingBottom: '12rem' }}>
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />

        <div className="dashboard__quick-actions">
          <button 
            onClick={() => setShowTrainingHub(true)} 
            className="btn-toggle" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              flex: 1
            }}
          >
            🎮 TRAINING HUB
          </button>

          <div style={{ position: 'relative', flex: 1 }} ref={drillsMenuRef}>
            <button
              onClick={() => setShowDrillsMenu(!showDrillsMenu)}
              className="btn-toggle"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: showDrillsMenu ? 'rgba(255,191,0,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showDrillsMenu ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: '4px',
                width: '100%',
                height: '100%',
                color: showDrillsMenu ? 'var(--gold)' : 'white'
              }}
            >
              ⚔️ DRILLS
            </button>

            <AnimatePresence>
              {showDrillsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    minWidth: '200px',
                    background: 'var(--surface-opaque)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    marginTop: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    zIndex: 8000,
                    overflow: 'hidden'
                  }}
                >
                  {[
                    { label: '🃏 FLASHCARDS', action: () => setShowFlashcards(true) },
                    { label: '⚔️ DUAL DRILL', action: () => setShowDualDrill(true) },
                    { label: '🧠 CONFUSION', action: () => setShowConfusionDrill(true) },
                    { label: '✍️ COMPOSE', action: () => setShowComposition(true) },
                  ].map((item, idx, arr) => (
                    <button
                      key={item.label}
                      onClick={() => { item.action(); setShowDrillsMenu(false); }}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        letterSpacing: '0.1em',
                        textAlign: 'left',
                        background: 'transparent',
                        color: 'white',
                        border: 'none',
                        borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'var(--gold)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => setShowProveIt(true)} className="dashboard__icon-btn" style={{ width: '42px', height: '42px', borderRadius: '4px' }} title="Prove It Drill">🎯</button>
            <InfoTooltip text="Prove It: Take a word offline, write a sentence, and submit it. jan Lina will review it in your next chat." />
          </div>
          <button onClick={() => onTogglePanel('instructions')} className="dashboard__icon-btn" style={{ ...getActiveStyle('instructions'), width: '42px', height: '42px', borderRadius: '4px' }}>?</button>
        </div>

        {activeView === 'vocab' && <SRSWidget onAskLina={onAskLina} />}

        {/* Unified Control Bar */}
        <div className="dashboard__control-bar">
          {/* Tab Switcher */}
          <div className="dashboard__tabs" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '4px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <button
              onClick={() => setActiveView('vocab')}
              style={{
                margin: 0, width: '100%', border: 'none', borderRadius: '2px',
                background: activeView === 'vocab' ? 'var(--gold)' : 'transparent',
                color: activeView === 'vocab' ? 'black' : '#888',
                fontWeight: 900, fontSize: '0.7rem', padding: '8px 4px', cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              VOCAB
            </button>
            <button
              onClick={() => setActiveView('roadmap')}
              style={{
                margin: 0, width: '100%', border: 'none', borderRadius: '2px',
                background: activeView === 'roadmap' ? 'var(--gold)' : 'transparent',
                color: activeView === 'roadmap' ? 'black' : '#888',
                fontWeight: 900, fontSize: '0.7rem', padding: '8px 4px', cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              ROADMAP
            </button>
            <button
              onClick={() => setActiveView('archive')}
              style={{
                margin: 0, width: '100%', border: 'none', borderRadius: '2px',
                background: activeView === 'archive' ? 'var(--gold)' : 'transparent',
                color: activeView === 'archive' ? 'black' : '#888',
                fontWeight: 900, fontSize: '0.7rem', padding: '8px 4px', cursor: 'pointer',
                letterSpacing: '0.05em'
              }}
            >
              ARCHIVE
            </button>
          </div>

          {/* Review Controls Group */}
          <div className="dashboard__review-group" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
            <InfoTooltip text="Review Vibes (Chill/Deep/Intense) change their behavior based on whether you are in the Vocab, Roadmap, or Archive tab." />
            <button
              onClick={handleDailyReview}
              className="btn-review"
              style={{ flex: '1', minWidth: 0, marginBottom: 0, padding: '8px 10px', fontSize: '0.7rem', fontWeight: 900, whiteSpace: 'nowrap' }}
            >
              {activeView === 'vocab' ? '⚡ PRACTICE' :
               activeView === 'archive' ? '⚡ ARCHIVE' : '🚀 ROADMAP'}
            </button>
            <div style={{ display: 'flex', flex: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: '2px', padding: '2px', border: '1px solid rgba(255,255,255,0.05)', gap: '2px', minWidth: 0 }}>
              <button
                onClick={() => setReviewVibe(reviewVibe === 'chill' ? null : 'chill')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'chill' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'chill' ? 'black' : '#666', borderRadius: '2px', padding: '4px 2px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', minWidth: 0 }}
              >
                {activeView === 'vocab' ? 'CHILL' : activeView === 'archive' ? 'SAVES' : 'NEW'}
              </button>
              <button
                onClick={() => setReviewVibe(reviewVibe === 'deep' ? null : 'deep')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'deep' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'deep' ? 'black' : '#666', borderRadius: '2px', padding: '4px 2px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', minWidth: 0 }}
              >
                {activeView === 'vocab' ? 'DEEP' : activeView === 'archive' ? 'EVERYDAY' : 'REVIEW'}
              </button>
              <button
                onClick={() => setReviewVibe(reviewVibe === 'intense' ? null : 'intense')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'intense' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'intense' ? 'black' : '#666', borderRadius: '2px', padding: '4px 2px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', minWidth: 0 }}
              >
                {activeView === 'vocab' ? 'INTENSE' : activeView === 'archive' ? 'DISCO' : 'QUIZ'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="dashboard__content-area" style={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '60vh' }}>
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
              style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}
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
                  onSavePhrase={handleOpenExternalPhrase}
                />
              )}
              {activeView === 'roadmap' && (
                <CurriculumRoadmap 
                  onAskLina={onAskLina} 
                  isSandboxMode={isSandboxMode} 
                  onLaunchActivity={(nodeId, type) => {
                    setActiveActivity({ type, nodeId });
                  }}
                />
              )}
              {activeView === 'archive' && (
                <div style={{ padding: '0' }}>
                  <PhraseGrid
                    onAskLina={onAskLina}
                    activeFilter={activeFilter}
                    selectedWords={selectedWords}
                    focusPhraseId={focusPhraseId}
                    clearFocusPhrase={() => setFocusPhraseId(null)}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <SentenceBuilder 
          translation={translation}
          isAutoTranslating={isAutoTranslating}
          onSave={() => setShowSaveNote(true)}
          onPractice={(s) => { onAskLina(`[SYSTEM: Practice this sentence: "${s}"]`); setSelectedWords([]); }}
          onExplain={(s) => { onAskLina(`[SYSTEM: Explain the grammar of this phrase: "${s}"]`); setSelectedWords([]); }}
          onRemoveLast={() => {
            const newWords = [...selectedWords];
            newWords.pop();
            setSelectedWords(newWords);
          }}
        />

        <AnimatePresence>
          {showSaveNote && (
            <div className="modal-backdrop" style={{ zIndex: 5001 }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '400px', border: '1px solid var(--gold)' }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>SAVE PHRASE</h3>
                <div style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>
                   <strong>{externalPhrase ? externalPhrase.tp : selectedWords.join(' ')}</strong>
                   <br/>
                   <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{externalPhrase ? externalPhrase.en : translation}</span>
                </div>
                <textarea 
                  value={saveNoteInput} 
                  onChange={e => setSaveNoteInput(e.target.value)}
                  placeholder="Add a note to this phrase..."
                  style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', padding: '10px', marginBottom: '15px', resize: 'none' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button onClick={handleSaveSentence} className="btn-review" style={{ flex: 1, margin: 0 }}>SAVE</button>
                   <button onClick={() => { setShowSaveNote(false); setSaveNoteInput(''); setExternalPhrase(null); }} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                   <button onClick={() => { setSelectedWords([]); setShowSaveNote(false); setExternalPhrase(null); }} className="btn-toggle" style={{ flex: 1, color: '#ef4444' }}>DELETE</button>
                   <button onClick={() => setShowSaveNote(false)} className="btn-toggle" style={{ flex: 1 }}>EDIT</button>
                </div>
              </motion.div>
            </div>
          )}

          {assessmentWord && (
            <div className="modal-backdrop" style={{ zIndex: 3000 }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--gold)' }}
              >
                <h2 style={{ color: 'var(--gold)', marginBottom: '10px' }}>KNOWLEDGE CHECK</h2>
                <p>jan Lina wants to verify your mastery of <strong>{assessmentWord.word}</strong>.</p>
                <div style={{ margin: '20px 0', display: 'grid', gap: '10px' }}>
                   <button onClick={() => { 
                     onAskLina(`[SYSTEM: Knowledge Check on "${assessmentWord.word}". Give 3 questions.]`); 
                     setAssessmentWord(null); 
                     setLastKnowledgeCheckDate(new Date().toDateString());
                   }} className="btn-review">START QUIZ</button>
                   <button onClick={() => { 
                     setAssessmentWord(null); 
                     setLastKnowledgeCheckDate(new Date().toDateString());
                   }} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem' }}>MAYBE LATER</button>
                </div>
              </motion.div>
            </div>
          )}

          {showProveIt && (
            <div className="modal-backdrop" style={{ zIndex: 5001 }}>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <ProveIt onClose={() => setShowProveIt(false)} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <SessionOverlay onAskLina={onAskLina} />
      
      {showTrainingHub && (
        <TrainingHub onClose={() => setShowTrainingHub(false)} onAskLina={onAskLina} />
      )}

      {showFlashcards && (
        <FlashcardMode
          onClose={() => setShowFlashcards(false)}
          onAskLina={onAskLina}
          isSandboxMode={isSandboxMode}
        />
      )}

      {showDualDrill && (
        <DualDrillMode
          onClose={() => setShowDualDrill(false)}
          isSandboxMode={isSandboxMode}
        />
      )}

      {showConfusionDrill && (
        <ConfusionDrill
          onClose={() => setShowConfusionDrill(false)}
        />
      )}

      {showComposition && (
        <CompositionMode
          onClose={() => setShowComposition(false)}
          isSandboxMode={isSandboxMode}
        />
      )}
    </div>
  );
}
