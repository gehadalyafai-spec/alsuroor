import React, { useState, useMemo } from 'react';
import { QURAN_QUARTERS, JUZ_METADATA, getQuarterByNumber } from '../data/quranData';
import { getRequiredRecitationForSession } from '../utils/quranLogic';
import { 
  BookOpen, Search, Check, Sparkles, ChevronRight, ChevronLeft, 
  Layers, Compass, ArrowLeft, BookmarkCheck, Hash
} from 'lucide-react';

interface QuranQuarterSelectorProps {
  selectedRub: number;
  onChange: (rub: number) => void;
  title?: string;
  helperText?: string;
}

export const QuranQuarterSelector: React.FC<QuranQuarterSelectorProps> = ({
  selectedRub,
  onChange,
  title = "تحديد موضع الحفظ / اعتماد المحفوظ السابق",
  helperText = "يمكنك اختيار الجزء والربع، أو استخدام الاختصارات السريعة لاعتماد الأجزاء المتقنة مباشرة"
}) => {
  const currentQuarter = getQuarterByNumber(selectedRub) || QURAN_QUARTERS[0];

  // Active navigation tab
  const [tab, setTab] = useState<'juz' | 'presets' | 'search' | 'number'>('juz');

  // Currently viewed Juz in 'juz' tab
  const [viewedJuz, setViewedJuz] = useState<number>(currentQuarter.juz);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Keep viewedJuz in sync when selectedRub changes externally
  React.useEffect(() => {
    if (currentQuarter && currentQuarter.juz !== viewedJuz) {
      setViewedJuz(currentQuarter.juz);
    }
  }, [selectedRub]);

  // Quarters for the currently viewed Juz
  const juzQuarters = useMemo(() => {
    return QURAN_QUARTERS.filter(q => q.juz === viewedJuz);
  }, [viewedJuz]);

  // Filtered quarters for search tab
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const term = searchQuery.trim().toLowerCase();
    return QURAN_QUARTERS.filter(q => {
      return (
        q.surahName.toLowerCase().includes(term) ||
        q.startVerseText.toLowerCase().includes(term) ||
        `الربع ${q.rubNumber}`.includes(term) ||
        `الجزء ${q.juz}`.includes(term) ||
        `حزب ${q.hizb}`.includes(term)
      );
    }).slice(0, 16);
  }, [searchQuery]);

  // Quick preset options (e.g. completed 5 parts, etc.)
  const presets = [
    { label: "من بداية المصحف", targetRub: 1, desc: "الجزء 1 (الفاتحة)", tag: "البداية" },
    { label: "أتم جزءاً واحداً", targetRub: 9, desc: "يبدأ من الجزء 2 (سيقول السفهاء)", tag: "حفظ 1 جزء" },
    { label: "أتم جزئين", targetRub: 17, desc: "يبدأ من الجزء 3 (تلك الرسل)", tag: "حفظ 2 جزء" },
    { label: "أتم 3 أجزاء", targetRub: 25, desc: "يبدأ من الجزء 4 (لن تنالوا البر)", tag: "حفظ 3 أجزاء" },
    { label: "أتم 4 أجزاء", targetRub: 33, desc: "يبدأ من الجزء 5 (والمحصنات)", tag: "حفظ 4 أجزاء" },
    { label: "أتم 5 أجزاء كاملة", targetRub: 41, desc: "يبدأ من الجزء 6 (لا يحب الله)", tag: "حفظ 5 أجزاء", popular: true },
    { label: "أتم 6 أجزاء", targetRub: 49, desc: "يبدأ من الجزء 7 (وإذا سمعوا)", tag: "حفظ 6 أجزاء" },
    { label: "أتم 7 أجزاء", targetRub: 57, desc: "يبدأ من الجزء 8 (ولو أننا)", tag: "حفظ 7 أجزاء" },
    { label: "أتم 8 أجزاء", targetRub: 65, desc: "يبدأ من الجزء 9 (قال الملأ)", tag: "حفظ 8 أجزاء" },
    { label: "أتم 9 أجزاء", targetRub: 73, desc: "يبدأ من الجزء 10 (واعلموا)", tag: "حفظ 9 أجزاء" },
    { label: "أتم 10 أجزاء كاملة", targetRub: 81, desc: "يبدأ من الجزء 11 (يعتذرون إليكم)", tag: "حفظ 10 أجزاء", popular: true },
    { label: "أتم 15 جزءاً (النصف)", targetRub: 121, desc: "يبدأ من الجزء 16 (قال ألم أقل لك)", tag: "حفظ 15 جزءاً", popular: true },
    { label: "أتم 20 جزءاً", targetRub: 161, desc: "يبدأ من الجزء 21 (ولا تجادلوا)", tag: "حفظ 20 جزءاً" },
    { label: "أتم 25 جزءاً", targetRub: 201, desc: "يبدأ من الجزء 26 (حم الأحقاف)", tag: "حفظ 25 جزءاً" },
    { label: "حفظ قصار السور فقط", targetRub: 233, desc: "يبدأ من الجزء 30 (عم يتساءلون)", tag: "جزء عم" },
    { label: "حفظ جزء تبارك وعم", targetRub: 225, desc: "يبدأ من الجزء 29 (تبارك)", tag: "تبارك وعم" },
  ];

  const currentJuzMeta = JUZ_METADATA.find(j => j.juzNumber === viewedJuz) || JUZ_METADATA[0];

  // Plan for the selected quarter
  const plan = getRequiredRecitationForSession(selectedRub);
  const completedParts = ((selectedRub - 1) / 8).toFixed(1).replace('.0', '');

  return (
    <div className="space-y-3.5 bg-stone-50/80 border border-stone-200 rounded-2xl p-4 text-right" id="quran-quarter-selector">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span>{title}</span>
          </label>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
            الربع {selectedRub} من 240 (الجزء {currentQuarter.juz})
          </span>
        </div>
        {helperText && (
          <p className="text-[11px] text-stone-500 mt-1">
            {helperText}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-xl text-xs font-semibold text-stone-700">
        <button
          type="button"
          onClick={() => setTab('juz')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            tab === 'juz' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-stone-950'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>بالأجزاء (1-30)</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('presets')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            tab === 'presets' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-stone-950'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>اعتماد سريع</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('search')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            tab === 'search' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-stone-950'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>بحث بالسورة</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('number')}
          className={`py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            tab === 'number' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'hover:text-stone-950'
          }`}
          title="برقم الربع مباشرة"
        >
          <Hash className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">رقم</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. By Juz (الجزء والأرباع) */}
      {tab === 'juz' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Juz Selector Header with Controls */}
          <div className="bg-white border border-stone-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
            <button
              type="button"
              disabled={viewedJuz <= 1}
              onClick={() => setViewedJuz(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="الجزء السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <select
                  value={viewedJuz}
                  onChange={(e) => setViewedJuz(Number(e.target.value))}
                  className="font-bold text-xs bg-stone-50 border border-stone-300 text-stone-900 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {JUZ_METADATA.map(j => (
                    <option key={j.juzNumber} value={j.juzNumber}>
                      الجزء {j.juzNumber}: {j.name} ({j.mainSurah})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                أرباع الجزء من {currentJuzMeta.startRub} إلى {currentJuzMeta.endRub}
              </p>
            </div>

            <button
              type="button"
              disabled={viewedJuz >= 30}
              onClick={() => setViewedJuz(prev => Math.min(30, prev + 1))}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="الجزء التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Shortcuts for Famous Parts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-stone-500 shrink-0 text-[10px]">انتقال سريع:</span>
            {[1, 5, 10, 15, 20, 25, 28, 29, 30].map(jNum => (
              <button
                key={jNum}
                type="button"
                onClick={() => setViewedJuz(jNum)}
                className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold shrink-0 cursor-pointer transition-colors ${
                  viewedJuz === jNum 
                    ? 'bg-emerald-700 text-white border-emerald-700' 
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                جزء {jNum}
              </button>
            ))}
          </div>

          {/* List of 8 Quarters in this Juz */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {juzQuarters.map((quarter) => {
              const isSelected = quarter.rubNumber === selectedRub;
              return (
                <button
                  key={quarter.rubNumber}
                  type="button"
                  onClick={() => onChange(quarter.rubNumber)}
                  className={`w-full text-right p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        الربع {quarter.rubNumber}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        {quarter.surahName}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        (الربع {quarter.rubInJuz} في الجزء • ص {quarter.approxPage})
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1 font-['Amiri',serif] leading-relaxed truncate">
                      "{quarter.startVerseText}"
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* One-click: Completed this whole Juz */}
          {viewedJuz < 30 && (
            <button
              type="button"
              onClick={() => {
                const nextJuzFirstRub = currentJuzMeta.endRub + 1;
                onChange(nextJuzFirstRub);
                setViewedJuz(viewedJuz + 1);
              }}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-700" />
              <span>الطالب أتم حفظ الجزء {viewedJuz} كاملاً ⬅️ اعتماد البدء من الجزء {viewedJuz + 1} (الربع {currentJuzMeta.endRub + 1})</span>
            </button>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. Presets (اعتماد سريع) */}
      {tab === 'presets' && (
        <div className="space-y-2 animate-in fade-in duration-150">
          <div className="text-[11px] text-stone-500 mb-1">
            اختر المستوى المحفوظ سابقاً بنقرة واحدة لضبط بداية التسميع فوراً:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-0.5">
            {presets.map((p) => {
              const isSelected = selectedRub === p.targetRub;
              return (
                <button
                  key={p.targetRub}
                  type="button"
                  onClick={() => onChange(p.targetRub)}
                  className={`p-2.5 rounded-xl border text-right transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-stone-900">{p.label}</span>
                      {p.popular && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                          شائع
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                      {p.desc} (الربع {p.targetRub})
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. Search (بحث بالسورة أو الآية) */}
      {tab === 'search' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم السورة أو بداية الآية (مثال: النساء، الكهف، تبارك)..."
              className="w-full pr-9 pl-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {searchResults.length > 0 ? (
              searchResults.map((q) => {
                const isSelected = q.rubNumber === selectedRub;
                return (
                  <button
                    key={q.rubNumber}
                    type="button"
                    onClick={() => onChange(q.rubNumber)}
                    className={`w-full text-right p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">سورة {q.surahName}</span>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                          الجزء {q.juz} • الربع {q.rubNumber}
                        </span>
                        <span className="text-[10px] text-stone-400">ص {q.approxPage}</span>
                      </div>
                      <div className="text-[11px] text-stone-600 font-['Amiri',serif] mt-1 truncate">
                        "{q.startVerseText}"
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />}
                  </button>
                );
              })
            ) : searchQuery.trim() ? (
              <div className="text-center py-6 text-xs text-stone-500">
                لا توجد نتائج مطابقة لبحثك "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-stone-400">
                ابحث باسم أي سورة في القرآن أو مطلع الآية للانتقال للربع فوراً
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. Direct Number (برقم الربع مباشرة) */}
      {tab === 'number' && (
        <div className="space-y-3 bg-white p-3 rounded-xl border border-stone-200 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">أدخل رقم الربع مباشرة (1 - 240):</span>
            <input
              type="number"
              min={1}
              max={240}
              value={selectedRub}
              onChange={(e) => onChange(Math.max(1, Math.min(240, Number(e.target.value) || 1)))}
              className="w-20 p-2 text-sm font-bold text-center bg-stone-50 border border-stone-300 rounded-lg text-emerald-800"
            />
          </div>
          <input
            type="range"
            min={1}
            max={240}
            value={selectedRub}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-stone-400">
            <span>الربع 1 (الفاتحة)</span>
            <span>الربع 120 (النصف)</span>
            <span>الربع 240 (الناس)</span>
          </div>
        </div>
      )}

      {/* Selected Quarter Live Summary Card */}
      {currentQuarter && (
        <div className="bg-white border-2 border-emerald-500/40 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  الموضع المحدد: الجزء {currentQuarter.juz} • سورة {currentQuarter.surahName}
                </span>
              </div>
              <div className="text-[11px] text-stone-600 mt-1 font-['Amiri',serif] leading-relaxed">
                مطلع الآية: <strong className="text-stone-900">"{currentQuarter.startVerseText}"</strong> (صفحة {currentQuarter.approxPage})
              </div>
            </div>

            <div className="text-left shrink-0">
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                الربع {selectedRub} / 240
              </span>
            </div>
          </div>

          {/* Operational Impact Note */}
          <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="bg-stone-50 p-2 rounded-lg text-stone-700">
              <span className="text-stone-500 block text-[10px]">المحفوظ السابق المعتمد:</span>
              <span className="font-bold text-stone-900">{selectedRub - 1} ربعاً</span>
              <span className="text-stone-500 text-[10px] mr-1">
                ({completedParts} أجزاء منجزة)
              </span>
            </div>

            <div className="bg-stone-50 p-2 rounded-lg text-stone-700">
              <span className="text-stone-500 block text-[10px]">المطلوب تسميعه في الجلسة القادمة:</span>
              <span className="font-bold text-emerald-700">{plan.totalCount} أرباع</span>
              <span className="text-stone-500 text-[10px] mr-1">
                ({plan.linkingRubs.length > 0 ? `الأرباع ${plan.allRubs.join('، ')}` : `الربع 1`})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
