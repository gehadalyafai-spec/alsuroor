import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 'emerald' | 'blue' | 'amber' | 'teal' | 'slate' | 'rose';
export type DesignStyle = 'modern' | 'classic' | 'compact';
export type BackgroundMode = 'light' | 'parchment' | 'dark';
export type HeaderBackgroundMode = 'dark' | 'light' | 'parchment' | 'emerald' | 'navy' | 'amber';

export interface HeaderPreset {
  id: HeaderBackgroundMode;
  name: string;
  subtext: string;
  previewBg: string;
  isDark: boolean;
  headerClass: string;
  subBarClass: string;
  textMainClass: string;
  textSubClass: string;
  btnClass: string;
  tabInactiveClass: string;
  badgeClass: string;
  borderClass: string;
  dropdownClass: string;
}

export interface ThemeSettings {
  color: ThemeColor;
  style: DesignStyle;
  background: BackgroundMode;
  headerBg: HeaderBackgroundMode;
}

interface ThemeContextType {
  settings: ThemeSettings;
  setColor: (color: ThemeColor) => void;
  setStyle: (style: DesignStyle) => void;
  setBackground: (bg: BackgroundMode) => void;
  setHeaderBg: (headerBg: HeaderBackgroundMode) => void;
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
  headerPreset: HeaderPreset;
}

const STORAGE_KEY = 'quran_app_theme_settings_v1';

const defaultSettings: ThemeSettings = {
  color: 'emerald',
  style: 'modern',
  background: 'light',
  headerBg: 'dark',
};

