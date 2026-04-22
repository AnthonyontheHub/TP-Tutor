import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Fixed: Capture and return the unsubscribe function with error handling
      const unsubscribe = useMasteryStore.getState().syncFromCloud();
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (err) {
      console.error("Critical: Failed to sync from cloud:", err);
      setHasError(true);
    }
  }, []);

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true); 
  };

  if (hasError) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#ff4444', textAlign: 'center', padding: '20px' }}>
        <div>
          <h1>Sync Error</h1>
          <p>Failed to connect to the database. Please check your internet connection or Firebase configuration.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white' }}>RETRY</button>
        </div>
      </div>
    );
  }

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
