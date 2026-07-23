import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  AttendanceRecord, 
  StudentScore, 
  StudentEvaluation, 
  StudySchedule, 
  StudyNote,
  User
} from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}

function cleanData(data: any): any {
  const clean: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined) {
      if (data[key] !== null && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        clean[key] = cleanData(data[key]);
      } else {
        clean[key] = data[key];
      }
    }
  });
  return clean;
}

// User Profiles
export async function saveUserProfile(user: User) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), cleanData(user));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as User : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Attendance
export async function saveAttendanceRecord(record: AttendanceRecord) {
  const path = `attendance/${record.id}`;
  try {
    await setDoc(doc(db, 'attendance', record.id), cleanData(record));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToAttendance(classId: string, callback: (records: AttendanceRecord[]) => void) {
  const path = 'attendance';
  const q = query(collection(db, path), where('classId', '==', classId));
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
    callback(records);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Scores
export async function saveStudentScore(score: StudentScore) {
  const id = `${score.studentId}_${score.subjectName}`;
  const path = `scores/${id}`;
  try {
    await setDoc(doc(db, 'scores', id), cleanData(score));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToScores(studentId: string, callback: (scores: StudentScore[]) => void) {
  const path = 'scores';
  const q = query(collection(db, path), where('studentId', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => doc.data() as StudentScore);
    callback(scores);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Evaluations
export async function saveEvaluation(evaluation: StudentEvaluation) {
  const path = `evaluations/${evaluation.id}`;
  try {
    await setDoc(doc(db, 'evaluations', evaluation.id), cleanData(evaluation));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvaluation(evaluationId: string) {
  const path = `evaluations/${evaluationId}`;
  try {
    await deleteDoc(doc(db, 'evaluations', evaluationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToEvaluations(studentId: string, callback: (evaluations: StudentEvaluation[]) => void) {
  const path = 'evaluations';
  const q = query(collection(db, path), where('student_id', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const evaluations = snapshot.docs.map(doc => doc.data() as StudentEvaluation);
    callback(evaluations);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export function subscribeToAllEvaluations(callback: (evaluations: StudentEvaluation[]) => void) {
  const path = 'evaluations';
  const q = query(collection(db, path));
  return onSnapshot(q, (snapshot) => {
    const evaluations = snapshot.docs.map(doc => doc.data() as StudentEvaluation);
    callback(evaluations);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Study Planner
export async function saveStudySchedule(schedule: StudySchedule) {
  const path = `schedules/${schedule.id}`;
  try {
    await setDoc(doc(db, 'schedules', schedule.id), cleanData(schedule));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudySchedule(scheduleId: string) {
  const path = `schedules/${scheduleId}`;
  try {
    await deleteDoc(doc(db, 'schedules', scheduleId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToSchedules(studentId: string, callback: (schedules: StudySchedule[]) => void) {
  const path = 'schedules';
  const q = query(collection(db, path), where('student_id', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const schedules = snapshot.docs.map(doc => doc.data() as StudySchedule);
    callback(schedules);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

// Study Notes
export async function saveStudyNote(note: StudyNote) {
  const path = `notes/${note.id}`;
  try {
    await setDoc(doc(db, 'notes', note.id), cleanData(note));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudyNote(noteId: string) {
  const path = `notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToNotes(studentId: string, callback: (notes: StudyNote[]) => void) {
  const path = 'notes';
  const q = query(collection(db, path), where('student_id', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => doc.data() as StudyNote);
    callback(notes);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}
