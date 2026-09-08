import React, { useState } from 'react';
import { getRequiredRecitationForSession, getDailyRevisionAssignment } from '../utils/quranLogic';
import { getQuarterByNumber } from '../data/quranData';
import { BookOpen, Sparkles, CheckSquare, Calendar, Calculator, ArrowLeft } from 'lucide-react';

export const GuideModal: React.FC = () => {
  const [testRub, setTestRub] = useState<number>(5);

  const plan = getRequiredRecitationForSession(testRub);
  const testQuarter = getQuarterByNumber(testRub);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6" id="guide-system-view">
      {/* Title */}
      <div className="text-right space-y-1">
        <h2 className="font-bold text-xl text-stone-900 font-['Amiri',serif] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-700" />
          <span>دليل منهجية الحلقة: التسميع والمراجعة اليومية</span>
        </h2>
        <p className="text-xs text-stone-500">
          شرح مفصل لكيفية سير خطة الحفظ في جلسات الأحد والأربعاء وتدرج الورد اليومي
        </p>
      </div>

      {/* Simulator Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-6 shadow-xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-emerald-100">محاكي اختبار المنهجية التفاعلي</h3>
              <p className="text-xs text-stone-400">
                اختر أي ربع من أرباع القرآن (1 - 240) وشاهد فوراً ما يسمعه الطالب في الحلقة وما يراجعه في بيته
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-stone-300 font-semibold">اختر رقم الربع:</label>
            <input
              type="number"
              min={1}
              max={240}
              value={testRub}
              onChange={(e) => setTestRub(Math.max(1, Math.min(240, Number(e.target.value) || 1)))}
              className="w-20 p-2 text-center text-sm font-bold bg-stone-800 text-emerald-300 border border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={1}
          max={240}
          value={testRub}
          onChange={(e) => setTestRub(Number(e.target.value))}
          className="w-full h-2 bg-stone-800 accent-emerald-500 rounded-lg cursor-pointer"
        />

        {/* Simulation Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Box 1: Circle Session Recitation */}
          <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>جلسة الحلقة (الأحد أو الأربعاء):</span>
              </span>
              <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded-full">
                مجموع {plan.totalCount} أرباع
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {plan.linkingRubs.map(r => {
                const q = getQuarterByNumber(r);
                return (
                  <div key={r} className="flex items-center justify-between bg-stone-900/90 px-3 py-2 rounded-xl text-stone-300">
                    <span>🔗 ربع {r} (ربط سابق): سورة {q?.surahName}</span>
                    <span className="text-stone-500 text-[10px]">ص {q?.approxPage}</span>
                  </div>
                );
              })}

              <div className="flex items-center justify-between bg-emerald-900/60 border border-emerald-500 px-3 py-2.5 rounded-xl text-white font-bold">
                <span>⭐ الربع الجديد #{plan.newRub}: سورة {testQuarter?.surahName}</span>
                <span className="text-emerald-300 text-[11px]">الجزء {testQuarter?.juz} (ص {testQuarter?.approxPage})</span>
              </div>
            </div>

            {testRub >= 5 && (
              <p className="text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/50">
                💡 تم إسقاط ربع {testRub - 4} من التسميع المباشر ليبقى الربط ثابتاً على آخر 4 أرباع.
              </p>
            )}
          </div>

          {/* Box 2: Daily Wird in Home */}
          <div className="bg-stone-800/80 border border-stone-700/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                <span>الورد اليومي في البيت (المراجعة الذاتية):</span>
              </span>
              <span className="text-[11px] bg-teal-950 text-teal-300 border border-teal-700 px-2 py-0.5 rounded-full">
                {testRub <= 24 ? `${testRub} ربعاً` : '24 ربعاً (3 أجزاء كاملة)'}
              </span>
            </div>

            <div className="text-xs text-stone-300 space-y-2 bg-stone-900/90 p-3 rounded-xl">
              {testRub <= 24 ? (
                <div className="space-y-1.5">
                  <div className="text-emerald-300 font-semibold">
                    يقرأ الطالب كل يوم محفوظه كاملاً (من الربع 1 إلى الربع {testRub})
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    سرداً لنفسه في أيام الاثنين والثلاثاء والخميس والجمعة والسبت، ليتثبت الحفظ بشكل متين.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-teal-300 font-bold">
                    وصل الطالب إلى الحد المستقر: 24 ربعاً يومياً (3 أجزاء كاملة)!
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    يراجع الطالب يومياً 3 أجزاء، بحيث يدور على كل محفوظه السابق البالغ ({testRub} ربعاً = {(testRub / 8).toFixed(1)} جزء) 
                    في دورة دورية مستمرة كل {(testRub / 24).toFixed(1)} أيام.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Narrative Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-stone-900">
              جانب الحفظ والتسميع (جلسات الأحد والأربعاء)
            </h3>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            تنعقد الحلقة يومين في الأسبوع فقط (الأحد والأربعاء). يبدأ الطالب الجديد بالتسميع المتدرج كالتالي:
          </p>

          <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">الأحد 1:</span>
              <span>يسمع الربع 1 (المجموع: 1 ربع).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">الأربعاء 1:</span>
              <span>يسمع الربع 1 + الجديد 2 (المجموع: ربعان).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">الأحد 2:</span>
              <span>يسمع الربع 1 و 2 + الجديد 3 (المجموع: 3 أرباع).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">الأربعاء 2:</span>
              <span>يسمع 1 و 2 و 3 + الجديد 4 (المجموع: 4 أرباع).</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100/60 p-1.5 rounded-lg border border-emerald-300 font-semibold text-emerald-950">
              <span className="font-bold text-emerald-800">الأحد 3:</span>
              <span>يسقط الربع 1، ويسمع: 2 و 3 و 4 + الجديد 5!</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            وهكذا في كل جلسة قادمة: يسمع الطالب دائماً 4 أرباع (الربع الجديد الأخير وقبله 3 أرباع سابقة).
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-stone-900">
              جانب المراجعة والورد اليومي (المراجعة الذاتية)
            </h3>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            لضمان عدم نسيان المحفوظ، يقرأ الطالب سرداً لنفسه كل يوم من أيام الأسبوع كما يلي:
          </p>

          <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700">الإثنين والثلاثاء:</span>
              <span>يقرأ الربع 1 حفظاً لنفسه.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700">الأربعاء:</span>
              <span>يسمع في الحلقة الجديد 2، ويقرأ 1 + 2.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700">الخميس، الجمعة، السبت:</span>
              <span>يقرأ ربعين (1 و 2) كل يوم لنفسه.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-700">الأحد:</span>
              <span>يسمع الجديد 3، ويصبح ورده اليومي 3 أرباع.</span>
            </div>
            <div className="flex items-center gap-2 bg-teal-100/60 p-1.5 rounded-lg border border-teal-300 font-semibold text-teal-950">
              <span className="font-bold text-teal-800">الهدف النهائي:</span>
              <span>يتسع الورد حتى يستقر على 24 ربعاً (3 أجزاء يومياً)!</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-500">
            يقوم المعلم يومياً بالتحقق من إتمام الطالب لهذا الورد وتدوين ذلك لضمان استمرارية الحفظ.
          </p>
        </div>
      </div>
    </div>
  );
};
