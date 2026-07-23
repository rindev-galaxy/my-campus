
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { AttendanceStatus, AttendanceRecord } from '../types';

interface AttendanceSheetProps {
  classId: string;
  attendanceRecords: AttendanceRecord[];
  onUpdate: (records: AttendanceRecord[]) => void;
}

const ReasonInput: React.FC<{ 
  value: string; 
  onSave: (val: string) => void;
  placeholder?: string;
}> = ({ value, onSave, placeholder }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!isEditing && !value) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
      >
        + Add Reason
      </button>
    );
  }

  if (!isEditing && value) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all text-left max-w-[200px] truncate"
      >
        {value}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        value={localValue}
        placeholder={placeholder}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => {
          onSave(localValue);
          setIsEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSave(localValue);
            setIsEditing(false);
          }
          if (e.key === 'Escape') {
            setLocalValue(value);
            setIsEditing(false);
          }
        }}
        className="text-xs border border-indigo-300 dark:border-indigo-500 bg-white dark:bg-slate-800 rounded px-2 py-1 w-full max-w-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white shadow-sm"
      />
      <button 
        onClick={() => {
          onSave(localValue);
          setIsEditing(false);
        }}
        className="p-1 text-emerald-600 hover:text-emerald-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      </button>
    </div>
  );
};

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ classId, attendanceRecords, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const classStudents = MOCK_STUDENTS.filter(s => s.classId === classId);

  const getCurrentStatus = (studentId: string) => {
    return attendanceRecords.find(r => r.studentId === studentId && r.date === selectedDate)?.status || null;
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    const existingRecord = attendanceRecords.find(r => r.studentId === studentId && r.date === selectedDate);
    const record: AttendanceRecord = {
      id: `${studentId}-${selectedDate}`,
      studentId,
      classId,
      date: selectedDate,
      status,
      reason: (status === AttendanceStatus.ABSENT || status === AttendanceStatus.LATE) ? (existingRecord?.reason || '') : undefined
    };
    onUpdate([record]);
  };

  const setReason = (studentId: string, reason: string) => {
    const existingRecord = attendanceRecords.find(r => r.studentId === studentId && r.date === selectedDate);
    if (!existingRecord) return;
    
    const record: AttendanceRecord = {
      ...existingRecord,
      reason
    };
    onUpdate([record]);
  };

  const markAllAsPresent = () => {
    const newRecords = classStudents.map(s => ({
      id: `${s.id}-${selectedDate}`,
      studentId: s.id,
      classId,
      date: selectedDate,
      status: AttendanceStatus.PRESENT
    }));
    onUpdate(newRecords);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md px-3 py-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          />
        </div>
        <button
          onClick={markAllAsPresent}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Mark All Present
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 rounded-tl-lg">Student Name</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 rounded-tr-lg">Reason (Absent/Late)</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
            {classStudents.map((student) => {
              const record = attendanceRecords.find(r => r.studentId === student.id && r.date === selectedDate);
              const currentStatus = record?.status || null;
              const currentReason = record?.reason || '';

              return (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs overflow-hidden shrink-0">
                        {student.avatarUrl ? (
                          <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          student.name.split(' ').map(n => n[0]).join('').toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{student.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setStatus(student.id, AttendanceStatus.PRESENT)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                          currentStatus === AttendanceStatus.PRESENT
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 ring-2 ring-emerald-500 ring-offset-1'
                            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:text-emerald-500'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStatus(student.id, AttendanceStatus.LATE)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                          currentStatus === AttendanceStatus.LATE
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 ring-2 ring-amber-500 ring-offset-1'
                            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:text-amber-500'
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStatus(student.id, AttendanceStatus.ABSENT)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                          currentStatus === AttendanceStatus.ABSENT
                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 ring-2 ring-rose-500 ring-offset-1'
                            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-500'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {currentStatus === AttendanceStatus.ABSENT || currentStatus === AttendanceStatus.LATE ? (
                      <ReasonInput 
                        value={currentReason} 
                        onSave={(val) => setReason(student.id, val)}
                        placeholder={currentStatus === AttendanceStatus.ABSENT ? "Why is she absent?" : "Why is she late?"}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">Not applicable</span>
                    )}
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

export default AttendanceSheet;
