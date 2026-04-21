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
  { tp: "sina sona mute.", en: "You are smart." }
];

export default function PhraseGrid({ onAskLina, activeFilter, selectedWords }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const filtered = PHRASES.filter(p => {
    const ws = p.tp.split(' ').map(clean);
    const known = ws.every(w => {
      const v = vocabulary.find(i => i.word === w);
      return v && v.status !== 'not_started';
    });
    if (!known) return false;
    if (selectedWords.length > 0) return selectedWords.every(sw => ws.includes(clean(sw)));
    if (activeFilter) return ws.some(w => vocabulary.find(i => i.word === w)?.status === activeFilter);
    return true;
  });

  return (
    <section className="phrase-grid">
      <h2 className="section-title">PHRASES — {selectedWords.length > 0 ? selectedWords.join(' + ').toUpperCase() : 'PRACTICE'}</h2>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {filtered.map((p, i) => (
          <div key={i} onClick={() => onAskLina(p.tp)} style={{ cursor: 'pointer', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ fontWeight: 'bold' }}>{p.tp}</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>{p.en}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
