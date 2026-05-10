import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, XCircle, LogOut, HelpCircle } from 'lucide-react';
import { logicGateData, type LogicGateDrill } from '../../data/drills';
import { useMasteryStore } from '../../store/masteryStore';

interface LogicGateProps {
  onComplete?: (results: { score: number; total: number }) => void;
  onAskLina?: (prompt: string) => void;
}

export const LogicGate: React.FC<LogicGateProps> = ({ onComplete, onAskLina }) => {
  const vocabulary = useMasteryStore(state => state.vocabulary);
  const [statements] = useState(() => {
    const filtered = logicGateData.filter(drill => {
      return drill.requiredVocab.every(reqWord => {
        const v = vocabulary.find(vw => vw.word.toLowerCase() === reqWord.toLowerCase());
        return v && v.status !== 'not_started';
      });
    });
    const sourceData = filtered.length > 0 ? filtered : logicGateData;
    return [...sourceData].sort(() => Math.random() - 0.5);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const currentStatement = statements[currentIndex];

  const handleAnswer = (answer: boolean) => {
    if (!currentStatement) return;
    const isCorrect = answer === currentStatement.isPona;
    setLastAnswerCorrect(isCorrect);
    setTotalAttempted(prev => prev + 1);
    if (isCorrect) setScore((prev) => prev + 1);
    setShowFeedback(true);
  };

  const nextInsight = () => {
    if (currentIndex < statements.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      // Loop back to start or finish
      setCurrentIndex(0);
      setShowFeedback(false);
    }
  };

  const handleHelp = () => {
    if (onAskLina && currentStatement) {
      onAskLina(`[SYSTEM: The user is stuck on this Logic Gate puzzle: "${currentStatement.statement}". Provide a brief, casual hint about the grammar or vocabulary without directly giving away if it is true or false.]`);
    }
  };

  if (!currentStatement) return null;

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-4">
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-white/10 w-full">
          <motion.div 
            className="h-full bg-[#FFD700]" 
            animate={{ width: `${(score / (totalAttempted || 1)) * 100}%` }}
          />
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/40">
            <span className="tracking-[0.2em] uppercase">Logic Gate (Infinite)</span>
            <span className="tracking-[0.2em] uppercase">Score: {score} / {totalAttempted}</span>
          </div>

          <AnimatePresence mode="wait">
            {currentStatement && (
              <motion.div
                key={currentStatement.statement}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[120px] flex items-center justify-center text-center relative"
              >
                {onAskLina && (
                  <button 
                    onClick={handleHelp}
                    className="absolute -top-4 -right-4 p-2 text-white/30 hover:text-[#FFD700] transition-colors"
                    title="Ask Lina for a hint"
                  >
                    <HelpCircle className="w-6 h-6" />
                  </button>
                )}
                <p className="text-xl font-light leading-relaxed tracking-wide italic text-white/90">
                  "{currentStatement.statement}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showFeedback ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className={`p-6 rounded-2xl border ${lastAnswerCorrect ? 'border-[#FFD700]/30 bg-[#FFD700]/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <p className="text-sm tracking-wide leading-relaxed text-white/80">{currentStatement?.explanation}</p>
              </div>
              <button 
                onClick={nextInsight}
                className="w-full py-3 bg-[#FFD700] text-black text-sm font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all"
              >
                Next Insight
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => handleAnswer(true)}
                className="flex-1 py-6 rounded-xl border border-white/5 bg-white/5 hover:border-[#FFD700]/50 hover:bg-[#FFD700]/5 group transition-all"
              >
                <span className="block text-[#FFD700] text-lg font-black tracking-widest uppercase group-hover:scale-110 transition-transform">pona</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Simple / True</span>
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className="flex-1 py-6 rounded-xl border border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5 group transition-all"
              >
                <span className="block text-red-400 text-lg font-black tracking-widest uppercase group-hover:scale-110 transition-transform">ike</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Complex / False</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => onComplete?.({ score, total: totalAttempted })}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-[#FFD700] transition-all group py-3 px-6 border border-transparent hover:border-[#FFD700]/20 rounded-full"
        >
          <LogOut className="w-3 h-3" />
          <span>O P I N I (END SESSION)</span>
        </button>
      </div>
    </div>
  );
};
