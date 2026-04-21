import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

type View = 'dashboard' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  // Track if chat has been opened so we don't start Lina too early
  const [hasOpenedChat, setHasOpenedChat] = useState(false);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleStartSession = () => {
    setHasOpenedChat(true);
    setView('chat');
  };

  return (
    <>
      <div style={{ display: view === 'dashboard' ? 'contents' : 'none' }}>
        <Dashboard onStartSession={handleStartSession} />
      </div>

      {hasOpenedChat && (
        <div style={{ display: view === 'chat' ? 'contents' : 'none' }}>
          <ChatSession 
            isActive={view === 'chat'} 
            onEndSession={() => setView('dashboard')} 
          />
        </div>
      )}
    </>
  );
}
