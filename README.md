# Pirate Adventure

A 3D point-and-click pirate adventure game built entirely with AI. Navigate
tropical islands, solve item-based puzzles, collect gold coins, and unlock the
legendary treasure chest!

```
    ___
   |   |  Arr! A locked treasure chest.
   |___|  I wonder what be inside...
   /   \
  /_____\
```

**[Play the Game](https://az9713.github.io/pirate-adventure/)** (coming soon)

## Screenshots

The game features two interconnected levels with 3D models, point-and-click
navigation, inventory puzzles, and collectible coins:

- **Level 1 - Pirate Cove**: Ship wreck, palm trees, treasure chest, barrel
- **Level 2 - The Docks**: Dock platforms, watch tower, old sailor, guard

## How to Play

| Action | Control |
|--------|---------|
| Move | Left-click on ground |
| Interact | Walk near a glowing hotspot |
| Advance dialogue | Left-click |
| Toggle editor | Press E |

### Puzzle Flow

```
  Find rum in barrel --> Give rum to sailor --> Get rusty key --> Open chest --> Victory!
```

Collect all 6 gold coins along the way for a perfect score. See
[PLAYING.md](PLAYING.md) for the full player guide.

## Tech Stack

| Technology | Purpose |
|---|---|
| Three.js | 3D rendering and scene management |
| three-pathfinding | Navigation mesh pathfinding |
| TypeScript | Type-safe game code |
| Vite | Dev server and build tool |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## How This Was Built

This game was developed through **human-AI collaboration**:

- **Human**: Creative direction and steering only
- **Claude Code**: Wrote all code, designed architecture, sourced assets, tested via browser automation
- **Claude in Chrome**: Visual testing and gameplay verification

Inspired by **Chong-U -- AI Oriented Dev**'s tutorial:
[Ditch Unity: How I Vibe Code 3D Games With AI](https://www.youtube.com/watch?v=fu7NZ3t3sLM&t=659s)

See [DEVELOPMENT.md](DEVELOPMENT.md) for the full development story.

## Project Structure

```
src/
  core/         Engine, EventBus, GameLoop, InputManager, AssetLoader
  character/    CharacterLoader, CharacterController, AnimationStateMachine
  navigation/   NavMesh, ClickToMove, NavMeshEditor
  interaction/  HotspotManager, Hotspot, DialogueSystem
  level/        LevelManager, Background
  inventory/    Inventory, InventoryUI
  collectibles/ Collectible, CollectibleManager
  editor/       LevelEditor
  ui/           UIOverlay, DialogueBox, VictoryScreen, EditorPanel
  types/        GameTypes, LevelTypes, AssetTypes
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## Credits

### Inspiration
- [Chong-U -- AI Oriented Dev](https://www.youtube.com/@chabordes) for the original tutorial concept

### 3D Assets (CC0 License)
- [Kenney.nl](https://kenney.nl/assets/pirate-kit) -- Pirate Kit (66 models)
- [Quaternius](https://quaternius.com) -- Pirate Kit (50+ models)
- [Poly Pizza](https://poly.pizza) / Quaternius -- Pirate Captain Barbarossa (animated character)

### Tools
- [Claude Code](https://claude.ai/claude-code) (Anthropic) -- AI coding assistant
- [Aspose 3D Converter](https://products.aspose.app/3d/conversion/fbx-to-glb) -- FBX to GLB conversion

## License

Game code: MIT. 3D assets are CC0 (public domain) from their respective creators.
