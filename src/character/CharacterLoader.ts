import * as THREE from 'three';
import { assetLoader } from '../core/AssetLoader';
import type { CharacterDef } from '../types/AssetTypes';

export interface LoadedCharacter {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: Map<string, THREE.AnimationClip>;
}

export class CharacterLoader {
  async load(def: CharacterDef): Promise<LoadedCharacter> {
    const skelGltf = await assetLoader.loadGLTF(def.skeleton.file);
    const model = skelGltf.scene;
    model.scale.setScalar(def.skeleton.scale);

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const mixer = new THREE.AnimationMixer(model);
    const clips = new Map<string, THREE.AnimationClip>();

    // Gather clips from skeleton file first
    for (const clip of skelGltf.animations) {
      clips.set(clip.name, clip);
    }

    // If animations are in a separate file, load those too
    if (def.animations.file && def.animations.file !== def.skeleton.file) {
      const animGltf = await assetLoader.loadGLTF(def.animations.file);
      for (const clip of animGltf.animations) {
        clips.set(clip.name, clip);
      }
    }

    // Map clip names from index.json definitions
    for (const clipDef of def.animations.clips) {
      const existing = clips.get(clipDef.originalName);
      if (existing && clipDef.name !== clipDef.originalName) {
        clips.set(clipDef.name, existing);
      }
    }

    return { model, mixer, clips };
  }
}
