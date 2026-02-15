# Pirate Adventure -- Technical Architecture

A technical reference for developers who want to understand, modify, or extend
the game.

## Tech Stack

```
  +-------------------+
  |    Browser        |
  |  +--------------+ |
  |  |  Three.js    | |    Rendering, scene graph, materials, lights
  |  +--------------+ |
  |  |  TypeScript  | |    Type-safe application code
  |  +--------------+ |
  |  |  Vite        | |    Dev server with HMR, production bundler
  |  +--------------+ |
  |  |  Web Audio   | |    Music and dialogue audio playback
  |  +--------------+ |
  +-------------------+
```

| Technology | Version | Purpose |
|---|---|---|
| Three.js | ^0.182.0 | 3D rendering, scene graph, GLTF loading |
| three-pathfinding | ^1.3.0 | Navigation mesh pathfinding (A*) |
| TypeScript | ~5.9.3 | Static typing |
| Vite | ^7.3.1 | Build tool, dev server, HMR |

## Project Structure

```
pirate-adventure/
|
+-- src/
|   +-- main.ts                    Entry point
|   +-- Game.ts                    Master coordinator
|   |
|   +-- core/
|   |   +-- Engine.ts              Three.js renderer, scene, camera, lights
|   |   +-- EventBus.ts            Pub/sub event system (singleton)
|   |   +-- GameLoop.ts            RAF-based game loop
|   |   +-- InputManager.ts        Pointer input -> normalized coords
|   |   +-- AssetLoader.ts         GLTF loader with cache (singleton)
|   |
|   +-- types/
|   |   +-- GameTypes.ts           Enums: GameState, HotspotType; Interfaces: ItemDef
|   |   +-- LevelTypes.ts          LevelData, HotspotDef, DialogueDef, etc.
|   |   +-- AssetTypes.ts          CharacterDef, AssetIndex
|   |
|   +-- character/
|   |   +-- CharacterLoader.ts     Load GLB model + animations
|   |   +-- CharacterController.ts Waypoint movement, rotation
|   |   +-- AnimationStateMachine.ts  Idle/Walk/Run transitions
|   |
|   +-- navigation/
|   |   +-- NavMesh.ts             three-pathfinding wrapper
|   |   +-- ClickToMove.ts         Raycast -> pathfind -> move
|   |   +-- NavMeshEditor.ts       Visual nav mesh editing
|   |
|   +-- interaction/
|   |   +-- HotspotManager.ts      Proximity detection, item logic
|   |   +-- Hotspot.ts             3D hotspot object (glow + model)
|   |   +-- HotspotEditor.ts       Visual hotspot editing
|   |   +-- DialogueSystem.ts      Typewriter dialogue display
|   |
|   +-- level/
|   |   +-- LevelManager.ts        Load/unload levels, decorations
|   |   +-- Background.ts          Scene background (color/image/video)
|   |
|   +-- inventory/
|   |   +-- Inventory.ts           Item + coin data store (singleton)
|   |   +-- InventoryUI.ts         DOM-based inventory display
|   |
|   +-- collectibles/
|   |   +-- Collectible.ts         Spinning coin 3D object
|   |   +-- CollectibleManager.ts  Auto-collect on proximity
|   |
|   +-- audio/
|   |   +-- AudioManager.ts        Web Audio: music + dialogue
|   |
|   +-- editor/
|   |   +-- LevelEditor.ts         Master editor, routes input
|   |
|   +-- ui/
|       +-- UIOverlay.ts           Root UI container, loading bar
|       +-- DialogueBox.ts         Speaker + text with typewriter
|       +-- VictoryScreen.ts       End-game results overlay
|       +-- EditorPanel.ts         Editor toggle + controls
|       +-- styles.css             All UI styles
|
+-- public/assets/
|   +-- index.json                 Asset index (character definitions)
|   +-- glb/
|   |   +-- character/             Player model (GLB)
|   |   +-- environment/           Trees, rocks, docks, structures (GLB)
|   |   +-- props/                 Barrels, chests, cannons, flags (GLB)
|   +-- levels/
|   |   +-- level_01.json          Pirate Cove
|   |   +-- level_02.json          The Docks
|   +-- audio/
|       +-- dialogue/              Voice files (placeholder)
|       +-- music/                 Background music (placeholder)
|
+-- index.html                     Single HTML entry
+-- package.json
+-- tsconfig.json
```

