import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

type View = 'dashboard' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleStartSession = () => {
    setHasOpenedChat(true);
    setView('chat');
  };

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    handleStartSession(); 
  };

  return (
    <>
      <div style={{ display: view === 'dashboard' ? 'contents' : 'none' }}>
        <Dashboard onStartSession={handleStartSession} onAskLina={handleAskLina} />
      </div>

      {hasOpenedChat && (
        <div style={{ display: view === 'chat' ? 'contents' : 'none' }}>
          <ChatSession 
            isActive={view === 'chat'} 
            onEndSession={() => setView('dashboard')} 
            pendingPrompt={pendingPrompt}
            clearPrompt={() => setPendingPrompt(null)}
          />
        </div>
      )}
    </>
  );
}
