import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Loader2 } from 'lucide-react';
import { generateSortItems } from '../../services/geminiService';

interface SortItem {
  label: string;
  category: 'pona' | 'ike';
}

interface PhilosophySorterProps {
  userProfile: any;
  curriculumContext?: string;
  vocabList?: string[];
  onSessionEnd: (results: { score: number; total: number }) => void;
}

export const PhilosophySorter: React.FC<PhilosophySorterProps> = ({ userProfile, curriculumContext, vocabList, onSessionEnd }) => {
  const [items, setItems] = useState<SortItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    try {
      const context = vocabList && vocabList.length > 0 
        ? `${curriculumContext}. Focus vocabulary: ${vocabList.join(', ')}`
        : curriculumContext;

      const newItems = await generateSortItems(userProfile, context);
      setItems(newItems);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadItems(); 
  }, [userProfile]);

  const handleSort = (category: 'pona' | 'ike') => {
    if (items[currentIndex].category === category) {
      setScore(s => s + 1);
    }
    setTotal(t => t + 1);
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      loadItems();
    }
  };

  if (loading && items.length === 0) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      <p className="text-[10px] uppercase tracking-[0.5em] text-cyan-500">Scanning Concepts...</p>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto flex flex-col items-center font-sans">
      <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/50 mb-12">
        Sorted: {score} / {total}
      </div>

      <div className="relative w-full h-64 flex items-center justify-center mb-12">
        <AnimatePresence mode="wait">
          {items[currentIndex] && (
            <motion.div
              key={items[currentIndex].label}
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) handleSort('ike');
                else if (info.offset.x < -80) handleSort('pona');
              }}
              initial={{ opacity: 0, scale: 0.8, x: 0 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={(custom) => ({
                opacity: 0,
                scale: 0.5,
                x: custom === 'ike' ? 200 : -200,
                transition: { duration: 0.2 }
              })}
              className="w-64 h-40 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center p-6 text-center cursor-grab active:cursor-grabbing shadow-2xl"
            >
              <p className="text-lg font-light italic text-white/90">"{items[currentIndex].label}"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex w-full gap-8">
        <button 
          onClick={() => handleSort('pona')} 
          className="flex-1 py-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 font-black uppercase tracking-[0.3em] hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all active:scale-95"
        >
          PONA
        </button>
        <button 
          onClick={() => handleSort('ike')} 
          className="flex-1 py-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-black uppercase tracking-[0.3em] hover:bg-rose-500/10 hover:border-rose-500/50 transition-all active:scale-95"
        >
          IKE
        </button>
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
