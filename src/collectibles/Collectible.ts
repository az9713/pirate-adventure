import * as THREE from 'three';
import type { CollectibleDef } from '../types/LevelTypes';

export class Collectible {
  readonly def: CollectibleDef;
  readonly mesh: THREE.Group;
  private time = 0;
  private collected = false;
  private scaleAnim = 1;

  constructor(def: CollectibleDef) {
    this.def = def;
    this.mesh = new THREE.Group();
    this.mesh.position.set(def.position.x, def.position.y, def.position.z);
    this.mesh.name = `coin_${def.id}`;

    // Gold octahedron coin
    const geo = new THREE.OctahedronGeometry(0.18);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffa500,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    const coin = new THREE.Mesh(geo, mat);
    coin.position.y = 1.0;
    this.mesh.add(coin);

    // Glow disc on ground
    const discGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.3,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = 0.02;
    this.mesh.add(disc);
  }

  update(dt: number): void {
    if (this.collected) {
      this.scaleAnim -= dt * 4;
      if (this.scaleAnim <= 0) {
        this.scaleAnim = 0;
        this.mesh.visible = false;
      }
      this.mesh.scale.setScalar(this.scaleAnim);
      return;
    }

    this.time += dt;
    const coin = this.mesh.children[0];
    if (coin) {
      coin.position.y = 1.0 + Math.sin(this.time * 2) * 0.1;
      coin.rotation.y += dt * 2;
    }
    // Pulse glow disc
    const disc = this.mesh.children[1];
    if (disc) {
      const s = 1.0 + Math.sin(this.time * 3) * 0.15;
      disc.scale.setScalar(s);
      ((disc as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(this.time * 2) * 0.1;
    }
    // Pulse emissive
    const mat = (this.mesh.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.3 + Math.sin(this.time * 2.5) * 0.2;
  }

  isInRange(position: THREE.Vector3): boolean {
    if (this.collected) return false;
    const dx = position.x - this.def.position.x;
    const dz = position.z - this.def.position.z;
    return Math.sqrt(dx * dx + dz * dz) <= 1.2;
  }

  collect(): void {
    this.collected = true;
  }

  isCollected(): boolean {
    return this.collected;
  }
}
