import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'emerald' | 'blue' | 'amber' | 'teal' | 'slate' | 'rose';
export type DesignStyle = 'modern' | 'classic' | 'compact';
export type BackgroundMode = 'light' | 'parchment' | 'dark';

export interface ThemeSettings {
  color: ThemeColor;
  style: DesignStyle;
  background: BackgroundMode;
}

interface ThemeContextType {
  settings: ThemeSettings;
  setColor: (color: ThemeColor) => void;
  setStyle: (style: DesignStyle) => void;
  setBackground: (bg: BackgroundMode) => void;
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  colorPreset: {
    primary: string;
    hover: string;
    light: string;
    border: string;
    ring: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
}

const STORAGE_KEY = 'quran_app_theme_settings_v1';

const defaultSettings: ThemeSettings = {
  color: 'emerald',
  style: 'modern',
  background: 'light',
};

const COLOR_PRESETS: Record<ThemeColor, ThemeContextType['colorPreset']> = {
  emerald: {
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'focus:ring-emerald-500',
    text: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
  },
  blue: {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    ring: 'focus:ring-blue-500',
    text: 'text-blue-700',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
  },
  amber: {
    primary: 'bg-amber-600',
    hover: 'hover:bg-amber-700',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'focus:ring-amber-500',
    text: 'text-amber-800',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
  },
  teal: {
    primary: 'bg-teal-600',
    hover: 'hover:bg-teal-700',
    light: 'bg-teal-50',
    border: 'border-teal-200',
    ring: 'focus:ring-teal-500',
    text: 'text-teal-700',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
  },
  slate: {
    primary: 'bg-slate-700',
    hover: 'hover:bg-slate-800',
    light: 'bg-slate-100',
    border: 'border-slate-300',
    ring: 'focus:ring-slate-500',
    text: 'text-slate-800',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-slate-900',
  },
  rose: {
    primary: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    light: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'focus:ring-rose-500',
    text: 'text-rose-700',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return defaultSettings;
  });

  const updateSettings = (partial: Partial<ThemeSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setColor = (color: ThemeColor) => updateSettings({ color });
  const setStyle = (style: DesignStyle) => updateSettings({ style });
  const setBackground = (background: BackgroundMode) => updateSettings({ background });

  // Apply theme attributes to document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-app-theme', settings.color);
    root.setAttribute('data-app-style', settings.style);
    root.setAttribute('data-app-bg', settings.background);

    if (settings.background === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [settings]);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        setColor,
        setStyle,
        setBackground,
        updateSettings,
        colorPreset: COLOR_PRESETS[settings.color] || COLOR_PRESETS.emerald,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
