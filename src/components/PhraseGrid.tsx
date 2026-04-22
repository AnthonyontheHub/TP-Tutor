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
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const savedPhrases = useMasteryStore((s) => s.savedPhrases);
  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  // Combine hardcoded phrases with user-saved phrases
  const combinedPhrases = [
    ...PHRASES,
    ...savedPhrases.map(phrase => ({ 
      tp: phrase, 
      en: "User Saved Phrase *" 
    }))
  ];

  const filtered = combinedPhrases.filter(p => {
    const ws = p.tp.split(' ').map(clean);
    
    // Check if the user knows all the words in the phrase
    const isKnown = ws.every(w => {
      const v = vocabulary.find(i => i.word === w);
      return v && v.status !== 'not_started';
    });
    
    if (!isKnown) return false;
    
    // If words are selected in the builder, only show phrases containing ALL selected words
    if (selectedWords.length > 0) return selectedWords.every(sw => ws.includes(clean(sw)));
    
    // If a mastery filter is active, only show phrases containing AT LEAST ONE word of that status
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
          <div 
            key={i} 
            onClick={() => onAskLina(`toki Lina, let's practice this specific phrase: "${p.tp}"`)} 
            style={{ 
              cursor: 'pointer', 
              background: p.en.includes('*') ? '#0f172a' : '#111', // Slight blue tint for saved phrases
              padding: '16px', 
              borderRadius: '8px', 
              border: p.en.includes('*') ? '1px solid #3b82f6' : '1px solid #333' 
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: p.en.includes('*') ? '#60a5fa' : '#fff' }}>
              {p.tp} {p.en.includes('*') && '*'}
            </div>
            <div style={{ fontSize: '0.8rem', color: p.en.includes('*') ? '#94a3b8' : '#777', fontStyle: 'italic' }}>
              {p.en}
            </div>
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
