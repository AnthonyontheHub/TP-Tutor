/* src/components/LiveTile.tsx */
import { motion } from 'framer-motion';
import type { MasteryStatus } from '../types/mastery';

interface Props {
  children: React.ReactNode;
  size: '1x1' | '2x1' | '2x2';
  status: MasteryStatus;
  variant?: 'word' | 'grammar';
  onClick?: () => void;
}

const COLORS: Record<MasteryStatus, string> = {
  not_started: 'rgba(55, 65, 81, 0.4)',
  introduced:  'rgba(29, 78, 216, 0.4)',
  practicing:  'rgba(146, 64, 14, 0.4)',
  confident:   'rgba(22, 163, 74, 0.4)',
  mastered:    'rgba(34, 197, 94, 0.4)',
};

const BORDERS: Record<MasteryStatus, string> = {
  not_started: 'rgba(55, 65, 81, 0.6)',
  introduced:  'rgba(29, 78, 216, 0.8)',
  practicing:  'rgba(146, 64, 14, 0.8)',
  confident:   'rgba(22, 163, 74, 0.8)',
  mastered:    'rgba(34, 197, 94, 0.8)',
};

export default function LiveTile({ children, size, status, variant, onClick }: Props) {
  const width = size === '1x1' ? 160 : 336; // (160 * 2) + 16 gutter
  const height = size === '2x2' ? 336 : 160;

  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width,
        height,
        background: COLORS[status],
        border: `1px solid ${variant === 'grammar' ? 'var(--gold)' : BORDERS[status]}`,
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: variant === 'grammar' ? 'inset 0 0 15px rgba(255, 191, 0, 0.1)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        backdropFilter: 'blur(10px)',
      }}
    >
      {variant === 'grammar' && (
        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.8rem', opacity: 0.5 }}>📖</div>
      )}
      {children}
    </motion.div>
  );
}
