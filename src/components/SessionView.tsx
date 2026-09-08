import React, { useState, useMemo } from 'react';
import { useQuran } from '../context/QuranContext';
import { getRequiredRecitationForSession, ARABIC_DAYS } from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { Student, SessionGrade } from '../types/quran';
import { 
  Calendar, CheckCircle2, AlertCircle, Award, 
  ChevronRight, ChevronLeft, Search, Check, Sparkles, MessageCircle, Users 
} from 'lucide-react';

interface SessionViewProps {
  onOpenStudentModal: (studentId: string) => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ onOpenStudentModal }) => {
  const { 
    students, 
    sessionRecords, 
    selectedDate, 
    setSelectedDate, 
    recordSessionResult,
    submissions,
    approveSubmission
  } = useQuran();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGradingStudent, setActiveGradingStudent] = useState<Student | null>(null);

  // Grading form state
  const [grade, setGrade] = useState<SessionGrade>('perfect');
  const [mistakes, setMistakes] = useState<number>(0);
  const [hesitations, setHesitations] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [advanceToNext, setAdvanceToNext] = useState<boolean>(true);

  // Date parsing
  const currentDateObj = new Date(selectedDate);
  const dayOfWeek = currentDateObj.getDay(); // 0 = Sunday, 3 = Wednesday
  const isCircleDay = dayOfWeek === 0 || dayOfWeek === 3;
  const dayName = ARABIC_DAYS[dayOfWeek];

  const todayStr = new Date().toISOString().split('T')[0];
  const latestRecordedDate = useMemo(() => {
    if (sessionRecords.length === 0) return null;
    const dates = Array.from(new Set(sessionRecords.map(r => r.date))).sort().reverse();
    return dates[0] || null;
  }, [sessionRecords]);

  // Quick navigation to next/previous circle day
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const jumpToNextCircleDay = () => {
    const d = new Date(selectedDate);
    // Find next Sunday (0) or Wednesday (3)
    for (let i = 1; i <= 7; i++) {
      const next = new Date(d);
      next.setDate(d.getDate() + i);
      if (next.getDay() === 0 || next.getDay() === 3) {
        setSelectedDate(next.toISOString().split('T')[0]);
        break;
      }
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (s.status !== 'active') return false;
      if (!searchQuery.trim()) return true;
      return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.phone.includes(searchQuery);
    });
  }, [students, searchQuery]);

  // Pre-index session records for selectedDate for O(1) lookups
  const currentDayRecordsMap = useMemo(() => {
    const map = new Map<string, (typeof sessionRecords)[0]>();
    for (const r of sessionRecords) {
      if (r.date === selectedDate) {
        map.set(r.studentId, r);
      }
    }
    return map;
  }, [sessionRecords, selectedDate]);

  // Open grading modal
  const startGrading = (student: Student) => {
    setActiveGradingStudent(student);
    const existingRecord = currentDayRecordsMap.get(student.id);
    if (existingRecord) {
      setGrade(existingRecord.grade);
      setMistakes(existingRecord.mistakesCount);
      setHesitations(existingRecord.hesitationsCount);
      setTeacherNotes(existingRecord.teacherNotes);
      setAdvanceToNext(existingRecord.advancedToNext);
    } else {
      setGrade('perfect');
      setMistakes(0);
      setHesitations(0);
      setTeacherNotes('');
      setAdvanceToNext(true);
    }
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingStudent) return;

    recordSessionResult({
      studentId: activeGradingStudent.id,
      date: selectedDate,
      grade,
      mistakesCount: mistakes,
      hesitationsCount: hesitations,
      notes: teacherNotes,
      advanceToNext: advanceToNext && grade !== 'needs_repeat' && grade !== 'absent',
    });

    setActiveGradingStudent(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" id="session-view-container">
      {/* Session Date Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="font-bold text-stone-800 text-base sm:text-lg flex items-center gap-2">
                  <span>جلسة التسميع: يوم {dayName}</span>
                  {isCircleDay ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      يوم حلقة معتمد
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-300">
                      يوم غير مخصص للحلقة (المعتمد: الأحد والأربعاء)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  نظام التسميع: 4 أرباع لكل جلسة (الربع الجديد + 3 أرباع ربط سابق)
                </p>
              </div>
            </div>
          </div>

          {/* Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-2.5 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-2 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
              >
                اليوم
              </button>
            )}

            {latestRecordedDate && selectedDate !== latestRecordedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate(latestRecordedDate)}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-2.5 py-2 rounded-lg transition-colors border border-stone-200 cursor-pointer flex items-center gap-1"
                title={`الرجوع إلى آخر جلسة مسجلة (${latestRecordedDate})`}
              >
                <span>آخر جلسة ({latestRecordedDate})</span>
              </button>
            )}

            <button
              onClick={jumpToNextCircleDay}
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-2.5 py-2 rounded-lg transition-colors border border-stone-200 cursor-pointer"
            >
              الحلقة القادمة
            </button>
          </div>
        </div>
      </div>

      {/* Search & Overview Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم الطالب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs text-stone-600 flex items-center gap-4 bg-stone-100/80 px-3.5 py-2 rounded-xl border border-stone-200/60">
          <span>الطلاب في القائمة: <strong className="text-stone-900">{filteredStudents.length}</strong></span>
          <span className="w-px h-3.5 bg-stone-300"></span>
          <span>
            تم تسميعهم اليوم: <strong className="text-emerald-700 font-bold">
              {currentDayRecordsMap.size}
            </strong>
          </span>
        </div>
      </div>

      {/* Student Recitation Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="students-recitation-grid">
        {filteredStudents.map((student) => {
          const plan = getRequiredRecitationForSession(student.currentRub);
          const newQuarter = getQuarterByNumber(plan.newRub);
          const existingRecord = currentDayRecordsMap.get(student.id);
          const currentJuz = Math.floor((student.currentRub - 1) / 8) + 1;

          return (
            <div
              key={student.id}
              id={`student-card-${student.id}`}
              className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-xs ${
                existingRecord
                  ? 'border-emerald-200 bg-emerald-50/20 ring-1 ring-emerald-500/20'
                  : 'border-stone-200/90 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Student Info Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${student.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <button
                        onClick={() => onOpenStudentModal(student.id)}
                        className="font-bold text-stone-800 text-sm hover:text-emerald-700 transition-colors text-right flex items-center gap-1"
                      >
                        {student.name}
                        <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
                      </button>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        الجزء {currentJuz} • أنجز {student.completedRubCount} ربعاً
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {existingRecord ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {existingRecord.grade === 'perfect' && 'متقن (ممتاز)'}
                      {existingRecord.grade === 'very_good' && 'جيد جداً'}
                      {existingRecord.grade === 'good' && 'جيد'}
                      {existingRecord.grade === 'needs_repeat' && 'يحتاج إعادة'}
                      {existingRecord.grade === 'absent' && 'غائب'}
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      في انتظار التسميع
                    </span>
                  )}
                </div>

                {/* Recitation Requirement Blocks (4 Quarters or 1-3 for beginners) */}
                <div className="mt-3.5">
                  <div className="flex items-center justify-between text-xs text-stone-600 mb-2 font-medium">
                    <span>المطلوب تسميعه ({plan.totalCount} أرباع):</span>
                    {plan.newRub >= 5 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        تم إسقاط ربع {plan.newRub - 4}
                      </span>
                    )}
                  </div>

                  {/* Quarters Pills Container */}
                  <div className="space-y-1.5">
                    {/* Linking Quarters */}
                    {plan.linkingRubs.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {plan.linkingRubs.map((rubNum) => {
                          const q = getQuarterByNumber(rubNum);
                          return (
                            <div
                              key={rubNum}
                              className="bg-stone-50 border border-stone-200 rounded-lg p-1.5 text-center"
                              title={q ? `${q.surahName}: ${q.startVerseText}` : ''}
                            >
                              <div className="text-[10px] text-stone-500">ربط سابق</div>
                              <div className="text-xs font-bold text-stone-800">
                                ربع {rubNum}
                              </div>
                              <div className="text-[10px] text-stone-600 truncate">
                                {q?.surahName}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* The NEW Quarter (Highlighted) */}
                    <div className="bg-gradient-to-l from-emerald-50 to-teal-50 border-2 border-emerald-400/80 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {plan.newRub}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>الربع الجديد #{plan.newRub}</span>
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-normal">
                              جديد
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-800 font-medium truncate max-w-[220px]">
                            سورة {newQuarter?.surahName}: "{newQuarter?.startVerseText.slice(0, 28)}..."
                          </div>
                        </div>
                      </div>

                      <div className="text-left text-[11px] text-stone-500 shrink-0 font-medium">
                        صفحة {newQuarter?.approxPage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Session Recitation Submission Banner */}
              {(() => {
                const pendingSub = submissions.find(
                  s => s.studentId === student.id && s.type === 'session' && s.status === 'pending' && s.date === selectedDate
                );
                if (!pendingSub) return null;

                return (
                  <div className="mt-3 bg-amber-500/15 border border-amber-400/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">
                          📖 أرسل الطالب طلب اعتماد تسميع (الربع {pendingSub.sessionData?.newRub})
                        </span>
                        {pendingSub.sessionData?.studentNotes && (
                          <span className="text-stone-600 block mt-0.5">
                            ملاحظة الطالب: «{pendingSub.sessionData.studentNotes}»
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => approveSubmission(pendingSub.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد التسميع</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenStudentModal(student.id)}
                  className="text-xs text-stone-600 hover:text-stone-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  سجل الطالب
                </button>

                <button
                  id={`record-btn-${student.id}`}
                  onClick={() => startGrading(student)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    existingRecord
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{existingRecord ? 'تعديل التقييم' : 'تسميع ورصد النتيجة'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no students exist or search has no match */}
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          {students.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                لا يوجد طلاب مضافون في الجلسة بعد
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                تم تفريغ كافة البيانات الوهمية. يمكنك البدء بإضافة طلاب الحلقة يدوياً عبر زر "طالب جديد" في الأعلى للبدء في تسميع أرباع الحفظ.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-800">لا توجد نتائج مطابقة للبحث</h3>
              <p className="text-xs text-stone-500">لم يتم العثور على طالب باسم "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                مسح البحث
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recitation & Grading Modal */}
      {activeGradingStudent && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="grading-modal-backdrop">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${activeGradingStudent.avatarColor} text-white font-bold flex items-center justify-center`}>
                    {activeGradingStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{activeGradingStudent.name}</h3>
                    <div className="text-xs text-stone-400">
                      جلسة يوم {dayName} ({selectedDate})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveGradingStudent(null)}
                  className="text-stone-400 hover:text-white p-1 rounded-lg text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveGrading} className="p-4 sm:p-6 space-y-5 text-right">
              {/* Recitation Schedule Details */}
              {(() => {
                const plan = getRequiredRecitationForSession(activeGradingStudent.currentRub);
                const newQ = getQuarterByNumber(plan.newRub);
                return (
                  <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 space-y-2">
                    <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
                      <span>الأرباع المسموعة في هذه الجلسة ({plan.totalCount}):</span>
                      <span className="text-emerald-700 font-semibold text-[11px]">
                        الجزء {newQ?.juz} (الحزب {newQ?.hizb})
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      {plan.linkingRubs.map(r => {
                        const q = getQuarterByNumber(r);
                        return (
                          <div key={r} className="flex items-center justify-between text-stone-600 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/60">
                            <span>🔗 ربط: <strong>الربع {r}</strong> - {q?.surahName}</span>
                            <span className="text-stone-400 text-[10px]">ص {q?.approxPage}</span>
                          </div>
                        );
                      })}

                      <div className="flex items-center justify-between text-emerald-950 bg-emerald-100/70 px-2.5 py-2 rounded-lg border border-emerald-300 font-medium">
                        <span>⭐ الجديد: <strong>الربع {plan.newRub}</strong> - {newQ?.surahName} ("{newQ?.startVerseText.slice(0, 24)}...")</span>
                        <span className="text-emerald-700 text-[11px]">ص {newQ?.approxPage}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Grade Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  تقييم أداء التسميع:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setGrade('perfect'); setAdvanceToNext(true); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      grade === 'perfect'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <div>🌟 ممتاز</div>
                    <div className="text-[10px] font-normal opacity-85 mt-0.5">ترقية للربع التالي</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setGrade('very_good'); setAdvanceToNext(true); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      grade === 'very_good'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <div>✨ جيد جداً</div>
                    <div className="text-[10px] font-normal opacity-85 mt-0.5">ترقية للربع التالي</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setGrade('good'); setAdvanceToNext(true); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      grade === 'good'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <div>⚠️ جيد</div>
                    <div className="text-[10px] font-normal opacity-85 mt-0.5">مع تنبيه على الربط</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setGrade('needs_repeat'); setAdvanceToNext(false); }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                      grade === 'needs_repeat'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    <div>❌ إعادة</div>
                    <div className="text-[10px] font-normal opacity-85 mt-0.5">إعادة نفس الربع</div>
                  </button>
                </div>
              </div>

              {/* Mistakes & Hesitations Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-700 mb-1.5">عدد الأخطاء (التشكيل والكلمات):</div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setMistakes(Math.max(0, mistakes - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-stone-900">{mistakes}</span>
                    <button
                      type="button"
                      onClick={() => setMistakes(mistakes + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="text-xs font-bold text-stone-700 mb-1.5">عدد الترددات / التلعثم:</div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setHesitations(Math.max(0, hesitations - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-stone-900">{hesitations}</span>
                    <button
                      type="button"
                      onClick={() => setHesitations(hesitations + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Automatic Advancement Switch */}
              <div className="flex items-center justify-between bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    الترقية التلقائية إلى الربع الجديد #{activeGradingStudent.currentRub + 1}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    عند اعتماد التسميع، سيصبح ربع الجلسة القادمة هو ربع {activeGradingStudent.currentRub + 1}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={advanceToNext && grade !== 'needs_repeat'}
                  disabled={grade === 'needs_repeat'}
                  onChange={(e) => setAdvanceToNext(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Teacher Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ملاحظات وتوجيهات المعلم:
                </label>
                <textarea
                  rows={2}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="مثال: أحسنت في الربط، انتبه إلى الغنن في الربع الثاني..."
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setActiveGradingStudent(null)}
                  className="text-xs font-bold text-stone-600 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="confirm-grading-btn"
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وحفظ النتيجة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
