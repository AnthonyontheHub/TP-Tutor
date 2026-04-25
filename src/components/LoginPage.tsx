import React from 'react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { signIn, loading, error } = useAuthStore();

  return (
    <div className="login-page" style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)',
      color: 'var(--text)',
      textAlign: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          letterSpacing: '0.1em', 
          marginBottom: '10px',
          textTransform: 'uppercase'
        }}>
          TP Tutor
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          marginBottom: '40px',
          fontSize: '1rem',
          lineHeight: '1.5'
        }}>
          Master toki pona with AI-powered immersion and progress tracking.
        </p>

        {error && (
          <div style={{
            background: '#3f0000',
            color: '#ffaaaa',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            border: '1px solid #7f0000'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => signIn()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.1s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <p style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Your progress will be synced to the cloud automatically.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
