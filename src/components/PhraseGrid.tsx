/* src/components/PhraseGrid.tsx */
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
}

const PHRASES = [
  { tp: "ale li pona.", en: "Everything is good." },
  { tp: "ni li lili.", en: "That is small." },
  { tp: "sina wawa.", en: "You are strong." },
  { tp: "pali pona!", en: "Good work!" },
  { tp: "mi pilin ike.", en: "I feel bad." },
  { tp: "sina sona mute.", en: "You are smart." },
  { tp: "sina pona tawa jan.", en: "You are kind." }
];

export default function PhraseGrid({ onAskLina, activeFilter, selectedWords }: Props) {
  const vocabulary = useMasteryStore(s => s.vocabulary);

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const filtered = PHRASES.filter(p => {
    const ws = p.tp.split(' ').map(clean);
    const isKnown = ws.every(w => {
      const v = vocabulary.find(i => i.word === w);
      return v && v.status !== 'not_started';
    });
    if (!isKnown) return false;

    if (selectedWords.length > 0) {
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }

    if (activeFilter) {
      if (!ws.some(w => vocabulary.find(i => i.word === w)?.status === activeFilter)) return false;
    }

    return true;
  });

  return (
    <section className="phrase-grid">
      <h2 className="section-title" style={{ marginBottom: '20px' }}>
        {selectedWords.length > 0 ? 'SUGGESTED COMBINATIONS' : 'PRACTICE PHRASES'}
      </h2>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((p) => (
          <div
            key={p.tp}
            style={{ background: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}
            onClick={() => onAskLina(`Let's practice: "${p.tp}"`)}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fff', cursor: 'pointer' }}>{p.tp}</div>
            <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: '#555', fontStyle: 'italic' }}>No matching phrases yet. Keep learning words!</p>
        )}
      </div>
    </section>
  );
}
