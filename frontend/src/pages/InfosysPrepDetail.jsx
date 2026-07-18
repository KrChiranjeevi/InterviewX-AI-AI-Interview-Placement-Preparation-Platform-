import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { SiInfosys } from 'react-icons/si';
import { 
  FaLaptopCode, FaBrain, FaUsers, FaCheckCircle, FaLock, 
  FaClock, FaTrophy, FaBriefcase, FaCode, FaChartLine, 
  FaRobot, FaDownload, FaPlay, FaPaperPlane, FaChevronRight,
  FaFilePdf, FaStar, FaDatabase, FaStream, FaExclamationTriangle,
  FaExpand, FaCompress, FaCheck, FaTimes, FaHistory, FaMedal
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import html2pdf from 'html2pdf.js';

const THEME = {
  bg: '#0A0B10',
  card: '#13151F',
  border: '#1E2335',
  accent: '#0083D6', // Infosys Blue
  accentLight: '#2AA2F7',
  text: '#E2E8F0',
  muted: '#8B949E'
};

const HIRING_TRACKS = [
  { id: 'sp', name: 'Specialist Programmer (SP)', package: '8.0 - 9.5 LPA', difficulty: 'Very Hard', eligibility: 'B.Tech/MCA - Top Coders', codingLevel: 'Expert (DSA & Sys Design)', interviewDiff: 'High', prepTime: '6-8 Weeks', freq: 'Annual' },
  { id: 'dse', name: 'Digital Specialist Engineer (DSE)', package: '6.25 LPA', difficulty: 'Hard', eligibility: 'B.Tech/MCA', codingLevel: 'Advanced', interviewDiff: 'Medium-High', prepTime: '4-6 Weeks', freq: 'Bi-Annual' },
  { id: 'se', name: 'System Engineer (SE)', package: '3.6 LPA', difficulty: 'Medium', eligibility: 'B.E/B.Tech/MCA (60%)', codingLevel: 'Intermediate', interviewDiff: 'Medium', prepTime: '2-4 Weeks', freq: 'Frequent' }
];

const ROLES = ['Software Engineer', 'System Engineer', 'Java Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Cloud Engineer', 'QA Engineer', 'Support Engineer', 'Data Engineer'];

const PIPELINE = [
  { id: 'app', title: 'Application' }, { id: 'resume', title: 'Resume Screening' }, 
  { id: 'oa', title: 'Online Assessment' }, { id: 'tech', title: 'Technical Interview' }, 
  { id: 'hr', title: 'HR Interview' }, { id: 'final', title: 'Final Selection' }
];

const OA_SECTIONS = [
  { id: 'quant', name: 'Quantitative Aptitude', topics: ['Percentages', 'Profit & Loss', 'Ratio', 'Average', 'Time & Work', 'Speed Distance', 'Simple Interest'] },
  { id: 'logic', name: 'Logical Reasoning', topics: ['Blood Relation', 'Seating Arrangement', 'Puzzles', 'Series', 'Direction', 'Coding Decoding'] },
  { id: 'verbal', name: 'Verbal Ability', topics: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Sentence Improvement'] },
  { id: 'coding', name: 'Coding Assessment', topics: ['Arrays', 'Strings', 'HashMap', 'Trees', 'Graphs', 'DP'] }
];

const QUESTION_BANK_CATEGORIES = ['Arrays', 'Strings', 'HashMap', 'Linked List', 'Stack', 'Queue', 'Binary Search', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Greedy', 'Dynamic Programming', 'Recursion', 'Basic SQL'];

const BADGES = [
  { name: 'Assessment Expert', icon: FaBrain, desc: 'Cleared OA with 90%+' },
  { name: 'Coding Champion', icon: FaCode, desc: 'Passed all hidden test cases' },
  { name: 'Communication Star', icon: FaUsers, desc: 'Nailed the HR Interview' }
];

const HISTORY = [
  { date: '2026-06-15', score: '78%', track: 'System Engineer (SE)', status: 'Selected' },
  { date: '2026-07-02', score: '85%', track: 'Digital Specialist Engineer (DSE)', status: 'Selected' }
];

const TECH_FLOW = ['Project Discussion', 'Technology Selection', 'Database Design', 'API Explanation', 'Coding Question', 'Optimization', 'Complexity Analysis', 'Debugging Scenario', 'Best Practices'];
const HR_TOPICS = ['Tell me about yourself', 'Why Infosys?', 'Strengths', 'Weaknesses', 'Teamwork', 'Leadership', 'Conflict Resolution', 'Relocation', 'Night Shift', 'Career Goals'];

const InfosysPrepDetail = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentPipelineStep, setCurrentPipelineStep] = useState(2); // OA
  
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
          company: 'Infosys'
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
      setChatMessages([{ sender: 'ai', text: `Hello! I'm your Technical Interviewer. Let's begin with ${TECH_FLOW[0]}. Could you explain the architecture of your most recent project and why you chose that specific tech stack?` }]);
    } else {
      setHrStep(0);
      setChatMessages([{ sender: 'ai', text: `Welcome to the HR interview. To start off, ${HR_TOPICS[0].toLowerCase()}.` }]);
    }
    setLiveEval({ coding: 40, tech: 50, comms: 60, confidence: 55, overall: 50 });
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
          setChatMessages(prev => [...prev, { sender: 'ai', text: "Thank you. That concludes our technical interview. You can now check your final report." }]);
          setEvalActive(false);
          setCurrentPipelineStep(4); // Move to HR
        }
      } else if (activeTab === 'hr') {
        if (hrStep < 4) { // Just ask 5 questions total for demo
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
      "Great. Let's move to Technology Selection. If you had to scale this, what alternatives would you consider?",
      "Interesting. Now for Database Design. How did you design your schemas? Walk me through your ER diagram concepts.",
      "How did you secure your REST APIs? Explain your authentication mechanism.",
      "Let's do some coding. Write a function to detect a cycle in a Linked List. Focus on optimization.",
      "Good. Can you optimize that further? What if memory was strictly limited?",
      "What is the Time and Space complexity of your approach?",
      "Imagine there is a memory leak in your deployment. How would you debug it step-by-step?",
      "Finally, what are some Java/Coding best practices you strictly follow?"
    ];
    return topics[stepIdx - 1] || "Can you elaborate?";
  };

  const generateHRResponse = (stepIdx) => {
    const responses = [
      "Thank you. Why Infosys specifically compared to other service-based companies?",
      "I see. Tell me about a time you showed leadership or teamwork during a conflict.",
      "How do you feel about relocation and working night shifts?",
      "Can you structure your next answer using the STAR method? Describe a time you worked under intense pressure."
    ];
    return responses[stepIdx - 1] || "Thank you for sharing.";
  };

  const handleRunCode = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      toast.success('Passed 12/12 Hidden Test Cases!\nRuntime: 14ms | Memory: 32MB', {
        style: { background: THEME.card, color: '#10B981', border: '1px solid #10B981' },
        icon: '🚀'
      });
    }, 2000);
  };

  const downloadReport = () => {
    toast.success('Generating PDF Report...');
    setTimeout(() => toast.success('Infosys_Readiness_Report.pdf downloaded!'), 1500);
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
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center border border-white/10 glass-panel shadow-[0_0_30px_rgba(0,131,214,0.3)]" style={{ backgroundColor: THEME.card }}>
                <SiInfosys className="text-5xl" style={{ color: THEME.accent }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-black tracking-tight text-white">Infosys Campus Hiring Simulation</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">Phase 2 AI Enhanced</span>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mb-6">
                  Complete end-to-end recruitment drive simulation featuring AI Proctoring, advanced dynamic technical & HR interview flows, and hiring panel evaluations.
                </p>
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-8 py-8 space-y-12">
            
            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar sticky top-0 bg-[#0A0B10]/90 backdrop-blur-md z-10 pt-2">
              {[
                { id: 'dashboard', icon: FaChartLine, label: 'Dashboard & History' },
                { id: 'overview', icon: FaTrophy, label: 'Tracks & Roles' },
                { id: 'pipeline', icon: FaStream, label: 'Hiring Pipeline' },
                { id: 'oa', icon: FaLaptopCode, label: 'Online Assessment' },
                { id: 'qbank', icon: FaDatabase, label: 'Question Bank' },
                { id: 'tech', icon: FaCode, label: 'Technical Interview' },
                { id: 'hr', icon: FaUsers, label: 'HR Interview' },
                { id: 'panel', icon: FaUsers, label: 'Hiring Panel' },
                { id: 'report', icon: FaFilePdf, label: 'Final Report' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
                  <div className="p-6 rounded-2xl border border-white/5 space-y-4" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaChartLine className="text-blue-500"/> Current Status</h3>
                     <div className="text-3xl font-black text-emerald-400">In Progress</div>
                     <p className="text-sm text-slate-400">Track: <strong>Digital Specialist Engineer (DSE)</strong></p>
                     <p className="text-sm text-slate-400">Current Round: <strong>Online Assessment</strong></p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                     </div>
                     <p className="text-[10px] text-slate-500 text-right">40% Complete</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl border border-white/5 space-y-4" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaBrain className="text-purple-500"/> AI Recommendation</h3>
                     <p className="text-sm text-slate-300 leading-relaxed">
                       Based on your previous attempts, focus heavily on <strong>Dynamic Programming</strong> and <strong>Graph Algorithms</strong> to secure the DSE track.
                     </p>
                     <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold">
                        Estimated Prep Time Remaining: 2 Weeks
                     </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-white/5 space-y-4" style={{ backgroundColor: THEME.card }}>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><FaMedal className="text-yellow-500"/> Badges & Achievements</h3>
                     <div className="space-y-3">
                       {BADGES.map(b => (
                         <div key={b.name} className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center"><b.icon/></div>
                           <div>
                             <div className="text-xs font-bold text-white">{b.name}</div>
                             <div className="text-[10px] text-slate-400">{b.desc}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-white/5" style={{ backgroundColor: THEME.card }}>
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FaHistory className="text-blue-500"/> Performance History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-400 uppercase bg-black/20">
                        <tr>
                          <th className="px-6 py-3 rounded-tl-lg">Date</th>
                          <th className="px-6 py-3">Target Track</th>
                          <th className="px-6 py-3">Overall Score</th>
                          <th className="px-6 py-3 rounded-tr-lg">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORY.map((h, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="px-6 py-4 text-white">{h.date}</td>
                            <td className="px-6 py-4 text-slate-300">{h.track}</td>
                            <td className="px-6 py-4 font-bold text-blue-400">{h.score}</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{h.status}</span></td>
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
                      <div key={track.id} className="rounded-2xl border border-white/5 p-6 hover:border-blue-500/30 transition-all group" style={{ backgroundColor: THEME.card }}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-black text-white">{track.name}</h3>
                          <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">{track.difficulty}</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-400 mb-6">{track.package}</div>
                        <div className="space-y-3 text-xs text-slate-300">
                          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Eligibility</span><span className="font-semibold text-right max-w-[150px]">{track.eligibility}</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Coding Level</span><span className="font-semibold">{track.codingLevel}</span></div>
                          <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-slate-500">Interview</span><span className="font-semibold">{track.interviewDiff}</span></div>
                          <div className="flex justify-between border-white/5 pt-1"><span className="text-slate-500">Prep Time</span><span className="font-semibold text-blue-400">{track.prepTime}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FaBriefcase className="text-blue-500"/> Available Roles</h2>
                  <div className="flex flex-wrap gap-3">
                    {ROLES.map(role => (
                      <div key={role} className="px-5 py-3 rounded-xl border border-white/5 text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-default hover:border-blue-500/30 hover:bg-blue-500/5" style={{ backgroundColor: THEME.card }}>{role}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Hiring Pipeline */}
            {activeTab === 'pipeline' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <h2 className="text-xl font-bold text-white mb-16 text-center">Infosys Standard Recruitment Pipeline</h2>
                <div className="flex flex-col md:flex-row justify-between items-center relative px-10">
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-1 bg-white/5 -translate-y-1/2 z-0"></div>
                  {PIPELINE.map((step, idx) => {
                    const isCompleted = idx < currentPipelineStep;
                    const isCurrent = idx === currentPipelineStep;
                    const isLocked = idx > currentPipelineStep;
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 w-32 my-4 md:my-0 cursor-pointer" onClick={() => setCurrentPipelineStep(idx)}>
                        <motion.div whileHover={{ scale: 1.1 }} className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${isCompleted ? `bg-emerald-500/20 border-emerald-500 text-emerald-500` : isCurrent ? `bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(0,131,214,0.4)]` : `bg-white/5 border-white/10 text-slate-500`} transition-all`}>
                          {isCompleted ? <FaCheckCircle className="text-xl"/> : isLocked ? <FaLock className="text-xl"/> : <span className="text-xl font-black">{idx + 1}</span>}
                        </motion.div>
                        <span className={`text-xs font-bold text-center ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{step.title}</span>
                        {isCurrent && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full absolute -bottom-6 whitespace-nowrap">In Progress</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Online Assessment (Proctor Mode) */}
            {activeTab === 'oa' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {!oaCompleted ? (
                  <div ref={oaContainerRef} className={`flex h-[700px] gap-6 transition-all ${isProctorMode ? 'bg-[#0A0B10] p-6 fixed inset-0 z-50 h-screen w-screen' : ''}`}>
                    {/* Left Sidebar for OA Sections */}
                    <div className="w-64 shrink-0 flex flex-col gap-2">
                      <div className="p-4 rounded-xl border border-white/5 mb-2 bg-[#13151F]">
                        <div className="text-xs text-slate-400 mb-1 flex justify-between items-center">Time Remaining {isProctorMode && <span className="text-red-500 flex items-center gap-1 animate-pulse"><FaRobot/> Proctored</span>}</div>
                        <div className="text-2xl font-black text-white flex items-center gap-2"><FaClock className="text-red-500 text-lg"/> 95:00</div>
                        <button onClick={toggleProctorMode} className="mt-4 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex justify-center items-center gap-2 transition-all">
                          {isProctorMode ? <FaCompress/> : <FaExpand/>} {isProctorMode ? 'Exit Proctor' : 'Enter Fullscreen'}
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {OA_SECTIONS.map(sec => (
                          <button key={sec.id} onClick={() => setActiveOASection(sec.id)} className={`w-full text-left p-4 rounded-xl border transition-all ${activeOASection === sec.id ? 'bg-white/10 border-blue-500 text-white shadow-lg' : 'bg-[#13151F] border-white/5 text-slate-400 hover:bg-white/5'}`}>
                            <h4 className="font-bold text-sm mb-1">{sec.name}</h4>
                            <div className="text-[10px] opacity-70 line-clamp-2">{sec.topics.join(', ')}</div>
                          </button>
                        ))}
                      </div>

                      <button onClick={submitOA} className="mt-auto py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white transition-all shadow-lg shadow-blue-500/20">
                        Submit Assessment
                      </button>
                    </div>

                    {/* Right Area for Content */}
                    <div className="flex-1 rounded-2xl border border-white/10 overflow-hidden flex flex-col bg-[#13151F]">
                      {proctorWarnings > 0 && (
                        <div className="bg-red-500/20 text-red-400 text-xs font-bold p-2 text-center flex items-center justify-center gap-2 border-b border-red-500/30">
                          <FaExclamationTriangle/> Warning: {proctorWarnings} tab switches detected. Auto-submit after 3 warnings.
                        </div>
                      )}
                      
                      {activeOASection === 'coding' ? (
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                              <h3 className="font-bold text-white">Coding Assessment: Professional Editor</h3>
                              <p className="text-xs text-slate-400 mt-1">Language: {editorLanguage} | Auto-save On</p>
                            </div>
                            <select className="bg-black/50 border border-white/10 rounded-lg text-xs p-2 text-white outline-none" value={editorLanguage} onChange={(e) => setEditorLanguage(e.target.value)}>
                              <option value="java">Java</option><option value="python">Python</option><option value="cpp">C++</option><option value="javascript">JavaScript</option>
                            </select>
                          </div>
                          <div className="flex-1 bg-[#0d1117] flex">
                            <div className="w-1/3 p-5 border-r border-white/10 overflow-y-auto">
                              <h4 className="font-bold text-sm text-white mb-2">Question Palette</h4>
                              <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                                 {[1,2,3].map(q => (
                                   <div key={q} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold border cursor-pointer ${q === 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/10 text-slate-500 hover:bg-white/5'}`}>Q{q}</div>
                                 ))}
                              </div>
                              <h4 className="font-bold text-sm text-white mb-2">Maximum Subarray</h4>
                              <p className="text-sm text-slate-300 leading-relaxed mb-4">Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.</p>
                              <div className="bg-black/40 p-3 rounded-lg text-xs font-mono mb-4 text-emerald-400 border border-white/5">
                                Input: nums = [-2,1,-3,4,-1,2,1,-5,4]<br/>Output: 6
                              </div>
                            </div>
                            <div className="flex-1 relative">
                              <Editor language={editorLanguage} theme="vs-dark" value={editorCode} onChange={setEditorCode} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
                            </div>
                          </div>
                          <div className="p-4 bg-black/30 border-t border-white/10 flex justify-between items-center">
                            <div className="text-xs text-emerald-400 font-mono">All Test Cases Passed!</div>
                            <div className="flex gap-3">
                              <button onClick={handleRunCode} disabled={isCompiling} className="px-6 py-2 rounded-lg font-bold text-xs bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-white border border-white/10"><FaPlay/> {isCompiling ? 'Compiling...' : 'Run Code'}</button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 h-full flex flex-col justify-between bg-black/10">
                          <div>
                            <div className="flex justify-between items-center mb-8">
                              <h3 className="text-xl font-black text-white">{OA_SECTIONS.find(s => s.id === activeOASection)?.name}</h3>
                              <div className="text-sm font-bold text-slate-400">Question 1 of 15</div>
                            </div>
                            <div className="text-lg text-slate-200 mb-8 leading-relaxed">
                              If the price of a book is first decreased by 25% and then increased by 20%, what is the net change in the price?
                            </div>
                            <div className="space-y-3">
                              {['No Change', '5% Decrease', '10% Decrease', '10% Increase'].map((opt, i) => (
                                <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-blue-500/50 cursor-pointer transition-all">
                                  {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-6 border-t border-white/5">
                            <button className="px-6 py-2 rounded-lg font-bold text-xs text-slate-400 hover:text-white transition-colors">Previous</button>
                            <button className="px-6 py-2 rounded-lg font-bold text-xs bg-blue-600 text-white hover:bg-blue-500 transition-colors">Save & Next</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Section-wise Analytics View post OA
                  <div className="space-y-8 animate-fade-in">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"><FaCheck/></div>
                      <h2 className="text-2xl font-black text-white">Assessment Submitted</h2>
                      <p className="text-slate-400 mt-2">Detailed Section-wise Analytics Generated</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl border border-white/5 bg-[#13151F]">
                        <h3 className="text-lg font-bold text-white mb-4">Quantitative & Logical</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Accuracy</span><span className="text-white font-bold">85%</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Questions Attempted</span><span className="text-white font-bold">30/30</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Weak Topics</span><span className="text-orange-400 font-bold">Probability, Puzzles</span></div>
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl border border-white/5 bg-[#13151F]">
                        <h3 className="text-lg font-bold text-white mb-4">Coding Performance</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Passed Test Cases</span><span className="text-emerald-400 font-bold">12/12</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Hidden Test Cases</span><span className="text-emerald-400 font-bold">5/5</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Avg Runtime</span><span className="text-white font-bold">14ms</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-400">Code Quality Score</span><span className="text-white font-bold">92/100</span></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <button onClick={() => { setActiveTab('tech'); setCurrentPipelineStep(3); }} className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/30">Proceed to Technical Interview</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB CONTENT: Question Bank */}
            {activeTab === 'qbank' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {QUESTION_BANK_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setActiveQuestionCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeQuestionCategory === cat ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(0,131,214,0.4)]' : 'bg-black/20 text-slate-400 border-white/10 hover:bg-white/5'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="p-5 rounded-2xl border border-white/5 flex flex-col gap-4 group cursor-pointer hover:border-blue-500/40 transition-colors bg-[#13151F]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${i%3===0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : i%2===0 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} border`}>{i%3===0 ? 'Hard' : i%2===0 ? 'Medium' : 'Easy'}</span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">{activeQuestionCategory}</span>
                        </div>
                        <FaCode className="text-slate-600 group-hover:text-blue-500 transition-colors"/>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">Infosys Previous Year Problem {i}</h4>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">This problem is frequently asked in the Infosys HackWithInfy rounds.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Technical & HR Interview */}
            {(activeTab === 'tech' || activeTab === 'hr') && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col xl:flex-row h-auto xl:h-[650px] gap-6">
                
                {/* Chat Area */}
                <div className="flex-1 flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#13151F]">
                  <div className="p-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30"><FaRobot className="text-blue-400 text-lg"/></div>
                      <div>
                        <h3 className="font-bold text-white text-sm">AI Interviewer (Infosys)</h3>
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">● Live Session</p>
                      </div>
                    </div>
                    {/* Live Progress Flow indicator */}
                    <div className="hidden md:flex gap-1">
                       {(activeTab === 'tech' ? TECH_FLOW : HR_TOPICS.slice(0,5)).map((t, i) => (
                         <div key={t} className={`h-1.5 w-6 rounded-full ${(activeTab === 'tech' ? techStep : hrStep) >= i ? 'bg-blue-500' : 'bg-white/10'}`} title={t}></div>
                       ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                            {activeTab === 'tech' ? <FaCode className="text-2xl text-blue-400"/> : <FaUsers className="text-2xl text-blue-400"/>}
                         </div>
                         <h3 className="text-lg font-bold text-white mb-2">{activeTab === 'tech' ? 'Technical Interview Module' : 'HR Interview Module'}</h3>
                         <p className="text-slate-400 max-w-sm mb-6 text-sm">Experience dynamic AI-driven follow-up questions tailored to Infosys interview patterns.</p>
                        <button onClick={() => startInterview(activeTab)} className="px-6 py-3 rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(0,131,214,0.4)] bg-[#0083D6] hover:bg-blue-500">
                          Start {activeTab === 'tech' ? 'Technical' : 'HR'} Interview
                        </button>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-md' : 'bg-white/5 border border-white/10 text-slate-200 rounded-2xl rounded-bl-sm shadow-md'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-black/40 border-t border-white/10">
                    <div className="relative">
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} disabled={chatMessages.length === 0} placeholder="Type your response to the interviewer..." className="w-full bg-black/60 border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white outline-none focus:border-blue-500/50 transition-colors" />
                      <button onClick={handleChatSend} disabled={chatMessages.length === 0} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors disabled:opacity-50">
                        <FaPaperPlane className="text-xs"/>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Context & Live Eval Pane */}
                <div className="w-full xl:w-80 shrink-0 flex flex-col gap-4">
                  {/* Floating Live Eval */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-[#13151F] shadow-lg">
                    <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FaChartLine className="text-emerald-400"/> Live AI Evaluation</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Technical Depth', val: liveEval.tech },
                        { label: 'Communication', val: liveEval.comms },
                        { label: 'Confidence', val: liveEval.confidence },
                        { label: 'Overall Readiness', val: liveEval.overall }
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>{metric.label}</span><span className="text-white font-bold">{metric.val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${metric.val}%` }} className="h-full bg-emerald-500 rounded-full" transition={{ duration: 0.5 }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeTab === 'tech' ? (
                    <div className="flex-1 rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-xl bg-[#13151F]">
                      <div className="p-3 border-b border-white/10 bg-black/40 font-bold text-xs text-slate-400 flex justify-between"><span>Live Whiteboard</span></div>
                      <div className="flex-1 relative">
                        <Editor language="javascript" theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on", padding: { top: 10 } }} value="// Draft logic or write pseudo-code here..." />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-5 rounded-2xl border border-white/10 bg-[#13151F]">
                      <h4 className="font-bold text-xs text-white mb-4 uppercase tracking-wider flex items-center gap-2"><FaUsers className="text-purple-500"/> HR Evaluation Matrix</h4>
                      <div className="space-y-3">
                         {HR_TOPICS.map(t => (
                           <div key={t} className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div><span className="text-xs text-slate-300 font-medium">{t}</span></div>
                         ))}
                      </div>
                      <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 leading-relaxed">
                        <strong>AI Note:</strong> Answers are evaluated based on confidence, clarity, and alignment with Infosys CLITE values (STAR structure highly recommended).
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Final Hiring Panel */}
            {activeTab === 'panel' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-white">Hiring Committee Verdict</h2>
                  <p className="text-slate-400 mt-2">Comprehensive review of your entire Infosys simulation pipeline.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Panel Recommendations */}
                  <div className="p-6 rounded-2xl border border-white/5 bg-[#13151F] text-center">
                    <FaLaptopCode className="text-3xl text-blue-400 mx-auto mb-3"/>
                    <h3 className="text-sm font-bold text-slate-400 mb-1">Assessment Panel</h3>
                    <div className="text-xl font-black text-emerald-400 mb-3">Strong Hire</div>
                    <p className="text-xs text-slate-500">"Exceptional performance in coding rounds. Passed all test cases."</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 bg-[#13151F] text-center">
                    <FaBrain className="text-purple-400 mx-auto mb-3 text-3xl"/>
                    <h3 className="text-sm font-bold text-slate-400 mb-1">Technical Panel</h3>
                    <div className="text-xl font-black text-blue-400 mb-3">Hire</div>
                    <p className="text-xs text-slate-500">"Solid understanding of OOP and DB design. Could improve on complex algorithms."</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/5 bg-[#13151F] text-center">
                    <FaUsers className="text-orange-400 mx-auto mb-3 text-3xl"/>
                    <h3 className="text-sm font-bold text-slate-400 mb-1">HR Panel</h3>
                    <div className="text-xl font-black text-emerald-400 mb-3">Strong Hire</div>
                    <p className="text-xs text-slate-500">"Excellent communication and cultural fit (CLITE values). Will adapt well."</p>
                  </div>
                </div>

                {/* Offer Letter Simulation */}
                <div className="p-10 rounded-2xl border border-emerald-500/30 relative overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${THEME.card} 0%, #10b98120 100%)` }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><FaCheckCircle className="text-emerald-400"/> Simulated Offer Generated</h3>
                  
                  <div className="bg-black/20 border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Company</div>
                      <div className="text-lg font-bold text-white">Infosys Limited</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Role / Track</div>
                      <div className="text-lg font-bold text-white">Digital Specialist Engineer (DSE)</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Compensation</div>
                      <div className="text-lg font-bold text-emerald-400">6.25 LPA</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Joining Timeline</div>
                      <div className="text-lg font-bold text-white">August 2026 Batch</div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                    <button className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-500/30">Accept Offer</button>
                    <button onClick={() => setActiveTab('report')} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10">View Detailed Report</button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: Final Report */}
            {activeTab === 'report' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white">Final Performance Report</h2>
                    <p className="text-sm text-slate-400 mt-1">Deep analytics across all recruitment phases.</p>
                  </div>
                  <button onClick={downloadReport} className="px-5 py-2.5 rounded-xl font-bold text-white transition-all flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(0,131,214,0.4)] hover:scale-105 bg-[#0083D6]">
                    <FaFilePdf /> Download PDF
                  </button>
                </div>
                
                <div ref={reportRef} className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[{ l: 'Overall Score', v: '86%', i: FaStar, c: 'text-yellow-400' }, { l: 'Assessment Score', v: '85%', i: FaLaptopCode, c: 'text-indigo-400' }, { l: 'Coding Perf.', v: '88%', i: FaCode, c: 'text-emerald-400' }, { l: 'Tech Knowledge', v: '82%', i: FaBrain, c: 'text-blue-400' }, { l: 'Communication', v: '92%', i: FaUsers, c: 'text-purple-400' }].map(s => (
                      <div key={s.l} className="p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center bg-[#13151F]">
                        <s.i className={`text-2xl mb-2 ${s.c} opacity-80`} />
                        <div className="text-2xl font-black text-white">{s.v}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-white/5 space-y-6 shadow-lg bg-[#13151F]">
                      <div>
                        <h3 className="text-xs font-black text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-2"><FaChartLine/> Strengths</h3>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                          <li className="flex items-start gap-3 bg-white/5 p-2 rounded-lg border border-white/5"><span className="text-emerald-400 mt-0.5">✓</span> Exceptional DB Schema design principles.</li>
                          <li className="flex items-start gap-3 bg-white/5 p-2 rounded-lg border border-white/5"><span className="text-emerald-400 mt-0.5">✓</span> Highly structured STAR method usage in HR.</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-orange-400 mb-3 uppercase tracking-wider flex items-center gap-2"><FaChartLine/> Weak Areas</h3>
                        <ul className="space-y-2.5 text-sm text-slate-300">
                          <li className="flex items-start gap-3 bg-white/5 p-2 rounded-lg border border-white/5"><span className="text-orange-400 mt-0.5">!</span> Algorithm Time Complexity optimizations.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-8 rounded-2xl border border-blue-500/30 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-xl bg-[#13151F]">
                       <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Hire Probability: <span className="text-emerald-400">High</span></h3>
                       <p className="text-slate-300 text-sm mb-8 max-w-sm leading-relaxed">
                         You have successfully met the criteria for the <strong className="text-white">DSE</strong> track.
                       </p>
                       <div className="w-full">
                         <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider text-left">Personalized Roadmap to SP Track</div>
                         <div className="flex gap-2">
                            <div className="flex-1 bg-white/10 rounded-lg p-2.5 text-xs text-white border border-white/10 font-medium">1. Advanced DSA (Graphs/Trees)</div>
                            <div className="flex-1 bg-white/10 rounded-lg p-2.5 text-xs text-white border border-white/10 font-medium">2. High Level System Design</div>
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

export default InfosysPrepDetail;
