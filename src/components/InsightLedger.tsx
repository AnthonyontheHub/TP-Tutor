/* src/components/InsightLedger.tsx */
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useMasteryStore } from '../store/masteryStore';

interface Props {
  onClose: () => void;
}

const InsightLedger: React.FC<Props> = ({ onClose }) => {
  const { masteryHistory } = useMasteryStore();

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(20px)',
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white'
    }}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'rgba(10,10,10,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          padding: '30px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.2em', margin: 0 }}>INSIGHT LOG</h2>
          <button type="button" 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }} className="hide-scrollbar">
          {masteryHistory.length === 0 && (
            <div style={{ textAlign: 'center', color: '#444', marginTop: '40px', fontSize: '0.8rem' }}>
              NO INSIGHTS RECORDED YET
            </div>
          )}
          {masteryHistory.map((event, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#eee' }}>{event.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: event.change < 0 ? '#ef4444' : 'var(--gold)' }}>
                  {event.change > 0 ? `+${event.change}` : event.change}
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#444', fontWeight: 700 }}>
                {formatTime(event.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default InsightLedger;
