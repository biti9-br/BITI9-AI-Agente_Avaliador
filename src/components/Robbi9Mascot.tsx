import React from 'react';

interface Robbi9MascotProps {
  size?: 'sm' | 'md' | 'lg';
  expression?: 'happy' | 'excited' | 'thinking' | 'winking';
  message?: string;
  className?: string;
}

export const Robbi9Mascot: React.FC<Robbi9MascotProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-20 sm:w-24',
    md: 'w-28 sm:w-36',
    lg: 'w-36 sm:w-44',
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}>
      {/* 3D Robot Mascot Image Floating Seamlessly */}
      <img
        src="https://connect.biti9.com.br/mascote-robbi9.png"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/mascote-robbi9.png';
        }}
        alt="Robbi9 Biti9 Mascote"
        referrerPolicy="no-referrer"
        className={`${sizeMap[size]} shrink-0 object-contain filter drop-shadow-[0_0_20px_rgba(43,173,255,0.4)] animate-float transition-transform duration-300 hover:scale-105`}
      />

      {/* Speech Bubble */}
      {message && (
        <div className="relative bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-100 shadow-xl backdrop-blur-md max-w-sm sm:max-w-md animate-fade-in text-center sm:text-left">
          <div className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-slate-700/80" />
          <p className="leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
};
