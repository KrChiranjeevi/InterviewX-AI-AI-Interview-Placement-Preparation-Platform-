import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Sparkles, User, LogOut, Settings, CreditCard,
  Award, Clock, Flame, Search, X, Mic, ChevronDown,
  Trophy, FileText, Map, BarChart3, CheckCircle2,
  AlertCircle, Zap, Command, Moon, Sun, Menu
} from 'lucide-react';

// SEARCH_SUGGESTIONS etc. (lines 12-83 are kept unchanged)

const SEARCH_SUGGESTIONS = [
  { icon: Mic,       label: 'Start a mock interview',     hint: 'AI Powered', to: '/interview/setup' },
  { icon: FileText,  label: 'Analyze my resume',          hint: 'Instant', to: '/resume' },
  { icon: BarChart3, label: 'View recent reports',        hint: 'Analytics', to: '/reports' },
  { icon: Map,       label: 'Explore career roadmap',     hint: 'Guided', to: '/roadmap' },
  { icon: Trophy,    label: 'Check my achievements',      hint: 'Gamified', to: '/profile' },
];

const NOTIFICATIONS = [
  { id: 1, type: 'achievement', icon: Trophy,       color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'New Achievement Unlocked!',    body: 'You earned the "Fast Learner" badge.',      time: '2m ago',  unread: true },
  { id: 2, type: 'report',      icon: BarChart3,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   title: 'Weekly Report Ready',           body: 'Your performance summary is now available.', time: '1h ago',  unread: true },
  { id: 3, type: 'ai',          icon: Sparkles,     color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'AI Recommendation',             body: 'Practice System Design today to boost score.', time: '3h ago', unread: true },
  { id: 4, type: 'interview',   icon: Mic,          color: 'text-pink-400',   bg: 'bg-pink-500/10',   title: 'Interview Scheduled',           body: 'Frontend Engineer mock at 5:00 PM today.',  time: '5h ago',  unread: false },
  { id: 5, type: 'challenge',   icon: Zap,          color: 'text-emerald-400',bg: 'bg-emerald-500/10',title: 'Daily Challenge Available',     body: 'Solve 3 LeetCode problems for +150 XP.',    time: '8h ago',  unread: false },
];

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(); };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

