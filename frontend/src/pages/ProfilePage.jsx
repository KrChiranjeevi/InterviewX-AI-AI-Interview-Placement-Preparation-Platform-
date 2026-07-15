import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { getProfile, updateProfile } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [skills, setSkills] = useState('');
  const [interviewGoal, setInterviewGoal] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.user);
      setStats(data.stats);
      
      setName(data.user.name);
      setTargetRole(data.user.targetRole || '');
      setSkills(data.user.skills ? data.user.skills.join(', ') : '');
      setInterviewGoal(data.user.interviewGoal || '');
      setProfileImage(data.user.profileImage || '');
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      await updateProfile({
        name,
        targetRole,
        skills: skillsArray,
        interviewGoal,
        profileImage
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(); // Refresh
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden relative">
        <Navbar title="My Profile" />
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
        </div>

        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar relative z-10">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-4 relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 text-center flex flex-col items-center justify-center backdrop-blur-xl group hover:border-indigo-500/30 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-50" />
                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="relative mb-5 group-hover:scale-105 transition-transform duration-500">
                        {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full border-[3px] border-indigo-500/40 object-cover shadow-[0_0_30px_rgba(99,102,241,0.2)]" />
                        ) : (
                        <div className="w-32 h-32 rounded-full border-[3px] border-indigo-500/40 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 flex items-center justify-center text-4xl font-bold text-indigo-300 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        )}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#070711]" title="Online" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{profile?.name || 'Candidate'}</h2>
                    <p className="text-sm text-zinc-400 mb-5">{profile?.email}</p>
                    <div className="w-full h-px bg-white/[0.08] mb-5" />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-semibold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <span role="img" aria-label="rocket">🚀</span> {profile?.targetRole || 'Software Engineer'}
                    </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="md:col-span-8 grid grid-cols-2 gap-4">
                {[
                    { label: 'Total Interviews', val: stats?.totalInterviews || 0, icon: '🎤', color: 'from-blue-500/20 to-cyan-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
                    { label: 'Avg Score', val: (stats?.averageScore || 0) + '%', icon: '⭐', color: 'from-amber-500/20 to-yellow-500/5', border: 'border-amber-500/20', text: 'text-amber-400' },
                    { label: 'Current Streak', val: (stats?.streakCount || stats?.currentStreak || 0) + ' Days', icon: '🔥', color: 'from-orange-500/20 to-red-500/5', border: 'border-orange-500/20', text: 'text-orange-400' },
                    { label: 'XP Earned', val: (stats?.xp || 0), icon: '⚡', color: 'from-purple-500/20 to-pink-500/5', border: 'border-purple-500/20', text: 'text-purple-400' },
                ].map((s, i) => (
                    <div key={i} className={`relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-center hover:border-white/[0.12] transition-colors`} >
                        <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-30`} />
                        <div className="absolute -right-6 -top-6 text-7xl opacity-5 blur-[2px] rotate-12">{s.icon}</div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{s.icon}</span>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                            <p className={`text-4xl sm:text-5xl font-black ${s.text} tracking-tight`}>{s.val}</p>
                        </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
              <div className="p-6 border-b border-white/[0.08] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xl"><span role="img" aria-label="user">👤</span></div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Profile Details</h3>
                        <p className="text-xs text-zinc-400">Manage your personal information and goals</p>
                    </div>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-5 py-2.5 bg-white text-[#070711] hover:bg-zinc-200 rounded-xl transition-all text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="p-6 md:p-8 relative z-10">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-background border border-white/[0.1] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" required />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Target Role</label>
                        <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full bg-background border border-white/[0.1] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" placeholder="e.g. Full Stack Developer" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Profile Image URL</label>
                        <input type="url" value={profileImage} onChange={e => setProfileImage(e.target.value)} className="w-full bg-background border border-white/[0.1] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Interview Goal</label>
                        <input type="text" value={interviewGoal} onChange={e => setInterviewGoal(e.target.value)} className="w-full bg-background border border-white/[0.1] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" placeholder="e.g. Google SWE in 3 months" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">Skills (comma separated)</label>
                        <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-background border border-white/[0.1] text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" placeholder="React, Node.js, Python..." />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Target Role</p>
                      <p className="text-lg font-medium text-white">{profile?.targetRole || <span className="text-zinc-600 italic">Not set</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Goal</p>
                      <p className="text-lg font-medium text-white">{profile?.interviewGoal || <span className="text-zinc-600 italic">Not set</span>}</p>
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-white/[0.05]">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.skills?.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] text-zinc-300 rounded-lg text-sm font-medium hover:bg-white/[0.08] transition-colors">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-zinc-600 italic text-sm">No skills added yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;