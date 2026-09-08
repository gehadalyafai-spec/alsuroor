import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Student, 
  SessionRecord, 
  DailyRevisionRecord, 
  SessionGrade, 
  RevisionStatus, 
  UserRole, 
  StudentSubmission 
} from '../types/quran';
import { getRequiredRecitationForSession, getDailyRevisionAssignment } from '../utils/quranLogic';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  normalizeStudentCode, 
  extractCodeNumber,
  matchStudentCode, 
  generateUniqueStudentCode, 
  ensureAllStudentsHaveUniqueCodes 
} from '../utils/studentCode';
import { safeGetDoc, safeSetDoc, safeDeleteDoc } from '../utils/firestoreHelper';
import { isQuotaExceeded, handleFirestoreError, resetQuotaExceeded } from '../utils/quotaManager';

const STORAGE_KEY = 'quran_circle_tracker_v1';

export type SyncStatus = 'synced' | 'saving' | 'offline' | 'error';

/**
 * Registers all search keys for a list of students in Firestore's /student_registry collection.
 * This guarantees students can log in from any phone or browser by entering their full code (STU-1001),
 * numeric code (1001), or phone number.
 */
export async function registerStudentsInFirestoreRegistry(
  studentsToRegister: Student[],
  supervisorUid: string,
  supervisorEmail: string = ''
) {
  if (isQuotaExceeded()) return;
  if (!studentsToRegister || !supervisorUid || !Array.isArray(studentsToRegister)) return;

  // Track which student states have already been synced in localStorage to prevent redundant writes
  const syncedCacheKey = `quran_synced_fingerprints_${supervisorUid}`;
  let syncedFingerprints: Set<string>;
  try {
    const raw = localStorage.getItem(syncedCacheKey);
    syncedFingerprints = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    syncedFingerprints = new Set();
  }

  for (const s of studentsToRegister) {
    if (isQuotaExceeded()) break;
    if (!s || !s.id) continue;
    const rawCode = s.accessCode || '';
    const normCode = normalizeStudentCode(rawCode);

    // Fingerprint detects changes to student code, rub, pin, phone, or name
    const fingerprint = `${s.id}_${normCode}_${s.currentRub || 1}_${s.completedRubCount || 0}_${s.name}_${s.pin || ''}`;
    if (syncedFingerprints.has(fingerprint)) continue;

    const primaryKey = normCode || s.id;
    if (!primaryKey) continue;

    const payload = {
      accessCode: s.accessCode || normCode,
      studentId: s.id,
      studentName: s.name,
      supervisorUid,
      supervisorEmail,
      currentRub: s.currentRub || 1,
      completedRubCount: s.completedRubCount || 0,
      phone: s.phone || '',
      parentPhone: s.parentPhone || '',
      pin: s.pin || '',
      studentData: s,
      updatedAt: serverTimestamp(),
    };

    try {
      await safeSetDoc(doc(db, 'student_registry', primaryKey), payload, { merge: true });
      syncedFingerprints.add(fingerprint);
    } catch (err) {
      if (handleFirestoreError(err)) break;
    }
  }

  try {
    localStorage.setItem(syncedCacheKey, JSON.stringify(Array.from(syncedFingerprints)));
  } catch {}
}

