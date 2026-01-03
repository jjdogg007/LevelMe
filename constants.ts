
import { DailyQuest, PlayerStats, PlayerClass, Exercise, Shadow, Hunter, Dungeon, Achievement, Item, StoryChapter, WorldBoss } from "./types";

export const INITIAL_STATS: PlayerStats = {
  level: 1,
  prestigeLevel: 0,
  job: "None",
  title: "Civilian",
  hp: 100,
  maxHp: 100,
  mp: 20,
  maxMp: 20,
  fatigue: 0,
  strength: 10,
  agility: 12,
  vitality: 10,
  intelligence: 8,
  sense: 11,
  gold: 0,
  xp: 0,
  maxXp: 100,
  totalXp: 0,
  keys: 0,
  unspentPoints: 0,
  streak: 0,
  hunterCode: "", 
  lastLoginDate: new Date().toISOString(),
  history: [],
  weightHistory: [],
  gallery: [],
  skillMastery: {}, // Initialize empty
  customVisuals: {}, // Initialize empty
  hiddenStats: { strengthReps: 0, cardioReps: 0, totalWorkouts: 0 }, // New Hidden Logic
  shadows: [],
  inventory: [],
  equipped: {},
  streakShield: false,
  trainingFrequency: 3,
  trainingDays: ['Mon', 'Wed', 'Fri'],
  notifications: {
    workouts: true,
    tips: true,
    reports: true
  },
  weight: "165 lbs",
  height: "5' 9\"",
  age: 25,
  gender: "Male",
  targetWeight: "160 lbs",
  goal: "Build Muscle",
  motivation: "Strength",
  activityLevel: "Moderate",
  completedChapters: [],
  storyLog: [],
  relationships: {}
};

// GOD MODE PRESET
export const GOD_MODE_STATS: PlayerStats = {
    ...INITIAL_STATS,
    level: 150,
    title: "Symbol of Peace",
    job: "No. 1 Hero",
    hp: 99999,
    maxHp: 99999,
    mp: 99999,
    maxMp: 99999,
    strength: 999,
    agility: 999,
    vitality: 999,
    intelligence: 999,
    sense: 999,
    gold: 999999999,
    xp: 9999999,
    maxXp: 10000000,
    keys: 99,
    unspentPoints: 999,
    streak: 365,
    shadows: ['igris', 'tank', 'iron', 'tusk', 'kaisel', 'beru', 'bellion'],
    inventory: ['demon_king_ring', 'baruka_dagger', 'hero_glove', 'key_s', 'potion'],
    equipped: {
        weapon: 'hero_glove',
        accessory: 'demon_king_ring'
    },
    hunterCode: "NO-1-HERO"
};

// Reps required to reach next rank
export const MASTERY_THRESHOLDS = {
    E: 0,
    D: 100,
    C: 500,
    B: 1500,
    A: 3000,
    S: 5000
};

export const WORLD_BOSS: WorldBoss = {
    id: 'kamish_sim',
    name: 'KAMISH (SIMULATION)',
    maxHp: 10000000,
    currentHp: 8450200,
    participants: 1240,
    endTime: '2024-12-31',
    description: "A disaster-class dragon has emerged."
};

// NPCs for AI Context
export const NPC_ROSTER = [
    { name: "Cha Hae-In", personality: "Stoic, skilled, smells mana, respects strength" },
    { name: "Thomas Andre", personality: "Boisterous, arrogant, respects power, physically massive" },
    { name: "Go Gun-Hee", personality: "Wise, old, supportive, authority figure" },
    { name: "Beru", personality: "Loyal to the Monarch, fierce, protective" },
    { name: "Rock Lee", personality: "Extremely energetic, obsessed with hard work and youth, physical taijutsu specialist" },
    { name: "Monkey D. Luffy", personality: "Carefree, instinctual, obsessed with freedom and meat, incredibly strong will" },
    { name: "Yusuke Urameshi", personality: "Cocky, delinquent attitude but good heart, utilizes spirit energy, likes a brawl" }
];

