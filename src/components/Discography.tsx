/* src/components/Discography.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { Song, SongBlock } from '../types/discography';
import { Music, ChevronLeft, Play } from 'lucide-react';

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
    <div className="flex flex-col gap-6">
      <style>{`
        .album-card:hover .album-icon-container {
          border-color: var(--gold);
          box-shadow: 0 0 20px var(--gold-glow);
          transform: translateY(-2px);
        }
        .album-card:hover {
          border-color: var(--gold) !important;
        }
      `}</style>
      
      <h2 className="section-title">DISCOGRAPHY</h2>
      
      {!selectedAlbumId ? (
         <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
           {safeSongs.length === 0 ? (
             <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
               No archives found in this sector.
             </div>
           ) : safeSongs.map(album => (
             <button 
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className="glass-panel album-card"
              style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
             >
               <div className="glass-panel album-icon-container" style={{ width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'all 0.3s ease', border: '1px solid var(--border)' }}>
                 <Music size={32} color="var(--gold)" style={{ filter: 'drop-shadow(0 0 8px var(--gold-glow))' }} />
               </div>
               <div style={{ fontWeight: 900, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.85rem', marginBottom: '8px' }}>{album.title}</div>
               <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                 EST. {album.year || 2025}
               </div>
             </button>
           ))}
         </div>
      ) : !selectedTrackTitle ? (
        <div className="flex flex-col gap-6">
          <button onClick={() => setSelectedAlbumId(null)} className="btn-back" style={{ alignSelf: 'flex-start' }}>
            <ChevronLeft size={14} /> BACK TO ALBUMS
          </button>
          
          <div className="flex flex-col gap-2">
            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>NOW VIEWING ARCHIVE</span>
            <h3 className="section-title" style={{ fontSize: '1.2rem', margin: 0 }}>{safeSongs.find(a => a.id === selectedAlbumId)?.title}</h3>
          </div>

          <div style={{ display: 'grid', gap: '12px', maxWidth: '800px' }}>
            {safeSongs.find(a => a.id === selectedAlbumId)?.songs?.map((track: Song, idx: number) => (
              <button 
                key={track.title} 
                onClick={() => { setSelectedTrackTitle(track.title); setSelectedBlocks([]); }}
                className="vocab-card"
                style={{ padding: '20px 24px', flexDirection: 'row', alignItems: 'center', gap: '24px' }}
              >
                <span style={{ color: 'var(--gold)', opacity: 0.4, fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em', width: '30px' }}>
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span style={{ color: 'white', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                  {track.title}
                </span>
                <div style={{ marginLeft: 'auto', opacity: 0.2 }}>
                  <Play size={16} fill="currentColor" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <button onClick={() => { setSelectedTrackTitle(null); setSelectedBlocks([]); }} className="btn-back">
               <ChevronLeft size={14} /> BACK TO TRACKLIST
             </button>
             {selectedBlocks.length > 0 && (
               <button 
                onClick={handlePracticeSelected}
                className="btn-review"
                style={{ margin: 0, width: 'auto', minWidth: '200px' }}
               >
                 PRACTICE SELECTED ({selectedBlocks.length})
               </button>
             )}
           </div>
           
           {(() => {
             const album = safeSongs.find(a => a.id === selectedAlbumId);
             const track = (album?.songs || []).find((t: Song) => t.title === selectedTrackTitle);
             if (!track) return null;
             
             const blocks = track.blocks || [];
             const filteredBlocks = (selectedWords && selectedWords.length > 0)
               ? blocks.filter((b: SongBlock) => {
                   const ws = (b.tp || '').split(/[ /]+/).map(clean);
                   return selectedWords.every(sw => ws.includes(clean(sw)));
                 })
               : blocks;

             return (
               <div className="flex flex-col gap-8">
                 <div className="flex flex-col gap-2">
                   <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>TRACK {((album?.songs || []).indexOf(track) + 1).toString().padStart(2, '0')}</span>
                   <h4 className="section-title" style={{ fontSize: '1.4rem', margin: 0 }}>{track.title}</h4>
                 </div>

                 <div style={{ display: 'grid', gap: '24px' }}>
                    {filteredBlocks.length > 0 ? filteredBlocks.map((block: SongBlock, bi: number) => {
                      const isSelected = selectedBlocks.some(b => b.tp === block.tp && b.en === block.en);
                      return (
                        <div 
                          key={bi} 
                          onClick={() => toggleBlock(block)}
                          className={`glass-panel ${isSelected ? 'neon-border-gold' : ''}`}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '32px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            background: isSelected ? 'rgba(255, 191, 0, 0.03)' : 'var(--surface)'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                              <div style={{ width: '12px', height: '12px', border: '1px solid var(--gold)', borderRadius: '2px', background: isSelected ? 'var(--gold)' : 'transparent', transition: 'all 0.2s' }} />
                              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>{block.title || 'BLOCK'}</div>
                            </div>
                            <div className={isSelected ? 'neon-text-gold' : ''} style={{ color: isSelected ? 'var(--gold)' : '#fff', fontWeight: 900, fontSize: '1.4rem', marginBottom: '12px', whiteSpace: 'pre-wrap', lineHeight: '1.4', letterSpacing: '0.02em', transition: 'all 0.3s ease' }}>{block.tp}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic', opacity: 0.8 }}>{block.en}</div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onAskLina(`Let's practice this lyric: [${block.tp}]`); }}
                            className="btn-toggle"
                            style={{ width: 'auto', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', marginLeft: '24px' }}
                          >
                            PRACTICE
                          </button>
                        </div>
                      );
                    }) : (
                      <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                        {selectedWords && selectedWords.length > 0 ? 'No lyrics match your current focal selection.' : 'Data stream pending...'}
                      </div>
                    )}
                 </div>

                 {selectedBlocks.length > 1 && (
                    <button 
                      onClick={handlePracticeSelected}
                      className="btn-review"
                      style={{ width: '100%', maxWidth: '600px', margin: '20px auto' }}
                    >
                      PRACTICE {selectedBlocks.length} SELECTED BLOCKS
                    </button>
                 )}
               </div>
             );
           })()}
        </div>
      )}
    </div>
  );
}
