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
      <div style={{ fontSize: '4rem', marginBottom: '10px' }}>👋</div>
      <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', color: '#3b82f6' }}>toki!</h1>
      <p style={{ color: '#aaa', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '400px' }}>
        Welcome to your Toki Pona mastery journey. What should Lina call you?
      </p>
      
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        placeholder="Enter your name..."
        autoFocus
        style={{ width: '100%', maxWidth: '300px', padding: '16px', borderRadius: '12px', border: '2px solid #333', background: '#222', color: 'white', fontSize: '1.2rem', textAlign: 'center', marginBottom: '24px', outline: 'none' }}
      />
      
      <button 
        onClick={handleStart}
        disabled={!name.trim()}
        style={{ padding: '16px 40px', background: name.trim() ? '#3b82f6' : '#333', color: name.trim() ? 'white' : '#666', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: name.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease' }}
      >
        START LEARNING
      </button>
    </div>
  );
}
