import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [activePane, setActivePane] = useState<'none' | 'chat' | 'settings' | 'profile' | 'detail'>('none');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    setActivePane('chat'); 
  };

  return (
    <div className={activePane !== 'none' ? 'has-active-sidebar' : ''} style={{ display: 'flex', width: '100%' }}>
      <Dashboard 
        activePane={activePane}
        setActivePane={setActivePane}
        onAskLina={handleAskLina} 
      />
      
      <ChatSession 
        isActive={activePane === 'chat'} 
        onEndSession={() => setActivePane('none')} 
        pendingPrompt={pendingPrompt}
        clearPrompt={() => setPendingPrompt(null)}
      />
    </div>
  );
}
