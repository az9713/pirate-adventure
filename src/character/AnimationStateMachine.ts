import * as THREE from 'three';

export class AnimationStateMachine {
  private mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private current: THREE.AnimationAction | null = null;
  private currentName = '';
  private fadeDuration = 0.25;

  constructor(mixer: THREE.AnimationMixer, clips: Map<string, THREE.AnimationClip>) {
    this.mixer = mixer;

    for (const [name, clip] of clips) {
      const action = mixer.clipAction(clip);
      this.actions.set(name, action);
    }
  }

  play(name: string, loop = true): void {
    if (name === this.currentName) return;

    const next = this.actions.get(name);
    if (!next) return;

    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    if (!loop) next.clampWhenFinished = true;

    if (this.current) {
      next.reset().setEffectiveWeight(1);
      this.current.crossFadeTo(next, this.fadeDuration, true);
      next.play();
    } else {
      next.reset().play();
    }

    this.current = next;
    this.currentName = name;
  }

  /** Pick animation based on movement speed */
  updateBySpeed(speed: number): void {
    if (speed < 0.1) {
      this.play('Idle');
    } else if (speed < 3.0) {
      this.play('Walk');
    } else {
      this.play('Run');
    }
  }

  update(dt: number): void {
    this.mixer.update(dt);
  }

  getCurrentName(): string {
    return this.currentName;
  }
}
