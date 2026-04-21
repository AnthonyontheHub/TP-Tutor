import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  isSandboxMode: boolean; // REQUIRED PROP
}

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt, isSandboxMode }: Props) {
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
    if (isActive && pendingPrompt && !isLoading) {
      void sendToLina(pendingPrompt);
      if (clearPrompt) clearPrompt();
    }
  }, [isActive, pendingPrompt, isLoading, clearPrompt]);

  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('toki', true); 
    }
  }, [apiKey]);

  async function sendToLina(userText: string, hideFromUI = false) {
    // HARD FIREWALL: Block API calls if Sandbox is ON
    if (isSandboxMode && !hideFromUI) {
      setMessages((prev) => [...prev, 
        { id: crypto.randomUUID(), role: 'user', displayContent: userText },
        { 
          id: crypto.randomUUID(), 
          role: 'assistant', 
          displayContent: "toki! Sandbox Mode is currently ON. I'm staying offline to save your API credits. Turn Sandbox OFF in settings to chat with me for real!" 
        }
      ]);
      return;
    }

    if (isLoading || (!apiKey && !hideFromUI)) return;
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

  function handleApplyChanges(msgId: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId || !m.proposedChanges) return m;
      for (const change of m.proposedChanges) {
        if (!change.approved) continue;
        if (change.type === 'vocab' && change.wordId) {
          updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
        }
      }
      setLastUpdated(new Date().toLocaleDateString());
      return { ...m, changesApplied: true };
    }));
  }

  const innerContent = !apiKey ? (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2 style={{ color: '#fff' }}>NO API KEY FOUND</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Add your Gemini key in Settings to enable Lina's AI.</p>
      <button onClick={onEndSession} style={{ padding: '12px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>GO TO SETTINGS</button>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', width: '100%' }}>
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', margin: 0, color: '#fff' }}>LINA {isSandboxMode && '(OFFLINE)'}</h1>
          <p style={{ fontSize: '0.7rem', color: '#888', margin: 0 }}>TOKI PONA TUTOR</p>
        </div>
        <button onClick={onEndSession} style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.2rem' }}>✕</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: '20px', textAlign: msg.role === 'assistant' ? 'left' : 'right' }}>
            <div style={{ 
              display: 'inline-block', padding: '12px', borderRadius: '12px', maxWidth: '85%',
              background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', 
              color: '#fff', fontSize: '0.95rem', textAlign: 'left'
            }}>
              {msg.displayContent || '...'}
            </div>

            {msg.proposedChanges && !msg.changesApplied && (
              <div style={{ marginTop: '10px', background: '#000', padding: '12px', borderRadius: '8px', border: '1px solid #444' }}>
                <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 8px' }}>PROPOSED UPDATES:</p>
                {msg.proposedChanges.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', color: '#fff' }}>✅ {c.wordId} → {STATUS_EMOJI[c.newStatus]}</div>
                ))}
                <button onClick={() => handleApplyChanges(msg.id)} style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#4CAF50', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold' }}>APPLY CHANGES</button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', background: '#111', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <textarea 
          ref={inputRef} value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder={isSandboxMode ? "Sandbox is active..." : "toki Lina..."}
          disabled={isLoading}
          style={{ flex: 1, background: '#222', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', resize: 'none' }}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()} style={{ background: '#3b82f6', padding: '0 20px', borderRadius: '8px', color: '#fff', border: 'none', fontWeight: 'bold' }}>SEND</button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onEndSession} 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999 }} />
          <motion.div
            drag="y" dragConstraints={{ top: 0 }} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }}
            onDragEnd={(_, info) => info.offset.y > 150 && onEndSession()}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, height: '95vh', zIndex: 1000,
              background: '#111', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
              display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '6px', backgroundColor: '#444', borderRadius: '10px', margin: '0 auto' }} />
            </div>
            {innerContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
