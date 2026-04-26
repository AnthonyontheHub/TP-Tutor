/* src/App.tsx */
import { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SetupScreen from './components/SetupScreen';
import { useMasteryStore } from './store/masteryStore';
import { useAuthStore } from './store/authStore';

import UserProfilePanel from './components/UserProfilePanel';
import SettingsPanel from './components/SettingsPanel';
import InstructionsPanel from './components/InstructionsPanel';
import AchievementsPanel from './components/AchievementsPanel';
import LogbookPanel from './components/LogbookPanel';
import ChatSession from './components/ChatSession';

import { AnimatePresence, motion } from 'framer-motion';

export type AppPanel = 'profile' | 'settings' | 'instructions' | 'achievements' | 'chat' | 'logbook';

export default function App() {
  const { user, loading } = useAuthStore();
  const { hasCompletedSetup, isMainProfile } = useMasteryStore();
  
  const [activePanels, setActivePanels] = useState<AppPanel[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(
    () => localStorage.getItem('tp_sandbox_mode') === 'true'
  );

  // Enforce Sandbox Mode for any profile that is not the main user
  useEffect(() => {
    if (!isMainProfile) setIsSandboxMode(true);
  }, [isMainProfile]);

  useEffect(() => {
    localStorage.setItem('tp_sandbox_mode', String(isSandboxMode));
  }, [isSandboxMode]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      const result = await useMasteryStore.getState().syncFromCloud(
        user.uid,
        user.displayName || undefined,
        user.photoURL || undefined
      );
      if (typeof result !== 'function') return;
      // If the component unmounted (or user changed) before syncFromCloud
      // resolved, tear the listener down immediately — otherwise it leaks.
      if (cancelled) result();
      else unsubscribe = result;
    })();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const togglePanel = useCallback((panel: AppPanel) => {
    setActivePanels(prev => 
      prev.includes(panel) ? prev.filter(p => p !== panel) : [...prev, panel]
    );
  }, []);

  const handleAskLina = useCallback((prompt: string) => {
    setPendingPrompt(prompt);
    if (!activePanels.includes('chat')) {
      setActivePanels(prev => [...prev, 'chat']);
    }
  }, [activePanels]);

  if (loading) {
    return (
      <div style={{ 
        height: '100dvh', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' 
      }}>
        <div style={{ fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)' }}>jan LINA IS READY...</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <Dashboard 
        activePanels={activePanels}
        onTogglePanel={togglePanel}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />

      <AnimatePresence>
        {activePanels.filter(p => p !== 'chat').map(panel => (
          <ModalWrapper key={panel} onClose={() => togglePanel(panel)}>
             {panel === 'profile' && <UserProfilePanel isOpen={true} onClose={() => togglePanel('profile')} />}
             {panel === 'settings' && <SettingsPanel isOpen={true} onClose={() => togglePanel('settings')} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} onOpenLogbook={() => togglePanel('logbook')} />}
             {panel === 'achievements' && <AchievementsPanel onClose={() => togglePanel('achievements')} />}
             {panel === 'instructions' && <InstructionsPanel isOpen={true} onClose={() => togglePanel('instructions')} />}
             {panel === 'logbook' && <LogbookPanel onClose={() => togglePanel('logbook')} />}
          </ModalWrapper>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {activePanels.includes('chat') && (
          <ChatSession 
            isActive={true} 
            onEndSession={() => togglePanel('chat')} 
            isSandboxMode={isSandboxMode} 
            pendingPrompt={pendingPrompt}
            clearPrompt={() => setPendingPrompt(null)}
          />
        )}
      </AnimatePresence>

      {!hasCompletedSetup && <SetupScreen />}
    </div>
  );
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
