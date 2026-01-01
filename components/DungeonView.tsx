
import React, { useState } from 'react';
import { DUNGEONS, SHOP_ITEMS } from '../constants';
import { PlayerStats, Dungeon } from '../types';
import { playSystemSound } from '../services/audioService';

interface DungeonViewProps {
    stats: PlayerStats;
    onSelectDungeon: (dungeon: Dungeon) => void;
    onClose: () => void;
}

const RANKS = ['E', 'D', 'C', 'B', 'A', 'S'];

export const DungeonView: React.FC<DungeonViewProps> = ({ stats, onSelectDungeon, onClose }) => {
    const [selectedRank, setSelectedRank] = useState('E');

    const handleSelect = (dungeon: Dungeon) => {
        const hasKey = stats.inventory.includes(dungeon.keyId);
        
        if (!hasKey) {
            playSystemSound('glitch');
            const keyName = SHOP_ITEMS.find(i => i.id === dungeon.keyId)?.name || "Required Key";
            alert(`Access Denied. Item required: ${keyName}`);
            return;
        }
        
        if (stats.level < dungeon.minLevel) {
            playSystemSound('glitch');
            alert(`Level too low. Required: ${dungeon.minLevel}`);
            return;
        }
        playSystemSound('start');
        onSelectDungeon(dungeon);
    };

    const filteredDungeons = DUNGEONS.filter(d => d.rank === selectedRank);
    
    // Count keys for this rank
    const keyIdForRank = `key_${selectedRank.toLowerCase()}`;
    const keyCount = stats.inventory.filter(id => id === keyIdForRank).length; 
    // Note: Inventory is currently just a list of IDs. If logic prevents duplicates, this might just be 0 or 1. 
    // Assuming basic logic: if includes, show 1. 
    const displayKeyCount = stats.inventory.includes(keyIdForRank) ? 1 : 0; 

    return (
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-black relative">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 pt-6">
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">DUNGEONS</h2>
                <div className="w-6"></div> {/* Spacer for alignment */}
            </div>

            {/* Rank Tabs */}
            <div className="flex justify-center space-x-6 px-4 py-4 mb-4">
                {RANKS.map(rank => (
                    <button 
                        key={rank}
                        onClick={() => { playSystemSound('click'); setSelectedRank(rank); }}
                        className={`text-sm font-bold transition-all relative pb-1
                            ${selectedRank === rank ? 'text-white scale-125' : 'text-gray-600 hover:text-gray-400'}
                        `}
                    >
                        {rank}
                        {selectedRank === rank && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Dungeons Grid */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredDungeons.map(d => {
                        const hasKey = stats.inventory.includes(d.keyId);
                        const isRedGate = d.isRedGate;
                        
                        return (
                            <div 
                                key={d.id} 
                                onClick={() => handleSelect(d)}
                                className={`rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 active:scale-95 border-2 
                                    ${selectedRank === 'S' || isRedGate ? 'border-red-900' : 'border-blue-900'}
                                    ${!hasKey ? 'opacity-70 grayscale' : 'hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]'}
                                `}
                            >
                                {/* Card Top (Visual) */}
                                <div className={`h-32 relative flex items-center justify-center
                                    ${isRedGate 
                                        ? 'bg-gradient-to-b from-red-900 to-black' 
                                        : 'bg-gradient-to-b from-blue-700 to-black'}
                                `}>
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white flex items-center space-x-1 border border-white/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                                        <span>GATE</span>
                                    </div>

                                    {/* Center Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white/80 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>

                                {/* Card Bottom (Details) */}
                                <div className="bg-[#0a0a0a] p-4 border-t border-white/10">
                                    <h3 className="text-white font-bold uppercase tracking-wide text-sm mb-2">{d.name}</h3>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold
                                            ${selectedRank === 'S' || isRedGate ? 'border-red-500 text-red-500' : 'border-gray-500 text-gray-400'}
                                        `}>
                                            Rank {d.rank}
                                        </span>
                                        
                                        <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-2 py-0.5 rounded-full font-bold flex items-center">
                                            ★ {d.rewards.xp}-{Math.floor(d.rewards.xp * 1.5)} XP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {filteredDungeons.length === 0 && (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-600 text-sm font-mono uppercase">No Gates detected in this vicinity.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Key Floating Action Button */}
            <div className="absolute bottom-6 right-6">
                <div className="flex items-center space-x-3 bg-yellow-500 text-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] font-bold animate-in slide-in-from-bottom-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 000-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xl">{displayKeyCount}</span>
                </div>
            </div>

        </div>
    );
};
