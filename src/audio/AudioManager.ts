import * as THREE from 'three';
import { assetUrl } from '../core/AssetLoader';

export class AudioManager {
  private listener: THREE.AudioListener;
  private musicAudio: THREE.Audio;
  private dialogueAudio: THREE.Audio;
  private audioLoader = new THREE.AudioLoader();
  private contextResumed = false;

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);

    this.musicAudio = new THREE.Audio(this.listener);
    this.dialogueAudio = new THREE.Audio(this.listener);

    // Resume audio context on first user interaction (autoplay policy)
    const resume = () => {
      if (!this.contextResumed) {
        this.listener.context.resume();
        this.contextResumed = true;
      }
    };
    document.addEventListener('pointerdown', resume, { once: false });
    document.addEventListener('keydown', resume, { once: false });
  }

  playMusic(src: string, volume = 0.3, loop = true): void {
    this.stopMusic();

    this.audioLoader.load(assetUrl(src), (buffer) => {
      this.musicAudio.setBuffer(buffer);
      this.musicAudio.setLoop(loop);
      this.musicAudio.setVolume(volume);
      this.musicAudio.play();
    });
  }

  stopMusic(): void {
    if (this.musicAudio.isPlaying) {
      this.musicAudio.stop();
    }
  }

  playDialogue(src: string, volume = 0.8): void {
    this.stopDialogue();

    this.audioLoader.load(assetUrl(src), (buffer) => {
      this.dialogueAudio.setBuffer(buffer);
      this.dialogueAudio.setLoop(false);
      this.dialogueAudio.setVolume(volume);
      this.dialogueAudio.play();
    });
  }

  stopDialogue(): void {
    if (this.dialogueAudio.isPlaying) {
      this.dialogueAudio.stop();
    }
  }

  setMusicVolume(volume: number): void {
    this.musicAudio.setVolume(volume);
  }

  dispose(): void {
    this.stopMusic();
    this.stopDialogue();
  }
}
