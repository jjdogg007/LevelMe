
import React, { useState, useEffect } from 'react';
import { SystemLayout } from './SystemLayout';
import { playSystemSound } from '../services/audioService';
import { generateExerciseVisual } from '../services/geminiService';
import { saveImageToCache, getImageFromCache } from '../services/imageCache';

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
  customVisual?: string; 
  onClose: () => void;
  onUpdateVisual?: (name: string, url: string) => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({ name, data, customVisual, onClose, onUpdateVisual }) => {
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(customVisual || "");
  const [cachedVisual, setCachedVisual] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  
  // Animation State
  const [isPlaying, setIsPlaying] = useState(true);

  // Load from cache on mount
  useEffect(() => {
      getImageFromCache(name).then((img) => {
          if (img) setCachedVisual(img);
      });
  }, [name]);

  const handleSaveOverride = () => {
      if (onUpdateVisual) {
          playSystemSound('success');
          onUpdateVisual(name, inputUrl);
          setIsEditing(false);
      }
  };

  const handleSearch = () => {
      playSystemSound('click');
      const query = encodeURIComponent(`${name} exercise gif`);
      window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
  };

  const handleGenerateBlueprint = async () => {
      if (!process.env.API_KEY && !localStorage.getItem('leveling_api_key')) {
          alert("System Error: API Key required for schematic generation.");
          return;
      }
      playSystemSound('click');
      setGenerating(true);
      
      const visual = await generateExerciseVisual(name, data.type);
      
      if (visual) {
          playSystemSound('levelUp');
          await saveImageToCache(name, visual);
          setCachedVisual(visual);
          // CRITICAL: Update parent immediately so Grimoire grid reflects it instantly
          if (onUpdateVisual) {
              onUpdateVisual(name, visual);
          }
      } else {
          playSystemSound('glitch');
          alert("Generation Failed. System busy.");
      }
      setGenerating(false);
  };

  // Helper to determine active source
  // Priority: Cache -> Custom Override -> GIF Data -> Video URL
  const activeSource = cachedVisual || customVisual || (data.gifData ? `data:image/gif;base64,${data.gifData}` : (data.videoUrl && !imgError ? data.videoUrl : null));
  
  // Determine if we should attempt sprite animation (Generated or data URI typically)
  const isGenerated = activeSource && activeSource.startsWith('data:image');

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
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
                {onUpdateVisual && (
                    <button 
                        onClick={() => { playSystemSound('click'); setIsEditing(!isEditing); }}
                        className={`w-10 h-10 border flex items-center justify-center transition-colors ${isEditing ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400' : 'bg-blue-900/20 border-blue-500/50 text-blue-400 hover:text-white'}`}
                        title="Edit Visual Data"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    </button>
                )}
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-1">
            
            {/* VISUAL EDIT MODE */}
            {isEditing && (
                <div className="bg-yellow-900/10 border border-yellow-600/50 p-3 mb-4 animate-in slide-in-from-top-4">
                    <p className="text-[10px] text-yellow-500 uppercase font-bold mb-2">System Override: Visual Data</p>
                    <input 
                        type="text" 
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Paste Image/GIF Link..."
                        className="w-full bg-black border border-gray-700 text-white text-xs p-2 mb-2 focus:border-yellow-500 focus:outline-none"
                    />
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleSearch}
                            className="flex-1 py-2 border border-gray-600 text-gray-400 text-[10px] uppercase font-bold hover:text-white hover:border-white"
                        >
                            Search Network
                        </button>
                        <button 
                            onClick={handleSaveOverride}
                            className="flex-1 py-2 bg-yellow-600 text-black text-[10px] uppercase font-bold hover:bg-yellow-500"
                        >
                            Save Override
                        </button>
                    </div>
                </div>
            )}

            {/* Visual Data Display */}
            <div className="relative w-full aspect-video border border-blue-500/30 bg-gray-900 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.2)] rounded-sm group">
                {activeSource ? (
                    <>
                        {isGenerated && isPlaying ? (
                            // SPRITE SHEET ANIMATION MODE
                            <div className="w-full h-full overflow-hidden relative">
                                <img 
                                    src={activeSource} 
                                    alt={name}
                                    className="h-full max-w-none absolute top-0 left-0"
                                    style={{ 
                                        width: '400%', 
                                        animation: 'sprite-slide 1.5s steps(4) infinite' 
                                    }}
                                />
                                <style>{`
                                    @keyframes sprite-slide {
                                        0% { transform: translateX(0); }
                                        100% { transform: translateX(-100%); }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            // STANDARD STATIC / GIF DISPLAY
                            <>
                                {/* Blurred Background Layer (Fill) */}
                                <div className="absolute inset-0 z-0">
                                    <img 
                                        src={activeSource} 
                                        alt="background"
                                        className="w-full h-full object-cover blur-md opacity-30 scale-110" 
                                    />
                                </div>
                                
                                {/* Foreground Layer (Contain) */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center p-2">
                                    <img 
                                        src={activeSource} 
                                        alt={name} 
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                                        onError={(e) => { 
                                            e.currentTarget.style.display = 'none'; 
                                            setImgError(true); 
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* PLAY/PAUSE TOGGLE FOR SPRITES */}
                        {isGenerated && (
                            <div className="absolute bottom-2 right-2 z-30 flex space-x-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                                    className="bg-black/70 text-[9px] text-blue-400 border border-blue-500/50 px-2 py-1 uppercase font-bold hover:text-white"
                                >
                                    {isPlaying ? 'PAUSE' : 'PLAY'}
                                </button>
                                {/* REROLL BUTTON */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleGenerateBlueprint(); }}
                                    disabled={generating}
                                    className="bg-black/70 text-[9px] text-yellow-400 border border-yellow-500/50 px-2 py-1 uppercase font-bold hover:text-white"
                                    title="Re-Generate Schematic"
                                >
                                    {generating ? '...' : '↺ RE-CALCULATE'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-black relative p-4">
                        {generating ? (
                            <div className="flex flex-col items-center text-blue-400 animate-pulse">
                                <span className="text-2xl mb-2">⚡</span>
                                <span className="text-xs font-mono uppercase">CONSTRUCTING SCHEMATIC...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-4 w-full">
                                <div className="text-center">
                                    <span className="text-2xl mb-1 text-gray-700 block">NO DATA</span>
                                    <button 
                                        onClick={handleGenerateBlueprint}
                                        className="mt-2 px-4 py-2 border border-blue-500/50 bg-blue-900/20 text-blue-400 text-[10px] font-bold uppercase hover:bg-blue-900/40 hover:text-white transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                                    >
                                        MATERIALIZE SCHEMATIC
                                    </button>
                                </div>
                                
                                {/* STRATEGY HINT */}
                                <div className="w-full border border-yellow-600/30 bg-yellow-900/10 p-2 rounded flex items-start space-x-2">
                                    <span className="text-yellow-500 text-lg">ⓘ</span>
                                    <p className="text-[9px] text-gray-400 text-left leading-relaxed">
                                        <span className="text-yellow-500 font-bold uppercase">Strategy:</span> Materialize a schematic using System Construction. If the result is corrupted or unclear, engage 'Override' mode (Edit Icon) to manually link a visual from the network.
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Grid Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    </div>
                )}
                
                {/* Hologram Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,255,0.03),rgba(0,0,0,0),rgba(0,255,255,0.03))] z-20 bg-[length:100%_2px,100%_100%]"></div>
                
                {/* Scanner Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/30 blur-sm animate-[pulse_3s_infinite] shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20"></div>
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
