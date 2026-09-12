import { LocalBackupSnapshot, Student, SessionRecord, DailyRevisionRecord, StudentSubmission } from '../types/quran';

export const LOCAL_BACKUPS_STORAGE_KEY = 'quran_circle_local_backups';
const MAX_LOCAL_BACKUPS = 25;

/**
 * Format timestamp into Arabic date & time string
 */
export function formatArabicDateTime(dateInput: Date | string | number): string {
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return new Date().toLocaleString('ar-SA');

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return d.toLocaleDateString('ar-SA', options);
  } catch {
    return String(dateInput);
  }
}

/**
 * Load all stored local backup snapshots from localStorage
 */
export function getLocalBackups(): LocalBackupSnapshot[] {
  try {
    const raw = localStorage.getItem(LOCAL_BACKUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Error loading local backups from localStorage:', err);
    return [];
  }
}

/**
 * Save a new local backup snapshot to localStorage
 */
export function saveLocalBackup(
  name: string,
  data: LocalBackupSnapshot['data'],
  isAuto = false,
  notes = ''
): LocalBackupSnapshot {
  const existing = getLocalBackups();
  const now = new Date();
  
  const snapshot: LocalBackupSnapshot = {
    id: `backup_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || (isAuto ? `نسخة أمان تلقائية (${formatArabicDateTime(now)})` : `نسخة يدوية (${formatArabicDateTime(now)})`),
    timestamp: now.toISOString(),
    displayDate: formatArabicDateTime(now),
    studentsCount: Array.isArray(data.students) ? data.students.length : 0,
    sessionsCount: Array.isArray(data.sessionRecords) ? data.sessionRecords.length : 0,
    revisionsCount: Array.isArray(data.dailyRevisionRecords) ? data.dailyRevisionRecords.length : 0,
    submissionsCount: Array.isArray(data.rawSubmissions) ? data.rawSubmissions.length : 0,
    isAutoSnapshot: isAuto,
    notes,
    data: {
      version: data.version || '2.0',
      exportDate: now.toISOString(),
      students: data.students || [],
      sessionRecords: data.sessionRecords || [],
      dailyRevisionRecords: data.dailyRevisionRecords || [],
      rawSubmissions: data.rawSubmissions || [],
      selectedDate: data.selectedDate,
    },
  };

  // Prepend new backup
  let updated = [snapshot, ...existing];

  // If exceeding max, prune oldest auto-snapshots first, then oldest overall
  if (updated.length > MAX_LOCAL_BACKUPS) {
    const autoIndices = updated.map((b, i) => b.isAutoSnapshot ? i : -1).filter(i => i !== -1);
    if (autoIndices.length > 5) {
      // Remove last auto snapshot
      const toRemove = autoIndices[autoIndices.length - 1];
      updated.splice(toRemove, 1);
    } else {
      updated = updated.slice(0, MAX_LOCAL_BACKUPS);
    }
  }

  try {
    localStorage.setItem(LOCAL_BACKUPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage quota warning while saving backup snapshot:', err);
    // If quota exceeded, try keeping only top 5 manual snapshots
    try {
      const minimal = updated.filter(b => !b.isAutoSnapshot).slice(0, 5);
      localStorage.setItem(LOCAL_BACKUPS_STORAGE_KEY, JSON.stringify(minimal));
    } catch {
      // ignore
    }
  }

  return snapshot;
}

/**
 * Delete a local backup snapshot by ID
 */
export function deleteLocalBackup(id: string): boolean {
  try {
    const existing = getLocalBackups();
    const filtered = existing.filter(b => b.id !== id);
    localStorage.setItem(LOCAL_BACKUPS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Error deleting local backup:', err);
    return false;
  }
}

/**
 * Take an automatic safety snapshot before major operations (restore, reset, import)
 */
export function takeSafetySnapshot(data: LocalBackupSnapshot['data'], reason: string): LocalBackupSnapshot | null {
  try {
    if (!data.students || data.students.length === 0) return null;
    return saveLocalBackup(`نسخة أمان تلقائية (${reason})`, data, true, reason);
  } catch {
    return null;
  }
}

/**
 * Parse and validate JSON backup content from file or text
 */
export function parseBackupJson(jsonString: string): {
  success: boolean;
  data?: LocalBackupSnapshot['data'];
  error?: string;
  summary?: {
    studentsCount: number;
    sessionsCount: number;
    revisionsCount: number;
    exportDate?: string;
  };
} {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      return { success: false, error: 'الملف أو النص فارغ' };
    }

    const parsed = JSON.parse(jsonString);

    // Support direct object or nested under "data"
    const targetData = parsed.data || parsed;

    if (!targetData.students || !Array.isArray(targetData.students)) {
      return {
        success: false,
        error: 'صيغة النسخة الاحتياطية غير صالحة: لم يتم العثور على قائمة الطلاب (students)',
      };
    }

    const cleanStudents: Student[] = targetData.students.filter((s: any) => s && (s.name || s.id));
    const cleanSessions: SessionRecord[] = Array.isArray(targetData.sessionRecords) ? targetData.sessionRecords : [];
    const cleanRevisions: DailyRevisionRecord[] = Array.isArray(targetData.dailyRevisionRecords) ? targetData.dailyRevisionRecords : [];
    const cleanSubmissions: StudentSubmission[] = Array.isArray(targetData.rawSubmissions) ? targetData.rawSubmissions : [];

    const validatedData: LocalBackupSnapshot['data'] = {
      version: parsed.version || '2.0',
      exportDate: parsed.exportDate || targetData.exportDate || new Date().toISOString(),
      students: cleanStudents,
      sessionRecords: cleanSessions,
      dailyRevisionRecords: cleanRevisions,
      rawSubmissions: cleanSubmissions,
      selectedDate: targetData.selectedDate,
    };

    return {
      success: true,
      data: validatedData,
      summary: {
        studentsCount: cleanStudents.length,
        sessionsCount: cleanSessions.length,
        revisionsCount: cleanRevisions.length,
        exportDate: validatedData.exportDate,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'تعذر قراءة ملف النسخة الاحتياطية: تأكد أنه ملف بتنسيق JSON صحيح (' + (err?.message || '') + ')',
    };
  }
}

/**
 * Download backup data as a .json file directly to user device
 */
export function exportBackupToFile(data: LocalBackupSnapshot['data'], customFilename?: string): void {
  try {
    const payload = {
      version: '2.0',
      appName: 'منظومة حلقة جامع الهدى القرآنية',
      exportDate: new Date().toISOString(),
      displayDate: formatArabicDateTime(new Date()),
      studentsCount: data.students.length,
      sessionsCount: data.sessionRecords.length,
      revisionsCount: data.dailyRevisionRecords.length,
      data: {
        students: data.students,
        sessionRecords: data.sessionRecords,
        dailyRevisionRecords: data.dailyRevisionRecords,
        rawSubmissions: data.rawSubmissions || [],
        selectedDate: data.selectedDate,
      },
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const defaultName = `نسخة_حلقة_القرآن_${dateStr}_${data.students.length}_طلاب.json`;
    const finalFilename = customFilename || defaultName;

    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error triggering backup download:', err);
    throw new Error('تعذر إنشاء ملف النسخة الاحتياطية وتنزيله');
  }
}
