import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionPlan, PlayerStats, DailyQuest, Item, StoryLogEntry } from "../types";
import { NPC_ROSTER } from "../constants";

// Helper to get the AI client dynamically
// This prioritizes a key saved in LocalStorage (User provided), falls back to Environment (Dev provided)
const getAI = (): GoogleGenAI | null => {
    const userKey = typeof window !== 'undefined' ? localStorage.getItem('leveling_api_key') : null;
    const apiKey = userKey || process.env.API_KEY;

    if (!apiKey) {
        console.warn("Gemini API Key missing");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

const nutritionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    breakfast: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "calories", "protein", "carbs", "fats", "description"],
    },
    lunch: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "calories", "protein", "carbs", "fats", "description"],
    },
    dinner: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "calories", "protein", "carbs", "fats", "description"],
    },
    snack: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        description: { type: Type.STRING },
      },
      required: ["name", "calories", "protein", "carbs", "fats", "description"],
    },
    totalCalories: { type: Type.NUMBER },
  },
  required: ["breakfast", "lunch", "dinner", "snack", "totalCalories"],
};

const snackItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        description: { type: Type.STRING } // Reasoning based on goal
    },
    required: ["name", "calories", "protein", "description"],
};

const questSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ['E', 'D', 'C', 'B', 'A', 'S'] },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            target: { type: Type.NUMBER },
            current: { type: Type.NUMBER },
            unit: { type: Type.STRING }
        },
        required: ["id", "name", "target", "current", "unit"],
      }
    },
    timeLeft: { type: Type.STRING },
    status: { type: Type.STRING }
  },
  required: ["title", "description", "difficulty", "tasks", "timeLeft", "status"],
};

const foodItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        calories: { type: Type.NUMBER },
        protein: { type: Type.STRING },
        carbs: { type: Type.STRING },
        fats: { type: Type.STRING },
        description: { type: Type.STRING }
    },
    required: ["name", "calories", "protein", "carbs", "fats", "description"],
};

const equipmentSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        rarity: { type: Type.STRING, enum: ['E', 'D', 'C', 'B', 'A', 'S'] },
        type: { type: Type.STRING, enum: ['equipment'] },
        slot: { type: Type.STRING, enum: ['weapon', 'armor', 'accessory'] },
        bonusStats: {
            type: Type.OBJECT,
            properties: {
                strength: { type: Type.NUMBER },
                agility: { type: Type.NUMBER },
                vitality: { type: Type.NUMBER },
                intelligence: { type: Type.NUMBER },
                sense: { type: Type.NUMBER }
            }
        }
    },
    required: ["name", "description", "rarity", "type", "slot"],
};

const storySchema: Schema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Cool chapter title like 'File 05: The Encounter'" },
        description: { type: Type.STRING, description: "Short summary" },
        lore: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "3-5 distinct paragraphs/lines of the story." 
        },
        type: { type: Type.STRING, enum: ['narrative', 'boss', 'rivalry', 'ally'] }
    },
    required: ["title", "description", "lore", "type"]
};

export const analyzeFoodImage = async (base64Image: string): Promise<any | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const prompt = `
            Analyze this food image. Identify the dish and estimate the nutritional content for one standard serving.
            Return a JSON object with: name, calories (number), protein (string), carbs (string), fats (string), description.
            Be concise.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodItemSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;

    } catch (error) {
        console.error("Vision AI Error:", error);
        return null;
    }
};

export const identifyEquipment = async (base64Image: string): Promise<Item | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const prompt = `
            Analyze this image. If it is fitness equipment (dumbbells, shoes, treadmill, mat, pullup bar, water bottle, etc), generate an RPG Item stats for it.
            
            Rules:
            - Name: Give it a cool RPG name based on appearance (e.g. "Rusty Iron Dumbbell", "Assassin's Running Shoes").
            - Rarity: Based on condition/look. Dirty/Old = E. Shiny/High-tech = A or S.
            - Stats: 
              - Heavy weights -> Strength
              - Cardio machines/Shoes -> Agility/Vitality
              - Smart watches/Trackers -> Intelligence/Sense
            - If it is NOT fitness equipment, return NULL.
            
            Return JSON matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: equipmentSchema
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            if (!data.name) return null;
            
            // Add required frontend fields
            return {
                ...data,
                id: `scan_${Date.now()}`,
                cost: 0,
                icon: '📦', // Placeholder, will be visualized later
                generatedImage: `data:image/jpeg;base64,${base64Image}` // Use the photo as the icon
            };
        }
        return null;

    } catch (error) {
        console.error("Equipment ID Error:", error);
        return null;
    }
};

