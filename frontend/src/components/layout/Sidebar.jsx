import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Mic, FileText, Code2, Building2,
  BarChart3, Map, Users2, Settings, ChevronRight,
  Zap, Flame, Trophy, Star, Brain, Bell, Sparkles,
  HardDrive, Database
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard',      color: 'from-violet-500 to-indigo-500',  glow: 'shadow-violet-500/30' },
  { path: '/interview/setup', icon: Mic,             label: 'Start Interview', color: 'from-pink-500 to-rose-500',     glow: 'shadow-pink-500/30',   badge: 'New' },
  { path: '/resume',          icon: FileText,         label: 'Resume Analyzer', color: 'from-blue-500 to-cyan-500',    glow: 'shadow-blue-500/30' },
  { path: '/coding',          icon: Code2,            label: 'Coding Round',    color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30' },
  { path: '/companies',       icon: Building2,        label: 'Company Prep',    color: 'from-orange-500 to-amber-500', glow: 'shadow-orange-500/30' },
  { path: '/reports',         icon: BarChart3,        label: 'Reports',         color: 'from-purple-500 to-violet-500',glow: 'shadow-purple-500/30' },
  { path: '/roadmap',         icon: Map,              label: 'Roadmap',         color: 'from-sky-500 to-blue-500',     glow: 'shadow-sky-500/30' },
  { path: '/community',       icon: Users2,           label: 'Community',       color: 'from-fuchsia-500 to-pink-500', glow: 'shadow-fuchsia-500/30', badge: '12' },
];

// Floating particle for sidebar
const SidebarParticle = ({ index }) => {
  const randomX = Math.random() * 200;
  const randomDelay = Math.random() * 4;
  const randomDuration = 6 + Math.random() * 6;
  return (
    <motion.div
      className="absolute w-0.5 h-0.5 rounded-full bg-indigo-400/40 pointer-events-none"
      style={{ left: randomX, bottom: -4 }}
      animate={{ y: [0, -300], opacity: [0, 0.8, 0] }}
      transition={{ duration: randomDuration, delay: randomDelay, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [mouseY, setMouseY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  const isSidebarExpanded = isMobile ? mobileOpen : expanded;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleToggle = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('toggle-sidebar', handleToggle);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (rect) setMouseY(e.clientY - rect.top);
  };

  // Build avatar URL
  const avatarUrl = user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <motion.aside
        ref={sidebarRef}
        onMouseEnter={() => !isMobile && setExpanded(true)}
        onMouseLeave={() => {
          if (!isMobile) {
            setExpanded(false);
            setHoveredIdx(null);
          }
        }}
        onMouseMove={handleMouseMove}
        animate={{ width: isMobile ? 260 : (isSidebarExpanded ? 260 : 72) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-zinc-200/50 dark:border-zinc-800 bg-white dark:bg-slate-950 select-none transition-transform duration-300 md:transition-none print:hidden
          ${isMobile ? (mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
        style={{ boxShadow: (isMobile && mobileOpen) || (!isMobile && isSidebarExpanded) ? '4px 0 60px rgba(99,102,241,0.12)' : '2px 0 20px rgba(0,0,0,0.4)' }}
      >
      {/* Ambient glow that follows mouse */}
      <motion.div
        className="pointer-events-none absolute left-0 w-full"
        animate={{ top: mouseY - 60, opacity: isSidebarExpanded ? 0.15 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ height: 120, background: 'radial-gradient(ellipse at left, rgba(99,102,241,0.6) 0%, transparent 70%)' }}
      />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => <SidebarParticle key={i} index={i} />)}
      </div>

      {/* Logo */}
      <Link to="/dashboard" className="flex h-16 flex-shrink-0 items-center px-4 cursor-pointer">
        <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/40">
          <Zap className="h-4 w-4 text-white" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-400/30 animate-ping" style={{ animationDuration: '3s' }} />
        </div>
        <AnimatePresence>
          {isSidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="ml-3 whitespace-nowrap"
            >
              <p className="text-base font-bold text-zinc-900 dark:text-white leading-none tracking-tight">InterviewX</p>
              <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 tracking-widest uppercase mt-0.5">AI Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 custom-scrollbar">
        {NAV_ITEMS.map((item, idx) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          const isHovered = hoveredIdx === idx;

          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex items-center rounded-xl outline-none"
            >
              {/* Animated BG */}
              <motion.div
                animate={{
                  opacity: isActive ? 1 : isHovered ? 0.7 : 0,
                  scaleX: isActive || isHovered ? 1 : 0.85,
                }}
                className={`absolute inset-0 rounded-xl ${isActive
                  ? 'bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20'
                  : 'bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/5'
                }`}
                transition={{ duration: 0.2 }}
              />

              {/* Left accent bar */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="navAccent"
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-gradient-to-b ${item.color}`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-center py-2.5 pr-3 pl-3">
                {/* Icon Container */}
                <motion.div
                  animate={{
                    scale: isHovered ? 1.12 : 1,
                    rotate: isHovered && !isActive ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-lg ${item.glow}`
                      : 'bg-zinc-100 dark:bg-white/5 group-hover:bg-zinc-200 dark:group-hover:bg-white/10'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`} />
                </motion.div>

                {/* Label & Badge */}
                <AnimatePresence>
                  {isSidebarExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -6, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, x: -6, width: 0 }}
                      className="ml-3 flex min-w-0 flex-1 items-center justify-between overflow-hidden"
                    >
                      <span className={`whitespace-nowrap text-sm font-medium ${isActive ? 'text-indigo-600 dark:text-white font-semibold' : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto flex-shrink-0 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/20"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tooltip when collapsed */}
              {!isSidebarExpanded && (
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -6, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.95 }}
                      className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-lg border border-zinc-200/50 dark:border-white/10 bg-white dark:bg-[#0f0f1a]/95 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white shadow-xl backdrop-blur-xl"
                    >
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 px-1.5 py-0.5 text-[10px] text-indigo-500 dark:text-indigo-300">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-2 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent" />

      {/* Settings */}
      <div className="flex-shrink-0 px-2 pb-4 pt-3">
        <Link
          to="/settings"
          className="group flex items-center rounded-xl p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <Settings className="h-5 w-5 flex-shrink-0 transition-transform group-hover:rotate-45" />
          <AnimatePresence>
            {isSidebarExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 overflow-hidden whitespace-nowrap text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>


    </motion.aside>
    </>
  );
};

export default Sidebar;
