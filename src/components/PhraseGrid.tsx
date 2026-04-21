import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onAskLina: (prompt: string) => void;
}

// Phrases pulled directly from your "Everyday Toki Pona" document
const PROGRESSIVE_PHRASES = [
  { id: 'p1', tp: "ale li pona.", en: "Everything is good." },
  { id: 'p2', tp: "ni li lili.", en: "That is small." },
  { id: 'p3', tp: "ni li musi.", en: "This is fun." },
  { id: 'p4', tp: "pali pona!", en: "Good work!" },
  { id: 'p5', tp: "sina wawa.", en: "You are strong." },
  { id: 'p6', tp: "ni li suli.", en: "This is big / important." },
  { id: 'p7', tp: "mi pilin ike.", en: "I feel bad." },
  { id: 'p8', tp: "sina sona mute.", en: "You know much (You are smart)." },
  { id: 'p9', tp: "sina pona tawa jan.", en: "You are good toward people (kind)." },
];

export default function PhraseGrid({ onAskLina }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);

  // Checks if every word in the phrase is at least 'introduced' (not ⬜)
  const isUnlocked = (tpPhrase: string) => {
    const cleanWords = tpPhrase.replace(/[.!?,]/g, '').toLowerCase().split(' ');
    return cleanWords.every(word => {
      const vocabItem = vocabulary.find(v => v.word === word);
      return vocabItem && vocabItem.status !== 'not_started';
    });
  };

  return (
    <section className="phrase-grid" style={{ marginTop: '40px' }}>
      <h2 className="section-title">
        PRACTICE PHRASES{' '}
        <span className="section-title__count">— UNLOCKS AS YOU LEARN</span>
      </h2>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {PROGRESSIVE_PHRASES.map(phrase => {
          const unlocked = isUnlocked(phrase.tp);
          return (
            <div 
              key={phrase.id} 
              style={{
                background: unlocked ? 'var(--surface)' : '#111',
                border: unlocked ? '1px solid #333' : '1px dashed #222',
                padding: '16px',
                borderRadius: '6px',
                opacity: unlocked ? 1 : 0.6,
                cursor: unlocked ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => unlocked && onAskLina(`toki Lina, let's discuss the phrase: "${phrase.tp}"`)}
            >
              <div style={{ fontWeight: 'bold', color: unlocked ? 'var(--text)' : '#444', marginBottom: '4px', fontSize: '1.1rem' }}>
                {unlocked ? phrase.tp : '???'}
              </div>
              <div style={{ fontSize: '0.85rem', color: unlocked ? 'var(--text-muted)' : '#333', fontStyle: 'italic' }}>
                {unlocked ? phrase.en : 'Learn more words to unlock'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
