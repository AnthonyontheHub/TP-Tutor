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
  const { vocabulary, savedPhrases, updatePhraseNote, deletePhrase } = useMasteryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const safeSavedPhrases = savedPhrases || [];

  useEffect(() => {
    if (focusPhraseId) {
      setEditingId(focusPhraseId);
      const target = safeSavedPhrases.find(p => typeof p !== 'string' && p.id === focusPhraseId);
      setNoteInput(target && typeof target !== 'string' ? target.notes : '');
    }
  }, [focusPhraseId, safeSavedPhrases]);

  const normalizedSaved = safeSavedPhrases.map(p => 
    typeof p === 'string' ? { id: p, tp: p, en: 'Anthony Saved Phrase *', notes: '' } : p
  );

  const combined = [
    ...PHRASES.map(p => ({ ...p, isSaved: false, id: p.tp, notes: '' })), 
    ...normalizedSaved.map(p => ({ ...p, isSaved: true }))
  ];

  const filtered = combined.filter(p => {
    if (!p.isSaved) {
      const ws = p.tp.split(' ').map(clean);
      const isKnown = ws.every(w => {
        const v = vocabulary.find(i => i.word === w);
        return v && v.status !== 'not_started';
      });
      if (!isKnown) return false;
    }

    if (selectedWords.length > 0) {
      const ws = p.tp.split(' ').map(clean);
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }
    
    if (activeFilter && !p.isSaved) {
      const ws = p.tp.split(' ').map(clean);
      if (!ws.some(w => vocabulary.find(i => i.word === w)?.status === activeFilter)) return false;
    }
    
    return true;
  });

  return (
    <section className="phrase-grid">
      <h2 className="section-title" style={{ marginBottom: '20px' }}>
        {selectedWords.length > 0 ? `SUGGESTED COMBINATIONS` : 'PRACTICE PHRASES'}
      </h2>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((p) => {
          const words = p.tp.split(' ');
          return (
            <div key={p.id} style={{ background: p.isSaved ? '#0f172a' : '#111', padding: '16px', borderRadius: '8px', border: p.isSaved ? '1px solid #3b82f6' : '1px solid #333' }}>
              <div onClick={() => onAskLina(`toki jan Lina! Let's practice: "${p.tp}"`)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {words.map((w, idx) => {
                    const cleanW = clean(w);
                    const vocab = vocabulary.find(v => v.word === cleanW);
                    const meaning = vocab?.meanings?.split(',')[0].trim() || '';
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.55rem', color: '#666', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1px' }}>{meaning}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: p.isSaved ? '#60a5fa' : '#fff' }}>{w}</div>
                      </div>
                    );
                  })}
                  {p.isSaved && <span style={{ color: '#60a5fa', fontWeight: 'bold', marginLeft: '4px' }}>*</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: p.isSaved ? '#94a3b8' : '#777', fontStyle: 'italic' }}>{p.en}</div>
              </div>
              {p.isSaved && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                  {p.notes && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px', padding: '6px', background: '#1e293b', borderRadius: '4px' }}>📝 {p.notes}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(p.id); setNoteInput(p.notes); }} className="btn-toggle" style={{ padding: '4px 8px', fontSize: '0.65rem', width: 'auto' }}>
                      {p.notes ? 'EDIT NOTE' : '+ NOTE'}
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this saved phrase?')) deletePhrase(p.id); }} className="btn-toggle" style={{ padding: '4px 8px', fontSize: '0.65rem', width: 'auto', background: '#7f1d1d' }}>
                      DELETE
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingId && (
        <div className="drawer-backdrop" onClick={() => { setEditingId(null); clearFocusPhrase?.(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#fff', marginBottom: '15px', marginTop: 0 }}>Phrase Note</h3>
            <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add context to this phrase..." style={{ width: '100%', height: '100px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', padding: '10px', marginBottom: '15px', resize: 'none', outline: 'none' }} autoFocus />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { updatePhraseNote(editingId, noteInput); setEditingId(null); clearFocusPhrase?.(); }} className="btn-review" style={{ margin: 0, flex: 2 }}>SAVE</button>
              <button onClick={() => { setEditingId(null); clearFocusPhrase?.(); }} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
