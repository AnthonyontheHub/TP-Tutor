import type { Album } from '../types/discography';
import type { PhrasebookEntry } from '../types/mastery';

export const extractLyricsToPhrases = (albums: Album[]): PhrasebookEntry[] => {
  const phrases: PhrasebookEntry[] = [];
  let idCounter = 1;

  albums.forEach(album => {
    // Some structures might have songs, others tracks. The wire-lyrics script assumes album.tracks.
    // Based on the build error, it seems we need to be careful with types.
    const tracks = (album as any).tracks || (album as any).songs || [];

    tracks.forEach((track: any) => {
      const blocks = track.blocks || [];
      blocks.forEach((block: any) => {
        if (block.tp && block.en) {
          const tpLines = block.tp.split('\n').map((line: string) => line.trim());
          const enLines = block.en.split('\n').map((line: string) => line.trim());

          tpLines.forEach((tpLine, index) => {
            const enLine = enLines[index] || enLines[0];
            
            // Skip empty lines or pure vocalizations like "(a!)"
            if (tpLine && enLine && !tpLine.match(/^\(.*\)$/)) {
              phrases.push({
                id: `lyric-${album.id}-${idCounter++}`,
                category: "Lyrics",
                tp: tpLine.replace(/^[\(\[]|[\)\]]$/g, '').trim(),
                en: enLine.replace(/^[\(\[]|[\)\]]$/g, '').trim(),
                note: `From ${album.title}: ${track.title}`,
                difficulty: 3,
                tags: ['lyric', album.id],
                coreWords: [] // Included to satisfy strict type requirements
              });
            }
          });
        }
      });
    });
  });

  return phrases;
};
