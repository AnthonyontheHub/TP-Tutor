/* src/components/DailyStoicHistory.tsx */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoicStore } from '../store/stoicStore';
import { useAuthStore } from '../store/authStore';
import { BookOpen, MessageSquare, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAskLina: (text: string) => void;
}

export default function DailyStoicHistory({ isOpen, onClose, onAskLina }: Props) {
  const { user } = useAuthStore();
  const { history, fetchHistory } = useStoicStore();

  useEffect(() => {
    if (isOpen && user) {
      fetchHistory(user.uid);
    }
  }, [isOpen, user, fetchHistory]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-backdrop" style={{ zIndex: 6000 }} onClick={onClose}>
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            maxWidth: '500px',
            background: 'var(--surface)',
            borderLeft: '1px solid #222',
            padding: '40px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BookOpen size={24} color="var(--gold)" />
              <h2 style={{ color: 'white', fontWeight: 900, margin: 0, letterSpacing: '0.1em' }}>STOIC ARCHIVE</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {history.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '40px' }}>
                No entries in the archive yet...
              </p>
            ) : (
              history.map((quote) => (
                <div 
                  key={quote.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '20px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid #222',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.1em' }}>
                      {quote.date}
                    </span>
                    <button 
                      onClick={() => onAskLina(`Please explain the grammar and vocabulary of this quote: "${quote.tokiPona}" (Translation: ${quote.english})`)}
                      style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid #333', 
                        borderRadius: '6px', 
                        color: 'white', 
                        fontSize: '0.65rem', 
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      <MessageSquare size={12} />
                      ASK LINA
                    </button>
                  </div>

                  <p style={{ color: 'white', fontSize: '1rem', fontWeight: 500, margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                    "{quote.tokiPona}"
                  </p>
                  
                  <p style={{ color: '#888', fontSize: '0.85rem', margin: 0, borderTop: '1px solid #222', paddingTop: '10px' }}>
                    {quote.english}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
