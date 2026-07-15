import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';


import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { FaSearch, FaChevronRight, FaFire, FaCode, FaTrophy, FaLock } from 'react-icons/fa';
import { Terminal, Zap, Target, Code2, CheckCircle2, TrendingUp, ChevronRight } from 'lucide-react';
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const progress = getProgress();

  const categoryStats = useMemo(() => {
    return CATEGORIES.map(cat => {
      const counts = getDifficultyCounts(cat.id);
      const solved = Object.keys(progress).filter(id => id.startsWith(cat.id + '-') && progress[id]).length;
      return { ...cat, ...counts, solved };
    });
  }, []);

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

            {/* Stats Row */}
            <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Questions', value: totalQ,      icon: Code2,       color: 'from-indigo-500 to-purple-600',  glow: 'rgba(99,102,241,0.3)' },
                { label: 'Solved',          value: totalSolved, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500',  glow: 'rgba(16,185,129,0.3)' },
                { label: 'Categories',      value: CATEGORIES.length, icon: Target, color: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.3)' },
                { label: 'Accuracy',        value: totalSolved > 0 ? `${Math.round((totalSolved / totalQ) * 100)}%` : '0%', icon: TrendingUp, color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.3)' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={i} variants={fadeUp} whileHover={{ y: -4, scale: 1.02 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-sm">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity bg-gradient-to-br" style={{ background: s.glow }} />
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`} style={{ boxShadow: `0 4px 12px ${s.glow}` }}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-white">
                      {typeof s.value === 'number' ? <AnimCounter to={s.value} /> : s.value}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Overall progress bar */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-2"><Zap className="h-4 w-4 text-emerald-400" />Overall Progress</span>
                <span className="text-sm font-bold text-emerald-400">{totalSolved}/{totalQ} Solved ({totalQ > 0 ? Math.round((totalSolved/totalQ)*100) : 0}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalQ > 0 ? (totalSolved/totalQ)*100 : 0}%` }}
                  transition={{ duration: 1.5, ease: [0.16,1,0.3,1] }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 relative"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                </motion.div>
              </div>
            </motion.div>

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
                const isAssessment = ['aptitude', 'quant', 'reasoning', 'verbal'].includes(cat.id);
                const href = isAssessment ? `/assessment/${cat.id}` : `/coding/${cat.id}`;

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

                      {/* CTA */}
                      <Link to={href} className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white bg-gradient-to-r ${cat.color} hover:opacity-90 transition-opacity shadow-lg group/btn`}>
                        Start Practice
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
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
