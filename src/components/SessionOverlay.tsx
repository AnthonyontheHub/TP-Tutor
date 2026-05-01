import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';
import { LogicGate } from './activities/LogicGate';
import { Essentializer } from './activities/Essentializer';
import { PhilosophySorter } from './activities/PhilosophySorter';
import WordScramble from './WordScramble';

export const SessionOverlay: React.FC = () => {
  const { activeActivity, setActiveActivity, recordActivityCompletion, profile, curriculums } = useMasteryStore();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!activeActivity) return null;

  const handleClose = () => {
    setShowConfirm(true);
  };

  const confirmAbandon = () => {
    setActiveActivity(null);
    setShowConfirm(false);
  };

  const handleComplete = (stats?: { score: number, total: number }) => {
    if (activeActivity.nodeId && activeActivity.type) {
      recordActivityCompletion(activeActivity.nodeId, activeActivity.type, stats);
    }
    setActiveActivity(null);
  };

  const renderActivity = () => {
    const { type, nodeId } = activeActivity;
    const isHubLaunch = nodeId === 'hub';
    
    // Find node details if not a hub launch
    const sourceNode = isHubLaunch ? null : curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
    const vocabList = sourceNode?.requiredVocabIds || [];
    
    // For Hub launches, we might want to pass a 'global' context
    const curriculumContext = isHubLaunch ? "Entire unlocked curriculum and general philosophy" : `Node ID: ${nodeId}`;

    switch (type) {
      case 'true-false':
        return <LogicGate userProfile={profile} curriculumContext={curriculumContext} onComplete={handleComplete} />;
      case 'thought-translation':
        return <Essentializer userProfile={profile} curriculumContext={curriculumContext} onSessionEnd={handleComplete} />;
      case 'drag-drop':
        return <PhilosophySorter userProfile={profile} curriculumContext={curriculumContext} vocabList={vocabList} onSessionEnd={handleComplete} />;
      case 'word-scramble':
        return <WordScramble nodeId={isHubLaunch ? undefined : nodeId} vocabList={vocabList} onComplete={handleComplete} />;
      default:
        return (
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4 uppercase">Activity Under Construction</h2>
            <p className="text-gray-400 mb-8 font-mono text-xs uppercase tracking-widest">Type: {type}</p>
            <button type="button" 
              onClick={() => handleComplete()}
              className="px-8 py-3 bg-white text-black font-black rounded-full"
            >
              COMPLETE PREVIEW MISSION
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex flex-col overflow-y-auto">
      {/* Top Header */}
      <div className="flex justify-end p-6">
        <button type="button" 
          onClick={handleClose}
          className="p-3 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          {renderActivity()}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Abandon Session?</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Your progress will not be saved for this activity.</p>
              </div>
              <div className="flex flex-col gap-3">
                <button type="button" 
                  onClick={confirmAbandon}
                  className="w-full py-4 bg-rose-600 text-white font-black uppercase tracking-[0.2em] rounded-xl hover:bg-rose-500 transition-all"
                >
                  Confirm Exit
                </button>
                <button type="button" 
                  onClick={() => setShowConfirm(false)}
                  className="w-full py-4 bg-white/5 text-white/60 font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-white/10 transition-all"
                >
                  Stay in Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
