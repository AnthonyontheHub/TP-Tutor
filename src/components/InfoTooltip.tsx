import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  text: string;
}

export default function InfoTooltip({ text }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<React.CSSProperties>({
    bottom: '120%',
    left: '50%',
    transform: 'translateX(-50%)'
  });

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const tooltipWidth = 220; // Matches our maxWidth
      const tooltipHeight = 80; // Safe estimate
      const padding = 15; // Screen edge padding
      
      let newStyles: React.CSSProperties = { ...styles };

      // Vertical Check: if too close to top, flip it to show BELOW the icon
      if (rect.top < tooltipHeight + padding) {
        newStyles.bottom = 'auto';
        newStyles.top = '120%';
      } else {
        newStyles.bottom = '120%';
        newStyles.top = 'auto';
      }

      // Horizontal Check: shift left or right if too close to screen edges
      if (rect.left < (tooltipWidth / 2) + padding) {
        newStyles.left = '0';
        newStyles.right = 'auto';
        newStyles.transform = 'translateX(0)';
      } else if (window.innerWidth - rect.right < (tooltipWidth / 2) + padding) {
        newStyles.left = 'auto';
        newStyles.right = '0';
        newStyles.transform = 'translateX(0)';
      } else {
        newStyles.left = '50%';
        newStyles.right = 'auto';
        newStyles.transform = 'translateX(-50%)';
      }
      
      setStyles(newStyles);
    }
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      className="info-tooltip-container" 
      style={{ display: 'inline-block', position: 'relative', marginLeft: '6px', verticalAlign: 'middle' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        border: '1px solid #888',
        color: '#888',
        fontSize: '0.6rem',
        fontWeight: 900,
        cursor: 'help',
        background: 'rgba(255,255,255,0.05)'
      }}>
        i
      </span>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: styles.bottom === 'auto' ? -5 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: styles.bottom === 'auto' ? -5 : 5 }}
            style={{
              position: 'absolute',
              width: 'max-content',
              maxWidth: '220px',
              background: '#111',
              border: '1px solid var(--gold)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              color: '#eee',
              lineHeight: '1.4',
              zIndex: 9999,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              textAlign: 'left',
              fontWeight: 'normal',
              textTransform: 'none',
              letterSpacing: 'normal',
              ...styles
            }}
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
