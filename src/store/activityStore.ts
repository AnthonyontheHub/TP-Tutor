import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, limit } from 'firebase/firestore';

export type ActivityType = 'XP_SHIFT' | 'STOIC_RITUAL' | 'PHRASE_SAVED' | 'BOSS_FIGHT';

export interface ActivityEntry {
  timestamp: number;
  type: ActivityType;
  content: string;
  metadata?: any;
}

interface ActivityState {
  history: ActivityEntry[];
  isSyncing: boolean;
}

interface ActivityActions {
  logEvent: (type: ActivityType, content: string, metadata?: any) => Promise<void>;
  syncFromCloud: (userId: string) => Promise<void>;
  clearHistory: () => void;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      history: [],
      isSyncing: false,

      logEvent: async (type: ActivityType, content: string, metadata?: any) => {
        const entry: ActivityEntry = {
          timestamp: Date.now(),
          type,
          content,
          metadata
        };

        // Update local state
        set(state => ({
          history: [entry, ...state.history].slice(0, 1000) // Keep last 1000 locally
        }));

        // Sync to Firestore
        try {
          const authStored = localStorage.getItem('tp-auth-storage');
          if (authStored) {
            const authData = JSON.parse(authStored);
            const userId = authData.state?.user?.uid;
            if (userId) {
              await addDoc(collection(db, `users/${userId}/activity_ledger`), {
                ...entry,
                serverTimestamp: serverTimestamp()
              });
            }
          }
        } catch (e) {
          console.error("Failed to sync activity to cloud:", e);
        }
      },

      syncFromCloud: async (userId: string) => {
        set({ isSyncing: true });
        try {
          const q = query(
            collection(db, `users/${userId}/activity_ledger`),
            orderBy('timestamp', 'desc'),
            limit(500)
          );
          const snap = await getDocs(q);
          const history: ActivityEntry[] = [];
          snap.forEach(doc => {
            const data = doc.data();
            history.push({
              timestamp: data.timestamp,
              type: data.type,
              content: data.content,
              metadata: data.metadata
            });
          });
          set({ history });
        } catch (e) {
          console.error("Activity sync error:", e);
        } finally {
          set({ isSyncing: false });
        }
      },

      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'tp-tutor-activity',
    }
  )
);
