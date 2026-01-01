
import React, { useState, useEffect, useRef } from 'react';
import { SystemLayout } from './SystemLayout';
import { PlayerStats, DailyQuest, StoryLogEntry } from '../types';
import { playSystemSound } from '../services/audioService';
import { generateCampaignChapter } from '../services/geminiService';
import { STORY_CAMPAIGN } from '../constants';

interface StoryViewProps {
    stats: PlayerStats;
    onStartChapter: (quest: DailyQuest, chapterId: string) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ stats, onStartChapter }) => {
    const [generating, setGenerating] = useState(false);
    const [localLog, setLocalLog] = useState<StoryLogEntry[]>(stats.storyLog || []);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [localLog]);

    const handleGenerateNext = async () => {
        // Fallback check: If no key, show static message instead of crashing
        if (!process.env.API_KEY && !localStorage.getItem('leveling_api_key')) {
            const staticEntry: StoryLogEntry = {
                id: `log_offline_${Date.now()}`,
                level: stats.level,
                title: "CONNECTION OFFLINE",
                description: "The System is unable to connect to the Akashic Records.",
                lore: [
                    "SYSTEM NOTICE: Network connection to the Architect's server is unstable.",
                    "Unable to download new scenario data.",
                    "Please execute 'Daily Quest' to maintain survival parameters.",
                    "Reconnecting..."
                ],
                timestamp: new Date().toISOString(),
                type: 'narrative'
            };
            const updatedLog = [...localLog, staticEntry];
            setLocalLog(updatedLog);
            stats.storyLog = updatedLog;
            localStorage.setItem('leveling_player_stats', JSON.stringify(stats));
            playSystemSound('glitch');
            return;
        }
        
        playSystemSound('click');
        setGenerating(true);
        
        const newChapter = await generateCampaignChapter(stats);
        if (newChapter) {
            playSystemSound('levelUp');
            // Save to local state (App.tsx persists via stats prop update in real implementation, 
            // but we need local update to show immediately if props lag)
            const updatedLog = [...localLog, newChapter];
            setLocalLog(updatedLog);
            
            // Persist to stats (In a real app, this should be an emit to parent)
            stats.storyLog = updatedLog; 
            localStorage.setItem('leveling_player_stats', JSON.stringify(stats));
        } else {
            playSystemSound('glitch');
        }
        setGenerating(false);
    };

    const handleLaunchCampaign = (chapterId: string) => {
        const chapter = STORY_CAMPAIGN.find(c => c.id === chapterId);
        if (chapter) {
            // Inject chapter ID into quest for tracking completion
            const questWithId = { ...chapter.quest, storyChapterId: chapter.id };
            playSystemSound('start');
            onStartChapter(questWithId, chapter.id);
        }
    };

    // Determine if we should allow generation
    // Rule: One story entry per level. Or if the log is empty.
    const lastEntryLevel = localLog.length > 0 ? localLog[localLog.length - 1].level : 0;
    const canGenerate = stats.level > lastEntryLevel || localLog.length === 0;

    // Filter Campaign Chapters available to player
    const availableChapters = STORY_CAMPAIGN.filter(c => stats.level >= c.minLevel);
    const pendingChapters = availableChapters.filter(c => !stats.completedChapters.includes(c.id));

    return (
        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-500 bg-black relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4 p-2 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">System Terminal</h2>
                <div className="text-[10px] font-mono text-gray-500 text-right">
                    <p>USER: {stats.title.toUpperCase()}</p>
                    <p>AUTH LEVEL: {stats.level}</p>
                </div>
            </div>

            {/* PENDING OPERATIONS (Static Chapters & Cameos) */}
            {pendingChapters.length > 0 && (
                <div className="px-2 mb-4">
                    <div className="border border-yellow-600/50 bg-yellow-900/10 p-2">
                        <div className="flex justify-between items-center mb-2 border-b border-yellow-600/30 pb-1">
                            <span className="text-yellow-500 font-bold text-xs uppercase tracking-widest animate-pulse">⚠ Priority Alerts</span>
                            <span className="text-[10px] text-yellow-600">{pendingChapters.length} File(s) Unlocked</span>
                        </div>
                        <div className="space-y-2">
                            {pendingChapters.map(chapter => (
                                <button 
                                    key={chapter.id}
                                    onClick={() => handleLaunchCampaign(chapter.id)}
                                    className="w-full text-left p-2 bg-black border border-gray-800 hover:border-yellow-500 hover:bg-yellow-900/20 transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-white uppercase group-hover:text-yellow-400">{chapter.title}</h4>
                                        <span className="text-[9px] bg-gray-800 px-1 text-gray-400">LVL {chapter.minLevel}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 line-clamp-1">{chapter.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TERMINAL FEED */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-6" ref={scrollRef}>
                {localLog.length === 0 && !generating && (
                    <div className="text-center py-20 opacity-50">
                        <p className="font-mono text-xs text-blue-400 mb-2">SYSTEM INITIALIZED...</p>
                        <p className="font-mono text-[10px] text-gray-500">Waiting for data input.</p>
                    </div>
                )}

                {localLog.map((entry, index) => (
                    <div key={entry.id} className="animate-in slide-in-from-bottom-4 duration-500 border-l-2 border-blue-900 pl-4 py-2 relative group">
                        {/* Timeline Connector */}
                        <div className="absolute -left-[5px] top-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                        
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-blue-400 font-mono uppercase bg-blue-900/20 px-2 py-0.5 rounded">
                                FILE {String(index + 1).padStart(3, '0')} • LVL {entry.level}
                            </span>
                            <span className="text-[9px] text-gray-600 font-mono">
                                {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-white font-bold uppercase text-sm mb-2 tracking-wide group-hover:text-blue-300 transition-colors">
                            {entry.title}
                        </h3>

                        <div className="text-gray-400 text-xs leading-relaxed space-y-2 font-mono">
                            {entry.lore.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>

                        {/* Interactive Elements based on type */}
                        {entry.type === 'boss' && (
                            <div className="mt-2 inline-block px-2 py-1 bg-red-900/30 border border-red-900 text-red-500 text-[9px] font-bold uppercase tracking-widest">
                                ⚠ BOSS ENCOUNTER RECORDED
                            </div>
                        )}
                        {entry.type === 'rivalry' && (
                            <div className="mt-2 inline-block px-2 py-1 bg-yellow-900/30 border border-yellow-900 text-yellow-500 text-[9px] font-bold uppercase tracking-widest">
                                ⚔ RIVAL INTERACTION
                            </div>
                        )}
                    </div>
                ))}

                {generating && (
                    <div className="border-l-2 border-blue-500 pl-4 py-4 animate-pulse">
                        <p className="text-blue-400 font-mono text-xs">DECRYPTING DATA STREAM...</p>
                        <div className="flex space-x-1 mt-2">
                            <div className="w-1 h-3 bg-blue-500 animate-[bounce_1s_infinite_0ms]"></div>
                            <div className="w-1 h-3 bg-blue-500 animate-[bounce_1s_infinite_100ms]"></div>
                            <div className="w-1 h-3 bg-blue-500 animate-[bounce_1s_infinite_200ms]"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION AREA */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                {canGenerate ? (
                    <button 
                        onClick={handleGenerateNext}
                        disabled={generating}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-black font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center space-x-2"
                    >
                        {generating ? (
                            <span>PROCESSING...</span>
                        ) : (
                            <>
                                <span className="animate-pulse">⚠</span>
                                <span>DECRYPT NEXT SEQUENCE</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-500 text-xs font-mono uppercase mb-1">DATA ENCRYPTED</p>
                        <p className="text-[10px] text-gray-700">Reach Level {lastEntryLevel + 1} to unlock next file.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
