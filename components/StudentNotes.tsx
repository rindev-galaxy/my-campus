
import React, { useState, useEffect } from 'react';
/* Use StudyNote as defined in types.ts */
import { User, StudyNote } from '../types';

interface StudentNotesProps {
  user: User;
  onBack: () => void;
}

const StudentNotes: React.FC<StudentNotesProps> = ({ user, onBack }) => {
  /* Change StudentNote to StudyNote */
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  useEffect(() => {
    const savedNotes = localStorage.getItem(`hc_notes_${user.id}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [user.id]);

  /* Use StudyNote instead of StudentNote */
  const saveNotes = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(`hc_notes_${user.id}`, JSON.stringify(updatedNotes));
  };

  /* Align note parameter and internal logic to StudyNote interface (id instead of note_id) */
  const handleOpenModal = (note?: StudyNote) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.text_content);
      setImageUrl(note.image_url || '');
      setScheduleDate(note.schedule_datetime || '');
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setImageUrl('');
      setScheduleDate('');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingNote) {
      /* Use id instead of note_id */
      const updatedNotes = notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, title, text_content: content, image_url: imageUrl, schedule_datetime: scheduleDate, updated_at: now }
          : n
      );
      saveNotes(updatedNotes);
    } else {
      /* Create new StudyNote and provide required subject_name */
      const newNote: StudyNote = {
        id: `note_${Date.now()}`,
        student_id: user.id,
        title,
        text_content: content,
        image_url: imageUrl,
        subject_name: 'Khmer', // Default subject name as StudyNote requires it
        schedule_datetime: scheduleDate,
        created_at: now,
        updated_at: now
      };
      saveNotes([newNote, ...notes]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      /* Use id instead of note_id */
      saveNotes(notes.filter(n => n.id !== noteId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Dashboard</span>
        </button>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Create New Note
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl">
            📝
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">My Study Notes</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Personal Workspace</p>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-4">
              📭
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Notes Yet</h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">
              Start organizing your thoughts, reminders, and study materials here.
            </p>
            <button 
              onClick={() => handleOpenModal()}
              className="mt-6 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:underline"
            >
              + Create your first note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div key={note.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                {note.image_url && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100">
                    <img src={note.image_url} alt={note.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight line-clamp-1">{note.title}</h4>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(note)} className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1 line-clamp-3 mb-4">
                    {note.text_content}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Modified</span>
                      <span className="text-[10px] text-slate-900 font-bold">{new Date(note.updated_at).toLocaleDateString()}</span>
                    </div>
                    {note.schedule_datetime && (
                      <div className="bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-[9px] font-black text-amber-700 uppercase">{new Date(note.schedule_datetime).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    type="text" required value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Khmer Grammar Review"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
                  <textarea 
                    required value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Write your notes here..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium leading-relaxed text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Schedule Reminder</label>
                    <input 
                      type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-[10px] font-bold uppercase text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attach Image</label>
                    <div className="relative">
                      <input 
                        type="file" accept="image/*" onChange={handleImageUpload}
                        className="hidden" id="note-image"
                      />
                      <label 
                        htmlFor="note-image"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-[10px] font-black uppercase tracking-wider">{imageUrl ? 'Change Photo' : 'Add Photo'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {imageUrl && (
                  <div className="mt-2 relative w-20 h-20 group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                    <button 
                      type="button" 
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 active:scale-95 transition-all"
                >
                  {editingNote ? 'Update Note' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentNotes;
