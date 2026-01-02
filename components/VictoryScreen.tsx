import React, { useEffect, useState } from 'react';
import { playSystemSound } from '../services/audioService';
import { generateSystemMessage } from '../services/geminiService';

interface VictoryScreenProps {
    rewards: {
        xp: number;
        gold: number;
        item?: string;
        shadow?: string;
        grade?: string; // S, A, B, C, E
    };
    onClose: () => void;
    isLevelUp?: boolean;
    title?: string;
    subtext?: string;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ rewards, onClose, isLevelUp, title = "MISSION SUCCESS", subtext = "Quest Completed" }) => {
    const [step, setStep] = useState(0);
    const [aiMessage, setAiMessage] = useState("");

    useEffect(() => {
        playSystemSound('levelUp'); // Dramatic start sound
        
        // Fetch AI Message for flavor
        if (process.env.API_KEY) {
            const context = `Player earned ${rewards.xp} XP, ${rewards.gold} Gold. Grade: ${rewards.grade || 'N/A'}. Level Up: ${isLevelUp}`;
            generateSystemMessage(isLevelUp ? 'levelUp' : 'victory', context).then(setAiMessage);
        }

        const t1 = setTimeout(() => setStep(1), 500); // Title slam
        const t2 = setTimeout(() => setStep(2), 1200); // XP/Gold
        const t3 = setTimeout(() => {
            if (rewards.item || rewards.shadow || rewards.grade) {
                setStep(3); // Grade/Item reveal
                playSystemSound('success');
            } else {
                setStep(4); // Finish
            }
        }, 2000);
        const t4 = setTimeout(() => setStep(4), (rewards.item || rewards.grade) ? 3500 : 2500); // Button

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
        };
    }, []);

    const getGradeColor = (g: string) => {
        if(g === 'S') return 'text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]';
        if(g === 'A') return 'text-orange-500';
        if(g === 'B') return 'text-purple-500';
        return 'text-gray-400';
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[10px] bg-blue-500/50 blur-xl rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[10px] bg-blue-500/50 blur-xl -rotate-45"></div>
            </div>

            {/* Step 1: TITLE SLAM */}
            <div className={`text-center mb-8 transform transition-all duration-300 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(37,99,235,0.8)] animate-slam">
                    {title}
                </h1>
                <p className="text-gray-400 uppercase tracking-[0.5em] text-sm mt-2">{subtext}</p>
            </div>

            {/* AI SYSTEM MESSAGE - MANTRA STYLE */}
            {aiMessage && step >= 1 && (
                <div className="mb-8 max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-blue-300 font-bold font-mono text-sm leading-relaxed border-t border-b border-blue-900 py-4 italic">
                        "{aiMessage}"
                    </p>
                </div>
            )}

            {/* Step 2: STATS */}
            <div className={`space-y-4 w-full max-w-xs transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="bg-gray-900/80 border border-blue-500/50 p-4 flex justify-between items-center rounded relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <span className="text-gray-400 font-bold uppercase text-sm">Experience</span>
                    <span className="text-2xl font-mono text-white font-bold">+{rewards.xp} XP</span>
                </div>
                <div className="bg-gray-900/80 border border-yellow-500/50 p-4 flex justify-between items-center rounded relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                    <span className="text-gray-400 font-bold uppercase text-sm">Gold</span>
                    <span className="text-2xl font-mono text-yellow-400 font-bold">+{rewards.gold} G</span>
                </div>
            </div>

            {/* Step 3: GRADE & ITEM REVEAL */}
            {(rewards.item || rewards.shadow || rewards.grade) && (
                <div className={`mt-8 flex flex-col items-center space-y-4 transition-all duration-500 ${step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    
                    {rewards.grade && (
                        <div className="text-center animate-bounce">
                            <span className="text-xs text-gray-500 uppercase tracking-[0.5em] block mb-2">Clear Rank</span>
                            <span className={`text-8xl font-black italic ${getGradeColor(rewards.grade)}`}>
                                {rewards.grade}
                            </span>
                        </div>
                    )}

                    {(rewards.item || rewards.shadow) && (
                        <div className="relative w-40 h-40 bg-black border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center justify-center p-4 group">
                            <div className="absolute inset-0 bg-purple-900/20 animate-pulse"></div>
                            
                            {/* Shine Effect */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-0 -inset-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine"></div>
                            </div>

                            <div className="text-4xl mb-2 z-10">
                                {rewards.shadow ? '👤' : '🎁'}
                            </div>
                            <p className="text-purple-300 font-bold uppercase text-xs text-center z-10">
                                {rewards.shadow ? 'Shadow Extracted' : 'Item Acquired'}
                            </p>
                            <p className="text-white font-bold text-center text-sm z-10 mt-1 uppercase">
                                {rewards.shadow || rewards.item}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Level Up Notification */}
            {isLevelUp && step >= 2 && (
                <div className="absolute top-10 w-full text-center animate-bounce">
                    <span className="bg-yellow-500 text-black font-bold px-6 py-2 uppercase tracking-widest text-xl shadow-[0_0_20px_rgba(234,179,8,0.8)]">
                        Level Up
                    </span>
                </div>
            )}

            {/* Step 4: CLOSE */}
            <button 
                onClick={() => { playSystemSound('click'); onClose(); }}
                className={`mt-12 px-12 py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-all duration-500 ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            >
                Confirm
            </button>

        </div>
    );
};