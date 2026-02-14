import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import { HotspotType } from '../types/GameTypes';
import type { HotspotDef } from '../types/LevelTypes';

export class HotspotEditor {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private hotspotDefs: HotspotDef[] = [];
  private markers: THREE.Mesh[] = [];
  private markerGroup = new THREE.Group();
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private active = false;
  private selectedIndex = -1;
  private dragIndex = -1;
  private nextId = 1;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.markerGroup.name = 'hotspotEditor';
    this.scene.add(this.markerGroup);

    eventBus.on('editor:addHotspot', this.onAddHotspot as (...args: unknown[]) => void);
    eventBus.on('editor:saveHotspot', this.onSaveHotspot as (...args: unknown[]) => void);
  }

  loadFromDefs(defs: HotspotDef[]): void {
    this.clear();
    this.hotspotDefs = defs.map((d) => ({ ...d }));
    this.nextId = defs.length + 1;
    this.rebuildMarkers();
  }

  setActive(active: boolean): void {
    this.active = active;
    this.markerGroup.visible = active;
  }

  private onAddHotspot = (): void => {
    if (!this.active) return;
    const id = `hotspot_${this.nextId++}`;
    const def: HotspotDef = {
      id,
      name: 'New Hotspot',
      type: HotspotType.Dialogue,
      position: { x: 0, y: 0, z: 0 },
      radius: 1.0,
      interactionRadius: 1.5,
      dialogue: {
        lines: [{ speaker: 'NPC', text: 'Hello!', audio: '', duration: 2.0 }],
      },
    };
    this.hotspotDefs.push(def);
    this.rebuildMarkers();
    this.selectedIndex = this.hotspotDefs.length - 1;
    eventBus.emit('editor:hotspotSelected', def);
  };

  private onSaveHotspot = (formData: Record<string, string>): void => {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.hotspotDefs.length) return;
    const def = this.hotspotDefs[this.selectedIndex];
    def.id = formData.id || def.id;
    def.name = formData.name || def.name;
    def.type = (formData.type as HotspotType) || HotspotType.Dialogue;
    if (formData.text && def.dialogue) {
      def.dialogue.lines[0].text = formData.text;
    }
    this.rebuildMarkers();
  };

  handlePointerDown(ndc: THREE.Vector2): boolean {
    if (!this.active) return false;

    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.markers);

    if (hits.length > 0) {
      this.dragIndex = this.markers.indexOf(hits[0].object as THREE.Mesh);
      this.selectedIndex = this.dragIndex;
      if (this.selectedIndex >= 0) {
        eventBus.emit('editor:hotspotSelected', this.hotspotDefs[this.selectedIndex]);
      }
      return true;
    }
    return false;
  }

  handlePointerMove(ndc: THREE.Vector2): boolean {
    if (!this.active || this.dragIndex === -1) return false;

    this.raycaster.setFromCamera(ndc, this.camera);
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, intersection);

    if (intersection && this.dragIndex < this.hotspotDefs.length) {
      this.hotspotDefs[this.dragIndex].position = {
        x: intersection.x,
        y: 0,
        z: intersection.z,
      };
      if (this.markers[this.dragIndex]) {
        this.markers[this.dragIndex].position.set(intersection.x, 0.5, intersection.z);
      }
    }
    return true;
  }

  handlePointerUp(): void {
    this.dragIndex = -1;
  }

  private rebuildMarkers(): void {
    while (this.markerGroup.children.length > 0) {
      const child = this.markerGroup.children[0];
      this.markerGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.markers = [];

    const geo = new THREE.ConeGeometry(0.25, 0.5, 8);
    for (let i = 0; i < this.hotspotDefs.length; i++) {
      const def = this.hotspotDefs[i];
      const isSelected = i === this.selectedIndex;
      const color = def.type === HotspotType.Teleport ? 0x4488ff : 0xffaa00;
      const mat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xff0000 : color,
      });
      const cone = new THREE.Mesh(geo.clone(), mat);
      cone.position.set(def.position.x, 0.5, def.position.z);
      this.markerGroup.add(cone);
      this.markers.push(cone);
    }
  }

  getHotspotDefs(): HotspotDef[] {
    return this.hotspotDefs.map((d) => ({ ...d }));
  }

  clear(): void {
    while (this.markerGroup.children.length > 0) {
      const child = this.markerGroup.children[0];
      this.markerGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }
    this.markers = [];
    this.hotspotDefs = [];
    this.selectedIndex = -1;
    this.dragIndex = -1;
  }

  dispose(): void {
    this.clear();
    this.scene.remove(this.markerGroup);
    eventBus.off('editor:addHotspot', this.onAddHotspot as (...args: unknown[]) => void);
    eventBus.off('editor:saveHotspot', this.onSaveHotspot as (...args: unknown[]) => void);
  }
}
