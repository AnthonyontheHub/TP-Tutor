/* src/App.tsx */
import { useState, useEffect, useCallback, useRef } from 'react';
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

function ResizableWrapper({ 
  children, 
  onClose, 
  initialWidth = 400, 
  side = 'right' 
}: { 
  children: React.ReactNode; 
  onClose: () => void; 
  initialWidth?: number;
  side?: 'left' | 'right';
}) {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const startResizing = useCallback((e: React.PointerEvent) => {
    isResizing.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const stopResizing = useCallback((e: React.PointerEvent) => {
    isResizing.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const resize = useCallback((e: React.PointerEvent) => {
    if (!isResizing.current) return;
    const newWidth = side === 'right' 
      ? window.innerWidth - e.clientX 
      : e.clientX;
    setWidth(Math.max(300, Math.min(newWidth, 800)));
  }, [side]);

  return (
    <div className="side-panel-wrapper" style={{ width, position: 'relative', height: '100%', flexShrink: 0 }}>
      <div 
        className={`resize-handle resize-handle--${side === 'right' ? 'left' : 'right'}`}
        onPointerDown={startResizing}
        onPointerUp={stopResizing}
        onPointerMove={resize}
      />
      {children}
    </div>
  );
}

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

  const isProfileOpen = activePanels.includes('profile');
  const otherPanels = activePanels.filter(p => p !== 'profile');

  return (
    <div className="app-container">
      <AnimatePresence>
        {isProfileOpen && (
          <ResizableWrapper key="profile-wrapper" side="left" onClose={() => closePanel('profile')}>
            <UserProfilePanel isOpen={true} onClose={() => closePanel('profile')} />
          </ResizableWrapper>
        )}
      </AnimatePresence>

      <Dashboard
        onTogglePanel={togglePanel}
        activePanels={activePanels}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />

      <div className="side-panels-container">
        <AnimatePresence mode="popLayout">
          {otherPanels.map(panel => {
            if (panel === 'settings') return (
              <ResizableWrapper key="settings-wrapper" onClose={() => closePanel('settings')}>
                <SettingsPanel 
                  isOpen={true} 
                  onClose={() => closePanel('settings')} 
                  isSandboxMode={isSandboxMode} 
                  setIsSandboxMode={setIsSandboxMode} 
                />
              </ResizableWrapper>
            );
            if (panel === 'instructions') return (
              <ResizableWrapper key="instructions-wrapper" onClose={() => closePanel('instructions')}>
                <InstructionsPanel isOpen={true} onClose={() => closePanel('instructions')} />
              </ResizableWrapper>
            );
            if (panel === 'achievements') return (
              <ResizableWrapper key="achievements-wrapper" onClose={() => closePanel('achievements')}>
                <AchievementsPanel onClose={() => closePanel('achievements')} />
              </ResizableWrapper>
            );
            if (panel === 'chat') return (
              <ResizableWrapper key="chat-wrapper" onClose={() => closePanel('chat')}>
                <ChatSession
                  isActive={true}
                  onEndSession={() => closePanel('chat')}
                  pendingPrompt={pendingPrompt}
                  clearPrompt={handleClearPrompt}
                  isSandboxMode={isSandboxMode}
                />
              </ResizableWrapper>
            );
            return null;
          })}
        </AnimatePresence>
      </div>

      {!hasCompletedSetup && <SetupScreen />}
    </div>
  );
}
