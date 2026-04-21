async function sendToLina(userText: string, hideFromUI = false) {
  // NEW: Add 'isSandboxMode' to your Props if it isn't there already
  if (isSandboxMode) {
    setMessages((prev) => [...prev, { 
      id: crypto.randomUUID(), 
      role: 'assistant', 
      displayContent: "toki! Sandbox Mode is currently ON. I'm taking a nap to save your API credits. Turn Sandbox OFF in settings to chat!" 
    }]);
    return;
  }
  
  if (isLoading || !apiKey) return;
  // ... rest of your existing function
}
