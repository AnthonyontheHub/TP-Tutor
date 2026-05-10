import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Map as MapIcon, Library, Sword, LineChart, Activity } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';
import { resolveApiKey, fetchQuickTranslation, buildOfflineTranslation } from '../services/linaService';
import ProgressSummary from './ProgressSummary';
import MasteryGrid from './MasteryGrid';
import PhraseGrid from './PhraseGrid';
import CurriculumRoadmap from './CurriculumRoadmap';
import SentenceBuilder from './SentenceBuilder';
import ProveIt from './ProveIt';
import TrainingHub from './TrainingHub';
import FlashcardMode from './FlashcardMode';
import DualDrillMode from './DualDrillMode';
import ConfusionDrill from './ConfusionDrill';
import CompositionMode from './CompositionMode';
import AnalyticsPanel from './AnalyticsPanel';
import BossFightMode from './BossFightMode';
import OperationalIntelligenceWidget from './OperationalIntelligenceWidget';
import InfoTooltip from './InfoTooltip';
import SRSWidget from './SRSWidget';
import InsightLedger from './InsightLedger';
import { SessionOverlay } from './SessionOverlay';
import { getPhrasesByCategory } from '../utils/phraseEngine';
import type { VocabWord, MasteryStatus, DashboardView, PhrasebookEntry } from '../types/mastery';
import type { AppPanel } from '../App';

