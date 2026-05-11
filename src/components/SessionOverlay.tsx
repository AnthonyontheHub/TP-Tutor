import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';
import DualDrillMode from './DualDrillMode';
import ConfusionDrill from './ConfusionDrill';
import { ExamActivity } from './ExamActivity';

// We inline a simple sentence unscramble drill here.
const BuilderDrill = ({ 
  nodeId, 
  requiredVocabIds, 
  onComplete, 
  onSkip 
}: { 
  nodeId: string, 
  requiredVocabIds: string[], 
  onComplete: () => void, 
  onSkip: () => void 
}) => {
  const { vocabulary } = useMasteryStore();

  const words = useMemo(() => {
    let targetWords = requiredVocabIds;
    if (targetWords.length === 0) {
      const activeVocab = vocabulary.filter(v => v.status !== 'not_started');
      targetWords = activeVocab.slice(0, 4).map(v => v.word);
    }
    if (targetWords.length === 0) {
      targetWords = ['toki', 'pona', 'li', 'pona'];
    }
    return targetWords;
  }, [requiredVocabIds, vocabulary]);

  const [shuffled, setShuffled] = useState<{ id: string, word: string }[]>([]);
  const [selected, setSelected] = useState<{ id: string, word: string }[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const list = words.map((w, i) => ({ id: `word-${i}`, word: w }));
    setShuffled(list.sort(() => Math.random() - 0.5));
    setSelected([]);
    setIsCorrect(false);
  }, [words]);

  const handleSelect = (item: { id: string, word: string }) => {
    setShuffled(prev => prev.filter(x => x.id !== item.id));
    setSelected(prev => [...prev, item]);
  };

  const handleDeselect = (item: { id: string, word: string }) => {
    setSelected(prev => prev.filter(x => x.id !== item.id));
    setShuffled(prev => [...prev, item]);
  };

  useEffect(() => {
    if (selected.length === words.length && words.length > 0) {
      setIsCorrect(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [selected, words.length, onComplete]);

  if (isCorrect) {
    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center text-center py-12"
      >
        <div className="w-24 h-24 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <span className="text-5xl text-[#D4AF37]">✓</span>
        </div>
        <h2 className="text-4xl font-bold mb-2 text-[#D4AF37] tracking-widest uppercase">pona!</h2>
        <p className="text-xl text-gray-300 font-medium tracking-widest uppercase">Activity complete.</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-4 text-[#D4AF37] tracking-widest uppercase">Assemble the Sentence</h2>
      
      <div className="min-h-[60px] flex flex-wrap justify-center gap-2 mb-12 w-full max-w-xl p-4 border-b border-white/20">
        <AnimatePresence>
          {selected.map((item, idx) => (
            <motion.button
              key={item.id}
              layoutId={item.id}
              onClick={() => handleDeselect(item)}
              className="px-4 py-2 text-xl font-bold rounded shadow-lg bg-white text-black"
              transition={{ type: 'spring' }}
            >
              {item.word}
            </motion.button>
          ))}
        </AnimatePresence>
        {selected.length === 0 && (
          <div className="text-white/20 uppercase tracking-widest font-mono text-sm self-center">Tap words below to build</div>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 w-full max-w-xl">
        <AnimatePresence>
          {shuffled.map(item => (
            <motion.button
              key={item.id}
              layoutId={item.id}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 bg-[#1a1a1a] text-white border border-white/20 text-xl font-bold rounded shadow-lg hover:bg-[#252525]"
            >
              {item.word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12">
        <button onClick={onSkip} className="px-6 py-2 bg-transparent text-white/50 border border-white/20 rounded-full font-bold hover:bg-white/10 uppercase tracking-widest text-xs">
          Skip
        </button>
      </div>
    </div>
  );
};

export const SessionOverlay: React.FC<{ onAskLina?: (p: string) => void }> = ({ onAskLina }) => {
  const { activeActivity, setActiveActivity, recordActivityCompletion, curriculums } = useMasteryStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const initiatedRef = useRef(false);

  // Sync state cleanly
  useEffect(() => {
    if (!activeActivity) {
      initiatedRef.current = false;
    }
  }, [activeActivity]);

  if (!activeActivity) return null;

  const { type, nodeId } = activeActivity;

  // Handle exam-mode specially
  if (type === 'exam-mode') {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1000] flex flex-col overflow-hidden">
        <div className="flex justify-end p-6">
          <button onClick={() => setActiveActivity(null)} className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <ExamActivity nodeId={nodeId} onComplete={() => setActiveActivity(null)} />
          </div>
        </div>
      </div>
    );
  }

  const node = curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
  if (!node) return null;

  const handleClose = () => setShowConfirm(true);

  const renderActivity = () => {
    switch (type) {
      case 'word-scramble': return <BuilderDrill nodeId={node.id} requiredVocabIds={node.requiredVocabIds || []} onComplete={() => {recordActivityCompletion(node.id, type); setActiveActivity(null);}} onSkip={() => setActiveActivity(null)} />;
      case 'logic-gate': return <div className="text-white text-center p-12"><h2 className="text-2xl font-bold">LogicGateDrill (Under Development)</h2></div>;
      case 'composition': return <div className="text-white text-center p-12"><h2 className="text-2xl font-bold">CompositionDrill (Under Development)</h2></div>;
      case 'confusion-drill': return <ConfusionDrill onClose={() => setActiveActivity(null)} />;
      case 'dual-drill': return <DualDrillMode onClose={() => setActiveActivity(null)} isSandboxMode={false} />;
      case 'philosophy-sorter': return <div className="text-white text-center p-12"><h2 className="text-2xl font-bold">PhilosophySorter (Under Development)</h2></div>;
      default: return (
        <div className="text-center text-white p-12">
            <h2 className="text-3xl font-bold mb-4 uppercase">Module Under Calibration</h2>
            <p className="text-gray-400 mb-8">This learning module is currently being calibrated.</p>
            <button onClick={() => setActiveActivity(null)} className="px-8 py-3 bg-white text-black font-black rounded-full">BACK TO ROADMAP</button>
        </div>
      );
    }
  };

  const isChat = type === 'Jan Lina Chat';
  const isQuiz = type === 'Quiz';


  if ((isChat || isQuiz) && onAskLina && !initiatedRef.current) {
    initiatedRef.current = true;
    const vocabStr = (node.requiredVocabIds || []).join(', ');
    const contentStr = node.richContent?.map(c => c.content).join(' ') || '';

    if (isQuiz) {
      onAskLina(`[SYSTEM: Checkpoint Quiz for '${node.title}'. Conduct a structured assessment. Criteria: ${contentStr}. Grade the student and propose mastery changes at the end.]`);
    } else {
      onAskLina(`[SYSTEM: Roadmap Lesson for '${node.title}'. The student is studying this node. Required vocabulary: ${vocabStr}. Follow the richContent teaching plan: ${contentStr}. Use suggestedMethod: Jan Lina Chat.]`);
    }
    
    // Close the overlay so we can see the chat
    setTimeout(() => {
      setActiveActivity(null);
    }, 0);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex flex-col overflow-y-auto">
       <div className="flex justify-end p-6">
         <button onClick={handleClose} className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white transition-all active:scale-95"><X className="w-6 h-6"/></button>
       </div>
       <div className="flex-1 flex items-center justify-center">
         {renderActivity()}
       </div>
    </div>
  );
};
