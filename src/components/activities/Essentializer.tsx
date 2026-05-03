import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, XCircle, LogOut, Loader2, Brain, Send } from 'lucide-react';
import { generateChallenge, evaluateInput } from '../../services/geminiService';

export const Essentializer = ({ userProfile, curriculumContext, onSessionEnd }) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mode = streak >= 3 ? 'input' : 'selection';

  const loadNextChallenge = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    setUserInput('');
    try {
      const challenge = await generateChallenge(mode, userProfile, curriculumContext);
      setCurrentChallenge(challenge);
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadNextChallenge(); }, [loadNextChallenge]);

  const handleSelection = (option) => {
    const isCorrect = option === currentChallenge.correctEssence;
    if (isCorrect) { 
      setCorrectAnswers(p => p + 1); 
      setStreak(p => p + 1); 
      setFeedback({ score: 100, feedback: "pona mute. Essence found." }); 
    } else { 
      setStreak(0); 
      setFeedback({ score: 0, feedback: `ike. The core was: ${currentChallenge.correctEssence}` }); 
    }
    setTotalChallenges(p => p + 1);
  };

  const handleInputSubmit = async () => {
    setIsSubmitting(true);
    const result = await evaluateInput(currentChallenge.complexThought, currentChallenge.correctEssence, userInput);
    if (result.score >= 70) { 
      setCorrectAnswers(p => p + 1); 
      setStreak(p => p + 1); 
    } else { 
      setStreak(0); 
    }
    setTotalChallenges(p => p + 1);
    setFeedback(result);
    setIsSubmitting(false);
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
          {mode === 'input' ? 'Mode: Creation' : 'Mode: Selection'}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loader" className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-rose-600 animate-pulse">Distilling Thought...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.5)]" />
                <p className="text-xl md:text-2xl font-light leading-relaxed text-white/90 italic tracking-wide">"{currentChallenge.complexThought}"</p>
            </div>
            
            <div className="space-y-4">
              {!feedback ? (
                mode === 'selection' ? (
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
                  <div className="space-y-6">
                    <textarea 
                      value={userInput} 
                      onChange={(e) => setUserInput(e.target.value)} 
                      placeholder="Enter simple essence..." 
                      className="w-full h-40 bg-black/60 border border-white/10 rounded-[2rem] p-6 text-white placeholder:text-white/10 focus:outline-none focus:border-rose-600/50 transition-all text-lg font-light resize-none" 
                    />
                    <button 
                      onClick={handleInputSubmit} 
                      disabled={!userInput || isSubmitting} 
                      className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-rose-500 shadow-[0_10px_30px_rgba(225,29,72,0.3)] transition-all"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit Essence'}
                    </button>
                  </div>
                )
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
          </motion.div>
        )}
      </AnimatePresence>

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
