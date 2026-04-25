/* src/data/curriculum.ts */
import type { CurriculumLevel, CurriculumNode } from '../types/mastery';

const stage1Nodes: CurriculumNode[] = [
  { id: "phi_sim", title: "Philosophy of Simplicity", requiredVocabIds: [], requiredGrammarIds: [], status: 'active', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "vowels", title: "Universal Vowels (a e i o u)", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "consonants", title: "The Nine Consonants", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "syllables", title: "The Syllable Equation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "stress", title: "The Pulse (Initial Stress)", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "name_adapt", title: "Name Adaptation", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "cp1", title: "Checkpoint: The Sound of Simplicity", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage2Nodes: CurriculumNode[] = [
  { id: "svo_intro", title: "SVO Sentence Structure", requiredVocabIds: ["mi", "sina", "ona"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "li_rule", title: "The Divider 'li'", requiredVocabIds: ["li"], requiredGrammarIds: ["particle_li"], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "e_rule", title: "The Direct Object 'e'", requiredVocabIds: ["e"], requiredGrammarIds: ["particle_e"], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "mi_sina_exception", title: "The mi/sina Exception", requiredVocabIds: ["mi", "sina"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "en_conjunction", title: "Connecting Subjects with 'en'", requiredVocabIds: ["en"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "cp2", title: "Checkpoint: Building the Core", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage3Nodes: CurriculumNode[] = [
  { id: "head_initial", title: "Head-Initial Rule", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "simple_mods", title: "Simple Modifiers", requiredVocabIds: ["pona", "ike"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "multiple_mods", title: "Chain of Modifiers", requiredVocabIds: ["suli", "lili"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "polysemy", title: "The Art of Polysemy", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "cp3", title: "Checkpoint: The Art of Description", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage4Nodes: CurriculumNode[] = [
  { id: "pi_intro", title: "Intro to 'pi'", requiredVocabIds: ["pi"], requiredGrammarIds: ["particle_pi"], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "pi_grouping", title: "Grouping with 'pi'", requiredVocabIds: ["pi"], requiredGrammarIds: ["particle_pi"], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "pi_2word", title: "The 2-Word Rule", requiredVocabIds: ["pi"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "pi_stacks", title: "pi Stacks", requiredVocabIds: ["pi"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "cp4", title: "Checkpoint: Complex Concepts", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage5Nodes: CurriculumNode[] = [
  { id: "ala_negation", title: "Negation with 'ala'", requiredVocabIds: ["ala"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "yes_no_quest", title: "Yes/No Questions", requiredVocabIds: ["ala"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "seme_quest", title: "Information with 'seme'", requiredVocabIds: ["seme"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "anu_seme", title: "Choice with 'anu seme'", requiredVocabIds: ["anu"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "cp5", title: "Checkpoint: Interaction", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage6Nodes: CurriculumNode[] = [
  { id: "preverb_wile", title: "Desire: wile", requiredVocabIds: ["wile"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "preverb_ken", title: "Ability: ken", requiredVocabIds: ["ken"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "preverb_kama", title: "Coming to: kama", requiredVocabIds: ["kama"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "prep_lon", title: "Locality: lon", requiredVocabIds: ["lon"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "prep_tawa", title: "Motion: tawa", requiredVocabIds: ["tawa"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "prep_tan", title: "Origin: tan", requiredVocabIds: ["tan"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "prep_kepeken", title: "Utility: kepeken", requiredVocabIds: ["kepeken"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Drill' },
  { id: "cp6", title: "Checkpoint: Action & Location", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage7Nodes: CurriculumNode[] = [
  { id: "colors_primary", title: "Primary Colors", requiredVocabIds: ["loje", "laso", "jelo"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "light_dark", title: "Light & Dark", requiredVocabIds: ["walo", "pimeja"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "numbers_base", title: "Numbers: wan & tu", requiredVocabIds: ["wan", "tu"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "quantities", title: "Quantities: mute & ale", requiredVocabIds: ["mute", "ale"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "zero_ala", title: "Zero: ala", requiredVocabIds: ["ala"], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Builder Drill', type: 'Topic' },
  { id: "cp7", title: "Checkpoint: Specifics", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

const stage8Nodes: CurriculumNode[] = [
  { id: "think_tp", title: "Thinking in Toki Pona", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "sitelen_pona", title: "sitelen pona Hieroglyphs", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Jan Lina Chat', type: 'Topic' },
  { id: "final_exam", title: "Final Mastery Exam", requiredVocabIds: [], requiredGrammarIds: [], status: 'locked', suggestedMethod: 'Quiz', type: 'Checkpoint' },
];

export const curriculumRoadmap: CurriculumLevel[] = [
  { id: "stage1", title: "Stage 1: The Sound of Simplicity", nodes: stage1Nodes },
  { id: "stage2", title: "Stage 2: Building the Core", nodes: stage2Nodes },
  { id: "stage3", title: "Stage 3: The Art of Description", nodes: stage3Nodes },
  { id: "stage4", title: "Stage 4: Complex Concepts", nodes: stage4Nodes },
  { id: "stage5", title: "Stage 5: Interaction", nodes: stage5Nodes },
  { id: "stage6", title: "Stage 6: Action & Location", nodes: stage6Nodes },
  { id: "stage7", title: "Stage 7: Specifics", nodes: stage7Nodes },
  { id: "stage8", title: "Stage 8: Final Mastery", nodes: stage8Nodes },
];
