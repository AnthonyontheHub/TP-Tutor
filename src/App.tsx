import { useState, useEffect } from 'react'; // Added useEffect here
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';
import { useMasteryStore } from './store/masteryStore'; // Added this import

type View = 'dashboard' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  // This is the "sync" trigger that runs as soon as the app loads
  useEffect(() => {
    useMasteryStore.getState().syncFromCloud();
  }, []);

  if (view === 'chat') {
    return <ChatSession onEndSession={() => setView('dashboard')} />;
  }

  return <Dashboard onStartSession={() => setView('chat')} />;
}
