import { useMasteryStore } from '../../store/masteryStore';
import LiveTile from '../LiveTile';
import VocabCard from '../VocabCard';

export default function VocabWing() {
  const { vocabulary, widgetDensity } = useMasteryStore();

  // Sort: Mastery Status first, then frequency
  const sortedVocab = [...vocabulary].sort((a, b) => {
    const statusOrder = { mastered: 4, confident: 3, practicing: 2, introduced: 1, not_started: 0 };
    if (statusOrder[b.status] !== statusOrder[a.status]) {
      return statusOrder[b.status] - statusOrder[a.status];
    }
    return (a.frequencyRank ?? 999) - (b.frequencyRank ?? 999);
  });

  return (
    <div style={{ padding: '40px', width: '100%', maxWidth: '800px' }}>
      <h2 style={{ 
        fontSize: '0.8rem', 
        fontWeight: 900, 
        color: 'var(--gold)', 
        letterSpacing: '0.2em',
        marginBottom: '24px',
        borderLeft: '4px solid var(--gold)',
        paddingLeft: '12px'
      }}>
        NEURAL MAP: VOCABULARY & GRAMMAR
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: widgetDensity === 'Compact' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', 
        gap: '16px' 
      }}>
        {sortedVocab.map(v => (
          <LiveTile 
            key={v.id} 
            size={widgetDensity === 'Compact' ? "1x1" : "2x1"} 
            status={v.status}
            variant={v.type}
          >
            {widgetDensity === 'Compact' ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                {v.word}
              </div>
            ) : (
              <VocabCard word={v} />
            )}
          </LiveTile>
        ))}
      </div>
    </div>
  );
}
