import { useMasteryStore } from '../../store/masteryStore';
import LiveTile from '../LiveTile';

export default function PhraseWing() {
  const { savedPhrases } = useMasteryStore();

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
        PHRASEBOOK: SAVED LINKAGES
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {savedPhrases.length === 0 ? (
          <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center', opacity: 0.5 }}>
            No neural linkages archived.
          </div>
        ) : (
          savedPhrases.map((p, i) => (
            <LiveTile key={i} size="2x1" status="mastered">
              <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{typeof p === 'string' ? p : p.tp}</div>
                {typeof p !== 'string' && <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '4px' }}>{p.en}</div>}
              </div>
            </LiveTile>
          ))
        )}
      </div>
    </div>
  );
}
