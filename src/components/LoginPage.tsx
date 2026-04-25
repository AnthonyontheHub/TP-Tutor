import React from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { signIn, skipSignIn, loading, error } = useAuthStore();

  return (
    <div className="login-page" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)',
      backgroundimage: 'radial-gradient(circle at center, rgba(255,191,0,0.05) 0%, transparent 70%)',
      color: 'var(--text)',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 900, 
          color: 'var(--gold)', 
          letterSpacing: '0.4em', 
          marginBottom: '16px',
          textTransform: 'uppercase'
        }}>
          System Initialization
        </div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 900, 
          letterSpacing: '0.1em', 
          marginBottom: '8px',
          textTransform: 'uppercase',
          background: 'linear-gradient(to bottom, #fff, var(--gold))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          TP TUTOR
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          marginBottom: '48px',
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          lineHeight: '1.6'
        }}>
          Neural immersion interface for toki pona mastery. Establish secure link to begin.
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ffaaaa',
            padding: '12px',
            borderRadius: '2px',
            marginBottom: '24px',
            fontSize: '0.75rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            Critical Error: {error}
          </div>
        )}

        <button
          onClick={() => signIn()}
          disabled={loading}
          className="btn-review"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="black"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="black"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="black"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="black"/>
          </svg>
          {loading ? 'ESTABLISHING LINK...' : 'AUTHORIZE WITH GOOGLE'}
        </button>

        <button
          onClick={() => skipSignIn()}
          disabled={loading}
          style={{
            background: 'transparent',
            color: 'var(--gold)',
            border: '1px solid rgba(255,191,0,0.3)',
            borderRadius: '2px',
            fontSize: '0.75rem',
            fontWeight: 900,
            cursor: 'pointer',
            padding: '12px 24px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            width: '100%'
          }}
        >
          Proceed in Guest Mode (Local Only)
        </button>

        <div style={{ marginTop: '48px', fontSize: '0.65rem', color: '#333', fontWeight: 900, letterSpacing: '0.2em' }}>
          SECURE TERMINAL V0.1.2-DEUS
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
