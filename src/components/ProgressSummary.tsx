import { useMemo } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META } from '../types/mastery';
import type { MasteryStatus, StatusSummary } from '../types/mastery';

const STATUS_ORDER: MasteryStatus[] = [
  'mastered',
  'confident',
  'practicing',
  'introduced',
  'not_started',
];

export default function ProgressSummary() {
  const vocabulary = useMasteryStore((s) => s.vocabulary);

  const summary = useMemo<StatusSummary>(() => {
    const s: StatusSummary = {
      not_started: 0,
      introduced: 0,
      practicing: 0,
      confident: 0,
      mastered: 0,
    };
    for (const w of vocabulary) s[w.status]++;
    return s;
  }, [vocabulary]);

  return (
    <section className="progress-summary">
      <h2 className="section-title">PROGRESS SUMMARY</h2>
      <div className="progress-summary__grid">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          return (
            <div key={status} className={`progress-card progress-card--${status}`}>
              <span className="progress-card__emoji">{meta.emoji}</span>
              <span className="progress-card__count">{summary[status]}</span>
              <span className="progress-card__label">{meta.label.toUpperCase()}</span>
            </div>
          );
        })}
        <div className="progress-card progress-card--total">
          <span className="progress-card__emoji">∑</span>
          <span className="progress-card__count">{vocabulary.length}</span>
          <span className="progress-card__label">TOTAL</span>
        </div>
      </div>
    </section>
  );
}
