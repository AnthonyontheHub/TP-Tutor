import React from 'react';
import { motion } from 'framer-motion';
import { STATUS_META, type MasteryStatus } from '../types/mastery';

interface SummaryReportProps {
  summaryText: string;
  improvedItems: { word: string; status: MasteryStatus }[];
  isNodeReady: boolean;
  nextNodeTitle?: string;
  onClose: () => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({
  summaryText,
  improvedItems,
  isNodeReady,
  nextNodeTitle,
  onClose
}) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
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
          background: 'var(--surface-opaque)',
          border: '1px solid var(--gold)',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <header style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '8px' }}>LESSON SUMMARY</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>O PINI!</h2>
        </header>

        <section style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#ddd' }}>{summaryText}</p>
        </section>

        {improvedItems.length > 0 && (
          <section>
            <h3 style={{ fontSize: '0.7rem', color: '#666', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '12px' }}>CONCEPTS IMPROVED</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {improvedItems.map(item => (
                <div key={item.word} style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 800 }}>{item.word}</span>
                  <span>{STATUS_META[item.status].emoji}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isNodeReady && (
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ 
              background: 'linear-gradient(45deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.2))', 
              border: '1px solid #22c55e', 
              padding: '16px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#22c55e', fontWeight: 900, fontSize: '0.9rem', marginBottom: '4px' }}>✓ PATHWAY UNLOCKED</div>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
              You have demonstrated mastery of the core pillars. {nextNodeTitle ? `The way to "${nextNodeTitle}" is now open.` : 'The next node is now available.'}
            </p>
          </motion.div>
        )}

        <button 
          onClick={onClose}
          style={{
            marginTop: '10px',
            background: 'var(--gold)',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            padding: '14px',
            fontWeight: 900,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          CLOSE REPORT
        </button>
      </motion.div>
    </div>
  );
};

export default SummaryReport;
