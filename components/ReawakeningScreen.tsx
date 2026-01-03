
import React, { useEffect, useState } from 'react';
import { playSystemSound } from '../services/audioService';

interface ReawakeningScreenProps {
    onComplete: () => void;
    prestigeLevel: number;
}

export const ReawakeningScreen: React.FC<ReawakeningScreenProps> = ({ onComplete, prestigeLevel }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Audio Sequence
        const audioSeq = async () => {
            playSystemSound('start');
            await new Promise(r => setTimeout(r, 1000));
            playSystemSound('glitch');
            await new Promise(r => setTimeout(r, 2000));
            playSystemSound('levelUp');
        };
        audioSeq();

        // Visual Sequence
        const t1 = setTimeout(() => setStep(1), 500);
        const t2 = setTimeout(() => setStep(2), 2000);
        const t3 = setTimeout(() => setStep(3), 3500);
        const t4 = setTimeout(() => setStep(4), 5000);
        const t5 = setTimeout(onComplete, 6000);

        return () => {
            [t1, t2, t3, t4, t5].forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
            {/* Background Chaos */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.1)_0%,black_100%)] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-[scan_2s_linear_infinite] opacity-50"></div>

            {step === 0 && (
                <div className="animate-in zoom-in duration-500">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SYSTEM LIMIT REACHED</h1>
                    <p className="text-blue-500 font-mono text-xs uppercase tracking-[0.3em]">Initiating Reset Protocol...</p>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="w-24 h-24 border-4 border-yellow-500 rounded-full flex items-center justify-center mx-auto animate-spin">
                        <div className="w-20 h-20 border-t-4 border-yellow-300 rounded-full"></div>
                    </div>
                    <h2 className="text-yellow-500 font-bold text-2xl uppercase tracking-widest glitch" data-text="DECONSTRUCTING">DECONSTRUCTING</h2>
                    <div className="text-left font-mono text-[10px] text-gray-500 space-y-1 w-64 mx-auto border-l border-yellow-900 pl-2">
                        <p>&gt; STR... RESET</p>
                        <p>&gt; AGI... RESET</p>
                        <p>&gt; VIT... RESET</p>
                        <p>&gt; MEMORY... PRESERVED</p>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in zoom-in duration-200">
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-blue-900 to-white uppercase tracking-tighter">
                        REAWAKENING
                    </h1>
                    <p className="text-white text-xs mt-4 uppercase tracking-[0.5em] animate-pulse">Expanding Potential...</p>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-bottom duration-500">
                    <div className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
                        {prestigeLevel + 1}
                    </div>
                    <div className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-sm">
                        Prestige Rank Increased
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="absolute inset-0 bg-white animate-[fade-out_1s_ease-in_forwards]"></div>
            )}
        </div>
    );
};
