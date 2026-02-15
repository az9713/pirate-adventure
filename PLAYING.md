# Pirate Adventure -- Player Guide

## Overview

You are **Captain Barbarossa**, a pirate exploring tropical islands in search of
legendary treasure. Navigate two interconnected levels, solve puzzles by trading
items with characters you meet, collect gold coins, and ultimately unlock the
treasure chest to claim victory!

## Controls

```
+-------------------------------------------+
|                                           |
|   LEFT CLICK on ground  =  Walk there    |
|   LEFT CLICK on hotspot =  Interact      |
|   LEFT CLICK during dialogue = Advance   |
|   Press E  =  Toggle Level Editor        |
|                                           |
+-------------------------------------------+
```

- **Move**: Click anywhere on the green ground to walk there. Your pirate will
  automatically find a path using the navigation mesh.
- **Interact**: Walk near a glowing hotspot and click on it (or walk into its
  interaction radius) to trigger dialogue or pick up items.
- **Dialogue**: Click to advance dialogue lines. Each line shows who is speaking.

## HUD

```
+-------------------------------------------------------+
|  Editor [E]                                           |
|                                                       |
|                                                       |
|                    (Game World)                        |
|                                                       |
|                                                       |
|                                                       |
|  +----------+                      +---------+        |
|  | Coin 0/6 |                      | Rum [x] |        |
|  +----------+                      +---------+        |
+-------------------------------------------------------+
   Bottom-left:                       Bottom-right:
   Coin counter                       Inventory items
```

- **Coin Counter** (bottom-left): Shows how many gold coins you've collected
  out of 6 total.
- **Inventory Slots** (bottom-right): Shows key items you're carrying (e.g.,
  Rum Bottle, Rusty Key). Items appear here when you pick them up.

## Hotspot Types

Hotspots are interactive objects marked by glowing discs on the ground:

```
  Color       Type         What it does
  -------     ----------   ----------------------------------
  Orange      Dialogue     Talk to characters or examine objects
  Green       Item         Pick up a key item
  Blue        Teleport     Travel to another level
```

## The Two Levels

### Level 1: Pirate Cove

```
     +--------------------------------------------------+
     |                                                  |
     |   [Ship Wreck]          [Rocks]     [Palm]      |
     |                                                  |
     |              [Barrel]          [Chest]           |
     |              (gives rum)       (needs key)       |
     |                                                  |
     |   [Teleport] <--    [Player]                     |
     |   to Docks          Start                        |
     |                                                  |
     |   [Palm]                [Grass]       [Palm]     |
     |                                                  |
     +--------------------------------------------------+
```

- **Old Barrel** (green glow): Examine it to find a **Rum Bottle** inside.
  This is a one-time pickup -- once you take the rum, the barrel is spent.
- **Treasure Chest** (orange glow): The locked chest that holds the treasure.
  You need a **Rusty Key** to open it. Without the key, the pirate remarks
  it's locked.
- **Teleporter** (blue glow): Walk into it to travel to Level 2, The Docks.
- **Gold Coins** (3 scattered): Walk near them to auto-collect.

### Level 2: The Docks

```
     +--------------------------------------------------+
     |                                                  |
     |   [Tower]    [Dock Platforms]    [Rocks]         |
     |                                                  |
     |   [Fence]  [Guard]   [Cannon]   [Flag]          |
     |            (sleeping)                            |
     |                                                  |
     |   [Crate]  [Sailor]             [Teleport]      |
     |            (wants rum)           to Cove         |
     |                                                  |
     |   [Palm]         [Player]            [Palm]      |
     |                  Start                           |
     +--------------------------------------------------+
```

- **Old Sailor** (orange glow): A thirsty sailor sitting by his crate of
  bottles. He asks for rum. If you have the **Rum Bottle**, give it to him
  and he'll reward you with a **Rusty Key** and wake the sleeping guard.
- **Sleeping Guard** (orange glow): A guard blocking the way, fast asleep.
  After you help the sailor, the guard wakes up and lets you pass.
- **Shipping Crate** (orange glow): Just a crate marked FRAGILE. Examine
  it for flavor text.
- **Teleporter** (blue glow): Walk into it to return to Level 1.
- **Gold Coins** (3 scattered): Walk near them to auto-collect.

## Puzzle Walkthrough

Follow these steps to complete the game:

```
  Step 1                Step 2               Step 3
  +-----------+         +-----------+        +---------------+
  | Find the  |         | Travel to |        | Give rum to   |
  | barrel in | ------> | Level 2   | -----> | the Old Sailor|
  | Level 1   |         | (blue     |        | (he gives you |
  | (get rum) |         |  portal)  |        |  a rusty key) |
  +-----------+         +-----------+        +---------------+
                                                    |
                                                    v
  Step 6                Step 5               Step 4
  +-----------+         +-----------+        +---------------+
  |           |         | Use key   |        | Travel back   |
  | VICTORY!  | <------ | on the    | <----- | to Level 1    |
  |           |         | treasure  |        | (blue portal) |
  |           |         | chest     |        |               |
  +-----------+         +-----------+        +---------------+
```

1. **Level 1**: Walk to the **Old Barrel** (green glow, left side). Interact
   to pick up the **Rum Bottle**.
2. **Level 1**: Walk to the **blue teleporter** (left edge) to travel to
   Level 2, The Docks.
3. **Level 2**: Walk to the **Old Sailor** (near the dock area). With rum
   in your inventory, the dialogue changes -- you give him the rum, and he
   gives you a **Rusty Key**.
4. **Level 2**: Walk to the **blue teleporter** (right side) to return to
   Level 1, Pirate Cove.
5. **Level 1**: Walk to the **Treasure Chest** (right side). With the key
   in your inventory, the dialogue changes -- the chest opens!
6. **Victory!** The game ends and the victory screen appears.

## Gold Coins

There are **6 gold coins** total (3 in each level):

- Coins are **spinning golden shapes** floating above the ground
- Walk near a coin to **automatically collect** it
- Coins persist across level transitions -- if you collect some in Level 1,
  teleport to Level 2, and come back, they stay collected
- Your coin count is displayed on the **victory screen**
- Coins are optional -- you can win without collecting any!

## Victory Screen

When you open the treasure chest with the key, the victory screen shows:

```
  +------------------------------------------+
  |                                          |
  |          VICTORY!                        |
  |                                          |
  |    Coins Collected:  5 / 6              |
  |                                          |
  |    Items Found:                          |
  |      Rum Bottle                          |
  |      Rusty Key                           |
  |                                          |
  |    Time:  3m 42s                         |
  |                                          |
  |         [ Play Again ]                   |
  |                                          |
  +------------------------------------------+
```

- **Coins Collected**: How many of the 6 gold coins you found
- **Items Found**: Key items you collected during the adventure
- **Time**: How long it took you to complete the game
- **Play Again**: Click to restart from the beginning

## Tips

- **Explore both levels** before trying to solve the puzzle. Talk to everyone
  and examine everything.
- **The barrel is easy to miss** -- it's on the left side of Level 1 with a
  green glow.
- **You can revisit levels** freely via the teleporters. Items and coins
  persist across transitions.
- **The guard is a red herring** -- you don't need to interact with him
  directly to win, but the sailor wakes him up as part of the story.
- **Try to collect all 6 coins** for a perfect score on the victory screen!
