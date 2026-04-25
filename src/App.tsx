/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import LoginPage from './components/LoginPage';
import { useMasteryStore } from './store/masteryStore';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { user, loading } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Req 8: Default to true — sandbox mode is on unless the user explicitly turned it off.
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
    setPendingPrompt(prompt);
    setIsChatOpen(true);
  }, []);

  const handleClearPrompt = useCallback(() => setPendingPrompt(null), []);
  const handleEndSession = useCallback(() => setIsChatOpen(false), []);
  const handleStartSession = useCallback(() => setIsChatOpen(true), []);

  if (loading) {
    return (
      <div style={{ 
        height: '100dvh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg)', 
        color: 'var(--text)' 
      }}>
        <div style={{ fontWeight: 900, letterSpacing: '0.1em' }}>TENPO PONA...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <>
      <Dashboard
        onStartSession={handleStartSession}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />
      <ChatSession
        isActive={isChatOpen}
        onEndSession={handleEndSession}
        pendingPrompt={pendingPrompt}
        clearPrompt={handleClearPrompt}
        isSandboxMode={isSandboxMode}
      />
    </>
  );
}
