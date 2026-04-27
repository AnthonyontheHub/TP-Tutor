/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage } from '../store/chatStore';
import {
  buildSystemPrompt, streamCompletion, stripProposedChanges,
  parseProposedChanges, resolveApiKey, fetchSessionRecap,
  fetchQuickTranslation, stringifyUserContext, detectSessionTitle
} from '../services/linaService';

interface Props {
  sessionId: string;
  onEndSession: () => void;
  onMinimize?: () => void;
  isActive: boolean;
  isMinimized?: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
  isSandboxMode: boolean;
  style?: React.CSSProperties;
}

const HISTORY_WINDOW = 10;
const SANDBOX_RESPONSE = '[OFFLINE PROTOCOL]: o toki! I am in sandbox mode. Interaction simulated.';

export default function ChatSession({ sessionId, onEndSession, onMinimize, isActive, isMinimized, pendingPrompt, clearPrompt, isSandboxMode, style }: Props) {
  const session = useChatStore(state => state.sessions.find(s => s.id === sessionId));
  const updateSession = useChatStore(state => state.updateSession);

  const messages = session?.messages || [];
  const history = session?.history || [];
  const sessionDeltas = session?.sessionDeltas || [];
  const chatContext = session?.context || 'GENERAL';

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [translateBubble, setTranslateBubble] = useState<{
    text: string;
    top: number;
    left: number;
    result?: string;
    loading?: boolean;
  } | null>(null);

  const updateVocabStatus   = useMasteryStore(s => s.updateVocabStatus);
  const setLastUpdated      = useMasteryStore(s => s.setLastUpdated);
  const studentName         = useMasteryStore(s => s.studentName);
  const profile             = useMasteryStore(s => s.profile);

  const displayName = profile.tpName || profile.tokiPonaName || studentName || 'ANTHONY';

  const messagesEndRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && !isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isActive, isMinimized]);

  useEffect(() => {
    const handleGlobalClick = () => setTranslateBubble(null);
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (!text) return;
    setTimeout(() => {
      try {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) return;
        const lastRect = rects[rects.length - 1];
        setTranslateBubble({ text, top: lastRect.top - 45, left: lastRect.left + (lastRect.width / 2) });
      } catch (err) { console.error('Selection error:', err); }
    }, 10);
  };

  const handleTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!translateBubble || translateBubble.loading) return;
    setTranslateBubble(prev => prev ? { ...prev, loading: true } : null);
    try {
      const key = resolveApiKey();
      const result = await fetchQuickTranslation(key, translateBubble.text);
      setTranslateBubble(prev => prev ? { ...prev, loading: false, result: result || 'Could not translate.' } : null);
    } catch {
      setTranslateBubble(prev => prev ? { ...prev, loading: false, result: 'Error translating.' } : null);
    }
  };

  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    
    // Detect context
    let newContext: 'GENERAL' | 'DAILY REVIEW' | 'GRAMMAR CHECK' = 'GENERAL';
    const low = pendingPrompt.toLowerCase();
    if (low.includes('daily review')) newContext = 'DAILY REVIEW';
    else if (low.includes('explain the grammar')) newContext = 'GRAMMAR CHECK';
    else if (low.includes('start a lesson')) newContext = 'GRAMMAR CHECK';
    else if (low.includes('deep-dive')) newContext = 'GRAMMAR CHECK';

    updateSession(sessionId, { 
      context: newContext,
      title: detectSessionTitle(pendingPrompt),
      messages: [],
      history: [],
      sessionDeltas: []
    });
    
    setInput('');
    const key = resolveApiKey();
    
    // PROACTIVE INITIALIZATION:
    // If it's a [SYSTEM: ...] prompt, treat it as hidden context and trigger jan Lina
    const isProactive = pendingPrompt.startsWith('[SYSTEM:');
    
    if (isProactive) {
      triggerProactiveGreeting(pendingPrompt, key);
    } else {
      if (key || isSandboxMode) { sendToLina(pendingPrompt, key); }
    }
    
    clearPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt, isSandboxMode, clearPrompt]);

  async function triggerProactiveGreeting(context: string, overrideKey?: string) {
    if (!isSandboxMode && !resolveApiKey(overrideKey)) return;
    setIsLoading(true);
    const assistantId = crypto.randomUUID();
    
    const initialAssistantMsg: ChatMessage = { id: assistantId, role: 'assistant', displayContent: '· · ·', raw: '' };
    updateSession(sessionId, { messages: [initialAssistantMsg] });
    
    if (isSandboxMode) {
      const finalMsg = { ...initialAssistantMsg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE };
      updateSession(sessionId, { 
        messages: [finalMsg],
        history: [{ role: 'assistant', content: SANDBOX_RESPONSE }]
      });
      setIsLoading(false);
      return;
    }

    try {
      const key = resolveApiKey(overrideKey);
      const state = useMasteryStore.getState();
      const userContext = stringifyUserContext(state.profile, state.lore);
      const sys = buildSystemPrompt(state.vocabulary, [], displayName, userContext);
      
      const triggerMsg = `[SYSTEM: Start the session now based on this context: ${context}. Greet the student and proceed naturally.]`;
      let full = '';
      for await (const chunk of streamCompletion(key, sys, [{ role: 'user', content: triggerMsg }])) {
        full += chunk;
        const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId);
        if (!currentSession) break;

        updateSession(sessionId, {
          messages: currentSession.messages.map(msg => msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg)
        });
      }
      updateSession(sessionId, {
        history: [
          { role: 'user', content: triggerMsg },
          { role: 'assistant', content: full }
        ]
      });
    } catch (e) {
      console.error(e);
      updateSession(sessionId, {
        messages: [{ id: assistantId, role: 'assistant', displayContent: "pakala!" }]
      });
    } finally { setIsLoading(false); }
  }

  async function handleEndSession() {
    if (!window.confirm("Are you sure you want to end this session? Conversation history will be lost.")) return;
    const deltas = sessionDeltas;
    if (deltas.length === 0 || isSandboxMode) { onEndSession(); return; }
    for (const change of deltas) {
      if (change.type === 'vocab') {
        updateVocabStatus(change.id, change.newStatus);
      }
    }
    setLastUpdated(new Date().toLocaleDateString());
    const key = resolveApiKey();
    const recapId = crypto.randomUUID();
    
    updateSession(sessionId, {
      messages: [...messages, { id: recapId, role: 'assistant', displayContent: '· · ·' }]
    });
    
    setIsLoading(true);
    const recap = await fetchSessionRecap(key, deltas);
    
    updateSession(sessionId, {
      messages: (session?.messages || []).map(msg => msg.id === recapId ? { ...msg, displayContent: recap } : msg)
    });
    
    setIsLoading(false);
    await new Promise(r => setTimeout(r, 2200));
    
    updateSession(sessionId, { sessionDeltas: [] });
    onEndSession();
  }

  async function sendToLina(txt: string, overrideKey?: string) {
    if (isLoading || !txt.trim()) return;
    if (!isSandboxMode && !resolveApiKey(overrideKey)) return;
    setIsLoading(true);
    setInput('');

    const newUserMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', displayContent: txt };
    const assistantId = crypto.randomUUID();
    const newAssistantMsg: ChatMessage = { id: assistantId, role: 'assistant', displayContent: '· · ·', raw: '' };
    const updatedMessages = [...messages, newUserMsg, newAssistantMsg];

    updateSession(sessionId, {
      messages: updatedMessages,
      history: [...history, { role: 'user', content: txt }]
    });

    if (isSandboxMode) {
      updateSession(sessionId, {
        messages: updatedMessages.map(msg => msg.id === assistantId ? { ...msg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE } : msg),
        history: [...history, { role: 'user', content: txt }, { role: 'assistant', content: SANDBOX_RESPONSE }]
      });
      setIsLoading(false);
      return;
    }

    try {
      const key = resolveApiKey(overrideKey);
      const state = useMasteryStore.getState();
      const userContext = stringifyUserContext(state.profile, state.lore);
      const sys = buildSystemPrompt(state.vocabulary, [], displayName, userContext);
      const windowedHistory = [...history, { role: 'user', content: txt }].slice(-HISTORY_WINDOW);
      let full = '';
      for await (const chunk of streamCompletion(key, sys, windowedHistory)) {
        full += chunk;
        const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId);
        if (!currentSession) break; // User closed chat

        updateSession(sessionId, {
          messages: currentSession.messages.map(msg => 
            msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg
          )
        });
      }
      const changes = parseProposedChanges(full);
      const updatedMessages = (useChatStore.getState().sessions.find(s => s.id === sessionId)?.messages || []).map(msg => 
        msg.id === assistantId ? { ...msg, proposedChanges: changes || undefined } : msg
      );
      
      const newDeltas = [...sessionDeltas];
      if (changes && changes.length > 0) {
        newDeltas.push(...changes);
      }

      updateSession(sessionId, {
        messages: updatedMessages,
        history: [...history, { role: 'user', content: txt }, { role: 'assistant', content: full }],
        sessionDeltas: newDeltas
      });
    } catch (e) {
      console.error(e);
      updateSession(sessionId, {
        messages: (useChatStore.getState().sessions.find(s => s.id === sessionId)?.messages || []).map(msg => 
          msg.id === assistantId ? { ...msg, displayContent: "pakala!" } : msg
        )
      });
    } finally { setIsLoading(false); }
  }

  return (
    <LazyMotion features={domMax}>
      <m.div
        className="chat-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0, height: isMinimized ? 'var(--header-height)' : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--surface-opaque)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          bottom: 0,
          right: 0,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--border)',
          zIndex: 6000,
          ...style
        }}
      >
        <header style={{ 
          height: 'var(--header-height)', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(5,5,5,0.95)',
          backdropFilter: 'var(--glass)'
        }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)', margin: 0 }}>{chatContext === 'GENERAL' ? 'jan LINA LINK' : chatContext}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onMinimize}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 900 }}
            >
              {isMinimized ? 'EXPAND' : 'MINIMIZE'}
            </button>
            <button 
              onClick={handleEndSession} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--gold)', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✕
            </button>
          </div>
        </header>

        {translateBubble && (
          <div onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', top: translateBubble.top, left: translateBubble.left, transform: 'translateX(-50%)', zIndex: 7000, background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '0.8rem', color: 'white', minWidth: '100px', textAlign: 'center' }}>
            {translateBubble.result ? <div style={{ lineHeight: '1.4' }}>{translateBubble.result}</div> : <button onClick={handleTranslateClick} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', color: 'black', padding: '4px 8px', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem' }}>{translateBubble.loading ? '...' : 'TRANSLATE'}</button>}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: isMinimized ? 'none' : 'block' }}>
          {isSandboxMode && <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--gold)', borderRadius: '2px', fontSize: '0.7rem', color: 'var(--gold)', textAlign: 'center' }}>OFFLINE PROTOCOL ACTIVE</div>}
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '24px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ color: 'var(--gold)', fontSize: '0.6rem', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>{msg.role === 'assistant' ? 'jan LINA' : (displayName.toUpperCase())}</div>
              <div style={{ background: msg.role === 'assistant' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 191, 0, 0.1)', padding: '12px', borderRadius: '2px', border: '1px solid var(--border)', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '90%', fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.displayContent || (isLoading && msg.role === 'assistant' ? '· · ·' : '')}</div>
              {msg.proposedChanges && msg.proposedChanges.map((c) => <div key={`${c.type}_${c.id}`} style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700 }}>+ CALIBRATING: {c.id} → {c.newStatus}</div>)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', background: 'rgba(5,5,5,0.5)', borderTop: '1px solid var(--border)', display: isMinimized ? 'none' : 'flex', gap: '8px' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)} 
            placeholder={chatContext === 'GENERAL' ? "Ask jan Lina something..." : "Type your response..."} 
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px', color: 'white', outline: 'none', fontSize: '0.9rem' }} 
          />
          <button onClick={() => sendToLina(input)} disabled={isLoading} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', padding: '0 20px', color: 'black', fontWeight: 900, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}>{isLoading ? '...' : 'SEND'}</button>
        </div>
      </m.div>
    </LazyMotion>
  );
}
