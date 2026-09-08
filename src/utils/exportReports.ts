import * as XLSX from 'xlsx';
import { Student, SessionRecord, DailyRevisionRecord } from '../types/quran';
import { getQuarterDetails } from '../data/quranData';
import { formatRubsToJuzDescription } from './quranLogic';

/**
 * Exports all students summary and statistics into a formatted Excel (.xlsx) file
 */
export function exportAllStudentsToExcel(
  students: Student[],
  sessions: SessionRecord[],
  revisions: DailyRevisionRecord[],
  circleName = 'جامع السرور - حلقة القرآن الكريم'
) {
  // 1. All Students General Sheet
  const studentsRows = students.map((s, idx) => {
    const qInfo = getQuarterDetails(s.currentRub);
    const studentSessions = sessions.filter(ses => ses.studentId === s.id);
    const studentRevisions = revisions.filter(rev => rev.studentId === s.id);
    const completedRevisions = studentRevisions.filter(r => r.status === 'completed').length;
    const revisionRate = studentRevisions.length > 0 
      ? Math.round((completedRevisions / studentRevisions.length) * 100) 
      : 0;

    const lastSession = studentSessions[studentSessions.length - 1];

    const gradeArabic: Record<string, string> = {
      perfect: 'ممتاز',
      very_good: 'جيد جداً',
      good: 'جيد',
      needs_repeat: 'يحتاج إعادة',
      absent: 'غائب',
    };

    return {
      'م': idx + 1,
      'اسم الطالب': s.name,
      'رقم الجوال': s.phone || 'غير مسجل',
      'جوال ولي الأمر': s.parentPhone || 'غير مسجل',
      'تاريخ الانضمام': s.joinDate || '—',
      'الحالة': s.status === 'active' ? 'نشط' : 'متوقف',
      'الربع الحالي المستهدف': s.currentRub,
      'السورة الحالية': qInfo ? `سورة ${qInfo.surahName}` : '—',
      'الجزء الحالي': qInfo ? `الجزء ${qInfo.juz}` : '—',
      'الحزب': qInfo ? `الحزب ${qInfo.hizb}` : '—',
      'الصفحة التقريبية': qInfo ? qInfo.approxPage : '—',
      'عدد الأرباع المنجزة': s.completedRubCount,
      'نسبة الختمة %': `${((s.completedRubCount / 240) * 100).toFixed(1)}%`,
      'إجمالي جلسات التسميع': studentSessions.length,
      'آخر تقدير تسميع': lastSession ? (gradeArabic[lastSession.grade] || lastSession.grade) : 'لم يسمع بعد',
      'تاريخ آخر تسميع': lastSession ? lastSession.date : '—',
      'نسبة إنجاز الورد اليومي': `${revisionRate}%`,
      'ملاحظات المعلم': s.notes || '—',
    };
  });

  // 2. All Sessions Log Sheet
  const sessionsRows = sessions.map((ses, idx) => {
    const student = students.find(s => s.id === ses.studentId);
    const qInfo = getQuarterDetails(ses.newRub);
    const gradeArabic: Record<string, string> = {
      perfect: 'ممتاز',
      very_good: 'جيد جداً',
      good: 'جيد',
      needs_repeat: 'يحتاج إعادة',
      absent: 'غائب',
    };

    return {
      'م': idx + 1,
      'تاريخ الجلسة': ses.date,
      'اليوم': ses.dayName,
      'اسم الطالب': student ? student.name : 'طالب محذوف',
      'الربع الجديد': ses.newRub,
      'السورة': qInfo ? qInfo.surahName : '—',
      'الأرباع المسردة في الجلسة': ses.recitedRubs.join('، '),
      'التقدير': gradeArabic[ses.grade] || ses.grade,
      'عدد الأخطاء': ses.mistakesCount,
      'عدد الترددات': ses.hesitationsCount,
      'ارتقى للربع التالي': ses.advancedToNext ? 'نعم' : 'لا (تثبيت)',
      'ملاحظات المحفظ': ses.teacherNotes || '—',
    };
  });

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  const wsStudents = XLSX.utils.json_to_sheet(studentsRows);
  const wsSessions = XLSX.utils.json_to_sheet(sessionsRows);

  XLSX.utils.book_append_sheet(workbook, wsStudents, 'بيانات الطلاب');
  XLSX.utils.book_append_sheet(workbook, wsSessions, 'سجل التسميعات');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `تقرير_شامل_${circleName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
}

/**
 * Exports an individual student's comprehensive file to Excel (.xlsx)
 */
export function exportStudentToExcel(
  student: Student,
  sessions: SessionRecord[],
  revisions: DailyRevisionRecord[]
) {
  const qInfo = getQuarterDetails(student.currentRub);
  const studentSessions = sessions.filter(s => s.studentId === student.id);
  const studentRevisions = revisions.filter(r => r.studentId === student.id);

  // Student Profile Summary
  const profileRow = [{
    'البيان': 'اسم الطالب',
    'القيمة': student.name,
  }, {
    'البيان': 'رقم الجوال',
    'القيمة': student.phone || 'غير مسجل',
  }, {
    'البيان': 'جوال ولي الأمر',
    'القيمة': student.parentPhone || 'غير مسجل',
  }, {
    'البيان': 'تاريخ الانضمام',
    'القيمة': student.joinDate || '—',
  }, {
    'البيان': 'الربع المستهدف حالياً',
    'القيمة': `${student.currentRub} (${qInfo ? `سورة ${qInfo.surahName} - الجزء ${qInfo.juz}` : ''})`,
  }, {
    'البيان': 'إجمالي الأرباع المنجزة',
    'القيمة': `${student.completedRubCount} من 240 ربعاً`,
  }, {
    'البيان': 'نسبة الإنجاز من المصحف',
    'القيمة': `${((student.completedRubCount / 240) * 100).toFixed(1)}%`,
  }, {
    'البيان': 'إجمالي جلسات التسميع',
    'القيمة': studentSessions.length,
  }, {
    'البيان': 'ملاحظات المعلم',
    'القيمة': student.notes || '—',
  }];

  // Sessions Table
  const gradeArabic: Record<string, string> = {
    perfect: 'ممتاز',
    very_good: 'جيد جداً',
    good: 'جيد',
    needs_repeat: 'يحتاج إعادة',
    absent: 'غائب',
  };

  const sessionsRows = studentSessions.map((ses, idx) => {
    const sesQInfo = getQuarterDetails(ses.newRub);
    return {
      'م': idx + 1,
      'التاريخ': ses.date,
      'اليوم': ses.dayName,
      'الربع الجديد': ses.newRub,
      'السورة': sesQInfo ? sesQInfo.surahName : '—',
      'الأرباع المسردة': ses.recitedRubs.join('، '),
      'التقدير': gradeArabic[ses.grade] || ses.grade,
      'الأخطاء': ses.mistakesCount,
      'الترددات': ses.hesitationsCount,
      'الانتقال للربع التالي': ses.advancedToNext ? 'نعم (اجتاز)' : 'لا (تثبيت ومراجعة)',
      'ملاحظات المحفظ': ses.teacherNotes || '—',
    };
  });

  // Revisions Table
  const statusArabic: Record<string, string> = {
    completed: 'مكتمل',
    partial: 'جزئي',
    missed: 'لم يقرأ',
    pending: 'قيد المتابعة',
  };

  const revisionsRows = studentRevisions.map((rev, idx) => ({
    'م': idx + 1,
    'التاريخ': rev.date,
    'اليوم': rev.dayName,
    'الورد المقرر': formatRubsToJuzDescription(rev.assignedRubs).fullDescription,
    'حالة الورد': statusArabic[rev.status] || rev.status,
    'التقييم (من 5)': rev.rating ? `${rev.rating}/5` : '—',
    'ملاحظات': rev.notes || '—',
  }));

  const workbook = XLSX.utils.book_new();

  const wsProfile = XLSX.utils.json_to_sheet(profileRow);
  const wsSessions = XLSX.utils.json_to_sheet(sessionsRows);
  const wsRevisions = XLSX.utils.json_to_sheet(revisionsRows);

  XLSX.utils.book_append_sheet(workbook, wsProfile, 'بيانات الطالب');
  XLSX.utils.book_append_sheet(workbook, wsSessions, 'سجل التسميعات');
  XLSX.utils.book_append_sheet(workbook, wsRevisions, 'سجل الورد اليومي');

  const safeName = student.name.trim().replace(/\s+/g, '_');
  XLSX.writeFile(workbook, `تقرير_الطالب_${safeName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
