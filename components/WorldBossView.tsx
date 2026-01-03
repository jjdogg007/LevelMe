
import React, { useState, useEffect } from 'react';
import { SystemLayout } from './SystemLayout';
import { PlayerStats, WorldBoss, Exercise } from '../types';
import { playSystemSound } from '../services/audioService';
import { SYSTEM_DATABASE } from '../constants';

interface WorldBossViewProps {
    stats: PlayerStats;
    boss: WorldBoss;
    onAttack: (damage: number) => void;
    onSelectCombatMove?: (exercise: Exercise) => void; // New Handler for opening modal
}

// Simulated NPC Attack Log
const NPC_ACTIONS = [
    "Thomas Andre used 'Reinforcement'",
    "Cha Hae-In used 'Sword Dance'",
    "Goto Ryuji used 'Draw Sword'",
    "Liu Zhigang used 'Dragon Force'",
    "Baek Yoon-Ho used 'Beast Transformation'",
    "Choi Jong-In used 'Flame Spear'",
    "Kanae Tawata used 'Shadow Step'",
    "Lennart Niermann used 'Holy Blast'"
];

export const WorldBossView: React.FC<WorldBossViewProps> = ({ stats, boss, onAttack, onSelectCombatMove }) => {
    const [attackLog, setAttackLog] = useState<string[]>([]);
    const [timeLeft, setTimeLeft] = useState("");
    const [activeTab, setActiveTab] = useState<'ACTIONS' | 'INFO'>('ACTIONS');

    // Countdown Timer (Hardcoded target date for now based on constant)
    useEffect(() => {
        const target = new Date(boss.endTime).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff <= 0) {
                setTimeLeft("00:00:00:00");
            } else {
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${d}D ${h}H ${m}M`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [boss.endTime]);

    // Simulated NPC Combat Log
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.5) {
                const npc = NPC_ACTIONS[Math.floor(Math.random() * NPC_ACTIONS.length)];
                const dmg = Math.floor(Math.random() * 5000) + 1000;
                setAttackLog(prev => [`${npc} [-${dmg}]`, ...prev.slice(0, 5)]);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const combatMoves = SYSTEM_DATABASE.slice(0, 6); // Just pick first 6 for demo

    const hpPercent = (boss.currentHp / boss.maxHp) * 100;

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            {/* Header: Countdown & Status */}
            <div className="flex justify-between items-center mb-4 p-2 bg-red-950/30 border-b border-red-600/30">
                <div>
                    <h2 className="text-xl font-bold text-red-500 uppercase tracking-tighter animate-pulse">
                        DUNGEON BREAK
                    </h2>
                    <p className="text-red-300 text-[10px] tracking-widest uppercase">S-Rank Gate: Tokyo</p>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase block">Time Remaining</span>
                    <span className="text-lg font-mono font-bold text-white">{timeLeft}</span>
                </div>
            </div>

            {/* Boss Visual & HP */}
            <SystemLayout className="flex flex-col relative overflow-hidden border-red-600 bg-red-950/10 mb-4 h-48">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,rgba(220,38,38,0.2)_0%,transparent_70%)]"></div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
                    {/* Boss Icon */}
                    <div className="text-6xl mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                        🐲
                    </div>
                    <p className="text-white font-bold uppercase text-lg tracking-widest">{boss.name}</p>
                    
                    {/* HP Bar */}
                    <div className="w-full px-6 mt-2">
                        <div className="flex justify-between text-red-400 text-xs font-bold mb-1 font-mono">
                            <span>HP: {boss.currentHp.toLocaleString()}</span>
                            <span>{hpPercent.toFixed(2)}%</span>
                        </div>
                        <div className="w-full h-3 bg-black border border-red-900 rounded-sm overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 ease-out" 
                                style={{ width: `${hpPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </SystemLayout>

            {/* Scrolling Battle Log */}
            <div className="h-24 bg-black border border-gray-800 p-2 mb-4 overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-red-900/50 text-[8px] px-1 text-white font-bold">BATTLE LOG</div>
                <div className="mt-4 space-y-1">
                    {attackLog.map((log, i) => (
                        <p key={i} className="text-[10px] text-gray-400 font-mono animate-in slide-in-from-left-2 fade-in">
                            {log}
                        </p>
                    ))}
                </div>
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-black to-transparent pointer-events-none"></div>
            </div>

            {/* Combat Actions */}
            <div className="flex-1 flex flex-col">
                <div className="flex space-x-1 mb-2">
                    <button onClick={() => setActiveTab('ACTIONS')} className={`flex-1 py-1 text-xs font-bold uppercase border ${activeTab === 'ACTIONS' ? 'bg-red-600 border-red-500 text-black' : 'bg-black border-gray-700 text-gray-500'}`}>Combat Skills</button>
                    <button onClick={() => setActiveTab('INFO')} className={`flex-1 py-1 text-xs font-bold uppercase border ${activeTab === 'INFO' ? 'bg-blue-600 border-blue-500 text-black' : 'bg-black border-gray-700 text-gray-500'}`}>Raid Info</button>
                </div>

                {activeTab === 'ACTIONS' ? (
                    <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-2 gap-2 pb-4">
                        {combatMoves.map(move => (
                            <button
                                key={move.id}
                                onClick={() => onSelectCombatMove && onSelectCombatMove(move)}
                                className="bg-gray-900/80 border border-gray-700 p-3 hover:border-red-500 hover:bg-red-900/20 transition-all text-left group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-xs text-white group-hover:text-red-400 uppercase">{move.name}</span>
                                    <span className="text-[9px] bg-gray-800 px-1 rounded text-gray-400">{move.type}</span>
                                </div>
                                <p className="text-[9px] text-gray-500">Expend Mana to deal damage based on {move.muscles[0]}.</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 bg-gray-900/50 p-4 border border-gray-800 text-xs text-gray-400 space-y-2">
                        <p><span className="text-white font-bold">OBJECTIVE:</span> Deplete the Boss HP before the timer expires.</p>
                        <p><span className="text-white font-bold">MECHANIC:</span> Perform physical exercises to generate magical energy. Your stats determine damage multiplier.</p>
                        <p><span className="text-white font-bold">REWARDS:</span></p>
                        <ul className="list-disc list-inside pl-2">
                            <li>Contribution Rank S: S-Rank Item Box</li>
                            <li>Contribution Rank A: 50,000 Gold</li>
                            <li>Participation: 5,000 XP</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
