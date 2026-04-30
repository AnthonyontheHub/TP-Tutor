/* src/components/DailyStoicPopup.tsx */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoicStore } from '../store/stoicStore';
import { useAuthStore } from '../store/authStore';
import { useMasteryStore } from '../store/masteryStore';
import { Book, Send, Sparkles, X } from 'lucide-react';

export default function DailyStoicPopup() {
  const { user } = useAuthStore();
  const { todayQuote, fetchTodayQuote, phase1DismissedAt, phase2CompletedAt, phase3CompletedAt, dismissPhase1, completePhase2, completePhase3, devReset } = useStoicStore();
  const { recordInsight } = useMasteryStore();

  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [devPhaseOverride, setDevPhaseOverride] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchTodayQuote(user.uid);
    }
  }, [user, fetchTodayQuote]);

  if (!todayQuote) return null;

  const now = new Date();
  const currentHour = now.getHours();

  // Phase Logic
  let phase = 0;
  if (currentHour >= 8 && !phase1DismissedAt) {
    phase = 1;
  } else if (phase1DismissedAt && !phase2CompletedAt) {
    const dismissedTime = new Date(phase1DismissedAt).getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    if (Date.now() - dismissedTime >= twoHoursInMs) {
      phase = 2;
    }
  } else if (phase2CompletedAt && !phase3CompletedAt && currentHour >= 21) {
    phase = 3;
  }

  // Dev Override
  if (devPhaseOverride !== null) {
    phase = devPhaseOverride;
  }

  if (phase === 0) return null;

  const handlePhase1Dismiss = () => {
    dismissPhase1();
    setDevPhaseOverride(null);
  };

  const handlePhase2Submit = () => {
    // Engagement based XP
    let xp = 10; // Read/Attempted
    if (input.length > 5) xp += 10;
    
    completePhase2(xp);
    recordInsight('Daily Stoic Challenge', xp);
    setFeedback(`Great attempt! The original English was: "${todayQuote.english}"`);
    setTimeout(() => {
      setFeedback(null);
      setInput('');
      setDevPhaseOverride(null);
    }, 5000);
  };

  const handlePhase3Submit = () => {
    completePhase3();
    recordInsight('Daily Stoic Reflection', 20);
    setDevPhaseOverride(null);
    setInput('');
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
        {/* Dev Controls */}
        <div style={{ display: 'flex', gap: '5px', opacity: 0.5 }}>
          <button onClick={() => setDevPhaseOverride(1)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P1</button>
          <button onClick={() => setDevPhaseOverride(2)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P2</button>
          <button onClick={() => setDevPhaseOverride(3)} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>P3</button>
          <button onClick={devReset} style={{ fontSize: '0.6rem', padding: '2px 5px', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>Reset</button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-panel"
          style={{
            width: '320px',
            padding: '20px',
            background: 'rgba(15, 15, 15, 0.95)',
            border: '1px solid var(--gold)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Book size={16} color="var(--gold)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em' }}>
                DAILY STOIC {phase === 1 ? '• MORNING' : phase === 2 ? '• CHALLENGE' : '• EVENING'}
              </span>
            </div>
            <button onClick={() => setDevPhaseOverride(0)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </header>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 500, lineHeight: 1.4, fontStyle: 'italic' }}>
              "{todayQuote.tokiPona}"
            </p>
          </div>

          {phase === 1 && (
            <button
              onClick={handlePhase1Dismiss}
              className="btn-review"
              style={{ width: '100%', padding: '10px' }}
            >
              UNDERSTOOD
            </button>
          )}

          {phase === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Translate this back to English:</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your translation..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px',
                  fontSize: '0.9rem',
                  minHeight: '60px',
                  resize: 'none'
                }}
              />
              <button
                onClick={handlePhase2Submit}
                className="btn-review"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Send size={16} />
                SUBMIT
              </button>
              {feedback && (
                <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '5px' }}>{feedback}</p>
              )}
            </div>
          )}

          {phase === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Evening Reflection (in Toki Pona):</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="toki sina li seme?"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '10px',
                  fontSize: '0.9rem',
                  minHeight: '60px',
                  resize: 'none'
                }}
              />
              <button
                onClick={handlePhase3Submit}
                className="btn-review"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Sparkles size={16} />
                REFLECT
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
