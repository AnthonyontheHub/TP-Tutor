/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import MosaicGrid from './components/MosaicGrid';
import LoginPage from './components/LoginPage';
import SetupScreen from './components/SetupScreen';
import { useMasteryStore } from './store/masteryStore';
import { useAuthStore } from './store/authStore';

export type AppPanel = 'profile' | 'settings' | 'instructions' | 'achievements' | 'chat';

export default function App() {
  const { user, loading } = useAuthStore();
  const { hasCompletedSetup } = useMasteryStore();
  
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(
    () => localStorage.getItem('tp_sandbox_mode') !== 'false'
  );

  useEffect(() => {
    localStorage.setItem('tp_sandbox_mode', String(isSandboxMode));
  }, [isSandboxMode]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: any;
    const setupSync = async () => {
      unsubscribe = await useMasteryStore.getState().syncFromCloud(
        user.uid, 
        user.displayName || undefined,
        user.photoURL || undefined
      );
    };
    setupSync();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [user]);

  const handleAskLina = useCallback((prompt: string) => {
    // This could trigger the chat tile expansion if needed
    console.log("Asking Lina:", prompt);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        height: '100dvh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' 
      }}>
        <div style={{ fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>NEURAL LINK ESTABLISHED...</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app-container" style={{ overflow: 'hidden' }}>
      <MosaicGrid 
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />

      {!hasCompletedSetup && <SetupScreen />}
    </div>
  );
}
