import { RecitationPlan, DailyScheduleDay, Student, CycleDayInfo } from '../types/quran';
import { getQuarterByNumber } from '../data/quranData';

export const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/**
 * Calculates the exact quarters a student must recite during a circle session (الأحد أو الأربعاء).
 * Rule:
 * - Quarter 1: [1] (1 quarter)
 * - Quarter 2: [1, 2] (2 quarters)
 * - Quarter 3: [1, 2, 3] (3 quarters)
 * - Quarter N (N >= 4): [N-3, N-2, N-1, N] (4 quarters: 3 linking preceding quarters + 1 new quarter)
 */
export function getRequiredRecitationForSession(targetNewRub: number): RecitationPlan {
  const safeNewRub = Math.max(1, Math.min(240, targetNewRub));
  const startRub = Math.max(1, safeNewRub - 3);

  const allRubs: number[] = [];
  for (let r = startRub; r <= safeNewRub; r++) {
    allRubs.push(r);
  }

  const linkingRubs = allRubs.filter(r => r < safeNewRub);

  return {
    newRub: safeNewRub,
    linkingRubs,
    allRubs,
    totalCount: allRubs.length,
  };
}

/**
 * Helper to convert an array of quarters to its clear, authentic Arabic Juz'/Rub' representation.
 * - If quarters span full Juz' (e.g. 1..24), it is displayed as "الجزء 1 - 2 - 3".
 * - If there are remaining quarters with a repeat count (e.g. 4 quarters × 6), it clearly details the repetition and 3 Juz equivalence.
 */
export function formatRubsToJuzDescription(
  assignedRubs: number[],
  repeatCount: number = 1
): { fullDescription: string; shortLabel: string; isFullJuz: boolean } {
  if (!assignedRubs || assignedRubs.length === 0) {
    return { fullDescription: 'لا يوجد ورد محدد', shortLabel: 'لا يوجد', isFullJuz: false };
  }

  const sorted = [...assignedRubs].sort((a, b) => a - b);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const count = sorted.length;

  // Check if this range corresponds exactly to complete, whole Juz'
  const isWholeJuzStart = (first - 1) % 8 === 0;
  const isWholeJuzEnd = last % 8 === 0;
  const isSequential = last - first + 1 === count;

  if (isWholeJuzStart && isWholeJuzEnd && isSequential) {
    const startJuz = Math.floor((first - 1) / 8) + 1;
    const endJuz = Math.floor(last / 8);

    const parts: number[] = [];
    for (let j = startJuz; j <= endJuz; j++) {
      parts.push(j);
    }

    const juzTitle = parts.length === 1 
      ? `الجزء ${startJuz}` 
      : `الجزء ${parts.join(' - ')}`;

    if (repeatCount > 1) {
      return {
        fullDescription: `${juzTitle} (تكرار ${repeatCount} مرات = بما يعادل 24 ربعاً / 3 أجزاء)`,
        shortLabel: `${juzTitle} (×${repeatCount})`,
        isFullJuz: true,
      };
    } else {
      const partsWord = parts.length === 3 ? ' (3 أجزاء كاملة / 24 ربعاً)' : parts.length === 1 ? ' (جزء كامل / 8 أرباع)' : ` (${parts.length} أجزاء كاملة)`;
      return {
        fullDescription: `${juzTitle}${partsWord}`,
        shortLabel: juzTitle,
        isFullJuz: true,
      };
    }
  }

  // Not an exact full Juz block:
  if (count === 1) {
    const q = getQuarterByNumber(first);
    const surahText = q?.surahName ? ` (سورة ${q.surahName})` : '';
    if (repeatCount > 1) {
      return {
        fullDescription: `الربع ${first}${surahText} (تكرار ${repeatCount} مرة = بما يعادل 24 ربعاً / 3 أجزاء)`,
        shortLabel: `الربع ${first} (×${repeatCount})`,
        isFullJuz: false,
      };
    }
    return {
      fullDescription: `الربع ${first}${surahText}`,
      shortLabel: `الربع ${first}`,
      isFullJuz: false,
    };
  }

  if (count === 2) {
    if (repeatCount > 1) {
      return {
        fullDescription: `ربعين (الربع ${first} إلى ${last}) (تكرار ${repeatCount} مرة = بما يعادل 24 ربعاً / 3 أجزاء)`,
        shortLabel: `الربع ${first}-${last} (×${repeatCount})`,
        isFullJuz: false,
      };
    }
    return {
      fullDescription: `ربعين (الربع ${first} إلى ${last})`,
      shortLabel: `الربع ${first}-${last}`,
      isFullJuz: false,
    };
  }

  if (count === 4) {
    if (repeatCount > 1) {
      return {
        fullDescription: `4 أرباع / نصف جزء (من الربع ${first} إلى ${last}) (تكرار ${repeatCount} مرات = بما يعادل 24 ربعاً / 3 أجزاء)`,
        shortLabel: `الأرباع ${first}-${last} (×${repeatCount})`,
        isFullJuz: false,
      };
    }
    return {
      fullDescription: `4 أرباع / نصف جزء (من الربع ${first} إلى ${last})`,
      shortLabel: `الأرباع ${first}-${last}`,
      isFullJuz: false,
    };
  }

  // General count
  if (repeatCount > 1) {
    return {
      fullDescription: `من الربع ${first} إلى ${last} (${count} أرباع - تكرار ${repeatCount} مرات = بما يعادل 24 ربعاً / 3 أجزاء)`,
      shortLabel: `الأرباع ${first}-${last} (×${repeatCount})`,
      isFullJuz: false,
    };
  }

  // If starts at 1 with multiple quarters:
  if (first === 1 && count > 8) {
    const fullJuzCount = Math.floor(count / 8);
    const remRubs = count % 8;
    const parts = Array.from({ length: fullJuzCount }, (_, i) => i + 1);
    const remWord = remRubs === 1 ? 'ربع واحد' : remRubs === 2 ? 'ربعين' : `${remRubs} أرباع`;
    return {
      fullDescription: `الجزء ${parts.join(' - ')} + ${remWord} (من الربع 1 إلى ${last} = ${count} ربعاً)`,
      shortLabel: `الجزء ${parts.join(' - ')} + ${remRubs} أرباع`,
      isFullJuz: false,
    };
  }

  return {
    fullDescription: `مراجعة ${count} أرباع (من الربع ${first} إلى ${last})`,
    shortLabel: `الأرباع ${first}-${last}`,
    isFullJuz: false,
  };
}

