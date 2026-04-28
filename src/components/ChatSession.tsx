/* src/components/ChatSession.tsx */
import { useState, useRef, useEffect } from 'react';
import { m, LazyMotion, domMax } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useChatStore } from '../store/chatStore';
import type { ChatMessage } from '../store/chatStore';
import { STATUS_MIDPOINT } from '../types/mastery';
import {
  buildTutorPrompt, buildChatPrompt, buildMasteryCourtPrompt, streamCompletion, stripProposedChanges,
  parseProposedChanges, parseSessionSummaryNotes, resolveApiKey, fetchSessionRecap,
  fetchQuickTranslation, stringifyUserContext, detectSessionTitle
} from '../services/linaService';
import type { ProposedChange } from '../services/linaService';
import SessionRecap from './SessionRecap';
import { WORD_FREQUENCY } from '../data/tokiPonaDictionary';

interface Props {
  sessionId: string;
  onEndSession: () => void;
  onMinimize?: () => void;
  isActive: boolean;
  isMinimized?: boolean;
  pendingPrompt?: string | null;
  clearPrompt?: () => void;
  isSandboxMode: boolean;
  style?: React.CSSProperties;
}

const HISTORY_WINDOW = 10;
const SANDBOX_RESPONSE = '[OFFLINE PROTOCOL]: o toki! I am in sandbox mode. Interaction simulated.';

