import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, HelpCircle } from 'lucide-react';
import { sorterData, type SorterDrill } from '../../data/drills';
import { useMasteryStore } from '../../store/masteryStore';

interface PhilosophySorterProps {
  onSessionEnd: (results: { score: number; total: number }) => void;
  onAskLina?: (prompt: string) => void;
}

export const PhilosophySorter: React.FC<PhilosophySorterProps> = ({ onSessionEnd, onAskLina }) => {
  const vocabulary = useMasteryStore(state => state.vocabulary);
  const [drill] = useState(() => {
    const filtered = sorterData.filter(d => {
      return d.requiredVocab.every(reqWord => {
        const v = vocabulary.find(vw => vw.word.toLowerCase() === reqWord.toLowerCase());
        return v && v.status !== 'not_started';
      });
    });
    const sourceData = filtered.length > 0 ? filtered : sorterData;
    return sourceData[Math.floor(Math.random() * sourceData.length)];
  });
  const [items] = useState(() => [...drill.items].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDir, setExitDir] = useState<'A' | 'B'>('A');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const handleSort = (bucket: 'A' | 'B') => {
    if (!items[currentIndex]) return;
    setExitDir(bucket);
    if (items[currentIndex].bucket === bucket) {
      setScore(s => s + 1);
    }
    setTotal(t => t + 1);
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleHelp = () => {
    if (onAskLina && items[currentIndex]) {
      onAskLina(`[SYSTEM: The user is stuck sorting the word: "${items[currentIndex].word}" into either "${drill.bucketA}" or "${drill.bucketB}". Provide a brief, casual hint about the word without directly giving away the answer.]`);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center font-sans">
      <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/50 mb-8">
        Sorted: {score} / {total}
      </div>

      <div className="relative w-full h-56 flex items-center justify-center mb-8">
        <AnimatePresence mode="wait" custom={exitDir}>
          {items[currentIndex] && (
            <motion.div
              key={items[currentIndex].word}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) handleSort('B');
                else if (info.offset.x < -80) handleSort('A');
              }}
              initial={{ opacity: 0, scale: 0.8, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={(custom) => ({
                opacity: 0,
                scale: 0.5,
                x: custom === 'B' ? 200 : -200,
                transition: { duration: 0.2 }
              })}
              className="w-56 h-32 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center p-4 text-center cursor-grab active:cursor-grabbing shadow-2xl relative"
            >
              {onAskLina && (
                <button 
                  onClick={handleHelp}
                  className="absolute -top-3 -right-3 p-2 text-white/30 hover:text-cyan-500 transition-colors"
                  title="Ask Lina for a hint"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              )}
              <p className="text-lg font-bold text-white/90 uppercase tracking-widest">{items[currentIndex].word}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex w-full gap-4">
        {items.length > 0 && items[currentIndex] ? (
          <>
            <button 
              onClick={() => handleSort('A')} 
              className="flex-1 py-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 font-black uppercase tracking-[0.1em] hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all active:scale-95 text-xs md:text-sm"
            >
              {drill.bucketA}
            </button>
            <button 
              onClick={() => handleSort('B')} 
              className="flex-1 py-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-black uppercase tracking-[0.1em] hover:bg-rose-500/10 hover:border-rose-500/50 transition-all active:scale-95 text-xs md:text-sm"
            >
              {drill.bucketB}
            </button>
          </>
        ) : null}
      </div>

      <button 
        onClick={() => onSessionEnd({ score, total })} 
        className="mt-16 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-cyan-500 transition-all group py-2 px-6 border border-transparent hover:border-cyan-500/20 rounded-full"
      >
        <LogOut className="w-3 h-3" />
        <span>O P I N I (END SESSION)</span>
      </button>
    </div>
  );
};
