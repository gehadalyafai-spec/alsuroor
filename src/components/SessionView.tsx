import React, { useState, useMemo, useEffect } from 'react';
import { useQuran } from '../context/QuranContext';
import { 
  getRequiredRecitationForSession, 
  getDailyRevisionAssignment, 
  getSessionWirdIntervalDays,
  SessionIntervalDay,
  ARABIC_DAYS,
  formatQuranProgress,
  formatRemainingQuranProgress,
  formatCurrentRubDetailed,
  generateWhatsAppMessage
} from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { Student, SessionGrade, RevisionStatus } from '../types/quran';
import { 
  Calendar, CheckCircle2, AlertCircle, Award, 
  ChevronRight, ChevronLeft, Search, Check, Sparkles, 
  Users, UserCheck, UserX, Clock, Star, BookOpen, Share2, 
  Filter, Edit3, CheckSquare, Layers, HelpCircle, Lock
} from 'lucide-react';

interface SessionViewProps {
  onOpenStudentModal: (studentId: string) => void;
}

export type AttendanceType = 'present' | 'absent' | 'excused' | 'unmarked';

export const SessionView: React.FC<SessionViewProps> = ({ onOpenStudentModal }) => {
  const { 
    students, 
    sessionRecords, 
    dailyRevisionRecords,
    selectedDate, 
    setSelectedDate, 
    recordSessionResult,
    recordDailyRevision,
    submissions,
    approveSubmission
  } = useQuran();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pending_recitation' | 'recited' | 'wird_done' | 'wird_pending' | 'absent'>('all');
  const [activeGradingStudent, setActiveGradingStudent] = useState<Student | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Per-student active viewed revision day inside the card (studentId -> dateStr)
  const [studentActiveWirdDate, setStudentActiveWirdDate] = useState<Record<string, string>>({});

  // Local attendance state cache per date
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceType>>(() => {
    try {
      const saved = localStorage.getItem(`quran_attendance_${selectedDate}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reload attendance when date changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`quran_attendance_${selectedDate}`);
      if (saved) {
        setAttendanceMap(JSON.parse(saved));
      } else {
        const inferred: Record<string, AttendanceType> = {};
        for (const r of sessionRecords) {
          if (r.date === selectedDate) {
            inferred[r.studentId] = r.grade === 'absent' ? 'absent' : 'present';
          }
        }
        setAttendanceMap(inferred);
      }
    } catch {
      setAttendanceMap({});
    }
  }, [selectedDate, sessionRecords]);

  // Date parsing
  const [y, m, d] = selectedDate.split('-').map(Number);
  const currentDateObj = new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
  const dayOfWeek = currentDateObj.getDay(); // 0 = Sunday, 3 = Wednesday
  const isCircleDay = dayOfWeek === 0 || dayOfWeek === 3;
  const isSunday = dayOfWeek === 0;
  const isWednesday = dayOfWeek === 3;
  const dayName = ARABIC_DAYS[dayOfWeek];

  const todayStr = new Date().toISOString().split('T')[0];

  const saveAttendance = (studentId: string, status: AttendanceType) => {
    // Attendance is strictly active on Sunday and Wednesday only
    if (!isCircleDay) return;

    const updated = { ...attendanceMap, [studentId]: status };
    setAttendanceMap(updated);
    try {
      localStorage.setItem(`quran_attendance_${selectedDate}`, JSON.stringify(updated));
    } catch {}

    if (status === 'absent') {
      recordSessionResult({
        studentId,
        date: selectedDate,
        grade: 'absent',
        mistakesCount: 0,
        hesitationsCount: 0,
        notes: 'غياب عن الجلسة',
        advanceToNext: false,
      });
      recordDailyRevision(studentId, selectedDate, 'missed', 'غياب');
    }
  };

  const handleMarkAllPresent = () => {
    // Attendance is strictly active on Sunday and Wednesday only
    if (!isCircleDay) return;

    const updated: Record<string, AttendanceType> = { ...attendanceMap };
    activeStudents.forEach(s => {
      updated[s.id] = 'present';
    });
    setAttendanceMap(updated);
    try {
      localStorage.setItem(`quran_attendance_${selectedDate}`, JSON.stringify(updated));
    } catch {}
  };

  // Session Interval Calculation (Sunday: Thu, Fri, Sat, Sun / Wednesday: Mon, Tue, Wed)
  const sessionInterval = useMemo(() => {
    return getSessionWirdIntervalDays(selectedDate);
  }, [selectedDate]);

  // Grading modal form state
  const [grade, setGrade] = useState<SessionGrade>('perfect');
  const [mistakes, setMistakes] = useState<number>(0);
  const [hesitations, setHesitations] = useState<number>(0);
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [advanceToNext, setAdvanceToNext] = useState<boolean>(true);

  // Quick navigation helpers
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const jumpToSunday = () => {
    const d = new Date(selectedDate);
    const dow = d.getDay();
    const diff = (7 - dow) % 7 || 7;
    d.setDate(d.getDate() + (dow === 0 ? 0 : diff));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const jumpToWednesday = () => {
    const d = new Date(selectedDate);
    const dow = d.getDay();
    const diff = (3 - dow + 7) % 7 || 7;
    d.setDate(d.getDate() + (dow === 3 ? 0 : diff));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const activeStudents = useMemo(() => {
    return students.filter(s => s.status === 'active');
  }, [students]);

  // Pre-index session records for selectedDate
  const currentDayRecordsMap = useMemo(() => {
    const map = new Map<string, (typeof sessionRecords)[0]>();
    for (const r of sessionRecords) {
      if (r.date === selectedDate) {
        map.set(r.studentId, r);
      }
    }
    return map;
  }, [sessionRecords, selectedDate]);

  // Map of daily revisions indexed by `${studentId}_${date}`
  const revisionsLookup = useMemo(() => {
    const map = new Map<string, (typeof dailyRevisionRecords)[0]>();
    for (const r of dailyRevisionRecords) {
      map.set(`${r.studentId}_${r.date}`, r);
    }
    return map;
  }, [dailyRevisionRecords]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return activeStudents.filter(s => {
      if (searchQuery.trim()) {
        const matchesName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPhone = s.phone.includes(searchQuery) || s.parentPhone.includes(searchQuery);
        if (!matchesName && !matchesPhone) return false;
      }

      const sessionRecord = currentDayRecordsMap.get(s.id);
      const attendance = attendanceMap[s.id] || (sessionRecord?.grade === 'absent' ? 'absent' : 'unmarked');

      // Check interval revisions
      let allIntervalDone = true;
      let anyIntervalDone = false;
      for (const day of sessionInterval.intervalDays) {
        const rev = revisionsLookup.get(`${s.id}_${day.date}`);
        if (rev?.status === 'completed') {
          anyIntervalDone = true;
        } else {
          allIntervalDone = false;
        }
      }

      if (filterMode === 'pending_recitation') {
        return !sessionRecord || sessionRecord.grade === 'needs_repeat';
      }
      if (filterMode === 'recited') {
        return !!sessionRecord && sessionRecord.grade !== 'absent';
      }
      if (filterMode === 'wird_done') {
        return allIntervalDone || anyIntervalDone;
      }
      if (filterMode === 'wird_pending') {
        return !allIntervalDone;
      }
      if (filterMode === 'absent') {
        return attendance === 'absent' || sessionRecord?.grade === 'absent';
      }

      return true;
    });
  }, [activeStudents, searchQuery, filterMode, currentDayRecordsMap, revisionsLookup, sessionInterval, attendanceMap]);

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

    if (attendanceMap[activeGradingStudent.id] !== 'present') {
      saveAttendance(activeGradingStudent.id, 'present');
    }

    setActiveGradingStudent(null);
  };

  // Quick 1-click grade without opening modal
  const handleQuickGrade = (student: Student, g: SessionGrade) => {
    recordSessionResult({
      studentId: student.id,
      date: selectedDate,
      grade: g,
      mistakesCount: g === 'perfect' ? 0 : g === 'very_good' ? 1 : 2,
      hesitationsCount: 0,
      notes: '',
      advanceToNext: g === 'perfect' || g === 'very_good',
    });
    saveAttendance(student.id, 'present');
  };

  // Quick 1-click revision update for a specific date
  const handleQuickWird = (studentId: string, targetDate: string, status: RevisionStatus, rating: number = 5) => {
    recordDailyRevision(studentId, targetDate, status, '', rating);
  };

  // Bulk mark ALL days in this session interval as completed for a student
  const handleMarkAllIntervalDaysCompleted = (studentId: string) => {
    sessionInterval.intervalDays.forEach(day => {
      recordDailyRevision(studentId, day.date, 'completed', 'اعتماد جماعي للفترة', 5);
    });
  };

  const handleCopyWhatsApp = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = generateWhatsAppMessage(student);
    navigator.clipboard.writeText(msg);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Aggregate counts
  const recitedCount = currentDayRecordsMap.size;
  const presentCount = useMemo(() => {
    return activeStudents.filter(s => attendanceMap[s.id] === 'present').length;
  }, [activeStudents, attendanceMap]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" id="session-unified-view-container">
      {/* Top Banner: Unified Session & Wird Dashboard */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="font-bold text-lg sm:text-xl font-['Amiri',serif]">
                بطاقة المعلم الموحدة (التسميع + الورد اليومي + التحضير)
              </h2>
              {isCircleDay ? (
                <span className="text-xs bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 font-semibold px-3 py-0.5 rounded-full">
                  جلسة حلقة معتمدة: يوم {dayName} ({selectedDate})
                </span>
              ) : (
                <span className="text-xs bg-amber-500/30 text-amber-200 border border-amber-400/40 font-semibold px-3 py-0.5 rounded-full">
                  متابعة يوم: {dayName} ({selectedDate})
                </span>
              )}
            </div>

            {/* Clear explanation of the interval rules */}
            <div className="bg-black/30 border border-emerald-500/30 rounded-2xl p-3 text-xs text-emerald-100 leading-relaxed max-w-3xl flex items-start gap-2.5 mt-2">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-200">
                  {sessionInterval.isSundaySession ? (
                    <span>
                      📅 <strong>فترة جلسة الأحد:</strong> تسميع الربع الجديد مع 3 أرباع ربط، ومتابعة الورد اليومي لـ <strong>4 أيام (الخميس، الجمعة، السبت، الأحد)</strong>.
                    </span>
                  ) : (
                    <span>
                      📅 <strong>فترة جلسة الأربعاء:</strong> تسميع الربع الجديد مع 3 أرباع ربط، ومتابعة الورد اليومي لـ <strong>3 أيام (الإثنين، الثلاثاء، الأربعاء)</strong>.
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-1">
                  يمكنك استعراض ورد كل يوم من أيام الفترة، ورصد الإنجاز بنقرة زر واحدة أو اعتماد كامل الفترة للطالب مباشرة.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Date Navigator */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-2 rounded-2xl border border-white/10">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                title="اليوم السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-bold px-3 py-2 border border-white/20 rounded-xl bg-black/60 text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />

              <button
                onClick={() => changeDateByDays(1)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                title="اليوم التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {selectedDate !== todayStr && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className="text-xs bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-2.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  اليوم
                </button>
              )}
            </div>

            {/* Quick Sunday / Wednesday Session Switchers */}
            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={jumpToSunday}
                className={`text-[11px] px-3 py-1 rounded-xl font-bold transition-all border cursor-pointer ${
                  sessionInterval.isSundaySession
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-200 border-white/10'
                }`}
              >
                🕌 جلسة الأحد (4 أيام ورد)
              </button>

              <button
                type="button"
                onClick={jumpToWednesday}
                className={`text-[11px] px-3 py-1 rounded-xl font-bold transition-all border cursor-pointer ${
                  sessionInterval.isWednesdaySession
                    ? 'bg-teal-600 text-white border-teal-400 shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-teal-200 border-white/10'
                }`}
              >
                🕌 جلسة الأربعاء (3 أيام ورد)
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats & Bulk Actions Bar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-emerald-200">
              <Users className="w-4 h-4 text-emerald-300" />
              <span>الطلاب النشطون: <strong className="text-white font-bold">{activeStudents.length}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-200">
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>الحاضرون: <strong className="text-white font-bold">{presentCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-200">
              <Award className="w-4 h-4 text-amber-300" />
              <span>تم تسميعهم اليوم: <strong className="text-white font-bold">{recitedCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-200">
              <Layers className="w-4 h-4 text-blue-300" />
              <span>أيام الورد المعروضة: <strong className="text-white font-bold">{sessionInterval.intervalDays.length} أيام ({sessionInterval.intervalDays.map(d => d.dayName).join('، ')})</strong></span>
            </div>
          </div>

          {isCircleDay ? (
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="self-start sm:self-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="تحضير جميع طلاب الحلقة كـ حاضرين لجلسة اليوم"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>تحضير جميع الطلاب كـ حاضرين</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] bg-stone-800/90 text-stone-300 border border-stone-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>التحضير نشط في يومي الأحد والأربعاء فقط</span>
              </span>
              <button
                type="button"
                onClick={jumpToSunday}
                className="text-[11px] font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl border border-emerald-400/40 transition-colors cursor-pointer"
                title="الانتقال لجلسة الأحد لتسجيل التحضير"
              >
                انتقال لجلسة الأحد 🕌
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث باسم الطالب أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            الكل ({activeStudents.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('pending_recitation')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'pending_recitation'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            بانتظار التسميع ({activeStudents.length - recitedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('recited')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'recited'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            تم التسميع ({recitedCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('wird_done')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'wird_done'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            أتموا الورد
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('absent')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterMode === 'absent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            الغائبون
          </button>
        </div>
      </div>

      {/* Unified Student Cards Grid */}
      <div className="space-y-6" id="unified-students-container">
        {filteredStudents.map((student, index) => {
          const plan = getRequiredRecitationForSession(student.currentRub);
          const newQuarter = getQuarterByNumber(plan.newRub);
          const sessionRecord = currentDayRecordsMap.get(student.id);
          const attendance = attendanceMap[student.id] || (sessionRecord?.grade === 'absent' ? 'absent' : 'unmarked');
          const isCopied = copiedId === student.id;

          // Which interval day is currently selected/active inside this student's card
          const currentViewingWirdDate = studentActiveWirdDate[student.id] || selectedDate;
          const activeIntervalDay = sessionInterval.intervalDays.find(d => d.date === currentViewingWirdDate) || sessionInterval.intervalDays[sessionInterval.intervalDays.length - 1];
          
          // Calculate assignment for the active viewing day
          const wirdAssignment = getDailyRevisionAssignment(
            student.currentRub, 
            activeIntervalDay.dayOfWeek, 
            activeIntervalDay.order - 1, 
            student
          );

          // Get record for active viewing day
          const activeDayRevisionRecord = revisionsLookup.get(`${student.id}_${activeIntervalDay.date}`);

          // Count completed interval days
          let completedIntervalDaysCount = 0;
          sessionInterval.intervalDays.forEach(day => {
            const r = revisionsLookup.get(`${student.id}_${day.date}`);
            if (r?.status === 'completed') completedIntervalDaysCount++;
          });

          // Check pending submissions for this student
          const pendingSessionSub = submissions.find(
            s => s.studentId === student.id && s.type === 'session' && s.status === 'pending' && s.date === selectedDate
          );
          const pendingWirdSub = submissions.find(
            s => s.studentId === student.id && s.type === 'daily_revision' && s.status === 'pending' && s.date === activeIntervalDay.date
          );

          return (
            <div
              key={student.id}
              id={`student-card-${student.id}`}
              className={`bg-white rounded-3xl border-2 transition-all shadow-md hover:shadow-xl flex flex-col relative overflow-hidden ring-1 ring-black/5 ${
                attendance === 'absent'
                  ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200'
                  : sessionRecord && completedIntervalDaysCount === sessionInterval.intervalDays.length
                  ? 'border-emerald-500 bg-emerald-50/15 ring-2 ring-emerald-300'
                  : 'border-stone-300 hover:border-emerald-600'
              }`}
            >
              {/* Top Accent Strip that clearly outlines the top boundary of each student's card */}
              <div className={`h-2 w-full ${
                attendance === 'absent'
                  ? 'bg-rose-500'
                  : sessionRecord && completedIntervalDaysCount === sessionInterval.intervalDays.length
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-stone-700'
              }`} />

              <div className="p-4 sm:p-5 pt-3.5 flex flex-col gap-4 flex-1">
                {/* Card Header: Student Profile Info + Attendance Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b-2 border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl ${student.avatarColor} text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0`}>
                        {student.name.charAt(0)}
                      </div>
                      <span className="absolute -bottom-1 -left-1 text-[9px] font-bold bg-stone-800 text-white px-1.5 py-0.2 rounded-md shadow-xs border border-white">
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onOpenStudentModal(student.id)}
                          className="font-bold text-stone-900 text-sm sm:text-base hover:text-emerald-700 transition-colors text-right flex items-center gap-1 cursor-pointer"
                        >
                          <span>{student.name}</span>
                          <ChevronLeft className="w-3.5 h-3.5 text-stone-400" />
                        </button>

                        <span className="text-[11px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-lg border border-stone-200">
                          {formatCurrentRubDetailed(student.currentRub)}
                        </span>

                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-lg border border-emerald-200">
                          المتبقي: {formatRemainingQuranProgress(student.currentRub).shortSummary}
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>كود الحساب: <strong className="font-mono text-stone-700">{student.accessCode}</strong></span>
                        <span>•</span>
                        <span>أنجز {student.completedRubCount} ربعاً</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Attendance Picker (تحضير الطالب) - نشط يومي الأحد والأربعاء فقط */}
                  {isCircleDay ? (
                    <div className="flex items-center gap-1.5 self-start sm:self-center bg-stone-100/90 p-1.5 rounded-2xl border-2 border-stone-200 shadow-2xs">
                      <span className="text-[11px] font-bold text-emerald-800 px-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>التحضير:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => saveAttendance(student.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          attendance === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-white/90'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>حاضر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => saveAttendance(student.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          attendance === 'absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-white/90'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>غائب</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => saveAttendance(student.id, 'excused')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          attendance === 'excused'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-white/90'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>مستأذن</span>
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 self-start sm:self-center bg-stone-100/90 py-1.5 px-3 rounded-2xl border-2 border-stone-200 text-stone-600 shadow-2xs" 
                      title="التحضير نشط في يومي الأحد والأربعاء فقط"
                    >
                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-medium">
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-[11px] font-semibold text-stone-600">التحضير متاح الأحد والأربعاء فقط</span>
                      </div>
                      {attendance !== 'unmarked' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          attendance === 'present' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          attendance === 'absent' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {attendance === 'present' ? 'مسجل حاضر' : attendance === 'absent' ? 'مسجل غائب' : 'مسجل مستأذن'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Body: Unified Dual Columns (التسميع + الورد اليومي للفترة) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* 1. RIGHT COLUMN: تسميع الحلقة (4 أرباع) */}
                <div className="bg-stone-50/80 rounded-2xl border border-stone-200/80 p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>تسميع جلسة يوم {sessionInterval.sessionDayName} ({plan.totalCount} أرباع):</span>
                      </div>

                      {/* Recitation Status Badge */}
                      {sessionRecord ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          sessionRecord.grade === 'perfect' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          sessionRecord.grade === 'very_good' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                          sessionRecord.grade === 'good' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          sessionRecord.grade === 'needs_repeat' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          'bg-stone-200 text-stone-700 border-stone-300'
                        }`}>
                          <Award className="w-3 h-3" />
                          {sessionRecord.grade === 'perfect' && '🌟 ممتاز (متقن)'}
                          {sessionRecord.grade === 'very_good' && '✨ جيد جداً'}
                          {sessionRecord.grade === 'good' && '⚠️ جيد'}
                          {sessionRecord.grade === 'needs_repeat' && '❌ يحتاج إعادة'}
                          {sessionRecord.grade === 'absent' && 'غائب'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                          بانتظار التسميع
                        </span>
                      )}
                    </div>

                    {/* Quarters breakdown */}
                    <div className="space-y-1.5">
                      {plan.linkingRubs.length > 0 && (
                        <div className="grid grid-cols-3 gap-1.5 text-center">
                          {plan.linkingRubs.map(r => {
                            const q = getQuarterByNumber(r);
                            return (
                              <div key={r} className="bg-white border border-stone-200 rounded-xl p-1.5">
                                <span className="text-[9px] text-stone-400 block">ربط</span>
                                <strong className="text-xs text-stone-800">ربع {r}</strong>
                                <span className="text-[10px] text-stone-600 truncate block">{q?.surahName}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* The Target NEW Quarter */}
                      <div className="bg-emerald-100/60 border-2 border-emerald-400 rounded-xl p-2 flex items-center justify-between gap-2 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {plan.newRub}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                              <span>الربع الجديد #{plan.newRub}</span>
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 rounded font-normal">جديد</span>
                            </div>
                            <div className="text-[11px] text-emerald-900 truncate max-w-[190px]">
                              سورة {newQuarter?.surahName}: "{newQuarter?.startVerseText.slice(0, 22)}..."
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-800 font-medium shrink-0">ص {newQuarter?.approxPage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Student Pending Session Recitation Approval */}
                  {pendingSessionSub && (
                    <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-amber-950 block">📩 أرسل الطالب طلب تسميع (الربع {pendingSessionSub.sessionData?.newRub})</span>
                        {pendingSessionSub.sessionData?.studentNotes && (
                          <span className="text-[11px] text-stone-600 block">«{pendingSessionSub.sessionData.studentNotes}»</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => approveSubmission(pendingSessionSub.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Tasmie' Action Bar */}
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickGrade(student, 'perfect')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          sessionRecord?.grade === 'perfect'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-emerald-900 border-stone-200'
                        }`}
                        title="ممتاز وترقية"
                      >
                        🌟 ممتاز
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickGrade(student, 'very_good')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          sessionRecord?.grade === 'very_good'
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white hover:bg-teal-50 text-teal-900 border-stone-200'
                        }`}
                        title="جيد جداً"
                      >
                        ✨ جيد جداً
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickGrade(student, 'needs_repeat')}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          sessionRecord?.grade === 'needs_repeat'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-stone-200'
                        }`}
                        title="إعادة نفس الربع"
                      >
                        🔁 إعادة
                      </button>
                    </div>

                    <button
                      type="button"
                      id={`record-detailed-btn-${student.id}`}
                      onClick={() => startGrading(student)}
                      className="text-xs font-bold text-stone-700 hover:text-emerald-700 bg-white hover:bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تفاصيل التسميع</span>
                    </button>
                  </div>
                </div>

                {/* 2. LEFT COLUMN: ورد المراجعة اليومي لأيام الفترة (الخميس والجمعة والسبت والأحد / الاثنين والثلاثاء والأربعاء) */}
                <div className="bg-teal-50/50 rounded-2xl border border-teal-200/80 p-3.5 sm:p-4 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Header & Overall Interval Progress */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-teal-950">
                        <CheckSquare className="w-4 h-4 text-teal-700" />
                        <span>ورد المراجعة ({sessionInterval.intervalDays.length} أيام):</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          completedIntervalDaysCount === sessionInterval.intervalDays.length
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : completedIntervalDaysCount > 0
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}>
                          إنجاز: {completedIntervalDaysCount} من {sessionInterval.intervalDays.length} أيام
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMarkAllIntervalDaysCompleted(student.id)}
                          className="text-[10px] font-bold bg-teal-600 hover:bg-teal-700 text-white px-2 py-0.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                          title="اعتماد كل أيام الفترة كـ تم الورد"
                        >
                          اعتماد الكل
                        </button>
                      </div>
                    </div>

                    {/* Interactive Multi-Day Interval Tabs Strip */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 mb-2.5">
                      {sessionInterval.intervalDays.map((day) => {
                        const r = revisionsLookup.get(`${student.id}_${day.date}`);
                        const isSelected = day.date === activeIntervalDay.date;
                        return (
                          <button
                            key={day.date}
                            type="button"
                            onClick={() => {
                              setStudentActiveWirdDate(prev => ({ ...prev, [student.id]: day.date }));
                            }}
                            className={`p-1.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-teal-700 text-white border-teal-800 shadow-xs ring-1 ring-teal-500'
                                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold">{day.dayName}</span>
                              <span className="text-[10px]">
                                {r?.status === 'completed' ? '✅' : r?.status === 'partial' ? '⚠️' : r?.status === 'missed' ? '❌' : '⏳'}
                              </span>
                            </div>
                            <div className={`text-[9px] truncate mt-0.5 ${isSelected ? 'text-teal-100' : 'text-stone-400'}`}>
                              {day.isSessionDay ? 'يوم الجلسة' : day.date.slice(5)}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Day Details Description Box */}
                    <div className="bg-white border border-teal-200 rounded-xl p-2.5 space-y-1 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800">
                        <span className="text-teal-900 flex items-center gap-1">
                          <span>ورد يوم {activeIntervalDay.dayName} ({activeIntervalDay.date}):</span>
                        </span>

                        {activeDayRevisionRecord ? (
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                            activeDayRevisionRecord.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            activeDayRevisionRecord.status === 'partial' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {activeDayRevisionRecord.status === 'completed' && '✅ تم'}
                            {activeDayRevisionRecord.status === 'partial' && '⚠️ جزئي'}
                            {activeDayRevisionRecord.status === 'missed' && '❌ لم يراجع'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">بانتظار التأكيد</span>
                        )}
                      </div>

                      <p className="text-xs text-stone-700 font-medium leading-relaxed">
                        {wirdAssignment.description}
                      </p>
                    </div>
                  </div>

                  {/* Student Pending Submission Approval for this day */}
                  {pendingWirdSub && (
                    <div className="bg-amber-100/90 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-amber-950 block">📖 أرسل الطالب تأكيد إنجاز ورد يوم {activeIntervalDay.dayName}</span>
                        {pendingWirdSub.revisionData?.notes && (
                          <span className="text-[11px] text-stone-600 block">«{pendingWirdSub.revisionData.notes}»</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => approveSubmission(pendingWirdSub.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد الورد</span>
                      </button>
                    </div>
                  )}

                  {/* 1-Click Quick Wird Status for the Active Day */}
                  <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickWird(student.id, activeIntervalDay.date, 'completed', 5)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          activeDayRevisionRecord?.status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border-stone-200'
                        }`}
                      >
                        ✅ تم ورد {activeIntervalDay.dayName}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickWird(student.id, activeIntervalDay.date, 'partial', 3)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          activeDayRevisionRecord?.status === 'partial'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white hover:bg-amber-50 text-amber-800 border-stone-200'
                        }`}
                      >
                        ⚠️ جزئي
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickWird(student.id, activeIntervalDay.date, 'missed', 1)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          activeDayRevisionRecord?.status === 'missed'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white hover:bg-rose-50 text-rose-800 border-stone-200'
                        }`}
                      >
                        ❌ لم يراجع
                      </button>
                    </div>

                    {/* Star rating for active day */}
                    {activeDayRevisionRecord?.status === 'completed' && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleQuickWird(student.id, activeIntervalDay.date, 'completed', star)}
                            className="text-amber-400 hover:text-amber-500 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${star <= (activeDayRevisionRecord.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Card Footer: Quick Actions (Profile, WhatsApp, Details) */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={(e) => handleCopyWhatsApp(student, e)}
                  className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-700 bg-stone-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                  title="نسخ جدول التسميع والورد للواتساب"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'تم النسخ!' : 'واتساب الطالب'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStudentModal(student.id)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>عرض الملف الكامل وتخصيص الورد</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          {students.length === 0 ? (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-stone-900">
                لا يوجد طلاب مضافون في الجلسة بعد
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                يمكنك البدء بإضافة طلاب الحلقة يدوياً عبر زر "طالب جديد" في الأعلى للبدء في تسميع أرباع الحفظ وتدوين الورد اليومي.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-800">لا توجد نتائج مطابقة للبحث أو التصفية</h3>
              <p className="text-xs text-stone-500">لم يتم العثور على طالب يطابق الشروط المحددة.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterMode('all'); }}
                className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
              >
                إعادة ضبط البحث والتصفية
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recitation & Grading Modal (For detailed recording) */}
      {activeGradingStudent && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-right">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  رصد وتقييم التسميع التفصيلي
                </span>
                <h3 className="font-bold text-base mt-1 flex items-center gap-1.5">
                  <span>الطالب:</span>
                  <span className="text-emerald-300">{activeGradingStudent.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setActiveGradingStudent(null)}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveGrading} className="p-5 space-y-4">
              {/* Recitation Info Summary */}
              {(() => {
                const plan = getRequiredRecitationForSession(activeGradingStudent.currentRub);
                const newQ = getQuarterByNumber(plan.newRub);
                return (
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="font-bold text-stone-800">
                      المطلوب تسميعه في هذه الجلسة ({plan.totalCount} أرباع):
                    </div>
                    <div className="space-y-1">
                      {plan.linkingRubs.map((rubNum) => {
                        const q = getQuarterByNumber(rubNum);
                        return (
                          <div key={rubNum} className="flex items-center justify-between text-stone-600 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
                            <span>🔗 ربط سابق: <strong>ربع {rubNum}</strong> - {q?.surahName}</span>
                            <span className="text-stone-400 text-[11px]">ص {q?.approxPage}</span>
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
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
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
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
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
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
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
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
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
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-stone-900">{mistakes}</span>
                    <button
                      type="button"
                      onClick={() => setMistakes(mistakes + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
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
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-base text-stone-900">{hesitations}</span>
                    <button
                      type="button"
                      onClick={() => setHesitations(hesitations + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-stone-300 font-bold hover:bg-stone-100 cursor-pointer"
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
                  className="text-xs font-bold text-stone-600 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
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
