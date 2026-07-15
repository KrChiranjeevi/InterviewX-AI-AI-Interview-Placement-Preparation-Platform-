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
    { id: 'Technical Interview',    icon: <FaLaptopCode />, title: 'Technical',    desc: 'Programming, frameworks & databases.',    gradient: 'from-indigo-500 to-purple-600',  glow: 'rgba(99,102,241,0.4)'  },
    { id: 'HR Interview',           icon: <FaUserTie />,    title: 'HR Round',     desc: 'Behavioral & communication skills.',       gradient: 'from-pink-500 to-rose-600',      glow: 'rgba(236,72,153,0.4)'  },
    { id: 'Coding Interview',       icon: <FaCode />,       title: 'Coding',       desc: 'Algorithms with real-time AI feedback.',   gradient: 'from-emerald-500 to-teal-600',   glow: 'rgba(16,185,129,0.4)'  },
    { id: 'Resume Based Interview', icon: <FaFileAlt />,    title: 'Resume Based', desc: 'AI generates questions from your resume.', gradient: 'from-amber-500 to-orange-600',   glow: 'rgba(245,158,11,0.4)'  },
  ];

  const roles = [
    { label: 'Frontend Developer',       icon: '🎨' },
    { label: 'Backend Developer',        icon: '⚙️' },
    { label: 'Full Stack Developer',     icon: '🔧' },
    { label: 'Java Developer',           icon: '☕' },
    { label: 'Data Analyst',             icon: '📊' },
    { label: 'AI Engineer',              icon: '🤖' },
    { label: 'Software Engineer Intern', icon: '🎓' },
  ];

  const difficulties = [
    { id: 'Beginner',     icon: '🌱', color: 'from-green-500 to-emerald-600',  desc: 'Fundamentals' },
    { id: 'Intermediate', icon: '🔥', color: 'from-yellow-500 to-amber-600',   desc: 'Applied'      },
    { id: 'Advanced',     icon: '⚡', color: 'from-red-500 to-rose-600',       desc: 'Expert'       },
  ];

  const durations = [
    { id: '15 min', desc: 'Quick warmup'    },
    { id: '30 min', desc: 'Standard session' },
    { id: '45 min', desc: 'Deep dive'       },
  ];

  const steps = ['Type', 'Role', 'Settings', 'Launch'];

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews/create', { interviewType, role: role || 'Candidate', difficulty, duration, resumeSkills, resumeText });
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
    if (step === 1 && interviewType === 'Resume Based Interview') { setRole('Resume Profile'); setStep(3); return; }
    if (step === 2 && !role) return alert('Please select a role');
    if (step === 3 && (!difficulty || !duration)) return alert('Please select difficulty and duration');
    setStep(p => p + 1);
  };
  const prevStep = () => {
    if (step === 3 && interviewType === 'Resume Based Interview') { setStep(1); return; }
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
                    animate={{ width: `${((step - 1) / 3) * 100}%` }}
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
                    <div className="text-center mb-5 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-2">
                        <HiSparkles /> Step 1 of 4 · Choose Mode
                      </motion.div>
                      <h2 className="text-2xl font-black text-white tracking-tight">What type of interview?</h2>
                      <p className="text-zinc-500 text-sm mt-1">Select the mode that matches your preparation goal</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                      {interviewTypes.map((type, ti) => {
                        const sel = interviewType === type.id;
                        return (
                          <motion.div
                            key={type.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ti * 0.07 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setInterviewType(type.id)}
                            className={`relative rounded-2xl cursor-pointer border-2 p-5 flex flex-col transition-all duration-300 overflow-hidden ${
                              sel ? 'border-transparent bg-gradient-to-br from-white/[0.07] to-white/[0.03]' : 'border-white/[0.07] bg-white/[0.03] hover:border-white/15'
                            }`}
                            style={sel ? { boxShadow: `0 0 30px ${type.glow}, inset 0 0 0 2px ${type.glow.replace('0.4', '0.6')}` } : {}}
                          >
                            {/* Glow blob */}
                            {sel && <div className="absolute inset-0 opacity-10 bg-gradient-to-br pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, ${type.glow.replace('0.4', '0.5')}, transparent 60%)` }} />}

                            {sel && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3 h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <FaCheck className="text-white text-[8px]" />
                              </motion.div>
                            )}

                            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white bg-gradient-to-br ${type.gradient} shadow-lg mb-3`} style={{ boxShadow: sel ? `0 4px 20px ${type.glow}` : 'none' }}>
                              {type.icon}
                            </div>
                            <h3 className="relative z-10 text-base font-bold text-white mb-1">{type.title}</h3>
                            <p className="relative z-10 text-zinc-400 text-xs leading-relaxed">{type.desc}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 – Role */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="h-full flex flex-col">
                    <div className="text-center mb-5 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-2">
                        <FaBriefcase className="text-xs" /> Step 2 of 4 · Target Role
                      </motion.div>
                      <h2 className="text-2xl font-black text-white">What position are you targeting?</h2>
                      <p className="text-zinc-500 text-sm mt-1">AI will personalize your interview based on your role</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 content-start overflow-y-auto no-scrollbar">
                      {roles.map(({ label, icon }, ri) => {
                        const sel = role === label;
                        return (
                          <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ri * 0.06 }}
                            whileHover={{ y: -3, scale: 1.01 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setRole(label)}
                            className={`rounded-xl cursor-pointer border-2 flex items-center gap-3 px-4 py-3.5 transition-all duration-300 ${
                              sel ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/[0.03] border-white/[0.07] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="text-xl">{icon}</span>
                            <span className="font-semibold text-sm flex-1">{label}</span>
                            {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><FaCheck className="text-white text-[8px]" /></motion.div>}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 – Settings */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="h-full flex flex-col max-w-2xl mx-auto w-full">
                    <div className="text-center mb-4 flex-shrink-0">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }} className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-cyan-300 text-xs font-semibold mb-2">
                        <FaLayerGroup className="text-xs" /> Step 3 of 4 · Customize
                      </motion.div>
                      <h2 className="text-2xl font-black text-white">Configure your session</h2>
                      <p className="text-zinc-500 text-sm mt-1">Set difficulty and duration for your interview</p>
                    </div>

                    <div className="flex-1 min-h-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-5 flex flex-col gap-5">
                      {/* Difficulty */}
                      <div className="flex-shrink-0">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Difficulty Level</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {difficulties.map(d => {
                            const sel = difficulty === d.id;
                            return (
                              <motion.div key={d.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setDifficulty(d.id)}
                                className={`rounded-xl cursor-pointer border-2 text-center py-3.5 px-2 transition-all ${sel ? `bg-gradient-to-br ${d.color} border-transparent text-white shadow-lg` : 'bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:border-white/20'}`}>
                                <div className="text-2xl mb-1">{d.icon}</div>
                                <div className="font-bold text-sm">{d.id}</div>
                                <div className={`text-[11px] mt-0.5 ${sel ? 'text-white/70' : 'text-zinc-600'}`}>{d.desc}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex-shrink-0">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Session Duration</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {durations.map(d => {
                            const sel = duration === d.id;
                            return (
                              <motion.div key={d.id} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => setDuration(d.id)}
                                className={`rounded-xl cursor-pointer border-2 flex flex-col items-center py-3.5 px-2 gap-1.5 transition-all ${sel ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/20' : 'bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:border-white/20'}`}>
                                <FaClock className={`text-base ${sel ? 'text-cyan-400' : 'text-zinc-500'}`} />
                                <div className="font-bold text-sm">{d.id}</div>
                                <div className={`text-[11px] ${sel ? 'text-cyan-400' : 'text-zinc-600'}`}>{d.desc}</div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="flex-shrink-0 border-t border-white/[0.06] pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-3.5 w-3.5 text-zinc-500" />
                          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Permissions</h3>
                        </div>
                        <div className="flex gap-3">
                          <PermBadge granted={camGranted} label="Camera" Icon={FaVideo} />
                          <PermBadge granted={micGranted} label="Microphone" Icon={FaMicrophone} />
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <Waveform />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 – Launch */}
                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, type: 'spring', stiffness: 200 }} className="h-full flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center">
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
                      <h2 className="text-3xl font-black text-white mb-1 tracking-tight">All Systems Ready!</h2>
                      <p className="text-zinc-400 text-sm mb-5">Your AI interviewer is configured and waiting.</p>
                    </motion.div>

                    {/* Summary card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-5 mb-5 text-left">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.06] pb-2.5 mb-3">Interview Configuration</h3>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Type',        value: interviewType, icon: '📋' },
                          { label: 'Target Role', value: role,          icon: '👤' },
                          { label: 'Difficulty',  value: difficulty,    icon: '⚡' },
                          { label: 'Duration',    value: duration,      icon: '⏱️' },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400 text-sm"><span>{icon}</span>{label}</div>
                            <span className="text-white font-semibold text-sm rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1">{value}</span>
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
                        className="group w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 py-4 text-base font-black text-white shadow-2xl shadow-indigo-600/30 transition-all disabled:opacity-60"
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

              {step < 4 ? (
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
