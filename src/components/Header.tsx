import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, Calendar, CheckSquare, HelpCircle, Plus, 
  Download, Upload, RotateCcw, Cloud, CloudOff, 
  RefreshCw, LogOut, User, Check, AlertTriangle, ShieldCheck,
  TrendingUp, ArrowLeftRight, Database, FileSpreadsheet, ShieldAlert, KeyRound, Sparkles,
  Palette, Sliders, Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenAuthModal?: () => void;
  onOpenTransferModal?: () => void;
  onOpenSubmissionsModal?: () => void;
  onOpenSupervisorModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenSettingsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAddModal, 
  onOpenAuthModal, 
  onOpenTransferModal,
  onOpenSubmissionsModal,
  onOpenSupervisorModal,
  onOpenAiModal,
  onOpenSettingsModal
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    students, 
    exportDataJson, 
    importDataJson, 
    resetToSampleData,
    syncStatus,
    lastSyncedAt,
    isLoadingCloud,
    hasUnsavedChanges,
    saveToCloudNow,
    pendingSubmissionsCount
  } = useQuran();

  const { user, logout } = useAuth();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);

  const handleManualSave = async () => {
    setManualSyncing(true);
    try {
      await saveToCloudNow();
    } finally {
      setTimeout(() => setManualSyncing(false), 500);
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportDataJson());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quran_circle_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowSettingsMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJson(content);
        if (ok) {
          alert('تم استيراد بيانات الحلقة بنجاح');
        } else {
          alert('تعذر استيراد الملف، تأكد من صحة التنسيق');
        }
      }
    };
    reader.readAsText(file);
    setShowSettingsMenu(false);
  };

  const activeStudentsCount = students.filter(s => s.status === 'active').length;

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm" id="app-header">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-emerald-100 shadow-inner shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="font-bold text-base sm:text-lg tracking-wide text-white font-['Amiri',serif]">
                جامع السرور
              </h1>
              <span className="text-[10px] sm:text-[11px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                حلقة القرآن الكريم
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 hidden xs:block">
              جلسات الأحد والأربعاء (4 أرباع) • وتدوين الورد اليومي (حتى 3 أجزاء)
            </p>
          </div>
        </div>

        {/* Top Controls & Cloud Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Cloud Sync Status Indicator */}
          {user ? (
            <button
              type="button"
              id="cloud-sync-status-btn"
              onClick={handleManualSave}
              disabled={manualSyncing || isLoadingCloud}
              title={
                syncStatus === 'saving' || manualSyncing
                  ? 'جارِ حفظ التعديلات في السحاب...'
                  : hasUnsavedChanges
                  ? 'توجد تعديلات جديدة (تُحفظ تلقائياً كل 60 ثانية، أو انقر هنا للحفظ الفوري الآن)'
                  : syncStatus === 'synced'
                  ? `محفوظ سحابياً بحسابك • الحفظ المتزامن يعمل كل 60 ثانية (${lastSyncedAt ? lastSyncedAt.toLocaleTimeString('ar-SA') : 'الآن'})`
                  : syncStatus === 'error'
                  ? 'خطأ في الاتصال، انقر لإعادة المحاولة'
                  : 'متصل بالسحاب'
              }
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold transition-colors bg-stone-800/90 border border-stone-700/80 hover:bg-stone-750 text-stone-200 cursor-pointer"
            >
              {isLoadingCloud || manualSyncing || syncStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-emerald-300 hidden md:inline">جارِ المزامنة...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="text-amber-300 font-bold hidden sm:inline">حفظ كل 60ث (معلق)</span>
                </>
              ) : syncStatus === 'synced' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <span className="text-emerald-400 font-bold hidden sm:inline">سحابي (كل 60ث)</span>
                </>
              ) : syncStatus === 'error' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 hidden sm:inline">إعادة المزامنة</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-stone-400 hidden sm:inline">محلي</span>
                </>
              )}
            </button>
          ) : (
            onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )
          )}

          {/* Student Submissions Approvals Button */}
          {onOpenSubmissionsModal && (
            <button
              type="button"
              id="student-submissions-btn"
              onClick={onOpenSubmissionsModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                pendingSubmissionsCount > 0
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-xs'
                  : 'bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700/80'
              }`}
              title="مراجعة واعتماد طلبات وأوراد الطلاب"
            >
              <CheckSquare className={`w-3.5 h-3.5 ${pendingSubmissionsCount > 0 ? 'text-amber-400' : 'text-stone-400'}`} />
              <span className="hidden sm:inline">طلبات الطلاب</span>
              {pendingSubmissionsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>
          )}

          {/* AI Quran Assistant Button */}
          {onOpenAiModal && (
            <button
              type="button"
              id="ai-assistant-btn"
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800/90 to-teal-800/90 hover:from-emerald-700 hover:to-teal-700 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
              title="مساعد الحلقة الذكي (Gemini 3.8 Flash)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden md:inline">مساعد الحلقة (Gemini)</span>
            </button>
          )}

          {/* Add Student Button */}
          <button
            id="add-student-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">طالب جديد</span>
          </button>

          {/* Cross-Account Transfer Button */}
          {onOpenTransferModal && (
            <button
              type="button"
              id="transfer-data-modal-btn"
              onClick={onOpenTransferModal}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 border border-stone-700/80 text-emerald-400 hover:text-emerald-300 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              title="نقل أو استيراد بيانات الطلاب بين الحسابات"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">نقل الحساب</span>
            </button>
          )}

          {/* Theme & App Settings Button */}
          {onOpenSettingsModal && (
            <button
              type="button"
              id="open-app-settings-btn"
              onClick={onOpenSettingsModal}
              className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-750 border border-stone-700/80 text-amber-300 hover:text-amber-200 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer shrink-0"
              title="إعدادات وتخصيص ألوان وتصميم التطبيق"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">المظهر والإعدادات</span>
            </button>
          )}

          {/* User Profile / Menu */}
          {user && (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-700 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-white shadow-xs hover:border-emerald-400 transition-colors cursor-pointer"
                title={user.email || 'حساب المستخدم'}
              >
                {user.email ? user.email.slice(0, 2).toUpperCase() : <User className="w-4 h-4" />}
              </button>

              {showUserMenu && (
                <div
                  id="user-dropdown"
                  className="absolute left-0 mt-2 w-64 bg-stone-800 border border-stone-700 rounded-2xl shadow-2xl py-2 z-50 text-xs text-stone-200 divide-y divide-stone-700/60 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-white truncate text-xs" title={user.email || ''}>
                          {user.email}
                        </div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3" />
                          <span>حساب معتمد • حفظ تلقائي في السحاب</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-1 px-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleManualSave();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-stone-700/80 rounded-xl flex items-center justify-between text-stone-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-emerald-400" />
                        <span>مزامنة وحفظ السحاب الآن</span>
                      </div>
                      <span className="text-[10px] text-stone-400">تحديث</span>
                    </button>

                    {onOpenSettingsModal && (
                      <button
                        type="button"
                        id="user-settings-appearance-btn"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSettingsModal();
                        }}
                        className="w-full text-right px-3 py-2 hover:bg-stone-700/80 rounded-xl flex items-center justify-between text-stone-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-amber-400" />
                          <span>تخصيص ألوان وتصميم التطبيق</span>
                        </div>
                        <span className="text-[10px] text-amber-400/80">مظهر</span>
                      </button>
                    )}

                    {onOpenSupervisorModal && (
                      <button
                        type="button"
                        id="supervisor-management-btn"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSupervisorModal();
                        }}
                        className="w-full text-right px-3 py-2 hover:bg-stone-700/80 rounded-xl flex items-center justify-between text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-amber-400" />
                          <span>إدارة صلاحيات المشرفين</span>
                        </div>
                        <span className="text-[10px] bg-amber-950 border border-amber-700/50 text-amber-300 px-1.5 py-0.5 rounded">خاص</span>
                      </button>
                    )}
                  </div>

                  <div className="py-1 px-1">
                    <button
                      type="button"
                      id="logout-btn"
                      onClick={async () => {
                        setShowUserMenu(false);
                        if (confirm('هل تريد تسجيل الخروج من حسابك؟')) {
                          await logout();
                        }
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-rose-950/40 text-rose-300 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings / Data Menu */}
          <div className="relative">
            <button
              id="settings-menu-btn"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-1.5 sm:p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="خيارات وحفظ البيانات"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div
                id="settings-dropdown"
                className="absolute left-0 mt-2 w-56 bg-stone-800 border border-stone-700 rounded-2xl shadow-2xl py-2 z-50 text-xs text-stone-200 divide-y divide-stone-700/50"
              >
                <div className="px-3 py-2">
                  <div className="font-semibold text-stone-300">إدارة بيانات الحلقة</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">عدد الطلاب: {activeStudentsCount}</div>
                </div>

                <div className="py-1">
                  {onOpenSettingsModal && (
                    <button
                      type="button"
                      id="dropdown-open-appearance-btn"
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onOpenSettingsModal();
                      }}
                      className="w-full text-right px-3 py-1.5 hover:bg-stone-700 flex items-center gap-2 text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-400" />
                      تخصيص ألوان وتصميم التطبيق
                    </button>
                  )}

                  {onOpenTransferModal && (
                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onOpenTransferModal();
                      }}
                      className="w-full text-right px-3 py-1.5 hover:bg-stone-700 flex items-center gap-2 text-stone-200 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
                      نقل أو استيراد من حساب آخر
                    </button>
                  )}

                  <button
                    onClick={handleExport}
                    className="w-full text-right px-3 py-1.5 hover:bg-stone-700 flex items-center gap-2 text-stone-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    تصدير نسخة احتياطية (JSON)
                  </button>

                  <label className="w-full text-right px-3 py-1.5 hover:bg-stone-700 flex items-center gap-2 text-stone-200 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    استيراد نسخة سابقة
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من رغبتك في مسح كافة بيانات الطلاب والجلسات والبدء من جديد؟')) {
                        resetToSampleData();
                        setShowSettingsMenu(false);
                      }
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-red-950/40 text-rose-400 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    مسح كافة البيانات والبدء من جديد
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-stone-950/70 border-t border-stone-800/80">
        <div className="max-w-6xl mx-auto px-2 flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-1">
          <button
            id="tab-sessions"
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جلسة التسميع (الأحد/الأربعاء)</span>
          </button>

          <button
            id="tab-revision"
            onClick={() => setActiveTab('revision')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'revision'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>تدوين الورد اليومي (المراجعة)</span>
          </button>

          <button
            id="tab-students"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الطلاب ({activeStudentsCount})</span>
          </button>

          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>التقارير والإحصائيات</span>
          </button>

          <button
            id="tab-quranIndex"
            onClick={() => setActiveTab('quranIndex')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'quranIndex'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>فهرس الأرباع (240)</span>
          </button>

          <button
            id="tab-mutashabihat"
            onClick={() => setActiveTab('mutashabihat')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'mutashabihat'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-300/80 hover:text-amber-200 hover:bg-stone-800/60'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>متشابهات القرآن</span>
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>دليل النظام والمحاكي</span>
          </button>
        </div>
      </div>
    </header>
  );
};
