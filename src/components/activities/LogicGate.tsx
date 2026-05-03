import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, CheckCircle2, XCircle, LogOut } from 'lucide-react';

interface Statement {
  statement: string;
  isPona: boolean;
  explanation: string;
}

interface LogicGateProps {
  userProfile: any;
  curriculumContext?: string;
  onComplete?: (results: { score: number; total: number }) => void;
}

const philosophyStatements = [
  { statement: "Choosing a few high-quality tools is 'pona' compared to many cheap ones.", isPona: true, explanation: "Simplicity is about focus and depth, not clutter." },
  { statement: "A complex solution is always better if it is more precise.", isPona: false, explanation: "In Toki Pona, clarity comes from simplicity, not complexity." },
  { statement: "The best way to live is to have only what you truly use and love.", isPona: true, explanation: "This is the essence of nasin pona." },
  { statement: "More words make a thought more accurate.", isPona: false, explanation: "Fewer words force you to find the core truth." },
  { statement: "Simplicity is a path, not a destination.", isPona: true, explanation: "It is a way of walking through the world." },
  { statement: "Ambiguity is an error that should always be removed.", isPona: false, explanation: "Toki Pona embraces intentional ambiguity as a tool for connection." },
  { statement: "A small vocabulary frees the mind from over-analysis.", isPona: true, explanation: "When you have fewer words, you focus on the direct experience." }
];

export const LogicGate: React.FC<LogicGateProps> = ({ userProfile, onComplete }) => {
  const [currentStatement, setCurrentStatement] = useState<Statement | null>(null);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const getNextStatement = () => {
    setLoading(true);
    setTimeout(() => {
      const random = philosophyStatements[Math.floor(Math.random() * philosophyStatements.length)];
      setCurrentStatement(random);
      setLoading(false);
      setShowFeedback(false);
    }, 600);
  };

  useEffect(() => {
    getNextStatement();
  }, [userProfile]);

  const handleAnswer = (answer: boolean) => {
    if (!currentStatement) return;
    const isCorrect = answer === currentStatement.isPona;
    setLastAnswerCorrect(isCorrect);
    setTotalAttempted(prev => prev + 1);
    if (isCorrect) setScore((prev) => prev + 1);
    setShowFeedback(true);
  };

  if (loading && !currentStatement) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#FFD700]">Generating Personal Insights...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-1 bg-white/10 w-full">
          <motion.div 
            className="h-full bg-[#FFD700]" 
            animate={{ width: `${(score / (totalAttempted || 1)) * 100}%` }}
          />
        </div>
        
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-white/40">
            <span className="tracking-[0.2em] uppercase">Logic Gate (Infinite)</span>
            <span className="tracking-[0.2em] uppercase">Score: {score} / {totalAttempted}</span>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-[120px] flex items-center justify-center"
              >
                 <div className="w-6 h-6 border-2 border-[#FFD700]/20 border-t-[#FFD700] rounded-full animate-spin" />
              </motion.div>
            ) : currentStatement && (
              <motion.div
                key={currentStatement.statement}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-[120px] flex items-center justify-center text-center"
              >
                <p className="text-xl md:text-2xl font-light leading-relaxed tracking-wide italic text-white/90">
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
                onClick={getNextStatement}
                className="w-full py-5 bg-[#FFD700] text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] transition-all"
              >
                Next Insight
              </button>
            </motion.div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => handleAnswer(true)}
                className="flex-1 py-10 rounded-2xl border border-white/5 bg-white/5 hover:border-[#FFD700]/50 hover:bg-[#FFD700]/5 group transition-all"
              >
                <span className="block text-[#FFD700] text-xl font-black tracking-[0.2em] uppercase group-hover:scale-110 transition-transform">pona</span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Simple / True</span>
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className="flex-1 py-10 rounded-2xl border border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5 group transition-all"
              >
                <span className="block text-red-400 text-xl font-black tracking-[0.2em] uppercase group-hover:scale-110 transition-transform">ike</span>
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
