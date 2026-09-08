import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { StudentSubmission, SessionGrade } from '../types/quran';
import { getQuarterDetails } from '../data/quranData';
import { formatRubsToJuzDescription } from '../utils/quranLogic';
import { 
  X, CheckCircle2, Clock, AlertCircle, Award, BookOpen, 
  Send, Check, Trash2, Star, MessageSquare, ArrowRight, 
  ShieldCheck, RefreshCw, Filter, Sparkles
} from 'lucide-react';

interface StudentSubmissionsModalProps {
  onClose: () => void;
}

export const StudentSubmissionsModal: React.FC<StudentSubmissionsModalProps> = ({ onClose }) => {
  const { 
    submissions, 
    approveSubmission, 
    rejectSubmission, 
    deleteSubmission,
    students 
  } = useQuran();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  // Per-submission feedback draft
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  // Per-submission grade selection for session recitations
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, SessionGrade>>({});
  const [mistakesDrafts, setMistakesDrafts] = useState<Record<string, number>>({});
  const [hesitationsDrafts, setHesitationsDrafts] = useState<Record<string, number>>({});
  const [advanceDrafts, setAdvanceDrafts] = useState<Record<string, boolean>>({});

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  const filteredSubmissions = submissions.filter(s => {
    if (activeFilter === 'pending') return s.status === 'pending';
    if (activeFilter === 'approved') return s.status === 'approved';
    if (activeFilter === 'rejected') return s.status === 'rejected';
    return true;
  });

  const handleApprove = async (sub: StudentSubmission) => {
    setActionInProgressId(sub.id);
    const feedback = feedbackDrafts[sub.id] || 'تم الاعتماد بنجاح، بارك الله فيك ونفع بك';
    const grade = gradeDrafts[sub.id] || sub.sessionData?.grade || 'very_good';
    const mistakesCount = mistakesDrafts[sub.id] ?? (sub.sessionData?.mistakesCount || 0);
    const hesitationsCount = hesitationsDrafts[sub.id] ?? (sub.sessionData?.hesitationsCount || 0);
    const defaultAdvance = sub.type === 'session' 
      ? (sub.sessionData?.advanceToNext ?? (grade !== 'needs_repeat' && grade !== 'absent'))
      : (sub.revisionData?.status === 'completed');
    const advanceToNext = advanceDrafts[sub.id] ?? defaultAdvance;

    try {
      await approveSubmission(sub.id, {
        supervisorFeedback: feedback,
        grade,
        mistakesCount,
        hesitationsCount,
        advanceToNext,
      });
    } catch (err) {
      console.error('Error approving submission:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleReject = async (sub: StudentSubmission) => {
    const feedback = feedbackDrafts[sub.id] || 'يرجى مراجعة المقرر مرة أخرى وإعادة التسميع';
    setActionInProgressId(sub.id);
    try {
      await rejectSubmission(sub.id, feedback);
    } catch (err) {
      console.error('Error rejecting submission:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا الطلب نهائياً من السجل؟')) {
      await deleteSubmission(id);
    }
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

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="submissions-modal-backdrop" dir="rtl">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">طلبات واعتمادات الطلاب</h3>
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-stone-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingCount} بانتظار المراجعة
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                مراجعة واعتماد تعديلات الورد اليومي وجلسات التسميع ومزامنتها في السجل الرسمي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-submissions-modal-btn"
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="bg-stone-100 p-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>بانتظار الاعتماد ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === 'approved'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>المعتمدة ({submissions.filter(s => s.status === 'approved').length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === 'rejected'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>المرفوضة ({submissions.filter(s => s.status === 'rejected').length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-stone-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>الكل ({submissions.length})</span>
            </button>
          </div>

          {pendingCount > 0 && activeFilter === 'pending' && (
            <button
              type="button"
              onClick={async () => {
                if (window.confirm(`هل أنت متأكد من رغبتك في اعتماد جميع طلبات الطلاب المعلقة (${pendingCount}) دفعة واحدة؟`)) {
                  setActionInProgressId('all');
                  try {
                    for (const sub of submissions.filter(s => s.status === 'pending')) {
                      await handleApprove(sub);
                    }
                  } finally {
                    setActionInProgressId(null);
                  }
                }
              }}
              disabled={actionInProgressId === 'all'}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {actionInProgressId === 'all' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>اعتماد جميع المعلق ({pendingCount})</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-stone-700">لا توجد طلبات في هذا التبويب</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {activeFilter === 'pending'
                  ? 'رائع! كافة طلبات الطلاب معتمدة ومحدثة.'
                  : 'لا توجد سجلات تطابق الفلتر الحالي.'}
              </p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const student = students.find(s => s.id === sub.studentId);
              const isPending = sub.status === 'pending';
              const isLoading = actionInProgressId === sub.id;

              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/30'
                      : sub.status === 'approved'
                      ? 'border-emerald-200 bg-white'
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/60">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${student?.avatarColor || 'bg-emerald-700'} text-white font-bold flex items-center justify-center text-sm shadow-inner`}>
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{sub.studentName}</span>
                          {student?.accessCode && (
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-mono">
                              {student.accessCode}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>تاريخ المقرر: <strong className="text-stone-700">{sub.date}</strong></span>
                          <span>•</span>
                          <span>أُرسل في: {new Date(sub.createdAt).toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        sub.type === 'daily_revision'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {sub.type === 'daily_revision' ? '📿 ورد يومي' : '📖 جلسة تسميع'}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'approved' && <Check className="w-3 h-3" />}
                        {sub.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                        {sub.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                        <span>
                          {sub.status === 'approved' && 'معتمد ومحدث'}
                          {sub.status === 'pending' && 'بانتظار موافقتك'}
                          {sub.status === 'rejected' && 'مرفوض'}
                        </span>
                      </span>

                      {!isPending && (
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="حذف من السجل"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Student Submitted Data Section */}
                  <div className="mt-3.5 text-xs text-stone-700 bg-white/80 p-3 rounded-xl border border-stone-200/70 space-y-2">
                    {sub.type === 'daily_revision' && sub.revisionData && (
                      <>
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <span className="font-bold text-stone-800">حالة الإنجاز: </span>
                            <span className={`font-bold px-2 py-0.5 rounded-md ${
                              sub.revisionData.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              sub.revisionData.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {statusArabic[sub.revisionData.status] || sub.revisionData.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="font-bold text-stone-800">تقييم الطالب: </span>
                            <div className="flex text-amber-500">
                              {Array.from({ length: sub.revisionData.rating || 5 }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="font-bold text-stone-800">الورد المقرر: </span>
                            <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatRubsToJuzDescription(sub.revisionData.assignedRubs).fullDescription}
                            </span>
                          </div>
                        </div>

                        {sub.revisionData.notes && (
                          <div className="pt-1 text-stone-600">
                            <span className="font-bold text-stone-800">ملاحظة الطالب: </span>
                            <span>«{sub.revisionData.notes}»</span>
                          </div>
                        )}
                      </>
                    )}

                    {sub.type === 'session' && sub.sessionData && (
                      <>
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <span className="font-bold text-stone-800">الربع المسرد: </span>
                            <span className="font-bold text-emerald-800">الربع {sub.sessionData.newRub}</span>
                          </div>
                          <div>
                            <span className="font-bold text-stone-800">الأرباع المسردة: </span>
                            <span>{sub.sessionData.recitedRubs?.join('، ') || sub.sessionData.newRub}</span>
                          </div>
                        </div>

                        {sub.sessionData.studentNotes && (
                          <div className="pt-1 text-stone-600">
                            <span className="font-bold text-stone-800">ملاحظة الطالب: </span>
                            <span>«{sub.sessionData.studentNotes}»</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Supervisor Existing Feedback (if not pending) */}
                  {!isPending && sub.supervisorFeedback && (
                    <div className="mt-2.5 p-2.5 bg-stone-50 rounded-xl text-xs border border-stone-200 text-stone-800">
                      <span className="font-bold text-emerald-800">ملاحظتك للطالب: </span>
                      <span>{sub.supervisorFeedback}</span>
                      {sub.reviewedAt && (
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          تاريخ المراجعة: {new Date(sub.reviewedAt).toLocaleString('ar-SA')}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Supervisor Action Box for Pending Submissions */}
                  {isPending && (
                    <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-3">
                      {/* If session: supervisor can tune the grade & advanceToNext */}
                      {sub.type === 'session' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-stone-200 text-xs">
                          <div>
                            <label className="block font-bold text-stone-700 mb-1">التقدير:</label>
                            <select
                              value={gradeDrafts[sub.id] || 'very_good'}
                              onChange={(e) => setGradeDrafts(prev => ({ ...prev, [sub.id]: e.target.value as SessionGrade }))}
                              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-800"
                            >
                              <option value="perfect">ممتاز</option>
                              <option value="very_good">جيد جداً</option>
                              <option value="good">جيد</option>
                              <option value="needs_repeat">يحتاج إعادة</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1">عدد الأخطاء:</label>
                            <input
                              type="number"
                              min={0}
                              value={mistakesDrafts[sub.id] ?? 0}
                              onChange={(e) => setMistakesDrafts(prev => ({ ...prev, [sub.id]: Number(e.target.value) || 0 }))}
                              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-stone-700 mb-1">الترددات:</label>
                            <input
                              type="number"
                              min={0}
                              value={hesitationsDrafts[sub.id] ?? 0}
                              onChange={(e) => setHesitationsDrafts(prev => ({ ...prev, [sub.id]: Number(e.target.value) || 0 }))}
                              className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                            />
                          </div>

                          <div className="sm:col-span-3 pt-1 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`adv-${sub.id}`}
                              checked={advanceDrafts[sub.id] ?? true}
                              onChange={(e) => setAdvanceDrafts(prev => ({ ...prev, [sub.id]: e.target.checked }))}
                              className="w-4 h-4 text-emerald-600 rounded-md cursor-pointer"
                            />
                            <label htmlFor={`adv-${sub.id}`} className="text-xs font-bold text-emerald-800 cursor-pointer">
                              نقل الطالب للربع التالي (الربع {((student?.currentRub || 1) % 240) + 1}) بعد الاعتماد
                            </label>
                          </div>
                        </div>
                      )}

                      {/* If daily revision: option to advance student to next rub upon approval */}
                      {sub.type === 'daily_revision' && (
                        <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`adv-rev-${sub.id}`}
                              checked={advanceDrafts[sub.id] ?? true}
                              onChange={(e) => setAdvanceDrafts(prev => ({ ...prev, [sub.id]: e.target.checked }))}
                              className="w-4 h-4 text-emerald-600 rounded-md cursor-pointer"
                            />
                            <label htmlFor={`adv-rev-${sub.id}`} className="text-xs font-bold text-emerald-800 cursor-pointer">
                              نقل الطالب للربع التالي (الربع {((student?.currentRub || 1) % 240) + 1}) بعد اعتماد الورد اليومي
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Feedback Text Input */}
                      <div>
                        <input
                          type="text"
                          placeholder="ملاحظاتك للطالب (مثال: ممتاز بارك الله فيك، استمر / أو تنبيه لموضع تشابه)..."
                          value={feedbackDrafts[sub.id] || ''}
                          onChange={(e) => setFeedbackDrafts(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:ring-2 focus:ring-emerald-600 outline-hidden"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2.5 pt-1">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleReject(sub)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          رفض مع إبداء ملاحظة
                        </button>

                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleApprove(sub)}
                          className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>اعتماد ومزامنة السجل</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div>
            عند النقر على "اعتماد ومزامنة السجل"، يتم تسجيل البيانات فوراً في سجل الحلقة وتحديث رصيد الطالب.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
