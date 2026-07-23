
import React, { useMemo } from 'react';
import { User, AttendanceRecord, AttendanceStatus, StudentScore, SubjectGrade, SubjectName, ClassTrack } from '../types';
import { SUBJECTS, MOCK_CLASSES, getSubjectMaxScore } from '../constants';

interface StudentDashboardProps {
  user: User;
  attendance: AttendanceRecord[];
  scores: StudentScore[];
  onBack: () => void;
  onOpenNotes?: () => void;
  onOpenEvaluations: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, attendance, scores, onBack, onOpenNotes, onOpenEvaluations }) => {
  const myClass = useMemo(() => MOCK_CLASSES.find(c => c.id === user.classId), [user.classId]);
  const track = myClass?.track || ClassTrack.SOCIAL;

  const myRecords = useMemo(() => {
    return attendance.filter(r => r.studentId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, user.id]);

  const myScores = useMemo(() => {
    return scores.filter(s => s.studentId === user.id);
  }, [scores, user.id]);

  const stats = useMemo(() => {
    const total = myRecords.length;
    if (total === 0) return { present: 0, absent: 0, late: 0, rate: 100 };
    const present = myRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const late = myRecords.filter(r => r.status === AttendanceStatus.LATE).length;
    const rate = Math.round(((present + late * 0.5) / total) * 100);
    return { present, absent: total - present - late, late, rate };
  }, [myRecords]);

  const overallAverage = useMemo(() => {
    if (myScores.length === 0) return 0;
    return Math.round(myScores.reduce((acc, curr) => acc + curr.grade.final, 0) / myScores.length);
  }, [myScores]);

  const ScoreCard: React.FC<{ title: SubjectName; grade?: SubjectGrade }> = ({ title, grade }) => {
    const max = getSubjectMaxScore(title, track);
    const rawTotal = grade ? (grade.participation + grade.homework + grade.exam) : 0;
    
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 group hover:border-indigo-500 dark:hover:border-indigo-400 transition-all">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h4>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{grade ? `${rawTotal}/${max}` : '--'}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            !grade ? 'bg-slate-200 dark:bg-slate-700' :
            grade.final >= 80 ? 'bg-emerald-500' : grade.final >= 50 ? 'bg-amber-500' : 'bg-rose-500'
          }`} />
        </div>
        
        {grade ? (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className="text-slate-400 dark:text-slate-500">P: {grade.participation}</span>
                <span className="text-slate-900 dark:text-slate-300">{(max * 0.2).toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-300 dark:bg-indigo-500 h-full" style={{ width: `${(grade.participation / (max * 0.2)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className="text-slate-400 dark:text-slate-500">H: {grade.homework}</span>
                <span className="text-slate-900 dark:text-slate-300">{(max * 0.3).toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 dark:bg-indigo-600 h-full" style={{ width: `${(grade.homework / (max * 0.3)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
                <span className="text-slate-400 dark:text-slate-500">E: {grade.exam}</span>
                <span className="text-slate-900 dark:text-slate-300">{(max * 0.5).toFixed(1)}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-700 dark:bg-indigo-800 h-full" style={{ width: `${(grade.exam / (max * 0.5)) * 100}%` }}></div>
              </div>
            </div>
            <div className="pt-2 text-right">
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full uppercase">{grade.final}% Score</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase italic">Pending Evaluation</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-xs uppercase tracking-wider group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Log Out</span>
        </button>
        <div className="flex items-center gap-3">
          {onOpenNotes && (
            <button 
              onClick={onOpenNotes}
              className="bg-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-widest shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Study Planner
            </button>
          )}
          <div className="bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest shadow-sm">
            Class: {myClass?.name} | Track: {track}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-indigo-600 dark:bg-indigo-900/60 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight">Academic Spotlight</h2>
            <p className="mt-4 text-indigo-100 dark:text-indigo-200 opacity-90 max-w-md font-medium text-lg italic">
              Empowering girls through quality education in {track}.
            </p>
          </div>
          <div className="mt-12 flex items-end justify-between relative z-10">
            <div className="flex gap-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Active Subjects</p>
                <p className="text-3xl font-black mt-1">{myScores.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Attendance Rate</p>
                <p className="text-3xl font-black mt-1">{stats.rate}%</p>
              </div>
            </div>
            <button 
              onClick={onOpenEvaluations}
              className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-2xl backdrop-blur-md border border-white/20 transition-all group"
              title="View My Evaluations"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Cumulative Average</p>
          <div className="relative">
             <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={440} strokeDashoffset={440 - (440 * overallAverage / 100)}
                        className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  {overallAverage}
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">%</span>
             </div>
          </div>
          <p className="mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Global Indicator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBJECTS.map((subject) => {
          const score = myScores.find(s => s.subjectName === subject);
          return <ScoreCard key={subject} title={subject} grade={score?.grade} />;
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Log History</h3>
          <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{stats.present} Days Recorded</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Remark</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {myRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      r.status === AttendanceStatus.PRESENT ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                      r.status === AttendanceStatus.LATE ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                      'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-right text-[10px] font-bold text-slate-500 dark:text-slate-400 italic">
                    {(r.status === AttendanceStatus.ABSENT || r.status === AttendanceStatus.LATE) && r.reason ? (
                      <span className={`${r.status === AttendanceStatus.ABSENT ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} font-black uppercase tracking-tighter`}>
                        Reason: {r.reason}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">Faculty Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;