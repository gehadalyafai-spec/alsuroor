import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { QuranQuarterSelector } from './QuranQuarterSelector';
import { generateUniqueStudentCode } from '../utils/studentCode';
import { X, UserPlus, KeyRound, Sparkles } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const { addStudent, students } = useQuran();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [initialRub, setInitialRub] = useState<number>(1);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStudent({
      name: name.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      accessCode: accessCode.trim() || undefined,
      initialRub: Math.max(1, Math.min(240, Number(initialRub) || 1)),
      notes: notes.trim(),
    });

    onClose();
    setName('');
    setPhone('');
    setParentPhone('');
    setAccessCode('');
    setInitialRub(1);
    setNotes('');
  };

  const handleGenerateCode = () => {
    setAccessCode(generateUniqueStudentCode(students));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="add-student-modal-backdrop">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">إضافة طالب جديد للحلقة</h3>
              <p className="text-xs text-stone-400">تحديد نقطة بداية الحفظ وتفاصيل التواصل والرمز السري</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم الطالب الثلاثي / الرباعي: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عبدالله بن محمد الغامدي"
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رقم هاتف الطالب:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رقم هاتف ولي الأمر (لإرسال الجدول):
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Access Code generation/input */}
          <div className="bg-emerald-50/50 border border-emerald-200/60 p-3 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>رمز دخول الطالب (Student Access Code):</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>توليد تلقائي فريد</span>
              </button>
            </div>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="مثال: STU-1001 (يُترك فارغاً للتوليد التلقائي)"
              className="w-full text-xs p-2.5 bg-white border border-emerald-200 rounded-xl font-mono font-bold text-emerald-950 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              الرمز المميز للطالب لتسجيل الدخول لبوابته دون الحاجة لكلمة مرور
            </p>
          </div>

          {/* Starting Quarter Selector & Previous Memorization */}
          <QuranQuarterSelector
            selectedRub={initialRub}
            onChange={setInitialRub}
            title="نقطة بداية الحفظ / اعتماد الحفظ السابق:"
            helperText="إذا كان الطالب حافظاً لجزء عم أو 5 أجزاء أو أكثر، اختر الجزء مباشرة أو استخدم خيارات الاعتماد السريع"
          />

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ملاحظات المعلم (اختياري):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: متقن لأحكام التجويد، بدأ من أول المصحف..."
              className="w-full text-xs p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-stone-600 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              id="submit-new-student-btn"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة الطالب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
