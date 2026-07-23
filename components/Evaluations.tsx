import React, { useState, useEffect } from 'react';
import { User, UserRole, StudentEvaluation, SubjectName } from '../types';
import { MOCK_STUDENTS, SUBJECTS } from '../constants';
import { 
  saveEvaluation, 
  deleteEvaluation, 
  subscribeToEvaluations, 
  subscribeToAllEvaluations 
} from '../services/firestoreService';

interface EvaluationsProps {
  user: User;
  onBack: () => void;
}

const Evaluations: React.FC<EvaluationsProps> = ({ user, onBack }) => {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    student_id: '',
    subject: SUBJECTS[0],
    evaluation_title: '',
    evaluation_comment: '',
    score: ''
  });

  useEffect(() => {
    let unsubscribe: () => void;
    
    setLoading(true);
    if (user.role === UserRole.TEACHER) {
      unsubscribe = subscribeToAllEvaluations((data) => {
        setEvaluations(data);
        setLoading(false);
      });
    } else {
      unsubscribe = subscribeToEvaluations(user.id, (data) => {
        setEvaluations(data);
        setLoading(false);
      });
    }

    return () => unsubscribe?.();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = editingId || `eval_${Date.now()}`;
      const newEval: StudentEvaluation = {
        id,
        student_id: formData.student_id,
        teacher_id: user.id,
        subject: formData.subject,
        evaluation_title: formData.evaluation_title,
        evaluation_comment: formData.evaluation_comment,
        score: formData.score ? Number(formData.score) : undefined,
        date: new Date().toISOString()
      };

      await saveEvaluation(newEval);
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({ student_id: '', subject: SUBJECTS[0], evaluation_title: '', evaluation_comment: '', score: '' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this evaluation?')) return;
    try {
      await deleteEvaluation(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEdit = (evalItem: StudentEvaluation) => {
    setEditingId(evalItem.id);
    setFormData({
      student_id: evalItem.student_id,
      subject: evalItem.subject,
      evaluation_title: evalItem.evaluation_title,
      evaluation_comment: evalItem.evaluation_comment,
      score: evalItem.score?.toString() || ''
    });
    setIsAdding(true);
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
          <span>←</span> Back to Dashboard
        </button>
        {user.role === UserRole.TEACHER && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
          >
            + New Evaluation
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-8 text-white">
          <h2 className="text-2xl font-black">Student Evaluations</h2>
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mt-1">
            {user.role === UserRole.TEACHER ? 'Manage academic feedback' : 'Your academic feedback'}
          </p>
        </div>

        <div className="p-8">
          {isAdding && user.role === UserRole.TEACHER ? (
            <form onSubmit={handleSubmit} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-black text-slate-900">{editingId ? 'Edit Evaluation' : 'Create New Evaluation'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Student</label>
                  <select 
                    required
                    value={formData.student_id}
                    onChange={e => setFormData({...formData, student_id: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  >
                    <option value="">Select a student</option>
                    {MOCK_STUDENTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.classId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject</label>
                  <select 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value as SubjectName})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
                  <input 
                    required
                    type="text"
                    value={formData.evaluation_title}
                    onChange={e => setFormData({...formData, evaluation_title: e.target.value})}
                    placeholder="e.g., Mid-term Progress Report"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Comment</label>
                  <textarea 
                    required
                    rows={4}
                    value={formData.evaluation_comment}
                    onChange={e => setFormData({...formData, evaluation_comment: e.target.value})}
                    placeholder="Provide detailed feedback..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Score (Optional)</label>
                  <input 
                    type="number"
                    value={formData.score}
                    onChange={e => setFormData({...formData, score: e.target.value})}
                    placeholder="0-100"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="bg-slate-200 text-slate-600 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {evaluations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No evaluations found</p>
                </div>
              ) : (
                evaluations.map(evalItem => {
                  const student = MOCK_STUDENTS.find(s => s.id === evalItem.student_id);
                  return (
                    <div key={evalItem.id} className="group bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                              {evalItem.subject}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(evalItem.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">{evalItem.evaluation_title}</h3>
                          {user.role === UserRole.TEACHER && (
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                              Student: {student?.name || 'Unknown'} ({student?.classId})
                            </p>
                          )}
                        </div>
                        {evalItem.score !== undefined && (
                          <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-emerald-100">
                            <span className="text-lg font-black leading-none">{evalItem.score}</span>
                            <span className="text-[8px] font-black uppercase tracking-tighter">Score</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        {evalItem.evaluation_comment}
                      </p>
                      
                      {user.role === UserRole.TEACHER && (
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(evalItem)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </button>
                          <button onClick={() => handleDelete(evalItem.id)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Evaluations;
