import { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

export default function ChatSession({ onEndSession, isActive }: { onEndSession: () => void; isActive: boolean }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    if (isActive) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isActive]);

  return (
    <LazyMotion features={domMax}>
      <AnimatePresence>
        {isActive && (
          <>
            <m.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onEndSession} />
            <m.div 
              className="chat-drawer" 
              initial={{ y: '100%', x: '-50%' }} animate={{ y: 0, x: '-50%' }} exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="drawer__handle" onClick={onEndSession} />
              <div className="drawer__scroll-area">
                 <h2 style={{ fontSize: '1rem', marginBottom: '20px' }}>LINA CHAT</h2>
                 {messages.map((msg, i) => (
                   <div key={i} style={{ marginBottom: '15px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                     <div style={{ background: msg.role === 'assistant' ? '#1a1a1a' : '#3b82f6', padding: '10px', borderRadius: '8px', display: 'inline-block', maxWidth: '85%' }}>
                       {msg.content}
                     </div>
                   </div>
                 ))}
                 <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="toki!" style={{ flex: 1, background: '#222', border: 'none', borderRadius: '8px', padding: '12px', color: 'white' }} />
                <button style={{ background: '#3b82f6', border: 'none', borderRadius: '8px', padding: '0 15px', color: 'white' }}>SEND</button>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
