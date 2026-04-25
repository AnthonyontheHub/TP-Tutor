/* src/components/CurriculumRoadmap.tsx */
import { useMasteryStore } from '../store/masteryStore';

export default function CurriculumRoadmap() {
  const { levels } = useMasteryStore();
  
  return (
    <div className="roadmap-container" style={{ padding: '20px 0', height: '100%' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '20px', fontSize: '1.2rem' }}>NEURAL PATHWAY ROADMAP</h1>
      {levels.map(level => (
        <div key={level.id} style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '0.9rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px', color: '#888', fontWeight: 800 }}>{level.title.toUpperCase()}</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {level.nodes.map(m => (
              <div key={m.id} style={{ 
                padding: '15px', 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border)', 
                borderRadius: '4px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.title}</span>
                <span style={{ 
                  color: m.status === 'active' ? 'var(--gold)' : (m.status === 'mastered' ? 'var(--green)' : '#444'), 
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em'
                }}>{m.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
