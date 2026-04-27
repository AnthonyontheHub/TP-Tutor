/* src/components/PhraseGrid.tsx */
import React, { useState, useMemo, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import type { MasteryStatus, CommonPhrase } from '../types/mastery'; // Keep CommonPhrase for Everyday Archive
import { phraseData } from '../data/phraseData'; // Import only the data value
import type { Phrase, PhraseCategory } from '../data/phraseData'; // Import types separately
import PhraseCard from './PhraseCard'; // Import the new PhraseCard component

interface Props {
  // onAskLina: (prompt: string) => void; // Removed as click behavior changes
  activeFilter: MasteryStatus | null;
  selectedWords: string[];
  focusPhraseId?: string | null;
  clearFocusPhrase?: () => void;
}

export default function PhraseGrid({ selectedWords, focusPhraseId, clearFocusPhrase }: Props) {
  const { studentName, vocabulary, savedPhrases, updatePhraseNote, deletePhrase, commonPhrases, reviewVibe } = useMasteryStore(); // Removed 'songs' as it's only for Discography
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  
  // State for PhraseCard modal
  const [selectedPhraseCategory, setSelectedPhraseCategory] = useState<PhraseCategory | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<Phrase | null>(null);
  const [isPhraseCardOpen, setIsPhraseCardOpen] = useState<boolean>(false);

  // Removed state for Discography tab navigation (selectedAlbumId, selectedTrackTitle)
  // as this logic is moved out of PhraseGrid.

  const clean = (w: string) => w.toLowerCase().replace(/[.!?,]/g, '');

  const safeSavedPhrases = savedPhrases || [];

  useEffect(() => {
    if (focusPhraseId) {
      setEditingId(focusPhraseId);
      const target = safeSavedPhrases.find(p => typeof p !== 'string' && p.id === focusPhraseId);
      setNoteInput(target && typeof target !== 'string' ? target.notes : '');
    }
  }, [focusPhraseId, safeSavedPhrases]);

  const normalizedSaved = (safeSavedPhrases || []).map(p => 
    typeof p === 'string' ? { id: p, tp: p, en: `${studentName || 'Anthony'} Saved Phrase *`, notes: '' } : p
  );

  const filteredSaves = normalizedSaved.filter(p => {
    if (selectedWords && selectedWords.length > 0) {
      const ws = (p.tp || '').split(' ').map(clean);
      if (!selectedWords.every(sw => ws.includes(clean(sw)))) return false;
    }
    return true;
  });

  // Group commonPhrases once at the top level, outside the return statement.
  const groupedCommonPhrases = useMemo(() => {
    const groups: Record<string, CommonPhrase[]> = {};
    (Array.
    isArray(commonPhrases) ? commonPhrases : []).forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [commonPhrases]);

  // This function is used for filtering phrases in both the 'My Saves' and 'Toki Pona Phrases' sections.
  const filterPhrasesBySelectedWords = (phrases: { tokiPona: string, english: string }[]) => {
    if (!selectedWords || selectedWords.length === 0) {
      return phrases; // Return all phrases if no words are selected
    }
    return phrases.filter(p => {
      // Split tokiPona by spaces and common punctuation, then clean each word
      const ws = (p.tokiPona || '').split(/[ \/]+/).map(clean);
      // Check if all selectedWords (cleaned) are present in the phrase's words (cleaned)
      return selectedWords.every(sw => ws.includes(clean(sw)));
    });
  };


  const handlePhraseClick = (category: PhraseCategory, phrase: Phrase) => {
    setSelectedPhraseCategory(category);
    setSelectedPhrase(phrase);
    setIsPhraseCardOpen(true);
  };

  const handleClosePhraseCard = () => {
    setIsPhraseCardOpen(false);
    setSelectedPhrase(null);
    setSelectedPhraseCategory(null);
  };

  const isChill = reviewVibe === 'chill' || reviewVibe === null;
  const isDeep = reviewVibe === 'deep'; 
  // Removed isIntense variable and logic as Discography is no longer managed here.

  return (
    <section className="phrase-grid">
      {/* View 1: My Saves (Chill) */}
      {isChill && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>MY SAVES</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {filteredSaves.length === 0 ? (
              <p style={{ color: '#555', gridColumn: '1/-1', textAlign: 'center', padding: '20px' }}>{selectedWords && selectedWords.length > 0 ? 'No saved phrases match your selection.' : 'No phrases saved yet.'}</p>
            ) : filteredSaves.map((p) => {
              // Saved phrases lack category context for PhraseCard, so click handler is omitted for them.
              return (
                <div key={p.id} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                  <div style={{ cursor: 'default' }}> 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {(p.tp || '').split(' ').map((w, idx) => {
                        const cleanW = clean(w);
                        const vocab = (vocabulary || []).find(v => v.word === cleanW);
                        const meaning = vocab?.meanings?.split(',')[0].trim() || '';
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.55rem', color: '#666', textTransform: 'uppercase', fontWeight: 700, marginBottom: '1px' }}>{meaning}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#60a5fa' }}>{w}</div>
                          </div>
                        );
                      })}
                      <span style={{ color: '#60a5fa', fontWeight: 'bold', marginLeft: '4px' }}>*</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>{p.en}</div>
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                    {p.notes && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '8px', padding: '6px', background: '#1e293b', borderRadius: '4px' }}>📝 {p.notes}</div>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingId(p.id); setNoteInput(p.notes); }} className="btn-toggle" style={{ padding: '4px 8px', fontSize: '0.65rem', width: 'auto' }}>
                        {p.notes ? 'EDIT NOTE' : '+ NOTE'}
                      </button>
                      <button onClick={() => { if(window.confirm('Delete this saved phrase?')) deletePhrase(p.id); }} className="btn-toggle" style={{ padding: '4px 8px', fontSize: '0.65rem', width: 'auto', background: '#7f1d1d' }}>
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View 2: Everyday Archive (Deep) - now includes Toki Pona Phrases */}
      {isDeep && (
        <div>
          <h2 className="section-title" style={{ color: 'var(--gold)', marginBottom: '20px', borderLeft: '4px solid var(--gold)', paddingLeft: '12px' }}>EVERYDAY ARCHIVE</h2>
          {/* Context paragraph for the Everyday Archive tab */}
          <p style={{ fontSize: '0.9rem', color: '#a0aec0', marginBottom: '20px', fontStyle: 'italic' }}>
            Explore common Toki Pona phrases used in daily life, organized into categories for easy learning.
          </p>
          {/* This div handles the layout for categories themselves, making them stack vertically */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}> 
            {Object.entries(groupedCommonPhrases).map(([cat, phrases]) => {
              const filtered = filterPhrasesBySelectedWords(phrases);
              if (filtered.length === 0 && selectedWords && selectedWords.length > 0) return null;
              return (
                <div key={cat}>
                  <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>{cat}</h3>
                  {/* This inner div handles the grid layout for phrases within a category */}
                  <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                    {(filtered || []).map((p, i) => (
                      <div key={i} className="glass-panel" style={{ padding: '16px', cursor: 'pointer' }} onClick={() => { /* handle click for common phrases if needed */ }}>
                        <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{p.tp}</div>
                        <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{p.en}</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* handle click for common phrases */ }}
                          className="btn-toggle"
                          style={{ marginTop: '12px', padding: '6px 10px', fontSize: '0.6rem', width: 'auto', background: 'rgba(255,255,255,0.05)' }}
                        >
                          PRACTICE THIS
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toki Pona Phrases section is now correctly nested within isDeep */}
          <div style={{ marginTop: '32px' }}> {/* Add margin to separate from previous section */}
            <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase', opacity: 0.8 }}>TOKI PONA PHRASES</h3>
            {/* Using context from the first category as a general intro for this section */}
            <p style={{ fontSize: '0.85rem', color: '#bbb', marginBottom: '16px' }}>{phraseData[0].contextParagraph}</p> 
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {phraseData.map((category) => {
                const filteredPhrases = filterPhrasesBySelectedWords(category.phrases);
                if (filteredPhrases.length === 0 && selectedWords && selectedWords.length > 0) return null;

                return (
                  <div key={category.title}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '8px' }}>{category.title}</h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {(filteredPhrases || []).map((phrase, i) => (
                        <div 
                          key={i} 
                          className="glass-panel" 
                          style={{ padding: '16px', cursor: 'pointer' }} 
                          onClick={() => handlePhraseClick(category, phrase)} // Click to open PhraseCard
                        >
                          <div style={{ fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{phrase.english}</div>
                          <div style={{ fontSize: '0.8rem', color: '#777', fontStyle: 'italic' }}>{phrase.tokiPona}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Render PhraseCard conditionally */}
      {isPhraseCardOpen && selectedPhraseCategory && selectedPhrase && (
        <PhraseCard
          phraseCategory={selectedPhraseCategory}
          phrase={selectedPhrase}
          onClose={handleClosePhraseCard}
        />
      )}

      {/* Note editing drawer remains the same */}
      {editingId && (
        <div className="drawer-backdrop" onClick={() => { setEditingId(null); clearFocusPhrase?.(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', border: '1px solid #444', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <h3 style={{ color: '#fff', marginBottom: '15px', marginTop: 0 }}>Phrase Note</h3>
            <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add context to this phrase..." style={{ width: '100%', height: '100px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', padding: '10px', marginBottom: '15px', resize: 'none', outline: 'none' }} autoFocus />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { updatePhraseNote(editingId, noteInput); setEditingId(null); clearFocusPhrase?.(); }} className="btn-review" style={{ margin: 0, flex: 2 }}>SAVE</button>
              <button onClick={() => { setEditingId(null); clearFocusPhrase?.(); }} className="btn-toggle" style={{ flex: 1 }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}