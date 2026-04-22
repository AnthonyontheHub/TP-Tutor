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
  const prevMessageCount = useRef(0);

  // FIXED: Auto-scroll only triggers when a new message is added, not on every streaming chunk
  useEffect(() => { 
    if (isActive && messages.length > prevMessageCount.current) { 
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
      prevMessageCount.current = messages.length;
    } 
  }, [messages.length, isActive]);
  
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
              style={{ position: 'fixed', bottom:
