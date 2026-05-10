import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Cloud } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMasteryStore } from '../store/masteryStore';
import { exportToMarkdown, importFromMarkdown } from '../utils/markdownSync';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsPanel({ isOpen, onClose }: AnalyticsPanelProps) {
  const { sessionLog, vocabulary, profile, updateProfile, hydrateStoreFromExternalData } = useMasteryStore();

  const handleTogglePings = async () => {
    if (!profile.ritualPingsEnabled) {
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateProfile({ ritualPingsEnabled: true });
      } else {
        alert('Notification permission denied.');
      }
    } else {
      updateProfile({ ritualPingsEnabled: false });
    }
  };

  // 1. Heatmap Data (Last 30 days)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Create a set of dates (YYYY-MM-DD) that have session logs
    const activeDates = new Set(
      sessionLog.map(log => {
        const d = new Date(log.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    );

    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      data.push({
        date: dateStr,
        isActive: activeDates.has(dateStr)
      });
    }
    return data;
  }, [sessionLog]);

  // 2. XP Chart Data (Cumulative)
  const xpChartData = useMemo(() => {
    // Sort logs by date ascending
    const sortedLogs = [...sessionLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativeXP = 0;
    return sortedLogs.map(log => {
      cumulativeXP += (log.xpEarned || 0);
      const d = new Date(log.date);
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        xp: cumulativeXP
      };
    });
  }, [sessionLog]);

  // 3. Bleeding List (Tactical Targets)
  const bleedingList = useMemo(() => {
    return vocabulary
      .filter(v => v.status !== 'not_started' && v.baseScore < 1000)
      .sort((a, b) => {
        // Sort by baseScore ascending
        return (a.baseScore || 0) - (b.baseScore || 0);
      })
      .slice(0, 10); // Top 10 lowest scored words
  }, [vocabulary]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-[#111] border-l border-white/10 shadow-2xl h-full flex flex-col font-sans overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="text-[#D4AF37]">📊</span> Analytics
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            
            {/* Discipline Heatmap */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Discipline</h3>
                <span className="text-xs text-white/40 uppercase tracking-widest">Last 30 Days</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="grid grid-cols-6 gap-2">
                  {heatmapData.map((day, idx) => (
                    <div
                      key={idx}
                      title={day.date}
                      className={`h-8 rounded-md transition-colors ${
                        day.isActive ? 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-black/40 border border-white/5'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Progression Chart */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Progression</h3>
                <span className="text-xs text-[#D4AF37] uppercase tracking-widest">Cumulative XP</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64">
                {xpChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={xpChartData}>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        itemStyle={{ color: '#D4AF37' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="xp" 
                        stroke="#D4AF37" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#D4AF37' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/30 text-sm uppercase tracking-widest">
                    No session data yet
                  </div>
                )}
              </div>
            </section>

            {/* Tactical Targets (Bleeding List) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Tactical Targets</h3>
                <span className="text-xs text-rose-500 uppercase tracking-widest">Needs Review</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                {bleedingList.length > 0 ? (
                  bleedingList.map(word => (
                    <div key={word.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-rose-500/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-rose-500/70 group-hover:text-rose-500 transition-colors" />
                        <span className="text-white font-bold text-lg">{word.word}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40 uppercase tracking-widest">{word.status.replace('_', ' ')}</span>
                        <span className="text-rose-400 font-mono text-sm">{Math.round(word.baseScore || 0)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-white/30 text-sm uppercase tracking-widest">
                    All words mastered!
                  </div>
                )}
              </div>
            </section>

            {/* Settings */}
            <section className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">Settings</h3>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">Enable Ritual Pings</div>
                    <div className="text-white/40 text-xs mt-1">Get morning reminders when Readiness is low</div>
                  </div>
                  <button
                    onClick={handleTogglePings}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.ritualPingsEnabled ? 'bg-[#D4AF37]' : 'bg-white/10'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.ritualPingsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* System Data & Backup */}
            <section className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest">System Data</h3>
                <span className="text-xs text-white/40 uppercase tracking-widest">Backup & Restore</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-bold text-sm">Markdown Sync</div>
                    <div className="text-white/40 text-xs mt-1">Export your neural state to a portable file</div>
                  </div>
                  <button 
                    onClick={() => exportToMarkdown(useMasteryStore.getState())}
                    className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded transition-colors"
                  >
                    EXPORT
                  </button>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <div className="text-white font-bold text-sm">Restore Progress</div>
                    <div className="text-white/40 text-xs mt-1">Hydrate state from a backup file</div>
                  </div>
                  <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded transition-colors">
                    IMPORT
                    <input 
                      type="file" 
                      accept=".md" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            try {
                              const content = event.target?.result as string;
                              const data = importFromMarkdown(content);
                              hydrateStoreFromExternalData(data);
                              alert('Success: Neural pathways restored.');
                            } catch (err: any) {
                              alert(`Failed: ${err.message}`);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
