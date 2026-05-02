import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import WordDetailDrawer from './WordDetailDrawer';
import { soundService } from '../services/soundService';

interface Props {
  onClose: () => void;
  onAskLina?: (p: string) => void;
  isSandboxMode?: boolean;
}

export default function FlashcardMode({ onClose, onAskLina, isSandboxMode }: Props) {
  const { vocabulary, applyScoreUpdate } = useMasteryStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsStudied, setCardsStudied] = useState(0);
  const [detailWordId, setDetailWordId] = useState<string | null>(null);

  const [displayCards, setDisplayCards] = useState<typeof vocabulary>([]);

  useEffect(() => {
    let pool = [...vocabulary].filter(v => v.baseScore < 800);
    if (pool.length === 0) pool = [...vocabulary];

    pool.sort((a, b) => a.baseScore - b.baseScore);
    const subset = pool.slice(0, 50);

    for (let i = subset.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [subset[i], subset[j]] = [subset[j], subset[i]];
    }
    setDisplayCards(subset);
  }, []); // Only shuffle once when mode opens

  const handleNext = () => {
    const currentWord = displayCards[currentIndex];
    // Add 2 points to the word
    applyScoreUpdate(currentWord.id, 2, 'flashcard_mode');
    
    setCardsStudied(prev => prev + 1);
    setIsFlipped(false);
    
    // Go to next card, loop back if at end
    setCurrentIndex((prev) => (prev + 1) % displayCards.length);
  };

  const handleSkip = () => {
    setCardsStudied(prev => prev + 1);
    setIsFlipped(false);
    
    // Go to next card, loop back if at end
    setCurrentIndex((prev) => (prev + 1) % displayCards.length);
  };

  const handleWrong = () => {
    const currentWord = displayCards[currentIndex];
    // Subtract 5 points from the word
    applyScoreUpdate(currentWord.id, -5, 'flashcard_mode');
    
    setCardsStudied(prev => prev + 1);
    setIsFlipped(false);
    
    // Go to next card, loop back if at end
    setCurrentIndex((prev) => (prev + 1) % displayCards.length);
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  if (displayCards.length === 0) {
    return (
      <div className="modal-backdrop" style={{ zIndex: 6000 }}>
         <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <h2 style={{ color: 'white' }}>No words to review!</h2>
            <button onClick={onClose} className="btn-review">CLOSE</button>
         </div>
      </div>
    );
  }

  const word = displayCards[currentIndex];

  return (
    <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.9)' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 6001 }}>
        <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}>
          END SESSION
        </button>
      </div>

      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'var(--gold)', fontWeight: 900 }}>
        CARDS STUDIED: {cardsStudied}
      </div>

      <div style={{ width: '100%', maxWidth: '500px', padding: '20px' }}>
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key={`front-${word.id}-${currentIndex}`}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--gold)',
                borderRadius: '12px',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                padding: '24px'
              }}
              onClick={handleFlip}
            >
              <div style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>TAP TO FLIP</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '4rem', margin: 0, color: 'white', fontWeight: 900, textAlign: 'center' }}>{word.word}</h2>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); soundService.speak(word.word); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5rem' }}
                  aria-label="Pronounce word"
                >
                  🔊
                </button>
              </div>
              <div style={{ color: 'var(--gold)', fontSize: '1rem', marginTop: '12px', fontWeight: 700 }}>{word.partOfSpeech.toUpperCase()}</div>
            </motion.div>
          ) : (
            <motion.div
              key={`back-${word.id}-${currentIndex}`}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'rgba(255,191,0,0.1)',
                border: '2px solid var(--gold)',
                borderRadius: '12px',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(255,191,0,0.2)',
                padding: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'white', fontWeight: 900 }}>{word.word}</h2>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); soundService.speak(word.word); }}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}
                  aria-label="Pronounce word"
                >
                  🔊
                </button>
              </div>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setDetailWordId(word.id); }}
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--gold)', 
                  color: 'var(--gold)', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  fontWeight: 900, 
                  cursor: 'pointer', 
                  marginTop: '8px' 
                }}
              >
                🔎 DETAILS
              </button>
              
              <div style={{ fontSize: '1.2rem', color: '#ccc', margin: '20px 0', lineHeight: '1.4' }}>
                {word.meanings}
              </div>
              
              {word.sessionNotes && (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>
                  "{word.sessionNotes}"
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', width: '100%' }}>
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="btn-review"
                  style={{ width: '100%', margin: 0 }}
                >
                  NEXT CARD (+2 XP)
                </button>
                <button 
                  type="button" 
                  onClick={handleSkip}
                  style={{ 
                    width: '100%', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    color: '#aaa', 
                    padding: '12px', 
                    borderRadius: '4px', 
                    fontWeight: 900, 
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    fontSize: '0.8rem'
                  }}
                >
                  NEXT CARD
                </button>
                <button 
                  type="button" 
                  onClick={handleWrong}
                  style={{ 
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
                  }}
                >
                  NEXT CARD (-5 XP)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <WordDetailDrawer
        isOpen={!!detailWordId}
        word={detailWordId ? vocabulary.find(v => v.id === detailWordId) ?? null : null}
        onClose={() => setDetailWordId(null)}
        onAskLina={onAskLina || (() => {})}
        isSandboxMode={isSandboxMode || false}
        onWordSelect={(w) => setDetailWordId(w)}
      />
    </div>
  );
}
