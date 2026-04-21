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
  const [stagedStatus, setStagedStatus] = useState<MasteryStatus>(word.status);

  useEffect(() => { setStagedStatus(word.status); }, [word.id, word.status]);

  useEffect(() => {
    const loadOfflineData = () => {
      const mockData: Record<string, string> = {};
      partsOfSpeech.forEach(pos => { mockData[pos] = MOCK_DICTIONARY[word.word] || `${word.word} li lon.`; });
      setExamples(mockData);
      setIsGenerating(false);
    };

    if (isSandboxMode) { loadOfflineData(); return; }
    const apiKey = localStorage.getItem('TP_GEMINI_KEY');
    if (!apiKey) { loadOfflineData(); return; }

    setIsGenerating(true);
    fetchExamplesForWord(apiKey, word.word, partsOfSpeech)
      .then(data => {
        if (!data || Object.keys(data).length === 0 || data.error) loadOfflineData();
        else { setExamples(data); setIsGenerating(false); }
      })
      .catch(() => loadOfflineData());
  }, [word.word, isSandboxMode]);

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100 || info.velocity.y > 500) onClose(); }}
        style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '66vh', zIndex: 1000, 
          display: 'flex', flexDirection: 'column', boxShadow: getGlowColor(stagedStatus),
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px', background: 'var(--surface, #111)'
        }}
      >
        <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', touchAction: 'none', flexShrink: 0 }}>
          <div style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '0 20px', overflowY: 'auto', flex: 1 }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <div style={{ marginTop: '4px', color: 'gray', fontSize: '0.9rem' }}>
              Status: {STATUS_META[stagedStatus].emoji} {STATUS_META[stagedStatus].label.toUpperCase()}
            </div>
            <span className="word-drawer__meanings" style={{ display: 'block', marginTop: '8px' }}>{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label" style={{ marginTop: '16px' }}>EXAMPLES</div>
          <div className="word-drawer__examples-list">
            {partsOfSpeech.map((pos) => (
              <div key={pos} style={{ background: '#1a1a1a', padding: '12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #333' }}>
                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem', color: '#888' }}>{pos}</span>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic', fontSize: '0.85rem' }}>
                  {isGenerating ? "Lina is thinking..." : examples[pos]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #333', background: 'var(--surface, #111)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>✕ CLOSE</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
