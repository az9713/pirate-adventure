import * as THREE from 'three';
import { Collectible } from './Collectible';
import { inventory } from '../inventory/Inventory';
import { eventBus } from '../core/EventBus';
import type { CollectibleDef } from '../types/LevelTypes';

export class CollectibleManager {
  private collectibles: Collectible[] = [];
  private scene: THREE.Scene;
  private collectedIds = new Set<string>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  loadCollectibles(defs: CollectibleDef[]): void {
    this.clear();
    for (const def of defs) {
      if (this.collectedIds.has(def.id)) continue;
      const c = new Collectible(def);
      this.collectibles.push(c);
      this.scene.add(c.mesh);
    }
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    for (const c of this.collectibles) {
      c.update(dt);
      if (!c.isCollected() && c.isInRange(playerPos)) {
        c.collect();
        this.collectedIds.add(c.def.id);
        inventory.addCoin();
        eventBus.emit('coin:collected', c.def.id);
      }
    }
  }

  clear(): void {
    for (const c of this.collectibles) {
      this.scene.remove(c.mesh);
    }
    this.collectibles = [];
  }

  dispose(): void {
    this.clear();
  }
}
