/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import LoginPage from './components/LoginPage';
import UserProfileDrawer from './components/UserProfileDrawer';
import SettingsDrawer from './components/SettingsDrawer';
import Instructions from './components/Instructions';
import AchievementsDrawer from './components/AchievementsDrawer';
import SetupScreen from './components/SetupScreen';
import { useMasteryStore } from './store/masteryStore';
import { useAuthStore } from './store/authStore';

export type AppView = 'dashboard' | 'profile' | 'settings' | 'instructions' | 'achievements';

export default function App() {
  const { user, loading } = useAuthStore();
  const { studentName, hasCompletedSetup } = useMasteryStore();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Req 8: Default to true — sandbox mode is on unless the user explicitly turned it off.
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

  const handleAskLina = useCallback((prompt: string) => {
    setPendingPrompt(prompt);
    setIsChatOpen(true);
  }, []);

  const handleClearPrompt = useCallback(() => setPendingPrompt(null), []);
  const handleEndSession = useCallback(() => setIsChatOpen(false), []);
  const handleStartSession = useCallback(() => setIsChatOpen(true), []);

  if (loading) {
    return (
      <div style={{ 
        height: '100dvh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg)', 
        color: 'var(--text)' 
      }}>
        <div style={{ fontWeight: 900, letterSpacing: '0.1em' }}>TENPO PONA...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  // Determine if we need to show setup.
  // We show it if setup isn't completed.
  const showSetup = !hasCompletedSetup;

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          onStartSession={handleStartSession}
          onAskLina={handleAskLina}
          isSandboxMode={isSandboxMode}
          setIsSandboxMode={setIsSandboxMode}
          setView={setCurrentView}
        />
      )}

      {currentView === 'profile' && (
        <UserProfileDrawer isOpen={true} onClose={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'settings' && (
        <SettingsDrawer 
          isOpen={true} 
          onClose={() => setCurrentView('dashboard')} 
          isSandboxMode={isSandboxMode} 
          setIsSandboxMode={setIsSandboxMode} 
        />
      )}

      {currentView === 'instructions' && (
        <Instructions isOpen={true} onClose={() => setCurrentView('dashboard')} />
      )}

      {currentView === 'achievements' && (
        <AchievementsDrawer onClose={() => setCurrentView('dashboard')} />
      )}

      {showSetup && <SetupScreen />}

      <ChatSession
        isActive={isChatOpen}
        onEndSession={handleEndSession}
        pendingPrompt={pendingPrompt}
        clearPrompt={handleClearPrompt}
        isSandboxMode={isSandboxMode}
      />
    </>
  );
}
