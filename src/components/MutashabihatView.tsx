import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Printer, 
  Star, 
  Bookmark, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Share2, 
  Check, 
  Lightbulb, 
  Layers, 
  Compass,
  ArrowLeftRight,
  FileText,
  Award
} from 'lucide-react';
import { 
  MUTASHABIHAT_DATA, 
  MUTASHABIHAT_CATEGORIES_INFO, 
  GOLDEN_RULES_OF_MUTASHABIHAT 
} from '../data/mutashabihatData';
import { MutashabihahItem, MutashabihatCategory } from '../types/quran';
import { useQuran } from '../context/QuranContext';

export const MutashabihatView: React.FC = () => {
  const { students, activeStudentId, activeRole } = useQuran();
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const [showGoldenRules, setShowGoldenRules] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [revealedQuizItems, setRevealedQuizItems] = useState<Record<string, boolean>>({});
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mutashabihat_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active student current juz detection (if applicable)
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  const studentCurrentJuz = useMemo(() => {
    if (!activeStudent?.currentRub) return 1;
    return Math.ceil(activeStudent.currentRub / 8);
  }, [activeStudent]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setSavedFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      try {
        localStorage.setItem('mutashabihat_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Toggle quiz reveal for a card
  const toggleQuizReveal = (id: string) => {
    setRevealedQuizItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy shareable text
  const handleCopy = (item: MutashabihahItem) => {
    const textToCopy = `متشابهات القرآن الكريم: ${item.title}\n\n` +
      item.verses.map(v => `• سورة ${v.surahName} (آية ${v.ayahNumber} - جزء ${v.juz}):\n«${v.text}»\nالفارق: [${v.highlightPhrase}]`).join('\n\n') +
      `\n\n📌 الضابط والقاعدة:\n${item.rule}\n${item.explanation}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Print view
  const handlePrint = () => {
    window.print();
  };

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return MUTASHABIHAT_DATA.filter(item => {
      // Favorite filter
      if (filterFavoritesOnly && !savedFavorites.includes(item.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Juz filter
      if (selectedJuz !== 'all' && !item.juzList.includes(Number(selectedJuz))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesRule = item.rule.toLowerCase().includes(q);
        const matchesExpl = item.explanation.toLowerCase().includes(q);
        const matchesSurah = item.surahs.some(s => s.toLowerCase().includes(q));
        const matchesVerses = item.verses.some(v => v.text.toLowerCase().includes(q) || v.highlightPhrase.toLowerCase().includes(q));
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesRule && !matchesExpl && !matchesSurah && !matchesVerses && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedJuz, filterFavoritesOnly, savedFavorites]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* Top Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/40">
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Compass className="w-3.5 h-3.5 text-amber-300" />
              <span>دليل الحافظ المتقن وضبط المتشابهات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Amiri',serif] flex items-center gap-3">
              <span>متشابهات القرآن الكريم</span>
              <span className="text-xs sm:text-sm font-sans font-semibold bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full">
                {MUTASHABIHAT_DATA.length} موضعاً موثقاً
              </span>
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
              صفحة مخصصة لمقارنة الآيات المتشابهة بدقة عالية، مع إبراز الكلمات الفارقة، وتوجيه الفروق بالقواعد والضوابط الذهبية لرسوخ الحفظ وعدم الخلط.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeStudent && (
              <button
                type="button"
                onClick={() => {
                  setSelectedJuz(studentCurrentJuz);
                  setSelectedCategory('all');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500/40 shadow-sm transition-all cursor-pointer"
                title={`عرض متشابهات الجزء ${studentCurrentJuz} الذي يحفظه الطالب`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>متشابهات وردي (جزء {studentCurrentJuz})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGoldenRules(!showGoldenRules)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                showGoldenRules 
                  ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md' 
                  : 'bg-stone-800/80 text-stone-200 hover:bg-stone-700 border-stone-700'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>القواعد الذهبية</span>
              {showGoldenRules ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setQuizMode(!quizMode)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                quizMode 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' 
                  : 'bg-stone-800/80 text-stone-200 hover:bg-stone-700 border-stone-700'
              }`}
              title="إخفاء الكلمات الفارقة لاختبار الحفظ"
            >
              {quizMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{quizMode ? 'إنهاء وضع الاختبار' : 'وضع اختبار الحفظ'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-all cursor-pointer"
              title="طباعة تقرير المتشابهات"
            >
              <Printer className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">طباعة</span>
            </button>
          </div>
        </div>

        {/* Collapsible Golden Rules Section */}
        {showGoldenRules && (
          <div className="mt-6 pt-6 border-t border-emerald-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {GOLDEN_RULES_OF_MUTASHABIHAT.map((rule, idx) => (
              <div key={idx} className="bg-emerald-950/70 border border-emerald-600/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-xs text-amber-200">{rule.title}</h4>
                </div>
                <p className="text-[11px] text-emerald-100/80 leading-relaxed">{rule.summary}</p>
                <div className="text-[10px] bg-emerald-900/60 p-2 rounded-lg text-emerald-200 font-mono">
                  💡 مثال: {rule.example}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search & Filter Toolbars */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Live Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكلمة من الآية، اسم السورة، القاعدة، أو الضابط..."
              className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Juz Selector */}
          <div className="sm:col-span-3">
            <select
              value={selectedJuz}
              onChange={(e) => setSelectedJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-700 focus:bg-white focus:border-emerald-600 outline-hidden cursor-pointer"
            >
              <option value="all">جميع الأجزاء (1 - 30)</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                <option key={juz} value={juz}>
                  الجزء {juz} {activeStudent && studentCurrentJuz === juz ? '(ورد الطالب)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Filter Toggle */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                filterFavoritesOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border-stone-200'
              }`}
            >
              <Star className={`w-4 h-4 ${filterFavoritesOnly ? 'fill-amber-400 text-amber-500' : 'text-stone-400'}`} />
              <span>المحفوظة للمراجعة ({savedFavorites.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-stone-100 pt-3">
          {MUTASHABIHAT_CATEGORIES_INFO.map(cat => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Pill & Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>عرض <strong className="text-stone-800">{filteredItems.length}</strong> من إجمالي {MUTASHABIHAT_DATA.length} موضعاً</span>
          {selectedJuz !== 'all' && (
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
              الجزء {selectedJuz}
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-semibold">
              {MUTASHABIHAT_CATEGORIES_INFO.find(c => c.key === selectedCategory)?.label}
            </span>
          )}
          {quizMode && (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              وضع الاختبار مفعل (اضغط على البطاقة لإظهار الفارق)
            </span>
          )}
        </div>

        {(selectedJuz !== 'all' || selectedCategory !== 'all' || searchQuery || filterFavoritesOnly) && (
          <button
            onClick={() => {
              setSelectedJuz('all');
              setSelectedCategory('all');
              setSearchQuery('');
              setFilterFavoritesOnly(false);
            }}
            className="text-emerald-700 hover:underline font-bold"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Cards List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-base text-stone-800">لا توجد متشابهات مطابقة للبحث أو الفلتر المحدد</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            جرب إزالة بعض الفلاتر، أو ابحث باسم سورة أخرى أو كلمة مفتاحية شائعة.
          </p>
          <button
            onClick={() => {
              setSelectedJuz('all');
              setSelectedCategory('all');
              setSearchQuery('');
              setFilterFavoritesOnly(false);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
          >
            عرض كافة المتشابهات
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map(item => {
            const isFav = savedFavorites.includes(item.id);
            const isQuizRevealed = revealedQuizItems[item.id];

            return (
              <div 
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden hover:border-emerald-500/50 transition-all"
              >
                {/* Card Header */}
                <div className="bg-stone-50/90 px-5 py-3.5 border-b border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <h3 className="font-bold text-sm sm:text-base text-stone-900 font-['Cairo',sans-serif]">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md font-semibold">
                        {MUTASHABIHAT_CATEGORIES_INFO.find(c => c.key === item.category)?.label || item.category}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                        السور: {item.surahs.join('، ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {quizMode && (
                      <button
                        type="button"
                        onClick={() => toggleQuizReveal(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 border border-indigo-200 cursor-pointer"
                        title="إظهار / إخفاء الفارق للاختبار"
                      >
                        {isQuizRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{isQuizRevealed ? 'إخفاء' : 'كشف الإجابة'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-500 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title={isFav ? 'إزالة من المحفوظة' : 'حفظ في المفضلة للمراجعة'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="p-1.5 text-stone-400 hover:text-emerald-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                      title="نسخ المتشابهة مع القاعدة"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Verses Comparison Grid */}
                <div className={`p-5 grid grid-cols-1 ${item.verses.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  {item.verses.map((verse, vIdx) => (
                    <div 
                      key={vIdx}
                      className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative hover:bg-emerald-50/20 transition-colors"
                    >
                      {/* Surah badge and meta */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center">
                            {vIdx + 1}
                          </span>
                          <span className="font-bold text-stone-800 text-sm">سورة {verse.surahName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                          <span>آية {verse.ayahNumber}</span>
                          <span>•</span>
                          <span>جزء {verse.juz}</span>
                          <span>•</span>
                          <span>ص {verse.page}</span>
                        </div>
                      </div>

                      {/* Verse Text in Uthmani Serif Typography */}
                      <div className="py-2 text-stone-900 font-['Amiri',serif] text-lg sm:text-xl leading-loose">
                        «{verse.text}»
                      </div>

                      {/* Highlighted Difference Badge */}
                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-stone-500 text-[11px] font-semibold">الموضع الفارغ:</span>
                          {quizMode && !isQuizRevealed ? (
                            <span className="bg-indigo-100 text-indigo-900 px-3 py-0.5 rounded-lg font-mono font-bold tracking-widest text-[11px] border border-indigo-200 cursor-pointer"
                              onClick={() => toggleQuizReveal(item.id)}
                            >
                              [ ??? مخفي للاختبار ]
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs font-['Amiri',serif] text-sm">
                              {verse.highlightPhrase}
                            </span>
                          )}
                        </div>

                        {verse.contextNote && (
                          <span className="text-[10px] text-stone-500 italic truncate max-w-[140px]" title={verse.contextNote}>
                            {verse.contextNote}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Golden Rule & Scholarly Guidance Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-amber-50/40 px-5 py-3.5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950 text-xs sm:text-sm">
                        الضابط الذهبي للحفظ: <span className="font-semibold text-emerald-800">{item.rule}</span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty Tag */}
                  {item.difficulty && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 self-start sm:self-center ${
                      item.difficulty === 'easy' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : item.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {item.difficulty === 'easy' && 'مستوى يسير'}
                      {item.difficulty === 'medium' && 'متوسط الصعوبة'}
                      {item.difficulty === 'hard' && 'دقيق ويحتاج عناية'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Quranic Note */}
      <div className="bg-stone-900 text-stone-300 rounded-3xl p-6 text-center text-xs space-y-2 border border-stone-800">
        <p className="font-['Amiri',serif] text-base text-amber-300 font-bold">
          «كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ وَلِيَتَذَكَّرَ أُولُو الْأَلْبَابِ»
        </p>
        <p className="text-stone-400 max-w-xl mx-auto">
          ضبط المتشابهات من أعظم الوسائل المعينة على استقرار القرآن في الصدر ورسوخ المحفوظ والتلاوة بلا تردد في المحاريب والجلسات.
        </p>
      </div>

    </div>
  );
};
