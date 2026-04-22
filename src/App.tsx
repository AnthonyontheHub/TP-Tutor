import { useState, useEffect, useCallback } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Fixed: Capture and return the unsubscribe function correctly
    const unsubscribe = useMasteryStore.getState().syncFromCloud();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true); 
  };

  // Fixed: Memoizing clearPrompt to prevent stale closures / infinite re-renders in children
  const clearPrompt = useCallback(() => {
    setPendingPrompt(null);
  }, []);

  return (
    <>
      <Dashboard 
        onStartSession={() => setIsChatOpen(true)} 
        onAskLina={handleAskLina} 
      />
      <ChatSession 
        isActive={isChatOpen} 
        onEndSession={() => setIsChatOpen(false)} 
        pendingPrompt={pendingPrompt}
        clearPrompt={clearPrompt}
      />
    </>
  );
}
