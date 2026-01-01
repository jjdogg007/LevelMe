
import React, { useState, useEffect } from 'react';

const MESSAGES = [
    "System Status: Normal",
    "Atmospheric Mana Density: 12%",
    "Heart Rate Monitoring: Active",
    "Rest is essential for muscle reconstruction.",
    "Hydration levels nominal.",
    "No dungeons detected in immediate vicinity.",
    "Daily Directive: Keep moving forward.",
    "Pain is just weakness leaving the body.",
    "Synchronization Rate: 98%"
];

export const SystemTicker: React.FC = () => {
    return (
        <div className="w-full bg-[#0a0a0a] border-t border-b border-blue-900/30 h-6 overflow-hidden relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10"></div>
            
            <div className="whitespace-nowrap animate-ticker flex space-x-12 px-4">
                {MESSAGES.map((msg, i) => (
                    <span key={i} className="text-[10px] font-mono text-blue-500/70 uppercase tracking-wider">
                        {msg}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {MESSAGES.map((msg, i) => (
                    <span key={`dup-${i}`} className="text-[10px] font-mono text-blue-500/70 uppercase tracking-wider">
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
};
