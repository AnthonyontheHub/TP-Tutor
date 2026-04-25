/* src/components/SentenceBuilder.tsx */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VocabWord } from '../types/mastery';
import { useMasteryStore } from '../store/masteryStore';

interface SentenceBuilderProps {
  onSave: () => void;
  onPractice: (sentence: string) => void;
  onExplain: (sentence: string) => void;
  onRemoveLast: () => void;
  translation: string | null;
  isAutoTranslating: boolean;
}

export default function SentenceBuilder({
  onSave,
  onPractice,
  onExplain,
  onRemoveLast,
  translation,
  isAutoTranslating
}: SentenceBuilderProps) {
  const { selectedWords, vocabulary, setSelectedWords } = useMasteryStore();
  const sentence = selectedWords.join(' ');
  const hasSelection = selectedWords.length > 0;

  return (
    <AnimatePresence>
      {hasSelection && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            background: 'linear-gradient(to bottom, #0f172a, #000)',
            borderTop: '2px solid var(--gold)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
            padding: '16px 20px 24px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
          }}
        >
          {/* Top Layer: English Translation */}
          <div style={{
            minHeight: '24px',
            color: isAutoTranslating ? 'var(--gold)' : '#94a3b8',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: '12px',
            opacity: 0.8
          }}>
            {isAutoTranslating ? 'Lina is thinking...' : (translation || 'Constructing translation...')}
          </div>

          {/* Middle Layer: Large Toki Pona Sentence */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginBottom: '20px',
            padding: '10px 0'
          }}>
            {selectedWords.map((word, idx) => {
              const vocab = vocabulary.find(v => v.word === word);
              const meaning = vocab?.meanings?.split(',')[0].trim() || '';
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2px' }}>
                    {meaning}
                  </div>
                  <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {word}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Layer: Lina Toolbelt */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
          }}>
            <button
              onClick={onSave}
              className="btn-review"
              style={{
                margin: 0,
                padding: '12px 4px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>💾</span>
              <span>SAVE</span>
            </button>

            <button
              onClick={() => onPractice(sentence)}
              className="btn-review"
              style={{
                margin: 0,
                padding: '12px 4px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>💬</span>
              <span>PRACTICE</span>
            </button>

            <button
              onClick={() => onExplain(sentence)}
              className="btn-review"
              style={{
                margin: 0,
                padding: '12px 4px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>🧠</span>
              <span>EXPLAIN</span>
            </button>

            <button
              onClick={() => setSelectedWords([])}
              className="btn-review"
              style={{
                margin: 0,
                padding: '12px 4px',
                background: '#7f1d1d',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.6rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>✕</span>
              <span>CLEAR</span>
            </button>
          </div>
          
          {/* Subtle Pull Indicator */}
          <div style={{
            width: '40px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            margin: '12px auto 0'
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
