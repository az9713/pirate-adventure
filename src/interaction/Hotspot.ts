import * as THREE from 'three';
import type { HotspotDef } from '../types/LevelTypes';
import { HotspotType } from '../types/GameTypes';
import { assetLoader } from '../core/AssetLoader';

export class Hotspot {
  readonly def: HotspotDef;
  readonly mesh: THREE.Group;
  private glowMesh: THREE.Mesh;
  private iconMesh: THREE.Mesh | null = null;
  private loadedModel: THREE.Object3D | null = null;
  private time = 0;

  constructor(def: HotspotDef) {
    this.def = def;
    this.mesh = new THREE.Group();
    this.mesh.position.set(def.position.x, def.position.y, def.position.z);
    this.mesh.name = `hotspot_${def.id}`;

    // Glow indicator on ground
    const type = def.type ?? HotspotType.Dialogue;
    const color =
      type === HotspotType.Teleport ? 0x4488ff :
      type === HotspotType.Item ? 0x44ff88 :
      0xffaa00;

    const geo = new THREE.CylinderGeometry(def.radius * 0.3, def.radius * 0.3, 0.05, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });
    this.glowMesh = new THREE.Mesh(geo, mat);
    this.glowMesh.position.y = 0.03;
    this.mesh.add(this.glowMesh);

    // If a model is specified, load it; otherwise show fallback icon
    if (def.model) {
      this.loadModel(def.model, def.modelScale ?? 1, def.modelRotationY ?? 0);
    } else {
      this.createFallbackIcon(color);
    }
  }

  private createFallbackIcon(color: number): void {
    const iconGeo = new THREE.OctahedronGeometry(0.15);
    const iconMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
    });
    this.iconMesh = new THREE.Mesh(iconGeo, iconMat);
    this.iconMesh.position.y = 1.2;
    this.mesh.add(this.iconMesh);
  }

  private async loadModel(path: string, scale: number, rotY: number): Promise<void> {
    try {
      const gltf = await assetLoader.loadGLTF(path);
      this.loadedModel = gltf.scene.clone();
      this.loadedModel.scale.setScalar(scale);
      this.loadedModel.rotation.y = rotY;
      this.loadedModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      // Remove fallback icon if it exists
      if (this.iconMesh) {
        this.mesh.remove(this.iconMesh);
        this.iconMesh = null;
      }
      this.mesh.add(this.loadedModel);
    } catch (e) {
      console.warn(`Failed to load hotspot model ${path}, using fallback:`, e);
      if (!this.iconMesh) {
        const type = this.def.type ?? HotspotType.Dialogue;
        const color =
          type === HotspotType.Teleport ? 0x4488ff :
          type === HotspotType.Item ? 0x44ff88 :
          0xffaa00;
        this.createFallbackIcon(color);
      }
    }
  }

  update(dt: number): void {
    this.time += dt;
    // Pulse glow disc
    const scale = 1.0 + Math.sin(this.time * 2) * 0.15;
    this.glowMesh.scale.setScalar(scale);
    (this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(this.time * 3) * 0.2;

    // Animate fallback icon (float + rotate)
    if (this.iconMesh) {
      this.iconMesh.position.y = 1.2 + Math.sin(this.time * 1.5) * 0.1;
      this.iconMesh.rotation.y += dt * 1.5;
    }
  }

  isInRange(position: THREE.Vector3): boolean {
    const dx = position.x - this.def.position.x;
    const dz = position.z - this.def.position.z;
    return Math.sqrt(dx * dx + dz * dz) <= this.def.interactionRadius;
  }
}
