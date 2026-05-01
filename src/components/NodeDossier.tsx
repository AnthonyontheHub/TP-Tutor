/* src/components/NodeDossier.tsx */
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { CurriculumNode } from '../types/mastery';
import WordDetailDrawer from './WordDetailDrawer';
import VocabGrid from './VocabGrid';

interface Props {
  node: CurriculumNode;
  onBack: () => void;
  onAskLina: (p: string, mode?: 'chat_buddy' | 'instructor') => void;
  isSandboxMode: boolean;
}

export default function NodeDossier({ node, onBack, onAskLina, isSandboxMode }: Props) {
  const { vocabulary, currentPositionNodeId, checkNodeReadiness, getNodeReadinessPercentage, completedActivities, setActiveActivity } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [showInfographicModal, setShowInfographicModal] = useState(false);

  const isLocked = node.status === 'locked' && node.id !== currentPositionNodeId;

  const nodeItems = React.useMemo(() => {
    const allIds = [...node.requiredVocabIds, ...node.requiredGrammarIds];
    return vocabulary.filter(v => allIds.includes(v.id) || allIds.includes(v.word));
  }, [node, vocabulary]);

  const calculateMastery = () => {
    if (nodeItems.length === 0) {
       return node.status === 'mastered' ? 100 : 0;
    }
    const scores = nodeItems.map(word => word.baseScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
  };

  const mastery = calculateMastery();
  const readiness = getNodeReadinessPercentage(node.id);
  const isReady = readiness >= 100 || checkNodeReadiness(node.id);
  const activities = completedActivities[node.id] || [];

  const effectiveSandbox = isSandboxMode || localStorage.getItem('tp_sandbox_mode') === 'true';

  const handlePracticeLina = () => {
    const contextStr = node.richContent?.map(c => c.content).join(' ') || '';
    const vocabStr = node.requiredVocabIds.length > 0 
      ? ` The relevant vocabulary is: ${node.requiredVocabIds.join(', ')}.` 
      : '';

    onAskLina(`[SYSTEM: Start a lesson on the concept: "${node.title}". Context: ${contextStr}${vocabStr}]`, 'instructor');
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="dossier-overlay"
    >
      <div className="dossier-container">
        <header className="mb-8 shrink-0">
          <button type="button"
            onClick={onBack}
            className="bg-transparent border-none text-[var(--gold)] cursor-pointer text-[0.8rem] font-extrabold flex items-center gap-2 mb-5 p-0 tracking-[0.1em]"
          >
            ← RETURN TO PATHWAY
          </button>

          {isLocked && (
            <div className="lock-shield">
              <span className="text-[2.5rem]">🔒</span>
              <div className="text-[#ef4444] font-black text-[0.9rem] tracking-[0.1em]">THIS PATH IS STILL HIDDEN</div>
              <p className="text-[#aaa] text-[0.75rem] m-0 font-medium">
                Reach 'Practicing' level in previous nodes to unlock.
              </p>
            </div>
          )}

          <div className={isLocked ? 'grayscale opacity-60 pointer-events-none' : 'pointer-events-auto'}>
            <div className="flex justify-between items-start gap-5 mb-4">
              <h1 
                onClick={() => {
                  if (effectiveSandbox) {
                    useMasteryStore.getState().updateNodeStatus(node.id, 'active');
                  }
                }}
                className={`text-white font-black text-[2rem] m-0 tracking-[-0.02em] ${effectiveSandbox ? 'cursor-pointer' : 'cursor-default'} pointer-events-auto`}
              >
                {node.title}
              </h1>
              <div className="text-right">
                <div className="text-[0.6rem] text-[#666] font-extrabold tracking-[0.1em] mb-1 uppercase">NODE ID</div>
                <div className="text-[0.8rem] text-[var(--gold)] font-bold font-mono">{node.id.toUpperCase()}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/[0.03] p-[12px_16px] rounded-lg border border-white/[0.05] mb-3">
              <div className="flex-1 h-1 bg-[#222] rounded-[2px] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${mastery}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[var(--gold)] shadow-[0_0_10px_var(--gold)]" 
                />
              </div>
              <span className="text-[0.75rem] text-[var(--gold)] font-black min-w-[80px] text-right">{mastery}% MASTERY</span>
            </div>

            <div className="flex items-center gap-4 bg-[#06b6d4]/[0.03] p-[12px_16px] rounded-lg border border-[#06b6d4]/[0.1]">
              <div className="flex-1 h-1 bg-[#222] rounded-[2px] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${readiness}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-[#06b6d4] shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                />
              </div>
              <div className="flex items-center gap-2 min-w-[80px] justify-end">
                <span className="text-[0.75rem] text-[#06b6d4] font-black">{readiness}% READINESS</span>
                {isReady && (
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="readiness-badge"
                  >
                    READY TO ADVANCE!
                  </motion.span>
                )}
              </div>
            </div>

            {/* Activity Playlist */}
            <div className="mt-5 flex flex-col gap-2.5">
              {(node.activities || []).map(activityId => (
                <button type="button"
                  key={activityId}
                  onClick={() => setActiveActivity({ type: activityId, nodeId: node.id })}
                  className="activity-item-btn bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center justify-between w-full cursor-pointer transition-all duration-200 text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-[1.2rem]">
                      {activityId === 'word-scramble' ? '🧩' : (activityId === 'true-false' ? '⚖️' : (activityId === 'thought-translation' ? '💭' : '📁'))}
                    </span>
                    <div>
                      <div className="text-[0.7rem] font-black text-white tracking-[0.1em] uppercase">
                        {activityId === 'true-false' ? 'LOGIC GATE (Endless)' : 
                         activityId === 'thought-translation' ? 'ESSENTIALIZER (Endless)' : 
                         activityId === 'drag-drop' ? 'PHILOSOPHY SORTER' :
                         activityId.toUpperCase().replace('-', ' ')}
                      </div>
                      <div className="text-[0.55rem] text-[#666] font-bold tracking-[0.05em]">
                        REQUIRED ACTIVITY (+{Math.round(30 / (node.activities?.length || 1))}% READINESS)
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {!activities.some(a => a.id === activityId) && (
                      <div className="text-[0.6rem] font-black text-[var(--gold)] tracking-[0.1em]">LAUNCH 🚀</div>
                    )}
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        activities.some(a => a.id === activityId) ? 'border-[#22c55e] bg-[#22c55e]' : 'border-white/10 bg-transparent'
                      }`}
                    >
                      {activities.some(a => a.id === activityId) && <span className="text-black text-[0.8rem] font-black">✓</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className={`flex flex-col gap-8 ${isLocked ? 'grayscale opacity-60 pointer-events-none' : 'pointer-events-auto'}`}>
          <section>
            <h3 className="text-[#888] text-[0.7rem] font-extrabold tracking-[0.15em] mb-4 border-b border-[#222] pb-2 uppercase">CURRICULUM CONTENT</h3>
            <div className="flex flex-col gap-5">
              {node.richContent?.map((block, i) => (
                <div key={i}>
                  {block.type === 'text' && (
                    <p className="text-[#ddd] text-[1.05rem] leading-[1.7] m-0">{block.content}</p>
                  )}
                  {block.type === 'structural' && (
                    <div className="structural-block">
                      <div className="text-[var(--gold)] text-[0.65rem] font-black mb-2.5 tracking-[0.1em] uppercase">SYNTACTIC STRUCTURE</div>
                      <p className="text-white text-base font-medium m-0 font-serif italic">{block.content}</p>
                    </div>
                  )}
                  {block.type === 'callout' && (
                    <div className="callout-block">
                      <p className="text-[var(--gold)] text-[0.9rem] font-semibold m-0 text-center">✦ {block.content} ✦</p>
                    </div>
                  )}
                </div>
              ))}
              {!node.richContent && <p className="text-[#666] italic">Detailed dossier content pending decryption...</p>}
            </div>
          </section>

          {node.visualFramework && (
            <section>
              <h3 className="text-[#888] text-[0.7rem] font-extrabold tracking-[0.15em] mb-4 border-b border-[#222] pb-2 uppercase">VISUAL ANALYTICS</h3>
              <img 
                src={node.visualFramework} 
                alt="Visual Framework" 
                className="w-full rounded-xl border border-[#333] shadow-[0_20px_40px_rgba(0,0,0,0.4)] block" 
              />
            </section>
          )}

          {(node.requiredVocabIds.length > 0 || node.requiredGrammarIds.length > 0) && (
            <section>
              <h3 className="text-[#888] text-[0.7rem] font-extrabold tracking-[0.15em] mb-4 border-b border-[#222] pb-2 uppercase">NODE SANDBOX</h3>
              <div className="node-sandbox">
                <VocabGrid 
                  onAskLina={onAskLina} 
                  isSandboxMode={isSandboxMode} 
                  filterIds={[...node.requiredVocabIds, ...node.requiredGrammarIds]} 
                  hideToolbar={true}
                />
              </div>
            </section>
          )}

          {node.infographicUrl && (
            <section>
              <h3 className="text-[#888] text-[0.7rem] font-extrabold tracking-[0.15em] mb-4 border-b border-[#222] pb-2 uppercase">ADDITIONAL TOOLS</h3>
              <button type="button"
                onClick={() => setShowInfographicModal(true)}
                className="w-full bg-white/[0.05] text-white font-black text-[0.9rem] p-4 rounded-xl border border-white/10 cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 tracking-wider hover:bg-white/10 hover:border-[var(--gold)]"
              >
                🖼️ VIEW INFOGRAPHIC
              </button>
            </section>
          )}

          <section className="mt-5 pb-[60px]">
            <button type="button"
              onClick={handlePracticeLina}
              className="w-full bg-[var(--gold)] text-black font-black text-[1.1rem] p-6 rounded-2xl border-none cursor-pointer shadow-[0_10px_30px_rgba(251,191,36,0.2)] flex items-center justify-center gap-3 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <span className="text-[1.4rem]">✦</span>
              PRACTICE WITH JAN LINA
            </button>
            <p className="text-[#555] text-[0.65rem] text-center mt-3 font-bold tracking-wider uppercase">
              START LESSON WITH jan LINA FOR INTERACTIVE ASSESSMENT
            </p>
          </section>
        </main>
      </div>

      <WordDetailDrawer
        isOpen={!!drawerId}
        word={drawerId ? vocabulary.find(v => v.id === drawerId) ?? null : null}
        onClose={() => setDrawerId(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />

      <AnimatePresence>
        {showInfographicModal && node.infographicUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            onClick={() => setShowInfographicModal(false)}
            onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setShowInfographicModal(false); }}
            className="fixed inset-0 bg-black/90 backdrop-blur-[20px] z-[10000] flex flex-col items-center justify-center p-10 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-full max-h-full flex flex-col items-center gap-5"
            >
              <img
                src={node.infographicUrl}
                alt="Infographic"
                className="max-w-full max-h-[calc(100vh-120px)] object-contain rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] border border-white/10"
              />
              <button
                type="button"
                onClick={() => setShowInfographicModal(false)}
                className="bg-white text-black border-none px-8 py-3 rounded-full font-black text-[0.8rem] tracking-widest cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
              >
                CLOSE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

