export interface QuranQuarter {
  rubNumber: number; // 1 to 240
  juz: number; // 1 to 30
  rubInJuz: number; // 1 to 8
  hizb: number; // 1 to 60
  rubInHizb: number; // 1 to 4
  surahName: string; // e.g. "البقرة"
  surahNumber: number;
  startVerseText: string; // Opening words e.g. "إن الله لا يستحيي"
  startVerseNumber: number;
  approxPage: number;
}

export type SessionGrade = 'perfect' | 'very_good' | 'good' | 'needs_repeat' | 'absent';
export type RevisionStatus = 'completed' | 'partial' | 'missed' | 'pending';
export type UserRole = 'supervisor' | 'student';

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string;
  email?: string;
  accessCode: string; // 6-character unique login code (e.g. "STU-842")
  pin?: string; // Optional secret PIN for student login
  joinDate: string; // YYYY-MM-DD
  currentRub: number; // 1 to 240: Target new quarter for next session
  completedRubCount: number; // Number of quarters successfully passed
  status: 'active' | 'inactive';
  notes: string;
  avatarColor: string;
  // Custom Daily Wird Override (تخصيص الورد اليومي للمراجعة)
  customWirdType?: 'auto' | 'custom_start' | 'custom_juz' | 'custom_rubs';
  customWirdStartJuz?: number; // 1 to 30: Starting Juz for the full smart cycle rotation (نقطة بداية دوران كامل المحفوظ)
  customWirdJuzRange?: [number, number]; // legacy support
  customWirdRubs?: number[]; // custom quarters
  customWirdRepeat?: number; // custom repeat count
}

export type SubmissionType = 'daily_revision' | 'session';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface StudentSubmission {
  id: string;
  supervisorUid: string;
  supervisorEmail?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  accessCode?: string;
  type: SubmissionType;
  date: string; // YYYY-MM-DD
  status: SubmissionStatus;
  revisionData?: {
    status: RevisionStatus;
    rating?: number;
    notes?: string;
    assignedRubs: number[];
  };
  sessionData?: {
    newRub: number;
    recitedRubs: number[];
    grade?: SessionGrade;
    mistakesCount?: number;
    hesitationsCount?: number;
    studentNotes?: string;
    advanceToNext?: boolean;
  };
  supervisorFeedback?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface SessionRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  dayName: string; // 'الأحد' | 'الأربعاء' | etc.
  newRub: number; // The new quarter tested
  recitedRubs: number[]; // All quarters recited (e.g. 4 quarters: [newRub-3, newRub-2, newRub-1, newRub])
  grade: SessionGrade;
  mistakesCount: number;
  hesitationsCount: number;
  teacherNotes: string;
  advancedToNext: boolean;
  createdAt: string;
}

export interface DailyRevisionRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...
  dayName: string;
  assignedRubs: number[]; // Array of quarter numbers assigned
  assignedCount: number;
  status: RevisionStatus;
  rating?: number; // 1 to 5
  notes?: string;
  verifiedByTeacher: boolean;
  updatedAt: string;
}

export interface RecitationPlan {
  newRub: number;
  linkingRubs: number[]; // 1 to 3 quarters before newRub
  allRubs: number[]; // All quarters to recite in circle session
  totalCount: number;
}

export interface CycleDayInfo {
  dayNumber: number;
  totalDays: number;
  rubs: number[];
  startRub: number;
  endRub: number;
  distinctCount: number;
  repeatCount: number;
  totalQuartersVolume: number;
  isRemainder: boolean;
  title: string;
  description: string;
  shortLabel: string;
}

export interface DailyScheduleDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 to 6
  dayName: string; // الأحد، الإثنين...
  isCircleDay: boolean; // Sunday or Wednesday
  assignedRubs: number[];
  assignedCount: number;
  description: string;
  shortLabel?: string;
  repeatCount?: number;
  cycleDayNumber?: number;
  totalCycleDays?: number;
  isRemainderDay?: boolean;
  isFullJuz?: boolean;
  isCompleted?: boolean;
}

export type MutashabihatCategory = 
  | 'letters_particles' // حروف وزيادات
  | 'word_order'        // تقديم وتأخير
  | 'endings'           // فواصل وخواتيم الآيات
  | 'stories'           // قصص الأنبياء
  | 'word_replacement'  // إبدال كلمات
  | 'general';          // عامة

export interface MutashabihahVerse {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  juz: number;
  page: number;
  text: string;
  highlightPhrase: string;
  contextNote?: string;
}

export interface MutashabihahItem {
  id: string;
  title: string;
  category: MutashabihatCategory;
  juzList: number[];
  surahs: string[];
  verses: MutashabihahVerse[];
  rule: string;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
}
