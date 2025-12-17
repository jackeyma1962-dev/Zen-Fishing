import { FishAnalysis } from "../types";

// Local data for procedural generation
const FISH_PREFIXES = [
  "深海", "發光的", "巨大的", "古代", "機械", 
  "透明的", "彩虹", "幽靈", "火焰", "冰霜", 
  "黃金", "劇毒", "神秘", "飛天", "水晶"
];

const FISH_TYPES = [
  "鮪魚", "鱸魚", "鯊魚", "鰻魚", "水母", 
  "螃蟹", "錦鯉", "魟魚", "魷魚", "比目魚", 
  "鮭魚", "石斑", "小丑魚", "龍蝦", "海馬"
];

const DESCRIPTIONS = [
  "這是一種罕見的生物，通常棲息在深海區域，很難被捕捉到。",
  "牠的鱗片閃爍著奇異的光芒，似乎具有某種未知的魔力。",
  "科學家對這種魚的生理結構感到困惑，牠似乎不屬於這個時代。",
  "這種魚游動速度極快，肉質非常緊實，是市場上的搶手貨。",
  "傳說中看見這種魚會帶來好運，是漁夫們夢寐以求的漁獲。",
  "外表看起來很危險，但其實性格非常溫馴。",
  "身上帶有奇特的斑紋，像是某種古老的文字。",
  "這種生物在夜晚會發出微弱的螢光，用來吸引獵物。",
  "牠的鰭像翅膀一樣張開，彷彿隨時準備起飛。",
  "體內含有特殊的礦物質，讓牠的身體呈現半透明狀。"
];

const COOKING_TIPS = [
  "建議清蒸，保留最原始的鮮甜口感。",
  "肉質較硬，適合燉湯或紅燒，風味獨特。",
  "含有微量特殊成分，處理時需小心，但風味絕佳。",
  "適合做成生魚片，油脂豐富，入口即化。",
  "最好不要食用，當作觀賞魚更有價值。",
  "加點薑絲和蔥花，味道會提升一個檔次。",
  "炭烤後撒上海鹽，是下酒菜的絕佳選擇。",
  "肉質帶有淡淡的果香，非常適合做成涼拌菜。",
  "建議油炸，酥脆的口感讓人欲罷不能。"
];

// Pseudo-random number generator based on seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateFishDetails = async (seed: number, luckLevel: number = 0): Promise<FishAnalysis> => {
  // Simulate network delay for "analyzing" effect
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

  // Use the seed to generate consistent results for the same fish
  // We use a mutable variable for the seed inside this scope to get a sequence
  let localSeed = seed;
  const rng = () => seededRandom(localSeed++);
  
  // 1. Calculate Rarity (Weighted with Luck)
  // Base: 50% Common (1), 30% Uncommon (2), 15% Rare (3), 4% Epic (4), 1% Legendary (5)
  // Luck Level 1 adds +5% to top tier chances logic
  const rand = rng();
  
  // Luck bonus simply shifts the threshold down, making high tiers easier to hit
  // luckLevel 0: 0, Level 1: 0.05, Level 2: 0.10, etc.
  const luckBonus = luckLevel * 0.03; 

  let rarity = 1;
  
  // thresholds must be adjusted carefully
  if (rand > (0.99 - luckBonus)) rarity = 5;
  else if (rand > (0.95 - luckBonus)) rarity = 4;
  else if (rand > (0.80 - luckBonus)) rarity = 3;
  else if (rand > (0.50 - luckBonus * 2)) rarity = 2; // Common gets squeezed

  // 2. Select Name Components
  const prefixIndex = Math.floor(rng() * FISH_PREFIXES.length);
  const typeIndex = Math.floor(rng() * FISH_TYPES.length);
  const name = `${FISH_PREFIXES[prefixIndex]}${FISH_TYPES[typeIndex]}`;

  // 3. Select Description and Cooking Tip
  const descIndex = Math.floor(rng() * DESCRIPTIONS.length);
  const tipIndex = Math.floor(rng() * COOKING_TIPS.length);

  // 4. Calculate Price based on Rarity + Variance
  // Base prices: 1: 10-50, 2: 50-150, 3: 150-500, 4: 500-2000, 5: 2000-5000
  let basePrice = 10;
  switch (rarity) {
    case 1: basePrice = 10 + Math.floor(rng() * 40); break;
    case 2: basePrice = 50 + Math.floor(rng() * 100); break;
    case 3: basePrice = 150 + Math.floor(rng() * 350); break;
    case 4: basePrice = 500 + Math.floor(rng() * 1500); break;
    case 5: basePrice = 2000 + Math.floor(rng() * 3000); break;
  }
  
  return {
    name,
    description: DESCRIPTIONS[descIndex],
    rarity,
    cookingTip: COOKING_TIPS[tipIndex],
    price: basePrice
  };
};

export { generateFishDetails };