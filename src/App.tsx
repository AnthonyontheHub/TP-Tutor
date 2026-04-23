/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Fixed: Capture and reliably trigger the unsubscribe function on unmount
    const unsubscribe = useMasteryStore.getState().syncFromCloud();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
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
      />
      <ChatSession
        isActive={isChatOpen}
        onEndSession={handleEndSession}
        pendingPrompt={pendingPrompt}
        clearPrompt={handleClearPrompt}
      />
    </>
  );
}
