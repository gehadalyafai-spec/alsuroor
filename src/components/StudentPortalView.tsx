import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { useAuth } from '../context/AuthContext';
import { getQuarterByNumber, getQuarterDetails } from '../data/quranData';
import { 
  getRequiredRecitationForSession, 
  getDailyRevisionAssignment, 
  formatRubsToJuzDescription, 
  formatQuranProgress,
  formatRemainingQuranProgress,
  formatCurrentRubDetailed,
  getCycleDaysBreakdown,
  getWeeklySchedule,
  getSessionWirdIntervalDays,
  calculateStudentStats,
  ARABIC_DAYS
} from '../utils/quranLogic';
import { exportStudentToExcel } from '../utils/exportReports';
import { RevisionStatus, SessionGrade } from '../types/quran';
import { useTheme } from '../context/ThemeContext';
import { 
  BookOpen, CheckCircle2, Clock, Calendar, FileText, 
  Download, Printer, Send, Award, AlertCircle, Sparkles, 
  ChevronRight, ChevronLeft, LogOut, ArrowRight, ShieldCheck, 
  Check, UserCheck, RefreshCw, MessageSquare, Sliders, Settings2, Save, Palette,
  CalendarDays, CheckSquare, Layers
} from 'lucide-react';
import { AppSettingsModal } from './AppSettingsModal';

