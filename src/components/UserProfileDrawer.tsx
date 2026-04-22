import React from 'react';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileDrawer({ isOpen, onClose }: Props) {
  const { studentName, setStudentName, currentStreak, vocabulary } = useMasteryStore();
  const [nameInput, setNameInput] = React.useState(studentName);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)' }} onClick={onClose} />
      
      <div style={{ position: 'relative', width: '320px', height: '100%', background: '#0a0a0a', borderLeft: '1px solid #222', padding: '30px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onClose} style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #ec4899)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            {studentName[0]?.toUpperCase()}
          </div>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={() => setStudentName(nameInput)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', width: '100%' }}
          />
        </div>

        <div style={{ background: '#111', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '10px' }}>LEARNING STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 'bold' }}>{currentStreak} 🔥</div>
              <div style={{ color: '#444', fontSize: '0.7rem' }}>DAY STREAK</div>
            </div>
            <div>
              <div style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 'bold' }}>{vocabulary.length}</div>
              <div style={{ color: '#444', fontSize: '0.7rem' }}>TOTAL WORDS</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={() => {
              localStorage.removeItem('tp-tutor-mastery');
              window.location.reload();
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#ff4444', cursor: 'pointer' }}
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}
