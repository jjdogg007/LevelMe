
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
    { name: "Esil", personality: "Demon noble, curious, helpful guide" }
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
                { id: 's1_1', name: 'RUNNING', target: 2, current: 0, unit: 'km' },
                { id: 's1_2', name: 'PUSH-UPS', target: 30, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 1000, xp: 200, item: 'glitch_dagger' }
    },
    // --- CAMEO: GENOS (LEVEL 3) ---
    {
        id: 'cameo_genos',
        title: 'GLITCH: THE DISCIPLE',
        description: 'A blonde cyborg is analyzing your workout data.',
        minLevel: 3,
        lore: [
            "ERROR: DIMENSIONAL CROSSOVER DETECTED.",
            "Subject identified as 'Demon Cyborg'.",
            "He is scanning your muscle density.",
            "He asks: 'Are you the Sensei I've been looking for?'",
            "Show him your explosive power."
        ],
        quest: {
            title: "INCINERATION DRILL",
            description: "Explosive movements to impress the cyborg.",
            timeLeft: "02:00:00",
            difficulty: 'D',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cg_1', name: 'PUSH-UPS', target: 50, current: 0, unit: 'reps' },
                { id: 'cg_2', name: 'PLANK', target: 60, current: 0, unit: 'sec' },
                { id: 'cg_3', name: 'BURPEES', target: 20, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 2000, xp: 400, item: 'cyborg_core' }
    },
    {
        id: 'arc1_ch2',
        title: 'FILE 02: PHANTOM WEIGHT',
        description: 'Gravity feels heavier around you.',
        minLevel: 5,
        lore: [
            "The System is trying to crush you with atmospheric pressure.",
            "Normal people can't feel it. To them, you look exhausted.",
            "But you are holding up the sky.",
            "Strengthen your legs. Do not kneel."
        ],
        quest: {
            title: "ATLAS BURDEN",
            description: "Resist the artificial gravity well.",
            timeLeft: "01:30:00",
            difficulty: 'D',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's2_1', name: 'SQUATS', target: 50, current: 0, unit: 'reps' },
                { id: 's2_2', name: 'LUNGES', target: 40, current: 0, unit: 'reps' },
                { id: 's2_3', name: 'PLANK', target: 60, current: 0, unit: 'sec' }
            ]
        },
        rewards: { gold: 2500, xp: 500 }
    },
    // --- CAMEO: ROCK LEE (LEVEL 8) ---
    {
        id: 'cameo_lee',
        title: 'GLITCH: GREEN BEAST',
        description: 'A bowl-cut warrior challenges your youth.',
        minLevel: 8,
        lore: [
            "ERROR: CHAKRA SIGNATURE DETECTED.",
            "Subject is wearing green spandex.",
            "He is doing handstand pushups while crying.",
            "'If I cannot do 500 reps, I will do 500 more!'",
            "Don't let him outwork you."
        ],
        quest: {
            title: "WEIGHTS OFF",
            description: "High speed leg endurance training.",
            timeLeft: "02:00:00",
            difficulty: 'C',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cl_1', name: 'HIGH KNEES', target: 100, current: 0, unit: 'reps' },
                { id: 'cl_2', name: 'JUMP SQUATS', target: 40, current: 0, unit: 'reps' },
                { id: 'cl_3', name: 'CALF RAISES', target: 50, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 3500, xp: 800, item: 'ankle_weights' }
    },
    // --- CAMEO: ZORO (LEVEL 12) ---
    {
        id: 'cameo_zoro',
        title: 'GLITCH: LOST SWORDSMAN',
        description: 'A man with three swords is confused.',
        minLevel: 12,
        lore: [
            "ERROR: NAVIGATIONAL FAILURE.",
            "Subject is wandering the System interface aimlessly.",
            "He's looking for 'Booze' and 'Training'.",
            "He trains with massive weights.",
            "Earn his respect with core stability."
        ],
        quest: {
            title: "ONIGIRI CORE",
            description: "Rotational strength for sword swinging.",
            timeLeft: "03:00:00",
            difficulty: 'C',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cz_1', name: 'RUSSIAN TWISTS', target: 60, current: 0, unit: 'reps' },
                { id: 'cz_2', name: 'LEG RAISES', target: 30, current: 0, unit: 'reps' },
                { id: 'cz_3', name: 'PLANK', target: 90, current: 0, unit: 'sec' }
            ]
        },
        rewards: { gold: 5000, xp: 1200, item: 'green_bandana' }
    },
    {
        id: 'arc1_ch3',
        title: 'FILE 03: THE NOISE',
        description: 'You hear whispers in the static.',
        minLevel: 15,
        lore: [
            "You aren't the only glitch.",
            "There are things in the shadows. Rejected data.",
            "They are fast. They are hungry.",
            "You need speed to outrun the deletion code."
        ],
        quest: {
            title: "DATA EVASION",
            description: "High-intensity interval evasion.",
            timeLeft: "02:00:00",
            difficulty: 'C',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's3_1', name: 'HIGH KNEES', target: 100, current: 0, unit: 'reps' },
                { id: 's3_2', name: 'MOUNTAIN CLIMBERS', target: 100, current: 0, unit: 'reps' },
                { id: 's3_3', name: 'JUMPING JACKS', target: 100, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 5000, xp: 1000, item: 'scale_armor' }
    },
    // --- CAMEO: NARUTO (LEVEL 20) ---
    {
        id: 'cameo_naruto',
        title: 'GLITCH: SEVENTH HOKAGE',
        description: 'A golden chakra cloak envelops the gym.',
        minLevel: 20,
        lore: [
            "ERROR: KURAMA MODE DETECTED.",
            "The subject has infinite stamina.",
            "He yells 'Believe it!' and sprints towards the tower.",
            "Keep up with the Shadow Clones.",
            "This is your Ninja Way now."
        ],
        quest: {
            title: "WILL OF FIRE",
            description: "Endurance cardio and explosive movements.",
            timeLeft: "03:00:00",
            difficulty: 'B',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cn_1', name: 'BURPEES', target: 30, current: 0, unit: 'reps' },
                { id: 'cn_2', name: 'SPRINTS', target: 400, current: 0, unit: 'm' },
                { id: 'cn_3', name: 'MOUNTAIN CLIMBERS', target: 100, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 7000, xp: 1500, item: 'headband_leaf' }
    },
    {
        id: 'arc1_ch4',
        title: 'FILE 04: THE GATEKEEPER',
        description: 'The System sent a hunter to fix the bug.',
        minLevel: 25,
        lore: [
            "A specialized program has manifested.",
            "It wears the face of a Knight, but its eyes are static.",
            "It does not tire. It does not feel pain.",
            "Break its armor before it breaks your spirit."
        ],
        quest: {
            title: "BOSS: RED KNIGHT",
            description: "Total body destruction required.",
            timeLeft: "03:00:00",
            difficulty: 'B',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's4_1', name: 'BURPEES', target: 50, current: 0, unit: 'reps' },
                { id: 's4_2', name: 'PUSH-UPS', target: 100, current: 0, unit: 'reps' },
                { id: 's4_3', name: 'SIT-UPS', target: 100, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 10000, xp: 3000, shadow: 'igris' }
    },
    // --- CAMEO: LUFFY (LEVEL 30) ---
    {
        id: 'cameo_luffy',
        title: 'GLITCH: SUN GOD',
        description: 'You hear the Drums of Liberation.',
        minLevel: 30,
        lore: [
            "ERROR: REALITY IS RUBBER.",
            "A boy in a straw hat is laughing uncontrollably.",
            "His heartbeat sounds like a drum engine.",
            "He wants you to be the freest person in the gym.",
            "Bounce. Jump. Fly."
        ],
        quest: {
            title: "GEAR 5 INTERVAL",
            description: "Plyometric freedom.",
            timeLeft: "03:00:00",
            difficulty: 'B',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cl_1', name: 'BOX JUMPS', target: 40, current: 0, unit: 'reps' },
                { id: 'cl_2', name: 'JUMP SQUATS', target: 60, current: 0, unit: 'reps' },
                { id: 'cl_3', name: 'JUMPING JACKS', target: 200, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 15000, xp: 4000, item: 'straw_hat' }
    },
    {
        id: 'arc2_ch5',
        title: 'FILE 05: OVERCLOCK',
        description: 'You survived. Now you must evolve.',
        minLevel: 40,
        lore: [
            "The System has stopped trying to delete you.",
            "Now, it is observing you.",
            "It wants to see how much stress your vessel can take.",
            "Push your heart rate to the limit. Overclock the body."
        ],
        quest: {
            title: "LIMIT BREAKER",
            description: "Endurance test. No rest allowed.",
            timeLeft: "01:00:00",
            difficulty: 'A',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's5_1', name: 'RUNNING', target: 5, current: 0, unit: 'km' },
                { id: 's5_2', name: 'JUMP SQUATS', target: 50, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 20000, xp: 5000, item: 'knights_breastplate' }
    },
    // --- CAMEO: YUSUKE (LEVEL 45) ---
    {
        id: 'cameo_yusuke',
        title: 'GLITCH: MAZOKU',
        description: 'Spirit energy levels are critical.',
        minLevel: 45,
        lore: [
            "ERROR: DEMON ENERGY LEAK.",
            "A delinquent in a green uniform is pointing his finger.",
            "'Don't underestimate earthlings!'",
            "Focus all your energy into a single point.",
            "Core stability is the Spirit Gun."
        ],
        quest: {
            title: "SPIRIT FOCUS",
            description: "Advanced isometric holds.",
            timeLeft: "02:00:00",
            difficulty: 'A',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cy_1', name: 'PLANK', target: 180, current: 0, unit: 'sec' },
                { id: 'cy_2', name: 'LEG RAISES', target: 100, current: 0, unit: 'reps' },
                { id: 'cy_3', name: 'RUSSIAN TWISTS', target: 100, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 25000, xp: 6000, item: 'spirit_cuffs' }
    },
    // --- CAMEO: SAITAMA (LEVEL 50) ---
    {
        id: 'cameo_saitama',
        title: 'GLITCH: THE STRONGEST',
        description: 'A bald man in a cape is grocery shopping.',
        minLevel: 50,
        lore: [
            "ERROR: LIMITER REMOVED.",
            "He looks bored.",
            "He just destroyed a meteor by accident.",
            "He offers to teach you his secret training regimen.",
            "Do not die."
        ],
        quest: {
            title: "SERIOUS SERIES",
            description: "The standard hero workout.",
            timeLeft: "05:00:00",
            difficulty: 'S',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 'cs_1', name: 'PUSH-UPS', target: 100, current: 0, unit: 'reps' },
                { id: 'cs_2', name: 'SIT-UPS', target: 100, current: 0, unit: 'reps' },
                { id: 'cs_3', name: 'SQUATS', target: 100, current: 0, unit: 'reps' },
                { id: 'cs_4', name: 'RUNNING', target: 10, current: 0, unit: 'km' }
            ]
        },
        rewards: { gold: 50000, xp: 10000, item: 'hero_glove' }
    },
    {
        id: 'arc2_ch6',
        title: 'FILE 06: ABYSSAL GAZE',
        description: 'The void stares back.',
        minLevel: 55,
        lore: [
            "You have entered the deep database.",
            "Monsters here aren't physical. They attack your mind.",
            "Maintain focus. Stability is key.",
            "Core strength represents your mental walls."
        ],
        quest: {
            title: "MENTAL FORTRESS",
            description: "Advanced core stability routine.",
            timeLeft: "02:00:00",
            difficulty: 'A',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's6_1', name: 'PLANK', target: 180, current: 0, unit: 'sec' },
                { id: 's6_2', name: 'LEG RAISES', target: 60, current: 0, unit: 'reps' },
                { id: 's6_3', name: 'RUSSIAN TWISTS', target: 100, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 30000, xp: 8000 }
    },
    {
        id: 'arc3_ch7',
        title: 'FILE 07: SYSTEM OVERRIDE',
        description: 'You are rewriting the rules.',
        minLevel: 70,
        lore: [
            "You are no longer a user. You are an admin.",
            "The dungeons bend to your will.",
            "But power requires fuel.",
            "Burn the calories. Generate the energy."
        ],
        quest: {
            title: "ENERGY CONVERSION",
            description: "High volume caloric burn.",
            timeLeft: "24:00:00",
            difficulty: 'S',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's7_1', name: 'BURPEES', target: 100, current: 0, unit: 'reps' },
                { id: 's7_2', name: 'RUNNING', target: 10, current: 0, unit: 'km' }
            ]
        },
        rewards: { gold: 50000, xp: 15000, shadow: 'tusk' }
    },
    {
        id: 'arc3_ch8',
        title: 'FILE 08: THE ARCHITECT',
        description: 'Meeting the creator of the code.',
        minLevel: 85,
        lore: [
            "He stands atop a tower of white code.",
            "He designed the System to find the perfect vessel.",
            "He didn't choose you. You forced your way in.",
            "Now you must defeat his perfect creation."
        ],
        quest: {
            title: "BOSS: THE STATUE",
            description: "Survive the final test of power.",
            timeLeft: "04:00:00",
            difficulty: 'S',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's8_1', name: 'SQUATS', target: 200, current: 0, unit: 'reps' },
                { id: 's8_2', name: 'PUSH-UPS', target: 150, current: 0, unit: 'reps' },
                { id: 's8_3', name: 'PULL-UPS', target: 50, current: 0, unit: 'reps' }
            ]
        },
        rewards: { gold: 100000, xp: 25000, item: 'demon_king_ring' }
    },
    {
        id: 'arc4_ch9',
        title: 'FILE 09: ASCENSION',
        description: 'Leaving humanity behind.',
        minLevel: 95,
        lore: [
            "Your heart beats in sync with the server clock.",
            "You see the wires of reality.",
            "One last shackle binds you to the old world.",
            "Break it."
        ],
        quest: {
            title: "MORTAL SHELL",
            description: "One thousand repetitions.",
            timeLeft: "12:00:00",
            difficulty: 'S',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's9_1', name: 'PUSH-UPS', target: 250, current: 0, unit: 'reps' },
                { id: 's9_2', name: 'SIT-UPS', target: 250, current: 0, unit: 'reps' },
                { id: 's9_3', name: 'SQUATS', target: 250, current: 0, unit: 'reps' },
                { id: 's9_4', name: 'RUNNING', target: 5, current: 0, unit: 'km' }
            ]
        },
        rewards: { gold: 200000, xp: 50000, shadow: 'bellion' }
    },
    {
        id: 'arc4_ch10',
        title: 'FILE 10: NEW SYSTEM',
        description: 'You are the System.',
        minLevel: 100,
        lore: [
            "There is no one left to give you quests.",
            "You set the parameters now.",
            "The world is waiting for your command.",
            "Arise."
        ],
        quest: {
            title: "GENESIS",
            description: "Begin your reign.",
            timeLeft: "23:59:59",
            difficulty: 'S',
            status: 'active',
            type: 'story',
            tasks: [
                { id: 's10_1', name: 'BURPEES', target: 100, current: 0, unit: 'reps' },
                { id: 's10_2', name: 'RUNNING', target: 10, current: 0, unit: 'km' }
            ]
        },
        rewards: { gold: 1000000, xp: 100000, item: 'admin_privileges' }
    }
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
            { id: 'dg_1', name: 'JUMPING JACKS', target: 50, current: 0, unit: 'reps' },
            { id: 'dg_2', name: 'HIGH KNEES', target: 50, current: 0, unit: 'reps' },
            { id: 'dg_3', name: 'PLANK', target: 30, current: 0, unit: 'sec' }
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
            { id: 'dg_c1', name: 'MOUNTAIN CLIMBERS', target: 60, current: 0, unit: 'reps' },
            { id: 'dg_c2', name: 'LUNGES', target: 40, current: 0, unit: 'reps' },
            { id: 'dg_c3', name: 'LEG RAISES', target: 20, current: 0, unit: 'reps' }
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
            { id: 'dg_b1', name: 'PUSH-UPS', target: 50, current: 0, unit: 'reps' },
            { id: 'dg_b2', name: 'SQUATS', target: 50, current: 0, unit: 'reps' },
            { id: 'dg_b3', name: 'BURPEES', target: 20, current: 0, unit: 'reps' }
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
            { id: 'rg_1', name: 'BURPEES', target: 30, current: 0, unit: 'reps' },
            { id: 'rg_2', name: 'SPRINTS', target: 400, current: 0, unit: 'm' },
            { id: 'rg_3', name: 'PLANK', target: 90, current: 0, unit: 'sec' },
            { id: 'rg_4', name: 'SQUAT JUMPS', target: 30, current: 0, unit: 'reps' }
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
    { id: '1', name: 'PUSH-UPS', target: 20, current: 0, unit: 'reps' },
    { id: '2', name: 'SIT-UPS', target: 20, current: 0, unit: 'reps' },
    { id: '3', name: 'SQUATS', target: 20, current: 0, unit: 'reps' },
    { id: '4', name: 'RUNNING', target: 2, current: 0, unit: 'km' },
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
      { id: 'jc_1', name: 'BURPEES', target: 50, current: 0, unit: 'reps' },
      { id: 'jc_2', name: 'RUNNING', target: 3, current: 0, unit: 'km' },
      { id: 'jc_3', name: 'PLANK', target: 90, current: 0, unit: 'sec' }
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
  { id: 't-andre', name: "Thomas Andre", level: 125, job: "Tanker" },
  { id: 'cha', name: "Cha Hae-In", level: 95, job: "Blade Dancer" },
  { id: 'rival', name: "Rival Hunter", level: 1, job: "Fighter", isRival: true }, 
  { id: 'woo', name: "Woo Jin-Chul", level: 80, job: "Chief Inspector" },
  { id: 'baek', name: "Baek Yoon-Ho", level: 88, job: "Beast Fighter" },
  { id: 'goto', name: "Goto Ryuji", level: 90, job: "Swordmaster" },
];

