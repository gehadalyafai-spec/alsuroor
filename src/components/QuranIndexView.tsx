import React, { useState, useMemo } from 'react';
import { QURAN_QUARTERS } from '../data/quranData';
import { QuranQuarter } from '../types/quran';
import { useQuran } from '../context/QuranContext';
import { BookOpen, Search, Filter, Users } from 'lucide-react';

interface QuranIndexViewProps {
  onOpenStudentModal: (studentId: string) => void;
}

export const QuranIndexView: React.FC<QuranIndexViewProps> = ({ onOpenStudentModal }) => {
  const { students } = useQuran();
  const [selectedJuz, setSelectedJuz] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filteredQuarters = useMemo(() => {
    return QURAN_QUARTERS.filter(q => {
      if (selectedJuz !== 'all' && q.juz !== selectedJuz) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return q.surahName.toLowerCase().includes(term) ||
             q.startVerseText.toLowerCase().includes(term) ||
             `الربع ${q.rubNumber}`.includes(term) ||
             `الجزء ${q.juz}`.includes(term);
    });
  }, [selectedJuz, search]);

  // Pre-index students by rub to eliminate 240 O(N) scans on every render/keystroke
  const studentsByQuarter = useMemo(() => {
    const map = new Map<number, typeof students>();
    for (const s of students) {
      const existing = map.get(s.currentRub) || [];
      existing.push(s);
      map.set(s.currentRub, existing);
    }
    return map;
  }, [students]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" id="quran-index-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-stone-900 flex items-center gap-2 font-['Amiri',serif]">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>فهرس أرباع القرآن الكريم (240 ربعاً)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            30 جزءاً • كل جزء 8 أرباع • استعراض مواضع الحفظ والربط ومواقع الطلاب الحالية
          </p>
        </div>

        {/* Juz Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">الجزء:</span>
          <select
            value={selectedJuz}
            onChange={(e) => setSelectedJuz(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="text-xs font-semibold px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">جميع الأجزاء (30 جزءاً)</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map(juzNum => (
              <option key={juzNum} value={juzNum}>
                الجزء {juzNum}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالسورة أو الآية أو رقم الربع..."
          className="w-full pr-9 pl-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Quarters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredQuarters.map((q) => {
          // O(1) lookup using precomputed map
          const studentsAtQuarter = studentsByQuarter.get(q.rubNumber) || [];

          return (
            <div
              key={q.rubNumber}
              className={`bg-white rounded-2xl border p-4 transition-all shadow-xs space-y-2 ${
                studentsAtQuarter.length > 0
                  ? 'border-emerald-300 ring-1 ring-emerald-500/20 bg-emerald-50/20'
                  : 'border-stone-200/90 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                    {q.rubNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900">سورة {q.surahName}</h3>
                    <div className="text-[10px] text-stone-500">
                      الجزء {q.juz} • الربع {q.rubInJuz} (الحزب {q.hizb})
                    </div>
                  </div>
                </div>

                <span className="text-[11px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-md">
                  ص {q.approxPage}
                </span>
              </div>

              {/* Start Verse Text */}
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                <p className="text-xs text-stone-800 font-['Amiri',serif] leading-relaxed">
                  "{q.startVerseText}"
                </p>
                <div className="text-[10px] text-stone-400 mt-1">
                  الآية {q.startVerseNumber}
                </div>
              </div>

              {/* Students badge */}
              {studentsAtQuarter.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-600" />
                    الطلاب عند هذا الربع:
                  </span>
                  {studentsAtQuarter.map(st => (
                    <button
                      key={st.id}
                      onClick={() => onOpenStudentModal(st.id)}
                      className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md font-bold transition-colors"
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
