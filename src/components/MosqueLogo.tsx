import React from 'react';
import brandLogo from '../assets/images/quran_minaret_emblem_1789297489319.jpg';

interface MosqueLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
    '2xl': 'w-28 h-28 sm:w-32 sm:h-32'
  };

  const imgSizeClass = sizeClasses[size] || sizeClasses.md;

  if (variant === 'image') {
    return (
      <img 
        src={brandLogo} 
        alt="شعار جامع السرور وحلقة القرآن الكريم"
        referrerPolicy="no-referrer"
        className={`object-cover rounded-xl shadow-sm ${imgSizeClass} ${className}`}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white shadow-sm border border-emerald-800/20 p-0.5 shrink-0 flex items-center justify-center ${imgSizeClass} ${className}`}>
      <img 
        src={brandLogo} 
        alt="شعار جامع السرور وحلقة القرآن الكريم"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-xl"
      />
    </div>
  );
};
