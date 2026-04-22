/* src/components/PhraseGrid.tsx */
import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  focusPhraseId?: string | null;
  clearFocusPhrase?: () => void;
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

export default function PhraseGrid({ onAskLina, activeFilter, selectedWords, focusPhraseId, clearFocusPhrase }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const savedPhrases = useMasteryStore((s) => s.savedPhrases);
  const updatePhraseNote = useMasteryStore((s) => s.updatePhraseNote);
  
  const [editingPhraseId, setEditingPhraseId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  useEffect(() => {
    if (focusPhraseId) {
      setEditingPhraseId(focusPhraseId);
      const p = savedPhrases.find(sp => typeof sp !== 'string' && sp.id === focusPhraseId);
      setNoteInput(p && typeof p !== 'string' ? p.notes || '' : '');
    }
  }, [focusPhraseId, savedPhrases]);

  const closeNoteModal = () => {
    setEditingPhraseId(null);
    if (clearFocusPhrase) clearFocusPhrase();
  };

  const saveNote = () => {
    if (editingPhraseId) {
      updatePhraseNote(editingPhraseId, noteInput);
    }
    closeNoteModal();
  };

  // Safe migration cast for old string saves
  const normalizedSaved = savedPhrases.map(p => 
    typeof p === 'string' ? { id: p, tp: p, en: 'User Saved Phrase *', notes: '' } : p
  );

  const combinedPhrases = [
    ...PHRASES.map(p => ({ ...p, isSaved: false, id: p.tp, notes: '' })),
    ...normalizedSaved.map(p => ({ ...p, isSaved: true }))
  ];

  const filtered = combinedPhrases.filter(p => {
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
    <section className="phrase-grid" style={{ marginTop: '10px', paddingBottom: '120px' }}>
      <h2 className="section-title">
        {selectedWords.length > 0 ? `SUGGESTED COMBINATIONS` : 'PRACTICE PHRASES'}
      </h2>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((p) => (
          <div 
            key={p.id} 
            style={{ 
              background: p.isSaved ? '#0f172a' : '#111', 
              padding: '16px', 
              borderRadius: '8px', 
              border: p.isSaved ? '1px solid #3b82f6' : '1px solid #333',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            <div onClick={() => onAskLina(`toki Lina, let's practice this specific phrase: "${p.tp}"`)} style={{ cursor: 'pointer' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: p.isSaved ? '#60a5fa' : '#fff' }}>
                {p.tp} {p.isSaved && '*'}
              </div>
              <div style={{ fontSize: '0.8rem', color: p.isSaved ? '#94a3b8' : '#777', fontStyle: 'italic' }}>
                {p.en}
              </div>
            </div>

            {p.isSaved && (
              <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                {p.notes && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '10px', padding: '8px', background: '#1e293b', borderRadius: '6px' }}>📝 "{p.notes}"</div>}
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingPhraseId(p.id); setNoteInput(p.notes || ''); }} 
                  className="btn-toggle" 
                  style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto', background: '#1e293b' }}
                >
                  {p.notes ? 'EDIT NOTE' : '+ ADD NOTE'}
                </button>
              </div>
            )}
          </div>
        ))}

        {selectedWords.length > 1 && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '20px', border: '1px dashed #444', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            Lina can help you turn these {selectedWords.length} words into a valid sentence.
          </div>
        )}
      </div>

      {editingPhraseId && (
        <div className="drawer-backdrop" onClick={closeNoteModal} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, color: '#fff', marginBottom: '15px' }}>Phrase Note</h3>
            <textarea 
              value={noteInput} 
              onChange={e => setNoteInput(e.target.value)}
              placeholder="Why did you save this phrase? Add context..."
              style={{ width: '100%', height: '120px', padding: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', marginBottom: '20px', resize: 'none', outline: 'none' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveNote} className="btn-review" style={{ margin: 0, flex: 2, padding: '12px' }}>SAVE NOTE</button>
              <button onClick={closeNoteModal} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
