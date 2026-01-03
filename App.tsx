
import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, DailyQuest, ViewState, QuestTask, Hunter, Dungeon, Item, Rarity, Exercise } from './types';
import { INITIAL_STATS, INITIAL_DAILY_QUEST, REST_DAY_TASKS, SYSTEM_DATABASE, SHADOW_ARMY, INITIAL_HUNTERS, STARTING_CLASSES, PATROL_MISSIONS, JOB_CHANGE_QUEST, STORY_CAMPAIGN, WORLD_BOSS, MASTERY_THRESHOLDS } from './constants';
import { StatusView } from './components/StatusView';
import { QuestView } from './components/QuestView';
import { LeaderboardView } from './components/LeaderboardView';
import { ShopView } from './components/ShopView';
import { PenaltyView } from './components/PenaltyView';
import { GrimoireView } from './components/GrimoireView';
import { DungeonView } from './components/DungeonView';
import { StoryView } from './components/StoryView';
import { WorldBossView } from './components/WorldBossView';
import { HunterCard } from './components/HunterCard';
import { Navigation } from './components/Navigation';
import { AuthScreen } from './components/AuthScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { SystemTicker } from './components/SystemTicker';
import { ActiveExerciseModal } from './components/ActiveExerciseModal';
import { ReawakeningScreen } from './components/ReawakeningScreen';
import { generatePersonalizedWorkout } from './services/geminiService';
import { playSystemSound, speakSystemMessage, initAudio } from './services/audioService';
import { fetchDailySteps } from './services/googleFitService';
import { db, isFirebaseConfigured } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LevelUpParticles = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
                <div 
                    key={i}
                    className="absolute bg-yellow-500 rounded-full opacity-60"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                        animation: `float-up ${Math.random() * 2 + 1}s ease-in infinite`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes float-up {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(-100px) scale(0); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// Job Priority Map for Auto-Leveling
const JOB_STAT_PRIORITY: Record<string, (keyof PlayerStats)[]> = {
    'Fighter': ['strength', 'vitality', 'agility'],
    'Assassin': ['agility', 'sense', 'strength'],
    'Tanker': ['vitality', 'strength', 'intelligence'],
    'Mage': ['intelligence', 'sense', 'vitality'],
    'Berserker': ['strength', 'strength', 'vitality'], // Double strength weight
    'Ninja': ['agility', 'agility', 'sense'],
    'Paladin': ['vitality', 'intelligence', 'strength'],
    'Necromancer': ['intelligence', 'intelligence', 'sense'],
    'Shadow Monarch': ['intelligence', 'strength', 'agility', 'sense', 'vitality']
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState<string>('');
  
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.QUESTS);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isDungeonOpen, setIsDungeonOpen] = useState(false);
  const [isHunterCardOpen, setIsHunterCardOpen] = useState(false); 
  const [isReawakening, setIsReawakening] = useState(false);
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false); // New explicit modal state
  
  // Initialize with INITIAL_HUNTERS instead of empty array
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [hunters, setHunters] = useState<Hunter[]>(INITIAL_HUNTERS);
  const [dailyQuest, setDailyQuest] = useState<DailyQuest>(INITIAL_DAILY_QUEST);
  const [specialQuest, setSpecialQuest] = useState<DailyQuest | null>(null);
  
  // Shadow State
  const [shadowStatus, setShadowStatus] = useState<Record<string, any>>({});
  const [bossState, setBossState] = useState(WORLD_BOSS);
  
  // Active Exercise Modal State
  const [activeExercise, setActiveExercise] = useState<QuestTask | null>(null);
  const [raidMode, setRaidMode] = useState(false); // Flag if workout is for Raid

  const [isQuestStarted, setIsQuestStarted] = useState(false);
  const [victoryState, setVictoryState] = useState<{ xp: number, gold: number, item?: string, shadow?: string, isLevelUp?: boolean, grade?: string } | null>(null);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [penaltyMessage, setPenaltyMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [transitionState, setTransitionState] = useState<'IDLE' | 'EXIT' | 'ENTER'>('IDLE');
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  // Gate Scanning
  const [dailySteps, setDailySteps] = useState(0);

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Debounce ref for saving
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- MULTIVERSE MIGRATION CHECK ---
  useEffect(() => {
      // Logic to inject new characters into old save files
      const storedHunters = localStorage.getItem('leveling_hunters');
      if (storedHunters) {
          try {
              const currentList = JSON.parse(storedHunters) as Hunter[];
              const missingLegends = INITIAL_HUNTERS.filter(
                  initH => !currentList.some(currH => currH.id === initH.id)
              );

              if (missingLegends.length > 0) {
                  console.log("Injecting missing legends:", missingLegends);
                  const mergedList = [...currentList, ...missingLegends];
                  setHunters(mergedList);
                  localStorage.setItem('leveling_hunters', JSON.stringify(mergedList));
              } else {
                  setHunters(currentList);
              }
          } catch (e) {
              console.error("Error migrating hunters", e);
              setHunters(INITIAL_HUNTERS);
          }
      }
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // Helper: Get Stats with Shadow Buffs included
  const getEffectiveStats = (baseStats: PlayerStats) => {
      let effective = { ...baseStats };
      
      baseStats.shadows.forEach(shadowId => {
          const def = SHADOW_ARMY.find(s => s.id === shadowId);
          if (def && def.buff) {
              Object.entries(def.buff).forEach(([key, val]) => {
                  // @ts-ignore
                  effective[key] = (effective[key] || 0) + val;
              });
          }
      });
      return effective;
  };

  const getShadowMultipliers = (baseStats: PlayerStats) => {
      let xpMult = 1;
      let goldMult = 1;
      baseStats.shadows.forEach(shadowId => {
          const def = SHADOW_ARMY.find(s => s.id === shadowId);
          if (def) {
              if (def.xpMultiplier) xpMult *= def.xpMultiplier;
              if (def.goldMultiplier) goldMult *= def.goldMultiplier;
          }
      });
      return { xpMult, goldMult };
  };

  // --- AURA VISUAL PROGRESSION ---
  const getLevelAura = (level: number) => {
      if (level >= 100) return 'shadow-[0_0_50px_rgba(0,0,0,0.9)] border-gray-900 bg-black'; // Monarch (Black)
      if (level >= 80) return 'shadow-[0_0_40px_rgba(147,51,234,0.3)] border-purple-900'; // National Level (Purple)
      if (level >= 40) return 'shadow-[0_0_30px_rgba(220,38,38,0.2)] border-red-900'; // High Rank (Red)
      if (level >= 20) return 'shadow-[0_0_20px_rgba(37,99,235,0.2)] border-blue-900'; // Mid Rank (Blue)
      return ''; // Basic
  };

  // --- MOBILE AUDIO UNLOCKER ---
  useEffect(() => {
      const unlockHandler = () => {
          initAudio();
          window.removeEventListener('click', unlockHandler);
          window.removeEventListener('touchstart', unlockHandler);
      };
      
      window.addEventListener('click', unlockHandler);
      window.addEventListener('touchstart', unlockHandler);
      
      return () => {
          window.removeEventListener('click', unlockHandler);
          window.removeEventListener('touchstart', unlockHandler);
      };
  }, []);

  // --- SIMULATION LOOPS ---
  // Boss Passive Damage (NPCs fighting)
  useEffect(() => {
      const interval = setInterval(() => {
          setBossState(prev => {
              if (prev.currentHp <= 0) return prev;
              const dmg = Math.floor(Math.random() * 500) + 100; // Small tick damage
              return { ...prev, currentHp: Math.max(0, prev.currentHp - dmg) };
          });
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  // --- LEADERBOARD & RIVAL SIMULATION ---
  const updateHunters = (playerLevel: number) => {
      setHunters(prevHunters => {
          return prevHunters.map(h => {
              if (h.isRival) {
                  // Rival tracks close to player
                  const levelDiff = playerLevel - h.level;
                  let levelGain = 0;
                  if (levelDiff > 0) levelGain = Math.floor(Math.random() * 2) + 1; // Catch up
                  else if (levelDiff < 0) levelGain = Math.random() > 0.9 ? 1 : 0; // Slow down
                  else levelGain = Math.random() > 0.5 ? 1 : 0; // Match pace
                  return { ...h, level: h.level + levelGain };
              }
              // NPCs
              if (h.level > 100) {
                   if (Math.random() > 0.95) return { ...h, level: h.level + 1 };
              } else {
                   if (Math.random() > 0.8) return { ...h, level: h.level + 1 };
              }
              return h;
          });
      });
  };

  const handleAddRival = (code: string) => {
      playSystemSound('success');
      setHunters(prev => [...prev, {
          id: `rival_${Date.now()}`,
          name: `Hunter ${code.substring(6, 9) || 'XXX'}`,
          level: stats.level, 
          job: 'Unknown',
          isRival: true
      }]);
      alert("Hunter Link Established.");
  };

  const handleExtractShadow = (hunterId: string) => {
      const rival = hunters.find(h => h.id === hunterId);
      if (!rival) return;

      const successChance = rival.level < stats.level ? 0.8 : 0.3; // Higher chance if higher level
      if (Math.random() < successChance) {
          playSystemSound('levelUp');
          setNotificationMsg("Shadow Extraction Successful.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          setStats(prev => ({
              ...prev,
              strength: prev.strength + 2, // Temp buff
              gold: prev.gold - 500
          }));
      } else {
          playSystemSound('glitch');
          setNotificationMsg("Extraction Failed.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
      }
  };

  const handlePrestige = () => {
      if (stats.level < 100) {
          playSystemSound('glitch');
          setNotificationMsg("Level 100 Required to break the limit.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          return;
      }
      playSystemSound('click');
      setShowPrestigeConfirm(true); // Trigger custom modal
  };

  const confirmReawakening = () => {
      playSystemSound('start');
      setShowPrestigeConfirm(false);
      setIsReawakening(true);
  };

  const finalizeReawakening = () => {
      setStats(prev => ({
          ...prev,
          level: 1,
          prestigeLevel: (prev.prestigeLevel || 0) + 1,
          strength: 10 + ((prev.prestigeLevel || 0) + 1) * 5,
          agility: 10 + ((prev.prestigeLevel || 0) + 1) * 5,
          vitality: 10 + ((prev.prestigeLevel || 0) + 1) * 5,
          intelligence: 10 + ((prev.prestigeLevel || 0) + 1) * 5,
          sense: 10 + ((prev.prestigeLevel || 0) + 1) * 5,
          unspentPoints: 0,
          xp: 0,
          maxXp: 100,
          storyLog: [] // Reset story on prestige for New Game+ feel
      }));
      setIsReawakening(false);
      setNotificationMsg("SYSTEM REBOOT: REAWAKENING COMPLETE.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
  };

  const generateStaticQuest = (type: 'WORKOUT' | 'REST'): DailyQuest => {
      if (type === 'REST') {
          const shuffled = [...REST_DAY_TASKS].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 3);
          
          return {
              title: "REST DAY",
              description: "Recovery is essential for growth.",
              timeLeft: "23:59:59",
              difficulty: 'E',
              status: 'active',
              type: 'rest',
              tasks: selected.map((t, i) => ({
                  id: `rest_${Date.now()}_${i}`,
                  name: t.name,
                  target: t.target,
                  current: 0,
                  unit: t.unit
              }))
          };
      } else {
          let pool = [...SYSTEM_DATABASE];
          const shuffled = pool.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 4);

          return {
              title: "DAILY TRAINING",
              description: "Complete the following to maintain your streak.",
              timeLeft: "23:59:59",
              difficulty: 'E',
              status: 'active',
              type: 'daily',
              tasks: selected.map((ex, i) => {
                  const base = ex.baseTarget || 10;
                  const rawMultiplier = 1 + ((stats.level - 1) * 0.02);
                  const multiplier = Math.min(rawMultiplier, 2.5); 
                  const scaledTarget = Math.ceil(base * multiplier);
                  return {
                      id: `work_${Date.now()}_${i}`,
                      name: ex.name,
                      target: scaledTarget,
                      current: 0,
                      unit: ex.defaultUnit || 'reps',
                      exerciseId: ex.id
                  };
              })
          };
      }
  };

  // Poll for Steps if Google Fit connected
  useEffect(() => {
      if (isLoggedIn) {
          fetchDailySteps().then(steps => setDailySteps(steps));
          const interval = setInterval(() => {
              fetchDailySteps().then(steps => setDailySteps(steps));
          }, 30000); // Check every 30s
          return () => clearInterval(interval);
      }
  }, [isLoggedIn]);

  // Check Job Change Event on Load/Stats Change
  useEffect(() => {
      // If Level 40 and still Basic Job -> Force Job Change
      const isBasicJob = STARTING_CLASSES.some(c => c.name === stats.job) || stats.job === "None";
      if (isLoggedIn && stats.level >= 40 && isBasicJob && !specialQuest) {
          playSystemSound('glitch');
          setSpecialQuest(JOB_CHANGE_QUEST);
          setNotificationMsg("SYSTEM ALERT: JOB CHANGE QUEST AVAILABLE");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
      }
  }, [stats.level, stats.job, isLoggedIn]);

  // Check Rest Day
  useEffect(() => {
    if (isLoggedIn && stats.trainingDays) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        if (!stats.trainingDays.includes(today) && dailyQuest.title !== "REST DAY") {
             setDailyQuest(generateStaticQuest('REST'));
             setIsQuestStarted(false);
        } 
    }
  }, [isLoggedIn, stats.trainingDays]);

  // Dungeon Break Simulation (Random while playing)
  useEffect(() => {
      if (!isLoggedIn) return;
      const randomChance = Math.random();
      if (stats.notifications?.workouts && randomChance > 0.99 && !dailyQuest.type?.includes('emergency')) {
          setTimeout(() => {
              playSystemSound('glitch');
              speakSystemMessage("Warning. Red Gate detected.");
              setNotificationMsg("WARNING: RED GATE DETECTED");
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 5000);
              
              setDailyQuest(prev => ({
                  ...prev,
                  title: "EMERGENCY QUEST",
                  description: "A Dungeon Break has occurred. Clear enemies immediately.",
                  difficulty: "S",
                  type: "emergency",
                  tasks: [
                      { id: 'e1', name: 'BURPEES', target: 20, current: 0, unit: 'reps' },
                      { id: 'e2', name: 'MOUNTAIN CLIMBERS', target: 40, current: 0, unit: 'reps' }
                  ]
              }));
          }, 3000);
      }
  }, [isLoggedIn]);

  // --- SAVE STATE (Debounced) ---
  useEffect(() => {
      if (isLoggedIn && playerName) {
          // Clear previous timeout
          if (saveTimeoutRef.current) {
              clearTimeout(saveTimeoutRef.current);
          }

          // Debounce save by 2 seconds
          saveTimeoutRef.current = setTimeout(async () => {
              // Local Backup
              localStorage.setItem('leveling_player_stats', JSON.stringify(stats));
              localStorage.setItem('leveling_player_name', playerName);
              localStorage.setItem('leveling_quest_started', JSON.stringify(isQuestStarted));
              localStorage.setItem('leveling_hunters', JSON.stringify(hunters));
              localStorage.setItem('leveling_shadow_status', JSON.stringify(shadowStatus));
              if (specialQuest) localStorage.setItem('leveling_special_quest', JSON.stringify(specialQuest));
              else localStorage.removeItem('leveling_special_quest');

              // Cloud Sync (Firebase)
              if (isFirebaseConfigured() && db) {
                  try {
                      const docRef = doc(db, 'players', playerName);
                      await setDoc(docRef, {
                          name: playerName,
                          stats: stats,
                          updated_at: new Date().toISOString()
                      }, { merge: true });
                  } catch (err) {
                      console.error("Cloud Sync Failed", err);
                  }
              }
          }, 2000);
      }
      
      return () => {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      }
  }, [stats, playerName, isLoggedIn, isQuestStarted, hunters, shadowStatus, specialQuest]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); 
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) return "00:00:00";
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    setDailyQuest(prev => ({ ...prev, timeLeft: calculateTimeLeft() }));
    const timer = setInterval(() => {
      setDailyQuest(prev => ({ ...prev, timeLeft: calculateTimeLeft() }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const initializePlayerState = (loadedStats: PlayerStats, name: string) => {
        // Backwards compatibility for new features
        if (!loadedStats.hunterCode) loadedStats.hunterCode = `H-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        if (!loadedStats.skillMastery) loadedStats.skillMastery = {};
        if (!loadedStats.customVisuals) loadedStats.customVisuals = {}; // Init
        if (!loadedStats.prestigeLevel) loadedStats.prestigeLevel = 0;
        if (!loadedStats.completedChapters) loadedStats.completedChapters = [];
        if (!loadedStats.hiddenStats) loadedStats.hiddenStats = { strengthReps: 0, cardioReps: 0, totalWorkouts: 0 };
        if (loadedStats.autoDistributeStats === undefined) loadedStats.autoDistributeStats = false;
        if (!loadedStats.storyLog) loadedStats.storyLog = [];
        if (!loadedStats.relationships) loadedStats.relationships = {};

        const lastLogin = new Date(loadedStats.lastLoginDate);
        const today = new Date();
        const lastDateOnly = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const diffTime = Math.abs(todayDateOnly.getTime() - lastDateOnly.getTime());
        const diffHours = Math.abs(today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        let newStreak = loadedStats.streak;
        let newXp = loadedStats.xp;
        let shieldUsed = false;
        
        // === DUNGEON BREAK LOGIC (Rule-Based Inactivity) ===
        if (diffHours > 48) {
            // Force Emergency Quest
            setDailyQuest(prev => ({
                ...prev,
                title: "DUNGEON BREAK DETECTED",
                description: "You have ignored the System for too long. A Red Gate has opened.",
                difficulty: "S",
                status: 'active',
                type: "emergency",
                tasks: [
                    { id: 'break_1', name: 'BURPEES', target: 30, current: 0, unit: 'reps' },
                    { id: 'break_2', name: 'MOUNTAIN CLIMBERS', target: 50, current: 0, unit: 'reps' },
                    { id: 'break_3', name: 'PLANK', target: 90, current: 0, unit: 'sec' }
                ]
            }));
            setIsQuestStarted(true); 
            setNotificationMsg("SYSTEM ALERT: SURVIVE THE BREAK");
            setShowNotification(true);
        } 
        else if (diffDays > 1 && loadedStats.streak > 0) {
            if (loadedStats.streakShield) {
                shieldUsed = true;
                setNotificationMsg("Streak Shield Activated. Fatigue Negated.");
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 4000);
            } else {
                newStreak = 0;
                newXp = Math.max(0, newXp - 50); 
                playSystemSound('glitch');
                setPenaltyMessage("QUEST FAILED. Streak reset. -50 XP.");
                setIsQuestStarted(false);
                setDailyQuest(prev => ({...prev, status: 'failed'}));
            }
        }
        
        setStats({
            ...loadedStats,
            streak: newStreak,
            xp: newXp,
            streakShield: shieldUsed ? false : loadedStats.streakShield, 
            lastLoginDate: new Date().toISOString()
        });
        setPlayerName(name);
        setIsLoggedIn(true);
        speakSystemMessage(`Welcome back, ${name}.`);
  };

  const handleAuthLogin = async (name: string, startingStats?: Partial<PlayerStats>): Promise<boolean> => {
      // 1. Check Firebase First
      if (isFirebaseConfigured() && db) {
          try {
              const docRef = doc(db, 'players', name);
              
              if (startingStats) {
                  // SIGNUP FLOW: Create New User
                  // Check if exists first to avoid overwriting
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                      alert("Identity already taken. Choose another.");
                      return false;
                  }

                  const newHunterCode = `H-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
                  const fullStats = {
                      ...INITIAL_STATS,
                      ...startingStats,
                      title: "Novice Hunter",
                      hunterCode: newHunterCode,
                      lastLoginDate: new Date().toISOString()
                  };
                  
                  await setDoc(docRef, {
                      name: name,
                      stats: fullStats,
                      created_at: new Date().toISOString()
                  });
                  
                  initializePlayerState(fullStats, name);
                  return true;
              } else {
                  // LOGIN FLOW: Fetch User
                  const docSnap = await getDoc(docRef);
                  
                  if (!docSnap.exists()) return false; // User not found
                  
                  // Load fetched data
                  const data = docSnap.data();
                  initializePlayerState(data.stats, name);
                  return true;
              }
          } catch (err) {
              console.error("Firebase Error:", err);
              // Fallback to LocalStorage if network fail
          }
      }

      // 2. LocalStorage Fallback (Offline Mode)
      const savedName = localStorage.getItem('leveling_player_name');
      const savedStats = localStorage.getItem('leveling_player_stats');

      if (startingStats) {
          // Local Signup
          const newHunterCode = `H-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          const fullStats = {
              ...INITIAL_STATS,
              ...startingStats,
              title: "Novice Hunter",
              hunterCode: newHunterCode,
              lastLoginDate: new Date().toISOString()
          };
          initializePlayerState(fullStats, name);
          return true;
      } else {
          // Local Login Check
          if (savedName && savedName.toLowerCase() === name.toLowerCase() && savedStats) {
              initializePlayerState(JSON.parse(savedStats), savedName);
              return true;
          }
      }

      return false;
  };

  const handleIncreaseStat = (stat: keyof PlayerStats) => {
      if (stats.unspentPoints > 0) {
          setStats(prev => ({
              ...prev,
              [stat]: (prev[stat] as number) + 1,
              unspentPoints: prev.unspentPoints - 1
          }));
      }
  };
  
  const handleUpdateProfile = (updates: Partial<PlayerStats>) => {
      if (updates.weight) {
          const wVal = parseFloat(updates.weight);
          const historyEntry = { date: new Date().toLocaleDateString(), weight: wVal || 0 };
          setStats(prev => ({
              ...prev,
              ...updates,
              weightHistory: [...(prev.weightHistory || []), historyEntry]
          }));
      } else {
          setStats(prev => ({ ...prev, ...updates }));
      }
  };

  const handleSelectDungeon = (dungeon: Dungeon) => {
      const keyIndex = stats.inventory.indexOf(dungeon.keyId);
      let newInventory = [...stats.inventory];
      if (keyIndex > -1) {
          newInventory.splice(keyIndex, 1);
          setStats(prev => ({ ...prev, inventory: newInventory }));
      }

      setSpecialQuest({
          title: `DUNGEON: ${dungeon.name}`,
          description: dungeon.description,
          difficulty: dungeon.rank as any,
          status: 'active',
          timeLeft: '04:00:00',
          type: 'dungeon',
          dungeonRank: dungeon.rank,
          bossName: dungeon.boss,
          startedAt: Date.now(), // Track start time for grading
          tasks: dungeon.tasks.map(t => ({...t, current: 0}))
      });
      setIsDungeonOpen(false);
      setNotificationMsg(`ENTERED: ${dungeon.name}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
  };

  const handleStartStoryChapter = (quest: DailyQuest, chapterId: string) => {
      setSpecialQuest(quest);
      setCurrentView(ViewState.QUESTS);
      setNotificationMsg("STORY MISSION INITIATED");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
  };

  // --- RAID MECHANICS ---
  const handleRaidAttack = (damage: number) => {
      // Legacy handler, now unused but kept for compatibility just in case
      const { xpMult } = getShadowMultipliers(stats);
      setStats(prev => ({
          ...prev,
          xp: prev.xp + Math.ceil(10 * xpMult),
          totalXp: prev.totalXp + Math.ceil(10 * xpMult)
      }));
      setBossState(prev => ({
          ...prev,
          currentHp: Math.max(0, prev.currentHp - damage)
      }));
  };

  const handleSelectRaidAction = (exercise: Exercise) => {
      playSystemSound('click');
      setRaidMode(true);
      setActiveExercise({
          id: `raid_${Date.now()}`,
          name: exercise.name,
          target: 20, // Default batch
          current: 0,
          unit: exercise.defaultUnit || 'reps',
          exerciseId: exercise.id
      });
  };

  const handleAddItem = (item: Item) => {
      // Logic for adding scanned items
      setStats(prev => {
          const newInventory = [...prev.inventory, item.id];
          const newState = { ...prev, inventory: newInventory };
          
          if (item.bonusStats) {
              Object.entries(item.bonusStats).forEach(([key, val]) => {
                  // @ts-ignore
                  newState[key] = (newState[key] || 0) + val;
              });
          }
          return newState;
      });
  };

  const handleUseItem = (item: Item) => {
      // Remove item from inventory
      const index = stats.inventory.indexOf(item.id);
      if (index === -1) return;

      const newInventory = [...stats.inventory];
      newInventory.splice(index, 1);

      if (item.id === 'potion') {
          playSystemSound('levelUp');
          setStats(prev => ({ 
              ...prev, 
              inventory: newInventory,
              streakShield: true, 
              fatigue: 0 
          }));
          setNotificationMsg("POTION CONSUMED: FATIGUE RESTORED");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
      } else if (item.id === 'bandages') {
          playSystemSound('success');
          setStats(prev => ({ ...prev, inventory: newInventory }));
          alert("Bandages applied. You look cool.");
      } else {
          // Default behavior for other consumables
          setStats(prev => ({ ...prev, inventory: newInventory }));
          alert(`${item.name} used.`);
      }
  };

  const handleUpdateCustomVisual = (name: string, url: string) => {
      setStats(prev => ({
          ...prev,
          customVisuals: {
              ...(prev.customVisuals || {}),
              [name]: url
          }
      }));
  };

  const handleUpdateTask = (taskId: string, newValue: number, isSpecial: boolean = false) => {
    // --- RAID LOGIC ---
    if (raidMode && activeExercise) {
        // Calculate Damage from this batch
        const reps = newValue; // The modal passes total current, but logic handles increment
        // Reset raid mode done in handleFinishExercise
        return;
    }

    const currentQuest = isSpecial ? specialQuest : dailyQuest;
    const task = currentQuest?.tasks.find(t => t.id === taskId);
    const delta = task ? Math.max(0, newValue - task.current) : 0;

    const processCompletion = (questType: string, updatedStats: PlayerStats, questData?: any) => {
        let rewardXp = 200;
        let rewardGold = 500;
        let droppedItem: string | undefined = undefined;
        let droppedShadow: string | undefined = undefined;
        let isLevelUp = false;
        let clearGrade = 'E';

        const effectiveStats = getEffectiveStats(updatedStats);
        const { xpMult, goldMult } = getShadowMultipliers(updatedStats);
        const intBonus = 1 + (effectiveStats.intelligence * 0.02);

        // Job Change Reward
        if (questType === 'job_change') {
            rewardXp = 10000;
            rewardGold = 50000;
            updatedStats.job = "Shadow Monarch";
            updatedStats.title = "Monarch of Shadows";
            setNotificationMsg("JOB CHANGE COMPLETE: SHADOW MONARCH");
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 6000);
        }
        else if (questType === 'story') {
            const isReplay = updatedStats.completedChapters?.includes(questData.storyChapterId);
            const chapter = STORY_CAMPAIGN.find(c => c.id === questData.storyChapterId);
            if (chapter) {
                if (isReplay) {
                    rewardXp = Math.floor(chapter.rewards.xp * 0.1 * intBonus * xpMult);
                    rewardGold = Math.floor(chapter.rewards.gold * 0.1 * intBonus * goldMult);
                } else {
                    rewardXp = Math.floor(chapter.rewards.xp * intBonus * xpMult);
                    rewardGold = Math.floor(chapter.rewards.gold * intBonus * goldMult);
                    droppedItem = chapter.rewards.item;
                    droppedShadow = chapter.rewards.shadow;
                    updatedStats.completedChapters = [...updatedStats.completedChapters, questData.storyChapterId];
                }
            }
        } else if (questType === 'dungeon') {
             // Calculate Grade
             const timeTaken = Date.now() - (questData.startedAt || 0);
             const limit = 4 * 60 * 60 * 1000; // 4 hours usually
             const ratio = timeTaken / limit;
             
             if (ratio < 0.2) clearGrade = 'S';
             else if (ratio < 0.4) clearGrade = 'A';
             else if (ratio < 0.6) clearGrade = 'B';
             else clearGrade = 'C';

             const baseXp = questData.dungeonRank === 'S' ? 2000 : questData.dungeonRank === 'B' ? 600 : 200;
             const baseGold = questData.dungeonRank === 'S' ? 5000 : 1000;
             
             // Grade Multipliers
             let gradeMult = 1;
             if (clearGrade === 'S') gradeMult = 2.0;
             if (clearGrade === 'A') gradeMult = 1.5;
             if (clearGrade === 'B') gradeMult = 1.2;

             rewardXp = Math.floor(baseXp * intBonus * xpMult * gradeMult);
             rewardGold = Math.floor(baseGold * intBonus * goldMult * gradeMult);
             
             // S-Rank Clear Drop (50% Chance for random potion if no item specific)
             if (clearGrade === 'S' && Math.random() > 0.5) {
                 droppedItem = 'potion';
             }
        } else if (questType === 'daily') {
             rewardXp = Math.floor(300 * intBonus * xpMult);
             rewardGold = Math.floor(500 * intBonus * goldMult);
             updatedStats.streak += 1;
             updatedStats.hiddenStats.totalWorkouts += 1;
             
             // Log Completion Date
             const todayStr = new Date().toISOString().split('T')[0];
             if (!updatedStats.history.includes(todayStr)) {
                 updatedStats.history.push(todayStr);
             }
             
             SHADOW_ARMY.forEach(shadow => {
                 if (updatedStats.streak >= shadow.requirement && !updatedStats.shadows.includes(shadow.id)) {
                     droppedShadow = shadow.name;
                     updatedStats.shadows.push(shadow.id);
                 }
             });

             // Random Key Drop on Daily Completion
             if (Math.random() > 0.8) { // 20% Chance
                 const keyRoll = Math.random();
                 if (keyRoll > 0.9) droppedItem = 'key_s';
                 else if (keyRoll > 0.7) droppedItem = 'key_a';
                 else droppedItem = 'key_e';
             }
        }

        updatedStats.xp += rewardXp;
        updatedStats.totalXp += rewardXp;
        updatedStats.gold += rewardGold;
        
        if (droppedItem && !updatedStats.inventory.includes(droppedItem)) {
            updatedStats.inventory.push(droppedItem);
        }
        if (droppedShadow && !updatedStats.shadows.includes(droppedShadow.toLowerCase())) {
             updatedStats.shadows.push(droppedShadow.toLowerCase());
        }

        if (updatedStats.xp >= updatedStats.maxXp) {
            updatedStats.level += 1;
            updatedStats.xp = updatedStats.xp - updatedStats.maxXp;
            updatedStats.maxXp = Math.floor(updatedStats.maxXp * 1.5);
            updatedStats.hp = updatedStats.maxHp;
            updatedStats.mp = updatedStats.maxMp;
            
            // --- AUTO LEVELING LOGIC ---
            if (updatedStats.autoDistributeStats) {
                const priority = JOB_STAT_PRIORITY[updatedStats.job] || ['strength', 'vitality', 'agility'];
                // Distribute 3 points
                priority.forEach(statKey => {
                    // @ts-ignore
                    updatedStats[statKey] += 1;
                });
            } else {
                updatedStats.unspentPoints += 3;
            }

            isLevelUp = true;
            updateHunters(updatedStats.level);
        }

        setStats({...updatedStats});
        
        setVictoryState({
            xp: rewardXp,
            gold: rewardGold,
            item: droppedItem,
            shadow: droppedShadow,
            grade: questType === 'dungeon' ? clearGrade : undefined,
            isLevelUp
        });
    };

    // Update Proficiency & Hidden Stats
    if (delta > 0 && task) {
        setStats(prev => {
            const mastery = { ...(prev.skillMastery || {}) };
            const currentSkill = mastery[task.name] || { rank: 'E', xp: 0, totalReps: 0 };
            
            const newXp = currentSkill.xp + delta;
            const newTotalReps = currentSkill.totalReps + delta;
            
            let newRank = currentSkill.rank;
            if (newRank === 'E' && newXp >= MASTERY_THRESHOLDS.D) newRank = 'D';
            if (newRank === 'D' && newXp >= MASTERY_THRESHOLDS.C) newRank = 'C';
            if (newRank === 'C' && newXp >= MASTERY_THRESHOLDS.B) newRank = 'B';
            if (newRank === 'B' && newXp >= MASTERY_THRESHOLDS.A) newRank = 'A';
            if (newRank === 'A' && newXp >= MASTERY_THRESHOLDS.S) newRank = 'S';

            if (newRank !== currentSkill.rank) {
                setNotificationMsg(`SKILL RANK UP: ${task.name} -> ${newRank}`);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
            }

            mastery[task.name] = { rank: newRank, xp: newXp, totalReps: newTotalReps };
            
            // === JOB EVOLUTION LOGIC (Hidden) ===
            const exercise = SYSTEM_DATABASE.find(e => e.name === task.name);
            const hidden = { ...prev.hiddenStats };
            
            if (exercise) {
                if (exercise.type === 'Strength') hidden.strengthReps += delta;
                if (exercise.type === 'Cardio' || exercise.type === 'Agility') hidden.cardioReps += delta;
            }

            // Evolution Check (Level 20+)
            let evolvedJob = prev.job;
            if (prev.level >= 20) {
                if (prev.job === 'Fighter' && hidden.strengthReps > hidden.cardioReps * 2) {
                    evolvedJob = 'Warlord';
                    setNotificationMsg("CLASS EVOLUTION: WARLORD");
                    setShowNotification(true);
                }
                if (prev.job === 'Assassin' && hidden.cardioReps > hidden.strengthReps * 2) {
                    evolvedJob = 'Shadow Dancer';
                    setNotificationMsg("CLASS EVOLUTION: SHADOW DANCER");
                    setShowNotification(true);
                }
            }

            return { ...prev, skillMastery: mastery, hiddenStats: hidden, job: evolvedJob };
        });
    }

    if (isSpecial) {
        setSpecialQuest(prev => {
            if (!prev) return null;
            const updatedTasks = prev.tasks.map(t => t.id === taskId ? { ...t, current: newValue } : t);
            const allComplete = updatedTasks.every(t => t.current >= t.target);
            
            if (allComplete && prev.status !== 'completed') {
                 processCompletion(prev.type || 'special', {...stats}, prev);
                 return { ...prev, tasks: updatedTasks, status: 'completed' };
            }
            return { ...prev, tasks: updatedTasks };
        });
    } else {
        setDailyQuest(prev => {
            const updatedTasks = prev.tasks.map(t => t.id === taskId ? { ...t, current: newValue } : t);
            const allComplete = updatedTasks.every(t => t.current >= t.target);
            
            if (allComplete && prev.status !== 'completed') {
                 processCompletion(prev.type || 'daily', {...stats});
                 return { ...prev, tasks: updatedTasks, status: 'completed' };
            }
            return { ...prev, tasks: updatedTasks };
        });
    }
  };

  const handleActiveExerciseUpdate = (newVal: number) => {
      if (raidMode) {
          // Calculate Damage
          const damage = newVal * (stats.strength * 2 + 10);
          setBossState(prev => ({
              ...prev,
              currentHp: Math.max(0, prev.currentHp - damage)
          }));
          setStats(prev => ({
              ...prev,
              gold: prev.gold + Math.floor(damage * 0.1), // Reward
              xp: prev.xp + Math.floor(damage * 0.05)
          }));
          setRaidMode(false);
          setActiveExercise(null);
          setNotificationMsg(`DEALT ${damage} DAMAGE!`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
      } else {
          // Normal Quest Update
          if (activeExercise) {
              const isSpecial = !!specialQuest;
              handleUpdateTask(activeExercise.id, newVal, isSpecial);
          }
      }
  };

  const handleRegenerateQuest = async (isEmergency: boolean = false) => {
    // === SINGLE DAILY QUEST LOGIC ===
    if (!isEmergency) {
        const todayStr = new Date().toISOString().split('T')[0];
        const alreadyDone = stats.history.some(h => h.startsWith(todayStr));
        if (alreadyDone) {
            playSystemSound('glitch');
            setNotificationMsg("DAILY LIMIT REACHED");
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 2000);
            return;
        }
    }

    setIsQuestStarted(false);
    setDailyQuest(prev => ({...prev, status: 'active'}));
    if (dailyQuest.title === "REST DAY" && !isEmergency) {
         setDailyQuest(generateStaticQuest('REST'));
    } else {
         if (process.env.API_KEY) {
             setIsGenerating(true);
             const aiQuest = await generatePersonalizedWorkout(stats, isEmergency);
             setIsGenerating(false);
             if (aiQuest) setDailyQuest(aiQuest);
             else setDailyQuest(generateStaticQuest('WORKOUT'));
         } else {
             setDailyQuest(generateStaticQuest('WORKOUT'));
         }
    }
  };

  const handleBuy = (cost: number, itemId: string) => {
      playSystemSound('click');
      if (stats.gold >= cost) {
          setStats(prev => ({ ...prev, gold: prev.gold - cost }));
          if (itemId === 'potion') {
              setStats(prev => ({ ...prev, streakShield: true, fatigue: 0 }));
              alert("Fatigue Restored & Streak Shield Active.");
          } else {
              setStats(prev => ({ ...prev, inventory: [...prev.inventory, itemId] }));
              alert("Item acquired.");
          }
      } else {
          alert("Not enough gold.");
      }
  };

  const handleEquipItem = (item: Item) => {
      if (item.slot && item.bonusStats) {
          setStats(prev => {
              const currentEquippedId = prev.equipped[item.slot!];
              const isSame = currentEquippedId === item.id;
              let newStats = { ...prev };
              if (isSame) {
                   const newEquipped = { ...prev.equipped };
                   delete newEquipped[item.slot!];
                   Object.entries(item.bonusStats!).forEach(([key, val]) => {
                       // @ts-ignore
                       newStats[key] = (newStats[key] || 0) - val;
                   });
                   newStats.equipped = newEquipped;
              } else {
                   const oldItemId = prev.equipped[item.slot!];
                   Object.entries(item.bonusStats!).forEach(([key, val]) => {
                       // @ts-ignore
                       newStats[key] = (newStats[key] || 0) + val;
                   });
                   newStats.equipped = { ...prev.equipped, [item.slot!]: item.id };
              }
              return newStats;
          });
      }
  };

  const handleDispatchShadow = (shadowId: string, missionId: string) => {
      const mission = PATROL_MISSIONS.find(m => m.id === missionId);
      if (mission) {
          playSystemSound('start');
          setShadowStatus(prev => ({
              ...prev,
              [shadowId]: {
                  status: 'ON_PATROL',
                  patrolStartTime: Date.now(),
                  patrolDuration: mission.duration 
              }
          }));
          setNotificationMsg("Shadow Soldier Dispatched.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
      }
  };

  const handleClaimShadow = (shadowId: string) => {
      playSystemSound('success');
      const { goldMult, xpMult } = getShadowMultipliers(stats);
      setStats(prev => ({
          ...prev,
          gold: prev.gold + Math.ceil(100 * goldMult),
          xp: prev.xp + Math.ceil(50 * xpMult)
      }));
      setShadowStatus(prev => {
          const newState = { ...prev };
          delete newState[shadowId];
          return newState;
      });
      setNotificationMsg("Patrol Rewards Claimed.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
  };

  const handleNavigate = (view: ViewState) => {
      // Dungeon Break Lockdown Logic
      if (dailyQuest.type === 'emergency' && dailyQuest.status === 'active' && isQuestStarted) {
          playSystemSound('glitch');
          setNotificationMsg("CANNOT ESCAPE DUNGEON BREAK");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 2000);
          return;
      }

      if (view === currentView || transitionState !== 'IDLE') return;
      playSystemSound('click');
      setTransitionState('EXIT');
      setTimeout(() => {
          setCurrentView(view);
          setTransitionState('ENTER');
          setTimeout(() => {
              setTransitionState('IDLE');
          }, 400); 
      }, 550);
  };

  const handlePenaltyAccept = () => {
      setPenaltyMessage(null);
  };

  const handleVictoryClose = () => {
      setVictoryState(null);
      if (specialQuest) {
          setSpecialQuest(null);
          setCurrentView(ViewState.QUESTS);
          setNotificationMsg("Returning to System Overview...");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
      } else {
          setNotificationMsg("Daily Directive Complete.");
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          // Unlock nav if emergency cleared
          if(dailyQuest.type === 'emergency') {
              setIsQuestStarted(false);
          }
      }
  };

  const handleAddPhoto = (base64: string) => {
      const entry = { date: new Date().toLocaleDateString(), image: base64 };
      setStats(prev => ({
          ...prev,
          gallery: [entry, ...(prev.gallery || [])]
      }));
  };

  if (!isLoggedIn) {
      // Pre-fill last local name for easier resume
      const lastUser = localStorage.getItem('leveling_player_name') || '';
      return <AuthScreen onLogin={handleAuthLogin} storedName={lastUser} />;
  }

  // --- MODALS LAYER ---

  if (isReawakening) {
      return <ReawakeningScreen onComplete={finalizeReawakening} prestigeLevel={stats.prestigeLevel} />;
  }

  // Explicit Prestige Confirmation Modal
  if (showPrestigeConfirm) {
      return (
          <div className="fixed inset-0 z-[250] bg-black/90 flex items-center justify-center p-6 animate-in zoom-in duration-300">
              <div className="bg-[#050b14] border-2 border-yellow-500 max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                  <h2 className="text-3xl font-black text-yellow-500 uppercase mb-4 tracking-tighter">FINAL WARNING</h2>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                      Reawakening will <b>RESET YOUR LEVEL TO 1</b> and strip your current stats. 
                      <br/><br/>
                      You will retain:
                      <br/>- Items & Shadows
                      <br/>- Memories (History)
                      <br/>- Prestige Rank (Bonus Stat Multiplier)
                  </p>
                  <div className="flex space-x-3">
                      <button 
                        onClick={() => setShowPrestigeConfirm(false)}
                        className="flex-1 py-3 border border-gray-600 text-gray-400 hover:text-white uppercase font-bold text-xs"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmReawakening}
                        className="flex-1 py-3 bg-yellow-600 text-black uppercase font-bold text-xs hover:bg-yellow-500 tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                      >
                          CONFIRM RESET
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (victoryState) {
      return <VictoryScreen rewards={victoryState} onClose={handleVictoryClose} isLevelUp={victoryState.isLevelUp} />;
  }

  if (showLevelUp && !victoryState) {
      return (
          <div className="h-screen w-screen bg-black/90 flex flex-col items-center justify-center p-6 fixed inset-0 z-[100] animate-in zoom-in duration-300 overflow-hidden">
               <LevelUpParticles />
               <div className="text-center relative z-10">
                   <h1 className="text-5xl font-bold text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">LEVEL UP!</h1>
                   <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-8"></div>
                   <div className="text-white space-y-2 mb-8 text-lg font-mono">
                       <p>Level: <span className="text-blue-400">{stats.level - 1}</span> → <span className="text-yellow-400">{stats.level}</span></p>
                       <p>HP/MP Restored.</p>
                       <p>+3 Ability Points {stats.autoDistributeStats ? '(Auto-Assigned)' : ''}.</p>
                   </div>
                   <button onClick={() => setShowLevelUp(false)} className="px-8 py-3 bg-blue-600 text-black font-bold uppercase tracking-widest hover:bg-blue-500 relative z-20">Confirm</button>
               </div>
          </div>
      );
  }

  if (penaltyMessage) {
      return <PenaltyView message={penaltyMessage} onAccept={handlePenaltyAccept} />;
  }

  if (isHunterCardOpen) {
      return <HunterCard stats={stats} onClose={() => setIsHunterCardOpen(false)} />;
  }

  if (isShopOpen) {
      return <div className="min-h-screen bg-black text-white p-4"><ShopView stats={stats} onBuy={handleBuy} onClose={() => setIsShopOpen(false)} onAddItem={handleAddItem} /></div>;
  }

  if (isDungeonOpen) {
      return (
          <div className="min-h-screen bg-black text-white">
              <DungeonView 
                  stats={stats} 
                  onSelectDungeon={handleSelectDungeon} 
                  onClose={() => setIsDungeonOpen(false)} 
              />
          </div>
      );
  }

  const effectiveStats = getEffectiveStats(stats);

  const renderView = () => {
    switch (currentView) {
      case ViewState.STATUS:
        return <StatusView 
            stats={effectiveStats} 
            playerName={playerName} 
            onIncreaseStat={handleIncreaseStat} 
            onUpdateProfile={handleUpdateProfile} 
            onEquipItem={handleEquipItem} 
            onUseItem={handleUseItem} 
            onShareCard={() => setIsHunterCardOpen(true)} 
            onPrestige={handlePrestige}
            // PWA Props
            deferredPrompt={deferredPrompt}
            onInstallApp={handleInstallApp}
        />;
      case ViewState.QUESTS:
        return <QuestView 
            quest={dailyQuest} 
            specialQuest={specialQuest} 
            onUpdateTask={handleUpdateTask} 
            onSetSpecialQuest={setSpecialQuest} 
            onRegenerate={handleRegenerateQuest} 
            onOpenShop={() => setIsShopOpen(true)} 
            onOpenDungeon={() => setIsDungeonOpen(true)}
            keys={stats.keys} 
            stats={effectiveStats} 
            isGenerating={isGenerating} 
            isQuestStarted={isQuestStarted} 
            onStart={() => setIsQuestStarted(true)} 
            dailySteps={dailySteps}
        />;
      case ViewState.GRIMOIRE:
        return <GrimoireView history={stats.history} shadows={stats.shadows} shadowStatus={shadowStatus} gallery={stats.gallery} skillMastery={stats.skillMastery} onDispatch={handleDispatchShadow} onClaim={handleClaimShadow} onAddPhoto={handleAddPhoto} playerStats={effectiveStats} onUpdateVisual={handleUpdateCustomVisual} />;
      case ViewState.LEADERBOARD:
        return <LeaderboardView hunters={hunters} playerStats={stats} playerName={playerName} onAddRival={handleAddRival} onExtractShadow={handleExtractShadow} />;
      case ViewState.PENALTY:
         return <PenaltyView message={penaltyMessage || "Penalty Zone Active"} onAccept={handlePenaltyAccept} />;
      case ViewState.STORY:
         return <StoryView stats={effectiveStats} onStartChapter={handleStartStoryChapter} />;
      case ViewState.RAID:
         return <WorldBossView stats={effectiveStats} boss={bossState} onAttack={handleRaidAttack} onSelectCombatMove={handleSelectRaidAction} />;
      default:
        return <QuestView 
            quest={dailyQuest} 
            specialQuest={specialQuest} 
            onUpdateTask={handleUpdateTask} 
            onSetSpecialQuest={setSpecialQuest} 
            onRegenerate={handleRegenerateQuest} 
            onOpenShop={() => setIsShopOpen(true)} 
            onOpenDungeon={() => setIsDungeonOpen(true)}
            keys={stats.keys} 
            stats={effectiveStats} 
            isGenerating={isGenerating} 
            isQuestStarted={isQuestStarted} 
            onStart={() => setIsQuestStarted(true)} 
            dailySteps={dailySteps}
        />;
    }
  };

  return (
    <div className={`min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white pb-20 overflow-hidden relative ${getLevelAura(stats.level)}`}>
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" style={{ backgroundImage: `linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      {showNotification && (
        <div className="fixed top-12 left-1/2 transform -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-10 duration-500 w-[90%] max-w-sm">
            <div className="bg-black/90 backdrop-blur-md border-2 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.6)] p-4 flex items-center space-x-4">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold shadow-[0_0_10px_rgba(37,99,235,0.8)]">!</div>
                <div><h3 className="text-blue-400 font-bold uppercase tracking-wider text-sm glitch" data-text="System Notification">System Notification</h3><p className="text-white text-xs">{notificationMsg}</p></div>
            </div>
        </div>
      )}
      <main className={`relative z-10 max-w-md mx-auto h-screen flex flex-col ${transitionState === 'EXIT' ? 'animate-turn-off' : ''} ${transitionState === 'ENTER' ? 'animate-turn-on' : ''}`}>
        <div className="pt-2 px-2"><SystemTicker /></div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pt-2">
            {renderView()}
        </div>
      </main>
      
      {activeExercise && (
          <ActiveExerciseModal 
            task={activeExercise} 
            stats={effectiveStats}
            onUpdate={handleActiveExerciseUpdate} 
            onClose={() => { setActiveExercise(null); setRaidMode(false); }}
            isDungeon={!!specialQuest && specialQuest.type === 'dungeon'}
            bossName={specialQuest?.bossName}
          />
      )}

      {!penaltyMessage && <Navigation currentView={currentView} onNavigate={handleNavigate} playerLevel={stats.level} />}
    </div>
  );
};

export default App;
