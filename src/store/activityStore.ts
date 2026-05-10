import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, limit } from 'firebase/firestore';

export type ActivityType = 'XP_SHIFT' | 'STOIC_RITUAL' | 'PHRASE_SAVED' | 'BOSS_FIGHT' | 'RANK_AWARDED';

export interface ActivityEntry {
  timestamp: number;
  type: ActivityType;
  content: string;
  metadata?: any;
}

interface ActivityState {
  history: ActivityEntry[];
  isSyncing: boolean;
  lastExportDate: string | null;
}

interface ActivityActions {
  logEvent: (type: ActivityType, content: string, metadata?: any) => Promise<void>;
  syncFromCloud: (userId: string) => Promise<void>;
  clearHistory: () => void;
  generateMarkdownExport: (snapshot: { rank: string, level: number, xp: number, distribution: Record<string, number>, phraseCount: number }) => string;
  setLastExportDate: (date: string) => void;
}

type ActivityStore = ActivityState & ActivityActions;

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      history: [],
      isSyncing: false,
      lastExportDate: null,

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

      setLastExportDate: (date: string) => set({ lastExportDate: date }),

      generateMarkdownExport: (snapshot) => {
        const { history } = get();
        if (history.length === 0) return "";

        let md = "# TP-Tutor Master Ledger\n\n";

        md += "## 📊 CURRENT SNAPSHOT\n";
        md += `- **Current Rank:** ${snapshot.rank}\n`;
        md += `- **Neural Level:** ${snapshot.level}\n`;
        md += `- **Total Resonance (XP):** ${snapshot.xp}\n`;
        md += `- **Mastery Distribution:**\n`;
        Object.entries(snapshot.distribution).forEach(([status, count]) => {
          if (count > 0) md += `    - ${status.replace('_', ' ').toUpperCase()}: ${count}\n`;
        });
        md += `- **Phrases Transcribed:** ${snapshot.phraseCount}\n\n`;
        md += "---\n\n";
        
        // Sort history by timestamp ascending for chronological reading
        const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);

        const grouped: Record<string, Record<string, ActivityEntry[]>> = {};
        let totalXP = 0;
        let phrasesSaved = 0;
        let stoicRituals = 0;

        sorted.forEach(entry => {
          const d = new Date(entry.timestamp);
          const monthYear = d.toLocaleString('default', { month: 'long', year: 'numeric' });
          const dateStr = d.toLocaleDateString();

          if (!grouped[monthYear]) grouped[monthYear] = {};
          if (!grouped[monthYear][dateStr]) grouped[monthYear][dateStr] = [];
          grouped[monthYear][dateStr].push(entry);

          if (entry.type === 'XP_SHIFT') {
            const match = entry.content.match(/[+-](\d+)/);
            if (match) totalXP += parseInt(match[1]);
          } else if (entry.type === 'PHRASE_SAVED') {
            phrasesSaved++;
          } else if (entry.type === 'STOIC_RITUAL') {
            stoicRituals++;
          }
        });

        Object.keys(grouped).forEach(monthYear => {
          md += `## ${monthYear}\n\n`;
          Object.keys(grouped[monthYear]).forEach(dateStr => {
            md += `### ${dateStr}\n\n`;
            grouped[monthYear][dateStr].forEach(entry => {
              const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              // Escape wiki-links for strict markdown compatibility if requested: [[word]] -> \[\[word\]\]
              const cleanContent = entry.content.replace(/\[\[/g, '\\[\\[').replace(/\]\]/g, '\\]\\]');
              
              if (entry.type === 'STOIC_RITUAL') {
                md += `> **[${time}] STOIC RITUAL**\n> ${cleanContent}\n\n`;
              } else if (entry.type === 'RANK_AWARDED') {
                md += `- 🏆 **[${time}] ${cleanContent}**\n`;
              } else {
                md += `- **[${time}]** ${cleanContent}\n`;
              }
            });
            md += "\n";
          });
        });

        md += "---\n\n";
        md += "## 📈 SESSION TOTALS\n";
        md += `- **Total XP Resonance:** +${totalXP}\n`;
        md += `- **Phrases Transcribed:** ${phrasesSaved}\n`;
        md += `- **Philosophical Inquiries:** ${stoicRituals}\n`;
        md += `\n*Generated by jan Lina on ${new Date().toLocaleString()}*\n`;

        return md;
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
