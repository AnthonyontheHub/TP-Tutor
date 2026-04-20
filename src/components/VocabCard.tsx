import type { VocabWord } from '../types/mastery';

interface Props {
  word: VocabWord;
}

export default function VocabCard({ word }: Props) {
  const shortPos = word.partOfSpeech.split(' /')[0].trim();

  return (
    <div
      className={`vocab-card vocab-card--${word.status}`}
      title={`${word.word} (${word.partOfSpeech})\n${word.meanings}`}
    >
      {word.isMasteryCandidate && (
        <span className="vocab-card__candidate" title="Mastery candidate">⚠</span>
      )}
      <span className="vocab-card__word">{word.word}</span>
      <span className="vocab-card__pos">{shortPos}</span>
    </div>
  );
}
