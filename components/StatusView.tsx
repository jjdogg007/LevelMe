
import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, Achievement, Item } from '../types';
import { ACHIEVEMENTS, SHOP_ITEMS } from '../constants';
import { SystemLayout } from './SystemLayout';
import { playSystemSound, setSystemMute, getSystemMute } from '../services/audioService';
import { signInToGoogleFit, fetchDailySteps } from '../services/googleFitService';

interface StatusViewProps {
  stats: PlayerStats;
  onIncreaseStat?: (stat: keyof PlayerStats) => void;
  onUpdateProfile?: (updates: Partial<PlayerStats>) => void;
  onEquipItem?: (item: Item) => void;
  onUseItem?: (item: Item) => void; // New prop for using consumables
  onShareCard?: () => void;
  onPrestige?: () => void;
  playerName?: string;
  // PWA Support
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

// --- CONSTANTS FOR DROPDOWNS ---
const GENDER_OPTIONS = ["Male", "Female", "Non-Binary"];
const GOAL_OPTIONS = ["Build Muscle", "Lose Fat", "Maintain Physique", "Increase Strength", "Improve Endurance"];
const ACTIVITY_OPTIONS = ["Sedentary", "Lightly Active", "Moderate", "Very Active", "Extra Active"];
const MOTIVATION_OPTIONS = ["Discipline", "Health", "Aesthetics", "Strength", "Competition", "Mental Clarity"];

const STAT_EXPLANATIONS: Record<string, string> = {
    'strength': "Physical Power. Increases damage dealt in Dungeons and Raids.",
    'agility': "Speed & Reflexes. Reduces Mission travel time and increases Dodge chance.",
    'vitality': "Endurance & Health. Reduces Rest Timers during workouts and increases Max HP.",
    'intelligence': "Mana & Wisdom. Increases XP Gain, Gold Gain, and Max MP.",
    'sense': "Perception. Increases Critical Hit chance during combat."
};

// Helper to determine Rank based on Level
const getRank = (level: number) => {
    if (level >= 80) return 'S';
    if (level >= 60) return 'A';
    if (level >= 40) return 'B';
    if (level >= 20) return 'C';
    if (level >= 10) return 'D';
    return 'E';
};

const StatTicker = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(value);
    
    useEffect(() => {
        if (value === display) return;
        const diff = value - display;
        const step = diff > 0 ? 1 : -1;
        const delay = Math.max(20, 500 / Math.abs(diff));
        
        const timer = setInterval(() => {
            setDisplay(prev => {
                if (prev === value) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + step;
            });
        }, delay);
        
        return () => clearInterval(timer);
    }, [value]);

    return <span className={`transition-colors ${value > display ? 'text-green-400' : 'text-blue-400'}`}>{display}</span>;
}

// Holographic Wireframe
const HologramFigure: React.FC<{ equipped: PlayerStats['equipped'] }> = ({ equipped }) => {
    return (
        <div className="relative w-40 h-64 mx-auto flex items-center justify-center">
             {/* Base Glow */}
             <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>

             <svg viewBox="0 0 100 200" className="h-full w-full drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
                {/* Skeleton / Wireframe */}
                <g stroke="currentColor" fill="none" strokeWidth="0.5" className="text-blue-900/50">
                    <circle cx="50" cy="20" r="10" />
                    <line x1="50" y1="30" x2="50" y2="90" />
                    <line x1="30" y1="40" x2="70" y2="40" />
                    <line x1="30" y1="40" x2="20" y2="100" />
                    <line x1="70" y1="40" x2="80" y2="100" />
                    <line x1="50" y1="90" x2="30" y2="180" />
                    <line x1="50" y1="90" x2="70" y2="180" />
                </g>

                {/* Armor Plate (Chest) */}
                <path 
                    d="M35,40 Q50,55 65,40 L70,80 Q50,95 30,80 Z" 
                    fill={equipped.armor ? "rgba(59, 130, 246, 0.4)" : "none"} 
                    stroke={equipped.armor ? "#60a5fa" : "#1e3a8a"}
                    strokeWidth="1"
                    className={`transition-all duration-1000 ${equipped.armor ? 'filter drop-shadow-[0_0_8px_rgba(59,130,246,1)]' : ''}`}
                />

                {/* Weapon (Right Hand) */}
                {equipped.weapon && (
                     <path 
                        d="M80,100 L95,80 L98,82 L82,105 Z" 
                        fill="rgba(239, 68, 68, 0.4)" 
                        stroke="#f87171"
                        strokeWidth="1"
                        className="filter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"
                    />
                )}

                {/* Accessory (Ring/Aura) */}
                {equipped.accessory && (
                    <circle 
                        cx="20" cy="100" r="3" 
                        fill="#fbbf24" 
                        className="filter drop-shadow-[0_0_15px_rgba(251,191,36,1)] animate-pulse"
                    />
                )}
             </svg>
             
             {/* Scanlines */}
             <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        </div>
    );
}

