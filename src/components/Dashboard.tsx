/* src/components/Dashboard.tsx */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import CurriculumRoadmap from './CurriculumRoadmap';
import SentenceBuilder from './SentenceBuilder';
import ProveIt from './ProveIt';
import ChallengeWidget from './ChallengeWidget';
import OperationalIntelligenceWidget from './OperationalIntelligenceWidget';
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
  const { studentName, profile, profileImage, currentStreak, vocabulary, curriculums, reviewVibe, setReviewVibe, selectedWords, setSelectedWords, savePhrase, lessonFilter, setLessonFilter, calculateDecay, checkAssessments, knowledgeCheckFrequency, lastKnowledgeCheckDate, setLastKnowledgeCheckDate } = useMasteryStore();

  const [activeView, setActiveView] = useState<DashboardView>('vocab');
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
  const [showProveIt, setShowProveIt] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    calculateDecay();
    const interval = setInterval(() => {
      if (knowledgeCheckFrequency === 'never') return;
      if (knowledgeCheckFrequency === 'daily' && lastKnowledgeCheckDate === new Date().toDateString()) return;
      if (knowledgeCheckFrequency === 'session' && hasShownCheck) return;

      checkAssessments((word) => {
        setAssessmentWord(word);
        setHasShownCheck(true);
        setLastKnowledgeCheckDate(new Date().toDateString());
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [knowledgeCheckFrequency, lastKnowledgeCheckDate, hasShownCheck, checkAssessments, setLastKnowledgeCheckDate, calculateDecay]);

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

      if (reviewVibe === 'chill') { // NEW CONCEPT
        onAskLina(`[SYSTEM: Roadmap Lesson - NEW CONCEPT. Focus strictly on current module items for "${nodeTitle}".]`);
      } else if (reviewVibe === 'deep') { // REVIEW
        onAskLina(`[SYSTEM: Roadmap Lesson - REVIEW. Mix items from "${nodeTitle}" with previously introduced words.]`);
      } else if (reviewVibe === 'intense') { // QUIZ
        onAskLina(`[SYSTEM: Roadmap Lesson - QUIZ / LEVEL UP. Conduct a proficiency test on the current module "${nodeTitle}".]`);
      } else {
        onAskLina(`[SYSTEM: Roadmap Lesson. Continue "${nodeTitle}" with a mix of new material and past review.]`);
      }
    }
  };

  const handleSaved = (phraseId: string) => {
    setFocusPhraseId(phraseId);
    setActiveView('phrasebook');
  };

  const handleSaveSentence = () => {
    const sentence = selectedWords.join(' ');
    savePhrase({ id: sentence, tp: sentence, en: translation ?? '', notes: saveNoteInput });
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setSavedConfirm(true);
    setShowSaveNote(false);
    setSaveNoteInput('');
    confirmTimer.current = setTimeout(() => {
      setSavedConfirm(false);
      confirmTimer.current = null;
      setSelectedWords([]);
    }, 800);
  };

  const getActiveStyle = (p: AppPanel) => activePanels.includes(p) ? { borderColor: 'var(--gold)', color: 'var(--gold)', boxShadow: '0 0 10px var(--gold-glow)' } : {};

  const roadmapProgress = useMemo(() => {
    const allNodes = (curriculums || []).flatMap(l => l.nodes);
    if (allNodes.length === 0) return 0;
    const mastered = allNodes.filter(n => n.status === 'mastered').length;
    return Math.round((mastered / allNodes.length) * 100);
  }, [curriculums]);

  return (
    <div className="dashboard">
      <style>{`
        .dashboard__header {
          display: grid;
          grid-template-areas: 
            "title actions"
            "identity identity";
          grid-template-columns: 1fr auto;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 8px 16px;
          gap: 12px 8px;
        }

        .dashboard__header-title-area { grid-area: title; display: flex; align-items: center; }
        .dashboard__header-identity-area { grid-area: identity; display: flex; align-items: center; gap: 8px; }
        .dashboard__header-actions-area { grid-area: actions; display: flex; align-items: center; gap: 8px; justify-content: flex-end; }

        @media (min-width: 768px) {
          .dashboard__header {
            display: flex;
            flex-direction: row;
            height: var(--header-height);
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            gap: 0;
          }
          .dashboard__header-identity-area {
            margin-left: 12px;
            flex: 1;
          }
          .dashboard__header-actions-area {
            flex: none;
          }
        }

        /* Adjust main content padding */
        @media (max-width: 767px) {
          .dashboard {
            --header-offset: 108px;
          }
        }
      `}</style>

      <header className="dashboard__header">
        <div className="dashboard__header-title-area">
          <h1 className="dashboard__title" style={{ margin: 0 }}>TOKI PONA</h1>
        </div>

        <div className="dashboard__header-identity-area">
          <button 
            onClick={() => onTogglePanel('profile')} 
            className="dashboard__profile-trigger"
            style={{ 
              ...getActiveStyle('profile'),
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 4px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0
            }}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile"
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '1px solid rgba(255,255,255,0.1)'
                }} 
              />
            ) : (
              <span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>👤</span>
            )} 
            <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>{(profile?.tpName || studentName)?.toUpperCase() || 'STUDENT'}</span>
          </button>
          
          <OperationalIntelligenceWidget 
            onAskLina={onAskLina}
            onOpenAchievements={() => onTogglePanel('achievements')}
          />
        </div>

        <div className="dashboard__header-actions-area">
          {currentStreak > 0 && (
            <div 
              className="dashboard__streak" 
              onClick={() => onTogglePanel('achievements')}
              style={{ ...getActiveStyle('achievements'), margin: 0 }}
            >
              🔥 {currentStreak}
            </div>
          )}
          <button onClick={() => onTogglePanel('instructions')} className="dashboard__icon-btn" style={getActiveStyle('instructions')}>?</button>
          <button onClick={() => setShowProveIt(true)} className="dashboard__icon-btn" title="Prove It Drill">🎯</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => onAskLina('[SYSTEM: Start a general conversation.]')} className="dashboard__icon-btn" style={getActiveStyle('chat' as any)}>💬</button>
            {chatCount > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--gold)', color: 'black', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)', pointerEvents: 'none' }}>
                {chatCount}
              </span>
            )}
          </div>
          <button onClick={() => onTogglePanel('settings')} className="dashboard__icon-btn" style={getActiveStyle('settings')}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main" style={{ paddingBottom: '12rem' }}>
        <div style={{ marginBottom: '20px' }}>
          <ChallengeWidget />
        </div>
        <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
        
        {/* Row 2: Review Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <button onClick={handleDailyReview} className="btn-review w-full" style={{ flex: 1, marginBottom: 0 }}>
              {activeView === 'vocab' ? '⚡ VOCAB PRACTICE' : 
               activeView === 'archive' ? (
                 reviewVibe === 'chill' ? '🔄 REFRESH MEMORY' :
                 reviewVibe === 'deep' ? '🎭 SITUATIONAL DRILL' :
                 reviewVibe === 'intense' ? '🎤 LYRIC ANALYSIS' :
                 '⚡ ARCHIVE PRACTICE'
               ) : '🚀 ROADMAP LESSON'}
            </button>
            <div className="w-full" style={{ display: 'flex', background: 'var(--surface)', borderRadius: '4px', padding: '4px', border: '1px solid var(--border)', flex: 1.5 }}>
              <button 
                onClick={() => setReviewVibe(reviewVibe === 'chill' ? null : 'chill')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'chill' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'chill' ? 'black' : '#666', borderRadius: '2px', padding: '6px 4px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
              >
                {activeView === 'vocab' ? 'CHILL' : activeView === 'archive' ? 'MY SAVES' : 'NEW CONCEPT'}
              </button>
              <button 
                onClick={() => setReviewVibe(reviewVibe === 'deep' ? null : 'deep')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'deep' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'deep' ? 'black' : '#666', borderRadius: '2px', padding: '6px 4px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
              >
                {activeView === 'vocab' ? 'DEEP' : activeView === 'archive' ? 'EVERYDAY' : 'REVIEW'}
              </button>
              <button 
                onClick={() => setReviewVibe(reviewVibe === 'intense' ? null : 'intense')}
                style={{ flex: 1, border: 'none', background: reviewVibe === 'intense' ? 'var(--gold)' : 'transparent', color: reviewVibe === 'intense' ? 'black' : '#666', borderRadius: '2px', padding: '6px 4px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
              >
                {activeView === 'vocab' ? 'INTENSE' : activeView === 'archive' ? 'DISCOGRAPHY' : 'QUIZ / LEVEL UP'}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: 3-Way Navigation Switcher */}
        <div className="dashboard__view-toggle overflow-x-auto hide-scrollbar" style={{ 
          marginBottom: '16px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '4px', 
          padding: '4px', 
          background: 'var(--surface)', 
          borderRadius: '4px', 
          border: '1px solid var(--border)',
          width: '100%'
        }}>
          <button 
            onClick={() => setActiveView('vocab')} 
            className={`btn-toggle text-xs md:text-sm px-2 py-3 ${activeView === 'vocab' ? 'active' : ''}`}
            style={{ margin: 0, width: '100%', background: activeView === 'vocab' ? 'var(--gold)' : 'transparent', color: activeView === 'vocab' ? 'black' : 'inherit' }}
          >
            VOCAB
          </button>
          <button 
            onClick={() => setActiveView('roadmap')} 
            className={`btn-toggle text-xs md:text-sm px-2 py-3 ${activeView === 'roadmap' ? 'active' : ''}`}
            style={{ margin: 0, width: '100%', background: activeView === 'roadmap' ? 'var(--gold)' : 'transparent', color: activeView === 'roadmap' ? 'black' : 'inherit' }}
          >
            ROADMAP
          </button>
          <button 
            onClick={() => setActiveView('archive')} 
            className={`btn-toggle text-xs md:text-sm px-2 py-3 ${activeView === 'archive' ? 'active' : ''}`}
            style={{ margin: 0, width: '100%', background: activeView === 'archive' ? 'var(--gold)' : 'transparent', color: activeView === 'archive' ? 'black' : 'inherit' }}
          >
            THE ARCHIVE
          </button>
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
                />
              )}
              {activeView === 'roadmap' && (
                <CurriculumRoadmap onSetActiveView={setActiveView} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />
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
                   <strong>{selectedWords.join(' ')}</strong>
                   <br/>
                   <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{translation}</span>
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
                   <button onClick={() => { setShowSaveNote(false); setSaveNoteInput(''); }} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                   <button onClick={() => { setSelectedWords([]); setShowSaveNote(false); }} className="btn-toggle" style={{ flex: 1, color: '#ef4444' }}>DELETE</button>
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
    </div>
  );
}
