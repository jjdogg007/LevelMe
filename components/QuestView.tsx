
import React, { useState, useEffect } from 'react';
import { DailyQuest, PlayerStats, QuestTask, WorkoutSet } from '../types';
import { SkillModal } from './SkillModal';
import { EXERCISE_INFO } from '../constants';
import { playSystemSound } from '../services/audioService';

interface QuestViewProps {
  quest: DailyQuest;
  specialQuest: DailyQuest | null;
  onUpdateTask: (taskId: string, newValue: number, isSpecial?: boolean, updatedSets?: WorkoutSet[]) => void;
  onSetSpecialQuest: (quest: DailyQuest) => void;
  onRegenerate: (isEmergency?: boolean) => void;
  onOpenShop: () => void;
  onOpenDungeon: () => void; 
  keys: number;
  stats: PlayerStats;
  isGenerating?: boolean;
  isQuestStarted: boolean;
  onStart: () => void;
  dailySteps?: number; // Passed from App
}

export const QuestView: React.FC<QuestViewProps> = ({ 
    quest, 
    specialQuest, 
    onUpdateTask, 
    onRegenerate, 
    onOpenShop,
    onOpenDungeon,
    stats,
    isGenerating = false,
    isQuestStarted,
    onStart,
    dailySteps = 0
}) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [dates, setDates] = useState<{ day: number, fullDate: Date }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Gate Scanning State
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Determine which quest to display (Story/Dungeon takes priority)
  const activeQuest = specialQuest || quest;
  const isSpecialActive = !!specialQuest;

  useEffect(() => {
    const today = new Date();
    const tempDates = [];
    // Show range from -4 days to +2 days relative to Today
    for (let i = -4; i <= 2; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        tempDates.push({ day: d.getDate(), fullDate: d });
    }
    setDates(tempDates);
  }, []);

  const today = new Date();
  const isToday = selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth();
  const isFuture = selectedDate > today && !isToday;
  const isPast = selectedDate < today && !isToday;

  // Determine Past Status
  let pastStatus: 'COMPLETED' | 'FAILED' = 'FAILED';
  if (isPast) {
      const selYear = selectedDate.getFullYear();
      const selMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const selDay = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${selYear}-${selMonth}-${selDay}`;
      
      const found = stats.history.some(h => h.startsWith(dateStr));
      if (found) pastStatus = 'COMPLETED';
  }

  // Visual States
  const isEmergency = activeQuest.type === 'emergency';
  const isFailedToday = activeQuest.status === 'failed';
  const isCompletedToday = activeQuest.status === 'completed';
  
  const showRedAlert = (isToday && isEmergency && !isCompletedToday) || isFailedToday;

  const displayStarted = isSpecialActive ? true : isQuestStarted;

  const handleStart = () => {
    playSystemSound('start');
    onStart();
  };

  const handleTaskClick = (task: QuestTask) => {
    if ((!isToday && !isSpecialActive) || (!displayStarted && !isSpecialActive) || isFailedToday) {
        if (!displayStarted && isToday && !isFailedToday) {
             playSystemSound('glitch');
        }
        return; 
    }
    
    // Instant Completion Toggle
    const isComplete = task.current >= task.target;
    if (isComplete) {
        playSystemSound('click');
        onUpdateTask(task.id, 0, isSpecialActive);
    } else {
        playSystemSound('success');
        onUpdateTask(task.id, task.target, isSpecialActive);
    }
  };

  const handleDateSelect = (d: Date) => {
      playSystemSound('click');
      setSelectedDate(d);
  };

  // Gate Scan Logic
  const handleGateScan = () => {
      playSystemSound('click');
      setScanning(true);
      setScanMessage("Searching vicinity...");
      
      setTimeout(() => {
          setScanning(false);
          // Threshold: 500 steps to find a gate
          if (dailySteps >= 500) {
              playSystemSound('levelUp');
              setScanMessage("SIGNAL DETECTED!");
              setTimeout(() => {
                  setScanMessage(null);
                  onRegenerate(true); // Trigger Emergency Quest (Gate)
              }, 1000);
          } else {
              playSystemSound('glitch');
              const needed = 500 - dailySteps;
              setScanMessage(`NO SIGNAL. MOVE ${needed} MORE STEPS.`);
              setTimeout(() => setScanMessage(null), 3000);
          }
      }, 2000);
  };

  const hasKey = stats.inventory.some(item => item.startsWith('key_'));

  return (
    <div className="h-full flex flex-col pt-2 relative">
      
      {/* Skill Info Modal */}
      {selectedSkill && EXERCISE_INFO[selectedSkill] && (
        <SkillModal 
          name={selectedSkill} 
          data={EXERCISE_INFO[selectedSkill]} 
          onClose={() => setSelectedSkill(null)} 
        />
      )}

      {/* HEADER: Gold & Streak */}
      <div className="flex justify-between items-center mb-2 px-2">
          <button 
            onClick={() => { playSystemSound('hover'); onOpenShop(); }}
            className="flex items-center space-x-1 bg-gray-900/80 px-3 py-1 rounded-full border border-yellow-600/50 hover:bg-yellow-900/20 transition-colors"
          >
              <span className="text-yellow-500 text-sm">🪙</span>
              <span className="text-yellow-100 font-mono text-xs font-bold">{stats.gold.toLocaleString()}</span>
          </button>
          
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">System Interface</h1>

          <div className="flex items-center space-x-1 bg-gray-900/80 px-3 py-1 rounded-full border border-gray-800">
              <span className="text-orange-500 text-lg">🔥</span>
              <span className="text-white font-bold">{stats.streak}</span>
          </div>
      </div>

      {/* INSTANCE DUNGEON ALERT (If Key Exists) */}
      {!isSpecialActive && hasKey && !isFailedToday && (
          <div className="px-2 mb-2">
              <button 
                onClick={() => { playSystemSound('click'); onOpenDungeon(); }}
                className="w-full bg-blue-900/30 border border-blue-500/50 p-2 rounded flex justify-between items-center animate-pulse hover:bg-blue-900/50 transition-colors"
              >
                  <div className="flex items-center space-x-2">
                      <span className="text-xl">🌀</span>
                      <div className="text-left">
                          <p className="text-blue-300 font-bold text-xs uppercase tracking-wider">Dimensional Gate Detected</p>
                          <p className="text-[10px] text-gray-400">Dungeon Key Available</p>
                      </div>
                  </div>
                  <span className="bg-blue-600 text-black text-[9px] font-bold px-2 py-1 uppercase rounded">Enter</span>
              </button>
          </div>
      )}

      {/* DATE STRIP (Hidden if in Special Quest Mode) */}
      {!isSpecialActive && (
          <div className="flex justify-between items-center px-2 mb-4 overflow-x-auto scrollbar-hide">
              {dates.map((d, i) => {
                  const isSelectedDay = d.day === selectedDate.getDate() && d.fullDate.getMonth() === selectedDate.getMonth();
                  const isTodayDate = d.day === today.getDate() && d.fullDate.getMonth() === today.getMonth();
                  
                  return (
                      <button 
                        key={i} 
                        onClick={() => handleDateSelect(d.fullDate)}
                        className={`flex flex-col items-center justify-center w-10 h-14 rounded-lg transition-all mx-1 flex-shrink-0
                            ${isSelectedDay 
                                ? 'bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.6)]' 
                                : (isTodayDate ? 'border border-blue-500/50 text-blue-400' : 'text-gray-600 hover:bg-gray-800')}
                        `}
                      >
                          <span className="text-xs font-bold uppercase">{d.fullDate.toLocaleDateString('en-US', {weekday: 'short'}).substring(0,2)}</span>
                          <span className="text-lg font-bold leading-none">{d.day}</span>
                          {isTodayDate && <div className="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>}
                      </button>
                  )
              })}
          </div>
      )}

      {/* --- QUEST CARD (SOLO LEVELING STYLE) --- */}
      <div className={`relative flex-1 flex flex-col border-2 rounded-2xl p-6 mx-2 mb-4 overflow-hidden transition-all duration-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]
          ${showRedAlert 
             ? 'border-red-600 bg-red-950/20 shadow-[0_0_30px_rgba(220,38,38,0.3)]' 
             : (isSpecialActive ? 'border-purple-500 bg-purple-900/10' : 'border-blue-500 bg-black/80')}
      `}>
          
          {/* Glitch Overlay for Failures/Emergency */}
          {((showRedAlert) || (isPast && pastStatus === 'FAILED')) && (
             <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse z-0"></div>
          )}

          {/* CARD HEADER */}
          <div className="relative z-10 flex flex-col items-center mb-6">
               <div className="flex items-center space-x-2 mb-2">
                   <div className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] ${showRedAlert ? 'border-b-red-500' : (isSpecialActive ? 'border-b-purple-500' : 'border-b-yellow-500')}`}></div>
                   <h2 className={`font-bold uppercase tracking-[0.2em] text-lg ${isSpecialActive ? 'text-purple-400' : 'text-white'}`}>
                       {isEmergency && !isCompletedToday ? 'EMERGENCY QUEST' : (isSpecialActive ? 'SPECIAL QUEST' : 'QUEST INFO')}
                   </h2>
               </div>
               <div className={`h-0.5 w-full ${showRedAlert ? 'bg-red-800' : (isSpecialActive ? 'bg-purple-900/50' : 'bg-blue-900/50')}`}></div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
               
               {/* --- TODAY'S / ACTIVE VIEW --- */}
               {(isToday || isSpecialActive) && (
                   <div className="space-y-6">
                       <div className="text-center mb-4">
                           <div className="flex justify-center items-center space-x-2">
                               <h3 className={`text-2xl font-bold uppercase tracking-wider mb-1 ${isEmergency && !isCompletedToday ? 'text-red-500 animate-pulse' : (isSpecialActive ? 'text-purple-100' : 'text-gray-400')}`}>
                                   {isCompletedToday && isEmergency ? "THREAT ELIMINATED" : activeQuest.title}
                               </h3>
                               
                               {/* REGENERATE BUTTON - Only for Daily Quests */}
                               {!isSpecialActive && isToday && !isQuestStarted && !isFailedToday && !isCompletedToday && (
                                   <button 
                                     onClick={() => { playSystemSound('click'); onRegenerate(false); }}
                                     disabled={isGenerating}
                                     className="w-8 h-8 rounded-full border border-gray-600 bg-gray-900 flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-all ml-2 hover:bg-gray-800"
                                     title="Regenerate / Switch Mode"
                                   >
                                       {isGenerating ? <span className="animate-spin text-xs">⟳</span> : <span className="text-xs">↻</span>}
                                   </button>
                               )}
                           </div>
                           
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest">{activeQuest.description}</p>
                       </div>

                       <div className="space-y-4 px-2">
                           {activeQuest.tasks.map((task) => {
                               const isComplete = task.current >= task.target;
                               
                               return (
                                   <div key={task.id} 
                                        className={`flex justify-between items-center group transition-all p-2 rounded cursor-pointer select-none
                                            ${(!displayStarted && !isSpecialActive) || isFailedToday ? 'opacity-70' : 'hover:bg-white/5 active:scale-95'}
                                        `}
                                        onClick={() => handleTaskClick(task)}
                                   >
                                       <span className={`uppercase font-bold tracking-wider text-sm transition-colors ${isComplete ? 'text-gray-500 line-through' : 'text-white'}`}>
                                           {task.name}
                                       </span>
                                       
                                       <span className={`font-mono text-sm tracking-wider ${isComplete ? 'text-green-500' : 'text-blue-400'}`}>
                                           [{isComplete ? task.target : 0}/{task.target} {task.unit}]
                                       </span>
                                   </div>
                               )
                           })}
                       </div>

                       {/* START BUTTON (Only for Daily) */}
                       {!displayStarted && !isFailedToday && !isSpecialActive && !isCompletedToday && (
                           <div className="flex flex-col items-center mt-8 space-y-3">
                               <button 
                                  onClick={handleStart}
                                  className={`bg-white text-black font-bold py-3 px-12 rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]`}
                               >
                                   {activeQuest.type === 'rest' ? 'Begin Recovery' : 'Start Quest'}
                               </button>
                               
                               {/* GATE RADAR (Replaces simple regenerate) */}
                               {!isEmergency && (
                                   <button 
                                    onClick={handleGateScan}
                                    disabled={scanning || !!scanMessage}
                                    className={`text-[10px] uppercase tracking-widest transition-all font-bold px-4 py-2 border rounded-full flex items-center space-x-2
                                        ${scanning ? 'border-blue-500 text-blue-400 bg-blue-900/20' : (scanMessage ? 'border-red-500 text-red-400 bg-red-900/20' : 'border-gray-600 text-gray-500 hover:text-white hover:border-white')}
                                    `}
                                   >
                                      {scanning ? (
                                          <>
                                            <span className="animate-spin">◎</span>
                                            <span>Scanning Vicinity...</span>
                                          </>
                                      ) : scanMessage ? (
                                          <span>{scanMessage}</span>
                                      ) : (
                                          <>
                                            <span>⌖</span>
                                            <span>Gate Radar</span>
                                          </>
                                      )}
                                   </button>
                               )}
                           </div>
                       )}

                       {/* WARNING TEXT */}
                       <div className="mt-4 mb-2">
                           {isEmergency && !isCompletedToday ? (
                               <p className="text-red-500 font-bold text-xs uppercase mb-1 text-center">SURVIVE</p>
                           ) : (
                               <div className="text-center">
                                   <p className="text-gray-500 font-bold text-[10px] uppercase mb-1">{isCompletedToday ? "COMPLETE" : "OBJECTIVE"}</p>
                                   <p className="text-gray-600 text-[9px] leading-relaxed uppercase">
                                       {isCompletedToday ? "Reward distribution complete." : "Complete all tasks to claim rewards."}
                                   </p>
                               </div>
                           )}
                       </div>
                   </div>
               )}

               {/* --- PAST VIEW --- */}
               {isPast && !isSpecialActive && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-80 space-y-4">
                       {pastStatus === 'COMPLETED' ? (
                           <>
                               <h3 className="text-3xl font-bold text-purple-400 uppercase tracking-widest">Completed</h3>
                               <p className="text-gray-400 text-xs max-w-[200px] border-t border-purple-900 pt-4">
                                   Daily directive executed. <br/>Rewards claimed.
                               </p>
                           </>
                       ) : (
                           <>
                               <h3 className="text-3xl font-bold text-red-600 uppercase tracking-widest">Failed</h3>
                               <p className="text-gray-400 text-xs max-w-[200px] border-t border-red-900 pt-4">
                                   No signature detected. <br/>Penalty recorded.
                               </p>
                           </>
                       )}
                   </div>
               )}

               {/* --- FUTURE VIEW (ENCRYPTED) --- */}
               {isFuture && !isSpecialActive && (
                   <div className="space-y-6 opacity-60 pointer-events-none select-none">
                       <div className="text-center mb-4">
                           <h3 className="text-2xl font-bold uppercase tracking-wider mb-1 text-gray-600 blur-[2px]">
                               SYSTEM ENCRYPTED
                           </h3>
                           <p className="text-[10px] text-gray-700 uppercase tracking-widest">ACCESS DENIED</p>
                       </div>

                       <div className="space-y-4 px-2">
                           {[1, 2, 3, 4].map((i) => (
                               <div key={i} className="flex justify-between items-center p-2">
                                   <span className="uppercase font-bold tracking-wider text-sm text-gray-700 blur-[3px]">
                                       UNKNOWN TASK {i}
                                   </span>
                                   <span className="font-mono text-sm tracking-wider text-blue-900 blur-[2px]">
                                       [?? REPS]
                                   </span>
                               </div>
                           ))}
                       </div>
                       
                       <div className="mt-12 mb-4 text-center">
                           <p className="text-gray-800 font-bold text-xs uppercase mb-1">SYSTEM NOTICE</p>
                           <p className="text-gray-800 text-[10px] leading-relaxed uppercase">
                               This information is locked until the server time reaches {selectedDate.toLocaleDateString()}.
                           </p>
                       </div>
                   </div>
               )}

          </div>

          {/* TIMER (Footer) */}
          <div className="mt-auto pt-2 flex justify-center items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="font-mono text-2xl text-white font-bold tracking-widest">
                  {isToday || isSpecialActive ? activeQuest.timeLeft : (isFuture ? '--:--:--' : '00:00:00')}
              </span>
          </div>
          
      </div>

    </div>
  );
};
