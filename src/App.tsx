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
import ChatSession from './components/ChatSession';

import { AnimatePresence, motion } from 'framer-motion';

export type AppPanel = 'profile' | 'settings' | 'instructions' | 'achievements' | 'chat' | 'roadmap';

export default function App() {
  const { user, loading } = useAuthStore();
  const { hasCompletedSetup } = useMasteryStore();
  
  const [activePanels, setActivePanels] = useState<AppPanel[]>([]);
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
      prev.includes(panel) ? prev.filter(p => p !== panel) : [...prev, panel]
    );
  }, []);

  const handleAskLina = useCallback((prompt: string) => {
    if (!activePanels.includes('chat')) {
      setActivePanels(prev => [...prev, 'chat']);
    }
    // Logic for pushing prompt to chat can be added here if needed
    console.log("Asking Lina:", prompt);
  }, [activePanels]);

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
    <div className="app-container" style={{ position: 'relative' }}>
      <Dashboard 
        activePanels={activePanels}
        onTogglePanel={togglePanel}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        setIsSandboxMode={setIsSandboxMode}
      />

      <AnimatePresence>
        {activePanels.map(panel => (
          <ModalWrapper key={panel} onClose={() => togglePanel(panel)}>
             {panel === 'profile' && <UserProfilePanel isOpen={true} onClose={() => togglePanel('profile')} />}
             {panel === 'settings' && <SettingsPanel isOpen={true} onClose={() => togglePanel('settings')} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} />}
             {panel === 'achievements' && <AchievementsPanel onClose={() => togglePanel('achievements')} />}
             {panel === 'instructions' && <InstructionsPanel isOpen={true} onClose={() => togglePanel('instructions')} />}
             {panel === 'chat' && <ChatSession isActive={true} onEndSession={() => togglePanel('chat')} isSandboxMode={isSandboxMode} />}
             {panel === 'roadmap' && <RoadmapModal onClose={() => togglePanel('roadmap')} />}
          </ModalWrapper>
        ))}
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

function RoadmapModal({ onClose }: { onClose: () => void }) {
  const { levels } = useMasteryStore();
  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '20px' }}>NEURAL PATHWAY ROADMAP</h1>
      {levels.map(level => (
        <div key={level.id} style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '15px' }}>{level.title}</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {level.nodes.map(m => (
              <div key={m.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{m.title}</span>
                <span style={{ color: m.status === 'active' ? 'var(--gold)' : 'inherit', fontWeight: 800 }}>{m.status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={onClose} className="btn-review" style={{ marginTop: '20px' }}>CLOSE ROADMAP</button>
    </div>
  );
}
