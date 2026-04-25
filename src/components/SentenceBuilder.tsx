/* src/components/SentenceBuilder.tsx */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface SentenceBuilderProps {
  onSave: () => void;
  onPractice: (sentence: string) => void;
  onExplain: (sentence: string) => void;
  translation: string | null;
  isAutoTranslating: boolean;
}

export default function SentenceBuilder({
  onSave,
  onPractice,
  onExplain,
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '5%',
            right: '5%',
            height: '110px',
            zIndex: 2000,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 16px',
            overflow: 'hidden'
          }}
        >
          {/* Top Layer: Literal Definitions (Hints) */}
          <div style={{
            display: 'flex',
            gap: '4px',
            justifyContent: 'center',
            height: '18px',
            overflow: 'hidden',
            fontSize: '0.55rem',
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: '2px'
          }}>
            {selectedWords.map((word, idx) => {
              const vocab = vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase());
              // Take the first meaning (before any comma or semicolon)
              const hint = vocab?.meanings?.split(/[;,]/)[0].trim() || '?';
              return (
                <span key={idx}>
                  {hint}{idx < selectedWords.length - 1 ? ' | ' : ''}
                </span>
              );
            })}
          </div>

          {/* Middle Layer: The Sentence */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '0.02em',
              lineHeight: 1.1
            }}>
              {isAutoTranslating ? (
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  {sentence}
                </motion.span>
              ) : (
                sentence
              )}
            </div>
            {translation && !isAutoTranslating && (
              <div style={{ fontSize: '0.7rem', color: 'var(--gold)', opacity: 0.9, fontWeight: 600, marginTop: '2px' }}>
                {translation}
              </div>
            )}
          </div>

          {/* Bottom Layer: Iconic Toolbelt */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '4px 0',
            borderTop: '1px solid rgba(255,255,255,0.05)'
          }}>
            <IconButton onClick={onSave} icon="🔖" label="Save" />
            <IconButton onClick={() => onExplain(sentence)} icon="✨" label="Explain" color="var(--gold)" />
            <IconButton onClick={() => onPractice(sentence)} icon="💬" label="Practice" color="var(--gold)" />
            <IconButton onClick={() => setSelectedWords([])} icon="✕" label="Clear" color="#ef4444" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function IconButton({ onClick, icon, label, color = 'white' }: { onClick: () => void, icon: string, label: string, color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        cursor: 'pointer',
        padding: '4px 12px'
      }}
    >
      <span style={{ fontSize: '1.2rem', color }}>{icon}</span>
      <span style={{ fontSize: '0.5rem', color: '#888', textTransform: 'uppercase', fontWeight: 800 }}>{label}</span>
    </button>
  );
}
