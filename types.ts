
export enum UserRole {
  TEACHER = 'Teacher',
  STUDENT = 'Student',
  UNKNOWN = 'Unknown'
}

export enum ClassTrack {
  SOCIAL = 'Social Science',
  EXACT = 'Exact Science'
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late'
}

export type SubjectName = 
  | 'Khmer' | 'English' | 'OSM' | 'Math' | 'Biology' 
  | 'Chemistry' | 'Physic' | 'Earth' | 'Computer' 
  | 'Economy' | 'E-learning' | 'Moral Civic' | 'Geography' 
  | 'History' | 'Chinese' | 'French' | 'Sport';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  classId?: string;
  assignedSubjects?: SubjectName[];
  telegram?: string;
  gmail?: string;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  avatarUrl?: string;
  telegram?: string;
}

export interface SubjectGrade {
  participation: number;
  homework: number;
  exam: number;
  final: number;
}

export interface StudentScore {
  studentId: string;
  subjectName: SubjectName;
  grade: SubjectGrade;
  lastUpdated: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string;
  track: ClassTrack;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; 
  status: AttendanceStatus;
  reason?: string;
}

export interface StudentEvaluation {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: SubjectName;
  evaluation_title: string;
  evaluation_comment: string;
  score?: number;
  date: string;
}

export interface AIInsight {
  summary: string;
  riskStudents: {
    studentId: string;
    studentName: string;
    reason: string;
    riskLevel: 'High' | 'Medium' | 'Low';
  }[];
  trends: string;
}

export interface StudySchedule {
  id: string;
  student_id: string;
  subject_name: SubjectName;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export interface StudyNote {
  id: string;
  student_id: string;
  title: string;
  text_content: string;
  image_url?: string;
  subject_name: SubjectName;
  schedule_datetime?: string;
  created_at: string;
  updated_at: string;
}
