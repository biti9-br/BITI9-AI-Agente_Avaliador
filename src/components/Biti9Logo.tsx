import React from 'react';

interface Biti9LogoProps {
  className?: string;
  variant?: 'white' | 'dark' | 'color';
}

export const Biti9Logo: React.FC<Biti9LogoProps> = ({
  className = 'h-8',
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="https://www.biti9.com.br/wp-content/uploads/2024/07/LOGO-BRANCA-1024x619.png"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/logo-branca.png';
        }}
        alt="Biti9 Automations & AI"
        referrerPolicy="no-referrer"
        className="h-full w-auto object-contain drop-shadow"
      />
    </div>
  );
};
