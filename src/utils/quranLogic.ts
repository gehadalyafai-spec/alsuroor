import { RecitationPlan, DailyScheduleDay, Student } from '../types/quran';
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
 * If quarters span full Juz' (e.g. 1..24), it is displayed as "الجزء 1 - 2 - 3".
 * If there are remaining quarters with a repeat count (e.g. 2 quarters × 12), it mentions the repeat count and 3 Juz equivalent.
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
  // A whole Juz block starts at ((first - 1) % 8 === 0) and ends at (last % 8 === 0)
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
      return {
        fullDescription: juzTitle,
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
        fullDescription: `ربعين من الربع ${first} إلى ${last} (تكرار ${repeatCount} مرة = بما يعادل 24 ربعاً / 3 أجزاء)`,
        shortLabel: `الربع ${first}-${last} (×${repeatCount})`,
        isFullJuz: false,
      };
    }
    return {
      fullDescription: `ربعين (من الربع ${first} إلى ${last})`,
      shortLabel: `الربع ${first}-${last}`,
      isFullJuz: false,
    };
  }

  // Count > 2 but not exact whole Juz block:
  if (repeatCount > 1) {
    return {
      fullDescription: `من الربع ${first} إلى ${last} (${count} أرباع - تكرار ${repeatCount} مرات = بما يعادل 24 ربعاً / 3 أجزاء)`,
      shortLabel: `الأرباع ${first}-${last} (×${repeatCount})`,
      isFullJuz: false,
    };
  }

  // If first === 1 and has whole juz plus remaining rubs (e.g., 10 quarters):
  if (first === 1 && count > 8) {
    const fullJuzCount = Math.floor(count / 8);
    const remRubs = count % 8;
    const parts = Array.from({ length: fullJuzCount }, (_, i) => i + 1);
    const remWord = remRubs === 1 ? 'ربع واحد' : remRubs === 2 ? 'ربعين' : `${remRubs} أرباع`;
    return {
      fullDescription: `الجزء ${parts.join(' - ')} + ${remWord} (من الربع 1 إلى ${last})`,
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
 * Formats a student's Quran progress in Juz' and Quarters according to Quranic rules:
 * e.g. 99 -> "12 جزء و 3 أرباع", 96 -> "12 جزء كامل", 8 -> "جزء كامل", 2 -> "ربعين".
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
 * Calculates what the student's daily self-revision (ورد المراجعة الذاتية) is for each day of the week.
 *
 * Rules:
 * 1. If student has a custom configured wird (e.g. custom_juz [7, 9] or custom_rubs): uses that explicitly.
 * 2. Mon & Tue: Reviews what was memorized up to Sunday's session.
 * 3. Wed: Circle session (tests previous + new quarter).
 * 4. Thu, Fri, Sat: Reviews what has been memorized up to Wednesday's session.
 * 5. Sun: Circle session (tests previous + new quarter).
 * 6. Daily review capacity: 24 quarters (3 Juz').
 *    - Once the student reaches 24 quarters (or whole Juz blocks), the assignment is written as Juz' (e.g. "الجزء 1 - 2 - 3").
 *    - If memorized quarters exceed 24 (e.g. 26 quarters), it rotates in chunks of up to 24 quarters.
 *      The remaining chunk (e.g. 2 quarters) is repeated (e.g. 12 times) to equal the 24-quarter daily capacity (3 Juz').
 */
export function getDailyRevisionAssignment(
  studentCurrentRub: number,
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  cycleOffsetDay: number = 0, // day offset for rotating when memorized >= 24
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
    };
  }

  // 2. Default Auto-Rotation calculation based on memorized quarters
  // Effective memorized count prior to this day
  let effectiveMemorized = Math.max(1, studentCurrentRub - 1);
  if (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    // After Wednesday session or on Sunday
    effectiveMemorized = Math.max(1, studentCurrentRub);
  }

  const maxDailyWird = 24; // 24 quarters = 3 Juz'
  let assignedRubs: number[] = [];
  let repeatCount = 1;

  if (effectiveMemorized <= maxDailyWird) {
    // Student has 24 quarters or fewer
    for (let r = 1; r <= effectiveMemorized; r++) {
      assignedRubs.push(r);
    }
  } else {
    // Student has more than 24 quarters memorized!
    // Partition the archive into chunks of up to 24 quarters (3 Juz' each)
    const totalCycleDays = Math.ceil(effectiveMemorized / maxDailyWird);
    const cycleIndex = ((cycleOffsetDay % totalCycleDays) + totalCycleDays) % totalCycleDays;

    const startRub = cycleIndex * maxDailyWird + 1;
    const endRub = Math.min(effectiveMemorized, (cycleIndex + 1) * maxDailyWird);

    for (let r = startRub; r <= endRub; r++) {
      assignedRubs.push(r);
    }

    const distinctCount = assignedRubs.length;
    if (distinctCount < maxDailyWird) {
      repeatCount = Math.max(1, Math.round(maxDailyWird / distinctCount));
    }
  }

  const formatted = formatRubsToJuzDescription(assignedRubs, repeatCount);
  const totalCount = assignedRubs.length * repeatCount;

  return {
    assignedRubs,
    totalCount,
    distinctCount: assignedRubs.length,
    repeatCount,
    description: formatted.fullDescription,
    shortLabel: formatted.shortLabel,
    isCircleDay,
    isFullJuz: formatted.isFullJuz,
    isCustomWird: false,
  };
}

/**
 * Generates the full 7-day schedule for the current or specified week for a student.
 */
export function getWeeklySchedule(student: Student, referenceDate: Date = new Date()): DailyScheduleDay[] {
  // Find the Sunday of the current week (starting Sunday)
  const current = new Date(referenceDate);
  const day = current.getDay(); // 0 is Sunday
  const diffToSunday = day; // 0 days back if today is Sunday
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

    // Use day offset i for rotating chunks across the days of the week
    const assignment = getDailyRevisionAssignment(student.currentRub, dayOfWeek, i, student);

    days.push({
      date: dateStr,
      dayOfWeek,
      dayName,
      isCircleDay,
      assignedRubs: assignment.assignedRubs,
      assignedCount: assignment.totalCount,
      description: assignment.description,
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

  const linkingText = plan.linkingRubs.length > 0
    ? plan.linkingRubs.map(r => `• ربع ${r} (${getQuarterByNumber(r)?.surahName || ''})`).join('\n')
    : 'لا يوجد ربط (طالب مستجد)';

  const weeklyText = weekly.map(w => {
    const circleTag = w.isCircleDay ? ' 🕌 [يوم الحلقة]' : '';
    return `▪️ ${w.dayName}${circleTag}: ${w.description}`;
  }).join('\n');

  return `🌿 *حلقة القرآن الكريم - جدول المتابعة* 🌿
👤 الطالب: *${student.name}*
🎯 المستوى الحالي: الجزء ${Math.floor((student.currentRub - 1) / 8) + 1} - الربع ${((student.currentRub - 1) % 8) + 1} (الربع الإجمالي ${student.currentRub} من 240)

━━━━━━━━━━━━━━━
📖 *المطلوب تسميعه في جلسة الحلقة القادمة:*
⭐ *الربع الجديد:* ربع ${plan.newRub} - سورة ${newQ?.surahName} ("${newQ?.startVerseText.slice(0, 35)}...")
🔗 *أرباع الربط السابق (${plan.linkingRubs.length} أرباع):*
${linkingText}
مجموع ما يسمعه الطالب في الحلقة: ${plan.totalCount} أرباع.

━━━━━━━━━━━━━━━
📅 *جدول ورد المراجعة الذاتية للأسبوع الحالي:*
${weeklyText}

💡 *توجيه المعلم:* المراجعة اليومية هي سر رسوخ الحفظ وبركته. بارك الله في همتكم!`;
}
