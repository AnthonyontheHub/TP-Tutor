import { useState, useEffect, useRef } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { streamCompletion } from '../services/linaService';

interface ChatMessage {
  role: 'user' | 'lina';
  content: string;
}

interface Props {
  onEndSession: () => void;
}

export default function ChatSession({ onEndSession }: Props) {
  const { masteryMap, updateMastery } = useMasteryStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  
  // Runtime API Key Management
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('TP_GEMINI_KEY') || '');
  const [keyInput, setKeyInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<ChatMessage[]>([]);
  const greetingFired = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, streamedResponse]);

  // Only start the conversation once an API key is present
  useEffect(() => {
    if (apiKey && !greetingFired.current) {
      greetingFired.current = true;
      void sendToLina('hello', true);
    }
  }, [apiKey]);

  const systemPrompt = `
    You are Lina, a kind and encouraging Toki Pona tutor. 
    The user's current mastery data is: ${JSON.stringify(masteryMap)}.
    Keep responses short. Use Toki Pona primarily, but provide English translations in parentheses.
    Always evaluate if the user used a word correctly and update their progress if they did.
  `;

  async function sendToLina(userText: string, hideFromUI = false) {
    if (isLoading || !apiKey) return;

    if (!hideFromUI) {
      const userMsg: ChatMessage = { role: 'user', content: userText };
      setMessages((prev) => [...prev, userMsg]);
      historyRef.current.push(userMsg);
    }

    setIsLoading(true);
    let fullResponse = '';

    try {
      for await (const chunk of streamCompletion(
        apiKey, 
        systemPrompt,
        historyRef.current,
      )) {
        fullResponse += chunk;
        setStreamedResponse(fullResponse);
      }

      const linaMsg: ChatMessage = { role: 'lina', content: fullResponse };
      setMessages((prev) => [...prev, linaMsg]);
      historyRef.current.push(linaMsg);
      
      // Basic logic to detect word usage and update store
      // In a real app, you'd parse Lina's JSON assessment
      Object.keys(masteryMap).forEach(word => {
        if (userText.toLowerCase().includes(word)) {
          updateMastery(word, 5);
        }
      });

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = { role: 'lina', content: "(Session Error: Please check your API key and try again.)" };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setStreamedResponse('');
    }
  }

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    void sendToLina(text);
  };

  // Setup Screen: Shown only if there is no API Key in state/localStorage
  if (!apiKey) {
    return (
      <div className="chat-session">
        <header className="chat-header">
          <div>
            <h1 className="chat-header__title">LINA</h1>
            <p className="chat-header__subtitle">TOKI PONA TUTOR</p>
          </div>
          <button className="btn-nav" onClick={onEndSession}>← DASHBOARD</button>
        </header>
        <div className="api-key-setup">
          <h2>ENTER GEMINI API KEY</h2>
          <p>Your key is stored locally in your browser. It is never sent to our servers.</p>
          <div className="api-key-setup__form">
            <input 
              type="password" 
              className="api-key-input" 
              placeholder="Paste AIzaSy... key here" 
              value={keyInput} 
              onChange={(e) => setKeyInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (()=>{
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
          <p className="api-key-help">
            Don't have a key? Get one for free at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>.
          </p>
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
          <p className="chat-header__subtitle">CONVERSATION MODE</p>
        </div>
        <div className="header-actions">
          <button className="btn-clear-key" onClick={() => {
            localStorage.removeItem('TP_GEMINI_KEY');
            window.location.reload();
          }}>Reset Key</button>
          <button className="btn-nav" onClick={onEndSession}>EXIT SESSION</button>
        </div>
      </header>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`message-bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {streamedResponse && (
          <div className="message-bubble lina">
            {streamedResponse}
          </div>
        )}
        {isLoading && !streamedResponse && (
          <div className="message-bubble lina loading">...</div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Toki! (Say something...)"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={isLoading}>SEND</button>
      </div>
    </div>
  );
}
