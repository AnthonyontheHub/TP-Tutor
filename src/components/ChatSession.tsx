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

const API_KEY_STORAGE = 'tp-tutor-api-key';

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
  const vocabulary        = useMasteryStore((s) => s.vocabulary);
  const chapters          = useMasteryStore((s) => s.chapters);
  const studentName       = useMasteryStore((s) => s.studentName);
  const updateVocabStatus = useMasteryStore((s) => s.updateVocabStatus);
  const updateConceptStatus = useMasteryStore((s) => s.updateConceptStatus);
  const setLastUpdated    = useMasteryStore((s) => s.setLastUpdated);

  const [apiKey, setApiKey]         = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<HTMLTextAreaElement>(null);
  const historyRef       = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const greetingFired    = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('hello', true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  async function sendToLina(userText: string, hideFromUI = false) {
    if (isLoading) return;

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

  function handleSaveApiKey() {
    const key = apiKeyInput.trim();
    if (!key) return;
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setApiKeyInput('');
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

  // ─── API Key Setup Screen ──────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className="chat-session">
        <header className="chat-header">
          <div>
            <h1 className="chat-header__title">LINA</h1>
            <p className="chat-header__subtitle">TOKI PONA TUTOR</p>
          </div>
          <button className="btn-nav" onClick={onEndSession}>
            ← BACK
          </button>
        </header>

        <div className="api-key-setup">
          <h2>ANTHROPIC API KEY REQUIRED</h2>
          <p>Lina runs on Claude Opus. Paste your API key below to begin.</p>
          <div className="api-key-setup__form">
            <input
              type="password"
              className="api-key-input"
              placeholder="sk-ant-api03-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
              autoFocus
            />
            <button className="btn-save-key" onClick={handleSaveApiKey}>
              SAVE &amp; START
            </button>
          </div>
          <p className="api-key-note">
            Stored in your browser only. Sent exclusively to api.anthropic.com.
          </p>
        </div>
      </div>
    );
  }

  // ─── Chat Screen ───────────────────────────────────────────────────────────
  return (
    <div className="chat-session">
      <header className="chat-header">
        <div>
          <h1 className="chat-header__title">LINA</h1>
          <p className="chat-header__subtitle">TOKI PONA TUTOR — CLAUDE OPUS</p>
        </div>
        <div className="chat-header__actions">
          <button
            className="btn-nav btn-nav--dim"
            title="Change API key"
            onClick={() => {
              localStorage.removeItem(API_KEY_STORAGE);
              setApiKey('');
              setMessages([]);
              historyRef.current = [];
              greetingFired.current = false;
            }}
          >
            KEY
          </button>
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
