
import React, { useState, useEffect, useRef } from 'react';
import { SYSTEM_DATABASE, SHADOW_ARMY, PATROL_MISSIONS, MASTERY_THRESHOLDS } from '../constants';
import { SystemLayout } from './SystemLayout';
import { Exercise, Shadow, SkillMastery, NutritionPlan, PlayerStats } from '../types';
import { SkillModal } from './SkillModal';
import { playSystemSound } from '../services/audioService';
import { generateNutritionPlan, analyzeFoodImage, generateSnackSuggestion } from '../services/geminiService';

interface GrimoireViewProps {
    history?: string[];
    shadows?: string[];
    shadowStatus?: Record<string, Shadow>;
    gallery?: { date: string, image: string }[];
    skillMastery?: Record<string, SkillMastery>; 
    onDispatch?: (shadowId: string, missionId: string) => void;
    onClaim?: (shadowId: string) => void;
    onAddPhoto?: (base64: string) => void;
    playerStats?: PlayerStats; // Added for nutrition access
}

export const GrimoireView: React.FC<GrimoireViewProps> = ({ history = [], shadows = [], shadowStatus = {}, gallery = [], skillMastery = {}, onDispatch, onClaim, onAddPhoto, playerStats }) => {
  const [activeTab, setActiveTab] = useState<'SKILLS' | 'HISTORY' | 'ARMY' | 'VESSEL' | 'INTAKE'>('SKILLS');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterRank, setFilterRank] = useState<string>('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedShadow, setSelectedShadow] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const foodInputRef = useRef<HTMLInputElement>(null);

  // Nutrition State
  const [nutriLoading, setNutriLoading] = useState(false);
  const [foodAnalyzing, setFoodAnalyzing] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [scannedFood, setScannedFood] = useState<any | null>(null);
  const [snackSuggestion, setSnackSuggestion] = useState<any | null>(null);
  
  // Default values from props if available
  const [weight, setWeight] = useState(playerStats?.weight || '165 lbs');
  const [goal, setGoal] = useState(playerStats?.goal || 'Build Muscle');
  const [preferences, setPreferences] = useState('None');

  // Force update for timer UI
  const [, setTick] = useState(0);
  useEffect(() => {
      const interval = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
      return () => clearInterval(interval);
  }, []);

  const types = ['All', 'Strength', 'Cardio', 'Agility', 'Plyometrics'];
  const ranks = ['All', 'E', 'D', 'C', 'B', 'A', 'S'];

  const filteredExercises = SYSTEM_DATABASE.filter(ex => {
      const typeMatch = filterType === 'All' || ex.type === filterType;
      const rankMatch = filterRank === 'All' || ex.rank === filterRank;
      return typeMatch && rankMatch;
  });

  const getRankColor = (rank: string) => {
      switch(rank) {
          case 'S': return 'text-red-500 border-red-500 bg-red-900/20';
          case 'A': return 'text-orange-500 border-orange-500 bg-orange-900/20';
          case 'B': return 'text-purple-500 border-purple-500 bg-purple-900/20';
          case 'C': return 'text-blue-400 border-blue-400 bg-blue-900/20';
          default: return 'text-gray-400 border-gray-600 bg-gray-800/50';
      }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onAddPhoto) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onAddPhoto(reader.result as string);
              playSystemSound('success');
          };
          reader.readAsDataURL(file);
      }
  };

  // --- NUTRITION HANDLERS ---
  const handleFoodScan = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          playSystemSound('click');
          setFoodAnalyzing(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              const result = await analyzeFoodImage(base64Data);
              setScannedFood(result);
              setFoodAnalyzing(false);
              playSystemSound('success');
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGeneratePlan = async () => {
      if (!process.env.API_KEY) { alert("API Key missing"); return; }
      setNutriLoading(true);
      const result = await generateNutritionPlan(goal, preferences, weight);
      setNutritionPlan(result);
      setNutriLoading(false);
  };

  const handleGenerateSnack = async () => {
      if (!process.env.API_KEY) { alert("API Key missing"); return; }
      setNutriLoading(true);
      playSystemSound('click');
      const result = await generateSnackSuggestion(weight, goal, preferences);
      setSnackSuggestion(result);
      setNutriLoading(false);
      playSystemSound('success');
  };

  const MealCard: React.FC<{ title: string; meal: any }> = ({ title, meal }) => {
    // Safety check to prevent crash if meal data is missing
    if (!meal) return null;

    return (
        <div className="border border-green-500/30 bg-green-900/10 p-3 mb-3 rounded-sm">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-green-400 font-bold uppercase text-sm tracking-wider">{title}</h4>
            <span className="text-xs text-green-300 font-mono">{meal.calories || 0} kcal</span>
        </div>
        <p className="text-white font-semibold text-sm mb-1">{meal.name || 'Unknown Item'}</p>
        <p className="text-gray-400 text-xs italic mb-2">{meal.description || ''}</p>
        <div className="flex space-x-2 text-[10px] font-mono text-gray-500 uppercase">
            <span>P: <span className="text-gray-300">{meal.protein || '-'}</span></span>
            <span>C: <span className="text-gray-300">{meal.carbs || '-'}</span></span>
            <span>F: <span className="text-gray-300">{meal.fats || '-'}</span></span>
        </div>
        </div>
    );
  };

  const renderCalendar = () => {
      const today = new Date();
      const days = [];
      // Simple 30 day visualization
      for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
          const isCompleted = history.some(h => h.startsWith(dateStr));
          days.push({ date: d, isCompleted });
      }

      return (
          <div className="grid grid-cols-6 gap-2">
              {days.map((day, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded border flex items-center justify-center font-mono text-xs transition-all
                        ${day.isCompleted 
                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(147,51,234,0.6)]' 
                            : 'bg-black border-gray-800 text-gray-700'}
                      `}>
                          {day.date.getDate()}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  const renderArmy = () => {
      return (
          <div className="grid grid-cols-2 gap-4">
              {SHADOW_ARMY.map((shadowDef) => {
                  const isUnlocked = shadows.includes(shadowDef.id);
                  const currentStatus = shadowStatus[shadowDef.id] || {};
                  const isPatrolling = currentStatus.status === 'ON_PATROL';
                  
                  // Calculate time left
                  let timeLeft = "00:00";
                  let isFinished = false;

                  if (isPatrolling && currentStatus.patrolStartTime && currentStatus.patrolDuration) {
                      const endTime = currentStatus.patrolStartTime + (currentStatus.patrolDuration * 1000);
                      const diff = endTime - Date.now();
                      if (diff <= 0) {
                          isFinished = true;
                          timeLeft = "COMPLETE";
                      } else {
                          const h = Math.floor(diff / 3600000);
                          const m = Math.floor((diff % 3600000) / 60000);
                          timeLeft = `${h}h ${m}m`;
                      }
                  }

                  return (
                      <div key={shadowDef.id} className={`p-4 border rounded relative overflow-hidden transition-all flex flex-col items-center text-center
                          ${isUnlocked 
                              ? (isFinished ? 'border-yellow-500 bg-yellow-900/20' : 'border-purple-500 bg-purple-900/20 shadow-[0_0_15px_rgba(147,51,234,0.3)]') 
                              : 'border-gray-800 bg-black opacity-50 grayscale'}
                      `}>
                          <div className="text-4xl mb-2 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                              {isUnlocked ? shadowDef.image : '🔒'}
                          </div>
                          <h3 className={`font-bold uppercase tracking-wider text-sm ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                              {shadowDef.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 uppercase mb-2">{shadowDef.rank}</p>
                          
                          {!isUnlocked ? (
                              <div className="text-[10px] text-red-500 border border-red-900 bg-red-900/10 px-2 py-1 mt-2">
                                  Req: {shadowDef.requirement} Streak
                              </div>
                          ) : (
                              <div className="mt-2 w-full">
                                  {isPatrolling ? (
                                      isFinished ? (
                                          <button 
                                            onClick={() => onClaim && onClaim(shadowDef.id)}
                                            className="w-full bg-yellow-500 text-black text-[10px] font-bold uppercase py-2 animate-pulse"
                                          >
                                              Claim Loot
                                          </button>
                                      ) : (
                                          <div className="w-full bg-purple-900/50 text-purple-200 text-[10px] py-1 border border-purple-500/30">
                                              Patrolling: {timeLeft}
                                          </div>
                                      )
                                  ) : (
                                      <button 
                                        onClick={() => setSelectedShadow(shadowDef.id)}
                                        className="w-full bg-blue-900/30 border border-blue-500/50 text-blue-400 text-[10px] font-bold uppercase py-1 hover:bg-blue-600 hover:text-white transition-colors"
                                      >
                                          Dispatch
                                      </button>
                                  )}
                              </div>
                          )}
                      </div>
                  )
              })}
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 relative">
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload}
        />
        <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={foodInputRef} 
            onChange={handleFoodScan}
        />

        {/* DISPATCH MODAL */}
        {selectedShadow && (
            <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                <SystemLayout title="Select Mission" className="w-full max-w-sm">
                    <div className="space-y-3">
                        {PATROL_MISSIONS.map(mission => (
                            <button 
                                key={mission.id}
                                onClick={() => {
                                    if(onDispatch && selectedShadow) {
                                        onDispatch(selectedShadow, mission.id);
                                        setSelectedShadow(null);
                                    }
                                }}
                                className="w-full p-3 border border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-blue-900/20 text-left transition-all"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-white font-bold uppercase text-sm">{mission.name}</span>
                                    <span className="text-blue-400 text-xs">{mission.desc}</span>
                                </div>
                                <div className="text-[10px] text-gray-500">
                                    Rewards: {mission.reward.xp} XP, {mission.reward.gold} Gold
                                </div>
                            </button>
                        ))}
                        <button 
                            onClick={() => setSelectedShadow(null)}
                            className="w-full py-2 text-center text-red-500 text-xs font-bold uppercase mt-4"
                        >
                            Cancel
                        </button>
                    </div>
                </SystemLayout>
            </div>
        )}

        {selectedExercise && (
            <SkillModal 
                name={selectedExercise.name}
                data={{
                    rank: selectedExercise.rank,
                    type: selectedExercise.type,
                    description: selectedExercise.description,
                    muscles: selectedExercise.muscles,
                    tips: selectedExercise.tips,
                    videoUrl: selectedExercise.videoUrl,
                    gifData: selectedExercise.gifData
                }}
                onClose={() => setSelectedExercise(null)}
            />
        )}

        <div className="flex justify-between items-center mb-4 overflow-x-auto scrollbar-hide">
             <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mr-4">Grimoire</h2>
             <div className="flex space-x-1">
                 <button onClick={() => { playSystemSound('click'); setActiveTab('SKILLS'); }} className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'SKILLS' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}>Skills</button>
                 <button onClick={() => { playSystemSound('click'); setActiveTab('HISTORY'); }} className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'HISTORY' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}>Record</button>
                 <button onClick={() => { playSystemSound('click'); setActiveTab('ARMY'); }} className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'ARMY' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}>Army</button>
                 <button onClick={() => { playSystemSound('click'); setActiveTab('VESSEL'); }} className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'VESSEL' ? 'bg-yellow-600 border-yellow-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}>Vessel</button>
                 <button onClick={() => { playSystemSound('click'); setActiveTab('INTAKE'); }} className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'INTAKE' ? 'bg-green-600 border-green-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}>Intake</button>
             </div>
        </div>

        {/* --- INTAKE (FORMERLY NUTRITION) --- */}
        {activeTab === 'INTAKE' && (
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-4">
                
                {/* SCANNER */}
                <div className="p-4 bg-gray-900/50 border border-green-900/50 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-green-400 font-bold uppercase text-xs tracking-widest">Matter Analysis</h3>
                        <button 
                            onClick={() => foodInputRef.current?.click()}
                            className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-400 text-[10px] uppercase font-bold hover:bg-green-900/50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                            <span>Scan Food</span>
                        </button>
                    </div>
                    {foodAnalyzing && <p className="text-[10px] text-green-500 animate-pulse text-center py-2">Analyzing structure...</p>}
                    {scannedFood && (
                        <div className="mt-2 border-t border-gray-700 pt-2">
                            <div className="flex justify-between">
                                <span className="text-white font-bold text-sm">{scannedFood.name || 'Unknown Item'}</span>
                                <span className="text-yellow-400 font-mono text-sm">{scannedFood.calories || 0} kcal</span>
                            </div>
                            <div className="flex space-x-3 text-[10px] text-gray-500 mt-1 font-mono">
                                <span>P: {scannedFood.protein || '-'}</span>
                                <span>C: {scannedFood.carbs || '-'}</span>
                                <span>F: {scannedFood.fats || '-'}</span>
                            </div>
                            <button onClick={() => setScannedFood(null)} className="text-[9px] text-red-500 mt-2 uppercase hover:text-red-400">Dismiss</button>
                        </div>
                    )}
                </div>

                {/* SINGLE SNACK GENERATOR */}
                <div className="p-4 bg-gray-900/50 border border-blue-900/50 rounded-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest">Quick Ration (AI)</h3>
                    </div>
                    
                    {snackSuggestion ? (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <div className="border border-blue-500/30 bg-black p-3 mb-2">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white font-bold text-sm">{snackSuggestion.name}</h4>
                                    <span className="text-blue-300 font-mono text-xs">{snackSuggestion.calories} kcal</span>
                                </div>
                                <p className="text-gray-400 text-[10px] mt-1 leading-snug">{snackSuggestion.description}</p>
                                <div className="mt-2 text-[10px] text-blue-500 font-mono">Protein: {snackSuggestion.protein}</div>
                            </div>
                            <button onClick={() => setSnackSuggestion(null)} className="w-full py-1 text-[10px] text-gray-500 uppercase hover:text-white border border-transparent hover:border-gray-600">Clear</button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleGenerateSnack}
                            disabled={nutriLoading}
                            className="w-full py-3 border border-dashed border-blue-500/40 text-blue-300/70 hover:text-blue-300 hover:border-blue-500 hover:bg-blue-900/10 transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            {nutriLoading ? "Synthesizing..." : "Generate Healthy Snack"}
                        </button>
                    )}
                </div>

                {/* FULL PLAN */}
                {!nutritionPlan ? (
                    <SystemLayout title="Dietary Parameters">
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Current Weight</label>
                                <input 
                                    type="text" 
                                    value={weight} 
                                    onChange={(e) => setWeight(e.target.value)} 
                                    className="w-full bg-black border border-gray-700 text-white px-2 py-1 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Objective</label>
                                <select 
                                    value={goal} 
                                    onChange={(e) => setGoal(e.target.value)} 
                                    className="w-full bg-black border border-gray-700 text-white px-2 py-1 text-xs"
                                >
                                    <option>Build Muscle</option>
                                    <option>Lose Fat</option>
                                    <option>Maintain Physique</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 uppercase mb-1">Preferences</label>
                                <input 
                                    type="text" 
                                    value={preferences} 
                                    onChange={(e) => setPreferences(e.target.value)} 
                                    className="w-full bg-black border border-gray-700 text-white px-2 py-1 text-xs"
                                    placeholder="e.g. No dairy"
                                />
                            </div>
                            <button 
                                onClick={handleGeneratePlan}
                                disabled={nutriLoading}
                                className="w-full mt-2 bg-green-900/30 border border-green-500 text-green-400 py-2 text-xs font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all"
                            >
                                {nutriLoading ? "Calculating..." : "Generate Daily Plan"}
                            </button>
                        </div>
                    </SystemLayout>
                ) : (
                    <SystemLayout title="Daily Protocol">
                        <div className="text-center mb-4">
                            <span className="text-gray-400 text-[10px] uppercase">Total Target</span>
                            <div className="text-2xl font-bold text-white font-mono">{nutritionPlan.totalCalories} <span className="text-xs text-gray-500">kcal</span></div>
                        </div>
                        <MealCard title="Breakfast" meal={nutritionPlan.breakfast} />
                        <MealCard title="Lunch" meal={nutritionPlan.lunch} />
                        <MealCard title="Dinner" meal={nutritionPlan.dinner} />
                        {nutritionPlan.snack && <MealCard title="Snack" meal={nutritionPlan.snack} />}
                        <button 
                            onClick={() => setNutritionPlan(null)}
                            className="w-full mt-2 py-2 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest"
                        >
                            Recalculate
                        </button>
                    </SystemLayout>
                )}
            </div>
        )}

        {activeTab === 'HISTORY' && (
            <SystemLayout title="Extraction Record">
                <div className="p-2">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-gray-400 text-xs uppercase">Total Quests</p>
                            <p className="text-3xl font-bold text-blue-400 font-mono">{history.length}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-gray-500 text-[10px] uppercase">Consistency Grade</p>
                             <p className="text-white font-bold text-xl">
                                 {history.length > 20 ? 'S' : history.length > 10 ? 'A' : history.length > 5 ? 'B' : 'E'}
                             </p>
                        </div>
                    </div>
                    {renderCalendar()}
                </div>
            </SystemLayout>
        )}

        {activeTab === 'ARMY' && (
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                <div className="text-center mb-4">
                    <p className="text-purple-400 text-xs uppercase tracking-widest">Shadow Extraction</p>
                    <p className="text-gray-500 text-[10px]">
                        Maintain streaks to awaken your soldiers.
                    </p>
                </div>
                {renderArmy()}
            </div>
        )}

        {activeTab === 'VESSEL' && (
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-yellow-400 text-xs uppercase tracking-widest">Avatar Evolution</p>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] bg-yellow-600 text-black font-bold uppercase px-3 py-1 rounded"
                    >
                        + Update Form
                    </button>
                </div>
                
                {gallery.length === 0 ? (
                    <div className="border border-dashed border-gray-700 p-8 text-center text-gray-500 text-xs">
                        No form updates recorded. Upload a photo to track physical evolution.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {gallery.map((entry, i) => (
                            <div key={i} className="border border-gray-800 bg-gray-900/50 p-2">
                                <div className="aspect-[3/4] overflow-hidden mb-2 bg-black">
                                    <img src={entry.image} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono text-center">{entry.date}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'SKILLS' && (
            <>
                {/* Filters */}
                <div className="mb-4 space-y-2">
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                        {types.map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1 text-[10px] font-bold uppercase border whitespace-nowrap transition-colors
                                    ${filterType === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-gray-700 text-gray-500'}
                                `}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
                        {ranks.map(r => (
                            <button 
                                key={r}
                                onClick={() => setFilterRank(r)}
                                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold uppercase border transition-colors
                                    ${filterRank === r ? 'bg-blue-600 border-blue-600 text-white' : 'bg-black border-gray-700 text-gray-500'}
                                `}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pb-20">
                    {filteredExercises.map(ex => {
                        const mastery = skillMastery[ex.name] || { rank: 'E', xp: 0, totalReps: 0 };
                        // Next Threshold
                        const nextRank = mastery.rank === 'S' ? 'S' : (mastery.rank === 'E' ? 'D' : (mastery.rank === 'D' ? 'C' : (mastery.rank === 'C' ? 'B' : (mastery.rank === 'B' ? 'A' : 'S'))));
                        // @ts-ignore
                        const target = MASTERY_THRESHOLDS[nextRank];
                        const progress = mastery.rank === 'S' ? 100 : Math.min(100, (mastery.xp / target) * 100);

                        return (
                            <div 
                                key={ex.id}
                                onClick={() => { playSystemSound('hover'); setSelectedExercise(ex); }}
                                className="group relative bg-black/50 border border-gray-800 p-3 hover:border-blue-500/50 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 border flex items-center justify-center font-bold text-lg font-mono ${getRankColor(mastery.rank)}`}>
                                            {mastery.rank}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-white font-bold uppercase text-sm group-hover:text-blue-400 transition-colors">{ex.name}</h3>
                                                {ex.videoUrl && (
                                                    <span className="text-[8px] bg-blue-900/30 text-blue-400 px-1 rounded border border-blue-500/20">
                                                        ▶ MEDIA
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase">{ex.type} • {ex.muscles[0]}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                                
                                {/* Mastery Bar */}
                                <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden mt-2">
                                    <div className={`h-full ${mastery.rank === 'S' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[8px] text-gray-600 mt-1 uppercase font-mono">
                                    <span>Proficiency</span>
                                    <span>{mastery.xp} / {target} XP</span>
                                </div>
                            </div>
                        );
                    })}

                    {filteredExercises.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-gray-600 text-sm">No skills matching criteria.</p>
                        </div>
                    )}
                </div>
            </>
        )}
    </div>
  );
};
