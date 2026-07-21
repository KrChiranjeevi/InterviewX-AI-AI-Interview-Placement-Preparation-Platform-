import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLaptopCode, FaUserTie, FaCode, FaFileAlt, FaCheck, FaVideo, FaMicrophone,
  FaArrowRight, FaClock, FaBriefcase, FaGlobe, FaVolumeUp, FaTasks
} from 'react-icons/fa';
import { Sparkles, Brain, Shield, CheckCircle2, AlertTriangle, Monitor, Wifi, Volume2 } from 'lucide-react';
import api from '../services/api';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeSkills = location.state?.resumeSkills || [];
  const resumeText = location.state?.resumeText || '';

  // Step state
  const [interviewType, setInterviewType] = useState(resumeSkills.length > 0 ? 'Resume Interview' : 'Technical Interview');
  const [domain, setDomain] = useState('');
  const [subLanguage, setSubLanguage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('30 minutes');
  const [uploadedResumeName, setUploadedResumeName] = useState(resumeSkills.length > 0 ? 'uploaded_resume.pdf' : '');

  // Hardware check states
  const [camGranted, setCamGranted] = useState(null);
  const [micGranted, setMicGranted] = useState(null);
  const [speakerCheck, setSpeakerCheck] = useState(true);
  const [internetStatus, setInternetStatus] = useState(true);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check hardware permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setCamGranted(true))
        .catch(() => setCamGranted(false));
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setMicGranted(true))
        .catch(() => setMicGranted(false));
    } else {
      setCamGranted(false);
      setMicGranted(false);
    }

    // Monitor internet status
    setInternetStatus(navigator.onLine);
    const handleOnline = () => setInternetStatus(true);
    const handleOffline = () => setInternetStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const interviewTypes = [
    { id: 'Technical Interview', icon: <FaLaptopCode className="text-xl text-blue-400" />, title: 'Technical Interview', desc: 'Core programming concepts, logic, and theory.', time: '30m', diff: 'Med-Hard', preview: 'OOPs, DBMS, OS...' },
    { id: 'Coding Interview', icon: <FaCode className="text-xl text-emerald-400" />, title: 'Coding Interview', desc: 'Real-time algorithms, problem-solving, and DSA.', time: '45m', diff: 'Hard', preview: 'Monaco Code Editor' },
    { id: 'HR Interview', icon: <FaUserTie className="text-xl text-pink-400" />, title: 'HR Interview', desc: 'Behavioral, career goals, culture fit, and soft skills.', time: '20m', diff: 'Easy-Med', preview: 'STAR methodology' },
    { id: 'Resume Interview', icon: <FaFileAlt className="text-xl text-amber-400" />, title: 'Resume Interview', desc: 'Questions tailored strictly to your uploaded resume profile.', time: '30m', diff: 'Medium', preview: 'Projects & Experience' },
    { id: 'Behavioral Interview', icon: <Brain className="w-5 h-5 text-purple-400" />, title: 'Behavioral Interview', desc: 'STAR technique scenarios evaluating leadership.', time: '30m', diff: 'Medium', preview: 'STAR metrics' },
    { id: 'Project Discussion', icon: <FaTasks className="text-xl text-teal-400" />, title: 'Project Discussion', desc: 'Detailed architectural drilldown on one of your projects.', time: '30m', diff: 'Medium', preview: 'Design & Deployment' },
    { id: 'System Design Interview', icon: <Monitor className="w-5 h-5 text-cyan-400" />, title: 'System Design', desc: 'Scale, caching, databases, and structural trade-offs.', time: '45m', diff: 'Expert', preview: 'Drawing whiteboard' }
  ];

  const technicalDomains = [
    'Programming Fundamentals', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
    'Software Engineering', 'Java', 'Python', 'JavaScript', 'C++', 'C', 'React',
    'Node.js', 'Express.js', 'MongoDB', 'Cloud', 'DevOps', 'Git', 'REST APIs', 'Linux'
  ];

  const codingDomains = [
    'DSA', 'SQL', 'JavaScript', 'Java', 'Python', 'C++', 'C', 'React', 'Node.js',
    'HTML/CSS', 'MongoDB', 'API Development'
  ];

  const dsaLanguages = ['Java', 'Python', 'C++', 'C'];

  const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
    'SDE Intern', 'Data Analyst', 'AI Engineer', 'ML Engineer', 'Cloud Engineer', 'DevOps Engineer'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const durations = ['15 Minutes', '30 Minutes', '45 Minutes', '60 Minutes'];

  // Preview panel computed values
  const getExpectedTopics = () => {
    if (interviewType === 'Coding Interview') {
      return domain === 'DSA' ? [`DSA in ${subLanguage || 'Java'}`, 'Time Complexity', 'Space Complexity'] : [domain || 'Coding Concepts', 'Logical optimization'];
    }
    if (interviewType === 'Technical Interview') {
      return [domain || 'Core Theory', 'OOP concepts', 'Conceptual definitions'];
    }
    if (interviewType === 'Project Discussion') {
      return [projectName || 'Project Architecture', 'Tech Stack Bottlenecks', 'Database & API scalability'];
    }
    if (interviewType === 'System Design Interview') {
      return ['Scalability & Latency', 'Caching & CDNs', 'Load Balancing & Redundancy', 'SQL vs NoSQL'];
    }
    if (interviewType === 'Resume Interview') {
      return ['Resume Projects', 'Resume Skills Verification', 'Work Experience Drilldown'];
    }
    return ['STAR framework questions', 'Situation Handling', 'Leadership Principles'];
  };

  const getEstimatedQuestions = () => {
    const mins = parseInt(duration);
    if (isNaN(mins)) return 6;
    if (interviewType === 'Coding Interview') return mins >= 45 ? 2 : 1;
    if (interviewType === 'System Design Interview') return 1;
    return Math.round(mins / 3);
  };

  const handleLaunchRequest = () => {
    setShowCheckModal(true);
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews/create', {
        interviewType,
        role: role || 'Software Engineer',
        difficulty,
        duration,
        resumeSkills,
        resumeText,
        domain,
        subLanguage,
        projectName,
        projectDescription
      });
      navigate(`/interview/live/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Dynamic background lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden relative z-10">
        <Navbar subtitle="Mock Practice Mode Setup" />

        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-4 md:p-6 min-h-0">
          
          {/* LEFT COLUMN: Dynamic Config Form */}
          <div className="flex-1 flex flex-col overflow-y-auto pr-1 no-scrollbar gap-6 pb-6">
            
            {/* Intro */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Mock Practice Chamber
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Configure Your Live Session</h1>
              <p className="text-slate-400 text-xs mt-0.5">Select a practice mode and customize variables. Mock mode does not count toward company placement simulation scores.</p>
            </div>

            {/* STEP 1: Archetype Cards */}
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Step 1: Choose Mock Archetype</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {interviewTypes.map((type) => {
                  const isSelected = interviewType === type.id;
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setInterviewType(type.id);
                        setDomain('');
                        setSubLanguage('');
                      }}
                      className={`relative rounded-2xl cursor-pointer border p-4 flex flex-col justify-between transition-all duration-300 min-h-[130px] ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                          {type.icon}
                        </div>
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                          {type.time}
                        </span>
                      </div>
                      <div className="mt-3">
                        <h4 className="font-bold text-sm text-white">{type.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{type.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                          <FaCheck className="text-white text-[8px]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Dynamic Fields Section */}
            <div className="space-y-4 border-t border-white/[0.06] pt-5">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Step 2: Dynamic Setup Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tech Domain / Coding Domain */}
                {interviewType === 'Technical Interview' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Technical Domain</label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Select Domain --</option>
                      {technicalDomains.map((d) => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {interviewType === 'Coding Interview' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Coding Domain</label>
                    <select
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        if (e.target.value !== 'DSA') setSubLanguage('');
                      }}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Select Domain --</option>
                      {codingDomains.map((d) => (
                        <option key={d} value={d} className="bg-slate-900">{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub language selector if coding domain is DSA */}
                {interviewType === 'Coding Interview' && domain === 'DSA' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Programming Language</label>
                    <select
                      value={subLanguage}
                      onChange={(e) => setSubLanguage(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="">-- Select Language --</option>
                      {dsaLanguages.map((l) => (
                        <option key={l} value={l} className="bg-slate-900">{l}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Role input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="bg-slate-900">{r}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Difficulty</label>
                  <div className="flex gap-2">
                    {difficulties.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                          difficulty === d ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {durations.map((d) => (
                      <option key={d} value={d} className="bg-slate-900">{d}</option>
                    ))}
                  </select>
                </div>

                {/* Resume Upload if Resume Interview */}
                {interviewType === 'Resume Interview' && (
                  <div className="space-y-1.5 md:col-span-2 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Resume Document</span>
                    {uploadedResumeName ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/5 py-3 rounded-xl border border-emerald-500/15">
                        <CheckCircle2 className="w-4 h-4" /> Loaded: {uploadedResumeName}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 py-3">
                        Please upload a resume on the Analyzer Dashboard first to run a Resume-based Practice session.
                      </div>
                    )}
                  </div>
                )}

                {/* Project Specs if Project Discussion */}
                {interviewType === 'Project Discussion' && (
                  <div className="md:col-span-2 grid grid-cols-1 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Name</label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., E-Commerce Gateway, Image Clustering Tool"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Description &amp; Tech Stack</label>
                      <textarea
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="e.g., Built with React, FastAPI, PostgreSQL. Features Redis caching, OAuth, and Dockerized deployment workflows."
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-20"
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Preview Panel */}
          <div className="w-full lg:w-[360px] flex-shrink-0 flex flex-col justify-between bg-slate-900/30 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden h-fit lg:max-h-[85vh]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Selected Configuration</h3>
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    {interviewTypes.find(t => t.id === interviewType)?.icon || <FaLaptopCode className="text-xl text-blue-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{interviewType}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Role: {role}</p>
                  </div>
                </div>
              </div>

              {/* Summary Lists */}
              <div className="space-y-3 font-semibold text-xs text-slate-300">
                <div className="flex justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="text-white">{difficulty}</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-slate-500">Est. Questions</span>
                  <span className="text-white">{getEstimatedQuestions()} Questions</span>
                </div>
                <div className="flex justify-between border-b border-white/[0.05] pb-2">
                  <span className="text-slate-500">Duration Limit</span>
                  <span className="text-white">{duration}</span>
                </div>
                {domain && (
                  <div className="flex justify-between border-b border-white/[0.05] pb-2">
                    <span className="text-slate-500">Domain</span>
                    <span className="text-white">{domain} {subLanguage ? `(${subLanguage})` : ''}</span>
                  </div>
                )}
              </div>

              {/* Expected Topics */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Expected Topics Covered</span>
                <div className="flex flex-wrap gap-1.5">
                  {getExpectedTopics().map((topic, idx) => (
                    <span key={idx} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-1 rounded-lg">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLaunchRequest}
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 py-3.5 rounded-2xl text-xs font-black text-white shadow-lg tracking-wider flex items-center justify-center gap-2 group transition-all"
              >
                <span>Launch Mock Chamber</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

          </div>

        </main>
      </div>

      {/* HARDWARE CHECK MODAL OVERLAY */}
      <AnimatePresence>
        {showCheckModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative"
            >
              <h2 className="text-xl font-black text-white text-center mb-6">Pre-Interview Diagnostics</h2>
              
              <div className="space-y-4 mb-8">
                {/* Microphone Check */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaMicrophone className={micGranted ? 'text-emerald-400' : 'text-slate-500'} />
                    <div>
                      <h4 className="text-xs font-bold text-white">Microphone Status</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Required for speech evaluation</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${micGranted ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {micGranted ? 'Active' : 'Unavailable'}
                  </span>
                </div>

                {/* Camera Check */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaVideo className={camGranted ? 'text-emerald-400' : 'text-slate-500'} />
                    <div>
                      <h4 className="text-xs font-bold text-white">Camera Check</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Required for body posture scans</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${camGranted ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {camGranted ? 'Granted' : 'Not Evaluated'}
                  </span>
                </div>

                {/* Speaker check */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Volume2 className={speakerCheck ? 'text-emerald-400' : 'text-slate-500'} />
                    <div>
                      <h4 className="text-xs font-bold text-white">Speaker Check</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Sarah's verbal speech synth output</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Ready</span>
                </div>

                {/* Internet latency check */}
                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Wifi className={internetStatus ? 'text-emerald-400' : 'text-rose-400'} />
                    <div>
                      <h4 className="text-xs font-bold text-white">Internet Connection</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Real-time sync performance</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${internetStatus ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {internetStatus ? 'Optimal' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Recommendation Tips Banner */}
              <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl mb-8 text-left text-[11px] text-indigo-300 leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">🖥️ Recommendation: Fullscreen Mode</span>
                Practice in a quiet environment, maximize this browser window, and minimize notifications to simulate a professional recruitment board interview.
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel Setup
                </button>
                <button
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <>
                      <span>Start Practice</span>
                      <FaArrowRight className="text-[8px]" />
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InterviewSetup;
