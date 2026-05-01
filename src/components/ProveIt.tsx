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
    const candidates = vocabulary.filter(w => w.status === 'introduced' || w.status === 'practicing');
    if (candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      setCurrentWord(candidates[idx].word);
    } else {
      setCurrentWord(null);
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

  if (!currentWord) {
    return (
      <div style={{ padding: '20px', background: 'var(--surface-opaque)', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
        <p>No words currently in "Introduced" or "Practicing" state. Learn some new words first!</p>
        <button type="button" onClick={onClose} style={{ marginTop: '12px', background: 'var(--gold)', color: 'black', padding: '8px 16px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: 'var(--surface-opaque)', borderRadius: '8px', color: 'white', maxWidth: '400px', margin: '0 auto', border: '1px solid var(--border)', position: 'relative' }}>
      <button type="button" onClick={onClose} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
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