## Architecture Overview

The game uses a **component-based, event-driven architecture**. All modules
communicate through a central EventBus rather than direct references:

```
                          +-------------------+
                          |     EventBus      |
                          | (pub/sub broker)  |
                          +--------+----------+
                                   |
          +----------+----------+--+--+----------+-----------+
          |          |          |     |          |           |
     +----+---+ +---+----+ +---+--+ ++---------++-----+ +---+------+
     | Level  | |Hotspot | |Click | |Dialogue  ||Inven | |Collecti- |
     |Manager | |Manager | |ToMove| |System    ||tory  | |bleManager|
     +----+---+ +---+----+ +---+--+ ++---------++-----+ +---+------+
          |          |          |     |          |           |
          +----------+----------+--+--+----------+-----------+
                                   |
                          +--------+----------+
                          |      Game.ts      |
                          |  (coordinator)    |
                          +-------------------+
```

### Data Flow: Complete Game Turn

```
  User clicks ground
       |
       v
  InputManager.onPointerUp()
       |  emit('click', { ndc })
       v
  ClickToMove.onClick()
       |  raycast to NavMesh
       |  NavMesh.findPath(start, end)
       v
  CharacterController.setPath(waypoints)
       |  each frame: update(dt)
       |  AnimationStateMachine: Idle -> Walk
       v
  CharacterController reaches destination
       |  emit('character:arrived')
       v
  HotspotManager.checkProximity()
       |  player near hotspot?
       |  check inventory for requiresItem
       v
  DialogueSystem.startDialogue(lines)
       |  typewriter effect
       |  click to advance
       v
  HotspotManager.onDialogueEnd()
       |  givesItem? -> Inventory.addItem()
       |  consumesItem? -> Inventory.removeItem()
       |  victory? -> emit('game:victory')
       v
  InventoryUI.render()
  VictoryScreen.show()
```

## Event System

The EventBus is a simple pub/sub singleton. Events are string-keyed with
arbitrary payloads:

```typescript
// Subscribe
eventBus.on('coin:collected', (coinId: string) => { ... });

// Publish
eventBus.emit('coin:collected', 'coin_l1_1');

// Unsubscribe
eventBus.off('coin:collected', handler);
```

### Event Catalog

```
  Event Name             Payload                    Emitted By
  --------------------   -------------------------  ----------------------
  click                  { ndc: Vector2 }           InputManager
  level:loaded           (LevelData, spawn: Vec3)   LevelManager
  transition:start       (none)                     LevelManager
  transition:end         (none)                     LevelManager
  teleport               { levelId, spawnId }       HotspotManager
  character:arrived      (position: Vector3)        CharacterController
  hotspot:dialogue       (DialogueDef)              HotspotManager
  dialogue:start         (none)                     DialogueSystem
  dialogue:end           (none)                     DialogueSystem
  inventory:changed      (none)                     Inventory
  coin:collected         (coinId: string)           CollectibleManager
  game:victory           (none)                     HotspotManager
  editor:toggle          (none)                     EditorPanel
  editor:export          (none)                     EditorPanel
  editor:toggleNavMesh   (none)                     EditorPanel
  editor:toggleHotspots  (none)                     EditorPanel
```

## Level Data Format

Levels are defined as JSON files in `public/assets/levels/`. Each level
contains all data needed to build the scene:

