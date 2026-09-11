import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { 
  getRequiredRecitationForSession, 
  getWeeklySchedule, 
  generateWhatsAppMessage, 
  calculateStudentStats,
  formatQuranProgress,
  formatRemainingQuranProgress,
  formatCurrentRubDetailed,
  getCycleDaysBreakdown,
  getStudentRotatedCycle
} from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { QuranQuarterSelector } from './QuranQuarterSelector';
import { StudentAccessCodeModal } from './StudentAccessCodeModal';
import { 
  X, Phone, Calendar, BookOpen, Award, CheckCircle2, 
  Share2, Copy, Check, Trash2, Edit3, Save, MessageSquare, AlertTriangle,
  Compass, Sparkles, BookmarkCheck, KeyRound, UserCheck, Settings, Lock, ShieldCheck, Layers
} from 'lucide-react';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ studentId, onClose }) => {
  const { 
    students, 
    updateStudent, 
    deleteStudent, 
    getStudentSessions, 
    dailyRevisionRecords,
    switchToStudentView 
  } = useQuran();

  const student = students.find(s => s.id === studentId);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMemorizeModal, setShowMemorizeModal] = useState(false);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [showWirdModal, setShowWirdModal] = useState(false);
  const [memorizeRub, setMemorizeRub] = useState(student?.currentRub || 1);

  // Edit form state
  const [editName, setEditName] = useState(student?.name || '');
  const [editPhone, setEditPhone] = useState(student?.phone || '');
  const [editParentPhone, setEditParentPhone] = useState(student?.parentPhone || '');
  const [editCurrentRub, setEditCurrentRub] = useState(student?.currentRub || 1);
  const [editPin, setEditPin] = useState(student?.pin || '');
  const [editNotes, setEditNotes] = useState(student?.notes || '');

  // Custom Wird Modal State: Full Rotation with manual start point
  const currentStart = student?.customWirdStartJuz || (student?.customWirdJuzRange ? student.customWirdJuzRange[0] : 1);
  const [startMode, setStartMode] = useState<'beginning' | 'custom_start'>(
    currentStart > 1 ? 'custom_start' : 'beginning'
  );
  const [selectedStartJuz, setSelectedStartJuz] = useState<number>(currentStart);

  if (!student) return null;

  const stats = calculateStudentStats(student);
  const plan = getRequiredRecitationForSession(student.currentRub);
  const weeklySchedule = getWeeklySchedule(student);
  const pastSessions = getStudentSessions(student.id);
  const pastRevisions = dailyRevisionRecords.filter(r => r.studentId === student.id);
  const completedRevisionsCount = pastRevisions.filter(r => r.status === 'completed').length;

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage(student);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const text = generateWhatsAppMessage(student);
    const targetPhone = student.parentPhone || student.phone;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent(student.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      parentPhone: editParentPhone.trim(),
      currentRub: Math.max(1, Math.min(240, Number(editCurrentRub) || 1)),
      pin: editPin.trim() || undefined,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleSaveCustomWird = () => {
    const finalStartJuz = startMode === 'custom_start' ? Math.max(1, Math.min(stats.currentJuz, selectedStartJuz)) : 1;
    updateStudent(student.id, {
      customWirdType: finalStartJuz > 1 ? 'custom_start' : 'auto',
      customWirdStartJuz: finalStartJuz,
      customWirdJuzRange: undefined,
    });
    setShowWirdModal(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteStudent(student.id);
    onClose();
  };

  const currentQuarterInfo = getQuarterByNumber(student.currentRub);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="student-profile-modal-backdrop">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 shrink-0 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${student.avatarColor} text-white font-bold text-lg flex items-center justify-center shadow-inner`}>
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{student.name}</h3>
                <span className="text-[11px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                  نشط
                </span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-3">
                <span>تاريخ الالتحاق: {student.joinDate}</span>
                {student.parentPhone && (
                  <span>ولي الأمر: {student.parentPhone}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              title="تعديل بيانات الطالب"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id="student-modal-delete-btn"
              onClick={handleDeleteClick}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
              title="حذف الطالب من الحلقة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-6 text-right flex-1">
          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div id="delete-confirmation-banner" className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>تأكيد حذف الطالب نهائياً من حلقة جامع السرور</span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف الطالب <strong>"{student.name}"</strong>؟ سيتم مسح بيانات الطالب وجميع جلسات التسميع ({pastSessions.length}) وسجلات الورد اليومي ({pastRevisions.length}) التابعة له نهائياً.
              </p>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-2 text-xs text-stone-700 bg-white hover:bg-stone-100 rounded-xl border border-stone-300 font-semibold cursor-pointer transition-colors"
                >
                  إلغاء التراجع
                </button>
                <button
                  type="button"
                  id="confirm-delete-student-btn"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تأكيد حذف الطالب نهائياً</span>
                </button>
              </div>
            </div>
          )}
          {/* Editing Mode */}
          {isEditing && (
            <form onSubmit={handleSaveEdit} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
              <div className="font-bold text-xs text-stone-800">تعديل بيانات الطالب</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 mb-1">اسم الطالب:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">هاتف الطالب:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1">هاتف ولي الأمر:</label>
                  <input
                    type="text"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>الرقم السري للطالب (PIN) لحماية الحساب:</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    placeholder="مثال: 1234 (اختياري)"
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-mono tracking-wider"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 mb-1">ملاحظات المعلم:</label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <QuranQuarterSelector
                    selectedRub={editCurrentRub}
                    onChange={setEditCurrentRub}
                    title="الربع المستهدف الحالي وموضع الحفظ:"
                    helperText="اختر الجزء والربع الذي وصل إليه الطالب أو استخدم خيارات الاعتماد السريع"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  حفظ التعديلات
                </button>
              </div>
            </form>
          )}

          {/* Quick Fast-Forward / Approve Memorization Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-stone-50 border border-emerald-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-emerald-950">موضع الحفظ والتقدم في المصحف</h4>
                  <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
                    {formatQuranProgress(student.currentRub)}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  الموضع الحالي: <strong className="text-emerald-900 font-bold">الجزء {stats.currentJuz} (الربع {student.currentRub} - سورة {currentQuarterInfo?.surahName})</strong>. يمكنك تغيير موضع الحفظ بنقرة واحدة لأي جزء.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="open-memorize-adjust-modal-btn"
              onClick={() => {
                setMemorizeRub(student.currentRub);
                setShowMemorizeModal(true);
              }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>تعديل موضع الحفظ</span>
            </button>
          </div>

          {/* Custom Daily Wird (ورد المراجعة اليومي) Management Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-stone-50 border border-emerald-300/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-emerald-950">ورد المراجعة اليومي للطالب</h4>
                  {student.customWirdStartJuz && student.customWirdStartJuz > 1 ? (
                    <span className="text-[10px] bg-amber-100 text-amber-950 font-bold px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>دوران كامل (يبدأ من الجزء {student.customWirdStartJuz})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                      دوران كامل تلقائي (يبدأ من الجزء 1)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  {student.customWirdStartJuz && student.customWirdStartJuz > 1 ? (
                    <>يدور الورد في <strong className="text-emerald-900 font-bold">كامل محفوظ الطالب</strong> (3 أجزاء يومياً) بدءاً من <strong className="text-amber-900 font-bold">الجزء {student.customWirdStartJuz}</strong> بالترتيب التلقائي حتى ختم كل المحفوظ ثم العودة.</>
                  ) : (
                    <>يدور الورد تلقائياً في <strong className="text-emerald-900 font-bold">كامل أجزاء الطالب المحفوظة</strong> بنظام 3 أجزاء (24 ربعاً) لكل يوم بالتتابع المتسلسل.</>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="open-custom-wird-modal-btn"
              onClick={() => {
                const cur = student.customWirdStartJuz || (student.customWirdJuzRange ? student.customWirdJuzRange[0] : 1);
                setSelectedStartJuz(cur);
                setStartMode(cur > 1 ? 'custom_start' : 'beginning');
                setShowWirdModal(true);
              }}
              className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-200" />
              <span>تعديل وتخصيص نقطة بداية الورد</span>
            </button>
          </div>

          {/* Student Portal Account & Access Code Card with PIN Status */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-stone-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-xs text-blue-950">حساب الطالب وبوابة المتابعة</h4>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-mono font-bold px-2 py-0.5 rounded-md border border-blue-300">
                    كود: {student.accessCode || 'STU-1001'}
                  </span>
                  {student.pin ? (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>محمي برمز PIN ({student.pin})</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      بدون PIN (يمكنك تعيينه في التعديل)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  يمكن للطالب الدخول لحسابه بكوده ورقمه السري لمنع دخول أي طالب آخر على حسابه، وتعديل ورده وتسميعه ومتابعة تقريره الخاص.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAccessCodeModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-blue-800 bg-white hover:bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>مشاركة الكود</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchToStudentView(student.id);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>معاينة حسابه</span>
              </button>
            </div>
          </div>

          {/* Quick Progress Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-stone-500">المستوى الحالي</div>
              <div className="font-bold text-sm text-stone-900 mt-0.5">الجزء {stats.currentJuz}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">{formatQuranProgress(student.currentRub)}</div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-stone-500">الأرباع المنجزة</div>
              <div className="font-bold text-sm text-stone-900 mt-0.5">{student.completedRubCount} ربعاً</div>
              <div className="text-[10px] text-stone-500">من أصل 240 ربعاً</div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-stone-500">الورد اليومي</div>
              <div className="font-bold text-sm text-emerald-700 mt-0.5">
                {student.customWirdType === 'custom_juz' && student.customWirdJuzRange ? (
                  `الجزء ${student.customWirdJuzRange[0]}-${student.customWirdJuzRange[1]}`
                ) : student.completedRubCount >= 24 ? (
                  '3 أجزاء'
                ) : (
                  `${Math.min(24, Math.max(1, student.completedRubCount))} ربعاً`
                )}
              </div>
              <div className="text-[10px] text-stone-500">
                {student.customWirdType === 'custom_juz' ? 'ورد مخصص' : student.completedRubCount >= 24 ? '(24 ربعاً يومياً)' : 'تراكمي حتى 24 ربعاً'}
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
              <div className="text-[11px] text-stone-500">جلسات التسميع</div>
              <div className="font-bold text-sm text-stone-900 mt-0.5">{pastSessions.length} جلسات</div>
              <div className="text-[10px] text-emerald-700">
                {pastSessions.filter(s => s.grade === 'perfect').length} بدرجة ممتاز
              </div>
            </div>
          </div>

          {/* Quran Progress Bar */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950 flex-wrap gap-1">
              <span>المتبقي لختم القرآن الكريم:</span>
              <span className="text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-300">
                {formatRemainingQuranProgress(student.currentRub).formatted}
              </span>
            </div>
            <div className="w-full h-3 bg-stone-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, stats.progressPercent)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-800 font-medium">
              <span>الفاتحة (ج1)</span>
              <span className="font-bold text-emerald-950">
                الموضع الحالي: {formatCurrentRubDetailed(student.currentRub)}
              </span>
              <span>الناس (30 جزءاً)</span>
            </div>
          </div>

          {/* Next Circle Session Requirements (4 Quarters) */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>المطلوب تسميعه في الجلسة القادمة ({plan.totalCount} أرباع):</span>
              </div>
              <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                جلسة {stats.nextCircleDayName} ({stats.nextCircleDateStr})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {plan.linkingRubs.map((r) => {
                const q = getQuarterByNumber(r);
                return (
                  <div key={r} className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-stone-500 block">ربط سابق</span>
                    <strong className="text-xs text-stone-800 block">ربع {r}</strong>
                    <div className="text-[11px] text-stone-600 truncate">{q?.surahName}</div>
                    <div className="text-[10px] text-stone-400">ص {q?.approxPage}</div>
                  </div>
                );
              })}

              {/* The New Quarter */}
              {(() => {
                const newQ = getQuarterByNumber(plan.newRub);
                return (
                  <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-2.5 text-center shadow-xs">
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold inline-block mb-0.5">
                      جديد
                    </span>
                    <strong className="text-xs text-emerald-950 block">ربع {plan.newRub}</strong>
                    <div className="text-[11px] text-emerald-800 font-semibold truncate">{newQ?.surahName}</div>
                    <div className="text-[10px] text-emerald-700">ص {newQ?.approxPage}</div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* WhatsApp Share Card */}
          <div className="bg-gradient-to-l from-emerald-800 to-teal-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-300" />
                <span>إرسال جدول الطالب عبر واتساب</span>
              </div>
              <div className="text-xs text-emerald-200 mt-0.5">
                إرسال تقرير مفصل للأهل أو الطالب بالتسميع المطلوب والورد اليومي لكل يوم
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyWhatsApp}
                className="flex-1 sm:flex-none text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-950 border border-emerald-600 text-white px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 sm:flex-none text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>فتح واتساب</span>
              </button>
            </div>
          </div>

          {/* Full 7-Day Weekly Revision Schedule Table */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-xs text-stone-800">
                خطة ورد المراجعة للأسبوع الحالي (الأحد إلى السبت):
              </div>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
                بمعدل 3 أجزاء (24 ربعاً) يومياً
              </span>
            </div>
            <div className="divide-y divide-stone-100 text-xs">
              {weeklySchedule.map((day) => (
                <div key={day.date} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      day.isCircleDay 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {day.dayName}
                    </span>
                    {day.isCircleDay && (
                      <span className="text-[10px] text-emerald-700 font-medium">(يوم تسميع الحلقة)</span>
                    )}
                    {day.totalCycleDays && day.totalCycleDays > 1 && (
                      <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        اليوم {day.cycleDayNumber} من {day.totalCycleDays}
                      </span>
                    )}
                  </div>
                  <div className="text-stone-700 font-medium text-left">
                    {day.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Cycle Days Breakdown for this student */}
            {(() => {
              const cycle = getCycleDaysBreakdown(student.currentRub);
              if (cycle.length <= 1) return null;
              return (
                <div className="mt-3 pt-3 border-t border-stone-200">
                  <div className="text-[11px] font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>دورة ختمة الورد الكاملة للطالب ({cycle.length} أيام):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {cycle.map((c) => (
                      <div key={c.dayNumber} className={`p-2 rounded-xl border text-xs ${c.isRemainder ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-stone-50 border-stone-200 text-stone-900'}`}>
                        <div className="flex items-center justify-between font-bold mb-0.5">
                          <span>اليوم {c.dayNumber}</span>
                          {c.isRemainder ? (
                            <span className="text-[10px] bg-amber-200 px-1.5 rounded-full font-bold">×{c.repeatCount}</span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 rounded-full">3 أجزاء</span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-stone-800">{c.shortLabel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Past Circle Sessions Log */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="font-bold text-xs text-stone-800">
              سجل جلسات التسميع السابقة ({pastSessions.length}):
            </div>

            {pastSessions.length === 0 ? (
              <div className="text-xs text-stone-400 text-center py-4">
                لا توجد جلسات تسميع مسجلة بعد لهذا الطالب
              </div>
            ) : (
              <div className="space-y-2">
                {pastSessions.map((session) => (
                  <div key={session.id} className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-800">
                        جلسة {session.dayName} ({session.date})
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        session.grade === 'perfect' ? 'bg-emerald-100 text-emerald-800' :
                        session.grade === 'very_good' ? 'bg-teal-100 text-teal-800' :
                        session.grade === 'good' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {session.grade === 'perfect' && '🌟 متقن (ممتاز)'}
                        {session.grade === 'very_good' && '✨ جيد جداً'}
                        {session.grade === 'good' && '⚠️ جيد'}
                        {session.grade === 'needs_repeat' && '❌ يحتاج إعادة'}
                      </span>
                    </div>

                    <div className="text-stone-600 text-[11px]">
                      الأرباع التي سُمِعَت: {session.recitedRubs.map(r => `ربع ${r}`).join('، ')} 
                      {session.advancedToNext && ' • (تمت ترقية الطالب للربع التالي)'}
                    </div>

                    {(session.mistakesCount > 0 || session.hesitationsCount > 0) && (
                      <div className="text-[10px] text-stone-500">
                        الأخطاء: {session.mistakesCount} | الترددات: {session.hesitationsCount}
                      </div>
                    )}

                    {session.teacherNotes && (
                      <div className="text-[11px] text-stone-700 bg-white p-2 rounded border border-stone-200 mt-1">
                        ملاحظة: {session.teacherNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone: Delete Student */}
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
            <div>
              <div className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>إدارة قيد الطالب بالحلقة</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-0.5">
                حذف الطالب بشكل نهائي وإزالة كافة سجلات الحفظ والتسميع السابقة
              </p>
            </div>
            <button
              type="button"
              id="danger-zone-delete-btn"
              onClick={() => {
                setShowDeleteConfirm(true);
                const modalEl = document.getElementById('student-profile-modal-backdrop');
                if (modalEl) modalEl.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:text-white bg-white hover:bg-rose-600 border border-rose-300 hover:border-rose-600 rounded-xl transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف هذا الطالب</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Modal for Fast-Forward / Approving Previous Memorization */}
      {showMemorizeModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">اعتماد الحفظ السابق للطالب</h3>
                  <p className="text-xs text-emerald-300/90 font-normal">
                    الطالب: <strong className="text-white">{student.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMemorizeModal(false)}
                className="text-emerald-300 hover:text-white p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-right max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-stone-600 leading-relaxed">
                حدد الجزء أو الربع الذي وصل إليه الطالب أو اختر من الاختصارات السريعة (مثل: حفظ 5 أجزاء أو 10 أجزاء)، وسيتم تحديث نقطة البداية وجدول التسميع تلقائياً دون الحاجة للبدء من أول المصحف.
              </p>

              <QuranQuarterSelector
                selectedRub={memorizeRub}
                onChange={setMemorizeRub}
                title="موضع التسميع الجديد للطالب:"
                helperText="يمكنك الانتقال فوراً للجزء 5 أو أي ربع بسهولة فائقة"
              />
            </div>

            {/* Footer */}
            <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowMemorizeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                id="confirm-update-memorize-rub-btn"
                onClick={() => {
                  updateStudent(student.id, {
                    currentRub: memorizeRub,
                    completedRubCount: Math.max(0, memorizeRub - 1),
                  });
                  setEditCurrentRub(memorizeRub);
                  setShowMemorizeModal(false);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>اعتماد وتحديث موضع الطالب الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Customizing Student's Daily Wird Starting Point (تخصيص نقطة بداية دوران الورد) */}
      {showWirdModal && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl border border-emerald-200 w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
            id="custom-wird-config-dialog"
          >
            {/* Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Amiri',serif]">دوران الورد الذكي ونقطة البداية</h3>
                  <p className="text-xs text-emerald-300/90 font-normal">
                    دوران كامل لجميع الأجزاء المحفوظة للطالب: <strong className="text-white">{student.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWirdModal(false)}
                className="text-emerald-300 hover:text-white p-1.5 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-right max-h-[75vh] overflow-y-auto">
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>نظام الدوران الذكي الشامل (3 أجزاء / 24 ربعاً يومياً):</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  يدور الورد تلقائياً في <strong className="text-emerald-900 font-bold">كامل الأجزاء المحفوظة للطالب ({stats.currentJuz} أجزاء)</strong> دون استثناء أي جزء محفوظ. يمكنك تحديد من أين تبدأ الدورة يدوياً، ثم يتولى النظام الدوران التلقائي المتسلسل لما تبقى من المحفوظ حتى الختم ثم العودة.
                </p>
              </div>

              {/* Choose Start Mode */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setStartMode('beginning');
                    setSelectedStartJuz(1);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    startMode === 'beginning'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/40 text-emerald-950 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>🌱</span>
                    <span>من بداية المحفوظ (الجزء 1)</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 leading-normal">
                    يبدأ الدوران من أول القرآن المحفوظ (الفاتحة والبقرة) ثم يتتابع
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStartMode('custom_start');
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
                    startMode === 'custom_start'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400/40 text-amber-950 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>🎯</span>
                    <span>تحديد بداية يدوية + دوران ذكي</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 leading-normal">
                    أنت تحدد من أين يبدأ، ثم يدور النظام تلقائياً في باقي الأجزاء
                  </div>
                </button>
              </div>

              {/* Manual Start Point Selection */}
              {startMode === 'custom_start' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
                  <div className="font-bold text-xs text-amber-950">
                    اختر نقطة بداية الدوران من أجزاء الطالب المحفوظة (1 إلى {stats.currentJuz}):
                  </div>

                  {/* Quick block presets that fit within student's memorized range */}
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: Math.ceil(stats.currentJuz / 3) }).map((_, idx) => {
                      const blockStartJuz = idx * 3 + 1;
                      const blockEndJuz = Math.min(stats.currentJuz, (idx + 1) * 3);
                      const isSelected = selectedStartJuz === blockStartJuz;
                      return (
                        <button
                          key={blockStartJuz}
                          type="button"
                          onClick={() => setSelectedStartJuz(blockStartJuz)}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-700 text-white border-amber-800 shadow-xs ring-2 ring-amber-400/50'
                              : 'bg-white text-stone-800 border-amber-200 hover:bg-amber-100/60'
                          }`}
                        >
                          البدء من ج{blockStartJuz} ({blockStartJuz === blockEndJuz ? `ج${blockStartJuz}` : `ج${blockStartJuz}-${blockEndJuz}`})
                        </button>
                      );
                    })}
                  </div>

                  {/* Fine-grained Juz Selector */}
                  <div className="pt-2 border-t border-amber-200/80 flex items-center gap-3">
                    <label className="text-xs font-bold text-stone-700 shrink-0">
                      أو حدد الجزء الدقيق لبدء الدورة:
                    </label>
                    <select
                      value={selectedStartJuz}
                      onChange={(e) => setSelectedStartJuz(Number(e.target.value))}
                      className="flex-1 p-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      {Array.from({ length: stats.currentJuz }, (_, i) => i + 1).map((j) => (
                        <option key={j} value={j}>
                          الجزء {j} {j === 1 ? '(أول المحفوظ)' : ''} {j === stats.currentJuz ? '(آخر جزء محفوظ)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Live Cycle Rotation Preview (معاينة تسلسل الدورة الكاملة) */}
              {(() => {
                const effectiveStart = startMode === 'custom_start' ? selectedStartJuz : 1;
                const cycleDays = getStudentRotatedCycle(student.currentRub, effectiveStart);
                return (
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        <span>معاينة تسلسل دورة الختمة الكاملة ({cycleDays.length} أيام):</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                        دوران كامل لـ {stats.currentJuz} أجزاء
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {cycleDays.map((cd, index) => (
                        <div 
                          key={cd.dayNumber}
                          className={`p-2 rounded-xl text-[11px] flex items-center justify-between border ${
                            index === 0
                              ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-950'
                              : 'bg-white border-stone-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              index === 0 ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-700'
                            }`}>
                              {cd.dayNumber}
                            </span>
                            <span>{cd.description}</span>
                          </div>
                          {index === 0 && (
                            <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md">
                              نقطة البداية
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-stone-500 text-center">
                      * يكتمل في اليوم {cycleDays.length} دوران كامل المحفوظ ويعود تلقائياً لليوم الأول بسلاسة.
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="bg-stone-50 border-t border-stone-200 p-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowWirdModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>

              <button
                type="button"
                id="save-custom-wird-btn"
                onClick={handleSaveCustomWird}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتطبيق الدوران الذكي</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Access Code & Share Modal */}
      {showAccessCodeModal && (
        <StudentAccessCodeModal
          student={student}
          onClose={() => setShowAccessCodeModal(false)}
        />
      )}
    </div>
  );
};
