import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuran } from '../context/QuranContext';
import { db } from '../firebase';
import { safeAddDoc, safeGetDocs } from '../utils/firestoreHelper';
import { collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { 
  Send, Download, Upload, Copy, Check, Mail, Key, Users, 
  RefreshCw, AlertCircle, CheckCircle2, X, ArrowRight, ShieldCheck, Database
} from 'lucide-react';
import { Student, SessionRecord, DailyRevisionRecord } from '../types/quran';

interface AccountTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AccountTransferModal: React.FC<AccountTransferModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { 
    students, 
    sessionRecords, 
    dailyRevisionRecords, 
    importFromTransferData, 
    saveToCloudNow 
  } = useQuran();

  const [activeSubTab, setActiveSubTab] = useState<'send' | 'receive' | 'offline'>('send');

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
  const [copiedJson, setCopiedJson] = useState(false);

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

  // Handle Send
  const handleSendToAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('يرجى تسجيل الدخول بحسابك أولاً لإتمام النقل السحابي');
      return;
    }
    const cleanEmail = recipientEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح للحساب المستلم');
      return;
    }

    setIsSending(true);
    setSendSuccessMessage(null);
    try {
      // 6-character random verification code
      const code = 'QS-' + Math.floor(100000 + Math.random() * 900000);
      const payload: Omit<TransferPackage, 'id'> = {
        senderUid: user.uid,
        senderEmail: user.email || '',
        senderName: user.displayName || user.email?.split('@')[0] || 'معلم الحلقة',
        targetEmail: cleanEmail,
        code,
        studentsCount: students.length,
        sessionsCount: sessionRecords.length,
        revisionsCount: dailyRevisionRecords.length,
        createdAt: new Date().toISOString(),
        data: {
          students,
          sessionRecords,
          dailyRevisionRecords,
        },
      } as any;

      await safeAddDoc(collection(db, 'transfers'), payload);

      setGeneratedCode(code);
      setSendSuccessMessage(`تم بنجاح إرسال نسخة بيانات الحلقة (${students.length} طالب و ${sessionRecords.length} جلسة) إلى الحساب (${cleanEmail})!`);
      setRecipientEmail('');
    } catch (err: any) {
      console.error('Send transfer error:', err);
      alert('حدث خطأ أثناء إرسال البيانات: ' + (err.message || 'يرجى التأكد من الاتصال بالإنترنت'));
    } finally {
      setIsSending(false);
    }
  };

  // Handle Manual Search by Code or Sender Email
  const handleSearchManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = manualCodeOrEmail.trim().toLowerCase();
    if (!queryStr) return;

    setIsSearchingManual(true);
    setFoundPackage(null);
    setReceiveMessage(null);
    try {
      let q;
      if (queryStr.startsWith('qs-') || queryStr.length === 9) {
        // search by code
        q = query(collection(db, 'transfers'), where('code', '==', queryStr.toUpperCase()));
      } else {
        // search by sender email
        q = query(collection(db, 'transfers'), where('senderEmail', '==', queryStr));
      }

      const snap = await safeGetDocs(q);
      if (!snap || snap.empty) {
        setReceiveMessage({
          type: 'error',
          text: 'لم يتم العثور على أي حلقة مرسلة بهذا الكود أو الإيميل. تأكد من صحة المدخلات.',
        });
      } else {
        const docSnap = snap.docs[0];
        setFoundPackage({ id: docSnap.id, ...(docSnap.data() as any) });
      }
    } catch (err: any) {
      console.error('Search transfer error:', err);
      setReceiveMessage({
        type: 'error',
        text: 'تعذر جلب البيانات: ' + (err.message || 'خطأ في الاتصال'),
      });
    } finally {
      setIsSearchingManual(false);
    }
  };

  // Execute Import
  const handleExecuteImport = async (pkg: TransferPackage, mode: 'replace' | 'merge') => {
    const confirmMsg = mode === 'replace'
      ? `تحذير: هل أنت متأكد من استبدال كافة بيانات طلابك الحالية ببيانات هذه الحلقة (${pkg.studentsCount} طالب)؟`
      : `هل تريد دمج طلاب وسجلات هذه الحلقة (${pkg.studentsCount} طالب) مع طلابك الحاليين؟`;

    if (!window.confirm(confirmMsg)) return;

    setIsImporting(true);
    setReceiveMessage(null);
    try {
      importFromTransferData(pkg.data, mode);
      await saveToCloudNow();

      setReceiveMessage({
        type: 'success',
        text: `تم استيراد ${pkg.studentsCount} طالب و ${pkg.sessionsCount} جلسة تسميع بنجاح في حسابك! تم حفظها سحابياً.`,
      });

      // Remove from incoming transfers local state
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
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/80 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-['Amiri',serif]">
                استيراد ونقل البيانات بين الحسابات
              </h2>
              <p className="text-xs text-emerald-400 mt-0.5">
                نقل كافة بيانات الطلاب (50 طالباً أو أكثر) والجلسات والورد بين الحسابات بضغطة زر
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

        {/* Sub Navigation Tabs */}
        <div className="bg-stone-100/90 border-b border-stone-200 px-4 pt-2 flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveSubTab('send'); setReceiveMessage(null); }}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === 'send'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>إرسال ونقل لحساب آخر</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('receive'); setReceiveMessage(null); }}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === 'receive'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>استيراد من حساب آخر</span>
            {incomingTransfers.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                {incomingTransfers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => { setActiveSubTab('offline'); setReceiveMessage(null); }}
            className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 cursor-pointer transition-all ${
              activeSubTab === 'offline'
                ? 'border-emerald-600 text-emerald-800 font-extrabold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>نسخ احتياطي واستعادة</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: SEND / SHARE TO ANOTHER ACCOUNT */}
          {activeSubTab === 'send' && (
            <div className="space-y-5">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>نقل نسخة شاملة من حلقتك الحالية</span>
                </div>
                <p className="leading-relaxed">
                  سيتم إنشاء حزمة سحابية آمنة تتضمن كافة طلابك الحاليين (<strong>{students.length} طالب</strong>)، 
                  مع كامل سجلات التسميع (<strong>{sessionRecords.length} جلسة</strong>)، وجميع أيام الورد اليومي، 
                  وإتاحتها فوراً للحساب الذي تدخله.
                </p>
              </div>

              {sendSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-800 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{sendSuccessMessage}</span>
                  </div>
                  {generatedCode && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-stone-500 block">كود النقل السريع للحلقة:</span>
                        <span className="font-mono text-base font-bold text-emerald-700 tracking-wider">
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
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'تم النسخ' : 'نسخ الكود'}</span>
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] text-emerald-700">
                    يمكن للمستلم الدخول بحسابه وفتح نافذة "استيراد من حساب آخر"؛ وسيجد الحلقة في انتظاره مباشرة، أو يمكنه استخدام كود النقل أعلاه.
                  </p>
                </div>
              )}

              <form onSubmit={handleSendToAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    البريد الإلكتروني للحساب المراد نقل البيانات إليه:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="مثال: teacher2@gmail.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full pl-3 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    يمكنك إدخال إيميل حساب المعلم الآخر الذي يدخل به في التطبيق.
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                  <span>الطلاب الجاهزون للنقل:</span>
                  <span className="font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                    {students.length} طالب
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSending || students.length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جارِ تجهيز وإرسال البيانات سحابياً...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>إرسال ونقل حزمة الحلقة الآن</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: RECEIVE / IMPORT FROM ANOTHER ACCOUNT */}
          {activeSubTab === 'receive' && (
            <div className="space-y-6">
              
              {/* Feedback Alert */}
              {receiveMessage && (
                <div className={`p-4 rounded-2xl text-xs border flex items-start gap-2.5 ${
                  receiveMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  {receiveMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold text-xs">{receiveMessage.text}</p>
                  </div>
                </div>
              )}

              {/* Incoming to my email */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>حلقات مرسلة ومخصصة لبريدك الإلكتروني ({user?.email || 'غير مسجل'}):</span>
                  </h3>
                  {isLoadingIncoming && (
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> جارِ الفحص...
                    </span>
                  )}
                </div>

                {incomingTransfers.length === 0 ? (
                  <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-center text-xs text-stone-500">
                    لا توجد حلقات معلقة مرسلة إلى بريدك حالياً. يمكنك البحث بكود النقل أدناه.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingTransfers.map((pkg) => (
                      <div key={pkg.id} className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-stone-900 block">
                              حلقة من: {pkg.senderName} ({pkg.senderEmail})
                            </span>
                            <span className="text-[11px] text-stone-500 mt-0.5 block">
                              تاريخ الإرسال: {new Date(pkg.createdAt).toLocaleDateString('ar-SA')} | كود: {pkg.code}
                            </span>
                          </div>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                            {pkg.studentsCount} طالب
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 flex items-center justify-between">
                          <span>سجلات التسميع المرفقة: <strong>{pkg.sessionsCount}</strong></span>
                          <span>سجلات الورد: <strong>{pkg.revisionsCount}</strong></span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleExecuteImport(pkg, 'replace')}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors text-center"
                          >
                            استبدال كامل ببيانات هذه الحلقة
                          </button>
                          <button
                            type="button"
                            disabled={isImporting}
                            onClick={() => handleExecuteImport(pkg, 'merge')}
                            className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl border border-stone-300 cursor-pointer transition-colors text-center"
                          >
                            دمج مع طلابي الحاليين
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual Search by code or sender email */}
              <div className="border-t border-stone-200 pt-5 space-y-3">
                <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>أو ابحث عن حلقة عبر كود النقل السريع أو بريد المعلم المرسل:</span>
                </h3>

                <form onSubmit={handleSearchManual} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="مثال: QS-123456 أو ahmed@gmail.com"
                    value={manualCodeOrEmail}
                    onChange={(e) => setManualCodeOrEmail(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingManual || !manualCodeOrEmail.trim()}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
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

          {/* TAB 3: OFFLINE BACKUP / RESTORE */}
          {activeSubTab === 'offline' && (
            <div className="space-y-4 text-xs">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-stone-800 text-sm block">النسخ الاحتياطي اليدوي الكامل (JSON)</span>
                <p className="text-stone-500 leading-relaxed">
                  يمكنك أيضاً نسخ نص بيانات الحلقة كاملاً أو حفظه في ملف واستعادته في أي وقت بدون إنترنت.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-stone-700">استعادة من نص JSON أو ملف احتياطي:</label>
                <textarea
                  rows={4}
                  placeholder="الصق نص البيانات الاحتياطية هنا..."
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-3 font-mono text-[11px] bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  disabled={!jsonInput.trim()}
                  onClick={async () => {
                    try {
                      const parsed = JSON.parse(jsonInput);
                      if (!parsed.students || !Array.isArray(parsed.students)) {
                        throw new Error('صيغة البيانات غير صحيحة');
                      }
                      importFromTransferData(parsed, 'replace');
                      await saveToCloudNow();
                      alert(`تم استيراد ${parsed.students.length} طالب بنجاح!`);
                      setJsonInput('');
                    } catch (err: any) {
                      alert('خطأ في استيراد البيانات: ' + err.message);
                    }
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-colors"
                >
                  استعادة وتطبيق البيانات الآن
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3.5 flex justify-end">
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
