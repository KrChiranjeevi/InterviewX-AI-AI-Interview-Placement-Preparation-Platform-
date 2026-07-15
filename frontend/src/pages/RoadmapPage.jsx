import React, { useState, useEffect } from 'react';
import { getRoadmap, getSavedRoadmaps, generateRoadmap, toggleRoadmapTask, bookmarkRoadmap, getTopicDetail } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';import AIMentorWidget from '../components/roadmap/AIMentorWidget';
import CompareModal from '../components/roadmap/CompareModal';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Search, Bookmark, BookmarkCheck, Download, Scale, ChevronDown, ChevronUp, CheckCircle2, Circle, Trophy, Briefcase, Code2, Bot, BookOpen, ExternalLink, Building2, CircleDollarSign, TrendingUp, Clock, History, X, Target, Zap, Sparkles } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };

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

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingTopicDetail, setLoadingTopicDetail] = useState({});

  useEffect(() => {
    fetchActiveRoadmap();
    fetchSaved();
  }, []);

  const fetchActiveRoadmap = async () => {
    try {
      const { data } = await getRoadmap();
      setRoadmap(data);
    } catch (err) {
      if (err.response?.status !== 404) setError('Failed to load roadmap.');
    }
    setLoading(false);
  };

  const fetchSaved = async () => {
    try {
      const { data } = await getSavedRoadmaps();
      setSavedRoadmaps(data);
    } catch (err) {
      console.error('Failed to fetch saved roadmaps');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowHistory(false);
    setGenerating(true);
    setError(null);
    try {
      const { data } = await generateRoadmap(searchQuery);
      setRoadmap(data);
      setSearchQuery('');
    } catch (err) {
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const loadSavedRoadmap = (saved) => {
    setRoadmap(saved);
    setShowHistory(false);
  };

  const handleToggleBookmark = async () => {
    if (!roadmap) return;
    try {
      await bookmarkRoadmap(roadmap._id);
      setRoadmap({ ...roadmap, isSaved: !roadmap.isSaved });
      fetchSaved();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const toggleTask = async (moduleIndex, topicIndex, taskIndex, taskType) => {
    try {
      const updated = { ...roadmap };
      const mod = updated.modules[moduleIndex];
      if (taskType === 'practiceProblems') {
        mod.topics[topicIndex].practiceProblems[taskIndex].isCompleted = !mod.topics[topicIndex].practiceProblems[taskIndex].isCompleted;
      } else if (taskType === 'projects') {
        mod.projects[taskIndex].isCompleted = !mod.projects[taskIndex].isCompleted;
      } else if (taskType === 'topic') {
        mod.topics[topicIndex].isCompleted = !mod.topics[topicIndex].isCompleted;
      }
      setRoadmap(updated);
      await toggleRoadmapTask(roadmap._id, moduleIndex, topicIndex, taskIndex, taskType);
    } catch (err) {
      console.error(err);
      fetchActiveRoadmap();
    }
  };

  const toggleModule = (index) => setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));
  
  const toggleTopic = async (modIdx, topIdx) => {
    const key = `${modIdx}-${topIdx}`;
    setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));

    const topic = roadmap.modules[modIdx].topics[topIdx];
    if (!topic.explanation) {
      setLoadingTopicDetail(prev => ({ ...prev, [key]: true }));
      try {
        const { data } = await getTopicDetail(roadmap._id, modIdx, topIdx);
        setRoadmap(data);
      } catch (err) {
        console.error('Failed to load topic details:', err);
      } finally {
        setLoadingTopicDetail(prev => ({ ...prev, [key]: false }));
      }
    }
  };

  const radarData = roadmap?.analytics ? [
    { subject: 'Role', A: roadmap.analytics.roleReadiness || 0, fullMark: 100 },
    { subject: 'Coding', A: roadmap.analytics.codingReadiness || 0, fullMark: 100 },
    { subject: 'Interview', A: roadmap.analytics.interviewReadiness || 0, fullMark: 100 },
    { subject: 'Resume', A: roadmap.analytics.resumeReadiness || 0, fullMark: 100 },
    { subject: 'Communication', A: roadmap.analytics.communicationReadiness || 0, fullMark: 100 },
  ] : [];

  const barData = roadmap?.modules?.map((m, i) => {
    const total = (m.topics?.length || 0) + (m.projects?.length || 0);
    const completed = (m.topics?.filter(t => t.isCompleted)?.length || 0) + (m.projects?.filter(p => p.isCompleted)?.length || 0);
    return { name: `M${i+1}`, completed, remaining: total - completed };
  }) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden">
        <Blob cx={10} cy={15}  color="rgba(139,92,246,0.5)"   r={480} delay={0} />
        <Blob cx={88} cy={10}  color="rgba(79,70,229,0.4)"    r={360} delay={3} />
        <Blob cx={55} cy={80}  color="rgba(59,130,246,0.3)"   r={320} delay={6} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <div className="print:hidden"></div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden print:pl-0 print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <Navbar subtitle="Learning Path & Progress" />
        </div>
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent print:hidden" />

        <main className="flex-1 overflow-y-auto px-6 pb-24 pt-6 no-scrollbar print:p-0 print:overflow-visible">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-6xl space-y-8">

            {/* Universal Search Bar */}
            <motion.div variants={fadeUp} className="print:hidden relative z-40">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-border bg-secondary py-4 pl-12 pr-32 text-base text-foreground placeholder-zinc-500 backdrop-blur-sm focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/15 transition-all shadow-xl"
                  placeholder="Search any roadmap… (e.g. Java, MERN, Amazon SDE, AI Engineer)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  disabled={generating}
                />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={generating || !searchQuery.trim()}
                  className="absolute inset-y-2 right-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-bold text-foreground shadow-lg shadow-violet-500/20 disabled:opacity-50 transition-all"
                >
                  {generating ? 'Generating…' : <><Sparkles className="h-4 w-4" /> Generate</>}
                </motion.button>
              </form>

              {/* History Dropdown */}
              <AnimatePresence>
                {showHistory && !searchQuery && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><History className="h-4 w-4 text-violet-400" /> Saved & Recent</h3>
                      <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                    {savedRoadmaps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedRoadmaps.map((s, i) => (
                          <div key={i} onClick={() => loadSavedRoadmap(s)} className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary p-3 hover:bg-secondary transition-colors">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-110 transition-transform">
                              <Bookmark className="h-4 w-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-foreground truncate">{s.searchQuery}</p>
                              <p className="text-[11px] text-muted-foreground">{s.type} • {s.progress}% Completed</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">No saved roadmaps yet. Try searching above!</p>
                    )}
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Try searching for:</p>
                      <div className="flex flex-wrap gap-2">
                        {['React Developer', 'Amazon SDE', 'Machine Learning', 'System Design'].map(q => (
                          <button key={q} onClick={(e) => { e.preventDefault(); setSearchQuery(q); }} className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-violet-600/20 hover:text-violet-300 hover:border-violet-500/30 transition-colors">{q}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Action Bar */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-between items-center gap-3 print:hidden">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCompare(true)} className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary backdrop-blur-sm transition-colors">
                <Scale className="h-4 w-4 text-violet-400" /> Compare Roadmaps
              </motion.button>
              {roadmap && (
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportPDF} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Export as PDF">
                    <Download className="h-4 w-4" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleToggleBookmark} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${roadmap.isSaved ? 'bg-violet-500/20 border-violet-500/30 text-violet-400' : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary'}`} title="Bookmark">
                    {roadmap.isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </motion.button>
                </div>
              )}
            </motion.div>

            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</motion.div>}

            {generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative h-16 w-16 mb-6">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 border-r-indigo-500" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-violet-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Generating Comprehensive Roadmap…</h2>
                <p className="text-sm text-muted-foreground max-w-md">Our AI is analyzing industry standards, salary data, and optimal learning paths specifically for your query.</p>
              </motion.div>
            )}

            {roadmap && !generating && (
              <motion.div variants={container} className="space-y-6 print-content">
                
                {/* 1. Overview Section */}
                <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-border bg-secondary p-8 backdrop-blur-md">
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-[80px] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20 shadow-lg shadow-violet-500/10">
                        {roadmap.type === 'Company' ? <Building2 className="h-8 w-8 text-violet-400" /> : roadmap.type === 'Technology' ? <Code2 className="h-8 w-8 text-violet-400" /> : <Briefcase className="h-8 w-8 text-violet-400" />}
                      </div>
                      <div>
                        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                          {roadmap.type} Roadmap
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">{roadmap.searchQuery}</h1>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-3xl">{roadmap.overview?.careerOverview}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: CircleDollarSign, color: 'text-emerald-400',  label: 'Avg Salary',    val: roadmap.overview?.salaryRange },
                        { icon: Clock,            color: 'text-amber-400',    label: 'Est. Duration', val: roadmap.overview?.learningDuration },
                        { icon: TrendingUp,       color: 'text-blue-400',     label: 'Difficulty',    val: roadmap.overview?.difficultyLevel },
                        { icon: Building2,        color: 'text-fuchsia-400',  label: 'Top Hiring',    val: roadmap.overview?.topHiringCompanies?.[0] ? `${roadmap.overview.topHiringCompanies[0]} +` : 'N/A' },
                      ].map((st, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-secondary p-4">
                          <st.icon className={`h-5 w-5 mb-2 ${st.color}`} />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{st.label}</p>
                          <p className="text-sm font-bold text-foreground truncate">{st.val || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                    
                    {roadmap.overview?.whyLearn && (
                       <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                         <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-300"><Bot className="h-4 w-4" /> Why choose this path?</h3>
                         <p className="text-xs text-indigo-100/70 leading-relaxed">{roadmap.overview.whyLearn}</p>
                       </div>
                    )}
                  </div>
                </motion.div>

                {/* 2. Dashboards (Hidden in Print) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                  <motion.div variants={fadeUp} className="lg:col-span-1 rounded-3xl border border-border bg-secondary p-6 backdrop-blur-md flex flex-col justify-center">
                    <h3 className="mb-2 text-sm font-bold text-foreground flex items-center gap-2"><Target className="h-4 w-4 text-violet-400" /> Readiness Radar</h3>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.05)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }} />
                          <Radar name="Readiness" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeUp} className="lg:col-span-2 rounded-3xl border border-border bg-secondary p-6 backdrop-blur-md">
                     <h3 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-400" /> Module Progress Tracking</h3>
                     <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#a1a1aa', fontSize: 10}} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" tick={{fill: '#a1a1aa', fontSize: 10}} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#0c0c16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px', padding: '12px'}} />
                            <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} name="Completed" />
                            <Bar dataKey="remaining" stackId="a" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} name="Remaining" />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </motion.div>
                </div>

                {/* 3. Company Specific Data */}
                {roadmap.type === 'Company' && roadmap.companyDetails && (
                  <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-900/10 to-indigo-900/5 p-6 md:p-8 backdrop-blur-md">
                     <h2 className="mb-6 border-b border-border pb-4 text-lg font-bold text-foreground flex items-center gap-2"><Building2 className="h-5 w-5 text-violet-400" /> Company Hiring Profile</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                         <div>
                           <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eligibility & CGPA</p>
                           <p className="text-sm font-semibold text-zinc-200">{roadmap.companyDetails.eligibility} • {roadmap.companyDetails.cgpaRequirement}</p>
                         </div>
                         <div>
                           <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Hiring Process</p>
                           <p className="text-sm text-zinc-300">{roadmap.companyDetails.hiringProcess}</p>
                         </div>
                         <div>
                           <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Selection Rate</p>
                           <p className="text-sm font-bold text-amber-400">{roadmap.companyDetails.selectionRate}</p>
                         </div>
                       </div>
                       <div className="space-y-4">
                         <div>
                           <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interview Rounds</p>
                           <ul className="list-disc pl-4 text-sm text-zinc-300 space-y-1">
                             {roadmap.companyDetails.interviewRounds?.map((r, i) => <li key={i}>{r}</li>)}
                           </ul>
                         </div>
                         <div>
                           <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Core Subjects</p>
                           <div className="flex flex-wrap gap-2">
                             {roadmap.companyDetails.coreSubjects?.map((sub, i) => <span key={i} className="rounded-md bg-secondary border border-border px-2 py-1 text-[10px] font-medium text-zinc-300">{sub}</span>)}
                           </div>
                         </div>
                       </div>
                     </div>
                  </motion.div>
                )}

                {/* 4. The Complete Learning Path Timeline */}
                <motion.div variants={fadeUp}>
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <h2 className="text-xl font-bold text-foreground">Complete Learning Path</h2>
                  </div>
                  
                  <div className="relative pl-4 md:pl-0 space-y-6 print:space-y-4">
                    <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-secondary print:hidden"></div>
                    
                    {roadmap.modules?.map((mod, modIdx) => (
                      <div key={modIdx} className="relative md:pl-20 print:pl-0">
                        {/* Timeline dot */}
                        <div className="hidden md:flex absolute left-[27.5px] top-7 h-3 w-3 rounded-full border-[3px] border-[#070711] bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)] z-10 print:hidden"></div>
                        
                        <div className="overflow-hidden rounded-2xl border border-border bg-secondary backdrop-blur-sm print:border-slate-400 print:bg-transparent print:break-inside-avoid transition-all hover:border-border">
                          {/* Module Header */}
                          <div onClick={() => toggleModule(modIdx)} className="flex cursor-pointer items-center justify-between p-5 group print:p-3">
                            <div>
                              <p className="mb-1 text-[10px] font-bold tracking-wider text-violet-400 uppercase">Module {modIdx + 1} <span className="mx-1 text-zinc-600">•</span> {mod.estimatedTime}</p>
                              <h3 className="text-lg font-bold text-foreground group-hover:text-violet-300 transition-colors">{mod.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${mod.difficulty === 'Hard' ? 'bg-red-500/10 border-red-500/20 text-red-400' : mod.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                {mod.difficulty}
                              </span>
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground print:hidden transition-colors group-hover:bg-secondary group-hover:text-foreground">
                                {expandedModules[modIdx] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </div>
                          </div>

                          {/* Module Content */}
                          <AnimatePresence>
                            {(expandedModules[modIdx] || true) && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className={`border-t border-border p-5 space-y-4 bg-black/20 ${!expandedModules[modIdx] ? 'hidden print:block' : ''}`}
                              >
                                {mod.topics?.map((topic, topIdx) => (
                                  <div key={topIdx} className="overflow-hidden rounded-xl border border-border bg-secondary print:border-slate-300 transition-colors hover:border-border">
                                    <div onClick={() => toggleTopic(modIdx, topIdx)} className="flex cursor-pointer items-center justify-between p-3.5 hover:bg-secondary transition-colors">
                                      <div className="flex items-center gap-3">
                                        <button onClick={(e) => { e.stopPropagation(); toggleTask(modIdx, topIdx, null, 'topic'); }} className={`print:hidden transition-colors ${topic.isCompleted ? 'text-emerald-400' : 'text-zinc-600 hover:text-muted-foreground'}`}>
                                          {topic.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                        </button>
                                        <h4 className={`text-sm font-bold transition-colors ${topic.isCompleted ? 'text-muted-foreground line-through' : 'text-zinc-200'}`}>{topic.title}</h4>
                                      </div>
                                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform print:hidden ${expandedTopics[`${modIdx}-${topIdx}`] ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    <AnimatePresence>
                                      {(expandedTopics[`${modIdx}-${topIdx}`] || true) && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={`overflow-hidden border-t border-border ${!expandedTopics[`${modIdx}-${topIdx}`] ? 'hidden print:block' : ''}`}>
                                          <div className="p-4 pt-3">
                                            {loadingTopicDetail[`${modIdx}-${topIdx}`] ? (
                                              <div className="flex flex-col items-center justify-center py-6 gap-3">
                                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-violet-500 border-r-indigo-500" />
                                                <p className="text-[11px] text-muted-foreground">AI preparing topic details…</p>
                                              </div>
                                            ) : topic.explanation ? (
                                              <>
                                                <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground whitespace-pre-wrap">{topic.explanation}</p>
                                                
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                  {/* Resources & Problems */}
                                                  <div className="space-y-5">
                                                    {topic.practiceProblems?.length > 0 && (
                                                      <div>
                                                        <h5 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><Code2 className="h-3.5 w-3.5" /> Practice</h5>
                                                        <ul className="space-y-1.5">
                                                          {topic.practiceProblems.map((prob, pIdx) => (
                                                            <li key={pIdx} className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary p-2">
                                                              <button onClick={() => toggleTask(modIdx, topIdx, pIdx, 'practiceProblems')} className={`mt-0.5 shrink-0 ${prob.isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`}>
                                                                {prob.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                                              </button>
                                                              <div>
                                                                <a href={prob.link} target="_blank" rel="noreferrer" className="text-xs font-semibold text-zinc-300 hover:text-violet-400 transition-colors flex items-center gap-1">
                                                                  {prob.title} <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                                                                </a>
                                                                <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-medium ${prob.difficulty === 'Hard' ? 'border-red-500/20 text-red-400' : prob.difficulty === 'Medium' ? 'border-amber-500/20 text-amber-400' : 'border-emerald-500/20 text-emerald-400'}`}>{prob.difficulty}</span>
                                                              </div>
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                    {topic.learningResources?.length > 0 && (
                                                      <div>
                                                        <h5 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><BookOpen className="h-3.5 w-3.5" /> Resources</h5>
                                                        <ul className="space-y-1.5">
                                                          {topic.learningResources.map((res, rIdx) => (
                                                            <li key={rIdx} className="flex items-center gap-2 text-xs">
                                                              <ExternalLink className="h-3 w-3 text-zinc-600 shrink-0" />
                                                              <a href={res.link} target="_blank" rel="noreferrer" className="truncate text-indigo-400 hover:underline max-w-[75%]">{res.title}</a>
                                                              <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground border border-border">{res.type}</span>
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Interview Questions */}
                                                  {topic.interviewQuestions?.length > 0 && (
                                                    <div>
                                                      <h5 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"><Briefcase className="h-3.5 w-3.5" /> Interview Prep</h5>
                                                      <div className="space-y-2.5">
                                                        {topic.interviewQuestions.map((iq, iIdx) => (
                                                          <div key={iIdx} className="rounded-lg border border-indigo-500/10 bg-indigo-500/[0.03] p-3">
                                                            <p className="mb-1.5 text-xs font-bold text-zinc-200">{iq.question}</p>
                                                            <p className="mb-1.5 text-[11px] italic text-indigo-300/60">Hint: {iq.answerHint}</p>
                                                            {iq.companies?.length > 0 && (
                                                              <div className="flex flex-wrap gap-1">
                                                                {iq.companies.map((c, cIdx) => <span key={cIdx} className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] text-indigo-300">{c}</span>)}
                                                              </div>
                                                            )}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                              </>
                                            ) : (
                                              <div className="py-2 text-center text-[11px] text-muted-foreground">
                                                Click to reveal AI-generated practice tasks & interview prep.
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}

                                {/* Module Projects */}
                                {mod.projects?.length > 0 && (
                                  <div className="mt-6 pt-5 border-t border-border">
                                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><Code2 className="h-4 w-4 text-violet-400" /> Key Projects</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {mod.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="group relative rounded-xl border border-border bg-secondary p-4 transition-colors hover:bg-secondary">
                                          <button onClick={() => toggleTask(modIdx, null, pIdx, 'projects')} className={`absolute right-3 top-3 transition-colors print:hidden ${proj.isCompleted ? 'text-emerald-400' : 'text-zinc-600 hover:text-muted-foreground'}`}>
                                            {proj.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                          </button>
                                          <h5 className={`mb-1.5 pr-6 text-xs font-bold text-zinc-200 ${proj.isCompleted ? 'line-through opacity-50' : ''}`}>{proj.title}</h5>
                                          <p className="mb-3 text-[11px] text-muted-foreground leading-relaxed">{proj.description}</p>
                                          <div className="flex flex-wrap gap-1">
                                            {proj.techStack?.map((tech, tIdx) => (
                                              <span key={tIdx} className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{tech}</span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

              </motion.div>
            )}
          </motion.div>
        </main>
        
        {/* Floating AI Mentor */}
        <div className="print:hidden relative z-50">
          <AIMentorWidget />
        </div>
      </div>

      <CompareModal isOpen={showCompare} onClose={() => setShowCompare(false)} />
    </div>
  );
};

export default RoadmapPage;
