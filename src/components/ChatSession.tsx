import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { buildSystemPrompt, streamCompletion, parseProposedChanges, stripProposedChanges, STATUS_EMOJI } from '../services/linaService';
import type { MasteryStatus } from '../types/mastery';

interface Props { onEndSession: () => void; isActive: boolean; pendingPrompt?: string | null; clearPrompt?: () => void; }

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = localStorage.getItem('TP_GEMINI_KEY') || '';
  const store = useMasteryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<any[]>([]);

  useEffect(() => { if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isActive]);
  
  useEffect(() => { 
    if (isActive && pendingPrompt && apiKey && !isLoading) { 
       sendToLina(pendingPrompt); 
       if (clearPrompt) clearPrompt(); 
    } 
  }, [isActive, pendingPrompt]);

  async function sendToLina(txt: string) {
    if (isLoading || !apiKey) return;
    setIsLoading(true);
    setMessages(p => [...p, { role: 'user', content: txt }]);
    historyRef.current.push({ role: 'user', content: txt });
    const assistantId = Math.random().toString();
    setMessages(p => [...p, { id: assistantId, role: 'assistant', content: '' }]);
    try {
      const sys = buildSystemPrompt(store.vocabulary, store.chapters, store.studentName);
      let full = '';
      for await (const chunk of streamCompletion(apiKey, sys, historyRef.current)) {
        full += chunk;
        setMessages(p => p.map(m => m.id === assistantId ? { ...m, content: stripProposedChanges(full) } : m));
      }
      const changes = parseProposedChanges(full);
      if (changes) setMessages(p => p.map(m => m.id === assistantId ? { ...m, proposedChanges: changes } : m));
      historyRef.current.push({ role: 'assistant', content: full });
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '90vh', background: '#111', zIndex: 2000, display: 'flex', flexDirection: 'column' }}>
          <div onClick={onEndSession} style={{ padding: '15px', textAlign: 'center', cursor: 'pointer', color: '#666' }}>CLOSE</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '15px', textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <div style={{ background: m.role === 'user' ? '#333' : '#222', padding: '10px', borderRadius: '8px', display: 'inline-block', color: 'white' }}>{m.content}</div>
                {m.proposedChanges && (
                  <div style={{ marginTop: '10px' }}>
                    {m.proposedChanges.map((c: any, j: number) => <div key={j} style={{ fontSize: '0.8rem' }}>✅ {c.wordId} {STATUS_EMOJI[c.newStatus as keyof typeof STATUS_EMOJI]}</div>)}
                    <button onClick={() => {
                      m.proposedChanges.forEach((c: any) => store.updateVocabStatus(c.wordId, c.newStatus as MasteryStatus));
                      setMessages(p => p.map((msg, idx) => i === idx ? { ...msg, proposedChanges: null } : msg));
                    }} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', border: 'none', color: 'white', padding: '5px' }}>APPLY</button>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: '15px', display: 'flex', gap: '10px' }}>
            <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, background: '#222', color: 'white', border: 'none', padding: '10px' }} />
            <button onClick={() => { sendToLina(input); setInput(''); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0 20px' }}>SEND</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
proposedChanges && !msg.changesApplied && (
                     <div style={{ marginTop: '10px', background: '#222', padding: '10px', borderRadius: '8px' }}>
                        {msg.proposedChanges.map((c, i) => <div key={i} style={{ color: '#aaa' }}>✅ {c.wordId} → {STATUS_EMOJI[c.newStatus as keyof typeof STATUS_EMOJI]}</div>)}
                        <button onClick={() => {
                          msg.proposedChanges?.forEach((change) => { if (change.approved) updateVocabStatus(change.wordId, change.newStatus as MasteryStatus); });
                          setLastUpdated(new Date().toLocaleDateString());
                          setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, changesApplied: true } : m));
                        }} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '8px', borderRadius: '4px' }}>APPLY CHANGES</button>
                     </div>
                   )}
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '16px', background: '#111', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)} style={{ flex: 1, background: '#222', border: 'none', borderRadius: '8px', padding: '12px', color: 'white' }} />
              <button onClick={() => { sendToLina(input); setInput(''); }} style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white' }}>SEND</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
      if (m.id !== msgId || !m.proposedChanges) return m;
      m.proposedChanges.forEach((change) => {
        if (change.approved && change.type === 'vocab') updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
      });
      setLastUpdated(new Date().toLocaleDateString());
      return { ...m, changesApplied: true };
    }));
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onEndSession} />
          <motion.div className="chat-drawer" drag="y" dragConstraints={{ top: 0 }} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '100%' }} onDragEnd={(_, info) => { if (info.offset.y > 150) onEndSession(); }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '95vh', zIndex: 1000, background: '#111', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ width: '100%', padding: '16px 0', cursor: 'grab', flexShrink: 0 }}><div style={{ width: '48px', height: '6px', backgroundColor: '#666', borderRadius: '10px', margin: '0 auto' }} /></div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
               {!apiKey && <div style={{ color: 'white' }}>Please set API Key in Settings.</div>}
               {messages.map((msg) => (
                 <div key={msg.id} style={{ marginBottom: '20px' }}>
                   <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}>{msg.role === 'assistant' ? 'LINA' : 'YOU'}</div>
                   <div style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#2d3748', padding: '12px', borderRadius: '8px', color: 'white' }}>{msg.displayContent}</div>
                   {msg.proposedChanges && !msg.changesApplied && (
                     <div style={{ marginTop: '10px', background: '#222', padding: '10px', borderRadius: '8px' }}>
                        {msg.proposedChanges.map((c, i) => <div key={i} style={{ color: '#aaa' }}>✅ {c.wordId} → {STATUS_EMOJI[c.newStatus as keyof typeof STATUS_EMOJI]}</div>)}
                        <button onClick={() => handleApplyChanges(msg.id)} style={{ width: '100%', marginTop: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '8px', borderRadius: '4px' }}>APPLY CHANGES</button>
                     </div>
                   )}
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '16px', background: '#111', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)} style={{ flex: 1, background: '#222', border: 'none', borderRadius: '8px', padding: '12px', color: 'white' }} />
              <button onClick={() => { sendToLina(input); setInput(''); }} style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white' }}>SEND</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
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
