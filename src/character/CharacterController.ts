import * as THREE from 'three';
import { AnimationStateMachine } from './AnimationStateMachine';
import { eventBus } from '../core/EventBus';

const MOVE_SPEED = 3.5;
const ROTATION_SPEED = 10;

export class CharacterController {
  private model: THREE.Group;
  private animSM: AnimationStateMachine;
  private waypoints: THREE.Vector3[] = [];
  private currentWaypoint = 0;
  private speed = 0;

  constructor(model: THREE.Group, animSM: AnimationStateMachine) {
    this.model = model;
    this.animSM = animSM;
  }

  setPath(waypoints: THREE.Vector3[]): void {
    this.waypoints = waypoints;
    this.currentWaypoint = 0;
  }

  stop(): void {
    this.waypoints = [];
    this.currentWaypoint = 0;
    this.speed = 0;
  }

  isMoving(): boolean {
    return this.currentWaypoint < this.waypoints.length;
  }

  update(dt: number): void {
    if (this.currentWaypoint >= this.waypoints.length) {
      this.speed = 0;
      this.animSM.updateBySpeed(0);
      this.animSM.update(dt);
      return;
    }

    const target = this.waypoints[this.currentWaypoint];
    const pos = this.model.position;
    const dir = new THREE.Vector3().subVectors(target, pos);
    dir.y = 0;
    const dist = dir.length();

    if (dist < 0.15) {
      this.currentWaypoint++;
      if (this.currentWaypoint >= this.waypoints.length) {
        this.speed = 0;
        eventBus.emit('character:arrived', pos.clone());
      }
    } else {
      dir.normalize();
      const step = Math.min(MOVE_SPEED * dt, dist);
      pos.addScaledVector(dir, step);
      this.speed = MOVE_SPEED;

      // Smooth rotation toward movement direction
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        dir
      );
      this.model.quaternion.slerp(targetQuat, Math.min(1, ROTATION_SPEED * dt));
    }

    this.animSM.updateBySpeed(this.speed);
    this.animSM.update(dt);
  }

  getPosition(): THREE.Vector3 {
    return this.model.position.clone();
  }

  setPosition(x: number, y: number, z: number): void {
    this.model.position.set(x, y, z);
  }
}
