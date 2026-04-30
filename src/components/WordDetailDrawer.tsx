/* src/components/WordDetailDrawer.tsx */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { fetchDeepDiveExamples, resolveApiKey, stringifyUserContext } from '../services/linaService';

const NEXT_STATUS: Partial<Record<MasteryStatus, MasteryStatus>> = {
  not_started: 'introduced',
  introduced:  'practicing',
  practicing:  'confident',
  confident:   'mastered',
};

const WORD_EXTRA_DATA: Record<string, { etymology: string, neighbors: string[], compounds: string[] }> = {
  'pona': { etymology: 'From Esperanto: bona', neighbors: ['ike (Antonym)', 'suwi (Synonym-ish)'], compounds: ['jan pona (friend)', 'toki pona (good language)'] },
  'ike': { etymology: 'From Finnish: ilkeä', neighbors: ['pona (Antonym)', 'jaki (Synonym-ish)'], compounds: ['toki ike (insult)', 'pilin ike (sad)'] },
  'telo': { etymology: 'From Portuguese: óleo', neighbors: ['ko (Opposite-ish)', 'kon (Opposite-ish)'], compounds: ['telo nasa (alcohol)', 'telo suli (ocean)'] },
  'toki': { etymology: 'From Tok Pisin: tok', neighbors: ['kalama (Neighbor)', 'nimi (Neighbor)'], compounds: ['toki pona (good language)', 'toki utala (argument)'] },
  'pali': { etymology: 'From Acadian French: palier', neighbors: ['musi (Antonym-ish)', 'awen (Opposite-ish)'], compounds: ['pali pona (good work)', 'ilo pali (tool)'] },
  'jan': { etymology: 'From Cantonese: 人 (jan)', neighbors: ['soweli (Neighbor)', 'ijoa (Neighbor)'], compounds: ['jan pona (friend)', 'jan utala (soldier)'] },
  'moku': { etymology: 'From Japanese: もぐもぐ (mogumogu)', neighbors: ['telo (Neighbor)', 'pan (Neighbor)'], compounds: ['moku pona (good food)', 'moku telo (drink)'] },
  'sona': { etymology: 'From Georgian: ცოდな (tsodna)', neighbors: ['nasa (Antonym-ish)', 'kute (Neighbor)'], compounds: ['sona pona (wisdom)', 'jan sona (expert)'] },
};


