
import { Student, SchoolClass, UserRole, AttendanceStatus, AttendanceRecord, StudentScore, SubjectGrade, SubjectName, ClassTrack } from './types';

export const SCHOOL_DOMAIN = '@happychandara.org';

export const SUBJECTS: SubjectName[] = [
  'Khmer', 'English', 'OSM', 'Math', 'Biology', 
  'Chemistry', 'Physic', 'Earth', 'Computer', 
  'Economy', 'E-learning', 'Moral Civic', 'Geography', 
  'History', 'Chinese', 'French', 'Sport'
];

export const MOCK_CLASSES: SchoolClass[] = [
  { id: '11SA', name: '11S.A', teacherId: 't1', track: ClassTrack.SOCIAL },
  { id: '11EA', name: '11E.A', teacherId: 't1', track: ClassTrack.EXACT },
  { id: '11EB', name: '11E.B', teacherId: 't1', track: ClassTrack.EXACT }
];

// Exact Maximum scores configuration as per requirements
export const getSubjectMaxScore = (subject: SubjectName, track: ClassTrack): number => {
  if (track === ClassTrack.SOCIAL) {
    switch (subject) {
      case 'Khmer': return 125;
      case 'Math': return 75;
      case 'Moral Civic': return 75;
      case 'Geography': return 75;
      case 'History': return 75;
      default: return 50; // All others: 50
    }
  } else {
    // Exact Science
    switch (subject) {
      case 'Math': return 125;
      case 'Khmer': return 75;
      case 'Biology': return 75;
      case 'Chemistry': return 75;
      case 'Physic': return 75;
      default: return 50; // All others: 50
    }
  }
};

const FIRST_NAMES = ['Srey', 'Keo', 'Chhay', 'Bopha', 'Dara', 'Sophea', 'Phalla', 'Ratana', 'Chan', 'Sok', 'Vanna', 'Thy', 'Leakhena', 'Sombo', 'Pich', 'Kunthea'];
const LAST_NAMES = ['Kim', 'Reach', 'Pich', 'Meas', 'Kheng', 'Keo', 'Varn', 'Sovan', 'Arun', 'Chea', 'Samnang', 'Visal'];

const generateStudents = (): Student[] => {
  const students: Student[] = [];
  
  // VARN Dana - Primary Profile
  students.push({
    id: 's_varn_dana',
    name: 'VARN Dana',
    email: 'dana.varn00101@happychandara.org',
    classId: '11EB',
    avatarUrl: 'https://picsum.photos/seed/varn_dana/400/400',
    telegram: '@VARNDANA'
  });

  // Thavy Ty - Primary Profile
  students.push({
    id: 's_thavy_ty',
    name: 'Thavy Ty',
    email: 'thavy.ty005@happychandara.org',
    classId: '11EB',
    avatarUrl: 'https://picsum.photos/seed/thavy_ty/400/400',
    telegram: '@JANUVYLUNA'
  });

  const classConfigs = [
    { id: '11SA', prefix: 's.sa', count: 23, name: '11S.A Student' }, // Adjusted count to accommodate Thavy
    { id: '11EA', prefix: 's.ea', count: 29, name: '11E.A Student' },
    { id: '11EB', prefix: 's.eb', count: 26, name: '11E.B Student' }
  ];

  classConfigs.forEach(conf => {
    for (let i = 1; i <= conf.count; i++) {
      const id = `${conf.id}_${i}`;
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[i % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      const emailName = `${fName.toLowerCase()}.${lName.toLowerCase()}`;
      
      students.push({
        id,
        name: fullName,
        email: `${emailName}.${i.toString().padStart(3, '0')}${SCHOOL_DOMAIN}`,
        classId: conf.id
      });
    }
  });

  return students;
};

export const MOCK_STUDENTS = generateStudents();

const generateRandomGrade = (subject: SubjectName, track: ClassTrack): SubjectGrade => {
  const max = getSubjectMaxScore(subject, track);
  const pMax = max * 0.2;
  const hMax = max * 0.3;
  const eMax = max * 0.5;

  // Simulate realistic performance (60% to 100% of max)
  const p = Math.floor(Math.random() * (pMax * 0.4)) + (pMax * 0.6);
  const h = Math.floor(Math.random() * (hMax * 0.4)) + (hMax * 0.6);
  const e = Math.floor(Math.random() * (eMax * 0.4)) + (eMax * 0.6);
  
  const rawTotal = p + h + e;
  
  return {
    participation: Number(p.toFixed(1)),
    homework: Number(h.toFixed(1)),
    exam: Number(e.toFixed(1)),
    final: Math.round((rawTotal / max) * 100)
  };
};

// Generate scores for ALL subjects for every student to show "all on"
export const MOCK_SCORES: StudentScore[] = MOCK_STUDENTS.flatMap(s => {
  const cls = MOCK_CLASSES.find(c => c.id === s.classId)!;
  return SUBJECTS.map(subj => ({
    studentId: s.id,
    subjectName: subj,
    grade: generateRandomGrade(subj, cls.track),
    lastUpdated: new Date().toISOString()
  }))
});

const generateHistory = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const now = new Date();
  // Generate 7 days of history
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    MOCK_STUDENTS.forEach(student => {
      let status = AttendanceStatus.PRESENT;
      const rand = Math.random();
      if (rand > 0.97) status = AttendanceStatus.ABSENT;
      else if (rand > 0.93) status = AttendanceStatus.LATE;

      records.push({
        id: `${student.id}-${dateStr}`,
        studentId: student.id,
        classId: student.classId,
        date: dateStr,
        status
      });
    });
  }
  return records;
};

export const INITIAL_ATTENDANCE_RECORDS = generateHistory();
