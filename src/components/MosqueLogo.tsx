import React from 'react';

interface MosqueLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'image' | 'contained';
}

export const MosqueLogo: React.FC<MosqueLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'contained'
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const imgSizeClass = sizeClasses[size] || sizeClasses.md;

  // The SVG reproduces the exact Islamic mosque logo uploaded by the user:
  // - Emerald Green color palette (#086e3f / #0b7a47 / #128b52)
  // - Pointed dome with intricate 8-pointed star Islamic arabesque strapwork pattern
  // - Minaret on the left with crescent, vertical spire, orbs, bulbous dome, and arched windows
  // - Clean white background just like the original artwork
  const svgContent = (
    <svg 
      viewBox="0 0 500 500" 
      className="w-full h-full object-contain"
      aria-label="شعار جامع السرور"
    >
      <defs>
        <linearGradient id="mosqueExactGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#086e3f" />
          <stop offset="50%" stopColor="#0b7a47" />
          <stop offset="100%" stopColor="#128b52" />
        </linearGradient>

        <linearGradient id="mosqueExactDeepGreen" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0b7a47" />
          <stop offset="100%" stopColor="#044d2b" />
        </linearGradient>

        {/* 8-Pointed Star and Octagonal Islamic Tessellation Pattern */}
        <pattern id="islamicPatternComponent" width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill="url(#mosqueExactGreenGrad)"/>
          <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polygon points="22,8 26.5,17.5 36,22 26.5,26.5 22,36 17.5,26.5 8,22 17.5,17.5" />
            <rect x="11" y="11" width="22" height="22" transform="rotate(45 22 22)" />
            <rect x="11" y="11" width="22" height="22" />
            <line x1="0" y1="0" x2="11" y2="11" />
            <line x1="44" y1="0" x2="33" y2="11" />
            <line x1="0" y1="44" x2="11" y2="33" />
            <line x1="44" y1="44" x2="33" y2="33" />
            <line x1="22" y1="0" x2="22" y2="8" />
            <line x1="22" y1="36" x2="22" y2="44" />
            <line x1="0" y1="22" x2="8" y2="22" />
            <line x1="36" y1="22" x2="44" y2="22" />
            <polygon points="0,0 6,0 0,6" fill="url(#mosqueExactGreenGrad)" />
            <polygon points="44,0 38,0 44,6" fill="url(#mosqueExactGreenGrad)" />
            <polygon points="0,44 6,44 0,38" fill="url(#mosqueExactGreenGrad)" />
            <polygon points="44,44 38,44 44,38" fill="url(#mosqueExactGreenGrad)" />
          </g>
        </pattern>
      </defs>

      <g id="mosque-official-logo">
        {/* Dome Outer Silhouette */}
        <path 
          d="M 260,186 C 285,248 335,296 392,342 C 328,370 230,372 142,336 L 142,275 C 178,272 230,240 260,186 Z" 
          fill="url(#mosqueExactGreenGrad)" 
        />

        {/* Dome Islamic Arabesque Pattern Inlay */}
        <path 
          d="M 260,215 C 280,258 322,300 376,336 C 322,354 240,355 156,328 C 182,298 228,260 260,215 Z" 
          fill="url(#islamicPatternComponent)" 
        />

        {/* Lower Dome Shading */}
        <path 
          d="M 142,336 C 230,372 328,370 392,342 C 320,380 220,382 142,348 Z" 
          fill="url(#mosqueExactDeepGreen)" 
        />

        {/* Minaret Base Wall & Bracket */}
        <path d="M 142,275 L 196,275 L 196,350 L 142,340 Z" fill="url(#mosqueExactGreenGrad)" />
        <path d="M 132,275 L 196,275 L 196,285 L 132,285 Z" fill="url(#mosqueExactGreenGrad)" />
        <polygon points="132,285 142,300 142,285" fill="url(#mosqueExactDeepGreen)" />

        {/* Minaret Shaft */}
        <rect x="150" y="210" width="42" height="65" fill="url(#mosqueExactGreenGrad)" />

        {/* Arched Window in Minaret Shaft */}
        <path d="M 162,270 L 162,236 C 162,226 180,226 180,236 L 180,270 Z" fill="#ffffff" />

        {/* Minaret Balcony */}
        <polygon points="142,204 200,204 204,212 138,212" fill="url(#mosqueExactGreenGrad)" />
        <rect x="144" y="200" width="54" height="4" fill="url(#mosqueExactGreenGrad)" />

        {/* Minaret Dome/Cap */}
        <path 
          d="M 150,200 C 150,172 171,154 171,154 C 171,154 192,172 192,200 Z" 
          fill="url(#mosqueExactGreenGrad)" 
        />
        
        {/* Small Arched Cutout in Minaret Cap */}
        <path d="M 166,194 L 166,180 C 166,174 176,174 176,180 L 176,194 Z" fill="#ffffff" />

        {/* Finial Spire with Spheres */}
        <line x1="171" y1="108" x2="171" y2="154" stroke="url(#mosqueExactGreenGrad)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="171" cy="144" r="5" fill="url(#mosqueExactGreenGrad)" />
        <circle cx="171" cy="130" r="4" fill="url(#mosqueExactGreenGrad)" />
        <circle cx="171" cy="116" r="3" fill="url(#mosqueExactGreenGrad)" />

        {/* Crescent Moon (الهلال) */}
        <path 
          d="M 171,88 C 162,94 158,105 163,115 C 168,124 179,127 188,120 C 177,123 167,117 165,108 C 163,100 167,93 171,88 Z" 
          fill="url(#mosqueExactGreenGrad)" 
        />

        {/* Ground / Base Sweep */}
        <path 
          d="M 130,358 C 210,388 320,388 418,354 C 320,396 210,396 130,358 Z" 
          fill="url(#mosqueExactGreenGrad)" 
        />
      </g>
    </svg>
  );

  if (variant === 'image') {
    return (
      <div className={`overflow-hidden rounded-xl bg-white flex items-center justify-center p-1 ${imgSizeClass} ${className}`}>
        {svgContent}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-white shadow-sm border border-emerald-800/20 p-1 shrink-0 flex items-center justify-center ${imgSizeClass} ${className}`}>
      {svgContent}
    </div>
  );
};