export const generateSnackSuggestion = async (weight: string, goal: string, preferences: string): Promise<any | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const prompt = `
            Suggest a single healthy snack item for a person weighing ${weight} with the goal: ${goal}.
            Preferences: ${preferences || "None"}.
            
            The suggestion should be simple, easy to prepare, and optimized for their goal.
            Return JSON with name, calories, protein, and description (why it's good).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: snackItemSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return null;
    } catch (error) {
        console.error("Snack Gen Error", error);
        return null;
    }
};

export const generateNutritionPlan = async (
  goal: string,
  preferences: string,
  weight: string
): Promise<NutritionPlan | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const prompt = `
      Create a personalized daily nutrition plan for a user acting as a "Player" in a system.
      Goal: ${goal}.
      Current Stats (Weight): ${weight}.
      Dietary Preferences: ${preferences}.
      
      Keep descriptions concise but motivating. 
      Format the nutrition info strictly as JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as NutritionPlan;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generatePersonalizedWorkout = async (stats: PlayerStats, isEmergency: boolean = false): Promise<DailyQuest | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const difficulty = isEmergency ? "Brutally Hard but Possible" : "Moderate to Challenging";
        const theme = isEmergency ? "Dungeon Break / Survival" : "Leveling Up";
        
        // Context for Realistic Generation
        const context = `
            Player Info:
            Level: ${stats.level} (Higher level = Slightly harder, but cap realistic limits)
            Age: ${stats.age || 25}
            Weight: ${stats.weight || '75kg'}
            Gender: ${stats.gender || 'Male'}
            Goal: ${stats.goal || 'General Fitness'}
        `;

        const prompt = `
            Generate a ${theme} fitness quest for a player.
            ${context}
            Difficulty Setting: ${difficulty}.
            
            CRITICAL SAFETY INSTRUCTION:
            - Even for "Brutally Hard" (Emergency) quests, do not set rep counts that cause injury.
            - For Emergency Quests, max reps per task should not exceed 50 for bodyweight exercises unless the user is very high level. 
            - Avoid totals like "300 reps". Break it down or keep it reasonable (e.g. 30-50 Burpees is already very hard).
            - For 'reps', typical ranges: 15-50. For 'sec', typical ranges: 30-120.
            
            Tasks should be real bodyweight exercises (Pushups, Squats, Lunges, Burpees, Plank, etc).
            If Emergency: Title should be scary (e.g. "RED GATE DETECTED", "SURVIVE THE ONSLAUGHT"). Description should be threatening.
            If Normal: Title should be standard system text (e.g. "Daily Training", "Assassin's Drill").
            
            Return purely JSON matching the schema.
            Task IDs should be unique strings.
            TimeLeft should be "23:59:59".
            Status "active".
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: questSchema
            }
        });

        if (response.text) {
            const quest = JSON.parse(response.text) as DailyQuest;
            return {
                ...quest,
                status: 'active',
                type: isEmergency ? 'emergency' : 'daily',
                tasks: quest.tasks.map(t => ({...t, current: 0}))
            };
        }
        return null;
    } catch (error) {
        console.error("Gemini Workout Gen Error:", error);
        return null;
    }
};

export const generateSpecialQuest = async (stats: PlayerStats): Promise<DailyQuest | null> => {
    return generatePersonalizedWorkout(stats, false);
};

export const generateSystemMessage = async (type: 'victory' | 'defeat' | 'levelUp', context: string): Promise<string> => {
    const ai = getAI();
    // Default fallback if AI fails or no key
    if (!ai) {
        if (type === 'victory') return "Quest Complete. Strength Increased.";
        return "System Status: Online.";
    }

    try {
        const prompt = `
            You are 'The System' from a dark fantasy fitness RPG (Solo Leveling inspired). The player has just triggered event: ${type}.
            Context: ${context}.
            
            TASK: Generate a profound, philosophical mantra about discipline, strength, and the cost of power. 
            
            VIBE / EXAMPLES (Do not copy exact words, emulate the feeling):
            - "Routines are rituals of devotion to yourself and your dreams."
            - "It takes a special kind of freak to find the Blade of No One Made You Do This and use it to cut your potential out."
            - "To have no routine is to be enslaved by the daily chaos of life."
            - "Pain is just weakness leaving the body. Do hard things daily to build self-trust."
            - "The Land of Laziness and the Plains of Procrastination are behind you."
            
            OUTPUT: A single, powerful sentence. Do not use quotes.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });

        return response.text?.trim() || "Routine is the foundation of power.";
    } catch (error) {
        return "Routine is the foundation of power.";
    }
}

