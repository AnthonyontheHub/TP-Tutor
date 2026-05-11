export interface SongBlock {
  title: string;
  tp: string;
  en: string;
}

export interface Song {
  title: string;
  titleEn?: string;
  breakdown?: string;
  explanation?: string;
  deepDive?: string;
  blocks: SongBlock[];
}

export interface Album {
  id: string;
  title: string;
  titleEn?: string;
  breakdown?: string;
  explanation?: string;
  year?: number;
  scUrl?: string;
  tracks: Song[];
}
