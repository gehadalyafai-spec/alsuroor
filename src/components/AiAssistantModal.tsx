import React, { useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { 
  analyzeStudentWithGemini, 
  generateCircleReportWithGemini, 
  askAiAssistant 
} from '../services/aiService';
import { 
  Sparkles, X, Brain, UserCheck, BookOpen, Send, 
  RefreshCw, AlertCircle, Award, CheckCircle2, ChevronLeft 
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStudentId?: string | null;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultStudentId = null
}) => {
  const { students, sessionRecords, dailyRevisionRecords } = useQuran();

  const [activeTab, setActiveTab] = useState<'student' | 'circle' | 'chat'>(defaultStudentId ? 'student' : 'circle');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudentId || students[0]?.id || '');
  
  // Student Analysis state
  const [studentAnalysisText, setStudentAnalysisText] = useState<string>('');
  const [isAnalyzingStudent, setIsAnalyzingStudent] = useState<boolean>(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Circle Report state
  const [circleReportText, setCircleReportText] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [circleError, setCircleError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'السلام عليكم ورحمة الله وبركاته! أنا مساعد الحلقة الذكي المزود بنموذج Gemini 3.5 Flash. يسعدني مساعدتك في استفسارات التجويد، تثبيت حفظ الأرباع، والمتشابهات القرآنية وإدارة الحلقة.'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const handleAnalyzeStudent = async () => {
    if (!currentStudent) return;
    setIsAnalyzingStudent(true);
    setStudentError(null);

    try {
      // Aggregate student's grades
      const stuSessions = sessionRecords.filter(r => r.studentId === currentStudent.id);
      const gradeCounts: Record<string, number> = {};
      stuSessions.forEach(s => {
        gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1;
      });

      const recentNotes = stuSessions
        .map(s => s.teacherNotes)
        .filter(Boolean)
        .slice(-5);

      const res = await analyzeStudentWithGemini({
        studentName: currentStudent.name,
        currentRub: currentStudent.currentRub,
        completedRubCount: currentStudent.completedRubCount,
        gradeStats: gradeCounts,
        recentNotes,
      });

      setStudentAnalysisText(res.analysis);
    } catch (err: any) {
      setStudentError(err.message || 'تعذر استكمال التحليل عبر الذكاء الاصطناعي');
    } finally {
      setIsAnalyzingStudent(false);
    }
  };

  const handleGenerateCircleReport = async () => {
    setIsGeneratingReport(true);
    setCircleError(null);

    try {
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'active').length;
      const totalCompletedRubs = students.reduce((sum, s) => sum + s.completedRubCount, 0);

      const gradesDistribution: Record<string, number> = {};
      sessionRecords.forEach(s => {
        gradesDistribution[s.grade] = (gradesDistribution[s.grade] || 0) + 1;
      });

      const completedRevisions = dailyRevisionRecords.filter(r => r.status === 'completed').length;
      const totalRevisions = dailyRevisionRecords.length;
      const revisionCompletionRate = totalRevisions > 0 
        ? Math.round((completedRevisions / totalRevisions) * 100) 
        : 0;

      const res = await generateCircleReportWithGemini({
        totalStudents,
        activeStudents,
        totalCompletedRubs,
        gradesDistribution,
        revisionCompletionRate,
      });

      setCircleReportText(res.report);
    } catch (err: any) {
      setCircleError(err.message || 'تعذر توليد تقرير الحلقة');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const res = await askAiAssistant(userMsg, `سياق الحلقة: ${students.length} طالب، ${sessionRecords.length} جلسة تسميع.`);
      setChatMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev, 
        { role: 'assistant', text: `عذراً: ${err.message || 'حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي'}` }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        id="gemini-ai-modal"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-['Amiri',serif]">
                  مساعد الحلقة القرآني الذكي
                </h3>
                <span className="text-[10px] font-bold font-mono bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Gemini 3.5
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                تحليل دقيق لأداء الطلاب، توليد خطط الحفظ، والاستشارات القرآنية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-100/90 border-b border-stone-200/80 p-2 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('circle')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'circle'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-700" />
            <span>تقرير أداء الحلقة العام</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'student'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span>تحليل مستوى طالب مخصص</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-900 shadow-xs border border-stone-200/80 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>استشارة حية وتجويد</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-stone-800">
          {/* TAB 1: Circle Overall Report */}
          {activeTab === 'circle' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                  3.8
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    التحليل الاستراتيجي الشامل للحلقة
                  </h4>
                  <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                    يقوم نموذج Gemini 3.5 Flash بقراءة إحصائيات الحلقة، ونسب الإتقان والالتزام بالورد اليومي وتقديم توصيات تنفيذية للمعلم.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleGenerateCircleReport}
                  disabled={isGeneratingReport}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isGeneratingReport ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>جارِ التحليل المعمق بـ Gemini 3.5 Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>توليد التقرير الاستراتيجي للحلقة الآن</span>
                    </>
                  )}
                </button>
              </div>

              {circleError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{circleError}</span>
                </div>
              )}

              {circleReportText ? (
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs leading-relaxed space-y-3 whitespace-pre-line font-['Cairo',sans-serif]">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-[11px] text-stone-500 font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم إعداد التقرير بنجاح بواسطة Gemini 3.5 Flash
                    </span>
                    <span>{new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="text-stone-800 text-xs sm:text-sm font-medium leading-relaxed">
                    {circleReportText}
                  </div>
                </div>
              ) : (
                !isGeneratingReport && (
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs">
                    اضغط على الزر أعلاه لتحليل كامل بيانات الحلقة واستخراج التقرير التوجيهي
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: Specific Student Analysis */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-teal-700" />
                  <span>اختر الطالب لتحليل مسار حفظه:</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setStudentAnalysisText('');
                  }}
                  className="text-xs font-semibold px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (الربع {s.currentRub})
                    </option>
                  ))}
                </select>
              </div>

              {currentStudent && (
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{currentStudent.name}</span>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      موضع الحفظ: الربع {currentStudent.currentRub} من 240 • أنجز {currentStudent.completedRubCount} ربعاً
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyzeStudent}
                    disabled={isAnalyzingStudent}
                    className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isAnalyzingStudent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-300" />
                        <span>جارِ التحليل...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-3.5 h-3.5 text-teal-300" />
                        <span>تحليل الطالب عبر Gemini</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {studentError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{studentError}</span>
                </div>
              )}

              {studentAnalysisText ? (
                <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 text-xs leading-relaxed space-y-2 whitespace-pre-line">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2 text-[11px] text-stone-500 font-semibold">
                    <span className="text-teal-800 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      توجيهات Gemini 3.5 Flash للطالب: {currentStudent?.name}
                    </span>
                  </div>
                  <div className="text-stone-800 text-xs sm:text-sm font-medium leading-relaxed">
                    {studentAnalysisText}
                  </div>
                </div>
              ) : (
                !isAnalyzingStudent && (
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs">
                    اختر طالباً واضغط على "تحليل الطالب عبر Gemini" للحصول على تقرير حفظ تربوي مخصص
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 3: Interactive Tajweed & Assistant Chat */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-96">
              <div className="flex-1 overflow-y-auto space-y-3 p-1">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-800 text-white font-medium rounded-br-xs'
                          : 'bg-stone-100 text-stone-900 border border-stone-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-stone-100 text-stone-500 border border-stone-200/80 rounded-2xl px-4 py-2 text-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                      <span>Gemini 3.5 Flash يفكر ويكتب الرد...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-stone-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اسأل عن أحكام التجويد، ضبط المتشابهات، أو توجيه الطالب..."
                  className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-5 py-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            يعمل بنموذج <strong>Gemini 3.5 Flash</strong> عبر الخادم الآمن
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg font-bold text-xs cursor-pointer transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
