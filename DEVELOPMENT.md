# Development Story: Pirate Adventure

## Inspiration

This game was inspired by the YouTube video **"Ditch Unity: How I Vibe Code 3D Games With AI - Full Tutorial (Codex CLI, Claude Code, Cursor)"** by **Chong-U -- AI Oriented Dev**:

> https://www.youtube.com/watch?v=fu7NZ3t3sLM&t=659s

The video demonstrates how to build 3D browser games using AI coding assistants
instead of traditional game engines like Unity or Unreal. Following that spirit,
this entire game was developed through human-AI collaboration, where the human
developer served as a creative director and steerer, while **Claude Code**
(Anthropic's AI coding assistant) wrote all the code, designed the architecture,
sourced free game assets, and iterated on the implementation.

## Development Approach

```
+------------------+       Steering & Feedback       +------------------+
|                  | ------------------------------> |                  |
|  Human Developer |                                 |   Claude Code    |
|  (Director)      | <------------------------------ |   (Developer)    |
|                  |       Code, Assets, Fixes       |                  |
+------------------+                                 +------------------+
        |                                                     |
        |  Manual FBX-to-GLB                                  |  Automated via
        |  conversion (only                                   |  Chrome extension
        |  human intervention)                                |
        v                                                     v
+------------------+                                 +------------------+
| Aspose Online    |                                 | Chrome Browser   |
| Converter        |                                 | (Live Testing)   |
+------------------+                                 +------------------+
```

### Human Role

The human developer's contributions were limited to:

1. **Steering**: Providing high-level direction ("add game assets", "make the
   trees bigger", "add gameplay mechanics")
2. **Feedback**: Reviewing visual output and requesting adjustments
3. **One manual task**: Converting the pirate captain character model from FBX
   to GLB format at https://products.aspose.app/3d/conversion/fbx-to-glb
   (this conversion was also suggested by Claude Code)

### Claude Code's Role

Claude Code handled everything else:

- **Architecture design**: Planned the entire module structure, event system,
  and component hierarchy
- **Code implementation**: Wrote all TypeScript/Three.js code from scratch
- **Asset sourcing**: Searched the web, downloaded free CC0 game assets from
  multiple sources, organized them into the project
- **Asset integration**: Configured model loading, fixed texture paths, calibrated
  scales, and corrected FBX conversion artifacts (metalness fix)
- **Gameplay design**: Designed the puzzle flow (rum -> sailor -> key -> chest),
  collectible system, inventory, and victory condition
- **Level design**: Created two interconnected levels with decorations, hotspots,
  collectibles, and teleporters
- **Testing**: Used the Claude in Chrome extension extensively to visually verify
  the game in a live browser, clicking through gameplay, checking model scales,
  and debugging issues in real-time
- **Bug fixing**: Identified and fixed issues like white untextured models
  (missing colormap.png), oversized models (scale calibration), and dark
  character rendering (FBX metalness artifact)

## Development Timeline

### Phase 1: Engine Foundation

Claude Code built the core game engine following the tutorial's architecture:

```
Engine Foundation
  |
  +-- Three.js scene, camera, renderer, lights
  +-- GameLoop with requestAnimationFrame
  +-- EventBus (pub/sub pattern)
  +-- InputManager (pointer events)
  +-- CameraController (orbit controls)
  +-- AssetLoader with GLTF caching
```

### Phase 2: Navigation & Character

Point-and-click movement system:

```
Click on ground
  --> Raycast to NavMesh
  --> three-pathfinding finds route
  --> CharacterController walks waypoints
  --> AnimationStateMachine: Idle -> Walk -> Idle
```

### Phase 3: Interaction System

Dialogue and hotspot interactions:

```
Player walks near hotspot
  --> HotspotManager detects proximity
  --> DialogueSystem shows typewriter text
  --> Speaker name + dialogue lines advance on click
```

### Phase 4: Level Editor

A built-in visual editor for creating levels without editing JSON:

- Toggle with 'E' key
- Drag nav mesh vertices
- Add/edit hotspots with a form
- Export level as JSON

### Phase 5: Gameplay Mechanics

Claude Code designed and implemented the full game loop:

```
Level 1: Find rum in barrel
  |
  v
Teleport to Level 2
  |
  v
Give rum to Old Sailor --> Receive rusty key
  |
  v
Teleport back to Level 1
  |
  v
Use key on treasure chest --> VICTORY!
  |
  +-- Collect gold coins along the way (6 total)
```

New systems created:
- **Inventory** (singleton, persists across levels)
- **InventoryUI** (coin counter + item slots)
- **Collectible coins** (auto-pickup on proximity)
- **Item-gated hotspots** (requiresItem / alternateDialogue)
- **Victory screen** (coin count, play time, play again)

### Phase 6: 3D Asset Integration

Claude Code sourced free assets and integrated them:

1. **Kenney Pirate Kit** (66 GLB models) - environment and props
2. **Quaternius Pirate Kit** (50+ glTF models) - additional props
3. **Pirate Captain Barbarossa** (animated character) - player model

Key challenges solved:
- Kenney GLBs reference `Textures/colormap.png` relatively -- fixed by placing
  the texture at the correct relative paths
- All models were oversized at scale 1.0 -- calibrated to 0.008-0.8 range
- FBX-to-GLB conversion set metalness to 1.0 -- fixed in CharacterLoader

## Asset Sources & Acknowledgements

### Inspiration

- **Chong-U -- AI Oriented Dev** for the original tutorial and concept
  - YouTube: https://www.youtube.com/@chabordes
  - Video: https://www.youtube.com/watch?v=fu7NZ3t3sLM&t=659s

### 3D Models

| Source | Assets | License | URL |
|--------|--------|---------|-----|
| Kenney.nl | Pirate Kit (66 GLB models: palms, rocks, docks, barrels, chests, cannons, ships, etc.) | CC0 1.0 | https://kenney.nl/assets/pirate-kit |
| Quaternius | Pirate Kit (50+ glTF models: additional props and environment pieces) | CC0 1.0 | https://quaternius.com |
| Poly Pizza / Quaternius | Pirate Captain Barbarossa (animated character with cutlass and parrot) | CC0 1.0 | https://poly.pizza |

### Textures

| Source | Asset | License |
|--------|-------|---------|
| Kenney.nl | colormap.png (shared texture atlas for all Kenney Pirate Kit models) | CC0 1.0 |

### Tools

| Tool | Purpose |
|------|---------|
| Claude Code (Anthropic) | AI coding assistant -- wrote all game code |
| Claude in Chrome Extension | Browser automation for visual testing |
| Aspose 3D Converter | Online FBX-to-GLB conversion (https://products.aspose.app/3d/conversion/fbx-to-glb) |

### Libraries

| Library | Purpose | License |
|---------|---------|---------|
| Three.js | 3D rendering engine | MIT |
| three-pathfinding | Navigation mesh pathfinding | MIT |
| Vite | Build tool and dev server | MIT |
| TypeScript | Type-safe JavaScript | Apache 2.0 |

## Lessons Learned

1. **FBX-to-GLB conversion loses material fidelity**: Online converters often
   set metalness=1 and roughness=1, requiring post-load material fixes.

2. **Kenney assets use shared texture atlases**: GLB files reference external
   `Textures/colormap.png` via relative paths. The texture must exist at the
   correct relative location from the GLB file.

3. **Scale calibration is iterative**: Different asset packs use different unit
   scales. Kenney models needed 0.2-0.8x, while the Quaternius character needed
   0.008x to fit the game world.

4. **Event-driven architecture scales well**: The EventBus pattern allowed new
   systems (inventory, collectibles, victory) to be added without modifying
   existing code -- they just subscribe to events.

5. **AI + browser automation = effective testing**: Claude in Chrome could
   visually verify game state, click through gameplay, and identify issues
   (wrong scales, missing textures) that would be hard to catch from code alone.