export const generatePenaltyMessage = async (name: string, daysLost: number): Promise<string | null> => {
    const ai = getAI();
    if (!ai) return "Streak broken. Penalty calculation imminent.";

    try {
        const prompt = `
            The player '${name}' has failed their training streak of ${daysLost} days in a system resembling Solo Leveling.
            Generate a short, terrifying, robotic System message informing them of their failure.
            It should sound cold and threatening, implying consequence.
            Do not include "System Notification:" prefix. Just the text.
            Max 3 sentences.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
        });

        return response.text || "Streak broken. Penalty calculation imminent.";
    } catch (error) {
        return "Connection to System severed. Streak lost.";
    }
};

export const generateItemImage = async (itemName: string, type: string, rarity: string): Promise<string | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        const prompt = `
            A high quality fantasy RPG icon of ${itemName}.
            Type: ${type}. Rarity: ${rarity} (S-Rank is legendary, glowing. E-Rank is rusty, basic).
            Style: Dark fantasy, digital art, neon glow accents, dark background.
            The image should look like a video game inventory item.
            Centered, no text.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { text: prompt },
                ],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                }
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;

    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        return null;
    }
};

// --- CAMPAIGN GENERATOR ---
export const generateCampaignChapter = async (stats: PlayerStats): Promise<StoryLogEntry | null> => {
    const ai = getAI();
    if (!ai) return null;

    try {
        // Determine Narrative Arc based on Level
        let arc = "SURVIVAL (Levels 1-20)";
        if (stats.level > 20) arc = "HUNTERS (Levels 21-60)";
        if (stats.level > 60) arc = "WAR (Levels 61-90)";
        if (stats.level > 90) arc = "ASCENSION (Levels 91-100)";

        const npcContext = NPC_ROSTER.map(n => `${n.name} (${n.personality})`).join(', ');

        const prompt = `
            Write a "Solo Leveling" style story segment for a player who is a "System Glitch" fighting against deletion.
            
            Player Stats:
            - Level: ${stats.level}
            - Class: ${stats.job}
            - Highest Stat: ${Object.entries(stats).filter(e=>typeof e[1] === 'number' && ['strength','agility','intelligence'].includes(e[0])).sort((a,b)=>b[1]-a[1])[0][0]}
            
            Current Narrative Arc: ${arc}
            Available NPCs: ${npcContext}
            
            Instructions:
            1. Create a short, intense story segment (3-5 sentences/lines).
            2. If Level 1-20: Focus on the System trying to kill the player with "impossible" workouts or glitches.
            3. If Level 21-60: The player encounters specialized Hunters (NPCs). They might be hostile or curious.
            4. If Level 61+: The player is building an army and challenging the Architects.
            5. "Friendship" or "Rivalry": If the player is high level, an NPC might acknowledge their strength.
            
            Output strictly JSON matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return {
                id: `log_${Date.now()}`,
                level: stats.level,
                timestamp: new Date().toISOString(),
                ...data
            };
        }
        return null;

    } catch (error) {
        console.error("Story Gen Error:", error);
        return null;
    }
}