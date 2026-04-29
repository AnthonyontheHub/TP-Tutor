export interface SongBlock {
  title: string;
  tp: string;
  en: string;
}

export interface Song {
  id: string;
  title: string;
  blocks: SongBlock[];
}

export interface Album {
  id: string;
  title: string;
  year?: number;
  artist?: string;
  description?: string;
  songs: Song[];
}
