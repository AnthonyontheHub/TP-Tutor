import { Album } from '../types/mastery';

export const albumData: Album[] = [
  {
    id: 'telo-lon-kiwen',
    title: "telo lon kiwen",
    year: 2022,
    artist: "jan Ansoni",
    description: "A soul's journey from a stone cathedral into the warmth of liquid light. Baroque Minimalism featuring countertenor, harpsichord, and theorbo.",
    songs: [
      {
        id: "suno-lon-insa",
        title: "suno lon insa",
        blocks: [{ title: "Verse", tp: "suno lon insa mi li suno e nasin mi.", en: "The light inside me lights my path." }]
      },
      {
        id: "telo-lon-kiwen-song",
        title: "telo lon kiwen",
        blocks: [{ title: "Verse", tp: "telo lon kiwen li pona tawa mi. mi lon insa pi tomo suli.", en: "Water on stone is good to me. I am inside the great house." }]
      },
      {
        id: "tenpo-li-moku-e-mi",
        title: "tenpo li moku e mi",
        blocks: [
          { title: "Verse", tp: "tenpo li moku e mi\nmi moku e tenpo\ntenpo li pini ala\nmi pini e tenpo", en: "Time eats me / I eat time / Time does not end / I end time" },
          { title: "Outro", tp: "pilin li pini ala. pilin li awen lon pini.", en: "Feeling does not end. Feeling stays at the end." }
        ]
      },
      {
        id: "sijelo-ilo",
        title: "Sijelo Ilo",
        blocks: [{ title: "Verse", tp: "sijelo ilo li wawa. mi pali e ona.", en: "The machine body is strong. I made it." }]
      },
      {
        id: "kon-li-pini-e-moli",
        title: "kon li pini e moli",
        blocks: [{ title: "Verse", tp: "kon li pini e moli. mi lape lon suno.", en: "The air ends the death. I sleep in the sun." }]
      },
      {
        id: "ma-suli-lon-monsi",
        title: "Ma Suli Lon Monsi",
        blocks: [{ title: "Verse", tp: "ma suli lon monsi li awen. mi lukin e ona.", en: "The great land behind remains. I watch it." }]
      },
      {
        id: "nasin-pi-pakala-ken",
        title: "nasin pi pakala ken",
        blocks: [{ title: "Verse", tp: "nasin pi pakala ken li ante. mi tawa lon ona.", en: "The path of possible mistake is different. I go on it." }]
      },
      {
        id: "kalama-pi-pini-ala",
        title: "kalama pi pini ala",
        blocks: [{ title: "Verse", tp: "kalama pi pini ala li lon. mi kute e ona.", en: "The sound that does not end exists. I hear it." }]
      },
      {
        id: "ante-suli",
        title: "Ante Suli",
        blocks: [{ title: "Verse", tp: "ante suli li kama. mi ante e mi.", en: "The big change comes. I change myself." }]
      }
    ]
  },
  {
    id: 'toki-nasa',
    title: "toki nasa, kalama pona",
    year: 2025,
    artist: "jan Ansoni",
    description: "An absurdist K-pop project built on synth bass and stadium-scale sound. A deliberate arc from anticipation to euphoria.",
    songs: [
      { id: 'o-tawa-wawa', title: "o tawa wawa", blocks: [] },
      { id: 'lukin-sama', title: "lukin sama", blocks: [] },
      { id: 'o-kule-e-kon', title: "o kule e kon", blocks: [] },
      { id: 'kulupu-pona', title: "KULUPU PONA", blocks: [] },
      { id: 'alasa-tawa-sin', title: "alasa tawa sin", blocks: [] },
      { id: 'kili-wawa', title: "kili wawa (Bonus Track)", blocks: [] }
    ]
  }
];
