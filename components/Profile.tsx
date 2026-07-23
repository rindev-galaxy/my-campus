
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_CLASSES } from '../constants';

interface ProfileProps {
  user: User;
  onBack: () => void;
  onChangeSubject: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onBack, onChangeSubject, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [telegram, setTelegram] = useState(user.telegram || '');
  const [gmail, setGmail] = useState(user.gmail || '');

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const className = user.classId ? MOCK_CLASSES.find(c => c.id === user.classId)?.name : 'N/A';

  const handleSave = () => {
    onUpdateUser({
      ...user,
      telegram,
      gmail
    });
    setIsEditing(false);
  };

  const formatTelegramLink = (handle: string) => {
    if (!handle) return '#';
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    return `https://t.me/${cleanHandle}`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-wider group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
              <div className="w-full h-full bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 text-3xl font-black overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : initials}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                  Active Student
                </span>
              </div>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                Academic Year 2025-2026
              </p>
            </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                 }`}
               >
                 {isEditing ? 'Save Changes' : 'Edit Contacts'}
               </button>
               <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100 flex items-center">Verified Account</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Student Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">ID</label>
                    <p className="text-sm font-bold text-slate-900">{user.id}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Name</label>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Grade</label>
                    <p className="text-sm font-bold text-slate-900">{user.role === UserRole.STUDENT ? className : 'Faculty'}</p>
                  </div>
                </div>
              </section>

              {user.role === UserRole.TEACHER && (
                <section className="pt-6 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assigned Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.assignedSubjects && user.assignedSubjects.length > 0 ? (
                      user.assignedSubjects.map(s => (
                        <span key={s} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-slate-400">General Core</span>
                    )}
                    <button 
                      onClick={onChangeSubject}
                      className="text-[10px] font-bold uppercase text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Update
                    </button>
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connect with me</h4>
                  {!isEditing && <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Interactive</span>}
                </div>
                
                <div className="space-y-4">
                  {/* Telegram Card */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Telegram Contact</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 text-sm font-bold">@</span>
                        </div>
                        <input 
                          type="text" 
                          value={telegram.startsWith('@') ? telegram.substring(1) : telegram} 
                          onChange={e => setTelegram('@' + e.target.value)}
                          placeholder="username"
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900 bg-slate-50"
                        />
                      </div>
                    ) : (
                      <a 
                        href={formatTelegramLink(user.telegram || '')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          user.telegram 
                            ? 'bg-sky-50 border-sky-100 hover:shadow-md hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.27 4.85-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">Telegram</p>
                          <p className="text-sm font-black text-slate-900 mt-1">{user.telegram || 'No handle set'}</p>
                        </div>
                        {user.telegram && <span className="ml-auto text-sky-400">→</span>}
                      </a>
                    )}
                  </div>

                  {/* Gmail Card */}
                  <div className="group">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5">Personal Gmail</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        value={gmail} 
                        onChange={e => setGmail(e.target.value)}
                        placeholder="your.name@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900 bg-slate-50"
                      />
                    ) : (
                      <a 
                        href={user.gmail ? `mailto:${user.gmail}` : '#'} 
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          user.gmail 
                            ? 'bg-rose-50 border-rose-100 hover:shadow-md hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Private Mail</p>
                          <p className="text-sm font-black text-slate-900 mt-1 truncate max-w-[150px]">{user.gmail || 'Not linked'}</p>
                        </div>
                        {user.gmail && <span className="ml-auto text-rose-400">→</span>}
                      </a>
                    )}
                  </div>
                </div>
              </section>

              <section className="pt-6 border-t border-slate-50">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-2xl shrink-0">📍</div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-0.5">Location</h4>
                    <p className="text-[11px] font-bold text-slate-500">Happy Chandara, Cambodia</p>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">
              💡
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">Privacy & Support</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Your school email remains the primary identifier. Your personal Telegram and Gmail are optional but highly recommended for better collaboration with peers and teachers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
