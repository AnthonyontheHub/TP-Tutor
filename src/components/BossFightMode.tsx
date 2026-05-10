import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { fetchCompositionGrade, resolveApiKey, stringifyUserContext } from '../services/linaService';
import type { CompositionResult } from '../types/mastery';
import { X, Sword, Shield, Target, Flame, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Props {
  onClose: () => void;
  bossWords: string[];
  isSandboxMode: boolean;
}

const GRADE_COLORS: Record<string, { color: string, glow: string }> = {
  S: { color: 'var(--gold)', glow: '0 0 20px rgba(255, 191, 0, 0.8)' },
  A: { color: '#22c55e', glow: '0 0 15px rgba(34, 197, 94, 0.4)' },
  B: { color: '#3b82f6', glow: 'none' },
  C: { color: '#a855f7', glow: 'none' },
  F: { color: '#ef4444', glow: 'none' },
};

export default function BossFightMode({ onClose, bossWords, isSandboxMode }: Props) {
  const { vocabulary, profile, completeBossFight } = useMasteryStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState<CompositionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Initial dramatic effect
    setShake(true);
    const timer = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const usedTargets = useMemo(() => {
    const textLower = text.toLowerCase();
    return bossWords.filter(w => {
      const regex = new RegExp(`\\b${w.toLowerCase()}\\b`, 'i');
      return regex.test(textLower);
    });
  }, [text, bossWords]);

  const allTargetsUsed = usedTargets.length === bossWords.length;
  const canSubmit = !isSandboxMode && wordCount >= 5 && allTargetsUsed && !isLoading && !hasWon;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setResult(null);
    
    const apiKey = resolveApiKey();
    // Include Lore Log in context explicitly
    const loreContext = (profile.loreLog || []).slice(-3).map(l => `${l.date}: ${l.text}`).join('\n');
    const fullContext = `${stringifyUserContext(profile)}\n\nRECENT LORE EVENTS:\n${loreContext}\n\nMISSION: The student is in a MASTERY BOSS FIGHT. They must use these words: ${bossWords.join(', ')} to describe a recent event from their lore log. Be strict. Only S or A grades should pass.`;
    
    const res = await fetchCompositionGrade(apiKey, text, vocabulary, fullContext);
    setResult(res);
    setIsLoading(false);

    if (res.overallGrade === 'S' || res.overallGrade === 'A') {
      setHasWon(true);
      completeBossFight(bossWords);
      // Extra shake for victory
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1, 
        x: shake ? [0, -10, 10, -10, 10, 0] : 0,
        boxShadow: hasWon ? 'inset 0 0 100px rgba(212,175,55,0.4)' : 'inset 0 0 40px rgba(212,175,55,0.1)'
      }}
      style={{
        border: '4px solid #D4AF37',
        boxShadow: '0 0 50px rgba(212,175,55,0.3)',
      }}
      className="fixed inset-0 z-[7000] bg-black flex flex-col font-sans overflow-hidden"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 to-transparent" />
        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/30 bg-black relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.6)]">
            <Sword className="text-black w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[#D4AF37] font-black tracking-[0.2em] text-xl m-0 uppercase italic">Mastery Boss Fight</h2>
            <div className="text-[10px] text-[#D4AF37]/60 font-bold uppercase tracking-widest flex items-center gap-2">
              <Flame className="w-3 h-3" /> High Intensity Neural Protocol Active
            </div>
          </div>
        </div>
        {!hasWon && (
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative z-10">
        
        {/* Left Pane: The Forge */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-[#D4AF37]/20 bg-[#050505]">
          <div className="p-6 flex flex-col gap-6">
            {/* Mission Box */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-lg p-4">
              <h3 className="text-[#D4AF37] text-xs font-black tracking-widest uppercase mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" /> The Mission
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Use all target words to describe an event from your life (Lore Log). jan Lina will only grant mastery for exceptional performance.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {bossWords.map(word => {
                  const used = usedTargets.includes(word);
                  return (
                    <motion.div 
                      key={word}
                      animate={used ? { scale: [1, 1.1, 1], borderColor: 'var(--gold)' } : {}}
                      className={`px-4 py-2 rounded border font-black tracking-widest text-sm transition-all flex items-center gap-2 ${used ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/40 border-white/10'}`}
                    >
                      {used && <CheckCircle className="w-4 h-4" />}
                      {word.toUpperCase()}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 min-h-[300px] relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Forge your response here..."
                disabled={hasWon || isLoading}
                className="w-full h-full bg-transparent border-none text-[#D4AF37] focus:outline-none resize-none custom-scrollbar font-mono text-xl leading-relaxed"
                autoFocus
              />
              {hasWon && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-[#D4AF37] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(212,175,55,0.8)]"
                  >
                    <CheckCircle className="text-black w-12 h-12" />
                  </motion.div>
                  <h2 className="text-white text-3xl font-black uppercase tracking-[0.3em] mb-2">Victory</h2>
                  <p className="text-[#D4AF37] font-bold tracking-widest uppercase">Words Mastered & Neural Paths Triple-Hardened</p>
                  <button 
                    onClick={onClose}
                    className="mt-8 px-12 py-4 bg-[#D4AF37] text-black font-black tracking-[0.2em] uppercase rounded hover:bg-white transition-all shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="px-6 py-6 bg-black border-t border-[#D4AF37]/20 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
              <span className={wordCount < 5 ? 'text-rose-500' : 'text-emerald-500'}>{wordCount} / 5 WORDS</span>
              <span className={allTargetsUsed ? 'text-emerald-500' : 'text-rose-500'}>{usedTargets.length} / {bossWords.length} TARGETS</span>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-10 py-4 rounded font-black tracking-[0.2em] transition-all uppercase flex items-center gap-3 ${canSubmit ? 'bg-[#D4AF37] text-black hover:bg-white shadow-[0_0_30px_rgba(212,175,55,0.5)]' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
            >
              {isLoading ? 'ANALYZING...' : <><Sword className="w-5 h-5" /> Submit for Review</>}
            </button>
          </div>
        </div>

        {/* Right Pane: Lina's Judgment */}
        <div className="w-full md:w-1/2 bg-[#080808] flex flex-col overflow-y-auto custom-scrollbar relative border-l border-[#D4AF37]/10">
          {!isLoading && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#D4AF37]/20 p-12 text-center">
              <Target className="w-20 h-20 mb-6 opacity-30" />
              <p className="font-black tracking-[0.2em] uppercase mb-2 text-xl">Lina's Judgment</p>
              <p className="text-sm max-w-xs mx-auto">Input your composition and submit. jan Lina will evaluate your use of target vocabulary in context of your lore.</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                <Sword className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37] w-8 h-8 animate-pulse" />
              </div>
              <div className="mt-8 font-black tracking-[0.3em] uppercase text-[#D4AF37] animate-pulse">Scanning Neural Patterns...</div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 space-y-8"
            >
              {/* Grade Header */}
              <div className="flex flex-col items-center text-center border-b border-[#D4AF37]/20 pb-8">
                <motion.div 
                  initial={{ rotate: -10, scale: 0.5 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="text-8xl font-black mb-4"
                  style={{ 
                    color: GRADE_COLORS[result.overallGrade]?.color || 'white', 
                    textShadow: GRADE_COLORS[result.overallGrade]?.glow 
                  }}
                >
                  {result.overallGrade}
                </motion.div>
                <h3 className="text-white font-black text-2xl uppercase tracking-widest mb-2 italic">{result.gradeReason}</h3>
                <p className="text-white/70 leading-relaxed max-w-md mx-auto">{result.overallFeedback}</p>
              </div>

              {/* Specifics */}
              <div className="grid grid-cols-1 gap-6">
                {result.literalTranslation && (
                  <div className="bg-white/5 border border-white/10 rounded p-4">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info className="w-3 h-3" /> INTENDED MEANING
                    </div>
                    <div className="text-white/90 italic font-serif">"{result.literalTranslation}"</div>
                  </div>
                )}

                {result.grammarFlags && result.grammarFlags.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded p-4">
                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> NEURAL INSTABILITY
                    </div>
                    <ul className="space-y-3">
                      {result.grammarFlags.map((f, i) => (
                        <li key={i}>
                          <div className="text-rose-400 font-bold text-sm">{f.issue}</div>
                          <div className="text-white/60 text-xs mt-1">{f.explanation}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.corrections && result.corrections.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded p-4">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <X className="w-3 h-3" /> CALIBRATION REQUIRED
                    </div>
                    <div className="space-y-4">
                      {result.corrections.map((c, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-rose-400 line-through font-mono">{c.original}</span>
                            <span className="text-white/20">→</span>
                            <span className="text-emerald-400 font-bold font-mono">{c.corrected}</span>
                          </div>
                          <p className="text-white/50 text-xs mt-1">{c.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {result.overallGrade !== 'S' && result.overallGrade !== 'A' && (
                <div className="pt-6">
                  <div className="text-center p-6 bg-rose-500/10 border border-rose-500/30 rounded">
                    <p className="text-rose-400 font-black uppercase tracking-widest text-sm mb-4">Mastery Denied</p>
                    <p className="text-white/60 text-xs mb-6">Your performance did not meet the Boss Fight standards. Calibrate your understanding and try again.</p>
                    <button 
                      onClick={() => { setText(''); setResult(null); }}
                      className="px-6 py-2 bg-rose-500 text-white font-black tracking-widest uppercase text-xs rounded"
                    >
                      Reset Forge
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