export const SYSTEM_QUOTES = [
    "Routines are rituals of devotion to yourself and your dreams.",
    "Most progress comes from having a routine. Know what you're working on, when, and for how long.",
    "To have no routine is to be enslaved by the daily chaos of life.",
    "Without structure, your potential is wasted.",
    "Routines stop being chores when they're acts of worship to the life you're building.",
    "It takes a special kind of freak to find the Blade of No One Made You Do This.",
    "Use the Blade to cut your chest open and yank that book out.",
    "Nobody is born with courage. Everybody can find courage if they really want to.",
    "Every time you shy away from the hard things, you harm your future self.",
    "Dare to do hard things. That's how you get ahead.",
    "Doing hard things daily builds strength, confidence, and self-trust."
];

// --- THE GLITCH PROTOCOL: ORIGINAL STORY CAMPAIGN (Now acts as milestones) ---
export const STORY_CAMPAIGN: StoryChapter[] = [
    {
        id: 'arc1_ch1',
        title: 'FILE 01: ANOMALY',
        description: 'You are not supposed to be here.',
        minLevel: 1,
        lore: [
            "SYSTEM NOTICE: Unauthorized user detected.",
            "Deleting entity... Error. Deletion failed.",
            "You are a glitch in the world's design.",
            "To survive, you must prove your existence is necessary.",
            "Move. Now. Or be erased."
        ],
        quest: {
            title: "SURVIVAL PROTOCOL",
            description: "Force the System to acknowledge your biometrics.",
            timeLeft: "01:00:00",
            difficulty: 'E',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's1_1', name: 'RUNNING', target: 2, current: 0, unit: 'km', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Run.gif' },
                { id: 's1_2', name: 'PUSH-UPS', target: 30, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' }
            ]
        },
        rewards: { gold: 1000, xp: 200, item: 'glitch_dagger' }
    },
    // ... (Keep existing chapters) ...
];

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_quest', title: 'First Quest', description: 'Complete your first daily quest', target: 1, metric: 'workouts' },
    { id: 'week_warrior', title: 'Week Warrior', description: 'Maintain a 7-day streak', target: 7, metric: 'streak' },
    { id: 'month_champion', title: 'Month Champion', description: 'Maintain a 30-day streak', target: 30, metric: 'streak' },
    { id: 'rising_hunter', title: 'Rising Hunter', description: 'Reach Level 10 (D Rank)', target: 10, metric: 'level' },
    { id: 'elite_hunter', title: 'Elite Hunter', description: 'Reach Level 40 (A Rank)', target: 40, metric: 'level' },
    { id: 'xp_master', title: 'XP Master', description: 'Earn 10,000 total XP', target: 10000, metric: 'totalXp' },
];

export const STARTING_CLASSES: PlayerClass[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'Balanced combatant. Focuses on overall physical capability.',
    icon: '⚔️',
    bonusStats: { strength: 5, vitality: 5 },
    evolutionLevel: 40,
    nextClass: 'Berserker'
  },
  {
    id: 'assassin',
    name: 'Assassin',
    description: 'High speed and burst damage. Focuses on agility and cardio.',
    icon: '🗡️',
    bonusStats: { agility: 8, sense: 2 },
    evolutionLevel: 40,
    nextClass: 'Ninja'
  },
  {
    id: 'tanker',
    name: 'Tanker',
    description: 'Impenetrable defense. Focuses on endurance and heavy lifting.',
    icon: '🛡️',
    bonusStats: { vitality: 8, strength: 2 },
    evolutionLevel: 40,
    nextClass: 'Paladin'
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Calculation and willpower. Focuses on intelligence and mana.',
    icon: '🔮',
    bonusStats: { intelligence: 8, mp: 50 },
    evolutionLevel: 40,
    nextClass: 'Necromancer'
  }
];

