import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';import {
  BarChart3, ArrowRight, Clock, Mic, Download,
  Eye, RotateCcw, Filter, Search, ChevronDown,
  TrendingUp, TrendingDown, Award, Sparkles, Plus,
  FileText, Calendar, Target, Activity
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

const FloatingBlob = ({ cx, cy, color, r, delay = 0 }) => (
  <div
    className="pointer-events-none absolute rounded-full animate-blob opacity-60"
    style={{
      left: `${cx}%`, top: `${cy}%`, width: r, height: r,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      animationDelay: `${delay}s`
    }}
  />
);

function AnimCounter({ to, duration = 1.5, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = to / (duration * 60);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [to]);
  return <>{val}{suffix}</>;
}


const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-[11px] text-zinc-500">{subtitle}</p>
      </div>
    </div>
  </div>
);

const ReportsDashboard = () => {

const RADAR_DATA = [
  { subject: 'Communication', A: 85, fullMark: 100 },
  { subject: 'DSA',           A: 70, fullMark: 100 },
  { subject: 'System Design', A: 55, fullMark: 100 },
  { subject: 'Problem Solving', A: 75, fullMark: 100 },
  { subject: 'Confidence',    A: 90, fullMark: 100 },
];
const MONTHLY_DATA = [
  { name: 'Jan', score: 65 }, { name: 'Feb', score: 68 },
  { name: 'Mar', score: 74 }, { name: 'Apr', score: 79 },
  { name: 'May', score: 85 }, { name: 'Jun', score: 82 }
];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEAT_COLORS = ['bg-white/5', 'bg-indigo-500/20', 'bg-indigo-500/40', 'bg-indigo-500/60', 'bg-indigo-500'];
const HEATMAP_DATA = [
  { label: 'Arrays',   data: [2, 4, 1, 0, 3, 4, 2] },
  { label: 'Trees',    data: [0, 1, 3, 4, 2, 0, 1] },
  { label: 'DP',       data: [1, 0, 0, 2, 4, 3, 4] },
  { label: 'Graphs',   data: [0, 0, 2, 3, 1, 4, 2] },
  { label: 'SQL',      data: [4, 3, 4, 2, 1, 0, 0] },
  { label: 'System',   data: [0, 1, 2, 4, 4, 3, 2] },
];

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await getReports();
        setReports(data);
      } catch (err) {
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const TYPES = ['All', 'Technical Interview', 'HR Interview', 'Coding Interview', 'Resume Based Interview'];

  const filtered = reports.filter(r => {
    const matchSearch = !search || (r.interviewId?.role || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || (r.interviewId?.type || '') === filter;
    return matchSearch && matchFilter;
  });

  const avgScore  = reports.length ? Math.round(reports.reduce((s, r) => s + (r.overallScore || 0), 0) / reports.length) : 0;
  const bestScore = reports.length ? Math.max(...reports.map(r => r.overallScore || 0)) : 0;
  const latest    = reports[0];

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="relative h-14 w-14">
          <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 border-r-purple-500" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} />
          <BarChart3 className="absolute inset-0 m-auto h-5 w-5 text-violet-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-8 py-6 text-red-400 text-lg font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <FloatingBlob cx={15} cy={20}  color="rgba(139,92,246,0.6)"  r={500} delay={0} />
        <FloatingBlob cx={85} cy={10}  color="rgba(168,85,247,0.5)"  r={350} delay={3} />
        <FloatingBlob cx={60} cy={80}  color="rgba(99,102,241,0.4)"  r={380} delay={5} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.8) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="Interview Performance Analytics" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-16 pt-6">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">

            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Performance Reports</h1>
                <p className="text-sm text-zinc-500 mt-0.5">AI-generated insights from every interview session</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/interview/setup')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/20"
              >
                <Plus className="h-4 w-4" /> New Interview
              </motion.button>
            </motion.div>

            {/* Stats Row */}
            {reports.length > 0 && (
              <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Sessions', value: reports.length, suffix: '', icon: Mic,       color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)' },
                  { label: 'Average Score',  value: avgScore,       suffix: '%', icon: Target,   color: 'from-indigo-500 to-blue-600',   glow: 'rgba(99,102,241,0.3)' },
                  { label: 'Best Score',     value: bestScore,      suffix: '%', icon: Award,    color: 'from-amber-500 to-orange-500',  glow: 'rgba(245,158,11,0.3)' },
                  { label: 'Latest Score',   value: latest?.overallScore || 0, suffix: '%', icon: Activity, color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.3)' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <motion.div key={i} variants={fadeUp}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-sm">
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity" style={{ background: `linear-gradient(135deg,${s.color.split(' ')[1]},${s.color.split(' ')[3]})` }} />
                      <div className="flex items-center justify-between mb-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${s.color}`} style={{ boxShadow: `0 4px 12px ${s.glow}` }}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{s.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        <AnimCounter to={s.value} suffix={s.suffix} />
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            
            {/* ──────────────────────────────────────────────────────────────── */}
            {/* PERFORMANCE ANALYTICS */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="mb-6">
              <SectionHeader icon={Activity} title="Performance Analytics" subtitle="Deep insights into your interview performance" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Radar Chart */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm flex flex-col items-center">
                  <div className="w-full mb-2">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Skill Radar</p>
                    <p className="text-[10px] text-zinc-500">Across 6 core dimensions</p>
                  </div>
                  <div className="h-56 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10 }} />
                        <Radar name="Score" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRadar)" fillOpacity={0.6} />
                        <defs>
                          <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Area Chart */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Monthly Growth</p>
                    <p className="text-[10px] text-zinc-500">Score trend over 6 months</p>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[50, 100]} />
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(10,10,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Heatmap */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                  <div className="mb-4">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Skill Heatmap</p>
                    <p className="text-[10px] text-zinc-500">Weekly practice intensity</p>
                  </div>
                  <div className="flex gap-2">
                    {/* Y-axis labels */}
                    <div className="flex flex-col gap-2 pt-5">
                      {HEATMAP_DATA.map((r, i) => (
                        <div key={i} className="h-5 flex items-center justify-end pr-1">
                          <span className="text-[9px] text-zinc-500">{r.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* Grid */}
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5 px-1">
                        {DAYS.map(d => <span key={d} className="text-[9px] text-zinc-500 w-full text-center">{d}</span>)}
                      </div>
                      <div className="flex flex-col gap-2">
                        {HEATMAP_DATA.map((row, i) => (
                          <div key={i} className="flex justify-between gap-1.5">
                            {row.data.map((val, j) => (
                              <div key={j} className={`h-5 flex-1 rounded-sm ${HEAT_COLORS[val]} border border-white/5 transition-all hover:scale-110 cursor-pointer`} title={`${val} sessions`} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filter + Search */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by role..."
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all backdrop-blur-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['All', 'Technical Interview', 'HR Interview', 'Coding Interview'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${filter === t ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'border border-white/[0.07] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.07]'}`}
                  >
                    {t === 'Technical Interview' ? 'Technical' : t === 'HR Interview' ? 'HR' : t === 'Coding Interview' ? 'Coding' : t}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Reports Grid */}
            {filtered.length === 0 ? (
              <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-24 text-center">
                <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                  <FileText className="h-9 w-9 text-zinc-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">{reports.length === 0 ? 'No reports yet' : 'No matching reports'}</h3>
                <p className="text-sm text-zinc-500 max-w-xs mb-6">{reports.length === 0 ? "Complete your first AI mock interview to see your performance analysis here." : "Try adjusting your search or filter."}</p>
                {reports.length === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/interview/setup')}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
                  >
                    <Mic className="h-4 w-4" /> Start First Interview
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((report, index) => {
                  const score = report.overallScore || 0;
                  const isHigh = score >= 80;
                  const isMid  = score >= 60;
                  const scoreColor = isHigh ? 'from-emerald-500 to-teal-500' : isMid ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';
                  const scoreBg = isHigh ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isMid ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400';
                  const type = report.interviewId?.type || 'Interview';
                  const role = report.interviewId?.role || 'Unknown Role';
                  const date = new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <motion.div
                      key={report._id}
                      variants={fadeUp}
                      whileHover={{ y: -5, scale: 1.01 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm flex flex-col transition-all hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5"
                    >
                      {/* Score bar across top */}
                      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1.2, delay: index * 0.1 + 0.3, ease: [0.16,1,0.3,1] }} className={`h-full bg-gradient-to-r ${scoreColor}`} />
                      </div>

                      {/* Glow on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />

                      <div className="relative z-10 flex flex-col h-full p-5">
                        {/* Type badge + date */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                            {type.replace(' Interview', '')}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <Calendar className="h-3 w-3" /> {date}
                          </span>
                        </div>

                        {/* Role */}
                        <h3 className="text-base font-bold text-white mb-1 leading-tight">{role}</h3>

                        {/* Score display */}
                        <div className="flex items-end gap-2 my-4">
                          <div className={`inline-flex items-center rounded-xl border px-3 py-1 ${scoreBg}`}>
                            <span className="text-3xl font-black leading-none">{score}</span>
                            <span className="text-sm font-medium ml-0.5 opacity-60">/100</span>
                          </div>
                          <div className="mb-1">
                            {isHigh ? (
                              <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium"><TrendingUp className="h-3 w-3" /> Excellent</span>
                            ) : isMid ? (
                              <span className="flex items-center gap-0.5 text-xs text-amber-400 font-medium"><TrendingUp className="h-3 w-3" /> Good</span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-xs text-red-400 font-medium"><TrendingDown className="h-3 w-3" /> Needs Work</span>
                            )}
                          </div>
                        </div>

                        {/* AI recommendation snippet */}
                        {report.overallFeedback && (
                          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-4 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Sparkles className="h-3 w-3 text-violet-400" />
                              <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">AI Feedback</span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{report.overallFeedback}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions footer */}
                      <div className="relative z-10 border-t border-white/[0.05] bg-white/[0.02] px-5 py-3 flex items-center gap-2">
                        <button
                          onClick={() => {
                            const isMock = !report.interviewId?.company;
                            if (isMock) {
                              navigate(`/mock-report/${report.interviewId?._id}`);
                            } else {
                              navigate(`/report/${report.interviewId?._id}`);
                            }
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 py-2 text-xs font-semibold text-white transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Report
                        </button>
                        <button
                          onClick={() => navigate('/interview/setup')}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-zinc-500 hover:bg-white/[0.08] hover:text-white transition-colors"
                          title="Retry"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ReportsDashboard;
