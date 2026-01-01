
import React, { useState } from 'react';
import { SystemLayout } from './SystemLayout';

interface SkillModalProps {
  name: string;
  data: {
    rank: string;
    type: string;
    description: string;
    muscles: string[];
    tips: string[];
    videoUrl?: string;
    gifData?: string;
  };
  onClose: () => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({ name, data, onClose }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <SystemLayout title="SKILL INFO" className="border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
          <div className="flex justify-between items-start border-b border-blue-500/30 pb-3 mb-3">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wider">{name}</h2>
              <div className="flex space-x-2 mt-1">
                <span className="text-[10px] bg-blue-900/40 border border-blue-500/50 px-1 text-blue-300 uppercase">
                  Rank {data.rank}
                </span>
                 <span className="text-[10px] bg-gray-900/40 border border-gray-500/50 px-1 text-gray-400 uppercase">
                  {data.type}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-900/20 border border-blue-500/50 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
            
            {/* Visual Data Display */}
            <div className="relative w-full aspect-video border border-blue-500/30 bg-gray-900 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.2)] rounded-sm">
                {data.gifData ? (
                    <img 
                        src={`data:image/gif;base64,${data.gifData}`}
                        alt={name} 
                        className="w-full h-full object-cover grayscale opacity-90 brightness-110"
                    />
                ) : data.videoUrl && !imgError ? (
                    <img 
                        src={data.videoUrl} 
                        alt={name} 
                        onError={() => setImgError(true)}
                        className="w-full h-full object-cover grayscale opacity-90 brightness-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-black">
                        <span className="text-2xl mb-2">⚡</span>
                        <span className="text-xs uppercase font-mono tracking-widest">System Visualization</span>
                    </div>
                )}
                
                {/* Hologram Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.03),rgba(0,0,0,0),rgba(0,255,255,0.03))] z-10 bg-[length:100%_2px,100%_100%]"></div>
                
                {/* Scanner Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/30 blur-sm animate-[pulse_3s_infinite] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>

            <div>
              <h4 className="text-xs text-blue-400 font-bold uppercase mb-1">Description</h4>
              <p className="text-sm text-gray-300 leading-relaxed font-light border-l-2 border-gray-700 pl-3">
                {data.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs text-blue-400 font-bold uppercase mb-2">Muscles Targeted</h4>
              <div className="flex flex-wrap gap-2">
                {data.muscles.map((m, i) => (
                  <span key={i} className="text-[10px] text-gray-400 bg-gray-900 px-2 py-1 rounded-sm border border-gray-800 uppercase tracking-wide">
                    {m}
                  </span>
                ))}
              </div>
            </div>

             <div>
              <h4 className="text-xs text-yellow-500 font-bold uppercase mb-1">Combat Advice</h4>
              <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                {data.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-6 bg-blue-900/20 border border-blue-500/50 text-blue-400 py-3 text-xs font-bold uppercase tracking-widest hover:bg-blue-900/40 hover:text-white transition-all"
          >
            Close Window
          </button>
        </SystemLayout>
      </div>
    </div>
  );
};
