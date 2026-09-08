import React, { useState } from 'react';
import { Student } from '../types/quran';
import { useQuran } from '../context/QuranContext';
import { 
  X, Copy, Check, Share2, KeyRound, UserCheck, 
  ExternalLink, Smartphone, MessageSquare, Sparkles, Lock, ShieldCheck
} from 'lucide-react';

interface StudentAccessCodeModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentAccessCodeModal: React.FC<StudentAccessCodeModalProps> = ({ student, onClose }) => {
  const { switchToStudentView } = useQuran();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const accessCode = student.accessCode || 'STU-1001';

  const shareText = `السلام عليكم ورحمة الله وبركاته،
حياكم الله في حلقة القرآن الكريم - جامع السرور.
تم تفعيل حساب الطالب: ${student.name}
كود الدخول الخاص بالطالب: ${accessCode}${student.pin ? `\nالرمز السري (PIN): ${student.pin}` : ''}
رابط المنصة: ${window.location.origin}
يمكن للطالب من خلال حسابه متابعة نسبة تقدمه بالختمة، وتسجيل ورده اليومي وجلسة التسميع وإرسالها للمشرف للاعتماد.
وفقكم الله وسددكم.`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const targetPhone = student.parentPhone || student.phone;
    const cleanPhone = targetPhone?.replace(/[^0-9]/g, '') || '';
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareText)}`
      : `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleLoginAsStudent = () => {
    switchToStudentView(student.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-md shadow-2xl overflow-hidden my-auto animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">بيانات دخول الطالب وحماية الحساب</h3>
              <p className="text-xs text-stone-400 mt-0.5">{student.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Access Code & PIN Box */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
            <div>
              <div className="text-xs font-semibold text-emerald-800 mb-1">
                كود دخول الطالب (Student Access Code)
              </div>
              <div className="text-3xl font-black text-emerald-950 font-mono tracking-wider py-1 select-all">
                {accessCode}
              </div>
            </div>

            {student.pin && (
              <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-amber-700" />
                <span className="text-xs text-amber-950 font-bold">
                  الرمز السري الخاص (PIN):
                </span>
                <span className="font-mono font-black text-sm bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-300">
                  {student.pin}
                </span>
              </div>
            )}

            <p className="text-[11px] text-stone-500">
              {student.pin 
                ? 'الحساب محمي برمز PIN لمنع دخول أي طالب آخر.'
                : 'يمكن إضافة رمز سري PIN من صفحة تعديل الطالب لزيادة الأمان.'}
            </p>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'تم النسخ بنجاح!' : 'نسخ الكود'}</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2.5">
            <button
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>إرسال كود الدخول والرمز السري عبر واتساب</span>
            </button>

            <button
              onClick={handleCopyMessage}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer"
            >
              {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'تم نسخ الرسالة!' : 'نسخ رسالة الترحيب والتعليمات'}</span>
            </button>

            <div className="pt-2 border-t border-stone-200">
              <button
                onClick={handleLoginAsStudent}
                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>معاينة بوابة هذا الطالب الآن (تسجيل دخول كطالب)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