interface StudentPortalViewProps {
  onLogout?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onLogout }) => {
  const { 
    students, 
    activeStudentId, 
    logoutStudent, 
    dailyRevisionRecords, 
    sessionRecords, 
    submissions,
    submitDailyRevision, 
    submitSessionRecitation,
    refreshStudentData,
    updateStudent,
    isLoadingCloud,
    syncStatus
  } = useQuran();
  const { user } = useAuth();
  const { headerPreset, colorPreset } = useTheme();

  const handleLogout = () => {
    logoutStudent();
    if (onLogout) {
      onLogout();
    }
  };

  const student = students.find(s => s.id === activeStudentId);

  // Sub-tabs in student portal
  const [activeTab, setActiveTab] = useState<'overview' | 'daily_revision' | 'session' | 'submissions'>('overview');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Custom Wird Modal / Form State
  const [showWirdCustomizer, setShowWirdCustomizer] = useState(false);
  const [customWirdType, setCustomWirdType] = useState<'auto' | 'custom_juz'>('auto');
  const [customStartJuz, setCustomStartJuz] = useState<number>(1);
  const [customEndJuz, setCustomEndJuz] = useState<number>(3);
  const [editCurrentRub, setEditCurrentRub] = useState<number>(1);
  const [isSavingWirdCustomization, setIsSavingWirdCustomization] = useState(false);
  const [wirdSaveSuccess, setWirdSaveSuccess] = useState(false);

  // Initialize wird customizer values when student loads or modal opens
  React.useEffect(() => {
    if (student) {
      setCustomWirdType(student.customWirdType || 'auto');
      if (student.customWirdJuzRange) {
        setCustomStartJuz(student.customWirdJuzRange[0]);
        setCustomEndJuz(student.customWirdJuzRange[1]);
      } else {
        const studentJuz = Math.max(1, Math.min(30, Math.ceil((student.currentRub || 1) / 8)));
        setCustomStartJuz(Math.max(1, studentJuz - 2));
        setCustomEndJuz(studentJuz);
      }
      setEditCurrentRub(student.currentRub || 1);
    }
  }, [student?.id, student?.currentRub, student?.customWirdType, student?.customWirdJuzRange]);

  const handleSaveWirdCustomization = async () => {
    if (!student) return;
    setIsSavingWirdCustomization(true);
    try {
      const partialUpdate: any = {
        currentRub: editCurrentRub,
        completedRubCount: Math.max(0, editCurrentRub - 1),
        customWirdType,
      };
      if (customWirdType === 'custom_juz') {
        const start = Math.min(customStartJuz, customEndJuz);
        const end = Math.max(customStartJuz, customEndJuz);
        partialUpdate.customWirdJuzRange = [start, end];
      } else {
        partialUpdate.customWirdJuzRange = null;
      }

      await updateStudent(student.id, partialUpdate);
      setWirdSaveSuccess(true);
      setTimeout(() => {
        setWirdSaveSuccess(false);
        setShowWirdCustomizer(false);
      }, 1500);
    } catch (e) {
      console.error('Error saving student wird:', e);
    } finally {
      setIsSavingWirdCustomization(false);
    }
  };

  // Daily revision form state
  const [revisionDate, setRevisionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [revStatus, setRevStatus] = useState<RevisionStatus>('completed');
  const [revNotes, setRevNotes] = useState<string>('');
  const [isSubmittingRev, setIsSubmittingRev] = useState(false);
  const [revSuccessMsg, setRevSuccessMsg] = useState(false);

  // Session recitation form state
  const [sessionDate, setSessionDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [sessionSuccessMsg, setSessionSuccessMsg] = useState(false);

  if (!student) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-stone-200 shadow-xl">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2">لم يتم تحديد حساب الطالب</h2>
          <p className="text-sm text-stone-600 mb-6">يرجى تسجيل الدخول برمز الطالب للوصول إلى بوابتك الخاصة.</p>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            العودة لصفحة تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  // Student specific data
  const qInfo = getQuarterDetails(student.currentRub);
  const currentQ = getQuarterByNumber(student.currentRub);
  const plan = getRequiredRecitationForSession(student.currentRub);
  
  const revDateObj = new Date(revisionDate + 'T00:00:00');
  const revDayOfWeek = isNaN(revDateObj.getDay()) ? 4 : revDateObj.getDay();
  const sessionDateObj = new Date(sessionDate + 'T00:00:00');
  const sessionDayOfWeek = isNaN(sessionDateObj.getDay()) ? 0 : sessionDateObj.getDay();
  const todayDateStr = new Date().toISOString().split('T')[0];
  const revPlan = getDailyRevisionAssignment(student.currentRub, revDayOfWeek, revDayOfWeek, student);

  const studentSessions = sessionRecords.filter(s => s.studentId === student.id);
  const studentRevisions = dailyRevisionRecords.filter(r => r.studentId === student.id);
  const studentSubmissions = submissions.filter(s => s.studentId === student.id);

  // Weekly Schedule & Session Intervals
  const weeklySchedule = getWeeklySchedule(student, revisionDate);
  const intervalInfo = getSessionWirdIntervalDays(revisionDate);
  const studentStats = calculateStudentStats(student);

  // Check if today's revision has a submission
  const todayRevSubmission = studentSubmissions.find(
    s => s.type === 'daily_revision' && s.date === revisionDate
  );

  // Check if session submission exists for selected date
  const todaySessionSubmission = studentSubmissions.find(
    s => s.type === 'session' && s.date === sessionDate
  );

  // Official approved revision record for selected date
  const officialRevision = studentRevisions.find(r => r.date === revisionDate);

  const handleSubmitDailyRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRev(true);
    try {
      await submitDailyRevision(student.id, revisionDate, {
        status: revStatus,
        rating: 5,
        notes: revNotes.trim(),
        assignedRubs: revPlan.assignedRubs,
      });
      setRevSuccessMsg(true);
      setTimeout(() => setRevSuccessMsg(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRev(false);
    }
  };

  const handleSubmitSessionRecitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSession(true);
    try {
      await submitSessionRecitation(student.id, sessionDate, {
        newRub: student.currentRub,
        recitedRubs: [student.currentRub, ...plan.linkingRubs],
        studentNotes: sessionNotes.trim(),
        advanceToNext: true,
      });
      setSessionSuccessMsg(true);
      setTimeout(() => setSessionSuccessMsg(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleExportExcel = () => {
    exportStudentToExcel(student, sessionRecords, dailyRevisionRecords);
  };

  const handlePrint = () => {
    window.print();
  };

  const gradeArabic: Record<string, string> = {
    perfect: 'ممتاز',
    very_good: 'جيد جداً',
    good: 'جيد',
    needs_repeat: 'يحتاج إعادة',
    absent: 'غائب',
  };

  const statusArabic: Record<string, string> = {
    completed: 'مكتمل',
    partial: 'جزئي',
    missed: 'لم يتم',
  };

  // Helper to jump to a specific session date
  const jumpToSession = (targetDay: 'sunday' | 'wednesday') => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 Sun, 3 Wed
    const d = new Date(today);
    if (targetDay === 'sunday') {
      const diff = currentDay === 0 ? 0 : 7 - currentDay;
      d.setDate(today.getDate() + diff);
    } else {
      const diff = currentDay <= 3 ? 3 - currentDay : 10 - currentDay;
      d.setDate(today.getDate() + diff);
    }
    const dateStr = d.toISOString().split('T')[0];
    setSessionDate(dateStr);
    setActiveTab('session');
  };

  // Helper to jump to interval in daily revision
  const jumpToInterval = (type: 'sunday_period' | 'wednesday_period' | 'today') => {
    const today = new Date();
    if (type === 'today') {
      setRevisionDate(today.toISOString().split('T')[0]);
      return;
    }
    const d = new Date(today);
    const day = today.getDay();
    if (type === 'sunday_period') {
      // jump to Thursday of this/upcoming Sunday period
      const daysToThursday = (4 - day + 7) % 7;
      d.setDate(today.getDate() + daysToThursday);
    } else {
      // jump to Monday
      const daysToMonday = (1 - day + 7) % 7;
      d.setDate(today.getDate() + daysToMonday);
    }
    setRevisionDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans pb-16" dir="rtl">
      {/* Student Portal Header */}
      <header className={`border-b sticky top-0 z-30 shadow-md transition-colors duration-200 ${headerPreset.headerClass}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${student.avatarColor || 'bg-emerald-700'} text-white font-bold flex items-center justify-center text-base shadow-inner`}>
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-bold text-base sm:text-lg ${headerPreset.textMainClass}`}>{student.name}</h1>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${headerPreset.badgeClass}`}>
                  بوابة الطالب
                </span>
              </div>
              <p className={`text-xs ${headerPreset.textSubClass}`}>
                كود الطالب: <span className="text-amber-500 font-mono font-semibold">{student.accessCode || '—'}</span> • حلقة جامع السرور
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${headerPreset.btnClass}`}
              title="تخصيص ألوان ومظهر التطبيق ووضع القراءة"
            >
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">المظهر</span>
            </button>

            <button
              onClick={refreshStudentData}
              disabled={isLoadingCloud}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 ${headerPreset.btnClass}`}
              title="تحديث البيانات فوراً من حساب المشرف"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isLoadingCloud ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">مزامنة مع المشرف</span>
            </button>

            <button
              onClick={handleLogout}
              id="student-logout-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${headerPreset.btnClass}`}
              title="الخروج أو العودة لحساب المشرف"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{user ? 'العودة للمشرف' : 'تسجيل خروج'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 py-2 border-t scrollbar-none transition-colors duration-200 ${headerPreset.subBarClass}`}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? `${colorPreset.primary} text-white shadow-xs`
                : headerPreset.tabInactiveClass
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>لوحة الإنجاز والتقرير</span>
          </button>

          <button
            onClick={() => setActiveTab('daily_revision')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'daily_revision'
                ? `${colorPreset.primary} text-white shadow-xs`
                : headerPreset.tabInactiveClass
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>وردي اليومي (تعديل وتسليم)</span>
            {todayRevSubmission && (
              <span className={`w-2 h-2 rounded-full ${
                todayRevSubmission.status === 'approved' ? 'bg-emerald-400' :
                todayRevSubmission.status === 'rejected' ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'session'
                ? `${colorPreset.primary} text-white shadow-xs`
                : headerPreset.tabInactiveClass
            }`}
          >
            <Award className="w-4 h-4" />
            <span>جلسة التسميع في الحلقة</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'submissions'
                ? `${colorPreset.primary} text-white shadow-xs`
                : headerPreset.tabInactiveClass
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل طلباتي واعتمادات المشرف ({studentSubmissions.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 1. OVERVIEW & REPORT TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Khatmah Progress Hero Card */}
            <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>مستوى الحفظ الحالي للطالب</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                      <span>المتبقي للختمة: {formatRemainingQuranProgress(student.currentRub).formatted}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
                    <span>{formatCurrentRubDetailed(student.currentRub)}</span>
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1.5 max-w-xl">
                    {currentQ?.startVerseText ? `«${currentQ.startVerseText}...»` : ''} • الجزء {qInfo?.juz || '—'} • الحزب {qInfo?.hizb || '—'} • الصفحة التقريبية {qInfo?.approxPage || '—'}
                  </p>
                </div>

                {/* Progress Percentage Gauge */}
                <div className="bg-emerald-950/70 border border-emerald-600/30 rounded-2xl p-4 text-center shrink-0 min-w-[190px]">
                  <div className="text-3xl sm:text-4xl font-black text-amber-300">
                    {((student.completedRubCount / 240) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-emerald-200 mt-1 font-medium">
                    نسبة إنجاز الختمة
                  </div>
                  <div className="text-[11px] text-amber-200/90 mt-0.5 font-semibold">
                    {formatRemainingQuranProgress(student.currentRub).shortSummary}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 mt-6 pt-5 border-t border-emerald-700/40">
                <div className="flex justify-between text-xs text-emerald-200 mb-2 font-medium">
                  <span>البداية (الفاتحة)</span>
                  <span className="text-amber-300 font-bold">موضعك الحالي: {formatQuranProgress(student.currentRub)} (الربع {student.currentRub})</span>
                  <span>الختام (سورة الناس - 30 جزءاً)</span>
                </div>
                <div className="w-full bg-emerald-950/80 rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.min(100, Math.max(2, (student.completedRubCount / 240) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-center">
                <div className="text-2xl font-bold text-emerald-700">{formatQuranProgress(student.completedRubCount || 0)}</div>
                <div className="text-xs text-stone-500 mt-1">المحفوظ المنجز ({student.completedRubCount} ربعاً)</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-center">
                <div className="text-base sm:text-lg font-bold text-teal-700">{formatRemainingQuranProgress(student.currentRub).shortSummary}</div>
                <div className="text-xs text-stone-500 mt-1">المتبقي من 30 جزءاً ({240 - student.completedRubCount} ربعاً)</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-center">
                <div className="text-2xl font-bold text-amber-700">{studentSessions.length}</div>
                <div className="text-xs text-stone-500 mt-1">جلسات تسميع معتمدة</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {studentRevisions.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-xs text-stone-500 mt-1">أيام الالتزام بالورد</div>
              </div>
            </div>

            {/* Weekly Schedule Roadmap Strip */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-emerald-600" />
                    <span>جدول وخريطة الأسبوع (الورد والتسميع)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    متابعة توزيع الورد اليومي وجلسات التسميع (الأحد والأربعاء) على مدار الأسبوع
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('daily_revision');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>فتح الورد اليومي</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('session');
                    }}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>المقرر المطلوب للتسميع</span>
                  </button>
                </div>
              </div>

              {/* 7 Days Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weeklySchedule.map((dayItem) => {
                  const isToday = dayItem.date === todayDateStr;
                  const sessionLabel = dayItem.dayOfWeek === 0 ? 'جلسة الأحد' : dayItem.dayOfWeek === 3 ? 'جلسة الأربعاء' : 'جلسة حلقة';
                  const revForDay = studentRevisions.find(r => r.date === dayItem.date);
                  const subForDay = studentSubmissions.find(s => s.type === 'daily_revision' && s.date === dayItem.date);
                  const isApproved = revForDay?.status === 'completed' || subForDay?.status === 'approved';
                  const isPending = subForDay?.status === 'pending';
                  const isPartial = revForDay?.status === 'partial';

                  return (
                    <div
                      key={dayItem.date}
                      onClick={() => {
                        setRevisionDate(dayItem.date);
                        setActiveTab('daily_revision');
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:shadow-md ${
                        isToday
                          ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : dayItem.isCircleDay
                          ? 'bg-stone-50/90 border-stone-300 hover:border-emerald-400'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold ${isToday ? 'text-emerald-900' : 'text-stone-800'}`}>
                          {dayItem.dayName}
                        </span>
                        {isToday && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">
                            اليوم
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-stone-500 font-mono mb-2">
                        {dayItem.date.slice(5)}
                      </div>

                      {/* Day Type Badge */}
                      <div className="mb-2">
                        {dayItem.isCircleDay ? (
                          <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-lg w-full truncate">
                            🕌 {sessionLabel}
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200 px-1.5 py-0.5 rounded-lg w-full truncate">
                            📖 ورد يومي
                          </span>
                        )}
                      </div>

                      {/* Status indicator */}
                      <div className="mt-1 pt-1.5 border-t border-stone-100">
                        {isApproved ? (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>معتمد</span>
                          </span>
                        ) : isPending ? (
                          <span className="text-[10px] font-bold text-amber-700 flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>بانتظار المشرف</span>
                          </span>
                        ) : isPartial ? (
                          <span className="text-[10px] font-bold text-amber-800 flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>جزئي</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">
                            لم يُسجل
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Recitation Highlight Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-300 font-bold">جلسة التسميع القادمة بالحلقة (الأحد أو الأربعاء)</div>
                    <div className="text-sm font-bold text-stone-100 mt-0.5">
                      الربع المستهدف: الربع {student.currentRub} ({currentQ?.surahName || '—'}) + 3 أرباع ربط سابقة
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => jumpToSession('sunday')}
                    className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold rounded-xl border border-stone-600 transition-colors cursor-pointer"
                  >
                    جلسة الأحد
                  </button>
                  <button
                    onClick={() => jumpToSession('wednesday')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl border border-emerald-600 transition-colors cursor-pointer"
                  >
                    جلسة الأربعاء
                  </button>
                </div>
              </div>
            </div>

            {/* Student's Comprehensive Performance Report */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>تقرير إنجاز الطالب الشامل والمفصل</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    سجل معتمد وموثق لكافة جلسات التسميع والأوراد المنجزة في حلقة جامع السرور
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportExcel}
                    id="student-export-excel-btn"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تصدير تقريري Excel</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    id="student-print-pdf-btn"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة التقرير PDF</span>
                  </button>
                </div>
              </div>

              {/* Sessions Table */}
              <div>
                <h4 className="font-bold text-sm text-stone-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>سجل جلسات التسميع المعتمدة في الحلقة ({studentSessions.length})</span>
                </h4>
                {studentSessions.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-2xl text-center text-xs text-stone-500 border border-stone-100">
                    لم تُسجل جلسات تسميع معتمدة بعد للطالب.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold">
                        <tr>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">الربع الجديد</th>
                          <th className="p-3">الأرباع المسردة</th>
                          <th className="p-3">التقدير</th>
                          <th className="p-3">الأخطاء</th>
                          <th className="p-3">الترددات</th>
                          <th className="p-3">النتيجة</th>
                          <th className="p-3">ملاحظات المشرف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {studentSessions.map((ses) => (
                          <tr key={ses.id} className="hover:bg-stone-50/70">
                            <td className="p-3 font-medium text-stone-800">{ses.date}</td>
                            <td className="p-3 font-bold text-emerald-700">الربع {ses.newRub}</td>
                            <td className="p-3 text-stone-600">{ses.recitedRubs.join('، ')}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold ${
                                ses.grade === 'perfect' ? 'bg-emerald-100 text-emerald-800' :
                                ses.grade === 'very_good' ? 'bg-blue-100 text-blue-800' :
                                ses.grade === 'good' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {gradeArabic[ses.grade] || ses.grade}
                              </span>
                            </td>
                            <td className="p-3 font-medium text-stone-700">{ses.mistakesCount}</td>
                            <td className="p-3 font-medium text-stone-700">{ses.hesitationsCount}</td>
                            <td className="p-3">
                              {ses.advancedToNext ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>اجتاز</span>
                                </span>
                              ) : (
                                <span className="text-amber-700 font-medium">إعادة وتثبيت</span>
                              )}
                            </td>
                            <td className="p-3 text-stone-600 max-w-xs truncate">{ses.teacherNotes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Revisions Table */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>سجل الورد اليومي المعتمد ({studentRevisions.length})</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">
                    أوراد المراجعة اليومية المعتمدة رسمياً في حلقة جامع السرور
                  </span>
                </div>
                {studentRevisions.length === 0 ? (
                  <div className="p-8 bg-stone-50/80 rounded-2xl text-center text-xs text-stone-500 border border-stone-200/70">
                    لم يُسجل ورد يومي معتمد بعد للطالب.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-200/80 rounded-2xl shadow-2xs">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-50/90 text-stone-700 border-b border-stone-200 font-bold">
                        <tr>
                          <th className="p-3.5">التاريخ</th>
                          <th className="p-3.5">الأرباع المقررة ومقدار الورد</th>
                          <th className="p-3.5 text-center">حالة الإنجاز</th>
                          <th className="p-3.5">الملاحظات والتوجيهات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 bg-white">
                        {studentRevisions.map((rev) => (
                          <tr key={rev.id} className="hover:bg-emerald-50/30 transition-colors">
                            <td className="p-3.5 font-semibold text-stone-900 font-mono whitespace-nowrap">
                              {rev.date}
                            </td>
                            <td className="p-3.5 text-stone-800 font-medium">
                              <span className="inline-block bg-emerald-50/80 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-semibold">
                                {formatRubsToJuzDescription(rev.assignedRubs).fullDescription}
                              </span>
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                rev.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : rev.status === 'partial'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}>
                                {rev.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                {rev.status === 'partial' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                                {rev.status === 'missed' && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                                <span>{statusArabic[rev.status] || rev.status}</span>
                              </span>
                            </td>
                            <td className="p-3.5 text-stone-600 max-w-sm">
                              {rev.notes ? (
                                <span className="text-stone-700 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60 inline-block">
                                  {rev.notes}
                                </span>
                              ) : (
                                <span className="text-stone-400 font-normal">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. DAILY REVISION (EDIT & SUBMIT) TAB */}
        {activeTab === 'daily_revision' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Context Header */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>تعديل وتسليم الورد اليومي حسب أيام الأسبوع</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    اختر اليوم من الشريط أدناه لعرض ورده وتسجيل إنجازك وإرساله لمشرف الحلقة للاعتماد
                  </p>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">تاريخ الورد:</span>
                  <input
                    type="date"
                    value={revisionDate}
                    onChange={(e) => setRevisionDate(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 cursor-pointer focus:ring-2 focus:ring-emerald-600 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Weekly Days Selection Strip with Fast Interval Switchers */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>شريط أيام الأسبوع التفاعلي:</span>
                </h3>

                {/* Session Period Quick Jumpers */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => jumpToInterval('sunday_period')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      [4, 5, 6, 0].includes(revDayOfWeek)
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🕌 فترة جلسة الأحد (الخميس - الأحد)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToInterval('wednesday_period')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      [1, 2, 3].includes(revDayOfWeek)
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🕌 فترة جلسة الأربعاء (الإثنين - الأربعاء)
                  </button>
                  <button
                    type="button"
                    onClick={() => jumpToInterval('today')}
                    className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                  >
                    📍 اليوم
                  </button>
                </div>
              </div>

              {/* 7 Days Grid Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {weeklySchedule.map((dayItem) => {
                  const isToday = dayItem.date === todayDateStr;
                  const sessionLabel = dayItem.dayOfWeek === 0 ? 'جلسة الأحد' : dayItem.dayOfWeek === 3 ? 'جلسة الأربعاء' : 'جلسة حلقة';
                  const isSelected = revisionDate === dayItem.date;
                  const revForDay = studentRevisions.find(r => r.date === dayItem.date);
                  const subForDay = studentSubmissions.find(s => s.type === 'daily_revision' && s.date === dayItem.date);
                  const isApproved = revForDay?.status === 'completed' || subForDay?.status === 'approved';
                  const isPending = subForDay?.status === 'pending';

                  return (
                    <button
                      key={dayItem.date}
                      type="button"
                      onClick={() => setRevisionDate(dayItem.date)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 ring-4 ring-emerald-600/20 shadow-md transform -translate-y-0.5'
                          : 'bg-stone-50/80 text-stone-800 border-stone-200 hover:bg-stone-100 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                          {dayItem.dayName}
                        </span>
                        {isToday && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                          }`}>
                            اليوم
                          </span>
                        )}
                      </div>

                      <div className={`text-[10px] font-mono mb-2 ${isSelected ? 'text-emerald-100' : 'text-stone-500'}`}>
                        {dayItem.date.slice(5)}
                      </div>

                      <div className="text-[10px] mb-1 truncate">
                        {dayItem.isCircleDay ? (
                          <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                            isSelected ? 'bg-emerald-700 text-amber-200' : 'bg-amber-100 text-amber-900'
                          }`}>
                            🕌 {sessionLabel}
                          </span>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-emerald-700/60 text-emerald-100' : 'bg-stone-200/70 text-stone-600'
                          }`}>
                            📖 ورد
                          </span>
                        )}
                      </div>

                      {/* Status indicator dot */}
                      <div className="mt-2 pt-1 border-t border-current/10 flex items-center justify-center gap-1 text-[10px]">
                        {isApproved ? (
                          <span className={isSelected ? 'text-emerald-200 font-bold' : 'text-emerald-700 font-bold'}>
                            ✅ معتمد
                          </span>
                        ) : isPending ? (
                          <span className={isSelected ? 'text-amber-200 font-bold' : 'text-amber-700 font-bold'}>
                            ⏳ بانتظار
                          </span>
                        ) : (
                          <span className={isSelected ? 'text-emerald-200/70' : 'text-stone-400'}>
                            ⚪ لم يُسجل
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Submission Status Banner */}
            {todayRevSubmission && (
              <div className={`rounded-2xl p-5 border flex items-start gap-3.5 ${
                todayRevSubmission.status === 'approved' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : todayRevSubmission.status === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {todayRevSubmission.status === 'approved' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : todayRevSubmission.status === 'rejected' ? (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm">
                      {todayRevSubmission.status === 'approved' && '✅ تم اعتماد وردك اليومي رسمياً من المشرف!'}
                      {todayRevSubmission.status === 'pending' && '⏳ تم إرسال الورد بانتظار مراجعة واعتماد المشرف'}
                      {todayRevSubmission.status === 'rejected' && '❌ طلب المشرف إعادة مراجعة الورد'}
                    </h4>
                    <span className="text-[11px] opacity-75">
                      {new Date(todayRevSubmission.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {todayRevSubmission.supervisorFeedback && (
                    <div className="mt-2 text-xs bg-white/70 p-2.5 rounded-xl border border-current/10 font-medium">
                      <span className="font-bold">ملاحظة المشرف: </span>
                      <span>{todayRevSubmission.supervisorFeedback}</span>
                    </div>
                  )}

                  {todayRevSubmission.status === 'pending' && (
                    <p className="text-xs mt-1 opacity-85">
                      يمكنك تعديل البيانات أدناه وإعادة الإرسال في أي وقت قبل اعتماد المشرف.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Revision Quarters Details & Wird Customization Button */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>الورد المقرر لتاريخ {revisionDate}:</span>
                  </h3>
                  <div className="text-xs text-emerald-800 mt-1">
                    {student.customWirdType === 'custom_juz' && student.customWirdJuzRange ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg font-semibold text-[11px] border border-amber-300">
                        <Sliders className="w-3 h-3 text-amber-700" />
                        <span>خطة مخصصة: الأجزاء ({student.customWirdJuzRange[0]} إلى {student.customWirdJuzRange[1]})</span>
                      </span>
                    ) : (
                      <span className="text-stone-600 text-xs">
                        وفق خطة الحلقة التلقائية (4 أرباع يومياً متقدمة على موضع الحفظ)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowWirdCustomizer(!showWirdCustomizer)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{showWirdCustomizer ? 'إخفاء خيارات التخصيص' : 'تعديل وتخصيص الورد / موضع الحفظ'}</span>
                  </button>

                  <span className="bg-emerald-100/90 text-emerald-950 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-300 shadow-2xs self-start sm:self-auto">
                    {revPlan.description}
                  </span>
                </div>
              </div>

              {/* Collapsible Wird & Memorization Customizer Form */}
              {showWirdCustomizer && (
                <div className="mt-4 p-5 bg-white rounded-2xl border border-emerald-300 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-sm text-stone-900">تخصيص موضع الحفظ وخطة الورد اليومي</h4>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
                      يتم حفظ ومزامنة التعديل فوراً مع حساب المشرف وسجل السحاب
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Memorization Position (currentRub) */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        موضع الحفظ الحالي (الربع الجديد المستهدف):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={240}
                          value={editCurrentRub}
                          onChange={(e) => setEditCurrentRub(Math.max(1, Math.min(240, Number(e.target.value) || 1)))}
                          className="w-24 px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold text-emerald-800 text-center outline-hidden focus:ring-2 focus:ring-emerald-600"
                        />
                        <div className="text-xs text-stone-600">
                          {(() => {
                            const info = getQuarterDetails(editCurrentRub);
                            return info ? `سورة ${info.surahName} • الجزء ${info.juz}` : '';
                          })()}
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-2">
                        تعديل هذا الرقم يحدّث فوراً موقع الطالب في جدول التسميع وإحصائيات الختمة.
                      </p>
                    </div>

                    {/* 2. Daily Revision Plan Mode */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        نوع خطة الورد اليومي:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-medium text-stone-800 cursor-pointer">
                          <input
                            type="radio"
                            name="wirdType"
                            checked={customWirdType === 'auto'}
                            onChange={() => setCustomWirdType('auto')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>خطة الحلقة التلقائية (الأرباع السابقة لموضع الحفظ)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-stone-800 cursor-pointer">
                          <input
                            type="radio"
                            name="wirdType"
                            checked={customWirdType === 'custom_juz'}
                            onChange={() => setCustomWirdType('custom_juz')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>خطة مخصصة بالأجزاء (تحديد نطاق أجزاء للمراجعة)</span>
                        </label>
                      </div>

                      {customWirdType === 'custom_juz' && (
                        <div className="mt-3 pt-3 border-t border-stone-200 flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-600">من الجزء:</span>
                            <select
                              value={customStartJuz}
                              onChange={(e) => setCustomStartJuz(Number(e.target.value))}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800 cursor-pointer"
                            >
                              {Array.from({ length: 30 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>الجزء {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-stone-600">إلى الجزء:</span>
                            <select
                              value={customEndJuz}
                              onChange={(e) => setCustomEndJuz(Number(e.target.value))}
                              className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-800 cursor-pointer"
                            >
                              {Array.from({ length: 30 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>الجزء {i + 1}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    {wirdSaveSuccess && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>تم حفظ وتحديث ومزامنة الورد وموضع الحفظ فوراً!</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveWirdCustomization}
                      disabled={isSavingWirdCustomization}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isSavingWirdCustomization ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>حفظ ومزامنة التعديلات الآن</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 mt-3">
                {revPlan.assignedRubs.map((rubNum) => {
                  const rInfo = getQuarterDetails(rubNum);
                  return (
                    <div key={rubNum} className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-xs text-center sm:text-right">
                      <div className="text-xs font-bold text-emerald-900">الربع {rubNum}</div>
                      <div className="text-[11px] text-stone-600 mt-0.5 truncate">
                        {rInfo ? `سورة ${rInfo.surahName}` : ''}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        ص {rInfo?.approxPage || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Khatmah Revision Cycle & 7-Day Schedule Accordion */}
              <div className="mt-4 pt-4 border-t border-emerald-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-600 text-white">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="font-bold text-xs text-emerald-950">
                      دورة ختمة الورد الكاملة بمعدل 3 أجزاء يومياً (24 ربعاً):
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 font-semibold self-start sm:self-auto">
                    {(() => {
                      const cycle = getCycleDaysBreakdown(student.currentRub);
                      return `إجمالي دورة الورد: ${cycle.length} ${cycle.length === 1 ? 'يوم واحد' : cycle.length === 2 ? 'يومان' : `${cycle.length} أيام`}`;
                    })()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {getCycleDaysBreakdown(student.currentRub).map((cDay) => (
                    <div 
                      key={cDay.dayNumber}
                      className={`p-3 rounded-2xl border transition-all ${
                        cDay.isRemainder
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                          : 'bg-white border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold">اليوم {cDay.dayNumber}</span>
                        {cDay.isRemainder ? (
                          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                            تكرار ×{cDay.repeatCount}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            3 أجزاء
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-stone-900 line-clamp-1">
                        {cDay.shortLabel}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 leading-tight">
                        {cDay.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Edit & Submit Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h3 className="font-bold text-base text-stone-800 mb-5">
                تعديل حالة الورد وإرسالها للمشرف
              </h3>

              <form onSubmit={handleSubmitDailyRevision} className="space-y-6">
                {/* 1. Completion Status Radio Options */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2.5">
                    1. حالة إنجاز الورد:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setRevStatus('completed')}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        revStatus === 'completed'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/30'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="font-bold text-sm text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>أنجزت الورد كاملاً</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        راجعت كافة الأرباع الـ 4 المقررة بإتقان.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRevStatus('partial')}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        revStatus === 'partial'
                          ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/30'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="font-bold text-sm text-amber-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>إنجاز جزئي</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        أنجزت بعض الأرباع وسأكمل الباقي.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRevStatus('missed')}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                        revStatus === 'missed'
                          ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/30'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="font-bold text-sm text-rose-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>لم أتمكن اليوم</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        تعذر قراءة الورد اليوم لعذر.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Student Notes for Supervisor */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    2. ملاحظاتي للمشرف أو أسئلتي في الورد (اختياري):
                  </label>
                  <textarea
                    value={revNotes}
                    onChange={(e) => setRevNotes(e.target.value)}
                    placeholder="مثال: راجعت الورد المقرّر بإتقان، وراجعت الأرباع مع والدي..."
                    rows={3}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-hidden transition-all"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-stone-500">
                    يتم إرسال هذا التعديل مباشرة إلى لوحة المشرف لاعتماده وتحديث سجلك الرسمي.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingRev}
                    id="student-submit-revision-btn"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingRev ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>
                      {todayRevSubmission ? 'تحديث وإعادة إرسال الورد للمشرف' : 'إرسال الورد للمشرف للاعتماد'}
                    </span>
                  </button>
                </div>

                {revSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم إرسال الورد اليومي بنجاح! سيظهر للمشرف لمراجعته واعتماده.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* 3. CIRCLE SESSION RECITATION TAB */}
        {activeTab === 'session' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <Award className="w-6 h-6 text-emerald-600" />
                    <span>جلسة التسميع في الحلقة (الأحد والأربعاء)</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    المقرر المطلوب سرده أمام الشيخ، وتسجيل إنجازك لجلسات الأحد والأربعاء
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">تاريخ الجلسة:</span>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 cursor-pointer focus:ring-2 focus:ring-emerald-600 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Session Day Quick Selector Bar (Sunday & Wednesday) */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-sm text-stone-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>تحديد جلسة التسميع للأسبوع الحالي:</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => jumpToSession('sunday')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      sessionDayOfWeek === 0
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                    }`}
                  >
                    <span>🕌 جلسة الأحد</span>
                    <span className="text-[11px] opacity-80">(يغطي ورد الخميس-السبت)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => jumpToSession('wednesday')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                      sessionDayOfWeek === 3
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                    }`}
                  >
                    <span>🕌 جلسة الأربعاء</span>
                    <span className="text-[11px] opacity-80">(يغطي ورد الإثنين-الثلاثاء)</span>
                  </button>
                </div>
              </div>

              {/* Day info Banner */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-800">
                    {sessionDayOfWeek === 0
                      ? '🌟 الجلسة المحددة: يوم الأحد'
                      : sessionDayOfWeek === 3
                      ? '🌟 الجلسة المحددة: يوم الأربعاء'
                      : 'ℹ️ التاريخ المحدد ليس يوم حلقة رسمي (الأحد والأربعاء)'}
                  </span>
                  <span className="text-stone-500 font-mono">({sessionDate})</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  جلسات التحفيظ والتسميع الرسمية المعتمدة تكون يومي الأحد والأربعاء أسبوعياً
                </div>
              </div>
            </div>

            {/* Target Quarters Required For Today's Session */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full text-xs text-emerald-200 mb-3 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>المقرر المطلوب تسميعه في حلقة اليوم</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* New Rub */}
                <div className="bg-stone-800/80 p-5 rounded-2xl border border-emerald-500/40">
                  <div className="text-xs text-emerald-400 font-bold mb-1">1. الربع الجديد المستهدف:</div>
                  <div className="text-xl font-black text-white">
                    الربع {student.currentRub}: {currentQ?.surahName}
                  </div>
                  <div className="text-xs text-stone-300 mt-1">
                    «{currentQ?.startVerseText || ''}...» • الجزء {qInfo?.juz} • الحزب {qInfo?.hizb}
                  </div>
                </div>

                {/* Linking Rubs */}
                <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700">
                  <div className="text-xs text-amber-400 font-bold mb-1">2. أرباع الربط الثلاثة السابقة:</div>
                  <div className="text-sm font-bold text-stone-200">
                    {plan.linkingRubs.length > 0 ? (
                      <span>الأرباع: {plan.linkingRubs.join('، ')}</span>
                    ) : (
                      <span>لا توجد أرباع ربط (في بداية المصحف)</span>
                    )}
                  </div>
                  <div className="text-xs text-stone-400 mt-1">
                    إجمالي المطلوب سرده في الجلسة: {plan.linkingRubs.length + 1} أرباع
                  </div>
                </div>
              </div>
            </div>

            {/* Session Submission Status Banner */}
            {todaySessionSubmission && (
              <div className={`rounded-2xl p-5 border flex items-start gap-3.5 ${
                todaySessionSubmission.status === 'approved' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : todaySessionSubmission.status === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {todaySessionSubmission.status === 'approved' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : todaySessionSubmission.status === 'rejected' ? (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm">
                      {todaySessionSubmission.status === 'approved' && '✅ تم اعتماد جلسة التسميع بنجاح ونقلك للربع التالي!'}
                      {todaySessionSubmission.status === 'pending' && '⏳ تم إرسال جلسة التسميع بانتظار اعتماد المشرف'}
                      {todaySessionSubmission.status === 'rejected' && '❌ طلب المشرف إعادة التسميع'}
                    </h4>
                    <span className="text-[11px] opacity-75">
                      {new Date(todaySessionSubmission.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {todaySessionSubmission.supervisorFeedback && (
                    <div className="mt-2 text-xs bg-white/70 p-2.5 rounded-xl border border-current/10 font-medium">
                      <span className="font-bold">ملاحظة المشرف: </span>
                      <span>{todaySessionSubmission.supervisorFeedback}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session Recitation Submission Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <h3 className="font-bold text-base text-stone-800 mb-4">
                إرسال جلسة التسميع لمراجعة المشرف
              </h3>

              <form onSubmit={handleSubmitSessionRecitation} className="space-y-5">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                  <div>
                    <span className="font-bold text-stone-800">الربع المسرد: </span>
                    <span>الربع {student.currentRub} ({currentQ?.surahName})</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">أرباع الربط: </span>
                    <span>{plan.linkingRubs.join('، ') || 'لا يوجد'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    ملاحظاتي على التسميع (أخطاء، ترددات، ما تم تحسينه):
                  </label>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="مثال: أتقنت الربع الجديد بدون أخطاء، وكررت ربع الربط الثاني مرتين..."
                    rows={3}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-hidden transition-all"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-stone-500">
                    عند موافقة المشرف، يتم اعتماد الجلسة في سجلك الرسمي والانتقال التلقائي للربع التالي.
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingSession}
                    id="student-submit-session-btn"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingSession ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>إرسال التسميع لاعتماد المشرف</span>
                  </button>
                </div>

                {sessionSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم إرسال جلسة التسميع بنجاح! سيتم إشعار المشرف لمراجعتها واعتمادها.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* 4. SUBMISSIONS LOG TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-600" />
                <span>سجل طلباتي واعتمادات المشرف</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                كافة التعديلات والأوراد وجلسات التسميع التي تم إرسالها وحالة موافقة المشرف عليها
              </p>
            </div>

            {studentSubmissions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
                <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-stone-700">لا توجد طلبات سابقة</h3>
                <p className="text-xs text-stone-500 mt-1">
                  عند إرسال وردك اليومي أو جلسة التسميع، ستظهر حالتها وملاحظات المشرف هنا.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentSubmissions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-stone-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.type === 'daily_revision' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {sub.type === 'daily_revision' ? '📿 ورد يومي' : '📖 جلسة تسميع'}
                        </span>
                        <span className="font-bold text-sm text-stone-800">
                          تاريخ: {sub.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          sub.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : sub.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sub.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {sub.status === 'pending' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                          {sub.status === 'rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>
                            {sub.status === 'approved' && 'معتمد ومحدث ✅'}
                            {sub.status === 'pending' && 'قيد المراجعة ⏳'}
                            {sub.status === 'rejected' && 'مرفوض ❌'}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-stone-600 space-y-1.5">
                      {sub.revisionData && (
                        <div>
                          <span className="font-semibold text-stone-700">حالة الورد المرسلة: </span>
                          <span>{statusArabic[sub.revisionData.status] || sub.revisionData.status}</span>
                        </div>
                      )}

                      {sub.sessionData && (
                        <div>
                          <span className="font-semibold text-stone-700">الربع المسرد: </span>
                          <span>الربع {sub.sessionData.newRub}</span>
                          {sub.sessionData.recitedRubs && (
                            <span className="mr-2">(الأرباع: {sub.sessionData.recitedRubs.join('، ')})</span>
                          )}
                        </div>
                      )}

                      {sub.revisionData?.notes && (
                        <div>
                          <span className="font-semibold text-stone-700">ملاحظتك: </span>
                          <span>{sub.revisionData.notes}</span>
                        </div>
                      )}

                      {sub.sessionData?.studentNotes && (
                        <div>
                          <span className="font-semibold text-stone-700">ملاحظتك: </span>
                          <span>{sub.sessionData.studentNotes}</span>
                        </div>
                      )}

                      {sub.supervisorFeedback && (
                        <div className="mt-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-stone-800 font-medium">
                          <span className="font-bold text-emerald-800">ملاحظة المشرف: </span>
                          <span>{sub.supervisorFeedback}</span>
                          {sub.reviewedAt && (
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              (تم الاعتماد في: {new Date(sub.reviewedAt).toLocaleString('ar-SA')})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* App Appearance & Theme Settings Modal */}
      <AppSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};
