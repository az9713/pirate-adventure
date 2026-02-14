import * as THREE from 'three';
import type { HotspotDef } from '../types/LevelTypes';
import { HotspotType } from '../types/GameTypes';

export class Hotspot {
  readonly def: HotspotDef;
  readonly mesh: THREE.Group;
  private glowMesh: THREE.Mesh;
  private time = 0;

  constructor(def: HotspotDef) {
    this.def = def;
    this.mesh = new THREE.Group();
    this.mesh.position.set(def.position.x, def.position.y, def.position.z);
    this.mesh.name = `hotspot_${def.id}`;

    // Glow indicator
    const type = def.type ?? HotspotType.Dialogue;
    const color = type === HotspotType.Teleport ? 0x4488ff : 0xffaa00;

    const geo = new THREE.CylinderGeometry(def.radius * 0.3, def.radius * 0.3, 0.05, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.5,
    });
    this.glowMesh = new THREE.Mesh(geo, mat);
    this.glowMesh.position.y = 0.03;
    this.mesh.add(this.glowMesh);

    // Floating icon
    const iconGeo = new THREE.OctahedronGeometry(0.15);
    const iconMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
    });
    const icon = new THREE.Mesh(iconGeo, iconMat);
    icon.position.y = 1.2;
    this.mesh.add(icon);
  }

  update(dt: number): void {
    this.time += dt;
    // Pulse glow
    const scale = 1.0 + Math.sin(this.time * 2) * 0.15;
    this.glowMesh.scale.setScalar(scale);
    (this.glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.sin(this.time * 3) * 0.2;

    // Float the icon
    const icon = this.mesh.children[1];
    if (icon) {
      icon.position.y = 1.2 + Math.sin(this.time * 1.5) * 0.1;
      icon.rotation.y += dt * 1.5;
    }
  }

  isInRange(position: THREE.Vector3): boolean {
    const dx = position.x - this.def.position.x;
    const dz = position.z - this.def.position.z;
    return Math.sqrt(dx * dx + dz * dz) <= this.def.interactionRadius;
  }
}
