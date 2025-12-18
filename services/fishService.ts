
import { GoogleGenAI, Type } from "@google/genai";
import { FishAnalysis } from "../types";

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

interface BiomeData {
  name: string;
  prefixes: string[];
  types: string[];
  descriptions: string[];
}

const LEVEL_BIOMES: Record<number, BiomeData> = {
  1: {
    name: "淺水港灣",
    prefixes: ["普通", "小巧", "常見", "活潑"],
    types: ["鮪魚", "沙丁魚", "鯖魚", "鱈魚", "秋刀魚"],
    descriptions: ["近海海域最常見的生物。", "成群結隊游動，非常容易上鉤。"]
  },
  2: {
    name: "發光深淵",
    prefixes: ["發光的", "深海", "螢光", "電脈"],
    types: ["鱸魚", "烏賊", "燈泡魚", "電鰻", "水母"],
    descriptions: ["身體散發出幽幽藍光的奇異生物。", "棲息在光線無法抵達的斷崖邊。"]
  },
  3: {
    name: "遠洋巨獸區",
    prefixes: ["巨大的", "兇猛的", "遠洋", "霸主"],
    types: ["鯊魚", "旗魚", "曼波魚", "章魚", "虎鯨"],
    descriptions: ["具有強大掠食本能的深海王者。", "體型龐大，普通漁具難以抗衡。"]
  },
  4: {
    name: "古代遺蹟海域",
    prefixes: ["古代", "甲殼", "遺傳", "長壽"],
    types: ["鰻魚", "海龍", "鱟", "鸚鵡螺", "腔棘魚"],
    descriptions: ["活化石般的生命，見證了海洋的歷史。", "覆蓋著如岩石般堅硬的甲殼。"]
  },
  5: {
    name: "機械廢土港",
    prefixes: ["機械", "鋼鐵", "廢棄", "電鍍", "改裝"],
    types: ["水母", "螃蟹", "垃圾魚", "發電機", "機器魚"],
    descriptions: ["受工業廢料影響而產生的半機械生物。", "外殼閃爍著冰冷的金屬光澤。"]
  },
  6: {
    name: "極寒冰川層",
    prefixes: ["冰霜", "凍結", "透明", "極光"],
    types: ["螃蟹", "北極鱈", "冰魚", "雪蝦", "寒帶章魚"],
    descriptions: ["身體幾近透明，能在零度以下存活。", "看起來像冰雕一樣精緻。"]
  },
  7: {
    name: "彩虹珊瑚島",
    prefixes: ["彩虹", "絢麗", "熱帶", "斑斕"],
    types: ["錦鯉", "小丑魚", "蝴蝶魚", "隆頭魚", "鸚哥魚"],
    descriptions: ["擁有令人目眩神迷的色彩。", "在繽紛的珊瑚礁中穿梭。"]
  },
  8: {
    name: "幽靈迷霧海",
    prefixes: ["幽靈", "幻影", "霧氣", "透明", "無聲"],
    types: ["魟魚", "海龍", "靈體魚", "虛無水母"],
    descriptions: ["如同海霧般若隱若現，難以捉摸。", "傳說中只有在月全食才會出現。"]
  },
  9: {
    name: "熔岩火山口",
    prefixes: ["火焰", "熾熱", "熔岩", "黑曜石"],
    types: ["魷魚", "火龍魚", "紅岩蟹", "岩漿鰻"],
    descriptions: ["能在極端高溫中生存的強韌生物。", "體表溫度足以煮沸海水。"]
  },
  10: {
    name: "黃金夢境",
    prefixes: ["黃金", "神聖", "星辰", "至尊"],
    types: ["龍蝦", "金龍", "大師魚", "傳說龍魚"],
    descriptions: ["海洋中至高無上的存在。", "每一片鱗片都價值連城。"]
  }
};

