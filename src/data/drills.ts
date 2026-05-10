export interface EssentializerDrill {
  id: string;
  requiredVocab: string[];
  englishPrompt: string;
  options: string[];
  correctOption: string;
}

export interface LogicGateDrill {
  id: string;
  requiredVocab: string[];
  statement: string;
  englishTranslation: string;
  isPona: boolean;
  explanation: string;
}

export interface SorterDrill {
  id: string;
  requiredVocab: string[];
  bucketA: string;
  bucketB: string;
  items: Array<{ word: string; bucket: 'A' | 'B' }>;
}

export const essentializerData: EssentializerDrill[] = [
  {
    id: "ess_1",
    requiredVocab: ["tomo", "tawa", "ilo", "moku", "suno", "suli"],
    englishPrompt: "Car",
    options: ["tomo tawa", "ilo moku", "suno suli"],
    correctOption: "tomo tawa"
  },
  {
    id: "ess_2",
    requiredVocab: ["tomo", "moku", "telo", "suli", "jan", "pona"],
    englishPrompt: "Restaurant",
    options: ["tomo moku", "telo suli", "jan pona"],
    correctOption: "tomo moku"
  },
  {
    id: "ess_3",
    requiredVocab: ["jan", "pona", "ike", "soweli", "lili"],
    englishPrompt: "Friend",
    options: ["jan pona", "jan ike", "soweli lili"],
    correctOption: "jan pona"
  },
  {
    id: "ess_4",
    requiredVocab: ["telo", "pimeja", "wawa", "kili", "suwi", "pan", "lili"],
    englishPrompt: "Coffee",
    options: ["telo pimeja wawa", "kili suwi", "pan lili"],
    correctOption: "telo pimeja wawa"
  }
];

export const logicGateData: LogicGateDrill[] = [
  {
    id: "logic_1",
    requiredVocab: ["suno", "li", "pimeja"],
    statement: "suno li pimeja.",
    englishTranslation: "The sun is dark.",
    isPona: false,
    explanation: "The sun ('suno') is a source of light, not darkness ('pimeja')."
  },
  {
    id: "logic_2",
    requiredVocab: ["jan", "li", "moku", "e", "pan"],
    statement: "jan li moku e pan.",
    englishTranslation: "A person eats bread.",
    isPona: true,
    explanation: "This is a grammatically correct and logical statement: a person ('jan') eats ('moku e') bread ('pan')."
  },
  {
    id: "logic_3",
    requiredVocab: ["telo", "li", "seli", "e", "moku"],
    statement: "telo li seli e moku.",
    englishTranslation: "Water heats the food.",
    isPona: false,
    explanation: "Usually fire or heat ('seli') heats things, not water ('telo')."
  },
  {
    id: "logic_4",
    requiredVocab: ["tomo", "tawa", "li", "tawa"],
    statement: "tomo tawa li tawa.",
    englishTranslation: "A car moves.",
    isPona: true,
    explanation: "A car ('tomo tawa' - literally 'moving structure') inherently moves ('tawa')."
  }
];

export const sorterData: SorterDrill[] = [
  {
    id: "sort_1",
    requiredVocab: ["moku", "telo", "kili", "pan", "kiwen", "tomo", "suno"],
    bucketA: "Edible (moku/telo)",
    bucketB: "Inedible (kiwen/tomo)",
    items: [
      { word: "kili", bucket: "A" },
      { word: "pan", bucket: "A" },
      { word: "telo", bucket: "A" },
      { word: "kiwen", bucket: "B" },
      { word: "tomo", bucket: "B" },
      { word: "suno", bucket: "B" }
    ]
  },
  {
    id: "sort_2",
    requiredVocab: ["laso", "loje", "walo", "pimeja", "suli", "lili", "sike"],
    bucketA: "Colors (kule)",
    bucketB: "Size/Shape",
    items: [
      { word: "laso", bucket: "A" },
      { word: "loje", bucket: "A" },
      { word: "walo", bucket: "A" },
      { word: "pimeja", bucket: "A" },
      { word: "suli", bucket: "B" },
      { word: "lili", bucket: "B" },
      { word: "sike", bucket: "B" }
    ]
  },
  {
    id: "sort_3",
    requiredVocab: ["jan", "mije", "meli", "soweli", "kala", "waso", "pipi"],
    bucketA: "People (jan)",
    bucketB: "Animals (soweli/kala/waso)",
    items: [
      { word: "jan", bucket: "A" },
      { word: "mije", bucket: "A" },
      { word: "meli", bucket: "A" },
      { word: "soweli", bucket: "B" },
      { word: "kala", bucket: "B" },
      { word: "waso", bucket: "B" },
      { word: "pipi", bucket: "B" }
    ]
  }
];
