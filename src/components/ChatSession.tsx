/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import {
  buildSystemPrompt, streamCompletion, stripProposedChanges,
  parseProposedChanges, resolveApiKey, fetchSessionRecap,
  fetchQuickTranslation, stringifyUserContext
} from '../services/linaService';
import type { ProposedChange } from '../services/linaService';

interface Props {
  onEndSession: () => void;
  isActive: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
  isSandboxMode: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  raw?: string;
  proposedChanges?: ProposedChange[];
}

const HISTORY_WINDOW = 10;
const SANDBOX_RESPONSE = '[SANDBOX MODE]: o toki! I am in offline testing mode. No API tokens are being used right now.';

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt, isSandboxMode }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [translateBubble, setTranslateBubble] = useState<{
    text: string;
    top: number;
    left: number;
    result?: string;
    loading?: boolean;
  } | null>(null);

  const vocabulary          = useMasteryStore(s => s.vocabulary);
  const updateVocabStatus   = useMasteryStore(s => s.updateVocabStatus);
  const setLastUpdated      = useMasteryStore(s => s.setLastUpdated);
  const studentName         = useMasteryStore(s => s.studentName);
  const profile             = useMasteryStore(s => s.profile);
  const lore                = useMasteryStore(s => s.lore);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const historyRef      = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const sessionDeltasRef = useRef<ProposedChange[]>([]);

  useEffect(() => {
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isActive]);

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
    } catch (err) {
      setTranslateBubble(prev => prev ? { ...prev, loading: false, result: 'Error translating.' } : null);
    }
  };

  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    setMessages([]);
    setInput('');
    historyRef.current = [];
    sessionDeltasRef.current = [];
    const key = resolveApiKey();
    if (key || isSandboxMode) { sendToLina(pendingPrompt, key); }
    clearPrompt?.();
    // sendToLina is intentionally omitted: it's a stable in-component closure
    // recreated each render and including it would re-fire on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt, isSandboxMode, clearPrompt]);

  async function handleEndSession() {
    const deltas = sessionDeltasRef.current;
    if (deltas.length === 0 || isSandboxMode) { onEndSession(); return; }
    for (const change of deltas) {
      if (change.type === 'vocab') {
        updateVocabStatus(change.id, change.newStatus);
      } else {
        // Concept-level mastery isn't tracked in the vocab store yet; surface
        // it for debugging instead of silently funneling it through the vocab
        // updater (which would no-op on a non-matching id).
        console.warn('Concept status update not yet supported:', change.id, '→', change.newStatus);
      }
    }
    setLastUpdated(new Date().toLocaleDateString());
    const key = resolveApiKey();
    const recapId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: recapId, role: 'assistant', displayContent: '· · ·' }]);
    setIsLoading(true);
    const recap = await fetchSessionRecap(key, deltas);
    setMessages(prev => prev.map(msg => msg.id === recapId ? { ...msg, displayContent: recap } : msg));
    setIsLoading(false);
    await new Promise(r => setTimeout(r, 2200));
    sessionDeltasRef.current = [];
    onEndSession();
  }

  async function sendToLina(txt: string, overrideKey?: string) {
    if (isLoading || !txt.trim()) return;
    if (!isSandboxMode && !resolveApiKey(overrideKey)) return;
    setIsLoading(true);
    setInput('');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', displayContent: txt }]);
    historyRef.current.push({ role: 'user', content: txt });
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', displayContent: '', raw: '' }]);
    if (isSandboxMode) {
      setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE } : msg));
      historyRef.current.push({ role: 'assistant', content: SANDBOX_RESPONSE });
      setIsLoading(false);
      return;
    }
    try {
      const key = resolveApiKey(overrideKey);
      const state = useMasteryStore.getState();
      const userContext = stringifyUserContext(state.profile, state.lore);
      const sys = buildSystemPrompt(state.vocabulary, [], state.studentName, userContext);
      const windowedHistory = historyRef.current.slice(-HISTORY_WINDOW);
      let full = '';
      for await (const chunk of streamCompletion(key, sys, windowedHistory)) {
        full += chunk;
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg));
      }
      const changes = parseProposedChanges(full);
      if (changes && changes.length > 0) {
        sessionDeltasRef.current.push(...changes);
        setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, proposedChanges: changes } : msg));
      }
      historyRef.current.push({ role: 'assistant', content: full });
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, displayContent: "pakala!" } : msg));
    } finally { setIsLoading(false); }
  }

  return (
    <LazyMotion features={domMax}>
      <m.div
        className="chat-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          background: 'var(--surface-opaque)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--border)'
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
          <h2 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)', margin: 0 }}>NEURAL LINK</h2>
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
        </header>

        {translateBubble && (
          <div onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', top: translateBubble.top, left: translateBubble.left, transform: 'translateX(-50%)', zIndex: 3000, background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '0.8rem', color: 'white', minWidth: '100px', textAlign: 'center' }}>
            {translateBubble.result ? <div style={{ lineHeight: '1.4' }}>{translateBubble.result}</div> : <button onClick={handleTranslateClick} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', color: 'black', padding: '4px 8px', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem' }}>{translateBubble.loading ? '...' : 'TRANSLATE'}</button>}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {isSandboxMode && <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--gold)', borderRadius: '2px', fontSize: '0.7rem', color: 'var(--gold)', textAlign: 'center' }}>OFFLINE PROTOCOL ACTIVE</div>}
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '24px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ color: 'var(--gold)', fontSize: '0.6rem', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>{msg.role === 'assistant' ? 'LINA' : 'USER'}</div>
              <div style={{ background: msg.role === 'assistant' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 191, 0, 0.1)', padding: '12px', borderRadius: '2px', border: '1px solid var(--border)', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '90%', fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.displayContent || (isLoading && msg.role === 'assistant' ? '...' : '')}</div>
              {msg.proposedChanges && msg.proposedChanges.map((c) => <div key={`${c.type}_${c.id}`} style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700 }}>+ CALIBRATING: {c.id} → {c.newStatus}</div>)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', background: 'rgba(5,5,5,0.5)', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)} placeholder="Input command..." style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px', color: 'white', outline: 'none', fontSize: '0.9rem' }} />
          <button onClick={() => sendToLina(input)} disabled={isLoading} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', padding: '0 20px', color: 'black', fontWeight: 900, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}>{isLoading ? '...' : 'EXEC'}</button>
        </div>
      </m.div>
    </LazyMotion>
  );
}
