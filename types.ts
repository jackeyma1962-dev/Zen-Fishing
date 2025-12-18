
export enum GameState {
  IDLE = 'IDLE',
  CASTING = 'CASTING',
  WAITING = 'WAITING',
  BITE = 'BITE',
  REELING = 'REELING',
  CAUGHT = 'CAUGHT',
  BROKEN = 'BROKEN',
  ESCAPED = 'ESCAPED',
  ANALYZING = 'ANALYZING'
}

export interface FishAnalysis {
  name: string;
  description: string;
  rarity: number; // 1 to 5
  cookingTip: string;
  price: number; // Value of the fish
}

export interface CatchLog {
  id: string;
  timestamp: number;
  data: FishAnalysis;
  imageSeed: number;
}

export interface FishEntity {
  x: number;
  y: number;
  speed: number;
  depth: number;
  direction: 1 | -1;
  id: number;
}

export interface UpgradeState {
  playerLevel: number; // Current player progress level (1-10)
  rodLevel: number; 
  baitLevel: number; 
  reelLevel: number; 
}

export interface ShopItem {
  id: string;
  type: 'rod' | 'bait' | 'reel';
  name: string;
  description: string;
  price: number;
  levelRequired: number;
}

export interface LevelGoal {
  targetFish: string;
  requiredToolLevel: number;
  rewardText: string;
}