// Pentagon Radar Chart
const RadarChart: React.FC<{ stats: PlayerStats }> = ({ stats }) => {
    // Normalize stats to 100 for visual (Assuming level 50 roughly balances to 100 stats or dynamic max)
    const maxStat = Math.max(stats.strength, stats.agility, stats.vitality, stats.intelligence, stats.sense, 50);
    const normalize = (val: number) => Math.min((val / maxStat) * 90, 90);

    const points = [
        { label: 'STR', val: normalize(stats.strength), angle: -90 },
        { label: 'INT', val: normalize(stats.intelligence), angle: -18 },
        { label: 'VIT', val: normalize(stats.vitality), angle: 54 },
        { label: 'AGI', val: normalize(stats.agility), angle: 126 },
        { label: 'SENSE', val: normalize(stats.sense), angle: 198 },
    ];

    // Calculate coordinates
    const center = 100;
    const coords = points.map(p => {
        const rad = (p.angle * Math.PI) / 180;
        return {
            x: center + p.val * Math.cos(rad),
            y: center + p.val * Math.sin(rad),
            ...p
        };
    });

    const polygonPoints = coords.map(c => `${c.x},${c.y}`).join(' ');

    // Background Webs
    const levels = [20, 40, 60, 80];

    return (
        <div className="relative w-64 h-64 mx-auto mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full">
                 {/* Web Grid */}
                {levels.map(l => {
                    const lPoints = points.map(p => {
                        const rad = (p.angle * Math.PI) / 180;
                        const x = center + l * Math.cos(rad);
                        const y = center + l * Math.sin(rad);
                        return `${x},${y}`;
                    }).join(' ');
                    return <polygon key={l} points={lPoints} fill="none" stroke="#1e293b" strokeWidth="1" />;
                })}

                {/* Axis Lines */}
                {points.map((p, i) => {
                    const rad = (p.angle * Math.PI) / 180;
                    const x = center + 90 * Math.cos(rad);
                    const y = center + 90 * Math.sin(rad);
                    return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#1e293b" strokeWidth="1" />;
                })}

                {/* Data Polygon */}
                <polygon points={polygonPoints} fill="rgba(59, 130, 246, 0.2)" stroke="#60a5fa" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />

                {/* Labels */}
                {coords.map((c, i) => {
                     // Offset text slightly from point
                     const xOff = c.x > 100 ? 10 : c.x < 100 ? -10 : 0;
                     const yOff = c.y > 100 ? 10 : c.y < 100 ? -10 : 0;
                     return (
                         <text 
                            key={i} 
                            x={c.x + xOff} 
                            y={c.y + yOff} 
                            fill="#93c5fd" 
                            fontSize="10" 
                            fontWeight="bold" 
                            textAnchor="middle" 
                            alignmentBaseline="middle"
                         >
                             {c.label}
                         </text>
                     )
                })}
            </svg>
        </div>
    );
};

// Simple Line Graph
const ProgressGraph: React.FC<{ data: { date: string, weight: number }[] }> = ({ data }) => {
    if (!data || data.length < 2) {
        return <div className="h-32 flex items-center justify-center text-gray-600 text-xs italic">Insufficient data for analysis.</div>;
    }

    const maxWeight = Math.max(...data.map(d => d.weight)) + 2;
    const minWeight = Math.min(...data.map(d => d.weight)) - 2;
    const range = maxWeight - minWeight;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.weight - minWeight) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="h-40 w-full relative border-l border-b border-gray-700 p-2">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.weight - minWeight) / range) * 100;
                    return (
                        <circle key={i} cx={x} cy={y} r="3" className="fill-blue-500 hover:fill-white cursor-pointer">
                            <title>{d.date}: {d.weight}lbs</title>
                        </circle>
                    )
                })}
            </svg>
            <div className="absolute top-0 right-0 text-[10px] text-gray-500">{Math.round(maxWeight)}lbs</div>
            <div className="absolute bottom-0 right-0 text-[10px] text-gray-500">{Math.round(minWeight)}lbs</div>
        </div>
    );
}

