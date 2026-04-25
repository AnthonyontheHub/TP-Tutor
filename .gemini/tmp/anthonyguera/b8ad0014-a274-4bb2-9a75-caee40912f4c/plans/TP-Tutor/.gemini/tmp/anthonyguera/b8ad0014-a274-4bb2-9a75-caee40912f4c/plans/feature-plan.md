# Implementation Plan

## Objective
Implement four feature changes: enable text selection in chat, refine the AI's system prompt to act as a conversational partner, add a highlight-to-translate feature in the chat session, and ensure proper sign-out behavior.

## Scope & Impact
- **`App.css`**: Enable user text selection on chat elements.
- **`src/services/linaService.ts`**: Update the `buildSystemPrompt` template to prioritize `userContext`, conversational tone, and answering user queries.
- **`src/components/ChatSession.tsx`**: Add selection listeners (`onMouseUp`, `onTouchEnd`) to the chat container. Display a floating "Translate" button when text is selected. When clicked, call `fetchQuickTranslation` and show the result in the bubble.
- **`src/components/UserProfileDrawer.tsx`**: Update the "Sign Out" button to explicitly call `useAuthStore.getState().setUser(null)` alongside `logout()` to immediately clear the user state (especially important for guest users where Firebase `signOut` might behave differently).
- **`src/App.tsx`**: Verify and ensure that `if (!user) return <LoginPage />;` is present so the login page renders immediately.

## Proposed Solution
1. **App.css**:
   ```css
   /* Enable text selection for chat messages and drawers */
   .chat-drawer, .chat-drawer *, .profile-drawer, .profile-drawer * {
     user-select: text !important;
     -webkit-user-select: text !important;
   }
   ```

2. **linaService.ts (`buildSystemPrompt`)**:
   Revise the prompt to:
   "You are jan Lina, a Toki Pona teacher and conversational partner.
   The student's name is ${studentName}.
   
   USER LORE/CONTEXT:
   ${contextStr}
   CRITICAL: Use the user's lore frequently to make responses highly personal and relevant. Answer their questions naturally using your AI knowledge while maintaining your persona.
   
   ..."

3. **ChatSession.tsx**:
   - Add state: `translateBubble: { text: string; top: number; left: number; result?: string; loading?: boolean } | null`
   - Add `handleSelection` to calculate coordinates from `window.getSelection()`.
   - Add `handleTranslateClick` to call `fetchQuickTranslation`.
   - Render the bubble with a high `zIndex` inside the chat drawer.

4. **UserProfileDrawer.tsx**:
   Update `onClick` for the sign out button to:
   ```typescript
   onClick={() => {
     useMasteryStore.getState().clearLocalData();
     useAuthStore.getState().setUser(null);
     logout();
     onClose();
   }}
   ```

## Verification & Testing
- Build the app and verify no TypeScript errors.
- Test text selection in the chat drawer.
- Test the Translate bubble by selecting text and clicking "Translate".
- Click "Sign Out" and confirm the app redirects immediately to `LoginPage`.