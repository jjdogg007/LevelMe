
import React, { useState, useEffect } from 'react';
import { SystemLayout } from './SystemLayout';
import { PlayerStats, WorldBoss } from '../types';
import { playSystemSound } from '../services/audioService';
import { HoldButton } from './HoldButton';

interface WorldBossViewProps {
    stats: PlayerStats;
    boss: WorldBoss;
    onAttack: (damage: number) => void;
}

export const WorldBossView: React.FC<WorldBossViewProps> = ({ stats, boss, onAttack }) => {
    const [attackLog, setAttackLog] = useState<string[]>([]);
    
    // Simulate live updates
    const [displayHp, setDisplayHp] = useState(boss.currentHp);
    useEffect(() => {
        setDisplayHp(boss.currentHp);
    }, [boss.currentHp]);

    const handleAttack = () => {
        // Base damage based on stats
        const baseDmg = 100 + (stats.strength * 5);
        const crit = Math.random() < (stats.sense * 0.01);
        const damage = Math.floor(crit ? baseDmg * 2 : baseDmg);
        
        playSystemSound(crit ? 'levelUp' : 'start');
        onAttack(damage);
        
        setDisplayHp(prev => Math.max(0, prev - damage));
        setAttackLog(prev => [`Dealt ${damage} DMG ${crit ? '(CRITICAL!)' : ''}`, ...prev.slice(0, 4)]);
    };

    const hpPercent = (displayHp / boss.maxHp) * 100;

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="text-center mb-4">
                <h2 className="text-3xl font-bold text-red-500 uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                    GLOBAL RAID
                </h2>
                <p className="text-red-300 text-xs tracking-[0.5em] uppercase">S-Rank Gate: Tokyo</p>
            </div>

            <SystemLayout className="flex-1 flex flex-col relative overflow-hidden border-red-600 bg-red-950/20">
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,rgba(220,38,38,0.2)_0%,transparent_70%)]"></div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col items-center justify-center space-y-6">
                    {/* Boss Visual */}
                    <div className="w-48 h-48 bg-black border-4 border-red-600 rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                        <div className="-rotate-45 text-center">
                            <span className="text-6xl">🐲</span>
                            <p className="text-red-500 font-bold uppercase mt-2 text-sm">{boss.name}</p>
                        </div>
                    </div>

                    {/* HP Bar */}
                    <div className="w-full px-4">
                        <div className="flex justify-between text-red-400 text-xs font-bold mb-1 font-mono">
                            <span>HP: {displayHp.toLocaleString()}</span>
                            <span>{hpPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-6 bg-black border border-red-900 rounded-sm overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center z-10 text-[10px] text-white font-bold shadow-black drop-shadow-md">
                                {boss.participants.toLocaleString()} HUNTERS ACTIVE
                            </div>
                            <div 
                                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300 ease-out" 
                                style={{ width: `${hpPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Combat Log */}
                    <div className="w-full h-24 bg-black/50 border border-red-900/30 p-2 overflow-hidden">
                        {attackLog.map((log, i) => (
                            <p key={i} className="text-[10px] text-red-300 font-mono animate-in slide-in-from-bottom-2 fade-in">
                                &gt; {log}
                            </p>
                        ))}
                        {attackLog.length === 0 && <p className="text-[10px] text-gray-600 text-center mt-4">Waiting for input...</p>}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-4 p-2 relative">
                    <HoldButton 
                        onComplete={handleAttack} 
                        label={<span className="font-bold uppercase tracking-widest text-xl">MASS STRIKE</span>}
                        colorClass="bg-red-600"
                        className="w-full py-6 border-2 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    />
                    <p className="text-center text-[10px] text-gray-500 mt-2">Hold to contribute damage from Daily Quests</p>
                </div>
            </SystemLayout>
        </div>
    );
};
