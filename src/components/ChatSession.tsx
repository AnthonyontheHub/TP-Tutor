import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { buildSystemPrompt, streamCompletion, parseProposedChanges, stripProposedChanges, STATUS_EMOJI } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  onEndSession: () => void;
  isActive: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
  isSandboxMode: boolean;
}

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt, isSandboxMode }: Props) {
  const vocabulary = useMasteryStore((s) => s.vocabulary);
  const chapters = useMasteryStore((s) => s.chapters);
  const studentName = useMasteryStore((s) => s.studentName);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const [apiKey] = useState(() => localStorage.getItem('TP_GEMINI_KEY') || '');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

  useEffect(() => { if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isActive]);

  useEffect(() => {
    if (isActive && pendingPrompt && !isLoading) {
      void sendToLina(pendingPrompt);
      if (clearPrompt) clearPrompt();
    }
  }, [isActive, pendingPrompt, isLoading, clearPrompt]);

  async function sendToLina(userText: string) {
    if (isSandboxMode) {
      setMessages(p => [...p, { role: 'user', content: userText }, { role: 'assistant', content: "Sandbox ON. Lina is sleeping." }]);
      return;
    }
    if (isLoading || !apiKey) return;
    setIsLoading(true);
    setMessages(p => [...p, { role: 'user', content: userText }]);
    historyRef.current.push({ role: 'user', content: userText });
    const assistantId = crypto.randomUUID();
    setMessages(p => [...p, { id: assistantId, role: 'assistant', content: '' }]);
    try {
      const sys = buildSystemPrompt(vocabulary, chapters, studentName);
      let full = '';
      for await (const chunk of streamCompletion(apiKey, sys, historyRef.current)) {
        full += chunk;
        setMessages(p => p.map(m => m.id === assistantId ? { ...m, content: stripProposedChanges(full), raw: full } : m));
      }
      historyRef.current.push({ role: 'assistant', content: full });
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }

  function handleApply(msg: any) {
    const changes = parseProposedChanges(msg.raw);
    changes?.forEach(c => { if (c.type === 'vocab' && c.wordId) updateVocabStatus(c.wordId, c.newStatus as MasteryStatus); });
    setMessages(p => p.map(m => m.id === msg.id ? { ...m, applied: true } : m));
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="chat-session">
          <header className="chat-header"><span>LINA {isSandboxMode && '(OFFLINE)'}</span><button onClick={onEndSession}>✕</button></header>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.content}
                {m.raw && !m.applied && parseProposedChanges(m.raw) && <button onClick={() => handleApply(m)}>APPLY UPDATES</button>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (void sendToLina(input), setInput(''))} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