const Navbar = ({ title, subtitle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showNotif, setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch]  = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDarkMode]);

  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  useClickOutside(notifRef,   () => setShowNotif(false));
  useClickOutside(profileRef, () => setShowProfile(false));
  useClickOutside(searchRef,  () => setShowSearch(false));

  const unreadCount = notifications.filter(n => n.unread).length;
  const avatarUrl = user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const dismissNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good morning';
    if (h < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  return (
    <header className="sticky top-0 z-[100] h-16 w-full print:hidden">
      {/* Glass backdrop */}
      <div className="absolute inset-0 border-b border-white/[0.06] bg-[#070711]/80 backdrop-blur-2xl" />
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="relative z-10 flex h-full items-center justify-between px-6 gap-4">
        {/* LEFT — Title */}
        {/* LEFT — Title & Hamburger */}
        <div className="min-w-0 flex-shrink-0 flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
            className="flex md:hidden items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div>
            <h1 className="text-base font-semibold text-white truncate leading-tight">
              {title || `${getGreeting()}, ${user?.name?.split(' ')[0] || 'there'} 👋`}
            </h1>
            {subtitle && <p className="text-xs text-zinc-500 truncate">{subtitle}</p>}
          </div>
        </div>

        {/* CENTER — Universal Search */}
        <div ref={searchRef} className="relative hidden md:block max-w-md w-full flex-1 mx-4">
          <motion.div
            animate={{
              borderColor: showSearch ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)',
              boxShadow: showSearch ? '0 0 0 3px rgba(99,102,241,0.12), 0 0 30px rgba(99,102,241,0.15)' : 'none',
            }}
            className="flex items-center gap-2 rounded-xl border bg-white/[0.03] px-3 py-2 transition-colors cursor-text"
            onClick={() => { setShowSearch(true); }}
          >
            <Search className={`h-4 w-4 flex-shrink-0 transition-colors ${showSearch ? 'text-indigo-400' : 'text-zinc-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder="Search or ask AI anything..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none min-w-0"
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              {showSearch ? (
                <button onClick={e => { e.stopPropagation(); setShowSearch(false); setSearchQuery(''); }}>
                  <X className="h-4 w-4 text-zinc-500 hover:text-white" />
                </button>
              ) : (
                <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                  <Command className="h-2.5 w-2.5" /> K
                </kbd>
              )}
            </div>
          </motion.div>

          {/* Search Dropdown */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a14]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl z-[999]"
              >
                <div className="p-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    Quick Actions
                  </p>
                  {SEARCH_SUGGESTIONS
                    .filter(s => !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors group"
                          onClick={() => { 
                            setShowSearch(false); 
                            setSearchQuery('');
                            if (s.to) navigate(s.to);
                          }}
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 text-sm text-zinc-300 group-hover:text-white">{s.label}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">{s.hint}</span>
                        </motion.button>
                      );
                    })}
                </div>
                <div className="border-t border-white/[0.06] px-3 py-2 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
                  <span className="text-xs text-zinc-500">Powered by <span className="text-purple-400 font-medium">InterviewX AI</span></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.07] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>

          {/* Quick Interview Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/interview/setup')}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-shadow"
          >
            <Mic className="h-3.5 w-3.5" />
            <span>Interview</span>
          </motion.button>

          {/* Separator */}
          <div className="h-6 w-px bg-white/10" />

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${showNotif ? 'bg-indigo-500/15 text-indigo-400' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`}
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />
                  <span className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    {unreadCount}
                  </span>
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-96 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a14]/97 shadow-2xl shadow-black/60 backdrop-blur-2xl origin-top-right z-[999]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {notifications.map((n, i) => {
                      const Icon = n.icon;
                      return (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group relative flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.04] cursor-pointer ${n.unread ? 'bg-white/[0.02]' : ''}`}
                        >
                          {n.unread && <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-500" />}
                          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${n.bg}`}>
                            <Icon className={`h-4 w-4 ${n.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${n.unread ? 'text-white' : 'text-zinc-300'}`}>{n.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{n.body}</p>
                            <p className="flex items-center gap-1 text-[10px] text-zinc-600 mt-1">
                              <Clock className="h-2.5 w-2.5" /> {n.time}
                            </p>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); dismissNotif(n.id); }}
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-zinc-600 hover:text-white transition-all"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] py-1 pl-1 pr-2 hover:border-white/15 hover:bg-white/[0.06] transition-all"
            >
              <div className="relative">
                <img src={avatarUrl} alt="avatar" className="h-7 w-7 rounded-lg object-cover" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-[#070711]" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-white max-w-[80px] truncate">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a14]/97 shadow-2xl shadow-black/60 backdrop-blur-2xl origin-top-right z-[999]"
                >
                  {/* Profile Header */}
                  <div className="relative overflow-hidden p-4 border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5" />
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <img src={avatarUrl} alt="avatar" className="h-12 w-12 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                        <div className="absolute inset-0 rounded-xl ring-2 ring-indigo-400/20 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user?.name || 'Candidate'}</p>
                        <p className="text-xs text-zinc-400">{user?.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">PRO</span>
                          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">Level 12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    {[
                      { icon: User,      label: 'My Profile',       path: '/profile' },
                      { icon: Trophy,    label: 'Achievements',      path: '/profile' },
                      { icon: FileText,  label: 'Resume',           path: '/resume' },
                      { icon: BarChart3, label: 'Interview History', path: '/reports' },
                      { icon: Map,       label: 'Roadmap',          path: '/roadmap' },
                      { icon: CreditCard,label: 'Billing & Plans',  path: '/settings', badge: 'PRO' },
                      { icon: Settings,  label: 'Settings',         path: '/settings' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={i}
                          to={item.path}
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
                        >
                          <Icon className="h-4 w-4 text-zinc-500" />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t border-white/[0.06] p-2">
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
