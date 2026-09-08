import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuran } from '../context/QuranContext';
import { 
  BookOpen, Mail, Lock, User, ArrowLeft, CheckCircle2, 
  Cloud, Sparkles, ShieldCheck, RefreshCw, KeyRound, AlertCircle, LogIn, UserPlus,
  GraduationCap, ShieldAlert, Key
} from 'lucide-react';

interface AuthViewProps {
  onContinueAsGuest?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onContinueAsGuest }) => {
  const { 
    user,
    isAuthorizedSupervisor,
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    resetPassword, 
    authorizeWithPasscode,
    logout,
    authError, 
    clearError 
  } = useAuth();
  const { students, loginAsStudent } = useQuran();

  // Primary portal selection: supervisor vs student
  const [userType, setUserType] = useState<'supervisor' | 'student'>('supervisor');

  // Supervisor auth state
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [supervisorPasscode, setSupervisorPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Student auth state
  const [studentCode, setStudentCode] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [studentLoginError, setStudentLoginError] = useState<string | null>(null);
  const [targetStudentName, setTargetStudentName] = useState<string | null>(null);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentLoginError(null);
    const code = studentCode.trim();
    if (!code) {
      setStudentLoginError('يرجى إدخال رمز الطالب أو رقم هاتفه الخاص به');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAsStudent(code, studentPin);
      if (!res.success) {
        if (res.requiresPin) {
          setShowPinInput(true);
          if (res.studentName) setTargetStudentName(res.studentName);
        }
        setStudentLoginError(res.message || `لم يتم العثور على طالب برمز "${code}". يرجى مراجعة مشرف الحلقة للحصول على الرمز الصحيح.`);
      } else {
        if (onContinueAsGuest) {
          onContinueAsGuest();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password, supervisorPasscode);
      } else if (mode === 'register') {
        if (!password || password.length < 6) {
          alert('كلمة المرور يجب ألا تقل عن 6 أحرف');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, name, supervisorPasscode);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح.');
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setIsSubmitting(true);
    try {
      await loginWithGoogle(supervisorPasscode);
    } catch {
      // Error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorizeCurrentSession = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!supervisorPasscode.trim()) return;

    setIsSubmitting(true);
    try {
      const ok = await authorizeWithPasscode(supervisorPasscode);
      if (ok) {
        setSuccessMessage('تم اعتماد وترخيص حسابك كمشرف بنجاح!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center p-4 text-stone-100 font-['Cairo',sans-serif]">
      {/* Container */}
      <div className="w-full max-w-md my-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 items-center justify-center text-white shadow-xl shadow-emerald-950/50 border border-emerald-500/30">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Amiri',serif] tracking-wide text-white">
              جامع السرور
            </h1>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              حلقة القرآن الكريم • تدوين التسميع والورد اليومي
            </p>
          </div>
          <p className="text-xs text-stone-300 max-w-xs mx-auto leading-relaxed">
            منظومة إلكترونية خاصة لتوثيق ومتابعة حفظ القرآن الكريم للطلاب والمشرفين المعتمدين
          </p>
        </div>

        {/* Primary Role Switcher: Supervisor vs Student */}
        <div className="flex bg-stone-900/90 p-1.5 rounded-2xl border border-stone-700/80 shadow-lg">
          <button
            type="button"
            id="auth-role-supervisor-btn"
            onClick={() => setUserType('supervisor')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              userType === 'supervisor'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>مشرف الحلقة (المعلّم)</span>
          </button>

          <button
            type="button"
            id="auth-role-student-btn"
            onClick={() => setUserType('student')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              userType === 'student'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>طالب في الحلقة</span>
          </button>
        </div>

        {/* Card */}
        <div className="bg-stone-800/90 border border-stone-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
          
          {/* 1. STUDENT LOGIN VIEW */}
          {userType === 'student' ? (
            <div className="space-y-4 text-right">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-700/50 mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-white">دخول بوابة الطالب الآمنة</h3>
                <p className="text-xs text-stone-300">
                  أدخل كود الدخول الخاص بك (والرقم السري PIN إن وُجد) لمتابعة حفظك ووردك اليومي
                </p>
              </div>

              {studentLoginError && (
                <div className="bg-rose-950/80 border border-rose-700/60 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    {targetStudentName && (
                      <div className="font-bold text-white mb-0.5">الطالب: {targetStudentName}</div>
                    )}
                    <span>{studentLoginError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    كود دخول الطالب (Student Access Code):
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => {
                        setStudentCode(e.target.value);
                        setStudentLoginError(null);
                      }}
                      placeholder="مثال: STU-1001 أو 1001 أو رقم الهاتف"
                      className="w-full pr-9 pl-3 py-2.5 text-sm bg-stone-900 border border-stone-700 rounded-xl text-amber-300 font-mono font-bold tracking-wider placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    احصل على كود الدخول الخاص بك من مشرف الحلقة
                  </p>
                </div>

                {/* Optional or Required PIN field */}
                {(showPinInput || true) && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>الرقم السري للطالب (PIN):</span>
                      </label>
                      <span className="text-[10px] text-stone-400">
                        {showPinInput ? 'مطلوب لهذا الحساب' : 'اختياري إذا عيّنه المشرف'}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={6}
                        value={studentPin}
                        onChange={(e) => {
                          setStudentPin(e.target.value);
                          setStudentLoginError(null);
                        }}
                        placeholder="•••• (مثلاً 1234)"
                        className={`w-full pr-9 pl-3 py-2.5 text-sm bg-stone-900 border rounded-xl text-white font-mono tracking-widest placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          showPinInput ? 'border-amber-500 ring-1 ring-amber-500/50' : 'border-stone-700'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      لحماية حسابك ومنع أي طالب آخر من الدخول وتعديل التسميع أو الورد
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  id="student-code-submit-btn"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>دخول إلى حساب الطالب</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security note for privacy */}
              <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-700/60 text-[11px] text-stone-400 space-y-1">
                <div className="font-bold text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>خصوصية وأمان الحساب</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  تم قفل أرقام الحسابات لمنع التعديل غير المصرح به على التسميع أو الورد. يُرجى مراجعة معلم الحلقة عند نسيان كود الدخول أو الـ PIN.
                </p>
              </div>
            </div>
          ) : user && !isAuthorizedSupervisor ? (
            /* 2. LOGGED IN BUT NOT AUTHORIZED AS SUPERVISOR */
            <div className="space-y-4 text-right">
              <div className="bg-amber-950/60 border border-amber-600/50 rounded-2xl p-4 text-center space-y-2">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="font-bold text-sm text-amber-200">
                  هذا الحساب غير مصرح له كمعلم أو مشرف حلقة
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  الحساب الحالي ({user.email}) ليس ضمن قائمة المعلمين المصرح لهم. للحصول على الصلاحية، يرجى إدخال رمز ترخيص المشرفين المعتمد أدناه:
                </p>
              </div>

              {authError && (
                <div className="bg-rose-950/80 border border-rose-700/60 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleAuthorizeCurrentSession} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    رمز ترخيص المشرفين (Supervisor Passcode):
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={supervisorPasscode}
                      onChange={(e) => setSupervisorPasscode(e.target.value)}
                      placeholder="أدخل الرمز السري للمشرفين..."
                      className="w-full pr-9 pl-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>تأكيد الصلاحية والدخول كمشرف</span>
                </button>
              </form>

              <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  الدخول كطالب في الحلقة
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            /* 3. SUPERVISOR LOGIN / REGISTER VIEW */
            <>
              {/* Quick Google Sign In */}
              <div>
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>تسجيل الدخول السريع بحساب Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-700 w-full"></div>
                <span className="bg-stone-800 px-3 text-[11px] text-stone-400 absolute">
                  أو بالبريد الإلكتروني
                </span>
              </div>

              {/* Mode Switch Tabs */}
              <div className="flex bg-stone-900/80 p-1 rounded-xl text-xs font-semibold text-stone-400 border border-stone-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearError();
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'login' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'hover:text-stone-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>دخول</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearError();
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'hover:text-stone-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>حساب جديد</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    clearError();
                    setSuccessMessage(null);
                  }}
                  className={`py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'forgot' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'hover:text-stone-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>نسيت الرمز</span>
                </button>
              </div>

              {/* Alerts */}
              {authError && (
                <div className="bg-rose-950/80 border border-rose-700/60 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      اسم المعلّم / المشرف:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="الشيخ / معلّم الحلقة..."
                        className="w-full pr-9 pl-3 py-2 text-xs bg-stone-900/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    البريد الإلكتروني للمشرف:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      dir="ltr"
                      className="w-full pr-9 pl-3 py-2 text-xs bg-stone-900/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-stone-300">
                        كلمة المرور:
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        dir="ltr"
                        className="w-full pr-9 pl-3 py-2 text-xs bg-stone-900/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Supervisor Passcode field for register or newly invited supervisors */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      رمز ترخيص المشرفين المعتمد (Supervisor Passcode):
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={supervisorPasscode}
                        onChange={(e) => setSupervisorPasscode(e.target.value)}
                        placeholder="رمز الترخيص الممنوح من إدارة الحلقة..."
                        className="w-full pr-9 pl-3 py-2 text-xs bg-stone-900/90 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1">
                      خاص بالمعلمين المصرح لهم فقط لمنع دخول أي شخص كمعلم
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  id="auth-submit-btn"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>تسجيل الدخول ومتابعة الحلقة</span>
                    </>
                  ) : mode === 'register' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>إنشاء حساب مشرف جديد</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>إرسال رابط إعادة تعيين كلمة المرور</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick guest bypass if needed */}
              {onContinueAsGuest && (
                <div className="pt-2 text-center border-t border-stone-700/60">
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="text-[11px] text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    المتابعة كزائر مؤقتاً (دون حفظ سحابي) ⬅️
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Feature Benefits List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-400 text-[11px] text-center">
          <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-2xl flex flex-col items-center gap-1">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-stone-200">حفظ سحابي فوري</span>
            <span className="text-[10px] text-stone-400">تُحفظ تعديلاتك تلقائياً في السحاب</span>
          </div>

          <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-2xl flex flex-col items-center gap-1">
            <RefreshCw className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-stone-200">استئناف آخر جلسة</span>
            <span className="text-[10px] text-stone-400">تفتح على نفس التاريخ والطلاب</span>
          </div>

          <div className="bg-stone-850 border border-stone-800 p-2.5 rounded-2xl flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-stone-200">حماية المشرفين</span>
            <span className="text-[10px] text-stone-400">دخول المعلمين محصور بالمصرح لهم</span>
          </div>
        </div>

      </div>
    </div>
  );
};