/**
 * Formats a student's Quran progress in Juz' and Quarters according to authentic Quranic rules:
 * e.g. 100 -> "12 جزء و 4 أرباع", 96 -> "12 جزء كامل", 25 -> "3 أجزاء و ربع واحد", 8 -> "جزء كامل", 2 -> "ربعين".
 */
export function formatQuranProgress(rubNumber: number): string {
  if (!rubNumber || rubNumber <= 0) return 'لم يبدأ بعد';
  const wholeJuz = Math.floor(rubNumber / 8);
  const remainingRubs = rubNumber % 8;

  if (wholeJuz === 0) {
    if (remainingRubs === 1) return 'ربع واحد';
    if (remainingRubs === 2) return 'ربعين';
    return `${remainingRubs} أرباع`;
  }

  // Exact whole Juz reached
  if (remainingRubs === 0) {
    if (wholeJuz === 1) return 'جزء كامل';
    if (wholeJuz === 2) return 'جزآن كاملان';
    if (wholeJuz >= 3 && wholeJuz <= 10) return `${wholeJuz} أجزاء كاملة`;
    if (wholeJuz === 30) return '30 جزءاً كاملاً (ختمة كاملة)';
    return `${wholeJuz} جزءاً كاملاً`;
  }

  // Juz + remaining rubs
  let juzText = '';
  if (wholeJuz === 1) juzText = 'جزء واحد';
  else if (wholeJuz === 2) juzText = 'جزآن';
  else if (wholeJuz >= 3 && wholeJuz <= 10) juzText = `${wholeJuz} أجزاء`;
  else juzText = `${wholeJuz} جزء`;

  let rubText = '';
  if (remainingRubs === 1) rubText = 'ربع واحد';
  else if (remainingRubs === 2) rubText = 'ربعين';
  else rubText = `${remainingRubs} أرباع`;

  return `${juzText} و ${rubText}`;
}

