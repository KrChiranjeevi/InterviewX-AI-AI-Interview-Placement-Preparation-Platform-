import React, { useState, useEffect } from 'react';
import { getRoadmap, getSavedRoadmaps, generateRoadmap, toggleRoadmapTask, bookmarkRoadmap, getTopicDetail } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import AIMentorWidget from '../components/roadmap/AIMentorWidget';
import CompareModal from '../components/roadmap/CompareModal';
import { 
  FaSearch, FaBookmark, FaRegBookmark, FaDownload, FaBalanceScale, FaChevronDown, FaChevronUp, 
  FaCheckCircle, FaRegCircle, FaFire, FaTrophy, FaBriefcase, FaCode, FaRobot, FaBook, 
  FaPlayCircle, FaExternalLinkAlt, FaBuilding, FaMoneyBillWave, FaChartLine, FaClock, FaHistory, FaTimes
} from 'react-icons/fa';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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
      // Optimistic update logic (simplified for UI feedback)
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

  // Recharts Data Prep
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
    <div className="flex h-screen bg-slate-950 overflow-hidden print-friendly">
      <div className="print:hidden"><Sidebar /></div>
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden relative print:ml-0">
        <div className="print:hidden"><Navbar subtitle="Industry-Level AI Career Coach" /></div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar pb-32 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Universal Search Bar */}
            <div className="print:hidden relative z-40">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <FaSearch className="text-indigo-500 text-xl" />
                </div>
                <input
                  type="text"
                  className="block w-full bg-slate-900 border-2 border-slate-800 text-white rounded-full py-5 pl-14 pr-32 text-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xl placeholder-slate-500"
                  placeholder="Search any roadmap... (e.g. Java, MERN, Amazon SDE, AI Engineer)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  disabled={generating}
                />
                <button 
                  type="submit" 
                  disabled={generating || !searchQuery.trim()}
                  className="absolute inset-y-2 right-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </form>

              {/* Suggestions / History Dropdown */}
              <AnimatePresence>
                {showHistory && !searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold flex items-center gap-2"><FaHistory className="text-indigo-400" /> Saved & Recent Roadmaps</h3>
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
                    </div>
                    {savedRoadmaps.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedRoadmaps.map((s, i) => (
                          <div key={i} onClick={() => loadSavedRoadmap(s)} className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-3 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                              <FaBookmark />
                            </div>
                            <div className="truncate">
                              <p className="text-white font-semibold text-sm truncate">{s.searchQuery}</p>
                              <p className="text-xs text-slate-400">{s.type} • {s.progress}% Completed</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No saved roadmaps yet. Try searching above!</p>
                    )}
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Try searching for:</p>
                      <div className="flex flex-wrap gap-2">
                        {['React Developer', 'Amazon SDE', 'Machine Learning', 'System Design'].map(q => (
                          <button key={q} onClick={(e) => { e.preventDefault(); setSearchQuery(q); }} className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700 hover:bg-indigo-600 hover:text-white transition-colors">{q}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center print:hidden">
              <button onClick={() => setShowCompare(true)} className="px-5 py-2.5 rounded-full bg-slate-900 border border-slate-700 text-white font-semibold hover:bg-slate-800 flex items-center gap-2 transition-all">
                <FaBalanceScale className="text-indigo-400" /> Compare Roadmaps
              </button>
              {roadmap && (
                <div className="flex gap-3">
                  <button onClick={handleExportPDF} className="p-3 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all" title="Export as PDF">
                    <FaDownload />
                  </button>
                  <button onClick={handleToggleBookmark} className={`p-3 rounded-full border transition-all ${roadmap.isSaved ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'}`} title="Bookmark">
                    {roadmap.isSaved ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                </div>
              )}
            </div>

            {error && <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-400 rounded-xl">{error}</div>}

            {generating && (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Generating Comprehensive Roadmap...</h2>
                <p className="text-slate-400">Our AI is analyzing industry standards, salary data, and optimal learning paths.</p>
              </div>
            )}

            {roadmap && !generating && (
              <div className="space-y-8 animate-fade-in print-content">
                
                {/* 1. Top Overview Section */}
                <div className="glass-card rounded-3xl p-8 border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mt-20 -mr-20 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl shrink-0">
                      {roadmap.type === 'Company' ? <FaBuilding /> : roadmap.type === 'Technology' ? <FaCode /> : <FaBriefcase />}
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md mb-2 inline-block">{roadmap.type} Roadmap</span>
                      <h1 className="text-3xl md:text-4xl font-black text-white">{roadmap.searchQuery}</h1>
                    </div>
                  </div>

                  <p className="text-slate-300 text-lg leading-relaxed mb-8">{roadmap.overview?.careerOverview}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <FaMoneyBillWave className="text-green-400 mb-2 text-xl" />
                      <p className="text-slate-500 text-xs font-semibold uppercase">Avg Salary</p>
                      <p className="text-white font-bold">{roadmap.overview?.salaryRange || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <FaClock className="text-amber-400 mb-2 text-xl" />
                      <p className="text-slate-500 text-xs font-semibold uppercase">Est. Duration</p>
                      <p className="text-white font-bold">{roadmap.overview?.learningDuration || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <FaChartLine className="text-blue-400 mb-2 text-xl" />
                      <p className="text-slate-500 text-xs font-semibold uppercase">Difficulty</p>
                      <p className="text-white font-bold">{roadmap.overview?.difficultyLevel || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                      <FaBuilding className="text-purple-400 mb-2 text-xl" />
                      <p className="text-slate-500 text-xs font-semibold uppercase">Top Hiring</p>
                      <p className="text-white font-bold truncate" title={roadmap.overview?.topHiringCompanies?.join(', ')}>{roadmap.overview?.topHiringCompanies?.[0] || 'N/A'} +</p>
                    </div>
                  </div>
                  
                  {roadmap.overview?.whyLearn && (
                     <div className="mt-6 bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/20">
                       <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2"><FaRobot /> Why choose this path?</h3>
                       <p className="text-slate-300 text-sm leading-relaxed">{roadmap.overview.whyLearn}</p>
                     </div>
                  )}
                </div>

                {/* 2. Interactive Dashboards & Analytics (Hidden in Print) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
                  <div className="lg:col-span-1 glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-center items-center">
                    <h3 className="text-white font-bold mb-2 w-full text-left">Your Readiness Radar</h3>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar name="Readiness" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-slate-400 text-xs text-center mt-2">Based on platform analytics</p>
                  </div>

                  <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800">
                     <h3 className="text-white font-bold mb-6">Module Progress Tracking</h3>
                     <div className="w-full h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff'}} />
                            <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} name="Completed Tasks" />
                            <Bar dataKey="remaining" stackId="a" fill="#334155" radius={[4, 4, 0, 0]} name="Remaining Tasks" />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                </div>

                {/* 3. Company Specific Data (If any) */}
                {roadmap.type === 'Company' && roadmap.companyDetails && (
                  <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-800 bg-gradient-to-br from-slate-900 to-indigo-950/20">
                     <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Company Hiring Profile</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Eligibility & CGPA</p>
                           <p className="text-slate-200">{roadmap.companyDetails.eligibility} • {roadmap.companyDetails.cgpaRequirement}</p>
                         </div>
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Hiring Process</p>
                           <p className="text-slate-200">{roadmap.companyDetails.hiringProcess}</p>
                         </div>
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Selection Rate</p>
                           <p className="text-amber-400 font-bold">{roadmap.companyDetails.selectionRate}</p>
                         </div>
                       </div>
                       <div className="space-y-4">
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Interview Rounds</p>
                           <ul className="list-disc pl-4 text-slate-200 text-sm space-y-1">
                             {roadmap.companyDetails.interviewRounds?.map((r, i) => <li key={i}>{r}</li>)}
                           </ul>
                         </div>
                         <div>
                           <p className="text-slate-400 text-xs font-bold uppercase mb-1">Core Subjects</p>
                           <div className="flex flex-wrap gap-2">
                             {roadmap.companyDetails.coreSubjects?.map((sub, i) => <span key={i} className="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300">{sub}</span>)}
                           </div>
                         </div>
                       </div>
                     </div>
                  </div>
                )}

                {/* 4. The Massive Learning Path Timeline */}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Complete Learning Path</h2>
                  
                  <div className="relative pl-4 md:pl-0 space-y-8 print:space-y-4">
                    <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-slate-800 rounded-full print:hidden"></div>
                    
                    {roadmap.modules?.map((mod, modIdx) => (
                      <div key={modIdx} className="relative md:pl-20 print:pl-0">
                        <div className="hidden md:flex absolute left-6 w-5 h-5 rounded-full mt-6 -ml-0.5 border-4 border-slate-950 bg-indigo-500 shadow z-10 print:hidden"></div>
                        
                        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden print:border-slate-400 print:break-inside-avoid">
                          {/* Module Header */}
                          <div onClick={() => toggleModule(modIdx)} className="p-6 bg-slate-900/50 cursor-pointer flex justify-between items-center group print:bg-transparent">
                            <div>
                              <p className="text-indigo-400 text-xs font-bold mb-1 tracking-wider">MODULE {modIdx + 1} • {mod.estimatedTime}</p>
                              <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">{mod.title}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${mod.difficulty === 'Hard' ? 'bg-red-500/20 text-red-400' : mod.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                {mod.difficulty}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 print:hidden">
                                {expandedModules[modIdx] ? <FaChevronUp /> : <FaChevronDown />}
                              </div>
                            </div>
                          </div>

                          {/* Module Topics (Expanded by default in print) */}
                          <AnimatePresence>
                            {(expandedModules[modIdx] || true) && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                className={`border-t border-slate-800 p-6 space-y-6 bg-slate-950/30 ${!expandedModules[modIdx] ? 'hidden print:block' : ''}`}
                              >
                                {mod.topics?.map((topic, topIdx) => (
                                  <div key={topIdx} className="border border-slate-800 rounded-2xl bg-slate-900/30 overflow-hidden print:border-slate-300">
                                    <div onClick={() => toggleTopic(modIdx, topIdx)} className="p-4 cursor-pointer flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <button onClick={(e) => { e.stopPropagation(); toggleTask(modIdx, topIdx, null, 'topic'); }} className={`text-xl ${topic.isCompleted ? 'text-green-500' : 'text-slate-600 hover:text-slate-400'} print:hidden`}>
                                          {topic.isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                                        </button>
                                        <h4 className={`text-lg font-bold ${topic.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>{topic.title}</h4>
                                      </div>
                                      <FaChevronDown className={`text-slate-500 transition-transform print:hidden ${expandedTopics[`${modIdx}-${topIdx}`] ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    <AnimatePresence>
                                      {(expandedTopics[`${modIdx}-${topIdx}`] || true) && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className={`px-4 pb-6 pt-2 border-t border-slate-800/50 ${!expandedTopics[`${modIdx}-${topIdx}`] ? 'hidden print:block' : ''}`}>
                                          {loadingTopicDetail[`${modIdx}-${topIdx}`] ? (
                                            <div className="py-8 flex flex-col items-center justify-center gap-3">
                                              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                                              <p className="text-xs text-slate-400">AI Coach is preparing detailed topic guide...</p>
                                            </div>
                                          ) : topic.explanation ? (
                                            <>
                                              <p className="text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{topic.explanation}</p>
                                              
                                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Left: Problems & Resources */}
                                                <div className="space-y-6">
                                                  {topic.practiceProblems?.length > 0 && (
                                                    <div>
                                                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><FaCode /> Practice Problems</h5>
                                                      <ul className="space-y-2">
                                                        {topic.practiceProblems.map((prob, pIdx) => (
                                                          <li key={pIdx} className="flex items-start gap-3 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                                                            <button onClick={() => toggleTask(modIdx, topIdx, pIdx, 'practiceProblems')} className={`mt-1 ${prob.isCompleted ? 'text-green-500' : 'text-slate-600'}`}>
                                                              {prob.isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                                                            </button>
                                                            <div>
                                                              <a href={prob.link} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-200 hover:text-indigo-400 transition-colors">{prob.title}</a>
                                                              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border ${prob.difficulty === 'Hard' ? 'text-red-400 border-red-500/30' : prob.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/30' : 'text-green-400 border-green-500/30'}`}>{prob.difficulty}</span>
                                                            </div>
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}
                                                  {topic.learningResources?.length > 0 && (
                                                    <div>
                                                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><FaBook /> Resources</h5>
                                                      <ul className="space-y-2">
                                                        {topic.learningResources.map((res, rIdx) => (
                                                          <li key={rIdx} className="flex items-center gap-2 text-sm">
                                                            <FaExternalLinkAlt className="text-slate-600 text-xs" />
                                                            <a href={res.link} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline truncate max-w-[80%]">{res.title}</a>
                                                            <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded">{res.type}</span>
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                {/* Right: Interview Questions */}
                                                {topic.interviewQuestions?.length > 0 && (
                                                  <div>
                                                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><FaBriefcase /> Interview Prep</h5>
                                                    <div className="space-y-3">
                                                      {topic.interviewQuestions.map((iq, iIdx) => (
                                                        <div key={iIdx} className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                                                          <p className="text-sm font-bold text-white mb-2">{iq.question}</p>
                                                          <p className="text-xs text-indigo-200/70 italic mb-2">Hint: {iq.answerHint}</p>
                                                          {iq.companies?.length > 0 && (
                                                            <div className="flex gap-1 flex-wrap">
                                                              {iq.companies.map((c, cIdx) => <span key={cIdx} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">{c}</span>)}
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
                                            <div className="py-4 flex flex-col items-center justify-center">
                                              <p className="text-xs text-slate-500">Click topic title to load detailed guide (practice tasks, interview prep & resources).</p>
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}

                                {/* Module Projects */}
                                {mod.projects?.length > 0 && (
                                  <div className="mt-8 pt-6 border-t border-slate-800">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FaCode className="text-indigo-400" /> Module Projects</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {mod.projects.map((proj, pIdx) => (
                                        <div key={pIdx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative group">
                                          <button onClick={() => toggleTask(modIdx, null, pIdx, 'projects')} className={`absolute top-4 right-4 text-xl ${proj.isCompleted ? 'text-green-500' : 'text-slate-700 group-hover:text-slate-500'} print:hidden`}>
                                            {proj.isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
                                          </button>
                                          <h5 className={`font-bold text-white pr-8 mb-2 ${proj.isCompleted ? 'line-through opacity-50' : ''}`}>{proj.title}</h5>
                                          <p className="text-xs text-slate-400 mb-4">{proj.description}</p>
                                          <div className="flex flex-wrap gap-1.5">
                                            {proj.techStack?.map((tech, tIdx) => (
                                              <span key={tIdx} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded-md">{tech}</span>
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
                </div>

              </div>
            )}
          </div>
        </main>
        
        {/* Floating AI Mentor */}
        <div className="print:hidden">
          <AIMentorWidget />
        </div>
      </div>

      <CompareModal isOpen={showCompare} onClose={() => setShowCompare(false)} />
    </div>
  );
};

export default RoadmapPage;
