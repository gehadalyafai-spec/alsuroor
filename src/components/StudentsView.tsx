import React, { useState, useMemo } from 'react';
import { useQuran } from '../context/QuranContext';
import { Student } from '../types/quran';
import { 
  getRequiredRecitationForSession, 
  calculateStudentStats, 
  generateWhatsAppMessage, 
  formatQuranProgress,
  getDailyRevisionAssignment 
} from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { 
  Users, Search, UserPlus, Phone, Share2, 
  ChevronLeft, BookOpen, CheckCircle, Calendar, MessageSquare, Copy, Check, Trash2, AlertTriangle, X,
  KeyRound, SlidersHorizontal, Sparkles
} from 'lucide-react';

interface StudentsViewProps {
  onOpenAddModal: () => void;
  onOpenStudentModal: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ onOpenAddModal, onOpenStudentModal }) => {
  const { students, deleteStudent } = useQuran();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students.filter(s => {
      if (!search.trim()) return true;
      return s.name.toLowerCase().includes(search.toLowerCase()) ||
             s.phone.includes(search) ||
             s.parentPhone.includes(search);
    });
  }, [students, search]);

  const handleCopyWhatsApp = (student: typeof students[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = generateWhatsAppMessage(student);
    navigator.clipboard.writeText(msg);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const todayDay = new Date().getDay(); // 0 to 6

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6" id="students-view-container">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-stone-900 flex items-center gap-2 font-['Amiri',serif]">
            <Users className="w-5 h-5 text-emerald-700" />
            <span>سجل طلاب الحلقة ({students.length})</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            متابعة مستويات الحفظ، الورد اليومي، وتوليد بطاقات المتابعة الفردية
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو رقم الهاتف..."
          className="w-full pr-9 pl-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const stats = calculateStudentStats(student);
          const plan = getRequiredRecitationForSession(student.currentRub);
          const newQ = getQuarterByNumber(plan.newRub);
          const currentProgressText = formatQuranProgress(student.currentRub);
          const todayWird = getDailyRevisionAssignment(student.currentRub, todayDay, 0, student);
          const isCopied = copiedId === student.id;

          return (
            <div
              key={student.id}
              onClick={() => onOpenStudentModal(student.id)}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-300 p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${student.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-700">
                          {student.name}
                        </h3>
                        {student.customWirdType && student.customWirdType !== 'auto' && (
                          <span 
                            className="text-[9px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5"
                            title="ورد مخصص"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>ورد مخصص</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        انضم: {student.joinDate}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    الجزء {stats.currentJuz}
                  </span>
                </div>

                {/* Level Details */}
                <div className="py-3 space-y-2 text-xs">
                  {/* Progress in Quran formatted as Juz and Rubs (e.g. 12 جزء و 3 أرباع / 12 جزء كامل) */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-1">
                    <div className="flex justify-between items-center text-[11px] text-emerald-900 font-semibold">
                      <span>التقدم في المصحف الشريف:</span>
                      <span className="font-mono text-emerald-800">{stats.progressPercent}%</span>
                    </div>
                    <div className="font-bold text-xs text-emerald-950 flex items-center justify-between">
                      <span className="font-['Amiri',serif] text-sm text-emerald-900">{currentProgressText}</span>
                      <span className="text-[10px] text-emerald-700 font-normal">
                        (الربع {student.currentRub} - {newQ?.surahName})
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.max(2, stats.progressPercent)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Active Daily Wird (الورد اليومي الحالي) */}
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
                      <span>الورد اليومي للمراجعة ({todayWird.isCustomWird ? 'مخصص' : 'تلقائي'}):</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                        {todayWird.shortLabel}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-stone-800 leading-snug">
                      {todayWird.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyWhatsApp(student, e)}
                    className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-emerald-700 bg-stone-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-stone-200 transition-colors"
                    title="نسخ جدول التسميع والمراجعة للواتساب"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'تم النسخ!' : 'واتساب'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStudentToDelete(student);
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                    title="حذف الطالب من الحلقة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5">
                  <span>فتح الملف والورد</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when no students exist or search has no match */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          {students.length === 0 ? (
            <>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  لا يوجد طلاب مضافون في الحلقة بعد
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  تم تفريغ كافة البيانات الوهمية. أصبحت الحلقة جاهزة لإضافة الطلاب يدوياً مع إمكانية تحديد الربع ومقدار الحفظ السابق لكل طالب بسهولة.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة أول طالب في الحلقة</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-stone-800">
                لا توجد نتائج مطابقة لبحثك
              </h3>
              <p className="text-xs text-stone-500">
                لم نجد أي طالب يطابق "{search}".
              </p>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                مسح البحث
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-md shadow-2xl p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>حذف طالب من الحلقة</span>
              </div>
              <button
                onClick={() => setStudentToDelete(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف الطالب <strong className="text-stone-900 font-bold text-sm">"{studentToDelete.name}"</strong> من حلقة جامع السرور؟
            </p>
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              ⚠️ سيتم مسح بيانات الطالب وجميع جلسات التسميع وسجلات الورد اليومي السابقة الخاصة به نهائياً.
            </p>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء التراجع
              </button>
              <button
                type="button"
                id="confirm-delete-from-list-btn"
                onClick={() => {
                  deleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>تأكيد حذف الطالب نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
