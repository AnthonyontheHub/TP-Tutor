import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_META } from '../types/mastery';
import type { VocabWord } from '../types/mastery';
import { fetchExamplesForWord } from '../services/linaService';

interface Props {
  word: VocabWord;
  onClose: () => void;
  onAskLina: (prompt: string) => void;
}

export default function WordDetailDrawer({ word, onClose, onAskLina }: Props) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  
  // NEW: State for our dynamically generated examples
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);

  // NEW: Fetch examples when the drawer opens
  useEffect(() => {
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    
    if (!apiKey) {
      setExamples({ error: "No API Key found. Add key in chat to generate examples." });
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    fetchExamplesForWord(apiKey, word.word, partsOfSpeech)
      .then(data => {
        setExamples(data);
        setIsGenerating(false);
      })
      .catch(() => {
        setExamples({ error: "Lina encountered an error generating examples." });
        setIsGenerating(false);
      });
  }, [word.word]); // Reruns if the word changes

  function handleAskLina(pos?: string) {
    const prompt = pos 
      ? `toki Lina, can we practice using "${word.word}" as a ${pos}?`
      : `toki Lina, I want to discuss the word "${word.word}".`;
    
    onAskLina(prompt);
    onClose(); 
  }

  return (
    <AnimatePresence>
      <motion.div
        className="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        className="word-drawer"
        role="dialog"
        aria-modal="true"
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        initial={{ y: '100%' }}
        animate={{ y: '50%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150) onClose();
        }}
        dragSnapToOrigin={false}
        style={{ height: '100vh', top: 0, position: 'fixed', zIndex: 1000 }}
      >
        <div className="word-drawer__drag-zone" style={{ width: '100%', padding: '12px 0', cursor: 'grab' }}>
          <div className="word-drawer__handle" style={{ width: '40px', height: '5px', backgroundColor: '#888', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div className="word-drawer__content" style={{ padding: '0 20px 40px' }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <span className="word-drawer__status" style={{ display: 'block', marginTop: '4px', fontSize: '0.9rem', color: '#666' }}>
              Status: {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
            </span>
            <span className="word-drawer__meanings">{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label">PARTS OF SPEECH & EXAMPLES</div>

          <div className="word-drawer__examples-list">
            {/* Find this line in your WordDetailDrawer.tsx */}
{partsOfSpeech.map((pos) => (
  <div key={pos} style={{ 
    background: 'var(--surface)', // Swapped from #f5f5f5
    padding: '12px', 
    borderRadius: '4px', // Squaring it off a bit more to match your UI
    marginBottom: '12px',
    border: 'var(--b1) solid #222' // Added a subtle border
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{pos}</span>
      <button 
        className="btn-nav" // Using your existing button class for consistency
        onClick={() => handleAskLina(pos)}
        style={{ fontSize: '0.6rem', padding: '4px 8px' }}
      >
        💬 Ask Lina
      </button>
    </div>
    <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text)' }}>
      {/* ... keeping the logic the same ... */}
    </p>
  </div>
))}
          </div>

          <button 
             style={{ width: '100%', padding: '12px', marginTop: '10px', cursor: 'pointer', borderRadius: '8px', background: '#333', color: 'white', border: 'none' }}
             onClick={() => handleAskLina()}
          >
            DISCUSS "{word.word.toUpperCase()}" WITH LINA
          </button>

          <button className="word-drawer__close" onClick={onClose} style={{ marginTop: '16px' }}>
            ✕&nbsp;&nbsp;CLOSE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