export const SYSTEM_DATABASE: Exercise[] = [
    // ... (Keep existing exercises) ...
    { id: 'pushups', name: 'PUSH-UPS', rank: 'E', type: 'Strength', description: "Standard gravity resistance training. Targets anterior chain.", muscles: ['Pectorals', 'Triceps', 'Deltoids'], tips: ['Straight back', 'Full ROM', 'Core engaged'], baseTarget: 20, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Push-up.gif' },
    { id: 'situps', name: 'SIT-UPS', rank: 'E', type: 'Strength', description: "Abdominal flexion movement.", muscles: ['Abs', 'Hip Flexors'], tips: ['Don\'t pull neck', 'Controlled descent'], baseTarget: 30, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Sit-up.gif' },
    { id: 'squats', name: 'SQUATS', rank: 'E', type: 'Strength', description: "Fundamental lower body compound movement.", muscles: ['Quads', 'Glutes', 'Hamstrings'], tips: ['Knees out', 'Chest up', 'Heels down'], baseTarget: 30, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats.gif' },
    { id: 'running', name: 'RUNNING', rank: 'E', type: 'Cardio', description: "Sustained cardiovascular effort.", muscles: ['Heart', 'Calves', 'Quads'], tips: ['Rhythmic breathing', 'Good posture'], baseTarget: 3, defaultUnit: 'km', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Running_treadmill.gif' },
    { id: 'plank', name: 'PLANK', rank: 'E', type: 'Strength', description: "Isometric core stabilization.", muscles: ['Core', 'Shoulders'], tips: ['Don\'t let hips sag', 'Squeeze glutes'], baseTarget: 60, defaultUnit: 'sec', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Plank.gif' },
    { id: 'jumping_jacks', name: 'JUMPING JACKS', rank: 'E', type: 'Cardio', description: "Rhythmic full-body coordination.", muscles: ['Calves', 'Shoulders', 'Cardio'], tips: ['Light on feet', 'Full arm extension'], baseTarget: 50, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Jumping_Jacks.gif' },
    { id: 'lunges', name: 'WALKING LUNGES', rank: 'E', type: 'Strength', description: "Unilateral leg strengthening.", muscles: ['Quads', 'Glutes'], tips: ['Torso upright', 'Knee touch ground'], baseTarget: 20, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Lunge-1.gif' },
    { id: 'mountain_climbers', name: 'MOUNTAIN CLIMBERS', rank: 'E', type: 'Cardio', description: "Rapid hip flexion in plank position.", muscles: ['Core', 'Shoulders', 'Cardio'], tips: ['Keep hips low', 'Fast pace'], baseTarget: 40, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Mountain_Climbers.gif' },
    { id: 'high_knees', name: 'HIGH KNEES', rank: 'E', type: 'Cardio', description: "Stationary sprinting with max hip flexion.", muscles: ['Hip Flexors', 'Cardio'], tips: ['Knees to waist height', 'Quick ground contact'], baseTarget: 50, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/High_Knees.gif' }, 
    { id: 'glute_bridge', name: 'GLUTE BRIDGE', rank: 'E', type: 'Strength', description: "Posterior chain activation from supine position.", muscles: ['Glutes', 'Hamstrings'], tips: ['Squeeze at top', 'Drive through heels'], baseTarget: 20, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Glute_Bridge.gif' },
    { id: 'pullups', name: 'PULL-UPS', rank: 'D', type: 'Strength', description: "Vertical pulling bodyweight exercise.", muscles: ['Lats', 'Biceps'], tips: ['Chin over bar', 'Dead hang start'], requirements: "Strength 15", baseTarget: 5, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Pull-up.gif' },
    { id: 'dips', name: 'DIPS', rank: 'D', type: 'Strength', description: "Vertical pushing on parallel bars.", muscles: ['Triceps', 'Chest'], tips: ['Lean for chest', 'Upright for triceps'], baseTarget: 8, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Bench_Dips.gif' },
    { id: 'burpees', name: 'BURPEES', rank: 'D', type: 'Cardio', description: "Explosive full-body metabolic conditioning.", muscles: ['Full Body', 'Cardio'], tips: ['Efficient movement', 'Pace yourself'], baseTarget: 10, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Burpee.gif' },
    { id: 'leg_raises', name: 'HANGING LEG RAISES', rank: 'D', type: 'Strength', description: "Hip flexion while suspended.", muscles: ['Abs', 'Hip Flexors'], tips: ['No swinging', 'Control descent'], baseTarget: 10, defaultUnit: 'reps' },
    { id: 'jump_squats', name: 'JUMP SQUATS', rank: 'D', type: 'Plyometrics', description: "Explosive variation of the standard squat.", muscles: ['Quads', 'Glutes', 'Fast Twitch'], tips: ['Soft landing', 'Max height'], baseTarget: 15, defaultUnit: 'reps' },
    { id: 'diamond_pushups', name: 'DIAMOND PUSH-UPS', rank: 'D', type: 'Strength', description: "Close-grip press focusing on triceps.", muscles: ['Triceps', 'Inner Chest'], tips: ['Hands touching', 'Elbows tucked'], baseTarget: 10, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Diamond_Pushup.gif' },
    { id: 'russian_twists', name: 'RUSSIAN TWISTS', rank: 'D', type: 'Strength', description: "Rotational core strengthening.", muscles: ['Obliques', 'Abs'], tips: ['Feet off ground', 'Full rotation'], baseTarget: 30, defaultUnit: 'reps' },
    { id: 'calf_raises', name: 'CALF RAISES', rank: 'D', type: 'Strength', description: "Isolation of the gastrocnemius.", muscles: ['Calves'], tips: ['Full stretch at bottom', 'Squeeze top'], baseTarget: 25, defaultUnit: 'reps', videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Calf_Raise.gif' },
    { id: 'box_jumps', name: 'BOX JUMPS', rank: 'D', type: 'Plyometrics', description: "Vertical leap onto elevated platform.", muscles: ['Legs', 'Explosive Power'], tips: ['Land soft', 'Stand up fully'], baseTarget: 10, defaultUnit: 'reps' },
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
  { id: 'straw_hat', name: 'Straw Hat', type: 'equipment', rarity: 'A', slot: 'accessory', cost: 0, description: "Symbol of a free era. AGI +10.", icon: "👒", bonusStats: { agility: 10 } },
  { id: 'spirit_cuffs', name: 'Spirit Cuffs', type: 'equipment', rarity: 'A', slot: 'accessory', cost: 0, description: "Heavy restraints. Training with them doubles gains. STR +8.", icon: "🔗", bonusStats: { strength: 8 } },
  { id: 'hero_glove', name: 'Red Glove', type: 'equipment', rarity: 'S', slot: 'weapon', cost: 0, description: "One punch is all it takes. STR +20.", icon: "🥊", bonusStats: { strength: 20 } },
];
