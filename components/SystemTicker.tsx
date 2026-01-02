import React from 'react';

const BASE_MESSAGES = [
    "System Status: Normal",
    "Atmospheric Mana Density: 12%",
    "Heart Rate Monitoring: Active",
    "Rest is essential for muscle reconstruction.",
    "Hydration levels nominal.",
    "No dungeons detected in immediate vicinity.",
    "Daily Directive: Keep moving forward.",
    "Biometric Sync: Stable",
    "Synchronization Rate: 98%",
    "Caloric Intake Analysis: Pending",
    "Sleep Cycle Optimization: Recommended"
];

export const SystemTicker: React.FC = () => {
    // Only use base system/biometric messages
    const messages = BASE_MESSAGES;

    return (
        <div className="w-full bg-[#0a0a0a] border-t border-b border-blue-900/30 h-6 overflow-hidden relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10"></div>
            
            {/* Added style={{ animationDuration: '120s' }} to slow it down significantly */}
            <div className="whitespace-nowrap animate-ticker flex space-x-12 px-4" style={{ animationDuration: '120s' }}>
                {messages.map((msg, i) => (
                    <span key={i} className="text-[10px] font-mono text-blue-500/70 uppercase tracking-wider">
                        {msg}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {messages.map((msg, i) => (
                    <span key={`dup-${i}`} className="text-[10px] font-mono text-blue-500/70 uppercase tracking-wider">
                        {msg}
                    </span>
                ))}
            </div>
        </div>
    );
};