import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_META } from '../types/mastery';
import type { VocabWord } from '../types/mastery';
import { fetchExamplesForWord } from '../services/linaService';

interface Props {
  word: VocabWord;
  onClose: () => void;
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
}

// Hand-picked phrases from your document
const MOCK_DICTIONARY: Record<string, string> = {
  "pona": "ale li pona. (Everything is good.)",
  "lili": "ni li lili. (That is small.)",
  "musi": "ni li musi. (This is fun.)",
  "wawa": "sina wawa. (You are strong.)",
  "sona": "sina sona mute. (You are smart/wise.)",
  "pali": "pali pona! (Good work!)",
  "jan": "sina pona tawa jan. (You are good toward people.)",
  "suli": "ni li suli. (This is important.)",
  "ike": "mi pilin ike. (I feel bad.)",
  "mute": "sina sona mute. (You know much.)"
};

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: Props) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Helper function to instantly load our offline phrases
    const loadOfflineData = () => {
      const mockData: Record<string, string> = {};
      partsOfSpeech.forEach(pos => {
        mockData[pos] = MOCK_DICTIONARY[word.word] || `(Offline) ${word.word} li lon. (The ${word.word} exists.)`;
      });
      setExamples(mockData);
      setIsGenerating(false);
    };

    // 1. If Sandbox toggle is manually ON, use offline data instantly.
    if (isSandboxMode) {
      loadOfflineData();
      return;
    }

    // 2. If Sandbox is OFF, but there is NO API key, auto-fallback to offline data.
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (!apiKey) {
      loadOfflineData();
      return;
    }

    // 3. If we have a key, try the AI.
    setIsGenerating(true);
    fetchExamplesForWord(apiKey, word.word, partsOfSpeech)
      .then(data => {
        // If AI returns nothing or an error string, auto-fallback to offline data.
        if (!data || Object.keys(data).length === 0 || data.error) {
          loadOfflineData();
        } else {
          setExamples(data);
          setIsGenerating(false);
        }
      })
      .catch(() => {
        // 4. If AI throws a quota/rate-limit error, auto-fallback to offline data.
        loadOfflineData();
      });
  }, [word.word, isSandboxMode]);

  function handleAskLina(pos?: string) {
    const prompt = pos 
      ? `toki Lina, can we practice using "${word.word}" as a ${pos}?`
      : `toki Lina, I want to discuss the word "${word.word}".`;
    onAskLina(prompt);
    onClose(); 
  }

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="word-drawer"
        drag="y"
        dragConstraints={{ top: 0 }}
        initial={{ y: '100%' }}
        animate={{ y: '50%' }}
        exit={{ y: '100%' }}
        style={{ height: '100vh', top: 0, position: 'fixed', zIndex: 1000 }}
      >
        <div className="word-drawer__drag-zone" style={{ width: '100%', padding: '12px 0', cursor: 'grab' }}>
          <div className="word-drawer__handle" style={{ width: '40px', height: '5px', backgroundColor: '#888', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div className="word-drawer__content" style={{ padding: '0 20px 40px' }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <span className="word-drawer__status" style={{ display: 'block', marginTop: '4px', fontSize: '0.9rem', color: 'gray' }}>
              Status: {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
            </span>
            <span className="word-drawer__meanings">{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label">
            {isSandboxMode ? 'SANDBOX EXAMPLES (OFFLINE)' : 'PARTS OF SPEECH & EXAMPLES'}
          </div>

          <div className="word-drawer__examples-list">
            {partsOfSpeech.map((pos) => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', color: '#888' }}>{pos}</span>
                  <button className="btn-nav" onClick={() => handleAskLina(pos)} style={{ fontSize: '0.6rem', padding: '4px 8px' }}>💬 Ask Lina</button>
                </div>
                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.85rem', color: isSandboxMode ? '#aaa' : '#eee' }}>
                  {isGenerating ? <span className="typing-dots">Lina is thinking...</span> : (examples[pos] || examples.error || "No example available.")}
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
          <button className="word-drawer__close" onClick={onClose} style={{ marginTop: '16px' }}>✕&nbsp;&nbsp;CLOSE</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
