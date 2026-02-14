export interface AnimationClipDef {
  name: string;
  originalName: string;
  duration: number;
  loop: boolean;
}

export interface CharacterAnimationDef {
  file: string;
  clips: AnimationClipDef[];
}

export interface CharacterSkeletonDef {
  file: string;
  scale: number;
}

export interface CharacterDef {
  skeleton: CharacterSkeletonDef;
  animations: CharacterAnimationDef;
}

export interface AssetIndex {
  characters: Record<string, CharacterDef>;
}
