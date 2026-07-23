
import React, { useState } from 'react';
import { SUBJECTS } from '../constants';
import { SubjectName } from '../types';

interface SubjectSelectionProps {
  initialSelected?: SubjectName[];
  onConfirm: (subjects: SubjectName[]) => void;
}

const SubjectSelection: React.FC<SubjectSelectionProps> = ({ initialSelected = [], onConfirm }) => {
  const [selected, setSelected] = useState<SubjectName[]>(initialSelected);

  const toggleSubject = (subject: SubjectName) => {
    setSelected(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Subject Assignment</h2>
        <p className="text-slate-500 font-medium">Select one or more subjects you teach at Happy Chandara School.</p>
        <div className="mt-4 flex justify-center gap-2">
          <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
            {selected.length} Domain{selected.length !== 1 ? 's' : ''} Selected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SUBJECTS.map((subject) => {
          const isSelected = selected.includes(subject);
          return (
            <button
              key={subject}
              onClick={() => toggleSubject(subject)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                isSelected 
                  ? 'bg-indigo-50 border-indigo-500 shadow-md ring-2 ring-indigo-100' 
                  : 'bg-white border-slate-100 hover:border-indigo-300'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px]">
                  ✓
                </div>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                isSelected ? 'bg-white' : 'bg-slate-50 group-hover:bg-indigo-50'
              }`}>
                <span className={`text-xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-125'}`}>
                  {isSelected ? '🏷️' : '📚'}
                </span>
              </div>
              <h3 className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                isSelected ? 'text-indigo-700' : 'text-slate-900 group-hover:text-indigo-600'
              }`}>{subject}</h3>
            </button>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => onConfirm(selected)}
          disabled={selected.length === 0}
          className={`px-12 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${
            selected.length > 0 
              ? 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Confirm Assignment
        </button>
      </div>

      <div className="mt-16 p-8 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">
          💡
        </div>
        <div>
          <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Collaborative Management</h4>
          <p className="text-sm text-indigo-700 leading-relaxed font-medium">
            You can select multiple subjects if you are a multi-disciplinary educator. Your dashboard will provide a switcher to transition between different subject grade sheets.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