```
  LevelData
  +-- id: string                   "level_01"
  +-- name: string                 "Pirate Cove"
  +-- background: BackgroundDef    { type: "color", color: "#1a3a5c" }
  +-- music?: MusicDef             { src, volume, loop }
  +-- spawn: Vec3                  Default spawn position
  +-- spawns: Record<id, Vec3>     Named spawn points (for teleporters)
  +-- navMesh: NavMeshDef
  |   +-- vertices: number[][]     [[x,y,z], ...]
  |   +-- faces: number[][]        [[v0,v1,v2], ...]  (triangle indices)
  +-- hotspots: HotspotDef[]
  |   +-- id, name, type
  |   +-- position, radius, interactionRadius
  |   +-- model?, modelScale?      GLB model path
  |   +-- dialogue?                Default dialogue lines
  |   +-- alternateDialogue?       Dialogue when requiresItem is met
  |   +-- requiresItem?            Item id needed for alternate path
  |   +-- givesItem?               ItemDef given after interaction
  |   +-- consumesItem?            Item id removed after interaction
  |   +-- oneShot?                 Disappear after first interaction
  |   +-- victory?                 Triggers game victory
  |   +-- target?                  Teleport destination {levelId, spawnId}
  +-- collectibles?: CollectibleDef[]
  |   +-- id, type: "coin"
  |   +-- position: Vec3
  +-- decorations?: DecorationDef[]
      +-- id, model (GLB path)
      +-- position, scale?, rotationY?
```

## Key Subsystems

### Navigation

```
  NavMesh (three-pathfinding)
  +-- buildFromDef(NavMeshDef)     Build mesh from vertices + faces
  +-- findPath(start, end)         A* pathfinding, returns Vec3[]
  +-- dispose()                    Clean up

  ClickToMove
  +-- onClick(ndc)                 Raycast -> pathfind -> move character
  +-- Shows ring marker at destination
  +-- Skips clicks during dialogue/transitions
```

The NavMesh uses `three-pathfinding`'s Pathfinding class. It converts the
level's vertex/face arrays into a Three.js BufferGeometry, creates a zone,
and provides A* pathfinding:

```
  Click (screen coords)
    -> NDC (normalized device coords)
    -> Raycaster intersects NavMesh geometry
    -> World position on NavMesh
    -> Pathfinding.findPath(startGroup, start, end)
    -> Array of Vec3 waypoints
    -> CharacterController walks them sequentially
```

### Hotspot Interaction Logic

```
  Player enters hotspot interactionRadius
       |
       +-- Is type Teleport?
       |     YES -> emit('teleport', target)
       |
       +-- Has requiresItem?
       |     YES -> Player has item?
       |     |        YES -> Use alternateDialogue
       |     |        |      After: givesItem?, consumesItem?, victory?
       |     |        NO  -> Use default dialogue
       |     |
       |     NO  -> Use default dialogue
       |            After: givesItem? (for item-type hotspots)
       |
       +-- Is oneShot?
             YES -> Remove hotspot after interaction
```

### Inventory System

```
  Inventory (singleton)
  +-- items: Map<string, ItemDef>    Key items (rum, key)
  +-- coins: number                  Coin counter
  +-- collectedCoins: Set<string>    Tracks collected coin IDs
  +-- addItem(item) / removeItem(id) / hasItem(id)
  +-- addCoin() / getCoinCount()
  +-- Emits 'inventory:changed' on any mutation
  +-- Persists across level transitions (singleton)
```

### Character Animation

```
  AnimationStateMachine
  +-- States: Idle, Walk, Run
  +-- Transitions based on movement speed:
  |     speed == 0     -> Idle
  |     speed < 3      -> Walk
  |     speed >= 3     -> Run
  +-- Crossfade between animations (0.2s)
  +-- Falls back gracefully if clips are missing
```

### Asset Loading

```
  AssetLoader (singleton)
  +-- loadGLTF(path): Promise<GLTF>
  |     Checks cache first
  |     Loads from /assets/{path}
  |     Caches result for reuse
  +-- loadIndex(): Promise<AssetIndex>
  |     Loads /assets/index.json
  |     Contains character definitions
```

