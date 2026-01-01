
import React, { useState, useRef } from 'react';
import { generateNutritionPlan, analyzeFoodImage } from '../services/geminiService';
import { NutritionPlan } from '../types';
import { SystemLayout } from './SystemLayout';
import { playSystemSound } from '../services/audioService';

export const NutritionView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [weight, setWeight] = useState('165 lbs');
  const [goal, setGoal] = useState('Build Muscle');
  const [preferences, setPreferences] = useState('None');
  const [scannedFood, setScannedFood] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
        alert("API Key missing");
        return;
    }
    setLoading(true);
    const result = await generateNutritionPlan(goal, preferences, weight);
    setPlan(result);
    setLoading(false);
  };

  const handleCameraScan = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          playSystemSound('click');
          setAnalyzing(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = reader.result as string;
              // Remove data url prefix for Gemini
              const base64Data = base64String.split(',')[1];
              
              const result = await analyzeFoodImage(base64Data);
              setScannedFood(result);
              setAnalyzing(false);
              playSystemSound('success');
          };
          reader.readAsDataURL(file);
      }
  };

  const MealCard: React.FC<{ title: string; meal: any }> = ({ title, meal }) => (
    <div className="border border-green-500/30 bg-green-900/10 p-3 mb-3 rounded-sm">
      <div className="flex justify-between items-start mb-2">
         <h4 className="text-green-400 font-bold uppercase text-sm tracking-wider">{title}</h4>
         <span className="text-xs text-green-300 font-mono">{meal.calories} kcal</span>
      </div>
      <p className="text-white font-semibold text-sm mb-1">{meal.name}</p>
      <p className="text-gray-400 text-xs italic mb-2">{meal.description}</p>
      <div className="flex space-x-2 text-[10px] font-mono text-gray-500 uppercase">
          <span>P: <span className="text-gray-300">{meal.protein}</span></span>
          <span>C: <span className="text-gray-300">{meal.carbs}</span></span>
          <span>F: <span className="text-gray-300">{meal.fats}</span></span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      <div className="flex justify-between items-center mb-2">
         <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Nutrition System</h2>
         <button 
            onClick={handleCameraScan}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-900/30 border border-blue-500/50 text-blue-400 text-[10px] uppercase font-bold hover:bg-blue-900/50 transition-colors"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>Scan Item</span>
         </button>
      </div>

      {analyzing && (
          <div className="p-4 bg-black border border-blue-500 animate-pulse text-center">
              <p className="text-blue-400 font-mono text-sm">ANALYZING MATTER COMPOSITION...</p>
          </div>
      )}

      {scannedFood && (
           <SystemLayout title="Item Identified" className="mb-4 border-yellow-500/50">
               <div className="flex justify-between items-start">
                   <div>
                       <h3 className="text-white font-bold text-lg">{scannedFood.name}</h3>
                       <p className="text-gray-400 text-xs">{scannedFood.description}</p>
                   </div>
                   <div className="text-yellow-400 font-mono font-bold text-xl">{scannedFood.calories}</div>
               </div>
               <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-800">
                   <div className="text-center"><p className="text-[10px] text-gray-500">PROTEIN</p><p className="text-white font-mono text-sm">{scannedFood.protein}</p></div>
                   <div className="text-center"><p className="text-[10px] text-gray-500">CARBS</p><p className="text-white font-mono text-sm">{scannedFood.carbs}</p></div>
                   <div className="text-center"><p className="text-[10px] text-gray-500">FATS</p><p className="text-white font-mono text-sm">{scannedFood.fats}</p></div>
               </div>
               <button 
                onClick={() => setScannedFood(null)}
                className="w-full mt-3 bg-gray-900 text-xs text-gray-400 py-2 hover:bg-gray-800"
               >
                   Close Scan
               </button>
           </SystemLayout>
      )}

      {!plan ? (
        <SystemLayout title="Input Parameters" className="flex-1">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Current Weight</label>
                    <input 
                        type="text" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-black border border-blue-500/30 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Objective</label>
                    <select 
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-black border border-blue-500/30 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    >
                        <option>Build Muscle</option>
                        <option>Lose Fat</option>
                        <option>Maintain Physique</option>
                        <option>Increase Stamina</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase mb-1">Preferences / Allergies</label>
                    <input 
                        type="text" 
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        className="w-full bg-black border border-blue-500/30 text-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none transition-all"
                        placeholder="e.g. No dairy, high protein"
                    />
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-blue-900/20 border border-blue-500 py-3 text-blue-400 uppercase font-bold tracking-widest hover:bg-blue-500 hover:text-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-pulse">Analyzing Metabolism...</span>
                        ) : (
                            <>
                                <span className="relative z-10">Generate Meal Plan</span>
                                <div className="absolute inset-0 bg-blue-400/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                            </>
                        )}
                    </button>
                </div>
            </div>
             <div className="mt-8 text-center">
                 <p className="text-xs text-gray-600">
                     "You cannot level up if your body lacks fuel."
                 </p>
             </div>
        </SystemLayout>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide">
            <SystemLayout title="Recommended Intake">
                <div className="text-center mb-4">
                    <span className="text-gray-400 text-xs uppercase">Daily Target</span>
                    <div className="text-3xl font-bold text-white font-mono">{plan.totalCalories} <span className="text-sm text-gray-500">kcal</span></div>
                </div>

                <MealCard title="Breakfast" meal={plan.breakfast} />
                <MealCard title="Lunch" meal={plan.lunch} />
                <MealCard title="Dinner" meal={plan.dinner} />
                <MealCard title="Snack" meal={plan.snack} />

                <button 
                    onClick={() => setPlan(null)}
                    className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-white uppercase tracking-widest border border-transparent hover:border-gray-500 transition-all"
                >
                    Reset Parameters
                </button>
            </SystemLayout>
        </div>
      )}
    </div>
  );
};
