import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { type VocabWord } from '../types/mastery';

interface Props {
  onClose: () => void;
}

type DrillMode = 'select' | 'recognition' | 'production' | 'summary';

export default function DualDrillMode({ onClose }: Props) {
  const { vocabulary, applyScoreUpdate } = useMasteryStore();

  const [mode, setMode] = useState<DrillMode>('select');
  const [queue, setQueue] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Recognition state
  const [isRevealed, setIsRevealed] = useState(false);

  // Production state
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Stats
  const [drillXP, setDrillXP] = useState(0);
  const [wordsStudied, setWordsStudied] = useState(0);

  const initializeQueue = () => {
    let pool = vocabulary.filter(v => v.status === 'introduced' || v.status === 'practicing');
    if (pool.length === 0) pool = [...vocabulary];

    pool.sort(() => 0.5 - Math.random());
    setQueue(pool.slice(0, 15));
    setCurrentIndex(0);
    setIsRevealed(false);
    setInputValue('');
    setFeedback(null);
    setDrillXP(0);
    setWordsStudied(0);
  };

  useEffect(() => {
    initializeQueue();
  }, []);

  const handleNext = () => {
    const word = queue[currentIndex];
    applyScoreUpdate(word.id, 2, 'dual_drill');
    setDrillXP(prev => prev + 2);
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const handleWrong = () => {
    const word = queue[currentIndex];
    applyScoreUpdate(word.id, -5, 'dual_drill');
    setDrillXP(prev => prev - 5);
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const handleSkip = () => {
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const advance = () => {
    if (currentIndex + 1 >= queue.length) {
      setMode('summary');
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
      setInputValue('');
      setFeedback(null);
    }
  };

  const handleProductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const word = queue[currentIndex];
    const isCorrect = inputValue.trim().toLowerCase() === word.word.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  if (mode === 'select') {
    return (
      <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.9)' }}>
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 6001 }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}>
            CLOSE
          </button>
        </div>
        
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '24px', letterSpacing: '0.1em' }}>SELECT DRILL MODE</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <button 
              className="btn-review" 
              onClick={() => setMode('recognition')}
              style={{ padding: '20px', fontSize: '1.1rem' }}
            >
              RECOGNITION
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '8px', fontWeight: 'normal', textTransform: 'none' }}>
                Toki Pona → English
              </div>
            </button>
            <button 
              className="btn-toggle" 
              onClick={() => setMode('production')}
              style={{ padding: '20px', fontSize: '1.1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
            >
              PRODUCTION
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '8px', fontWeight: 'normal', textTransform: 'none' }}>
                English → Toki Pona
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'summary') {
    return (
      <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.9)' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '24px', letterSpacing: '0.1em' }}>DRILL COMPLETE</h2>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
              {drillXP > 0 ? `+${drillXP}` : drillXP} XP
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              WORDS STUDIED: {wordsStudied}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <button className="btn-review" onClick={() => { initializeQueue(); setMode('select'); }}>DRILL AGAIN</button>
            <button className="btn-toggle" onClick={onClose}>CLOSE</button>
          </div>
        </div>
      </div>
    );
  }

  if (queue.length === 0) return null;
  const currentWord = queue[currentIndex];

  return (
    <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.9)' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 6001 }}>
        <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}>
          END SESSION
        </button>
      </div>

      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'var(--text-muted)', fontWeight: 900 }}>
        {currentIndex + 1} / {queue.length}
      </div>

      <div style={{ width: '100%', maxWidth: '500px', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {mode === 'recognition' && (
            <motion.div
              key={`recog-${currentWord.id}-${isRevealed}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                minHeight: '350px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                padding: '32px'
              }}
              onClick={() => !isRevealed && setIsRevealed(true)}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '3.5rem', margin: '0 0 8px 0', color: 'white', fontWeight: 900, textAlign: 'center' }}>
                  {currentWord.word}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {currentWord.partOfSpeech}
                </div>

                {isRevealed ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ marginTop: '32px', fontSize: '1.2rem', color: 'var(--gold)', textAlign: 'center', lineHeight: '1.4' }}
                  >
                    {currentWord.meanings}
                  </motion.div>
                ) : (
                  <div style={{ marginTop: '32px', fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    TAP TO REVEAL
                  </div>
                )}
              </div>

              {isRevealed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="btn-review" style={{ width: '100%', margin: 0 }}>✓ GOT IT</button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleSkip(); }} 
                    style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', padding: '12px', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                  >
                    → SKIP
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleWrong(); }} 
                    style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '12px', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                  >
                    ✗ WRONG
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'production' && (
            <motion.div
              key={`prod-${currentWord.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                background: feedback === 'correct' ? 'rgba(34, 197, 94, 0.1)' : 'var(--surface)',
                border: `2px solid ${feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : 'var(--border)'}`,
                borderRadius: '12px',
                minHeight: '350px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: feedback === 'correct' ? '0 0 30px rgba(34, 197, 94, 0.2)' : '0 10px 30px rgba(0,0,0,0.5)',
                padding: '32px'
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '1.5rem', color: 'white', textAlign: 'center', lineHeight: '1.4', marginBottom: '32px' }}>
                  {currentWord.meanings}
                </div>

                <form onSubmit={handleProductionSubmit} style={{ width: '100%' }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type Toki Pona word..."
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    readOnly={feedback !== null}
                    style={{
                      width: '100%', padding: '16px', fontSize: '1.5rem', textAlign: 'center',
                      background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border)', borderRadius: '8px',
                      color: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : 'var(--gold)',
                      fontWeight: 900, outline: 'none'
                    }}
                  />
                  
                  {feedback === 'correct' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ marginTop: '16px', textAlign: 'center', color: '#22c55e', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.1em' }}
                    >
                      pona! ✓
                    </motion.div>
                  )}

                  {feedback === 'wrong' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: '16px', textAlign: 'center', color: 'var(--gold)', fontSize: '1.1rem', fontWeight: 900 }}
                    >
                      The word was: <span style={{ color: 'white' }}>{currentWord.word}</span>
                    </motion.div>
                  )}

                  {!feedback ? (
                    <button type="submit" className="btn-review" style={{ width: '100%', marginTop: '24px' }}>CHECK</button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px', width: '100%' }}>
                      <button 
                        type="button" 
                        onClick={feedback === 'correct' ? handleNext : handleWrong} 
                        className={feedback === 'correct' ? "btn-review" : ""}
                        style={feedback === 'wrong' ? { 
                          width: '100%', 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          border: '1px solid rgba(239, 68, 68, 0.5)', 
                          color: '#ef4444', 
                          padding: '12px', 
                          borderRadius: '4px', 
                          fontWeight: 900, 
                          cursor: 'pointer', 
                          letterSpacing: '0.05em', 
                          fontSize: '0.8rem' 
                        } : { width: '100%', margin: 0 }}
                      >
                        NEXT
                      </button>
                      <button 
                        type="button" 
                        onClick={handleSkip} 
                        style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', padding: '12px', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em', fontSize: '0.8rem' }}
                      >
                        → SKIP
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
