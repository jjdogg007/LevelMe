
import React, { useState, useRef } from 'react';
import { SystemLayout } from './SystemLayout';
import { SHOP_ITEMS } from '../constants';
import { PlayerStats, Item } from '../types';
import { generateItemImage, identifyEquipment } from '../services/geminiService';
import { playSystemSound } from '../services/audioService';

interface ShopViewProps {
  stats: PlayerStats;
  onBuy: (cost: number, itemId: string) => void;
  onClose: () => void;
  onAddItem?: (item: Item) => void; // New handler for scans
}

export const ShopView: React.FC<ShopViewProps> = ({ stats, onBuy, onClose, onAddItem }) => {
  const [visualizing, setVisualizing] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVisualize = async (itemId: string, name: string, type: string, rarity: string) => {
      if (generatedImages[itemId]) return;
      
      playSystemSound('click');
      setVisualizing(itemId);
      const img = await generateItemImage(name, type, rarity);
      if (img) {
          playSystemSound('success');
          setGeneratedImages(prev => ({...prev, [itemId]: img}));
      }
      setVisualizing(null);
  };

  const handleCameraScan = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onAddItem) {
          playSystemSound('start');
          setScanning(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              
              const item = await identifyEquipment(base64Data);
              setScanning(false);
              
              if (item) {
                  playSystemSound('levelUp');
                  onAddItem(item);
                  alert(`APPRAISAL SUCCESS: ${item.name} (${item.rarity}-Rank) acquired!`);
              } else {
                  playSystemSound('glitch');
                  alert("SCAN FAILED: Object not recognized as valid equipment.");
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const getRarityColor = (rarity?: string) => {
      switch(rarity) {
          case 'S': return 'text-red-500 border-red-500 shadow-red-500/20';
          case 'A': return 'text-yellow-500 border-yellow-500 shadow-yellow-500/20';
          case 'B': return 'text-purple-500 border-purple-500 shadow-purple-500/20';
          case 'C': return 'text-blue-500 border-blue-500 shadow-blue-500/20';
          default: return 'text-gray-400 border-gray-600';
      }
  };

  return (
    <div className="h-full animate-in fade-in zoom-in-95 duration-500 flex flex-col bg-[#050b14]">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
         <div className="flex items-center space-x-3">
             <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-gray-900 p-2 rounded-full border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
             </button>
             <h2 className="text-xl font-bold text-white uppercase tracking-widest">Item Shop</h2>
         </div>
         <div className="text-right bg-gray-900 px-4 py-2 rounded border border-yellow-900/30">
             <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Balance</span>
             <span className="text-yellow-400 font-mono text-lg font-bold">{stats.gold.toLocaleString()} G</span>
         </div>
      </div>

      {/* SCANNER SECTION */}
      {process.env.API_KEY && (
          <div className="mb-4">
              <button 
                onClick={handleCameraScan}
                disabled={scanning}
                className={`w-full py-4 border-2 border-dashed border-blue-500/50 bg-blue-900/10 rounded flex flex-col items-center justify-center hover:bg-blue-900/20 transition-all ${scanning ? 'animate-pulse' : ''}`}
              >
                  {scanning ? (
                      <>
                          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-blue-400 font-mono text-xs uppercase tracking-widest">APPRAISING OBJECT STRUCTURAL INTEGRITY...</span>
                      </>
                  ) : (
                      <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="text-blue-300 font-bold uppercase tracking-widest text-sm">SCAN ARTIFACT (REALITY APPRAISAL)</span>
                          <span className="text-[10px] text-gray-500 mt-1">Convert real equipment into system items</span>
                      </>
                  )}
              </button>
          </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-3">
        {SHOP_ITEMS.map((item) => {
          const isConsumableKey = item.id.startsWith('key_');
          const isOwned = stats.inventory.includes(item.id);
          const isShieldActive = item.id === 'potion' && stats.streakShield;
          const rarityStyle = getRarityColor(item.rarity);
          const aiImage = generatedImages[item.id];
          const canBuy = !isOwned || isConsumableKey || item.id === 'potion';

          return (
            <div key={item.id} className={`relative border bg-gray-900/40 p-4 rounded-sm transition-all flex flex-col justify-between ${rarityStyle.split(' ')[1]} ${item.rarity === 'S' ? 'shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'hover:bg-gray-800/50'}`}>
               
               <div className="flex justify-between items-start mb-3">
                   <div className="flex items-start space-x-4">
                       {/* Icon / AI Image Box */}
                       <div className={`w-16 h-16 flex-shrink-0 bg-black border border-gray-800 flex items-center justify-center overflow-hidden relative rounded-sm group`}>
                           {aiImage ? (
                               <img src={aiImage} alt={item.name} className="w-full h-full object-cover animate-in fade-in duration-500" />
                           ) : (
                               <div className="text-3xl filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.icon}</div>
                           )}
                           
                           {/* Visualize Icon Button */}
                           {!aiImage && process.env.API_KEY && (
                               <button 
                                  onClick={(e) => { e.stopPropagation(); handleVisualize(item.id, item.name, item.type, item.rarity || 'E'); }}
                                  disabled={visualizing === item.id}
                                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-blue-400 hover:text-white"
                                  title="Visualize Item"
                               >
                                  {visualizing === item.id ? (
                                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                  ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  )}
                                </button>
                           )}
                       </div>
                       
                       <div className="flex-1 min-w-0">
                           <div className="flex items-center space-x-2 mb-1">
                               <h3 className={`font-bold text-sm uppercase tracking-wide truncate ${rarityStyle.split(' ')[0]}`}>{item.name}</h3>
                               {item.rarity && <span className={`text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-black font-mono ${rarityStyle.split(' ')[0]}`}>{item.rarity}</span>}
                           </div>
                           <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">{item.description}</p>
                           
                           {item.bonusStats && (
                               <div className="flex flex-wrap gap-1 mt-2">
                                   {Object.entries(item.bonusStats).map(([k, v]) => (
                                       <span key={k} className="text-[9px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700 uppercase tracking-wider">{k.substring(0,3)} +{v}</span>
                                   ))}
                               </div>
                           )}
                       </div>
                   </div>
               </div>
               
               <button 
                  onClick={() => onBuy(item.cost, item.id)}
                  disabled={stats.gold < item.cost || (!canBuy && !isConsumableKey) || isShieldActive}
                  className={`w-full py-2.5 text-xs font-bold font-mono uppercase tracking-widest rounded-sm transition-all flex justify-between px-4 items-center
                      ${(!canBuy && !isConsumableKey) || isShieldActive
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                          : (stats.gold >= item.cost 
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-500 hover:bg-blue-600 hover:text-white hover:border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.2)]' 
                              : 'bg-black text-gray-600 border border-gray-800 cursor-not-allowed')}
                  `}
               >
                   <span>{(!canBuy && !isConsumableKey) ? 'OWNED' : (isShieldActive ? 'ACTIVE' : 'PURCHASE')}</span>
                   {(!(!canBuy && !isConsumableKey) && !isShieldActive) && (
                       <span>{item.cost.toLocaleString()} G</span>
                   )}
               </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
