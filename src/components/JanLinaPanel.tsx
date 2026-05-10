import React from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import { useStoicStore } from '../store/stoicStore';

interface Props {
  onClose: () => void;
  onAskLina: (prompt: string) => void;
  onOpenLogbook: () => void;
  onOpenSessionHistory: () => void;
  onOpenMasteryCourt: () => void;
}

const JanLinaPanel: React.FC<Props> = ({ 
  onClose, 
  onAskLina, 
  onOpenLogbook, 
  onOpenSessionHistory, 
  onOpenMasteryCourt 
}) => {
  const { knowledgeCheckFrequency, setKnowledgeCheckFrequency } = useMasteryStore();

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
          <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', margin: 0 }}>JAN LINA HUB</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#666', fontStyle: 'italic' }}>expert tutor • cool older sister • system admin</p>
        </div>
        <button className="close-glyph" onClick={onClose} style={{ zIndex: 9999 }}>✕</button>
      </header>

      <div className="side-panel-content" style={{ padding: '20px' }}>
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '12px' }}>ABOUT</h3>
          <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.6' }}>
            jan Lina is more than just an AI. She is your dedicated Toki Pona guide, blending the energy of a cool older sister with the precision of a neural linguist. She tracks your progress across thousands of data points to ensure your path to mastery is pona.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '12px' }}>DIRECT LINK</h3>
          <button 
            onClick={() => {
              onAskLina("[SYSTEM: Start a general conversation. Greet the student.]");
              onClose();
            }} 
            className="btn-gold" 
            style={{ width: '100%', padding: '16px', fontSize: '0.9rem' }}
          >
            START CASUAL CHAT
          </button>
          <button 
            onClick={() => {
              useStoicStore.getState().setManualDismissal(null);
              onClose(); 
            }} 
            className="btn-review" 
            style={{ width: '100%', marginTop: '10px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}
          >
            ✦ RECALL DAILY STOIC
          </button>
          <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>
            Use this to resume your daily philosophy ritual or enter Deep Study mode.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '12px' }}>RECORDS</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            <button 
              onClick={() => { onOpenLogbook(); onClose(); }} 
              className="btn-review" 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', margin: 0 }}
            >
              📖 TEACHER'S LOGBOOK
            </button>
            <button 
              onClick={() => { onOpenSessionHistory(); onClose(); }} 
              className="btn-review" 
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', margin: 0 }}
            >
              🕒 SESSION HISTORY
            </button>
          </div>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '12px' }}>AUTHORITY</h3>
          <button 
            onClick={() => { onOpenMasteryCourt(); onClose(); }} 
            className="btn-review" 
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', margin: 0 }}
          >
            ⚖️ MASTERY COURT
          </button>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.2em', marginBottom: '12px' }}>CONFIG</h3>
          <div className="field-group">
            <label>KNOWLEDGE CHECK FREQUENCY</label>
            <select 
              value={knowledgeCheckFrequency} 
              onChange={(e) => setKnowledgeCheckFrequency(e.target.value as any)}
              style={{ width: '100%', padding: '12px', background: '#111', color: 'white', border: '1px solid var(--border)', borderRadius: '4px' }}
            >
              <option value="session">Once Per Session</option>
              <option value="daily">Once Per Day</option>
              <option value="never">Never (Disabled)</option>
            </select>
            <p style={{ fontSize: '0.65rem', color: '#666', marginTop: '8px', lineHeight: 1.4 }}>
              Determines how often jan Lina will interrupt your dashboard to test your mastery of specific words.
            </p>
          </div>
        </section>
      </div>

      <style>{`
        .field-group label {
          display: block;
          font-size: 0.6rem;
          color: #666;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
      `}</style>
    </motion.div>
  );
};

export default JanLinaPanel;
