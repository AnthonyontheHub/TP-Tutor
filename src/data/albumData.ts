export interface AlbumTrack { title: string; }
export interface Album {
  id: string;
  title: string;
  year: number;
  artist: string;
  description: string;
  tracks: string[];
}

export const albumData: Album[] = [
  {
    id: 'jan-olami',
    title: "jan olin mi",
    year: 2024, // Year as a number
    artist: "jan Ansoni", // Added artist for consistency
    description: "The debut album exploring love and connection through the simplicity of Toki Pona.",
    tracks: ["jan olin mi", "tomo pona", "suno li suli", "tenpo pi olin ni", "mi mute"]
  },
  {
    id: 'toki-nasa',
    title: "toki nasa, kalama pona",
    year: 2025, // Year as a number
    artist: "jan Ansoni",
    description: "An absurdist K-pop project built on synth bass and stadium-scale sound. A deliberate arc from anticipation to euphoria.",
    tracks: [
      "o tawa wawa", 
      "lukin sama", 
      "o kule e kon", 
      "KULUPU PONA", 
      "alasa tawa sin", 
      "kili wawa (Bonus Track)"
    ]
  }
];
