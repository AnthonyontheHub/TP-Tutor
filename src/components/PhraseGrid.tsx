import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
  selectedWords: string[]; // NEW
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

export default function PhraseGrid({ onAskLina, activeFilter, selectedWords }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const phrases = ALL_PHRASES.filter(phrase => {
    const wordsInPhrase = phrase.tp.split(' ').map(clean);
    
    // 1. Basic Knowledge Check (Hide phrases with words user hasn't seen)
    const allWordsKnown = wordsInPhrase.every(w => {
        const v = vocabulary.find(item => item.word === w);
        return v && v.status !== 'not_started';
    });
    if (!allWordsKnown) return false;

    // 2. Multi-Select Filter (If words are selected, phrase MUST contain ALL of them)
    if (selectedWords.length > 0) {
      const matchesAllSelected = selectedWords.every(sw => wordsInPhrase.includes(clean(sw)));
      if (!matchesAllSelected) return false;
    }

    // 3. Status Filter (Yellow, Green, etc.)
    if (activeFilter) {
      return wordsInPhrase.some(w => {
        const v = vocabulary.find(item => item.word === w);
        return v?.status === activeFilter;
      });
    }
    
    return true;
  });

  return (
    <section className="phrase-grid" style={{ marginTop: '40px', paddingBottom: '40px' }}>
      <h2 className="section-title">
        {selectedWords.length > 0 
          ? `PHRASES WITH: ${selectedWords.join(' + ').toUpperCase()}` 
          : 'PRACTICE PHRASES'}
      </h2>
      
      {phrases.length === 0 ? (
        <div style={{ color: '#555', fontStyle: 'italic', padding: '20px', border: '1px dashed #333', textAlign: 'center' }}>
          No phrases found using that combination of words.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {phrases.map(phrase => (
            <div 
              key={phrase.id} 
              onClick={() => onAskLina(`toki Lina, let's practice this: "${phrase.tp}"`)}
              style={{ cursor: 'pointer', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{phrase.tp}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{phrase.en}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
