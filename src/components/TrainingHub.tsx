/* src/components/TrainingHub.tsx */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Target, Zap, Clock, ArrowLeft } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

const TrainingHub: React.FC<Props> = ({ onClose }) => {
  const { setActiveActivity, currentChallenge, currentDailyChallenge } = useMasteryStore();
  const [view, setView] = useState<'hub' | 'challenges'>('hub');

  const activities = [
    { id: 'true-false', label: 'Logic Gate', icon: '⚖️', color: '#FFD700', description: 'Analyze concepts through the lens of nasin pona.' },
    { id: 'thought-translation', label: 'Essentializer', icon: '💭', color: '#e11d48', description: 'Distill complex thoughts into simple Toki Pona.' },
    { id: 'drag-drop', label: 'Philosophy Sorter', icon: '🖱️', color: '#0ea5e9', description: 'Categorize aspects of life as pona or ike.' },
    { id: 'word-scramble', label: 'Word Scramble', icon: '🧩', color: '#a855f7', description: 'Assemble Toki Pona words from their core sounds.' }
  ];

  const handleLaunch = (id: string) => {
    setActiveActivity({ type: id, nodeId: 'hub' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[10001] flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full bg-zinc-900/50 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
              {view === 'hub' ? 'Neural Training Hub' : 'Neural Objectives'}
            </h2>
            <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-2">
              {view === 'hub' ? 'Personalized Performance Modules' : 'Active Challenge Manifest'}
            </p>
          </div>
          <div className="flex gap-4">
            {view === 'challenges' && (
              <button 
                onClick={() => setView('hub')}
                className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 px-4 text-[10px] font-black uppercase tracking-widest"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button type="button" 
              onClick={onClose}
              className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'hub' ? (
            <motion.div 
              key="hub"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {activities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleLaunch(act.id)}
                  className="group relative flex items-start gap-6 p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-left"
                >
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110"
                    style={{ background: `${act.color}15`, border: `1px solid ${act.color}30` }}
                  >
                    {act.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2 group-hover:text-white transition-colors" style={{ color: act.color }}>
                      {act.label}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{act.description}</p>
                  </div>
                </button>
              ))}

              {/* Challenges Entry */}
              <button
                onClick={() => setView('challenges')}
                className="group relative flex items-start gap-6 p-8 rounded-3xl bg-gold/10 border border-gold/20 hover:border-gold/40 transition-all text-left md:col-span-2"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 bg-gold/20 border border-gold/40">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gold uppercase tracking-wider mb-2">Neural Challenges</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">View and track your daily and weekly language objectives.</p>
                </div>
                <div className="absolute top-8 right-8">
                   <Target className="text-gold opacity-20" size={32} />
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="challenges"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              {[
                { type: 'Daily', data: currentDailyChallenge, icon: <Zap size={20} className="text-gold" /> },
                { type: 'Weekly', data: currentChallenge, icon: <Clock size={20} className="text-gold" /> }
              ].map((challenge) => (
                <div 
                  key={challenge.type}
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    {challenge.icon}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-2">{challenge.type} Objective</div>
                    {challenge.data ? (
                      <>
                        <h3 className="text-xl font-bold text-white mb-2">{challenge.data.title}</h3>
                        <p className="text-zinc-400 text-sm mb-4">{challenge.data.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all duration-1000"
                              style={{ width: `${(challenge.data.currentCount / challenge.data.targetCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-white font-black text-xs">{challenge.data.currentCount} / {challenge.data.targetCount}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-zinc-600 italic uppercase tracking-widest text-xs">No active {challenge.type.toLowerCase()} challenge</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Reward</div>
                    <div className="text-2xl font-black text-white">+{challenge.data?.xpReward || 0} <span className="text-gold">XP</span></div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
           <div className="flex items-center gap-2"><Shield size={12} /> Sandbox Protocol Active</div>
           <div>Global Context Sync: 100%</div>
        </footer>
      </motion.div>
    </div>
  );
};

export default TrainingHub;
