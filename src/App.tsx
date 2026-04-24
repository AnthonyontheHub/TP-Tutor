/* src/App.tsx */
import { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(
    () => localStorage.getItem('tp_sandbox_mode') !== 'false'
  );

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
