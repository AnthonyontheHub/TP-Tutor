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
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.1em', color: 'white' }}>{title}</span>
        </div>
        <span style={{ color: 'var(--gold)', fontSize: '1rem' }}>{isOpen ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 20px 24px 20px', fontSize: '0.85rem', color: '#aaa', lineHeight: '1.6' }}>{children}</div>
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
    <motion.div className="side-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ overflowY: 'auto', background: 'rgba(5,5,5,0.98)' }}>
      <header className="side-panel-header" style={{ justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(10px)', padding: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', margin: 0 }}>FIELD GUIDE</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>pona. here's everything you need to know.</p>
        </div>
        <button onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content" style={{ padding: '0 0 100px 0' }}>
        <Section title="WELCOME" emoji="🌱" defaultOpen={true}>
          <p style={{ color: '#eee', marginBottom: '20px' }}>This is <span style={{ color: 'var(--gold)', fontWeight: 800 }}>TP-Tutor</span> — your personal Toki Pona immersion system.</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.2rem' }}>1</div>
              <div style={{ fontSize: '0.8rem', color: '#ccc' }}><strong>Review Vibes are contextual.</strong> On the Vocab tab, "Chill" means general practice. On the Archive tab, it practices your Saves. On the Roadmap, it reviews past nodes.</div>
            </div>
          </div>
        </Section>

        <Section title="THE MAP & FILTERS" emoji="🗺️">
          <p style={{ marginBottom: '20px' }}>Your ROADMAP tab is one continuous path.</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Node Filters:</strong> Clicking a node on the Roadmap filters your Vocab tab to only show words required for that specific module.</li>
            <li><strong style={{ color: 'white' }}>History Logs:</strong> Tap any colored circle in the "Past" section of your Roadmap to see exactly how much XP you earned that day and which words leveled up.</li>
          </ul>
        </Section>

        <Section title="JAN LINA" emoji="🤖">
          <p style={{ color: '#eee' }}>jan Lina is your AI tutor. Cool older sister energy.</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px', marginTop: '12px' }}>
            <li><strong style={{ color: 'white' }}>Knowledge Checks:</strong> Based on your settings, jan Lina may pop up on your dashboard randomly to test your mastery of a specific word.</li>
            <li><strong style={{ color: 'var(--gold)' }}>CALIBRATING:</strong> When you see this, she is silently proposing a mastery update. It applies when you end the session.</li>
            <li><strong style={{ color: 'white' }}>MASTERY COURT:</strong> Settings → Mastery Court. Go here to petition her to change a word's status manually. She decides.</li>
          </ul>
        </Section>

        <Section title="YOUR WORDS" emoji="📖">
          <p style={{ marginBottom: '16px' }}>Every word has a score from 0 to 1000. <span style={{ color: 'white', fontWeight: 800 }}>Score = status.</span></p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Production vs. Recognition:</strong> jan Lina tracks dual mastery. You might be able to *recognize* a word perfectly, but struggle to *produce* it in a sentence. She tracks both.</li>
            <li><strong style={{ color: 'white' }}>🎯 Prove It Drill:</strong> Find it on the Dashboard. Grab a random word, go offline, write a sentence, and submit it. jan Lina will review it in your next chat.</li>
            <li><strong style={{ color: 'white' }}>Confusion Pairs:</strong> If you mix up two words repeatedly, she flags them internally for targeted separation practice.</li>
          </ul>
        </Section>
        
        <Section title="GAMES & DRILLS" emoji="🎮">
          <p style={{ marginBottom: '16px' }}>Find these on your Dashboard to train your brain outside of chat.</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 900, color: 'white', fontSize: '0.8rem', marginBottom: '4px' }}>🎮 TRAINING HUB</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Four sandboxed minigames: Logic Gate (True/False), Essentializer (Translation), Philosophy Sorter, and Word Scramble.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 900, color: 'white', fontSize: '0.8rem', marginBottom: '4px' }}>🃏 FLASHCARD MODE</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Quick review. The algorithm prioritizes words under 800 points. "Got It" adds 2 points. "Wrong" subtracts 5 points.</div>
            </div>
          </div>
        </Section>

        <Section title="DASHBOARD TOOLS" emoji="🛠️">
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '4px' }}>OPERATIONAL INTELLIGENCE</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>The segmented bar at the top right of your dashboard. Click it to view words that are bleeding points, words ready to level up, and curriculum status.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '4px' }}>SENTENCE BUILDER</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Tap words on the Vocab tab to select them. A builder pops up at the bottom. You can save the sentence, practice it with Lina, or ask her to explain the grammar.</div>
            </div>
          </div>
        </Section>

      </div>
    </motion.div>
  );
}
