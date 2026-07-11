import { useState, useEffect } from 'react';
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
import api from '../services/api';

const InterviewSetup = () => {
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [camGranted, setCamGranted] = useState(null); // null=checking, true=granted, false=denied
  const [micGranted, setMicGranted] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();
  const resumeSkills = location.state?.resumeSkills || [];
  const resumeText = location.state?.resumeText || '';

  const [interviewType, setInterviewType] = useState(resumeSkills.length > 0 ? 'Resume Based Interview' : '');
  const [role, setRole]                   = useState('');
  const [difficulty, setDifficulty]       = useState('');
  const [duration, setDuration]           = useState('');

  // Check real browser permissions
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
    { id: 'Technical Interview',    icon: <FaLaptopCode />, title: 'Technical',    desc: 'Programming, frameworks & databases.',    gradient: 'from-indigo-500 to-purple-600' },
    { id: 'HR Interview',           icon: <FaUserTie />,    title: 'HR Round',     desc: 'Behavioral & communication skills.',       gradient: 'from-pink-500 to-rose-600'   },
    { id: 'Coding Interview',       icon: <FaCode />,       title: 'Coding',       desc: 'Algorithms with real-time AI feedback.',   gradient: 'from-emerald-500 to-teal-600' },
    { id: 'Resume Based Interview', icon: <FaFileAlt />,    title: 'Resume Based', desc: 'AI generates questions from your resume.', gradient: 'from-amber-500 to-orange-600' },
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
    { id: 'Beginner',     icon: '🌱', color: 'from-green-500 to-emerald-600', desc: 'Fundamentals' },
    { id: 'Intermediate', icon: '🔥', color: 'from-yellow-500 to-amber-600',  desc: 'Applied'      },
    { id: 'Advanced',     icon: '⚡', color: 'from-red-500 to-rose-600',      desc: 'Expert'       },
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
    if (step === 1 && interviewType === 'Resume Based Interview') {
      setRole('Resume Profile');
      setStep(3); // skip Role step
      return;
    }
    if (step === 2 && !role) return alert('Please select a role');
    if (step === 3 && (!difficulty || !duration)) return alert('Please select difficulty and duration');
    setStep(p => p + 1);
  };
  const prevStep = () => {
    if (step === 3 && interviewType === 'Resume Based Interview') {
      setStep(1);
      return;
    }
    setStep(p => p - 1);
  };

  /* ─── Permission badge helper ─── */
  const PermBadge = ({ granted, label, Icon }) => {
    const isGranted = granted === true;
    const isNeeded  = granted === false;
    return (
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border flex-1 ${
        isGranted ? 'bg-green-500/8 border-green-500/25'
        : isNeeded  ? 'bg-amber-500/8 border-amber-500/25'
                    : 'bg-slate-800/60 border-slate-700'
      }`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          isGranted ? 'bg-green-500' : isNeeded ? 'bg-amber-500' : 'bg-slate-600'
        }`}>
          {isGranted ? <FaCheck className="text-white text-[8px]" />
            : isNeeded ? <FaExclamationTriangle className="text-white text-[8px]" />
                       : <span className="text-white text-[8px]">?</span>}
        </div>
        <Icon className={`text-xs flex-shrink-0 ${isGranted ? 'text-green-400' : isNeeded ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="text-xs text-slate-300 flex-1">{label}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${
          isGranted ? 'text-green-400' : isNeeded ? 'text-amber-400' : 'text-slate-500'
        }`}>
          {isGranted ? 'Granted' : isNeeded ? 'Needed' : '…'}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar title="Configure Your Interview" />

        {/* ── Outer wrapper — flex column, no overflow ── */}
        <div className="flex-1 flex flex-col overflow-hidden px-8 pt-5 pb-0">

          {/* ── Stepper ── */}
          <div className="flex-shrink-0 mb-5">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-[6%] right-[6%] h-0.5 bg-slate-800 z-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
              </div>
              {steps.map((label, i) => {
                const s = i + 1;
                const done   = step > s;
                const active = step === s;
                return (
                  <div key={s} className="flex flex-col items-center relative z-10">
                    <motion.div
                      animate={{ scale: active ? 1.12 : 1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                        done   ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)]'
                        : active ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                               : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {done ? <FaCheck className="text-xs" /> : s}
                    </motion.div>
                    <p className={`text-xs mt-1.5 font-semibold ${active || done ? 'text-indigo-400' : 'text-slate-600'}`}>{label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Step content ── */}
          <div className="flex-1 min-h-0">
            <AnimatePresence mode="wait">

              {/* STEP 1 – Type */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}
                  className="h-full flex flex-col">
                  <div className="text-center mb-4 flex-shrink-0">
                    <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1 text-indigo-300 text-xs font-semibold mb-2">
                      <HiSparkles /> Step 1 of 4
                    </span>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Space Grotesk,sans-serif' }}>Choose Interview Type</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Select the type of interview you want to practice.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    {interviewTypes.map(type => {
                      const sel = interviewType === type.id;
                      return (
                        <motion.div key={type.id} whileHover={{ y:-3 }} whileTap={{ scale:0.97 }} onClick={() => setInterviewType(type.id)}
                          className={`rounded-2xl cursor-pointer border-2 p-5 flex flex-col transition-all duration-300 relative overflow-hidden ${
                            sel ? 'border-indigo-500 bg-indigo-600/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                          }`}>
                          {sel && <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><FaCheck className="text-white text-[8px]" /></div>}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg text-white bg-gradient-to-br ${type.gradient} shadow-lg mb-3`}>{type.icon}</div>
                          <h3 className="text-base font-bold text-white mb-1">{type.title}</h3>
                          <p className="text-slate-400 text-xs leading-relaxed">{type.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2 – Role */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}
                  className="h-full flex flex-col">
                  <div className="text-center mb-4 flex-shrink-0">
                    <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1 text-indigo-300 text-xs font-semibold mb-2">
                      <FaBriefcase className="text-xs" /> Step 2 of 4
                    </span>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Space Grotesk,sans-serif' }}>Select Target Role</h2>
                    <p className="text-slate-400 text-sm mt-0.5">What position are you interviewing for?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 content-start">
                    {roles.map(({ label, icon }) => {
                      const sel = role === label;
                      return (
                        <motion.div key={label} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }} onClick={() => setRole(label)}
                          className={`rounded-xl cursor-pointer border-2 flex items-center gap-3 px-4 py-3 transition-all duration-300 ${
                            sel ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800'
                          }`}>
                          <span className="text-xl">{icon}</span>
                          <span className="font-semibold text-sm flex-1">{label}</span>
                          {sel && <FaCheck className="text-white text-xs flex-shrink-0" />}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 3 – Settings */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }} transition={{ duration:0.25 }}
                  className="h-full flex flex-col max-w-2xl mx-auto w-full">
                  <div className="text-center mb-3 flex-shrink-0">
                    <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1 text-indigo-300 text-xs font-semibold mb-2">
                      <FaLayerGroup className="text-xs" /> Step 3 of 4
                    </span>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily:'Space Grotesk,sans-serif' }}>Interview Settings</h2>
                    <p className="text-slate-400 text-sm mt-0.5">Customize difficulty and session length.</p>
                  </div>

                  <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
                    {/* Difficulty */}
                    <div className="flex-shrink-0">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Difficulty Level</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {difficulties.map(d => {
                          const sel = difficulty === d.id;
                          return (
                            <motion.div key={d.id} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }} onClick={() => setDifficulty(d.id)}
                              className={`rounded-xl cursor-pointer border-2 text-center py-2.5 px-2 transition-all ${
                                sel ? `bg-gradient-to-br ${d.color} border-transparent text-white shadow-lg`
                                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}>
                              <div className="text-lg mb-0.5">{d.icon}</div>
                              <div className="font-bold text-xs">{d.id}</div>
                              <div className={`text-[10px] mt-0.5 ${sel ? 'text-white/70' : 'text-slate-500'}`}>{d.desc}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex-shrink-0">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Session Duration</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {durations.map(d => {
                          const sel = duration === d.id;
                          return (
                            <motion.div key={d.id} whileHover={{ y:-2 }} whileTap={{ scale:0.97 }} onClick={() => setDuration(d.id)}
                              className={`rounded-xl cursor-pointer border-2 flex flex-col items-center py-2.5 px-2 gap-1 transition-all ${
                                sel ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}>
                              <FaClock className={`text-sm ${sel ? 'text-indigo-400' : 'text-slate-500'}`} />
                              <div className="font-bold text-xs">{d.id}</div>
                              <div className={`text-[10px] ${sel ? 'text-indigo-400' : 'text-slate-500'}`}>{d.desc}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex-shrink-0 border-t border-slate-800 pt-3">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System Permissions</h3>
                      <div className="flex gap-3">
                        <PermBadge granted={camGranted} label="Camera Access" Icon={FaVideo} />
                        <PermBadge granted={micGranted} label="Microphone Access" Icon={FaMicrophone} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4 – Launch */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.35, type:'spring' }}
                  className="h-full flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center">
                  <motion.div
                    animate={{ rotate:[0,-4,4,0], scale:[1,1.04,1] }}
                    transition={{ repeat:Infinity, duration:3, ease:'easeInOut' }}
                    className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-[0_0_40px_rgba(99,102,241,0.5)]"
                  >🚀</motion.div>
                  <h2 className="text-3xl font-black text-white mb-1" style={{ fontFamily:'Space Grotesk,sans-serif' }}>All Set!</h2>
                  <p className="text-slate-400 text-sm mb-5">Your AI interview session is configured and ready.</p>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 w-full mb-5 text-left">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">Interview Summary</h3>
                    <div className="space-y-2.5">
                      {[
                        { label:'Type',        value:interviewType, icon:'📋' },
                        { label:'Target Role', value:role,          icon:'👤' },
                        { label:'Difficulty',  value:difficulty,    icon:'⚡' },
                        { label:'Duration',    value:duration,      icon:'⏱️' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400 text-sm"><span>{icon}</span>{label}</div>
                          <span className="text-white font-semibold text-sm bg-slate-800 px-3 py-0.5 rounded-lg">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale:1.02, boxShadow:'0 0 40px rgba(99,102,241,0.6)' }}
                    whileTap={{ scale:0.97 }}
                    onClick={handleStartInterview}
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><FaBolt /> Start AI Interview Now <FaArrowRight /></>}
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Bottom Nav ── */}
          <div className="flex-shrink-0 border-t border-slate-800/60 mt-4 py-4 flex items-center justify-between">
            <motion.button
              whileHover={step > 1 ? { scale:1.03 } : {}}
              whileTap={step > 1 ? { scale:0.97 } : {}}
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              <FaArrowLeft className="text-xs" /> Back
            </motion.button>

            <span className="text-slate-600 text-sm font-medium">{step} / 4</span>

            {step < 4 ? (
              <motion.button
                whileHover={{ scale:1.03 }}
                whileTap={{ scale:0.97 }}
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
              >
                Next Step <FaArrowRight className="text-xs" />
              </motion.button>
            ) : (
              <div className="w-28" />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
