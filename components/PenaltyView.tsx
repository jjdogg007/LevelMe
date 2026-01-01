import React from 'react';

interface PenaltyViewProps {
    message?: string;
    onAccept: () => void;
}

export const PenaltyView: React.FC<PenaltyViewProps> = ({ message, onAccept }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 relative overflow-hidden">
        
        {/* Red Overlay Effect */}
        <div className="absolute inset-0 bg-red-900/20 z-0 pointer-events-none animate-pulse"></div>
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(220, 38, 38, 0.05) 10px, rgba(220, 38, 38, 0.05) 20px)`
        }}></div>

        <div className="relative z-10 p-6 border-2 border-red-600 bg-black/90 shadow-[0_0_50px_rgba(220,38,38,0.5)] max-w-sm w-full mx-4">
            <h1 className="text-4xl font-bold text-red-600 uppercase mb-2 tracking-tighter">PENALTY</h1>
            <div className="w-full h-1 bg-red-900 mb-6"></div>
            
            <div className="mb-8">
                <p className="text-white text-lg font-bold uppercase tracking-widest mb-2">
                    Quest Failed
                </p>
                <p className="text-red-400 font-mono text-xs leading-relaxed border border-red-900/50 bg-red-950/30 p-4">
                    {message || "Failure to complete the daily quest has resulted in a penalty."}
                </p>
            </div>
            
            <div className="bg-red-900/20 p-4 border border-red-500/50 mb-6">
                <h3 className="text-red-400 font-bold uppercase text-xs mb-2">Survival Objective</h3>
                <p className="text-2xl text-white font-mono font-bold">SURVIVE: 4 HOURS</p>
                <p className="text-[10px] text-gray-400 mt-1">(Penalty Zone Simulation)</p>
            </div>

            <button 
                onClick={onAccept}
                className="w-full bg-red-600 text-black font-bold py-3 uppercase tracking-[0.2em] hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse"
            >
                Confirm Penalty
            </button>
        </div>
    </div>
  );
};