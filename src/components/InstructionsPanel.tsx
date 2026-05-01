/* src/components/InstructionsPanel.tsx */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { STATUS_META, SMALL_RANKS, type MasteryStatus } from '../types/mastery';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Section = ({ title, emoji, children, defaultOpen = false }: { title: string, emoji: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="guide-section">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="guide-section__trigger"
      >
        <div className="guide-section__title-row">
          <span className="text-[1.2rem]">{emoji}</span>
          <span className="guide-section__title">{title}</span>
        </div>
        <span className={`text-[var(--gold)] text-[1rem]`}>{isOpen ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="guide-section__content">
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
      className="side-panel overflow-y-auto bg-[rgba(5,5,5,0.98)]"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <header className="side-panel-header flex justify-between sticky top-0 z-10 bg-[rgba(5,5,5,0.95)] backdrop-blur-[10px] p-5">
        <div>
          <h2 className="text-[1rem] font-black tracking-[0.15em] text-[var(--gold)] m-0">FIELD GUIDE</h2>
          <p className="mt-1 mb-0 mx-0 text-[0.7rem] text-[#666] italic">pona. here's everything you need to know.</p>
        </div>
        <button type="button" onClick={onClose} className="btn-close-glowing">✕</button>
      </header>

      <div className="side-panel-content hide-scrollbar pb-[100px]">
        
        <Section title="WELCOME" emoji="🌱" defaultOpen={true}>
          <p className="text-[#eee] mb-5">
            This is <span className="text-[var(--gold)] font-extrabold">TP-Tutor</span> — your personal Toki Pona immersion system. 
            Toki Pona is a constructed language with only ~137 words. 
            Sounds simple. It's not. But jan Lina's got you.
          </p>
          <div className="guide-grid">
            {[
              { n: '1', icon: '🧬', text: 'Set up your profile & lore in Settings so jan Lina knows your world.' },
              { n: '2', icon: '🎛️', text: 'Pick a Review Vibe on the dashboard — Chill, Deep, or Intense.' },
              { n: '3', icon: '💬', text: 'Open jan Lina and start talking. That\'s it. She takes it from there.' }
            ].map(item => (
              <div key={item.n} className="guide-card">
                <div className="guide-card__number">{item.n}</div>
                <div className="guide-card__text"><span className="guide-card__icon">{item.icon}</span>{item.text}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="THE MAP" emoji="🗺️">
          <p className="mb-5">Your <span className="text-[var(--gold)]">ROADMAP</span> tab is one continuous path — past, present, and future all on the same road.</p>
          
          <div className="bg-[rgba(0,0,0,0.2)] p-5 rounded-[8px] mb-6">
            <div className="flex flex-col items-center gap-0">
              <div className="flex items-center gap-3 w-full">
                <div className="w-3 h-3 rounded-full bg-[#444] border-2 border-[#666]" />
                <div className="flex-1 h-[2px] bg-[var(--gold)] opacity-50" />
                <div className="text-[0.7rem] text-[#888]">PAST: Session nodes</div>
              </div>
              <div className="h-5 w-[2px] bg-[var(--gold)] self-start ml-[5px]" />
              <div className="flex items-center gap-3 w-full">
                <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]" />
                <div className="flex-1 h-[2px] bg-[var(--gold)]" />
                <div className="text-[0.7rem] text-white font-black">PRESENT: You are here</div>
              </div>
              <div className="h-5 w-[2px] border-l-2 border-dashed border-[var(--gold)] opacity-30 self-start ml-[5px]" />
              <div className="flex items-center gap-3 w-full">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-[#444]" />
                <div className="flex-1 h-[2px] border-t-2 border-dashed border-[var(--gold)] opacity-20" />
                <div className="text-[0.7rem] text-[#555]">FUTURE: Locked content</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { t: 'VOCAB', d: 'Your word grid. Sort, filter, explore.' },
              { t: 'ROADMAP', d: 'The unified path. Past + future.' },
              { t: 'ARCHIVE', d: 'Saved phrases, expressions, songs.' },
              { t: 'JOURNEY', d: 'Your full session history in one place.' }
            ].map(tab => (
              <div key={tab.t} className="bg-[rgba(255,255,255,0.02)] p-3 rounded-[4px] border border-[rgba(255,255,255,0.05)]">
                <div className="text-[0.65rem] font-black text-[var(--gold)] mb-1">{tab.t}</div>
                <div className="text-[0.7rem] text-[#888] leading-[1.3]">{tab.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="JAN LINA" emoji="🤖">
          <p className="text-[#eee]">jan Lina is your AI tutor. <span className="text-[var(--gold)]">Cool older sister energy</span>. She knows Toki Pona. She knows your life (if you set up your lore). She will call you out.</p>
          
          <div className="grid grid-cols-3 gap-2.5 my-5">
            {[
              { i: '💬', t: 'CHAT', s: 'General convo' },
              { i: '📚', t: 'LESSON', s: 'Structured' },
              { i: '🌅', t: 'REVIEW', s: 'Daily quick' },
              { i: '🔤', t: 'VOCAB', s: 'Deep dive' },
              { i: '⚖️', t: 'COURT', s: 'Petition' },
              { i: '📝', t: 'BUILDER', s: 'Practice' }
            ].map(item => (
              <div key={item.t} className="text-center bg-[rgba(255,255,255,0.02)] py-2.5 px-[5px] rounded-[8px]">
                <div className="text-[1.2rem] mb-1">{item.i}</div>
                <div className="text-[0.6rem] font-black text-white">{item.t}</div>
                <div className="text-[0.5rem] opacity-50">{item.s}</div>
              </div>
            ))}
          </div>

          <p className="text-[0.8rem] mb-3">
            <strong className="text-[var(--gold)]">CALIBRATING:</strong> When you see this, jan Lina is silently proposing a mastery update. It applies when you end the session.
          </p>
          <p className="text-[0.8rem] mb-6">
            <strong className="text-[var(--gold)]">SESSION END:</strong> Say goodbye naturally — "that's all", "thanks". She'll wrap up, write session notes, and commit your progress.
          </p>

          <div className="border border-[var(--gold)] p-4 rounded-[8px] bg-[rgba(255,191,0,0.05)]">
            <div className="flex gap-2.5 items-center mb-2">
              <span>⚖️</span>
              <span className="font-black text-[0.75rem] text-[var(--gold)] tracking-[0.1em]">MASTERY COURT</span>
            </div>
            <p className="text-[0.75rem] m-0 opacity-80">Think a word was upgraded by mistake? Go to Settings → Mastery Court. Make your case. She decides. She can say no.</p>
          </div>
        </Section>

        <Section title="YOUR WORDS" emoji="📖">
          <p className="mb-4">The <span className="text-[var(--gold)] font-extrabold">Neural Resonance System</span> tracks your brain's connection to each word across three distinct nodes: <span className="text-white">Noun</span>, <span className="text-white">Verb</span>, and <span className="text-white">Modifier</span>.</p>
          
          <div className="bg-[rgba(255,255,255,0.02)] p-4 rounded-[8px] border border-[#222] mb-6">
             <div className="text-[0.65rem] font-black text-[var(--gold)] mb-2.5">TRI-NODE MATRIX</div>
             <p className="text-[0.75rem] m-0">Total Mastery (0-1000) is the sum of these three nodes. To master a word, you must use it in all three roles.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { s: 'not_started' as MasteryStatus, r: '0–200' },
              { s: 'introduced' as MasteryStatus, r: '201–500' },
              { s: 'practicing' as MasteryStatus, r: '501–750' },
              { s: 'confident' as MasteryStatus, r: '751–949' },
              { s: 'mastered' as MasteryStatus, r: '950–1000' }
            ].map(item => (
              <div key={item.s} className="guide-stat-row">
                <span className="text-[0.8rem]">{STATUS_META[item.s].emoji}</span>
                <div className="text-[0.6rem] font-black text-white">{STATUS_META[item.s].label}</div>
                <div className="text-[0.5rem] opacity-40 ml-auto">{item.r}</div>
              </div>
            ))}
          </div>

          <div className="guide-grid mb-6">
            <div className="flex flex-col gap-1 py-2.5 px-3 bg-[rgba(34,197,94,0.05)] rounded-[4px] border-l-[3px] border-[#22c55e]">
              <span className="text-[#22c55e] font-black text-[0.65rem]">SYNC RATE (XP BONUSES)</span>
              <ul className="m-0 pl-[15px] text-[0.7rem] text-[#ccc]">
                <li><span className="text-white">Base Sync (+10):</span> Standard correct usage.</li>
                <li><span className="text-white">Structural Sync (+25):</span> Correct use of 'e', 'la', or 'pi'.</li>
                <li><span className="text-white">Lore Sync (2.0x):</span> Referencing your personal background.</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-2.5 mb-6">
            <div className="flex-1 p-2.5 rounded-[4px] bg-[rgba(239,68,68,0.05)] border border-[#7f1d1d]">
              <div className="text-[0.6rem] font-black text-[#f87171] mb-[2px]">🔒 NODE LOCK</div>
              <div className="text-[0.65rem] opacity-70">A node stops gaining points if it's 100+ ahead of your lowest node for that word. Balance is mandatory.</div>
            </div>
            <div className="flex-1 p-2.5 rounded-[4px] bg-[rgba(34,197,94,0.05)] border border-[#166534]">
              <div className="text-[0.6rem] font-black text-[#4ade80] mb-[2px]">🛡️ HARDENING</div>
              <div className="text-[0.65rem] opacity-70">Nodes at 950+ pts are immune to neural decay.</div>
            </div>
          </div>

          <div className="p-3 rounded-[8px] bg-[rgba(59,130,246,0.1)] border border-[#3b82f6]">
            <div className="text-[0.6rem] font-black text-[#60a5fa] mb-1">⚡ GRID CHARGE</div>
            <p className="text-[0.65rem] m-0 opacity-80">Completing a Roadmap node "charges" your grid, freezing all decay for 24 hours.</p>
          </div>
        </Section>

        <Section title="YOUR PROGRESS" emoji="🏆">
          <p className="mb-5">Your <span className="text-[var(--gold)] font-extrabold">XP</span> represents your total resonance with the language. It scales up to 100,000 for the highest honor.</p>
          
          <div className="text-center mb-3 text-[0.7rem] text-[#666] font-extrabold">
            CURRENT XP: <span className="text-white">{summary.xp.toLocaleString()}</span>
          </div>

          <div className="bg-[#111] rounded-[8px] border border-[#222] overflow-hidden mb-8">
            <table className="w-full border-collapse text-[0.75rem]">
              <tbody>
                {[...SMALL_RANKS].reverse().map(r => {
                  const isCurrent = summary.rankTitle === r.title;
                  return (
                    <tr key={r.title} 
                      className="border-b border-[#222]"
                      style={{ 
                        background: isCurrent ? 'var(--gold)' : 'transparent',
                        color: isCurrent ? 'black' : '#888'
                      }}
                    >
                      <td className="py-2 px-4 font-black" style={{ opacity: isCurrent ? 1 : 0.4 }}>{r.xpThreshold.toLocaleString()}</td>
                      <td className="py-2 px-4 font-black">
                        {r.title.toUpperCase()}
                        {isCurrent && <span className="ml-3 text-[0.6rem] opacity-70">← YOU</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <h4 className="text-[0.65rem] text-[var(--gold)] tracking-[0.1em] mb-3">🔥 STREAK BONUSES</h4>
            <div className="flex gap-2 flex-wrap">
              {[
                { d: '3', m: '1.1' },
                { d: '7', m: '1.25' },
                { d: '14', m: '1.5' },
                { d: '30', m: '1.75' }
              ].map(s => (
                <div key={s.d} className="py-1.5 px-3 bg-[rgba(255,255,255,0.03)] rounded-[4px] border border-[rgba(255,255,255,0.1)]">
                  <div className="text-[0.5rem] opacity-50 font-black">{s.d} DAYS</div>
                  <div className="text-[0.8rem] font-black text-[var(--gold)]">{s.m}x</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="THE ARCHIVE" emoji="📦">
          <div className="guide-grid">
            {[
              { i: '💾', t: 'MY SAVES', d: 'Phrases you\'ve saved from the Sentence Builder or jan Lina sessions. Tap to practice.' },
              { i: '🗣️', t: 'COMMON PHRASES', d: 'Everyday Toki Pona expressions. Good starting point for real conversation.' },
              { i: '🎵', t: 'DISCOGRAPHY', d: 'Toki Pona songs and lyrics. Use INTENSE vibe to deep-dive with jan Lina.' }
            ].map(item => (
              <div key={item.t} className="guide-card">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[1.2rem]">{item.i}</span>
                  <span className="text-[0.75rem] font-black text-white tracking-[0.1em]">{item.t}</span>
                </div>
                <div className="text-[0.8rem] text-[#888] leading-[1.4]">{item.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="TROUBLESHOOTING" emoji="⚙️">
          <div className="guide-grid gap-5">
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
                <div className="text-[0.8rem] font-black text-white mb-1">Q: {item.q}</div>
                <div className="text-[0.8rem] text-[#888] leading-[1.4]">A: {item.a}</div>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </motion.div>
  );
}
