/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuranProvider, useQuran } from './context/QuranContext';
import { Header } from './components/Header';
import { SessionView } from './components/SessionView';
import { DailyRevisionView } from './components/DailyRevisionView';
import { StudentsView } from './components/StudentsView';
import { QuranIndexView } from './components/QuranIndexView';
import { GuideModal } from './components/GuideModal';
import { AddStudentModal } from './components/AddStudentModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AuthView } from './components/AuthView';
import { ReportsView } from './components/ReportsView';
import { AccountTransferModal } from './components/AccountTransferModal';
import { StudentPortalView } from './components/StudentPortalView';
import { StudentSubmissionsModal } from './components/StudentSubmissionsModal';
import { SupervisorManagementModal } from './components/SupervisorManagementModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { AppSettingsModal } from './components/AppSettingsModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Calendar, CheckSquare, Users, BookOpen, HelpCircle, RefreshCw, TrendingUp } from 'lucide-react';

function AppContent() {
  const { user, isAuthorizedSupervisor, loading: loadingAuth } = useAuth();
  const { headerPreset, colorPreset } = useTheme();
  const { 
    activeTab, 
    setActiveTab, 
    selectedStudentId, 
    setSelectedStudentId, 
    isLoadingCloud,
    activeRole,
    pendingSubmissionsCount
  } = useQuran();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferInitialTab, setTransferInitialTab] = useState<'backup' | 'send' | 'receive'>('backup');
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [isSupervisorModalOpen, setIsSupervisorModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [preferStudentLogin, setPreferStudentLogin] = useState(false);

  // Loading Screen while Firebase Auth initializes
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-stone-100 font-['Cairo',sans-serif]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white mx-auto shadow-2xl border border-emerald-500/30 animate-pulse">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-['Amiri',serif]">جامع السرور</h2>
            <p className="text-xs text-emerald-400 mt-1">حلقة القرآن الكريم</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400 pt-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>جارِ التحقق من الحساب واسترجاع الجلسة...</span>
          </div>
        </div>
      </div>
    );
  }

  // If in Student Role, display the dedicated Student Portal View
  if (activeRole === 'student') {
    return (
      <StudentPortalView 
        onLogout={() => {
          setGuestMode(false);
          setPreferStudentLogin(true);
        }} 
      />
    );
  }

  // If user is logged in but NOT an authorized supervisor, block supervisor access and show the auth screen
  if (user && !isAuthorizedSupervisor) {
    return (
      <AuthView 
        onContinueAsGuest={() => setGuestMode(true)} 
        initialUserType={preferStudentLogin ? 'student' : 'supervisor'} 
      />
    );
  }

  // If user is not authenticated and has not chosen guest mode, present the login/registration view
  if (!user && !guestMode) {
    return (
      <AuthView 
        onContinueAsGuest={() => setGuestMode(true)} 
        initialUserType={preferStudentLogin ? 'student' : 'supervisor'} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-20 sm:pb-8 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Navbar */}
      <Header 
        onOpenAddModal={() => setIsAddStudentOpen(true)}
        onOpenAuthModal={!user ? () => setGuestMode(false) : undefined}
        onOpenTransferModal={(tab) => {
          setTransferInitialTab(tab || 'backup');
          setIsTransferModalOpen(true);
        }}
        onOpenSubmissionsModal={() => setIsSubmissionsModalOpen(true)}
        onOpenSupervisorModal={() => setIsSupervisorModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Pending Student Submissions Alert Banner */}
      {pendingSubmissionsCount > 0 && (
        <div 
          onClick={() => setIsSubmissionsModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-stone-950 px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-bold border-b border-amber-600 cursor-pointer hover:opacity-95 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <CheckSquare className="w-5 h-5 text-stone-950 shrink-0" />
            <span>
              لديك <strong className="bg-stone-950 text-amber-300 px-2 py-0.5 rounded-md font-mono text-xs sm:text-sm">{pendingSubmissionsCount}</strong> طلب اعتماد جديد من الطلاب (الورد اليومي / التسميع) بانتظار موافقتك
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSubmissionsModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>مراجعة واعتماد الطلبات</span>
          </button>
        </div>
      )}

      {/* Cloud loading indicator banner if restoring */}
      {isLoadingCloud && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 font-medium">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
          <span>جارِ مزامنة بيانات الحلقة واسترجاع آخر جلسة من حسابك السحابي...</span>
        </div>
      )}

      {/* Guest warning banner if using without cloud account */}
      {!user && guestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2 text-xs flex items-center justify-between gap-2">
          <span>أنت تستخدم التطبيق كزائر. لن يتم حفظ التعديلات سحابياً للرجوع إليها لاحقاً.</span>
          <button
            type="button"
            onClick={() => setGuestMode(false)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0"
          >
            تسجيل الدخول بالحساب الآن
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'sessions' && (
          <SessionView onOpenStudentModal={(id) => setSelectedStudentId(id)} />
        )}

        {activeTab === 'revision' && (
          <DailyRevisionView onOpenStudentModal={(id) => setSelectedStudentId(id)} />
        )}

        {activeTab === 'students' && (
          <StudentsView
            onOpenAddModal={() => setIsAddStudentOpen(true)}
            onOpenStudentModal={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'quranIndex' && (
          <QuranIndexView onOpenStudentModal={(id) => setSelectedStudentId(id)} />
        )}

        {activeTab === 'guide' && <GuideModal />}
      </main>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className={`sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t py-1.5 px-2 flex justify-around items-center shadow-lg transition-colors duration-200 ${headerPreset.headerClass}`}>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'sessions' ? `${colorPreset.text} font-bold` : headerPreset.textSubClass
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>التسميع</span>
        </button>

        <button
          onClick={() => setActiveTab('revision')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'revision' ? `${colorPreset.text} font-bold` : headerPreset.textSubClass
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>الورد</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'students' ? `${colorPreset.text} font-bold` : headerPreset.textSubClass
          }`}
        >
          <Users className="w-4 h-4" />
          <span>الطلاب</span>
        </button>

        <button
          onClick={() => setActiveTab('quranIndex')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'quranIndex' ? `${colorPreset.text} font-bold` : headerPreset.textSubClass
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>المصحف</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'guide' ? `${colorPreset.text} font-bold` : headerPreset.textSubClass
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>الدليل</span>
        </button>
      </nav>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Cross-Account Data Transfer & Local Backup Modal */}
      <AccountTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialTab={transferInitialTab}
      />

      {/* Student Submissions Approvals Modal for Supervisor */}
      {isSubmissionsModalOpen && (
        <StudentSubmissionsModal
          onClose={() => setIsSubmissionsModalOpen(false)}
        />
      )}

      {/* Supervisor Authorization Management Modal */}
      <SupervisorManagementModal
        isOpen={isSupervisorModalOpen}
        onClose={() => setIsSupervisorModalOpen(false)}
      />

      {/* Student Profile & History Modal */}
      {selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
        />
      )}

      {/* Gemini 3.8 Flash Quran Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        defaultStudentId={selectedStudentId}
      />

      {/* App Appearance & Theme Settings Modal */}
      <AppSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuranProvider>
          <AppContent />
        </QuranProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
