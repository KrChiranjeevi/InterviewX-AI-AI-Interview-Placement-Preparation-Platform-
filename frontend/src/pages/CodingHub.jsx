import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';


import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { FaSearch, FaChevronRight, FaFire, FaCode, FaTrophy, FaLock } from 'react-icons/fa';
import { Terminal, Zap, Target, Code2, CheckCircle2, TrendingUp, ChevronRight, Award, Flame, Trophy, Sparkles, Star } from 'lucide-react';
import { CATEGORIES, getDifficultyCounts, ALL_QUESTIONS } from '../data/questionBank';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };

// Load progress from localStorage (unchanged)
const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('coding_progress') || '{}'); } catch { return {}; }
};

const Blob = ({ cx, cy, color, r, delay = 0 }) => (
  <div
    className="pointer-events-none absolute rounded-full animate-blob opacity-60"
    style={{
      left: `${cx}%`, top: `${cy}%`, width: r, height: r,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      animationDelay: `${delay}s`
    }}
  />
);

// Animated counter
function AnimCounter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  useMemo(() => {
    let start = 0;
    const s = typeof to === 'number' ? to : 0;
    const step = s / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= s) { setVal(s); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [to]);
  return <>{typeof to === 'number' ? val : to}{suffix}</>;
}

const CodingHub = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [latestReportsSummary, setLatestReportsSummary] = useState({});
  const [profile, setProfile] = useState(null);
  const [codingStats, setCodingStats] = useState(null);
  const [metaCounts, setMetaCounts] = useState({});
  const progress = getProgress();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, profileRes, codingStatsRes, metaCountsRes] = await Promise.all([
          api.get('/assessments/attempts/latest-summary'),
          api.get('/profile'),
          api.get('/coding/stats').catch(() => ({ data: null })),
          api.get('/assessments/meta/question-counts').catch(() => ({ data: {} }))
        ]);
        setLatestReportsSummary(summaryRes.data);
        if (profileRes.data) setProfile(profileRes.data);
        if (codingStatsRes.data) setCodingStats(codingStatsRes.data);
        if (metaCountsRes.data) setMetaCounts(metaCountsRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const handleViewPreviousReport = async (catId) => {
    try {
      const res = await api.get(`/assessments/attempts/latest/${catId}`);
      navigate(`/assessment/report/${res.data._id}`);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error(`No previous attempt found for this module.`);
      } else {
        toast.error(`Error loading previous report.`);
      }
    }
  };

  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      let counts;
      if (cat.id === 'dsa') {
        counts = codingStats?.totals ? {
          Easy: codingStats.totals.Easy,
          Medium: codingStats.totals.Medium,
          Hard: codingStats.totals.Hard,
          total: codingStats.totals.Easy + codingStats.totals.Medium + codingStats.totals.Hard
        } : getDifficultyCounts(cat.id);
      } else {
        counts = metaCounts[cat.id] ? {
          Easy: metaCounts[cat.id].Easy || 0,
          Medium: metaCounts[cat.id].Medium || 0,
          Hard: metaCounts[cat.id].Hard || 0,
          total: metaCounts[cat.id].total || 0
        } : getDifficultyCounts(cat.id);
      }
      
      let solved = 0;
      if (cat.id === 'dsa') {
        solved = codingStats?.solved?.count || 0;
      } else {
        solved = Object.keys(progress).filter(id => id.startsWith(cat.id + '-') && progress[id]).length;
      }

      return { ...cat, ...counts, solved };
    });
  }, [codingStats, metaCounts, progress]);

  const filtered = categoryStats.filter(cat => {
    const matchSearch = cat.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'All') return matchSearch;
    if (filter === 'In Progress') return matchSearch && cat.solved > 0 && cat.solved < cat.total;
    if (filter === 'Completed')   return matchSearch && cat.solved === cat.total && cat.total > 0;
    if (filter === 'Not Started') return matchSearch && cat.solved === 0;
    return matchSearch;
  });

  const totalSolved = ALL_QUESTIONS.filter(q => progress[q.id]).length;
  const totalQ      = ALL_QUESTIONS.length;

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Blob cx={12} cy={15}  color="rgba(16,185,129,0.55)"  r={460} delay={0} />
        <Blob cx={88} cy={10}  color="rgba(99,102,241,0.4)"   r={360} delay={3} />
        <Blob cx={55} cy={82}  color="rgba(6,182,212,0.3)"    r={320} delay={6} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(16,185,129,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Coding Arena" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-16 pt-6">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300 text-xs font-semibold mb-2">
                <Terminal className="h-3.5 w-3.5" /> Coding Arena
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Master Coding. Ace Interviews.</h1>
              <p className="text-zinc-500 text-sm mt-1">Practice real interview problems across every topic. AI hints available.</p>
            </motion.div>

            {/* Dynamic Premium Dashboard Header */}
            {(() => {
              const scoresArray = Object.values(latestReportsSummary).map(s => s.score);
              const readinessIndex = scoresArray.length > 0 ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length) : 65;
              const userLevel = profile?.level || 1;
              const currentXp = profile?.xp || 120;
              const nextLevelXp = userLevel * 500;
              const xpPercent = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Left Panel: Profile Placement Intelligence */}
                  <motion.div 
                    variants={fadeUp} 
                    className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-md flex flex-col md:flex-row gap-6 items-center"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />
                    
                    {/* Dynamic Circle Readiness Indicator */}
                    <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/[0.04]" />
                        <motion.circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                          strokeDasharray={`${2 * Math.PI * 40}`} 
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - readinessIndex / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                          className="text-emerald-400" 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-white">{readinessIndex}%</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Readiness</span>
                      </div>
                    </div>

                    {/* Developer Info & XP progress */}
                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back, {profile?.username || 'Candidate'}!</h2>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Award className="h-3 w-3" /> Level {userLevel} Developer
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">Your profile readiness index is computed dynamically from completed MCQ Assessments.</p>
                      </div>

                      {/* XP Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-zinc-400">Experience Points (XP)</span>
                          <span className="text-indigo-400">{currentXp} / {nextLevelXp} XP ({xpPercent}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${xpPercent}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Panel: Streak and Contest Rating */}
                  <motion.div 
                    variants={fadeUp} 
                    className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-md flex flex-col justify-between gap-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                    
                    {/* Upper Stats details */}
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Placement Rating</span>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="h-4.5 w-4.5 text-amber-400" />
                          <span className="text-xl font-black text-white">
                            {1450 + (codingStats?.solved?.count || 0) * 12 + (profile?.streakCount || 0) * 5}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-0.5">Active Streak</span>
                        <div className="flex items-center justify-end gap-1">
                          <Flame className="h-5 w-5 text-orange-500 animate-bounce" />
                          <span className="text-xl font-black text-white">{profile?.streakCount || 0} Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Streak Weekly Visual Tracker */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Daily Active Tracker</span>
                      <div className="flex justify-between gap-1.5">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
                          const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
                          // Adjust Sunday index to 6, and Mon-Sat to 0-5
                          const adjustedToday = todayIndex === 0 ? 6 : todayIndex - 1;
                          
                          // Current day is highlighted or active if streak exists
                          const isActive = index <= adjustedToday && (profile?.streakCount || 0) > 0;
                          const isCurrent = index === adjustedToday;

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1.5">
                              <div className={`h-6 w-full rounded-md flex items-center justify-center text-[10px] font-black transition-all ${
                                isCurrent ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 
                                isActive ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                                'bg-white/[0.03] text-zinc-600 border border-white/[0.04]'
                              }`}>
                                {day}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()}

            {/* Search + Filter */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                <input
                  type="text"
                  placeholder="Search topics… (DSA, SQL, React, Python…)"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Not Started', 'In Progress', 'Completed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${filter === f ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'border border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.07]'}`}>{f}</button>
                ))}
              </div>
            </motion.div>

            {/* Category Cards */}
            <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((cat, i) => {
                const pct = cat.total > 0 ? Math.round((cat.solved / cat.total) * 100) : 0;
                const circumference = 2 * Math.PI * 20;
                const isCodingEnv = ['dsa'].includes(cat.id);
                const href = isCodingEnv ? `/coding/list/all` : `/assessment/${cat.id}`;

                return (
                  <motion.div
                    key={cat.id}
                    variants={fadeUp}
                    whileHover={{ y: -6, scale: 1.015 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm hover:border-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col"
                  >
                    {/* Top glow on hover */}
                    <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                    {/* Corner glow */}
                    <div className="absolute top-0 right-0 h-24 w-24 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />

                    <div className="relative z-10 p-5 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} className={`flex h-13 w-13 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-3xl shadow-lg`} style={{ height: 52, width: 52 }}>
                          {cat.icon}
                        </motion.div>
                        {/* Progress ring */}
                        <div className="relative h-12 w-12 flex-shrink-0">
                          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                            <motion.circle cx="24" cy="24" r="20" fill="none" stroke="url(#egrad)" strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
                              transition={{ duration: 1, delay: i * 0.05, ease: [0.16,1,0.3,1] }}
                            />
                            <defs>
                              <linearGradient id="egrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct}%</div>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-base mb-1 leading-tight">{cat.name}</h3>
                      <p className="text-zinc-500 text-xs leading-relaxed mb-3 flex-1">{cat.description}</p>

                      {/* Subtopics */}
                      {cat.subtopics?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {cat.subtopics.slice(0, 4).map(s => (
                            <span key={s} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500">{s}</span>
                          ))}
                          {cat.subtopics.length > 4 && <span className="text-[10px] text-zinc-600">+{cat.subtopics.length - 4} more</span>}
                        </div>
                      )}

                      {/* Difficulty breakdown */}
                      <div className="flex items-center gap-3 text-[11px] mb-3">
                        <span className="text-emerald-400 font-medium">Easy: {cat.Easy}</span>
                        <span className="text-amber-400 font-medium">Med: {cat.Medium}</span>
                        <span className="text-red-400 font-medium">Hard: {cat.Hard}</span>
                        <span className="text-zinc-600 ml-auto">{cat.solved}/{cat.total}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden mb-4">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.05, ease: [0.16,1,0.3,1] }}
                          className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                        />
                      </div>

                      {/* Last Attempt Info (Only for MCQ cards) */}
                      {!isCodingEnv && (
                        <div className="mb-4 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-[11px] space-y-1.5 backdrop-blur-md">
                          {latestReportsSummary[cat.id] ? (
                            <>
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>Last Attempt:</span>
                                <span className="font-bold text-white">
                                  {new Date(latestReportsSummary[cat.id].createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>Score:</span>
                                <span className={`font-bold ${latestReportsSummary[cat.id].score >= 80 ? 'text-emerald-400' : latestReportsSummary[cat.id].score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                  {latestReportsSummary[cat.id].score}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>Accuracy:</span>
                                <span className="font-bold text-white">
                                  {latestReportsSummary[cat.id].accuracy}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-zinc-400">
                                <span>Status:</span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${latestReportsSummary[cat.id].score >= 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {latestReportsSummary[cat.id].score >= 70 ? 'Pass' : 'Fail'}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-zinc-500 italic text-center py-1 font-medium">
                              No previous attempt
                            </div>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <Link to={href} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-r ${cat.color} hover:opacity-90 transition-opacity shadow-lg group/btn`}>
                        Start Practice
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      {/* Previous Test Result Button */}
                      {!isCodingEnv && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleViewPreviousReport(cat.id);
                          }}
                          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all w-full active:scale-95"
                        >
                          Previous Test Result
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {filtered.length === 0 && (
              <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
                <Terminal className="h-12 w-12 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm">No categories match your search.</p>
                <button onClick={() => { setSearch(''); setFilter('All'); }} className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Clear filters</button>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CodingHub;
