import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore'; // NEW: To save your manual tests
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { fetchExamplesForWord } from '../services/linaService';

interface Props {
  word: VocabWord;
  onClose: () => void;
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
}

// Hand-picked phrases from "Everyday Toki Pona"
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
  'not_started',
  'introduced',
  'practicing',
  'confident',
  'mastered',
];

export default function WordDetailDrawer({ word, onClose, onAskLina, isSandboxMode }: Props) {
  const partsOfSpeech = word.partOfSpeech.split('/').map(p => p.trim());
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);

  // Hidden Tester State
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [stagedStatus, setStagedStatus] = useState<MasteryStatus>(word.status);

  // Reset staged status if the word changes
  useEffect(() => {
    setStagedStatus(word.status);
  }, [word.id, word.status]);

  // The Auto-Fallback Logic
  useEffect(() => {
    const loadOfflineData = () => {
      const mockData: Record<string, string> = {};
      partsOfSpeech.forEach(pos => {
        mockData[pos] = MOCK_DICTIONARY[word.word] || `(Offline) ${word.word} li lon. (The ${word.word} exists.)`;
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
        if (!data || Object.keys(data).length === 0 || data.error) {
          loadOfflineData();
        } else {
          setExamples(data);
          setIsGenerating(false);
        }
      })
      .catch(() => loadOfflineData());
  }, [word.word, isSandboxMode]);

  function handleAskLina(pos?: string) {
    const prompt = pos 
      ? `toki Lina, can we practice using "${word.word}" as a ${pos}?`
      : `toki Lina, I want to discuss the word "${word.word}".`;
    onAskLina(prompt);
    onClose(); 
  }

  // Handle Cycling Status (Sandbox Only)
  function handleCycleStatus() {
    const currentIndex = STATUS_ORDER.indexOf(stagedStatus);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    setStagedStatus(STATUS_ORDER[nextIndex]);
  }

  function handleSaveStatus() {
    updateVocabStatus(word.id, stagedStatus);
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
            
            {/* HIDDEN STATUS CYCLER */}
            <div 
               style={{ 
                 marginTop: '4px', 
                 padding: isSandboxMode ? '4px' : '0',
                 borderRadius: '4px',
                 background: isSandboxMode ? 'rgba(255,255,255,0.05)' : 'transparent',
                 display: 'inline-block',
                 cursor: isSandboxMode ? 'pointer' : 'default',
                 userSelect: 'none'
               }}
               onClick={() => isSandboxMode && handleCycleStatus()}
            >
              <span className="word-drawer__status" style={{ fontSize: '0.9rem', color: 'gray' }}>
                Status: {STATUS_META[stagedStatus].emoji} {STATUS_META[stagedStatus].label.toUpperCase()}
                {isSandboxMode && <span style={{ color: '#888', fontSize: '0.7rem', marginLeft: '8px' }}>🔄 (Click to cycle)</span>}
              </span>
            </div>

            {/* SAVE BUTTON (Only appears when status is modified) */}
            {stagedStatus !== word.status && (
              <div style={{ marginTop: '8px' }}>
                 <button 
                   onClick={handleSaveStatus}
                   style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                 >
                   💾 SAVE NEW STATUS
                 </button>
                 <span style={{ color: '#aaa', fontSize: '0.7rem', marginLeft: '8px' }}>Changes card color & unlocks phrases</span>
              </div>
            )}

            <span className="word-drawer__meanings" style={{ display: 'block', marginTop: '8px' }}>{word.meanings}</span>
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
