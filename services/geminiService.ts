
import { GoogleGenAI, Type } from "@google/genai";
import { FishAnalysis } from "../types";

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

/**
 * Generates fish details.
 * Probability logic:
 * - If targetFishName is active (mission not complete), 50% chance to force encounter.
 * - Random rolls specifically avoid the names of the "Deep Sea Tuna" etc to prevent confusion.
 */
const generateFishDetails = async (seed: number, luckLevel: number = 0, targetFishName?: string): Promise<FishAnalysis> => {
  let localSeed = seed;
  const rng = () => seededRandom(localSeed++);
  
  // Use pure Math.random() for encounter decision. 
  // Bumped to 50% for mission targets to feel more direct.
  const encounterRoll = Math.random();
  const isTargetEncounter = targetFishName && encounterRoll < 0.50;

  const rand = rng();
  const luckBonus = luckLevel * 0.03; 

  let rarity = 1;
  if (isTargetEncounter) {
      // Mission targets are high value (Rare 3 to Epic 4)
      rarity = rng() > 0.6 ? 4 : 3;
  } else {
      if (rand > (0.99 - luckBonus)) rarity = 5;
      else if (rand > (0.95 - luckBonus)) rarity = 4;
      else if (rand > (0.80 - luckBonus)) rarity = 3;
      else if (rand > (0.50 - luckBonus * 2)) rarity = 2;
  }

  let basePrice = 10;
  switch (rarity) {
    case 1: basePrice = 15 + Math.floor(rng() * 40); break;
    case 2: basePrice = 60 + Math.floor(rng() * 100); break;
    case 3: basePrice = 180 + Math.floor(rng() * 350); break;
    case 4: basePrice = 600 + Math.floor(rng() * 1500); break;
    case 5: basePrice = 2500 + Math.floor(rng() * 4000); break;
  }

  try {
    // Enhanced system logic: If random roll, EXPLICITLY forbid mission names.
    const prompt = isTargetEncounter 
      ? `Generate details for a fish named EXACTLY "${targetFishName}". This is the current mission goal. Provide a poetic Traditional Chinese description and a creative cooking tip. Rarity: ${rarity}/5.`
      : `Generate a random creative fish. Rarity: ${rarity}/5. 
         IMPORTANT: DO NOT name it "深海鮪魚", "發光的鱸魚", or any other generic mission fish. 
         Provide a unique name, poetic description, and cooking tip in Traditional Chinese.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            cookingTip: { type: Type.STRING },
          },
          required: ["name", "description", "cookingTip"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      // Force name if it's a mission target encounter
      name: isTargetEncounter ? targetFishName : (result.name || "神祕生物"),
      description: result.description || "這是一條深不可測的神祕生物...",
      rarity,
      cookingTip: result.cookingTip || "建議簡單火烤。",
      price: isTargetEncounter ? Math.floor(basePrice * 1.5) : basePrice
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      name: isTargetEncounter ? targetFishName : "神祕深海魚",
      description: "在波濤洶湧中難得一見的奇異生命。",
      rarity,
      cookingTip: "適合清蒸。",
      price: basePrice
    };
  }
};

export { generateFishDetails };
