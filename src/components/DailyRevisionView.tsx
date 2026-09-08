import React, { useState, useMemo } from 'react';
import { useQuran } from '../context/QuranContext';
import { getDailyRevisionAssignment, ARABIC_DAYS, getWeeklySchedule } from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { RevisionStatus } from '../types/quran';
import { 
  CheckSquare, Calendar, ChevronRight, ChevronLeft, Check, 
  AlertTriangle, X, Star, Sparkles, Filter, Grid, List, CheckCircle2 
} from 'lucide-react';

interface DailyRevisionViewProps {
  onOpenStudentModal: (studentId: string) => void;
}

export const DailyRevisionView: React.FC<DailyRevisionViewProps> = ({ onOpenStudentModal }) => {
  const { 
    students, 
    dailyRevisionRecords, 
    selectedDate, 
    setSelectedDate, 
    recordDailyRevision,
    getStudentDailyRevision,
    submissions,
    approveSubmission
  } = useQuran();

  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const currentDateObj = new Date(selectedDate);
  const dayOfWeek = currentDateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const dayName = ARABIC_DAYS[dayOfWeek];
  const isCircleDay = dayOfWeek === 0 || dayOfWeek === 3;

  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Find start of week (Sunday) for matrix view
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - day);

    const week: { dateStr: string; dayName: string; dayIndex: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);
      week.push({
        dateStr: dayDate.toISOString().split('T')[0],
        dayName: ARABIC_DAYS[i],
        dayIndex: i,
      });
    }
    return week;
  }, [selectedDate]);

  // Quick mark for student
  const handleQuickStatus = (studentId: string, status: RevisionStatus, rating: number = 5) => {
    recordDailyRevision(studentId, selectedDate, status, '', rating);
  };

  // Memoized active students
  const activeStudents = useMemo(() => {
    return students.filter(s => s.status === 'active');
  }, [students]);

  // Pre-indexed map for all revisions by studentId_date for instant multi-day lookup
  const revisionLookupMap = useMemo(() => {
    const map = new Map<string, (typeof dailyRevisionRecords)[0]>();
    for (const r of dailyRevisionRecords) {
      map.set(`${r.studentId}_${r.date}`, r);
    }
    return map;
  }, [dailyRevisionRecords]);

  // Pre-indexed map for today's revisions
  const todayRevisionMap = useMemo(() => {
    const map = new Map<string, (typeof dailyRevisionRecords)[0]>();
    for (const r of dailyRevisionRecords) {
      if (r.date === selectedDate) {
        map.set(r.studentId, r);
      }
    }
    return map;
  }, [dailyRevisionRecords, selectedDate]);

  // Pre-indexed map for pending submissions for selectedDate
  const pendingSubmissionsMap = useMemo(() => {
    const map = new Map<string, (typeof submissions)[0]>();
    for (const s of submissions) {
      if (s.type === 'daily_revision' && s.status === 'pending' && s.date === selectedDate) {
        map.set(s.studentId, s);
      }
    }
    return map;
  }, [submissions, selectedDate]);

  // Stats for today calculated in single pass
  const { completedTodayCount, partialTodayCount, missedTodayCount } = useMemo(() => {
    let completed = 0;
    let partial = 0;
    let missed = 0;
    for (const s of activeStudents) {
      const rec = todayRevisionMap.get(s.id);
      if (rec?.status === 'completed') completed++;
      else if (rec?.status === 'partial') partial++;
      else if (rec?.status === 'missed') missed++;
    }
    return { completedTodayCount: completed, partialTodayCount: partial, missedTodayCount: missed };
  }, [activeStudents, todayRevisionMap]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" id="daily-revision-view">
      {/* Top Explanation Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckSquare className="w-5 h-5" />
              </span>
              <h2 className="font-bold text-lg font-['Amiri',serif]">
                متابعة وتدوين الورد اليومي (المراجعة الذاتية)
              </h2>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
              نظام التدرج: يقرأ الطالب ما حفظه لنفسه كل يوم، ومع كل جلسة حلقة يتسع ورده اليومي تلقائياً 
              حتى يستقر على <strong className="text-white underline decoration-emerald-400">24 ربعاً يومياً (3 أجزاء كاملة)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/80'
              }`}
            >
              <List className="w-4 h-4" />
              <span>بطاقات اليوم</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/80'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>جدول الأسبوع الشامل</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigation & Day Selector */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Calendar className="w-4 h-4" />
            </span>
            <div>
              <div className="font-bold text-sm text-stone-800 flex items-center gap-2">
                <span>ورد يوم {dayName} ({selectedDate})</span>
                {isCircleDay && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    يوم حلقة
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-500">
                نسبة إنجاز المراجعة لليوم: {activeStudents.length > 0 ? Math.round((completedTodayCount / activeStudents.length) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Quick Date Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600 transition-colors"
              title="اليوم التالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-2 rounded-lg transition-colors border border-stone-200"
            >
              اليوم
            </button>
          </div>
        </div>

        {/* Days of Week Quick Pills */}
        <div className="grid grid-cols-7 gap-1.5 mt-3 pt-3 border-t border-stone-100">
          {weekDays.map((wd) => {
            const isSelected = wd.dateStr === selectedDate;
            const isToday = wd.dateStr === new Date().toISOString().split('T')[0];
            const isDayCircle = wd.dayIndex === 0 || wd.dayIndex === 3;

            return (
              <button
                key={wd.dateStr}
                onClick={() => setSelectedDate(wd.dateStr)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : isToday
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/70'
                }`}
              >
                <div className="text-[11px] truncate">{wd.dayName}</div>
                <div className="text-[10px] opacity-80 mt-0.5">
                  {wd.dateStr.slice(8)}
                </div>
                {isDayCircle && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto mt-1" title="يوم حلقة"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-emerald-950">{completedTodayCount}</div>
            <div className="text-xs text-emerald-700 font-medium">أتموا الورد كاملاً</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-amber-950">{partialTodayCount}</div>
            <div className="text-xs text-amber-700 font-medium">مراجعة جزئية</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <X className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold text-rose-950">{missedTodayCount}</div>
            <div className="text-xs text-rose-700 font-medium">لم يراجعوا بعد</div>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="space-y-3" id="daily-revision-cards-list">
          {activeStudents.map((student) => {
            const assignment = getDailyRevisionAssignment(student.currentRub, dayOfWeek, dayOfWeek, student);
            const record = todayRevisionMap.get(student.id);
            const isCompleted = record?.status === 'completed';
            const isPartial = record?.status === 'partial';
            const isMissed = record?.status === 'missed';

            const pendingSub = pendingSubmissionsMap.get(student.id);

            // Calculate percentage toward 24 quarters target
            const targetCap = 24;
            const targetPercent = Math.min(100, Math.round((assignment.totalCount / targetCap) * 100));

            return (
              <div
                key={student.id}
                id={`revision-row-${student.id}`}
                className={`bg-white rounded-2xl border p-4 transition-all shadow-xs flex flex-col gap-3 ${
                  pendingSub
                    ? 'border-amber-400 bg-amber-50/25 ring-2 ring-amber-400/20'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : isPartial
                    ? 'border-amber-200 bg-amber-50/15'
                    : isMissed
                    ? 'border-rose-200 bg-rose-50/15'
                    : 'border-stone-200/90 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Student Info & Assigned Wird */}
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${student.avatarColor} text-white font-bold flex items-center justify-center shrink-0`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onOpenStudentModal(student.id)}
                          className="font-bold text-stone-900 text-sm hover:text-emerald-700 transition-colors"
                        >
                          {student.name}
                        </button>
                        <span className="text-[11px] text-stone-500">
                          (محفوظه: {student.completedRubCount} ربعاً)
                        </span>
                        {assignment.isCustomWird && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            ورد مخصص
                          </span>
                        )}
                      </div>

                      {/* Assigned Wird Description */}
                      <div className="text-xs font-semibold text-emerald-950 flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-stone-700 font-bold">📖 الورد المطلوب:</span>
                        <span className="bg-emerald-100/80 text-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-300 font-bold text-xs shadow-2xs">
                          {assignment.description}
                        </span>
                      </div>

                      {/* Progress to 24 quarters indicator */}
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                        <span>الهدف اليومي (24 ربعاً / 3 أجزاء):</span>
                        <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${targetPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-stone-700">
                          {assignment.totalCount >= 24 ? '3 أجزاء (24/24)' : `${assignment.totalCount} / 24`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                    <button
                      onClick={() => handleQuickStatus(student.id, 'completed', 5)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>تم بالكامل</span>
                    </button>

                    <button
                      onClick={() => handleQuickStatus(student.id, 'partial', 3)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPartial
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-800 border border-stone-200'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>جزئي</span>
                    </button>

                    <button
                      onClick={() => handleQuickStatus(student.id, 'missed', 1)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isMissed
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-stone-50 hover:bg-rose-50 text-stone-700 hover:text-rose-800 border border-stone-200'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>لم يراجع</span>
                    </button>

                    <button
                      onClick={() => onOpenStudentModal(student.id)}
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="سجل وتفاصيل الطالب"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Days Weekly Schedule Display inside Student Card (عرض بطاقة الطالب بالأيام) */}
                <div className="pt-2.5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>جدول الورد الأسبوعي بالأيام السبعة:</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                      انقر على أي يوم لتدوين حالته فوراً
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                    {getWeeklySchedule(student, new Date(selectedDate)).map((dayItem) => {
                      const dayRec = revisionLookupMap.get(`${student.id}_${dayItem.date}`);
                      const isSelectedDay = dayItem.date === selectedDate;
                      const isDone = dayRec?.status === 'completed';
                      const isPart = dayRec?.status === 'partial';
                      const isMiss = dayRec?.status === 'missed';

                      return (
                        <div
                          key={dayItem.date}
                          onClick={() => setSelectedDate(dayItem.date)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                            isSelectedDay
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/25 shadow-xs'
                              : isDone
                              ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50'
                              : isPart
                              ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50'
                              : isMiss
                              ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                              : 'bg-stone-50 hover:bg-stone-100/90 border-stone-200/80'
                          }`}
                          title={`تحديد يوم ${dayItem.dayName} (${dayItem.date})`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-[11px] font-bold ${isSelectedDay ? 'text-emerald-900' : 'text-stone-800'}`}>
                              {dayItem.dayName}
                            </span>
                            {dayItem.isCircleDay && (
                              <span className="text-[9px] bg-emerald-700 text-white px-1 py-0.2 rounded font-bold" title="جلسة حلقة المسجد">
                                حلقة
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-600 line-clamp-2 leading-tight font-medium" title={dayItem.description}>
                            {dayItem.description}
                          </div>

                          {/* Day Status Pill */}
                          <div className="pt-1 border-t border-stone-200/50 flex items-center justify-center">
                            {isDone ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>مكتمل</span>
                              </span>
                            ) : isPart ? (
                              <span className="text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>جزئي</span>
                              </span>
                            ) : isMiss ? (
                              <span className="text-[10px] font-bold text-rose-700 flex items-center gap-0.5">
                                <X className="w-3 h-3 text-rose-600" />
                                <span>لم يراجع</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-medium">
                                لم يُسجل
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pending Student Submission Banner with Quick Approval */}
                {pendingSub && (
                  <div className="bg-amber-500/15 border border-amber-400/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <div>
                        <span className="font-bold text-amber-950">
                          📩 أرسل الطالب تأكيد ورده لليوم ({pendingSub.revisionData?.status === 'completed' ? 'تم بالكامل' : pendingSub.revisionData?.status === 'partial' ? 'جزئي' : 'لم يراجع'})
                        </span>
                        {pendingSub.revisionData?.notes && (
                          <span className="text-stone-600 block mt-0.5">
                            ملاحظة الطالب: «{pendingSub.revisionData.notes}»
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
                        <span>اعتماد الورد فوراً</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {activeStudents.length === 0 && (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckSquare className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-stone-900">
                  لا يوجد طلاب لتسجيل الورد اليومي
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  عند إضافة طلاب جدد للحلقة، سيتم توليد جدول الورد اليومي التلقائي لكل طالب بحسب مقدار حفظه (من ربع واحد وحتى 24 ربعاً).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matrix View (Comprehensive Weekly Grid) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden" id="weekly-matrix-table-container">
          <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-800">
              جدول المراجعة الأسبوعي للطلاب (من الأحد إلى السبت)
            </h3>
            <span className="text-xs text-stone-500">
              اضغط على أي خلية لتغيير حالة المراجعة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right divide-y divide-stone-200">
              <thead className="bg-stone-100/70 text-stone-600 font-bold">
                <tr>
                  <th className="px-4 py-3 min-w-[180px]">اسم الطالب</th>
                  <th className="px-2 py-3 text-center">الورد اليومي</th>
                  {weekDays.map((wd) => (
                    <th key={wd.dateStr} className="px-2 py-3 text-center min-w-[75px]">
                      <div>{wd.dayName}</div>
                      <div className="text-[10px] font-normal text-stone-400">{wd.dateStr.slice(5)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeStudents.map((student) => {
                  const schedule = getWeeklySchedule(student, new Date(selectedDate));
                  return (
                    <tr key={student.id} className="hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        <button
                          onClick={() => onOpenStudentModal(student.id)}
                          className="hover:text-emerald-700 transition-colors text-right"
                        >
                          {student.name}
                        </button>
                      </td>

                      <td className="px-2 py-3 text-center text-stone-700 font-semibold text-[11px]">
                        {student.completedRubCount >= 24 ? '3 أجزاء' : `${student.completedRubCount} ربعاً`}
                      </td>

                      {weekDays.map((wd) => {
                        const rec = getStudentDailyRevision(student.id, wd.dateStr);
                        const status = rec?.status;

                        return (
                          <td key={wd.dateStr} className="px-2 py-2 text-center">
                            <button
                              onClick={() => {
                                // Cycle status: none -> completed -> partial -> missed -> none
                                let nextStatus: RevisionStatus = 'completed';
                                if (status === 'completed') nextStatus = 'partial';
                                else if (status === 'partial') nextStatus = 'missed';
                                else if (status === 'missed') nextStatus = 'completed';

                                recordDailyRevision(student.id, wd.dateStr, nextStatus);
                              }}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                status === 'completed'
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : status === 'partial'
                                  ? 'bg-amber-500 text-white'
                                  : status === 'missed'
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                              }`}
                              title={status === 'completed' ? 'أتم المراجعة' : status === 'partial' ? 'جزئي' : status === 'missed' ? 'لم يراجع' : 'لم يدون'}
                            >
                              {status === 'completed' && <Check className="w-3.5 h-3.5" />}
                              {status === 'partial' && <AlertTriangle className="w-3.5 h-3.5" />}
                              {status === 'missed' && <X className="w-3.5 h-3.5" />}
                              {!status && '—'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
