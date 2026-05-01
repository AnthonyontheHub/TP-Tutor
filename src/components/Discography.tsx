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
      <h2 className="section-title">DISCOGRAPHY</h2>
      
      {!selectedAlbumId ? (
         <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
           {safeSongs.length === 0 ? (
             <div className="glass-panel col-span-full text-center py-[60px] px-5 text-[var(--text-muted)]">
               No archives found in this sector.
             </div>
           ) : safeSongs.map(album => (
             <button type="button" 
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              className="glass-panel album-card p-10 px-6 text-center flex flex-col items-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
             >
               <div className="glass-panel album-icon-container w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ease-in-out border border-[var(--border)]">
                 <Music size={32} color="var(--gold)" className="drop-shadow-[0_0_8px_var(--gold-glow)]" />
               </div>
               <div className="font-black text-[var(--text)] uppercase tracking-[0.2em] text-[0.85rem] mb-2">{album.title}</div>
               <div className="text-[var(--text-muted)] text-[0.65rem] font-bold tracking-[0.1em] uppercase">
                 EST. {album.year || 2025}
               </div>
             </button>
           ))}
         </div>
      ) : !selectedTrackTitle ? (
        <div className="flex flex-col gap-6">
          <button type="button" onClick={() => setSelectedAlbumId(null)} className="btn-back self-start">
            <ChevronLeft size={14} /> BACK TO ALBUMS
          </button>
          
          <div className="flex flex-col gap-2">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] tracking-[0.2em]">NOW VIEWING ARCHIVE</span>
            <h3 className="section-title text-[1.2rem] m-0">{safeSongs.find(a => a.id === selectedAlbumId)?.title}</h3>
          </div>

          <div className="grid gap-3 max-w-[800px]">
            {safeSongs.find(a => a.id === selectedAlbumId)?.songs?.map((track: Song, idx: number) => (
              <button type="button" 
                key={track.title} 
                onClick={() => { setSelectedTrackTitle(track.title); setSelectedBlocks([]); }}
                className="vocab-card p-5 px-6 flex-row items-center gap-6"
              >
                <span className="text-[var(--gold)] opacity-40 font-black text-[0.75rem] tracking-[0.1em] w-[30px]">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <span className="text-white font-extrabold tracking-[0.1em] uppercase text-[0.9rem]">
                  {track.title}
                </span>
                <div className="ml-auto opacity-20">
                  <Play size={16} fill="currentColor" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
           <div className="flex justify-between items-center">
             <button type="button" onClick={() => { setSelectedTrackTitle(null); setSelectedBlocks([]); }} className="btn-back">
               <ChevronLeft size={14} /> BACK TO TRACKLIST
             </button>
             {selectedBlocks.length > 0 && (
               <button type="button" 
                onClick={handlePracticeSelected}
                className="btn-review m-0 w-auto min-w-[200px]"
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
                   <span className="text-[0.6rem] font-black text-[var(--text-muted)] tracking-[0.2em]">TRACK {((album?.songs || []).indexOf(track) + 1).toString().padStart(2, '0')}</span>
                   <h4 className="section-title text-[1.4rem] m-0">{track.title}</h4>
                 </div>

                 <div className="grid gap-6">
                    {filteredBlocks.length > 0 ? filteredBlocks.map((block: SongBlock, bi: number) => {
                      const isSelected = selectedBlocks.some(b => b.tp === block.tp && b.en === block.en);
                      return (
                        <div 
                          key={bi} 
                          onClick={() => toggleBlock(block)}
                          className={`glass-panel flex justify-between items-center p-8 cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'neon-border-gold bg-[rgba(255,191,0,0.03)]' : 'bg-[var(--surface)]'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-3 h-3 border border-[var(--gold)] rounded-sm transition-all duration-200 ${isSelected ? 'bg-[var(--gold)]' : 'bg-transparent'}`} />
                              <div className="text-[0.6rem] font-black text-[var(--gold)] uppercase tracking-[0.1em] opacity-50">{block.title || 'BLOCK'}</div>
                            </div>
                            <div className={`font-black text-[1.4rem] mb-3 whitespace-pre-wrap leading-[1.4] tracking-[0.02em] transition-all duration-300 ease-in-out ${isSelected ? 'neon-text-gold' : 'text-white'}`}>{block.tp}</div>
                            <div className="text-[var(--text-muted)] text-[0.95rem] italic opacity-80">{block.en}</div>
                          </div>
                          <button type="button" 
                            onClick={(e) => { e.stopPropagation(); onAskLina(`Let's practice this lyric: [${block.tp}]`); }}
                            className="btn-toggle w-auto py-3 px-5 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] ml-6"
                          >
                            PRACTICE
                          </button>
                        </div>
                      );
                    }) : (
                      <div className="glass-panel text-center p-[60px] text-[var(--text-muted)]">
                        {selectedWords && selectedWords.length > 0 ? 'No lyrics match your current focal selection.' : 'Data stream pending...'}
                      </div>
                    )}
                 </div>

                 {selectedBlocks.length > 1 && (
                    <button type="button" 
                      onClick={handlePracticeSelected}
                      className="btn-review w-full max-w-[600px] my-5 mx-auto"
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
