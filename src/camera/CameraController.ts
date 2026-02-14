import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
  readonly controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.controls = new OrbitControls(camera, domElement);

    // Right click = rotate, middle = zoom, left = game input (not OrbitControls)
    this.controls.mouseButtons = {
      LEFT: null as any,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };

    // Damping
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;

    // Zoom limits
    this.controls.minDistance = 3;
    this.controls.maxDistance = 30;

    // Angle limits - prevent going below ground
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.minPolarAngle = 0.2;

    // Target
    this.controls.target.set(0, 1, 0);

    this.controls.update();
  }

  update(): void {
    this.controls.update();
  }

  setTarget(x: number, y: number, z: number): void {
    this.controls.target.set(x, y, z);
  }

  dispose(): void {
    this.controls.dispose();
  }
}
