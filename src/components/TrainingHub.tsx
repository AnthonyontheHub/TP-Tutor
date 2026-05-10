import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Brain, Zap, Layers, ArrowLeft } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';
import { LogicGate } from './activities/LogicGate';
import { Essentializer } from './activities/Essentializer';
import { PhilosophySorter } from './activities/PhilosophySorter';
import ConfusionDrill from './ConfusionDrill';
import DualDrillMode from './DualDrillMode';
import FlashcardMode from './FlashcardMode';
import CompositionMode from './CompositionMode';

interface Props {
  onClose: () => void;
  onAskLina?: (prompt: string) => void;
}

const TrainingHub: React.FC<Props> = ({ onClose, onAskLina }) => {
  const { setActiveActivity, sessionLog } = useMasteryStore();
  const [localActivity, setLocalActivity] = useState<string | null>(null);

  const today = new Date().toDateString();
  const completedToday = new Set(
    (sessionLog || [])
      .filter(log => new Date(log.date).toDateString() === today)
      .map(log => log.title.toLowerCase())
  );

  const activities = [
    { id: 'true-false', label: 'Logic Gate', icon: '⚖️', color: '#FFD700', description: 'Analyze concepts through the lens of nasin pona.', objective: 'Moral Calibration' },
    { id: 'thought-translation', label: 'Essentializer', icon: '💭', color: '#e11d48', description: 'Distill complex thoughts into simple Toki Pona.', objective: 'Semantic Compression' },
    { id: 'drag-drop', label: 'Philosophy Sorter', icon: '🖱️', color: '#0ea5e9', description: 'Categorize aspects of life as pona or ike.', objective: 'Value Alignment' },
    { id: 'word-scramble', label: 'Word Scramble', icon: '🧩', color: '#a855f7', description: 'Assemble Toki Pona words from their core sounds.', objective: 'Phonetic Reconstruction' },
    { id: 'dual-drill', label: 'Dual Drill', icon: '⚔️', color: '#10b981', description: 'Master production and recognition of core vocabulary.', objective: 'Bi-directional Fluency' },
    { id: 'confusion', label: 'Confusion Drill', icon: '🧠', color: '#f59e0b', description: 'Isolate and resolve commonly mixed-up word pairs.', objective: 'Neural De-confliction' },
    { id: 'flashcards', label: 'Flashcards', icon: '🃏', color: '#ec4899', description: 'Classic spaced-repetition cards for rapid memorization.', objective: 'Spaced Recall' },
    { id: 'composition', label: 'Composition', icon: '✍️', color: '#3b82f6', description: 'Free-form writing practice with AI guidance.', objective: 'Creative Synthesis' }
  ];

  const handleLaunch = (id: string) => {
    if (id === 'word-scramble') {
      setActiveActivity({ type: id, nodeId: 'hub' });
      onClose();
    } else {
      setLocalActivity(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[10001] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full bg-zinc-900/50 border border-white/10 rounded-3xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden flex flex-col max-h-[95vh]"
      >
        <button onClick={onClose} className="close-glyph" style={{ zIndex: 9999 }} aria-label="Close Garrison">✕</button>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Neural Training Hub</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-2">Personalized Performance Modules</p>
          </div>
        </header>

        <div style={{ maxHeight: '85vh', overflowY: 'auto', paddingRight: '10px' }}>
          {localActivity ? (
            <div className="flex flex-col h-[600px] overflow-y-auto w-full relative">
              <button 
                onClick={() => setLocalActivity(null)}
                className="absolute -top-4 -left-4 p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="pt-12">
                {localActivity === 'true-false' && <LogicGate onComplete={() => setLocalActivity(null)} onAskLina={onAskLina} />}
                {localActivity === 'thought-translation' && <Essentializer onSessionEnd={() => setLocalActivity(null)} onAskLina={onAskLina} />}
                {localActivity === 'drag-drop' && <PhilosophySorter onSessionEnd={() => setLocalActivity(null)} onAskLina={onAskLina} />}
                {localActivity === 'dual-drill' && <DualDrillMode onClose={() => setLocalActivity(null)} isSandboxMode={false} />}
                {localActivity === 'confusion' && <ConfusionDrill onClose={() => setLocalActivity(null)} />}
                {localActivity === 'flashcards' && <FlashcardMode onClose={() => setLocalActivity(null)} onAskLina={onAskLina || (() => {})} isSandboxMode={false} />}
                {localActivity === 'composition' && <CompositionMode onClose={() => setLocalActivity(null)} isSandboxMode={false} />}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {activities.map((act) => {
                  const isDone = completedToday.has(act.label.toLowerCase());
                  return (
                    <button
                      key={act.id}
                      onClick={() => handleLaunch(act.id)}
                      className={`group relative flex flex-col items-center p-8 rounded-3xl bg-white/5 border transition-all text-center garrison-card ${isDone ? 'border-[#a855f7]/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/5 hover:border-white/20'}`}
                    >
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 mb-4"
                        style={{ background: `${act.color}15`, border: `1px solid ${act.color}30` }}
                      >
                        {act.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="garrison-card-title" style={{ color: act.color }}>
                          {act.label}
                        </h3>
                        <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 mb-3">{act.objective}</div>
                        <p className="garrison-card-desc">{act.description}</p>
                      </div>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Initialize Protocol →</span>
                      </div>
                      {isDone && (
                        <div className="absolute top-4 left-4 text-[9px] font-black text-[#a855f7] tracking-widest">✦ SYNCED</div>
                      )}
                    </button>
                  );
                })}
              </div>

              <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-3">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                   <div className="flex items-center gap-2"><Shield size={12} /> Sandbox Protocol Active</div>
                   <div>Global Context Sync: 100%</div>
                 </div>
                 <div className="text-xs text-zinc-500 font-medium text-center">
                   Modules are sandboxed. Performance here trains your brain but does not directly alter your core mastery scores.
                 </div>
              </footer>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrainingHub;
