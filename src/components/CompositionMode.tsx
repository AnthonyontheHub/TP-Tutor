import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { fetchCompositionGrade, resolveApiKey, stringifyUserContext } from '../services/linaService';
import type { CompositionResult } from '../types/mastery';

interface Props {
  onClose: () => void;
  isSandboxMode: boolean;
}

type Screen = 'write' | 'loading' | 'results';

const PROMPTS = [
  { label: 'Describe your day', starter: 'tenpo suno ni la mi ' },
  { label: 'Write about something you love', starter: 'mi olin e ' },
  { label: 'Tell a short story', starter: 'tenpo pini la jan mije lili li ' },
];

const GRADE_COLORS = {
  S: { color: 'var(--gold)', glow: '0 0 20px rgba(255, 191, 0, 0.5)' },
  A: { color: '#22c55e', glow: 'none' },
  B: { color: '#3b82f6', glow: 'none' },
  C: { color: '#a855f7', glow: 'none' },
  F: { color: '#ef4444', glow: 'none' },
};

export default function CompositionMode({ onClose, isSandboxMode }: Props) {
  const { vocabulary, profile, lore, updateSessionNotes } = useMasteryStore();
  const [screen, setScreen] = useState<Screen>('write');
  const [text, setText] = useState('');
  const [result, setResult] = useState<CompositionResult | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = !isSandboxMode && wordCount >= 3;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setScreen('loading');
    
    const apiKey = resolveApiKey();
    const context = stringifyUserContext(profile, lore.map(l => l.detail).join('\n'));
    
    const res = await fetchCompositionGrade(apiKey, text, vocabulary, context);
    setResult(res);
    setScreen('results');
  };

  const handleSaveToLogbook = () => {
    if (!result) return;
    result.corrections.forEach(c => {
      // Find words in the original incorrect phrase
      const words = c.original.toLowerCase().match(/[a-z]+/g) || [];
      words.forEach(word => {
        const entry = vocabulary.find(v => v.word === word);
        if (entry) {
          updateSessionNotes(entry.id, `Composition error: "${c.original}" -> "${c.corrected}". Reason: ${c.explanation}`);
        }
      });
    });
    alert('Notes saved to relevant vocabulary items in your logbook.');
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 6000, background: 'rgba(0,0,0,0.9)' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 6001 }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid #555', color: '#ccc', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 900 }}>
          CLOSE
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '90vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          {screen === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel"
              style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}
            >
              <div>
                <h2 style={{ color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>COMPOSITION MODE</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Write anything in Toki Pona. jan Lina will grade it.</p>
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="o toki! sina ken toki e ijo ale..."
                  style={{
                    width: '100%',
                    minHeight: '180px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '16px',
                    color: 'white',
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '0.8rem', color: wordCount < 3 ? '#ef4444' : 'var(--text-muted)' }}>
                  {wordCount} words
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PROMPTS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setText(p.starter)}
                    className="chip-btn"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--border)',
                      color: '#ccc',
                      borderRadius: '16px',
                      padding: '6px 16px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {isSandboxMode && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
                  Sandbox mode — grading unavailable
                </div>
              )}

              <button
                className="btn-review"
                disabled={!canSubmit}
                onClick={handleSubmit}
                style={{ marginTop: 'auto', padding: '16px' }}
              >
                SUBMIT FOR GRADING
              </button>
            </motion.div>
          )}

          {screen === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}
            >
              <div className="pulse" style={{ fontSize: '3rem' }}>✍️</div>
              <div className="pulse" style={{ color: 'var(--gold)', fontWeight: 900, letterSpacing: '0.1em' }}>jan Lina is reading your work...</div>
            </motion.div>
          )}

          {screen === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel"
              style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  fontWeight: 900, 
                  color: GRADE_COLORS[result.overallGrade].color, 
                  textShadow: GRADE_COLORS[result.overallGrade].glow,
                  lineHeight: 1
                }}>
                  {result.overallGrade}
                </div>
                <p style={{ marginTop: '12px', fontSize: '1rem', fontWeight: 600, color: 'white' }}>{result.gradeReason}</p>
              </div>

              {result.highlights.length > 0 && (
                <section>
                  <h3 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>WHAT YOU DID WELL</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {result.highlights.map((h, i) => (
                      <div key={i} style={{ background: 'rgba(255,191,0,0.05)', borderLeft: '3px solid var(--gold)', padding: '12px', borderRadius: '4px' }}>
                        <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.9rem' }}>{h.phrase}</div>
                        <div style={{ color: '#ccc', fontSize: '0.8rem', marginTop: '4px' }}>{h.reason}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {result.corrections.length > 0 && (
                <section>
                  <h3 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '12px' }}>CORRECTIONS</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {result.corrections.map((c, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ color: '#ef4444', textDecoration: 'line-through', fontSize: '0.9rem' }}>{c.original}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                          <span style={{ color: 'var(--cyan)', fontWeight: 800, fontSize: '0.9rem' }}>{c.corrected}</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>{c.explanation}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '8px' }}>OVERALL FEEDBACK</h3>
                <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>{result.overallFeedback}</p>
              </section>

              {result.suggestedRewrite && (
                <section>
                  <button 
                    onClick={() => setIsRewriting(!isRewriting)}
                    style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer', padding: 0, letterSpacing: '0.1em' }}
                  >
                    {isRewriting ? 'HIDE SUGGESTED REWRITE ▲' : 'SEE SUGGESTED REWRITE ▼'}
                  </button>
                  {isRewriting && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ marginTop: '12px', padding: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--gold)', borderRadius: '8px', color: 'white', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6' }}
                    >
                      {result.suggestedRewrite}
                    </motion.div>
                  )}
                </section>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: 'auto' }}>
                <button className="btn-toggle" onClick={() => { setScreen('write'); setResult(null); }}>WRITE AGAIN</button>
                <button className="btn-review" onClick={handleSaveToLogbook} disabled={result.corrections.length === 0}>SAVE TO LOGBOOK</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
