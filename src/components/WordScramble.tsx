import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCcw, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';

const defaultWords = [
  { tokiPona: "pona", english: "good, simple" },
  { tokiPona: "suno", english: "sun, light" },
  { tokiPona: "telo", english: "water, liquid" },
  { tokiPona: "moku", english: "food, eat" },
  { tokiPona: "jan", english: "person" }
];

interface ScrambledLetter { id: string; char: string; }

export default function WordScramble({ nodeId, onComplete }: { nodeId?: string, onComplete?: (stats: { score: number, total: number }) => void }) {
  const { vocabulary, curriculums } = useMasteryStore();

  const words = React.useMemo(() => {
    if (!nodeId) return defaultWords;
    const node = curriculums.flatMap(l => l.nodes).find(n => n.id === nodeId);
    if (!node) return defaultWords;
    
    const nodeWordIds = [...node.requiredVocabIds, ...(node.requiredWordIds || [])];
    const nodeWords = vocabulary.filter(v => nodeWordIds.includes(v.id) || nodeWordIds.includes(v.word));
    
    if (nodeWords.length === 0) return defaultWords;
    
    return nodeWords.map(v => ({
      tokiPona: v.word,
      english: v.meanings
    }));
  }, [nodeId, vocabulary, curriculums]);

  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    setCurrentIndex(0);
    setShowFinished(false);
  }, [words]);

  const [scrambled, setScrambled] = useState<ScrambledLetter[]>([]);
  const [selected, setSelected] = useState<ScrambledLetter[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  const currentWord = words[currentIndex];

  useEffect(() => {
    if (showFinished && nodeId && onComplete) {
      onComplete({ score: words.length, total: words.length });
    }
  }, [showFinished, nodeId, onComplete, words.length]);

  useEffect(() => {
    const letters = currentWord.tokiPona.split('').map((char, index) => ({
      id: `${currentIndex}-${index}-${char}`, char
    }));
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    if (shuffled.map(l => l.char).join('') === currentWord.tokiPona && letters.length > 1) {
      shuffled.sort(() => Math.random() - 0.5);
    }
    setScrambled(shuffled);
    setSelected([]);
    setIsCorrect(false);
  }, [currentIndex]);

  const handleTileClick = (letter: ScrambledLetter) => {
    if (isCorrect) return;
    setScrambled(prev => prev.filter(l => l.id !== letter.id));
    setSelected(prev => [...prev, letter]);
  };

  const handleRemoveClick = (letter: ScrambledLetter) => {
    if (isCorrect) return;
    setSelected(prev => prev.filter(l => l.id !== letter.id));
    setScrambled(prev => [...prev, letter]);
  };

  useEffect(() => {
    if (selected.length === currentWord.tokiPona.length) {
      const spelled = selected.map(l => l.char).join('');
      if (spelled === currentWord.tokiPona) setIsCorrect(true);
    }
  }, [selected, currentWord.tokiPona]);

  const nextWord = () => {
    if (currentIndex < words.length - 1) setCurrentIndex(prev => prev + 1);
    else setShowFinished(true);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setShowFinished(false);
  };

  if (showFinished) {
    return (
      <div className="min-h-[70vh] bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans rounded-xl mt-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="mb-6 flex justify-center"><Trophy className="w-20 h-20 text-[#D4AF37]" /></div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">O kama sona!</h1>
          <p className="text-gray-400 mb-2 max-w-xs">You've mastered these words.</p>
          <div className="mb-8 p-3 bg-[#D4AF371a] border border-[#D4AF3733] rounded-lg">
            <p className="text-[#D4AF37] text-xs font-mono uppercase tracking-widest font-bold">Node Activity Requirement Met! +30% Readiness</p>
          </div>
          <button onClick={resetGame} className="px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-full transition-all hover:scale-105">Play Again</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#0a0a0a] text-white p-4 flex flex-col items-center font-sans rounded-xl mt-4">
      <header className="w-full max-w-md mb-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#D4AF37]">Vocabulary Training</span>
        </div>
        <div className="text-xs font-mono opacity-50 uppercase tracking-widest">{currentIndex + 1} / {words.length}</div>
      </header>
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center gap-12">
        <div className="text-center space-y-2">
          <p className="text-sm font-mono text-[#D4AF37] uppercase tracking-widest opacity-60">Meaning</p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight italic">"{currentWord.english}"</h2>
        </div>
        <div className="w-full min-h-[90px] flex gap-2 justify-center items-center border-b border-[#ffffff1a] pb-6 relative">
          <AnimatePresence mode="popLayout">
            {selected.length === 0 && <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} className="absolute text-xs font-mono uppercase tracking-[0.3em]">Assemble Word</motion.div>}
            {selected.map((letter) => (
              <motion.button key={letter.id} layoutId={letter.id} onClick={() => handleRemoveClick(letter)} className="w-12 h-16 md:w-14 md:h-20 bg-white text-black flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg shadow-[0_4px_0_#ccc] active:translate-y-1 active:shadow-none transition-all cursor-pointer" animate={isCorrect ? { backgroundColor: "#00FF00", boxShadow: "0 0 20px rgba(0, 255, 0, 0.4)", y: [0, -10, 0] } : {}} transition={isCorrect ? { duration: 0.4, repeat: 0, delay: selected.indexOf(letter) * 0.05 } : { type: "spring", stiffness: 300, damping: 30 }}>{letter.char}</motion.button>
            ))}
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-4 gap-4 md:gap-6 justify-center">
          <AnimatePresence mode="popLayout">
            {scrambled.map((letter) => (
              <motion.button key={letter.id} layoutId={letter.id} onClick={() => handleTileClick(letter)} className="w-12 h-16 md:w-14 md:h-20 bg-[#1a1a1a] border border-[#ffffff20] text-white flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg shadow-[0_4px_0_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer hover:bg-[#252525]" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{letter.char}</motion.button>
            ))}
          </AnimatePresence>
        </div>
        <div className="h-24 w-full flex items-center justify-center">
          <AnimatePresence>
            {isCorrect && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[#00FF00]"><CheckCircle2 className="w-5 h-5" /><span className="font-mono uppercase tracking-[0.2em] font-bold">Excellent!</span></div>
                <button onClick={nextWord} className="group flex items-center gap-2 px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-[#D4AF37] transition-colors">{currentIndex === words.length - 1 ? 'Finish' : 'Next Word'}<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="w-full max-w-md py-8 flex justify-center">
        <button onClick={() => { setScrambled([...scrambled, ...selected].sort(() => Math.random() - 0.5)); setSelected([]); setIsCorrect(false); }} disabled={isCorrect} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-white disabled:opacity-0 transition-all"><RefreshCcw className="w-3 h-3" />Reset word</button>
      </footer>
    </div>
  );
}
