/* src/components/PhraseGrid.tsx */
import React, { useState, useMemo, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus, CommonPhrase } from '../types/mastery'; // Keep CommonPhrase for Everyday Archive
import { phraseData } from '../data/phraseData'; // Import only the data value
import type { Phrase, PhraseCategory } from '../data/phraseData'; // Import types separately
import PhraseCard from './PhraseCard'; // Import the new PhraseCard component

interface Props {
  onAskLina: (prompt: string) => void;
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  focusPhraseId?: string | null;
  clearFocusPhrase?: () => void;
}

export default function PhraseGrid({ onAskLina, selectedWords, focusPhraseId, clearFocusPhrase }: Props) {
  const { studentName, vocabulary, savedPhrases, updatePhraseNote, deletePhrase, commonPhrases, reviewVibe, songs } = useMasteryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // State for PhraseCard modal
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState<PhraseCategory | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isPhraseCardOpen, setIsPhraseCardOpen] = useState<boolean>(false);

  // For Discography
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedTrackTitle, setSelectedTrackTitle] = useState<string | null>(null);

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const safeSavedPhrases = savedPhrases || [];
  const safeSongs = Array.isArray(songs) ? songs : [];

  useEffect(() => {
    if (focusPhraseId) {
      setEditingId(focusPhraseId);
      const target = safeSavedPhrases.find(p => typeof p !== 'string' && p.id === focusPhraseId);
      setNoteInput(target && typeof target !== 'string' ? target.notes : '');
    }
  }, [focusPhraseId, safeSavedPhrases]);

  const normalizedSaved = (safeSavedPhrases || []).map(p => 
    typeof p === 'string' ? { id: p, tp: p, en: `${studentName || 'Anthony'} Saved Phrase *`, notes: '' } : p
  );

  const filteredSaves = normalizedSaved.filter(p => {
    if (selectedWords && selectedWords.length > 0) {
      const ws = (p.tp || '').split(' ').map(clean);
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }
    return true;
  });

  const groupedCommonPhrases = useMemo(() => {
    const groups: Record<string, CommonPhrase[]> = {};
    (Array.isArray(commonPhrases) ? commonPhrases : []).forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [commonPhrases]);

  const filterPhrasesBySelectedWords = (phrases: { tokiPona: string, english: string }[]) => {
    if (!selectedWords || selectedWords.length === 0) {
      return phrases;
    }
    return phrases.filter(p => {
      const ws = (p.tokiPona || '').split(/[ \/]+/).map(clean);
      return selectedWords.every(sw => ws.includes(clean(sw)));
    });
  };

  const handlePhraseClick = (category: PhraseCategory, phrase: Phrase) => {
    setSelectedPhraseCategory(category);
    setSelectedPhrase(phrase);
    setIsPhraseCardOpen(true);
  };

  const handleClosePhraseCard = () => {
    setIsPhraseCardOpen(false);
    setSelectedPhrase(null);
    setSelectedPhraseCategory(null);
  };

  const isChill = reviewVibe === 'chill' || reviewVibe === null;
  const isDeep = reviewVibe === 'deep'; 
  const isIntense = reviewVibe === 'intense';

  return (
    <section className="phrase-grid">
      {isChill && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>MY SAVES</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filteredSaves.length === 0 ? (
              <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>{selectedWords && selectedWords.length > 0 ? 'No saved phrases match your selection.' : 'No phrases saved yet.'}</p>
            ) : filteredSaves.map((p) => (
              <div key={p.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <div style={{ cursor: 'default' }}> 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {(p.tp || '').split(' ').map((w, idx) => {
                      const cleanW = clean(w);
                      const vocab = (vocabulary || []).find(v => v.word === cleanW);
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

      {isDeep && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>EVERYDAY ARCHIVE</h2>
          <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '20px', fontStyle: 'italic' }}>
            Explore common Toki Pona phrases used in daily life, organized into categories for easy learning.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}> 
            {Object.entries(groupedCommonPhrases).map(([cat, phrases]) => {
              const filtered = filterPhrasesBySelectedWords(phrases);
              if (filtered.length === 0 && selectedWords && selectedWords.length > 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>{cat}</h3>
                  <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {(filtered || []).map((p, i) => (
                      <div key={i} className="glass-panel" style={{ padding: '16px', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{p.tp}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAskLina(`Let's practice this common phrase: [${p.tp}]`); }}
                          className="btn-toggle"
                          style={{ marginTop: '12px', padding: '6px 10px', fontSize: '0.6rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}
                        >
                          PRACTICE THIS
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>TOKI PONA PHRASES</h3>
            <p style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '16px' }}>{phraseData[0].contextParagraph}</p> 
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {phraseData.map((category) => {
                const filteredPhrases = filterPhrasesBySelectedWords(category.phrases);
                if (filteredPhrases.length === 0 && selectedWords && selectedWords.length > 0) return null;
                return (
                  <div key={category.title}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px' }}>{category.title}</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(filteredPhrases || []).map((phrase, i) => (
                        <div 
                          key={i} 
                          className="glass-panel" 
                          style={{ padding: '16px', cursor: 'pointer' }} 
                          onClick={() => handlePhraseClick(category, phrase)}
                        >
                          <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{phrase.english}</div>
                          <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{phrase.tokiPona}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {isIntense && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>DISCOGRAPHY</h2>
          {!selectedAlbumId ? (
             <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
               {safeSongs.map(album => (
                 <button 
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="glass-panel"
                  style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', border: '1px solid #333' }}
                 >
                   <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💿</div>
                   <div style={{ fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{album.title}</div>
                 </button>
               ))}
             </div>
          ) : !selectedTrackTitle ? (
            <div>
              <button onClick={() => setSelectedAlbumId(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', marginBottom: '16px' }}>← BACK TO ALBUMS</button>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '16px', textTransform: 'uppercase' }}>TRACKLIST: {safeSongs.find(a => a.id === selectedAlbumId)?.title}</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {safeSongs.find(a => a.id === selectedAlbumId)?.tracks?.map((track: any) => (
                  <button 
                    key={track.title} 
                    onClick={() => setSelectedTrackTitle(track.title)}
                    className="glass-panel"
                    style={{ padding: '16px 24px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                  >
                    <span style={{ color: '#555', fontWeight: 900, fontSize: '0.8rem' }}>♪</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>{track.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
               <button onClick={() => setSelectedTrackTitle(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', marginBottom: '16px' }}>← BACK TO TRACKLIST</button>
               {(() => {
                 const album = safeSongs.find(a => a.id === selectedAlbumId);
                 const track = (album?.tracks || []).find((t: any) => t.title === selectedTrackTitle);
                 if (!track) return null;
                 const filteredBlocks = filterPhrasesBySelectedWords(track.blocks.map((b: any) => ({ tokiPona: b.tp, english: b.en })));
                 return (
                   <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid #222' }}>
                     <h4 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '16px' }}>{track.title}</h4>
                     <div style={{ display: 'grid', gap: '16px' }}>
                        {track.blocks && track.blocks.length > 0 ? track.blocks.map((block: any, bi: number) => (
                          <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid #333' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '6px' }}>{block.title || 'BLOCK'}</div>
                              <div style={{ color: '#eee', fontWeight: 700, fontSize: '1rem', marginBottom: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{block.tp}</div>
                              <div style={{ color: '#666', fontSize: '0.8rem', fontStyle: 'italic' }}>{block.en}</div>
                            </div>
                            <button 
                              onClick={() => onAskLina(`Let's practice this specific lyric: [${block.tp}]`)}
                              className="btn-toggle"
                              style={{ padding: '8px 12px', fontSize: '0.65rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}
                            >
                              PRACTICE THIS
                            </button>
                          </div>
                        )) : (
                          <p style={{ color: '#555', textAlign: 'center', padding: '20px' }}>Coming Soon...</p>
                        )}
                     </div>
                   </div>
                 );
               })()}
            </div>
          )}
        </div>
      )}

      {isPhraseCardOpen && selectedPhraseCategory && selectedPhrase && (
        <PhraseCard
          phraseCategory={selectedPhraseCategory}
          phrase={selectedPhrase}
          onClose={handleClosePhraseCard}
        />
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
