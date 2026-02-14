import * as THREE from 'three';
import { eventBus } from './EventBus';

const DRAG_THRESHOLD = 5;

export class InputManager {
  private canvas: HTMLCanvasElement;
  private pointerStart = new THREE.Vector2();
  private isDragging = false;
  private isDown = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
  }

  private toNDC(clientX: number, clientY: number): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return; // left click only for game input
    this.isDown = true;
    this.isDragging = false;
    this.pointerStart.set(e.clientX, e.clientY);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDown) return;
    const dx = e.clientX - this.pointerStart.x;
    const dy = e.clientY - this.pointerStart.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
      this.isDragging = true;
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isDown) return;
    this.isDown = false;
    if (!this.isDragging && e.button === 0) {
      const ndc = this.toNDC(e.clientX, e.clientY);
      eventBus.emit('click', ndc);
    }
    this.isDragging = false;
  };

  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
  }
}
