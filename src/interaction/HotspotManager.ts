import * as THREE from 'three';
import { Hotspot } from './Hotspot';
import { eventBus } from '../core/EventBus';
import { HotspotType } from '../types/GameTypes';
import type { HotspotDef } from '../types/LevelTypes';

export class HotspotManager {
  private hotspots: Hotspot[] = [];
  private scene: THREE.Scene;
  private triggeredSet = new Set<string>();
  private cooldown = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  loadHotspots(defs: HotspotDef[]): void {
    this.clear();
    this.cooldown = 1.0; // 1 second cooldown after level load
    for (const def of defs) {
      const hotspot = new Hotspot(def);
      this.hotspots.push(hotspot);
      this.scene.add(hotspot.mesh);
    }
  }

  update(dt: number, playerPos: THREE.Vector3): void {
    for (const hotspot of this.hotspots) {
      hotspot.update(dt);
    }
    if (this.cooldown > 0) {
      this.cooldown -= dt;
      return;
    }
    this.checkProximity(playerPos);
  }

  private checkProximity(playerPos: THREE.Vector3): void {
    for (const hotspot of this.hotspots) {
      if (hotspot.isInRange(playerPos) && !this.triggeredSet.has(hotspot.def.id)) {
        this.triggeredSet.add(hotspot.def.id);
        this.triggerHotspot(hotspot);
      } else if (!hotspot.isInRange(playerPos)) {
        this.triggeredSet.delete(hotspot.def.id);
      }
    }
  }

  private triggerHotspot(hotspot: Hotspot): void {
    const type = hotspot.def.type ?? HotspotType.Dialogue;

    switch (type) {
      case HotspotType.Teleport:
        if (hotspot.def.target) {
          eventBus.emit('teleport', hotspot.def.target);
        }
        break;
      case HotspotType.Dialogue:
      default:
        if (hotspot.def.dialogue) {
          eventBus.emit('hotspot:dialogue', hotspot.def.dialogue);
        }
        break;
    }
  }

  getHotspots(): Hotspot[] {
    return this.hotspots;
  }

  clear(): void {
    for (const h of this.hotspots) {
      this.scene.remove(h.mesh);
    }
    this.hotspots = [];
    this.triggeredSet.clear();
  }

  dispose(): void {
    this.clear();
  }
}
