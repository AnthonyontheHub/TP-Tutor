import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
}

const ALL_PHRASES = [
  { id: 'p1', tp: "ale li pona.", en: "Everything is good." },
  { id: 'p2', tp: "ni li lili.", en: "That is small." },
  { id: 'p3', tp: "ni li musi.", en: "This is fun." },
  { id: 'p4', tp: "pali pona!", en: "Good work!" },
  { id: 'p5', tp: "sina wawa.", en: "You are strong." },
  { id: 'p6', tp: "ni li suli.", en: "This is important." },
  { id: 'p7', tp: "mi pilin ike.", en: "I feel bad." },
  { id: 'p8', tp: "sina sona mute.", en: "You are smart." },
  { id: 'p9', tp: "sina pona tawa jan.", en: "You are kind." },
];

export default function PhraseGrid({ onAskLina, activeFilter }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);

  // Helper: Get words at or ABOVE a certain mastery level
  const isWordKnown = (word: string) => {
    const v = vocabulary.find(item => item.word === word.toLowerCase().replace(/[.!?,]/g, ''));
    if (!v) return false;
    // For general unlock, anything not 'not_started' works
    return v.status !== 'not_started';
  };

  const phrases = ALL_PHRASES.filter(phrase => {
    const words = phrase.tp.split(' ');
    const allWordsKnown = words.every(w => isWordKnown(w));
    
    // If filter is active, only show phrases containing at least one word of that status
    if (activeFilter) {
      const hasFilteredWord = words.some(w => {
        const v = vocabulary.find(item => item.word === w.toLowerCase().replace(/[.!?,]/g, ''));
        return v?.status === activeFilter;
      });
      return allWordsKnown && hasFilteredWord;
    }
    
    return allWordsKnown;
  });

  return (
    <section className="phrase-grid" style={{ marginTop: '40px' }}>
      <h2 className="section-title">
        PRACTICE PHRASES {activeFilter ? `USING ${activeFilter.toUpperCase()} WORDS` : ''}
      </h2>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {phrases.map(phrase => (
          <div 
            key={phrase.id} 
            className="example-box"
            onClick={() => onAskLina(`toki Lina, let's practice this: "${phrase.tp}"`)}
            style={{ 
              cursor: 'pointer', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid #333' 
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{phrase.tp}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{phrase.en}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
