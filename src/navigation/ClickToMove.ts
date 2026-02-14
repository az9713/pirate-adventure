import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import type { NavMesh } from './NavMesh';
import type { CharacterController } from '../character/CharacterController';

export class ClickToMove {
  private raycaster = new THREE.Raycaster();
  private camera: THREE.PerspectiveCamera;
  private navMesh: NavMesh;
  private character: CharacterController;
  private enabled = true;
  private clickMarker: THREE.Mesh;

  constructor(
    camera: THREE.PerspectiveCamera,
    navMesh: NavMesh,
    character: CharacterController,
    scene: THREE.Scene
  ) {
    this.camera = camera;
    this.navMesh = navMesh;
    this.character = character;

    // Click destination marker
    const markerGeo = new THREE.RingGeometry(0.15, 0.3, 16);
    markerGeo.rotateX(-Math.PI / 2);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    this.clickMarker = new THREE.Mesh(markerGeo, markerMat);
    this.clickMarker.visible = false;
    scene.add(this.clickMarker);

    eventBus.on('click', this.onClick as (...args: unknown[]) => void);
  }

  private onClick = (ndc: THREE.Vector2): void => {
    if (!this.enabled) {
      // disabled
      return;
    }

    const navMesh = this.navMesh.getMesh();
    if (!navMesh) {
      // no navmesh
      return;
    }

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(navMesh);
    if (hits.length === 0) return;

    const target = hits[0].point;
    const start = this.character.getPosition();
    const path = this.navMesh.findPath(start, target);

    if (path && path.length > 0) {
      this.character.setPath(path);
      this.clickMarker.position.copy(target);
      this.clickMarker.position.y += 0.05;
      this.clickMarker.visible = true;

      // Fade out marker
      setTimeout(() => {
        this.clickMarker.visible = false;
      }, 1500);
    }
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  dispose(): void {
    eventBus.off('click', this.onClick as (...args: unknown[]) => void);
  }
}
