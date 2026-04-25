import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';
import { fetchDeepDiveExamples, resolveApiKey, stringifyUserContext } from '../services/linaService';

const TIER_RANGES: Record<MasteryStatus, [number, number]> = {
  not_started: [0,  0],
  introduced:  [1, 50],
  practicing:  [51, 150],
  confident:   [151, 400],
  mastered:    [401, 500],
};
const NEXT_STATUS: Partial<Record<MasteryStatus, MasteryStatus>> = {
  not_started: 'introduced',
  introduced:  'practicing',
  practicing:  'confident',
  confident:   'mastered',
};
const NEXT_THRESHOLD: Partial<Record<MasteryStatus, number>> = {
  not_started: 1, introduced: 51, practicing: 151, confident: 401,
};
const NEXT_COLOR: Record<MasteryStatus, string> = {
  not_started: '#1d4ed8',
  introduced:  '#92400e',
  practicing:  '#16a34a',
  confident:   '#22c55e',
  mastered:    '#22c55e',
};

const WORD_EXTRA_DATA: Record<string, { etymology: string, neighbors: string[], compounds: string[] }> = {
  'pona': { etymology: 'From Esperanto: bona', neighbors: ['ike (Antonym)', 'suwi (Synonym-ish)'], compounds: ['jan pona (friend)', 'toki pona (good language)'] },
  'ike': { etymology: 'From Finnish: ilkeä', neighbors: ['pona (Antonym)', 'jaki (Synonym-ish)'], compounds: ['toki ike (insult)', 'pilin ike (sad)'] },
  'telo': { etymology: 'From Portuguese: óleo', neighbors: ['ko (Opposite-ish)', 'kon (Opposite-ish)'], compounds: ['telo nasa (alcohol)', 'telo suli (ocean)'] },
  'toki': { etymology: 'From Tok Pisin: tok', neighbors: ['kalama (Neighbor)', 'nimi (Neighbor)'], compounds: ['toki pona (good language)', 'toki utala (argument)'] },
  'pali': { etymology: 'From Acadian French: palier', neighbors: ['musi (Antonym-ish)', 'awen (Opposite-ish)'], compounds: ['pali pona (good work)', 'ilo pali (tool)'] },
  'jan': { etymology: 'From Cantonese: 人 (jan)', neighbors: ['soweli (Neighbor)', 'ijoa (Neighbor)'], compounds: ['jan pona (friend)', 'jan utala (soldier)'] },
  'moku': { etymology: 'From Japanese: もぐもぐ (mogumogu)', neighbors: ['telo (Neighbor)', 'pan (Neighbor)'], compounds: ['moku pona (good food)', 'moku telo (drink)'] },
  'sona': { etymology: 'From Georgian: ცოდნა (tsodna)', neighbors: ['nasa (Antonym-ish)', 'kute (Neighbor)'], compounds: ['sona pona (wisdom)', 'jan sona (expert)'] },
};

function tierProgress(score: number, status: MasteryStatus): number {
  const [lo, hi] = TIER_RANGES[status];
  if (hi === lo) return 1;
  return Math.min(1, Math.max(0, (score - lo) / (hi - lo)));
}

