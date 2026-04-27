/* src/components/PhraseGrid.tsx */
import React, { useState, useMemo, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus, CommonPhrase } from '../types/mastery';
import { phraseData } from '../data/phraseData';
import type { Phrase, PhraseCategory } from '../data/phraseData';
import PhraseCard from './PhraseCard';

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
  
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState<PhraseCategory | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isPhraseCardOpen, setIsPhraseCardOpen] = useState<boolean>(false);

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
        <div style={{ padding: '0 4px' }}>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>MY SAVES</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredSaves.length === 0 ? (
              <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed #333' }}>
                {selectedWords && selectedWords.length > 0 ? 'No saved phrases match your selection.' : 'No phrases saved yet.'}
              </p>
            ) : filteredSaves.map((p) => (
              <div key={p.id} style={{ background: '#0a0a0a', padding: '18px', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ cursor: 'default' }}> 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {(p.tp || '').split(' ').map((w, idx) => {
                      const cleanW = clean(w);
                      const vocab = (vocabulary || []).find(v => v.word === cleanW);
                      const meaning = vocab?.meanings?.split(',')[0].trim() || '';
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div style={{ fontSize: '0.55rem', color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px', opacity: 0.6 }}>{meaning}</div>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fff' }}>{w}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>{p.en}</div>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                  {p.notes && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '12px', padding: '10px', background: '#1e293b', borderRadius: '8px', borderLeft: '3px solid var(--gold)' }}>📝 {p.notes}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditingId(p.id); setNoteInput(p.notes); }} className="btn-toggle" style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      {p.notes ? 'EDIT NOTE' : '+ NOTE'}
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this saved phrase?')) deletePhrase(p.id); }} className="btn-toggle" style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '6px' }}>
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
        <div style={{ padding: '0 4px' }}>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '24px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>EVERYDAY ARCHIVE</h2>
          
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--gold)' }}>✦</span> TOKI PONA PHRASES
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '24px', lineHeight: '1.6', maxWidth: '800px' }}>
              {phraseData[0].contextParagraph}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {phraseData.map((category) => {
                const filteredPhrases = filterPhrasesBySelectedWords(category.phrases);
                if (filteredPhrases.length === 0 && selectedWords && selectedWords.length > 0) return null;
                return (
                  <div key={category.title} className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>{category.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>{category.contextParagraph}</p>
                    </div>
                    <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {(filteredPhrases || []).map((phrase, i) => (
                        <div 
                          key={i} 
                          className="glass-panel" 
                          style={{ padding: '16px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }} 
                          onClick={() => handlePhraseClick(category, phrase)}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gold)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                        >
                          <div style={{ fontWeight: 800, color: '#fff', marginBottom: '6px', fontSize: '1rem' }}>{phrase.english}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600, opacity: 0.8 }}>{phrase.tokiPona}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #222', paddingTop: '40px', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--gold)' }}>✦</span> COMMON USAGE ARCHIVE
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '24px', lineHeight: '1.6' }}>
              Explore common Toki Pona phrases used in daily life, organized into categories for easy learning.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}> 
              {Object.entries(groupedCommonPhrases).map(([cat, phrases]) => {
                const filtered = filterPhrasesBySelectedWords(phrases);
                if (filtered.length === 0 && selectedWords && selectedWords.length > 0) return null;
                return (
                  <div key={cat}>
                    <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#555', letterSpacing: '0.1em', marginBottom: '16px', textTransform: 'uppercase' }}>{cat}</h4>
                    <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                      {(filtered || []).map((p, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '20px', background: 'rgba(5,5,5,0.4)', border: '1px solid #222', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ fontWeight: 800, color: '#eee', marginBottom: '6px', fontSize: '1.05rem' }}>{p.tp}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic', marginBottom: '16px' }}>{p.en}</div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAskLina(`Let's practice this common phrase: [${p.tp}]`); }}
                            className="btn-toggle"
                            style={{ padding: '8px 14px', fontSize: '0.65rem', width: 'auto', background: 'var(--gold)', color: '#000', fontWeight: 900, borderRadius: '4px' }}
                          >
                            PRACTICE
                          </button>
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
        <div style={{ padding: '0 4px' }}>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>DISCOGRAPHY</h2>
          {!selectedAlbumId ? (
             <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
               {safeSongs.length === 0 ? (
                 <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed #333' }}>
                   No albums found in discography.
                 </p>
               ) : safeSongs.map(album => (
                 <button 
                  key={album.id}
                  onClick={() => setSelectedAlbumId(album.id)}
                  className="glass-panel"
                  style={{ padding: '32px 24px', textAlign: 'center', cursor: 'pointer', border: '1px solid #222', background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)', borderRadius: '16px' }}
                 >
                   <div style={{ fontSize: '2.5rem', marginBottom: '16px', filter: 'drop-shadow(0 0 10px var(--gold-glow))' }}>💿</div>
                   <div style={{ fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.9rem' }}>{album.title}</div>
                 </button>
               ))}
             </div>
          ) : !selectedTrackTitle ? (
            <div>
              <button onClick={() => setSelectedAlbumId(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>‹</span> BACK TO ALBUMS
              </button>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '24px', textTransform: 'uppercase' }}>TRACKLIST: {safeSongs.find(a => a.id === selectedAlbumId)?.title}</h3>
              <div style={{ display: 'grid', gap: '12px', maxWidth: '600px' }}>
                {safeSongs.find(a => a.id === selectedAlbumId)?.tracks?.map((track: any, idx: number) => (
                  <button 
                    key={track.title} 
                    onClick={() => setSelectedTrackTitle(track.title)}
                    className="glass-panel"
                    style={{ padding: '18px 24px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #1a1a1a', background: 'rgba(10,10,10,0.6)' }}
                  >
                    <span style={{ color: '#444', fontWeight: 900, fontSize: '0.8rem' }}>0{idx+1}</span>
                    <span style={{ color: 'white', fontWeight: 800, letterSpacing: '0.02em' }}>{track.title.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
               <button onClick={() => setSelectedTrackTitle(null)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <span style={{ fontSize: '1.2rem' }}>‹</span> BACK TO TRACKLIST
               </button>
               {(() => {
                 const album = safeSongs.find(a => a.id === selectedAlbumId);
                 const track = (album?.tracks || []).find((t: any) => t.title === selectedTrackTitle);
                 if (!track) return null;
                 
                 // If selected words are active, filter blocks. If not, show all.
                 const blocks = track.blocks || [];
                 const filteredBlocks = (selectedWords && selectedWords.length > 0)
                   ? blocks.filter((b: any) => {
                       const ws = (b.tp || '').split(/[ \/]+/).map(clean);
                       return selectedWords.every(sw => ws.includes(clean(sw)));
                     })
                   : blocks;

                 return (
                   <div style={{ background: 'rgba(5,5,5,0.8)', padding: '32px', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                     <h4 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '32px', borderLeft: '6px solid var(--gold)', paddingLeft: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{track.title}</h4>
                     <div style={{ display: 'grid', gap: '20px' }}>
                        {filteredBlocks.length > 0 ? filteredBlocks.map((block: any, bi: number) => (
                          <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '10px', opacity: 0.6 }}>{block.title || 'BLOCK'}</div>
                              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.5', letterSpacing: '0.01em' }}>{block.tp}</div>
                              <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.4' }}>{block.en}</div>
                            </div>
                            <button 
                              onClick={() => onAskLina(`Let's practice this lyric: [${block.tp}]`)}
                              className="btn-toggle"
                              style={{ padding: '10px 16px', fontSize: '0.7rem', width: 'auto', background: 'rgba(255,255,255,0.05)', fontWeight: 800, borderRadius: '8px' }}
                            >
                              PRACTICE
                            </button>
                          </div>
                        )) : (
                          <p style={{ color: '#444', textAlign: 'center', padding: '40px' }}>
                            {selectedWords && selectedWords.length > 0 ? 'No lyrics match your selection.' : 'Lyrics integration pending...'}
                          </p>
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
          <div onClick={e => e.stopPropagation()} style={{ background: '#0a0a0a', padding: '32px', borderRadius: '24px', width: '90%', maxWidth: '450px', border: '1px solid #222', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', marginTop: 0, fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phrase Note</h3>
            <textarea 
              value={noteInput} 
              onChange={e => setNoteInput(e.target.value)} 
              placeholder="Add context to this phrase..." 
              style={{ width: '100%', height: '140px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '12px', padding: '16px', marginBottom: '24px', resize: 'none', outline: 'none', fontSize: '1rem', lineHeight: '1.5' }} 
              autoFocus 
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { updatePhraseNote(editingId, noteInput); setEditingId(null); clearFocusPhrase?.(); }} className="btn-review" style={{ margin: 0, flex: 2, height: '50px' }}>SAVE NOTE</button>
              <button onClick={() => { setEditingId(null); clearFocusPhrase?.(); }} className="btn-toggle" style={{ flex: 1, height: '50px', background: 'rgba(255,255,255,0.05)' }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
