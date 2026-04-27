import React from 'react';
import type { Phrase, PhraseCategory } from '../data/phraseData'; // Assuming this path

interface PhraseCardProps {
  phraseCategory: PhraseCategory;
  phrase: Phrase;
  onClose: () => void;
}

const PhraseCard: React.FC<PhraseCardProps> = ({ phraseCategory, phrase, onClose }) => {
  // Basic styling for a modal-like appearance. In a real app, this would be styled via CSS modules or a UI library.
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
  };

  const buttonContainerStyle: React.CSSProperties = {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-around',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <h3>{phraseCategory.title}</h3>
        <p>{phraseCategory.contextParagraph}</p>
        <h4>{phrase.english}</h4>
        <p><strong>Toki Pona:</strong> {phrase.tokiPona}</p>
        <p><strong>Literal Meaning:</strong> {phrase.literal}</p>
        <div style={buttonContainerStyle}>
          <button style={buttonStyle}>Audio</button>
          <button style={buttonStyle}>Practice with jan Lina</button>
        </div>
      </div>
    </div>
  );
};

export default PhraseCard;