/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore';

export default function App() {
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
    const unsubscribe = useMasteryStore.getState().syncFromCloud();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, []);

  const handleAskLina = useCallback((prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true);
  }, []);

  const handleClearPrompt = useCallback(() => setPendingPrompt(null), []);
  const handleEndSession = useCallback(() => setIsChatOpen(false), []);
  const handleStartSession = useCallback(() => setIsChatOpen(true), []);

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
