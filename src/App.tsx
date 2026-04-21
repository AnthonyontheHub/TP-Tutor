import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState(true); // Default to Sandbox ON

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true); 
  };

  return (
    <>
      <Dashboard 
        onStartSession={() => setIsChatOpen(true)} 
        onAskLina={handleAskLina} 
        // Note: Dashboard currently manages its own internal Sandbox state.
        // In a future cleanup, we could lift this to App state if needed.
      />

      <ChatSession 
        isActive={isChatOpen} 
        onEndSession={() => setIsChatOpen(false)} 
        pendingPrompt={pendingPrompt}
        clearPrompt={() => setPendingPrompt(null)}
        isSandboxMode={isSandboxMode} 
      />
    </>
  );
}
