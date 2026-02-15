import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { AssetIndex } from '../types/AssetTypes';

const BASE = import.meta.env.BASE_URL;

export function assetUrl(path: string): string {
  return `${BASE}assets/${path}`;
}

export class AssetLoader {
  private gltfLoader = new GLTFLoader();
  private cache = new Map<string, GLTF>();
  private index: AssetIndex | null = null;

  async loadIndex(): Promise<AssetIndex> {
    if (this.index) return this.index;
    const resp = await fetch(assetUrl('index.json'));
    this.index = (await resp.json()) as AssetIndex;
    return this.index;
  }

  async loadGLTF(path: string): Promise<GLTF> {
    if (this.cache.has(path)) return this.cache.get(path)!;

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        assetUrl(path),
        (gltf) => {
          this.cache.set(path, gltf);
          resolve(gltf);
        },
        undefined,
        reject
      );
    });
  }

  async loadTexture(path: string): Promise<THREE.Texture> {
    return new THREE.TextureLoader().loadAsync(assetUrl(path));
  }

  getIndex(): AssetIndex | null {
    return this.index;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const assetLoader = new AssetLoader();
