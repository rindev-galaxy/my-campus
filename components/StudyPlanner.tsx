
import React, { useState, useEffect, useMemo } from 'react';
import { User, StudySchedule, StudyNote, SubjectName } from '../types';
import { SUBJECTS } from '../constants';
import { getStudySuggestions } from '../services/geminiService';
import { 
  saveStudySchedule, 
  deleteStudySchedule, 
  subscribeToSchedules,
  saveStudyNote,
  deleteStudyNote,
  subscribeToNotes
} from '../services/firestoreService';

interface StudyPlannerProps {
  user: User;
  onBack: () => void;
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'notes'>('schedule');
  const [schedules, setSchedules] = useState<StudySchedule[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('Loading smart tips...');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Forms State
  const [schedForm, setSchedForm] = useState<{subj: SubjectName, date: string, start: string, end: string, desc: string}>({
    subj: 'Khmer', date: new Date().toISOString().split('T')[0], start: '14:00', end: '15:00', desc: ''
  });
  const [noteForm, setNoteForm] = useState<{title: string, content: string, subj: SubjectName, img: string}>({
    title: '', content: '', subj: 'Khmer', img: ''
  });

  useEffect(() => {
    const unsubSchedules = subscribeToSchedules(user.id, (data) => {
      setSchedules(data);
    });
    const unsubNotes = subscribeToNotes(user.id, (data) => {
      setNotes(data);
    });

    return () => {
      unsubSchedules();
      unsubNotes();
    };
  }, [user.id]);

  useEffect(() => {
    if (schedules.length > 0) {
      handleGetAiTips();
    }
  }, [schedules.length]);

  const handleGetAiTips = async () => {
    setIsAiLoading(true);
    const tip = await getStudySuggestions(schedules);
    setAiSuggestion(tip);
    setIsAiLoading(false);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const stats = useMemo(() => {
    let totalMins = 0;
    let todayMins = 0;
    let todayCount = 0;
    let completedCount = 0;

    schedules.forEach(s => {
      const [h1, m1] = s.start_time.split(':').map(Number);
      const [h2, m2] = s.end_time.split(':').map(Number);
      const duration = (h2 * 60 + m2) - (h1 * 60 + m1);
      
      if (s.is_completed) {
        totalMins += duration;
        completedCount++;
      }
      
      if (s.date === todayStr) {
        todayMins += duration;
        todayCount++;
      }
    });

    return {
      weeklyHours: (totalMins / 60).toFixed(1),
      todayHours: (todayMins / 60).toFixed(1),
      todayTasks: todayCount,
      completed: completedCount
    };
  }, [schedules, todayStr]);

  const todaySessions = useMemo(() => {
    return schedules.filter(s => s.date === todayStr).sort((a,b) => a.start_time.localeCompare(b.start_time));
  }, [schedules, todayStr]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: StudySchedule = {
      id: `sched_${Date.now()}`,
      student_id: user.id,
      subject_name: schedForm.subj,
      date: schedForm.date,
      start_time: schedForm.start,
      end_time: schedForm.end,
      description: schedForm.desc,
      is_completed: false,
      created_at: new Date().toISOString()
    };
    
    await saveStudySchedule(newEntry);
    setIsScheduleModalOpen(false);
    
    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteForm(prev => ({ ...prev, img: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNote: StudyNote = {
      id: `snote_${Date.now()}`,
      student_id: user.id,
      title: noteForm.title,
      text_content: noteForm.content,
      subject_name: noteForm.subj,
      image_url: noteForm.img,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await saveStudyNote(newNote);
    setIsNoteModalOpen(false);
    setNoteForm({ title: '', content: '', subj: 'Khmer', img: '' });
  };

  const toggleComplete = async (id: string) => {
    const item = schedules.find(s => s.id === id);
    if (item) {
      await saveStudySchedule({ ...item, is_completed: !item.is_completed });
    }
  };

  const deleteSched = async (id: string) => {
    await deleteStudySchedule(id);
  };

  const deleteNote = async (id: string) => {
    await deleteStudyNote(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Dashboard</span>
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            + Add Study Session
          </button>
          <button 
            onClick={() => setIsNoteModalOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            + New Study Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Study</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats.todayHours}h</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{stats.todayTasks} Sessions Planned</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Completed</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats.weeklyHours}h</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{stats.completed} Sessions Done</p>
        </div>
        <div className="md:col-span-2 bg-indigo-600 p-6 rounded-3xl text-white flex items-start gap-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">🤖</div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Happy Chandara Smart Assistant</p>
            <p className="text-xs font-bold text-white mt-1 leading-relaxed">
              {isAiLoading ? (
                <span className="flex items-center gap-2">
                   <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Analyzing your study habits...
                </span>
              ) : aiSuggestion}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                    Today's Overview
                 </h3>
              </div>
              <div className="p-4 space-y-4">
                 {todaySessions.length === 0 ? (
                    <div className="py-12 text-center">
                       <p className="text-xs font-bold text-slate-400 uppercase italic">No sessions for today</p>
                    </div>
                 ) : (
                    todaySessions.map(s => (
                       <div key={s.id} className={`p-4 rounded-2xl border transition-all ${s.is_completed ? 'bg-emerald-50 border-emerald-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <div className="flex justify-between items-start">
                             <div>
                                <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full">{s.subject_name}</span>
                                <p className="text-sm font-black text-slate-900 mt-1">{s.start_time} - {s.end_time}</p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">{s.description}</p>
                             </div>
                             <button onClick={() => toggleComplete(s.id)} className={`w-6 h-6 rounded-full flex items-center justify-center border ${s.is_completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-200 text-transparent'}`}>
                                ✓
                             </button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-slate-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Study Schedule
              </button>
              <button 
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-slate-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Topic Notes
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {activeTab === 'schedule' ? (
                <div className="overflow-x-auto">
                  {schedules.length === 0 ? (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">📅</div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Your study table is empty</p>
                      <button onClick={() => setIsScheduleModalOpen(true)} className="mt-4 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Plan your first session</button>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Time</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {schedules.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(s => (
                          <tr key={s.id} className={`text-xs ${s.is_completed ? 'opacity-50' : ''}`}>
                            <td className="px-4 py-4 font-black text-slate-900">{s.subject_name}</td>
                            <td className="px-4 py-4 font-bold text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                            <td className="px-4 py-4 text-slate-400">{s.start_time} - {s.end_time}</td>
                            <td className="px-4 py-4 text-center">
                              <button 
                                onClick={() => toggleComplete(s.id)}
                                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                  s.is_completed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                }`}
                              >
                                {s.is_completed ? 'Completed' : 'Planned'}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button onClick={() => deleteSched(s.id)} className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {notes.length === 0 ? (
                    <div className="col-span-full py-24 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">📓</div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No topic notes created</p>
                      <button onClick={() => setIsNoteModalOpen(true)} className="mt-4 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:underline">Create your first note</button>
                    </div>
                  ) : (
                    notes.map(n => (
                      <div key={n.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col group relative hover:border-indigo-300 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-100">{n.subject_name}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase mb-2">{n.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">{n.text_content}</p>
                        {n.image_url && (
                          <div className="relative h-40 w-full overflow-hidden rounded-2xl mb-4 group/img">
                             <img src={n.image_url} className="h-full w-full object-cover" alt="Note Attachment" />
                             <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">View Attachment</span>
                             </div>
                          </div>
                        )}
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                          <button onClick={() => deleteNote(n.id)} className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-widest mb-6">Plan Study Session</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Subject</label>
                <select 
                  className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  value={schedForm.subj}
                  onChange={e => setSchedForm({...schedForm, subj: e.target.value as SubjectName})}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Date</label>
                  <input type="date" className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500" value={schedForm.date} onChange={e => setSchedForm({...schedForm, date: e.target.value})} />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Start</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500" value={schedForm.start} onChange={e => setSchedForm({...schedForm, start: e.target.value})} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">End</label>
                    <input type="time" className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500" value={schedForm.end} onChange={e => setSchedForm({...schedForm, end: e.target.value})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Session Goal</label>
                <input type="text" className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Review Khmer literature" value={schedForm.desc} onChange={e => setSchedForm({...schedForm, desc: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Save Session</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-widest mb-6">Create Topic Note</h3>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Subject</label>
                  <select 
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                    value={noteForm.subj}
                    onChange={e => setNoteForm({...noteForm, subj: e.target.value as SubjectName})}
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Note Title</label>
                  <input type="text" className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-bold bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" required value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Note Content</label>
                <textarea className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium bg-slate-50 text-slate-900 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none" rows={4} required value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Attach Material (Image)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageCapture} />
                    <div className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase text-center hover:border-indigo-400 hover:text-indigo-600 transition-all">
                       {noteForm.img ? 'Change Image' : 'Click to Upload / Capture'}
                    </div>
                  </label>
                  {noteForm.img && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                       <img src={noteForm.img} className="w-full h-full object-cover" alt="Preview" />
                       <button type="button" onClick={() => setNoteForm(p => ({...p, img: ''}))} className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-bl-lg">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsNoteModalOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 active:scale-95 transition-all">Create Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
