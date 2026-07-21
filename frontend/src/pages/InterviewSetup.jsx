import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLaptopCode, FaUserTie, FaCode, FaFileAlt,
  FaArrowRight, FaArrowLeft, FaCheck,
  FaBolt, FaClock, FaLayerGroup, FaBriefcase,
  FaVideo, FaMicrophone, FaExclamationTriangle,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { Mic, Sparkles, Play, Zap, Brain, Shield, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

// ── Animated waveform ──────────────────────────────────────────────────────────
const Waveform = () => (
  <div className="flex items-center gap-0.5 h-8">
    {Array.from({ length: 18 }).map((_, i) => (
      <motion.div
        key={i}
        className="w-0.5 rounded-full bg-gradient-to-t from-cyan-500 to-teal-400"
        animate={{ height: [6, Math.random() * 24 + 6, 6] }}
        transition={{ duration: 0.8 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── Floating blob ──────────────────────────────────────────────────────────────
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

const InterviewSetup = () => {
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [camGranted, setCamGranted] = useState(null);
  const [micGranted, setMicGranted] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const resumeSkills = location.state?.resumeSkills || [];
  const resumeText   = location.state?.resumeText   || '';

  const [interviewType, setInterviewType] = useState(resumeSkills.length > 0 ? 'Resume Based Interview' : '');
  const [domain, setDomain] = useState('');
  const [subLanguage, setSubLanguage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [role, setRole]         = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' })
        .then(p => setCamGranted(p.state === 'granted'))
        .catch(() => setCamGranted(false));
      navigator.permissions.query({ name: 'microphone' })
        .then(p => setMicGranted(p.state === 'granted'))
        .catch(() => setMicGranted(false));
    }
  }, []);

  const interviewTypes = [
    { id: 'Technical Interview', icon: '💻', title: 'Technical Interview', desc: 'Drills on core programming fundamentals and concepts.', gradient: 'from-indigo-500 to-purple-600', glow: 'rgba(99,102,241,0.4)' },
    { id: 'Coding Interview', icon: '📝', title: 'Coding Interview', desc: 'Real-time algorithms or domain-specific coding exercises.', gradient: 'from-emerald-500 to-teal-600', glow: 'rgba(16,185,129,0.4)' },
    { id: 'HR Interview', icon: '👔', title: 'HR Interview', desc: 'Corporate screening, strengths, goals, and culture fit.', gradient: 'from-pink-500 to-rose-600', glow: 'rgba(236,72,153,0.4)' },
    { id: 'Resume Interview', icon: '📄', title: 'Resume Interview', desc: 'Questions tailored strictly to your uploaded resume profile.', gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.4)' },
    { id: 'Behavioral Interview', icon: '🧠', title: 'Behavioral Interview', desc: 'STAR methodology questions evaluating core principles.', gradient: 'from-purple-500 to-indigo-600', glow: 'rgba(139,92,246,0.4)' },
    { id: 'Project Discussion', icon: '🚀', title: 'Project Discussion', desc: 'Technical discussion focusing strictly on one of your projects.', gradient: 'from-teal-500 to-emerald-600', glow: 'rgba(20,184,166,0.4)' },
    { id: 'System Design Interview', icon: '🏗️', title: 'System Design', desc: 'Architecting large-scale systems and handling trade-offs.', gradient: 'from-blue-500 to-cyan-600', glow: 'rgba(59,130,246,0.4)' }
  ];

  const technicalDomains = [
    'Programming Fundamentals', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks',
    'Software Engineering', 'Java', 'Python', 'JavaScript', 'C++', 'C', 'React',
    'Node.js', 'Express.js', 'MongoDB', 'Cloud', 'DevOps', 'Git', 'REST APIs', 'Linux'
  ];

  const codingDomains = [
    'DSA', 'SQL', 'JavaScript', 'Java', 'Python', 'C++', 'C', 'React', 'Node.js',
    'Express.js', 'HTML/CSS', 'MongoDB', 'API Development'
  ];

  const dsaLanguages = ['Java', 'Python', 'C++', 'C'];

  const roles = [
    { label: 'Frontend Developer',       icon: '🎨' },
    { label: 'Backend Developer',        icon: '⚙️' },
    { label: 'Full Stack Developer',     icon: '🔧' },
    { label: 'Java Developer',           icon: '☕' },
    { label: 'Python Developer',         icon: '🐍' },
    { label: 'Software Engineer',        icon: '💻' },
    { label: 'SDE',                      icon: '💻' },
    { label: 'SDE Intern',               icon: '🎓' },
    { label: 'Data Analyst',             icon: '📊' },
    { label: 'AI Engineer',              icon: '🤖' },
    { label: 'ML Engineer',              icon: '🤖' },
    { label: 'Cloud Engineer',           icon: '☁️' },
    { label: 'DevOps Engineer',          icon: '♾️' },
    { label: 'QA Engineer',              icon: '🛡️' }
  ];

  const difficulties = [
    { id: 'Beginner',     icon: '🌱', color: 'from-green-500 to-emerald-600',  desc: 'Easy concepts' },
    { id: 'Intermediate', icon: '🔥', color: 'from-yellow-500 to-amber-600',   desc: 'Mid level scenarios'      },
    { id: 'Advanced',     icon: '⚡', color: 'from-red-500 to-rose-600',       desc: 'Hard trade-offs'       },
  ];

  const durations = [
    { id: '10 Minutes', desc: 'Warmup' },
    { id: '20 Minutes', desc: 'Quick assessment' },
    { id: '30 Minutes', desc: 'Standard drill' },
    { id: '45 Minutes', desc: 'Deep dive check' },
    { id: '60 Minutes', desc: 'Comprehensive' }
  ];

  const steps = ['Type', 'Domain', 'Role', 'Settings', 'Launch'];

  const needsDomainStep = (type) => {
    return ['Technical Interview', 'Coding Interview', 'Project Discussion'].includes(type);
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews/create', { 
        interviewType, 
        role: role || 'Candidate', 
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

  const nextStep = () => {
    if (step === 1 && !interviewType) return alert('Please select an interview type');
    if (step === 1) {
      if (needsDomainStep(interviewType)) {
        setStep(2);
      } else {
        setStep(3);
      }
      return;
    }
    if (step === 2) {
      if (interviewType === 'Technical Interview' && !domain) return alert('Please select a technical domain');
      if (interviewType === 'Coding Interview' && !domain) return alert('Please select a coding domain');
      if (interviewType === 'Coding Interview' && domain === 'DSA' && !subLanguage) return alert('Please select a programming language for DSA');
      if (interviewType === 'Project Discussion' && (!projectName || !projectDescription)) return alert('Please enter project name and tech details');
      setStep(3);
      return;
    }
    if (step === 3 && !role) return alert('Please select a target role');
    if (step === 4 && (!difficulty || !duration)) return alert('Please select difficulty and duration');
    setStep(p => p + 1);
  };

  const prevStep = () => {
    if (step === 3) {
      if (needsDomainStep(interviewType)) {
        setStep(2);
      } else {
        setStep(1);
      }
      return;
    }
    setStep(p => p - 1);
  };

  const PermBadge = ({ granted, label, Icon }) => {
    const isGranted = granted === true;
    const isNeeded  = granted === false;
    return (
      <div className={`flex items-center gap-2.5 rounded-xl px-4 py-3 border flex-1 backdrop-blur-sm ${
        isGranted ? 'bg-emerald-500/10 border-emerald-500/20' : isNeeded ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/[0.03] border-white/[0.07]'
      }`}>
        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${isGranted ? 'bg-emerald-500' : isNeeded ? 'bg-amber-500' : 'bg-zinc-700'}`}>
          {isGranted ? <FaCheck className="text-white text-[8px]" /> : isNeeded ? <FaExclamationTriangle className="text-white text-[8px]" /> : <span className="text-white text-[9px]">?</span>}
        </div>
        <Icon className={`text-sm flex-shrink-0 ${isGranted ? 'text-emerald-400' : isNeeded ? 'text-amber-400' : 'text-zinc-500'}`} />
        <span className="text-sm text-zinc-300 flex-1 font-medium">{label}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isGranted ? 'text-emerald-400' : isNeeded ? 'text-amber-400' : 'text-zinc-500'}`}>
          {isGranted ? 'Granted' : isNeeded ? 'Needed' : '…'}
        </span>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Blob cx={10} cy={20}  color="rgba(6,182,212,0.6)"  r={500} delay={0} />
        <Blob cx={90} cy={15}  color="rgba(99,102,241,0.5)" r={380} delay={3} />
        <Blob cx={60} cy={85}  color="rgba(16,185,129,0.4)" r={350} delay={6} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.6) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar title="Configure Your Interview" subtitle="Set up your AI-powered mock session" />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

          <div className="flex-1 flex flex-col overflow-hidden px-6 pt-5 pb-0">

            {/* ── Stepper ── */}
            <div className="flex-shrink-0 mb-6">
              <div className="flex items-center justify-between relative max-w-2xl mx-auto w-full">
                {/* Progress track */}
                <div className="absolute top-5 left-[7%] right-[7%] h-px bg-white/[0.07] z-0">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    animate={{ width: `${((step - 1) / 4) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                </div>
                {steps.map((label, i) => {
                  const s = i + 1;
                  const done   = step > s;
                  const active = step === s;
                  return (
                    <div key={s} className="flex flex-col items-center relative z-10">
                      <motion.div
                        animate={{
                          scale: active ? 1.12 : 1,
                          boxShadow: active ? '0 0 20px rgba(6,182,212,0.5)' : done ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                          done   ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-transparent text-white'
                          : active ? 'bg-background border-cyan-500 text-cyan-400'
                                   : 'bg-white/[0.03] border-white/10 text-zinc-600'
                        }`}
                      >
                        {done ? <FaCheck className="text-xs" /> : s}
                      </motion.div>
                      <p className={`text-xs mt-1.5 font-semibold tracking-wide ${active ? 'text-cyan-400' : done ? 'text-indigo-400' : 'text-zinc-600'}`}>{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Step Content ── */}
            <div className="flex-1 min-h-0">
              <AnimatePresence mode="wait">

                {/* STEP 1 – Type */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="h-full flex flex-col">
                    <div className="text-center mb-4 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-1">
                        <HiSparkles /> Step 1 of 5 · Choose Mode
                      </motion.div>
                      <h2 className="text-xl font-black text-white tracking-tight">Select Practice Interview Mode</h2>
                      <p className="text-zinc-500 text-xs mt-0.5">Pick a mock interview archetype from our practice catalog</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-1 no-scrollbar max-h-[350px] pb-4">
                      {interviewTypes.map((type) => {
                        const sel = interviewType === type.id;
                        return (
                          <motion.div
                            key={type.id}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setInterviewType(type.id);
                              setDomain('');
                              setSubLanguage('');
                            }}
                            className={`relative rounded-xl cursor-pointer border p-3 flex items-center gap-3.5 transition-all duration-200 ${
                              sel
                                ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-lg shadow-indigo-500/10'
                                : 'border-white/[0.07] bg-white/[0.02] text-zinc-300 hover:border-white/15'
                            }`}
                          >
                            <div className="text-xl flex-shrink-0 w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">{type.icon}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-white truncate">{type.title}</h4>
                              <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">{type.desc}</p>
                            </div>
                            {sel && (
                              <div className="h-4.5 w-4.5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/50">
                                <FaCheck className="text-white text-[7px]" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 – Domain Selection */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="h-full flex flex-col">
                    {interviewType === 'Technical Interview' && (
                      <div className="flex flex-col h-full">
                        <div className="text-center mb-4 flex-shrink-0">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-1">
                            <FaLayerGroup className="text-xs" /> Step 2 of 5 · Choose Technical Domain
                          </motion.div>
                          <h2 className="text-xl font-black text-white">Choose ONE Technical Domain</h2>
                          <p className="text-zinc-500 text-xs mt-0.5">The interview questions will remain strictly focused within this domain</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 overflow-y-auto pr-1 no-scrollbar max-h-[340px] pb-4">
                          {technicalDomains.map((tDomain) => {
                            const sel = domain === tDomain;
                            return (
                              <motion.button
                                key={tDomain}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDomain(tDomain)}
                                className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                                  sel
                                    ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-lg shadow-indigo-500/10 font-bold'
                                    : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/15'
                                }`}
                              >
                                <span className="text-xs">{tDomain}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {interviewType === 'Coding Interview' && (
                      <div className="flex flex-col h-full">
                        <div className="text-center mb-4 flex-shrink-0">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-1">
                            <FaLayerGroup className="text-xs" /> Step 2 of 5 · Choose Coding Domain
                          </motion.div>
                          <h2 className="text-xl font-black text-white">Choose ONE Coding Domain</h2>
                          <p className="text-zinc-500 text-xs mt-0.5">The coding challenges will remain strictly focused within this domain</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar max-h-[350px] space-y-4 pb-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {codingDomains.map((cDomain) => {
                              const sel = domain === cDomain;
                              return (
                                <motion.button
                                  key={cDomain}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setDomain(cDomain);
                                    if (cDomain !== 'DSA') setSubLanguage('');
                                  }}
                                  className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                                    sel
                                      ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-lg shadow-indigo-500/10 font-bold'
                                      : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/15'
                                  }`}
                                >
                                  <span className="text-xs">{cDomain}</span>
                                </motion.button>
                              );
                            })}
                          </div>

                          {domain === 'DSA' && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-white/[0.06] bg-white/[0.01] rounded-2xl p-4 space-y-3"
                            >
                              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Choose Programming Language</h3>
                              <p className="text-[10px] text-zinc-500">DSA challenges will be formulated and written in your chosen language</p>
                              <div className="grid grid-cols-4 gap-2.5">
                                {dsaLanguages.map((lang) => {
                                  const selLang = subLanguage === lang;
                                  return (
                                    <motion.button
                                      key={lang}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => setSubLanguage(lang)}
                                      className={`rounded-xl border py-2 text-center transition-all duration-200 ${
                                        selLang
                                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md font-bold'
                                          : 'border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/15'
                                      }`}
                                    >
                                      <span className="text-xs">{lang}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}

                    {interviewType === 'Project Discussion' && (
                      <div className="flex flex-col h-full max-w-xl mx-auto w-full">
                        <div className="text-center mb-4 flex-shrink-0">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-1">
                            <FaLayerGroup className="text-xs" /> Step 2 of 5 · Project Details
                          </motion.div>
                          <h2 className="text-xl font-black text-white">Enter Project Specs</h2>
                          <p className="text-zinc-500 text-xs mt-0.5">The AI will evaluate and drill you on the details of this specific project</p>
                        </div>
                        <div className="space-y-4 flex-1">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Name</label>
                            <input 
                              type="text" 
                              value={projectName} 
                              onChange={(e) => setProjectName(e.target.value)} 
                              placeholder="e.g. E-Commerce Microservices, Portfolio Platform..."
                              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tech Stack &amp; Description</label>
                            <textarea 
                              value={projectDescription} 
                              onChange={(e) => setProjectDescription(e.target.value)} 
                              placeholder="e.g. Built using React, Node.js, Express, MongoDB, and Redis. Features JWT authentication, caching, load balancing, and Docker deployment..."
                              rows={3}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3 – Role */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="h-full flex flex-col">
                    <div className="text-center mb-5 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-2">
                        <FaBriefcase className="text-xs" /> Step 3 of 5 · Target Role
                      </motion.div>
                      <h2 className="text-xl font-black text-white">What position are you targeting?</h2>
                      <p className="text-zinc-500 text-xs mt-1">AI will personalize your interview based on your target role</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto no-scrollbar max-h-[340px] pb-4">
                      {roles.map(({ label, icon }, ri) => {
                        const sel = role === label;
                        return (
                          <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ri * 0.04 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setRole(label)}
                            className={`rounded-xl cursor-pointer border flex items-center gap-2.5 px-4 py-3 transition-all duration-300 ${
                              sel ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/[0.03] border-white/[0.07] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="text-lg">{icon}</span>
                            <span className="font-semibold text-xs flex-1 truncate">{label}</span>
                            {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/50"><FaCheck className="text-white text-[7px]" /></motion.div>}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 – Settings */}
                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="h-full flex flex-col max-w-2xl mx-auto w-full">
                    <div className="text-center mb-4 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-2">
                        <FaLayerGroup className="text-xs" /> Step 4 of 5 · Customize Settings
                      </motion.div>
                      <h2 className="text-xl font-black text-white">Configure your session</h2>
                      <p className="text-zinc-500 text-xs mt-1">Set difficulty and duration for your interview</p>
                    </div>

                    <div className="flex-1 min-h-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                      {/* Difficulty */}
                      <div className="flex-shrink-0">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Difficulty Level</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {difficulties.map(d => {
                            const sel = difficulty === d.id;
                            return (
                              <motion.div key={d.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setDifficulty(d.id)}
                                className={`rounded-xl cursor-pointer border text-center py-2.5 px-2 transition-all duration-200 ${sel ? `bg-gradient-to-br ${d.color} border-transparent text-white shadow-lg` : 'bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:border-white/20'}`}>
                                <div className="text-xl mb-0.5">{d.icon}</div>
                                <div className="font-bold text-xs">{d.id}</div>
                                <div className={`text-[10px] mt-0.5 ${sel ? 'text-white/70' : 'text-zinc-600'}`}>{d.desc}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex-shrink-0">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Session Duration</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {durations.map(d => {
                            const sel = duration === d.id;
                            return (
                              <motion.div key={d.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setDuration(d.id)}
                                className={`rounded-xl cursor-pointer border flex flex-col items-center py-2.5 px-1 gap-1 transition-all duration-200 ${sel ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:border-white/20'}`}>
                                <FaClock className={`text-xs ${sel ? 'text-cyan-400' : 'text-zinc-500'}`} />
                                <div className="font-bold text-[10px] whitespace-nowrap">{d.id}</div>
                                <div className={`text-[9px] ${sel ? 'text-cyan-400' : 'text-zinc-600'}`}>{d.desc}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="flex-shrink-0 border-t border-white/[0.06] pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-3.5 w-3.5 text-zinc-500" />
                          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Permissions</h3>
                        </div>
                        <div className="flex gap-3">
                          <PermBadge granted={camGranted} label="Camera" Icon={FaVideo} />
                          <PermBadge granted={micGranted} label="Microphone" Icon={FaMicrophone} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5 – Launch */}
                {step === 5 && (
                  <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, type: 'spring', stiffness: 200 }} className="h-full flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center">
                    {/* Animated AI brain */}
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-[-20px] rounded-full border border-dashed border-cyan-500/20"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40"
                      >
                        <Brain className="h-10 w-10 text-white" />
                      </motion.div>
                      <motion.div animate={{ scale: [1.2, 1.6, 1.2], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute inset-0 rounded-3xl bg-indigo-500/30" />
                    </div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <h2 className="text-2xl font-black text-white mb-1 tracking-tight">All Systems Ready!</h2>
                      <p className="text-zinc-400 text-xs mb-4">Your AI interviewer is configured and waiting.</p>
                    </motion.div>

                    {/* Summary card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-4 mb-4 text-left">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.06] pb-2.5 mb-3">Interview Configuration</h3>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Type',        value: interviewType, icon: '📋' },
                          ...(needsDomainStep(interviewType) && domain ? [{ label: 'Domain', value: domain + (subLanguage ? ` (${subLanguage})` : ''), icon: '🗂️' }] : []),
                          ...(interviewType === 'Project Discussion' && projectName ? [{ label: 'Project', value: projectName, icon: '🚀' }] : []),
                          { label: 'Target Role', value: role,          icon: '👤' },
                          { label: 'Difficulty',  value: difficulty,    icon: '⚡' },
                          { label: 'Duration',    value: duration,      icon: '⏱️' },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs"><span>{icon}</span>{label}</div>
                            <span className="text-white font-semibold text-xs rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1">{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="w-full"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(99,102,241,0.6)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleStartInterview}
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 py-3.5 text-base font-black text-white shadow-2xl shadow-indigo-600/30 transition-all disabled:opacity-60"
                      >
                        {loading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : (
                          <>
                            <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            Launch AI Interview
                            <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Bottom Nav ── */}
            <div className="flex-shrink-0 border-t border-white/[0.06] mt-4 py-4 flex items-center justify-between">
              <motion.button
                whileHover={step > 1 ? { scale: 1.03 } : {}}
                whileTap={step > 1 ? { scale: 0.97 } : {}}
                onClick={prevStep}
                disabled={step === 1 || loading}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-sm transition-all ${
                  step === 1 ? 'opacity-0 pointer-events-none' : 'border border-white/[0.07] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <FaArrowLeft className="text-xs" /> Back
              </motion.button>

              <div className="flex items-center gap-2">
                {steps.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${step === i + 1 ? 'w-6 h-1.5 bg-cyan-500' : step > i + 1 ? 'w-1.5 h-1.5 bg-indigo-500' : 'w-1.5 h-1.5 bg-white/10'}`} />
                ))}
              </div>

              {step < 5 ? (
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={nextStep}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-2.5 font-semibold text-sm text-white shadow-lg"
                >
                  Next <FaArrowRight className="text-xs" />
                </motion.button>
              ) : (
                <div className="w-24" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
