/* src/components/WordDetailDrawer.tsx */
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
  not_started: '#374151',
  introduced:  'var(--blue)',
  practicing:  'var(--amber)',
  confident:   '#16a34a',
  mastered:    'var(--gold)',
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
              <div className="progress-bar-track" style={{ height: '10px', background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${tierProgress(word.confidenceScore ?? 0, word.status) * 100}%`,
                    background: NEXT_COLOR[word.status],
                    boxShadow: `0 0 15px ${NEXT_COLOR[word.status]}44`
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 900 }}>{word.confidenceScore} NEURAL PTS</span>
                {word.status !== 'mastered' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    NEXT SYNC: {STATUS_META[NEXT_STATUS[word.status]!].label.toUpperCase()}
                  </span>
                )}
              </div>
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

            <section style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ fontSize: '0.6rem' }}>Neural Examples</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Simple', 'Intermediate', 'Advanced'].map((tier) => {
                  const content = deepDive?.[tier.toLowerCase()];
                  return (
                    <div key={tier} className="glass-panel" style={{ padding: '10px 15px', borderLeft: `2px solid ${tier === 'Simple' ? 'var(--blue)' : tier === 'Intermediate' ? 'var(--amber)' : 'var(--pink)'}` }}>
                      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>{tier}</div>
                      {isLoading ? <div style={{ height: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', width: '80%' }} /> : <div style={{ fontSize: '0.85rem', color: '#eee', lineHeight: '1.4' }}>{content || '...'}</div>}
                    </div>
                  );
                })}
              </div>
            </section>

            <button onClick={onClose} className="btn-review" style={{ margin: 0, width: '100%', background: 'var(--surface-2)', color: 'white', boxShadow: 'none', border: '1px solid var(--border)' }}>CLOSE TERMINAL</button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
