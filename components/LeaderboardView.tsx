
import React, { useMemo, useState, useEffect } from 'react';
import { SystemLayout } from './SystemLayout';
import { Hunter, PlayerStats } from '../types';
import { playSystemSound } from '../services/audioService';

interface LeaderboardViewProps {
    hunters?: Hunter[];
    playerStats?: PlayerStats;
    playerName?: string;
    onAddRival?: (code: string) => void;
    onExtractShadow?: (hunterId: string) => void; // New Handler
}

const SYSTEM_LOGS = [
    "Thomas Andre cleared an A-Rank Gate.",
    "Cha Hae-In completed daily training.",
    "Sung Jin-Woo entered a Red Gate.",
    "Guild 'Ahjin' is recruiting new members.",
    "Global Mana levels rising in East Asia.",
    "System Alert: Dungeon Break reported in Tokyo.",
    "Goto Ryuji achieved Level 91.",
    "Rival Hunter updated their combat status.",
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
    hunters = [], 
    playerStats, 
    playerName = "Player",
    onAddRival,
    onExtractShadow
}) => {
  const [activeTab, setActiveTab] = useState<'RANKING' | 'COMMS'>('RANKING');
  const [inputCode, setInputCode] = useState("");
  const [logIndex, setLogIndex] = useState(0);

  // Rotate Logs
  useEffect(() => {
      const interval = setInterval(() => {
          setLogIndex(prev => (prev + 1) % SYSTEM_LOGS.length);
      }, 4000);
      return () => clearInterval(interval);
  }, []);

  const sortedHunters = useMemo(() => {
      // Create a combined list including the player
      const allHunters = [...hunters];
      
      if (playerStats) {
          allHunters.push({
              id: 'player',
              name: playerName,
              level: playerStats.level,
              job: playerStats.job,
              isPlayer: true
          });
      }

      // Sort by Level Descending, then Name
      return allHunters.sort((a, b) => b.level - a.level);
  }, [hunters, playerStats, playerName]);

  const handleAddRival = () => {
      if (inputCode && onAddRival) {
          playSystemSound('click');
          onAddRival(inputCode);
          setInputCode("");
      }
  };

  const handleExtract = (hunter: Hunter) => {
      if (onExtractShadow) {
          playSystemSound('start');
          onExtractShadow(hunter.id);
      }
  }

  return (
    <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col">
        
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Hunter System</h2>
             <div className="flex space-x-1">
                 <button 
                    onClick={() => { playSystemSound('click'); setActiveTab('RANKING'); }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'RANKING' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}
                 >
                     Live Ranking
                 </button>
                 <button 
                    onClick={() => { playSystemSound('click'); setActiveTab('COMMS'); }}
                    className={`px-3 py-1 text-[10px] font-bold uppercase border transition-colors ${activeTab === 'COMMS' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black border-gray-700 text-gray-500'}`}
                 >
                     Comms
                 </button>
             </div>
        </div>
        
        {activeTab === 'RANKING' && (
            <>
                <SystemLayout className="flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-y-auto scrollbar-hide flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-500 text-xs uppercase sticky top-0 bg-[#050b14] z-10">
                                    <th className="pb-2 pl-2">Rank</th>
                                    <th className="pb-2">Hunter</th>
                                    <th className="pb-2 text-right pr-2">Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedHunters.map((hunter, index) => {
                                    const rank = index + 1;
                                    const isMe = hunter.isPlayer;
                                    const isRival = hunter.isRival;
                                    const isOnline = Math.random() > 0.6 || isMe; // Simulating Online Status

                                    return (
                                        <tr key={hunter.id} className={`border-b border-gray-800 transition-colors 
                                            ${isMe ? 'bg-blue-900/30 border-blue-500/50' : ''}
                                            ${isRival ? 'bg-red-900/10 border-red-900/30' : ''}
                                            ${!isMe && !isRival ? 'hover:bg-white/5' : ''}
                                        `}>
                                            <td className="py-4 pl-2 font-mono font-bold text-gray-400">
                                                {rank === 1 ? <span className="text-yellow-400 text-lg shadow-yellow-500/50 drop-shadow-sm">#1</span> : 
                                                rank === 2 ? <span className="text-gray-300">#2</span> : 
                                                rank === 3 ? <span className="text-orange-400">#3</span> : 
                                                `#${rank}`}
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`font-bold text-sm ${isMe ? 'text-blue-300' : (isRival ? 'text-red-400' : 'text-white')}`}>
                                                        {hunter.name}
                                                    </span>
                                                    {isMe && <span className="text-[8px] bg-blue-500 text-black px-1 rounded font-bold uppercase">YOU</span>}
                                                    {isRival && <span className="text-[8px] bg-red-600 text-black px-1 rounded font-bold uppercase">RIVAL</span>}
                                                    {isOnline && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase">{hunter.job}</div>
                                            </td>
                                            <td className="py-4 text-right pr-2 font-mono text-blue-300">
                                                LVL {hunter.level}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SystemLayout>
                
                <div className="mt-4 p-4 border border-dashed border-gray-700 bg-black/50 overflow-hidden relative">
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Guild Activity Log</p>
                    <div className="text-xs text-blue-400 font-mono animate-pulse">
                        &gt; {SYSTEM_LOGS[logIndex]}
                    </div>
                </div>
            </>
        )}

        {activeTab === 'COMMS' && (
            <div className="space-y-4">
                <SystemLayout title="My Hunter ID">
                    <div className="text-center p-4">
                        <p className="text-gray-400 text-xs uppercase mb-2">Share this code with other hunters</p>
                        <div className="bg-black border border-blue-500/50 p-3 rounded font-mono text-xl text-blue-400 font-bold select-all tracking-wider">
                            {playerStats?.hunterCode || "GENERATING..."}
                        </div>
                    </div>
                </SystemLayout>

                <SystemLayout title="Register Rival">
                    <div className="p-2 space-y-3">
                        <input 
                            type="text" 
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            placeholder="ENTER HUNTER CODE"
                            className="w-full bg-black border border-gray-700 text-white px-3 py-3 text-center font-mono focus:border-blue-500 focus:outline-none uppercase"
                        />
                        <button 
                            onClick={handleAddRival}
                            className="w-full py-3 bg-blue-900/30 border border-blue-500 text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        >
                            Establish Link
                        </button>
                    </div>
                </SystemLayout>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">Linked Rivals</h3>
                    <div className="space-y-2">
                        {hunters.filter(h => h.isRival).map(rival => (
                            <div key={rival.id} className="bg-red-950/10 border border-red-900/30 p-3 flex justify-between items-center animate-in slide-in-from-left duration-300">
                                <div>
                                    <span className="text-red-400 font-bold text-sm block">{rival.name}</span>
                                    <span className="text-gray-500 text-[10px] uppercase">{rival.job}</span>
                                </div>
                                <div className="text-right flex flex-col items-end space-y-1">
                                    <span className="text-white font-mono font-bold">LVL {rival.level}</span>
                                    <button 
                                        onClick={() => handleExtract(rival)}
                                        className="text-[8px] bg-purple-900/30 text-purple-400 border border-purple-500/50 px-2 py-1 uppercase hover:bg-purple-600 hover:text-white"
                                    >
                                        Extract Shadow
                                    </button>
                                </div>
                            </div>
                        ))}
                        {hunters.filter(h => h.isRival).length === 0 && (
                            <p className="text-gray-600 text-xs italic text-center py-4 border border-gray-800 bg-black/50">No active rivals linked.</p>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
