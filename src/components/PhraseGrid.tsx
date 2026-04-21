import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
}

// Phrases sourced from "Everyday Toki Pona"
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
    
    // Hide if user hasn't introduced all words in the phrase
    const isKnown = ws.every(w => {
      const v = vocabulary.find(i => i.word === w);
      return v && v.status !== 'not_started';
    });
    if (!isKnown) return false;

    // Multi-select: Phrase must contain ALL selected words
    if (selectedWords.length > 0) {
      return selectedWords.every(sw => ws.includes(clean(sw)));
    }

    // Status filter: Phrase must contain at least one word of that status
    if (activeFilter) {
      return ws.some(w => vocabulary.find(i => i.word === w)?.status === activeFilter);
    }

    return true;
  });

  return (
    <section className="phrase-grid" style={{ marginTop: '30px', paddingBottom: '50px' }}>
      <h2 className="section-title">
        {selectedWords.length > 0 ? `PHRASES WITH ${selectedWords.join(' + ').toUpperCase()}` : 'PRACTICE PHRASES'}
      </h2>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((p, i) => (
          <div 
            key={i} 
            onClick={() => onAskLina(`toki Lina, let's practice: "${p.tp}"`)} 
            style={{ cursor: 'pointer', background: '#111', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{p.tp}</div>
            <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
