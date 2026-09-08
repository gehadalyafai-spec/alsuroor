import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  SupervisorConfig, 
  MASTER_ADMIN_EMAIL, 
  getLocalSupervisorConfig, 
  loadSupervisorConfigFromCloud, 
  updateSupervisorConfigInCloud, 
  isEmailAuthorizedSupervisor, 
  verifySupervisorPasscode 
} from '../utils/supervisorAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorizedSupervisor: boolean;
  supervisorConfig: SupervisorConfig;
  authError: string | null;
  clearError: () => void;
  loginWithGoogle: (passcodeIfNew?: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string, passcodeIfNew?: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string, name?: string, supervisorPasscode?: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authorizeWithPasscode: (passcode: string) => Promise<boolean>;
  reloadSupervisorConfig: () => Promise<SupervisorConfig>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [supervisorConfig, setSupervisorConfig] = useState<SupervisorConfig>(getLocalSupervisorConfig());
  const [isAuthorizedSupervisor, setIsAuthorizedSupervisor] = useState<boolean>(false);

  // Sync config on load
  const reloadSupervisorConfig = useCallback(async (): Promise<SupervisorConfig> => {
    try {
      const cfg = await loadSupervisorConfigFromCloud();
      setSupervisorConfig(cfg);
      return cfg;
    } catch {
      const local = getLocalSupervisorConfig();
      setSupervisorConfig(local);
      return local;
    }
  }, []);

  // Check supervisor authorization on auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        // تحويل البريد القادم من الجلسة دائماً إلى حروف صغيرة
        const cleanEmail = currentUser.email.trim().toLowerCase();
        const latestCfg = await loadSupervisorConfigFromCloud();
        setSupervisorConfig(latestCfg);
        const authorized = isEmailAuthorizedSupervisor(cleanEmail, latestCfg);
        setIsAuthorizedSupervisor(authorized);
      } else {
        setIsAuthorizedSupervisor(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearError = () => setAuthError(null);

  const translateAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
    }
    if (code.includes('email-already-in-use')) {
      return 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول بدلاً من ذلك';
    }
    if (code.includes('weak-password')) {
      return 'كلمة المرور ضعيفة، يجب ألا تقل عن 6 أحرف';
    }
    if (code.includes('invalid-email')) {
      return 'صيغة البريد الإلكتروني غير صحيحة';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'تم إلغاء نافذة تسجيل الدخول بجوجل';
    }
    if (code.includes('network-request-failed')) {
      return 'تعذر الاتصال بالشبكة، يرجى التحقق من اتصال الإنترنت';
    }
    return err?.message || 'حدث خطأ أثناء تسجيل الدخول';
  };

  const verifyAndAddSupervisorIfPasscodeMatches = async (email: string, passcode?: string): Promise<boolean> => {
    const latestCfg = await reloadSupervisorConfig();
    const cleanEmail = email.trim().toLowerCase();

    // Already authorized
    if (isEmailAuthorizedSupervisor(cleanEmail, latestCfg)) {
      setIsAuthorizedSupervisor(true);
      return true;
    }

    // Check passcode
    if (passcode && verifySupervisorPasscode(passcode, latestCfg)) {
      const updatedList = Array.from(new Set([...latestCfg.authorizedEmails, cleanEmail]));
      const newConfig = await updateSupervisorConfigInCloud({ authorizedEmails: updatedList }, cleanEmail);
      setSupervisorConfig(newConfig);
      setIsAuthorizedSupervisor(true);
      return true;
    }

    setIsAuthorizedSupervisor(false);
    return false;
  };

  const loginWithGoogle = async (passcodeIfNew?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user?.email) {
        const isAuth = await verifyAndAddSupervisorIfPasscodeMatches(result.user.email, passcodeIfNew);
        if (!isAuth) {
          setAuthError('عذراً، هذا الحساب غير مصرح له بالدخول كمشرف حلقة. يرجى إدخال رمز ترخيص المشرفين السري أو مراجعة إدارة الحلقة.');
          return false;
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setAuthError(translateAuthError(err));
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string, passcodeIfNew?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (result.user?.email) {
        const isAuth = await verifyAndAddSupervisorIfPasscodeMatches(result.user.email, passcodeIfNew);
        if (!isAuth) {
          setAuthError('عذراً، هذا الحساب غير مصرح له بالدخول كمشرف حلقة. يرجى إدخال رمز ترخيص المشرفين السري أو مراجعة إدارة الحلقة.');
          return false;
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Email Login Error:', err);
      setAuthError(translateAuthError(err));
      throw err;
    }
  };

  const registerWithEmail = async (
    email: string, 
    pass: string, 
    name?: string, 
    supervisorPasscode?: string
  ): Promise<boolean> => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const latestCfg = await reloadSupervisorConfig();

    // Check passcode upfront if registering a new supervisor
    const isOwner = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();
    const isWhitelisted = isEmailAuthorizedSupervisor(cleanEmail, latestCfg);
    const hasValidPasscode = supervisorPasscode && verifySupervisorPasscode(supervisorPasscode, latestCfg);

    if (!isOwner && !isWhitelisted && !hasValidPasscode) {
      const errText = 'عذراً، لا يمكن تسجيل حساب مشرف جديد دون إدخال رمز ترخيص المشرفين السري المعتمد.';
      setAuthError(errText);
      throw new Error(errText);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (name && name.trim() && cred.user) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      if (cred.user?.email) {
        await verifyAndAddSupervisorIfPasscodeMatches(cred.user.email, supervisorPasscode);
      }
      return true;
    } catch (err: any) {
      console.error('Email Register Error:', err);
      setAuthError(translateAuthError(err));
      throw err;
    }
  };

  const authorizeWithPasscode = async (passcode: string): Promise<boolean> => {
    setAuthError(null);
    if (!user?.email) {
      setAuthError('يرجى تسجيل الدخول أولاً');
      return false;
    }

    const matched = await verifyAndAddSupervisorIfPasscodeMatches(user.email, passcode);
    if (!matched) {
      setAuthError('رمز ترخيص المشرفين المدخل غير صحيح، يرجى التأكد من الرمز من المشرف العام.');
      return false;
    }
    return true;
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      console.error('Reset Password Error:', err);
      setAuthError(translateAuthError(err));
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    setIsAuthorizedSupervisor(false);
    try {
      await fbSignOut(auth);
    } catch (err: any) {
      console.error('Logout Error:', err);
      setAuthError(translateAuthError(err));
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthorizedSupervisor,
        supervisorConfig,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        resetPassword,
        logout,
        authorizeWithPasscode,
        reloadSupervisorConfig,
        authError,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

