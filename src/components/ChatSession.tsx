import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // NEW
import { useMasteryStore } from '../store/masteryStore';
import { buildSystemPrompt, streamCompletion, parseProposedChanges, stripProposedChanges, STATUS_EMOJI } from '../services/linaService';
import type { ProposedChange } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  proposedChanges?: Array<ProposedChange & { approved: boolean }>;
  changesApplied?: boolean;
}

interface Props {
  onEndSession: () => void;
  isActive: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
}

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt }: Props) {
  const vocabulary          = useMasteryStore((s) => s.vocabulary);
  const chapters            = useMasteryStore((s) => s.chapters);
  const studentName         = useMasteryStore((s) => s.studentName);
  const updateVocabStatus   = useMasteryStore((s) => s.updateVocabStatus);
  const updateConceptStatus = useMasteryStore((s) => s.updateConceptStatus);
  const setLastUpdated      = useMasteryStore((s) => s.setLastUpdated);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('TP_GEMINI_KEY') || '');
  const [keyInput, setKeyInput] = useState('');

  const [messages,   setMessages]  = useState<ChatMessage[]>([]);
  const [input,      setInput]     = useState('');
  const [isLoading,  setIsLoading] = useState(false);
  const [error,      setError]     = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const historyRef     = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const greetingFired  = useRef(false);

  useEffect(() => {
    if (isActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (!isLoading) inputRef.current?.focus(); 
    }
  }, [messages, isActive, isLoading]);

  useEffect(() => {
    if (isActive && pendingPrompt && apiKey && !isLoading) {
      void sendToLina(pendingPrompt);
      if (clearPrompt) clearPrompt();
    }
  }, [isActive, pendingPrompt, apiKey, isLoading, clearPrompt]);

  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('toki', true); 
    }
  }, [apiKey]);

  async function sendToLina(userText: string, hideFromUI = false) {
    if (isLoading || !apiKey) return;
    setIsLoading(true);
    setError(null);

    if (!hideFromUI) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', displayContent: userText }]);
    }
    historyRef.current.push({ role: 'user', content: userText });

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', displayContent: '' }]);

    try {
      const systemPrompt = buildSystemPrompt(vocabulary, chapters, studentName);
      let fullContent = '';

      for await (const chunk of streamCompletion(apiKey, systemPrompt, historyRef.current)) {
        fullContent += chunk;
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, displayContent: stripProposedChanges(fullContent) } : m));
      }

      const changes = parseProposedChanges(fullContent);
      if (changes) {
        setMessages((prev) => prev.map((m) => m.id === assistantId ? { ...m, proposedChanges: changes.map((c) => ({ ...c, approved: true })) } : m));
      }
      historyRef.current.push({ role: 'assistant', content: fullContent });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      historyRef.current.pop();
    } finally {
      setIsLoading(false);
      if (!hideFromUI) inputRef.current?.focus();
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    void sendToLina(text);
  }

  function toggleChangeApproval(msgId: string, idx: number) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId || !m.proposedChanges) return m;
      return { ...m, proposedChanges: m.proposedChanges.map((c, i) => i === idx ? { ...c, approved: !c.approved } : c) };
    }));
  }

  function handleApplyChanges(msgId: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId || !m.proposedChanges) return m;
      for (const change of m.proposedChanges) {
        if (!change.approved) continue;
        if (change.type === 'vocab' && change.wordId) {
          updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
        } else if (change.type === 'concept' && change.chapterId && change.conceptId) {
          updateConceptStatus(change.chapterId, change.conceptId, change.newStatus as MasteryStatus);
        }
      }
      const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setLastUpdated(now);
      return { ...m, changesApplied: true };
    }));
  }

  // INNER CONTENT VARIABLES (Setup vs Chat)
  const innerContent = !apiKey ? (
    <div className="api-key-setup" style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
      <h2>ENTER GEMINI API KEY</h2>
      <p>Key is saved in your browser's local storage and is never sent to our servers.</p>
      <div className="api-key-setup__form">
        <input 
          type="password" className="api-key-input" placeholder="Paste AIzaSy... key here" 
          value={keyInput} onChange={(e) => setKeyInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && (() => { localStorage.setItem('TP_GEMINI_KEY', keyInput); setApiKey(keyInput); })()}
        />
        <button className="btn-save-key" onClick={() => { localStorage.setItem('TP_GEMINI_KEY', keyInput); setApiKey(keyInput); }}>
          SAVE & START
        </button>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <header className="chat-header" style={{ padding: '16px 20px', borderBottom: '1px solid #333' }}>
        <div>
          <h1 className="chat-header__title" style={{ fontSize: '1.2rem', margin: 0 }}>LINA</h1>
          <p className="chat-header__subtitle" style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>TOKI PONA TUTOR</p>
        </div>
      </header>

      <div className="chat-messages" role="log" aria-live="polite" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`message message--${msg.role}`} style={{ marginBottom: '20px' }}>
            <span className="message__label" style={{ display: 'block', fontSize: '0.7rem', color: '#888', marginBottom: '4px' }}>
              {msg.role === 'assistant' ? 'LINA' : (studentName || 'YOU').toUpperCase()}
            </span>
            <div className="message__content" style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#2d3748', padding: '12px', borderRadius: '8px', display: 'inline-block', maxWidth: '85%' }}>
              {msg.displayContent || (isLoading && msg.role === 'assistant' && messages.at(-1)?.id === msg.id ? <span className="typing-dots">● ● ●</span> : null)}
            </div>

            {msg.proposedChanges && !msg.changesApplied && (
              <div className="proposed-changes" style={{ marginTop: '12px', background: '#222', padding: '12px', borderRadius: '8px', border: '1px solid #444' }}>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px' }}>PROPOSED STATUS CHANGES</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {msg.proposedChanges.map((change, idx) => (
                    <li key={idx} onClick={() => toggleChangeApproval(msg.id, idx)} style={{ cursor: 'pointer', padding: '4px 0', opacity: change.approved ? 1 : 0.5 }}>
                      {change.approved ? '✅' : '❌'} {change.type === 'vocab' ? change.wordId : change.conceptId} → {STATUS_EMOJI[change.newStatus]}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleApplyChanges(msg.id)} style={{ marginTop: '12px', background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                  APPLY APPROVED CHANGES
                </button>
              </div>
            )}
            {msg.changesApplied && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#4CAF50' }}>✓ MASTERY MAP UPDATED</div>}
          </div>
        ))}
        {error && <div style={{ color: '#ff4444', marginTop: '10px' }}>ERROR: {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ padding: '16px', background: '#111', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="toki…" rows={2} disabled={isLoading} style={{ flex: 1, background: '#222', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', resize: 'none' }} />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isLoading ? '···' : 'SEND'}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Background Dimmer */}
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onEndSession} style={{ zIndex: 999 }} />
          
          {/* The Chat Drawer */}
          <motion.div
            className="chat-drawer"
            drag="y"
            dragConstraints={{ top: 0 }}
            initial={{ y: '100%' }}
            animate={{ y: '5%' }} // Snaps to 95% height
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150 || info.velocity.y > 500) onEndSession();
            }}
            style={{
              height: '95vh', top: '5vh', position: 'fixed', left: 0, right: 0, zIndex: 1000,
              background: 'var(--bg, #000)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
              boxShadow: '0 -8px 40px rgba(59, 130, 246, 0.15)', // LINA'S BLUE GLOW
              display: 'flex', flexDirection: 'column', touchAction: 'pan-x'
            }}
          >
            {/* Draggable Header Handle */}
            <div className="word-drawer__drag-zone" style={{ width: '100%', padding: '16px 0', cursor: 'grab', touchAction: 'none', background: '#111', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
              <div className="word-drawer__handle" style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} />
            </div>

            {innerContent}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
