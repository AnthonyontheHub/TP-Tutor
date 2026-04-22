/* src/App.tsx */
import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Safety check: ensure syncFromCloud exists and is a function
    const store = useMasteryStore.getState();
    
    if (typeof store.syncFromCloud === 'function') {
      const unsubscribe = store.syncFromCloud();
      
      return () => {
        // Only call unsubscribe if it is actually returned as a function
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
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
      />
      <ChatSession 
        isActive={isChatOpen} 
        onEndSession={() => setIsChatOpen(false)} 
        pendingPrompt={pendingPrompt}
        clearPrompt={() => setPendingPrompt(null)}
      />
    </>
  );
}
