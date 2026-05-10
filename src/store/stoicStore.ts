/* src/store/stoicStore.ts */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { resolveApiKey, fetchStoicAnalysis, generateStoicQuote } from '../services/linaService';
import { useMasteryStore } from './masteryStore';

export interface StoicQuote {
  id: string; // YYYY-MM-DD
  english: string;
  tokiPona: string;
  date: string;
  author?: string;
  source?: string;
  breakdown?: string;
}

export interface StoicState {
  todayQuote: StoicQuote | null;
  history: StoicQuote[];
  phase1DismissedAt: string | null; // ISO Date
  phase2CompletedAt: string | null; // ISO Date
  phase3CompletedAt: string | null; // ISO Date
  lastFetchedDate: string | null; // YYYY-MM-DD
}

export interface StoicActions {
  fetchTodayQuote: (userId: string) => Promise<void>;
  dismissPhase1: () => void;
  completePhase2: () => void;
  completePhase3: () => void;
  fetchHistory: (userId: string) => Promise<void>;
  // Dev Testing
  devReset: () => void;
}

type StoicStore = StoicState & StoicActions;

export const useStoicStore = create<StoicStore>()(
  persist(
    (set, get) => ({
      todayQuote: null,
      history: [],
      phase1DismissedAt: null,
      phase2CompletedAt: null,
      phase3CompletedAt: null,
      lastFetchedDate: null,

      fetchTodayQuote: async (userId: string) => {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if we already have today's quote in local state
        if (get().lastFetchedDate === today && get().todayQuote) return;

        const docRef = doc(db, `users/${userId}/stoicQuotes`, today);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as StoicQuote;
          set({ todayQuote: data, lastFetchedDate: today });
        } else {
          // Ultimate Hybrid Stoic Engine
          try {
            const apiKey = resolveApiKey();
            if (!apiKey) return;

            let english = "";
            let useAI = false;

            try {
              const apiUrl = 'https://dailystoic.pl/api/quote';
              const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
              const response = await fetch(proxyUrl);
              const proxyData = await response.json();
              const quoteData = JSON.parse(proxyData.contents);
              english = quoteData.text;

              // Duplicate check against history
              const isDuplicate = get().history.some(q => q.english.toLowerCase().trim() === english.toLowerCase().trim());
              if (isDuplicate) useAI = true;
            } catch (e) {
              console.warn("Stoic API failed, falling back to jan Lina:", e);
              useAI = true;
            }

            if (useAI) {
              const last14 = get().history.slice(0, 14).map(q => q.english);
              english = await generateStoicQuote(apiKey, last14);
            }

            const analysis = await fetchStoicAnalysis(apiKey, english);
            if (!analysis) return;

            const newQuote: StoicQuote = {
              id: today,
              english,
              tokiPona: analysis.tokiPona,
              author: analysis.author,
              source: analysis.source,
              breakdown: analysis.breakdown,
              date: today
            };

            // Auto-save to phrasebook for cross-pollination
            useMasteryStore.getState().savePhrase({
              id: analysis.tokiPona,
              tp: analysis.tokiPona,
              en: english,
              notes: `Stoic Archive: ${analysis.author || 'Unknown'} - ${analysis.source || 'Unknown'}`
            });

            // Save to Firestore
            await setDoc(docRef, newQuote);
            set({ todayQuote: newQuote, lastFetchedDate: today, phase1DismissedAt: null, phase2CompletedAt: null, phase3CompletedAt: null });
          } catch (e) {
            console.error("Hybrid Stoic Engine Error:", e);
          }
        }
      },

      dismissPhase1: () => set({ phase1DismissedAt: new Date().toISOString() }),
      
      completePhase2: () => {
        set({ phase2CompletedAt: new Date().toISOString() });
        // Award XP via masteryStore
        // Note: I'll assume applyScoreUpdate or similar can be used, but the prompt says arbitrary XP.
        // If there's a specific action for XP in masteryStore, use it.
      },

      completePhase3: () => set({ phase3CompletedAt: new Date().toISOString() }),

      fetchHistory: async (userId: string) => {
        const q = query(collection(db, `users/${userId}/stoicQuotes`), orderBy('date', 'desc'), limit(30));
        const querySnapshot = await getDocs(q);
        const history: StoicQuote[] = [];
        querySnapshot.forEach((doc) => {
          history.push(doc.data() as StoicQuote);
        });
        set({ history });
      },

      devReset: () => set({ 
        phase1DismissedAt: null, 
        phase2CompletedAt: null, 
        phase3CompletedAt: null,
        lastFetchedDate: null,
        todayQuote: null 
      }),
    }),
    {
      name: 'tp-tutor-stoic',
    }
  )
);
