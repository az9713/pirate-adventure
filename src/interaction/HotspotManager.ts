import * as THREE from 'three';
import { Hotspot } from './Hotspot';
import { eventBus } from '../core/EventBus';
import { HotspotType } from '../types/GameTypes';
import { inventory } from '../inventory/Inventory';
import type { HotspotDef } from '../types/LevelTypes';

interface PendingAction {
  hotspot: Hotspot;
  usedAlternate: boolean;
}

export class HotspotManager {
  private hotspots: Hotspot[] = [];
  private scene: THREE.Scene;
  private triggeredSet = new Set<string>();
  private cooldown = 0;
  private removedIds = new Set<string>();
  private pendingAction: PendingAction | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    eventBus.on('dialogue:end', this.onDialogueEnd);
  }

  loadHotspots(defs: HotspotDef[]): void {
    this.clear();
    this.cooldown = 1.0;
    for (const def of defs) {
      if (this.removedIds.has(def.id)) continue;
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
    const def = hotspot.def;
    const type = def.type ?? HotspotType.Dialogue;

    switch (type) {
      case HotspotType.Teleport:
        if (def.target) {
          eventBus.emit('teleport', def.target);
        }
        break;

      case HotspotType.Item:
      case HotspotType.Dialogue:
      default: {
        const useAlternate = !!(def.requiresItem && inventory.hasItem(def.requiresItem) && def.alternateDialogue);
        const dialogue = useAlternate ? def.alternateDialogue! : def.dialogue;

        if (dialogue) {
          this.pendingAction = { hotspot, usedAlternate: useAlternate };
          eventBus.emit('hotspot:dialogue', dialogue);
        }
        break;
      }
    }
  }

  private onDialogueEnd = (): void => {
    if (!this.pendingAction) return;
    const { hotspot, usedAlternate } = this.pendingAction;
    const def = hotspot.def;
    this.pendingAction = null;

    if (usedAlternate) {
      if (def.consumesItem) {
        inventory.removeItem(def.consumesItem);
      }
      if (def.givesItem) {
        inventory.addItem(def.givesItem);
      }
      if (def.victory) {
        eventBus.emit('game:victory');
      }
    } else if (def.type === HotspotType.Item && def.givesItem && !def.requiresItem) {
      // Item pickup without requirement (barrel with rum)
      inventory.addItem(def.givesItem);
    }

    if (def.oneShot) {
      this.removeHotspot(hotspot);
    }
  };

  private removeHotspot(hotspot: Hotspot): void {
    this.removedIds.add(hotspot.def.id);
    this.scene.remove(hotspot.mesh);
    this.hotspots = this.hotspots.filter((h) => h !== hotspot);
    this.triggeredSet.delete(hotspot.def.id);
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
    eventBus.off('dialogue:end', this.onDialogueEnd);
  }
}
