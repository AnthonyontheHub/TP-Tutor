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

const STATUS_ORDER: MasteryStatus[] = [
  'not_started', 'introduced', 'practicing', 'confident', 'mastered',
];

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
      partsOfSpeech.forEach(pos => { mockData[pos] = MOCK_DICTIONARY[word.word] || `(Offline) ${word.word} li lon.`; });
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

  function handleAskLina(pos?: string) {
    const prompt = pos ? `toki Lina, can we practice using "${word.word}" as a ${pos}?` : `toki Lina, I want to discuss the word "${word.word}".`;
    onAskLina(prompt);
    onClose(); 
  }

  return (
    <AnimatePresence>
      <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        drag="y"
        dragConstraints={{ top: 0 }}
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) onClose();
        }}
        style={{ 
          position: 'fixed', 
          top: 'auto', bottom: 0, left: 0, right: 0, 
          height: '66vh', 
          width: '100%', maxWidth: '100vw', margin: 0, boxSizing: 'border-box',
          zIndex: 1000, 
          display: 'flex', flexDirection: 'column',
          boxShadow: getGlowColor(stagedStatus),
          borderTop: `1px solid ${stagedStatus === 'not_started' ? '#444' : 'transparent'}`,
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          background: 'var(--surface, #111)'
        }}
      >
        <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', touchAction: 'none', flexShrink: 0 }}>
          <div style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '0 20px', overflowY: 'auto', overflowX: 'hidden', flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <div className="word-drawer__meta">
            <span className="word-drawer__word">{word.word}</span>
            <div 
               style={{ marginTop: '4px', padding: isSandboxMode ? '4px' : '0', borderRadius: '4px', background: isSandboxMode ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'inline-block', cursor: isSandboxMode ? 'pointer' : 'default', userSelect: 'none' }}
               onClick={() => isSandboxMode && setStagedStatus(STATUS_ORDER[(STATUS_ORDER.indexOf(stagedStatus) + 1) % STATUS_ORDER.length])}
            >
              <span className="word-drawer__status" style={{ fontSize: '0.9rem', color: 'gray' }}>
                Status: {STATUS_META[stagedStatus].emoji} {STATUS_META[stagedStatus].label.toUpperCase()}
                {isSandboxMode && <span style={{ color: '#888', fontSize: '0.7rem', marginLeft: '8px' }}>🔄</span>}
              </span>
            </div>
            {stagedStatus !== word.status && (
              <div style={{ marginTop: '8px' }}>
                 <button onClick={() => updateVocabStatus(word.id, stagedStatus)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>💾 SAVE</button>
              </div>
            )}
            <span className="word-drawer__meanings" style={{ display: 'block', marginTop: '8px' }}>{word.meanings}</span>
          </div>

          <div className="word-drawer__section-label" style={{ marginTop: '16px' }}>{isSandboxMode ? 'SANDBOX EXAMPLES (OFFLINE)' : 'PARTS OF SPEECH & EXAMPLES'}</div>
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

          <button onClick={() => handleAskLina()} style={{ width: '100%', padding: '16px', marginTop: '16px', cursor: 'pointer', borderRadius: '8px', background: '#333', color: 'white', border: '1px solid #555', fontWeight: 'bold', marginBottom: '20px' }}>
            DISCUSS "{word.word.toUpperCase()}" WITH LINA
          </button>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #333', background: 'var(--surface, #111)', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            ✕ CLOSE
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
