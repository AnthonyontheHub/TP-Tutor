import { useState } from 'react';
import Dashboard from './components/Dashboard';
import ChatSession from './components/ChatSession';

type View = 'dashboard' | 'chat';

export default function App() {
  const [view, setView] = useState<View>('dashboard');

  if (view === 'chat') {
    return <ChatSession onEndSession={() => setView('dashboard')} />;
  }

  return <Dashboard onStartSession={() => setView('chat')} />;
}
