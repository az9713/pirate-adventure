import * as THREE from 'three';
import { Pathfinding } from 'three-pathfinding';
import type { NavMeshDef } from '../types/LevelTypes';

const ZONE_NAME = 'level';

export class NavMesh {
  private pathfinding = new Pathfinding();
  private mesh: THREE.Mesh | null = null;
  private geometry: THREE.BufferGeometry | null = null;

  buildFromDef(def: NavMeshDef): THREE.Mesh {
    this.dispose();

    const verts: number[] = [];
    for (const v of def.vertices) {
      verts.push(v[0], v[1], v[2]);
    }

    const indices: number[] = [];
    for (const f of def.faces) {
      indices.push(f[0], f[1], f[2]);
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    this.geometry.setIndex(indices);
    this.geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x4a7a4a,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'navmesh';

    const zone = Pathfinding.createZone(this.geometry);
    this.pathfinding.setZoneData(ZONE_NAME, zone);

    return this.mesh;
  }

  findPath(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] | null {
    const groupId = this.pathfinding.getGroup(ZONE_NAME, from);
    const closest = this.pathfinding.getClosestNode(from, ZONE_NAME, groupId);
    if (!closest) return null;

    const path = this.pathfinding.findPath(from, to, ZONE_NAME, groupId);
    return path ?? null;
  }

  getMesh(): THREE.Mesh | null {
    return this.mesh;
  }

  getGeometry(): THREE.BufferGeometry | null {
    return this.geometry;
  }

  dispose(): void {
    this.geometry?.dispose();
    this.geometry = null;
    this.mesh = null;
  }
}
