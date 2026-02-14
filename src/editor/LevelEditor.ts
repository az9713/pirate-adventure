import * as THREE from 'three';
import { eventBus } from '../core/EventBus';
import { NavMeshEditor } from '../navigation/NavMeshEditor';
import { HotspotEditor } from '../interaction/HotspotEditor';
import type { LevelData } from '../types/LevelTypes';

export class LevelEditor {
  private navMeshEditor: NavMeshEditor;
  private hotspotEditor: HotspotEditor;
  private active = false;
  private canvas: HTMLCanvasElement;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLCanvasElement
  ) {
    this.canvas = canvas;
    this.navMeshEditor = new NavMeshEditor(scene, camera);
    this.hotspotEditor = new HotspotEditor(scene, camera);

    eventBus.on('editor:toggle', this.onToggle as (...args: unknown[]) => void);
    eventBus.on('editor:toggleNavMesh', this.onToggleNavMesh.bind(this));
    eventBus.on('editor:toggleHotspots', this.onToggleHotspots.bind(this));
    eventBus.on('editor:export', this.onExport.bind(this));

    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
  }

  loadLevel(data: LevelData): void {
    this.navMeshEditor.loadFromDef(data.navMesh);
    this.hotspotEditor.loadFromDefs(data.hotspots);
    this.navMeshEditor.setActive(false);
    this.hotspotEditor.setActive(false);
  }

  private onToggle = (active: boolean): void => {
    this.active = active;
    this.navMeshVisible = active;
    this.hotspotsVisible = active;
    this.navMeshEditor.setActive(active);
    this.hotspotEditor.setActive(active);
  };

  private navMeshVisible = true;
  private hotspotsVisible = true;

  private onToggleNavMesh(): void {
    this.navMeshVisible = !this.navMeshVisible;
    this.navMeshEditor.setActive(this.navMeshVisible);
  }

  private onToggleHotspots(): void {
    this.hotspotsVisible = !this.hotspotsVisible;
    this.hotspotEditor.setActive(this.hotspotsVisible);
  }

  private toNDC(e: PointerEvent): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (!this.active || e.button !== 0) return;
    const ndc = this.toNDC(e);
    if (this.hotspotEditor.handlePointerDown(ndc)) return;
    this.navMeshEditor.handlePointerDown(ndc);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.active) return;
    const ndc = this.toNDC(e);
    if (this.hotspotEditor.handlePointerMove(ndc)) return;
    this.navMeshEditor.handlePointerMove(ndc);
  };

  private onPointerUp = (): void => {
    if (!this.active) return;
    this.hotspotEditor.handlePointerUp();
    this.navMeshEditor.handlePointerUp();
  };

  private onExport(): void {
    const navMeshDef = this.navMeshEditor.getNavMeshDef();
    const hotspotDefs = this.hotspotEditor.getHotspotDefs();

    const levelData: LevelData = {
      id: 'exported_level',
      name: 'Exported Level',
      background: { type: 'color', color: '#1a3a5c' },
      spawn: { x: 0, y: 0, z: 2 },
      navMesh: navMeshDef,
      hotspots: hotspotDefs,
      spawns: { default: { x: 0, y: 0, z: 2 } },
    };

    const json = JSON.stringify(levelData, null, 2);

    navigator.clipboard.writeText(json).then(() => {
      console.log('Level JSON copied to clipboard');
    });

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'level_export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  isActive(): boolean {
    return this.active;
  }

  dispose(): void {
    this.navMeshEditor.dispose();
    this.hotspotEditor.dispose();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    eventBus.off('editor:toggle', this.onToggle as (...args: unknown[]) => void);
  }
}