Models are loaded asynchronously and non-blocking. Decorations load in
parallel without blocking level initialization. Hotspot models load with
a procedural fallback (spinning octahedron) shown until the GLB loads.

## Adding New Content

### Adding a New Level

1. Create `public/assets/levels/level_03.json` following the LevelData format
2. Define navMesh vertices and faces (use the in-game editor, press E)
3. Add hotspots, collectibles, and decorations
4. Add a teleporter in an existing level pointing to level_03:
   ```json
   {
     "id": "teleport_03",
     "type": "teleport",
     "position": { "x": 5, "y": 0, "z": 0 },
     "radius": 1.0,
     "interactionRadius": 1.5,
     "target": { "levelId": "level_03", "spawnId": "from_level_02" }
   }
   ```
5. Add corresponding spawn point in level_03's `spawns` object

### Adding a New Item

1. Define the item in a hotspot's `givesItem`:
   ```json
   "givesItem": {
     "id": "compass",
     "name": "Magic Compass",
     "icon": "🧭",
     "description": "Points to the nearest treasure."
   }
   ```
2. Reference the item id in another hotspot's `requiresItem`
3. Optionally set `consumesItem` to remove it after use

### Adding a New Hotspot Type

1. Add the type to `HotspotType` enum in `GameTypes.ts`
2. Add color mapping in `Hotspot.ts` constructor
3. Add handling logic in `HotspotManager.ts` triggerHotspot method

### Adding New 3D Models

1. Place GLB files in `public/assets/glb/props/` or `glb/environment/`
2. If models use external textures, place them at the correct relative path
3. Reference in level JSON:
   ```json
   { "id": "my_prop", "model": "glb/props/my-model.glb",
     "position": { "x": 0, "y": 0, "z": 0 }, "scale": 0.3 }
   ```
4. Scale values typically range from 0.1 to 1.0 depending on the source

### Adding a New Character

1. Place GLB in `public/assets/glb/character/`
2. Update `public/assets/index.json`:
   ```json
   {
     "characters": {
       "pirate": {
         "skeleton": { "file": "glb/character/model.glb", "scale": 0.008 },
         "animations": {
           "file": "glb/character/model.glb",
           "clips": [
             { "name": "Idle", "originalName": "Idle", "duration": 2.0, "loop": true },
             { "name": "Walk", "originalName": "Walk", "duration": 1.0, "loop": true }
           ]
         }
       }
     }
   }
   ```
3. Note: FBX conversions may require metalness fix (already handled in
   `CharacterLoader.ts`)

## Using the Level Editor

Press **E** to toggle the editor. The editor has two modes:

### Nav Mesh Mode
- Click to add vertices (shown as red spheres)
- Select 3 vertices, then click "Add Face" to create a triangle
- Drag vertices to reshape the walkable area
- The nav mesh is the invisible surface the player walks on

### Hotspot Mode
- Click "Add Hotspot" then click on the ground to place one
- Click an existing hotspot to select and edit its properties
- Drag hotspots to reposition them
- Edit dialogue, items, teleport targets via the form panel

### Export
- Click "Export JSON" to download the current level as a JSON file
- This JSON can replace the existing level file in `public/assets/levels/`

## Build & Deploy

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The production build outputs to `dist/`. All assets in `public/` are copied
as-is to the build output. The game is a static site -- deploy to any web
server, CDN, or static hosting (Netlify, Vercel, GitHub Pages).

## Performance Notes

- GLB models are cached by `AssetLoader` -- loading the same model twice
  reuses the cached GLTF
- Decorations load asynchronously and don't block level initialization
- The game loop caps delta time at 100ms to prevent physics jumps
- Shadow maps are enabled on all meshes for visual quality
- The renderer uses `Math.min(devicePixelRatio, 2)` to cap resolution