export default function WordDetailDrawer({ isOpen, word, onClose, onAskLina, isSandboxMode }: { isOpen: boolean; word?: VocabWord | null; onClose: () => void; onAskLina: (p: string) => void; isSandboxMode: boolean }) {
  const { profile, lore } = useMasteryStore();
  const [deepDive, setDeepDive] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const primaryMeaning = word?.meanings?.split(',')[0].trim() || word?.meanings;
  const extra = word ? WORD_EXTRA_DATA[word.word] : null;

  useEffect(() => {
    if (isOpen && word) {
      setDeepDive(null);
      const key = resolveApiKey();
      if (key && !isSandboxMode) {
        setIsLoading(true);
        const userContext = stringifyUserContext(profile, lore);
        fetchDeepDiveExamples(key, word.word, userContext)
          .then(setDeepDive)
          .finally(() => setIsLoading(false));
      }
    }
  }, [isOpen, word, isSandboxMode, profile, lore]);

  return (
    <AnimatePresence>
      {isOpen && word && (
        <motion.div 
          key="backdrop" 
          className="drawer-backdrop" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
        />
      )}
      {isOpen && word && (
        <motion.div 
          key="drawer" 
          className="word-drawer" 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.95 }} 
          onClick={(e) => e.stopPropagation()}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ maxHeight: '90vh' }}
        >
          <div className="drawer__handle" />
          <div className="drawer__scroll-area">
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: '2.8rem', marginBottom: '0' }}>{word.word}</h2>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 800, textTransform: 'uppercase' }}>{STATUS_META[word.status].label}</div>
                  <div style={{ fontSize: '1.2rem' }}>{STATUS_META[word.status].emoji}</div>
                </div>
              </div>
              <div style={{ fontSize: '1.4rem', color: '#3b82f6', fontWeight: 700, marginTop: '-5px' }}>{primaryMeaning}</div>
              {extra?.etymology && (
                <div style={{ fontSize: '0.75rem', color: '#555', fontStyle: 'italic', marginTop: '4px' }}>{extra.etymology}</div>
              )}
            </div>

            {/* Point Progress */}
            <div style={{ marginBottom: '32px' }}>
              <div className="progress-bar-track" style={{ height: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${tierProgress(word.confidenceScore ?? 0, word.status) * 100}%`,
                    background: NEXT_COLOR[word.status],
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: '#444', fontWeight: 900 }}>{word.confidenceScore} PTS</span>
                {word.status !== 'mastered' && (
                  <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 700 }}>
                    {Math.max(0, (NEXT_THRESHOLD[word.status] ?? 0) - (word.confidenceScore ?? 0))} TO {STATUS_META[NEXT_STATUS[word.status]!].label.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <section>
                <h3 className="section-title" style={{ marginBottom: '8px' }}>Grammar Role</h3>
                <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222', fontSize: '0.85rem', color: '#ccc' }}>
                  {word.partOfSpeech.toUpperCase()}
                </div>
              </section>
              <section>
                <h3 className="section-title" style={{ marginBottom: '8px' }}>Semantic Neighbors</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {extra?.neighbors.map(n => (
                    <span key={n} style={{ background: '#1a1a1a', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', color: '#888', border: '1px solid #222' }}>{n}</span>
                  )) || <span style={{ color: '#444', fontSize: '0.75rem' }}>No neighbors listed.</span>}
                </div>
              </section>
            </div>

            <section style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '12px' }}>Progressive Examples</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {['Simple', 'Intermediate', 'Advanced'].map((tier) => {
                  const key = tier.toLowerCase();
                  const content = deepDive?.[key];
                  return (
                    <div key={tier} style={{ background: '#111', padding: '12px', borderRadius: '10px', borderLeft: `4px solid ${tier === 'Simple' ? '#3b82f6' : tier === 'Intermediate' ? '#f59e0b' : '#ec4899'}` }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#555', textTransform: 'uppercase', marginBottom: '4px' }}>{tier}</div>
                      {isLoading ? (
                        <div style={{ height: '1.2rem', background: '#1a1a1a', borderRadius: '4px', width: '80%' }} className="pulse" />
                      ) : content ? (
                        <div style={{ fontSize: '0.9rem', color: '#eee' }}>{content}</div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#444', fontStyle: 'italic' }}>Waiting for jan Lina...</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '12px' }}>Common Compounds</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {extra?.compounds.map(c => (
                  <div key={c} onClick={() => onAskLina(`What does "${c}" mean?`)} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                    {c}
                  </div>
                )) || <div style={{ color: '#444', fontSize: '0.75rem' }}>None listed.</div>}
              </div>
            </section>

            <section style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 className="section-title" style={{ margin: 0, color: '#ec4899' }}>jan Lina's Personal Take</h3>
                <button 
                  onClick={() => onAskLina(`Tell me something personal about "${word.word}".`)}
                  style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.7rem', cursor: 'pointer' }}
                >
                  ASK JAN LINA
                </button>
              </div>
              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '12px', border: '1px solid #ec489922', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '20px', background: '#ec4899', color: 'white', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>LORE-AWARE</div>
                {isLoading ? (
                  <div style={{ color: '#444', fontSize: '0.85rem' }}>jan Lina is writing...</div>
                ) : deepDive?.personal ? (
                  <p style={{ color: '#eee', fontSize: '0.95rem', lineHeight: '1.4', margin: 0 }}>{deepDive.personal}</p>
                ) : (
                  <p style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>She needs more lore to give a personal take. Add entries in your Profile!</p>
                )}
              </div>
            </section>
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid #222' }}>
            <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#333', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>✕ CLOSE</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
