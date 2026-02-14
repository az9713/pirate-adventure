import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import type { NavMeshDef } from '../types/LevelTypes';

export class NavMeshEditor {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private vertices: THREE.Vector3[] = [];
  private faces: number[][] = [];
  private vertexMeshes: THREE.Mesh[] = [];
  private edgeLine: THREE.LineSegments | null = null;
  private wireframeMesh: THREE.Mesh | null = null;
  private active = false;
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private selectedVertices: number[] = [];
  private dragIndex = -1;
  private vertexGroup = new THREE.Group();

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.vertexGroup.name = 'navmeshEditor';
    this.scene.add(this.vertexGroup);

    eventBus.on('editor:addVertex', this.onAddVertex as (...args: unknown[]) => void);
    eventBus.on('editor:addFace', this.onAddFace as (...args: unknown[]) => void);
  }

  loadFromDef(def: NavMeshDef): void {
    this.clear();
    for (const v of def.vertices) {
      this.vertices.push(new THREE.Vector3(v[0], v[1], v[2]));
    }
    this.faces = def.faces.map((f) => [...f]);
    this.rebuildVisuals();
  }

  setActive(active: boolean): void {
    this.active = active;
    this.vertexGroup.visible = active;
    if (this.wireframeMesh) this.wireframeMesh.visible = active;
    if (this.edgeLine) this.edgeLine.visible = active;
  }

  private onAddVertex = (): void => {
    if (!this.active) return;
    // Add vertex at center
    this.vertices.push(new THREE.Vector3(0, 0, 0));
    this.rebuildVisuals();
    eventBus.emit('editor:navmeshChanged');
  };

  private onAddFace = (): void => {
    if (!this.active || this.selectedVertices.length < 3) return;
    const [a, b, c] = this.selectedVertices.slice(0, 3);
    this.faces.push([a, b, c]);
    this.selectedVertices = [];
    this.rebuildVisuals();
    eventBus.emit('editor:navmeshChanged');
  };

  handlePointerDown(ndc: THREE.Vector2): boolean {
    if (!this.active) return false;

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.vertexMeshes);

    if (hits.length > 0) {
      const idx = this.vertexMeshes.indexOf(hits[0].object as THREE.Mesh);
      if (idx !== -1) {
        this.dragIndex = idx;

        // Toggle selection for face building
        const selIdx = this.selectedVertices.indexOf(idx);
        if (selIdx !== -1) {
          this.selectedVertices.splice(selIdx, 1);
        } else {
          this.selectedVertices.push(idx);
        }
        this.updateVertexColors();
        return true;
      }
    }
    return false;
  }

  handlePointerMove(ndc: THREE.Vector2): boolean {
    if (!this.active || this.dragIndex === -1) return false;

    this.raycaster.setFromCamera(ndc, this.camera);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, intersection);

    if (intersection) {
      this.vertices[this.dragIndex].copy(intersection);
      this.rebuildVisuals();
    }
    return true;
  }

  handlePointerUp(): void {
    if (this.dragIndex !== -1) {
      this.dragIndex = -1;
      eventBus.emit('editor:navmeshChanged');
    }
  }

  private rebuildVisuals(): void {
    // Clear old vertex meshes
    while (this.vertexGroup.children.length > 0) {
      const child = this.vertexGroup.children[0];
      this.vertexGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.vertexMeshes = [];

    // Create vertex spheres
    const geo = new THREE.SphereGeometry(0.15, 8, 8);
    for (const v of this.vertices) {
      const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const sphere = new THREE.Mesh(geo.clone(), mat);
      sphere.position.copy(v);
      this.vertexGroup.add(sphere);
      this.vertexMeshes.push(sphere);
    }

    this.updateVertexColors();

    // Wireframe mesh
    if (this.wireframeMesh) {
      this.scene.remove(this.wireframeMesh);
      this.wireframeMesh.geometry.dispose();
      (this.wireframeMesh.material as THREE.Material).dispose();
    }

    if (this.faces.length > 0 && this.vertices.length >= 3) {
      const bufGeo = new THREE.BufferGeometry();
      const verts = new Float32Array(this.vertices.length * 3);
      this.vertices.forEach((v, i) => {
        verts[i * 3] = v.x;
        verts[i * 3 + 1] = v.y + 0.02;
        verts[i * 3 + 2] = v.z;
      });
      bufGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      const idx: number[] = [];
      for (const f of this.faces) idx.push(f[0], f[1], f[2]);
      bufGeo.setIndex(idx);

      const mat = new THREE.MeshBasicMaterial({
        color: 0x44ff88,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      this.wireframeMesh = new THREE.Mesh(bufGeo, mat);
      this.wireframeMesh.visible = this.active;
      this.scene.add(this.wireframeMesh);
    }
  }

  private updateVertexColors(): void {
    for (let i = 0; i < this.vertexMeshes.length; i++) {
      const mat = this.vertexMeshes[i].material as THREE.MeshBasicMaterial;
      mat.color.set(this.selectedVertices.includes(i) ? 0xff4444 : 0x00ff00);
    }
  }

  getNavMeshDef(): NavMeshDef {
    return {
      vertices: this.vertices.map((v) => [v.x, v.y, v.z]),
      faces: this.faces.map((f) => [...f]),
    };
  }

  clear(): void {
    this.vertices = [];
    this.faces = [];
    this.selectedVertices = [];
    this.dragIndex = -1;

    while (this.vertexGroup.children.length > 0) {
      const child = this.vertexGroup.children[0];
      this.vertexGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.vertexMeshes = [];

    if (this.wireframeMesh) {
      this.scene.remove(this.wireframeMesh);
      this.wireframeMesh.geometry.dispose();
      (this.wireframeMesh.material as THREE.Material).dispose();
      this.wireframeMesh = null;
    }
  }

  dispose(): void {
    this.clear();
    this.scene.remove(this.vertexGroup);
    eventBus.off('editor:addVertex', this.onAddVertex as (...args: unknown[]) => void);
    eventBus.off('editor:addFace', this.onAddFace as (...args: unknown[]) => void);
  }
}
