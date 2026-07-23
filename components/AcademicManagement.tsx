
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_STUDENTS, MOCK_CLASSES, getSubjectMaxScore } from '../constants';
import { StudentScore, SubjectGrade, SubjectName, ClassTrack } from '../types';

interface AcademicManagementProps {
  classId: string;
  scores: StudentScore[];
  assignedSubject: SubjectName;
  onUpdate: (scores: StudentScore[]) => void;
}

const AcademicManagement: React.FC<AcademicManagementProps> = ({ classId, scores, assignedSubject, onUpdate }) => {
  const classObj = MOCK_CLASSES.find(c => c.id === classId);
  const classStudents = MOCK_STUDENTS.filter(s => s.classId === classId);
  
  // Dynamic Max Score based on Class Track
  const maxPoints = useMemo(() => {
    if (!classObj) return 50;
    return getSubjectMaxScore(assignedSubject, classObj.track);
  }, [assignedSubject, classObj]);

  const caps = useMemo(() => ({
    participation: maxPoints * 0.2,
    homework: maxPoints * 0.3,
    exam: maxPoints * 0.5
  }), [maxPoints]);

  const [localScores, setLocalScores] = useState<Record<string, SubjectGrade>>({});

  useEffect(() => {
    const initial = classStudents.reduce((acc, student) => {
      const score = scores.find(s => s.studentId === student.id && s.subjectName === assignedSubject);
      acc[student.id] = score ? score.grade : { participation: 0, homework: 0, exam: 0, final: 0 };
      return acc;
    }, {} as Record<string, SubjectGrade>);
    setLocalScores(initial);
  }, [assignedSubject, classId, scores]);

  const calculateFinalPercentage = (p: number, h: number, e: number) => {
    return Math.round(((p + h + e) / maxPoints) * 100);
  };

  const handleChange = (studentId: string, field: keyof Omit<SubjectGrade, 'final'>, value: string) => {
    const maxForField = caps[field as keyof typeof caps];
    const num = Math.min(maxForField, Math.max(0, parseFloat(value) || 0));
    
    setLocalScores(prev => {
      const current = prev[studentId] || { participation: 0, homework: 0, exam: 0, final: 0 };
      const updated = { ...current, [field]: num };
      updated.final = calculateFinalPercentage(updated.participation, updated.homework, updated.exam);
      return { ...prev, [studentId]: updated };
    });
  };

  const handleSave = (studentId: string) => {
    const updatedGrade = localScores[studentId];
    const newScore: StudentScore = { 
      studentId, 
      subjectName: assignedSubject,
      grade: updatedGrade,
      lastUpdated: new Date().toISOString() 
    };
    onUpdate([newScore]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            🎓
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{assignedSubject} Management</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Track: {classObj?.track} | Max Score: {maxPoints} pts
            </p>
          </div>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl flex gap-6 text-[10px] font-black text-indigo-700 uppercase tracking-widest border border-indigo-100">
          <div>P: {caps.participation}</div>
          <div>H: {caps.homework}</div>
          <div>E: {caps.exam}</div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Participation (max {caps.participation})</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Homework (max {caps.homework})</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam (max {caps.exam})</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {classStudents.map((student) => {
              const grade = localScores[student.id] || { participation: 0, homework: 0, exam: 0, final: 0 };
              const totalRaw = (grade.participation + grade.homework + grade.exam).toFixed(1);
              return (
                <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{student.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">ID: {student.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" step="0.5"
                      value={grade.participation}
                      onChange={(e) => handleChange(student.id, 'participation', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" step="0.5"
                      value={grade.homework}
                      onChange={(e) => handleChange(student.id, 'homework', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                      type="number" step="0.5"
                      value={grade.exam}
                      onChange={(e) => handleChange(student.id, 'exam', e.target.value)}
                      className="w-16 px-2 py-1.5 text-center border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`text-sm font-black ${
                      grade.final >= 80 ? 'text-emerald-600' : grade.final >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {totalRaw}/{maxPoints}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">{grade.final}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleSave(student.id)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-md active:scale-95"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicManagement;
