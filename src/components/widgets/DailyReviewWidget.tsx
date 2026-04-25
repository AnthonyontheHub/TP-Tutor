import { motion } from 'framer-motion';
import { useMasteryStore } from '../../store/masteryStore';

interface Props {
  onStartReview: () => void;
}

export default function DailyReviewWidget({ onStartReview }: Props) {
  const { reviewVibe, setReviewVibe } = useMasteryStore();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      style={{
        width: '100%',
        maxWidth: '700px',
        background: 'var(--gold)',
        color: 'black',
        padding: '24px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 0 30px rgba(255, 191, 0, 0.3)',
        cursor: 'pointer'
      }}
      onClick={onStartReview}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', letterSpacing: '0.05em' }}>DAILY REVIEW</h2>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>SYNC NEURAL PATHWAYS</p>
        </div>
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.1)', 
            borderRadius: '4px', 
            padding: '4px',
            border: '1px solid rgba(0,0,0,0.2)'
          }}
        >
          <button 
            onClick={() => setReviewVibe('chill')}
            style={{ 
              border: 'none', 
              background: reviewVibe === 'chill' ? 'black' : 'transparent', 
              color: reviewVibe === 'chill' ? 'var(--gold)' : 'black', 
              borderRadius: '2px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' 
            }}
          >
            CHILL
          </button>
          <button 
            onClick={() => setReviewVibe('deep')}
            style={{ 
              border: 'none', 
              background: reviewVibe === 'deep' ? 'black' : 'transparent', 
              color: reviewVibe === 'deep' ? 'var(--gold)' : 'black', 
              borderRadius: '2px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' 
            }}
          >
            DEEP
          </button>
        </div>
      </div>
      
      <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>
        {reviewVibe === 'chill' 
          ? "Light reinforcement of mastered concepts." 
          : "Deep immersion into new and challenging vocabulary."}
      </div>

      <div style={{ alignSelf: 'flex-end', fontWeight: 900, fontSize: '0.8rem' }}>
        TAP TO INITIATE →
      </div>
    </motion.div>
  );
}
