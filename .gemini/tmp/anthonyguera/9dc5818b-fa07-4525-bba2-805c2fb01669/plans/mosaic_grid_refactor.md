# TP-Tutor Mosaic Grid Refactor Plan

## Objective
Refactor the TP-Tutor dashboard from a sliding panel architecture into a "Unified Mosaic Grid" inspired by the Windows Phone Live Tile interface. This involves creating a single, infinite-surface scrollable canvas with magnetic snapping, rubber-band physics, dynamic live tiles (including grammar tiles), and hero-expansion logic, all while preserving existing Firebase and `masteryStore` functionality.

## Architectural Changes
The entire application view will shift from a standard flexbox layout with side panels into a massive 2D CSS Grid or coordinate-based canvas. 
- **`App.tsx`:** Remove `ResizableWrapper` and sliding panel logic. The main view will be the new `MosaicGrid` component.
- **`MosaicGrid.tsx`:** A new central engine that manages the 2D scroll state (X/Y), magnetic snapping to sections, and rubber-band physics.

## Grid Layout (The Infinite Surface)
The grid will be divided into logical "Zones" on a single plane:
- **Center (0,0):** 
  - **Daily Review Tile** (2x1, Gold/Action color).
  - **Roadmap Tile** (2x2 or 2x1, showing progress percentage).
- **Left Wing (-X, 0):** **Vocab Grid** (A massive sub-grid of 1x1 Word and Grammar tiles).
- **Right Wing (+X, 0):** **Phrasebook** (2x1 or 2x2 phrase tiles).
- **Bottom Section (0, +Y):** **Achievements & Breakthrough Logs** tiles.

## Component Refactoring (Tiles)
Existing components will be converted into "Live Tiles":
1. **Tile Base Component:** A wrapper that handles size (1x1, 2x1, 2x2), the "Hero Expansion" click animation (using Framer Motion `layoutId`), and mastery-level background colors.
2. **Vocab Tiles:** Update `VocabCard` to function as a 1x1 tile. 
3. **Grammar Tiles:** Inject `concepts` from the store into the Vocab Grid area. Design them as 1x1 or 2x1 tiles with a distinct border or book icon.
4. **Roadmap Tile:** A new tile that calculates progress based on `vocabulary` and `concepts` mastery, displaying a progress bar or percentage.
5. **Review Tile:** Replaces the current "Start Daily Review" buttons.
6. **Phrasebook Tiles:** Display saved phrases.

## Physics & Interaction Engine
- **Scrolling:** Use a customized wrapper (e.g., `framer-motion`'s `drag` on a massive container or native scroll with scroll-snap-type). Native `scroll-snap-type: both mandatory` combined with a CSS Grid is the most performant way to achieve magnetic snapping and rubber-banding without heavy JS physics libraries.
- **Rubber-banding:** Native CSS overscroll-behavior handles this well, but we can enhance it with Framer Motion if specific resistance curves are needed.
- **Hero Expansion:** When a tile is clicked, we use Framer Motion's `AnimatePresence` and `layoutId` to animate the tile into a full-screen fixed modal, while shrinking the main grid in the background.

## Implementation Steps

### Phase 1: Core Engine & Layout
1. Create `MosaicGrid.tsx` with a CSS Grid layout defining the Center, Left Wing, Right Wing, and Bottom areas.
2. Implement 2D scrolling and magnetic snapping using CSS `scroll-snap`.

### Phase 2: Live Tiles & Styling
1. Create a universal `LiveTile.tsx` component supporting `layoutId` for expansion, size props, and mastery color mapping.
2. Build the **Daily Review Tile** and **Roadmap Tile** (calculating progress % from the store).
3. Update `VocabCard.tsx` to fit the Live Tile spec and implement the **Grammar Tile** variant.

### Phase 3: Population & Assembly
1. Populate the Left Wing with Vocab and Grammar tiles.
2. Populate the Right Wing with Phrasebook tiles.
3. Populate the Bottom section with Achievement data.
4. Replace the old `Dashboard` in `App.tsx` with `MosaicGrid`.

### Phase 4: Physics & Polish
1. Implement the Hero Expansion animation (clicking a tile opens it full screen, grid scales down).
2. Fine-tune gutters, borders, and typography to match the high-tech, interconnected aesthetic.
3. Verify all Firebase syncing and `masteryStore` logic remains intact.