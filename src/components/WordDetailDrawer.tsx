/* src/components/WordDetailDrawer.tsx */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { fetchDeepDiveExamples, fetchExamplesForWord, fetchNeighborConnections, resolveApiKey, stringifyUserContext } from '../services/linaService';
import { WORD_RELATIONSHIPS } from '../data/wordRelationships';

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


export default function WordDetailDrawer({ isOpen, word, onClose, onAskLina, isSandboxMode, onWordSelect }: { isOpen: boolean; word?: VocabWord | null; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean; onWordSelect?: (word: string) => void }) {
  const { studentName, profile, updateVocabAIContent } = useMasteryStore();
  const [deepDive, setDeepDive] = useState<Record<string, string> | null>(null);
  const [grammarExamples, setGrammarExamples] = useState<Record<string, string> | null>(null);
  const [neighborConnections, setNeighborConnections] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNeighborsModalOpen, setIsNeighborsModalOpen] = useState(false);

  const primaryMeaning = word?.meanings?.split(',')[0].trim() || word?.meanings;
  const extra = word ? WORD_EXTRA_DATA[word.word] : null;
  
  const baseNeighbors = word ? WORD_RELATIONSHIPS[word.word] || [] : [];
  const extraNeighbors = extra?.neighbors || [];
  
  // Merge neighbors, preferring the annotated ones from extra.neighbors
  const neighbors = Array.from(new Set([...extraNeighbors, ...baseNeighbors]));
  
  // Filter out the unannotated base neighbor if an annotated version already exists
  // e.g. if 'ike (Antonym)' is in extraNeighbors, remove 'ike' from the list.
  const filteredNeighbors = neighbors.filter(n => {
    if (extraNeighbors.includes(n)) return true;
    return !extraNeighbors.some(en => en.startsWith(n + ' '));
  });

  const triggerGeneration = useCallback(async (_force?: boolean) => {
    if (!word) return;

    const key = resolveApiKey();
    if (key && !isSandboxMode) {
      setIsLoading(true);
      const userContext = stringifyUserContext(profile);
      try {
        const partsOfSpeech = word.partOfSpeech.split(',').map(p => p.trim());
        const [results, examples, connections] = await Promise.all([
          fetchDeepDiveExamples(key, word.word, userContext),
          fetchExamplesForWord(key, word.word, partsOfSpeech, userContext),
          fetchNeighborConnections(key, word.word, filteredNeighbors, userContext)
        ]);

        const updateObj: any = {};
        if (results) {
          const { explanation, ...aiExamples } = results;
          setDeepDive(results);
          updateObj.aiExamples = aiExamples;
          updateObj.aiExplanation = explanation;
        }
        if (examples) {
          setGrammarExamples(examples);
          updateObj.grammarExamples = examples;
        }
        if (connections) {
          setNeighborConnections(connections);
          updateObj.neighborConnections = connections;
        }
        
        if (Object.keys(updateObj).length > 0) {
          updateVocabAIContent(word.id, updateObj);
        }
      } catch (err) {
        console.error("Deep dive generation failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [word, isSandboxMode, profile, updateVocabAIContent, filteredNeighbors]);

  useEffect(() => {
    if (isOpen && word) {
      // RESET STATE for new word
      setDeepDive(null);
      setGrammarExamples(null);
      setNeighborConnections(null);
      
      const hasDeepDive = !!(word.aiExamples && word.aiExplanation);
      const hasGrammar = !!word.grammarExamples;
      const hasNeighbors = !!word.neighborConnections;

      if (hasDeepDive) {
        setDeepDive({ ...word.aiExamples, explanation: word.aiExplanation });
      }
      
      if (hasGrammar) {
        setGrammarExamples(word.grammarExamples);
      }

      if (hasNeighbors) {
        setNeighborConnections(word.neighborConnections);
      }

      if (!hasDeepDive || !hasGrammar || !hasNeighbors) {
        const key = resolveApiKey();
        if (key && !isSandboxMode) {
          const userContext = stringifyUserContext(profile);
          const partsOfSpeech = word.partOfSpeech.split(',').map(p => p.trim());
          
          if (!hasDeepDive && !hasGrammar && !hasNeighbors) {
            triggerGeneration();
          } else {
            // Fetch missing pieces individually
            if (!hasGrammar) {
              fetchExamplesForWord(key, word.word, partsOfSpeech, userContext).then(res => {
                setGrammarExamples(res);
                updateVocabAIContent(word.id, { grammarExamples: res });
              });
            }
            if (!hasNeighbors) {
              fetchNeighborConnections(key, word.word, filteredNeighbors, userContext).then(res => {
                setNeighborConnections(res);
                updateVocabAIContent(word.id, { neighborConnections: res });
              });
            }
            if (!hasDeepDive) {
               fetchDeepDiveExamples(key, word.word, userContext).then(results => {
                 if (results) {
                   const { explanation, ...aiExamples } = results;
                   setDeepDive(results);
                   updateVocabAIContent(word.id, { aiExamples, aiExplanation: explanation });
                 }
               });
            }
          }
        }
      }
    }
  }, [isOpen, word, triggerGeneration, isSandboxMode, profile, updateVocabAIContent, filteredNeighbors]);

  return (
    <AnimatePresence>
      {isOpen && word && (
        <div className="modal-backdrop" role="button" tabIndex={0} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); }}>
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
                <h2 style={{ fontSize: '3rem', marginBottom: '0', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{word.word}</h2>
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
                  const isLocked = score >= lowest + 100 && score < 334;
                  const progress = (score / 334) * 100;
                  const color = role === 'noun' ? 'var(--blue)' : role === 'verb' ? 'var(--pink)' : 'var(--amber)';

                  return (
                    <div key={role}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>
                        <span style={{ color: isLocked ? '#666' : 'white' }}>{role === 'mod' ? 'modifier' : role} {isLocked && '🔒'}</span>
                        <span style={{ color }}>{score} / 334</span>
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

            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="section-title" style={{ fontSize: '0.6rem', margin: 0 }}>AI Explanation</h3>
                <button type="button"
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

            <div style={{ marginBottom: '32px' }}>
              <section className="glass-panel" style={{ padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className="section-title" style={{ fontSize: '0.6rem', margin: 0 }}>Grammar Roles</h3>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {word.partOfSpeech.split(',').map(pos => {
                    const cleanPos = pos.trim();
                    return (
                      <div key={cleanPos} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid var(--gold)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px' }}>{cleanPos}</div>
                        {grammarExamples?.[cleanPos] ? (
                          <div style={{ fontSize: '0.85rem', color: '#eee' }}>{grammarExamples[cleanPos]}</div>
                        ) : (
                          <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '80%' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {filteredNeighbors.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <section className="glass-panel" style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="section-title" style={{ fontSize: '0.6rem', margin: 0 }}>Neighbors</h3>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {filteredNeighbors.slice(0, 4).map(n => {
                      const pureName = n.split(' ')[0];
                      return (
                        <div key={n} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid var(--amber)' }}>
                          <button type="button" 
                            onClick={() => onWordSelect?.(pureName)}
                            style={{ background: 'none', border: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', cursor: 'pointer', textAlign: 'left' }}
                          >
                            {n}
                          </button>
                          {neighborConnections?.[n] ? (
                            <div style={{ fontSize: '0.85rem', color: '#eee', lineHeight: '1.4' }}>{neighborConnections[n]}</div>
                          ) : (
                            <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '80%' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {filteredNeighbors.length > 4 && (
                    <button type="button"
                      onClick={() => setIsNeighborsModalOpen(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.65rem', cursor: 'pointer', marginTop: '12px', padding: 0, fontWeight: 900, letterSpacing: '0.05em' }}
                    >
                      VIEW ALL {filteredNeighbors.length} NEIGHBORS
                    </button>
                  )}
                </section>
              </div>
            )}

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
                        <button type="button"
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

            <AnimatePresence>
              {isNeighborsModalOpen && (
                <div 
                  className="modal-backdrop" 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 'inherit' }}
                  onClick={(e) => { e.stopPropagation(); setIsNeighborsModalOpen(false); }}
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-panel"
                    style={{ padding: '24px', maxWidth: '80%', minWidth: '200px', border: '1px solid var(--gold)', boxShadow: '0 0 20px rgba(255, 191, 0, 0.2)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ marginTop: 0, color: 'white', fontSize: '1rem', marginBottom: '16px', textTransform: 'uppercase', fontWeight: 900 }}>All Neighbors</h3>
                    <div style={{ display: 'grid', gap: '8px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
                      {filteredNeighbors.map(n => {
                        const pureName = n.split(' ')[0];
                        return (
                          <div key={n} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '4px', borderLeft: '2px solid var(--amber)' }}>
                            <button type="button" 
                              onClick={() => { setIsNeighborsModalOpen(false); onWordSelect?.(pureName); }}
                              style={{ background: 'none', border: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: 'var(--amber)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', cursor: 'pointer', textAlign: 'left' }}
                            >
                              {n}
                            </button>
                            {neighborConnections?.[n] ? (
                              <div style={{ fontSize: '0.85rem', color: '#eee', lineHeight: '1.4' }}>{neighborConnections[n]}</div>
                            ) : (
                              <div style={{ height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '80%' }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button type="button"
                      onClick={() => setIsNeighborsModalOpen(false)}
                      style={{ marginTop: '24px', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, letterSpacing: '0.05em' }}
                    >
                      CLOSE
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <button type="button" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: 0 }} aria-label="Close">
              &times;
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
