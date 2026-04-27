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

const EVERYDAY_PHRASES: Record<string, { tp: string, en: string }[]> = {
  "Greetings": [
    { tp: "toki!", en: "Hello!" },
    { tp: "toki pona!", en: "Good day / Good morning!" },
    { tp: "mi tawa.", en: "I'm going. (Goodbye)" },
    { tp: "tawa pona!", en: "Go well. (Goodbye)" },
    { tp: "kama pona!", en: "Welcome!" }
  ],
  "Emotions": [
    { tp: "mi pilin pona.", en: "I feel good / happy." },
    { tp: "mi pilin ike.", en: "I feel bad / sad." },
    { tp: "mi pilin suwi.", en: "I feel sweet / lovely." },
    { tp: "mi pilin wawa.", en: "I feel strong / energetic." }
  ],
  "Common": [
    { tp: "pona.", en: "Good / Thanks / OK." },
    { tp: "ike.", en: "Bad / Oh no." },
    { tp: "mi sona.", en: "I know / I understand." },
    { tp: "mi sona ala.", en: "I don't know." },
    { tp: "sina pona.", en: "You are good / kind." }
  ],
  "Questions": [
    { tp: "seme li lon?", en: "What's up? / What is there?" },
    { tp: "sina pilin seme?", en: "How do you feel?" },
    { tp: "sina wile e seme?", en: "What do you want?" },
    { tp: "ni li seme?", en: "What is this?" }
  ]
};

export default function PhraseGrid({ onAskLina, activeFilter, selectedWords, focusPhraseId, clearFocusPhrase }: Props) {
  const { studentName, vocabulary, savedPhrases, updatePhraseNote, deletePhrase, albums } = useMasteryStore();
  const [activeTab, setActiveTab] = useState<'saves' | 'everyday' | 'discography'>('saves');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const safeSavedPhrases = savedPhrases || [];

  useEffect(() => {
    if (focusPhraseId) {
      setActiveTab('saves');
      setEditingId(focusPhraseId);
      const target = safeSavedPhrases.find(p => typeof p !== 'string' && p.id === focusPhraseId);
      setNoteInput(target && typeof target !== 'string' ? target.notes : '');
    }
  }, [focusPhraseId, safeSavedPhrases]);

  const normalizedSaved = safeSavedPhrases.map(p => 
    typeof p === 'string' ? { id: p, tp: p, en: `${studentName || 'Anthony'} Saved Phrase *`, notes: '' } : p
  );

  const handleLinasChoice = () => {
    let source: { tp: string, en: string }[] = [];
    if (activeTab === 'saves') source = normalizedSaved;
    else if (activeTab === 'everyday') source = Object.values(EVERYDAY_PHRASES).flat();
    else if (activeTab === 'discography') source = albums.flatMap(a => a.songs.flatMap(s => s.blocks));

    if (source.length === 0) return;
    const random = source[Math.floor(Math.random() * source.length)];
    onAskLina(`[SYSTEM: Lina's Choice Quiz. Phrase: "${random.tp}" (${random.en}). Ask the student to translate this or use it in a sentence.]`);
  };

  const filteredSaves = normalizedSaved.filter(p => {
    if (selectedWords.length > 0) {
      const ws = p.tp.split(' ').map(clean);
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }
    return true;
  });

  const getFilteredEveryday = (phrases: { tp: string, en: string }[]) => {
    return phrases.filter(p => {
      if (selectedWords.length > 0) {
        const ws = p.tp.split(' ').map(clean);
        if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
      }
      return true;
    });
  };

  return (
    <section className="phrase-grid">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px', border: '1px solid #222' }}>
          <button onClick={() => setActiveTab('saves')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'saves' ? 'var(--gold)' : 'transparent', color: activeTab === 'saves' ? 'black' : '#888', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>MY SAVES</button>
          <button onClick={() => setActiveTab('everyday')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'everyday' ? 'var(--gold)' : 'transparent', color: activeTab === 'everyday' ? 'black' : '#888', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>EVERYDAY</button>
          <button onClick={() => setActiveTab('discography')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: activeTab === 'discography' ? 'var(--gold)' : 'transparent', color: activeTab === 'discography' ? 'black' : '#888', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>DISCOGRAPHY</button>
        </div>
        
        <button onClick={handleLinasChoice} className="btn-review" style={{ margin: 0, padding: '8px 16px', fontSize: '0.65rem' }}>
          ✨ LINA'S CHOICE
        </button>
      </div>

      {activeTab === 'saves' && (
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {filteredSaves.length === 0 ? (
            <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>{selectedWords.length > 0 ? 'No saved phrases match your selection.' : 'No phrases saved yet.'}</p>
          ) : filteredSaves.map((p) => (
            <div key={p.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
              <div onClick={() => onAskLina(`[SYSTEM: Practice saved phrase: "${p.tp}"]`)} style={{ cursor: 'pointer' }}>
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
      )}

      {activeTab === 'everyday' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {Object.entries(EVERYDAY_PHRASES).map(([cat, phrases]) => {
            const filtered = getFilteredEveryday(phrases);
            if (filtered.length === 0 && selectedWords.length > 0) return null;
            return (
              <div key={cat}>
                <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>{cat}</h3>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                  {filtered.map((p, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => onAskLina(`[SYSTEM: Practice everyday phrase: "${p.tp}"]`)}>
                      <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{p.tp}</div>
                      <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'discography' && (
        <div style={{ display: 'grid', gap: '32px' }}>
          {albums.map((album) => (
            <div key={album.id}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase' }}>ALBUM: {album.title}</h3>
              <div style={{ display: 'grid', gap: '20px' }}>
                {album.songs.map((song) => (
                  <div key={song.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid #222' }}>
                    <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '12px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>{song.title}</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {song.blocks.map((block, bi) => (
                        <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>{block.type}</div>
                            <div style={{ color: '#eee', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{block.tp}</div>
                            <div style={{ color: '#666', fontSize: '0.75rem', fontStyle: 'italic' }}>{block.en}</div>
                          </div>
                          <button 
                            onClick={() => onAskLina(`[SYSTEM: Lyric Practice. Song: "${song.title}", ${block.type}: "${block.tp}". Explore the grammar and translation.]`)}
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
