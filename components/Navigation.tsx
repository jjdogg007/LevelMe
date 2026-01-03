
import React from 'react';
import { ViewState } from '../types';
import { playSystemSound } from '../services/audioService';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  playerLevel: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate, playerLevel }) => {
  
  const handleNav = (view: ViewState) => {
      playSystemSound('click');
      onNavigate(view);
  };

  const NavButton = ({ view, icon, label, isActive, className = "" }: { view: ViewState, icon: React.ReactNode, label: string, isActive?: boolean, className?: string }) => {
    const active = isActive || currentView === view;
    
    return (
        <button
        onClick={() => handleNav(view)}
        className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 relative group min-w-[50px] ${className}
            ${active ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'}
        `}
        >
        <div className={`transform transition-transform duration-200 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`}>
            {icon}
        </div>
        <span className="text-[8px] uppercase font-bold tracking-widest mt-1 opacity-60 scale-90">
            {label}
        </span>
        </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#050b14] border-t border-blue-900/30 flex justify-between px-2 z-50 pb-safe pt-1 overflow-x-auto scrollbar-hide">
      
      {/* Overview / Status */}
      <NavButton 
        view={ViewState.STATUS} 
        label="Status"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
        } 
      />

      {/* Quests (Door) */}
      <NavButton 
        view={ViewState.QUESTS} 
        label="Quest"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 3.414L15.586 7A2 2 0 0116 8.414V16a2 2 0 01-2 2h-6a2 2 0 01-2-2V9a1 1 0 00-1-1H4a1 1 0 00-1 1v7a1 1 0 001 1h2a2 2 0 002-2v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1h2.586a1 1 0 00.707-.293l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-.707-.293H4V4z" />
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 3.414L15.586 7A2 2 0 0116 8.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-2h2a2 2 0 00-2-2V9a2 2 0 00-2-2H4V4z" clipRule="evenodd" />
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm2 0v14h10V3H5z" clipRule="evenodd" />
                <path d="M14 9a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
        } 
      />

      {/* Story (Book) */}
      <NavButton
        view={ViewState.STORY}
        label="Story"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
        }
      />

      {/* Guild (Always Visible) */}
      <NavButton 
        view={ViewState.LEADERBOARD} 
        label="Guild"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
        } 
      />

      {/* Raid (High Level Only) */}
      {playerLevel >= 15 && (
          <NavButton 
            view={ViewState.RAID} 
            label="Raid"
            className="animate-pulse"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            } 
          />
      )}

       {/* Profile / Grimoire (Person) */}
      <NavButton 
        view={ViewState.GRIMOIRE} 
        label="Grimoire"
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        } 
      />
    </div>
  );
};