const DEFAULT_BIOME: BiomeData = {
  name: "未知海域",
  prefixes: ["神秘", "稀有", "變異", "幻影"],
  types: ["生物", "幻影魚", "星辰魚", "虛空物"],
  descriptions: ["無法用常理解釋的奇特生物。"]
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

/**
 * 主要魚類生成邏輯：
 * 1. 根據 Level 決定海域與魚類名稱
 * 2. 使用 Gemini 生成詳細的詩意描述與料理建議
 */
export const generateFishDetails = async (
  seed: number, 
  luckLevel: number = 0, 
  targetFishName?: string,
  playerLevel: number = 1
): Promise<FishAnalysis> => {
  let localSeed = seed;
  const rng = () => seededRandom(localSeed++);
  
  // 任務邏輯
  const isTargetActive = !!targetFishName;
  const targetThreshold = isTargetActive ? 0.8 : 0.02; 
  const forceTarget = isTargetActive && Math.random() < targetThreshold;

  const rand = rng();
  const luckBonus = luckLevel * 0.03; 

  let rarity = 1;
  if (forceTarget) {
      rarity = rng() > 0.5 ? 4 : 3;
  } else {
      if (rand > (0.98 - luckBonus)) rarity = 5;
      else if (rand > (0.92 - luckBonus)) rarity = 4;
      else if (rand > (0.75 - luckBonus)) rarity = 3;
      else if (rand > (0.45 - luckBonus * 2)) rarity = 2;
  }

  const biome = LEVEL_BIOMES[playerLevel] || DEFAULT_BIOME;
  let baseName = "";
  let localDesc = "";

  if (forceTarget && targetFishName) {
      baseName = targetFishName;
      localDesc = `等級 ${playerLevel} 的核心任務目標。`;
  } else {
      const pIdx = Math.floor(rng() * biome.prefixes.length);
      const tIdx = Math.floor(rng() * biome.types.length);
      const dIdx = Math.floor(rng() * biome.descriptions.length);
      baseName = `${biome.prefixes[pIdx]}${biome.types[tIdx]}`;
      localDesc = biome.descriptions[dIdx];
      if (baseName === targetFishName) baseName = `異變的${baseName}`;
  }

  // --- AI 生成階段 ---
  try {
    const prompt = `你是一個資深的海洋學家與詩人。
    請為以下魚類生成資料：
    名稱：${baseName}
    稀有度：${rarity}/5
    海域環境：${biome.name} (等級 ${playerLevel})
    
    請提供：
    1. 一段極具詩意且符合海域特色的繁體中文生物描述。
    2. 一個獨具創意且誘人的料理建議。
    請以 JSON 格式輸出。`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            cookingTip: { type: Type.STRING },
          },
          required: ["description", "cookingTip"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    let basePrice = 10;
    switch (rarity) {
      case 1: basePrice = 10 + (playerLevel * 5) + Math.floor(rng() * 40); break;
      case 2: basePrice = 50 + (playerLevel * 20) + Math.floor(rng() * 100); break;
      case 3: basePrice = 150 + (playerLevel * 50) + Math.floor(rng() * 350); break;
      case 4: basePrice = 600 + (playerLevel * 200) + Math.floor(rng() * 1500); break;
      case 5: basePrice = 3000 + (playerLevel * 1000) + Math.floor(rng() * 5000); break;
    }

    return {
      name: baseName,
      description: result.description || localDesc,
      rarity,
      cookingTip: result.cookingTip || "建議簡單火烤，保留原始海味。",
      price: forceTarget ? Math.floor(basePrice * 1.8) : basePrice
    };

  } catch (error) {
    console.warn("AI Generation skipped or failed, using local data.");
    // 備援邏輯與原本一致
    return {
      name: baseName,
      description: localDesc,
      rarity,
      cookingTip: "適合清蒸，保留原始鮮甜。",
      price: 10 * rarity * playerLevel
    };
  }
};

export const getBiomeName = (level: number) => LEVEL_BIOMES[level]?.name || "未知海域";
