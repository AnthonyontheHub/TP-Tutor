/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import LoginPage from './components/LoginPage';
import UserProfilePanel from './components/UserProfilePanel';
import SettingsPanel from './components/SettingsPanel';
import InstructionsPanel from './components/InstructionsPanel';
import AchievementsPanel from './components/AchievementsPanel';
import SetupScreen from './components/SetupScreen';
import { useMasteryStore } from './store/masteryStore';
import { useAuthStore } from './store/authStore';
import { AnimatePresence } from 'framer-motion';

export type AppPanel = 'profile' | 'settings' | 'instructions' | 'achievements' | 'chat';

export default function App() {
  const { user, loading } = useAuthStore();
  const { hasCompletedSetup } = useMasteryStore();
  
  // Track multiple open panels
  const [activePanels, setActivePanels] = useState<AppPanel[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(
    () => localStorage.getItem('tp_sandbox_mode') !== 'false'
  );

  useEffect(() => {
    localStorage.setItem('tp_sandbox_mode', String(isSandboxMode));
  }, [isSandboxMode]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe: any;
    const setupSync = async () => {
      unsubscribe = await useMasteryStore.getState().syncFromCloud(
        user.uid, 
        user.displayName || undefined,
        user.photoURL || undefined
      );
    };
    setupSync();
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [user]);

  const togglePanel = useCallback((panel: AppPanel) => {
    setActivePanels(prev => 
      prev.includes(panel) 
        ? prev.filter(p => p !== panel) 
        : [...prev, panel]
    );
  }, []);

  const closePanel = useCallback((panel: AppPanel) => {
    setActivePanels(prev => prev.filter(p => p !== panel));
  }, []);

  const handleAskLina = useCallback((prompt: string) => {
    setPendingPrompt(prompt);
    if (!activePanels.includes('chat')) {
      setActivePanels(prev => [...prev, 'chat']);
    }
  }, [activePanels]);

  const handleClearPrompt = useCallback(() => setPendingPrompt(null), []);

  if (loading) {
    return (
      <div style={{ 
        height: '100dvh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' 
      }}>
        <div style={{ fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>NEURAL LINK ESTABLISHED...</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app-container">
      <Dashboard
        onTogglePanel={togglePanel}
        activePanels={activePanels}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />

      <div className="side-panels-container">
        <AnimatePresence mode="popLayout">
          {activePanels.map(panel => {
            if (panel === 'profile') return <UserProfilePanel key="profile" isOpen={true} onClose={() => closePanel('profile')} />;
            if (panel === 'settings') return (
              <SettingsPanel 
                key="settings"
                isOpen={true} 
                onClose={() => closePanel('settings')} 
                isSandboxMode={isSandboxMode} 
                setIsSandboxMode={setIsSandboxMode} 
              />
            );
            if (panel === 'instructions') return <InstructionsPanel key="instructions" isOpen={true} onClose={() => closePanel('instructions')} />;
            if (panel === 'achievements') return <AchievementsPanel key="achievements" onClose={() => closePanel('achievements')} />;
            if (panel === 'chat') return (
              <ChatSession
                key="chat"
                isActive={true}
                onEndSession={() => closePanel('chat')}
                pendingPrompt={pendingPrompt}
                clearPrompt={handleClearPrompt}
                isSandboxMode={isSandboxMode}
              />
            );
            return null;
          })}
        </AnimatePresence>
      </div>

      {!hasCompletedSetup && <SetupScreen />}
    </div>
  );
}
