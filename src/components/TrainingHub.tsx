/* src/components/TrainingHub.tsx */
import React from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Brain, Zap, Layers } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

const TrainingHub: React.FC<Props> = ({ onClose }) => {
  const { setActiveActivity } = useMasteryStore();

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
            <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Neural Training Hub</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] mt-2">Personalized Performance Modules</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="absolute bottom-4 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Launch Module →</span>
              </div>
            </button>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
           <div className="flex items-center gap-2"><Shield size={12} /> Sandbox Protocol Active</div>
           <div>Global Context Sync: 100%</div>
        </footer>
      </motion.div>
    </div>
  );
};

export default TrainingHub;
