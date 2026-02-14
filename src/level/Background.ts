import * as THREE from 'three';
import type { BackgroundDef } from '../types/LevelTypes';

export class Background {
  private scene: THREE.Scene;
  private mesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  apply(def: BackgroundDef): void {
    this.clear();

    switch (def.type) {
      case 'color':
        this.scene.background = new THREE.Color(def.color ?? '#1a1a2e');
        break;
      case 'image':
        if (def.src) {
          new THREE.TextureLoader().load(`/assets/${def.src}`, (tex) => {
            this.scene.background = tex;
          });
        }
        break;
      case 'video':
        if (def.src) {
          const video = document.createElement('video');
          video.src = `/assets/${def.src}`;
          video.loop = true;
          video.muted = true;
          video.play();
          const tex = new THREE.VideoTexture(video);
          this.scene.background = tex;
        }
        break;
    }
  }

  clear(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
    this.scene.background = null;
  }
}
