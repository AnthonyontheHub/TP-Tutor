/* src/components/InstructionsPanel.tsx */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META, SMALL_RANKS } from '../types/mastery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Section = ({ title, emoji, children, defaultOpen = false }: { title: string, emoji: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.1em', color: 'white' }}>{title}</span>
        </div>
        <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>{isOpen ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 24px 20px', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.6' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function InstructionsPanel({ onClose }: Props) {
  const { getStatusSummary } = useMasteryStore();
  const summary = getStatusSummary();

  return (
    <motion.div
      className="side-panel"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ overflowY: 'auto', background: 'rgba(5,5,5,0.98)' }}
    >
      <header className="side-panel-header" style={{ justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(10px)', padding: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', margin: 0 }}>FIELD GUIDE</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>pona. here's everything you need to know.</p>
        </div>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content" style={{ padding: '0 0 100px 0' }}>
        
        <Section title="WELCOME" emoji="🌱" defaultOpen={true}>
          <p style={{ color: '#eee', marginBottom: '20px' }}>
            This is <span style={{ color: 'var(--gold)', fontWeight: 800 }}>TP-Tutor</span> — your personal Toki Pona immersion system. 
            Toki Pona is a constructed language with only ~137 words. 
            Sounds simple. It's not. But jan Lina's got you.
          </p>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { n: '1', icon: '🧬', text: 'Set up your profile & lore in Settings so jan Lina knows your world.' },
              { n: '2', icon: '🎛️', text: 'Pick a Review Vibe on the dashboard — Chill, Deep, or Intense.' },
              { n: '3', icon: '💬', text: 'Open jan Lina and start talking. That\'s it. She takes it from there.' }
            ].map(item => (
              <div key={item.n} style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem' }}>{item.n}</div>
                <div style={{ fontSize: '0.8rem', color: '#ccc' }}><span style={{ marginRight: '8px' }}>{item.icon}</span>{item.text}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="THE MAP" emoji="🗺️">
          <p style={{ marginBottom: '20px' }}>Your <span style={{ color: 'var(--gold)' }}>ROADMAP</span> tab is one continuous path — past, present, and future all on the same road.</p>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#444', border: '2px solid #666' }} />
                <div style={{ flex: 1, height: '2px', background: 'var(--gold)', opacity: 0.5 }} />
                <div style={{ fontSize: '0.7rem', color: '#888' }}>PAST: Session nodes</div>
              </div>
              <div style={{ height: '20px', width: '2px', background: 'var(--gold)', alignSelf: 'flex-start', marginLeft: '5px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'white', boxShadow: '0 0 10px white' }} />
                <div style={{ flex: 1, height: '2px', background: 'var(--gold)' }} />
                <div style={{ fontSize: '0.7rem', color: 'white', fontWeight: 900 }}>PRESENT: You are here</div>
              </div>
              <div style={{ height: '20px', width: '2px', borderLeft: '2px dashed var(--gold)', opacity: 0.3, alignSelf: 'flex-start', marginLeft: '5px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px dashed #444' }} />
                <div style={{ flex: 1, height: '2px', borderTop: '2px dashed var(--gold)', opacity: 0.2 }} />
                <div style={{ fontSize: '0.7rem', color: '#555' }}>FUTURE: Locked content</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { t: 'VOCAB', d: 'Your word grid. Sort, filter, explore.' },
              { t: 'ROADMAP', d: 'The unified path. Past + future.' },
              { t: 'ARCHIVE', d: 'Saved phrases, expressions, songs.' },
              { t: 'JOURNEY', d: 'Your full session history in one place.' }
            ].map(tab => (
              <div key={tab.t} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', marginBottom: '4px' }}>{tab.t}</div>
                <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: '1.3' }}>{tab.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="JAN LINA" emoji="🤖">
          <p style={{ color: '#eee' }}>jan Lina is your AI tutor. <span style={{ color: 'var(--gold)' }}>Cool older sister energy</span>. She knows Toki Pona. She knows your life (if you set up your lore). She will call you out.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '20px 0' }}>
            {[
              { i: '💬', t: 'CHAT', s: 'General convo' },
              { i: '📚', t: 'LESSON', s: 'Structured' },
              { i: '🌅', t: 'REVIEW', s: 'Daily quick' },
              { i: '🔤', t: 'VOCAB', s: 'Deep dive' },
              { i: '⚖️', t: 'COURT', s: 'Petition' },
              { i: '📝', t: 'BUILDER', s: 'Practice' }
            ].map(item => (
              <div key={item.t} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 5px', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.i}</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'white' }}>{item.t}</div>
                <div style={{ fontSize: '0.5rem', opacity: 0.5 }}>{item.s}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
            <strong style={{ color: 'var(--gold)' }}>CALIBRATING:</strong> When you see this, jan Lina is silently proposing a mastery update. It applies when you end the session.
          </p>
          <p style={{ fontSize: '0.8rem', marginBottom: '24px' }}>
            <strong style={{ color: 'var(--gold)' }}>SESSION END:</strong> Say goodbye naturally — "that's all", "thanks". She'll wrap up, write session notes, and commit your progress.
          </p>

          <div style={{ border: '1px solid var(--gold)', padding: '16px', borderRadius: '8px', background: 'rgba(255,191,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <span>⚖️</span>
              <span style={{ fontWeight: 900, fontSize: '0.75rem', color: 'var(--gold)', letterSpacing: '0.1em' }}>MASTERY COURT</span>
            </div>
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Think a word was upgraded by mistake? Go to Settings → Mastery Court. Make your case. She decides. She can say no.</p>
          </div>
        </Section>

        <Section title="YOUR WORDS" emoji="📖">
          <p style={{ marginBottom: '16px' }}>Every word has a score from 0 to 1000. <span style={{ color: 'white', fontWeight: 800 }}>Score = status.</span></p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
            {[
              { s: 'not_started', r: '0–200' },
              { s: 'introduced', r: '201–500' },
              { s: 'practicing', r: '501–750' },
              { s: 'confident', r: '751–949' },
              { s: 'mastered', r: '950–1000' }
            ].map(item => (
              <div key={item.s} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem' }}>{STATUS_META[item.s as any].emoji}</span>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'white' }}>{STATUS_META[item.s as any].label}</div>
                <div style={{ fontSize: '0.5rem', opacity: 0.4, marginLeft: 'auto' }}>{item.r}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(34,197,94,0.05)', borderRadius: '4px' }}>
              <span style={{ color: '#22c55e', fontWeight: 900 }}>✅ CORRECT USAGE</span>
              <span style={{ color: '#22c55e' }}>SCORE UP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(239,68,68,0.05)', borderRadius: '4px' }}>
              <span style={{ color: '#ef4444', fontWeight: 900 }}>❌ ERRORS / STRUGGLES</span>
              <span style={{ color: '#ef4444' }}>SCORE DOWN</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
              <span style={{ color: '#888', fontWeight: 900 }}>⏰ 48HRS IDLE</span>
              <span style={{ color: '#888' }}>-15 PTS (DECAY)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <div style={{ flex: 1, padding: '10px', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#ef4444', marginBottom: '2px' }}>🩸 BLEEDING</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Lost 50+ pts in 48hrs. Needs attention.</div>
            </div>
            <div style={{ flex: 1, padding: '10px', borderRadius: '4px', background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: '#22c55e', marginBottom: '2px' }}>🛡️ HARDENED</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Mastered + immune to decay. Earned.</div>
            </div>
          </div>

          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>ROLE MASTERY:</strong> Words can be used as nouns, verbs, or modifiers. Demonstrate all roles → bonus points.</li>
            <li><strong style={{ color: 'white' }}>🎯 PROVE IT:</strong> Find it on the Dashboard. Get a word, write a sentence offline. jan Lina reviews it next session.</li>
            <li><strong style={{ color: 'white' }}>CONFUSION PAIRS:</strong> If you mix up two words repeatedly, jan Lina flags them for separation practice.</li>
          </ul>
        </Section>

        <Section title="YOUR PROGRESS" emoji="🏆">
          <p style={{ marginBottom: '20px' }}><span style={{ color: 'var(--gold)', fontWeight: 800 }}>XP</span> = the sum of all your word scores × frequency multipliers. Common words like 'li' and 'mi' are worth more.</p>
          
          <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '0.7rem', color: '#666', fontWeight: 800 }}>
            CURRENT XP: <span style={{ color: 'white' }}>{summary.xp.toLocaleString()}</span>
          </div>

          <div style={{ background: '#111', borderRadius: '8px', border: '1px solid #222', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <tbody>
                {[...SMALL_RANKS].reverse().map(r => {
                  const isCurrent = summary.rankTitle === r.title;
                  return (
                    <tr key={r.title} style={{ 
                      background: isCurrent ? 'var(--gold)' : 'transparent',
                      color: isCurrent ? 'black' : '#888',
                      borderBottom: '1px solid #222'
                    }}>
                      <td style={{ padding: '8px 16px', fontWeight: 900, opacity: isCurrent ? 1 : 0.4 }}>{r.xpThreshold.toLocaleString()}</td>
                      <td style={{ padding: '8px 16px', fontWeight: 900 }}>
                        {r.title.toUpperCase()}
                        {isCurrent && <span style={{ marginLeft: '12px', fontSize: '0.6rem', opacity: 0.7 }}>← YOU</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '32px' }}>
             <h4 style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '8px' }}>CEREMONIAL RANKS</h4>
             <p style={{ fontSize: '0.8rem', color: '#888' }}>Some titles can't be bought with XP — they're earned. Master 10 words → <span style={{ color: 'white' }}>The Initiate</span>. 30-day streak → <span style={{ color: 'white' }}>The Consistent One</span>. Master all 137 → <span style={{ color: 'white' }}>jan Sonja</span>.</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px' }}>🔥 STREAK BONUSES</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { d: '3', m: '1.1' },
                { d: '7', m: '1.25' },
                { d: '14', m: '1.5' },
                { d: '30', m: '1.75' }
              ].map(s => (
                <div key={s.d} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.5rem', opacity: 0.5, fontWeight: 900 }}>{s.d} DAYS</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--gold)' }}>{s.m}x</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '12px', opacity: 0.6 }}>🛡️ <strong style={{ color: 'white' }}>Streak Shields:</strong> Earn one every 7 days (max 2). Shield absorbs a missed day.</p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px' }}>SESSION GRADES</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { l: 'S', c: 'var(--gold)' },
                { l: 'A', c: '#22c55e' },
                { l: 'B', c: '#3b82f6' },
                { l: 'C', c: '#666' }
              ].map(g => (
                <div key={g.l} style={{ width: '32px', height: '32px', borderRadius: '50%', background: g.c, color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>{g.l}</div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.6 }}>S = 500+ XP or a new Mastered word.</p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid #333' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 900, marginBottom: '4px' }}>WEEKLY CHALLENGES</div>
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Every Monday, a new challenge appears on your Dashboard. Complete it for bonus XP. jan Lina knows about it and will help when she can.</p>
          </div>
        </Section>

        <Section title="THE ARCHIVE" emoji="📦">
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { i: '💾', t: 'MY SAVES', d: 'Phrases you\'ve saved from the Sentence Builder or jan Lina sessions. Tap to practice.' },
              { i: '🗣️', t: 'COMMON PHRASES', d: 'Everyday Toki Pona expressions. Good starting point for real conversation.' },
              { i: '🎵', t: 'DISCOGRAPHY', d: 'Toki Pona songs and lyrics. Use INTENSE vibe to deep-dive with jan Lina.' }
            ].map(item => (
              <div key={item.t} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.i}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white', letterSpacing: '0.1em' }}>{item.t}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>{item.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="TROUBLESHOOTING" emoji="⚙️">
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              { q: 'Why isn\'t jan Lina responding?', a: 'Check Settings for a valid Gemini API Key. Or flip on Sandbox Mode to test the UI without API calls.' },
              { q: 'How do I get a word to Mastered?', a: 'You can\'t just grind it — jan Lina has to agree. Show her you know it. She\'ll propose the upgrade when she\'s satisfied.' },
              { q: 'What\'s the Mastery Court?', a: 'Settings → Mastery Court. Go there to petition jan Lina to change a word\'s status. She can approve or deny. She takes it seriously.' },
              { q: 'Why did my streak reset?', a: 'You missed a day and had no shields. Shields are earned every 7 days (max 2). Use them wisely.' },
              { q: 'Where did my chat history go?', a: 'Sessions persist while the app is open. Closing the tab or logging out clears them. Your mastery data is safe in the cloud though.' },
              { q: 'What is the Logbook?', a: 'Settings → Teacher\'s Logbook. jan Lina\'s private notes on your progress. She reads them before every session.' },
              { q: 'What does BLEEDING mean?', a: 'A word that\'s dropped 50+ points in 48 hours. It\'s slipping. Review it before it falls a full tier.' }
            ].map(item => (
              <div key={item.q}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white', marginBottom: '4px' }}>Q: {item.q}</div>
                <div style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1.4' }}>A: {item.a}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </motion.div>
  );
}
