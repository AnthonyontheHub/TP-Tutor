import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { fetchCompositionGrade, resolveApiKey, stringifyUserContext } from '../services/linaService';
import type { CompositionResult } from '../types/mastery';
import { X, CheckCircle, AlertTriangle, Info, BookOpen } from 'lucide-react';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
}

const GRADE_COLORS: Record<string, { color: string, glow: string }> = {
  S: { color: 'var(--gold)', glow: '0 0 20px rgba(255, 191, 0, 0.5)' },
  A: { color: '#22c55e', glow: 'none' },
  B: { color: '#3b82f6', glow: 'none' },
  C: { color: '#a855f7', glow: 'none' },
  F: { color: '#ef4444', glow: 'none' },
};

export default function CompositionMode({ onClose, isSandboxMode }: Props) {
  const { vocabulary, profile, updateSessionNotes } = useMasteryStore();
  const [text, setText] = useState('');
  const [result, setResult] = useState<CompositionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  // Split text into words, stripping punctuation
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  const vocabSafety = useMemo(() => {
    if (wordCount === 0) return 100;
    const activeWords = new Set(vocabulary.filter(v => v.status !== 'not_started').map(v => v.word.toLowerCase()));
    let safeCount = 0;
    words.forEach(w => {
      const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
      if (activeWords.has(cleanWord) || ['li', 'e', 'la', 'pi', 'o', 'en', 'kin', 'a', 'mu'].includes(cleanWord) || !cleanWord) {
        safeCount++;
      }
    });
    return Math.round((safeCount / wordCount) * 100);
  }, [text, vocabulary, wordCount, words]);

  const canSubmit = !isSandboxMode && wordCount >= 3 && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setResult(null);
    setIsRewriting(false);
    
    const apiKey = resolveApiKey();
    const context = stringifyUserContext(profile);
    
    const res = await fetchCompositionGrade(apiKey, text, vocabulary, context);
    setResult(res);
    setIsLoading(false);
  };

  const handleSaveToLogbook = () => {
    if (!result || !result.corrections) return;
    result.corrections.forEach(c => {
      const errorWords = c.original.toLowerCase().match(/[a-z]+/g) || [];
      errorWords.forEach(w => {
        const entry = vocabulary.find(v => v.word === w);
        if (entry) {
          updateSessionNotes(entry.id, `Composition error: "${c.original}" -> "${c.corrected}". Reason: ${c.explanation}`);
        }
      });
    });
    alert('Notes saved to relevant vocabulary items in your logbook.');
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-[#050505] flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black">
        <div className="flex items-center gap-3">
          <span className="text-xl">✍️</span>
          <h2 className="text-white font-black tracking-widest text-lg m-0 uppercase">Creative Writing Studio</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Split Screen */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Left Pane: Editor */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-white/10 bg-[#0a0a0a]">
          <div className="flex-1 p-6 flex flex-col">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing in Toki Pona... (minimum 3 words)"
              className="w-full flex-1 bg-transparent border-none text-white/90 focus:outline-none resize-none custom-scrollbar"
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: '1.25rem',
                lineHeight: '1.8',
              }}
            />
          </div>
          
          {/* Footer Stats */}
          <div className="px-6 py-4 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/50 uppercase tracking-widest">
            <div className="flex items-center gap-6">
              <span>{wordCount} WORDS</span>
              <span className={vocabSafety < 80 ? 'text-rose-500' : vocabSafety < 100 ? 'text-amber-500' : 'text-emerald-500'}>
                {vocabSafety}% VOCAB SAFETY
              </span>
            </div>
            
            {isSandboxMode && (
               <span className="text-rose-500 text-xs uppercase font-bold tracking-widest">Sandbox Mode</span>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`px-6 py-2 rounded font-black tracking-widest transition-all ${canSubmit ? 'bg-[#D4AF37] text-black hover:bg-[#FBE106] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
            >
              LINA'S REVIEW
            </button>
          </div>
        </div>

        {/* Right Pane: Review & Feedback */}
        <div className="w-full md:w-1/2 bg-[#111] flex flex-col overflow-y-auto custom-scrollbar relative">
          {!isLoading && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 p-12 text-center">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-bold tracking-widest uppercase mb-2">Awaiting Composition</p>
              <p className="text-sm">Write your Toki Pona text on the left and submit it for a detailed grammar and vocabulary breakdown.</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#D4AF37]">
              <div className="pulse text-4xl mb-4">✍️</div>
              <div className="pulse font-black tracking-widest uppercase">jan Lina is analyzing...</div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 space-y-8"
            >
              {/* Header Grade */}
              <div className="flex items-start gap-6 border-b border-white/10 pb-8">
                <div 
                  className="text-6xl font-black"
                  style={{ 
                    color: GRADE_COLORS[result.overallGrade]?.color || 'white', 
                    textShadow: GRADE_COLORS[result.overallGrade]?.glow 
                  }}
                >
                  {result.overallGrade}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{result.gradeReason}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{result.overallFeedback}</p>
                </div>
              </div>

              {/* Literal Translation */}
              {result.literalTranslation && (
                <section>
                  <h4 className="text-xs font-black text-white/40 tracking-widest uppercase mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Literal Translation
                  </h4>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-white/80 italic font-serif">
                    "{result.literalTranslation}"
                  </div>
                </section>
              )}

              {/* Grammar Flags */}
              {result.grammarFlags && result.grammarFlags.length > 0 && (
                <section>
                  <h4 className="text-xs font-black text-amber-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Grammar Flags
                  </h4>
                  <div className="space-y-3">
                    {result.grammarFlags.map((flag, i) => (
                      <div key={i} className={`p-4 rounded-lg border ${flag.severity === 'major' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                        <div className={`font-bold mb-1 ${flag.severity === 'major' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {flag.issue}
                        </div>
                        <div className="text-white/70 text-sm">{flag.explanation}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Mastery Check */}
              {result.masteryCheck && result.masteryCheck.length > 0 && (
                <section>
                  <h4 className="text-xs font-black text-cyan-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Mastery Check
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.masteryCheck.map((check, i) => (
                      <div key={i} className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3 py-1.5 rounded text-sm font-mono flex items-center gap-2">
                        <span>{check.word}</span>
                        <span className="text-xs opacity-60 uppercase">({check.status})</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Corrections */}
              {result.corrections && result.corrections.length > 0 && (
                <section>
                  <h4 className="text-xs font-black text-white/40 tracking-widest uppercase mb-3 flex items-center gap-2">
                    <X className="w-4 h-4 text-rose-500" /> Specific Corrections
                  </h4>
                  <div className="space-y-3">
                    {result.corrections.map((c, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-center flex-wrap gap-3 mb-2">
                          <span className="text-rose-400 line-through font-mono text-sm">{c.original}</span>
                          <span className="text-white/40">→</span>
                          <span className="text-emerald-400 font-bold font-mono text-sm">{c.corrected}</span>
                        </div>
                        <p className="text-white/60 text-sm italic">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Highlights */}
              {result.highlights && result.highlights.length > 0 && (
                <section>
                  <h4 className="text-xs font-black text-[#D4AF37] tracking-widest uppercase mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Highlights
                  </h4>
                  <div className="space-y-3">
                    {result.highlights.map((h, i) => (
                      <div key={i} className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4">
                        <div className="text-[#D4AF37] font-bold font-mono text-sm mb-1">{h.phrase}</div>
                        <p className="text-[#D4AF37]/70 text-sm">{h.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Suggested Rewrite */}
              {result.suggestedRewrite && (
                <section>
                  <h4 className="text-xs font-black text-white/40 tracking-widest uppercase mb-3 flex items-center gap-2">
                    ✨ Suggested Rewrite
                  </h4>
                  
                  <button 
                    onClick={() => setIsRewriting(!isRewriting)}
                    className="text-[#D4AF37] text-xs font-black tracking-widest uppercase hover:underline mb-3 block"
                  >
                    {isRewriting ? 'HIDE SUGGESTED REWRITE ▲' : 'SEE SUGGESTED REWRITE ▼'}
                  </button>
                  
                  <AnimatePresence>
                    {isRewriting && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white/5 border border-[#D4AF37]/50 rounded-lg p-4 text-white/90 italic overflow-hidden"
                      >
                        {result.suggestedRewrite}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveToLogbook}
                  disabled={!result.corrections || result.corrections.length === 0}
                  className={`px-6 py-3 rounded text-sm font-bold tracking-widest transition-colors ${result.corrections && result.corrections.length > 0 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                >
                  SAVE CORRECTIONS TO LOGBOOK
                </button>
              </div>

            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
