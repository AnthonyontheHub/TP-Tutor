# Plan: jan Lina & Context Overhaul

## Objective
Refactor the TP-Tutor app to update the assistant's identity to "jan Lina", add personalized user context for better prompts, enhance the word detail drawer with contextual and dynamic examples, introduce cyclic mastery logic, add interlinear English glosses to the phrase grid and sentence builder, and add a new Instructions page.

## Key Files & Context
- `src/store/masteryStore.ts`: Will store the user's `bio` and the new `cycleWordStatus` logic.
- `src/components/UserProfileDrawer.tsx`: Will capture the `bio` via a text area.
- `src/services/linaService.ts`: Will incorporate the `bio` into generation prompts and adjust for the new naming.
- `src/components/WordDetailDrawer.tsx`: Overhauled to include English translations, common phrases, jan Lina's examples, and a "Quick Cycle" button.
- `src/components/VocabCard.tsx`: Will utilize the `cycleWordStatus` via a double-tap gesture.
- `src/components/PhraseGrid.tsx` & `src/components/MasteryGrid.tsx`: Will implement interlinear glossing (English text above each Toki Pona word).
- `src/components/Instructions.tsx`: A new component explaining app mechanics.
- All files referencing "AI", "Assistant", or "Lina" (UI text): Will be updated to "jan Lina".

## Implementation Steps

1. **Identity & Rebranding**
   - Perform a global search for "AI", "Assistant", and "Lina".
   - Replace user-facing instances with "jan Lina" (e.g., in `LoginPage.tsx`, `ChatSession.tsx`, `Dashboard.tsx`, `WordDetailDrawer.tsx`, `MasteryGrid.tsx`). Take care to preserve code-level names like `linaService`.

2. **Personalized Context**
   - **`masteryStore.ts`**: Update `MasteryState` to include `bio: string` and add `setBio: (bio: string) => void` to `MasteryActions`. Ensure `bio` is synced to/from Firestore in `syncToCloud`/`syncFromCloud`.
   - **`UserProfileDrawer.tsx`**: Add a `<textarea>` bound to `bio` and `setBio`, labeled "What should jan Lina know about you?".
   - **`linaService.ts`**: Update prompts in `fetchSentenceSuggestions` and `fetchExamplesForWord` to accept `userBio` as an argument. If `userBio` is provided, append the instruction: *"Create 3 Toki Pona sentences using the word [WORD]. Reference the user's interests: [USER_BIO]. Provide English translations."*

3. **Knowledge Drawer Overhaul (`WordDetailDrawer.tsx`)**
   - Display the primary English translation (first item in `word.meanings`) prominently at the top.
   - Add a "Common Phrases" section with 2-3 hardcoded phrase examples for core words.
   - Add a "jan Lina's Examples" section that fetches dynamic, bio-contextualized examples using `fetchExamplesForWord` (or a similar prompt).
   - Add a "Quick Cycle" button that calls `cycleWordStatus(word.id)`.

4. **Cyclic Mastery Logic**
   - **`masteryStore.ts`**: Implement `cycleWordStatus(wordId: string)`. The logic will find the word, map its current status in `['not_started', 'introduced', 'practicing', 'confident', 'mastered']`, determine the next status (modulo length), and update `confidenceScore` to the `STATUS_MIDPOINT` of the next status.
   - **`VocabCard.tsx`**: Implement an `onDoubleClick` handler on the root element to call `cycleWordStatus(word.id)`, removing any old direct jump logic if it existed in its wrapper or itself.

5. **Translation Fix (Interlinear Glossing)**
   - **`PhraseGrid.tsx`**: Parse each Toki Pona phrase into words. Look up each word in the vocabulary store to find its first primary meaning. Render the words side-by-side using an inline-flex column layout where the English meaning sits directly above the Toki Pona word.
   - **`MasteryGrid.tsx`**: Update the `builder-panel` sentence row (`selectedWords.join(' ')`). Parse the selected words, fetch their meanings from the vocabulary, and render them with the English text displayed above the Toki Pona words.

6. **Instructions Page (`Instructions.tsx`)**
   - Create `src/components/Instructions.tsx`.
   - Include the explanations as requested: Single Tap (Add to builder), Double Tap (Toggle mastery level), Long Press (Open Word Detail), Point System.
   - Add a trigger/link to this component in the `Dashboard.tsx` or Sidebar.

## Verification & Testing
- Validate that the UI correctly says "jan Lina".
- Ensure the `bio` persists between app reloads via Firestore/localStorage.
- Test that "jan Lina's Examples" generate correctly in the Drawer.
- Double-tap a `VocabCard` and verify its ring color cycles through all 5 states.
- Visually confirm that `PhraseGrid` and the sentence builder show English glosses directly above Toki Pona words.
- Ensure the Instructions page is accessible and displays the required text.