/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { buildSystemPrompt, streamCompletion, stripProposedChanges, parseProposedChanges } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props { 
  onEndSession: () => void; 
  isActive: boolean; 
  pendingPrompt?: string | null; 
  clearPrompt?: () => void; 
}

const STATUS_EMOJI = {
  not_started: '⬜',
  introduced: '🔵',
  practicing: '🟡',
  confident: '🟢',
  mastered: '✅'
};

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const store = useMasteryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

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
    setMessages(p => [...p, { id: crypto.randomUUID(), role: 'user', displayContent: txt }]);
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
      if (changes && changes.length > 0) {
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
      m.proposedChanges.forEach((change: any) => {
        if (change.type === 'vocab' && change.wordId) {
          store.updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
        }
      });
      store.setLastUpdated(new Date().toLocaleDateString());
      return { ...m, changesApplied: true };
    }));
  }

  return (
    <AnimatePresence>
      {isActive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000 }}>
          <motion.div 
            className="drawer-backdrop" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={onEndSession} 
          />
          <motion.div 
            className="word-drawer" // Use global drawer styling
            drag="y" 
            dragConstraints={{ top: 0 }} 
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onEndSession(); }}
            initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} 
            style={{ height: '66vh' }}
          >
            <div className="drawer__handle" onClick={onEndSession} style={{ cursor: 'pointer' }} />
            
            <div className="drawer__scroll-area">
               {!localStorage.getItem('TP_GEMINI_KEY') && (
                 <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px', padding: '20px', background: '#221111', borderRadius: '12px' }}>
                    Please set your API Key in Settings to chat.
                 </div>
               )}
               
               {messages.map((msg) => (
                 <div key={msg.id} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                   <div style={{ color: '#555', fontSize: '0.6rem', marginBottom: '4px', fontWeight: 'bold' }}>{msg.role === 'assistant' ? 'LINA' : 'YOU'}</div>
                   <div style={{ 
                     background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', 
                     padding: '12px', borderRadius: '12px', color: 'white', 
                     display: 'inline-block', textAlign: 'left', maxWidth: '85%',
                     border: msg.role === 'assistant' ? '1px solid #333' : 'none'
                   }}>
                     {msg.displayContent}
                   </div>
                   
                   {msg.proposedChanges && !msg.changesApplied && msg.role === 'assistant' && (
                     <div style={{ marginTop: '10px', background: '#000', padding: '12px', borderRadius: '12px', textAlign: 'left', border: '1px solid #333' }}>
                        <div style={{ fontSize: '0.7rem', color: '#3b82f6', marginBottom: '8px', fontWeight: 'bold' }}>LEARNING UPDATES</div>
                        {msg.proposedChanges.map((c: any, i: number) => (
                          <div key={i} style={{ color: '#ddd', fontSize: '0.8rem', marginBottom: '4px' }}>
                            {c.wordId} → {STATUS_EMOJI[c.newStatus as keyof typeof STATUS_EMOJI]}
                          </div>
                        ))}
                        <button onClick={() => handleApplyChanges(msg.id)} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                          APPLY TO MASTERY
                        </button>
                     </div>
                   )}
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '16px', background: '#0d0d0d', borderTop: '1px solid #222', display: 'flex', gap: '8px' }}>
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && (sendToLina(input), setInput(''))} 
                placeholder="toki tawa Lina..."
                style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }} 
              />
              <button 
                onClick={() => { sendToLina(input); setInput(''); }} 
                style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white', fontWeight: 'bold' }}
              >
                SEND
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
