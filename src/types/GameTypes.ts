export enum GameState {
  Loading = 'loading',
  Playing = 'playing',
  Dialogue = 'dialogue',
  Editor = 'editor',
  Transitioning = 'transitioning',
}

export enum HotspotType {
  Dialogue = 'dialogue',
  Teleport = 'teleport',
  Item = 'item',
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}
