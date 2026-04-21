import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

type View = 'dashboard' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleStartSession = () => {
    setView('chat');
  };

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    handleStartSession(); 
  };

  return (
    <>
      {/* Dashboard is now always rendered in the background */}
      <Dashboard onStartSession={handleStartSession} onAskLina={handleAskLina} />

      {/* ChatSession handles its own slide-in animation using isActive */}
      <ChatSession 
        isActive={view === 'chat'} 
        onEndSession={() => setView('dashboard')} 
        pendingPrompt={pendingPrompt}
        clearPrompt={() => setPendingPrompt(null)}
      />
    </>
  );
}