export default function WordDetailDrawer({ isOpen, word, onClose, onAskLina, isSandboxMode }: { isOpen: boolean; word?: VocabWord | null; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const { studentName, profile, updateVocabAIContent } = useMasteryStore();
  const [deepDive, setDeepDive] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const primaryMeaning = word?.meanings?.split(',')[0].trim() || word?.meanings;
  const extra = word ? WORD_EXTRA_DATA[word.word] : null;

  const triggerGeneration = async (_force?: boolean) => {
    if (!word) return;

    const key = resolveApiKey();
    if (key && !isSandboxMode) {
      setIsLoading(true);
      const userContext = stringifyUserContext(profile);
      try {
        const results = await fetchDeepDiveExamples(key, word.word, userContext);
        if (results) {
          const { explanation, ...examples } = results;
          setDeepDive(results);
          updateVocabAIContent(word.id, { aiExamples: examples, aiExplanation: explanation });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && word) {
      // RESET STATE for new word
      setDeepDive(null);
      
      if (word.aiExamples && word.aiExplanation) {
        setDeepDive({ ...word.aiExamples, explanation: word.aiExplanation });
      } else {
        triggerGeneration();
      }
    }
  }, [isOpen, word?.id, isSandboxMode]); // Only re-run when word ID changes

  return (
    <AnimatePresence>
      {isOpen && word && (
        <div className="modal-backdrop" onClick={onClose}>
          <motion.div 
            className="modal-content" 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            onClick={(e) => e.stopPropagation()}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ padding: '24px' }}
          >
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '0', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{word.word}</h2>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{STATUS_META[word.status].label}</div>
                  <div style={{ fontSize: '1.5rem' }}>{STATUS_META[word.status].emoji}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', color: 'var(--gold)', fontWeight: 700, marginTop: '-5px', textTransform: 'uppercase' }}>{primaryMeaning}</div>
              {extra?.etymology && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>{extra.etymology}</div>
              )}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 900 }}>NEURAL RESONANCE: {word.baseScore}/1000</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 800 }}>{STATUS_META[word.status].label}</span>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {(['noun', 'verb', 'mod'] as const).map(role => {
                  const score = word.roleMatrix?.[role] || 0;
                  const lowest = Math.min(word.roleMatrix.noun, word.roleMatrix.verb, word.roleMatrix.mod);
                  const isLocked = score >= lowest + 100 && score < 333;
                  const progress = (score / 333) * 100;
                  const color = role === 'noun' ? 'var(--blue)' : role === 'verb' ? 'var(--pink)' : 'var(--amber)';

                  return (
                    <div key={role}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>
                        <span style={{ color: isLocked ? '#666' : 'white' }}>{role === 'mod' ? 'modifier' : role} {isLocked && '🔒'}</span>
                        <span style={{ color }}>{score} / 333</span>
                      </div>
                      <div className="progress-bar-track" style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          style={{
                            height: '100%',
                            background: color,
                            boxShadow: `0 0 10px ${color}44`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {word.status !== 'mastered' && (
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    NEXT SYNC: {STATUS_META[NEXT_STATUS[word.status]!].label.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              <section className="glass-panel" style={{ padding: '12px' }}>
                <h3 className="section-title" style={{ fontSize: '0.55rem' }}>Grammar</h3>
                <div style={{ fontSize: '0.8rem', color: 'white', fontWeight: 900 }}>{word.partOfSpeech.toUpperCase()}</div>
              </section>
              <section className="glass-panel" style={{ padding: '12px' }}>
                <h3 className="section-title" style={{ fontSize: '0.55rem' }}>Neighbors</h3>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{extra?.neighbors.slice(0,2).join(', ') || '-'}</div>
              </section>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="section-title" style={{ fontSize: '0.6rem', margin: 0 }}>AI Explanation</h3>
                <button 
                  onClick={() => triggerGeneration(true)} 
                  style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.6 }}
                >
                  REFRESH ↻
                </button>
              </div>
              <div className="glass-panel" style={{ padding: '15px', fontSize: '0.9rem', color: '#ccc', lineHeight: '1.6', borderLeft: '2px solid var(--gold)' }}>
                {isLoading ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '100%' }} />
                    <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '90%' }} />
                    <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '40%' }} />
                  </div>
                ) : (
                  word.aiExplanation || deepDive?.explanation || 'No explanation generated yet.'
                )}
              </div>
            </div>

            <section style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="section-title" style={{ fontSize: '0.6rem', margin: 0 }}>Neural Examples</h3>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Simple', 'Intermediate', 'Advanced', 'Personal'].map((tier) => {
                  const content = deepDive?.[tier.toLowerCase()];
                  const name = profile.tpName || studentName || 'USER';
                  const label = tier === 'Personal' ? `${name.toUpperCase()}'S LORE` : tier;
                  const borderCol = tier === 'Simple' ? 'var(--blue)' : 
                                    tier === 'Intermediate' ? 'var(--amber)' : 
                                    tier === 'Advanced' ? 'var(--pink)' : 
                                    'var(--gold)';
                  
                  return (
                    <div key={tier} className="glass-panel" style={{ padding: '10px 15px', borderLeft: `2px solid ${borderCol}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: 900, color: tier === 'Personal' ? 'var(--gold)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                        <button 
                          onClick={() => onAskLina(`[SYSTEM: Deep-dive into "${word.word}" focus on ${tier} tier. Context: ${content}]`)}
                          style={{ border: 'none', color: 'var(--gold)', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}
                        >
                          PRACTICE ✦
                        </button>
                      </div>
                      {isLoading ? <div style={{ height: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '80%' }} /> : <div style={{ fontSize: '0.85rem', color: '#eee', lineHeight: '1.4' }}>{content || '...'}</div>}
                    </div>
                  );
                })}
              </div>
            </section>

            <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: 0 }} aria-label="Close">
              &times;
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
