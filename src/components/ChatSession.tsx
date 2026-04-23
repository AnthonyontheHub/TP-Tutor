/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
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
  
  const vocabulary = useMasteryStore(s => s.vocabulary);
  const studentName = useMasteryStore(s => s.studentName);
  const updateVocabStatus = useMasteryStore(s => s.updateVocabStatus);
  const setLastUpdated = useMasteryStore(s => s.setLastUpdated);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

  useEffect(() => { 
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isActive]);
  
  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    // Clear previous session so a new prompted task starts clean
    setMessages([]);
    setInput('');
    historyRef.current = [];
    const key = localStorage.getItem('TP_GEMINI_KEY');
    if (key) {
      sendToLina(pendingPrompt, key);
    } else {
      alert('Please add your Gemini API Key in Settings first!');
    }
    clearPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt]);

  async function sendToLina(txt: string, overrideKey?: string) {
    const key = overrideKey || localStorage.getItem('TP_GEMINI_KEY');
    if (isLoading || !key || !txt.trim()) return;
    
    setIsLoading(true);
    setInput(''); 
    
    setMessages(p => [...p, { id: crypto.randomUUID(), role: 'user', displayContent: txt }]);
    historyRef.current.push({ role: 'user', content: txt });
    
    const assistantId = crypto.randomUUID();
    setMessages(p => [...p, { id: assistantId, role: 'assistant', displayContent: '', raw: '' }]);
    
    try {
      const sys = buildSystemPrompt(vocabulary, studentName);
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
          updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
        }
      });
      
      setLastUpdated(new Date().toLocaleDateString());
      return { ...m, changesApplied: true };
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
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
                 {!localStorage.getItem('TP_GEMINI_KEY') && <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px' }}>Please set your API Key in Settings to chat with Lina.</div>}
                 
                 {messages.map((msg) => (
                   <div key={msg.id} style={{ marginBottom: '20px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                     <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '4px', fontWeight: 'bold' }}>{msg.role === 'assistant' ? 'LINA' : 'YOU'}</div>
                     <div style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', padding: '12px', borderRadius: '12px', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.4' }}>
                       {msg.displayContent}
                     </div>
                     
                     {msg.proposedChanges && !msg.changesApplied && msg.role === 'assistant' && (
                       <div style={{ marginTop: '10px', background: '#222', padding: '12px', borderRadius: '12px', textAlign: 'left', border: '2px solid #333' }}>
                          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>PROPOSED UPDATES</div>
                          {msg.proposedChanges.map((c: any, i: number) => (
                            <div key={i} style={{ color: '#ddd', fontSize: '0.85rem', marginBottom: '4px' }}>
                              {STATUS_EMOJI[c.newStatus as keyof typeof STATUS_EMOJI] || '✅'} {c.wordId}
                            </div>
                          ))}
                          <button onClick={() => handleApplyChanges(msg.id)} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
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
