import { useState, useRef, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import {
  buildSystemPrompt,
  streamCompletion,
  parseProposedChanges,
  stripProposedChanges,
  STATUS_EMOJI,
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
  isActive: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
}

export default function ChatSession({ onEndSession, isActive, pendingPrompt, clearPrompt }: Props) {

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
    if (isActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      // Optional bonus: auto-focus the input box when returning to chat
      if (!isLoading) inputRef.current?.focus(); 
    }
  }, [messages, isActive, isLoading]);

  // NEW: Listen for prompts passed in from the Dashboard (Ask Lina feature)
  useEffect(() => {
    if (isActive && pendingPrompt && apiKey && !isLoading) {
      void sendToLina(pendingPrompt);
      if (clearPrompt) clearPrompt();
    }
  }, [isActive, pendingPrompt, apiKey, isLoading, clearPrompt]);

  // Trigger Lina's greeting automatically on mount, but only if we have a key
  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('toki', true); // Send an initial prompt to wake Lina up
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function toggleChangeApproval(msgId: string, idx: number) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.proposedChanges) return m;
        return {
          ...m,
          proposedChanges: m.proposedChanges.map((c, i) =>
            i === idx ? { ...c, approved: !c.approved } : c,
          ),
        };
      }),
    );
  }

  function handleApplyChanges(msgId: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.proposedChanges) return m;

        for (const change of m.proposedChanges) {
          if (!change.approved) continue;
          if (change.type === 'vocab' && change.wordId) {
            updateVocabStatus(change.wordId, change.newStatus as MasteryStatus);
          } else if (
            change.type === 'concept' &&
            change.chapterId &&
            change.conceptId
          ) {
            updateConceptStatus(
              change.chapterId,
              change.conceptId,
              change.newStatus as MasteryStatus,
            );
          }
        }

        const now = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        setLastUpdated(now);

        return { ...m, changesApplied: true };
      }),
    );
  }

  // Setup Screen
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
              placeholder="Paste AIzaSy... key here" 
              value={keyInput} 
              onChange={(e) => setKeyInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (() => {
                 localStorage.setItem('TP_GEMINI_KEY', keyInput);
                 setApiKey(keyInput);
              })()}
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

  // Main Chat UI
  return (
    <div className="chat-session">
      <header className="chat-header">
        <div>
          <h1 className="chat-header__title">LINA</h1>
          <p className="chat-header__subtitle">TOKI PONA TUTOR — GEMINI 1.5 FLASH</p>
        </div>
        <div className="chat-header__actions">
           <button className="btn-nav btn-nav--dim" onClick={() => {
             localStorage.removeItem('TP_GEMINI_KEY');
             window.location.reload();
           }}>RESET KEY</button>
           <button className="btn-nav" onClick={onEndSession}>
             ← DASHBOARD
           </button>
        </div>
      </header>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message message--${msg.role}`}>
            <span className="message__label">
              {msg.role === 'assistant'
                ? 'LINA'
                : (studentName || 'YOU').toUpperCase()}
            </span>

            <div className="message__content">
              {msg.displayContent ||
                (isLoading &&
                msg.role === 'assistant' &&
                messages.at(-1)?.id === msg.id ? (
                  <span className="typing-dots">● ● ●</span>
                ) : null)}
            </div>

            {msg.proposedChanges && !msg.changesApplied && (
              <div className="proposed-changes">
                <div className="proposed-changes__header">
                  PROPOSED STATUS CHANGES — click to toggle
                </div>
                <ul className="proposed-changes__list">
                  {msg.proposedChanges.map((change, idx) => {
                    const wordLabel =
                      change.type === 'vocab'
                        ? (vocabulary.find((w) => w.id === change.wordId)?.word ??
                          change.wordId)
                        : (chapters
                            .flatMap((ch) => ch.concepts)
                            .find((c) => c.id === change.conceptId)?.concept ??
                          change.conceptId);

                    const currentStatus =
                      change.type === 'vocab'
                        ? vocabulary.find((w) => w.id === change.wordId)?.status
                        : chapters
                            .flatMap((ch) => ch.concepts)
                            .find((c) => c.id === change.conceptId)?.status;

                    return (
                      <li
                        key={idx}
                        className={`proposed-change ${
                          change.approved
                            ? 'proposed-change--approved'
                            : 'proposed-change--rejected'
                        }`}
                        onClick={() => toggleChangeApproval(msg.id, idx)}
                      >
                        <span className="proposed-change__check">
                          {change.approved ? '✓' : '✗'}
                        </span>
                        <span className="proposed-change__word">{wordLabel}</span>
                        <span className="proposed-change__arrow">
                          {STATUS_EMOJI[currentStatus ?? 'not_started']}
                          {' → '}
                          {STATUS_EMOJI[change.newStatus]}
                        </span>
                        <span className="proposed-change__reason">
                          {change.reason}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <button
                  className="btn-apply-changes"
                  onClick={() => handleApplyChanges(msg.id)}
                >
                  APPLY APPROVED CHANGES TO MASTERY MAP
                </button>
              </div>
            )}

            {msg.changesApplied && (
              <div className="changes-applied">✓ MASTERY MAP UPDATED</div>
            )}
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
          onKeyDown={handleKeyDown}
          placeholder="toki… (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={isLoading}
        />
        <button
          className="btn-send"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '···' : 'SEND'}
        </button>
      </div>
    </div>
  );
}