/**
 * Generates the full breakdown of all days in the student's complete Khatmah Revision Cycle (دورة ختمة الورد).
 *
 * Exact Quranic Progression Rules:
 * 1. If memorized quarters M <= 24 (<= 3 Juz'):
 *    - The student reviews all M quarters in a single daily cycle day.
 * 2. If memorized quarters M > 24 (> 3 Juz'):
 *    - The archive is partitioned into 3-Juz blocks (24 quarters each):
 *      Day 1: Juz 1 - 2 - 3 (Quarters 1..24)
 *      Day 2: Juz 4 - 5 - 6 (Quarters 25..48)
 *      Day 3: Juz 7 - 8 - 9 (Quarters 49..72)
 *      Day 4: Juz 10 - 11 - 12 (Quarters 73..96)
 *      ...
 *    - If there is a remainder of R quarters (where 0 < R < 24):
 *      The final day covers quarters from (fullBlocks * 24 + 1) to M,
 *      repeated N = Math.round(24 / R) times to equal the daily 3-Juz (24-quarter) capacity!
 *      Example 1: 3 Juz + 1 quarter (25 quarters) -> Day 2: Quarter 25 repeated 24 times (1 x 24 = 24).
 *      Example 2: 4 Juz (32 quarters) -> Day 2: Juz 4 (8 quarters) repeated 3 times (8 x 3 = 24).
 *      Example 3: 12 Juz + 4 quarters (100 quarters) -> Day 5: Quarters 97..100 (4 quarters) repeated 6 times (4 x 6 = 24).
 *    - After the final day, the cycle restarts seamlessly from Day 1.
 */
export function getCycleDaysBreakdown(currentRub: number): CycleDayInfo[] {
  const safeRub = Math.max(1, Math.min(240, currentRub));
  const maxDailyWird = 24; // 24 quarters = 3 Juz'

  if (safeRub <= maxDailyWird) {
    const rubs = Array.from({ length: safeRub }, (_, i) => i + 1);
    const formatted = formatRubsToJuzDescription(rubs, 1);
    return [
      {
        dayNumber: 1,
        totalDays: 1,
        rubs,
        startRub: 1,
        endRub: safeRub,
        distinctCount: safeRub,
        repeatCount: 1,
        totalQuartersVolume: safeRub,
        isRemainder: false,
        title: formatted.shortLabel,
        description: formatted.fullDescription,
        shortLabel: formatted.shortLabel,
      },
    ];
  }

  const fullBlocksCount = Math.floor(safeRub / maxDailyWird);
  const remainderQuarters = safeRub % maxDailyWird;
  const totalDays = fullBlocksCount + (remainderQuarters > 0 ? 1 : 0);

  const days: CycleDayInfo[] = [];

  for (let b = 0; b < fullBlocksCount; b++) {
    const startRub = b * maxDailyWird + 1;
    const endRub = (b + 1) * maxDailyWird;
    const rubs: number[] = [];
    for (let r = startRub; r <= endRub; r++) {
      rubs.push(r);
    }
    const formatted = formatRubsToJuzDescription(rubs, 1);
    days.push({
      dayNumber: b + 1,
      totalDays,
      rubs,
      startRub,
      endRub,
      distinctCount: maxDailyWird,
      repeatCount: 1,
      totalQuartersVolume: maxDailyWird,
      isRemainder: false,
      title: formatted.shortLabel,
      description: formatted.fullDescription,
      shortLabel: formatted.shortLabel,
    });
  }

  if (remainderQuarters > 0) {
    const startRub = fullBlocksCount * maxDailyWird + 1;
    const endRub = safeRub;
    const rubs: number[] = [];
    for (let r = startRub; r <= endRub; r++) {
      rubs.push(r);
    }
    const distinctCount = rubs.length;
    const repeatCount = Math.max(1, Math.round(maxDailyWird / distinctCount));
    const formatted = formatRubsToJuzDescription(rubs, repeatCount);
    days.push({
      dayNumber: totalDays,
      totalDays,
      rubs,
      startRub,
      endRub,
      distinctCount,
      repeatCount,
      totalQuartersVolume: distinctCount * repeatCount,
      isRemainder: true,
      title: formatted.shortLabel,
      description: formatted.fullDescription,
      shortLabel: formatted.shortLabel,
    });
  }

  return days;
}

/**
 * Calculates what the student's daily self-revision (ورد المراجعة الذاتية) is for any specific day.
 */
