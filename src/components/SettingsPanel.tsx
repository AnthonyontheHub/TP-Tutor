import { useState, useEffect } from 'react';
import { useMasteryStore } from '../store/masteryStore';
import { useAuthStore } from '../store/authStore';

export default function SettingsPanel({ isOpen, onClose, isSandboxMode, setIsSandboxMode }: {
  isOpen: boolean;
  onClose: () => void;
  isSandboxMode: boolean;
  setIsSandboxMode: (val: boolean) => void;
}) {
  const { 
    resetAsNewUser, masterAllVocab, randomizeVocab, isMainProfile,
    knowledgeCheckFrequency, setKnowledgeCheckFrequency, clearAllSavedPhrases,
    vocabulary, bulkSyncFromMap
  } = useMasteryStore();
  const { logout } = useAuthStore();

  const [localSandbox, setLocalSandbox] = useState(isSandboxMode);
  const [localApiKey, setLocalApiKey] = useState(localStorage.getItem('TP_GEMINI_KEY') || '');
  const [localFreq, setLocalFreq] = useState(knowledgeCheckFrequency);

  useEffect(() => {
    if (isOpen) {
      setLocalSandbox(isSandboxMode);
      setLocalApiKey(localStorage.getItem('TP_GEMINI_KEY') || '');
      setLocalFreq(knowledgeCheckFrequency);
    }
  }, [isOpen, isSandboxMode, knowledgeCheckFrequency]);

  if (!isOpen) return null;

  const isMainUser = isMainProfile;

  const handleSave = () => {
    setIsSandboxMode(localSandbox);
    localStorage.setItem('TP_GEMINI_KEY', localApiKey);
    setKnowledgeCheckFrequency(localFreq);
    onClose();
  };

  const handleReset = async () => {
    if(confirm("Wipe all local and cloud data? This will also sign you out.")) {
      await resetAsNewUser();
      await logout();
    }
  };

  const handleRandomize = async () => {
    if(confirm("Randomize all vocabulary mastery? This will also sign you out.")) {
      randomizeVocab();
      await logout();
    }
  };

  const handleMasterAll = async () => {
    if(confirm("Master all vocabulary? This will also sign you out.")) {
      masterAllVocab();
      await logout();
    }
  };

  const handleClearPhrases = async () => {
    if(confirm("Clear all saved phrases? This will also sign you out.")) {
      clearAllSavedPhrases();
      await logout();
    }
  };

  const handleBulkSync = () => {
    const data = [
      { "word": "ala", "status": "confident", "notes": "not, no, nothing, zero. Study Session 14: 100% accuracy in placement. Study Session 16: confirmed confident. Midterm: flawless." },
      { "word": "alasa", "status": "practicing", "notes": "to hunt, gather, search; to try to... Learning Session 13: used in 'jan alasa' (hunter) context. Learning Session 14: spelling error (asala) but semantic placement is automatic." },
      { "word": "ale", "status": "confident", "notes": "all, every, abundance; (number) 100. Learning Session 13: used in additive number system." },
      { "word": "anu", "status": "mastered", "notes": "or — Introduced Learning Session 11; confirmed ✅ Mastered Study Session 15. Flawless use in choice-questions, object-marking, and anu seme structures across multiple sessions." },
      { "word": "awen", "status": "practicing", "notes": "to stay, keep, protect; safe; to continue to... Learning Session 14: initial application successful. Midterm (Study Session 22): failed recall." },
      { "word": "e", "status": "mastered", "notes": "(marks a direct object). Confirmed perfect repetition in lists. Study Session #14: mastery candidate confirmed. Midterm: perfect application." },
      { "word": "en", "status": "mastered", "notes": "and (joins subjects). Study Session 19: confirmed ✅ Mastered. Error-free across subject/object distinction drills. Caution: 'en trap' in free production (immersion). Monitor in future immersion." },
      { "word": "ike", "status": "introduced", "notes": "bad, evil, negative, complex, wrong" },
      { "word": "ilo", "status": "introduced", "notes": "tool, device, machine" },
      { "word": "insa", "status": "confident", "notes": "inside, center, interior, stomach; central. Used correctly in multiple locative structures. Study Session 13 confirmed 🟡. Study Session 15 confirmed." },
      { "word": "jan", "status": "confident", "notes": "person, human, people, somebody. Immersion Session 4: automatic usage as noun and modifier." },
      { "word": "jelo", "status": "practicing", "notes": "yellow" },
      { "word": "jo", "status": "practicing", "notes": "to have, possess, own, contain, hold. Introduced Study Session 14. Immersion Session 4: used correctly for possession/state across varied contexts. Immersion Session 10: used correctly." },
      { "word": "kala", "status": "introduced", "notes": "fish, sea creature. Introduced as a content word in Learning Session 12 exercises." },
      { "word": "ken", "status": "practicing", "notes": "to be able to, can, may; to be possible. Gap-fill introduced Study Session 19. Learning Session 14 & Study Session 21: correct structural placement. Midterm: misspelled (kan), e insertion error, but X ala X logic correct." },
      { "word": "kepeken", "status": "confident", "notes": "using, with, by means of; to use" },
      { "word": "kili", "status": "introduced", "notes": "fruit, vegetable" },
      { "word": "kon", "status": "introduced", "notes": "air, gas, spirit, soul, meaning, unseen agent. Gap-fill introduced Study Session 19. Used correctly in translation." },
      { "word": "kute", "status": "introduced", "notes": "ear; to hear, listen, obey. Midterm (Study Session 22): complete recall failure. Needs active drilling." },
      { "word": "la", "status": "mastered", "notes": "(separates context from the main sentence)" },
      { "word": "lape", "status": "introduced", "notes": "sleep, rest; to sleep, to rest; sleeping. Study Session 21: recalled after hesitation. Midterm (Study Session 22): failed recall. Needs active drilling." },
      { "word": "lawa", "status": "practicing", "notes": "head, mind; to lead, control, rule, plan" },
      { "word": "len", "status": "introduced", "notes": "cloth, clothing, fabric, layer" },
      { "word": "lete", "status": "confident", "notes": "cold, cool, raw. Introduced Learning Session 12. Fluent use in physical and mechanical contexts." },
      { "word": "li", "status": "mastered", "notes": "(separates subject from predicate)" },
      { "word": "lili", "status": "confident", "notes": "little, small, short, few, young" },
      { "word": "lon", "status": "confident", "notes": "in, at, on; to be present, to exist; true, real" },
      { "word": "luka", "status": "confident", "notes": "hand, arm; five. Learning Session 13: confirmed 🟡 Confident as number 5 in various sums." },
      { "word": "lukin", "status": "introduced", "notes": "eye; to see, look, watch; to try to... Used confidently in Immersion Session 2. Not yet formally drilled." },
      { "word": "mama", "status": "introduced", "notes": "parent, ancestor, creator, caretaker" },
      { "word": "meli", "status": "practicing", "notes": "woman, female; feminine. Study Session #14: introduced and used as modifier (jan meli). Minor spelling errors (mile)." },
      { "word": "mi", "status": "confident", "notes": "I, me, we, us" },
      { "word": "mije", "status": "practicing", "notes": "man, male; masculine. Study Session #14: introduced and used as modifier (jan mije). Minor spelling errors." },
      { "word": "moku", "status": "confident", "notes": "food, drink; to eat, drink, consume; edible. ⚠️ Mastery Candidate: Flawless usage as both noun and verb across all contexts. Awaiting mutual ✅ agreement." },
      { "word": "monsi", "status": "practicing", "notes": "back, rear, behind. Introduced Learning Session 9. Study Session 15: initially confused with poka; corrected. Study Session #14: confirmed 🟡 Confident in spatial phrases. Requires more drilling." },
      { "word": "musi", "status": "practicing", "notes": "game, art, fun; entertaining, amusing; to play" },
      { "word": "mute", "status": "confident", "notes": "many, a lot; (number) 3+ or 20 in complex system" },
      { "word": "ni", "status": "introduced", "notes": "this, that, these, those" },
      { "word": "noka", "status": "confident", "notes": "leg, foot, bottom part. Used as anatomy word and spatial landmark. Immersion Session 1: correctly applied in lon noka supa. Immersion Session 11: natural, unprompted use for 'down/bottom.'" },
      { "word": "oko", "status": "practicing", "notes": "eye" },
      { "word": "ona", "status": "practicing", "notes": "he, she, it, they" },
      { "word": "pan", "status": "introduced", "notes": "grain, bread, pasta, rice, starchy staple" },
      { "word": "pi", "status": "practicing", "notes": "of (regroups modifiers). Introduced Learning Session 10. Study Session 19: Anthony demonstrated 'teacher-level' awareness by correcting the tutor. MIDTERM (Study Session 22): Failed to identify the core 2-word minimum rule in the error-check. Reverted from ✅ to 🔵 Practicing." },
      { "word": "pilin", "status": "confident", "notes": "feeling, emotion, heart; to feel, think" },
      { "word": "pimeja", "status": "introduced", "notes": "black, dark. Encountered in Study Session 8. Used confidently in Immersion Session 3. Not formally introduced via drill." },
      { "word": "pipi", "status": "introduced", "notes": "bug, insect, spider. Introduced in Immersion Session 2. Midterm (Study Session 22): complete recall failure. Needs active drilling." },
      { "word": "poka", "status": "confident", "notes": "side, hip, nearby area. Introduced Learning Session 9. Immersion Session 1: successfully applied in poka supa suli. Study Session #14: confirmed 🟡 in spatial phrases." },
      { "word": "poki", "status": "introduced", "notes": "container, box, bag, bowl. Study Session 20: gap-fill, adopted immediately. Midterm (Study Session 22): complete recall failure. Needs active drilling." },
      { "word": "pona", "status": "confident", "notes": "good, simplicity, positive; to fix, to make good. Midterm: failed recall as verb for 'fixing.' Monitor verb usage." },
      { "word": "seme", "status": "practicing", "notes": "what? which? (interrogative pronoun). Midterm (Study Session 22): reverted to English word order (seme jan instead of jan seme). Regressed from 🟡 to 🔵." },
      { "word": "sewi", "status": "confident", "notes": "top, sky, area above; high, divine, sacred. Introduced Learning Session 9. Study Session 15: confirmed strong. Immersion Session 11: natural, unprompted use for 'up.'" },
      { "word": "sijelo", "status": "practicing", "notes": "body, physical state, torso" },
      { "word": "sina", "status": "confident", "notes": "you" },
      { "word": "sinpin", "status": "confident", "notes": "front, face, wall. Study Session 15: successful production. Study Session #14: confirmed 🟡 in spatial phrases." },
      { "word": "sona", "status": "mastered", "notes": "knowledge, information; to know; to know how to... Study Session 19: confirmed ✅ Mastered. Consistent performance in both transitive ('sona e') and preverb ('sona [verb]') contexts across multiple sessions." },
      { "word": "soweli", "status": "confident", "notes": "land mammal, animal. ⚠️ Mastery Candidate: Consistent flawless use across Immersion Sessions 1–4 and multiple study sessions. Midterm: used correctly. Awaiting mutual ✅ agreement." },
      { "word": "suli", "status": "confident", "notes": "big, large, tall, long, important, adult; size" },
      { "word": "supa", "status": "confident", "notes": "horizontal surface (table, bed, floor). Immersion Session 3: used correctly across multiple contexts. Confirmed 🟡." },
      { "word": "tan", "status": "confident", "notes": "from, because of; cause, reason, origin. Study Session 19: high accuracy." },
      { "word": "tawa", "status": "practicing", "notes": "to, for, toward; to go, to move; moving. Mastered Study Session 9; confirmed Study Sessions 13 & 19. MIDTERM REGRESSION (Study Session 22): failed error-check for e insertion with destination preposition. Reverted from ✅ to 🔵 Practicing." },
      { "word": "telo", "status": "confident", "notes": "water, liquid; wet. ⚠️ Mastery Candidate: Consistently correct. Awaiting mutual ✅ agreement." },
      { "word": "tenpo", "status": "confident", "notes": "time, duration, occasion, situation" },
      { "word": "toki", "status": "confident", "notes": "language, speech; to talk, speak, say; hello!" },
      { "word": "tomo", "status": "confident", "notes": "indoor space, building, house, room" },
      { "word": "tu", "status": "mastered", "notes": "two; to divide. Learning Session 13: confirmed ✅ Mastered. Flawless use in counting, ranking, and as 'half/divide.'" },
      { "word": "uta", "status": "confident", "notes": "mouth, lips, jaw. Study Session #4: one typo (uto) corrected; used correctly in final drills." },
      { "word": "wan", "status": "mastered", "notes": "one; unique, united. Learning Session 13: confirmed ✅ Mastered. Flawless use in counting, ranking, and math." },
      { "word": "waso", "status": "confident", "notes": "bird, flying creature. Study Sessions 20 & 21: error-free usage. Immersion Session 11: flawless. Spelling issue fully resolved." },
      { "word": "wawa", "status": "confident", "notes": "strong, powerful, energetic, intense. Study Session 20 & Immersion Session 11: natural, correct usage as modifier." },
      { "word": "wile", "status": "mastered", "notes": "to want, need, wish, should. Confirmed ✅ Mastered Study Sessions 9, 12, & 19. Midterm: flawless." },
      { "word": "nanpa", "status": "confident", "notes": "number; ordinal marker. Learning Session 13: immediate grasp of ranking logic vs. quantity. Confirmed 🟡." }
    ] as any[];
    bulkSyncFromMap(data);
    alert('Sync Complete! Check your Vocab Grid.');
  };

  return (
    <div style={{ padding: '40px', background: 'var(--surface-opaque)', height: '100%', overflowY: 'auto' }}>
      <h1 style={{ color: 'var(--gold)', fontWeight: 900, marginBottom: '32px', letterSpacing: '0.1em' }}>SETTINGS</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>TEACHER'S LOGBOOK</h2>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={handleBulkSync} 
            className="btn-settings" 
            style={{ background: '#ef4444', color: 'white', border: 'none' }}
          >
            SYNC FROM MASTERY MAP
          </button>
        </div>
        <div className="glass-panel" style={{ padding: '20px', maxHeight: '300px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
          {vocabulary.filter(v => v.sessionNotes).length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>jan Lina has not recorded any private notes in your logbook yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {vocabulary.filter(v => v.sessionNotes).map(v => (
                <div key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '4px' }}>{v.word}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.4' }}>{v.sessionNotes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px' }}>CORE CONFIGURATION</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          <div className="settings-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SANDBOX MODE</span>
            <button 
              onClick={() => isMainUser && setLocalSandbox(!localSandbox)} 
              disabled={!isMainUser}
              className="btn-settings" 
              style={{ 
                margin: 0,
                width: 'auto',
                padding: '8px 16px',
                color: localSandbox ? 'var(--gold)' : 'white',
                opacity: isMainUser ? 1 : 0.5,
                cursor: isMainUser ? 'pointer' : 'not-allowed'
              }}
            >
              {localSandbox ? 'ACTIVE' : 'OFFLINE'}
            </button>
          </div>

          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5 }}>GEMINI API KEY</span>
            <input 
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="settings-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="settings-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5 }}>KNOWLEDGE CHECK FREQUENCY</span>
            <select 
              value={localFreq}
              onChange={(e) => setLocalFreq(e.target.value as any)}
              className="settings-input"
              style={{ width: '100%', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="daily">Daily</option>
              <option value="session">Every Session</option>
              <option value="never">Never</option>
            </select>
          </div>

          <button onClick={handleSave} className="btn-review" style={{ width: '100%', marginTop: '10px' }}>
            SAVE SETTINGS
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.5, marginBottom: '20px', color: '#ef4444' }}>DANGER ZONE</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <button onClick={handleRandomize} className="btn-settings">RANDOMIZE NEURAL SYNC</button>
          <button onClick={handleMasterAll} className="btn-settings">FORCE TOTAL MASTERY</button>
          <button onClick={handleClearPhrases} className="btn-settings">CLEAR ALL SAVED PHRASES</button>
          <button 
            onClick={handleReset} 
            className="btn-settings" 
            style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            PURGE NEURAL CACHE
          </button>
        </div>
      </section>

      <button onClick={onClose} className="btn-review" style={{ width: '100%', marginTop: '20px' }}>
        CLOSE SETTINGS
      </button>
    </div>
  );
}
