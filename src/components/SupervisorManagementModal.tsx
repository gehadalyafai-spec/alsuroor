import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  SupervisorConfig, 
  MASTER_ADMIN_EMAIL, 
  getLocalSupervisorConfig, 
  loadSupervisorConfigFromCloud, 
  updateSupervisorConfigInCloud 
} from '../utils/supervisorAuth';
import { 
  X, ShieldCheck, UserPlus, Trash2, KeyRound, 
  Check, Copy, Lock, Mail, AlertCircle, Save, RefreshCw, ShieldAlert
} from 'lucide-react';

interface SupervisorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupervisorManagementModal: React.FC<SupervisorManagementModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SupervisorConfig>(getLocalSupervisorConfig());
  const [newEmail, setNewEmail] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isMasterAdmin = (user?.email || '').toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    if (isOpen) {
      loadSupervisorConfigFromCloud().then(latestConfig => {
        setConfig(latestConfig);
        setNewPasscode(latestConfig.masterPasscode);
      });
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailToAdd = newEmail.trim().toLowerCase();
    if (!emailToAdd) return;

    if (!emailToAdd.includes('@') || !emailToAdd.includes('.')) {
      setErrorMsg('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    if (config.authorizedEmails.some(e => e.toLowerCase() === emailToAdd)) {
      setErrorMsg('هذا البريد الإلكتروني مسجل ومصرح له مسبقاً');
      return;
    }

    setIsSaving(true);
    try {
      const updatedList = [...config.authorizedEmails, emailToAdd];
      const updated = await updateSupervisorConfigInCloud(
        { authorizedEmails: updatedList },
        user?.email || 'admin'
      );
      setConfig(updated);
      setNewEmail('');
      setSuccessMsg(`تمت إضافة البريد "${emailToAdd}" بنجاح إلى قائمة المشرفين المصرح لهم.`);
    } catch {
      setErrorMsg('حدث خطأ أثناء حفظ البريد، يرجى المحاولة ثانية');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      alert('لا يمكن إزالة المشرف العام الرئيسي من القائمة.');
      return;
    }

    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء صلاحية المشرف "${emailToRemove}"؟`)) {
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updatedList = config.authorizedEmails.filter(e => e.toLowerCase() !== emailToRemove.toLowerCase());
      const updated = await updateSupervisorConfigInCloud(
        { authorizedEmails: updatedList },
        user?.email || 'admin'
      );
      setConfig(updated);
      setSuccessMsg(`تمت إزالة صلاحية المشرف "${emailToRemove}" بنجاح.`);
    } catch {
      setErrorMsg('حدث خطأ أثناء إزالة البريد، يرجى المحاولة ثانية');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPasscode = newPasscode.trim().toUpperCase();
    if (!cleanPasscode || cleanPasscode.length < 4) {
      setErrorMsg('رمز الترخيص السري يجب ألا يقل عن 4 أحرف أو أرقام');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await updateSupervisorConfigInCloud(
        { masterPasscode: cleanPasscode },
        user?.email || 'admin'
      );
      setConfig(updated);
      setSuccessMsg('تم تحديث رمز ترخيص المشرفين السري بنجاح.');
    } catch {
      setErrorMsg('حدث خطأ أثناء تحديث رمز الترخيص');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(config.masterPasscode);
    setCopiedPasscode(true);
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl border border-stone-200 w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-scaleUp">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">إدارة المشرفين وصلاحيات الدخول</h3>
                {isMasterAdmin && (
                  <span className="text-[10px] bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full">
                    المسؤول الرئيسي
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                تحديد المعلمين المصرح لهم بالدخول كمشرفين ومنع وصول الطلاب للوحة التحكم
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-right">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Master Admin Notice */}
          <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-700 space-y-1">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <span>سياسة حماية بيانات الحلقة:</span>
              </div>
              <p className="leading-relaxed text-stone-600">
                لا يمكن لأي طالب أو شخص الدخول كمشرف إلا إذا كان بريده مسجلاً في القائمة أدناه، أو بإدخاله رمز ترخيص المشرفين السري.
              </p>
            </div>
          </div>

          {/* Supervisor Master Passcode Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs text-stone-900">رمز ترخيص المشرفين السري (Supervisor Passcode):</span>
              </div>
              <button
                type="button"
                onClick={handleCopyPasscode}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedPasscode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPasscode ? 'تم النسخ!' : 'نسخ الرمز'}</span>
              </button>
            </div>

            <p className="text-[11px] text-stone-500">
              يمكنك إعطاء هذا الرمز السري لأي معلّم جديد في الحلقة لترخيص حسابه للدخول كمشرف فوراً.
            </p>

            <form onSubmit={handleUpdatePasscode} className="flex gap-2">
              <input
                type="text"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value.toUpperCase())}
                placeholder="مثال: SURUR-2026"
                className="flex-1 text-xs font-mono font-bold tracking-wider px-3 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                required
              />
              <button
                type="submit"
                disabled={isSaving || newPasscode.trim() === config.masterPasscode}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 active:bg-stone-950 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ الرمز</span>
              </button>
            </form>
          </div>

          {/* Add New Authorized Supervisor Email */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-xs text-stone-900">إضافة بريد معلّم / مشرف معتمد:</span>
            </div>

            <form onSubmit={handleAddEmail} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="teacher@gmail.com"
                  dir="ltr"
                  className="w-full pr-9 pl-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>إضافة</span>
              </button>
            </form>
          </div>

          {/* List of Authorized Supervisor Emails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800 px-1">
              <span>المشرفون المصرح لهم حالياً ({config.authorizedEmails.length}):</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {config.authorizedEmails.map((email) => {
                const isOwner = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
                const isCurrentUser = (user?.email || '').toLowerCase() === email.toLowerCase();

                return (
                  <div
                    key={email}
                    className="flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shrink-0 ${
                        isOwner ? 'bg-amber-600' : 'bg-emerald-700'
                      }`}>
                        {email[0].toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-stone-800 truncate" dir="ltr">
                          {email}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1">
                          {isOwner ? (
                            <span className="text-amber-700 font-bold">المشرف العام (المالك)</span>
                          ) : (
                            <span className="text-emerald-700">معلّم معتمد</span>
                          )}
                          {isCurrentUser && <span className="text-stone-400 font-bold">(حسابك الحالي)</span>}
                        </div>
                      </div>
                    </div>

                    {!isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={isSaving}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="إلغاء صلاحية هذا المشرف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
