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

import { useChatStore } from './store/chatStore';
import { detectSessionTitle } from './services/linaService';

export type AppPanel = 'profile' | 'settings' | 'instructions' | 'achievements' | 'logbook';

export default function App() {
  const { user, loading } = useAuthStore();
  const { hasCompletedSetup, isMainProfile } = useMasteryStore();
  const rawSessions = useChatStore(s => s.sessions);
  const { addSession, removeSession, updateSession } = useChatStore();

  const chatSessions = Array.isArray(rawSessions) ? rawSessions : [];

  const [activePanels, setActivePanels] = useState<AppPanel[]>([]);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(
    () => localStorage.getItem('tp_sandbox_mode') === 'true'
  );

  // Fallback for crypto.randomUUID in non-secure contexts
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
  };

  // Validate localStorage data on mount to fix any corruption
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tp-tutor-mastery');
      if (stored) {
        const data = JSON.parse(stored);
        let corrupted = false;

        // Check if critical arrays are corrupted
        if (data.commonPhrases && !Array.isArray(data.commonPhrases)) {
          console.warn('Corrupted commonPhrases detected in localStorage, clearing...');
          corrupted = true;
        }
        if (data.songs && !Array.isArray(data.songs)) {
          console.warn('Corrupted songs detected in localStorage, clearing...');
          corrupted = true;
        }
        if (data.savedPhrases && !Array.isArray(data.savedPhrases)) {
          console.warn('Corrupted savedPhrases detected in localStorage, clearing...');
          corrupted = true;
        }

        // If data is corrupted, clear it to force a fresh reload
        if (corrupted) {
          localStorage.removeItem('tp-tutor-mastery');
          window.location.reload();
        }
      }

      // Also validate chat storage
      const chatStored = localStorage.getItem('tp-tutor-chats');
      if (chatStored) {
        const chatData = JSON.parse(chatStored);
        if (chatData.state && !Array.isArray(chatData.state.sessions)) {
           console.warn('Corrupted chat sessions detected, clearing...');
           localStorage.removeItem('tp-tutor-chats');
        }
      }
    } catch (err) {
      console.error('Error validating localStorage:', err);
    }
  }, []);

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
    addSession({
      id: generateId(),
      title: detectSessionTitle(prompt),
      isMinimized: false,
      pendingPrompt: prompt,
      messages: [],
      history: [],
      sessionDeltas: [],
      context: 'GENERAL'
    });
  }, [addSession]);

  const closeChat = (id: string) => {
    removeSession(id);
  };

  const toggleMinimizeChat = (id: string) => {
    const session = chatSessions.find(s => s.id === id);
    if (session) {
      updateSession(id, { isMinimized: !session.isMinimized });
    }
  };

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
    <div className="app-container" style={{ position: 'relative', paddingTop: isSandboxMode ? '24px' : 0 }}>
      {isSandboxMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '24px',
          background: 'var(--gold)',
          color: 'black',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          pointerEvents: 'none'
        }}>
          Sandbox Mode Enabled — Local Changes Only
        </div>
      )}
      <Dashboard 
        activePanels={activePanels}
        onTogglePanel={togglePanel}
        onAskLina={handleAskLina}
        isSandboxMode={isSandboxMode}
        chatCount={chatSessions.length}
      />

      <AnimatePresence>
        {activePanels.map(panel => (
          <ModalWrapper key={panel} onClose={() => togglePanel(panel)}>
             {panel === 'profile' && <UserProfilePanel onClose={() => togglePanel('profile')} />}
             {panel === 'settings' && <SettingsPanel isOpen={true} onClose={() => togglePanel('settings')} isSandboxMode={isSandboxMode} setIsSandboxMode={setIsSandboxMode} onOpenLogbook={() => togglePanel('logbook')} />}
             {panel === 'achievements' && <AchievementsPanel onClose={() => togglePanel('achievements')} />}
             {panel === 'instructions' && <InstructionsPanel isOpen={true} onClose={() => togglePanel('instructions')} />}
             {panel === 'logbook' && <LogbookPanel onClose={() => togglePanel('logbook')} />}
          </ModalWrapper>
        ))}
      </AnimatePresence>

      <div className="chat-dock" style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        left: 0,
        height: 'var(--header-height)',
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 20px',
        gap: '12px',
        pointerEvents: 'none',
        zIndex: 7000 
      }}>
        {chatSessions.filter(s => s.isMinimized).map((session) => (
          <div 
            key={session.id}
            onClick={() => toggleMinimizeChat(session.id)}
            style={{ 
              background: 'var(--surface-opaque)',
              border: '1px solid var(--gold)',
              borderRadius: '8px 8px 0 0',
              padding: '8px 16px',
              color: 'var(--gold)',
              fontSize: '0.7rem',
              fontWeight: 900,
              cursor: 'pointer',
              pointerEvents: 'auto',
              boxShadow: '0 -4px 15px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minWidth: '150px',
              height: '40px'
            }}
          >
            <span>💬</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title?.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="chat-manager-layer" style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 6500 }}>
        <AnimatePresence>
          {chatSessions.filter(s => !s.isMinimized).map((session) => (
            <ChatSession 
              key={session.id}
              sessionId={session.id}
              isActive={true}
              isMinimized={false}
              onMinimize={() => toggleMinimizeChat(session.id)}
              onEndSession={() => closeChat(session.id)} 
              isSandboxMode={isSandboxMode} 
              pendingPrompt={session.pendingPrompt}
              clearPrompt={() => updateSession(session.id, { pendingPrompt: null })}
              style={{ 
                pointerEvents: 'auto',
                position: 'fixed',
                inset: 0,
                left: 'auto',
                width: '100%',
                maxWidth: '500px'
              }}
            />
          ))}
        </AnimatePresence>
      </div>

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
