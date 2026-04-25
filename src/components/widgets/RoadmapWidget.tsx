import { motion } from 'framer-motion';
import { useMasteryStore } from '../../store/masteryStore';

interface Props {
  onClick: () => void;
}

export default function RoadmapWidget({ onClick }: Props) {
  const { levels, vocabulary } = useMasteryStore();

  // Find the active node
  let activeNode = null;
  let activeLevelTitle = "";
  
  for (const level of levels) {
    const found = level.nodes.find(n => n.status === 'active');
    if (found) {
      activeNode = found;
      activeLevelTitle = level.title;
      break;
    }
  }

  // Fallback if none active (e.g. all mastered or just starting)
  if (!activeNode) {
    activeNode = levels[0]?.nodes[0];
    activeLevelTitle = levels[0]?.title;
  }

  const calculateProgress = () => {
    const totalItems = vocabulary.length;
    const masteredItems = vocabulary.filter(v => v.status === 'mastered').length;
    return Math.round((masteredItems / totalItems) * 100);
  };

  const progress = calculateProgress();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      style={{
        width: '100%',
        maxWidth: '700px',
        background: 'var(--surface-opaque)',
        border: '1px solid var(--border)',
        padding: '24px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 900, letterSpacing: '0.1em' }}>CURRICULUM ROADMAP</div>
          <h3 style={{ margin: '4px 0 0 0', fontWeight: 900, fontSize: '1.2rem' }}>{activeLevelTitle}</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>{progress}%</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>TOTAL SYNC</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.8 }}>CURRENT CHAPTER:</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)' }}>{activeNode?.title}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold-glow)' }} 
          />
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5, fontStyle: 'italic' }}>
        Scrolling reveals the full neural architecture...
      </div>
    </motion.div>
  );
}
