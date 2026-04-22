import { useState, useEffect } from 'react'; 
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import SettingsDrawer from './components/SettingsDrawer';
import UserProfileDrawer from './components/UserProfileDrawer';
import { useMasteryStore } from './store/masteryStore'; 

export default function App() {
  const [activeView, setActiveView] = useState<'none' | 'chat' | 'settings' | 'profile'>('none');
  const [isSandboxMode, setIsSandboxMode] = useState(true);

  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  // Controls the dashboard shift
  useEffect(() => {
    if (activeView !== 'none') {
      document.body.classList.add('has-active-drawer');
    } else {
      document.body.classList.remove('has-active-drawer');
    }
  }, [activeView]);

  return (
    <>
      <Dashboard 
        onStartSession={() => setActiveView('chat')} 
        onOpenSettings={() => setActiveView('settings')}
        onOpenProfile={() => setActiveView('profile')}
        onAskLina={() => setActiveView('chat')} 
        isSandboxMode={isSandboxMode}
      />
      
      <ChatSession 
        isActive={activeView === 'chat'} 
        onEndSession={() => setActiveView('none')} 
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
    </>
  );
}