export const HEADER_PRESETS: Record<HeaderBackgroundMode, HeaderPreset> = {
  dark: {
    id: 'dark',
    name: 'الأسود الفحمي (الافتراضي)',
    subtext: 'داكن كلاسيكي هادئ وعالي التباين',
    previewBg: 'bg-stone-900 border-stone-700 text-stone-100',
    isDark: true,
    headerClass: 'bg-stone-900 text-stone-100 border-stone-800',
    subBarClass: 'bg-stone-950/80 border-stone-800/80',
    textMainClass: 'text-white',
    textSubClass: 'text-stone-400',
    btnClass: 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700/80',
    tabInactiveClass: 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60',
    badgeClass: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
    borderClass: 'border-stone-800',
    dropdownClass: 'bg-stone-800 border-stone-700 text-stone-200',
  },
  light: {
    id: 'light',
    name: 'الأبيض الناصع (فاتح)',
    subtext: 'مظهر نهاري ناصع وأنيق مع حدود واضحة',
    previewBg: 'bg-white border-stone-300 text-stone-900',
    isDark: false,
    headerClass: 'bg-white text-stone-900 border-stone-200 shadow-sm',
    subBarClass: 'bg-stone-50/95 border-stone-200',
    textMainClass: 'text-stone-900',
    textSubClass: 'text-stone-500',
    btnClass: 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-250',
    tabInactiveClass: 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70',
    badgeClass: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    borderClass: 'border-stone-200',
    dropdownClass: 'bg-white border-stone-200 text-stone-800 shadow-2xl',
  },
  parchment: {
    id: 'parchment',
    name: 'الورقي الدافئ (مخطوطة)',
    subtext: 'لون ورق المصاحف التراثي المريح للعين',
    previewBg: 'bg-[#faf4e6] border-[#dfcfb5] text-[#332415]',
    isDark: false,
    headerClass: 'bg-[#faf4e6] text-[#332415] border-[#e2d4bd] shadow-xs',
    subBarClass: 'bg-[#ede1ca] border-[#dac9ad]',
    textMainClass: 'text-[#2b1d10]',
    textSubClass: 'text-[#6e5842]',
    btnClass: 'bg-[#ebe0cb] hover:bg-[#e0d3bc] text-[#3d2c1c] border-[#cfbe9e]',
    tabInactiveClass: 'text-[#5e4a35] hover:text-[#2b1d10] hover:bg-[#dfd0b7]',
    badgeClass: 'bg-[#e2d1b2] border-[#cbb794] text-[#4a341f]',
    borderClass: 'border-[#dfcfb5]',
    dropdownClass: 'bg-[#fcf7ee] border-[#dfcfb5] text-[#332415] shadow-2xl',
  },
  emerald: {
    id: 'emerald',
    name: 'الأخضر الزمردي الملكي',
    subtext: 'سمة إسلامية وقورة باللون الأخضر القرآني العميق',
    previewBg: 'bg-emerald-950 border-emerald-800 text-emerald-50',
    isDark: true,
    headerClass: 'bg-[#032b21] text-emerald-50 border-emerald-900',
    subBarClass: 'bg-[#021f18] border-emerald-900/80',
    textMainClass: 'text-white',
    textSubClass: 'text-emerald-300/80',
    btnClass: 'bg-emerald-900/80 hover:bg-emerald-850 text-emerald-100 border-emerald-800/80',
    tabInactiveClass: 'text-emerald-300/80 hover:text-white hover:bg-emerald-900/80',
    badgeClass: 'bg-emerald-900 border-emerald-600 text-emerald-200',
    borderClass: 'border-emerald-900',
    dropdownClass: 'bg-emerald-950 border-emerald-800 text-emerald-100 shadow-2xl',
  },
  navy: {
    id: 'navy',
    name: 'الكحلي الأزرق الوقور',
    subtext: 'طابع ملكي هادئ يساعد على التركيز أثناء الحفظ',
    previewBg: 'bg-slate-950 border-slate-800 text-slate-100',
    isDark: true,
    headerClass: 'bg-[#071326] text-slate-100 border-slate-900',
    subBarClass: 'bg-[#040b17] border-slate-900/90',
    textMainClass: 'text-white',
    textSubClass: 'text-slate-400',
    btnClass: 'bg-slate-900/90 hover:bg-slate-850 text-slate-200 border-slate-800',
    tabInactiveClass: 'text-slate-400 hover:text-white hover:bg-slate-900/80',
    badgeClass: 'bg-blue-950 border-blue-800 text-blue-300',
    borderClass: 'border-slate-850',
    dropdownClass: 'bg-[#0b1b36] border-slate-700 text-slate-100 shadow-2xl',
  },
  amber: {
    id: 'amber',
    name: 'الذهبي العنبري المذهب',
    subtext: 'طابع مذهب دافئ مستوحى من زخارف المصاحف',
    previewBg: 'bg-[#2b170a] border-[#4a2b15] text-amber-100',
    isDark: true,
    headerClass: 'bg-[#241308] text-amber-50 border-[#3d2210]',
    subBarClass: 'bg-[#180c05] border-[#381e0e]',
    textMainClass: 'text-amber-50',
    textSubClass: 'text-amber-300/80',
    btnClass: 'bg-[#3b200e] hover:bg-[#4a2914] text-amber-100 border-[#552f18]',
    tabInactiveClass: 'text-amber-300/80 hover:text-white hover:bg-[#3b200e]',
    badgeClass: 'bg-amber-950 border-amber-700 text-amber-300',
    borderClass: 'border-[#3d2210]',
    dropdownClass: 'bg-[#2c170a] border-amber-900 text-amber-100 shadow-2xl',
  },
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
  const setHeaderBg = (headerBg: HeaderBackgroundMode) => updateSettings({ headerBg });

  // Apply theme attributes to document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-app-theme', settings.color);
    root.setAttribute('data-app-style', settings.style);
    root.setAttribute('data-app-bg', settings.background);
    root.setAttribute('data-app-header-bg', settings.headerBg || 'dark');
    if (document.body) {
      document.body.setAttribute('data-app-theme', settings.color);
      document.body.setAttribute('data-app-style', settings.style);
      document.body.setAttribute('data-app-bg', settings.background);
      document.body.setAttribute('data-app-header-bg', settings.headerBg || 'dark');
    }

    if (settings.background === 'dark') {
      root.classList.add('dark-mode');
      document.body?.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
      document.body?.classList.remove('dark-mode');
    }
  }, [settings]);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        setColor,
        setStyle,
        setBackground,
        setHeaderBg,
        updateSettings,
        colorPreset: COLOR_PRESETS[settings.color] || COLOR_PRESETS.emerald,
        headerPreset: HEADER_PRESETS[settings.headerBg] || HEADER_PRESETS.dark,
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
