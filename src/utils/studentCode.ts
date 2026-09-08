import { Student } from '../types/quran';

/**
 * Converts Eastern Arabic-Indic digits (٠-٩) to standard Western digits (0-9)
 * and normalizes the code by trimming and converting to uppercase.
 */
export function normalizeStudentCode(input: string): string {
  if (!input) return '';
  
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let normalized = input.trim();

  // Replace Arabic digits with standard ASCII digits
  for (let i = 0; i < 10; i++) {
    normalized = normalized.replaceAll(arabicDigits[i], i.toString());
  }

  // Remove leading '#' or symbols, replace multiple spaces
  normalized = normalized.replace(/^[#№\s]+/, '').trim().toUpperCase();

  return normalized;
}

/**
 * Extracts just the numeric part of a code (e.g. "STU-1005" -> "1005")
 */
export function extractCodeNumber(code: string): string {
  const norm = normalizeStudentCode(code);
  const match = norm.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Checks if a user's input query matches a student's access code or phone/email.
 * Matches:
 * - Exact code: "STU-1001" vs "STU-1001"
 * - Number only: "1001" vs "STU-1001"
 * - Case-insensitive / prefix-insensitive: "stu1001" vs "STU-1001"
 * - Phone number: "0501234567" or suffix "4567"
 * - Student email
 */
export function matchStudentCode(student: Student, queryCode: string): boolean {
  if (!student || !queryCode) return false;
  
  const rawQuery = queryCode.trim();
  const normQuery = normalizeStudentCode(queryCode);
  const queryNum = extractCodeNumber(normQuery);
  const normStudentCode = normalizeStudentCode(student.accessCode || '');
  const studentNum = extractCodeNumber(normStudentCode);

  // 1. Direct match with normalized code
  if (normStudentCode && normStudentCode === normQuery) return true;

  // 2. Direct match with student name (exact name match)
  if (student.name && student.name.trim().toLowerCase() === rawQuery.toLowerCase()) return true;

  // 3. Compact code match (e.g. "STU1001" vs "STU-1001")
  const compactQuery = normQuery.replace(/[^A-Z0-9]/g, '');
  const compactStudent = normStudentCode.replace(/[^A-Z0-9]/g, '');
  if (compactQuery && compactStudent && compactQuery === compactStudent) return true;

  // 4. Numeric match (e.g. "1001" matches "STU-1001")
  if (queryNum && studentNum && queryNum === studentNum) return true;

  // 5. Match if query with "STU-" matches
  if (normStudentCode && `STU-${normQuery}` === normStudentCode) return true;
  if (normStudentCode && `STU${normQuery}` === normStudentCode) return true;

  // 6. Match student phone (exact or last 7 digits, or without leading 0)
  if (student.phone) {
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const cleanQuery = normQuery.replace(/[^0-9]/g, '');
    if (cleanQuery && cleanPhone) {
      if (cleanPhone === cleanQuery) return true;
      if (cleanQuery.length >= 6 && cleanPhone.endsWith(cleanQuery)) return true;
      if (cleanPhone.length >= 6 && cleanQuery.endsWith(cleanPhone)) return true;
    }
  }

  // 7. Match parent phone
  if (student.parentPhone) {
    const cleanPhone = student.parentPhone.replace(/[^0-9]/g, '');
    const cleanQuery = normQuery.replace(/[^0-9]/g, '');
    if (cleanQuery && cleanPhone) {
      if (cleanPhone === cleanQuery) return true;
      if (cleanQuery.length >= 6 && cleanPhone.endsWith(cleanQuery)) return true;
      if (cleanPhone.length >= 6 && cleanQuery.endsWith(cleanPhone)) return true;
    }
  }

  // 8. Match student email
  if (student.email && student.email.toLowerCase() === rawQuery.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Generates a guaranteed unique student code formatted as "STU-XXXX"
 * where XXXX starts from 1001 and increments without collision.
 */
export function generateUniqueStudentCode(existingStudents: Student[]): string {
  const existingCodes = new Set<string>();
  const existingNumbers = new Set<number>();

  for (const s of existingStudents) {
    if (s.accessCode) {
      const norm = normalizeStudentCode(s.accessCode);
      existingCodes.add(norm);
      const num = parseInt(extractCodeNumber(norm), 10);
      if (!isNaN(num)) {
        existingNumbers.add(num);
      }
    }
  }

  // Find the next available number starting from 1001
  let nextNum = 1001;
  while (existingNumbers.has(nextNum) || existingCodes.has(`STU-${nextNum}`)) {
    nextNum++;
  }

  return `STU-${nextNum}`;
}

/**
 * Validates and repairs any list of students so every single student has a unique, non-empty access code.
 */
export function ensureAllStudentsHaveUniqueCodes(students: Student[]): Student[] {
  if (!Array.isArray(students)) return [];

  const seenCodes = new Set<string>();
  let nextFallbackNum = 1001;

  return students.map((s, index) => {
    let code = normalizeStudentCode(s.accessCode || '');

    // If code is empty or already seen by an earlier student, assign a new unique code
    if (!code || seenCodes.has(code)) {
      while (seenCodes.has(`STU-${nextFallbackNum}`)) {
        nextFallbackNum++;
      }
      code = `STU-${nextFallbackNum}`;
      nextFallbackNum++;
    }

    seenCodes.add(code);

    return {
      ...s,
      accessCode: code,
    };
  });
}
