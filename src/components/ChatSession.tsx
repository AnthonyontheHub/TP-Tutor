/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import {
  buildSystemPrompt, streamCompletion, stripProposedChanges,
  parseProposedChanges, resolveApiKey,
} from '../services/linaService';
import type { ProposedChange } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onEndSession: () => void;
  isActive: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
  isSandboxMode: boolean;
}

// Fix 2: Proper type for chat messages — replaces the previous any[].
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  raw?: string;
  proposedChanges?: ProposedChange[];
  changesApplied?: boolean;
}

const STATUS_EMOJI: Record<MasteryStatus, string> = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅',
};

const HISTORY_WINDOW = 10;

const SANDBOX_RESPONSE = '[SANDBOX MODE]: o toki! I am in offline testing mode. No API tokens are being used right now.';

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt, isSandboxMode }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const vocabulary = useMasteryStore(s => s.vocabulary);
  const studentName = useMasteryStore(s => s.studentName);
  const updateVocabStatus = useMasteryStore(s => s.updateVocabStatus);
  const setLastUpdated = useMasteryStore(s => s.setLastUpdated);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  useEffect(() => {
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isActive]);

  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    setMessages([]);
    setInput('');
    historyRef.current = [];
    const key = resolveApiKey();
    if (key || isSandboxMode) {
      sendToLina(pendingPrompt, key);
    } else {
      alert('Please add your Gemini API Key in Settings first!');
    }
    clearPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt]);

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
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? { ...msg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE }
          : msg
      ));
      historyRef.current.push({ role: 'assistant', content: SANDBOX_RESPONSE });
      setIsLoading(false);
      return;
    }

    try {
      const key = resolveApiKey(overrideKey);
      const sys = buildSystemPrompt(vocabulary, studentName);
      const windowedHistory = historyRef.current.slice(-HISTORY_WINDOW);
      let full = '';

      for await (const chunk of streamCompletion(key, sys, windowedHistory)) {
        full += chunk;
        setMessages(prev => prev.map(msg =>
          msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg
        ));
      }

      const changes = parseProposedChanges(full);
      if (changes && changes.length > 0) {
        setMessages(prev => prev.map(msg =>
          msg.id === assistantId ? { ...msg, proposedChanges: changes } : msg
        ));
      }

      historyRef.current.push({ role: 'assistant', content: full });
    } catch (e) {
      console.error(e);
      setMessages(prev => prev.map(msg =>
        msg.id === assistantId
          ? { ...msg, displayContent: "pakala! I'm having trouble connecting right now. Please check your API key or network." }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }

  function handleApplyChanges(msgId: string) {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== msgId || !msg.proposedChanges) return msg;
      msg.proposedChanges.forEach((change: ProposedChange) => {
        if (change.type === 'vocab' && change.wordId) {
          updateVocabStatus(change.wordId, change.newStatus);
        }
      });
      setLastUpdated(new Date().toLocaleDateString());
      return { ...msg, changesApplied: true };
    }));
  }

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isActive && (
          <>
            <m.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={onEndSession}
              style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1999 }}
            />
            <m.div
              className="chat-drawer"
              drag="y" dragConstraints={{ top: 0 }} onDragEnd={(_, info) => { if (info.offset.y > 150) onEndSession(); }}
              initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '92vh', zIndex: 2000, background: '#111', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0 }}>
                <div style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} onClick={onEndSession} />
              </div>

              {isSandboxMode && (
                <div style={{ margin: '0 20px 8px', padding: '6px 12px', background: '#1a1a00', border: '1px solid #555500', borderRadius: '8px', fontSize: '0.72rem', color: '#bbbb00', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ⚠️ SANDBOX MODE — no API calls
                </div>
              )}

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                {!isSandboxMode && !resolveApiKey() && (
                  <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px' }}>
                    Please set your API Key in Settings to chat with Lina.
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '4px', fontWeight: 'bold' }}>
                      {msg.role === 'assistant' ? 'LINA' : 'YOU'}
                    </div>
                    <div style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', padding: '12px', borderRadius: '12px', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.4' }}>
                      {msg.displayContent || (isLoading && msg.role === 'assistant' ? '...' : '')}
                    </div>

                    {msg.proposedChanges && !msg.changesApplied && msg.role === 'assistant' && (
                      <div style={{ marginTop: '10px', background: '#222', padding: '12px', borderRadius: '12px', textAlign: 'left', border: '2px solid #333' }}>
                        <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>PROPOSED UPDATES</div>
                        {msg.proposedChanges.map((c, i) => (
                          <div key={i} style={{ color: '#ddd', fontSize: '0.85rem', marginBottom: '4px' }}>
                            {STATUS_EMOJI[c.newStatus] ?? '✅'} {c.wordId}
                          </div>
                        ))}
                        <button
                          onClick={() => handleApplyChanges(msg.id)}
                          style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          APPLY CHANGES
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div style={{ padding: '16px', background: '#111', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)}
                  placeholder="toki!"
                  style={{ flex: 1, background: '#222', border: 'none', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', fontSize: '1rem' }}
                />
                <button
                  onClick={() => sendToLina(input)}
                  disabled={isLoading}
                  style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                >
                  {isLoading ? '...' : 'SEND'}
                </button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
