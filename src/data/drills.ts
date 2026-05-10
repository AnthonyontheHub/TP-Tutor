import drillData from './toki_pona_drills.json';

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

export const essentializerData: EssentializerDrill[] = drillData.essentializerData;
export const logicGateData: LogicGateDrill[] = drillData.logicGateData;
export const sorterData: SorterDrill[] = drillData.sorterData;