export function getDailyRevisionAssignment(
  studentCurrentRub: number,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  cycleOffsetDay: number = 0, // day offset for rotating across the cycle
  student?: Student
): { 
  assignedRubs: number[]; 
  totalCount: number; 
  distinctCount: number;
  repeatCount: number;
  description: string; 
  shortLabel: string;
  isCircleDay: boolean;
  isFullJuz: boolean;
  isCustomWird: boolean;
  cycleDayNumber: number;
  totalCycleDays: number;
  isRemainderDay: boolean;
} {
  const isCircleDay = dayOfWeek === 0 || dayOfWeek === 3; // Sunday or Wednesday

  // 1. Check if the student has a custom assigned daily wird (ورد مخصص يدوياً)
  if (student?.customWirdType === 'custom_juz' && student.customWirdJuzRange) {
    const [startJuz, endJuz] = student.customWirdJuzRange;
    const startRub = Math.max(1, (startJuz - 1) * 8 + 1);
    const endRub = Math.min(240, endJuz * 8);
    const assignedRubs: number[] = [];
    for (let r = startRub; r <= endRub; r++) {
      assignedRubs.push(r);
    }
    const formatted = formatRubsToJuzDescription(assignedRubs, 1);
    return {
      assignedRubs,
      totalCount: assignedRubs.length,
      distinctCount: assignedRubs.length,
      repeatCount: 1,
      description: formatted.fullDescription,
      shortLabel: formatted.shortLabel,
      isCircleDay,
      isFullJuz: formatted.isFullJuz,
      isCustomWird: true,
      cycleDayNumber: 1,
      totalCycleDays: 1,
      isRemainderDay: false,
    };
  }

  if (student?.customWirdType === 'custom_rubs' && student.customWirdRubs && student.customWirdRubs.length > 0) {
    const assignedRubs = student.customWirdRubs;
    const repeatCount = student.customWirdRepeat || 1;
    const formatted = formatRubsToJuzDescription(assignedRubs, repeatCount);
    return {
      assignedRubs,
      totalCount: assignedRubs.length * repeatCount,
      distinctCount: assignedRubs.length,
      repeatCount,
      description: formatted.fullDescription,
      shortLabel: formatted.shortLabel,
      isCircleDay,
      isFullJuz: formatted.isFullJuz,
      isCustomWird: true,
      cycleDayNumber: 1,
      totalCycleDays: 1,
      isRemainderDay: false,
    };
  }

  // 2. Standard Pedagogical Algorithm
  const safeRub = Math.max(1, studentCurrentRub);
  const cycleBreakdown = getCycleDaysBreakdown(safeRub);
  const totalCycleDays = cycleBreakdown.length;

  // Determine index in cycle
  const cycleIndex = ((cycleOffsetDay % totalCycleDays) + totalCycleDays) % totalCycleDays;
  const currentCycleDay = cycleBreakdown[cycleIndex] || cycleBreakdown[0];

  return {
    assignedRubs: currentCycleDay.rubs,
    totalCount: currentCycleDay.totalQuartersVolume,
    distinctCount: currentCycleDay.distinctCount,
    repeatCount: currentCycleDay.repeatCount,
    description: currentCycleDay.description,
    shortLabel: currentCycleDay.shortLabel,
    isCircleDay,
    isFullJuz: !currentCycleDay.isRemainder && currentCycleDay.distinctCount >= 8,
    isCustomWird: false,
    cycleDayNumber: currentCycleDay.dayNumber,
    totalCycleDays: currentCycleDay.totalDays,
    isRemainderDay: currentCycleDay.isRemainder,
  };
}

/**
 * Generates the full 7-day schedule for the current or specified week for a student.
 */
export function getWeeklySchedule(student: Student, referenceDate: Date = new Date()): DailyScheduleDay[] {
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sunday
  const diffToSunday = day;
  const sunday = new Date(current);
  sunday.setDate(current.getDate() - diffToSunday);

  const days: DailyScheduleDay[] = [];

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(sunday);
    dateObj.setDate(sunday.getDate() + i);

    const dateStr = dateObj.toISOString().split('T')[0];
    const dayOfWeek = i; // 0=Sun, 1=Mon, ..., 6=Sat
    const dayName = ARABIC_DAYS[dayOfWeek];
    const isCircleDay = dayOfWeek === 0 || dayOfWeek === 3;

    const assignment = getDailyRevisionAssignment(student.currentRub, dayOfWeek, i, student);

    days.push({
      date: dateStr,
      dayOfWeek,
      dayName,
      isCircleDay,
      assignedRubs: assignment.assignedRubs,
      assignedCount: assignment.totalCount,
      description: assignment.description,
      shortLabel: assignment.shortLabel,
      repeatCount: assignment.repeatCount,
      cycleDayNumber: assignment.cycleDayNumber,
      totalCycleDays: assignment.totalCycleDays,
      isRemainderDay: assignment.isRemainderDay,
      isFullJuz: assignment.isFullJuz,
    });
  }

  return days;
}