export default function Dashboard({ onTogglePanel, activePanels, onAskLina, isSandboxMode, chatCount }: {
  onTogglePanel: (p: AppPanel) => void;
  activePanels: AppPanel[];
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
  chatCount: number;
}) {
  const { 
    studentName, profile, profileImage, currentStreak, vocabulary, curriculums, 
    reviewVibe, setReviewVibe, selectedWords, setSelectedWords, lessonFilter, 
    setLessonFilter, calculateDecay, checkAssessments, knowledgeCheckFrequency, 
    lastKnowledgeCheckDate, setLastKnowledgeCheckDate, 
    recordActivityCompletion, activeActivity, setActiveActivity, 
    calculateReadinessScore, getStatusSummary, songs, commonPhrases, 
    addWordToSelection, getDueWords, syncPhrasebook, masteryHistory,
    addLoreEntry
  } = useMasteryStore();
  
  const summary = getStatusSummary();

  const [showLoreModal, setShowLoreModal] = useState(false);
  const [loreInput, setLoreInput] = useState('');
  const [showLoreToast, setShowLoreToast] = useState(false);

  useEffect(() => {
    if (commonPhrases.length < 20) {
      syncPhrasebook();
    }
  }, []);

  const [activeView, setActiveView] = useState<DashboardView>('vocab');
  const [archiveSubView, setArchiveSubView] = useState<'saved' | 'book' | 'songs'>('saved');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number | null>(null);
  const [activeLore, setActiveLore] = useState<PhrasebookEntry | null>(null);
  const [queueSnoozedUntil, setQueueSnoozedUntil] = useState<number>(0);
  
  const [showTrainingHub, setShowTrainingHub] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showDualDrill, setShowDualDrill] = useState(false);
  const [showConfusionDrill, setShowConfusionDrill] = useState(false);
  const [showComposition, setShowComposition] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showInsightLog, setShowInsightLog] = useState(false);
  const [showBossFight, setShowBossFight] = useState(false);
  const [bossFightWords, setBossFightWords] = useState<string[]>([]);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSaveNote(false);
        setAssessmentWord(null);
        setShowProveIt(false);
        setActiveLore(null);
        setShowTrainingHub(false);
        setShowFlashcards(false);
        setShowDualDrill(false);
        setShowConfusionDrill(false);
        setShowComposition(false);
        setShowAnalytics(false);
        setShowInsightLog(false);
        setShowBossFight(false);
        setShowDrillsMenu(false);
        setSelectedWords([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedWords]);

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
    const { savePhrase } = useMasteryStore.getState();
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

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <header className="dashboard__header">
        <div className="dashboard__header-left">
          <h1 className="dashboard__title hidden md:block" style={{ margin: 0, fontSize: '1rem' }}>TOKI PONA</h1>
          
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

          <button 
            onClick={() => setShowLoreModal(true)} 
            className="dashboard__icon-btn" 
            style={{ width: '32px', height: '32px', fontSize: '0.9rem', marginRight: '4px' }} 
            title="LOG EVENT"
          >
            📝
          </button>

          <button 
            onClick={() => setShowTrainingHub(true)} 
            className="dashboard__icon-btn" 
            style={{ width: '32px', height: '32px', fontSize: '0.9rem', marginRight: '4px' }}
            title="GARRISON (Training Hub)"
          >
            <Sword size={18} color="var(--gold)" />
          </button>

          <button 
            onClick={() => setShowAnalytics(true)} 
            className="dashboard__icon-btn" 
            style={{ width: '32px', height: '32px', fontSize: '0.9rem', marginRight: '4px' }}
            title="STRATEGIC READOUT (Analytics)"
          >
            <LineChart size={18} color="var(--gold)" />
          </button>

          <button 
            onClick={() => onTogglePanel('instructions')} 
            className="dashboard__icon-btn" 
            style={{ ...getActiveStyle('instructions'), width: '32px', height: '32px', fontSize: '0.9rem', marginRight: '4px' }}
          >
            ?
          </button>
          
          <button onClick={() => onTogglePanel('linaHub')} className="dashboard__icon-btn" title="JAN LINA HUB">🤖</button>
          
          <button onClick={() => onTogglePanel('settings')} className="dashboard__icon-btn" style={{ ...getActiveStyle('settings'), width: '32px', height: '32px', fontSize: '0.9rem' }}>⚙️</button>
        </div>
      </header>

      <main className="dashboard__main" style={{ paddingBottom: '80px' }}>
        <div className="ritual-core-container">
          <div className="hologram-wing">
            <span className="hologram-label">RANK</span>
            <span className="hologram-value">{summary.rankTitle}</span>
          </div>

          {(() => {
            const score = calculateReadinessScore();
            const pulseDuration = 4 - (score / 33);
            return (
              <motion.button
                onClick={handleDailyReview}
                animate={{ 
                  scale: [1, 1.08, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: pulseDuration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  background: 'var(--gold-liquid)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px var(--gold-glow)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'black', lineHeight: 1 }}>{score}%</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'black', letterSpacing: '0.2em', marginTop: '4px' }}>ACTIVATE</span>
              </motion.button>
            );
          })()}

          <div 
            className="hologram-wing" 
            onClick={() => setShowInsightLog(true)}
            style={{ cursor: 'pointer' }}
          >
            <span className="hologram-label">NEURAL XP</span>
            <span className="hologram-value">LEVEL {summary.level} • {summary.xp} XP</span>
          </div>
        </div>

        {(() => {
          const bossCandidates = vocabulary.filter(v => v.baseScore >= 850 && v.status !== 'mastered');
          if (bossCandidates.length === 0) return null;
          
          return (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                const count = Math.min(bossCandidates.length, Math.floor(Math.random() * 3) + 3); // 3-5
                const selected = [...bossCandidates].sort(() => 0.5 - Math.random()).slice(0, count).map(v => v.word);
                setBossFightWords(selected);
                setShowBossFight(true);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #D4AF37, #FBE106, #D4AF37)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite',
                border: 'none',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                color: 'black',
                fontWeight: 900,
                letterSpacing: '0.2em',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(212,175,55,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                textTransform: 'uppercase'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>⚔️</span>
              BOSS FIGHT AVAILABLE
              <span style={{ fontSize: '1.4rem' }}>⚔️</span>
            </motion.button>
          );
        })()}

        {activeView === 'vocab' && getDueWords().length > 0 && Date.now() >= queueSnoozedUntil && (
          <SRSWidget 
            onAskLina={onAskLina} 
            onSnooze={() => setQueueSnoozedUntil(Date.now() + 14400000)}
          />
        )}

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <ProgressSummary activeFilter={activeFilter} onFilterClick={setActiveFilter} />
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
                </div>
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
                  <div className="archive-sub-nav">
                    <button 
                      className={archiveSubView === 'saved' ? 'active' : ''} 
                      onClick={() => setArchiveSubView('saved')}
                    >
                      SAVED
                    </button>
                    <button 
                      className={archiveSubView === 'book' ? 'active' : ''} 
                      onClick={() => setArchiveSubView('book')}
                    >
                      BOOK
                    </button>
                    <button 
                      className={archiveSubView === 'songs' ? 'active' : ''} 
                      onClick={() => setArchiveSubView('songs')}
                    >
                      SONGS
                    </button>
                  </div>

                  {archiveSubView === 'saved' && (
                    <PhraseGrid
                      onAskLina={onAskLina}
                      activeFilter={activeFilter}
                      selectedWords={selectedWords}
                      focusPhraseId={focusPhraseId}
                      clearFocusPhrase={() => setFocusPhraseId(null)}
                    />
                  )}

                  {archiveSubView === 'book' && (
                    <div style={{ padding: '0 10px' }}>
                      {(() => {
                        const groupedPhrases = getPhrasesByCategory(commonPhrases);
                        return Object.entries(groupedPhrases).map(([category, phrases]) => (
                          <div key={category} className="phrase-category-container">
                            <h3 className="phrase-category-title">{category}</h3>
                            <div className="phrase-grid">
                              {phrases.map((phrase: PhrasebookEntry, idx: number) => (
                                <div 
                                  key={idx} 
                                  className="lore-tablet"
                                  onClick={() => setActiveLore(phrase)}
                                >
                                  <div className="lore-tablet-tp">{phrase.tp}</div>
                                  <div className="lore-tablet-en">{phrase.en}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}

                  {archiveSubView === 'songs' && (
                    <div style={{ padding: '0 10px' }}>
                      {!selectedAlbumId ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {songs.map((album) => (
                            <div 
                              key={album.id} 
                              className="album-slate"
                              onClick={() => setSelectedAlbumId(album.id)}
                            >
                              <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>💿</div>
                              <div style={{ fontSize: '0.7rem', fontWeight: 900 }}>{album.title}</div>
                            </div>
                          ))}
                        </div>
                      ) : selectedTrackIdx === null ? (
                        <div>
                          <button 
                            onClick={() => setSelectedAlbumId(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          >
                            ← BACK TO ALBUMS
                          </button>
                          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '20px', letterSpacing: '0.1em' }}>
                            {songs.find(s => s.id === selectedAlbumId)?.title}
                          </h2>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {songs.find(s => s.id === selectedAlbumId)?.tracks.map((track, idx) => (
                              <div 
                                key={idx} 
                                className="track-row"
                                onClick={() => setSelectedTrackIdx(idx)}
                              >
                                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{idx + 1}. {track.title}</span>
                                <span style={{ opacity: 0.4 }}>→</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <button 
                            onClick={() => setSelectedTrackIdx(null)}
                            style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                          >
                            ← BACK TO TRACKS
                          </button>
                          <h2 style={{ fontSize: '1rem', fontWeight: 900, color: 'white', marginBottom: '4px' }}>
                            {songs.find(s => s.id === selectedAlbumId)?.tracks[selectedTrackIdx].title}
                          </h2>
                          <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 800, marginBottom: '24px', opacity: 0.6 }}>
                            TAP WORDS TO ADD TO BUILDER
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {songs.find(s => s.id === selectedAlbumId)?.tracks[selectedTrackIdx].blocks.map((block, bIdx) => (
                              <div key={bIdx}>
                                <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 900, marginBottom: '8px', textTransform: 'uppercase' }}>{block.title}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', lineHeight: 1.4, marginBottom: '4px' }}>
                                  {block.tp.split(' ').map((word, wIdx) => (
                                    <span 
                                      key={wIdx} 
                                      className="lyric-word"
                                      onClick={() => addWordToSelection(word.replace(/[.,!?]/g, ''))}
                                    >
                                      {word}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>{block.en}</div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => {
                              const track = songs.find(s => s.id === selectedAlbumId)?.tracks[selectedTrackIdx];
                              onAskLina(`[SYSTEM: Let's analyze the lyrics for "${track?.title}" from the album "${songs.find(s => s.id === selectedAlbumId)?.title}".]`);
                            }}
                            className="btn-review"
                            style={{ width: '100%', marginTop: '40px' }}
                          >
                            ASK LINA TO ANALYZE
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
            <div 
              className="modal-backdrop" 
              style={{ zIndex: 5001, backdropFilter: 'blur(12px)' }}
              onClick={() => setShowSaveNote(false)}
            >
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
            <div 
              className="modal-backdrop" 
              style={{ zIndex: 3000, backdropFilter: 'blur(12px)' }}
              onClick={() => setAssessmentWord(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel"
                style={{ width: '90%', maxWidth: '400px', textAlign: 'center', border: '1px solid var(--gold)' }}
                onClick={e => e.stopPropagation()}
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
            <div 
              className="modal-backdrop" 
              style={{ zIndex: 5001, backdropFilter: 'blur(12px)' }}
              onClick={() => setShowProveIt(false)}
            >
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

      <footer className="bottom-nav">
        <button
          onClick={() => setActiveView('vocab')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeView === 'vocab' ? 'var(--gold)' : '#888',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <BookOpen size={24} color={activeView === 'vocab' ? 'var(--gold)' : '#888'} />
          VOCAB
        </button>
        <button
          onClick={() => setActiveView('roadmap')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeView === 'roadmap' ? 'var(--gold)' : '#888',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <MapIcon size={24} color={activeView === 'roadmap' ? 'var(--gold)' : '#888'} />
          ROADMAP
        </button>
        <button
          onClick={() => setActiveView('archive')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeView === 'archive' ? 'var(--gold)' : '#888',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <Library size={24} color={activeView === 'archive' ? 'var(--gold)' : '#888'} />
          ARCHIVE
        </button>
      </footer>

      <AnimatePresence>
        {activeLore && (
          <div 
            className="modal-backdrop" 
            style={{ zIndex: 6000, backdropFilter: 'blur(12px)' }}
            onClick={() => setActiveLore(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="lore-dossier-content"
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="close-glyph" 
                onClick={() => setActiveLore(null)}
                style={{ zIndex: 9999 }}
              >✕</button>

              <span className="dossier-label">LORE DOSSIER • {activeLore.category}</span>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: '8px' }}>
                  {activeLore.tp.split(' ').map((word, wIdx) => (
                    <span 
                      key={wIdx} 
                      className="interactive-word"
                      onClick={() => addWordToSelection(word.replace(/[.,!?]/g, ''))}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '1.1rem', color: 'var(--gold)', fontWeight: 700 }}>
                  {activeLore.en}
                </div>
              </div>

              {activeLore.literal && (
                <div style={{ marginBottom: '20px' }}>
                  <span className="dossier-label">LITERAL DECODING</span>
                  <div className="dossier-literal">"{activeLore.literal}"</div>
                </div>
              )}

              {activeLore.note && (
                <div style={{ marginBottom: '24px' }}>
                  <span className="dossier-label">CULTURAL CONTEXT</span>
                  <div className="phrase-note">{activeLore.note}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' }}>
                <button 
                  onClick={() => {
                    const words = activeLore.tp.replace(/[.,!?]/g, '').split(' ');
                    setSelectedWords(words);
                    setActiveLore(null);
                  }}
                  className="btn-gold"
                  style={{ width: '100%', margin: 0, fontSize: '0.75rem' }}
                >
                  PROJECT TO BUILDER
                </button>
                <button 
                  onClick={() => {
                    const prompt = `[SYSTEM: Deep dive on Lore Entry. Phrase: "${activeLore.tp}". Meaning: "${activeLore.en}". Literal: "${activeLore.literal}". Note: "${activeLore.note}". Discuss the philosophical implications or usage nuances.]`;
                    onAskLina(prompt);
                    setActiveLore(null);
                  }}
                  className="btn-review"
                  style={{ width: '100%', margin: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--gold)', color: 'var(--gold)', fontSize: '0.75rem' }}
                >
                  💬 CONSULT JAN LINA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoreModal && (
          <div className="modal-backdrop" style={{ zIndex: 5001 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel" style={{ width: '90%', maxWidth: '400px', border: '1px solid var(--gold)' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ color: 'var(--gold)', marginBottom: '15px' }}>LOG LIFE EVENT</h3>
              <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#ccc', lineHeight: 1.4 }}>Log a quick real-world event so jan Lina can reference it in your next conversation.</div>
              <textarea value={loreInput} onChange={e => setLoreInput(e.target.value)} placeholder="e.g. Sirius caught a fly today..." style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', padding: '10px', marginBottom: '15px', resize: 'none' }} autoFocus />
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button onClick={() => { if (loreInput.trim()) { addLoreEntry(loreInput); setLoreInput(''); setShowLoreModal(false); setShowLoreToast(true); setTimeout(() => setShowLoreToast(false), 3000); } }} className="btn-review" style={{ flex: 1, margin: 0 }}>SYNC TO LINA</button>
                 <button onClick={() => { setShowLoreModal(false); setLoreInput(''); }} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
              </div>
            </motion.div>
          </div>
        )}
        {showLoreToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: 'black', padding: '12px 24px', borderRadius: '30px', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.05em', boxShadow: '0 4px 20px rgba(212,175,55,0.4)', zIndex: 9999 }}>
            LINA IS REMEMBERING... 🧠
          </motion.div>
        )}
      </AnimatePresence>

      <SessionOverlay onAskLina={onAskLina} />
      
      {showInsightLog && (
        <InsightLedger onClose={() => setShowInsightLog(false)} />
      )}

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

      <AnalyticsPanel 
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />

      {showBossFight && (
        <BossFightMode 
          onClose={() => setShowBossFight(false)}
          bossWords={bossFightWords}
          isSandboxMode={isSandboxMode}
        />
      )}
    </div>
  );
}
