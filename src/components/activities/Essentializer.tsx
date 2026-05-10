import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, LogOut, Brain, Send, HelpCircle } from 'lucide-react';
import { essentializerData } from '../../data/drills';
import { useMasteryStore } from '../../store/masteryStore';

export const Essentializer = ({ onSessionEnd, onAskLina }) => {
  const vocabulary = useMasteryStore(state => state.vocabulary);
  const [challenges] = useState(() => {
    const filtered = essentializerData.filter(drill => {
      return drill.requiredVocab.every(reqWord => {
        const v = vocabulary.find(vw => vw.word.toLowerCase() === reqWord.toLowerCase());
        return v && v.status !== 'not_started';
      });
    });
    const sourceData = filtered.length > 0 ? filtered : essentializerData;
    return [...sourceData].sort(() => Math.random() - 0.5);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentChallenge = challenges[currentIndex];

  const loadNextChallenge = () => {
    setFeedback(null);
    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleSelection = (option) => {
    const isCorrect = option === currentChallenge.correctOption;
    if (isCorrect) { 
      setCorrectAnswers(p => p + 1); 
      setStreak(p => p + 1); 
      setFeedback({ score: 100, feedback: "pona mute. Essence found." }); 
    } else { 
      setStreak(0); 
      setFeedback({ score: 0, feedback: `ike. The core was: ${currentChallenge.correctOption}` }); 
    }
    setTotalChallenges(p => p + 1);
  };

  const handleHelp = () => {
    if (onAskLina && currentChallenge) {
      onAskLina(`[SYSTEM: The user is stuck trying to find the essential Toki Pona phrase for "${currentChallenge.englishPrompt}". Provide a hint without giving the exact phrase.]`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto min-h-[500px] flex flex-col relative font-sans">
      <div className="flex justify-between items-center mb-8 px-4">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.4em] text-rose-500/50">Streak</span>
            <span className="text-rose-500 font-black text-xl tracking-tighter">{streak}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30">Session</span>
            <span className="text-white font-bold text-xl tracking-tighter">{correctAnswers}/{totalChallenges}</span>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] uppercase tracking-[0.3em] text-rose-400 font-bold">
          Mode: Selection
        </div>
      </div>

        <motion.div key="content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          {currentChallenge ? (
            <>
              <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
                  {onAskLina && (
                    <button 
                      onClick={handleHelp}
                      className="absolute top-4 right-4 p-2 text-white/30 hover:text-rose-500 transition-colors"
                      title="Ask Lina for a hint"
                    >
                      <HelpCircle className="w-6 h-6" />
                    </button>
                  )}
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90 italic tracking-wide">"{currentChallenge.englishPrompt}"</p>
              </div>
              
              <div className="space-y-4">
                {!feedback ? (
                    <div className="grid gap-4">
                      {currentChallenge.options.map((opt, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleSelection(opt)} 
                          className="w-full p-6 text-left rounded-2xl border border-white/5 bg-white/5 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all group uppercase tracking-[0.15em] text-white/60 hover:text-white font-medium"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className={`p-8 rounded-[2rem] border ${feedback.score >= 70 ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/10 bg-white/5'}`}>
                        <p className="text-base text-white/80 leading-relaxed italic">"{feedback.feedback}"</p>
                      </div>
                      <button 
                      onClick={loadNextChallenge} 
                      className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-rose-500 transition-all flex items-center justify-center gap-3"
                    >
                      Next Challenge <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
              Loading challenge...
            </div>
          )}
        </motion.div>

      <button 
        onClick={() => onSessionEnd({ score: correctAnswers, total: totalChallenges })} 
        className="mt-16 mx-auto flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-rose-500 transition-all group py-2 px-4 border border-transparent hover:border-rose-500/20 rounded-full"
      >
        <LogOut className="w-3 h-3" />
        <span>O P I N I (END SESSION)</span>
      </button>
    </div>
  );
};
