/* src/components/Discography.tsx */
import React, { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { Song, SongBlock } from '../types/discography';

interface Props {
  onAskLina: (prompt: string) => void;
  selectedWords?: string[];
}

export default function Discography({ onAskLina, selectedWords = [] }: Props) {
  const { songs } = useMasteryStore();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedTrackTitle, setSelectedTrackTitle] = useState<string | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<SongBlock[]>([]);

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');
  const safeSongs = Array.isArray(songs) ? songs : [];

  const toggleBlock = (block: SongBlock) => {
    if (selectedBlocks.some(b => b.tp === block.tp && b.en === block.en)) {
      setSelectedBlocks(selectedBlocks.filter(b => !(b.tp === block.tp && b.en === block.en)));
    } else {
      setSelectedBlocks([...selectedBlocks, block]);
    }
  };

  const handlePracticeSelected = () => {
    if (selectedBlocks.length === 0) return;
    const combinedLyrics = selectedBlocks.map(b => `[${b.tp}]`).join('\n');
    onAskLina(`Let's practice these combined lyrics from the discography:\n${combinedLyrics}`);
    setSelectedBlocks([]);
  };

  return (
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
            {safeSongs.find(a => a.id === selectedAlbumId)?.songs?.map((track: Song, idx: number) => (
              <button 
                key={track.title} 
                onClick={() => { setSelectedTrackTitle(track.title); setSelectedBlocks([]); }}
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
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <button onClick={() => { setSelectedTrackTitle(null); setSelectedBlocks([]); }} style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ fontSize: '1.2rem' }}>‹</span> BACK TO TRACKLIST
             </button>
             {selectedBlocks.length > 0 && (
               <button 
                onClick={handlePracticeSelected}
                className="btn-review"
                style={{ margin: 0, padding: '10px 20px', fontSize: '0.75rem', fontWeight: 900, background: 'var(--gold)', color: '#000' }}
               >
                 PRACTICE SELECTED ({selectedBlocks.length})
               </button>
             )}
           </div>
           
           {(() => {
             const album = safeSongs.find(a => a.id === selectedAlbumId);
             const track = (album?.songs || []).find((t: Song) => t.title === selectedTrackTitle);
             if (!track) return null;
             
             // If selected words are active, filter blocks. If not, show all.
             const blocks = track.blocks || [];
             const filteredBlocks = (selectedWords && selectedWords.length > 0)
               ? blocks.filter((b: SongBlock) => {
                   const ws = (b.tp || '').split(/[ /]+/).map(clean);
                   return selectedWords.every(sw => ws.includes(clean(sw)));
                 })
               : blocks;

             return (
               <div style={{ background: 'rgba(5,5,5,0.8)', padding: '32px', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                 <h4 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '32px', borderLeft: '6px solid var(--gold)', paddingLeft: '20px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{track.title}</h4>
                 <div style={{ display: 'grid', gap: '20px' }}>
                    {filteredBlocks.length > 0 ? filteredBlocks.map((block: SongBlock, bi: number) => {
                      const isSelected = selectedBlocks.some(b => b.tp === block.tp && b.en === block.en);
                      return (
                        <div 
                          key={bi} 
                          onClick={() => toggleBlock(block)}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            background: isSelected ? 'rgba(var(--gold-rgb), 0.1)' : 'rgba(255,255,255,0.02)', 
                            padding: '24px', 
                            borderRadius: '12px', 
                            border: isSelected ? '1px solid var(--gold)' : '1px solid #1a1a1a',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '16px', height: '16px', border: '2px solid var(--gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isSelected ? 'var(--gold)' : 'transparent' }}>
                                {isSelected && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
                              </div>
                              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', opacity: 0.6 }}>{block.title || 'BLOCK'}</div>
                            </div>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.5', letterSpacing: '0.01em' }}>{block.tp}</div>
                            <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: '1.4' }}>{block.en}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAskLina(`Let's practice this lyric: [${block.tp}]`); }}
                            className="btn-toggle"
                            style={{ padding: '10px 16px', fontSize: '0.7rem', width: 'auto', background: 'rgba(255,255,255,0.05)', fontWeight: 800, borderRadius: '8px' }}
                          >
                            PRACTICE
                          </button>
                        </div>
                      );
                    }) : (
                      <p style={{ color: '#444', textAlign: 'center', padding: '40px' }}>
                        {selectedWords && selectedWords.length > 0 ? 'No lyrics match your selection.' : 'Lyrics integration pending...'}
                      </p>
                    )}
                 </div>
                 {selectedBlocks.length > 1 && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                      <button 
                        onClick={handlePracticeSelected}
                        className="btn-review"
                        style={{ background: 'var(--gold)', color: '#000', width: '100%', maxWidth: '400px', fontWeight: 900 }}
                      >
                        PRACTICE {selectedBlocks.length} SELECTED BLOCKS
                      </button>
                    </div>
                 )}
               </div>
             );
           })()}
        </div>
      )}
    </div>
  );
}
