import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';

export default function ProveIt({ onClose }: { onClose: () => void }) {
  const vocabulary = useMasteryStore(s => s.vocabulary);
  const addProveItResponse = useMasteryStore(s => s.addProveItResponse);

  const [currentWord, setCurrentWord] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    pickWord();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickWord = () => {
    const candidates = [...vocabulary]
      .filter(v => v.type === 'word')
      .sort((a, b) => a.baseScore - b.baseScore);

    if (candidates.length > 0) {
      // Pick from the 10 lowest mastery words for variety + bias
      const limit = Math.min(candidates.length, 10);
      const idx = Math.floor(Math.random() * limit);
      setCurrentWord(candidates[idx].word);
    }
    setInput('');
    setShowSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentWord) return;

    addProveItResponse({
      word: currentWord,
      sentence: input.trim(),
      date: new Date().toISOString()
    });

    setShowSaved(true);
    setTimeout(() => {
      pickWord();
    }, 1500);
  };

  return (
    <div style={{ padding: '24px', background: 'var(--surface-opaque)', borderRadius: '8px', color: 'white', maxWidth: '400px', margin: '0 auto', border: '1px solid var(--border)', position: 'relative' }}>
      <button onClick={onClose} className="close-glyph">✕</button>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--gold)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>PROVE IT: QUICK DRILL</h3>
      <div style={{ fontSize: '2rem', fontWeight: 900, textAlign: 'center', margin: '24px 0', color: 'white' }}>
        {currentWord}
      </div>
      {showSaved ? (
        <div style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 'bold', padding: '20px 0' }}>
          Saved. jan Lina will review this next session.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Use "${currentWord}" in a sentence...`}
            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginBottom: '16px', boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button type="button" onClick={pickWord} style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid var(--border)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Skip Word</button>
            <button type="submit" disabled={!input.trim()} style={{ flex: 2, padding: '10px', background: 'var(--gold)', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', opacity: input.trim() ? 1 : 0.5 }}>Submit</button>
          </div>
        </form>
      )}
    </div>
  );
}
