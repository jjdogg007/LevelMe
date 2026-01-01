
import React from 'react';
import { PlayerStats } from '../types';

interface HunterCardProps {
    stats: PlayerStats;
    onClose: () => void;
}

export const HunterCard: React.FC<HunterCardProps> = ({ stats, onClose }) => {
    
    // Determine Rank
    let rank = 'E';
    if (stats.level >= 10) rank = 'D';
    if (stats.level >= 20) rank = 'C';
    if (stats.level >= 40) rank = 'B';
    if (stats.level >= 60) rank = 'A';
    if (stats.level >= 80) rank = 'S';

    const latestImage = stats.gallery.length > 0 ? stats.gallery[0].image : null;

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4">
            <div className="text-center mb-6">
                <h2 className="text-white font-bold uppercase tracking-widest text-sm mb-1">Hunter Authority Card</h2>
                <p className="text-gray-500 text-xs">Take a screenshot to share</p>
            </div>

            {/* THE CARD */}
            <div className="relative w-full max-w-sm aspect-[3/5] bg-[#050b14] border-2 border-blue-500/50 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.3)] flex flex-col">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #1e3a8a 25%, transparent 25%, transparent 75%, #1e3a8a 75%, #1e3a8a), linear-gradient(45deg, #1e3a8a 25%, transparent 25%, transparent 75%, #1e3a8a 75%, #1e3a8a)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
                
                {/* Card Header */}
                <div className="relative z-10 p-6 flex justify-between items-start border-b border-blue-900/30 bg-gradient-to-b from-blue-900/20 to-transparent">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter">LEVELING</h1>
                        <p className="text-blue-400 text-[10px] tracking-[0.3em] uppercase">System Access Granted</p>
                    </div>
                    <div className="w-12 h-12 border border-blue-500 flex items-center justify-center rounded-sm bg-black/50">
                        <span className="text-2xl font-bold text-white">{rank}</span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="relative z-10 p-6 flex-1 flex flex-col space-y-6">
                    
                    {/* User Image / Avatar */}
                    <div className="w-32 h-32 mx-auto border-2 border-blue-400 rounded-full overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.4)] relative">
                        {latestImage ? (
                            <img src={latestImage} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-4xl">👤</div>
                        )}
                        {stats.prestigeLevel > 0 && (
                            <div className="absolute bottom-0 w-full bg-yellow-600 text-[8px] text-black font-bold text-center uppercase">
                                Awakened x{stats.prestigeLevel}
                            </div>
                        )}
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white uppercase">{stats.title}</h2>
                        <p className="text-blue-400 font-mono text-sm">{stats.job}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-blue-900/10 p-2 border border-blue-500/20 rounded">
                            <p className="text-[10px] text-gray-500 uppercase">Level</p>
                            <p className="text-xl font-bold text-white">{stats.level}</p>
                        </div>
                        <div className="bg-blue-900/10 p-2 border border-blue-500/20 rounded">
                            <p className="text-[10px] text-gray-500 uppercase">Streak</p>
                            <p className="text-xl font-bold text-white">{stats.streak} <span className="text-xs font-normal text-gray-500">days</span></p>
                        </div>
                    </div>

                    {/* Stats Hexagon Approximation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold w-8">STR</span>
                            <div className="flex-1 mx-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500" style={{ width: `${Math.min(100, stats.strength)}%` }}></div>
                            </div>
                            <span className="text-white font-mono w-6 text-right">{stats.strength}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold w-8">AGI</span>
                            <div className="flex-1 mx-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${Math.min(100, stats.agility)}%` }}></div>
                            </div>
                            <span className="text-white font-mono w-6 text-right">{stats.agility}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold w-8">INT</span>
                            <div className="flex-1 mx-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, stats.intelligence)}%` }}></div>
                            </div>
                            <span className="text-white font-mono w-6 text-right">{stats.intelligence}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 bg-black/80 p-3 border-t border-gray-800 flex justify-between items-center text-[10px] font-mono text-gray-500">
                    <span>ID: {stats.hunterCode || 'UNKNOWN'}</span>
                    <span>LEVELING APP</span>
                </div>
            </div>

            <button 
                onClick={onClose}
                className="mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-gray-200"
            >
                Close
            </button>
        </div>
    );
};