export const DUNGEONS: Dungeon[] = [
    {
        id: 'e_rank_goblin',
        name: "Goblin Cave",
        rank: "E",
        description: "A dark, damp cave infested with goblins. Good for cardio.",
        boss: "Hobgoblin Leader",
        minLevel: 1,
        keyId: 'key_e',
        tasks: [
            { id: 'dg_1', name: 'JUMPING JACKS', target: 50, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Jumping-Jack.gif' },
            { id: 'dg_2', name: 'HIGH KNEES', target: 50, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/High-Knee-Run.gif' },
            { id: 'dg_3', name: 'PLANK', target: 30, current: 0, unit: 'sec', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
        ],
        rewards: { gold: 500, xp: 100 }
    },
    {
        id: 'c_rank_lizard',
        name: "Swamp of the Lizards",
        rank: "C",
        description: "Difficult terrain requires balance and core strength.",
        boss: "Giant Swamp Ruler",
        minLevel: 15,
        keyId: 'key_c',
        tasks: [
            { id: 'dg_c1', name: 'MOUNTAIN CLIMBERS', target: 60, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Mountain-Climber.gif' },
            { id: 'dg_c2', name: 'LUNGES', target: 40, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif' },
            { id: 'dg_c3', name: 'LEG RAISES', target: 20, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Raise.gif' }
        ],
        rewards: { gold: 1500, xp: 300, item: 'scale_armor' }
    },
    {
        id: 'b_rank_ice',
        name: "Ice Bear Territory",
        rank: "B",
        description: "Brutal cold. Heavy strength training required.",
        boss: "Alpha Ice Bear",
        minLevel: 25,
        keyId: 'key_b',
        tasks: [
            { id: 'dg_b1', name: 'PUSH-UPS', target: 50, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' },
            { id: 'dg_b2', name: 'SQUATS', target: 50, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif' },
            { id: 'dg_b3', name: 'BURPEES', target: 20, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif' }
        ],
        rewards: { gold: 3000, xp: 600 }
    },
    {
        id: 'red_gate_elf',
        name: "Frozen Red Gate",
        rank: "S",
        description: "WARNING: EXIT DISABLED. SURVIVAL MODE.",
        boss: "Baruka",
        minLevel: 40,
        keyId: 'key_s', // Usually enters via random chance, but allows purchase for replay
        isRedGate: true,
        tasks: [
            { id: 'rg_1', name: 'BURPEES', target: 30, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif' },
            { id: 'rg_2', name: 'SPRINTS', target: 400, current: 0, unit: 'm', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Run.gif' },
            { id: 'rg_3', name: 'PLANK', target: 90, current: 0, unit: 'sec', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' },
            { id: 'rg_4', name: 'SQUAT JUMPS', target: 30, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat-Jump.gif' }
        ],
        rewards: { gold: 10000, xp: 2000, item: 'baruka_dagger' }
    }
];

export const SHADOW_ARMY: Shadow[] = [
    { 
        id: 'igris', name: 'IGRIS', rank: 'Knight', requirement: 7, image: '🔴', 
        description: 'The Blood-Red Commander. Unlocked at 7 Day Streak.',
        buffDescription: 'XP Gain +10%', xpMultiplier: 1.1
    },
    { 
        id: 'tank', name: 'TANK', rank: 'Knight', requirement: 14, image: '🐻', 
        description: 'The Ice Bear Alpha. Unlocked at 14 Day Streak.',
        buffDescription: 'Gold Gain +10%', goldMultiplier: 1.1
    },
    { 
        id: 'iron', name: 'IRON', rank: 'Elite', requirement: 21, image: '🛡️', 
        description: 'The Heavy Defender. Unlocked at 21 Day Streak.',
        buffDescription: 'VIT +5', buff: { vitality: 5 }
    },
    { 
        id: 'tusk', name: 'TUSK', rank: 'Elite', requirement: 30, image: '🔥', 
        description: 'The High Orc Shaman. Unlocked at 30 Day Streak.',
        buffDescription: 'INT +5', buff: { intelligence: 5 }
    },
    { 
        id: 'kaisel', name: 'KAISEL', rank: 'Wyvern', requirement: 45, image: '🐲', 
        description: 'The Sky Ruler. Unlocked at 45 Day Streak.',
        buffDescription: 'AGI +5', buff: { agility: 5 }
    },
    { 
        id: 'beru', name: 'BERU', rank: 'General', requirement: 60, image: '🐜', 
        description: 'The Ant King. Unlocked at 60 Day Streak.',
        buffDescription: 'All Stats +5', buff: { strength: 5, agility: 5, vitality: 5, intelligence: 5, sense: 5 }
    },
    { 
        id: 'bellion', name: 'BELLION', rank: 'Grand-Marshal', requirement: 100, image: '⚔️', 
        description: 'The First Shadow. Unlocked at 100 Day Streak.',
        buffDescription: 'Damage +20% (Simulated)', xpMultiplier: 1.2
    },
];

export const PATROL_MISSIONS = [
    { id: 'patrol_scout', name: 'Scout Perimeter', duration: 3600, reward: { gold: 100, xp: 50 }, desc: "1 Hour" },
    { id: 'patrol_dungeon', name: 'Dungeon Raid', duration: 14400, reward: { gold: 500, xp: 200 }, desc: "4 Hours" },
    { id: 'patrol_gate', name: 'Close Gate', duration: 28800, reward: { gold: 1200, xp: 600 }, desc: "8 Hours" },
];

export const INITIAL_DAILY_QUEST: DailyQuest = {
  title: "STRENGTH TRAINING",
  description: "Daily quest: Strength Training has arrived.",
  timeLeft: "23:59:59",
  difficulty: 'E',
  status: 'active',
  tasks: [
    { id: '1', name: 'PUSH-UPS', target: 20, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif' },
    { id: '2', name: 'SIT-UPS', target: 20, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Sit-up.gif' },
    { id: '3', name: 'SQUATS', target: 20, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Squat.gif' },
    { id: '4', name: 'RUNNING', target: 2, current: 0, unit: 'km', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Run.gif' },
  ]
};

export const JOB_CHANGE_QUEST: DailyQuest = {
  title: "JOB CHANGE QUEST",
  description: "Survive the penalty zone to awaken your true potential.",
  timeLeft: "04:00:00",
  difficulty: 'S',
  status: 'active',
  type: 'job_change',
  tasks: [
      { id: 'jc_1', name: 'BURPEES', target: 50, current: 0, unit: 'reps', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif' },
      { id: 'jc_2', name: 'RUNNING', target: 3, current: 0, unit: 'km', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Run.gif' },
      { id: 'jc_3', name: 'PLANK', target: 90, current: 0, unit: 'sec', videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif' }
  ]
};

export const REST_DAY_TASKS = [
    { name: 'MINDFULNESS', target: 10, unit: 'mins' },
    { name: 'EAT CLEAN', target: 3, unit: 'meals' },
    { name: 'LIGHT WALK', target: 20, unit: 'mins' },
    { name: 'STRETCHING', target: 15, unit: 'mins' },
    { name: 'FOAM ROLLING', target: 10, unit: 'mins' },
    { name: 'HYDRATION', target: 3, unit: 'liters' },
    { name: 'SLEEP', target: 8, unit: 'hours' },
    { name: 'COLD SHOWER', target: 2, unit: 'mins' },
    { name: 'MOBILITY WORK', target: 15, unit: 'mins' },
    { name: 'MEAL PREP', target: 1, unit: 'session' },
];

export const REST_DAY_QUEST: DailyQuest = {
  title: "REST DAY",
  description: "Recovery is essential for growth.",
  timeLeft: "23:59:59",
  difficulty: 'E',
  status: 'active',
  tasks: [
    { id: 'r1', name: 'MINDFULNESS', target: 10, current: 0, unit: 'mins' },
    { id: 'r2', name: 'EAT CLEAN', target: 3, current: 0, unit: 'meals' },
    { id: 'r3', name: 'LIGHT WALK', target: 15, current: 0, unit: 'mins' },
  ]
};

export const INITIAL_HUNTERS: Hunter[] = [
  { id: 'all_might', name: "All Might", level: 150, job: "Symbol of Peace" },
  { id: 'sj-woo', name: "Sung Jin-Woo", level: 140, job: "Shadow Monarch" },
  { id: 'rock_lee', name: "Rock Lee", level: 95, job: "Green Beast" },
  { id: 'luffy', name: "Monkey D. Luffy", level: 130, job: "Joy Boy" },
  { id: 'yusuke', name: "Yusuke Urameshi", level: 115, job: "Spirit Detective" },
  { id: 't-andre', name: "Thomas Andre", level: 125, job: "Tanker" },
  { id: 'cha', name: "Cha Hae-In", level: 95, job: "Blade Dancer" },
  { id: 'rival', name: "Rival Hunter", level: 1, job: "Fighter", isRival: true }, 
  { id: 'woo', name: "Woo Jin-Chul", level: 80, job: "Chief Inspector" },
  { id: 'baek', name: "Baek Yoon-Ho", level: 88, job: "Beast Fighter" },
  { id: 'goto', name: "Goto Ryuji", level: 90, job: "Swordmaster" },
];

export const SYSTEM_DATABASE: Exercise[] = [
    { id: 'arnold_press', name: 'ARNOLD PRESS', rank: 'C', type: 'Strength', description: "Rotational shoulder press targeting anterior, medial and posterior deltoids.", muscles: ['Shoulders', 'Triceps'], tips: [], videoUrl: 'https://v5.airtableusercontent.com/v3/u/48/48/1767412800000/-G-hiMx1ZihBI_mzzXQEpQ/HxMIOtQZUYDOnfTtARVFqEeq4hVN7y4IdFCr1-6r;WqfMn-6OhBWjTrb25axQwiLBDfkLZ27IUsP91xDLc9OHmUpIfWEOk780cUcNXpC8ijk/ul4bzWaZ94-C3Gbz8tP0oXOoERAklLNXRCZ4cUquzEg' },
    { id: 'bicep_curl', name: 'BICEP CURL', rank: 'E', type: 'Strength', description: "Isolation exercise for the biceps brachii.", muscles: ['Biceps'], tips: ["Don't use momentum.", "Movement from elbow down."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif' },
    { id: 'bicycle_crunch', name: 'BICYCLE CRUNCH', rank: 'D', type: 'Strength', description: "Core rotational movement targeting abs and obliques.", muscles: ['Abs', 'Obliques'], tips: ["Lower leg = harder.", "Easier: Move slower.", "Harder: Keep shoulder blades off ground."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bicycle-Crunch.gif' },
    { id: 'bounds', name: 'BOUNDS', rank: 'C', type: 'Plyometrics', description: "Lateral explosive movement for power development.", muscles: ['Legs', 'Glutes'], tips: ["Do laps.", "Easier: Smaller jumps.", "Harder: Touch ground."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/07/Lateral-Bound.gif' },
    { id: 'box_jumps', name: 'BOX JUMPS', rank: 'B', type: 'Plyometrics', description: "Explosive vertical jump onto an elevated surface.", muscles: ['Legs', 'Glutes', 'Calves'], tips: ["Don't be afraid.", "Easier: Lower box.", "Harder: Higher box/Speed."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Box-Jump.gif' },
    { id: 'box_toe_touch', name: 'BOX TOE TOUCH', rank: 'E', type: 'Cardio', description: "Rapid alternating toe taps on an elevated surface.", muscles: ['Legs', 'Cardio'], tips: ["Easier: No box.", "Harder: Speed."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Box-Toe-Touches.gif' },
    { id: 'broad_jump', name: 'BROAD JUMP', rank: 'C', type: 'Plyometrics', description: "Maximum distance horizontal jump.", muscles: ['Legs', 'Glutes'], tips: ["Speed = Cardio", "Distance = Power"], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Long-Jump.gif' },
    { id: 'bulgarian_split_squat', name: 'BULGARIAN SPLIT SQUAT', rank: 'B', type: 'Strength', description: "Unilateral leg strength and balance exercise.", muscles: ['Quads', 'Glutes', 'Hamstrings'], tips: ["Use Dumbbell or Bar"], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Bulgarian-Split-Squat.gif' },
    { id: 'burpees', name: 'BURPEES', rank: 'C', type: 'Cardio', description: "Full body metabolic conditioning movement.", muscles: ['Full Body', 'Chest', 'Legs'], tips: ["Don't round back.", "Easier: Step back, no pushup.", "Harder: Speed."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif' },
    { id: 'burpee_broad_jump', name: 'BURPEE BROAD JUMP', rank: 'A', type: 'Plyometrics', description: "Burpee followed immediately by a broad jump.", muscles: ['Full Body', 'Legs'], tips: ["Do laps across room."] },
    { id: 'butt_kickers', name: 'BUTT KICKERS', rank: 'E', type: 'Cardio', description: "Running in place bringing heels to glutes.", muscles: ['Hamstrings', 'Cardio'], tips: ["Mean it.", "Harder: Hold weights."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Butt-Kicks.gif' },
    { id: 'calf_raises', name: 'CALF RAISES', rank: 'E', type: 'Strength', description: "Isolation movement for the gastrocnemius.", muscles: ['Calves'], tips: ["Vary foot placement."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif' },
    { id: 'chest_press', name: 'CHEST PRESS', rank: 'D', type: 'Strength', description: "Horizontal pushing movement for upper body.", muscles: ['Chest', 'Triceps'], tips: ["Floor or Bench."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Press.gif' },
    { id: 'bicep_burnout', name: 'BICEP BURNOUT', rank: 'D', type: 'Strength', description: "High volume bicep curls changing grip width.", muscles: ['Biceps'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/04/Zottman-Curl.gif' },
    { id: 'compass_jump', name: 'COMPASS JUMP', rank: 'D', type: 'Cardio', description: "Jumping in cardinal directions.", muscles: ['Legs', 'Cardio'], tips: ["Easier: Step instead of jump."] },
    { id: 'crab_crawl', name: 'CRAB CRAWL', rank: 'C', type: 'Cardio', description: "Crawling in a supine bridge position.", muscles: ['Full Body', 'Triceps', 'Core'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2022/10/Crab-Walk.gif' },
    { id: 'curtsey_lunges', name: 'CURTSEY LUNGES', rank: 'D', type: 'Strength', description: "Lunge variation targeting glute medius.", muscles: ['Glutes', 'Inner Thigh'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Curtsy-Lunge.gif' },
    { id: 'deficit_squat', name: 'DEFICIT SQUAT', rank: 'C', type: 'Strength', description: "Squatting with increased range of motion.", muscles: ['Glutes', 'Legs'], tips: [] },
    { id: 'donkey_kicks', name: 'DONKEY KICKS', rank: 'E', type: 'Strength', description: "Glute isolation from quadruped position.", muscles: ['Glutes'], tips: ["Easier: No weights", "Harder: Heavy weights"], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Donkey-Kick.gif' },
    { id: 'fire_hydrant', name: 'FIRE HYDRANT', rank: 'E', type: 'Strength', description: "Hip abduction from quadruped position.", muscles: ['Glutes', 'Hips'], tips: ["Harder: Weight behind knee"], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Fire-Hydrant.gif' },
    { id: 'flutter_kicks', name: 'FLUTTER KICKS', rank: 'D', type: 'Strength', description: "Rapid alternating leg lifts.", muscles: ['Core', 'Abs'], tips: ["Keep neck neutral."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Flutter-Kicks.gif' },
    { id: 'frogger', name: 'FROGGER', rank: 'C', type: 'Plyometrics', description: "Explosive squat thrust.", muscles: ['Legs', 'Cardio'], tips: ["Easier: Step back.", "Harder: Full Burpee."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Frog-Jumps.gif' },
    { id: 'glute_bridge', name: 'GLUTE BRIDGE', rank: 'E', type: 'Strength', description: "Hip extension from supine position.", muscles: ['Glutes'], tips: ["Weight in hip crease."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge.gif' },
    { id: 'glute_march', name: 'GLUTE MARCH', rank: 'D', type: 'Strength', description: "Marching while holding a glute bridge.", muscles: ['Hamstrings', 'Glutes'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Glute-Bridge-March.gif' },
    { id: 'goblet_squat', name: 'GOBLET SQUAT', rank: 'C', type: 'Strength', description: "Front loaded squat holding weight at chest.", muscles: ['Quads', 'Glutes'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Goblet-Squat.gif' },
    { id: 'halo', name: 'HALO', rank: 'D', type: 'Strength', description: "Shoulder mobility and strength exercise.", muscles: ['Shoulders', 'Triceps'], tips: [], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Kettlebell-Halo.gif' },
    { id: 'heart_pump', name: 'HEART PUMP', rank: 'E', type: 'Strength', description: "Rapid chest press.", muscles: ['Biceps', 'Chest'], tips: [] },
    { id: 'high_knees', name: 'HIGH KNEES', rank: 'E', type: 'Cardio', description: "Running in place with exaggerated knee lift.", muscles: ['Legs', 'Cardio'], tips: ["Get knees up!", "Easier: Run on spot.", "Harder: Speed."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/High-Knee-Run.gif' },
    { id: 'jump_lunges', name: 'JUMP LUNGES', rank: 'B', type: 'Plyometrics', description: "Explosive lunge transitions.", muscles: ['Quads', 'Glutes'], tips: ["Easier: Split Jump."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Jump-Lunge.gif' },
    { id: 'jump_rope', name: 'JUMP ROPE', rank: 'D', type: 'Cardio', description: "Cardio conditioning.", muscles: ['Calves', 'Cardio'], tips: ["Harder: Single leg."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Jump-Rope.gif' },
    { id: 'weighted_jacks', name: 'WEIGHTED JACKS', rank: 'D', type: 'Cardio', description: "Jumping jacks with weights.", muscles: ['Full Body'], tips: ["Easier: Step out."] },
    { id: 'shadow_boxing', name: 'SHADOW BOXING', rank: 'E', type: 'Cardio', description: "Boxing punches with light weights.", muscles: ['Core', 'Arms'], tips: ["Easier: No weights."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Shadow-Boxing.gif' },
    { id: 'deadbug', name: 'DEADBUG', rank: 'E', type: 'Strength', description: "Core stability exercise.", muscles: ['Core', 'Back'], tips: ["Good for lower back pain."], videoUrl: 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dead-Bug.gif' }
    // ... Additional exercises can be added here
];

export const EXERCISE_INFO: Record<string, Exercise> = SYSTEM_DATABASE.reduce((acc, exercise) => {
  acc[exercise.name] = exercise;
  return acc;
}, {} as Record<string, Exercise>);

export const SHOP_ITEMS: Item[] = [
  { id: 'potion', name: 'Blue Potion', type: 'consumable', rarity: 'E', cost: 1000, description: "Restores fatigue & protects Streak for 1 day.", icon: "🧪" },
  { id: 'key_e', name: 'E-Rank Key', type: 'consumable', rarity: 'E', cost: 1000, description: "Entry pass for E-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'key_d', name: 'D-Rank Key', type: 'consumable', rarity: 'D', cost: 5000, description: "Entry pass for D-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'key_c', name: 'C-Rank Key', type: 'consumable', rarity: 'C', cost: 10000, description: "Entry pass for C-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'key_b', name: 'B-Rank Key', type: 'consumable', rarity: 'B', cost: 25000, description: "Entry pass for B-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'key_a', name: 'A-Rank Key', type: 'consumable', rarity: 'A', cost: 50000, description: "Entry pass for A-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'key_s', name: 'S-Rank Key', type: 'consumable', rarity: 'S', cost: 100000, description: "Entry pass for S-Rank Instant Dungeons.", icon: "🗝️" },
  { id: 'iron_sword', name: 'Iron Sword', type: 'equipment', rarity: 'D', slot: 'weapon', cost: 50000, description: "Basic blade. STR +5.", icon: "⚔️", bonusStats: { strength: 5 } },
  { id: 'scale_armor', name: 'Scale Armor', type: 'equipment', rarity: 'C', slot: 'armor', cost: 75000, description: "Lizard hide. VIT +5.", icon: "🛡️", bonusStats: { vitality: 5 } },
  { id: 'baruka_dagger', name: 'Baruka\'s Dagger', type: 'equipment', rarity: 'S', slot: 'weapon', cost: 500000, description: "Legendary Dagger. AGI +10, STR +10.", icon: "🗡️", bonusStats: { agility: 10, strength: 10 } },
  { id: 'knights_breastplate', name: 'Knight\'s Plate', type: 'equipment', rarity: 'B', slot: 'armor', cost: 250000, description: "Heavy Steel. VIT +10, HP +50.", icon: "🧥", bonusStats: { vitality: 10, maxHp: 50 } },
  { id: 'demon_king_ring', name: 'Demon King Ring', type: 'equipment', rarity: 'S', slot: 'accessory', cost: 1000000, description: "Monarch's power. ALL STATS +5.", icon: "💍", bonusStats: { strength: 5, agility: 5, vitality: 5, intelligence: 5, sense: 5 } },
  { id: 'glitch_dagger', name: 'Glitch Dagger', type: 'equipment', rarity: 'E', slot: 'weapon', cost: 0, description: "A jagged piece of code. AGI +2.", icon: "⚡", bonusStats: { agility: 2 } },
  { id: 'admin_privileges', name: 'Admin Key', type: 'equipment', rarity: 'S', slot: 'accessory', cost: 0, description: "Access to the Core. All Stats +10.", icon: "👑", bonusStats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 } },
  { id: 'bandages', name: 'Bandages', type: 'consumable', rarity: 'E', cost: 500, description: "Treats minor injuries (Visual Only).", icon: "🩹" },
  // --- CAMEO ITEMS ---
  { id: 'cyborg_core', name: 'Cyborg Core', type: 'equipment', rarity: 'D', slot: 'accessory', cost: 0, description: "Energy source of a disciple. STR +2, INT +2.", icon: "⚙️", bonusStats: { strength: 2, intelligence: 2 } },
  { id: 'ankle_weights', name: 'Orange Warmers', type: 'equipment', rarity: 'C', slot: 'accessory', cost: 0, description: "Hidden weights. AGI +3.", icon: "🦵", bonusStats: { agility: 3 } },
  { id: 'green_bandana', name: 'Moss Bandana', type: 'equipment', rarity: 'C', slot: 'accessory', cost: 0, description: "Worn by a lost swordsman. STR +3.", icon: "🧣", bonusStats: { strength: 3 } },
  // --- LEGENDARY CAMEO ITEMS ---
  { id: 'headband_leaf', name: 'Ninja Headband', type: 'equipment', rarity: 'B', slot: 'accessory', cost: 0, description: "Worn by a hero who never gave up. VIT +5, MP +20.", icon: "🍃", bonusStats: { vitality: 5, mp: 20 } },
  { id: 'straw_hat', name: 'Straw Hat', type: 'equipment', rarity: 'B', slot: 'accessory', cost: 0, description: "Worn by a pirate who seeks freedom. AGI +5.", icon: "👒", bonusStats: { agility: 5 } },
  { id: 'spirit_cuffs', name: 'Spirit Cuffs', type: 'equipment', rarity: 'A', slot: 'accessory', cost: 0, description: "Restraints for spirit energy. STR +8.", icon: "🔗", bonusStats: { strength: 8 } },
  { id: 'hero_glove', name: 'Hero Glove', type: 'equipment', rarity: 'S', slot: 'accessory', cost: 0, description: "A simple red glove. STR +15.", icon: "🥊", bonusStats: { strength: 15 } }
];
