import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 
import type { SortMode, SortDirection } from './Dashboard';

const WORD_FREQ: Record<string, number> = {
  li: 4647, mi: 4143, e: 3597, toki: 2905, ni: 2811, pona: 2692, a: 2126, ala: 1996, jan: 1853, sina: 1765, la: 1729, lon: 1594, sona: 1483, mute: 1268, tawa: 1242, pi: 1169, ike: 1019, tenpo: 1006, seme: 973, wile: 914, ona: 905, o: 856, kama: 764, taso: 757, ken: 738, pali: 663, nimi: 663, tan: 660, ma: 636, pilin: 592, lili: 584, moku: 565, lukin: 445, tomo: 444, ilo: 433, kepeken: 432, sitelen: 411, musi: 408, anu: 348, jo: 325, ali: 321, sama: 318, luka: 318, kin: 311, en: 310, ante: 282, pana: 261, ijo: 258, lape: 256, telo: 253, suno: 252, wan: 229, suli: 228, pini: 228, losi: 224, nasa: 220, nasin: 220, lipu: 218, nanpa: 217, lawa: 198, tu: 196, mani: 192, kalama: 185, kulupu: 176, wawa: 172, sin: 170, weka: 161, ale: 151, moli: 148, sike: 143, pakala: 137, soweli: 130, sewi: 126, awen: 113, utala: 107, inli: 103, pan: 97, kon: 95, poka: 94, sonja: 89, ko: 89, leko: 86, sijelo: 86, linja: 85, pimeja: 84, pu: 82, seli: 80, kute: 80, kasi: 78, jaki: 75, insa: 73, suwi: 71, lete: 67, pije: 58, kili: 56, sonko: 54, uta: 54, kiwen: 50, mama: 50, p: 49, open: 48, oko: 46, esun: 45, meli: 44, lupa: 43, poki: 42, wowa: 39, mije: 39, unpa: 38, i: 37, mun: 36, onkon: 35, monsuta: 35, olin: 34, len: 32, nijon: 31, namako: 30, palisa: 30, l: 29, pipi: 29, loje: 29, anpa: 28, kule: 28, m: 28, walo: 27, noka: 27, nena: 27, selo: 26, jelo: 24, supa: 21, epanja: 21, pata: 21, n: 20, t: 19, kala: 19, powe: 19, laso: 19, epelanto: 16, sinpin: 15, mu: 14, tosi: 14, kanse: 14, u: 14, tajo: 13, akesi: 13, aaa: 12, w: 12, k: 12, po: 11, katala: 11, na: 11, kan: 11, apeja: 10, mateli: 10
};

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  setSelectedWords: (words: string[]) => void;
  sortMode: SortMode;
  sortDirection: SortDirection; // NEW PROP
}

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, selectedWords, setSelectedWords, sortMode, sortDirection }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sortedAndFilteredVocab = useMemo(() => {
    const list = [...vocabulary].filter(w => !activeFilter || w.status === activeFilter);
    
    list.sort((a, b) => {
      let comparison = 0;
      if (sortMode === 'usage') {
        comparison = (WORD_FREQ[b.word] || 0) - (WORD_FREQ[a.word] || 0);
      } else if (sortMode === 'status') {
        comparison = STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      } else if (sortMode === 'unlocked') {
        comparison = (a.status === 'not_started' ? 1 : 0) - (b.status === 'not_started' ? 1 : 0);
      } else {
        comparison = a.word.localeCompare(b.word);
      }
      
      // Apply direction flip
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [vocabulary, activeFilter, sortMode, sortDirection]);

  const displayedVocab = sortedAndFilteredVocab.slice(0, visibleCount);

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.length > 0) {
      if (selectedWords.includes(word.word)) setSelectedWords(selectedWords.filter(w => w !== word.word));
      else setSelectedWords([...selectedWords, word.word]);
      return;
    }

    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    } 

    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => {
      setDrawerId(word.id);
      comboRef.current = null;
    }, 250), wordId: word.id };
  };

  return (
    <section className="mastery-grid" style={{ padding: '0 16px' }} onClick={() => setSelectedWords([])}>
      <motion.div layout className="mastery-grid__cards">
        <AnimatePresence mode="popLayout">
          {displayedVocab.map((word) => {
            const selectIndex = selectedWords.indexOf(word.word);
            const isSelected = selectIndex !== -1;
            return (
              <motion.div 
                key={word.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: (selectedWords.length > 0 && !isSelected) ? 0.4 : 1, scale: isSelected ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
                style={{ zIndex: isSelected ? 10 : 1, cursor: 'pointer', position: 'relative' }}
              >
                <VocabCard word={word} onClick={() => {}} />
                {isSelected && (
                  <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#3b82f6', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', border: '2px solid #fff' }}>
                    {selectIndex + 1}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {visibleCount < sortedAndFilteredVocab.length && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <button onClick={(e) => { e.stopPropagation(); setVisibleCount(prev => prev + 40); }} style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            LOAD MORE ({sortedAndFilteredVocab.length - visibleCount} LEFT)
          </button>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
