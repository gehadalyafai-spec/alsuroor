import React, { useState, useMemo } from 'react';
import { useQuran } from '../context/QuranContext';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types/quran';
import { getQuarterDetails } from '../data/quranData';
import { exportAllStudentsToExcel, exportStudentToExcel } from '../utils/exportReports';
import { MosqueLogo } from './MosqueLogo';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, Legend 
} from 'recharts';
import { 
  FileSpreadsheet, Printer, Users, Award, BookOpen, CheckCircle2, 
  Search, ArrowUpDown, ChevronDown, Sparkles, Filter, TrendingUp, Calendar, AlertCircle
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { students, sessionRecords, dailyRevisionRecords } = useQuran();
  const { user } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'allStudents' | 'singleStudent'>('analytics');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'rub' | 'sessions' | 'revisions'>('rub');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Overall Statistics Metrics
  const metrics = useMemo(() => {
    const totalStudents = students.length;
    const activeCount = students.filter(s => s.status === 'active').length;
    const totalCompletedRubs = students.reduce((sum, s) => sum + s.completedRubCount, 0);
    const totalSessions = sessionRecords.length;
    const perfectSessions = sessionRecords.filter(s => s.grade === 'perfect').length;
    const perfectRate = totalSessions > 0 ? Math.round((perfectSessions / totalSessions) * 100) : 0;
    
    const completedRevisions = dailyRevisionRecords.filter(r => r.status === 'completed').length;
    const totalRevisions = dailyRevisionRecords.length;
    const revisionRate = totalRevisions > 0 ? Math.round((completedRevisions / totalRevisions) * 100) : 0;

    return {
      totalStudents,
      activeCount,
      totalCompletedRubs,
      totalSessions,
      perfectRate,
      revisionRate,
    };
  }, [students, sessionRecords, dailyRevisionRecords]);

  // Chart 1: Students Distribution by Juz Categories
  const juzDistributionData = useMemo(() => {
    const categories = [
      { name: 'جزء 1 - 2', min: 1, max: 16, count: 0 },
      { name: 'جزء 3 - 5', min: 17, max: 40, count: 0 },
      { name: 'جزء 6 - 10', min: 41, max: 80, count: 0 },
      { name: 'جزء 11 - 15', min: 81, max: 120, count: 0 },
      { name: 'جزء 16 - 20', min: 121, max: 160, count: 0 },
      { name: 'جزء 21 - 30', min: 161, max: 240, count: 0 },
    ];

    students.forEach(s => {
      const rub = s.currentRub;
      const cat = categories.find(c => rub >= c.min && rub <= c.max);
      if (cat) cat.count += 1;
    });

    return categories;
  }, [students]);

  // Chart 2: Session Grades Distribution (Pie / Donut)
  const gradesData = useMemo(() => {
    const counts = {
      perfect: 0,
      very_good: 0,
      good: 0,
      needs_repeat: 0,
    };

    sessionRecords.forEach(s => {
      if (counts[s.grade as keyof typeof counts] !== undefined) {
        counts[s.grade as keyof typeof counts] += 1;
      }
    });

    return [
      { name: 'ممتاز', value: counts.perfect, color: '#059669' }, // emerald-600
      { name: 'جيد جداً', value: counts.very_good, color: '#0d9488' }, // teal-600
      { name: 'جيد', value: counts.good, color: '#d97706' }, // amber-600
      { name: 'يحتاج إعادة', value: counts.needs_repeat, color: '#e11d48' }, // rose-600
    ].filter(item => item.value > 0);
  }, [sessionRecords]);

  // Chart 3: Weekly/Chronological Sessions Activity
  const activityData = useMemo(() => {
    const map = new Map<string, { date: string; sessions: number; revisions: number }>();
    
    // Last 14 days activity
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const shortLabel = `${d.getMonth() + 1}/${d.getDate()}`;
      map.set(dateStr, { date: shortLabel, sessions: 0, revisions: 0 });
    }

    sessionRecords.forEach(s => {
      if (map.has(s.date)) {
        map.get(s.date)!.sessions += 1;
      }
    });

    dailyRevisionRecords.forEach(r => {
      if (map.has(r.date) && r.status === 'completed') {
        map.get(r.date)!.revisions += 1;
      }
    });

    return Array.from(map.values());
  }, [sessionRecords, dailyRevisionRecords]);

  // Top Achievers (Leaderboard)
  const topStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => b.completedRubCount - a.completedRubCount)
      .slice(0, 5);
  }, [students]);

  // Filtered and Sorted Students for All-Students Report
  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (sortField === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === 'rub') {
          valA = a.currentRub;
          valB = b.currentRub;
        } else if (sortField === 'sessions') {
          valA = sessionRecords.filter(ses => ses.studentId === a.id).length;
          valB = sessionRecords.filter(ses => ses.studentId === b.id).length;
        } else if (sortField === 'revisions') {
          const revsA = dailyRevisionRecords.filter(r => r.studentId === a.id);
          const revsB = dailyRevisionRecords.filter(r => r.studentId === b.id);
          valA = revsA.length > 0 ? (revsA.filter(r => r.status === 'completed').length / revsA.length) : 0;
          valB = revsB.length > 0 ? (revsB.filter(r => r.status === 'completed').length / revsB.length) : 0;
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [students, searchQuery, sortField, sortOrder, sessionRecords, dailyRevisionRecords]);

  // Handle Print Printable PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Top Header & Export Controls (Hidden during print) */}
      <div className="no-print bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              التقارير والإحصائيات الرسمية
            </span>
            <span className="text-xs text-stone-400">حلقة جامع السرور</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-['Amiri',serif] text-stone-900 mt-1">
            لوحة الإحصائيات والتقارير الشاملة
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            رسوم بيانية تفاعلية لنشاط الحلقة، تقارير شاملة ومفصلة قابلة للتصدير كملفات Excel أو PDF
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => exportAllStudentsToExcel(students, sessionRecords, dailyRevisionRecords)}
            disabled={students.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>تصدير إكسل (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-stone-300" />
            <span>طباعة / حفظ PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar (Hidden during print) */}
      <div className="no-print bg-stone-200/70 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-white text-emerald-800 shadow-xs font-extrabold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>الرسوم البيانية ونشاط الحلقة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('allStudents')}
          className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'allStudents'
              ? 'bg-white text-emerald-800 shadow-xs font-extrabold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>تقرير شامل لكل الطلاب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('singleStudent')}
          className={`flex-1 py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'singleStudent'
              ? 'bg-white text-emerald-800 shadow-xs font-extrabold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>تقرير مفصل لطالب محدد</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ANALYTICS & ATTRACTIVE CHARTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">إجمالي الطلاب</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-stone-900">{metrics.totalStudents}</span>
              <span className="text-[10px] text-emerald-600 font-semibold block">{metrics.activeCount} نشط</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">أرباع الحفظ المنجزة</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-emerald-700">{metrics.totalCompletedRubs}</span>
              <span className="text-[10px] text-stone-400 block">من 240 ربعاً</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">جلسات التسميع</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-teal-700">{metrics.totalSessions}</span>
              <span className="text-[10px] text-stone-400 block">جلسة مسجلة</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">نسبة التميز</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-emerald-600">{metrics.perfectRate}%</span>
              <span className="text-[10px] text-emerald-600 block">تقدير ممتاز</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">التزام الورد اليومي</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-blue-700">{metrics.revisionRate}%</span>
              <span className="text-[10px] text-blue-600 block">معدل الإتمام</span>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs text-center space-y-1">
              <span className="text-[11px] font-bold text-stone-500 block">الأجزاء المقطوعة</span>
              <span className="text-2xl font-bold font-['Amiri',serif] text-amber-700">
                {(metrics.totalCompletedRubs / 8).toFixed(1)}
              </span>
              <span className="text-[10px] text-stone-400 block">جزء معتمد</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Juz Distribution */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>توزيع الطلاب حسب أجزاء القرآن الكريم</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">مواقع حفظ الطلاب الحالية في المصحف الشريف</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={juzDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#57534e' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#57534e' }} />
                    <Tooltip 
                      formatter={(val) => [`${val} طالب`, 'عدد الطلاب']}
                      contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#059669" radius={[8, 8, 0, 0]} barSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Session Grades Distribution */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-600" />
                    <span>نسب تقديرات التسميع في جلسات الحلقة</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">جودة أداء الطلاب أثناء تسميع الأرباع الأربعة</p>
                </div>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {gradesData.length === 0 ? (
                  <div className="text-xs text-stone-400 text-center">لا توجد جلسات تسميع مسجلة بعد لإظهار النسب</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={gradesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {gradesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(val) => [`${val} جلسة`, 'العدد']}
                        contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 3: Chronological Activity (Area Chart) */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>نشاط الحلقة على مدار آخر أسبوعين</span>
                  </h3>
                  <p className="text-[11px] text-stone-400">مقارنة وتيرة تسميع الأرباع في الحلقة مع إتمام الورد اليومي للمراجعة</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="revisionsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#57534e' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#57534e' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="sessions" name="جلسات التسميع" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#sessionsGrad)" />
                    <Area type="monotone" dataKey="revisions" name="إتمام الورد اليومي" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#revisionsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Top Achievers List */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>لوحة شرف الأوائل في الحلقة (الأكثر إنجازاً للأرباع)</span>
            </h3>

            {topStudents.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">لا يوجد طلاب مضافون بعد.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {topStudents.map((st, idx) => {
                  const qDetails = getQuarterDetails(st.currentRub);
                  return (
                    <div key={st.id} className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-400 text-stone-900' :
                          idx === 1 ? 'bg-stone-300 text-stone-800' :
                          idx === 2 ? 'bg-amber-700/60 text-white' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {st.completedRubCount} ربعاً منجزاً
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 truncate">{st.name}</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {qDetails ? `سورة ${qDetails.surahName} (جزء ${qDetails.juz})` : '—'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ALL-STUDENTS COMPREHENSIVE REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'allStudents' && (
        <div className="space-y-4">
          
          {/* Controls Bar (Search & Sort) */}
          <div className="no-print bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                placeholder="البحث باسم الطالب أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-semibold">ترتيب حسب:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="rub">الربع الحالي (الأكثر تقدماً)</option>
                <option value="name">اسم الطالب أ-ي</option>
                <option value="sessions">عدد جلسات التسميع</option>
                <option value="revisions">نسبة التزام الورد اليومي</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl border border-stone-300 text-stone-700 cursor-pointer"
                title="عكس اتجاه الترتيب"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Printable Report Container */}
          <div id="printable-report-area" className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-6">
            
            {/* Report Header for Print/Display */}
            <div className="border-b border-stone-200 pb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold font-['Amiri',serif] text-xl shadow-sm">
                  ق
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-['Amiri',serif] text-stone-900">
                    تقرير حلقة القرآن الكريم الشامل — جامع السرور
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-SA')} | عدد الطلاب: {filteredStudents.length} طالب
                  </p>
                </div>
              </div>
              <div className="text-left text-xs text-stone-400 hidden sm:block">
                <span>المشرف: {user?.displayName || user?.email || 'محفظ الحلقة'}</span>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100/80 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-3 px-3">م</th>
                    <th className="py-3 px-3">اسم الطالب</th>
                    <th className="py-3 px-3">الجوال</th>
                    <th className="py-3 px-3 text-center">الربع الحالي</th>
                    <th className="py-3 px-3">الموضع في المصحف</th>
                    <th className="py-3 px-3 text-center">المنجز (ربع)</th>
                    <th className="py-3 px-3 text-center">نسبة الختمة</th>
                    <th className="py-3 px-3 text-center">الجلسات</th>
                    <th className="py-3 px-3 text-center">التزام الورد</th>
                    <th className="py-3 px-3 text-center">آخر تقدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70">
                  {filteredStudents.map((st, idx) => {
                    const qDetails = getQuarterDetails(st.currentRub);
                    const stSessions = sessionRecords.filter(ses => ses.studentId === st.id);
                    const stRevs = dailyRevisionRecords.filter(r => r.studentId === st.id);
                    const completedRevs = stRevs.filter(r => r.status === 'completed').length;
                    const revRate = stRevs.length > 0 ? Math.round((completedRevs / stRevs.length) * 100) : 0;
                    const lastSes = stSessions[stSessions.length - 1];

                    const gradeLabels: Record<string, { label: string; color: string }> = {
                      perfect: { label: 'ممتاز', color: 'text-emerald-700 bg-emerald-100' },
                      very_good: { label: 'جيد جداً', color: 'text-teal-700 bg-teal-100' },
                      good: { label: 'جيد', color: 'text-amber-700 bg-amber-100' },
                      needs_repeat: { label: 'إعادة', color: 'text-rose-700 bg-rose-100' },
                      absent: { label: 'غائب', color: 'text-stone-500 bg-stone-100' },
                    };

                    return (
                      <tr key={st.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-stone-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">{st.name}</td>
                        <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">{st.phone || '—'}</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-800">{st.currentRub}</td>
                        <td className="py-3 px-3 text-stone-600">
                          {qDetails ? `سورة ${qDetails.surahName} (جزء ${qDetails.juz})` : '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-stone-800">{st.completedRubCount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-emerald-700">
                            {((st.completedRubCount / 240) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-stone-700">{stSessions.length}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            revRate >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            revRate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {revRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {lastSes ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              gradeLabels[lastSes.grade]?.color || 'bg-stone-100 text-stone-600'
                            }`}>
                              {gradeLabels[lastSes.grade]?.label || lastSes.grade}
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[11px]">لم يسمع بعد</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-xs">
                  لا يوجد طلاب مطابقون لمعايير البحث الحالية.
                </div>
              )}
            </div>

            {/* Print Signature Footer */}
            <div className="border-t border-stone-200 pt-6 mt-8 flex items-center justify-between text-xs text-stone-600 print-break-inside-avoid">
              <div>
                <span className="block font-bold">معلم الحلقة / المحفظ:</span>
                <span className="text-stone-400 text-[11px] mt-4 block">................................................</span>
              </div>
              <div className="text-left">
                <span className="block font-bold">توقيع وختم الإدارة / المشرف:</span>
                <span className="text-stone-400 text-[11px] mt-4 block">................................................</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: INDIVIDUAL STUDENT DETAILED REPORT */}
      {/* ========================================================================= */}
      {activeSubTab === 'singleStudent' && (
        <div className="space-y-6">
          
          {/* Student Selector Bar */}
          <div className="no-print bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-stone-700 shrink-0">اختر الطالب لعرض تقريره:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full sm:w-72 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 outline-none focus:ring-2 focus:ring-emerald-600"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (الربع {s.currentRub})
                  </option>
                ))}
              </select>
            </div>

            {activeStudent && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => exportStudentToExcel(activeStudent, sessionRecords, dailyRevisionRecords)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                  <span>تصدير ملف الطالب إكسل (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-300" />
                  <span>طباعة تقرير الطالب PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Individual Report Document */}
          {activeStudent ? (
            (() => {
              const qDetails = getQuarterDetails(activeStudent.currentRub);
              const studentSessions = sessionRecords.filter(s => s.studentId === activeStudent.id);
              const studentRevisions = dailyRevisionRecords.filter(r => r.studentId === activeStudent.id);
              const completedRev = studentRevisions.filter(r => r.status === 'completed').length;
              const revPercent = studentRevisions.length > 0 ? Math.round((completedRev / studentRevisions.length) * 100) : 0;
              const progressPercent = ((activeStudent.completedRubCount / 240) * 100).toFixed(1);

              return (
                <div id="printable-report-area" className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  
                  {/* Official Header */}
                  <div className="border-b border-stone-200 pb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <MosqueLogo size="lg" />
                      <div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          بطاقة متابعة طالب — حلقة القرآن الكريم
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold font-['Amiri',serif] text-stone-900 mt-1">
                          {activeStudent.name}
                        </h2>
                        <p className="text-xs text-stone-500 mt-0.5">
                          تاريخ الانضمام: {activeStudent.joinDate || '—'} | الحالة: {activeStudent.status === 'active' ? 'نشط' : 'متوقف'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left text-xs space-y-1">
                      <span className="block font-bold text-stone-800">جامع السرور</span>
                      <span className="block text-stone-400 text-[11px]">{new Date().toLocaleDateString('ar-SA')}</span>
                    </div>
                  </div>

                  {/* Student Stats Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 rounded-2xl p-4 border border-stone-200">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-500 block">الربع المستهدف الحالي:</span>
                      <span className="text-base font-bold text-emerald-800">
                        الربع {activeStudent.currentRub}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        {qDetails ? `سورة ${qDetails.surahName} (جزء ${qDetails.juz})` : '—'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-500 block">إجمالي الأرباع المنجزة:</span>
                      <span className="text-base font-bold text-teal-800">
                        {activeStudent.completedRubCount} ربعاً
                      </span>
                      <span className="text-[11px] text-stone-500 block">من أصل 240 ربعاً</span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-500 block">نسبة الختمة المنجزة:</span>
                      <span className="text-base font-bold text-emerald-700">
                        {progressPercent}%
                      </span>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-stone-500 block">التزام الورد اليومي:</span>
                      <span className="text-base font-bold text-blue-800">
                        {revPercent}%
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        ({completedRev} من أصل {studentRevisions.length} يوم)
                      </span>
                    </div>
                  </div>

                  {/* Recitation History Table */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>سجل جلسات التسميع والاختبارات ({studentSessions.length} جلسة)</span>
                    </h3>

                    <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                      <table className="w-full text-right text-xs border-collapse">
                        <thead>
                          <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                            <th className="py-2.5 px-3">التاريخ</th>
                            <th className="py-2.5 px-3">الربع الجديد</th>
                            <th className="py-2.5 px-3">الأرباع المسردة</th>
                            <th className="py-2.5 px-3 text-center">التقدير</th>
                            <th className="py-2.5 px-3 text-center">الأخطاء</th>
                            <th className="py-2.5 px-3 text-center">الترددات</th>
                            <th className="py-2.5 px-3 text-center">الارتقاء</th>
                            <th className="py-2.5 px-3">ملاحظات المحفظ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {studentSessions.map((ses) => {
                            const sesQ = getQuarterDetails(ses.newRub);
                            const gradeLabels: Record<string, { label: string; color: string }> = {
                              perfect: { label: 'ممتاز', color: 'text-emerald-700 bg-emerald-100' },
                              very_good: { label: 'جيد جداً', color: 'text-teal-700 bg-teal-100' },
                              good: { label: 'جيد', color: 'text-amber-700 bg-amber-100' },
                              needs_repeat: { label: 'إعادة', color: 'text-rose-700 bg-rose-100' },
                              absent: { label: 'غائب', color: 'text-stone-500 bg-stone-100' },
                            };
                            return (
                              <tr key={ses.id} className="hover:bg-stone-50">
                                <td className="py-2.5 px-3 font-semibold text-stone-700">{ses.date} ({ses.dayName})</td>
                                <td className="py-2.5 px-3 font-bold text-emerald-800">
                                  {ses.newRub} {sesQ ? `(${sesQ.surahName})` : ''}
                                </td>
                                <td className="py-2.5 px-3 text-stone-600">{ses.recitedRubs.join('، ')}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    gradeLabels[ses.grade]?.color || 'bg-stone-100'
                                  }`}>
                                    {gradeLabels[ses.grade]?.label || ses.grade}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-stone-700">{ses.mistakesCount}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-stone-700">{ses.hesitationsCount}</td>
                                <td className="py-2.5 px-3 text-center">
                                  {ses.advancedToNext ? (
                                    <span className="text-emerald-700 font-bold">اجتاز ✓</span>
                                  ) : (
                                    <span className="text-rose-600 font-bold">تثبيت ↺</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-stone-500">{ses.teacherNotes || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {studentSessions.length === 0 && (
                        <div className="py-8 text-center text-xs text-stone-400">
                          لم يتم تسجيل أي جلسة تسميع لهذا الطالب بعد.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supervisor Note and Signature for Print */}
                  <div className="border-t border-stone-200 pt-6 mt-6 flex items-center justify-between text-xs text-stone-600 print-break-inside-avoid">
                    <div className="space-y-1">
                      <span className="font-bold block">ملاحظة المعلم والتوجيه:</span>
                      <p className="text-stone-500 max-w-md text-[11px] leading-relaxed">
                        {activeStudent.notes || 'طالب ملتزم، يُرجى الاستمرار في متابعة الورد اليومي بانتظام وتثبيت الأرباع الأربعة بالتسميع الذاتي.'}
                      </p>
                    </div>
                    <div className="text-left space-y-1">
                      <span className="font-bold block">توقيع المحفظ:</span>
                      <span className="text-stone-400 block pt-4">..................................</span>
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center text-xs text-stone-400">
              يرجى إضافة طلاب أولاً لعرض التقرير المفصل.
            </div>
          )}

        </div>
      )}

    </div>
  );
};
