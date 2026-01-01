
import React from 'react';

interface SystemVisualizerProps {
    type?: string; // Strength, Cardio, etc.
    active: boolean;
}

export const SystemVisualizer: React.FC<SystemVisualizerProps> = ({ type = 'Strength', active }) => {
    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* Radar Scan Effect */}
            <div className={`absolute w-full h-1 bg-blue-500/50 blur-sm top-0 left-0 ${active ? 'animate-[scan_3s_linear_infinite]' : ''} shadow-[0_0_15px_rgba(59,130,246,0.8)]`}></div>

            {/* Central Hologram (Stick Figure Representation) */}
            <div className="relative z-10 w-48 h-48 opacity-80">
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className="text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                    {/* Head */}
                    <circle cx="50" cy="20" r="8" strokeWidth="1" className={active ? 'animate-pulse' : ''} />
                    {/* Spine */}
                    <line x1="50" y1="28" x2="50" y2="60" strokeWidth="2" />
                    {/* Shoulders */}
                    <line x1="30" y1="35" x2="70" y2="35" strokeWidth="2" />
                    {/* Arms (Dynamic based on type logic could go here, for now generic T-pose/Action) */}
                    <line x1="30" y1="35" x2="20" y2="55" strokeWidth="2" strokeDasharray="4 2" />
                    <line x1="70" y1="35" x2="80" y2="55" strokeWidth="2" strokeDasharray="4 2" />
                    {/* Hips */}
                    <line x1="40" y1="60" x2="60" y2="60" strokeWidth="2" />
                    {/* Legs */}
                    <line x1="40" y1="60" x2="35" y2="90" strokeWidth="2" />
                    <line x1="60" y1="60" x2="65" y2="90" strokeWidth="2" />

                    {/* Tech Circles */}
                    <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="10 5" className={active ? 'animate-[spin_10s_linear_infinite]' : ''} />
                    <circle cx="50" cy="50" r="35" strokeWidth="0.5" strokeOpacity="0.5" strokeDasharray="2 2" className={active ? 'animate-[spin_5s_linear_infinite_reverse]' : ''} />
                </svg>

                {/* Data Points */}
                <div className="absolute top-10 left-0 text-[8px] font-mono text-blue-300">
                    <p>MUSCLE: {type.toUpperCase()}</p>
                    <p>LOAD: CALCULATING</p>
                </div>
                <div className="absolute bottom-10 right-0 text-[8px] font-mono text-blue-300 text-right">
                    <p>BIOMETRICS</p>
                    <p>SYNCED</p>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};