const ProfileItem: React.FC<{ label: string; value: string | number; onEdit?: () => void }> = ({ label, value, onEdit }) => (
    <div className="bg-gray-900/50 border border-gray-800 p-3 rounded flex justify-between items-center group hover:border-blue-500/30 transition-colors">
        <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</p>
            <p className="text-white font-bold">{value || 'N/A'}</p>
        </div>
        {onEdit && (
            <button onClick={onEdit} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
        )}
    </div>
);

export const StatusView: React.FC<StatusViewProps> = ({ stats, onIncreaseStat, onUpdateProfile, onEquipItem, onUseItem, onShareCard, onPrestige, playerName, deferredPrompt, onInstallApp }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GEAR' | 'BADGES' | 'HISTORY' | 'SETTINGS'>('OVERVIEW');
  const [editingField, setEditingField] = useState<keyof PlayerStats | null>(null);
  const [editValue, setEditValue] = useState("");
  const [connectedWearable, setConnectedWearable] = useState(false);
  const [dailySteps, setDailySteps] = useState(0);
  const [showStatHelp, setShowStatHelp] = useState(false);
  const [muted, setMuted] = useState(getSystemMute());
  
  // Settings: API Key Management
  const [apiKey, setApiKey] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);

  // Local state for complex inputs (Height)
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  
  const restoreFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const storedKey = localStorage.getItem('leveling_api_key');
      if (storedKey) {
          setHasCustomKey(true);
          setApiKey(storedKey);
      }
  }, []);

  const handleSaveKey = () => {
      if (apiKey.trim()) {
          localStorage.setItem('leveling_api_key', apiKey.trim());
          setHasCustomKey(true);
          playSystemSound('success');
          alert("Key Saved. System will use your personal API quota.");
      } else {
          localStorage.removeItem('leveling_api_key');
          setHasCustomKey(false);
          alert("Key Removed. Reverting to default configuration.");
      }
  };

  const rank = getRank(stats.level);
  const xpPercent = Math.min(100, Math.floor((stats.xp / stats.maxXp) * 100));

  const handleConnectGoogleFit = async () => {
      playSystemSound('click');
      try {
          const success = await signInToGoogleFit();
          if (success) {
              setConnectedWearable(true);
              playSystemSound('success');
              const steps = await fetchDailySteps();
              setDailySteps(steps);
          } else {
              playSystemSound('glitch');
              alert("Connection Failed. Check System Keys.");
          }
      } catch (e) {
          console.error(e);
          alert("System Error: Google Fit unavailable.");
      }
  };

  const toggleMute = () => {
      const newState = !muted;
      setMuted(newState);
      setSystemMute(newState);
      if (!newState) playSystemSound('click');
  };

  const handleExport = () => {
      playSystemSound('click');
      const data = {
          stats: JSON.parse(localStorage.getItem('leveling_player_stats') || '{}'),
          name: localStorage.getItem('leveling_player_name'),
          hunters: JSON.parse(localStorage.getItem('leveling_hunters') || '[]'),
          quests: JSON.parse(localStorage.getItem('leveling_quest_started') || 'false'),
          timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SYSTEM_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!window.confirm("WARNING: Overwriting System Memory. This cannot be undone. Proceed?")) {
          event.target.value = ''; // Reset input
          return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
          try {
              const data = JSON.parse(ev.target?.result as string);
              
              if (data.stats) localStorage.setItem('leveling_player_stats', JSON.stringify(data.stats));
              if (data.name) localStorage.setItem('leveling_player_name', data.name);
              if (data.hunters) localStorage.setItem('leveling_hunters', JSON.stringify(data.hunters));
              
              playSystemSound('levelUp');
              alert("Memory Core Integrated. System Rebooting...");
              window.location.reload();
          } catch(err) {
              playSystemSound('glitch');
              alert("Corrupted Data Core. Integration Failed.");
          }
      };
      reader.readAsText(file);
  };

  const handleHardReset = () => {
      playSystemSound('glitch');
      const confirmation = prompt("DANGER: This will delete all progress permanently. Type 'DELETE' to confirm.");
      if (confirmation === 'DELETE') {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleEditClick = (field: keyof PlayerStats, currentValue: any) => {
      setEditingField(field);
      
      if (field === 'height') {
          // Parse "5' 9"" format
          const val = currentValue?.toString() || "";
          const parts = val.match(/(\d+)'\s*(\d+)"/);
          if (parts) {
              setHeightFt(parts[1]);
              setHeightIn(parts[2]);
          } else {
              setHeightFt("5");
              setHeightIn("9");
          }
      } else if (field === 'weight') {
          // Parse "165 lbs" -> "165"
          const val = currentValue?.toString() || "";
          setEditValue(val.replace(" lbs", "").replace("lbs", ""));
      } else {
          setEditValue(currentValue?.toString() || "");
      }
  };

  const saveEdit = () => {
      if (editingField && onUpdateProfile) {
          playSystemSound('click');
          let val: any = editValue;
          
          if (editingField === 'age') {
              val = parseInt(editValue) || 0;
          } else if (editingField === 'height') {
              val = `${heightFt}' ${heightIn}"`;
          } else if (editingField === 'weight') {
              val = `${editValue} lbs`;
          }
          
          onUpdateProfile({ [editingField]: val });
          setEditingField(null);
      }
  };

  const calculateBMI = () => {
      if (!stats.weight || !stats.height) return '-';
      
      // Parse Weight (lbs)
      const wMatch = stats.weight.match(/(\d+)/);
      const w = wMatch ? parseFloat(wMatch[0]) : 0;
      
      // Parse Height (ft in)
      const hMatch = stats.height.match(/(\d+)'\s*(\d+)"/);
      let hInches = 0;
      if (hMatch) {
          hInches = (parseInt(hMatch[1]) * 12) + parseInt(hMatch[2]);
      } else {
          // Fallback if malformed
          return '-';
      }

      if (w > 0 && hInches > 0) {
          // US BMI = 703 * (weight_lbs / height_inches^2)
          return ((w / (hInches * hInches)) * 703).toFixed(1);
      }
      return '-';
  };

  const handleUpgrade = (stat: keyof PlayerStats) => {
      if (onIncreaseStat && stats.unspentPoints > 0) {
          onIncreaseStat(stat);
      }
  };

  // Helper for Badges Logic
  const getBadgeProgress = (ach: Achievement) => {
      let current = 0;
      switch(ach.metric) {
          case 'streak': current = stats.streak; break;
          case 'level': current = stats.level; break;
          case 'totalXp': current = stats.totalXp || 0; break;
          case 'workouts': current = stats.history.length; break;
      }
      return { current, target: ach.target, percent: Math.min(100, (current / ach.target) * 100) };
  };

  // Gear Logic
  // Filter inventory for Shop Items.
  // Note: Inventory stores string IDs.
  const inventoryItems = SHOP_ITEMS.filter(item => stats.inventory.includes(item.id));

  // Styles based on rarity
  const getRarityStyle = (rarity: string = 'E') => {
      switch(rarity) {
          case 'S': return 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
          case 'A': return 'border-yellow-500 bg-yellow-950/20 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
          case 'B': return 'border-purple-500 bg-purple-950/20 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
          case 'C': return 'border-blue-500 bg-blue-950/20 shadow-[0_0_5px_rgba(59,130,246,0.3)]';
          default: return 'border-gray-700 bg-gray-900/50';
      }
  };

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) => (
      <button 
        onClick={() => { playSystemSound('click'); setActiveTab(id as any); }}
        className={`flex-1 flex flex-col items-center justify-center py-3 text-[10px] font-bold uppercase tracking-widest transition-all
            ${activeTab === id ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-600 hover:text-gray-400'}
        `}
      >
          <div className="mb-1">{icon}</div>
          {label}
      </button>
  );

  const renderEditInput = () => {
      if (editingField === 'gender') {
          return (
              <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 mb-4 focus:border-blue-400 focus:outline-none">
                  {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
          );
      }
      if (editingField === 'goal') {
          return (
              <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 mb-4 focus:border-blue-400 focus:outline-none">
                  {GOAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
          );
      }
      if (editingField === 'activityLevel') {
          return (
              <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 mb-4 focus:border-blue-400 focus:outline-none">
                  {ACTIVITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
          );
      }
       if (editingField === 'motivation') {
          return (
              <select value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 mb-4 focus:border-blue-400 focus:outline-none">
                  {MOTIVATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
          );
      }
      if (editingField === 'height') {
          return (
              <div className="flex space-x-2 mb-4">
                  <div className="flex-1">
                      <label className="text-gray-500 text-[10px] uppercase block mb-1">Feet</label>
                      <select value={heightFt} onChange={(e) => setHeightFt(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-blue-400">
                          {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}'</option>)}
                      </select>
                  </div>
                   <div className="flex-1">
                      <label className="text-gray-500 text-[10px] uppercase block mb-1">Inches</label>
                      <select value={heightIn} onChange={(e) => setHeightIn(e.target.value)} className="w-full bg-black border border-gray-700 text-white p-3 focus:border-blue-400">
                          {[0,1,2,3,4,5,6,7,8,9,10,11].map(n => <option key={n} value={n}>{n}"</option>)}
                      </select>
                  </div>
              </div>
          );
      }
      if (editingField === 'weight') {
           return (
              <div className="relative mb-4">
                  <input 
                    type="number" 
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white p-3 pr-10 focus:border-blue-400 focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute right-3 top-3 text-gray-500">lbs</span>
              </div>
          );
      }
      // Default Input
      return (
          <input 
            type={editingField === 'age' ? 'number' : 'text'} 
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-black border border-gray-700 text-white p-3 mb-4 focus:border-blue-400 focus:outline-none"
            autoFocus
          />
      );
  };

  return (
    <div className="h-full flex flex-col space-y-0 animate-in fade-in duration-500">
      
      {/* STAT HELP MODAL */}
      {showStatHelp && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowStatHelp(false)}>
              <div className="bg-[#050b14] border border-blue-500 w-full max-w-sm shadow-[0_0_30px_rgba(59,130,246,0.3)]" onClick={e => e.stopPropagation()}>
                  <SystemLayout title="Attribute Guide">
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                          {Object.entries(STAT_EXPLANATIONS).map(([key, desc]) => (
                              <div key={key} className="border-b border-gray-800 pb-2">
                                  <h4 className="text-blue-400 font-bold uppercase text-sm mb-1">{key}</h4>
                                  <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                              </div>
                          ))}
                      </div>
                      <button onClick={() => setShowStatHelp(false)} className="w-full mt-4 py-3 bg-blue-900/20 text-blue-400 border border-blue-500 uppercase font-bold text-xs">Close</button>
                  </SystemLayout>
              </div>
          </div>
      )}

      {/* EDIT MODAL */}
      {editingField && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-[#050b14] border border-blue-500 p-6 w-full max-w-sm shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <h3 className="text-blue-400 font-bold uppercase mb-4 tracking-widest">Update {editingField}</h3>
                  
                  {renderEditInput()}

                  <div className="flex space-x-2">
                      <button onClick={() => setEditingField(null)} className="flex-1 py-3 border border-gray-700 text-gray-500 hover:text-white uppercase font-bold text-xs">Cancel</button>
                      <button onClick={saveEdit} className="flex-1 py-3 bg-blue-600 text-black uppercase font-bold text-xs hover:bg-blue-500">Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {/* FIXED HEADER: PROFILE CARD */}
      <div className="bg-[#050b14] pt-4 px-4 pb-2 border-b border-gray-800 relative z-20">
          <div className="flex flex-col items-center mb-4">
              <div className="relative">
                  {/* Hexagon Shape (CSS clip-path) */}
                  <div className="w-20 h-20 bg-gray-800 flex items-center justify-center text-2xl font-bold text-white mb-2" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                       {stats.job.substring(0, 2).toUpperCase()}
                  </div>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                  {playerName && (
                      <h1 className="text-2xl font-black text-white uppercase tracking-widest">{playerName}</h1>
                  )}
                  <div className="flex items-center space-x-2">
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stats.title || 'Player'}</h2>
                      <button onClick={() => handleEditClick('title', stats.title)} className="bg-blue-600 p-1 rounded-full"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>
                  </div>
              </div>

              <div className="mt-2 flex items-center bg-gray-900 rounded-full px-4 py-1 border border-gray-700">
                  <span className="text-gray-400 text-xs font-bold mr-2">Rank {rank}</span>
              </div>
          </div>

          <div className="mb-2">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-bold tracking-wider">
                  <span>PROGRESS</span>
                  <span>{stats.maxXp - stats.xp} XP to Rank Up</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ width: `${xpPercent}%` }}></div>
              </div>
          </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-800 bg-black sticky top-0 z-10 overflow-x-auto scrollbar-hide">
          <TabButton id="OVERVIEW" label="Stats" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
          <TabButton id="GEAR" label="Gear" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
          <TabButton id="BADGES" label="Badges" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
          <TabButton id="HISTORY" label="History" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
          <TabButton id="SETTINGS" label="Settings" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 pb-20">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                  {/* Share Card Action */}
                  <button 
                    onClick={onShareCard}
                    className="w-full bg-blue-900/20 border border-blue-500/50 text-blue-400 py-3 uppercase font-bold text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all mb-2 flex items-center justify-center space-x-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                      <span>Share Authority Card</span>
                  </button>

                  {/* PRESTIGE ACTION (Reawakening) */}
                  {stats.level >= 100 && onPrestige && (
                      <div className="p-4 border-2 border-yellow-500 bg-yellow-900/10 mb-4 animate-pulse">
                          <h3 className="text-yellow-500 font-bold uppercase tracking-widest mb-2">Maximum Level Reached</h3>
                          <p className="text-xs text-gray-400 mb-4">You have reached the pinnacle of this vessel. Reawaken to surpass your limits?</p>
                          <button 
                            onClick={onPrestige}
                            className="w-full bg-yellow-600 text-black font-bold uppercase py-3 tracking-[0.2em] hover:bg-yellow-500"
                          >
                              REAWAKEN
                          </button>
                      </div>
                  )}

                  {/* Radar Chart */}
                  <SystemLayout title="Hunter Stats">
                       <RadarChart stats={stats} />
                  </SystemLayout>

                  {/* Attributes Section */}
                  <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="text-white font-bold uppercase tracking-widest text-sm">Attributes</h3>
                          <button 
                            onClick={() => setShowStatHelp(true)}
                            className="w-full max-w-[24px] h-6 rounded-full border border-gray-600 text-gray-500 flex items-center justify-center hover:text-white hover:border-white transition-colors"
                          >
                              ?
                          </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         {['strength', 'agility', 'vitality', 'intelligence', 'sense'].map((attr) => {
                             const val = stats[attr as keyof PlayerStats] as number;
                             return (
                                 <div key={attr} className="bg-gray-900 border border-gray-800 p-3 flex justify-between items-center rounded">
                                     <span className="text-gray-500 uppercase text-xs font-bold">{attr.substring(0,3)}</span>
                                     <div className="flex items-center space-x-2">
                                         <span className="text-blue-400 font-mono font-bold text-lg">
                                             <StatTicker value={val} />
                                         </span>
                                         {stats.unspentPoints > 0 && !stats.autoDistributeStats && (
                                             <button onClick={() => handleUpgrade(attr as keyof PlayerStats)} className="w-5 h-5 bg-yellow-500 text-black flex items-center justify-center rounded text-xs font-bold">+</button>
                                         )}
                                     </div>
                                 </div>
                             )
                         })}
                      </div>
                  </div>
                  
                  {stats.unspentPoints > 0 && !stats.autoDistributeStats && (
                      <div className="bg-yellow-900/20 border border-yellow-500/50 p-2 text-center text-yellow-400 text-xs font-bold uppercase animate-pulse">
                          {stats.unspentPoints} Points Available
                      </div>
                  )}
                  {stats.autoDistributeStats && (
                      <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-2">Auto-Allocation Active</p>
                  )}
              </div>
          )}

          {/* TAB: GEAR */}
          {activeTab === 'GEAR' && (
              <div className="space-y-6">
                  {/* Holographic Avatar */}
                  <SystemLayout title="Equipment Status">
                       <HologramFigure equipped={stats.equipped} />
                       
                       <div className="flex justify-between px-2 mt-4 text-[10px] text-gray-400 font-mono">
                           <div>
                               <p>WEAPON: <span className="text-white">{stats.equipped.weapon ? 'ACTIVE' : 'NONE'}</span></p>
                           </div>
                           <div className="text-right">
                               <p>ARMOR: <span className="text-white">{stats.equipped.armor ? 'EQUIPPED' : 'NONE'}</span></p>
                           </div>
                       </div>
                  </SystemLayout>

                  <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Inventory Grid</h3>
                  
                  {inventoryItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-gray-800">
                          Inventory Empty. Visit Shop.
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 gap-3">
                          {inventoryItems.map(item => {
                              const isEquipped = stats.equipped[item.slot || 'weapon'] === item.id;
                              const isConsumable = item.type === 'consumable';
                              const rarityStyle = getRarityStyle(item.rarity);
                              
                              return (
                                  <div key={item.id} className={`relative p-3 border rounded-sm transition-all overflow-hidden group ${rarityStyle}`}>
                                      {/* Rarity Glitch Overlay for S-Rank */}
                                      {item.rarity === 'S' && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none"></div>}

                                      <div className="flex justify-between items-start mb-2 relative z-10">
                                          <div className="text-2xl">{item.icon}</div>
                                          <span className={`text-[10px] font-bold px-1 border ${item.rarity === 'S' ? 'text-red-400 border-red-500' : 'text-gray-400 border-gray-600'}`}>
                                              {item.rarity || 'E'}
                                          </span>
                                      </div>
                                      
                                      <h4 className="text-xs font-bold text-white uppercase mb-1 relative z-10">{item.name}</h4>
                                      <div className="text-[10px] text-gray-400 mb-2 relative z-10">
                                          {item.bonusStats && Object.entries(item.bonusStats).map(([k,v]) => (
                                              <span key={k} className="mr-2 uppercase">{k.substring(0,3)} +{v}</span>
                                          ))}
                                          {isConsumable && <span className="text-gray-500">CONSUMABLE</span>}
                                      </div>

                                      {isConsumable ? (
                                          <button 
                                            onClick={() => {
                                                playSystemSound('click');
                                                if (onUseItem) onUseItem(item);
                                            }}
                                            className="w-full py-1.5 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-all bg-green-900/30 border border-green-500/50 text-green-400 hover:bg-green-600 hover:text-black"
                                          >
                                              USE ITEM
                                          </button>
                                      ) : (
                                          <button 
                                              onClick={() => { 
                                                  if (!isEquipped) {
                                                      playSystemSound('levelUp'); 
                                                  } else {
                                                      playSystemSound('click');
                                                  }
                                                  onEquipItem && onEquipItem(item); 
                                              }}
                                              className={`w-full py-1.5 text-[10px] font-bold uppercase tracking-wider relative z-10 transition-all
                                                ${isEquipped 
                                                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                                                    : 'bg-black/50 border border-gray-600 text-gray-400 hover:text-white hover:border-blue-500'}
                                              `}
                                          >
                                              {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                                          </button>
                                      )}
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          )}

          {/* TAB: BADGES */}
          {activeTab === 'BADGES' && (
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm">Badges & Achievements</h3>
                      <span className="text-blue-500 font-mono text-xs">
                          {ACHIEVEMENTS.filter(a => getBadgeProgress(a).percent >= 100).length}/{ACHIEVEMENTS.length}
                      </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      {ACHIEVEMENTS.map(ach => {
                          const { current, target, percent } = getBadgeProgress(ach);
                          const isUnlocked = percent >= 100;
                          
                          return (
                              <div key={ach.id} className={`border rounded-lg p-4 flex flex-col items-center text-center transition-all duration-500
                                  ${isUnlocked 
                                      ? 'border-blue-500 bg-blue-900/20 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                                      : 'border-gray-800 bg-gray-900/50 opacity-70'}
                              `}>
                                  <div className="mb-3 text-2xl">
                                      {isUnlocked ? '🏆' : '🔒'}
                                  </div>
                                  <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{ach.title}</h4>
                                  <p className="text-[10px] text-gray-500 mb-3 h-8 leading-tight">{ach.description}</p>
                                  
                                  <div className="w-full text-[10px] font-mono mb-1 text-blue-400">
                                      {current} / {target}
                                  </div>
                                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                      <div className={`h-full ${isUnlocked ? 'bg-blue-500' : 'bg-blue-900'}`} style={{ width: `${percent}%` }}></div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'HISTORY' && (
              <div>
                  <div className="mb-6">
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Weight Trend</h3>
                      <ProgressGraph data={stats.weightHistory || []} />
                  </div>

                  <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Workout Log</h3>
                  <div className="space-y-3">
                      {stats.history.length === 0 ? (
                          <div className="text-center py-10 text-gray-600 text-xs italic">
                              No data recorded.
                          </div>
                      ) : (
                          [...stats.history].reverse().map((dateStr, idx) => {
                              // We only store completions for now.
                              const date = new Date(dateStr);
                              return (
                                  <div key={idx} className="bg-gray-900/50 border border-blue-900/30 p-4 rounded flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-500">
                                              ✓
                                          </div>
                                          <div>
                                              <p className="text-white font-bold text-sm">Quest Completed</p>
                                              <p className="text-gray-500 text-xs">{date.toDateString()}</p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <span className="text-blue-400 font-mono text-xs font-bold">+XP</span>
                                      </div>
                                  </div>
                              )
                          })
                      )}
                  </div>
              </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'SETTINGS' && (
              <div className="space-y-4">
                  
                  {/* SENSORY SETTINGS */}
                  <SystemLayout title="Sensory Settings">
                      <div className="p-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-bold uppercase">System Audio</span>
                          <button 
                            onClick={toggleMute}
                            className={`px-4 py-1 border rounded text-[10px] font-bold uppercase transition-all ${muted ? 'border-red-500 text-red-500' : 'bg-blue-600 border-blue-500 text-white'}`}
                          >
                              {muted ? 'MUTED' : 'ACTIVE'}
                          </button>
                      </div>
                  </SystemLayout>

                  {/* API KEY SECTION (BYOK) */}
                  <SystemLayout title="API Configuration">
                      <div className="p-2 space-y-3">
                          <p className="text-[10px] text-gray-400">
                              By default, the System uses the developer's quota. To ensure unlimited access and remove rate limits, provide your own Gemini API Key.
                          </p>
                          <div className="flex items-center space-x-2">
                              <input 
                                type="password" 
                                value={apiKey} 
                                onChange={(e) => setApiKey(e.target.value)} 
                                placeholder="Paste Gemini API Key"
                                className="flex-1 bg-black border border-gray-700 text-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                              />
                              <button 
                                onClick={handleSaveKey}
                                className="bg-blue-900/30 text-blue-400 border border-blue-500 px-4 py-2 text-xs font-bold uppercase hover:bg-blue-600 hover:text-white transition-all"
                              >
                                  Save
                              </button>
                          </div>
                          {hasCustomKey && (
                              <p className="text-[9px] text-green-500 uppercase font-bold tracking-widest">
                                  ✓ Custom Key Active
                              </p>
                          )}
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] text-gray-500 underline hover:text-white">
                              Get a free key here
                          </a>
                      </div>
                  </SystemLayout>

                  {/* MEMORY ARCHIVES (BACKUP/RESTORE) */}
                  <SystemLayout title="Memory Archives">
                      <div className="p-2 space-y-3">
                          <p className="text-[10px] text-gray-400 mb-2">Create a secure backup of your Hunter data or integrate a previous memory core.</p>
                          
                          <button 
                            onClick={handleExport}
                            className="w-full py-3 border border-blue-500/50 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-900/20 transition-all flex items-center justify-center space-x-2"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              <span>Initiate System Dump</span>
                          </button>

                          <div className="relative">
                              <input 
                                type="file" 
                                ref={restoreFileRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden" 
                              />
                              <button 
                                onClick={() => restoreFileRef.current?.click()}
                                className="w-full py-3 border border-yellow-600/50 text-yellow-500 text-xs font-bold uppercase tracking-widest hover:bg-yellow-900/20 transition-all flex items-center justify-center space-x-2"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                  <span>Integrate Memory Core</span>
                              </button>
                          </div>
                      </div>
                  </SystemLayout>

                  <SystemLayout title="System Sync">
                      <div className="p-2 space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-800">
                              <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-full ${connectedWearable ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-white text-sm">Google Fit</h4>
                                      <p className="text-[10px] text-gray-500">{connectedWearable ? `Steps: ${dailySteps}` : 'Sync Activity Data'}</p>
                                  </div>
                              </div>
                              <button 
                                onClick={handleConnectGoogleFit}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded border transition-all ${connectedWearable ? 'bg-green-600 border-green-500 text-white' : 'bg-black border-gray-600 text-gray-400 hover:text-white'}`}
                              >
                                  {connectedWearable ? 'CONNECTED' : 'CONNECT'}
                              </button>
                          </div>
                      </div>
                  </SystemLayout>

                  <SystemLayout title="Personal Data">
                      <div className="space-y-3">
                          <ProfileItem label="Avatar Form" value={stats.gender || 'Male'} onEdit={() => handleEditClick('gender', stats.gender)} />
                          <ProfileItem label="Height" value={stats.height || '-'} onEdit={() => handleEditClick('height', stats.height)} />
                          <ProfileItem label="Weight" value={stats.weight || '-'} onEdit={() => handleEditClick('weight', stats.weight)} />
                          <ProfileItem label="Target Weight" value={stats.targetWeight || '-'} onEdit={() => handleEditClick('targetWeight', stats.targetWeight)} />
                          <ProfileItem label="Age" value={stats.age || '-'} onEdit={() => handleEditClick('age', stats.age)} />
                          <ProfileItem label="BMI" value={calculateBMI()} />
                      </div>
                  </SystemLayout>

                  <SystemLayout title="Goals">
                      <div className="space-y-3">
                           <ProfileItem label="Primary Goal" value={stats.goal || '-'} onEdit={() => handleEditClick('goal', stats.goal)} />
                           <ProfileItem label="Motivation" value={stats.motivation || '-'} onEdit={() => handleEditClick('motivation', stats.motivation)} />
                           <ProfileItem label="Activity Level" value={stats.activityLevel || '-'} onEdit={() => handleEditClick('activityLevel', stats.activityLevel)} />
                      </div>
                  </SystemLayout>

                   <SystemLayout title="System">
                      <div className="space-y-3">
                           {/* PWA INSTALL PROMPT */}
                           {deferredPrompt && (
                               <button 
                                   onClick={onInstallApp} 
                                   className="w-full py-3 bg-blue-600 text-black font-bold uppercase tracking-widest hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-pulse"
                               >
                                   Initialize System Install
                               </button>
                           )}

                           <div className="pt-4 border-t border-gray-800">
                               <button onClick={handleHardReset} className="w-full py-3 border border-red-900 text-red-700 hover:bg-red-900/20 text-xs font-bold uppercase tracking-widest">
                                   Reset System Data
                               </button>
                           </div>
                      </div>
                  </SystemLayout>
              </div>
          )}
      </div>
    </div>
  );
};
