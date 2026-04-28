import React from 'react';
import type { Phrase, PhraseCategory } from '../data/phraseData';

interface PhraseCardProps {
  phraseCategory: PhraseCategory;
  phrase: Phrase;
  onClose: () => void;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phraseCategory, phrase, onClose }) => {
  // Dark theme styling for modal
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 32, 44, 0.85)', // Darker, semi-transparent overlay
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: '#1f2937', // Dark background for content
    color: '#e2e8f0', // Light text for contrast
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    position: 'relative',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)', // Darker shadow
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '15px', // Slightly adjusted position
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem', // Larger close icon
    cursor: 'pointer',
    color: '#94a3b8', // Muted color for close button
    lineHeight: '1',
  };

  const buttonContainerStyle: React.CSSProperties = {
    marginTop: '24px', // Increased margin
    display: 'flex',
    justifyContent: 'space-around',
    gap: '12px', // Spacing between buttons
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #4b5563', // Darker border
    backgroundColor: '#374151', // Dark button background
    color: '#e2e8f0', // Light button text
    cursor: 'pointer',
    fontSize: '0.9rem',
    flex: 1, // Distribute space
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h3 style={{ color: '#a0aec0', marginBottom: '10px', fontSize: '1.25rem' }}>{phraseCategory.title}</h3> {/* Muted header color */}
        {/* contextParagraph removed as per user request */}
        <h4 style={{ color: '#cbd5e1', marginBottom: '10px', fontSize: '1.1rem' }}>{phrase.english}</h4> {/* Slightly less bright color for English */}
        <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}><strong>Toki Pona:</strong> {phrase.tokiPona}</p>
        <p style={{ fontSize: '0.9rem', marginBottom: '16px' }}><strong>Literal Meaning:</strong> {phrase.literal}</p>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle}>Audio</button>
          <button style={buttonStyle}>Practice with jan Lina</button>
        </div>
      </div>
    </div>
  );
};

export default PhraseCard;