export default function ChatSession({ sessionId, onEndSession, onMinimize, isActive, isMinimized, pendingPrompt, clearPrompt, isSandboxMode, style }: Props) {
  const session = useChatStore(state => state.sessions.find(s => s.id === sessionId));
  const updateSession = useChatStore(state => state.updateSession);

  const messages = session?.messages || [];
  const history = session?.history || [];
  const sessionDeltas = session?.sessionDeltas || [];
  const chatContext = session?.context || 'GENERAL';

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [sessionXP, setSessionXP] = useState(0);
  const [startingTotalXP, setStartingTotalXP] = useState(0);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const yesterdayWasActive = useRef(false);

  const [translateBubble, setTranslateBubble] = useState<{
    text: string;
    top: number;
    left: number;
    result?: string;
    loading?: boolean;
  } | null>(null);

  const vocabulary          = useMasteryStore(s => s.vocabulary);
  const updateVocabStatus   = useMasteryStore(s => s.updateVocabStatus);
  const setLastUpdated      = useMasteryStore(s => s.setLastUpdated);
  const studentName         = useMasteryStore(s => s.studentName);
  const profile             = useMasteryStore(s => s.profile);
  const lore                = useMasteryStore(s => s.lore);

  const runMorningStreakCheck = useMasteryStore(s => s.runMorningStreakCheck);
  const getRegressionCandidates = useMasteryStore(s => s.getRegressionCandidates);
  const getTopConfusionPairs  = useMasteryStore(s => s.getTopConfusionPairs);
  const pendingProveItResponses = useMasteryStore(s => s.pendingProveItResponses);
  const clearProveItResponses   = useMasteryStore(s => s.clearProveItResponses);
  const recordLearningDay       = useMasteryStore(s => s.recordLearningDay);
  const updateSessionNotes      = useMasteryStore(s => s.updateSessionNotes);
  const updateProductionStatus  = useMasteryStore(s => s.updateProductionStatus);
  const updateRecognitionStatus = useMasteryStore(s => s.updateRecognitionStatus);
  const recordConfusion         = useMasteryStore(s => s.recordConfusion);
  const setPinnedExample        = useMasteryStore(s => s.setPinnedExample);
  const checkAndAwardRanks      = useMasteryStore(s => s.checkAndAwardRanks);
  const updateSessionXPRecord   = useMasteryStore(s => s.updateSessionXPRecord);
  const xpMultiplier            = useMasteryStore(s => s.xpMultiplier);
  const currentStreak           = useMasteryStore(s => s.currentStreak);
  const streakShields           = useMasteryStore(s => s.streakShields);
  const awardBadge              = useMasteryStore(s => s.awardBadge);
  const getStatusSummary        = useMasteryStore(s => s.getStatusSummary);
  const newRankUnlocked         = useMasteryStore(s => s.newRankUnlocked);
  const clearNewRankUnlocked    = useMasteryStore(s => s.clearNewRankUnlocked);
  const startSessionTimer       = useMasteryStore(s => s.startSessionTimer);
  const commitSessionLog        = useMasteryStore(s => s.commitSessionLog);
  const progressChallenge       = useMasteryStore(s => s.progressChallenge);
  const currentChallenge        = useMasteryStore(s => s.currentChallenge);
  const pendingRankAcknowledgement = useMasteryStore(s => s.pendingRankAcknowledgement);
  const clearRankAcknowledgement = useMasteryStore(s => s.clearRankAcknowledgement);
  const currentPositionNodeId   = useMasteryStore(s => s.currentPositionNodeId);
  const earnedBadges            = useMasteryStore(s => s.earnedBadges);
  const earnedCeremonialRanks   = useMasteryStore(s => s.earnedCeremonialRanks);

  const displayName = profile.tpName || profile.tokiPonaName || studentName || 'ANTHONY';

  const messagesEndRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let currentXP = 0;
    for (const change of sessionDeltas) {
      const vocabWord = vocabulary.find(v => v.id === change.id || v.word.toLowerCase() === change.id.toLowerCase());
      const multiplier = WORD_FREQUENCY[vocabWord?.word.toLowerCase() || ''] ?? 1.0;
      
      if (change.newStatus) {
         const oldScore = vocabWord?.baseScore || 0;
         const newScore = STATUS_MIDPOINT[change.newStatus];
         let diff = newScore - oldScore;
         if (diff > 0) diff *= xpMultiplier;
         currentXP += diff * multiplier;
      }
    }
    setSessionXP(Math.round(currentXP));
  }, [sessionDeltas, vocabulary, xpMultiplier]);

  useEffect(() => {
    if (isActive && !isMinimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isActive, isMinimized]);

  useEffect(() => {
    const handleGlobalClick = () => setTranslateBubble(null);
    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const text = selection.toString().trim();
    if (!text) return;
    setTimeout(() => {
      try {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) return;
        const lastRect = rects[rects.length - 1];
        setTranslateBubble({ text, top: lastRect.top - 45, left: lastRect.left + (lastRect.width / 2) });
      } catch (err) { console.error('Selection error:', err); }
    }, 10);
  };

  const handleTranslateClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!translateBubble || translateBubble.loading) return;
    setTranslateBubble(prev => prev ? { ...prev, loading: true } : null);
    try {
      const key = resolveApiKey();
      const result = await fetchQuickTranslation(key, translateBubble.text);
      setTranslateBubble(prev => prev ? { ...prev, loading: false, result: result || 'Could not translate.' } : null);
    } catch (err) {
      setTranslateBubble(prev => prev ? { ...prev, loading: false, result: 'Error translating.' } : null);
    }
  };

  useEffect(() => {
    if (!isActive || !pendingPrompt) return;
    yesterdayWasActive.current = runMorningStreakCheck();
    
    // Detect context
    let newContext: 'GENERAL' | 'DAILY_REVIEW' | 'GRAMMAR_CHECK' | 'LESSON' | 'PHRASE_PRACTICE' | 'VOCAB_PANEL' | 'MASTERY_COURT' = 'GENERAL';
    const low = pendingPrompt.toLowerCase();
    
    if (low.includes('daily review')) newContext = 'DAILY_REVIEW';
    else if (low.includes('mastery court')) newContext = 'MASTERY_COURT';
    else if (low.includes('explain the grammar') || low.includes('deep-dive')) newContext = 'GRAMMAR_CHECK';
    else if (low.includes('start a lesson') || low.includes('roadmap')) newContext = 'LESSON';
    else if (low.includes('practice this sentence') || low.includes('sentence builder')) newContext = 'GRAMMAR_CHECK';
    else if (low.includes('practice my saved phrases') || low.includes('practice this phrase')) newContext = 'PHRASE_PRACTICE';
    else if (low.includes('vocab') || low.includes('deep dive')) newContext = 'VOCAB_PANEL';

    let contextPayload: string | undefined = undefined;
    if (newContext === 'VOCAB_PANEL') {
      const match = pendingPrompt.match(/(?:about the word|deep-dive|for the word|word)\s+([^\s\.\?!]+)/i);
      if (match) contextPayload = match[1].replace(/[[\]"']/g, '').trim();
    } else if (newContext === 'PHRASE_PRACTICE' || newContext === 'GRAMMAR_CHECK') {
      const match = pendingPrompt.match(/"([^"]+)"/);
      if (match) contextPayload = match[1].trim();
    }

    if (newContext === 'MASTERY_COURT') {
      awardBadge('court_session');
    }

    updateSession(sessionId, { 
      context: newContext as any,
      contextPayload: contextPayload,
      title: detectSessionTitle(pendingPrompt),
      messages: [],
      history: [],
      sessionDeltas: []
    } as any);
    
    setStartingTotalXP(getStatusSummary().xp);
    setSessionXP(0);
    setInput('');
    const key = resolveApiKey();
    
    // PROACTIVE INITIALIZATION:
    // If it's a [SYSTEM: ...] prompt, treat it as hidden context and trigger jan Lina
    const isProactive = pendingPrompt.startsWith('[SYSTEM:');
    
    if (isProactive) {
      triggerProactiveGreeting(pendingPrompt, key);
    } else {
      if (key || isSandboxMode) { sendToLina(pendingPrompt, key); }
    }
    
    clearPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, pendingPrompt, isSandboxMode, clearPrompt]);

  async function triggerProactiveGreeting(context: string, overrideKey?: string) {
    if (!isSandboxMode && !resolveApiKey(overrideKey)) return;
    startSessionTimer();
    setIsLoading(true);
    const assistantId = crypto.randomUUID();
    
    const initialAssistantMsg: ChatMessage = { id: assistantId, role: 'assistant', displayContent: '· · ·', raw: '' };
    updateSession(sessionId, { messages: [initialAssistantMsg] });
    
    if (isSandboxMode) {
      const finalMsg = { ...initialAssistantMsg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE };
      updateSession(sessionId, { 
        messages: [finalMsg],
        history: [{ role: 'assistant', content: SANDBOX_RESPONSE }]
      });
      setIsLoading(false);
      return;
    }

    try {
      const key = resolveApiKey(overrideKey);
      const state = useMasteryStore.getState();
      const userContext = stringifyUserContext(state.profile);
      const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId) as any;
      const latestChatContext = currentSession?.context || 'GENERAL';
      const payload = currentSession?.contextPayload;
      const vibe = currentSession?.vibe ?? 'chill';

      const sys = latestChatContext === 'MASTERY_COURT'
        ? buildMasteryCourtPrompt(state.vocabulary, displayName, userContext)
        : latestChatContext === 'LESSON' 
          ? buildTutorPrompt(state.vocabulary, [], displayName, userContext, undefined, undefined, vibe, yesterdayWasActive.current, getRegressionCandidates(7), getTopConfusionPairs(5), pendingProveItResponses, xpMultiplier, currentChallenge, pendingRankAcknowledgement)
          : buildChatPrompt(state.vocabulary, displayName, userContext, latestChatContext, payload, yesterdayWasActive.current, getTopConfusionPairs(5), xpMultiplier, pendingRankAcknowledgement);
      
      const triggerMsg = `[SYSTEM: Start the session now based on this context: ${context}. Greet the student and proceed naturally.]`;
      let full = '';
      for await (const chunk of streamCompletion(key, sys, [{ role: 'user', content: triggerMsg }])) {
        full += chunk;
        const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId);
        if (!currentSession) break;

        updateSession(sessionId, {
          messages: currentSession.messages.map(msg => msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg)
        });
      }
      updateSession(sessionId, {
        history: [
          { role: 'user', content: triggerMsg },
          { role: 'assistant', content: full }
        ]
      });
    } catch (e) {
      console.error(e);
      updateSession(sessionId, {
        messages: [{ id: assistantId, role: 'assistant', displayContent: "pakala!" }]
      });
    } finally { setIsLoading(false); }
  }

  async function handleEndSession() {
    if (!window.confirm("Are you sure you want to end this session? Conversation history will be lost.")) return;
    
    const lastAsstMsg = messages.filter(m => m.role === 'assistant').pop();
    if (lastAsstMsg && lastAsstMsg.raw) {
       const summaryNotes = parseSessionSummaryNotes(lastAsstMsg.raw);
       if (summaryNotes) {
         for (const n of summaryNotes) updateSessionNotes(n.word, n.note);
       }
    }

    const deltas = sessionDeltas;
    
    // XP Calculation for Recap
    let totalXP = 0;
    const wordsMoved: any[] = [];
    
    for (const change of deltas) {
      const vocabWord = vocabulary.find(v => v.id === change.id || v.word.toLowerCase() === change.id.toLowerCase());
      const multiplier = WORD_FREQUENCY[vocabWord?.word.toLowerCase() || ''] ?? 1.0;
      
      if (change.newStatus) {
         const oldScore = vocabWord?.baseScore || 0;
         const newScore = STATUS_MIDPOINT[change.newStatus];
         let diff = newScore - oldScore;
         if (diff > 0) diff *= xpMultiplier;
         totalXP += diff * multiplier;
         
         wordsMoved.push({
           word: vocabWord?.word || change.id,
           oldStatus: vocabWord?.status || 'not_started',
           newStatus: change.newStatus,
           hardened: vocabWord?.hardened,
           roleMastered: false // Simplified for now
         });
      }
    }
    totalXP = Math.round(totalXP);

    if (deltas.length === 0 || isSandboxMode) { 
      if (chatContext === 'LESSON') clearProveItResponses();
      onEndSession(); 
      return; 
    }

    // Mark that a session happened
    if (!earnedBadges.some(b => b.id === 'first_session')) {
      awardBadge('first_session');
    }
    
    for (const change of deltas) {
      if (change.type === 'vocab' && change.newStatus) updateVocabStatus(change.id, change.newStatus);
      if (change.type === 'vocab_production' && change.newStatus) updateProductionStatus(change.id, change.newStatus);
      if (change.type === 'vocab_recognition' && change.newStatus) updateRecognitionStatus(change.id, change.newStatus);
      if (change.type === 'confusion' && change.wordB) recordConfusion(change.id, change.wordB);
      if (change.type === 'example' && change.exampleSentence) setPinnedExample(change.id, change.exampleSentence);
    }
    
    setLastUpdated(new Date().toLocaleDateString());
    recordLearningDay(new Date().toISOString().split('T')[0]);

    if (chatContext === 'LESSON') clearProveItResponses();

    // Gamification Updates
    updateSessionXPRecord(totalXP);
    const badgesBefore = earnedBadges.map(b => b.id);
    const ranksBefore = earnedCeremonialRanks.map(r => r.id);
    
    checkAndAwardRanks();
    
    const badgesAfter = useMasteryStore.getState().earnedBadges.map(b => b.id);
    const ranksAfter = useMasteryStore.getState().earnedCeremonialRanks.map(r => r.id);
    
    const newBadges = badgesAfter.filter(id => !badgesBefore.includes(id));
    const newRanks = ranksAfter.filter(id => !ranksBefore.includes(id));

    setSessionXP(totalXP);

    // Commit Log
    commitSessionLog({
      date: new Date().toISOString(),
      title: currentSession?.title || 'Session Summary',
      context: chatContext,
      xpEarned: totalXP,
      grade: totalXP > 500 || wordsMoved.some(w => w.newStatus === 'mastered') ? 'S' : totalXP > 250 ? 'A' : totalXP > 100 ? 'B' : totalXP > 0 ? 'C' : null,
      wordsChanged: wordsMoved.map(w => ({ word: w.word, fromStatus: w.oldStatus, toStatus: w.newStatus })),
      smallRankAtClose: getStatusSummary().rankTitle,
      sessionRecapText: '', // Will be filled if needed, but SessionRecap doesn't strictly need it from log
      badgesEarned: newBadges,
      ceremonialRanksEarned: newRanks,
      streakAtClose: currentStreak,
      curriculumNodeId: currentPositionNodeId
    });

    if (totalXP > 0) {
      progressChallenge(1, 'session_count');
    }

    clearRankAcknowledgement();
    setShowRecap(true);
  }

  async function sendToLina(txt: string, overrideKey?: string) {
    if (isLoading || !txt.trim()) return;
    if (!isSandboxMode && !resolveApiKey(overrideKey)) return;
    setIsLoading(true);
    setInput('');
    
    const newUserMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', displayContent: txt };
    const assistantId = crypto.randomUUID();
    const newAssistantMsg: ChatMessage = { id: assistantId, role: 'assistant', displayContent: '· · ·', raw: '' };
    
    updateSession(sessionId, { 
      messages: [...messages, newUserMsg, newAssistantMsg],
      history: [...history, { role: 'user', content: txt }]
    });

    if (isSandboxMode) {
      updateSession(sessionId, {
        messages: (session?.messages || []).map(msg => msg.id === assistantId ? { ...msg, displayContent: SANDBOX_RESPONSE, raw: SANDBOX_RESPONSE } : msg),
        history: [...history, { role: 'user', content: txt }, { role: 'assistant', content: SANDBOX_RESPONSE }]
      });
      setIsLoading(false);
      return;
    }

    setUserMsgCount(prev => {
      const next = prev + 1;
      if (next === 10) {
        progressChallenge(1, 'convo_length');
      }
      return next;
    });

    try {
      const key = resolveApiKey(overrideKey);
      const state = useMasteryStore.getState();
      const userContext = stringifyUserContext(state.profile);
      const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId) as any;
      const latestChatContext = currentSession?.context || 'GENERAL';
      const payload = currentSession?.contextPayload;
      const vibe = currentSession?.vibe ?? 'chill';

      const sys = latestChatContext === 'MASTERY_COURT'
        ? buildMasteryCourtPrompt(state.vocabulary, displayName, userContext)
        : latestChatContext === 'LESSON' 
          ? buildTutorPrompt(state.vocabulary, [], displayName, userContext, undefined, undefined, vibe, yesterdayWasActive.current, getRegressionCandidates(7), getTopConfusionPairs(5), pendingProveItResponses, xpMultiplier, currentChallenge, pendingRankAcknowledgement)
          : buildChatPrompt(state.vocabulary, displayName, userContext, latestChatContext, payload, yesterdayWasActive.current, getTopConfusionPairs(5), xpMultiplier, pendingRankAcknowledgement);
      
      const windowedHistory = [...history, { role: 'user', content: txt }].slice(-HISTORY_WINDOW);
      let full = '';
      for await (const chunk of streamCompletion(key, sys, windowedHistory)) {
        full += chunk;
        const currentSession = useChatStore.getState().sessions.find(s => s.id === sessionId);
        if (!currentSession) break; // User closed chat

        updateSession(sessionId, {
          messages: currentSession.messages.map(msg => 
            msg.id === assistantId ? { ...msg, displayContent: stripProposedChanges(full), raw: full } : msg
          )
        });
      }
      const changes = parseProposedChanges(full);
      const updatedMessages = (useChatStore.getState().sessions.find(s => s.id === sessionId)?.messages || []).map(msg => 
        msg.id === assistantId ? { ...msg, proposedChanges: changes || undefined } : msg
      );
      
      const newDeltas = [...sessionDeltas];
      if (changes && changes.length > 0) {
        if (latestChatContext === 'MASTERY_COURT') {
          for (const change of changes) {
            if (change.type === 'vocab' && change.newStatus) updateVocabStatus(change.id, change.newStatus);
            if (change.type === 'vocab_production' && change.newStatus) updateProductionStatus(change.id, change.newStatus);
            if (change.type === 'vocab_recognition' && change.newStatus) updateRecognitionStatus(change.id, change.newStatus);
            if (change.type === 'confusion' && change.wordB) recordConfusion(change.id, change.wordB);
            if (change.type === 'example' && change.exampleSentence) setPinnedExample(change.id, change.exampleSentence);
          }
        }
        newDeltas.push(...changes);
      }

      updateSession(sessionId, {
        messages: updatedMessages,
        history: [...history, { role: 'user', content: txt }, { role: 'assistant', content: full }],
        sessionDeltas: newDeltas
      });
    } catch (e) {
      console.error(e);
      updateSession(sessionId, {
        messages: (useChatStore.getState().sessions.find(s => s.id === sessionId)?.messages || []).map(msg => 
          msg.id === assistantId ? { ...msg, displayContent: "pakala!" } : msg
        )
      });
    } finally { setIsLoading(false); }
  }

  return (
    <LazyMotion features={domMax}>
      <m.div
        className="chat-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0, height: isMinimized ? 'var(--header-height)' : '100%' }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--surface-opaque)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          bottom: 0,
          right: 0,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--border)',
          zIndex: 6000,
          ...style
        }}
      >
        <header style={{ 
          height: 'var(--header-height)', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(5,5,5,0.95)',
          backdropFilter: 'var(--glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)', margin: 0 }}>{chatContext === 'GENERAL' ? 'jan LINA LINK' : chatContext}</h2>
            {sessionXP > 0 && (
              <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800 }}>
                +{sessionXP} XP {xpMultiplier > 1.0 && '🔥'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onMinimize}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 900 }}
            >
              {isMinimized ? 'EXPAND' : 'MINIMIZE'}
            </button>
            <button 
              onClick={handleEndSession} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--gold)', 
                fontSize: '1.2rem', 
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ✕
            </button>
          </div>
        </header>

        {translateBubble && (
          <div onMouseDown={e => e.stopPropagation()} style={{ position: 'fixed', top: translateBubble.top, left: translateBubble.left, transform: 'translateX(-50%)', zIndex: 7000, background: '#222', border: '1px solid #444', borderRadius: '4px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontSize: '0.8rem', color: 'white', minWidth: '100px', textAlign: 'center' }}>
            {translateBubble.result ? <div style={{ lineHeight: '1.4' }}>{translateBubble.result}</div> : <button onClick={handleTranslateClick} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', color: 'black', padding: '4px 8px', fontWeight: 900, cursor: 'pointer', fontSize: '0.7rem' }}>{translateBubble.loading ? '...' : 'TRANSLATE'}</button>}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: isMinimized ? 'none' : 'block' }}>
          {isSandboxMode && <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid var(--gold)', borderRadius: '2px', fontSize: '0.7rem', color: 'var(--gold)', textAlign: 'center' }}>OFFLINE PROTOCOL ACTIVE</div>}
          {messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '24px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{ color: 'var(--gold)', fontSize: '0.6rem', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.1em' }}>{msg.role === 'assistant' ? 'jan LINA' : (displayName.toUpperCase())}</div>
              <div style={{ background: msg.role === 'assistant' ? 'rgba(255,255,255,0.03)' : 'rgba(255, 191, 0, 0.1)', padding: '12px', borderRadius: '2px', border: '1px solid var(--border)', color: 'white', display: 'inline-block', textAlign: 'left', maxWidth: '90%', fontSize: '0.9rem', lineHeight: '1.5' }}>{msg.displayContent || (isLoading && msg.role === 'assistant' ? '· · ·' : '')}</div>
              {msg.proposedChanges && msg.proposedChanges.map((c) => <div key={`${c.type}_${c.id}`} style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 700 }}>+ CALIBRATING: {c.id} → {c.newStatus}</div>)}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', background: 'rgba(5,5,5,0.5)', borderTop: '1px solid var(--border)', display: isMinimized ? 'none' : 'flex', gap: '8px' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && sendToLina(input)} 
            placeholder={chatContext === 'GENERAL' ? "Ask jan Lina something..." : "Type your response..."} 
            style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px', color: 'white', outline: 'none', fontSize: '0.9rem' }} 
          />
          <button onClick={() => sendToLina(input)} disabled={isLoading} style={{ background: 'var(--gold)', border: 'none', borderRadius: '2px', padding: '0 20px', color: 'black', fontWeight: 900, cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}>{isLoading ? '...' : 'SEND'}</button>
        </div>

        {showRecap && (
          <SessionRecap
            sessionTitle={currentSession?.title || 'Session Summary'}
            totalXPEarned={sessionXP}
            prevTotalXP={startingTotalXP}
            xpMultiplier={xpMultiplier}
            wordsMoved={sessionDeltas.filter(d => !!d.newStatus).map(d => {
              const v = vocabulary.find(word => word.id === d.id || word.word === d.id);
              return {
                word: v?.word || d.id,
                oldStatus: v?.status || 'not_started',
                newStatus: d.newStatus!,
                hardened: v?.hardened,
                roleMastered: false // simplified
              };
            })}
            wordOfTheSession={(() => {
              const bestChange = [...sessionDeltas].filter(d => !!d.newStatus).sort((a, b) => {
                const va = vocabulary.find(w => w.id === a.id || w.word === a.id);
                const vb = vocabulary.find(w => w.id === b.id || w.word === b.id);
                const scoreA = STATUS_MIDPOINT[a.newStatus!] - (va?.baseScore || 0);
                const scoreB = STATUS_MIDPOINT[b.newStatus!] - (vb?.baseScore || 0);
                return scoreB - scoreA;
              })[0];
              if (!bestChange) return null;
              const v = vocabulary.find(w => w.id === bestChange.id || w.word === bestChange.id);
              return { word: v?.word || bestChange.id, newStatus: bestChange.newStatus!, note: v?.sessionNotes || 'Great improvement!' };
            })()}
            newRankUnlocked={newRankUnlocked}
            isPersonalBest={sessionXP > 0 && sessionXP >= useMasteryStore.getState().sessionXPRecord}
            streak={currentStreak}
            shieldsRemaining={streakShields}
            onContinue={() => {
              setShowRecap(false);
              clearNewRankUnlocked();
              updateSession(sessionId, { sessionDeltas: [] });
              onEndSession();
            }}
          />
        )}
      </m.div>
    </LazyMotion>
  );
}
