import type { VocabWord } from '../types/mastery';

interface Props {
  word: VocabWord;
}

export default function VocabCard({ word }: Props) {
  return (
    <div
      className={`vocab-card vocab-card--${word.status}`}
      title={`${word.word}\n${word.partOfSpeech}\n${word.meanings}`}
    >
      <span className="vocab-card__word">{word.word}</span>
      <span className="vocab-card__pos">{word.partOfSpeech.split(' /')[0].trim()}</span>
    </div>
  );
}
