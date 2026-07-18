import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  FaLaptopCode, FaBrain, FaUsers, FaCheckCircle, FaLock, 
  FaClock, FaTrophy, FaBriefcase, FaCode, FaChartLine, 
  FaRobot, FaDownload, FaPlay, FaPaperPlane, FaChevronRight,
  FaFilePdf, FaStar, FaDatabase, FaStream, FaExclamationTriangle,
  FaExpand, FaCompress, FaCheck, FaTimes, FaHistory, FaMedal, FaCloud
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import html2pdf from 'html2pdf.js';

// Capgemini Theme
const THEME = {
  bg: '#080C16', // Very dark blue/black
  card: '#101626',
  border: '#1E293B',
  accent: '#0070AD', // Capgemini Blue
  accentLight: '#2D9CDB',
  text: '#E2E8F0',
  muted: '#8B949E'
};

const HIRING_TRACKS = [
  { id: 'analyst', name: 'Analyst (A4)', package: '4.0 - 4.25 LPA', difficulty: 'Medium', eligibility: 'B.E/B.Tech/MCA (60% aggregate)', codingLevel: 'Intermediate', interviewDiff: 'Medium', prepTime: '3-4 Weeks', freq: 'Frequent' },
  { id: 'senior-analyst', name: 'Senior Analyst (A5)', package: '7.5 - 8.0 LPA', difficulty: 'Hard', eligibility: 'B.E/B.Tech/MCA (Top Performers)', codingLevel: 'Advanced', interviewDiff: 'High', prepTime: '4-6 Weeks', freq: 'Bi-Annual' },
  { id: 'cloud', name: 'Cloud Associate', package: '5.5 - 6.5 LPA', difficulty: 'Medium-Hard', eligibility: 'B.Tech/MCA - Certifications preferred', codingLevel: 'Intermediate', interviewDiff: 'High', prepTime: '4 Weeks', freq: 'Annual' }
];

const ROLES = ['Software Engineer', 'Java Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Cloud Engineer', 'QA Engineer', 'Support Engineer', 'Data Engineer', 'Automation Engineer'];

const PIPELINE = [
  { id: 'app', title: 'Application' }, { id: 'resume', title: 'Resume Screening' }, 
  { id: 'oa', title: 'Online Assessment' }, { id: 'tech', title: 'Technical Interview' }, 
  { id: 'hr', title: 'HR Interview' }, { id: 'final', title: 'Offer Letter' }
];

const OA_SECTIONS = [
  { id: 'quant', name: 'Quantitative Aptitude', topics: ['Algebra', 'Percentages', 'Profit & Loss', 'Time & Work', 'Probability'] },
  { id: 'logic', name: 'Logical Reasoning', topics: ['Blood Relation', 'Syllogism', 'Seating Arrangement', 'Data Sufficiency'] },
  { id: 'verbal', name: 'Verbal Ability', topics: ['Reading Comprehension', 'Sentence Correction', 'Vocabulary'] },
  { id: 'coding', name: 'Coding Assessment', topics: ['Arrays', 'Strings', 'Data Structures', 'Algorithms'] }
];

const QUESTION_BANK_CATEGORIES = ['Arrays', 'Strings', 'HashMap', 'Stack', 'Queue', 'Linked List', 'Sorting', 'Searching', 'Trees', 'Binary Search', 'Graphs', 'Recursion', 'Greedy', 'Dynamic Programming', 'Basic SQL', 'OOP'];

const BADGES = [
  { name: 'Analytical Master', icon: FaBrain, desc: 'Scored 95%+ in Quant & Logic' },
  { name: 'Code Optimizer', icon: FaCode, desc: 'O(N) Complexity achieved in Senior Analyst track' },
  { name: 'Value Fit', icon: FaUsers, desc: 'Perfect alignment with Capgemini core values' }
];

const HISTORY = [
  { date: '2025-11-12', score: '78%', track: 'Analyst (A4)', status: 'Not Selected' },
  { date: '2026-04-20', score: '89%', track: 'Senior Analyst (A5)', status: 'Selected' }
];

const TECH_FLOW = ['Project Discussion', 'Java Internals', 'OOP Principles', 'Database Design', 'Coding Problem', 'Optimization', 'Complexity Analysis', 'System Architecture', 'Best Practices'];
const HR_TOPICS = ['Tell me about yourself', 'Why Capgemini?', 'Strengths', 'Weaknesses', 'Teamwork', 'Leadership', 'Conflict Resolution', 'Career Goals', 'Relocation', 'Work Under Pressure', 'Learning Ability'];

const CapgeminiPrepDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPipelineStep, setCurrentPipelineStep] = useState(2); // Start at OA
  
  // Proctor & OA States
  const [activeOASection, setActiveOASection] = useState('quant');
  const [editorLanguage, setEditorLanguage] = useState('java');
  const [editorCode, setEditorCode] = useState('// Write your optimized code here\n');
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeQuestionCategory, setActiveQuestionCategory] = useState('Arrays');
  const [isProctorMode, setIsProctorMode] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [oaCompleted, setOaCompleted] = useState(false);
  
  // Interview States
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [techStep, setTechStep] = useState(0);
  const [hrStep, setHrStep] = useState(0);
  
  // Live Evaluation Cards
  const [liveEval, setLiveEval] = useState({ coding: 0, tech: 0, comms: 0, confidence: 0, overall: 0 });
  const [evalActive, setEvalActive] = useState(false);

  const reportRef = useRef(null);
  const oaContainerRef = useRef(null);

  // Proctor Mode Listeners
  useEffect(() => {
    if (isProctorMode) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setProctorWarnings(prev => prev + 1);
          toast.error('Proctor Alert: Tab switch detected! Do not leave the assessment window.', { icon: '⚠️' });
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isProctorMode]);

  const toggleProctorMode = async () => {
    if (!isProctorMode) {
      if (oaContainerRef.current?.requestFullscreen) {
        await oaContainerRef.current.requestFullscreen();
      }
      setIsProctorMode(true);
      toast.success('Proctor Mode Activated. Auto-save enabled.');
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsProctorMode(false);
    }
  };

  const submitOA = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    setIsProctorMode(false);
    setOaCompleted(true);
    toast.success('Online Assessment Submitted Successfully!');
  };

  // Live Eval Simulation
  useEffect(() => {
    if (evalActive) {
      const intv = setInterval(() => {
        setLiveEval(prev => ({
          coding: Math.min(100, prev.coding + Math.floor(Math.random() * 3)),
          tech: Math.min(100, prev.tech + Math.floor(Math.random() * 3)),
          comms: Math.min(100, prev.comms + Math.floor(Math.random() * 3)),
          confidence: Math.min(100, prev.confidence + Math.floor(Math.random() * 3)),
          overall: Math.min(100, prev.overall + Math.floor(Math.random() * 3))
        }));
      }, 5000);
      return () => clearInterval(intv);
    }
  }, [evalActive]);

  const startInterview = (type) => {
    if (type === 'hr' || type === 'HR') {
      try {
        toast.loading('Initializing Live HR Interview...', { id: 'hr-start' });
        api.post('/interviews/create', {
          interviewType: 'HR Interview',
          role: 'Candidate',
          difficulty: 'Medium',
          duration: 30,
          company: 'Capgemini'
        }).then(res => {
          toast.success('Interview ready!', { id: 'hr-start' });
          navigate('/interview/live/' + res.data._id);
        }).catch(err => {
          console.error(err);
          toast.error('Failed to start interview', { id: 'hr-start' });
        });
        return;
      } catch (e) {}
    }

    setActiveTab(type);
    setEvalActive(true);
    if (type === 'tech') {
      setTechStep(0);
      setChatMessages([{ sender: 'ai', text: `Hello! Welcome to the Technical Interview. We'll start with a ${TECH_FLOW[0]}. Can you brief me about the most complex project you have built and the tech stack you used?` }]);
    } else {
      setHrStep(0);
      setChatMessages([{ sender: 'ai', text: `Welcome to the HR interview. To start off, ${HR_TOPICS[0].toLowerCase()}.` }]);
    }
    setLiveEval({ coding: 55, tech: 60, comms: 70, confidence: 65, overall: 65 });
  };

  const handleChatSend = () => {
    if(!chatInput.trim()) return;
    const newMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    
    setTimeout(() => {
      if (activeTab === 'tech') {
        if (techStep < TECH_FLOW.length - 1) {
          const nextStep = techStep + 1;
          setTechStep(nextStep);
          const aiResponse = generateTechResponse(nextStep);
          setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } else {
          setChatMessages(prev => [...prev, { sender: 'ai', text: "Thank you. That concludes our technical interview. Please await the HR round." }]);
          setEvalActive(false);
          setCurrentPipelineStep(4); // Move to HR
        }
      } else if (activeTab === 'hr') {
        if (hrStep < 4) { // Demo length
          const nextStep = hrStep + 1;
          setHrStep(nextStep);
          const aiResponse = generateHRResponse(nextStep);
          setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } else {
          setChatMessages(prev => [...prev, { sender: 'ai', text: "Thank you for your time. The hiring panel will review your profile. You can now view the final result." }]);
          setEvalActive(false);
          setCurrentPipelineStep(5); // Move to Final Selection
        }
      }
    }, 1500);
  };

  const generateTechResponse = (stepIdx) => {
    const topics = [
      "That sounds great. Moving to Java Internals, how does the JVM handle Garbage Collection?",
      "Good. How did you apply OOP Principles like Abstraction and Polymorphism in this project?",
      "Let's talk about Database Design. How do you decide between NoSQL vs SQL for a highly scalable app?",
      "Let's write some code. Can you implement a function to reverse a Linked List in O(N) time and O(1) space?",
      "Nice. Can you optimize this further? What if it was a doubly linked list?",
      "What is the exact Time and Space complexity of your approach?",
      "Imagine your system is experiencing high latency during peak hours. How would you approach identifying the bottleneck?",
      "Finally, what are some key REST API best practices you follow?"
    ];
    return topics[stepIdx - 1] || "Can you elaborate?";
  };

  const generateHRResponse = (stepIdx) => {
    const responses = [
      "Thank you. Why are you interested in joining Capgemini?",
      "I see. Tell me about a time you showed leadership during a conflict. Please structure your answer using the STAR method.",
      "How do you approach learning completely new technologies that you have no prior experience in?",
      "Are you comfortable with relocation to our Pune or Bangalore offices?"
    ];
    return responses[stepIdx - 1] || "Thank you for sharing.";
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      toast.success('Passed 18/18 Hidden Test Cases!\nRuntime: 8ms | Memory: 24MB', {
        style: { background: THEME.card, color: '#10B981', border: '1px solid #10B981' },
        icon: '✅'
      });
    }, 2000);
  };

  const downloadReport = () => {
    toast.success('Generating PDF Report...');
    setTimeout(() => toast.success('Capgemini_Readiness_Report.pdf downloaded!'), 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: THEME.bg, color: THEME.text }}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
          
          {/* Hero Section */}
          <section className="relative px-8 pt-10 pb-16 border-b border-white/5" style={{ background: `linear-gradient(180deg, ${THEME.accent}15 0%, ${THEME.bg} 100%)` }}>
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center border border-white/10 glass-panel shadow-[0_0_30px_rgba(0,112,173,0.4)] bg-white/5" style={{ backgroundColor: THEME.card }}>
                 {/* Placeholder logo representation for Capgemini (Spade/Club-like blue icon) */}
                 <div className="text-4xl font-black tracking-tighter flex items-center gap-1" style={{ color: THEME.accent }}>
                    Capgemini
                 </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black tracking-tight text-white">Capgemini Campus Hiring Simulation</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30 text-blue-400 bg-blue-500/10">Premium AI Edition</span>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-6">
                  Experience a hyper-realistic, end-to-end recruitment drive simulation featuring Proctored Assessments, Advanced Coding rounds, and Dynamic Technical & HR Interviews.
                </p>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-8 py-8 space-y-12">
            
            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar sticky top-0 bg-[#080C16]/90 backdrop-blur-md z-10 pt-2">
              {[
                { id: 'dashboard', icon: FaChartLine, label: 'Dashboard & History' },
                { id: 'overview', icon: FaTrophy, label: 'Tracks & Roles' },
                { id: 'pipeline', icon: FaStream, label: 'Hiring Pipeline' },
                { id: 'oa', icon: FaLaptopCode, label: 'Online Assessment' },
                { id: 'qbank', icon: FaDatabase, label: 'Question Bank' },
                { id: 'tech', icon: FaCode, label: 'Technical Interview' },
                { id: 'hr', icon: FaUsers, label: 'HR Interview' },
                { id: 'panel', icon: FaBriefcase, label: 'Offer Letter' },
                { id: 'report', icon: FaFilePdf, label: 'Final Report' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === t.id ? 'bg-white/10 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  style={activeTab === t.id ? { color: THEME.accentLight, borderColor: THEME.accentLight, borderBottom: `2px solid ${THEME.accent}` } : {}}
                >
                  <t.icon /> {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: Dashboard */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaChartLine className="text-blue-500"/> Application Status</h3>
                     <div className="text-3xl font-black text-emerald-400">In Progress</div>
                     <p className="text-sm text-slate-400">Track: <strong>Senior Analyst (A5)</strong></p>
                     <p className="text-sm text-slate-400">Current Round: <strong>Online Assessment</strong></p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(0,112,173,0.8)]" style={{ width: '35%' }}></div>
                     </div>
                     <p className="text-[10px] text-slate-500 text-right">35% Complete</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaBrain className="text-indigo-500"/> Readiness Metrics</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between text-xs text-slate-300"><span>Assessment Readiness</span><span className="font-bold text-white">88%</span></div>
                        <div className="flex justify-between text-xs text-slate-300"><span>Interview Readiness</span><span className="font-bold text-white">82%</span></div>
                        <div className="flex justify-between text-xs text-slate-300"><span>Overall Readiness</span><span className="font-bold text-blue-400">85%</span></div>
                     </div>
                     <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold text-center">
                        Estimated Preparation Needed: 2 Weeks
                     </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-white/5 space-y-4 shadow-lg" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaMedal className="text-yellow-500"/> Badges & Achievements</h3>
                     <div className="space-y-3">
                       {BADGES.map(b => (
                         <div key={b.name} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                           <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0"><b.icon/></div>
                           <div>
                             <div className="text-xs font-bold text-white">{b.name}</div>
                             <div className="text-[10px] text-slate-400">{b.desc}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/5 shadow-lg" style={{ backgroundColor: THEME.card }}>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FaHistory className="text-blue-500"/> Performance History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-black/40 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 rounded-tl-lg">Date</th>
                          <th className="px-6 py-4">Target Track</th>
                          <th className="px-6 py-4">Overall Score</th>
                          <th className="px-6 py-4 rounded-tr-lg">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORY.map((h, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white font-medium">{h.date}</td>
                            <td className="px-6 py-4 text-slate-300">{h.track}</td>
                            <td className="px-6 py-4 font-bold text-blue-400">{h.score}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${h.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{h.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Overview (Tracks & Roles) */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FaTrophy className="text-blue-500"/> Available Hiring Tracks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {HIRING_TRACKS.map(track => (
                      <div key={track.id} className="rounded-2xl border border-white/5 p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl" style={{ backgroundColor: THEME.card }}>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-black text-white">{track.name}</h3>
                            <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">{track.difficulty}</span>
                          </div>
                          <div className="text-2xl font-black text-blue-400 mb-6 drop-shadow-md">{track.package}</div>
                          <div className="space-y-3 text-xs text-slate-300">
                            <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Eligibility</span><span className="font-semibold text-right max-w-[150px]">{track.eligibility}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Coding Level</span><span className="font-semibold">{track.codingLevel}</span></div>
                            <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Interview</span><span className="font-semibold">{track.interviewDiff}</span></div>
                            <div className="flex justify-between border-white/5 pt-1"><span className="text-slate-500">Prep Time</span><span className="font-semibold text-blue-400">{track.prepTime}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FaBriefcase className="text-blue-500"/> Available Roles</h2>
                  <div className="flex flex-wrap gap-3">
                    {ROLES.map(role => (
                      <div key={role} className="px-5 py-3 rounded-xl border border-white/5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-default hover:border-blue-500/40 hover:bg-blue-500/5 shadow-md" style={{ backgroundColor: THEME.card }}>{role}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Hiring Pipeline */}
            {activeTab === 'pipeline' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="text-xl font-bold text-white mb-16 text-center">Capgemini Recruitment Pipeline</h2>
                <div className="flex flex-col md:flex-row justify-between items-center relative px-10">
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-white/5 -translate-y-1/2 z-0"></div>
                  {PIPELINE.map((step, idx) => {
                    const isCompleted = idx < currentPipelineStep;
                    const isCurrent = idx === currentPipelineStep;
                    const isLocked = idx > currentPipelineStep;
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 w-28 my-4 md:my-0 cursor-pointer" onClick={() => setCurrentPipelineStep(idx)}>
                        <motion.div whileHover={{ scale: 1.1 }} className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${isCompleted ? `bg-emerald-500/20 border-emerald-500 text-emerald-500` : isCurrent ? `bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(0,112,173,0.5)]` : `bg-[#080C16] border-white/10 text-slate-500`} transition-all bg-[#080C16]`}>
                          {isCompleted ? <FaCheckCircle className="text-xl"/> : isLocked ? <FaLock className="text-xl"/> : <span className="text-xl font-black">{idx + 1}</span>}
                        </motion.div>
                        <span className={`text-xs font-bold text-center ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{step.title}</span>
                        {isCurrent && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full absolute -bottom-6 whitespace-nowrap border border-blue-500/30">Current Stage</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Assessment (Online & Coding) */}
            {activeTab === 'oa' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {!oaCompleted ? (
                  <div ref={oaContainerRef} className={`flex h-[750px] gap-6 transition-all ${isProctorMode ? 'bg-[#080C16] p-6 fixed inset-0 z-50 h-screen w-screen' : ''}`}>
                    {/* Left Sidebar */}
                    <div className="w-64 shrink-0 flex flex-col gap-3">
                      <div className="p-5 rounded-2xl border border-white/5 mb-2 bg-[#101626] shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-[30px] rounded-full"></div>
                        <div className="text-xs text-slate-400 mb-2 flex justify-between items-center relative z-10">Time Remaining {isProctorMode && <span className="text-red-500 flex items-center gap-1 animate-pulse font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"><FaRobot/> Proctored</span>}</div>
                        <div className="text-3xl font-black text-white flex items-center gap-3 relative z-10"><FaClock className="text-red-500 text-xl"/> 65:00</div>
                        <button onClick={toggleProctorMode} className="mt-5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex justify-center items-center gap-2 transition-all border border-white/5">
                          {isProctorMode ? <FaCompress/> : <FaExpand/>} {isProctorMode ? 'Exit Proctor' : 'Enter Fullscreen'}
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                        {OA_SECTIONS.map(sec => (
                          <button key={sec.id} onClick={() => setActiveOASection(sec.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${activeOASection === sec.id ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg' : 'bg-[#101626] border-white/5 text-slate-400 hover:bg-white/5'}`}>
                            <h4 className="font-bold text-sm mb-1">{sec.name}</h4>
                            <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 mb-2"><div className="h-full bg-blue-500/50 rounded-full" style={{ width: '0%' }}></div></div>
                            <div className="text-[10px] opacity-70 line-clamp-1">{sec.topics.join(', ')}</div>
                          </button>
                        ))}
                      </div>

                      <button onClick={submitOA} className="mt-auto py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all shadow-[0_0_15px_rgba(0,112,173,0.4)]">
                        Submit Final Assessment
                      </button>
                    </div>

                    {/* Right Area */}
                    <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col bg-[#101626] shadow-2xl relative">
                      {proctorWarnings > 0 && (
                        <div className="bg-red-500/20 text-red-400 text-xs font-bold p-3 text-center flex items-center justify-center gap-2 border-b border-red-500/30">
                          <FaExclamationTriangle/> Warning: {proctorWarnings} tab switches detected. Auto-submit will trigger upon repeated violations.
                        </div>
                      )}
                      
                      {activeOASection === 'coding' ? (
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/30">
                            <div>
                              <h3 className="font-bold text-white flex items-center gap-2"><FaCode className="text-blue-500"/> Professional Coding Editor</h3>
                              <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-widest font-bold">● Auto-saving Enabled</p>
                            </div>
                            <select className="bg-black/50 border border-white/10 rounded-lg text-xs font-bold p-2 text-white outline-none focus:border-blue-500/50" value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)}>
                              <option value="java">Java</option><option value="python">Python</option><option value="cpp">C++</option><option value="c">C</option><option value="javascript">JavaScript</option>
                            </select>
                          </div>
                          <div className="flex-1 bg-[#0d1117] flex">
                            <div className="w-1/3 p-6 border-r border-white/10 overflow-y-auto">
                              <h4 className="font-bold text-sm text-white mb-2">Maximum Path Sum</h4>
                              <div className="flex gap-2 mb-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">Medium</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Graphs/Trees</span>
                              </div>
                              <p className="text-sm text-slate-300 leading-relaxed mb-6">A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Given the root of a binary tree, return the maximum path sum of any non-empty path.</p>
                              <div className="bg-black/60 p-4 rounded-xl text-xs font-mono mb-4 text-emerald-400 border border-white/5 shadow-inner">
                                <span className="text-slate-500">Input:</span> root = [-10,9,20,null,null,15,7]<br/><br/>
                                <span className="text-slate-500">Output:</span> 42
                              </div>
                            </div>
                            <div className="flex-1 relative">
                              <Editor language={editorLanguage} theme="vs-dark" value={editorCode} onChange={setEditorCode} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 20 }, cursorBlinking: "smooth", smoothScrolling: true }} />
                            </div>
                          </div>
                          <div className="p-4 bg-[#101626] border-t border-white/10 flex justify-between items-center">
                            <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-2"><FaCheckCircle/> All Test Cases Passed (12/12)</div>
                            <div className="flex gap-3">
                              <button onClick={handleRunCode} disabled={isCompiling} className="px-8 py-2.5 rounded-xl font-bold text-xs bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 text-white border border-white/10 shadow-sm"><FaPlay/> {isCompiling ? 'Compiling...' : 'Run Code'}</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 h-full flex flex-col justify-between bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative">
                          <div className="absolute inset-0 bg-black/40 z-0"></div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                              <h3 className="text-2xl font-black text-white">{OA_SECTIONS.find(s => s.id === activeOASection)?.name}</h3>
                              <div className="text-sm font-bold text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">Question 3 / 20</div>
                            </div>
                            <div className="text-lg text-slate-200 mb-10 leading-relaxed max-w-3xl">
                              A pipe can fill a tank in 15 hours. Due to a leak in the bottom, it is filled in 20 hours. If the tank is full, how much time will the leak take to empty it?
                            </div>
                            <div className="grid grid-cols-2 gap-4 max-w-2xl">
                              {['40 hours', '50 hours', '60 hours', '70 hours'].map((opt, i) => (
                                <div key={i} className="p-5 rounded-xl border border-white/10 bg-[#101626]/80 text-slate-300 hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-white cursor-pointer transition-all shadow-md font-medium text-center">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-6 border-t border-white/10 relative z-10">
                            <button className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10 bg-white/5">Review Later</button>
                            <button className="px-8 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(0,112,173,0.4)]">Save & Next</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Section-wise Analytics View post OA
                  <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-10">
                    <div className="text-center mb-12">
                      <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-[0_0_30px_rgba(16,185,129,0.3)]"><FaCheck/></div>
                      <h2 className="text-3xl font-black text-white tracking-tight">Assessment Completed</h2>
                      <p className="text-slate-400 mt-3 text-sm">Your cognitive and technical profile has been generated successfully.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 rounded-2xl border border-white/5 bg-[#101626] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full"></div>
                        <h3 className="text-lg font-black text-white mb-6 relative z-10">Cognitive & Aptitude</h3>
                        <div className="space-y-5 relative z-10">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Total Accuracy</span><span className="text-white font-bold text-lg">91%</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Quantitative Reasoning</span><span className="text-emerald-400 font-bold">Excellent</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Verbal Comprehension</span><span className="text-emerald-400 font-bold">Good</span></div>
                          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{width: '91%'}}></div></div>
                        </div>
                      </div>
                      <div className="p-8 rounded-2xl border border-white/5 bg-[#101626] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full"></div>
                        <h3 className="text-lg font-black text-white mb-6 relative z-10">Technical & Coding</h3>
                        <div className="space-y-5 relative z-10">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Test Cases Passed</span><span className="text-emerald-400 font-bold text-lg">100%</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Code Optimization</span><span className="text-white font-bold">96/100</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Average Execution Time</span><span className="text-white font-bold">8ms</span></div>
                          <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full" style={{width: '96%'}}></div></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-10">
                      <button onClick={() => { setActiveTab('tech'); setCurrentPipelineStep(3); }} className="px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-[0_0_20px_rgba(0,112,173,0.5)] flex items-center gap-3 text-sm">
                        Proceed to Technical Interview <FaChevronRight/>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB CONTENT: Question Bank */}
            {activeTab === 'qbank' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-wrap gap-2.5">
                  {QUESTION_BANK_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveQuestionCategory(cat)} className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${activeQuestionCategory === cat ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(0,112,173,0.5)]' : 'bg-black/20 text-slate-400 border-white/10 hover:bg-white/10'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="p-6 rounded-2xl border border-white/5 flex flex-col gap-4 group cursor-pointer hover:border-blue-500/50 transition-all bg-[#101626] shadow-lg hover:shadow-[0_0_20px_rgba(0,112,173,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 blur-[30px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${i%3===0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : i%2===0 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border`}>{i%3===0 ? 'Hard' : i%2===0 ? 'Medium' : 'Easy'}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{activeQuestionCategory}</span>
                        </div>
                        <FaCode className="text-slate-600 group-hover:text-blue-500 transition-colors text-lg"/>
                      </div>
                      <div className="relative z-10 mt-2">
                        <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">Capgemini Specific Problem {i}</h4>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">This question pattern appears heavily in the A5 (Senior Analyst) technical screening rounds.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Technical & HR Interview */}
            {(activeTab === 'tech' || activeTab === 'hr') && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col xl:flex-row h-auto xl:h-[700px] gap-6">
                
                {/* Chat Area */}
                <div className="flex-1 flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#101626]">
                  <div className="p-5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(0,112,173,0.3)]"><FaRobot className="text-blue-400 text-xl"/></div>
                      <div>
                        <h3 className="font-bold text-white text-sm">Capgemini AI Panelist</h3>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold tracking-wider mt-0.5">● LIVE INTERVIEW</p>
                      </div>
                    </div>
                    {/* Live Progress Flow indicator */}
                    <div className="hidden md:flex gap-1.5 bg-black/50 p-2 rounded-lg border border-white/5">
                       {(activeTab === 'tech' ? TECH_FLOW : HR_TOPICS.slice(0,6)).map((t, i) => (
                         <div key={t} className={`h-2 w-8 rounded-sm transition-colors ${(activeTab === 'tech' ? techStep : hrStep) >= i ? 'bg-blue-500 shadow-[0_0_8px_rgba(0,112,173,0.6)]' : 'bg-white/10'}`} title={t}></div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-opacity-[0.02]">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(0,112,173,0.2)]">
                            {activeTab === 'tech' ? <FaLaptopCode className="text-3xl text-blue-400"/> : <FaUsers className="text-3xl text-blue-400"/>}
                         </div>
                         <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{activeTab === 'tech' ? 'Technical Panel Round' : 'HR Discussion'}</h3>
                         <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">Experience a dynamic conversational AI designed to evaluate you based on the rigorous standards of Capgemini's recruitment panel.</p>
                        <button onClick={() => startInterview(activeTab)} className="px-8 py-3.5 rounded-xl font-black text-white transition-all shadow-[0_0_20px_rgba(0,112,173,0.5)] bg-blue-600 hover:bg-blue-500 tracking-wide text-sm">
                          START INTERVIEW
                        </button>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[80%] p-4 text-sm leading-relaxed shadow-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' : 'bg-[#1E293B]/80 border border-white/5 text-slate-200 rounded-2xl rounded-bl-sm backdrop-blur-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-5 bg-black/50 border-t border-white/10">
                    <div className="relative flex items-center">
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} disabled={chatMessages.length === 0} placeholder="Type your professional response here..." className="w-full bg-black/60 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm text-white outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(0,112,173,0.1)] transition-all" />
                      <button onClick={handleChatSend} disabled={chatMessages.length === 0} className="absolute right-2.5 w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-md">
                        <FaPaperPlane className="text-sm"/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Context & Live Eval Pane */}
                <div className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                  {/* Floating Live Eval */}
                  <div className="p-6 rounded-2xl border border-white/5 bg-[#101626] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-[40px] rounded-full"></div>
                    <h4 className="font-black text-xs text-white mb-6 uppercase tracking-widest flex items-center gap-2"><FaChartLine className="text-emerald-400 text-lg"/> Live Scorecard</h4>
                    <div className="space-y-4 relative z-10">
                      {[
                        { label: 'Technical Accuracy', val: liveEval.tech },
                        { label: 'Problem Solving logic', val: liveEval.coding },
                        { label: 'Communication Clarity', val: liveEval.comms },
                        { label: 'Confidence Level', val: liveEval.confidence },
                        { label: 'Overall Readiness', val: liveEval.overall, color: 'emerald' }
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-semibold">
                            <span>{metric.label}</span><span className="text-white font-bold">{metric.val}%</span>
                          </div>
                          <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${metric.val}%` }} className={`h-full rounded-full ${metric.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'}`} transition={{ duration: 0.5 }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeTab === 'tech' ? (
                    <div className="flex-1 rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-xl bg-[#101626]">
                      <div className="p-4 border-b border-white/5 bg-black/40 font-bold text-xs text-slate-400 flex justify-between uppercase tracking-widest"><span>Live Whiteboard</span></div>
                      <div className="flex-1 relative">
                        <Editor language="javascript" theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", padding: { top: 15 } }} value="// Draft architecture logic, pseudo-code or queries here..." />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-6 rounded-2xl border border-white/5 bg-[#101626] shadow-xl">
                      <h4 className="font-black text-xs text-white mb-6 uppercase tracking-widest flex items-center gap-2"><FaCloud className="text-blue-500 text-lg"/> HR Focus Areas</h4>
                      <div className="space-y-3.5">
                         {HR_TOPICS.slice(0,8).map(t => (
                           <div key={t} className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(0,112,173,0.8)]"></div><span className="text-sm text-slate-300 font-medium">{t}</span></div>
                         ))}
                      </div>
                      <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed font-medium">
                        <strong>Insight:</strong> Emphasize your adaptability to work across diverse technologies. The STAR method is highly recommended for situational answers.
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Final Hiring Panel / Offer Letter */}
            {activeTab === 'panel' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 max-w-5xl mx-auto py-8">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-white tracking-tight">Hiring Committee Verdict</h2>
                  <p className="text-slate-400 mt-3 text-sm">Aggregated review of your performance across all Capgemini recruitment rounds.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Panel Recommendations */}
                  <div className="p-8 rounded-2xl border border-white/5 bg-[#101626] text-center shadow-lg hover:-translate-y-1 transition-transform">
                    <FaLaptopCode className="text-4xl text-blue-400 mx-auto mb-4"/>
                    <h3 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Assessment Panel</h3>
                    <div className="text-2xl font-black text-emerald-400 mb-4">Strong Hire</div>
                    <p className="text-sm text-slate-500 leading-relaxed">"Excellent cognitive scores. Coding logic was highly optimized and efficient."</p>
                  </div>
                  <div className="p-8 rounded-2xl border border-white/5 bg-[#101626] text-center shadow-lg hover:-translate-y-1 transition-transform">
                    <FaBrain className="text-indigo-400 mx-auto mb-4 text-4xl"/>
                    <h3 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Technical Panel</h3>
                    <div className="text-2xl font-black text-emerald-400 mb-4">Strong Hire</div>
                    <p className="text-sm text-slate-500 leading-relaxed">"Deep understanding of system design and Object-Oriented paradigms."</p>
                  </div>
                  <div className="p-8 rounded-2xl border border-white/5 bg-[#101626] text-center shadow-lg hover:-translate-y-1 transition-transform">
                    <FaUsers className="text-orange-400 mx-auto mb-4 text-4xl"/>
                    <h3 className="text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">HR Panel</h3>
                    <div className="text-2xl font-black text-emerald-400 mb-4">Hire</div>
                    <p className="text-sm text-slate-500 leading-relaxed">"Professional attitude, excellent communication, and clear career objectives."</p>
                  </div>
                </div>

                {/* Offer Letter Simulation */}
                <div className="p-12 rounded-3xl border border-blue-500/30 relative overflow-hidden shadow-[0_20px_50px_rgba(0,112,173,0.15)] mt-12" style={{ background: `linear-gradient(135deg, ${THEME.card} 0%, #0070ad15 100%)` }}>
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full"></div>
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 text-4xl mb-6 shadow-lg border border-emerald-500/20">
                      <FaCheck/>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-8 tracking-tight">Simulated Offer Generated</h3>
                    
                    <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 backdrop-blur-sm mb-10 text-left">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Company</div>
                        <div className="text-lg font-black text-white">Capgemini</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Role / Track</div>
                        <div className="text-lg font-black text-white">Senior Analyst (A5)</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Compensation</div>
                        <div className="text-lg font-black text-emerald-400">8.0 LPA</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-bold">Joining Batch</div>
                        <div className="text-lg font-black text-white">August 2026</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <button className="px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] tracking-wide">Accept Offer</button>
                      <button onClick={() => setActiveTab('report')} className="px-10 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 shadow-md">View Detailed Report</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Final Report */}
            {activeTab === 'report' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Final Performance Report</h2>
                    <p className="text-sm text-slate-400 mt-2">Comprehensive deep-dive analytics across all simulation rounds.</p>
                  </div>
                  <button onClick={downloadReport} className="px-6 py-3 rounded-xl font-black text-white transition-all flex items-center gap-3 text-sm shadow-[0_0_20px_rgba(0,112,173,0.4)] hover:-translate-y-0.5 bg-[#0070AD]">
                    <FaFilePdf className="text-lg"/> Download PDF Report
                  </button>
                </div>
                
                <div ref={reportRef} className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[{ l: 'Overall Score', v: '93%', i: FaStar, c: 'text-yellow-400' }, { l: 'Aptitude Score', v: '91%', i: FaBrain, c: 'text-indigo-400' }, { l: 'Coding Perf.', v: '96%', i: FaCode, c: 'text-emerald-400' }, { l: 'Tech Knowledge', v: '92%', i: FaLaptopCode, c: 'text-blue-400' }, { l: 'Communication', v: '94%', i: FaUsers, c: 'text-pink-400' }].map(s => (
                      <div key={s.l} className="p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center bg-[#101626] shadow-lg">
                        <s.i className={`text-3xl mb-3 ${s.c} drop-shadow-md`} />
                        <div className="text-3xl font-black text-white">{s.v}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-8 rounded-2xl border border-white/5 space-y-8 shadow-xl bg-[#101626]">
                      <div>
                        <h3 className="text-sm font-black text-emerald-400 mb-4 uppercase tracking-widest flex items-center gap-2"><FaChartLine className="text-lg"/> Strengths</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                          <li className="flex items-start gap-4 bg-black/20 p-3 rounded-xl border border-white/5"><span className="text-emerald-400 mt-0.5 text-lg font-bold">✓</span> Excellent analytical reasoning and data interpretation skills.</li>
                          <li className="flex items-start gap-4 bg-black/20 p-3 rounded-xl border border-white/5"><span className="text-emerald-400 mt-0.5 text-lg font-bold">✓</span> Highly structured and confident answers using the STAR method during HR round.</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-orange-400 mb-4 uppercase tracking-widest flex items-center gap-2"><FaChartLine className="text-lg"/> Areas for Improvement</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                          <li className="flex items-start gap-4 bg-black/20 p-3 rounded-xl border border-white/5"><span className="text-orange-400 mt-0.5 font-bold text-lg">!</span> System Design architecture scalability concepts can be deeper.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl border border-blue-500/40 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-[0_0_30px_rgba(0,112,173,0.15)] bg-[#101626]">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                       <div className="relative z-10">
                         <h3 className="text-4xl font-black text-white mb-3 tracking-tight">Hire Probability</h3>
                         <div className="text-3xl font-black text-emerald-400 mb-6 uppercase tracking-wider">Very High</div>
                         <p className="text-slate-300 text-sm mb-10 max-w-[250px] mx-auto leading-relaxed">
                           You have successfully met the stringent criteria for the <strong className="text-white">Senior Analyst (A5)</strong> track.
                         </p>
                         <div className="w-full text-left">
                           <div className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Recommended Study Plan</div>
                           <div className="flex flex-col gap-2.5">
                              <div className="bg-white/5 rounded-xl p-3.5 text-xs text-white border border-white/10 font-medium flex items-center gap-3"><span className="bg-blue-500 text-white w-5 h-5 rounded flex items-center justify-center font-bold">1</span> High-Level System Design</div>
                              <div className="bg-white/5 rounded-xl p-3.5 text-xs text-white border border-white/10 font-medium flex items-center gap-3"><span className="bg-blue-500 text-white w-5 h-5 rounded flex items-center justify-center font-bold">2</span> Advanced SQL Tuning</div>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default CapgeminiPrepDetail;
