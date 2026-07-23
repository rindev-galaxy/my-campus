
import React, { useState, useMemo } from 'react';
import { User, AttendanceRecord, StudentScore, AIInsight, SubjectName } from '../types';
import { MOCK_CLASSES, MOCK_STUDENTS } from '../constants';
import AttendanceSheet from './AttendanceSheet';
import InsightsView from './InsightsView';
import AcademicManagement from './AcademicManagement';
import { getAttendanceInsights } from '../services/geminiService';

interface TeacherDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  scores: StudentScore[];
  onUpdateAttendance: (records: AttendanceRecord[]) => void;
  onUpdateScores: (scores: StudentScore[]) => void;
  onBack: () => void;
  onOpenEvaluations: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, attendance, scores, onUpdateAttendance, onUpdateScores, onBack, onOpenEvaluations 
}) => {
  const myClasses = MOCK_CLASSES.filter(c => c.teacherId === 't1');
  const [selectedClassId, setSelectedClassId] = useState<string>(myClasses[0]?.id || '11SA');
  const [activeTab, setActiveTab] = useState<'attendance' | 'academic' | 'insights'>('attendance');
  
  // Recalculate student count based on selection
  const studentsInClassCount = useMemo(() => {
    return MOCK_STUDENTS.filter(s => s.classId === selectedClassId).length;
  }, [selectedClassId]);

  // Use the first assigned subject as default active subject for academic tab
  const [activeSubject, setActiveSubject] = useState<SubjectName>(
    user.assignedSubjects && user.assignedSubjects.length > 0 ? user.assignedSubjects[0] : 'Khmer'
  );
  
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFetchInsights = async () => {
    setIsAnalyzing(true);
    // Get students for current class for focused analysis
    const classStudents = MOCK_STUDENTS.filter(s => s.classId === selectedClassId);
    const result = await getAttendanceInsights(attendance, classStudents);
    setInsights(result);
    setIsAnalyzing(false);
  };

  const handleBackToDashboard = () => {
    if (activeTab !== 'attendance') {
      setActiveTab('attendance');
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-xs uppercase tracking-wider group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>{activeTab === 'attendance' ? 'Back to Login' : 'Back to Attendance'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Students in {selectedClassId}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{studentsInClassCount}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Domains</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {user.assignedSubjects?.map(subj => (
              <span key={subj} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-100 dark:border-indigo-800 uppercase">
                {subj}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Classes</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{myClasses.length}</p>
          </div>
          <button 
            onClick={onOpenEvaluations}
            className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 active:scale-95 transition-all group"
            title="Student Evaluations"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <nav className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            {(['attendance', 'academic', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-4">
            {activeTab === 'academic' && user.assignedSubjects && user.assignedSubjects.length > 1 && (
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Focusing On:</label>
                <select
                  value={activeSubject}
                  onChange={(e) => setActiveSubject(e.target.value as SubjectName)}
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-none bg-transparent"
                >
                  {user.assignedSubjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab !== 'insights' && (
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Class Segment:</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="block w-full sm:w-48 pl-3 pr-10 py-2 text-xs border-slate-300 dark:border-slate-700 font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-colors"
                >
                  {myClasses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'attendance' && (
            <AttendanceSheet 
              classId={selectedClassId} 
              attendanceRecords={attendance}
              onUpdate={onUpdateAttendance}
            />
          )}
          {activeTab === 'academic' && (
            <AcademicManagement 
              classId={selectedClassId}
              scores={scores}
              assignedSubject={activeSubject}
              onUpdate={onUpdateScores}
            />
          )}
          {activeTab === 'insights' && (
            <InsightsView 
              insights={insights} 
              onAnalyze={handleFetchInsights} 
              isAnalyzing={isAnalyzing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;