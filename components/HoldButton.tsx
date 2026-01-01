
import React, { useState, useRef, useEffect } from 'react';
import { playSystemSound } from '../services/audioService';

interface HoldButtonProps {
    onComplete: () => void;
    label: React.ReactNode;
    colorClass?: string; // e.g. "bg-blue-600"
    duration?: number; // ms to hold
    disabled?: boolean;
    className?: string;
}

export const HoldButton: React.FC<HoldButtonProps> = ({ 
    onComplete, 
    label, 
    colorClass = "bg-blue-600", 
    duration = 800,
    disabled = false,
    className = ""
}) => {
    const [isHolding, setIsHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const startHold = (e: React.MouseEvent | React.TouchEvent) => {
        if (disabled) return;
        // e.preventDefault(); // Prevent text selection/scrolling often handled by CSS touch-action
        setIsHolding(true);
        startTimeRef.current = Date.now();
        playSystemSound('hover'); // Initial charge sound logic could go here

        intervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min(100, (elapsed / duration) * 100);
            setProgress(p);

            if (p >= 100) {
                completeHold();
            }
        }, 16); // 60fps
    };

    const stopHold = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsHolding(false);
        setProgress(0);
    };

    const completeHold = () => {
        stopHold();
        onComplete();
    };

    // Clean up
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            disabled={disabled}
            className={`relative overflow-hidden select-none touch-none transform transition-all active:scale-95 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            {/* Background Fill Animation */}
            <div 
                className={`absolute inset-0 z-0 ${colorClass.replace('bg-', 'bg-opacity-40 bg-')}`}
                style={{ width: '100%' }}
            ></div>
            
            {/* Progress Fill */}
            <div 
                className={`absolute left-0 top-0 bottom-0 z-10 transition-all duration-75 ease-linear ${colorClass}`}
                style={{ width: `${progress}%` }}
            ></div>

            {/* Label */}
            <div className="relative z-20 flex items-center justify-center space-x-2 w-full h-full">
                {label}
            </div>

            {/* Charge Effect */}
            {isHolding && (
                <div className="absolute inset-0 z-30 bg-white opacity-10 animate-pulse"></div>
            )}
        </button>
    );
};
