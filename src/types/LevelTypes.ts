import type { Vec3, HotspotType } from './GameTypes';

export interface BackgroundDef {
  type: 'color' | 'image' | 'video';
  color?: string;
  src?: string;
}

export interface MusicDef {
  src: string;
  volume: number;
  loop: boolean;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  audio: string;
  duration: number;
}

export interface DialogueDef {
  lines: DialogueLine[];
}

export interface TeleportTarget {
  levelId: string;
  spawnId: string;
}

export interface HotspotDef {
  id: string;
  name?: string;
  type?: HotspotType;
  position: Vec3;
  radius: number;
  interactionRadius: number;
  dialogue?: DialogueDef;
  target?: TeleportTarget;
}

export interface NavMeshDef {
  vertices: number[][];
  faces: number[][];
}

export interface LevelData {
  id: string;
  name: string;
  background: BackgroundDef;
  music?: MusicDef;
  spawn: Vec3;
  navMesh: NavMeshDef;
  hotspots: HotspotDef[];
  spawns: Record<string, Vec3>;
}
