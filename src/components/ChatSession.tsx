import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { buildSystemPrompt, streamCompletion, stripProposedChanges, parseProposedChanges } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  displayContent: string;
  raw?: string;
  proposedChanges?: Array<{ type: string; wordId: string; newStatus: string }>;
  changesApplied?: boolean;
}

interface Props { 
  onEndSession: () => void; 
  isActive: boolean; 
  pendingPrompt?: string | null; 
  clearPrompt?: () => void; 
}

const STATUS_EMOJI: Record<string, string> = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅'
};

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const store = useMasteryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{role: string, content: string}[]>([]);

  useEffect(() => { 
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isActive]);
  
  useEffect(() => { 
    const key = localStorage.getItem('TP_GEMINI_KEY');
    if (isActive && pendingPrompt && key && !isLoading) { 
       sendToLina(pendingPrompt, key); 
       if (clearPrompt) clearPrompt(); 
    } 
  }, [isActive, pendingPrompt]);

  async function sendToLina(txt: string, overrideKey?: string) {
    const key = overrideKey || localStorage.getItem('TP_GEMINI_KEY');
    if (isLoading || !key || !txt.trim()) return;
    
    setIsLoading(true);
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', displayContent: txt };
    setMessages(p => [...p, userMsg]);
    historyRef.current.push({ role: 'user', content: txt });
    
    const assistantId = crypto.randomUUID();
    setMessages(p => [...p, { id: assistantId, role: 'assistant', displayContent: '', raw: '' }]);
    
    try {
      const sys = buildSystemPrompt(store.vocabulary, store.studentName);
      let full = '';
      
      for await (const chunk of streamCompletion(key, sys, historyRef.current)) {
        full += chunk;
        setMessages(p => p.map(m => m.id === assistantId ? { ...m, displayContent: stripProposedChanges(full), raw: full } : m));
      }

      const changes = parseProposedChanges(full);
      if (changes && Array.isArray(changes)) {
        setMessages(p => p.map(m => m.id === assistantId ? { ...m, proposedChanges: changes } : m));
      }

      historyRef.current.push({ role: 'assistant', content: full });
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  }

  function handleApplyChanges(msgId: string) {
    setMessages((prev) => prev.map((m) => {
      if (m.id !== msgId || !m.proposedChanges) return m;
      m.proposedChanges.forEach((change) => {
        if (change.type === 'vocab' && change.wordId) {
          store.updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
        }
      });
      store.setLastUpdated(new Date().toLocaleDateString());
      return { ...m, changesApplied: true };
    }));
  }

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isActive && (
          <m.div 
            className="side-pane"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #333' }}>
              <h2 style={{ fontSize: '1rem', letterSpacing: '0.1em' }}>LINA CHAT</h2>
              <button onClick={onEndSession} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div className="drawer__scroll-area">
               {messages.map((msg) => (
                 <div key={msg.id} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                   <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}>{msg.role === 'assistant' ? 'LINA' : 'YOU'}</div>
                   <div style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', padding: '12px', borderRadius: '8px', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '90%' }}>
                     {msg.displayContent}
                   </div>
                   {msg.proposedChanges && !msg.changesApplied && (
                     <div style={{ marginTop: '10px', background: '#222', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                        {msg.proposedChanges.map((c, i) => (
                          <div key={i} style={{ color: '#ddd', fontSize: '0.85rem' }}>✅ {c.wordId} → {STATUS_EMOJI[c.newStatus] || '❓'}</div>
                        ))}
                        <button onClick={() => handleApplyChanges(msg.id)} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>APPLY</button>
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
                onKeyDown={(e) => e.key === 'Enter' && (sendToLina(input), setInput(''))} 
                placeholder="toki!"
                style={{ flex: 1, background: '#222', border: 'none', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }} 
              />
              <button onClick={() => { sendToLina(input); setInput(''); }} style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 15px', color: 'white', fontWeight: 'bold' }}>SEND</button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
