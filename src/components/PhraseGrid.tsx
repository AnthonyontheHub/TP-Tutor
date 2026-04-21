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
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const filtered = PHRASES.filter(p => {
    const ws = p.tp.split(' ').map(clean);
    const isKnown = ws.every(w => {
      const v = vocabulary.find(i => i.word === w);
      return v && v.status !== 'not_started';
    });
    if (!isKnown) return false;
    if (selectedWords.length > 0) return selectedWords.every(sw => ws.includes(clean(sw)));
    if (activeFilter) return ws.some(w => vocabulary.find(i => i.word === w)?.status === activeFilter);
    return true;
  });

  return (
    <section className="phrase-grid" style={{ marginTop: '30px', paddingBottom: '120px' }}>
      <h2 className="section-title">
        {selectedWords.length > 0 ? `SUGGESTED COMBINATIONS` : 'PRACTICE PHRASES'}
      </h2>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((p, i) => (
          <div key={i} onClick={() => onAskLina(`toki Lina, let's practice this specific phrase: "${p.tp}"`)} style={{ cursor: 'pointer', background: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{p.tp}</div>
            <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
          </div>
        ))}
        {selectedWords.length > 1 && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '20px', border: '1px dashed #444', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            Lina can help you turn these {selectedWords.length} words into a valid sentence.
          </div>
        )}
      </div>
    </section>
  );
}
