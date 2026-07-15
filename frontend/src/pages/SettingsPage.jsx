import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';import { getProfile, updateSettings, changePassword } from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Globe, UserCog, Palette, Brain, Video, Code2,
  Bell, ShieldAlert, Plug, CreditCard, Database, Settings2,
  Flame, CheckCircle2, Upload, Trash2, Clock, Download,
  Moon, Sun, Monitor, TrendingUp, Key, Laptop,
  Terminal, RefreshCw, AlertTriangle, ShieldCheck
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } };

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  // Forms state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Custom mock states
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);

  const fetchUserData = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
    } catch (err) {
      toast.error('Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.name, profile.username, profile.email, profile.phone, profile.bio,
      profile.college, profile.degree, profile.graduationYear, profile.portfolioUrl,
      profile.githubUrl, profile.linkedinUrl, profile.resumeUrl, profile.targetCompany,
      profile.targetRole, profile.skills?.length > 0
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const calculateHealthScore = () => {
    if (!profile) return 50;
    let score = 50;
    if (profile.settings?.privacySecurity?.twoFactorAuth) score += 20;
    if (profile.phone) score += 10;
    if (profile.githubUrl) score += 10;
    if (calculateCompletion() > 80) score += 10;
    return score;
  };

  const handleSave = async (updatedFields) => {
    try {
      const { data } = await updateSettings(updatedFields);
      setProfile(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const handleNestedSave = async (category, fields) => {
    const updatedSettings = {
      settings: { ...profile.settings, [category]: { ...profile.settings?.[category], ...fields } }
    };
    await handleSave(updatedSettings);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

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
          handleSave({ resumeUrl: `https://storage.interviewx.ai/resumes/${file.name}` });
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500" />
      </div>
    );
  }

  const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: UserCog },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Preferences', icon: Brain },
    { id: 'interview', label: 'Interview', icon: Video },
    { id: 'coding', label: 'Coding IDE', icon: Code2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Settings2 },
  ];

  const ToggleSwitch = ({ checked, onChange }) => (
    <button onClick={onChange} className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-white/[0.05]'}`}>
      <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen">
        <Navbar subtitle="Settings & Preferences" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <main className="flex-1 overflow-y-auto no-scrollbar p-6">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-6">

            {/* Profile Header */}
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-md">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
              <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold shadow-lg shadow-indigo-500/20 border border-white/10 overflow-hidden">
                    {profile.profileImage ? <img src={profile.profileImage} alt="" className="h-full w-full object-cover" /> : profile.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      {profile.name}
                      <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">Premium</span>
                    </h2>
                    <p className="text-sm text-zinc-400">@{profile.username || 'user'} • {profile.email}</p>
                    <p className="mt-1 text-xs font-semibold text-indigo-400">{profile.targetRole || 'Software Engineer'}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 flex-1 md:flex-none">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Completion</p>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${calculateCompletion()}%` }} />
                      </div>
                      <span className="text-sm font-bold text-indigo-400">{calculateCompletion()}%</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3 flex-1 md:flex-none">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Health Score</p>
                    <p className="text-xl font-black text-emerald-400">{calculateHealthScore()}<span className="text-xs text-zinc-600">/100</span></p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Tabs */}
              <motion.div variants={fadeUp} className="lg:col-span-1 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-3 backdrop-blur-md h-fit sticky top-6">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Settings</p>
                <div className="flex flex-col gap-1">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${active ? 'bg-indigo-500/15 text-indigo-300' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'}`}>
                        <Icon className={`h-4 w-4 ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Main Content Area */}
              <motion.div variants={fadeUp} className="lg:col-span-3 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 md:p-8 backdrop-blur-md min-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8">
                    
                    {/* Header */}
                    <div className="border-b border-white/[0.05] pb-4">
                      <h3 className="text-xl font-bold text-white">{TABS.find(t => t.id === activeTab)?.label}</h3>
                    </div>

                    {/* GENERAL */}
                    {activeTab === 'general' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-5">
                          <h4 className="text-sm font-bold text-zinc-300">Target Career Focus</h4>
                          <div><p className="text-[10px] uppercase text-zinc-500">Target Role</p><p className="text-sm font-medium">{profile.targetRole || 'Not specified'}</p></div>
                          <div><p className="text-[10px] uppercase text-zinc-500">Target Company</p><p className="text-sm font-medium">{profile.targetCompany || 'Not specified'}</p></div>
                          <div><p className="text-[10px] uppercase text-zinc-500">Interview Goal</p><p className="text-sm font-medium text-indigo-400">"{profile.interviewGoal || 'Not specified'}"</p></div>
                        </div>
                        <div className="space-y-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-5">
                          <h4 className="text-sm font-bold text-zinc-300">Recent Activity</h4>
                          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                            <div className="relative pl-6">
                              <div className="absolute left-0.5 top-1 h-3 w-3 rounded-full border-2 border-[#070711] bg-indigo-500" />
                              <p className="text-xs font-semibold">Generated React Roadmap</p>
                              <p className="text-[10px] text-zinc-500">2 hours ago</p>
                            </div>
                            <div className="relative pl-6">
                              <div className="absolute left-0.5 top-1 h-3 w-3 rounded-full border-2 border-[#070711] bg-emerald-500" />
                              <p className="text-xs font-semibold">Completed Java Interview (Score: 82%)</p>
                              <p className="text-[10px] text-zinc-500">Yesterday</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROFILE */}
                    {activeTab === 'profile' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                            <input type="text" defaultValue={profile.name} onBlur={e => handleSave({ name: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Username</label>
                            <input type="text" defaultValue={profile.username} onBlur={e => handleSave({ username: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">College</label>
                            <input type="text" defaultValue={profile.college} onBlur={e => handleSave({ college: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Degree</label>
                              <input type="text" defaultValue={profile.degree} onBlur={e => handleSave({ degree: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Grad Year</label>
                              <input type="text" defaultValue={profile.graduationYear} onBlur={e => handleSave({ graduationYear: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Short Bio</label>
                          <textarea rows="3" defaultValue={profile.bio} onBlur={e => handleSave({ bio: e.target.value })} className="w-full resize-none rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {['PortfolioUrl', 'GithubUrl', 'LinkedinUrl'].map(field => (
                            <div key={field}>
                              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{field.replace('Url', ' URL')}</label>
                              <input type="url" defaultValue={profile[field.charAt(0).toLowerCase() + field.slice(1)]} onBlur={e => handleSave({ [field.charAt(0).toLowerCase() + field.slice(1)]: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ACCOUNT */}
                    {activeTab === 'account' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                          <input type="email" defaultValue={profile.email} onBlur={e => handleSave({ email: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phone Number</label>
                          <input type="text" defaultValue={profile.phone} onBlur={e => handleSave({ phone: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" />
                        </div>
                      </div>
                    )}

                    {/* APPEARANCE */}
                    {activeTab === 'appearance' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                            <div><p className="text-sm font-semibold">Enable Animations</p><p className="text-[10px] text-zinc-500">Smooth hover and layout effects</p></div>
                            <ToggleSwitch checked={profile.settings?.appearance?.animationsEnabled !== false} onChange={() => handleNestedSave('appearance', { animationsEnabled: !profile.settings?.appearance?.animationsEnabled })} />
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                            <div><p className="text-sm font-semibold">Sidebar Collapse</p><p className="text-[10px] text-zinc-500">Start with sidebar minimized</p></div>
                            <ToggleSwitch checked={profile.settings?.appearance?.sidebarCollapse} onChange={() => handleNestedSave('appearance', { sidebarCollapse: !profile.settings?.appearance?.sidebarCollapse })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI PREFERENCES */}
                    {activeTab === 'ai' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {['provider', 'mentorPersonality', 'difficulty', 'responseLength'].map(setting => (
                          <div key={setting}>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{setting.replace(/([A-Z])/g, ' $1')}</label>
                            <select value={profile.settings?.aiPreferences?.[setting] || ''} onChange={e => handleNestedSave('aiPreferences', { [setting]: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors">
                              {setting === 'provider' && <><option>Auto</option><option>OpenAI</option><option>Gemini</option></>}
                              {setting === 'mentorPersonality' && <><option>Friendly Mentor</option><option>Strict Interviewer</option></>}
                              {setting === 'difficulty' && <><option>Easy</option><option>Medium</option><option>Hard</option></>}
                              {setting === 'responseLength' && <><option>Short</option><option>Medium</option><option>Detailed</option></>}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* INTERVIEW */}
                    {activeTab === 'interview' && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                            <div><p className="text-sm font-semibold">Enable Camera Feed</p><p className="text-[10px] text-zinc-500">Uses AI to monitor eye contact</p></div>
                            <ToggleSwitch checked={profile.settings?.interviewSettings?.enableCamera} onChange={() => handleNestedSave('interviewSettings', { enableCamera: !profile.settings?.interviewSettings?.enableCamera })} />
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                            <div><p className="text-sm font-semibold">Voice Input Mode</p><p className="text-[10px] text-zinc-500">Use microphone during interviews</p></div>
                            <ToggleSwitch checked={profile.settings?.interviewSettings?.voiceInput} onChange={() => handleNestedSave('interviewSettings', { voiceInput: !profile.settings?.interviewSettings?.voiceInput })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CODING */}
                    {activeTab === 'coding' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Default Language</label>
                          <select value={profile.settings?.codingSettings?.defaultLanguage || 'JavaScript'} onChange={e => handleNestedSave('codingSettings', { defaultLanguage: e.target.value })} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors">
                            <option>JavaScript</option><option>Python</option><option>Java</option><option>C++</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 mt-5">
                          <div><p className="text-sm font-semibold">Vim Mode</p><p className="text-[10px] text-zinc-500">Enable Vim keybindings in IDE</p></div>
                          <ToggleSwitch checked={profile.settings?.codingSettings?.vimMode} onChange={() => handleNestedSave('codingSettings', { vimMode: !profile.settings?.codingSettings?.vimMode })} />
                        </div>
                      </div>
                    )}

                    {/* NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                      <div className="space-y-4">
                        {['email', 'push', 'reminders', 'dailyReminder'].map(notif => (
                          <div key={notif} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-4">
                            <div><p className="text-sm font-semibold capitalize">{notif.replace(/([A-Z])/g, ' $1')} Notifications</p></div>
                            <ToggleSwitch checked={profile.settings?.notifications?.[notif] !== false} onChange={() => handleNestedSave('notifications', { [notif]: !profile.settings?.notifications?.[notif] })} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SECURITY */}
                    {activeTab === 'security' && (
                      <div className="space-y-6">
                        <form onSubmit={handlePasswordChange} className="space-y-4 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-6">
                          <h4 className="text-sm font-bold text-zinc-300">Change Password</h4>
                          <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" required />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" required />
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors" required />
                          </div>
                          <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">Update Password</button>
                        </form>
                      </div>
                    )}

                    {/* ALL OTHER TABS (Integrations, Subscription, Storage, Advanced) */}
                    {['integrations', 'subscription', 'storage', 'advanced'].includes(activeTab) && (
                      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-8 text-center">
                        <Monitor className="mx-auto h-12 w-12 text-zinc-700 mb-4" />
                        <h4 className="text-sm font-bold text-zinc-300 mb-1">Coming Soon</h4>
                        <p className="text-xs text-zinc-500">This configuration area is currently under development.</p>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
