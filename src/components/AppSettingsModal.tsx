import React from 'react';
import { useTheme, ThemeColor, DesignStyle, BackgroundMode } from '../context/ThemeContext';
import { 
  Palette, Layout, Moon, Sun, Check, Sparkles, BookOpen, 
  RotateCcw, X, Sliders, CheckCircle2, Layers 
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColorOption {
  id: ThemeColor;
  name: string;
  subtext: string;
  dotColor: string;
  gradient: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'emerald',
    name: 'الزمردي النضر',
    subtext: 'السمة الإسلامية الكلاسيكية الهادئة',
    dotColor: 'bg-emerald-600',
    gradient: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'blue',
    name: 'الياقوتي الملكي',
    subtext: 'أزرق وقور عالي الوضوح والتركيز',
    dotColor: 'bg-blue-600',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'amber',
    name: 'الذهبي العنبري',
    subtext: 'ألوان تراثية دافئة مستوحاة من مذهبات المصحف',
    dotColor: 'bg-amber-600',
    gradient: 'from-amber-500 to-amber-700',
  },
  {
    id: 'teal',
    name: 'الفيروزي البحري',
    subtext: 'طابع منعش ومريح للنظر في الحلقات اليومية',
    dotColor: 'bg-teal-600',
    gradient: 'from-teal-500 to-emerald-700',
  },
  {
    id: 'slate',
    name: 'الفحمي الرخامي',
    subtext: 'نمط رمادي حيادي فائق الأناقة والبساطة',
    dotColor: 'bg-slate-700',
    gradient: 'from-slate-700 to-zinc-900',
  },
  {
    id: 'rose',
    name: 'الوردي العنابي',
    subtext: 'ألوان هادئة ولطيفة تناسب الحلقات المتنوعة',
    dotColor: 'bg-rose-600',
    gradient: 'from-rose-500 to-rose-700',
  },
];

interface StyleOption {
  id: DesignStyle;
  name: string;
  description: string;
  badge: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'modern',
    name: 'التصميم العصري الأنيق',
    description: 'بطاقات مستديرة ناعمة، تباين مدروس وظلال هادئة تمنح راحة وسرعة في الاستخدام.',
    badge: 'الافتراضي الحديث',
  },
  {
    id: 'classic',
    name: 'التصميم القرآني التراثي',
    description: 'إطارات مذهبة وخطوط عربية أصيلة مع عناوين بالخط الأميري مستوحاة من جماليات المصاحف.',
    badge: 'طراز المصحف الشريف',
  },
  {
    id: 'compact',
    name: 'التصميم المدمج المركز',
    description: 'استغلال أمثل للمساحة وبطاقات متراصة لعرض أكبر عدد من الطلاب دون الحاجة للتمرير الطويل.',
    badge: 'كفاءة وسرعة',
  },
];

interface BackgroundOption {
  id: BackgroundMode;
  name: string;
  description: string;
  bgPreview: string;
}

const BG_OPTIONS: BackgroundOption[] = [
  {
    id: 'light',
    name: 'فاتح ناصع',
    description: 'خلفية ناصعة مريحة للإضاءة النهارية',
    bgPreview: 'bg-stone-100 border-stone-300',
  },
  {
    id: 'parchment',
    name: 'ورقي دافئ (مخطوطة)',
    description: 'لون ورق المصاحف الدافئ يمنع إجهاد العين في القراءة',
    bgPreview: 'bg-[#faf6ed] border-amber-200',
  },
  {
    id: 'dark',
    name: 'داكن مريح (ليلي)',
    description: 'واجهة داكنة مهدئة مناسبة للحلقات المسائية',
    bgPreview: 'bg-stone-900 border-stone-700 text-stone-200',
  },
];

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, setColor, setStyle, setBackground, updateSettings, colorPreset } = useTheme();

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    updateSettings({
      color: 'emerald',
      style: 'modern',
      background: 'light',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4" dir="rtl">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 text-stone-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-stone-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">إعدادات ومظهر التطبيق</h2>
              <p className="text-xs text-stone-400">
                تخصيص ألوان التطبيق، شكل التصميم، ووضع القراءة المريح
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Design Style (شكل وتصميم التطبيق) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">شكل وتصميم التطبيق</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">اختر النمط المناسب لك</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((style) => {
                const isSelected = settings.style === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setStyle(style.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-stone-900">{style.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {style.description}
                      </p>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md inline-block w-fit">
                      {style.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: App Color Palette (ألوان التطبيق) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">ألوان وتناسق التطبيق</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">لون الأزرار والإبرازات</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = settings.color === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setColor(c.id)}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50 ring-2 ring-stone-900/15 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${c.dotColor} shadow-inner flex items-center justify-center text-white shrink-0`}>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-xs text-stone-900 truncate">{c.name}</div>
                      <div className="text-[10px] text-stone-500 truncate">{c.subtext}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Background & Eye Comfort (وضع القراءة والخلفية) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-stone-900">لون خلفية الشاشة وقراءة العين</h3>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">راحة النظر أثناء الحلقة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BG_OPTIONS.map((bg) => {
                const isSelected = settings.background === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBackground(bg.id)}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${bg.bgPreview} ${
                      isSelected
                        ? 'ring-2 ring-emerald-500 shadow-xs'
                        : 'hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{bg.name}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">
                      {bg.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                معاينة حية للمظهر المختار:
              </span>
              <span className="text-[10px] text-stone-500">
                يطبق فوراً على جميع الشاشات
              </span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${colorPreset.primary} text-white font-bold flex items-center justify-center text-xs shadow-xs`}>
                  ق
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-900">طالب في الحلقة: عبد الرحمن</div>
                  <div className="text-[10px] text-stone-500">المقرر: الجزء 1 إلى 3 • الورد اليومي مكتمل</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorPreset.badgeBg} ${colorPreset.badgeText}`}>
                  تم بالكامل
                </span>
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs ${colorPreset.primary}`}
                >
                  اعتماد التسميع
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 sm:px-6 py-3.5 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 px-3 py-2 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>استعادة الإعدادات الافتراضية</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            حفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
