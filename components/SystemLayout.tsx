
import React from 'react';

interface SystemLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const SystemLayout: React.FC<SystemLayoutProps> = ({ children, title, className = "" }) => {
  return (
    <div className={`relative bg-black/80 border border-blue-500/60 rounded-sm p-1 ${className} system-glow`}>
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]"></div>

      {title && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-black px-6 py-0.5 text-blue-400 text-xs font-bold tracking-[0.2em] border border-blue-500/60 uppercase shadow-[0_0_10px_rgba(59,130,246,0.4)]">
          {title}
        </div>
      )}

      <div className="bg-[#050b14]/95 w-full h-full p-4 relative z-10 backdrop-blur-md flex flex-col">
        {children}
      </div>
    </div>
  );
};
