import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion } from 'framer-motion';
import { FaSearch, FaChevronRight, FaFire, FaCode, FaTrophy, FaLock } from 'react-icons/fa';
import { CATEGORIES, getDifficultyCounts, ALL_QUESTIONS } from '../data/questionBank';

// Load progress from localStorage
const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('coding_progress') || '{}'); } catch { return {}; }
};

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
    if (filter === 'Completed') return matchSearch && cat.solved === cat.total && cat.total > 0;
    if (filter === 'Not Started') return matchSearch && cat.solved === 0;
    return matchSearch;
  });

  const totalSolved = ALL_QUESTIONS.filter(q => progress[q.id]).length;
  const totalQ = ALL_QUESTIONS.length;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar title="Coding Practice Hub" subtitle="LeetCode-style AI-powered practice platform" />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Questions', value: totalQ, icon: <FaCode />, color: 'text-indigo-400' },
              { label: 'Solved', value: totalSolved, icon: <FaTrophy />, color: 'text-green-400' },
              { label: 'Categories', value: CATEGORIES.length, icon: <FaFire />, color: 'text-amber-400' },
              { label: 'Accuracy', value: totalSolved > 0 ? `${Math.round((totalSolved / totalQ) * 100)}%` : '0%', icon: <FaLock />, color: 'text-purple-400' },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className={`text-2xl ${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search topics... (DSA, SQL, React, Python...)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Not Started', 'In Progress', 'Completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cat, i) => {
              const pct = cat.total > 0 ? Math.round((cat.solved / cat.total) * 100) : 0;
              const circumference = 2 * Math.PI * 20;
              return (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`group glass-card rounded-2xl p-6 border ${cat.borderColor} hover:scale-[1.02] transition-transform duration-200 flex flex-col`}>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-4xl w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} bg-opacity-20`}>
                      {cat.icon}
                    </div>
                    {/* Progress Ring */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="#1e293b" strokeWidth="5" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="url(#grad)" strokeWidth="5"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (circumference * pct) / 100}
                          className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">{pct}%</div>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-lg mb-1">{cat.name}</h3>
                  <p className="text-slate-400 text-xs mb-4 flex-1 leading-relaxed">{cat.description}</p>

                  {/* Subtopics */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {cat.subtopics?.slice(0, 4).map(s => (
                      <span key={s} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {cat.subtopics?.length > 4 && <span className="text-[10px] text-slate-500">+{cat.subtopics.length - 4} more</span>}
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="flex gap-3 mb-4 text-xs">
                    <span className="text-green-400">Easy: {cat.Easy}</span>
                    <span className="text-amber-400">Medium: {cat.Medium}</span>
                    <span className="text-red-400">Hard: {cat.Hard}</span>
                    <span className="text-slate-500 ml-auto">{cat.solved}/{cat.total} solved</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
                    <div className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>

                  {['aptitude', 'quant', 'reasoning', 'verbal'].includes(cat.id) ? (
                    <Link to={`/assessment/${cat.id}`}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm bg-gradient-to-r ${cat.color} text-white hover:opacity-90 transition-opacity group-hover:shadow-lg`}>
                      Start Practice <FaChevronRight className="text-xs" />
                    </Link>
                  ) : (
                    <Link to={`/coding/${cat.id}`}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm bg-gradient-to-r ${cat.color} text-white hover:opacity-90 transition-opacity group-hover:shadow-lg`}>
                      Start Practice <FaChevronRight className="text-xs" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CodingHub;
