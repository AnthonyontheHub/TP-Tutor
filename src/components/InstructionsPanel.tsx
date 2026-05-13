import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
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
        <button className="close-glyph" onClick={onClose} style={{ zIndex: 9999 }}>✕</button>
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

        <Section title="JAN LINA" emoji="🤖">
          <p style={{ color: '#eee' }}>jan Lina is your AI tutor. Cool older sister energy. Her dedicated tools are centralized in the 🤖 icon in the header.</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px', marginTop: '12px' }}>
            <li><strong style={{ color: 'white' }}>Jan Lina Hub:</strong> Your home for Neural Logs, Mastery Court, and Second Brain exports.</li>
            <li><strong style={{ color: 'white' }}>Recall:</strong> Dismissed the Daily Stoic popup too early? Tap 🤖 → ✦ RECALL to bring it back.</li>
            <li><strong style={{ color: 'var(--gold)' }}>CALIBRATING:</strong> When you see this, she is silently proposing a mastery update based on your conversation performance.</li>
          </ul>
        </Section>

        <Section title="DAILY PHILOSOPHY" emoji="📜">
          <p style={{ marginBottom: '16px' }}>Engage with the <span style={{ color: 'var(--gold)', fontWeight: 800 }}>Daily Stoic Ritual</span> to ground your studies in ancient wisdom.</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Phase 1 (Morning):</strong> Immersion. Read the daily quote and let it sit in your mind.</li>
            <li><strong style={{ color: 'white' }}>Phase 2 (Challenge):</strong> Translation. Later in the day, test your production by translating the quote back to English.</li>
            <li><strong style={{ color: 'white' }}>Phase 3 (Evening):</strong> Reflection. End your day by writing a short reflection in Toki Pona.</li>
            <li><strong style={{ color: 'var(--gold)' }}>⛶ Grand Expansion:</strong> Tap the expand icon for Deep Study mode. View the quote in large Sitelen Pona, read the word-for-word "Literal Bridge," and understand the Philosopher's Intent.</li>
          </ul>
        </Section>

        <Section title="SECOND BRAIN" emoji="🧠">
          <p style={{ marginBottom: '16px' }}>TP-Tutor is designed to sync with your external knowledge base (Obsidian, Notion, etc.).</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Master Ledger:</strong> Every significant XP shift, saved phrase, and Stoic insight is logged. Export the (.md) file from the 🤖 Hub to preserve your history.</li>
            <li><strong style={{ color: 'white' }}>Wiki-Link Support:</strong> Ledger exports use [[brackets]] for automatic word linking in Second Brain apps.</li>
            <li><strong style={{ color: 'white' }}>Neural Logs:</strong> Check the 🤖 Hub to see your Streak Heatmap (52-week consistency) and Today's Resonance (+XP momentum).</li>
          </ul>
        </Section>

        <Section title="YOUR WORDS" emoji="📖">
          <p style={{ marginBottom: '16px' }}>Every word has a score from 0 to 1000. <span style={{ color: 'white', fontWeight: 800 }}>Score = status.</span></p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Interactivity:</strong> Words in Stoic quotes and Neural Logs are interactive. Tap any word to instantly add it to your Sentence Builder for inspection.</li>
            <li><strong style={{ color: 'white' }}>Production vs. Recognition:</strong> jan Lina tracks dual mastery. You might be able to *recognize* a word perfectly, but struggle to *produce* it in a sentence. She tracks both.</li>
            <li><strong style={{ color: 'white' }}>🎯 Prove It Drill:</strong> Find it on the Dashboard. Grab a random word, go offline, write a sentence, and submit it for jan Lina to review.</li>
          </ul>
        </Section>

        <Section title="THE MAP & FILTERS" emoji="🗺️">
          <p style={{ marginBottom: '20px' }}>Your ROADMAP tab is one continuous path.</p>
          <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: '#888', display: 'grid', gap: '10px' }}>
            <li><strong style={{ color: 'white' }}>Node Filters:</strong> Clicking a node on the Roadmap filters your Vocab tab to only show words required for that specific module.</li>
            <li><strong style={{ color: 'white' }}>History Logs:</strong> Tap any colored circle in the "Past" section of your Roadmap to see exactly how much XP you earned that day.</li>
          </ul>
        </Section>
        
        <Section title="GAMES & DRILLS" emoji="🎮">
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
              <div style={{ fontSize: '0.75rem', color: '#888' }}>The segmented bar at the top right. Click it to view words that are bleeding points, words ready to level up, and curriculum status.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 900, color: 'var(--gold)', fontSize: '0.8rem', marginBottom: '4px' }}>SENTENCE BUILDER</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>Tap words on the Vocab tab to select them. A builder pops up at the bottom. Save phrases, practice with Lina, or ask for grammar explanations.</div>
            </div>
          </div>
        </Section>

        <div style={{ padding: '40px 20px', textAlign: 'center', opacity: 0.3 }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--gold)' }}>VERSION 2.0 - NEURAL LEDGER</div>
          <div style={{ fontSize: '0.5rem', marginTop: '4px', color: 'white' }}>© 2026 jan Lina Neural Systems</div>
        </div>

      </div>
    </motion.div>
  );
}
