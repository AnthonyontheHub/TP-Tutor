import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { VocabWord, MasteryStatus } from '../types/mastery';

const STATUS_ORDER: MasteryStatus[] = [
  'not_started',
  'introduced',
  'practicing',
  'confident',
  'mastered',
];

interface Props {
  word: VocabWord;
  onClose: () => void;
}

export default function WordDetailDrawer({ word, onClose }: Props) {
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);

  function handleStatus(status: MasteryStatus) {
    updateVocabStatus(word.id, status);
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />

      <div
        className="word-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${word.word}`}
      >
        <div className="word-drawer__handle" aria-hidden="true" />

        <div className="word-drawer__meta">
          <span className="word-drawer__word">{word.word}</span>
          <span className="word-drawer__pos">{word.partOfSpeech}</span>
          <span className="word-drawer__meanings">{word.meanings}</span>
        </div>

        <div className="word-drawer__section-label">SET STATUS</div>

        <div className="word-drawer__status-buttons">
          {STATUS_ORDER.map((status) => {
            const meta = STATUS_META[status];
            const isActive = word.status === status;
            return (
              <button
                key={status}
                className={`status-btn status-btn--${status}${isActive ? ' status-btn--active' : ''}`}
                onClick={() => handleStatus(status)}
                aria-pressed={isActive}
              >
                <span className="status-btn__emoji">{meta.emoji}</span>
                <span className="status-btn__label">{meta.label.toUpperCase()}</span>
                {isActive && <span className="status-btn__tick">◀</span>}
              </button>
            );
          })}
        </div>

        <button className="word-drawer__close" onClick={onClose}>
          ✕&nbsp;&nbsp;CLOSE
        </button>
      </div>
    </>
  );
}
