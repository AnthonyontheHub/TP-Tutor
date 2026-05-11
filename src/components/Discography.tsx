import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { Album, Song, SongBlock } from '../types/discography';
import { Music, ChevronLeft, Play, BookOpen } from 'lucide-react';

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
  const safeSongs: Album[] = Array.isArray(songs) ? songs : [];

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
      {!selectedAlbumId ? (
         <div className="flex flex-col gap-6">
           <h2 className="section-title">DISCOGRAPHY</h2>
           <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
             {safeSongs.length === 0 ? (
               <div className="glass-panel col-span-full text-center py-[60px] px-5 text-[var(--text-muted)]">
                 No archives found in this sector.
               </div>
             ) : safeSongs.map(album => (
               <button type="button" 
                key={album.id}
                onClick={() => setSelectedAlbumId(album.id)}
                className="glass-panel album-card p-8 text-left flex flex-col gap-4 transition-all duration-300 hover:border-[var(--gold)]"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center border border-[var(--border)] bg-[rgba(255,255,255,0.02)]">
                     <Music size={20} color="var(--gold)" />
                   </div>
                   <div>
                     <div className="font-black text-[var(--text)] uppercase tracking-[0.1em] text-[1.1rem]">{album.title}</div>
                     {album.titleEn && <div className="text-[var(--gold)] text-[0.8rem] font-bold tracking-[0.05em] uppercase">{album.titleEn}</div>}
                   </div>
                 </div>
                 
                 {(album.breakdown || album.explanation) && (
                   <div className="mt-2 p-4 bg-[rgba(0,0,0,0.2)] rounded-lg border border-[var(--border)]">
                     {album.breakdown && <div className="text-[0.75rem] text-[#aaa] italic mb-2">"{album.breakdown}"</div>}
                     {album.explanation && <div className="text-[0.85rem] text-[var(--text-muted)] leading-relaxed">{album.explanation}</div>}
                   </div>
                 )}
               </button>
             ))}
           </div>
         </div>
      ) : !selectedTrackTitle ? (
        <div className="flex flex-col gap-6">
          <button type="button" onClick={() => setSelectedAlbumId(null)} className="btn-back self-start">
            <ChevronLeft size={14} /> BACK TO ALBUMS
          </button>
          
          <div className="flex flex-col gap-2">
            <span className="text-[0.6rem] font-black text-[var(--text-muted)] tracking-[0.2em]">NOW VIEWING ALBUM</span>
            <h3 className="section-title text-[1.2rem] m-0">{safeSongs.find(a => a.id === selectedAlbumId)?.title}</h3>
          </div>

          <div className="grid gap-4 max-w-[800px]">
            {safeSongs.find(a => a.id === selectedAlbumId)?.tracks?.map((track: Song, idx: number) => (
              <div key={track.title} className="glass-panel p-5 px-6 flex flex-col gap-3">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setSelectedTrackTitle(track.title); setSelectedBlocks([]); }}>
                  <span className="text-[var(--gold)] opacity-40 font-black text-[0.85rem] tracking-[0.1em] w-[24px]">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="text-white font-extrabold tracking-[0.1em] uppercase text-[1rem]">{track.title}</div>
                    {track.titleEn && <div className="text-[var(--gold)] text-[0.7rem] uppercase tracking-[0.05em] mt-1">{track.titleEn}</div>}
                  </div>
                  <div className="opacity-20 hover:opacity-100 transition-opacity">
                    <Play size={20} fill="currentColor" />
                  </div>
                </div>
                
                {(track.breakdown || track.explanation) && (
                  <div className="mt-2 pl-[40px] border-l-2 border-[var(--border)] ml-2 py-1">
                    {track.breakdown && <div className="text-[0.7rem] text-[#aaa] italic mb-1">"{track.breakdown}"</div>}
                    {track.explanation && <div className="text-[0.8rem] text-[var(--text-muted)] leading-relaxed">{track.explanation}</div>}
                  </div>
                )}
              </div>
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
               <button type="button" onClick={handlePracticeSelected} className="btn-review m-0 w-auto min-w-[200px]">
                 PRACTICE SELECTED ({selectedBlocks.length})
               </button>
             )}
           </div>
           
           {(() => {
             const album = safeSongs.find(a => a.id === selectedAlbumId);
             const track = (album?.tracks || []).find((t: Song) => t.title === selectedTrackTitle);
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
                   <span className="text-[0.6rem] font-black text-[var(--text-muted)] tracking-[0.2em]">TRACK {((album?.tracks || []).indexOf(track) + 1).toString().padStart(2, '0')}</span>
                   <h4 className="section-title text-[1.4rem] m-0">{track.title}</h4>
                   {track.titleEn && <div className="text-[var(--gold)] font-bold tracking-[0.1em] uppercase text-[0.85rem]">{track.titleEn}</div>}
                 </div>

                 <div className="grid gap-6">
                    {filteredBlocks.length > 0 ? filteredBlocks.map((block: SongBlock, bi: number) => {
                      const isSelected = selectedBlocks.some(b => b.tp === block.tp && b.en === block.en);
                      return (
                        <div 
                          key={bi} 
                          onClick={() => toggleBlock(block)}
                          className={`glass-panel flex justify-between items-center p-8 cursor-pointer transition-all duration-300 ease-in-out ${isSelected ? 'border-[var(--gold)] bg-[rgba(255,191,0,0.03)]' : 'bg-[var(--surface)]'}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-3 h-3 border border-[var(--gold)] rounded-sm transition-all duration-200 ${isSelected ? 'bg-[var(--gold)]' : 'bg-transparent'}`} />
                              <div className="text-[0.6rem] font-black text-[var(--gold)] uppercase tracking-[0.1em] opacity-50">{block.title || 'BLOCK'}</div>
                            </div>
                            <div className={`font-black text-[1.4rem] mb-3 whitespace-pre-wrap leading-[1.4] tracking-[0.02em] transition-all duration-300 ease-in-out ${isSelected ? 'text-[var(--gold)] drop-shadow-[0_0_8px_rgba(255,191,0,0.4)]' : 'text-white'}`}>{block.tp}</div>
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

                 {track.deepDive && (
                   <div className="mt-8 p-8 border border-[var(--gold)] bg-[rgba(255,191,0,0.02)] rounded-lg">
                     <h4 className="text-[var(--gold)] font-black uppercase tracking-[0.1em] text-[0.8rem] mb-4 flex items-center gap-2">
                       <BookOpen size={16} />
                       DEEPER MEANING
                     </h4>
                     <div className="text-[0.95rem] text-[#ddd] leading-relaxed whitespace-pre-wrap">
                       {track.deepDive}
                     </div>
                     <button type="button" 
                        onClick={() => onAskLina(`[SYSTEM: The user just finished studying the song "${track.title}". Ask them what they thought about the deeper meaning or cultural notes associated with it.]`)}
                        className="btn-review mt-6 w-auto"
                     >
                        DISCUSS WITH LINA
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
