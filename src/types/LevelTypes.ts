import type { Vec3, HotspotType, ItemDef } from './GameTypes';

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
  givesItem?: ItemDef;
  requiresItem?: string;
  consumesItem?: string;
  alternateDialogue?: DialogueDef;
  oneShot?: boolean;
  victory?: boolean;
  model?: string;
  modelScale?: number;
  modelRotationY?: number;
}

export interface DecorationDef {
  id: string;
  model: string;
  position: Vec3;
  scale?: number;
  rotationY?: number;
}

export interface CollectibleDef {
  id: string;
  type: 'coin';
  position: Vec3;
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
  collectibles?: CollectibleDef[];
  decorations?: DecorationDef[];
  spawns: Record<string, Vec3>;
}
