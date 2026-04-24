/* src/components/SetupScreen.tsx */
import { useState } from 'react';
import { useMasteryStore } from '../store/masteryStore';

export default function SetupScreen() {
  const [name, setName] = useState('');
  const setStudentName = useMasteryStore((s) => s.setStudentName);

  const handleStart = () => {
    if (name.trim()) {
      setStudentName(name.trim());
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#111', color: 'white', padding: '20px', textAlign: 'center' }}>
      <div style={{ width: '120px', height: '120px', background: '#222', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '20px', border: '3px dashed #333' }}>
        👤
      </div>
      <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#3b82f6' }}>toki!</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        placeholder="Enter your name..."
        style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '12px', border: '2px solid #333', background: '#222', color: 'white', fontSize: '1.2rem', textAlign: 'center', marginBottom: '24px', outline: 'none' }}
      />
      <button onClick={handleStart} disabled={!name.trim()} className="btn-review" style={{ width: 'auto', padding: '16px 40px' }}>START LEARNING</button>
    </div>
  );
}
