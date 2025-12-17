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
  imageSeed: number; // For reproducible random fish images
}

// Visual types for the canvas
export interface FishEntity {
  x: number;
  y: number;
  speed: number;
  depth: number;
  direction: 1 | -1;
  id: number;
}

// Upgrade Levels (0 is default)
export interface UpgradeState {
  rodLevel: number; // Increases Safe Zone Width
  baitLevel: number; // Increases Luck (Rarity chance)
  reelLevel: number; // Increases Reel Power (Catch speed)
}

export interface ShopItem {
  id: string;
  type: 'rod' | 'bait' | 'reel';
  name: string;
  description: string;
  price: number;
  levelRequired: number; // The level you get AFTER buying this (e.g., buying Level 1 requires current Level 0)
}