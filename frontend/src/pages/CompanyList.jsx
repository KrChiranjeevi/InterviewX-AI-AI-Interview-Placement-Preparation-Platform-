import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { FaBuilding, FaLayerGroup, FaArrowRight } from 'react-icons/fa';
import { Search, Filter, Building2, Zap, Trophy, Star, ChevronRight, Play, TrendingUp, Clock, Users, Coins } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };

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

const DIFF_STYLES = {
  Hard:   'bg-red-500/10 border-red-500/20 text-red-400',
  Medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  Easy:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [diffFilter, setDiffFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/company/all');
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to fetch companies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filtered = companies.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = diffFilter === 'All' || c.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Blob cx={10} cy={15}  color="rgba(245,158,11,0.55)"  r={460} delay={0} />
        <Blob cx={88} cy={10}  color="rgba(239,68,68,0.4)"    r={350} delay={3} />
        <Blob cx={55} cy={80}  color="rgba(99,102,241,0.3)"   r={320} delay={6} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.7) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Target Companies" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-16 pt-6">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp} className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-300 text-xs font-semibold mb-2">
                <Building2 className="h-3.5 w-3.5" /> Company Prep Mode
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Choose Your Target Company</h1>
              <p className="text-zinc-500 text-sm">Practice their exact interview patterns. Simulate the real hiring pipeline.</p>
            </motion.div>

            {/* Search + Filter */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies…"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/15 transition-all" />
              </div>
              <div className="flex gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button key={d} onClick={() => setDiffFilter(d)} className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${diffFilter === d ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'border border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.07]'}`}>{d}</button>
                ))}
              </div>
            </motion.div>

            {/* Companies Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl border border-white/[0.07] bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((company, index) => {
                  // Preserve original localStorage logic
                  const lastRole   = localStorage.getItem(`last_role_${company.name}`) || '';
                  const savedSim   = lastRole ? localStorage.getItem(`recruitment_sim_${company.name}_${lastRole}`) : null;
                  const simData    = savedSim ? JSON.parse(savedSim) : null;
                  const total      = company.rounds?.length || 4;
                  const current    = simData?.currentRoundIndex || 0;
                  const progressPct = simData ? Math.round((current / total) * 100) : 0;
                  const progressText = simData ? (current >= total ? 'Completed 🎉' : `${current}/${total} rounds`) : 'Not started';
                  const isCompleted = simData && current >= total;

                  return (
                    <motion.div
                      key={company._id}
                      variants={fadeUp}
                      whileHover={{ y: -6, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/companies/${company.name}`)}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] cursor-pointer backdrop-blur-sm hover:border-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/5"
                    >
                      {/* Top glow line on hover */}
                      <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
                      {/* Corner radial glow */}
                      <div className="absolute right-0 top-0 h-32 w-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

                      <div className="relative z-10 p-5 flex flex-col h-full">
                        {/* Logo + Difficulty */}
                        <div className="flex items-start justify-between mb-4">
                          <motion.div whileHover={{ scale: 1.08 }} className="h-14 w-14 rounded-xl border border-white/10 bg-white p-2 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                            <img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = company.name.charAt(0); }} />
                          </motion.div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isCompleted && <span className="text-[10px] font-bold rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5">Done ✓</span>}
                            <span className={`text-[10px] font-bold rounded-full border px-2 py-0.5 ${DIFF_STYLES[company.difficulty] || DIFF_STYLES.Medium}`}>{company.difficulty}</span>
                          </div>
                        </div>

                        {/* Name + Role */}
                        <div className="mb-3">
                          <h3 className="text-base font-bold text-white leading-tight">{company.name}</h3>
                          {simData && lastRole && <p className="text-[11px] text-amber-400 font-medium mt-0.5">{lastRole}</p>}
                        </div>

                        {/* Progress bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[11px] mb-1.5">
                            <span className="text-zinc-500">Simulation Progress</span>
                            <span className={simData ? 'text-amber-400 font-semibold' : 'text-zinc-600'}>{progressText}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPct}%` }}
                              transition={{ duration: 1, ease: [0.16,1,0.3,1], delay: index * 0.05 }}
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                            />
                          </div>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-2.5 text-xs border-t border-white/[0.06] pt-3.5 mb-4">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">CTC Package</span>
                            <span className="text-zinc-200 font-bold font-mono">{company.package || '6–12 LPA'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Selection Rate</span>
                            <span className="text-zinc-200 font-bold font-mono">{company.selectionRate || '5.0%'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Eligibility</span>
                            <span className="text-zinc-200 font-bold truncate block">{company.eligibility || 'Graduates'}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider">Est. Time</span>
                            <span className="text-zinc-200 font-bold font-mono">{company.estimatedTime || '1 Week'}</span>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {company.skills?.slice(0, 3).map((skill, si) => (
                            <span key={si} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-400">{skill}</span>
                          ))}
                          {company.skills?.length > 3 && (
                            <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-600">+{company.skills.length - 3}</span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="mt-auto flex items-center justify-between rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3.5 py-2.5 group-hover:bg-amber-500/[0.1] transition-colors">
                          <span className="text-xs font-bold text-amber-400">{simData ? 'Continue Simulation' : 'Enter Simulation Pipeline'}</span>
                          <ChevronRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <Building2 className="h-14 w-14 text-zinc-700 mb-4" />
                </motion.div>
                <h3 className="text-base font-semibold text-white mb-1">No companies found</h3>
                <p className="text-sm text-zinc-500">Try adjusting your search or filter</p>
                <button onClick={() => { setSearch(''); setDiffFilter('All'); }} className="mt-4 text-xs text-amber-400 hover:text-amber-300 transition-colors">Clear filters</button>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default CompanyList;