/**
 * Calculates student stats: Juz' count, completion percentage, next session date.
 */
export function calculateStudentStats(student: Student) {
  const currentJuz = Math.min(30, Math.floor((student.currentRub - 1) / 8) + 1);
  const rubInJuz = ((student.currentRub - 1) % 8) + 1;
  const progressPercent = Math.min(100, Math.round((student.currentRub / 240) * 100));

  // Next circle day (Sunday or Wednesday)
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun, 3=Wed
  let daysUntilNext = 0;

  if (todayDay === 0) {
    daysUntilNext = 0; // Today is Sunday
  } else if (todayDay < 3) {
    daysUntilNext = 3 - todayDay; // Wednesday
  } else if (todayDay === 3) {
    daysUntilNext = 0; // Today is Wednesday
  } else {
    daysUntilNext = 7 - todayDay; // Next Sunday
  }

  const nextCircleDate = new Date(today);
  nextCircleDate.setDate(today.getDate() + daysUntilNext);

  return {
    currentJuz,
    rubInJuz,
    progressPercent,
    nextCircleDayName: nextCircleDate.getDay() === 0 ? 'الأحد' : 'الأربعاء',
    nextCircleDateStr: nextCircleDate.toISOString().split('T')[0],
    isTodayCircleDay: todayDay === 0 || todayDay === 3,
  };
}

/**
 * Formats a clean WhatsApp message for the teacher to copy or send to student/parent.
 */
export function generateWhatsAppMessage(student: Student): string {
  const plan = getRequiredRecitationForSession(student.currentRub);
  const newQ = getQuarterByNumber(plan.newRub);
  const weekly = getWeeklySchedule(student);
  const cycleDays = getCycleDaysBreakdown(student.currentRub);

  const linkingText = plan.linkingRubs.length > 0
    ? plan.linkingRubs.map(r => `• ربع ${r} (${getQuarterByNumber(r)?.surahName || ''})`).join('\n')
    : 'لا يوجد ربط (طالب مستجد)';

  const weeklyText = weekly.map(w => {
    const circleTag = w.isCircleDay ? ' 🕌 [جلسة تسميع بالحلقة]' : '';
    const cycleTag = w.totalCycleDays && w.totalCycleDays > 1 ? ` (اليوم ${w.cycleDayNumber} من ${w.totalCycleDays})` : '';
    return `▪️ ${w.dayName}${circleTag}${cycleTag}: ${w.description}`;
  }).join('\n');

  const cycleSummary = cycleDays.length > 1
    ? `\n━━━━━━━━━━━━━━━\n🔄 *دورة ختمة الورد الكاملة (${cycleDays.length} أيام - بمعدل 3 أجزاء يومياً):*\n` +
      cycleDays.map(cd => `▫️ اليوم ${cd.dayNumber}: ${cd.description}`).join('\n')
    : '';

  return `🌿 *حلقة القرآن الكريم - جامع السرور* 🌿
👤 الطالب: *${student.name}*
🎯 المستوى وموضع الحفظ: ${formatQuranProgress(student.currentRub)} (الربع ${student.currentRub} من 240)

━━━━━━━━━━━━━━━
📖 *المطلوب تسميعه في جلسة الحلقة القادمة:*
⭐ *الربع الجديد:* ربع ${plan.newRub} - سورة ${newQ?.surahName} ("${newQ?.startVerseText.slice(0, 35)}...")
🔗 *أرباع الربط السابق (${plan.linkingRubs.length} أرباع):*
${linkingText}
مجموع ما يسمعه الطالب في الجلسة: ${plan.totalCount} أرباع.

━━━━━━━━━━━━━━━
📅 *جدول ورد المراجعة اليومية للأسبوع الحالي:*
${weeklyText}
${cycleSummary}

💡 *توجيه المعلم:* المراجعة اليومية المنتظمة هي سر رسوخ الحفظ وبركته. بارك الله في همتكم!`;
}
