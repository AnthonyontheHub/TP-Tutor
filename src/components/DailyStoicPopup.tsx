/* src/components/DailyStoicPopup.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoicStore } from '../store/stoicStore';
import { useAuthStore } from '../store/authStore';
import { useMasteryStore } from '../store/masteryStore';
import { Book, Send, Sparkles, X, Maximize2, Minimize2 } from 'lucide-react';
import { TOKI_PONA_DICTIONARY } from '../data/tokiPonaDictionary';

export default function DailyStoicPopup() {
  const { user } = useAuthStore();
  const { 
    todayQuote, fetchTodayQuote, phase1DismissedAt, phase2CompletedAt, phase3CompletedAt, 
    dismissPhase1, completePhase2, completePhase3, devReset,
    manualDismissalDate, setManualDismissal
  } = useStoicStore();
  const { recordInsight, addWordToSelection } = useMasteryStore();

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [devPhaseOverride, setDevPhaseOverride] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayQuote(user.uid);
    }
  }, [user, fetchTodayQuote]);

  const displayQuote = todayQuote || { tokiPona: "toki pona li pona", english: "Good speech is good.", author: "Lina", breakdown: "A fallback for testing.", source: "TP-Tutor" };

  const now = new Date();
  const currentHour = now.getHours();

  // Phase Logic
  let phase = 0;
  if (currentHour >= 8 && !phase1DismissedAt) {
    phase = 1;
  } else if (phase1DismissedAt && !phase2CompletedAt) {
    const dismissedTime = new Date(phase1DismissedAt).getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime >= twoHoursInMs) {
      phase = 2;
    }
  } else if (phase2CompletedAt && !phase3CompletedAt && currentHour >= 21) {
    phase = 3;
  }

  // Dev Override
  if (devPhaseOverride !== null) {
    phase = devPhaseOverride;
  }

  // If phase is 0, we still render a minimal "Dev Access" version
  const showDevOnly = phase === 0;

  const todayStr = new Date().toISOString().split('T')[0];
  if (manualDismissalDate === todayStr && !showDevOnly) return null;

  console.log("Stoic Popup Phase:", phase);

  const handlePhase1Dismiss = () => {
    dismissPhase1();
    setDevPhaseOverride(null);
  };

  const handlePhase2Submit = () => {
    // Engagement based XP
    let xp = 10; // Read/Attempted
    if (input.length > 5) xp += 10;
    
    completePhase2();
    recordInsight('Daily Stoic Challenge', xp);
    setFeedback(`Original: "${displayQuote.english}"\n\nNasin Pona: ${displayQuote.breakdown || 'A good lesson in simplicity.'}`);
    setTimeout(() => {
      setFeedback(null);
      setInput('');
      setDevPhaseOverride(null);
    }, 5000);
  };

  const handlePhase3Submit = () => {
    completePhase3();
    recordInsight('Daily Stoic Reflection', 20);
    setDevPhaseOverride(null);
    setInput('');
  };

  return (
    <AnimatePresence>
      {/* Expanded Grand View */}
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(10px)' }}
        >
          <div style={{ width: '100%', maxWidth: '1000px', height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Book size={32} color="var(--gold)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '0.2em' }}>STOIC DEEP STUDY</h2>
              </div>
              <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}>
                <Minimize2 size={32} />
              </button>
            </header>

            <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '40px', paddingRight: '20px' }} className="side-panel-content">
              {/* Massive Quote Section */}
              <section style={{ textAlign: 'center' }}>
                <div className="sitelen-pona" style={{ fontSize: '4rem', color: 'var(--gold)', marginBottom: '20px', lineHeight: 1.2 }}>
                  {displayQuote.tokiPona}
                </div>
                <p style={{ fontSize: '1.8rem', fontWeight: 500, color: 'white', fontStyle: 'italic', lineHeight: 1.4 }}>
                  "{displayQuote.tokiPona}"
                </p>
                {(displayQuote.author || displayQuote.source) && (
                  <div style={{ marginTop: '15px', fontSize: '1.2rem', color: '#888', fontWeight: 700 }}>
                    — {displayQuote.author}{displayQuote.source ? `, ${displayQuote.source}` : ''}
                  </div>
                )}
              </section>

              {/* Analytical Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '15px', textTransform: 'uppercase' }}>Literal Bridge</h3>
                  <p style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: 1.6 }}>{displayQuote.literalTranslation || "Parsing word-for-word patterns..."}</p>
                </div>

                <div className="glass-panel" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '15px', textTransform: 'uppercase' }}>Philosopher's Intent</h3>
                  <p style={{ fontSize: '1.1rem', color: '#ccc', lineHeight: 1.6 }}>{displayQuote.philosopherIntent || displayQuote.breakdown || "Analyzing authorial core..."}</p>
                </div>

                <div className="glass-panel" style={{ padding: '25px', border: '1px solid var(--gold)', background: 'rgba(212,175,55,0.05)' }}>
                  <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '15px', textTransform: 'uppercase' }}>Daily Protocol</h3>
                  <p style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700, lineHeight: 1.6 }}>{displayQuote.lifeApplication || "Calibrating life application..."}</p>
                </div>
              </div>

              {/* Word-by-Word Glossary */}
              <section>
                <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '20px', textTransform: 'uppercase' }}>Word-by-Word</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {displayQuote.tokiPona.replace(/[.,!?]/g, '').toLowerCase().split(' ').map((word, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: 'white', fontWeight: 900, fontSize: '1rem' }}>{word}</span>
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>{TOKI_PONA_DICTIONARY[word] || 'unknown'}</span>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </motion.div>
      )}

      <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        {/* Dev Controls */}
        <div style={{ display: 'flex', gap: '5px', opacity: 0.5 }}>
          <button type="button" onClick={() => setDevPhaseOverride(1)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P1</button>
          <button type="button" onClick={() => setDevPhaseOverride(2)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P2</button>
          <button type="button" onClick={() => setDevPhaseOverride(3)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P3</button>
          <button type="button" onClick={devReset} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>Reset</button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-panel"
          style={{
            width: '320px',
            padding: '20px',
            background: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid var(--gold)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showDevOnly ? '0' : '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Book size={16} color="var(--gold)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em' }}>
                DAILY STOIC {showDevOnly ? '• DEV ACCESS' : phase === 1 ? '• MORNING' : phase === 2 ? '• CHALLENGE' : '• EVENING'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {!showDevOnly && (
                <button onClick={() => setIsExpanded(true)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                  <Maximize2 size={16} />
                </button>
              )}
              <button type="button" onClick={() => {
                if (showDevOnly) {
                   setDevPhaseOverride(null);
                } else {
                   setManualDismissal(new Date().toISOString().split('T')[0]);
                }
              }} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', zIndex: 9999 }}>
                <X size={16} />
              </button>
            </div>
          </header>

          {!showDevOnly && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.4, fontStyle: 'italic' }}>
                  "
                  {displayQuote.tokiPona.split(' ').map((word, i) => (
                    <span 
                      key={i} 
                      className="interactive-word" 
                      onClick={() => addWordToSelection(word.replace(/[.,!?]/g, '').toLowerCase())}
                    >
                      {word}{' '}
                    </span>
                  ))}
                  "
                </p>
                {(displayQuote.author || displayQuote.source) && (
                  <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#888', textAlign: 'right', fontWeight: 700 }}>
                    — {displayQuote.author}{displayQuote.source ? `, ${displayQuote.source}` : ''}
                  </div>
                )}
                {phase === 3 && (
                  <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#aaa', fontStyle: 'italic', marginBottom: '8px' }}>{displayQuote.english}</p>
                    <p style={{ fontSize: '0.7rem', color: '#666' }}>{displayQuote.literalTranslation}</p>
                  </div>
                )}
              </div>

              {phase === 1 && (
                <button
                  type="button"
                  onClick={handlePhase1Dismiss}
                  className="btn-review"
                  style={{ width: '100%', padding: '10px' }}
                >
                  UNDERSTOOD
                </button>
              )}

              {phase === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Translate this back to English:</p>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your translation..."
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '10px',
                      fontSize: '0.9rem',
                      minHeight: '60px',
                      resize: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePhase2Submit}
                    className="btn-review"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Send size={16} />
                    SUBMIT
                  </button>
                  {feedback && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '5px', whiteSpace: 'pre-wrap', lineHeight: 1.4, background: 'rgba(255,191,0,0.1)', padding: '10px', borderRadius: '4px' }}>{feedback}</p>
                  )}
                </div>
              )}

              {phase === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Evening Reflection (in Toki Pona):</p>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="toki sina li seme?"
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: 'white',
                      padding: '10px',
                      fontSize: '0.9rem',
                      minHeight: '60px',
                      resize: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePhase3Submit}
                    className="btn-review"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Sparkles size={16} />
                    REFLECT
                  </button>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: showDevOnly ? '10px' : '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
            <button onClick={() => devReset()} style={{ fontSize: '0.6rem', color: '#666', background: 'none', border: '1px solid #333', padding: '2px 6px', borderRadius: '4px' }}>RESET</button>
            <button onClick={() => dismissPhase1()} style={{ fontSize: '0.6rem', color: 'var(--gold)', background: 'none', border: '1px solid var(--gold)', padding: '2px 6px', borderRadius: '4px' }}>SKIP TO P2</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
