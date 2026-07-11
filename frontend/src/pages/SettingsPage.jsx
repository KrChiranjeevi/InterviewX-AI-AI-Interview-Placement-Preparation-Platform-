import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { updateSettings, changePassword } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('dark');

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

  const handleSettingsUpdate = async (type, value) => {
    try {
      if (type === 'theme') {
        setTheme(value);
        await updateSettings({ theme: value });
      } else if (type === 'notifications') {
        setNotifications(value);
        await updateSettings({ notificationsEnabled: value });
      }
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Manage your account preferences" />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar text-white">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Preferences */}
              <div className="md:col-span-1 space-y-6">
                <div className="glass-card rounded-3xl p-6 border border-slate-800">
                  <h3 className="text-lg font-bold mb-4">Preferences</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-3">Theme</p>
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleSettingsUpdate('theme', 'dark')}
                          className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                          Dark
                        </button>
                        <button 
                          onClick={() => handleSettingsUpdate('theme', 'light')}
                          className={`flex-1 py-2 px-3 rounded-lg border font-medium text-sm flex items-center justify-center transition-colors ${theme === 'light' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                          Light
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-3">Notifications</p>
                      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div>
                          <p className="font-medium">In-app Alerts</p>
                          <p className="text-xs text-slate-500">Receive reports and updates</p>
                        </div>
                        <button 
                          onClick={() => handleSettingsUpdate('notifications', !notifications)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-indigo-500' : 'bg-slate-700'}`}
                        >
                          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : ''}`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security */}
              <div className="md:col-span-2">
                <div className="glass-card rounded-3xl p-8 border border-slate-800">
                  <h3 className="text-xl font-bold mb-6">Security</h3>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
                
                <div className="mt-8 glass-card rounded-3xl p-8 border border-red-900/30 bg-red-900/10">
                  <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                  <p className="text-slate-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="px-4 py-2 border border-red-500/50 text-red-400 font-medium rounded-lg hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
