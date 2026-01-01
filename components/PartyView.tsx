
import React, { useState } from 'react';
import { SystemLayout } from './SystemLayout';
import { PlayerStats, Hunter } from '../types';

interface PartyViewProps {
    stats: PlayerStats;
    hunters: Hunter[];
    onAddRival: (code: string) => void;
}

export const PartyView: React.FC<PartyViewProps> = ({ stats, hunters, onAddRival }) => {
    const [inputCode, setInputCode] = useState("");
    
    // Generate a simple "Code" based on stats to share
    const myCode = `HUNTER-${stats.level}-${stats.job.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`;

    const handleAdd = () => {
        if (inputCode) {
            onAddRival(inputCode);
            setInputCode("");
        }
    };

    return (
        <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col space-y-4">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Hunter Guild</h2>
            </div>

            <SystemLayout title="My Hunter ID">
                <div className="text-center p-4">
                    <p className="text-gray-400 text-xs uppercase mb-2">Share this code with other hunters</p>
                    <div className="bg-black border border-blue-500/50 p-3 rounded font-mono text-xl text-blue-400 font-bold select-all tracking-wider">
                        {myCode}
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
                        onClick={handleAdd}
                        className="w-full py-3 bg-blue-900/30 border border-blue-500 text-blue-400 font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                        Establish Link
                    </button>
                </div>
            </SystemLayout>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 px-1">Active Links</h3>
                <div className="space-y-2">
                    {hunters.filter(h => h.isRival).map(rival => (
                        <div key={rival.id} className="bg-red-950/10 border border-red-900/30 p-3 flex justify-between items-center">
                            <div>
                                <span className="text-red-400 font-bold text-sm block">{rival.name}</span>
                                <span className="text-gray-500 text-[10px] uppercase">{rival.job}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-white font-mono font-bold">LVL {rival.level}</span>
                            </div>
                        </div>
                    ))}
                    {hunters.filter(h => h.isRival).length === 0 && (
                        <p className="text-gray-600 text-xs italic text-center py-4">No active rivals linked.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
