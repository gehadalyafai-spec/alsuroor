import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuran } from '../context/QuranContext';
import { db } from '../firebase';
import { safeAddDoc, safeGetDocs } from '../utils/firestoreHelper';
import { collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Send, Download, Upload, Copy, Check, Mail, Key, Users, 
  RefreshCw, AlertCircle, CheckCircle2, X, ArrowRight, ShieldCheck, Database,
  Clock, CheckSquare
} from 'lucide-react';
import { Student, SessionRecord, DailyRevisionRecord } from '../types/quran';
import { parseBackupJson } from '../utils/backupManager';

interface AccountTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'backup' | 'send' | 'receive';
}

interface TransferPackage {
  id: string;
  senderEmail: string;
  senderName: string;
  targetEmail: string;
  code: string;
  studentsCount: number;
  sessionsCount: number;
  revisionsCount: number;
  createdAt: string;
  data: {
    students: Student[];
    sessionRecords: SessionRecord[];
    dailyRevisionRecords: DailyRevisionRecord[];
  };
}

export const AccountTransferModal: React.FC<AccountTransferModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'backup'
}) => {
  const { user } = useAuth();
  const { 
    students, 
    sessionRecords, 
    dailyRevisionRecords, 
    importFromTransferData, 
    saveToCloudNow,
    importBackupData,
    downloadBackupFile
  } = useQuran();

  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'send' | 'receive'>(initialTab);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [backupActionMsg, setBackupActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Send State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Receive State
  const [incomingTransfers, setIncomingTransfers] = useState<TransferPackage[]>([]);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [manualCodeOrEmail, setManualCodeOrEmail] = useState('');
  const [isSearchingManual, setIsSearchingManual] = useState(false);
  const [foundPackage, setFoundPackage] = useState<TransferPackage | null>(null);
  const [receiveMessage, setReceiveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Offline backup JSON
  const [jsonInput, setJsonInput] = useState('');
  const [jsonMode, setJsonMode] = useState<'replace' | 'merge'>('replace');

  // Load incoming transfers for current user's email
  useEffect(() => {
    if (!isOpen || !user?.email) return;

    const fetchIncoming = async () => {
      setIsLoadingIncoming(true);
      try {
        const userEmailClean = user.email!.toLowerCase().trim();
        const q = query(
          collection(db, 'transfers'),
          where('targetEmail', '==', userEmailClean)
        );
        const snapshot = await safeGetDocs(q);
        const list: TransferPackage[] = [];
        if (snapshot) {
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
        }
        setIncomingTransfers(list);
      } catch (err) {
        console.error('Error fetching incoming transfers:', err);
      } finally {
        setIsLoadingIncoming(false);
      }
    };

    fetchIncoming();
  }, [isOpen, user?.email]);

  if (!isOpen) return null;

  // Handle JSON File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = parseBackupJson(content);
      if (!res.success || !res.data) {
        setBackupActionMsg({
          type: 'error',
          text: res.error || 'الملف المرفوع لا يحتوي على صيغة نسخ احتياطي صحيحة.',
        });
        return;
      }

      const data = res.data;
      if (window.confirm(`تم قراءة الملف بنجاح! يحتوي على ${data.students.length} طالب.\nهل تريد تطبيق الاستيراد بنمط (${jsonMode === 'replace' ? 'استبدال كامل' : 'دمج مع الحاليين'})؟`)) {
        await importBackupData(data, jsonMode);
        setBackupActionMsg({
          type: 'success',
          text: `تم استيراد واستعادة ${data.students.length} طالب بنجاح! تم حفظها محلياً وسحابياً.`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Send to Account
  const handleSendToAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('يجب تسجيل الدخول أولاً للتمكن من نقل الحساب سحابياً');
      return;
    }

    const cleanEmail = recipientEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح للمشرف المستلم');
      return;
    }

    if (cleanEmail === user.email?.toLowerCase()) {
      alert('لا يمكنك إرسال البيانات لنفس بريدك الحالي');
      return;
    }

    setIsSending(true);
    setSendSuccessMessage(null);
    setGeneratedCode(null);

    try {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const payload: Omit<TransferPackage, 'id'> = {
        senderEmail: user.email || 'unknown',
        senderName: user.displayName || user.email?.split('@')[0] || 'المشرف',
        targetEmail: cleanEmail,
        code: randomCode,
        studentsCount: students.length,
        sessionsCount: sessionRecords.length,
        revisionsCount: dailyRevisionRecords.length,
        createdAt: new Date().toISOString(),
        data: {
          students,
          sessionRecords,
          dailyRevisionRecords,
        }
      };

      await safeAddDoc(collection(db, 'transfers'), payload);

      setGeneratedCode(randomCode);
      setSendSuccessMessage(`تم إرسال حزمة بيانات الحلقة (${students.length} طالب) إلى البريد (${cleanEmail}) بنجاح.`);
      setRecipientEmail('');
    } catch (err: any) {
      console.error('Transfer send error:', err);
      alert('حدث خطأ أثناء إرسال البيانات: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsSending(false);
    }
  };

  // Handle Manual Code Search
  const handleSearchManualCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryTerm = manualCodeOrEmail.trim().toUpperCase();
    if (!queryTerm) return;

    setIsSearchingManual(true);
    setFoundPackage(null);
    setReceiveMessage(null);

    try {
      let q = query(collection(db, 'transfers'), where('code', '==', queryTerm));
      let snap = await safeGetDocs(q);

      if (!snap || snap.empty) {
        q = query(collection(db, 'transfers'), where('senderEmail', '==', manualCodeOrEmail.trim().toLowerCase()));
        snap = await safeGetDocs(q);
      }

      if (snap && !snap.empty) {
        const docSnap = snap.docs[0];
        setFoundPackage({ id: docSnap.id, ...(docSnap.data() as any) });
      } else {
        setReceiveMessage({
          type: 'error',
          text: 'لم يتم العثور على أي حلقة مشاركة بهذا الرمز أو البريد. تأكد من صحة الرمز.',
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setReceiveMessage({
        type: 'error',
        text: 'حدث خطأ أثناء البحث عن الحلقة: ' + err.message,
      });
    } finally {
      setIsSearchingManual(false);
    }
  };

  // Handle Execute Import from Cloud Package
  const handleExecuteImport = async (pkg: TransferPackage, mode: 'replace' | 'merge') => {
    if (!window.confirm(
      mode === 'replace'
        ? `هل أنت متأكد من استبدال كافة طلابك الحاليين (${students.length} طالب) ببيانات هذه الحلقة (${pkg.studentsCount} طالب)؟`
        : `هل أنت متأكد من دمج ${pkg.studentsCount} طالب مع طلابك الحاليين؟`
    )) {
      return;
    }

    setIsImporting(true);
    try {
      await importBackupData(pkg.data, mode);
      try {
        await deleteDoc(doc(db, 'transfers', pkg.id));
      } catch (delErr) {
        console.warn('Could not auto-delete transfer document:', delErr);
      }

      setReceiveMessage({
        type: 'success',
        text: `تم استيراد ${pkg.studentsCount} طالب بنجاح وحفظها محلياً وسحابياً!`,
      });
      setIncomingTransfers(prev => prev.filter(t => t.id !== pkg.id));
      setFoundPackage(null);
    } catch (err: any) {
      console.error('Import error:', err);
      setReceiveMessage({
        type: 'error',
        text: 'حدث خطأ أثناء الاستيراد: ' + (err.message || 'يرجى المحاولة مرة أخرى'),
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/80 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Amiri',serif] flex items-center gap-2">
                <span>النسخ الاحتياطي والاستعادة ونقل البيانات</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-sans px-2 py-0.5 rounded-full border border-emerald-500/40">
                  حماية متقدمة
                </span>
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                نسخ احتياطي محلي، استعادة فورية، حماية من فقد البيانات، وتصدير كامل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Data Summary Strip */}
        <div className="bg-stone-100 border-b border-stone-200 px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 text-stone-700">
            <span className="flex items-center gap-1.5 font-bold">
              <Users className="w-4 h-4 text-emerald-600" />
              الطلاب الحاليين: <span className="text-emerald-700 font-mono text-sm">{students.length}</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600 hidden sm:flex">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              جلسات التسميع: <span className="font-mono">{sessionRecords.length}</span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-600 hidden md:flex">
              <CheckSquare className="w-3.5 h-3.5 text-stone-400" />
              سجلات الورد: <span className="font-mono">{dailyRevisionRecords.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              بياناتك محمية من الحذف
            </span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="bg-stone-50 border-b border-stone-200 px-4 pt-2 flex items-center gap-1 sm:gap-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveSubTab('backup'); setBackupActionMsg(null); }}
            className={`pb-2.5 px-3 sm:px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'backup'
                ? 'border-emerald-600 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>النسخ الاحتياطي والاستعادة (ملف JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('send'); setReceiveMessage(null); }}
            className={`pb-2.5 px-3 sm:px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'send'
                ? 'border-emerald-600 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>نقل لحساب آخر</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('receive'); setReceiveMessage(null); }}
            className={`pb-2.5 px-3 sm:px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all whitespace-nowrap ${
              activeSubTab === 'receive'
                ? 'border-emerald-600 text-emerald-800 font-extrabold bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>استلام من مشرف</span>
            {incomingTransfers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                {incomingTransfers.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Action Notification Banner */}
          {backupActionMsg && (
            <div className={`p-3.5 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
              backupActionMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {backupActionMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="flex-1">{backupActionMsg.text}</span>
              <button 
                type="button" 
                onClick={() => setBackupActionMsg(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 1: JSON BACKUP & RESTORE */}
          {activeSubTab === 'backup' && (
            <div className="space-y-6">
              
              {/* Anti-Data-Loss Safety Guarantee Notice */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950">
                    ضمان سلامة بيانات الطلاب وحمايتها من الحذف:
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    بيانات الطلاب ({students.length} طالب) وكافة جلسات التسميع وأوراد المراجعة محفوظة بشكل دائم في التخزين المحلي وفي السحابة، ولن يتم حذف أي طالب عند تعديل التطبيق أو إعادة نشره. يمكنك هنا تصدير ملف نسخة احتياطية (.json) أو استعادة البيانات في أي وقت.
                  </p>
                </div>
              </div>

              {/* Export Full Current Data Button */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>تصدير نسخة احتياطية كاملة إلى ملف (JSON)</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1">
                    يحفظ ملف .json على جهازك الشخصي يحوي كافة الطلاب ({students.length}) والجلسات والورد مع تاريخ وساعة التصدير.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadBackupFile()}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف النسخة الاحتياطية (.json)</span>
                </button>
              </div>

              {/* Import Options Mode: Replace or Merge */}
              <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span>استيراد واستعادة من ملف احتياطي (JSON)</span>
                  </h3>
                  
                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setJsonMode('replace')}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                        jsonMode === 'replace' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      استبدال كامل
                    </button>
                    <button
                      type="button"
                      onClick={() => setJsonMode('merge')}
                      className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                        jsonMode === 'merge' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      دمج مع الحاليين
                    </button>
                  </div>
                </div>

                {/* Drag & Drop / File Browser */}
                <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-2 bg-stone-50/50 transition-colors">
                  <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-bold text-stone-700">اختر ملف نسخة احتياطية من جهازك (.json)</p>
                  <p className="text-[11px] text-stone-500">سيتم تطبيق نمط: {jsonMode === 'replace' ? 'استبدال كامل للبيانات' : 'دمج ذكي مع الطلاب الحاليين'}</p>
                  <label className="inline-block mt-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors">
                    <span>استعراض الملفات</span>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Paste JSON Text Directly */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-bold text-stone-700">
                    أو الصق نص البيانات الاحتياطية (JSON) مباشرة:
                  </label>
                  <textarea
                    rows={4}
                    placeholder="الصق نص ملف الـ JSON هنا..."
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full p-3 font-mono text-[11px] bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={!jsonInput.trim()}
                      onClick={async () => {
                        const res = parseBackupJson(jsonInput);
                        if (!res.success || !res.data) {
                          setBackupActionMsg({
                            type: 'error',
                            text: res.error || 'نص البيانات المدخل غير صالح. تأكد من نسخ ملف JSON كاملاً.',
                          });
                          return;
                        }
                        const data = res.data;
                        if (window.confirm(`تم قراءة البيانات بنجاح! تحتوي على ${data.students.length} طالب.\nهل تريد تطبيق الاستيراد بنمط (${jsonMode === 'replace' ? 'استبدال كامل' : 'دمج مع الحاليين'})؟`)) {
                          await importBackupData(data, jsonMode);
                          setJsonInput('');
                          setBackupActionMsg({
                            type: 'success',
                            text: `تم استيراد واستعادة ${data.students.length} طالب بنجاح!`,
                          });
                        }
                      }}
                      className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      استيراد وتطبيق النص الآن
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: SEND / SHARE TO ANOTHER ACCOUNT */}
          {activeSubTab === 'send' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-950">
                    نقل الحلقة بأكملها إلى حساب بريد إلكتروني آخر:
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    عند إدخال البريد الإلكتروني للمشرف المستلم، سيتم إنشاء حزمة مشفرة تحتوي على جميع الطلاب ({students.length} طالب) وسجلاتهم ورموز تسجيل دخولهم. سيتمكن المشرف الآخر من استلامها فور تسجيل دخوله.
                  </p>
                </div>
              </div>

              {sendSuccessMessage && (
                <div className="bg-emerald-100 border border-emerald-300 rounded-2xl p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{sendSuccessMessage}</span>
                  </div>
                  {generatedCode && (
                    <div className="bg-white/80 border border-emerald-300 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-500 block">رمز الاستلام السريع للمشرف:</span>
                        <span className="font-mono text-base font-extrabold text-stone-900 tracking-wider">
                          {generatedCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'تم النسخ' : 'نسخ الرمز'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendToAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    البريد الإلكتروني للمشرف المستلم:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="supervisor@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    يجب أن يكون المشرف المستلم قد سجل دخوله بهذا البريد في التطبيق.
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSending || !recipientEmail}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-2"
                  >
                    {isSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>إرسال حزمة الحلقة للحساب المحدد</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: RECEIVE FROM ANOTHER ACCOUNT */}
          {activeSubTab === 'receive' && (
            <div className="space-y-5">
              
              {receiveMessage && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
                  receiveMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {receiveMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{receiveMessage.text}</span>
                </div>
              )}

              {/* Automatic Incoming Transfers for Current Logged in Email */}
              {user?.email && (
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>الحلقات المرسلة إلى حسابك ({incomingTransfers.length})</span>
                  </h3>

                  {isLoadingIncoming ? (
                    <div className="p-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>جارِ فحص الحلقات المرسلة إلى حسابك...</span>
                    </div>
                  ) : incomingTransfers.length === 0 ? (
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center text-xs text-stone-500">
                      لا توجد حلقات مرسلة لبريدك حالياً. يمكنك البحث برمز الحلقة أدناه إذا أرسل لك مشرف رمزاً.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {incomingTransfers.map((pkg) => (
                        <div key={pkg.id} className="bg-stone-50 border border-stone-200 hover:border-emerald-300 rounded-2xl p-4 transition-all space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-stone-900">
                                مرسلة من: {pkg.senderName} ({pkg.senderEmail})
                              </h4>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                تحتوي على {pkg.studentsCount} طالباً • {pkg.sessionsCount} جلسة تسميع • {pkg.revisionsCount} تدوين ورد.
                              </p>
                              <span className="text-[10px] text-stone-400 mt-1 block">
                                أُرسلت بتاريخ: {new Date(pkg.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            </div>
                            <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg">
                              رمز: {pkg.code}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              disabled={isImporting}
                              onClick={() => handleExecuteImport(pkg, 'replace')}
                              className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                            >
                              استبدال كامل ببيانات هذه الحلقة
                            </button>
                            <button
                              type="button"
                              disabled={isImporting}
                              onClick={() => handleExecuteImport(pkg, 'merge')}
                              className="flex-1 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 cursor-pointer transition-colors"
                            >
                              دمج مع طلابي الحاليين
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Code Search Option */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span>أو استيراد يدوي برمز المشاركة</span>
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    إذا زوّدك مشرف برمز مشاركة مكون من 6 خانات، أدخله هنا:
                  </p>
                </div>

                <form onSubmit={handleSearchManualCode} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: AB12XY أو بريد المشرف"
                    value={manualCodeOrEmail}
                    onChange={(e) => setManualCodeOrEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:border-emerald-600 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingManual || !manualCodeOrEmail.trim()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {isSearchingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'بحث'}
                  </button>
                </form>

                {foundPackage && (
                  <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-950">
                          تم العثور على الحلقة: {foundPackage.senderName} ({foundPackage.senderEmail})
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          تحتوي على {foundPackage.studentsCount} طالب و {foundPackage.sessionsCount} جلسة تسميع.
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold bg-emerald-200/70 text-emerald-900 px-2 py-1 rounded-md">
                        {foundPackage.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isImporting}
                        onClick={() => handleExecuteImport(foundPackage, 'replace')}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                      >
                        استبدال كامل ببيانات هذه الحلقة
                      </button>
                      <button
                        type="button"
                        disabled={isImporting}
                        onClick={() => handleExecuteImport(foundPackage, 'merge')}
                        className="flex-1 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs rounded-xl border border-emerald-300 cursor-pointer transition-colors"
                      >
                        دمج مع طلابي الحاليين
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            حلقة جامع السرور • نظام إدارة وحفظ البيانات
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
