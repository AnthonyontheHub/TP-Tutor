import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { type VocabWord } from '../types/mastery';

interface Props {
  onClose: () => void;
}

interface ConfusionQuestion {
  id: string;
  meaning: string;
  correctWord: string;
  incorrectWord: string;
  pair: [string, string];
}

export default function ConfusionDrill({ onClose }: Props) {
  const { vocabulary, getTopConfusionPairs, recordConfusion, applyScoreUpdate } = useMasteryStore();
  
  const [questions, setQuestions] = useState<ConfusionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [drillXP, setDrillXP] = useState(0);
  const [wordsStudied, setWordsStudied] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [needsWorkPairs, setNeedsWorkPairs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const pairs = getTopConfusionPairs(8);
    if (pairs.length < 2) return;

    const newQuestions: ConfusionQuestion[] = [];
    pairs.forEach((pair, idx) => {
      const wordA = vocabulary.find(v => v.word.toLowerCase() === pair.wordA.toLowerCase());
      const wordB = vocabulary.find(v => v.word.toLowerCase() === pair.wordB.toLowerCase());

      if (wordA && wordB) {
        // Question A
        newQuestions.push({
          id: `q-${idx}-a`,
          meaning: wordA.meanings,
          correctWord: wordA.word,
          incorrectWord: wordB.word,
          pair: [wordA.word, wordB.word]
        });
        // Question B
        newQuestions.push({
          id: `q-${idx}-b`,
          meaning: wordB.meanings,
          correctWord: wordB.word,
          incorrectWord: wordA.word,
          pair: [wordA.word, wordB.word]
        });
      }
    });

    // Shuffle questions
    newQuestions.sort(() => Math.random() - 0.5);
    setQuestions(newQuestions);
  }, [getTopConfusionPairs, vocabulary]);

  const handleAnswer = (word: string) => {
    if (feedback) return;
    
    const currentQ = questions[currentIndex];
    const isCorrect = word === currentQ.correctWord;
    
    setSelectedWord(word);
    if (isCorrect) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
      const pairKey = currentQ.pair.sort().join('|');
      setNeedsWorkPairs(prev => new Set(prev).add(pairKey));
      recordConfusion(currentQ.pair[0], currentQ.pair[1]);
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentIndex];
    const vocabWord = vocabulary.find(v => v.word === currentQ.correctWord);
    if (vocabWord) applyScoreUpdate(vocabWord.id, 2, 'confusion_drill');
    setDrillXP(prev => prev + 2);
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const handleWrong = () => {
    const currentQ = questions[currentIndex];
    const vocabWord = vocabulary.find(v => v.word === currentQ.correctWord);
    if (vocabWord) applyScoreUpdate(vocabWord.id, -5, 'confusion_drill');
    setDrillXP(prev => prev - 5);
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const handleSkip = () => {
    setWordsStudied(prev => prev + 1);
    advance();
  };

  const advance = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
      setSelectedWord(null);
    } else {
      setIsComplete(true);
    }
  };

  if (questions.length < 4) { // Needs at least 2 pairs (4 questions)
    return (
      <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.95)' }}>
        <div className="glass-panel" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🧠</div>
          <h2 style={{ color: 'var(--gold)', marginBottom: '16px', letterSpacing: '0.1em' }}>NOT ENOUGH DATA</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
            No confusion pairs recorded yet. jan Lina will track words you mix up during sessions automatically.
          </p>
          <button className="btn-review" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.95)' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '8px', letterSpacing: '0.1em' }}>DRILL COMPLETE</h2>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
              {drillXP > 0 ? `+${drillXP}` : drillXP} XP
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              QUESTIONS ANSWERED: {wordsStudied}
            </div>
          </div>

          {needsWorkPairs.size > 0 && (
            <div style={{ marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '12px' }}>NEEDS MORE WORK</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Array.from(needsWorkPairs).map(pairKey => {
                  const [a, b] = pairKey.split('|');
                  return (
                    <div key={pairKey} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '4px', borderLeft: '2px solid #ef4444', display: 'flex', justifyContent: 'center', gap: '12px', fontWeight: 700 }}>
                      <span>{a}</span>
                      <span style={{ opacity: 0.3 }}>vs</span>
                      <span>{b}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            <button className="btn-review" onClick={() => {
              setCurrentIndex(0);
              setDrillXP(0);
              setWordsStudied(0);
              setFeedback(null);
              setSelectedWord(null);
              setIsComplete(false);
              setNeedsWorkPairs(new Set());
              // Re-shuffle
              setQuestions([...questions].sort(() => Math.random() - 0.5));
            }}>DRILL AGAIN</button>
            <button className="btn-toggle" onClick={onClose}>CLOSE</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const options = [currentQ.correctWord, currentQ.incorrectWord].sort((a, b) => a.localeCompare(b)); // Simple deterministic shuffle for buttons could be better but let's use a stable sort for the component life

  return (
    <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.95)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.1)' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }}
        />
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'var(--gold)', fontWeight: 900 }}>
        ANSWERS: {wordsStudied}
      </div>

      <div style={{ width: '100%', maxWidth: '600px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: '40px', textTransform: 'uppercase' }}>
          Which word means this?
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ marginBottom: '60px' }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
              {currentQ.meaning}
            </div>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: feedback ? '40px' : 0 }}>
          {options.map(word => {
            const isCorrect = word === currentQ.correctWord;
            const isSelected = word === selectedWord;
            
            let borderColor = 'var(--border)';
            let bgColor = 'var(--surface-opaque)';
            let textColor = 'white';

            if (feedback) {
              if (isCorrect) {
                borderColor = '#22c55e';
                bgColor = 'rgba(34, 197, 94, 0.1)';
              } else if (isSelected && !isCorrect) {
                borderColor = '#ef4444';
                bgColor = 'rgba(239, 68, 68, 0.1)';
              }
            }

            return (
              <button
                key={word}
                onClick={() => handleAnswer(word)}
                disabled={!!feedback}
                style={{
                  padding: '30px 20px',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  borderRadius: '12px',
                  border: `2px solid ${borderColor}`,
                  background: bgColor,
                  color: textColor,
                  cursor: feedback ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSelected && isCorrect ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none'
                }}
              >
                {word}
                {feedback && isCorrect && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '8px' }}
                  >
                    pona!
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        {feedback && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '300px', margin: '0 auto' }}
          >
            <button onClick={handleNext} className="btn-review" style={{ width: '100%', margin: 0, opacity: feedback === 'wrong' ? 0.6 : 1 }}>✓ GOT IT</button>
            <button 
              onClick={handleSkip} 
              style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', padding: '12px', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              → SKIP
            </button>
            <button 
              onClick={handleWrong} 
              style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '12px', borderRadius: '4px', fontWeight: 900, cursor: 'pointer', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              ✗ WRONG
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
