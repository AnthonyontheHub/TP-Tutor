/* src/components/NodeDossier.tsx */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMasteryStore } from '../store/masteryStore';
import type { CurriculumNode } from '../types/mastery';
import WordDetailDrawer from './WordDetailDrawer';
import VocabGrid from './VocabGrid';

interface Props {
  node: CurriculumNode;
  onBack: () => void;
  onAskLina: (p: string) => void;
  isSandboxMode: boolean;
}

export default function NodeDossier({ node, onBack, onAskLina, isSandboxMode }: Props) {
  const { vocabulary } = useMasteryStore();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const calculateMastery = () => {
    const allIds = [...node.requiredVocabIds, ...node.requiredGrammarIds];
    if (allIds.length === 0) {
       return node.status === 'mastered' ? 100 : 0;
    }
    const scores = allIds.map(id => {
      const word = vocabulary.find(v => v.id === id || v.word === id);
      return word ? word.baseScore : 0;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length / 10);
  };

  const mastery = calculateMastery();

  const handlePracticeLina = () => {
    const contextStr = node.richContent?.map(c => c.content).join(' ') || '';
    const vocabStr = node.requiredVocabIds.length > 0 
      ? ` The relevant vocabulary is: ${node.requiredVocabIds.join(', ')}.` 
      : '';

    onAskLina(`toki jan Lina! I want to practice the concept: "${node.title}". 
      Here is the curriculum context: ${contextStr}${vocabStr}
      Please provide a brief review and then give me some interactive exercises or questions to test my mastery.`);
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ 
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 5, 5, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
        padding: '30px',
        overflowY: 'auto'
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: '32px', flexShrink: 0 }}>
          <button 
            onClick={onBack}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--gold)', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              padding: 0,
              letterSpacing: '0.1em'
            }}
          >
            ← RETURN TO PATHWAY
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '16px' }}>
            <h1 style={{ color: 'white', fontWeight: 900, fontSize: '2rem', margin: 0, letterSpacing: '-0.02em' }}>
              {node.title}
            </h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: '#666', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>NODE ID</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, fontFamily: 'monospace' }}>{node.id.toUpperCase()}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ flex: 1, height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mastery}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ height: '100%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} 
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 900, minWidth: '80px', textAlign: 'right' }}>{mastery}% MASTERY</span>
          </div>
        </header>

        <main style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <section>
            <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>CURRICULUM CONTENT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {node.richContent?.map((block, i) => (
                <div key={i}>
                  {block.type === 'text' && (
                    <p style={{ color: '#ddd', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>{block.content}</p>
                  )}
                  {block.type === 'structural' && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.02)', 
                      borderLeft: '2px solid var(--gold)', 
                      padding: '20px',
                      borderRadius: '0 8px 8px 0',
                      marginTop: '8px'
                    }}>
                      <div style={{ color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '10px', letterSpacing: '0.1em' }}>SYNTACTIC STRUCTURE</div>
                      <p style={{ color: 'white', fontSize: '1rem', fontWeight: 500, margin: 0, fontFamily: 'serif', fontStyle: 'italic' }}>{block.content}</p>
                    </div>
                  )}
                  {block.type === 'callout' && (
                    <div style={{ 
                      background: 'rgba(251, 191, 36, 0.05)', 
                      border: '1px dashed var(--gold)', 
                      padding: '16px',
                      borderRadius: '12px',
                      marginTop: '8px'
                    }}>
                      <p style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 600, margin: 0, textAlign: 'center' }}>✦ {block.content} ✦</p>
                    </div>
                  )}
                </div>
              ))}
              {!node.richContent && <p style={{ color: '#666', fontStyle: 'italic' }}>Detailed dossier content pending decryption...</p>}
            </div>
          </section>

          {node.visualFramework && (
            <section>
              <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>VISUAL ANALYTICS</h3>
              <img 
                src={node.visualFramework} 
                alt="Visual Framework" 
                style={{ 
                  width: '100%', 
                  borderRadius: '12px', 
                  border: '1px solid #333', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  display: 'block'
                }} 
              />
            </section>
          )}

          {(node.requiredVocabIds.length > 0 || node.requiredGrammarIds.length > 0) && (
            <section>
              <h3 style={{ color: '#888', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>NODE SANDBOX</h3>
              <div style={{ 
                background: 'rgba(255,255,255,0.01)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <VocabGrid 
                  onAskLina={onAskLina} 
                  isSandboxMode={isSandboxMode} 
                  filterIds={[...node.requiredVocabIds, ...node.requiredGrammarIds]} 
                  hideToolbar={true}
                />
              </div>
            </section>
          )}

          <section style={{ marginTop: '20px', paddingBottom: '60px' }}>
            <button 
              onClick={handlePracticeLina}
              style={{ 
                width: '100%', 
                background: 'var(--gold)',
                color: 'black',
                fontWeight: 900,
                fontSize: '1.1rem',
                padding: '24px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(251, 191, 36, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ fontSize: '1.4rem' }}>✦</span>
              PRACTICE WITH JAN LINA
            </button>
            <p style={{ color: '#555', fontSize: '0.65rem', textAlign: 'center', marginTop: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
              INITIATE NEURAL LINK FOR INTERACTIVE ASSESSMENT
            </p>
          </section>
        </main>
      </div>

      <WordDetailDrawer
        isOpen={!!drawerId}
        word={drawerId ? vocabulary.find(v => v.id === drawerId) ?? null : null}
        onClose={() => setDrawerId(null)}
        onAskLina={onAskLina}
        isSandboxMode={isSandboxMode}
      />
    </motion.div>
  );
}

