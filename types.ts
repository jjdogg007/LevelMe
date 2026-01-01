
export type ItemType = 'consumable' | 'equipment';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type Rarity = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity?: Rarity;
  slot?: EquipmentSlot;
  description: string;
  cost: number;
  icon: string; // The fallback emoji
  generatedImage?: string; // The AI image
  bonusStats?: Partial<PlayerStats>;
}

export interface SkillMastery {
    rank: Rarity;
    xp: number;
    totalReps: number;
}

export interface StoryLogEntry {
    id: string;
    level: number;
    title: string;
    description: string;
    lore: string[]; // The paragraph/dialogue
    timestamp: string;
    type: 'narrative' | 'boss' | 'rivalry' | 'ally';
}

export interface PlayerStats {
  level: number;
  prestigeLevel: number; // New: Reawakening Count
  job: string;
  title: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  fatigue: number;
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
  gold: number;
  xp: number;
  maxXp: number;
  totalXp: number;
  keys: number;
  unspentPoints: number;
  autoDistributeStats?: boolean; // New: Auto Level Up preference
  // Streak & Activity
  streak: number;
  lastLoginDate: string;
  history: string[]; 
  weightHistory: { date: string; weight: number }[]; 
  gallery: { date: string, image: string }[]; 
  skillMastery: Record<string, SkillMastery>; // New: Skill Proficiency
  // Hidden Stats for Job Evolution
  hiddenStats: {
      strengthReps: number;
      cardioReps: number;
      totalWorkouts: number;
  };
  // Inventory & Gear
  shadows: string[]; 
  inventory: string[]; 
  equipped: {
      weapon?: string;
      armor?: string;
      accessory?: string;
  };
  streakShield: boolean;
  hunterCode?: string;
  // Onboarding
  trainingFrequency?: number;
  trainingDays?: string[];
  notifications?: {
    workouts: boolean;
    tips: boolean;
    reports: boolean;
  };
  // Profile
  weight?: string;
  height?: string;
  age?: number;
  gender?: string;
  targetWeight?: string;
  goal?: string;
  motivation?: string;
  activityLevel?: string;
  // Campaign
  completedChapters: string[]; // Legacy ID tracking
  storyLog: StoryLogEntry[]; // New Dynamic Story
  relationships: Record<string, 'neutral' | 'rival' | 'ally'>; // NPC ID -> Status
}

export interface PlayerClass {
  id: string;
  name: string;
  description: string;
  bonusStats: Partial<PlayerStats>;
  icon: string;
  evolutionLevel?: number;
  nextClass?: string;
}

export interface Shadow {
  id: string;
  name: string;
  rank: string;
  image: string;
  requirement: number;
  description: string;
  buffDescription: string;
  buff?: Partial<PlayerStats>; // Simple stat boosts
  xpMultiplier?: number;
  goldMultiplier?: number;
  // Patrol Logic
  status?: 'IDLE' | 'ON_PATROL';
  patrolStartTime?: number; // timestamp
  patrolDuration?: number; // seconds
}

export interface QuestTask {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  exerciseId?: string;
}

export interface WorkoutSet {
  reps: number;
  weight?: number;
  completed: boolean;
}

export interface DailyQuest {
  title: string;
  description: string;
  timeLeft: string;
  tasks: QuestTask[];
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  status: 'active' | 'completed' | 'failed';
  type?: 'daily' | 'special' | 'emergency' | 'rest' | 'dungeon' | 'story' | 'raid' | 'job_change'; 
  dungeonRank?: string;
  bossName?: string; 
  bossHp?: number;
  storyChapterId?: string;
  startedAt?: number; // Timestamp when quest started/generated
}

export interface StoryChapter {
    id: string;
    title: string;
    description: string;
    minLevel: number;
    lore: string[];
    quest: DailyQuest;
    rewards: { gold: number, xp: number, item?: string, shadow?: string };
}

export interface Dungeon {
    id: string;
    name: string;
    rank: string;
    description: string;
    boss: string;
    minLevel: number;
    keyId: string; // Specific key required
    tasks: QuestTask[];
    rewards: { gold: number, xp: number, item?: string };
    isRedGate?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  type: 'Strength' | 'Cardio' | 'Agility' | 'Flexibility' | 'Plyometrics';
  description: string;
  muscles: string[];
  tips: string[];
  videoUrl?: string;
  gifData?: string;
  requirements?: string;
  baseTarget?: number;
  defaultUnit?: string;
}

export interface NutritionItem {
  name: string;
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
  description: string;
}

export interface NutritionPlan {
  breakfast: NutritionItem;
  lunch: NutritionItem;
  dinner: NutritionItem;
  snack: NutritionItem;
  totalCalories: number;
}

export interface Hunter {
    id: string;
    name: string;
    level: number;
    job: string;
    isRival?: boolean;
    isPlayer?: boolean;
    xp?: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    target: number;
    metric: 'streak' | 'level' | 'totalXp' | 'workouts';
}

export interface WorldBoss {
    id: string;
    name: string;
    maxHp: number;
    currentHp: number;
    participants: number;
    endTime: string;
    description: string;
}

export enum ViewState {
  STATUS = 'STATUS',
  QUESTS = 'QUESTS',
  GRIMOIRE = 'GRIMOIRE',
  NUTRITION = 'NUTRITION',
  LEADERBOARD = 'LEADERBOARD',
  SHOP = 'SHOP',
  PENALTY = 'PENALTY',
  DUNGEON = 'DUNGEON',
  STORY = 'STORY',
  RAID = 'RAID',
  CARD = 'CARD' // New View for sharing
}
