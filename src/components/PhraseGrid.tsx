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

export default function PhraseGrid({ onAskLina, selectedWords, focusPhraseId, clearFocusPhrase }: Props) {
  const { studentName, vocabulary, savedPhrases, updatePhraseNote, deletePhrase, albums, commonPhrases, reviewVibe } = useMasteryStore();
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
    typeof p === 'string' ? { id: p, tp: p, en: `${studentName || 'Anthony'} Saved Phrase *`, notes: '' } : p
  );

  const filteredSaves = normalizedSaved.filter(p => {
    if (selectedWords.length > 0) {
      const ws = p.tp.split(' ').map(clean);
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }
    return true;
  });

  const getFilteredPhrases = (phrases: { tp: string, en: string }[]) => {
    return phrases.filter(p => {
      if (selectedWords.length > 0) {
        const ws = p.tp.split(/[ \n]+/).map(clean);
        if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
      }
      return true;
    });
  };

  const isChill = reviewVibe === 'chill' || reviewVibe === null;
  const isDeep = reviewVibe === 'deep';
  const isIntense = reviewVibe === 'intense';

  return (
    <section className="phrase-grid">
      {/* Tab 1: My Saves */}
      {isChill && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>MY SAVES</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filteredSaves.length === 0 ? (
              <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>{selectedWords.length > 0 ? 'No saved phrases match your selection.' : 'No phrases saved yet.'}</p>
            ) : filteredSaves.map((p) => (
              <div key={p.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <div onClick={() => onAskLina(`Let's practice this specific phrase/lyric: [${p.tp}]`)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {p.tp.split(' ').map((w, idx) => {
                      const cleanW = clean(w);
                      const vocab = vocabulary.find(v => v.word === cleanW);
                      const meaning = vocab?.meanings?.split(',')[0].trim() || '';
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.55rem', color: '#666', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1px' }}>{meaning}</div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#60a5fa' }}>{w}</div>
                        </div>
                      );
                    })}
                    <span style={{ color: '#60a5fa', fontWeight: 'bold', marginLeft: '4px' }}>*</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>{p.en}</div>
                </div>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Everyday Library */}
      {isDeep && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>EVERYDAY LIBRARY</h2>
          <div style={{ display: 'grid', gap: '32px' }}>
            {Object.entries(commonPhrases || {}).map(([cat, phrases]) => {
              const filtered = getFilteredPhrases(phrases);
              if (filtered.length === 0 && selectedWords.length > 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>{cat}</h3>
                  <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {filtered.map((p, i) => (
                      <div key={i} className="glass-panel" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onAskLina(`Let's practice this specific phrase/lyric: [${p.tp}]`)}>
                        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{p.tp}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Discography */}
      {isIntense && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>DISCOGRAPHY</h2>
          <div style={{ display: 'grid', gap: '32px' }}>
            {(albums || []).map((album) => (
              <div key={album.id}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase' }}>ALBUM: {album.title}</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {album.songs.map((song) => (
                    <div key={song.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                      <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '12px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>{song.title}</h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {getFilteredPhrases(song.blocks).map((block, bi) => (
                          <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>{(block as any).type || 'verse'}</div>
                              <div style={{ color: '#eee', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px', whiteSpace: 'pre-wrap' }}>{block.tp}</div>
                              <div style={{ color: '#666', fontSize: '0.75rem', fontStyle: 'italic' }}>{block.en}</div>
                            </div>
                            <button 
                              onClick={() => onAskLina(`Let's practice this specific phrase/lyric: [${block.tp}]`)}
                              className="btn-toggle"
                              style={{ padding: '6px 10px', fontSize: '0.6rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}
                            >
                              PRACTICE THIS
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
