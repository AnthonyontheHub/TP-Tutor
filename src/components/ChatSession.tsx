/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import {
  buildSystemPrompt, streamCompletion, stripProposedChanges,
  parseProposedChanges, resolveApiKey, fetchSessionRecap,
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

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  raw?: string;
  proposedChanges?: ProposedChange[];
}

const STATUS_EMOJI: Record<MasteryStatus, string> = {
  not_started: '⬜',
  introduced:  '🔵',
  practicing:  '🟡',
  confident:   '🟢',
  mastered:    '✅',
};

const HISTORY_WINDOW = 10;
const SANDBOX_RESPONSE = '[SANDBOX MODE]: o toki! I am in offline testing mode. No API tokens are being used right now.';

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt, isSandboxMode }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateVocabStatus   = useMasteryStore(s => s.updateVocabStatus);
  const updateConceptStatus = useMasteryStore(s => s.updateConceptStatus);
  const setLastUpdated      = useMasteryStore(s => s.setLastUpdated);

  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const historyRef        = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const sessionChangesRef = useRef<ProposedChange[]>([]);

  useEffect(() => {
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isActive]);

  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    setMessages([]);
    setInput('');
    historyRef.current = [];
    sessionChangesRef.current = [];
    const key = resolveApiKey();
    if (key || isSandboxMode) {
      sendToLina(pendingPrompt, key);
    } else {
      alert('Please add your Gemini API Key in Settings first!');
    }
    clearPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt]);

  async function handleEndSession() {
    const changes = sessionChangesRef.current;

    if (changes.length === 0 || isSandboxMode) {
      onEndSession();
      return;
    }

    for (const change of changes) {
      if (change.type === 'vocab') {
        updateVocabStatus(change.id, change.newStatus);
      } else {
        updateConceptStatus(change.id, change.newStatus);
      }
    }
    setLastUpdated(new Date().toLocaleDateString());

    const key = resolveApiKey();
    const recapId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: recapId,
      role: 'assistant',
      displayContent: '· · ·',
    }]);
    setIsLoading(true);

    const recap = await fetchSessionRecap(key, changes);
    setMessages(prev => prev.map(msg =>
      msg.id === recapId ? { ...msg, displayContent: recap } : msg
    ));
    setIsLoading(false);

    await new Promise(r => setTimeout(r, 2200));
    sessionChangesRef.current = [];
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
      const state = useMasteryStore.getState();
      const activeCurriculum = state.activeCurriculumId
        ? state.curriculums.find(c => c.id === state.activeCurriculumId)
        : null;
      const activeModule = activeCurriculum && state.activeModuleId
        ? activeCurriculum.modules.find(m => m.id === state.activeModuleId)
        : null;

      const sys = buildSystemPrompt(
        state.vocabulary,
        state.concepts,
        state.studentName,
        activeCurriculum?.title,
        activeModule?.title
      );
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
        sessionChangesRef.current.push(...changes);
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

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isActive && (
          <>
            <m.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={handleEndSession}
              style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 1999 }}
            />
            <m.div
              className="chat-drawer"
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 150) handleEndSession(); }}
              initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '92vh', zIndex: 2000, background: '#111', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0 }}>
                <div
                  style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }}
                  onClick={handleEndSession}
                />
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

                    {msg.proposedChanges && msg.proposedChanges.length > 0 && (
                      <div style={{ marginTop: '6px', textAlign: 'left' }}>
                        {msg.proposedChanges.map((c, i) => (
                          <span
                            key={i}
                            style={{ display: 'inline-block', marginRight: '6px', fontSize: '0.68rem', color: '#22c55e', fontWeight: 700 }}
                          >
                            {STATUS_EMOJI[c.newStatus]} {c.id} → {c.newStatus}
                          </span>
                        ))}
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
