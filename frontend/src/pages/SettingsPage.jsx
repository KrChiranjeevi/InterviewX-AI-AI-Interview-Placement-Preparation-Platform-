import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { getProfile, updateSettings, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  FaUser, FaGlobe, FaUserCog, FaPalette, FaBrain, FaVideo, FaCode, 
  FaBell, FaShieldAlt, FaPlug, FaCreditCard, FaDatabase, FaCogs,
  FaFire, FaCheck, FaUpload, FaTrash, FaPlus, FaClock, FaDownload,
  FaCog, FaMoon, FaSun, FaDesktop, FaChartLine, FaKey, FaLaptop,
  FaUnlock, FaTerminal, FaEye, FaSync, FaExclamationTriangle
} from 'react-icons/fa';

const SettingsPage = () => {
  // Global profile & settings state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const containerRef = useRef(null);

  // Forms state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Custom mock states for UI responsiveness
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  // Quick Action / Timeline States
  const [recentChats, setRecentChats] = useState([
    { id: 1, title: 'FAANG Prep - System Design', date: 'Yesterday' },
    { id: 2, title: 'JS Async/Await Mentoring', date: '3 days ago' },
  ]);

  // Load profile details and settings from backend
  const fetchUserData = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      window.dispatchEvent(new Event('theme-changed'));
    } catch (err) {
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // GSAP animations for tab change and staggers
  useGSAP(() => {
    if (loading || !profile) return;
    
    // Check if animations are globally enabled in user settings
    const animEnabled = profile.settings?.appearance?.animationsEnabled !== false;
    if (!animEnabled) return;

    // Entry staggers for settings structure
    gsap.fromTo('.settings-stagger-item', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    );

    // Tab content transition
    gsap.fromTo('.tab-content-panel',
      { opacity: 0, scale: 0.98, y: 5 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
    );
  }, [activeTab, loading]);

  // Calculate Profile Completion Percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.name, profile.username, profile.email, profile.phone, profile.bio,
      profile.college, profile.degree, profile.graduationYear, profile.portfolioUrl,
      profile.githubUrl, profile.linkedinUrl, profile.resumeUrl, profile.targetCompany,
      profile.targetRole, profile.skills?.length > 0
    ];
    const filled = fields.filter(val => !!val).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Calculate Account Health Score
  const calculateHealthScore = () => {
    if (!profile) return 50;
    let score = 50;
    if (profile.settings?.privacySecurity?.twoFactorAuth) score += 20;
    if (profile.phone) score += 10;
    if (profile.githubUrl) score += 10;
    if (calculateCompletion() > 80) score += 10;
    return score;
  };

  // Settings Save Handler
  const handleSave = async (updatedFields) => {
    try {
      const { data } = await updateSettings(updatedFields);
      setProfile(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event('theme-changed'));
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  // Nested settings update helper
  const handleNestedSave = async (category, fields) => {
    const updatedSettings = {
      settings: {
        ...profile.settings,
        [category]: {
          ...profile.settings?.[category],
          ...fields
        }
      }
    };
    await handleSave(updatedSettings);
  };

  // Change password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  // Resume Upload simulation
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingResume(true);
    setResumeProgress(0);

    const interval = setInterval(() => {
      setResumeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingResume(false);
          // Save mock resume URL
          handleSave({ resumeUrl: `https://storage.interviewx.ai/resumes/${file.name}` });
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
          <Navbar subtitle="Loading preferences..." />
          <main className="flex-1 overflow-y-auto p-8 text-white flex items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400">Loading Control Center...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-screen bg-slate-950 overflow-hidden text-white font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="User Control Center" />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-950/80">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header / Dashboard Panel */}
            <div className="settings-stagger-item glass-card rounded-3xl p-6 border border-slate-800/80 bg-slate-900/30 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
              
              {/* Profile Main */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg overflow-hidden border border-indigo-400/30">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0)
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {profile.name}
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Premium AI</span>
                  </h2>
                  <p className="text-xs text-slate-400">@{profile.username || 'user'} • {profile.email}</p>
                  <p className="text-xs text-indigo-400 mt-1">{profile.targetRole || 'Software Engineer'}</p>
                </div>
              </div>

              {/* Stats Indicators */}
              <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                {/* Profile Completion */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 flex-1 lg:flex-none min-w-[130px]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Profile Completion</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${calculateCompletion()}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">{calculateCompletion()}%</span>
                  </div>
                </div>

                {/* Health Score */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 flex-1 lg:flex-none min-w-[110px]">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Account Health</p>
                  <p className="text-lg font-extrabold text-green-400 mt-0.5">{calculateHealthScore()}<span className="text-xs text-slate-500">/100</span></p>
                </div>

                {/* Streaks */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-3 flex gap-4 flex-1 lg:flex-none">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <FaFire className="text-orange-500" /> Streaks
                    </p>
                    <div className="flex gap-3 mt-1 text-xs font-bold">
                      <span className="text-orange-400">🔥 12d Coding</span>
                      <span className="text-indigo-400">🎯 5d Mock</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* Category Nav - Left Panel */}
              <div className="settings-stagger-item lg:col-span-1 space-y-4">
                <div className="glass-card rounded-3xl p-4 border border-slate-800/80 bg-slate-900/20 space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase px-3 mb-2 tracking-wider">Control Panel</p>
                  
                  {[
                    { id: 'general', label: 'General', icon: FaGlobe },
                    { id: 'profile', label: 'Profile', icon: FaUser },
                    { id: 'account', label: 'Account', icon: FaUserCog },
                    { id: 'appearance', label: 'Appearance', icon: FaPalette },
                    { id: 'ai', label: 'AI Preferences', icon: FaBrain },
                    { id: 'interview', label: 'Interview Settings', icon: FaVideo },
                    { id: 'coding', label: 'Coding Settings', icon: FaCode },
                    { id: 'notifications', label: 'Notifications', icon: FaBell },
                    { id: 'security', label: 'Privacy & Security', icon: FaShieldAlt },
                    { id: 'integrations', label: 'Integrations', icon: FaPlug },
                    { id: 'subscription', label: 'Subscription', icon: FaCreditCard },
                    { id: 'storage', label: 'Data & Storage', icon: FaDatabase },
                    { id: 'advanced', label: 'Advanced', icon: FaCogs },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all duration-200 border group ${
                          isActive 
                            ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-md shadow-indigo-950/20' 
                            : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 hover:border-slate-800'
                        }`}
                      >
                        <Icon className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Panel / Details Card - Right Panel */}
              <div className="settings-stagger-item lg:col-span-3">
                <div className="tab-content-panel glass-card rounded-3xl p-8 border border-slate-800/80 bg-slate-900/10 shadow-2xl backdrop-blur-md">
                  
                  {/* General Tab */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">General Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Target Stats */}
                        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                          <h4 className="font-bold text-slate-300">Target Career Focus</h4>
                          <div>
                            <p className="text-xs text-slate-500">Target Role</p>
                            <p className="font-medium text-white">{profile.targetRole || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Target Company</p>
                            <p className="font-medium text-white">{profile.targetCompany || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Interview Goal</p>
                            <p className="font-medium text-indigo-400">"{profile.interviewGoal || 'Not specified'}"</p>
                          </div>
                        </div>

                        {/* Recent Timeline */}
                        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                          <h4 className="font-bold text-slate-300">Recent Activity Timeline</h4>
                          <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                            <div className="relative pl-6">
                              <span className="absolute left-0 top-1.5 w-4.5 h-4.5 bg-indigo-500/20 border-2 border-indigo-500 rounded-full flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                              </span>
                              <p className="text-xs font-semibold">Generated React Learning Roadmap</p>
                              <p className="text-[10px] text-slate-500">2 hours ago</p>
                            </div>
                            <div className="relative pl-6">
                              <span className="absolute left-0 top-1.5 w-4.5 h-4.5 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              </span>
                              <p className="text-xs font-semibold">Completed Java Interview (Score: 82%)</p>
                              <p className="text-[10px] text-slate-500">Yesterday</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Achievements Badges */}
                      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
                        <h4 className="font-bold text-slate-300">Badges & Achievements</h4>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { name: 'Mock Master', icon: '🎯', desc: '5+ Completed Mock Interviews' },
                            { name: 'Code Wizard', icon: '⚡', desc: '12-day coding streak active' },
                            { name: 'FAANG Hunter', icon: '🏆', desc: 'Targeting top tech companies' },
                            { name: 'Elite Member', icon: '💎', desc: 'Premium subscriber status' },
                          ].map(badge => (
                            <div key={badge.name} className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-xl text-xs hover:border-indigo-500/40 transition-colors cursor-default">
                              <span className="text-lg">{badge.icon}</span>
                              <div>
                                <p className="font-semibold text-slate-200">{badge.name}</p>
                                <p className="text-[9px] text-slate-500">{badge.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-300 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={() => setActiveTab('interview')} className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-colors">
                            Continue Last Interview
                          </button>
                          <button onClick={() => setActiveTab('coding')} className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-colors">
                            Continue Coding Settings
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Professional Profile</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Full Name</label>
                          <input 
                            type="text" 
                            defaultValue={profile.name}
                            onBlur={(e) => handleSave({ name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Username</label>
                          <input 
                            type="text" 
                            defaultValue={profile.username}
                            placeholder="e.g. janesmith"
                            onBlur={(e) => handleSave({ username: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">College / University</label>
                          <input 
                            type="text" 
                            defaultValue={profile.college}
                            placeholder="e.g. Stanford University"
                            onBlur={(e) => handleSave({ college: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Degree</label>
                            <input 
                              type="text" 
                              defaultValue={profile.degree}
                              placeholder="e.g. B.S. CS"
                              onBlur={(e) => handleSave({ degree: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Graduation Year</label>
                            <input 
                              type="text" 
                              defaultValue={profile.graduationYear}
                              placeholder="e.g. 2026"
                              onBlur={(e) => handleSave({ graduationYear: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Short Bio</label>
                        <textarea 
                          rows="3"
                          defaultValue={profile.bio}
                          placeholder="Tell us about yourself..."
                          onBlur={(e) => handleSave({ bio: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none resize-none"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Target Company</label>
                          <input 
                            type="text" 
                            defaultValue={profile.targetCompany}
                            placeholder="e.g. Google, Amazon"
                            onBlur={(e) => handleSave({ targetCompany: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Target Role</label>
                          <input 
                            type="text" 
                            defaultValue={profile.targetRole}
                            placeholder="e.g. Frontend SDE"
                            onBlur={(e) => handleSave({ targetRole: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Portfolio Website</label>
                          <input 
                            type="url" 
                            defaultValue={profile.portfolioUrl}
                            placeholder="https://..."
                            onBlur={(e) => handleSave({ portfolioUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">GitHub URL</label>
                          <input 
                            type="url" 
                            defaultValue={profile.githubUrl}
                            placeholder="https://github.com/..."
                            onBlur={(e) => handleSave({ githubUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">LinkedIn URL</label>
                          <input 
                            type="url" 
                            defaultValue={profile.linkedinUrl}
                            placeholder="https://linkedin.com/in/..."
                            onBlur={(e) => handleSave({ linkedinUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Resume Upload Box */}
                      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h4 className="font-bold text-slate-300">Resume Upload</h4>
                        {profile.resumeUrl ? (
                          <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                            <span className="text-xs text-indigo-400 font-semibold flex items-center gap-2">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              Resume uploaded successfully
                            </span>
                            <button onClick={() => handleSave({ resumeUrl: '' })} className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold">
                              <FaTrash /> Remove
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/50 rounded-2xl p-6 text-center transition-colors relative">
                            <input 
                              type="file" 
                              onChange={handleResumeUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept=".pdf,.doc,.docx"
                            />
                            <FaUpload className="mx-auto text-slate-500 text-2xl mb-2" />
                            <p className="text-xs font-semibold text-slate-300">Click or drag your PDF here to upload</p>
                            <p className="text-[10px] text-slate-500 mt-1">PDF, DOC up to 5MB</p>
                          </div>
                        )}
                        {uploadingResume && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span>Uploading...</span>
                              <span className="font-semibold text-indigo-400">{resumeProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${resumeProgress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Account Tab */}
                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Email Address</label>
                          <input 
                            type="email" 
                            defaultValue={profile.email}
                            onBlur={(e) => handleSave({ email: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Phone Number</label>
                          <input 
                            type="text" 
                            defaultValue={profile.phone}
                            placeholder="e.g. +1 555-0199"
                            onBlur={(e) => handleSave({ phone: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance Tab */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Appearance</h3>
                      
                      {/* Theme Selection */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Theme Mode</h4>
                        <div className="flex gap-4">
                          {[
                            { id: 'dark', label: 'Dark Mode', icon: FaMoon },
                            { id: 'light', label: 'Light Mode', icon: FaSun },
                            { id: 'system', label: 'System', icon: FaDesktop },
                          ].map(t => {
                            const Icon = t.icon;
                            const isSel = (profile.settings?.appearance?.themeMode || 'dark') === t.id;
                            return (
                              <button
                                key={t.id}
                                onClick={() => handleNestedSave('appearance', { themeMode: t.id })}
                                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                                  isSel 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30' 
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900/40 hover:text-white'
                                }`}
                              >
                                <Icon />
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Accent Color */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300">Accent Color</h4>
                        <div className="flex gap-4">
                          {[
                            { color: '#6366f1', label: 'Indigo' },
                            { color: '#06b6d4', label: 'Cyan' },
                            { color: '#8b5cf6', label: 'Purple' },
                            { color: '#10b981', label: 'Emerald' }
                          ].map(colorOpt => {
                            const isSel = (profile.settings?.appearance?.accentColor || '#6366f1') === colorOpt.color;
                            return (
                              <button
                                key={colorOpt.color}
                                onClick={() => handleNestedSave('appearance', { accentColor: colorOpt.color })}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                                  isSel 
                                    ? 'border-white text-white' 
                                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                                style={{ backgroundColor: isSel ? `${colorOpt.color}20` : 'transparent' }}
                              >
                                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorOpt.color }}></span>
                                {colorOpt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
                        {/* Animations Enabled */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">Enable Animations</p>
                            <p className="text-[10px] text-slate-500">Smooth hover and stagger UI load</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('appearance', { animationsEnabled: !profile.settings?.appearance?.animationsEnabled })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.appearance?.animationsEnabled !== false ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.appearance?.animationsEnabled !== false ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>

                        {/* GSAP Effects */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">GSAP Physics Effects</p>
                            <p className="text-[10px] text-slate-500">Enable advanced GSAP timelines</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('appearance', { gsapEnabled: !profile.settings?.appearance?.gsapEnabled })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.appearance?.gsapEnabled !== false ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.appearance?.gsapEnabled !== false ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Preferences Tab */}
                  {activeTab === 'ai' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">AI Coach Preferences</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preferred Provider */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Preferred AI Provider</label>
                          <select 
                            value={profile.settings?.aiPreferences?.provider || 'Auto'}
                            onChange={(e) => handleNestedSave('aiPreferences', { provider: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="Auto">Auto (Load Balanced)</option>
                            <option value="OpenAI">OpenAI (GPT-4o)</option>
                            <option value="Gemini">Google Gemini 2.5</option>
                            <option value="Groq">Groq (Ultra-Fast Llama)</option>
                          </select>
                        </div>

                        {/* AI Mentor Personality */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Mentor Personality</label>
                          <select 
                            value={profile.settings?.aiPreferences?.mentorPersonality || 'Friendly Mentor'}
                            onChange={(e) => handleNestedSave('aiPreferences', { mentorPersonality: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="Friendly Mentor">Friendly Mentor (Encouraging)</option>
                            <option value="Strict Interviewer">Strict Interviewer (Critical feedback)</option>
                            <option value="FAANG Interviewer">FAANG Interviewer (Algorithmic excellence)</option>
                            <option value="HR Recruiter">HR Recruiter (Behavioral expert)</option>
                          </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Interview Difficulty</label>
                          <select 
                            value={profile.settings?.aiPreferences?.difficulty || 'Medium'}
                            onChange={(e) => handleNestedSave('aiPreferences', { difficulty: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard (FAANG standard)</option>
                            <option value="Adaptive">Adaptive (Dynamic scaling)</option>
                          </select>
                        </div>

                        {/* Response Length */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">AI Response Length</label>
                          <select 
                            value={profile.settings?.aiPreferences?.responseLength || 'Medium'}
                            onChange={(e) => handleNestedSave('aiPreferences', { responseLength: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="Short">Short (Bullet points)</option>
                            <option value="Medium">Medium (Balanced)</option>
                            <option value="Detailed">Detailed (In-depth analysis)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interview Settings Tab */}
                  {activeTab === 'interview' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Interview Environment</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Duration */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Default Interview Duration</label>
                          <select 
                            value={profile.settings?.interviewSettings?.duration || 30}
                            onChange={(e) => handleNestedSave('interviewSettings', { duration: parseInt(e.target.value, 10) })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="15">15 Minutes</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes</option>
                          </select>
                        </div>

                        {/* Camera Toggle */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">Enable Camera Feed</p>
                            <p className="text-[10px] text-slate-500">Uses AI to monitor eye contact & posture</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('interviewSettings', { enableCamera: !profile.settings?.interviewSettings?.enableCamera })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.interviewSettings?.enableCamera ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.interviewSettings?.enableCamera ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>

                        {/* Microphone Toggle */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">Enable Microphone</p>
                            <p className="text-[10px] text-slate-500">Record audio answers for mock sessions</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('interviewSettings', { enableMicrophone: !profile.settings?.interviewSettings?.enableMicrophone })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.interviewSettings?.enableMicrophone !== false ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.interviewSettings?.enableMicrophone !== false ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>

                        {/* Real Company Mode */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">Real Company Mode</p>
                            <p className="text-[10px] text-slate-500">Locks search tab and blocks pauses</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('interviewSettings', { realCompanyMode: !profile.settings?.interviewSettings?.realCompanyMode })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.interviewSettings?.realCompanyMode ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.interviewSettings?.realCompanyMode ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coding Settings Tab */}
                  {activeTab === 'coding' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Coding Environment (IDE)</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Default Language */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Default Programming Language</label>
                          <select 
                            value={profile.settings?.codingSettings?.defaultLanguage || 'JavaScript'}
                            onChange={(e) => handleNestedSave('codingSettings', { defaultLanguage: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="JavaScript">JavaScript</option>
                            <option value="Python">Python</option>
                            <option value="Java">Java</option>
                            <option value="C++">C++</option>
                          </select>
                        </div>

                        {/* Editor Theme */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Monaco Editor Theme</label>
                          <select 
                            value={profile.settings?.codingSettings?.editorTheme || 'vs-dark'}
                            onChange={(e) => handleNestedSave('codingSettings', { editorTheme: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="vs-dark">VS Dark (Default)</option>
                            <option value="light">Light</option>
                            <option value="ocean-blue">Ocean Blue (Premium)</option>
                          </select>
                        </div>

                        {/* Editor Font Size */}
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">IDE Font Size</label>
                          <select 
                            value={profile.settings?.codingSettings?.fontSize || 14}
                            onChange={(e) => handleNestedSave('codingSettings', { fontSize: parseInt(e.target.value, 10) })}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                          >
                            <option value="12">12px</option>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                          </select>
                        </div>

                        {/* Vim Mode */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold">Enable Vim Keybindings</p>
                            <p className="text-[10px] text-slate-500">Vim shortcuts inside the coding IDE</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('codingSettings', { vimMode: !profile.settings?.codingSettings?.vimMode })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.codingSettings?.vimMode ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.codingSettings?.vimMode ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Tab */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        {[
                          { id: 'email', label: 'Email Notifications', desc: 'Get updates on your registered email address' },
                          { id: 'push', label: 'Push Notifications', desc: 'Browser notifications for immediate tasks' },
                          { id: 'reminders', label: 'Interview Reminders', desc: 'Reminders 15 minutes before scheduled session' },
                          { id: 'dailyReminder', label: 'Daily Study Reminders', desc: 'Daily encouragement alerts to keep your streaks alive' },
                        ].map(notif => (
                          <div key={notif.id} className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                            <div>
                              <p className="text-sm font-semibold">{notif.label}</p>
                              <p className="text-[10px] text-slate-500">{notif.desc}</p>
                            </div>
                            <button 
                              onClick={() => handleNestedSave('notifications', { [notif.id]: !profile.settings?.notifications?.[notif.id] })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.notifications?.[notif.id] !== false ? 'bg-indigo-500' : 'bg-slate-800'}`}
                            >
                              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.notifications?.[notif.id] !== false ? 'translate-x-6' : ''}`}></span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Privacy & Security Tab */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Security & Auth</h3>
                      
                      {/* Password Change Form */}
                      <form onSubmit={handlePasswordChange} className="space-y-4 bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl">
                        <h4 className="font-bold text-slate-300">Change Password</h4>
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Current Password</label>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" 
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">New Password</label>
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-400 font-semibold mb-2 uppercase">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={confirmPassword}
                              onChange={e => setConfirmPassword(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-805 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" 
                              required 
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-900/20">
                            Update Password
                          </button>
                        </div>
                      </form>

                      {/* Active Devices */}
                      <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-300">Active Devices</h4>
                          <button className="text-xs text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                            <FaSync /> Revoke All
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold">Chrome Windows 11 (Current)</p>
                              <p className="text-[10px] text-slate-500">Active now • New Delhi, India</p>
                            </div>
                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">This Device</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Integrations Tab */}
                  {activeTab === 'integrations' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Integrations</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { name: 'GitHub', desc: 'Link repositories & code contributions', connected: true },
                          { name: 'LinkedIn', desc: 'Sync professional timeline & target company info', connected: false },
                          { name: 'Google Calendar', desc: 'Sync interview timelines to personal calendar', connected: false },
                          { name: 'Google Drive', desc: 'Automate resume updates and PDF export', connected: false }
                        ].map(int => (
                          <div key={int.name} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex justify-between items-center hover:border-indigo-500/20 transition-all">
                            <div>
                              <h4 className="font-bold text-sm">{int.name}</h4>
                              <p className="text-[10px] text-slate-500 mt-1">{int.desc}</p>
                            </div>
                            <button className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                              int.connected 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' 
                                : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20'
                            }`}>
                              {int.connected ? 'Connected' : 'Connect'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subscription Tab */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Subscription Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Current Plan</p>
                          <p className="text-2xl font-extrabold text-indigo-400">Pro Trial</p>
                          <p className="text-[10px] text-slate-500">Renews on August 12, 2026</p>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">AI Credits</p>
                          <p className="text-2xl font-extrabold text-white">45 <span className="text-xs text-slate-500">/ 50 remaining</span></p>
                        </div>
                        <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-2">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">API Usage</p>
                          <p className="text-2xl font-extrabold text-emerald-400">92% <span className="text-xs text-slate-500">efficiency</span></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data & Storage Tab */}
                  {activeTab === 'storage' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Data & Personal Storage</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { title: 'Download Performance Reports', action: 'Download JSON' },
                          { title: 'Export Generated Roadmaps', action: 'Export CSV' },
                          { title: 'Download Interview Audio Recordings', action: 'Request Audio' },
                          { title: 'Clear Chat History Cache', action: 'Wipe Cache', danger: true },
                        ].map(item => (
                          <div key={item.title} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                            <button className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                              item.danger 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20' 
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}>
                              {item.action}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advanced Tab */}
                  {activeTab === 'advanced' && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold border-b border-slate-800 pb-3">Advanced Developer Panel</h3>
                      
                      <div className="space-y-4">
                        {/* Developer Mode */}
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-4 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <FaTerminal className="text-slate-500" />
                              Developer Mode
                            </p>
                            <p className="text-[10px] text-slate-500">Exposes debugging consoles and prompt outputs</p>
                          </div>
                          <button 
                            onClick={() => handleNestedSave('advanced', { devMode: !profile.settings?.advanced?.devMode })}
                            className={`w-12 h-6 rounded-full relative transition-colors ${profile.settings?.advanced?.devMode ? 'bg-indigo-500' : 'bg-slate-800'}`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.advanced?.devMode ? 'translate-x-6' : ''}`}></span>
                          </button>
                        </div>

                        {/* Restore Defaults */}
                        <div className="bg-red-950/20 border border-red-900/30 p-5 rounded-2xl flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
                              <FaExclamationTriangle /> Danger Zone: Factory Reset
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-1">Permanently restores all interview preferences and settings to default values</p>
                          </div>
                          <button className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 rounded-xl text-xs font-bold transition-all">
                            Restore Defaults
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Floating Quick Settings Icon */}
      <button 
        onClick={() => setShowQuickSettings(!showQuickSettings)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 border border-indigo-400/40"
      >
        <FaCog className={`text-xl transition-transform duration-500 ${showQuickSettings ? 'rotate-90' : 'animate-spin-slow'}`} />
      </button>

      {/* Floating Panel Overlay */}
      {showQuickSettings && (
        <div className="fixed bottom-24 right-6 w-80 glass-card bg-slate-900/90 border border-slate-850 rounded-3xl p-6 shadow-2xl z-50 animate-fade-in space-y-4 backdrop-blur-lg">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h4 className="font-bold text-sm text-indigo-400">Quick Preferences</h4>
            <span className="text-[10px] text-slate-500">Instant toggle</span>
          </div>

          {/* Theme select */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Quick Theme</p>
            <div className="flex gap-2">
              {[
                { id: 'dark', label: 'Dark', icon: FaMoon },
                { id: 'light', label: 'Light', icon: FaSun }
              ].map(t => {
                const Icon = t.icon;
                const isSel = (profile.settings?.appearance?.themeMode || 'dark') === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleNestedSave('appearance', { themeMode: t.id })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSel 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                        : 'bg-slate-950 border-slate-850 text-slate-400'
                    }`}
                  >
                    <Icon className="text-[10px]" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred AI Model */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">AI Coach Model</p>
            <select 
              value={profile.settings?.aiPreferences?.model || 'gemini-2.5-flash'}
              onChange={(e) => handleNestedSave('aiPreferences', { model: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gpt-4o">GPT-4o (OpenAI)</option>
              <option value="llama-3.1-8b-instant">Groq Llama 3.1</option>
            </select>
          </div>

          {/* Language select */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">IDE Language</p>
            <select 
              value={profile.settings?.codingSettings?.defaultLanguage || 'JavaScript'}
              onChange={(e) => handleNestedSave('codingSettings', { defaultLanguage: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
            </select>
          </div>

          {/* Notifications toggler */}
          <div className="flex justify-between items-center bg-slate-950/60 p-2.5 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Alert Notifications</span>
            <button 
              onClick={() => handleNestedSave('notifications', { email: !profile.settings?.notifications?.email })}
              className={`w-10 h-5 rounded-full relative transition-colors ${profile.settings?.notifications?.email !== false ? 'bg-indigo-500' : 'bg-slate-800'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.notifications?.email !== false ? 'translate-x-5' : ''}`}></span>
            </button>
          </div>

          {/* Sidebar Collapse Toggle */}
          <div className="flex justify-between items-center bg-slate-950/60 p-2.5 border border-slate-850 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Collapse Sidebar</span>
            <button 
              onClick={() => handleNestedSave('appearance', { sidebarCollapse: !profile.settings?.appearance?.sidebarCollapse })}
              className={`w-10 h-5 rounded-full relative transition-colors ${profile.settings?.appearance?.sidebarCollapse ? 'bg-indigo-500' : 'bg-slate-800'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${profile.settings?.appearance?.sidebarCollapse ? 'translate-x-5' : ''}`}></span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
