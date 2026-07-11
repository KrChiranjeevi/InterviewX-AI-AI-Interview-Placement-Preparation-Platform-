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
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Manage your professional profile" />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 glass-card rounded-3xl p-8 border border-slate-800 text-center flex flex-col items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover mb-4" />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-indigo-500/20 flex items-center justify-center text-4xl text-indigo-400 mb-4">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
                <p className="text-slate-400">{profile?.email}</p>
                <div className="mt-4 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-semibold border border-indigo-500/20">
                  {profile?.targetRole || 'Software Engineer'}
                </div>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🎤</div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Interviews</p>
                  <p className="text-5xl font-black text-white">{stats?.totalInterviews || 0}</p>
                </div>
                <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">⭐</div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Avg Score</p>
                  <p className="text-5xl font-black text-indigo-400">{stats?.averageScore || 0}</p>
                </div>
                <div className="col-span-2 glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-5xl">🔥</div>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Streak</p>
                  <p className="text-4xl font-bold text-white">{stats?.currentStreak || 0} <span className="text-2xl text-slate-500">Days</span></p>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Profile Details</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-semibold"
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
              
              <div className="p-8">
                {isEditing ? (
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Target Role</label>
                        <input type="text" value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="e.g. Full Stack Developer" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Profile Image URL</label>
                        <input type="url" value={profileImage} onChange={e => setProfileImage(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="https://..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Interview Goal</label>
                        <input type="text" value={interviewGoal} onChange={e => setInterviewGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="e.g. Google SWE in 3 months" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Skills (comma separated)</label>
                        <input type="text" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" placeholder="React, Node.js, Python..." />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Target Role</p>
                        <p className="text-lg text-white font-medium">{profile?.targetRole || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Current Goal</p>
                        <p className="text-lg text-white font-medium">{profile?.interviewGoal || 'Not specified'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profile?.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-slate-400 italic">No skills added yet.</p>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-slate-800">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Badges</p>
                        <div className="flex gap-4">
                          {profile?.badges && profile.badges.length > 0 ? (
                            profile.badges.map((badge, idx) => (
                              <div key={idx} className="flex flex-col items-center">
                                <span className="text-4xl">{badge.includes('Fast') ? '⚡' : badge.includes('Top') ? '🏆' : '🏅'}</span>
                                <span className="text-xs text-slate-400 mt-2 font-medium">{badge}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic">No badges earned yet. Keep practicing!</p>
                          )}
                        </div>
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