interface QuranContextType {
  students: Student[];
  sessionRecords: SessionRecord[];
  dailyRevisionRecords: DailyRevisionRecord[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: 'sessions' | 'revision' | 'students' | 'reports' | 'quranIndex' | 'guide';
  setActiveTab: (tab: 'sessions' | 'revision' | 'students' | 'reports' | 'quranIndex' | 'guide') => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;

  // Roles & Student Mode
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeStudentId: string | null;
  setActiveStudentId: (id: string | null) => void;
  loginAsStudent: (accessCode: string, pin?: string) => Promise<{ success: boolean; message?: string; requiresPin?: boolean; studentName?: string }>;
  logoutStudent: () => void;
  switchToStudentView: (studentId: string) => void;
  refreshStudentData: () => Promise<void>;

  // Student Submissions & Approvals System
  submissions: StudentSubmission[];
  pendingSubmissionsCount: number;
  submitDailyRevision: (
    studentId: string,
    date: string,
    data: { status: RevisionStatus; rating: number; notes: string; assignedRubs: number[] }
  ) => Promise<void>;
  submitSessionRecitation: (
    studentId: string,
    date: string,
    data: { newRub: number; recitedRubs: number[]; mistakesCount?: number; hesitationsCount?: number; studentNotes?: string; advanceToNext?: boolean }
  ) => Promise<void>;
  approveSubmission: (
    submissionId: string,
    options?: {
      supervisorFeedback?: string;
      grade?: SessionGrade;
      mistakesCount?: number;
      hesitationsCount?: number;
      advanceToNext?: boolean;
    }
  ) => Promise<void>;
  rejectSubmission: (
    submissionId: string,
    supervisorFeedback: string
  ) => Promise<void>;
  deleteSubmission: (submissionId: string) => Promise<void>;
  approveAllPendingSubmissions: () => Promise<void>;

  // Sync state
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  isLoadingCloud: boolean;
  hasUnsavedChanges: boolean;
  saveToCloudNow: () => Promise<void>;

  // Actions
  addStudent: (data: { 
    name: string; 
    phone?: string; 
    parentPhone?: string; 
    email?: string;
    accessCode?: string;
    initialRub?: number; 
    notes?: string 
  }) => void;
  updateStudent: (id: string, partial: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  recordSessionResult: (data: {
    studentId: string;
    date: string;
    grade: SessionGrade;
    mistakesCount: number;
    hesitationsCount: number;
    notes: string;
    advanceToNext: boolean;
  }) => void;
  recordDailyRevision: (
    studentId: string,
    date: string,
    status: RevisionStatus,
    notes?: string,
    rating?: number
  ) => void;
  getStudentDailyRevision: (studentId: string, date: string) => DailyRevisionRecord | undefined;
  getStudentSessions: (studentId: string) => SessionRecord[];
  resetToSampleData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  importFromTransferData: (
    data: {
      students?: Student[];
      sessionRecords?: SessionRecord[];
      dailyRevisionRecords?: DailyRevisionRecord[];
    },
    mode: 'replace' | 'merge'
  ) => void;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

// Legacy mock IDs to exclude so they never resurrect, while preserving all real student entries
const LEGACY_MOCK_STUDENT_IDS = new Set(['std_1', 'std_2', 'std_3', 'std_4', 'std_5']);
const LEGACY_MOCK_SESSION_IDS = new Set(['ses_1', 'ses_2']);
const LEGACY_MOCK_REVISION_IDS = new Set(['rev_1', 'rev_2', 'rev_3']);

const filterOutLegacyMocks = (list: any[], legacySet: Set<string>) => {
  if (!Array.isArray(list)) return [];
  return list.filter(item => item && item.id && !legacySet.has(item.id));
};

export const QuranProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Role & Student Mode State
  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_activeRole');
      if (saved === 'student' || saved === 'supervisor') return saved;
    } catch {
      // ignore
    }
    return 'supervisor';
  });

  const [activeStudentId, setActiveStudentIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + '_activeStudentId') || null;
    } catch {
      // ignore
    }
    return null;
  });

  const [studentSupervisorUid, setStudentSupervisorUid] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + '_studentSupervisorUid') || null;
    } catch {
      return null;
    }
  });

  const [studentSupervisorEmail, setStudentSupervisorEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY + '_studentSupervisorEmail') || null;
    } catch {
      return null;
    }
  });

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY + '_activeRole', role);
    } catch {
      // ignore
    }
  };

  const setActiveStudentId = (id: string | null) => {
    setActiveStudentIdState(id);
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY + '_activeStudentId', id);
      } else {
        localStorage.removeItem(STORAGE_KEY + '_activeStudentId');
      }
    } catch {
      // ignore
    }
  };

  const [rawSubmissions, setRawSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_submissions');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        const filtered = filterOutLegacyMocks(parsed, LEGACY_MOCK_STUDENT_IDS);
        return ensureAllStudentsHaveUniqueCodes(filtered);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [sessionRecords, setSessionRecords] = useState<SessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return filterOutLegacyMocks(parsed, LEGACY_MOCK_SESSION_IDS);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [dailyRevisionRecords, setDailyRevisionRecords] = useState<DailyRevisionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_revisions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return filterOutLegacyMocks(parsed, LEGACY_MOCK_REVISION_IDS);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY + '_lastDate');
      if (savedDate) return savedDate;
    } catch {
      // ignore
    }
    return new Date().toISOString().split('T')[0];
  });

  const [activeTab, setActiveTab] = useState<'sessions' | 'revision' | 'students' | 'quranIndex' | 'guide'>('sessions');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Cloud Sync State
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const hasUnsavedChangesRef = useRef<boolean>(false);
  
  // Guard flag: strictly prevents sending empty/intermediate state to Firestore until cloud data has been loaded
  const isInitialLoadDoneRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<any>(null);
  const lastLocalWriteRef = useRef<number>(0);
  const studentsRef = useRef(students);
  studentsRef.current = students;
  const activeStudentIdRef = useRef(activeStudentId);
  activeStudentIdRef.current = activeStudentId;
  const resolvedSupervisorAttemptRef = useRef<string | null>(null);

  // Reactive submissions filtering for supervisor and student
  const submissions = useMemo(() => {
    if (activeRole === 'student') {
      const currentStu = students.find(st => st.id === activeStudentId);
      const studentSubs = rawSubmissions.filter(s => {
        if (activeStudentId && s.studentId === activeStudentId) return true;
        if (currentStu?.accessCode && s.accessCode && s.accessCode.trim().toUpperCase() === currentStu.accessCode.trim().toUpperCase()) return true;
        return false;
      });
      return [...studentSubs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // In supervisor mode: match all submissions belonging to circle students or supervisor
    const circleStudentIds = new Set(students.map(s => s.id));
    const circleStudentCodes = new Set(students.map(s => s.accessCode?.trim().toUpperCase()).filter(Boolean));
    const circleStudentNames = new Set(students.map(s => s.name?.trim()).filter(Boolean));

    const matchedSubs = rawSubmissions.filter(sub => {
      if (user?.uid && sub.supervisorUid === user.uid) return true;
      if (user?.email && sub.supervisorEmail && sub.supervisorEmail.toLowerCase() === user.email.toLowerCase()) return true;
      if (sub.studentId && circleStudentIds.has(sub.studentId)) return true;
      if (sub.accessCode && circleStudentCodes.has(sub.accessCode.trim().toUpperCase())) return true;
      if (sub.studentName && circleStudentNames.has(sub.studentName.trim())) return true;
      if (!user && (sub.supervisorUid === 'supervisor_default' || sub.supervisorUid === 'default')) return true;
      return false;
    });

    return [...matchedSubs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [rawSubmissions, activeRole, activeStudentId, students, user]);

  // Save to local storage as debounced continuous fallback cache
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY + '_students', JSON.stringify(students));
        localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(sessionRecords));
        localStorage.setItem(STORAGE_KEY + '_revisions', JSON.stringify(dailyRevisionRecords));
        localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(rawSubmissions));
        localStorage.setItem(STORAGE_KEY + '_lastDate', selectedDate);
      } catch (e) {
        console.error('Error saving to localStorage', e);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [students, sessionRecords, dailyRevisionRecords, rawSubmissions, selectedDate]);

  // Real-time Firestore synchronization for submissions
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'submissions'), (snapshot) => {
        const rawSubs: StudentSubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          rawSubs.push({ ...data, id: docSnap.id } as StudentSubmission);
        });
        setRawSubmissions(rawSubs);
      }, (err) => {
        handleFirestoreError(err);
      });

      return () => unsub();
    } catch (err) {
      handleFirestoreError(err);
    }
  }, []);

  // Real-time synchronization of supervisor's personal circle data
  useEffect(() => {
    if (!user || activeRole === 'student') return;
    try {
      const circleDocRef = doc(db, 'users', user.uid, 'circleData', 'main');
      const unsub = onSnapshot(circleDocRef, (snap) => {
        if (hasUnsavedChangesRef.current || Date.now() - lastLocalWriteRef.current < 4000) {
          return;
        }

        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.students)) {
            const cleanStudents = filterOutLegacyMocks(data.students, LEGACY_MOCK_STUDENT_IDS);
            setStudents(ensureAllStudentsHaveUniqueCodes(cleanStudents));
          }
          if (Array.isArray(data.sessionRecords)) {
            const cleanSessions = filterOutLegacyMocks(data.sessionRecords, LEGACY_MOCK_SESSION_IDS);
            setSessionRecords(cleanSessions);
          }
          if (Array.isArray(data.dailyRevisionRecords)) {
            const cleanRevisions = filterOutLegacyMocks(data.dailyRevisionRecords, LEGACY_MOCK_REVISION_IDS);
            setDailyRevisionRecords(cleanRevisions);
          }
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        }
      }, (err) => {
        handleFirestoreError(err);
      });

      return () => unsub();
    } catch (err) {
      console.warn('Error setting up supervisor circle listener:', err);
    }
  }, [user?.uid, activeRole]);

  // Real-time synchronization for student mode from supervisor's cloud circle data
  useEffect(() => {
    if (activeRole !== 'student') return;

    let unsubPersonal: (() => void) | null = null;
    let unsubCentral: (() => void) | null = null;

    const applyCircleData = (data: any) => {
      if (!data) return;
      if (Array.isArray(data.students) && data.students.length > 0) {
        const cleanStudents = filterOutLegacyMocks(data.students, LEGACY_MOCK_STUDENT_IDS);
        setStudents(cleanStudents);
      }
      if (Array.isArray(data.sessionRecords)) {
        const cleanSessions = filterOutLegacyMocks(data.sessionRecords, LEGACY_MOCK_SESSION_IDS);
        setSessionRecords(cleanSessions);
      }
      if (Array.isArray(data.dailyRevisionRecords)) {
        const cleanRevisions = filterOutLegacyMocks(data.dailyRevisionRecords, LEGACY_MOCK_REVISION_IDS);
        setDailyRevisionRecords(cleanRevisions);
      }
      setLastSyncedAt(new Date());
      setSyncStatus('synced');
    };

    try {
      if (studentSupervisorUid) {
        const circleDocRef = doc(db, 'users', studentSupervisorUid, 'circleData', 'main');
        unsubPersonal = onSnapshot(circleDocRef, (snap) => {
          if (snap.exists()) {
            applyCircleData(snap.data());
          }
        }, (err) => {
          handleFirestoreError(err);
        });
      }

      // Also listen to central shared circle
      const centralDocRef = doc(db, 'circles', 'central_main_circle');
      unsubCentral = onSnapshot(centralDocRef, (snap) => {
        if (snap.exists()) {
          const centralData = snap.data();
          if (!studentSupervisorUid || studentsRef.current.length === 0) {
            applyCircleData(centralData);
          } else if (Array.isArray(centralData.students)) {
            const myStudentInCentral = centralData.students.find((s: any) => s.id === activeStudentId);
            const myCurrent = studentsRef.current.find(s => s.id === activeStudentId);
            if (myStudentInCentral && myCurrent && (myStudentInCentral.currentRub > myCurrent.currentRub || myStudentInCentral.completedRubCount > myCurrent.completedRubCount)) {
              applyCircleData(centralData);
            }
          }
        }
      }, (err) => {
        handleFirestoreError(err);
      });
    } catch (err) {
      handleFirestoreError(err);
    }

    return () => {
      if (unsubPersonal) unsubPersonal();
      if (unsubCentral) unsubCentral();
    };
  }, [activeRole, studentSupervisorUid]);

  // Auto-lookup supervisor UID for student if not yet set
  useEffect(() => {
    if (activeRole !== 'student' || !activeStudentId || studentSupervisorUid) return;
    if (resolvedSupervisorAttemptRef.current === activeStudentId) return;
    resolvedSupervisorAttemptRef.current = activeStudentId;

    const resolveSupervisor = async () => {
      try {
        const curStudent = studentsRef.current.find(s => s.id === activeStudentId);
        const keysToSearch = [
          curStudent?.accessCode,
          curStudent?.accessCode ? normalizeStudentCode(curStudent.accessCode) : null,
          curStudent?.phone ? curStudent.phone.replace(/[^0-9]/g, '') : null,
          activeStudentId,
        ].filter(Boolean) as string[];

        for (const k of keysToSearch) {
          const regSnap = await safeGetDoc(doc(db, 'student_registry', k));
          if (regSnap && regSnap.exists()) {
            const regData = regSnap.data();
            const supUid = regData.supervisorUid;
            const supEmail = regData.supervisorEmail || '';
            if (supUid) {
              setStudentSupervisorUid(supUid);
              setStudentSupervisorEmail(supEmail);
              try {
                localStorage.setItem(STORAGE_KEY + '_studentSupervisorUid', supUid);
                if (supEmail) {
                  localStorage.setItem(STORAGE_KEY + '_studentSupervisorEmail', supEmail);
                }
              } catch {}
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Error resolving supervisor for student:', e);
      }
    };

    resolveSupervisor();
  }, [activeRole, activeStudentId, studentSupervisorUid]);

  // Function for student to manually force-refresh data from supervisor
  const refreshStudentData = async () => {
    if (activeRole !== 'student') return;
    setIsLoadingCloud(true);
    try {
      let loaded = false;
      if (studentSupervisorUid) {
        const docSnap = await safeGetDoc(doc(db, 'users', studentSupervisorUid, 'circleData', 'main'));
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.students)) setStudents(filterOutLegacyMocks(data.students, LEGACY_MOCK_STUDENT_IDS));
          if (Array.isArray(data.sessionRecords)) setSessionRecords(filterOutLegacyMocks(data.sessionRecords, LEGACY_MOCK_SESSION_IDS));
          if (Array.isArray(data.dailyRevisionRecords)) setDailyRevisionRecords(filterOutLegacyMocks(data.dailyRevisionRecords, LEGACY_MOCK_REVISION_IDS));
          loaded = true;
        }
      }
      if (!loaded) {
        const centralSnap = await safeGetDoc(doc(db, 'circles', 'central_main_circle'));
        if (centralSnap && centralSnap.exists()) {
          const data = centralSnap.data();
          if (Array.isArray(data.students)) setStudents(filterOutLegacyMocks(data.students, LEGACY_MOCK_STUDENT_IDS));
          if (Array.isArray(data.sessionRecords)) setSessionRecords(filterOutLegacyMocks(data.sessionRecords, LEGACY_MOCK_SESSION_IDS));
          if (Array.isArray(data.dailyRevisionRecords)) setDailyRevisionRecords(filterOutLegacyMocks(data.dailyRevisionRecords, LEGACY_MOCK_REVISION_IDS));
        }
      }
      setLastSyncedAt(new Date());
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Error refreshing student data:', e);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  // Load from Cloud when user logs in with strict preservation of existing user data (via users/{uid}/circleData/main)
  useEffect(() => {
    if (!user) {
      isInitialLoadDoneRef.current = true;
      setSyncStatus('offline');
      return;
    }

    let isMounted = true;
    isInitialLoadDoneRef.current = false; // Lock saves while fetching

    const loadFromFirestore = async () => {
      if (isQuotaExceeded()) {
        setIsLoadingCloud(false);
        isInitialLoadDoneRef.current = true;
        setSyncStatus('synced');
        return;
      }
      setIsLoadingCloud(true);
      setSyncStatus('saving');
      try {
        const userDocRef = doc(db, 'users', user.uid, 'circleData', 'main');
        const userDocSnap = await safeGetDoc(userDocRef);

        let dataToLoad: any = null;

        if (userDocSnap && userDocSnap.exists() && userDocSnap.data().students && userDocSnap.data().students.length > 0) {
          dataToLoad = userDocSnap.data();
        }

        // Fallback to central shared circle if user personal document is empty (for supervisor collaboration)
        if (!dataToLoad) {
          try {
            const centralRef = doc(db, 'circles', 'central_main_circle');
            const centralSnap = await safeGetDoc(centralRef);
            if (centralSnap && centralSnap.exists() && Array.isArray(centralSnap.data().students) && centralSnap.data().students.length > 0) {
              dataToLoad = centralSnap.data();
            }
          } catch (centralErr) {
            console.warn('Central circle fallback read warning:', centralErr);
          }
        }

        // Fallback to local students if available to prevent accidental erasure
        if (!dataToLoad && isMounted) {
          const existingLocalStudents = studentsRef.current;
          if (existingLocalStudents.length > 0) {
            dataToLoad = {
              students: existingLocalStudents,
              sessionRecords: sessionRecords,
              dailyRevisionRecords: dailyRevisionRecords,
            };
          }
        }

        if (dataToLoad && isMounted) {
          if (dataToLoad.students && Array.isArray(dataToLoad.students)) {
            const loadedStudents = filterOutLegacyMocks(dataToLoad.students, LEGACY_MOCK_STUDENT_IDS);
            const uniqueLoaded = ensureAllStudentsHaveUniqueCodes(loadedStudents);
            
            // Intelligent Progress Preservation:
            // Ensure local progress (currentRub, completedRubCount) isn't reverted by older cloud snapshot
            const localStudents = studentsRef.current || [];
            let hadLocalAdvancement = false;
            const mergedStudents = uniqueLoaded.map(cloudStu => {
              const localMatch = localStudents.find(s => s.id === cloudStu.id);
              if (localMatch) {
                const effectiveRub = Math.max(cloudStu.currentRub || 1, localMatch.currentRub || 1);
                const effectiveCompleted = Math.max(cloudStu.completedRubCount || 0, localMatch.completedRubCount || 0);
                if (effectiveRub > (cloudStu.currentRub || 1) || effectiveCompleted > (cloudStu.completedRubCount || 0)) {
                  hadLocalAdvancement = true;
                }
                return {
                  ...cloudStu,
                  currentRub: effectiveRub,
                  completedRubCount: effectiveCompleted,
                };
              }
              return cloudStu;
            });

            setStudents(mergedStudents);
            studentsRef.current = mergedStudents;

            if (hadLocalAdvancement && user && activeRole !== 'student') {
              setTimeout(() => {
                persistToCloud(mergedStudents);
              }, 600);
            }
          }
          if (dataToLoad.sessionRecords && Array.isArray(dataToLoad.sessionRecords)) {
            const loadedSessions = filterOutLegacyMocks(dataToLoad.sessionRecords, LEGACY_MOCK_SESSION_IDS);
            setSessionRecords(loadedSessions);
          }
          if (dataToLoad.dailyRevisionRecords && Array.isArray(dataToLoad.dailyRevisionRecords)) {
            const loadedRevisions = filterOutLegacyMocks(dataToLoad.dailyRevisionRecords, LEGACY_MOCK_REVISION_IDS);
            setDailyRevisionRecords(loadedRevisions);
          }
          if (dataToLoad.lastState) {
            if (dataToLoad.lastState.selectedDate) {
              setSelectedDate(dataToLoad.lastState.selectedDate);
            }
            if (dataToLoad.lastState.activeTab) {
              setActiveTab(dataToLoad.lastState.activeTab);
            }
            if (dataToLoad.lastState.selectedStudentId !== undefined) {
              setSelectedStudentId(dataToLoad.lastState.selectedStudentId);
            }
          }
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        } else if (isMounted) {
          setSyncStatus('synced');
        }
      } catch (err) {
        if (handleFirestoreError(err)) {
          if (isMounted) setSyncStatus('synced');
        } else {
          console.error('Error loading circle data from Firestore:', err);
          if (isMounted) {
            setSyncStatus('error');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingCloud(false);
          isInitialLoadDoneRef.current = true; // Unlock auto-saving now that cloud data is loaded
          hasUnsavedChangesRef.current = false;
          setHasUnsavedChanges(false);
        }
      }
    };

    loadFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // Mark unsaved changes whenever students, sessions, or revisions change AFTER initial load
  useEffect(() => {
    if (!isInitialLoadDoneRef.current) return;
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
  }, [students, sessionRecords, dailyRevisionRecords]);

  // Cloud saving helper (saves to user personal path and central circle)
  const persistToCloud = useCallback(async (
    explicitStudents?: Student[],
    explicitSessions?: SessionRecord[],
    explicitRevisions?: DailyRevisionRecord[]
  ) => {
    if (isQuotaExceeded()) {
      setSyncStatus('synced');
      return;
    }
    if (!user || activeRole === 'student' || (!isInitialLoadDoneRef.current && !explicitStudents) || isLoadingCloud) return;
    setSyncStatus('saving');
    try {
      const targetStudents = explicitStudents || studentsRef.current || students;
      const targetSessions = explicitSessions || sessionRecords;
      const targetRevisions = explicitRevisions || dailyRevisionRecords;
      const uniqueStudents = ensureAllStudentsHaveUniqueCodes(targetStudents);

      const payload = {
        students: uniqueStudents,
        sessionRecords: targetSessions,
        dailyRevisionRecords: targetRevisions,
        lastState: {
          selectedDate: selectedDate || '',
          activeTab: activeTab || 'sessions',
          selectedStudentId: selectedStudentId ?? null,
        },
        userEmail: user.email || '',
        updatedAt: serverTimestamp(),
      };

      const userRef = doc(db, 'users', user.uid, 'circleData', 'main');
      await safeSetDoc(userRef, payload, { merge: true });

      // Mirror to central circle for all supervisors and student fallbacks
      try {
        const centralRef = doc(db, 'circles', 'central_main_circle');
        await safeSetDoc(centralRef, payload, { merge: true });
      } catch (centralErr) {
        console.warn('Central circle mirror save warning:', centralErr);
      }

      // Register student codes to /student_registry for cross-device student login
      await registerStudentsInFirestoreRegistry(uniqueStudents, user.uid, user.email || '');

      hasUnsavedChangesRef.current = false;
      setHasUnsavedChanges(false);
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err) {
      if (handleFirestoreError(err)) {
        setSyncStatus('synced');
      } else {
        console.error('Error saving to Firestore:', err);
        setSyncStatus('error');
      }
    }
  }, [user, students, sessionRecords, dailyRevisionRecords, selectedDate, activeTab, selectedStudentId, isLoadingCloud, activeRole]);

  // 60-Second Periodic Synchronous Cloud Save
  // As requested: the synchronous save should not run continuously, but every 60 seconds
  useEffect(() => {
    if (!user || activeRole === 'student') return;

    const intervalId = setInterval(async () => {
      if (hasUnsavedChangesRef.current && isInitialLoadDoneRef.current && !isLoadingCloud) {
        console.log('[QuranSync] 60-second periodic sync triggered with pending changes.');
        await persistToCloud();
      }
    }, 60000); // exactly 60 seconds

    return () => clearInterval(intervalId);
  }, [user, activeRole, persistToCloud, isLoadingCloud]);

  // Local storage provides continuous instant offline persistence for all operations.
  // Manual cloud save is also available anytime via saveToCloudNow (resets 60s queue).
  const saveToCloudNow = async () => {
    resetQuotaExceeded();
    await persistToCloud();
  };

  // Add new student
  const addStudent = ({
    name,
    phone = '',
    parentPhone = '',
    email = '',
    accessCode,
    initialRub = 1,
    notes = '',
  }: {
    name: string;
    phone?: string;
    parentPhone?: string;
    email?: string;
    accessCode?: string;
    initialRub?: number;
    notes?: string;
  }) => {
    const avatarColors = [
      'bg-emerald-600',
      'bg-teal-600',
      'bg-cyan-600',
      'bg-blue-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-amber-600',
      'bg-rose-600',
    ];
    let generatedCode = accessCode ? normalizeStudentCode(accessCode) : '';
    if (!generatedCode) {
      generatedCode = generateUniqueStudentCode(students);
    }

    const newStudent: Student = {
      id: 'st_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      email: email.trim(),
      accessCode: generatedCode,
      joinDate: new Date().toISOString().split('T')[0],
      currentRub: Math.max(1, Math.min(240, Number(initialRub) || 1)),
      completedRubCount: Math.max(0, (Number(initialRub) || 1) - 1),
      status: 'active',
      notes: notes.trim(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };

    setStudents(prev => ensureAllStudentsHaveUniqueCodes([newStudent, ...prev]));
    lastLocalWriteRef.current = Date.now();
  };

  // Student portal and submissions logic
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  const submitDailyRevision = async (
    studentId: string,
    date: string,
    data: { status: RevisionStatus; rating: number; notes: string; assignedRubs: number[] }
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const effectiveSupervisorUid = user?.uid || studentSupervisorUid || 'supervisor_default';
    const effectiveSupervisorEmail = user?.email || '';

    const subId = 'sub_rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newSubmission: StudentSubmission = {
      id: subId,
      supervisorUid: effectiveSupervisorUid,
      supervisorEmail: effectiveSupervisorEmail,
      accessCode: student.accessCode || '',
      studentId,
      studentName: student.name,
      studentEmail: student.email || '',
      type: 'daily_revision',
      date,
      status: 'pending',
      revisionData: data,
      createdAt: new Date().toISOString(),
    };

    setRawSubmissions(prev => [
      newSubmission,
      ...prev.filter(s => !(s.studentId === studentId && s.type === 'daily_revision' && s.date === date && s.status === 'pending'))
    ]);

    if (!isQuotaExceeded()) {
      try {
        await safeSetDoc(doc(db, 'submissions', subId), newSubmission);
      } catch (err) {
        handleFirestoreError(err);
      }
    }
  };

  const submitSessionRecitation = async (
    studentId: string,
    date: string,
    data: { newRub: number; recitedRubs: number[]; mistakesCount?: number; hesitationsCount?: number; studentNotes?: string; advanceToNext?: boolean }
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const effectiveSupervisorUid = user?.uid || studentSupervisorUid || 'supervisor_default';
    const effectiveSupervisorEmail = user?.email || '';

    const subId = 'sub_ses_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newSubmission: StudentSubmission = {
      id: subId,
      supervisorUid: effectiveSupervisorUid,
      supervisorEmail: effectiveSupervisorEmail,
      accessCode: student.accessCode || '',
      studentId,
      studentName: student.name,
      studentEmail: student.email || '',
      type: 'session',
      date,
      status: 'pending',
      sessionData: data,
      createdAt: new Date().toISOString(),
    };

    setRawSubmissions(prev => [
      newSubmission,
      ...prev.filter(s => !(s.studentId === studentId && s.type === 'session' && s.date === date && s.status === 'pending'))
    ]);

    if (!isQuotaExceeded()) {
      try {
        await safeSetDoc(doc(db, 'submissions', subId), newSubmission);
      } catch (err) {
        handleFirestoreError(err);
      }
    }
  };

  const approveSubmission = async (
    submissionId: string,
    options?: {
      supervisorFeedback?: string;
      grade?: SessionGrade;
      mistakesCount?: number;
      hesitationsCount?: number;
      advanceToNext?: boolean;
      advanceCount?: number;
    }
  ) => {
    lastLocalWriteRef.current = Date.now();
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const feedback = options?.supervisorFeedback || 'تم الاعتماد بنجاح، بارك الله فيك';

    let updatedStudents = [...students];
    let updatedSessions = [...sessionRecords];
    let updatedRevisions = [...dailyRevisionRecords];

    const studentObj = students.find(s => s.id === sub.studentId);

    // 1. If daily revision, apply official revision record
    if (sub.type === 'daily_revision' && sub.revisionData) {
      const dateObj = new Date(sub.date);
      const dayOfWeek = isNaN(dateObj.getDay()) ? 0 : dateObj.getDay();
      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dayName = dayNames[dayOfWeek];
      const assignment = getDailyRevisionAssignment(studentObj?.currentRub || 1, dayOfWeek, dayOfWeek, studentObj);

      const existingIndex = updatedRevisions.findIndex(r => r.studentId === sub.studentId && r.date === sub.date);
      const record: DailyRevisionRecord = {
        id: existingIndex >= 0 ? updatedRevisions[existingIndex].id : 'rn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        studentId: sub.studentId,
        date: sub.date,
        dayOfWeek,
        dayName,
        assignedRubs: sub.revisionData.assignedRubs || assignment.assignedRubs,
        assignedCount: sub.revisionData.assignedRubs?.length || assignment.totalCount,
        status: sub.revisionData.status,
        rating: sub.revisionData.rating,
        notes: sub.revisionData.notes ? `[الطالب]: ${sub.revisionData.notes} • [المشرف]: ${feedback}` : feedback,
        verifiedByTeacher: true,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        updatedRevisions[existingIndex] = record;
      } else {
        updatedRevisions = [record, ...updatedRevisions];
      }
      setDailyRevisionRecords(updatedRevisions);

      // If advance was checked or revision is completed, advance the student by 1 quarter
      const shouldAdvance = options?.advanceToNext ?? (sub.revisionData.status === 'completed');
      if (shouldAdvance && sub.revisionData.status !== 'missed' && studentObj) {
        const advanceCount = options?.advanceCount ?? 1;
        const nextRub = Math.min(240, studentObj.currentRub + advanceCount);
        updatedStudents = updatedStudents.map(s => {
          if (s.id !== sub.studentId) return s;
          return {
            ...s,
            currentRub: nextRub,
            completedRubCount: Math.max(s.completedRubCount, s.currentRub),
          };
        });
      }
    }

    // 2. If session recitation, apply official session record
    if (sub.type === 'session' && sub.sessionData) {
      const grade = options?.grade || sub.sessionData.grade || 'very_good';
      const advance = options?.advanceToNext ?? (sub.sessionData.advanceToNext ?? (grade !== 'needs_repeat' && grade !== 'absent'));

      const dateObj = new Date(sub.date);
      const dayIndex = isNaN(dateObj.getDay()) ? 0 : dateObj.getDay();
      const dayName = dayIndex === 0 ? 'الأحد' : dayIndex === 3 ? 'الأربعاء' : 'يوم إضافي';
      const plan = getRequiredRecitationForSession(studentObj?.currentRub || 1);

      const newRecord: SessionRecord = {
        id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        studentId: sub.studentId,
        date: sub.date,
        dayName,
        newRub: sub.sessionData.newRub || plan.newRub,
        recitedRubs: sub.sessionData.recitedRubs || plan.allRubs,
        grade,
        mistakesCount: options?.mistakesCount ?? (sub.sessionData.mistakesCount || 0),
        hesitationsCount: options?.hesitationsCount ?? (sub.sessionData.hesitationsCount || 0),
        teacherNotes: (sub.sessionData.studentNotes ? `[الطالب]: ${sub.sessionData.studentNotes}\n` : '') + `[المشرف]: ${feedback}`,
        advancedToNext: advance && grade !== 'needs_repeat' && grade !== 'absent',
        createdAt: new Date().toISOString(),
      };

      updatedSessions = [newRecord, ...updatedSessions];
      setSessionRecords(updatedSessions);

      // If passed and advance is approved, increment the student's target quarter (1 quarter advance per session)
      if (advance && grade !== 'needs_repeat' && grade !== 'absent' && studentObj) {
        const advanceCount = options?.advanceCount ?? 1;
        const nextRub = Math.min(240, studentObj.currentRub + advanceCount);
        updatedStudents = updatedStudents.map(s => {
          if (s.id !== sub.studentId) return s;
          return {
            ...s,
            currentRub: nextRub,
            completedRubCount: Math.max(s.completedRubCount, s.currentRub),
          };
        });
      }
    }

    const finalStudents = ensureAllStudentsHaveUniqueCodes(updatedStudents);
    setStudents(finalStudents);
    studentsRef.current = finalStudents;

    // 3. Mark submission as approved
    const updatedSub: StudentSubmission = {
      ...sub,
      status: 'approved',
      supervisorFeedback: feedback,
      reviewedAt: new Date().toISOString(),
    };

    const updatedRaw = rawSubmissions.map(s => s.id === submissionId ? updatedSub : s);
    setRawSubmissions(updatedRaw);

    // Save to localStorage immediately so no state is lost on fast reload
    try {
      localStorage.setItem(STORAGE_KEY + '_students', JSON.stringify(finalStudents));
      localStorage.setItem(STORAGE_KEY + '_sessions', JSON.stringify(updatedSessions));
      localStorage.setItem(STORAGE_KEY + '_revisions', JSON.stringify(updatedRevisions));
      localStorage.setItem(STORAGE_KEY + '_submissions', JSON.stringify(updatedRaw));
    } catch (e) {
      console.warn('Immediate localStorage write warning:', e);
    }

    // 4. PERSIST DIRECTLY AND IMMEDIATELY TO FIRESTORE
    if (!isQuotaExceeded()) {
      try {
        await safeSetDoc(doc(db, 'submissions', submissionId), updatedSub, { merge: true });
      } catch (err) {
        handleFirestoreError(err);
      }
    }

    // Update the circle data in Firestore immediately!
    // This synchronizes the teacher's cloud document, mirrors to central circle, and updates student_registry
    await persistToCloud(finalStudents, updatedSessions, updatedRevisions);
  };

  const approveAllPendingSubmissions = async () => {
    const pendingList = submissions.filter(s => s.status === 'pending');
    for (const sub of pendingList) {
      await approveSubmission(sub.id);
    }
  };

  const rejectSubmission = async (
    submissionId: string,
    supervisorFeedback: string
  ) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const updatedSub: StudentSubmission = {
      ...sub,
      status: 'rejected',
      supervisorFeedback: supervisorFeedback || 'يرجى مراجعة المقرر وإعادة الإرسال',
      reviewedAt: new Date().toISOString(),
    };

    setRawSubmissions(prev => prev.map(s => s.id === submissionId ? updatedSub : s));

    if (!isQuotaExceeded()) {
      try {
        await safeSetDoc(doc(db, 'submissions', submissionId), updatedSub, { merge: true });
      } catch (err) {
        handleFirestoreError(err);
      }
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    setRawSubmissions(prev => prev.filter(s => s.id !== submissionId));
    if (!isQuotaExceeded()) {
      try {
        await safeDeleteDoc(doc(db, 'submissions', submissionId));
      } catch (err) {
        handleFirestoreError(err);
      }
    }
  };

  const loginAsStudent = async (accessCode: string, pin?: string): Promise<{ success: boolean; message?: string; requiresPin?: boolean; studentName?: string }> => {
    const rawInput = accessCode ? accessCode.trim() : '';
    const cleanCode = normalizeStudentCode(rawInput);
    if (!cleanCode && !rawInput) {
      return { success: false, message: 'يرجى إدخال رمز وصول الطالب' };
    }

    // Helper to check PIN
    const verifyPin = (targetStudent: Student): { valid: boolean; requiresPin?: boolean; message?: string } => {
      if (targetStudent.pin && targetStudent.pin.trim()) {
        if (!pin || !pin.trim()) {
          return {
            valid: false,
            requiresPin: true,
            message: `أهلاً بك يا ${targetStudent.name}، يرجى إدخال الرقم السري (PIN) الخاص بك لإتمام الدخول.`
          };
        }
        if (pin.trim() !== targetStudent.pin.trim()) {
          return {
            valid: false,
            requiresPin: true,
            message: 'الرقم السري (PIN) غير صحيح. يرجى المحاولة مرة أخرى أو مراجعة المشرف.'
          };
        }
      }
      return { valid: true };
    };

    // 1. Check currently loaded local students first
    const matchedLocal = students.find(s => matchStudentCode(s, rawInput) || matchStudentCode(s, cleanCode));
    if (matchedLocal) {
      const pinCheck = verifyPin(matchedLocal);
      if (!pinCheck.valid) {
        return {
          success: false,
          requiresPin: pinCheck.requiresPin,
          studentName: matchedLocal.name,
          message: pinCheck.message
        };
      }

      setActiveStudentId(matchedLocal.id);
      setActiveRole('student');

      // If supervisor UID is not known yet, try resolving in background
      if (!studentSupervisorUid) {
        const candidateKey = matchedLocal.accessCode || cleanCode;
        if (candidateKey) {
          safeGetDoc(doc(db, 'student_registry', candidateKey)).then(snap => {
            if (snap.exists()) {
              const sUid = snap.data().supervisorUid;
              const sEmail = snap.data().supervisorEmail || '';
              if (sUid) {
                setStudentSupervisorUid(sUid);
                setStudentSupervisorEmail(sEmail);
                try {
                  localStorage.setItem(STORAGE_KEY + '_studentSupervisorUid', sUid);
                  if (sEmail) localStorage.setItem(STORAGE_KEY + '_studentSupervisorEmail', sEmail);
                } catch {}
              }
            }
          }).catch(() => {});
        }
      }

      return { success: true };
    }

    // 2. Build exhaustive set of search keys for cross-device / cloud registry lookup
    const numOnly = extractCodeNumber(cleanCode);
    const cleanDigits = rawInput.replace(/[^0-9]/g, '');

    const keysToTry = Array.from(new Set([
      cleanCode,
      `STU-${cleanCode}`,
      `STU${cleanCode}`,
      numOnly,
      numOnly ? `STU-${numOnly}` : '',
      numOnly ? `STU${numOnly}` : '',
      cleanCode.toLowerCase(),
      cleanDigits,
      cleanDigits.startsWith('0') ? cleanDigits.substring(1) : '',
    ].filter(Boolean)));

    // 3. Query Firestore student_registry for each possible key
    for (const key of keysToTry) {
      try {
        const regRef = doc(db, 'student_registry', key);
        const regSnap = await safeGetDoc(regRef);

        if (regSnap && regSnap.exists()) {
          const regData = regSnap.data();
          const supervisorUid = regData.supervisorUid;
          const supervisorEmail = regData.supervisorEmail || '';

          if (supervisorUid) {
            setStudentSupervisorUid(supervisorUid);
            setStudentSupervisorEmail(supervisorEmail);
            try {
              localStorage.setItem(STORAGE_KEY + '_studentSupervisorUid', supervisorUid);
              if (supervisorEmail) {
                localStorage.setItem(STORAGE_KEY + '_studentSupervisorEmail', supervisorEmail);
              }
            } catch {
              // ignore
            }

            // Fetch circle details from supervisor's account
            try {
              let circleSnap = await safeGetDoc(doc(db, 'users', supervisorUid, 'circleData', 'main'));
              if (!circleSnap || !circleSnap.exists() || !circleSnap.data().students || circleSnap.data().students.length === 0) {
                // Try central shared circle
                circleSnap = await safeGetDoc(doc(db, 'circles', 'central_main_circle'));
              }

              if (circleSnap && circleSnap.exists()) {
                const circleData = circleSnap.data();
                if (Array.isArray(circleData.students) && circleData.students.length > 0) {
                  const found = circleData.students.find((s: Student) => 
                    s.id === regData.studentId || matchStudentCode(s, rawInput) || matchStudentCode(s, cleanCode)
                  );

                  if (found) {
                    const pinCheck = verifyPin(found);
                    if (!pinCheck.valid) {
                      return {
                        success: false,
                        requiresPin: pinCheck.requiresPin,
                        studentName: found.name,
                        message: pinCheck.message
                      };
                    }

                    setStudents(circleData.students);
                    if (Array.isArray(circleData.sessionRecords)) {
                      setSessionRecords(circleData.sessionRecords);
                    }
                    if (Array.isArray(circleData.dailyRevisionRecords)) {
                      setDailyRevisionRecords(circleData.dailyRevisionRecords);
                    }
                    setActiveStudentId(found.id);
                    setActiveRole('student');
                    return { success: true };
                  }
                }
              }
            } catch (circleErr) {
              console.warn('Error fetching supervisor circle document during student login:', circleErr);
            }
          }

          // Fallback: Reconstruct student from registry document payload directly
          const fallbackStudent: Student = regData.studentData || {
            id: regData.studentId || ('stu_' + Date.now()),
            name: regData.studentName || 'طالب الحلقة',
            accessCode: regData.accessCode || cleanCode,
            currentRub: regData.currentRub || 1,
            completedRubCount: regData.completedRubCount || 0,
            phone: regData.phone || '',
            parentPhone: regData.parentPhone || '',
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0],
          };

          const pinCheck = verifyPin(fallbackStudent);
          if (!pinCheck.valid) {
            return {
              success: false,
              requiresPin: pinCheck.requiresPin,
              studentName: fallbackStudent.name,
              message: pinCheck.message
            };
          }

          setStudents(prev => [fallbackStudent, ...prev.filter(s => s.id !== fallbackStudent.id)]);
          setActiveStudentId(fallbackStudent.id);
          setActiveRole('student');
          return { success: true };
        }
      } catch (err) {
        console.warn('Error querying student registry for key', key, err);
      }
    }

    return { 
      success: false, 
      message: `لم يتم العثور على طالب برمز "${accessCode}". تأكد من صحة الرمز أو راجع مشرف الحلقة لمنحك الرمز الصحيح.` 
    };
  };

  const logoutStudent = () => {
    setActiveStudentId(null);
    setActiveRole('supervisor');
  };

  const switchToStudentView = (studentId: string) => {
    setActiveStudentId(studentId);
    setActiveRole('student');
  };

  const updateStudent = (id: string, partial: Partial<Student>) => {
    lastLocalWriteRef.current = Date.now();
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== id) return s;
        const newStudent = { ...s, ...partial };
        if (partial.accessCode !== undefined) {
          newStudent.accessCode = normalizeStudentCode(partial.accessCode);
        }
        if (partial.currentRub !== undefined && partial.completedRubCount === undefined) {
          newStudent.completedRubCount = Math.max(0, partial.currentRub - 1);
        }
        return newStudent;
      });
      return ensureAllStudentsHaveUniqueCodes(updated);
    });
  };

  const deleteStudent = (id: string) => {
    lastLocalWriteRef.current = Date.now();
    setStudents(prev => prev.filter(s => s.id !== id));
    setSessionRecords(prev => prev.filter(s => s.studentId !== id));
    setDailyRevisionRecords(prev => prev.filter(r => r.studentId !== id));
    if (selectedStudentId === id) setSelectedStudentId(null);
  };

  // Record a circle session (Sunday or Wednesday)
  const recordSessionResult = ({
    studentId,
    date,
    grade,
    mistakesCount,
    hesitationsCount,
    notes,
    advanceToNext,
  }: {
    studentId: string;
    date: string;
    grade: SessionGrade;
    mistakesCount: number;
    hesitationsCount: number;
    notes: string;
    advanceToNext: boolean;
  }) => {
    lastLocalWriteRef.current = Date.now();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const dateObj = new Date(date);
    const dayIndex = dateObj.getDay();
    const dayName = dayIndex === 0 ? 'الأحد' : dayIndex === 3 ? 'الأربعاء' : 'يوم إضافي';

    const plan = getRequiredRecitationForSession(student.currentRub);

    const newRecord: SessionRecord = {
      id: 'sn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      studentId,
      date,
      dayName,
      newRub: plan.newRub,
      recitedRubs: plan.allRubs,
      grade,
      mistakesCount,
      hesitationsCount,
      teacherNotes: notes.trim(),
      advancedToNext: advanceToNext && grade !== 'needs_repeat' && grade !== 'absent',
      createdAt: new Date().toISOString(),
    };

    setSessionRecords(prev => [newRecord, ...prev]);

    // If passed and advance is approved, increment the student's target quarter!
    if (advanceToNext && grade !== 'needs_repeat' && grade !== 'absent') {
      const nextRub = Math.min(240, student.currentRub + 1);
      updateStudent(studentId, {
        currentRub: nextRub,
        completedRubCount: Math.max(student.completedRubCount, student.currentRub),
      });
    }
  };

  // Record Daily Self-Revision
  const recordDailyRevision = (
    studentId: string,
    date: string,
    status: RevisionStatus,
    notes: string = '',
    rating: number = 5
  ) => {
    lastLocalWriteRef.current = Date.now();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = dayNames[dayOfWeek];

    const assignment = getDailyRevisionAssignment(student.currentRub, dayOfWeek);

    setDailyRevisionRecords(prev => {
      const existingIndex = prev.findIndex(r => r.studentId === studentId && r.date === date);
      const record: DailyRevisionRecord = {
        id: existingIndex >= 0 ? prev[existingIndex].id : 'rn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        studentId,
        date,
        dayOfWeek,
        dayName,
        assignedRubs: assignment.assignedRubs,
        assignedCount: assignment.totalCount,
        status,
        rating,
        notes: notes.trim(),
        verifiedByTeacher: true,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = record;
        return next;
      }
      return [record, ...prev];
    });
  };

  const getStudentDailyRevision = (studentId: string, date: string) => {
    return dailyRevisionRecords.find(r => r.studentId === studentId && r.date === date);
  };

  const getStudentSessions = (studentId: string) => {
    return sessionRecords.filter(s => s.studentId === studentId);
  };

  const resetToSampleData = () => {
    setStudents([]);
    setSessionRecords([]);
    setDailyRevisionRecords([]);
    try {
      localStorage.removeItem(STORAGE_KEY + '_students');
      localStorage.removeItem(STORAGE_KEY + '_sessions');
      localStorage.removeItem(STORAGE_KEY + '_revisions');
    } catch {
      // ignore
    }
  };

  const exportDataJson = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      students,
      sessionRecords,
      dailyRevisionRecords,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.students && Array.isArray(parsed.students)) {
        setStudents(ensureAllStudentsHaveUniqueCodes(parsed.students));
        if (parsed.sessionRecords) setSessionRecords(parsed.sessionRecords);
        if (parsed.dailyRevisionRecords) setDailyRevisionRecords(parsed.dailyRevisionRecords);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const importFromTransferData = (
    data: {
      students?: Student[];
      sessionRecords?: SessionRecord[];
      dailyRevisionRecords?: DailyRevisionRecord[];
    },
    mode: 'replace' | 'merge'
  ) => {
    if (mode === 'replace') {
      if (data.students && Array.isArray(data.students)) {
        setStudents(ensureAllStudentsHaveUniqueCodes(data.students));
      }
      if (data.sessionRecords && Array.isArray(data.sessionRecords)) {
        setSessionRecords(data.sessionRecords);
      }
      if (data.dailyRevisionRecords && Array.isArray(data.dailyRevisionRecords)) {
        setDailyRevisionRecords(data.dailyRevisionRecords);
      }
    } else {
      // merge mode
      if (data.students && Array.isArray(data.students)) {
        setStudents(prev => {
          const map = new Map<string, Student>();
          prev.forEach(s => map.set(s.id, s));
          data.students!.forEach(newS => {
            map.set(newS.id, newS);
          });
          return ensureAllStudentsHaveUniqueCodes(Array.from(map.values()));
        });
      }
      if (data.sessionRecords && Array.isArray(data.sessionRecords)) {
        setSessionRecords(prev => {
          const map = new Map<string, SessionRecord>();
          prev.forEach(r => map.set(r.id, r));
          data.sessionRecords!.forEach(newR => {
            map.set(newR.id, newR);
          });
          return Array.from(map.values());
        });
      }
      if (data.dailyRevisionRecords && Array.isArray(data.dailyRevisionRecords)) {
        setDailyRevisionRecords(prev => {
          const map = new Map<string, DailyRevisionRecord>();
          prev.forEach(r => map.set(r.id, r));
          data.dailyRevisionRecords!.forEach(newR => {
            map.set(newR.id, newR);
          });
          return Array.from(map.values());
        });
      }
    }
  };

  return (
    <QuranContext.Provider
      value={{
        students,
        sessionRecords,
        dailyRevisionRecords,
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        selectedStudentId,
        setSelectedStudentId,
        activeRole,
        setActiveRole,
        activeStudentId,
        setActiveStudentId,
        loginAsStudent,
        logoutStudent,
        switchToStudentView,
        submissions,
        pendingSubmissionsCount,
        submitDailyRevision,
        submitSessionRecitation,
        approveSubmission,
        rejectSubmission,
        deleteSubmission,
        approveAllPendingSubmissions,
        syncStatus,
        lastSyncedAt,
        isLoadingCloud,
        hasUnsavedChanges,
        saveToCloudNow,
        refreshStudentData,
        addStudent,
        updateStudent,
        deleteStudent,
        recordSessionResult,
        recordDailyRevision,
        getStudentDailyRevision,
        getStudentSessions,
        resetToSampleData,
        exportDataJson,
        importDataJson,
        importFromTransferData,
      }}
    >
      {children}
    </QuranContext.Provider>
  );
};

export const useQuran = () => {
  const context = useContext(QuranContext);
  if (!context) throw new Error('useQuran must be used within a QuranProvider');
  return context;
};
