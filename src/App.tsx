import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import SettingsDrawer from './components/SettingsDrawer';
import UserProfileDrawer from './components/UserProfileDrawer';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [activeView, setActiveView] = useState<'none' | 'chat' | 'settings' | 'profile'>('none');
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState(true);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  const handleAskLina = (prompt: string) => {
    setPendingPrompt(prompt);
    setActiveView('chat'); 
  };

  return (
    <div className={activeView !== 'none' ? 'has-active-drawer' : ''}>
      <Dashboard 
        onStartSession={() => setActiveView('chat')} 
        onOpenSettings={() => setActiveView('settings')}
        onOpenProfile={() => setActiveView('profile')}
        onAskLina={handleAskLina} 
        isSandboxMode={isSandboxMode}
      />
      
      <ChatSession 
        isActive={activeView === 'chat'} 
        onEndSession={() => setActiveView('none')} 
        pendingPrompt={pendingPrompt}
        clearPrompt={() => setPendingPrompt(null)}
      />

      {activeView === 'settings' && (
        <SettingsDrawer 
          onClose={() => setActiveView('none')} 
          isSandboxMode={isSandboxMode} 
          setIsSandboxMode={setIsSandboxMode} 
        />
      )}

      {activeView === 'profile' && (
        <UserProfileDrawer 
          onClose={() => setActiveView('none')} 
        />
      )}
    </div>
  );
}
