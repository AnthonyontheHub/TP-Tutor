# TP-Tutor Mosaic Grid Refactor Plan (Framer Motion)

## Objective
Refactor the TP-Tutor dashboard from a sliding panel architecture into a "Unified Mosaic Grid" inspired by the Windows Phone Live Tile interface. This involves creating a single, infinite-surface canvas using Framer Motion drag physics, magnetic snapping, rubber-band physics, dynamic live tiles (including grammar tiles), and hero-expansion logic, all while preserving existing Firebase and `masteryStore` functionality.

## Architectural Changes
The application view shifts from flexbox side panels into a single, massive 2D coordinate-based canvas.
- **`App.tsx`:** Remove `ResizableWrapper` and sliding panel logic. The main view will be the new `MosaicGrid` component.
- **`MosaicGrid.tsx`:** A new central engine utilizing a massive `<motion.div drag>` surface. It manages the 2D pan state (X/Y), custom magnetic snapping to sections via `onDragEnd` and `animate`, and rubber-band physics via `dragConstraints` and `dragElastic`.

## Grid Layout (The Infinite Surface)
The canvas will logically arrange "Zones":
- **Center (0,0):** 
  - **Daily Review Tile** (2x1, Gold/Action color).
  - **Roadmap Tile** (2x2 or 2x1, showing progress percentage).
- **Left Wing (-X):** **Vocab Grid** (A massive sub-grid of 1x1 Word and Grammar tiles).
- **Right Wing (+X):** **Phrasebook** (2x1 or 2x2 phrase tiles).
- **Bottom Section (+Y):** **Achievements & Breakthrough Logs** tiles.

## Component Refactoring (Tiles)
Existing components will be converted into "Live Tiles":
1. **`LiveTile.tsx`:** A universal wrapper component that handles size (1x1, 2x1, 2x2), the "Hero Expansion" click animation (using Framer Motion `layoutId`), and maps mastery levels to background colors/intensity.
2. **Vocab Tiles:** `VocabCard` becomes a 1x1 tile.
3. **Grammar Tiles:** Inject `concepts` from the store into the Vocab Grid area as distinct tiles (e.g., specific border or book icon).
4. **Roadmap Tile:** Calculates progress based on `vocabulary` and `concepts` mastery.
5. **Review Tile:** Replaces the current review buttons.

## Physics & Interaction Engine
- **Framer Motion Drag:** The canvas will use `<motion.div drag>` with `dragConstraints` set to a specific bounding box to create the rubber-band resistance.
- **Magnetic Snapping:** `onDragEnd` will calculate the nearest section's coordinate and animate the canvas position to it, ensuring sections are never cut off.
- **Hero Expansion:** When a tile is tapped, `AnimatePresence` and `layoutId` animate the tile into a full-screen fixed modal while the massive grid scales down slightly in the background (`scale: 0.95`).

## Implementation Steps
### Phase 1: Core Engine & Layout
1. Create `MosaicGrid.tsx` with a massive `<motion.div>` canvas.
2. Implement drag boundaries, elastic resistance, and the `onDragEnd` snapping logic to X/Y coordinates representing the zones.

### Phase 2: Live Tiles & Styling
1. Build the universal `LiveTile.tsx` component.
2. Build the **Center Tiles** (Review & Roadmap).
3. Adapt `VocabCard.tsx` for the **Left Wing**, injecting Grammar tiles.

### Phase 3: Population & Assembly
1. Assemble the massive grid inside `MosaicGrid` with the center, left, right, and bottom clusters.
2. Replace `Dashboard` in `App.tsx` with `MosaicGrid`.

### Phase 4: Polish & Integration
1. Implement the Hero Expansion logic.
2. Ensure Firebase sync and `masteryStore` logic is untouched and responsive.
3. Fine-tune the interconnected aesthetic (gutters, borders).