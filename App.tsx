
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, AttendanceRecord, StudentScore, SubjectName } from './types';
import { SCHOOL_DOMAIN, MOCK_STUDENTS, INITIAL_ATTENDANCE_RECORDS, MOCK_SCORES } from './constants';
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Profile from './components/Profile';
import SubjectSelection from './components/SubjectSelection';
import StudyPlanner from './components/StudyPlanner';
import Evaluations from './components/Evaluations';
import { 
  saveUserProfile, 
  getUserProfile, 
  subscribeToAttendance, 
  subscribeToScores,
  saveAttendanceRecord,
  saveStudentScore,
  testConnection
} from './services/firestoreService';
import { auth } from './firebase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'profile' | 'subjectSelection' | 'planner' | 'evaluations'>('dashboard');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [scores, setScores] = useState<StudentScore[]>(MOCK_SCORES);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('hc_theme') === 'dark';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    testConnection();
    
    const savedUser = localStorage.getItem('hc_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === UserRole.TEACHER && (!parsedUser.assignedSubjects || parsedUser.assignedSubjects.length === 0)) {
        setView('subjectSelection');
      }
    }
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    let unsubscribeAttendance: (() => void) | undefined;
    let unsubscribeScores: (() => void) | undefined;

    if (user.role === UserRole.TEACHER) {
      // Teachers see all attendance for their classes (simplified for now)
      unsubscribeAttendance = subscribeToAttendance('11EB', (records) => {
        if (records.length > 0) setAttendance(records);
      });
    } else if (user.role === UserRole.STUDENT) {
      // Students see their own scores
      unsubscribeScores = subscribeToScores(user.id, (newScores) => {
        if (newScores.length > 0) setScores(newScores);
      });
      // Students see their own attendance
      unsubscribeAttendance = subscribeToAttendance(user.classId || '', (records) => {
        if (records.length > 0) setAttendance(records);
      });
    }

    return () => {
      unsubscribeAttendance?.();
      unsubscribeScores?.();
    };
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hc_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async (emailInput: string, password?: string) => {
    const email = emailInput.toLowerCase();
    const isSpecialCase = email === 'example@happychandara.org';
    if (!email.endsWith(SCHOOL_DOMAIN) && !isSpecialCase) {
      alert("Access Denied: Please use a @happychandara.org email.");
      return;
    }

    try {
      const isTeacherExample = email === 'teacher@happychandara.org';
      const isStudentExample = email === 'student@happychandara.org';
      
      // If student@ is used, treat it as Dana Varn's email for profile lookup
      const effectiveEmail = isStudentExample ? 'dana.varn00101@happychandara.org' : email;
      const mockStudent = MOCK_STUDENTS.find(s => s.email.toLowerCase() === effectiveEmail);
      const parts = email.split('@')[0].split('.');
      let role = UserRole.UNKNOWN;
      let name = "User";

      if (mockStudent) {
        role = UserRole.STUDENT;
        name = mockStudent.name;
      } else if (isSpecialCase) {
        role = UserRole.STUDENT;
        name = "Thavy";
      } else if (isTeacherExample) {
        role = UserRole.TEACHER;
        name = "Teacher";
      } else if (parts.length >= 2) {
        role = parts.length === 3 ? UserRole.STUDENT : UserRole.TEACHER;
        name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }

      const userId = role === UserRole.STUDENT ? (mockStudent?.id || 's-new') : 't1';
      
      // Check if user exists in Firestore
      const existingProfile = await getUserProfile(userId);
      
      const newUser: User = existingProfile || {
        id: userId,
        name,
        email,
        role,
        classId: (role === UserRole.STUDENT ? mockStudent?.classId : null) || null,
        assignedSubjects: [],
        avatarUrl: mockStudent?.avatarUrl || null,
        telegram: mockStudent?.telegram || null
      } as User;

      if (!existingProfile) {
        await saveUserProfile(newUser);
      }

      setUser(newUser);
      localStorage.setItem('hc_user', JSON.stringify(newUser));
      if (role === UserRole.TEACHER && (!newUser.assignedSubjects || newUser.assignedSubjects.length === 0)) setView('subjectSelection');
      else setView('dashboard');
    } catch (error) {
      console.error("Login Error:", error);
      alert("An error occurred during login. Please try again.");
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('hc_user', JSON.stringify(updatedUser));
    await saveUserProfile(updatedUser);
  };

  const handleSubjectsAssign = async (subjects: SubjectName[]) => {
    if (!user) return;
    const updatedUser = { ...user, assignedSubjects: subjects };
    setUser(updatedUser);
    setView('dashboard');
    localStorage.setItem('hc_user', JSON.stringify(updatedUser));
    await saveUserProfile(updatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    setIsMenuOpen(false);
    localStorage.removeItem('hc_user');
  };

  const updateAttendance = async (records: AttendanceRecord[]) => {
    setAttendance(prev => {
      const filtered = prev.filter(p => !records.some(r => r.id === p.id));
      const updated = [...filtered, ...records];
      return updated;
    });
    
    // Save to Firestore
    for (const record of records) {
      await saveAttendanceRecord(record);
    }
  };

  const updateScores = async (newScores: StudentScore[]) => {
    setScores(prev => {
      const filtered = prev.filter(p => !newScores.some(n => n.studentId === p.studentId && n.subjectName === p.subjectName));
      const updated = [...filtered, ...newScores];
      return updated;
    });

    // Save to Firestore
    for (const score of newScores) {
      await saveStudentScore(score);
    }
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => view === 'dashboard' ? handleLogout() : setView('dashboard')}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-sm group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Go Back</span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">HC</div>
              <div className="hidden xs:block">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Grade11 Class</h1>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tighter">Academic Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 relative" ref={menuRef}>
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-right">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : userInitials}
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-[60]">
                <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  View Profile
                </button>
                <button onClick={() => { setView('evaluations'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Evaluations
                </button>
                {user.role === UserRole.STUDENT && (
                  <button onClick={() => { setView('planner'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Study Planner
                  </button>
                )}
                <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-medium transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {view === 'subjectSelection' && user.role === UserRole.TEACHER ? (
          <SubjectSelection initialSelected={user.assignedSubjects} onConfirm={handleSubjectsAssign} />
        ) : view === 'profile' ? (
          <Profile user={user} onBack={() => setView('dashboard')} onChangeSubject={() => setView('subjectSelection')} onUpdateUser={handleUpdateUser} />
        ) : view === 'evaluations' ? (
          <Evaluations user={user} onBack={() => setView('dashboard')} />
        ) : view === 'planner' && user.role === UserRole.STUDENT ? (
          <StudyPlanner user={user} onBack={() => setView('dashboard')} />
        ) : user.role === UserRole.TEACHER ? (
          <TeacherDashboard 
            user={user} attendance={attendance} scores={scores}
            onUpdateAttendance={updateAttendance} onUpdateScores={updateScores} onBack={handleLogout}
            onOpenEvaluations={() => setView('evaluations')}
          />
        ) : (
          <StudentDashboard 
            user={user} attendance={attendance} scores={scores}
            onBack={handleLogout} onOpenNotes={() => setView('planner')}
            onOpenEvaluations={() => setView('evaluations')}
          />
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">© {new Date().getFullYear()} Happy Chandara School, Cambodia</p>
        </div>
      </footer>
    </div>
  );
};

export default App;