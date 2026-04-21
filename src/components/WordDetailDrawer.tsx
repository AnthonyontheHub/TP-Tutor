/* src/components/WordDetailDrawer.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { fetchExamplesForWord } from '../services/linaService';

interface Props {
  word: VocabWord;
  onClose: () => void;
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
}

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

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

const getGlowColor = (status: MasteryStatus) => {
  switch (status) {
    case 'introduced': return '0 -8px 30px rgba(59, 130, 246, 0.25)';
    case 'practicing': return '0 -8px 30px rgba(234, 179, 8, 0.25)'; 
    case 'confident': return '0 -8px 30px rgba(34, 197, 94, 0.25)';  
    case 'mastered': return '0 -8px 40px rgba(16, 185, 129, 0.35)';  
    default: return '0 -8px 30px rgba(150, 150, 150, 0.1)';          
  }
};

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: Props) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  useEffect(() => {
    const loadOfflineData = () => {
      const mockData: Record<string, string> = {};
      partsOfSpeech.forEach(pos => { 
        mockData[pos] = MOCK_DICTIONARY[word.word] || `${word.word} li lon.`; 
      });
      setExamples(mockData);
      setIsGenerating(false);
    };

    if (isSandboxMode) {
      loadOfflineData();
      return;
    }

    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (!apiKey) {
      loadOfflineData();
      return;
    }

    setIsGenerating(true);
    fetchExamplesForWord(apiKey, word.word, partsOfSpeech)
      .then(data => {
        if (!data || Object.keys(data).length === 0 || data.error) loadOfflineData();
        else { setExamples(data); setIsGenerating(false); }
      })
      .catch(() => loadOfflineData());
  }, [word.word, isSandboxMode]);

  function handleAskLina(pos: string) {
    onAskLina(`toki Lina, can we practice using "${word.word}" as a ${pos}?`);
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="word-drawer"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ boxShadow: getGlowColor(word.status) }}
      >
        <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0 }}>
          <div style={{ width: '48px', height: '6px', backgroundColor: '#444', borderRadius: '10px', margin: '0 auto' }} />
        </div>
        <div className="word-drawer__scroll-area">
          <h2 style={{ fontSize: '2rem', margin: '0 0 8px' }}>{word.word}</h2>
          <div 
             onClick={() => isSandboxMode && updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length])}
             style={{ cursor: isSandboxMode ? 'pointer' : 'default', color: '#888', marginBottom: '16px' }}
          >
            {STATUS_META[word.status].emoji} {STATUS_META[word.status].label.toUpperCase()}
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {partsOfSpeech.map(pos => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '12px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555', fontSize: '0.7rem' }}>{pos.toUpperCase()}</span>
                  <button onClick={() => handleAskLina(pos)} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontSize: '0.7rem', cursor: 'pointer' }}>ASK LINA</button>
                </div>
                <p style={{ margin: 0, fontStyle: 'italic' }}>{isGenerating ? '...' : examples[pos]}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>✕ CLOSE</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
