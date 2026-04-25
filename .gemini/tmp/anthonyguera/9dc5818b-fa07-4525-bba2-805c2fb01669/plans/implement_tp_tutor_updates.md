# Implementation Plan for TP-Tutor Updates

## Objective
Implement specific feature updates and bug fixes for the TP-Tutor app, specifically addressing layout docking, main area minimum width, side panel close buttons, draggable panel resizing, settings UI update, chat crash, mastery grid selection bug, and profile click-to-edit fields. Finally, commit and deploy the changes.

## Key Files & Context
- `src/App.tsx`: Layout structure, panel management, and wrapping side panels in a draggable component.
- `src/index.css`: Flexbox layout adjustments (`min-width`, `overflow-x`) and `.side-panel` styling.
- `src/App.css`: New `.btn-close-glowing` class and `.btn-settings` aesthetic update.
- `src/components/UserProfilePanel.tsx`: Click-to-edit UI for profile fields and updated header button.
- `src/components/SettingsPanel.tsx`: Updated header button and removed blinding white backgrounds.
- `src/components/ChatSession.tsx`: Fixed framer-motion render bug (black screen) and updated header button.
- `src/components/MasteryGrid.tsx`: Fixed event bubbling bug in container `onClick` clearing selections.
- `src/components/InstructionsPanel.tsx`, `src/components/AchievementsPanel.tsx`: Updated header button.

## Implementation Steps

### 1. Left-Dock Profile Panel (Task 1)
- **Action:** In `src/App.tsx`, separate the rendering of the `UserProfilePanel` from the right-side `.side-panels-container`.
- Create a new `<div className="side-panels-container left-dock">` placed *before* the `<Dashboard />` component that only renders the `UserProfilePanel`.
- Filter `activePanels` in the existing right-side container to map everything except `'profile'`.

### 2. Main Vocab Area Minimum Width & Scroll (Task 2)
- **Action:** In `src/index.css`, update `.app-container` to include `overflow-x: auto;` so it can scroll horizontally when crowded.
- Update `.dashboard` to include `min-width: 600px;` (or similar appropriate size) so the main content never squishes below a legible width.

### 3. Glowing 'X' Close Button (Task 3)
- **Action:** Add a new class `.btn-close-glowing` to `src/App.css` featuring a transparent background, `color: var(--gold);`, `font-size: 1.5rem;`, and a `text-shadow` using `var(--gold-glow)`.
- Replace the existing `<button onClick={onClose} className="btn-back"><span>✕</span> CLOSE</button>` elements in all five panel components (`UserProfilePanel`, `SettingsPanel`, `ChatSession`, `InstructionsPanel`, `AchievementsPanel`) with the new glowing button.
- Ensure the header layout utilizes `justify-content: space-between` to push the button to the top right corner.

### 4. Draggable Panel Slider Handles (Task 4)
- **Action:** Create a custom `ResizableWrapper` in `src/App.tsx` (or as a separate component) that wraps each active panel.
- The wrapper will manage its own `width` state.
- It will render a thin, absolutely positioned `div` on the appropriate edge (right edge for the left-docked Profile panel, left edge for right-docked panels) that listens to `onPointerDown`, `onPointerMove`, and `onPointerUp` events to dynamically adjust the wrapper's width.

### 5. Settings Panel UI Update (Task 5)
- **Action:** In `src/App.css`, modify the `.btn-settings` class to remove the "blinding white" aspects (`background: var(--surface-2); color: white;`).
- Change it to use a dark charcoal background (e.g., `#111` or `var(--surface-opaque)`), `color: var(--gold);`, and a subtle gold border, perfectly matching the dark charcoal and gold aesthetic requested.

### 6. Chat Bubble Bug Fix (Task 6)
- **Action:** In `src/components/ChatSession.tsx`, locate the opening `<motion.div>` tag inside the `<LazyMotion>` provider.
- Change `<motion.div>` to `<m.div>` (and update the closing tag) to fix the Framer Motion runtime error that currently causes a blank black screen.

### 7. Mastery Grid Bug Fix (Task 7)
- **Action:** In `src/components/MasteryGrid.tsx`, fix the bug where clicking a word card immediately clears the multi-word selection.
- Update the `<div className="mastery-grid-container" onClick={...}>` to only execute its clearing logic if the click target is the container itself (the background), preventing clicks on the `VocabCard` components from triggering the clear due to event bubbling:
  `onClick={(e) => { if (e.target === e.currentTarget && selectedWords.length > 0) setSelectedWords([]); }}`

### 8. Profile Click-to-Edit Fields (Task 8)
- **Action:** In `src/components/UserProfilePanel.tsx`, create an inline `EditableField` component.
- The component will display a flat `div` by default. When clicked, it sets an `isEditing` state to true, rendering an `<input>` element instead. On blur or 'Enter' key press, it saves the value and switches back to the flat `div`.
- Apply this component to the Age, Sex, and a newly added Location field within the profile settings section.

### 9. Finalization (Task 9)
- **Action:** After implementing and visually testing all changes locally, execute the deployment and version control commands:
  - `git add .`
  - `git commit -m "Add draggable side panels, Profile left-dock, dark Settings UI, and fix Chat/Grid bugs"`
  - `git push origin main`
  - `firebase deploy`

## Verification & Testing
- Visually confirm left/right docking behavior.
- Open multiple panels; verify minimum width of 600px is respected and horizontal scrollbar appears.
- Test closing panels via the new glowing 'X' buttons.
- Drag panel edges to verify resizing functionality.
- Inspect Settings buttons to confirm aesthetic changes.
- Click the top-right chat icon; ensure the chat UI loads properly.
- Select multiple words in the Mastery Grid; verify they stay selected and the sentence builder works.
- Click the Age, Sex, and Location fields in the Profile panel; verify they switch to inputs and save correctly.