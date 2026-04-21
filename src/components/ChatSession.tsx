import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import {
  buildSystemPrompt,
  streamCompletion,
  parseProposedChanges,
  stripProposedChanges,
} from '../services/linaService';
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
}

export default function ChatSession({ onEndSession }: Props) {
  const vocabulary          = useMasteryStore((s) => s.vocabulary);
  const chapters            = useMasteryStore((s) => s.chapters);
  const studentName         = useMasteryStore((s) => s.studentName);
  const updateVocabStatus   = useMasteryStore((s) => s.updateVocabStatus);
  const updateConceptStatus = useMasteryStore((s) => s.updateConceptStatus);
  const setLastUpdated      = useMasteryStore((s) => s.setLastUpdated);

  // Runtime API Key Management
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Only trigger Lina's greeting once we have an API key
  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('hello', true);
    }
  }, [apiKey]);

  async function sendToLina(userText: string, hideFromUI = false) {
    if (isLoading || !apiKey) return;

    setIsLoading(true);
    setError(null);

    if (!hideFromUI) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', displayContent: userText },
      ]);
    }

    historyRef.current.push({ role: 'user', content: userText });

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', displayContent: '' },
    ]);

    try {
      const systemPrompt = buildSystemPrompt(vocabulary, chapters, studentName);
      let fullContent = '';

      for await (const chunk of streamCompletion(
        apiKey,
        systemPrompt,
        historyRef.current,
      )) {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, displayContent: stripProposedChanges(fullContent) }
              : m,
          ),
        );
      }

      const changes = parseProposedChanges(fullContent);
      if (changes) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  proposedChanges: changes.map((c) => ({ ...c, approved: true })),
                }
              : m,
          ),
        );
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

  if (!apiKey) {
    return (
      <div className="chat-session">
        <header className="chat-header">
          <div>
            <h1 className="chat-header__title">LINA</h1>
            <p className="chat-header__subtitle">API SETUP</p>
          </div>
          <button className="btn-nav" onClick={onEndSession}>← DASHBOARD</button>
        </header>
        <div className="api-key-setup">
          <h2>ENTER GEMINI API KEY</h2>
          <p>Key is saved in your browser's local storage and is never sent to our servers.</p>
          <div className="api-key-setup__form">
            <input 
              type="password" 
              className="api-key-input" 
              placeholder="Paste key here..." 
              value={keyInput} 
              onChange={(e) => setKeyInput(e.target.value)} 
            />
            <button 
              className="btn-save-key" 
              onClick={() => {
                localStorage.setItem('TP_GEMINI_KEY', keyInput);
                setApiKey(keyInput);
              }}
            >
              SAVE & START
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-session">
      <header className="chat-header">
        <div>
          <h1 className="chat-header__title">LINA</h1>
          <p className="chat-header__subtitle">TOKI PONA TUTOR</p>
        </div>
        <div className="chat-header__actions">
           <button className="btn-nav btn-nav--dim" onClick={() => {
             localStorage.removeItem('TP_GEMINI_KEY');
             window.location.reload();
           }}>RESET KEY</button>
           <button className="btn-nav" onClick={onEndSession}>← DASHBOARD</button>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message--${msg.role}`}>
            <span className="message__label">
              {msg.role === 'assistant' ? 'LINA' : (studentName || 'YOU').toUpperCase()}
            </span>
            <div className="message__content">{msg.displayContent}</div>
          </div>
        ))}
        {error && <div className="chat-error">ERROR: {error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="toki..."
          rows={2}
          disabled={isLoading}
        />
        <button className="btn-send" onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? '···' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
