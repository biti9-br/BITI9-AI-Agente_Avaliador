import React, { useState } from 'react';

interface CuboLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'white' | 'dark' | 'card';
}

// TODO(logo oficial): quando o arquivo oficial do logo do Cubo (svg/png) for
// enviado, salve-o em `public/assets/cubo-logo-oficial.svg` (ou .png). Este
// componente já está preparado para detectar e usar esse arquivo automaticamente
// — se ele não existir, continua caindo no SVG desenhado à mão abaixo, que é
// uma APROXIMAÇÃO e foi o motivo do feedback "logo descaracterizado".
const OFFICIAL_LOGO_PATHS = [
  'https://builderscamp.com.br/assets/cubo-itau-logo-DR0q5eJa.png',
  '/assets/cubo-logo-oficial.png',
  'https://logos-world.net/wp-content/uploads/2026/03/Cubo-Itau-Logo-New.png',
  '/assets/cubo-logo-oficial.svg',
];

export const CuboLogo: React.FC<CuboLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'white',
}) => {
  const [officialLogoIndex, setOfficialLogoIndex] = useState(0);
  const [officialLogoFailed, setOfficialLogoFailed] = useState(false);

  const sizeClasses = {
    sm: 'h-3.5 sm:h-4.5',
    md: 'h-4.5 sm:h-5.5',
    lg: 'h-5 sm:h-6.5',
  };

  const textColor = variant === 'dark' ? '#0F172A' : '#FFFFFF';

  const imgFilterClass = '';

  const approximateLogoSvg = (
    <svg
      viewBox="0 0 210 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto select-none"
    >
      {/* Letter 'c' - Geometric Cubo typography */}
      <path
        d="M 44 20 L 18 20 L 8 30 L 8 42 L 18 52 L 44 52 L 44 41 L 20 41 L 15 36 L 20 31 L 44 31 Z"
        fill={textColor}
      />

      {/* Letter 'u' - Geometric Cubo typography */}
      <path
        d="M 49 20 L 60 20 L 60 40 C 60 42 62 43 65 43 C 68 43 70 42 70 40 L 70 20 L 81 20 L 81 40 C 81 48 74 53 65 53 C 56 53 49 48 49 40 Z"
        fill={textColor}
      />

      {/* Letter 'b' - Exact Cubo Itaú geometry with bottom-left chamfer and top bowl chamfer */}
      <path
        d="M 88 4 L 99 4 L 99 27 L 106 20 L 124 20 C 132 20 137 25 137 32 L 137 40 C 137 47 132 52 124 52 L 98 52 L 88 42 Z M 99 32 C 99 30 101 29 103 29 L 122 29 C 124 29 125 30 125 32 L 125 40 C 125 42 124 43 122 43 L 103 43 C 101 43 99 42 99 40 Z"
        fillRule="evenodd"
        fill={textColor}
      />

      {/* Letter 'o' - Rounded squircle O */}
      <path
        d="M 156 20 L 166 20 C 174 20 180 26 180 36 C 180 46 174 52 166 52 L 156 52 C 148 52 142 46 142 36 C 142 26 148 20 156 20 Z M 156 31 C 154 31 153 33 153 36 C 153 39 154 41 156 41 L 166 41 C 168 41 169 39 169 36 C 169 33 168 31 166 31 Z"
        fillRule="evenodd"
        fill={textColor}
      />

      {/* Official Cubo Itaú Orange Squircle Icon with "itaú" text */}
      <g>
        <rect
          x="184"
          y="8"
          width="24"
          height="24"
          rx="7"
          fill="#FF5000"
        />
        <text
          x="196"
          y="20"
          fill="#FFFFFF"
          fontSize="8"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          textAnchor="middle"
          dominantBaseline="central"
        >
          itaú
        </text>
      </g>
    </svg>
  );

  const logoContent =
    !officialLogoFailed && officialLogoIndex < OFFICIAL_LOGO_PATHS.length ? (
      <img
        src={OFFICIAL_LOGO_PATHS[officialLogoIndex]}
        alt="Cubo Itaú"
        referrerPolicy="no-referrer"
        className={`h-full w-auto select-none object-contain ${imgFilterClass}`}
        onError={() => {
          if (officialLogoIndex < OFFICIAL_LOGO_PATHS.length - 1) {
            setOfficialLogoIndex((i) => i + 1);
          } else {
            setOfficialLogoFailed(true);
          }
        }}
      />
    ) : (
      approximateLogoSvg
    );

  if (variant === 'card') {
    return (
      <div className={`inline-flex items-center justify-center bg-white px-4 py-2 rounded-xl shadow-md border border-slate-200 ${sizeClasses[size]} ${className}`}>
        {logoContent}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {logoContent}
    </div>
  );
};
