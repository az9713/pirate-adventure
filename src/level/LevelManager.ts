import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import { assetLoader } from '../core/AssetLoader';
import { NavMesh } from '../navigation/NavMesh';
import { HotspotManager } from '../interaction/HotspotManager';
import { Background } from './Background';
import type { AudioManager } from '../audio/AudioManager';
import type { LevelData, DecorationDef } from '../types/LevelTypes';

export class LevelManager {
  private scene: THREE.Scene;
  private navMesh: NavMesh;
  private hotspotManager: HotspotManager;
  private background: Background;
  private audioManager: AudioManager;
  private currentLevel: LevelData | null = null;
  private levelGroup = new THREE.Group();

  constructor(
    scene: THREE.Scene,
    navMesh: NavMesh,
    hotspotManager: HotspotManager,
    background: Background,
    audioManager: AudioManager
  ) {
    this.scene = scene;
    this.navMesh = navMesh;
    this.hotspotManager = hotspotManager;
    this.background = background;
    this.audioManager = audioManager;

    this.levelGroup.name = 'levelGroup';
    this.scene.add(this.levelGroup);

    eventBus.on('teleport', this.onTeleport as (...args: unknown[]) => void);
  }

  async loadLevel(levelId: string, spawnId?: string): Promise<LevelData> {
    this.unloadCurrent();

    const resp = await fetch(`/assets/levels/${levelId}.json`);
    const data: LevelData = await resp.json();
    this.currentLevel = data;

    // Background
    this.background.apply(data.background);

    // Nav mesh
    const navMeshObj = this.navMesh.buildFromDef(data.navMesh);
    this.levelGroup.add(navMeshObj);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x336644,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.01;
    ground.name = 'ground';
    this.levelGroup.add(ground);

    // Hotspots
    this.hotspotManager.loadHotspots(data.hotspots);

    // Decorations (async, non-blocking)
    if (data.decorations) {
      this.loadDecorations(data.decorations);
    }

    // Music
    if (data.music) {
      this.audioManager.playMusic(data.music.src, data.music.volume, data.music.loop);
    }

    // Determine spawn point
    const spawn = spawnId && data.spawns[spawnId] ? data.spawns[spawnId] : data.spawn;
    eventBus.emit('level:loaded', data, spawn);

    return data;
  }

  private unloadCurrent(): void {
    while (this.levelGroup.children.length > 0) {
      const child = this.levelGroup.children[0];
      this.levelGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
    this.navMesh.dispose();
    this.hotspotManager.clear();
    this.background.clear();
    this.audioManager.stopMusic();
  }

  private loadDecorations(defs: DecorationDef[]): void {
    for (const def of defs) {
      assetLoader.loadGLTF(def.model).then((gltf) => {
        const model = gltf.scene.clone();
        model.position.set(def.position.x, def.position.y, def.position.z);
        model.scale.setScalar(def.scale ?? 1);
        model.rotation.y = def.rotationY ?? 0;
        model.name = `decoration_${def.id}`;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.levelGroup.add(model);
      }).catch((e) => {
        console.warn(`Failed to load decoration ${def.model}:`, e);
      });
    }
  }

  private onTeleport = (target: { levelId: string; spawnId: string }): void => {
    eventBus.emit('transition:start');
    setTimeout(async () => {
      await this.loadLevel(target.levelId, target.spawnId);
      eventBus.emit('transition:end');
    }, 500);
  };

  getCurrentLevel(): LevelData | null {
    return this.currentLevel;
  }

  getNavMesh(): NavMesh {
    return this.navMesh;
  }

  dispose(): void {
    this.unloadCurrent();
    eventBus.off('teleport', this.onTeleport as (...args: unknown[]) => void);
  }
}
