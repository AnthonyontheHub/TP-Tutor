import { useState, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import VocabCard from './VocabCard';
import WordDetailDrawer from './WordDetailDrawer';
import type { MasteryStatus, VocabWord } from '../types/mastery'; 

interface Props {
  onAskLina: (prompt: string) => void;
  isSandboxMode: boolean;
  activeFilter: MasteryStatus | null;
  sortMode: 'alphabetical' | 'status' | 'unlocked';
}

const STATUS_ORDER: MasteryStatus[] = ['not_started', 'introduced', 'practicing', 'confident', 'mastered'];

export default function MasteryGrid({ onAskLina, isSandboxMode, activeFilter, sortMode }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const comboRef = useRef<{ timer: ReturnType<typeof setTimeout>, wordId: string } | null>(null);

  const displayedVocab = [...vocabulary]
    .filter(w => !activeFilter || w.status === activeFilter)
    .sort((a, b) => {
      if (sortMode === 'status') return STATUS_ORDER.indexOf(b.status) - STATUS_ORDER.indexOf(a.status);
      if (sortMode === 'unlocked') return (a.status === 'not_started' ? 1 : 0) - (b.status === 'not_started' ? 1 : 0);
      return a.word.localeCompare(b.word);
    });

  const handleCardClick = (word: VocabWord) => {
    if (selectedWords.includes(word.word)) {
      if (selectedWords.length === 1) setDrawerId(word.id);
      setSelectedWords(prev => prev.filter(w => w !== word.word));
      return;
    }
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    }
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => { setSelectedWords(prev => [...prev, word.word]); comboRef.current = null; }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <div className="mastery-grid__cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isSuperFocus = selectedWords.length === 1 && isSelected;
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ transform: isSuperFocus ? 'scale(1.8) translateY(-15px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 ? 'scale(0.85)' : 'scale(1)')), opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, transition: 'all 0.3s ease', zIndex: isSelected ? 100 : 1, cursor: 'pointer', position: 'relative' }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSuperFocus && <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '9px', textAlign: 'center' }}>{word.meanings}</div>}
            </div>
          );
        })}
      </div>

      {selectedWords.length > 1 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: '#111', border: '1px solid #3b82f6', borderRadius: '12px', padding: '15px', zIndex: 1000 }}>
          <div style={{ color: 'white', marginBottom: '10px', fontSize: '1rem' }}>{selectedWords.join(' ')}</div>
          <button onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" correct?`); setSelectedWords([]); }} style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>ASK LINA</button>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
      return;
    }

    // 2. Sandbox Combo Tapping
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    }

    // 3. Selection Logic
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => {
      setSelectedWords(prev => [...prev, word.word]);
      comboRef.current = null;
    }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const isSelected = selectedWords.includes(word.word);
          const isSuperFocus = selectedWords.length === 1 && isSelected;
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ 
                transform: isSuperFocus ? 'scale(1.8) translateY(-15px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 ? 'scale(0.85)' : 'scale(1)')),
                opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                zIndex: isSelected ? 100 : 1,
                cursor: 'pointer', position: 'relative'
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isSuperFocus && (
                <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '10px', textAlign: 'center' }}>
                  {word.meanings}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOAT BUILDER (Isolated here to prevent prop errors) */}
      {selectedWords.length > 1 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', right: '16px', background: '#111', border: '1px solid #3b82f6', borderRadius: '16px', padding: '16px', zIndex: 1000 }}>
          <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>{selectedWords.join(' ')}</div>
          <button onClick={() => { onAskLina(`toki Lina! Is "${selectedWords.join(' ')}" a good sentence?`); setSelectedWords([]); }} style={{ width: '100%', padding: '12px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>ASK LINA</button>
        </div>
      )}

      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => setDrawerId(null)} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
      return;
    }
    if (isSandboxMode && comboRef.current?.wordId === word.id) {
      clearTimeout(comboRef.current.timer);
      updateVocabStatus(word.id, STATUS_ORDER[(STATUS_ORDER.indexOf(word.status) + 1) % STATUS_ORDER.length]);
      comboRef.current = { timer: setTimeout(() => comboRef.current = null, 350), wordId: word.id };
      return;
    } 
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => { setSelectedWords([...selectedWords, word.word]); comboRef.current = null; }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const isOnlySelection = selectedWords.length === 1 && selectedWords[0] === word.word;
          const isSelected = selectedWords.includes(word.word);
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ 
                transform: isOnlySelection ? 'scale(1.8) translateY(-10px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 ? 'scale(0.85)' : 'scale(1)')), 
                opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, 
                transition: 'all 0.4s ease', zIndex: isOnlySelection ? 100 : (isSelected ? 10 : 1), cursor: 'pointer', position: 'relative' 
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isOnlySelection && <div style={{ position: 'absolute', bottom: '-30px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '0.45rem', textAlign: 'center' }}>{word.meanings}</div>}
            </div>
          );
        })}
      </div>
      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => { setDrawerId(null); setSelectedWords([]); }} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
    if (comboRef.current) clearTimeout(comboRef.current.timer);
    comboRef.current = { timer: setTimeout(() => { setSelectedWords([...selectedWords, word.word]); comboRef.current = null; }, 350), wordId: word.id };
  };

  return (
    <section className="mastery-grid" onClick={() => setSelectedWords([])}>
      <div className="mastery-grid__cards">
        {displayedVocab.map((word) => {
          const selectIndex = selectedWords.indexOf(word.word);
          const isSelected = selectIndex !== -1;
          const isOnlySelection = selectedWords.length === 1 && isSelected;
          return (
            <div key={word.id} onClick={(e) => { e.stopPropagation(); handleCardClick(word); }}
              style={{ 
                transform: isOnlySelection ? 'scale(1.8) translateY(-10px)' : (isSelected ? 'scale(1.1)' : (selectedWords.length > 0 ? 'scale(0.85)' : 'scale(1)')), 
                opacity: selectedWords.length > 0 && !isSelected ? 0.2 : 1, 
                transition: 'all 0.4s ease', 
                zIndex: isOnlySelection ? 100 : (isSelected ? 10 : 1), 
                cursor: 'pointer', position: 'relative' 
              }}
            >
              <VocabCard word={word} onClick={() => {}} />
              {isOnlySelection && <div style={{ position: 'absolute', bottom: '-35px', left: 0, right: 0, background: '#3b82f6', color: 'white', padding: '4px', borderRadius: '4px', fontSize: '0.45rem', textAlign: 'center' }}>{word.meanings}</div>}
            </div>
          );
        })}
      </div>
      {drawerId && <WordDetailDrawer word={vocabulary.find(v => v.id === drawerId)!} onClose={() => { setDrawerId(null); setSelectedWords([]); }} onAskLina={onAskLina} isSandboxMode={isSandboxMode} />}
    </section>
  );
}
