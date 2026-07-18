import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLaptopCode, FaBrain, FaUsers, FaCheckCircle, FaLock,
  FaClock, FaTrophy, FaBriefcase, FaCode, FaChartLine,
  FaRobot, FaPlay, FaPaperPlane, FaChevronRight,
  FaFilePdf, FaStar, FaDatabase, FaStream, FaExclamationTriangle,
  FaExpand, FaCompress, FaCheck, FaHistory, FaMedal, FaCloud,
  FaShare, FaShieldAlt, FaLightbulb, FaBookOpen, FaGraduationCap,
  FaAward, FaBolt, FaThumbsUp, FaThumbsDown,
  FaRedo, FaFlag, FaEye, FaSave, FaTimes, FaListUl, FaKeyboard
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

// ─────────────────────────────────────────────────────────────────────
//  WIPRO PURPLE THEME
// ─────────────────────────────────────────────────────────────────────
const W = {
  get bg() { return document.documentElement.classList.contains('light') ? '#F3F4F6' : '#07050F'; },
  get card() { return document.documentElement.classList.contains('light') ? '#FFFFFF' : '#0F0A1E'; },
  get card2() { return document.documentElement.classList.contains('light') ? '#F9FAFB' : '#160E2A'; },
  get border() { return document.documentElement.classList.contains('light') ? '#E5E7EB' : '#2D1F52'; },
  get accent() { return '#7C3AED'; },
  get accentLight() { return document.documentElement.classList.contains('light') ? '#6D28D9' : '#A855F7'; },
  get accentDark() { return '#5B21B6'; },
  get accentGlow() { return document.documentElement.classList.contains('light') ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.35)'; },
  get emerald() { return '#10B981'; },
  get amber() { return '#F59E0B'; },
  get red() { return '#EF4444'; },
  get text() { return document.documentElement.classList.contains('light') ? '#1F2937' : '#E2E8F0'; },
  get muted() { return '#6B7280'; },
};

// ─────────────────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 'pe', name: 'Project Engineer', pkg: '3.5 LPA', diff: 'Medium',
    elig: 'B.E/B.Tech/MCA (60%+)', coding: 'Intermediate', iv: 'Medium',
    prep: '3–4 Weeks', growth: 'Standard', skills: ['Java', 'Python', 'SQL', 'OOP'],
  },
  {
    id: 'elite', name: 'Elite', pkg: '6.0 – 7.5 LPA', diff: 'Hard',
    elig: 'B.E/B.Tech (Top Performers)', coding: 'Advanced', iv: 'High',
    prep: '5–6 Weeks', growth: 'Accelerated', skills: ['DSA', 'System Design', 'Cloud', 'Java'],
  },
  {
    id: 'turbo', name: 'Turbo', pkg: '8.0 – 10.0 LPA', diff: 'Very Hard',
    elig: 'B.E/B.Tech CGPA 8.0+ or Top Rankers', coding: 'Expert', iv: 'Very High',
    prep: '6–8 Weeks', growth: 'Fast Track', skills: ['CP', 'Advanced DSA', 'System Design', 'ML'],
  },
];

const ROLES = [
  'Software Engineer', 'Java Developer', 'Frontend Developer',
  'Backend Developer', 'Full Stack Developer', 'Cloud Engineer',
  'QA Engineer', 'Support Engineer', 'Data Engineer',
];

const PIPELINE = [
  { id: 'app', label: 'Application' },
  { id: 'resume', label: 'Resume Screening' },
  { id: 'oa', label: 'Online Assessment' },
  { id: 'tech', label: 'Technical Interview' },
  { id: 'hr', label: 'HR Interview' },
  { id: 'offer', label: 'Offer Letter' },
];

const OA_SECTIONS = [
  {
    id: 'aptitude', name: 'Aptitude', icon: FaChartLine, color: '#818CF8', questions: 20, mins: 25,
    analytics: { attempted: 19, correct: 17, wrong: 2, accuracy: 89, avg: '55s' },
    weak: ['Time & Distance', 'Profit & Loss'],
  },
  {
    id: 'logic', name: 'Logical Reasoning', icon: FaBrain, color: '#34D399', questions: 20, mins: 25,
    analytics: { attempted: 18, correct: 16, wrong: 2, accuracy: 88, avg: '58s' },
    weak: ['Blood Relations'],
  },
  {
    id: 'verbal', name: 'Verbal Ability', icon: FaBookOpen, color: '#F472B6', questions: 20, mins: 20,
    analytics: { attempted: 20, correct: 18, wrong: 2, accuracy: 90, avg: '40s' },
    weak: ['Reading Comprehension'],
  },
  {
    id: 'coding', name: 'Coding', icon: FaCode, color: '#FBBF24', questions: 2, mins: 60,
    analytics: { passed: 4, total: 4, runtime: '14ms', memory: '34MB', optScore: 94, quality: 'A+', maintainability: 'High' },
    weak: [],
  },
];

const SAMPLE_QUESTIONS = {
  aptitude: [
    { q: 'A train 120m long passes a pole in 12 seconds. Find the speed in km/h.', opts: ['36 km/h', '72 km/h', '48 km/h', '60 km/h'], ans: 0 },
    { q: 'If 12 workers can complete a job in 15 days, how many days will 20 workers take?', opts: ['9 days', '10 days', '8 days', '12 days'], ans: 0 },
  ],
  logic: [
    { q: 'Pointing to a photo, Raj says "Her mother\'s brother is my uncle." How is the girl related to Raj?', opts: ['Sister', 'Aunt', 'Cousin', 'Mother'], ans: 0 },
    { q: 'All birds can fly. Penguin is a bird. Conclusion: Penguin can fly.', opts: ['True', 'False', 'Possibly True', 'Cannot Determine'], ans: 3 },
  ],
  verbal: [
    { q: 'Select the correct sentence:', opts: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], ans: 2 },
    { q: 'Synonym of "Arduous":', opts: ['Easy', 'Difficult', 'Boring', 'Clever'], ans: 1 },
  ],
};

const TECH_FLOW = [
  { step: 'Welcome & Project Intro', q: "Welcome to your Wipro Technical Interview! I'm Alex, your AI Technical Evaluator. Let's begin — please introduce yourself and walk me through your most significant project, including the problem it solves." },
  { step: 'Architecture Deep Dive', q: "Excellent overview! Can you elaborate on the architecture of your project? Why did you choose this particular architecture, and what alternatives did you evaluate?" },
  { step: 'Database Design', q: "Let's discuss your data layer. How did you design your database schema? Did you opt for SQL or NoSQL, and what were the trade-offs?" },
  { step: 'Java & OOP Concepts', q: "Moving to core Java — can you explain the four pillars of OOP with real examples from your project? Also describe how you used Java collections." },
  { step: 'DBMS & SQL', q: "Walk me through how you'd write a SQL query to find the top 3 departments by average salary. Also explain joins — inner, left, and right." },
  { step: 'OS & CN Fundamentals', q: "Quick fundamentals check — explain the difference between process and thread, and describe how HTTPS differs from HTTP in terms of security." },
  { step: 'Coding Problem', q: "Let's code! Write a function to find the longest palindromic substring in a given string. Explain your approach and its complexity before coding." },
  { step: 'Code Optimization', q: "Can you optimize your palindrome solution to run in O(N) time using Manacher's algorithm? Walk me through the idea." },
  { step: 'REST API & Git', q: "Describe the key principles of REST API design and the HTTP status codes you used in your project. How did you manage version control with Git — describe your branching strategy." },
  { step: 'Debugging & Wrap-up', q: "Final scenario: Your deployed API starts returning 500 errors intermittently under heavy load. Walk me through your systematic debugging approach, step by step." },
];

const HR_FLOW = [
  { step: 'Self Introduction', q: "Hello and welcome! I'm Priya from Wipro HR. I'm glad you're here today. To start, please tell me about yourself — your background, interests, and what brings you to Wipro." },
  { step: 'Why Wipro', q: "Wonderful! You've clearly done your research. What specifically draws you to Wipro — our culture, technology stack, or growth opportunities? Why not other companies?" },
  { step: 'Strengths', q: "Can you walk me through your top two or three strengths with specific examples from your academic or project experience?" },
  { step: 'Weaknesses', q: "Nobody's perfect — what is one genuine weakness you've identified in yourself, and how are you actively working to improve it?" },
  { step: 'Projects & Achievements', q: "Tell me about the project you're proudest of. What was your individual contribution, and what challenges did you personally overcome?" },
  { step: 'Leadership & Teamwork', q: "Describe a situation where you led or significantly contributed to a team effort. How did you resolve disagreements within the group?" },
  { step: 'Conflict Resolution', q: "Can you share an example of a conflict you had with a peer or manager and explain how you resolved it professionally?" },
  { step: 'Career Goals', q: "Where do you see your career in 3–5 years? How does this role at Wipro align with your long-term aspirations?" },
  { step: 'Flexibility & Availability', q: "Wipro works on a global client model which may require relocating, working night shifts, or adapting to client time zones. Are you comfortable with these requirements?" },
  { step: 'Closing', q: "We're nearly done! Is there anything specific you'd like us to know about you that we haven't covered yet? And do you have any questions for me about Wipro?" },
];

const QBANK_CATS = ['Arrays','Strings','Linked List','Stack','Queue','HashMap','Trees','Graphs','Sorting','Searching','Recursion','Greedy','Dynamic Programming','SQL','OOP'];

const BADGES = [
  { id: 'oaexpert', name: 'Assessment Expert', icon: FaBrain, color: '#818CF8', desc: '90%+ across all aptitude sections', earned: true },
  { id: 'coder', name: 'Coding Champion', icon: FaCode, color: '#34D399', desc: '100% test cases with optimal solution', earned: true },
  { id: 'java', name: 'Java Specialist', icon: FaLaptopCode, color: '#FB923C', desc: 'Deep Java & OOP mastery demonstrated', earned: false },
  { id: 'sql', name: 'SQL Master', icon: FaDatabase, color: '#60A5FA', desc: 'Solved all SQL problems optimally', earned: false },
  { id: 'comms', name: 'Communication Star', icon: FaUsers, color: '#F472B6', desc: 'Exceptional HR round performance', earned: true },
  { id: 'solver', name: 'Problem Solver', icon: FaLightbulb, color: '#FBBF24', desc: 'Solved Hard-level questions in time', earned: false },
  { id: 'ready', name: 'Wipro Ready', icon: FaShieldAlt, color: '#34D399', desc: 'Completed full simulation pipeline', earned: false },
  { id: 'fast', name: 'Fast Learner', icon: FaBolt, color: '#A78BFA', desc: 'Improved 15%+ across attempts', earned: true },
];

const HISTORY = [
  { date: '2025-11-10', track: 'Project Engineer', oa: '71%', coding: '75%', tech: '68%', hr: '80%', overall: '73%', status: 'Not Selected', hire: 35 },
  { date: '2026-02-18', track: 'Elite', oa: '84%', coding: '88%', tech: '81%', hr: '87%', overall: '85%', status: 'Borderline', hire: 60 },
  { date: '2026-07-05', track: 'Turbo', oa: '95%', coding: '97%', tech: '93%', hr: '96%', overall: '95%', status: 'Selected', hire: 95 },
];

const COMMITTEE = [
  { role: 'Assessment Panel', icon: FaChartLine, color: '#818CF8', verdict: 'Strong Hire', rating: 95, comment: 'Exceptional cognitive performance across all four sections. 95% accuracy with optimal time management — significantly above Turbo benchmark. Code solution passed all 4/4 test cases with O(N) complexity.' },
  { role: 'Technical Panel', icon: FaLaptopCode, color: '#34D399', verdict: 'Strong Hire', rating: 93, comment: 'Deep understanding of Java internals, DBMS normalization, and REST API design principles. Live coding showed spontaneous optimization from O(N²) → O(N). Highly recommended for Wipro Turbo track.' },
  { role: 'HR Panel', icon: FaUsers, color: '#F472B6', verdict: 'Hire', rating: 96, comment: 'Outstanding communication with well-structured STAR responses. Genuine alignment with Wipro\'s values of innovation and flexibility. Showed strong career intent and adaptability.' },
];

// ─────────────────────────────────────────────────────────────────────
//  UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────
const ProgressBar = ({ label, value, color = W.accent, sub }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-semibold">
      <span style={{ color: W.muted }}>{label}</span>
      <span className="text-white font-bold">{value}%</span>
    </div>
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1.1, ease: 'easeOut' }}
        className="h-full rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }} />
    </div>
    {sub && <div className="text-[10px]" style={{ color: W.muted }}>{sub}</div>}
  </div>
);

const Pill = ({ children, color }) => (
  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border"
    style={{ color, backgroundColor: `${color}15`, borderColor: `${color}30` }}>
    {children}
  </span>
);

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="relative rounded-2xl border p-6 flex flex-col gap-3 group transition-all hover:-translate-y-0.5 overflow-hidden"
    style={{ backgroundColor: W.card, borderColor: W.border }}>
    <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-30 transition-all" style={{ backgroundColor: color }} />
    <div className="flex items-center justify-between relative z-10">
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: W.muted }}>{label}</span>
      {Icon && <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}><Icon className="text-sm" style={{ color }} /></div>}
    </div>
    <div className="text-3xl font-black text-white relative z-10">{value}</div>
    {sub && <div className="text-xs font-semibold relative z-10" style={{ color: W.muted }}>{sub}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────
const WiproPrepDetail = () => {
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleTheme = () => setTick(t => t + 1);
    window.addEventListener('theme-changed', handleTheme);
    return () => window.removeEventListener('theme-changed', handleTheme);
  }, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pipelineStep, setPipelineStep] = useState(2);

  // OA state
  const [oaSec, setOaSec] = useState('aptitude');
  const [oaQIdx, setOaQIdx] = useState(0);
  const [oaAnswers, setOaAnswers] = useState({});
  const [reviewed, setReviewed] = useState(new Set());
  const [timer, setTimer] = useState(90 * 60);
  const [oaDone, setOaDone] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsSec, setAnalyticsSec] = useState('aptitude');
  const [proctored, setProctored] = useState(false);
  const [violations, setViolations] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const oaRef = useRef(null);
  const timerRef = useRef(null);

  // Coding state
  const [lang, setLang] = useState('java');
  const [code, setCode] = useState('// Wipro Coding Assessment\n// Problem: Longest Palindromic Substring\n\n');
  const [customInput, setCustomInput] = useState('');
  const [compiling, setCompiling] = useState(false);
  const [codeResult, setCodeResult] = useState(null);

  // Interview state
  const [techStep, setTechStep] = useState(-1);
  const [hrStep, setHrStep] = useState(-1);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [intDone, setIntDone] = useState({ tech: false, hr: false });
  const chatRef = useRef(null);

  // Eval
  const [evalMetrics, setEvalMetrics] = useState({ assessment: 95, coding: 97, tech: 0, comms: 0, confidence: 0, problemSolving: 0, readiness: 0 });
  const [evalRunning, setEvalRunning] = useState(false);

  // Other
  const [qbankCat, setQbankCat] = useState('Arrays');
  const [finalResult, setFinalResult] = useState(null);

  // ── Timer ──
  useEffect(() => {
    if (!oaDone && timer > 0) {
      timerRef.current = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(timerRef.current);
    } else if (timer === 0 && !oaDone) doSubmitOA();
  }, [oaDone, timer]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Proctor ──
  useEffect(() => {
    if (!proctored) return;
    const h = () => { if (document.hidden) { setViolations(v => v + 1); toast.error('⚠️ Tab switch detected! Flagged in report.', { duration: 4000 }); } };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [proctored]);

  const enterProctor = async () => {
    try { await oaRef.current?.requestFullscreen(); } catch {}
    setProctored(true);
    toast.success('Proctor Mode Enabled — Auto-save active.', { icon: '🛡️' });
  };

  const exitProctor = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
    setProctored(false);
  };

  const doSubmitOA = () => {
    clearInterval(timerRef.current);
    exitProctor();
    setConfirmSubmit(false);
    setOaDone(true);
    setShowAnalytics(true);
    setPipelineStep(3);
    toast.success('Assessment submitted! Generating analytics…', { icon: '📊' });
  };

  // ── Live eval ticker ──
  useEffect(() => {
    if (!evalRunning) return;
    const iv = setInterval(() => {
      setEvalMetrics(p => ({
        ...p,
        tech: Math.min(94, p.tech + Math.random() * 2),
        comms: Math.min(96, p.comms + Math.random() * 2),
        confidence: Math.min(93, p.confidence + Math.random() * 2),
        problemSolving: Math.min(95, p.problemSolving + Math.random() * 2),
        readiness: Math.min(95, p.readiness + Math.random() * 2),
      }));
    }, 4000);
    return () => clearInterval(iv);
  }, [evalRunning]);

  // ── Interview logic ──
  const startTech = () => {
    setTechStep(0);
    setMsgs([{ from: 'ai', text: TECH_FLOW[0].q, step: TECH_FLOW[0].step }]);
    setEvalRunning(true);
    setEvalMetrics(p => ({ ...p, tech: 52, comms: 58, confidence: 50, problemSolving: 48, readiness: 55 }));
  };

  const startHR = async () => {
    try {
      toast.loading('Initializing Live HR Interview...', { id: 'hr-start' });
      const res = await api.post('/interviews/create', {
        interviewType: 'HR Interview',
        role: 'Candidate',
        difficulty: 'Medium',
        duration: 30,
        company: 'Wipro'
      });
      toast.success('Interview ready!', { id: 'hr-start' });
      navigate('/interview/live/' + res.data._id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start interview', { id: 'hr-start' });
    }
  };

  const sendMsg = () => {
    if (!input.trim()) return;
    const um = { from: 'user', text: input.trim() };
    setMsgs(p => [...p, um]);
    setInput('');
    setTimeout(() => {
      if (activeTab === 'tech') {
        if (techStep < TECH_FLOW.length - 1) {
          const n = techStep + 1; setTechStep(n);
          setMsgs(p => [...p, { from: 'ai', text: TECH_FLOW[n].q, step: TECH_FLOW[n].step }]);
        } else {
          setMsgs(p => [...p, { from: 'ai', text: 'Outstanding performance! That concludes your technical round. Our panel will deliberate shortly. Please proceed to the HR Interview.', step: 'Completed' }]);
          setIntDone(p => ({ ...p, tech: true })); setEvalRunning(false); setPipelineStep(4);
        }
      } else {
        if (hrStep < HR_FLOW.length - 1) {
          const n = hrStep + 1; setHrStep(n);
          setMsgs(p => [...p, { from: 'ai', text: HR_FLOW[n].q, step: HR_FLOW[n].step }]);
        } else {
          setMsgs(p => [...p, { from: 'ai', text: "Thank you so much for your time today! It was truly a pleasure speaking with you. The Wipro Hiring Committee will review your complete profile and you'll receive an update within 72 hours. All the very best!", step: 'Completed' }]);
          setIntDone(p => ({ ...p, hr: true })); setEvalRunning(false); setPipelineStep(5);
        }
      }
    }, 1400);
  };

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const runCode = () => {
    setCompiling(true); setCodeResult(null);
    setTimeout(() => {
      setCompiling(false);
      setCodeResult({ passed: 4, total: 4, runtime: '14ms', memory: '34 MB', verdict: 'Accepted' });
      toast.success('All 4 / 4 test cases passed!', { icon: '✅' });
    }, 2000);
  };

  const dlPDF = () => { toast.success('Generating Wipro Readiness Report PDF…', { icon: '📄' }); setTimeout(() => toast.success('Wipro_Turbo_Report_2026.pdf downloaded!', { icon: '✅' }), 1800); };

  // ─── Data helpers ───
  const curSec = OA_SECTIONS.find(s => s.id === oaSec);
  const curQs = SAMPLE_QUESTIONS[oaSec] || [];
  const curQ = curQs[oaQIdx];

  // ─────────────────────────────────────────────────────────────────────
  //  TABS
  // ─────────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'dashboard', icon: FaChartLine, label: 'Dashboard' },
    { id: 'tracks', icon: FaTrophy, label: 'Tracks & Roles' },
    { id: 'pipeline', icon: FaStream, label: 'Pipeline' },
    { id: 'oa', icon: FaLaptopCode, label: 'Assessment' },
    { id: 'qbank', icon: FaDatabase, label: 'Question Bank' },
    { id: 'tech', icon: FaCode, label: 'Technical Interview' },
    { id: 'hr', icon: FaUsers, label: 'HR Interview' },
    { id: 'panel', icon: FaBriefcase, label: 'Hiring Committee' },
    { id: 'report', icon: FaFilePdf, label: 'Final Report' },
    { id: 'badges', icon: FaMedal, label: 'Badges' },
    { id: 'history', icon: FaHistory, label: 'History' },
  ];

  // ─────────────────────────────────────────────────────────────────────
  //  LIVE SCORECARD
  // ─────────────────────────────────────────────────────────────────────
  const LiveScorecard = () => (
    <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: W.card, borderColor: W.border }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live AI Scorecard</span>
      </div>
      {[
        { l: 'Assessment', v: evalMetrics.assessment, c: '#818CF8' },
        { l: 'Coding', v: evalMetrics.coding, c: '#34D399' },
        { l: 'Technical', v: Math.round(evalMetrics.tech), c: W.accentLight },
        { l: 'Communication', v: Math.round(evalMetrics.comms), c: '#F472B6' },
        { l: 'Confidence', v: Math.round(evalMetrics.confidence), c: '#FBBF24' },
        { l: 'Problem Solving', v: Math.round(evalMetrics.problemSolving), c: '#34D399' },
        { l: 'Hiring Readiness', v: Math.round(evalMetrics.readiness), c: W.accent },
      ].map(m => (
        <div key={m.l} className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span style={{ color: W.muted }}>{m.l}</span>
            <span className="text-white">{m.v}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: m.c, boxShadow: `0 0 6px ${m.c}80` }}
              initial={{ width: 0 }} animate={{ width: `${m.v}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────
  //  SECTION ANALYTICS
  // ─────────────────────────────────────────────────────────────────────
  const SectionAnalytics = () => {
    const sec = OA_SECTIONS.find(s => s.id === analyticsSec);
    const isCoding = analyticsSec === 'coding';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-black text-white">Section-wise Analytics</h2>
          <button onClick={() => { setShowAnalytics(false); setActiveTab('tech'); }}
            className="px-6 py-2.5 rounded-xl text-sm font-black text-white flex items-center gap-2"
            style={{ backgroundColor: W.accent, boxShadow: `0 0 20px ${W.accentGlow}` }}>
            Proceed to Technical Interview <FaChevronRight />
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {OA_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setAnalyticsSec(s.id)}
              className="px-5 py-2.5 rounded-xl text-xs font-black border transition-all"
              style={analyticsSec === s.id ? { backgroundColor: `${s.color}20`, borderColor: s.color, color: s.color } : { backgroundColor: W.card, borderColor: W.border, color: W.muted }}>
              <s.icon className="inline mr-2" />{s.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: W.card, borderColor: W.border }}>
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <sec.icon style={{ color: sec.color }} />{sec.name} — Performance
            </h3>
            {isCoding ? (
              <div className="space-y-4">
                {[['Passed Test Cases', `${sec.analytics.passed} / ${sec.analytics.total}`, 'text-emerald-400'], ['Runtime', sec.analytics.runtime, 'text-blue-400'], ['Memory Usage', sec.analytics.memory, 'text-blue-400'], ['Optimization Score', `${sec.analytics.optScore}/100`, 'text-yellow-400'], ['Code Quality', sec.analytics.quality, 'text-emerald-400'], ['Maintainability', sec.analytics.maintainability, 'text-emerald-400']].map(([k, v, col]) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b" style={{ borderColor: W.border }}>
                    <span className="text-sm" style={{ color: W.muted }}>{k}</span>
                    <span className={`font-black text-sm ${col}`}>{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[['Questions Attempted', `${sec.analytics.attempted} / ${sec.questions}`, 'text-white'], ['Correct', sec.analytics.correct, 'text-emerald-400'], ['Wrong', sec.analytics.wrong, 'text-red-400'], ['Accuracy', `${sec.analytics.accuracy}%`, 'text-blue-400'], ['Avg Time / Question', sec.analytics.avg, 'text-yellow-400']].map(([k, v, col]) => (
                  <div key={k} className="flex justify-between py-2 border-b" style={{ borderColor: W.border }}>
                    <span className="text-sm" style={{ color: W.muted }}>{k}</span>
                    <span className={`font-black text-sm ${col}`}>{v}</span>
                  </div>
                ))}
                <ProgressBar label="Section Accuracy" value={sec.analytics.accuracy} color={sec.color} />
              </div>
            )}
          </div>
          <div className="space-y-5">
            {sec.weak.length > 0 && (
              <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: W.card, borderColor: W.border }}>
                <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><FaExclamationTriangle /> Weak Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {sec.weak.map(t => <span key={t} className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ backgroundColor: '#F59E0B10', borderColor: '#F59E0B30', color: '#F59E0B' }}>{t}</span>)}
                </div>
              </div>
            )}
            <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: W.card, borderColor: W.border }}>
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><FaLightbulb /> AI Recommendations</h4>
              {(isCoding ? ['Your solution was optimal — practice similar string DP patterns.', 'Implement the solution in Python as well for versatility.', 'Focus on edge cases: empty string, single character, all unique.'] : [`Practice ${sec.weak[0] || 'core'} problems daily for 7 days.`, 'Target 95%+ accuracy with 15 timed problems per topic.', 'Reduce per-question time by 10–15 seconds through pattern recognition.']).map((tip, i) => (
                <div key={i} className="flex gap-3 text-sm" style={{ color: W.muted }}><span className="text-emerald-400 font-bold mt-0.5">→</span>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: W.bg, color: W.text }}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-16">

          {/* ── HERO ── */}
          <section className="relative px-8 pt-10 pb-14 border-b overflow-hidden" style={{ borderColor: W.border, background: `linear-gradient(160deg, ${W.accentDark}1A 0%, ${W.bg} 70%)` }}>
            <div className="absolute -top-40 -right-40 w-96 h-96 blur-[120px] rounded-full" style={{ backgroundColor: `${W.accent}20` }} />
            <div className="absolute -top-20 -left-20 w-60 h-60 blur-[100px] rounded-full" style={{ backgroundColor: `${W.accentLight}10` }} />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-10">
                {/* Wipro Logo */}
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border font-black text-3xl"
                  style={{ backgroundColor: W.card, borderColor: W.border, color: W.accent, boxShadow: `0 0 30px ${W.accentGlow}` }}>W</div>
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-4xl font-black text-white tracking-tight">Wipro Campus Hiring Simulation</h1>
                    <span className="px-3 py-1 rounded-full text-xs font-black border" style={{ backgroundColor: `${W.accent}15`, borderColor: `${W.accent}40`, color: W.accentLight }}>2025 – 2026</span>
                  </div>
                  <p className="text-sm max-w-2xl leading-relaxed" style={{ color: W.muted }}>
                    End-to-end AI-powered simulation for Project Engineer · Elite · Turbo tracks. Proctored assessment, dynamic AI interviews, live scorecard, and personalized analytics — all in one platform.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Hiring Difficulty', value: 'High', color: W.amber },
                  { label: 'Average Package', value: '5.5 LPA', color: '#34D399' },
                  { label: 'Selection Rate', value: '4.8%', color: '#F472B6' },
                  { label: 'Prep Progress', value: '72%', color: W.accent },
                  { label: 'AI Readiness', value: '91/100', color: '#818CF8' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border p-4 flex flex-col gap-1" style={{ backgroundColor: W.card, borderColor: W.border }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: W.muted }}>{s.label}</span>
                    <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-8 pt-6 space-y-8">

            {/* ── TABS ── */}
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 sticky top-0 z-20 pt-2 -mx-8 px-8"
              style={{ backgroundColor: `${W.bg}F0`, backdropFilter: 'blur(12px)' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border"
                  style={activeTab === t.id
                    ? { backgroundColor: `${W.accent}20`, borderColor: W.accent, color: W.accentLight }
                    : { backgroundColor: 'transparent', borderColor: 'transparent', color: W.muted }}>
                  <t.icon />{t.label}
                </button>
              ))}
            </div>

            {/* ════════════ DASHBOARD ════════════ */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Application Status" value="In Progress" sub="Track: Wipro Turbo" icon={FaChartLine} color={W.accent} />
                  <StatCard label="Current Round" value="Online Assessment" sub="Step 3 of 6" icon={FaLaptopCode} color="#818CF8" />
                  <StatCard label="Overall Readiness" value="91%" sub="Est. prep: 5–6 weeks" icon={FaBolt} color="#34D399" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border p-8 space-y-6" style={{ backgroundColor: W.card, borderColor: W.border }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Readiness Progress</h3>
                    <ProgressBar label="Assessment Readiness" value={95} color="#818CF8" sub="Aptitude, Logic, Verbal, Coding" />
                    <ProgressBar label="Interview Readiness" value={84} color="#F472B6" sub="Technical & HR" />
                    <ProgressBar label="Overall Wipro Readiness" value={91} color={W.accent} sub="Combined across all rounds" />
                  </div>
                  <div className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: W.card, borderColor: W.border }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Hiring Timeline</h3>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5" style={{ backgroundColor: W.border }} />
                      {PIPELINE.map((s, i) => {
                        const done = i < pipelineStep, cur = i === pipelineStep;
                        return (
                          <div key={s.id} className="relative mb-5 last:mb-0">
                            <div className="absolute -left-4 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                              style={{ backgroundColor: done ? '#10B981' : cur ? W.accent : W.bg, borderColor: done ? '#10B981' : cur ? W.accent : W.border }}>
                              {done && <FaCheck className="text-[6px] text-white" />}
                              {cur && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </div>
                            <div className="ml-4">
                              <div className={`text-xs font-black ${done ? 'text-emerald-400' : cur ? 'text-white' : ''}`} style={!done && !cur ? { color: W.muted } : {}}>
                                {s.label}{cur && <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase" style={{ backgroundColor: `${W.accent}20`, color: W.accentLight }}>Current</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border p-8" style={{ backgroundColor: W.card2, borderColor: W.border }}>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${W.accent}20` }}>
                      <FaRobot className="text-xl" style={{ color: W.accent }} />
                    </div>
                    <div>
                      <h3 className="font-black text-white mb-2 flex items-center gap-2">
                        AI Readiness Recommendation
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Live</span>
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: W.muted }}>
                        You are performing strongly in Assessment and Coding. Wipro Turbo readiness is at <strong className="text-white">91%</strong>.
                        Focus on Java Collections internals and DBMS query optimization. Estimated completion: <strong className="text-white">1 week</strong> at 2 hrs/day.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {['Revise Java Collections', 'Practice SQL Window Functions', 'Mock HR with STAR', 'Solve 5 DP Problems'].map(t => (
                          <span key={t} className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ backgroundColor: `${W.accent}10`, borderColor: `${W.accent}30`, color: W.accentLight }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════ TRACKS & ROLES ════════════ */}
            {activeTab === 'tracks' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div>
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><FaTrophy style={{ color: W.accent }} /> Wipro Hiring Tracks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TRACKS.map((t, i) => (
                      <motion.div key={t.id} whileHover={{ y: -5 }} className="rounded-2xl border p-7 relative overflow-hidden cursor-pointer group"
                        style={{ backgroundColor: W.card, borderColor: W.border }}>
                        <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-30 transition-all" style={{ backgroundColor: W.accent }} />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-black text-white">{t.name}</h3>
                            <Pill color={i === 2 ? W.red : i === 1 ? W.amber : '#34D399'}>{t.diff}</Pill>
                          </div>
                          <div className="text-2xl font-black mb-5" style={{ color: W.accentLight }}>{t.pkg}</div>
                          <div className="space-y-2.5 text-xs">
                            {[['Eligibility', t.elig], ['Coding Level', t.coding, '#34D399'], ['Interview Diff.', t.iv], ['Prep Time', t.prep, '#60A5FA'], ['Career Growth', t.growth, '#34D399']].map(([k, v, col]) => (
                              <div key={k} className="flex justify-between py-1.5 border-b" style={{ borderColor: W.border }}>
                                <span style={{ color: W.muted }}>{k}</span>
                                <span className="font-black text-right max-w-[55%]" style={{ color: col || W.text }}>{v}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {t.skills.map(s => <span key={s} className="px-2 py-1 rounded-lg text-[10px] font-bold border" style={{ backgroundColor: `${W.accent}10`, borderColor: `${W.accent}30`, color: W.accentLight }}>{s}</span>)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><FaBriefcase style={{ color: W.accent }} /> Available Roles</h2>
                  <div className="flex flex-wrap gap-3">
                    {ROLES.map(r => (
                      <motion.div key={r} whileHover={{ scale: 1.05 }} className="px-5 py-3 rounded-xl border text-sm font-bold cursor-default"
                        style={{ backgroundColor: W.card, borderColor: W.border, color: W.muted }}>{r}</motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════ PIPELINE ════════════ */}
            {activeTab === 'pipeline' && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-10">
                <h2 className="text-2xl font-black text-white text-center mb-20">Wipro Recruitment Pipeline</h2>
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-8">
                  <div className="hidden md:block absolute top-7 left-12 right-12 h-px" style={{ backgroundColor: W.border }} />
                  {PIPELINE.map((s, i) => {
                    const done = i < pipelineStep, cur = i === pipelineStep;
                    return (
                      <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 cursor-pointer" onClick={() => setPipelineStep(i)}>
                        <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full flex items-center justify-center border-4 font-black text-xl transition-all"
                          style={{ backgroundColor: done ? '#10B98120' : cur ? `${W.accent}20` : W.bg, borderColor: done ? '#10B981' : cur ? W.accent : W.border, color: done ? '#10B981' : cur ? W.accent : W.muted, boxShadow: cur ? `0 0 24px ${W.accentGlow}` : 'none' }}>
                          {done ? <FaCheckCircle /> : cur ? <span>{i + 1}</span> : <FaLock />}
                        </motion.div>
                        <span className="text-xs font-black text-center" style={{ color: cur ? 'white' : W.muted }}>{s.label}</span>
                        {cur && <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase absolute -bottom-7 whitespace-nowrap" style={{ backgroundColor: `${W.accent}20`, color: W.accentLight, border: `1px solid ${W.accent}40` }}>Current</motion.span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ════════════ ONLINE ASSESSMENT ════════════ */}
            {activeTab === 'oa' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {oaDone && showAnalytics ? <SectionAnalytics /> : oaDone ? (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl" style={{ backgroundColor: '#10B98120', color: '#10B981', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}><FaCheck /></div>
                    <h2 className="text-3xl font-black text-white">Assessment Completed!</h2>
                    <div className="flex gap-4 justify-center">
                      <button onClick={() => setShowAnalytics(true)} className="px-8 py-3 rounded-xl font-black text-white text-sm" style={{ backgroundColor: W.accent }}>View Analytics</button>
                      <button onClick={() => { setActiveTab('tech'); setPipelineStep(3); }} className="px-8 py-3 rounded-xl font-black text-sm border" style={{ borderColor: W.border, color: W.text }}>Technical Interview</button>
                    </div>
                  </div>
                ) : (
                  <div ref={oaRef} className={`flex gap-6 ${proctored ? 'fixed inset-0 z-50 bg-[#07050F] p-6 overflow-auto h-screen w-screen' : 'h-[780px]'}`}>
                    {/* Sidebar */}
                    <div className="w-60 shrink-0 flex flex-col gap-3">
                      <div className="rounded-2xl border p-5 space-y-4 relative overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                        <div className="absolute -top-8 -right-8 w-24 h-24 blur-[30px] rounded-full" style={{ backgroundColor: timer < 600 ? '#EF444430' : `${W.accent}20` }} />
                        <div className="text-[10px] font-black uppercase tracking-widest flex justify-between relative z-10" style={{ color: W.muted }}>
                          <span>Time Left</span>
                          {proctored && <span className="text-red-400 flex items-center gap-1 animate-pulse"><FaShieldAlt /> PROCTORED</span>}
                        </div>
                        <div className="text-4xl font-black relative z-10" style={{ color: timer < 600 ? W.red : 'white', fontFamily: 'monospace' }}>{fmt(timer)}</div>
                        {violations > 0 && <div className="text-[10px] font-bold text-red-400 flex items-center gap-1 relative z-10"><FaExclamationTriangle /> {violations} violation{violations > 1 ? 's' : ''} flagged</div>}
                        <button onClick={proctored ? exitProctor : enterProctor} className="w-full py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-2 hover:bg-white/5 relative z-10" style={{ borderColor: W.border, color: W.muted }}>
                          {proctored ? <><FaCompress /> Exit Fullscreen</> : <><FaExpand /> Enter Fullscreen</>}
                        </button>
                        <button onClick={() => setShowPalette(!showPalette)} className="w-full py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-2 hover:bg-white/5 relative z-10" style={{ borderColor: W.border, color: W.muted }}>
                          <FaListUl /> {showPalette ? 'Hide' : 'Show'} Palette
                        </button>
                      </div>
                      {/* Section Nav */}
                      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        {OA_SECTIONS.map(s => (
                          <button key={s.id} onClick={() => { setOaSec(s.id); setOaQIdx(0); }}
                            className="w-full text-left p-4 rounded-xl border transition-all"
                            style={oaSec === s.id ? { backgroundColor: `${s.color}15`, borderColor: s.color } : { backgroundColor: W.card, borderColor: W.border }}>
                            <div className="flex items-center gap-2 mb-1">
                              <s.icon className="text-xs" style={{ color: s.color }} />
                              <span className="text-xs font-black" style={{ color: oaSec === s.id ? s.color : W.muted }}>{s.name}</span>
                            </div>
                            <div className="text-[10px]" style={{ color: W.muted }}>{s.questions} Qs · {s.mins} min</div>
                            <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full transition-all" style={{ backgroundColor: s.color, width: oaSec === s.id ? '40%' : '0%' }} />
                            </div>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setConfirmSubmit(true)} className="py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
                        style={{ backgroundColor: W.accent, boxShadow: `0 0 20px ${W.accentGlow}` }}>
                        <FaSave /> Submit Assessment
                      </button>
                    </div>

                    {/* Main area */}
                    <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      {oaSec === 'coding' ? (
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b flex justify-between items-center bg-black/30" style={{ borderColor: W.border }}>
                            <div>
                              <h3 className="font-black text-white flex items-center gap-2"><FaCode style={{ color: W.accent }} /> Coding Assessment</h3>
                              <p className="text-[10px] mt-1 font-bold text-emerald-400">● Auto-saving enabled</p>
                            </div>
                            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-black/60 border rounded-lg text-xs font-bold p-2 text-white outline-none" style={{ borderColor: W.border }}>
                              {['java', 'python', 'cpp', 'c', 'javascript'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-1 overflow-hidden">
                            <div className="w-1/3 p-6 border-r overflow-y-auto space-y-4" style={{ borderColor: W.border }}>
                              <h4 className="font-black text-white text-sm">Longest Palindromic Substring — Wipro Turbo</h4>
                              <div className="flex gap-2 flex-wrap">
                                <Pill color={W.amber}>Medium</Pill>
                                <Pill color="#818CF8">Strings / DP</Pill>
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: W.muted }}>Given a string s, return the longest palindromic substring in s. A palindrome reads the same forward and backward.</p>
                              <div className="rounded-xl p-4 font-mono text-xs space-y-2" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: `1px solid ${W.border}` }}>
                                <div style={{ color: W.muted }}>Input:</div>
                                <div className="text-emerald-400">s = "babad"</div>
                                <div className="mt-2" style={{ color: W.muted }}>Output:</div>
                                <div className="text-emerald-400">"bab"</div>
                              </div>
                              <div className="rounded-xl p-4 font-mono text-xs space-y-2" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: `1px solid ${W.border}` }}>
                                <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: W.muted }}>Custom Input</div>
                                <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Enter custom input…" rows={3} className="w-full bg-transparent text-white text-xs outline-none resize-none placeholder-gray-600" />
                              </div>
                              {codeResult && (
                                <div className="rounded-xl p-4 space-y-2 text-xs" style={{ backgroundColor: '#10B98110', border: '1px solid #10B98130' }}>
                                  <div className="font-black text-emerald-400">{codeResult.verdict}</div>
                                  <div style={{ color: W.muted }}>Tests: {codeResult.passed}/{codeResult.total}</div>
                                  <div style={{ color: W.muted }}>Runtime: {codeResult.runtime} · Memory: {codeResult.memory}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Editor language={lang} theme="vs-dark" value={code} onChange={c => setCode(c || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, cursorBlinking: 'smooth', smoothScrolling: true }} />
                            </div>
                          </div>
                          <div className="p-4 border-t flex justify-between items-center bg-black/30" style={{ borderColor: W.border }}>
                            <div className="text-xs font-bold flex items-center gap-2">
                              {codeResult
                                ? <><FaCheckCircle className="text-emerald-400" /> <span className="text-emerald-400">All tests passed</span></>
                                : <><FaEye style={{ color: W.muted }} /> <span style={{ color: W.muted }}>4 Hidden Test Cases</span></>}
                            </div>
                            <button onClick={runCode} disabled={compiling} className="px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition-all" style={{ borderColor: W.border, color: W.text }}>
                              <FaPlay /> {compiling ? 'Running…' : 'Run & Test'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: W.border }}>
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: W.muted }}>{curSec?.name}</div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold" style={{ color: W.muted }}>Q {oaQIdx + 1} / {curQs.length}</span>
                              {reviewed.has(`${oaSec}-${oaQIdx}`) && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase"><FaFlag className="inline mr-1" />Review</span>}
                            </div>
                          </div>
                          <AnimatePresence>
                            {showPalette && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b overflow-hidden" style={{ borderColor: W.border }}>
                                <div className="p-4 flex flex-wrap gap-2">
                                  {curQs.map((_, qi) => {
                                    const key = `${oaSec}-${qi}`;
                                    const answered = oaAnswers[key] !== undefined, rev = reviewed.has(key);
                                    return (
                                      <button key={qi} onClick={() => setOaQIdx(qi)} className="w-9 h-9 rounded-lg text-xs font-black border transition-all"
                                        style={{ backgroundColor: answered ? '#10B98120' : rev ? '#F59E0B20' : W.bg, borderColor: qi === oaQIdx ? W.accent : answered ? '#10B981' : rev ? '#F59E0B' : W.border, color: answered ? '#10B981' : rev ? '#F59E0B' : W.muted }}>
                                        {qi + 1}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex-1 p-8 flex flex-col justify-between">
                            {curQ ? (
                              <>
                                <div>
                                  <p className="text-lg text-white leading-relaxed mb-8 font-medium">{curQ.q}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {curQ.opts.map((opt, oi) => {
                                      const key = `${oaSec}-${oaQIdx}`, sel = oaAnswers[key] === oi;
                                      return (
                                        <motion.button key={oi} whileHover={{ scale: 1.01 }} onClick={() => setOaAnswers(p => ({ ...p, [key]: oi }))}
                                          className="p-5 rounded-xl border text-left font-semibold text-sm transition-all"
                                          style={{ backgroundColor: sel ? `${W.accent}20` : W.card2, borderColor: sel ? W.accent : W.border, color: sel ? W.accentLight : W.text, boxShadow: sel ? `0 0 15px ${W.accentGlow}` : 'none' }}>
                                          <span className="font-black mr-3" style={{ color: W.muted }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: W.border }}>
                                  <button onClick={() => { const key = `${oaSec}-${oaQIdx}`; setReviewed(p => { const n = new Set(p); n.has(key) ? n.delete(key) : n.add(key); return n; }); }}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black border flex items-center gap-2 hover:bg-white/5 transition-all"
                                    style={{ borderColor: W.border, color: reviewed.has(`${oaSec}-${oaQIdx}`) ? W.amber : W.muted }}>
                                    <FaFlag /> {reviewed.has(`${oaSec}-${oaQIdx}`) ? 'Marked' : 'Review Later'}
                                  </button>
                                  <div className="flex gap-3">
                                    {oaQIdx > 0 && <button onClick={() => setOaQIdx(q => q - 1)} className="px-6 py-2.5 rounded-xl text-xs font-black border hover:bg-white/5 transition-all" style={{ borderColor: W.border, color: W.muted }}>← Prev</button>}
                                    {oaQIdx < curQs.length - 1
                                      ? <button onClick={() => setOaQIdx(q => q + 1)} className="px-8 py-2.5 rounded-xl text-xs font-black text-white" style={{ backgroundColor: W.accent }}>Save & Next →</button>
                                      : <button onClick={() => setConfirmSubmit(true)} className="px-8 py-2.5 rounded-xl text-xs font-black text-white" style={{ backgroundColor: W.accent }}>Finish Section</button>
                                    }
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <FaCheckCircle className="text-5xl text-emerald-400" />
                                <p className="text-lg font-black text-white">Section Complete</p>
                                <p className="text-sm" style={{ color: W.muted }}>Navigate to another section or submit your assessment.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {confirmSubmit && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-2xl border p-10 max-w-md w-full mx-4 space-y-6 text-center" style={{ backgroundColor: W.card, borderColor: W.border }}>
                            <FaExclamationTriangle className="text-4xl text-amber-400 mx-auto" />
                            <h3 className="text-2xl font-black text-white">Submit Assessment?</h3>
                            <p className="text-sm" style={{ color: W.muted }}>Once submitted, you cannot revisit any questions. Review all flagged questions before proceeding.</p>
                            <div className="flex gap-4">
                              <button onClick={() => setConfirmSubmit(false)} className="flex-1 py-3 rounded-xl font-black text-sm border hover:bg-white/5 transition-all" style={{ borderColor: W.border, color: W.muted }}>Cancel</button>
                              <button onClick={doSubmitOA} className="flex-1 py-3 rounded-xl font-black text-sm text-white" style={{ backgroundColor: W.accent }}>Confirm Submit</button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════ QUESTION BANK ════════════ */}
            {activeTab === 'qbank' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  {QBANK_CATS.map(c => (
                    <button key={c} onClick={() => setQbankCat(c)} className="px-4 py-2 rounded-full text-xs font-black border transition-all"
                      style={qbankCat === c ? { backgroundColor: `${W.accent}20`, borderColor: W.accent, color: W.accentLight } : { backgroundColor: 'transparent', borderColor: W.border, color: W.muted }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(COMPANY_CODING_PYQS['Wipro'] || COMPANY_CODING_PYQS['Wipro']).map((q, i) => (
                    <motion.div key={i} whileHover={{ y: -3 }} className="rounded-2xl border p-6 space-y-4 group cursor-pointer relative overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <div className="absolute top-0 right-0 w-20 h-20 blur-[40px] rounded-full opacity-0 group-hover:opacity-30 transition-all" style={{ backgroundColor: W.accent }} />
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-2 flex-wrap">
                          <Pill color={q.diff === 'Easy' ? '#34D399' : q.diff === 'Medium' ? W.amber : W.red}>{q.diff}</Pill>
                          <Pill color={W.accentLight}>{qbankCat}</Pill>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: W.muted }}>freq: {q.freq}</div>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-white group-hover:text-purple-400 transition-colors">{q.title}</h4>
                        <p className="text-xs mt-2 leading-relaxed" style={{ color: W.muted }}>{q.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ════════════ TECH / HR INTERVIEW ════════════ */}
            {(activeTab === 'tech' || activeTab === 'hr') && (() => {
              const isTech = activeTab === 'tech';
              const step = isTech ? techStep : hrStep;
              const flow = isTech ? TECH_FLOW : HR_FLOW;
              return (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col xl:flex-row gap-6" style={{ minHeight: '680px' }}>
                  <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                    <div className="p-5 border-b flex items-center justify-between bg-black/30" style={{ borderColor: W.border }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${W.accent}20`, borderColor: `${W.accent}40`, boxShadow: `0 0 15px ${W.accentGlow}` }}>
                          <FaRobot className="text-xl" style={{ color: W.accent }} />
                        </div>
                        <div>
                          <div className="font-black text-sm text-white">Wipro AI {isTech ? 'Technical' : 'HR'} Panelist</div>
                          <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {step !== -1 ? 'LIVE INTERVIEW' : 'READY'}
                          </div>
                        </div>
                      </div>
                      {step !== -1 && (
                        <div className="hidden md:flex gap-1">
                          {flow.map((f, i) => (
                            <div key={f.step} className="h-2 rounded-sm transition-all" style={{ width: `${Math.max(16, 60 / flow.length)}px`, backgroundColor: i <= step ? W.accent : 'rgba(255,255,255,0.08)' }} title={f.step} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                      {step === -1 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                          <div className="w-24 h-24 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${W.accent}10`, borderColor: `${W.accent}30`, boxShadow: `0 0 40px ${W.accentGlow}` }}>
                            {isTech ? <FaLaptopCode className="text-4xl" style={{ color: W.accent }} /> : <FaUsers className="text-4xl" style={{ color: W.accent }} />}
                          </div>
                          <h3 className="text-3xl font-black text-white">{isTech ? 'Technical Panel Round' : 'HR Discussion Round'}</h3>
                          <p className="text-sm max-w-md leading-relaxed" style={{ color: W.muted }}>
                            {isTech ? 'A 10-step AI technical interview covering your project, Java, DBMS, OS, CN, live coding, and system concepts — calibrated for Wipro Turbo.' : 'A structured 10-topic HR conversation evaluating communication, Wipro cultural alignment, and career goals using the STAR framework.'}
                          </p>
                          <button onClick={isTech ? startTech : startHR} className="px-10 py-4 rounded-xl font-black text-white text-sm flex items-center gap-2" style={{ backgroundColor: W.accent, boxShadow: `0 0 25px ${W.accentGlow}` }}>
                            <FaPlay /> START INTERVIEW
                          </button>
                        </div>
                      ) : msgs.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 text-sm leading-relaxed rounded-2xl ${m.from === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                            style={m.from === 'user' ? { backgroundColor: W.accent, color: 'white' } : { backgroundColor: W.card2, border: `1px solid ${W.border}`, color: W.text }}>
                            {m.step && m.from === 'ai' && <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: W.muted }}>{m.step}</div>}
                            {m.text}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={chatRef} />
                    </div>
                    <div className="p-5 border-t bg-black/40" style={{ borderColor: W.border }}>
                      <div className="flex gap-3">
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMsg())}
                          disabled={step === -1} placeholder={step !== -1 ? 'Type your response… (Enter to send)' : 'Start the interview first'}
                          className="flex-1 bg-black/60 border rounded-xl px-5 py-4 text-sm text-white outline-none transition-all"
                          style={{ borderColor: W.border }} />
                        <button onClick={sendMsg} disabled={step === -1 || !input.trim()} className="w-12 h-12 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all" style={{ backgroundColor: W.accent }}>
                          <FaPaperPlane className="text-sm text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Right panel */}
                  <div className="w-full xl:w-80 shrink-0 space-y-5">
                    <LiveScorecard />
                    <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: W.muted }}>Interview Flow</h4>
                      {flow.slice(0, 6).map((f, i) => (
                        <div key={f.step} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: i <= step ? W.accent : W.border }} />
                          <span className="text-xs font-semibold" style={{ color: i === step ? 'white' : i < step ? '#34D399' : W.muted }}>{f.step}</span>
                          {i === step && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse ml-auto shrink-0" />}
                        </div>
                      ))}
                    </div>
                    {isTech && (
                      <div className="rounded-2xl border p-5" style={{ backgroundColor: W.card, borderColor: W.border }}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: W.muted }}>Live Whiteboard</h4>
                        <div style={{ height: 180 }}>
                          <Editor language="java" theme="vs-dark" defaultValue="// Draft code / pseudocode here" options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 8 }, lineNumbers: 'off' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* ════════════ HIRING COMMITTEE ════════════ */}
            {activeTab === 'panel' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-white mb-3">Final Hiring Committee Verdict</h2>
                  <p className="text-sm" style={{ color: W.muted }}>Aggregated review across all Wipro Turbo recruitment rounds.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {COMMITTEE.map(p => (
                    <motion.div key={p.role} whileHover={{ y: -4 }} className="rounded-2xl border p-8 text-center space-y-4 relative overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10" style={{ backgroundColor: p.color }} />
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border relative z-10" style={{ backgroundColor: `${p.color}15`, borderColor: `${p.color}30` }}>
                        <p.icon className="text-2xl" style={{ color: p.color }} />
                      </div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: W.muted }}>{p.role}</div>
                        <div className="text-2xl font-black mb-1" style={{ color: p.verdict === 'Strong Hire' ? '#34D399' : '#60A5FA' }}>{p.verdict}</div>
                        <div className="text-4xl font-black text-white">{p.rating}<span className="text-lg text-slate-500">/100</span></div>
                      </div>
                      <p className="text-xs leading-relaxed relative z-10 text-left" style={{ color: W.muted }}>"{p.comment}"</p>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-3xl border p-12 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${W.card} 0%, ${W.accentDark}20 100%)`, borderColor: `${W.accent}50`, boxShadow: `0 20px 60px ${W.accentGlow}` }}>
                  <div className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full" style={{ backgroundColor: `${W.accent}15` }} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: '#10B98120', border: '2px solid #10B981', color: '#10B981', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
                      <FaCheck />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-white mb-2">Overall: Strong Hire</h3>
                      <p className="text-sm" style={{ color: W.muted }}>Unanimous recommendation — Wipro Turbo Track</p>
                    </div>
                    <div className="w-full rounded-2xl border p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-left" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${W.accent}20` }}>
                      {[['Company', 'Wipro Technologies'], ['Role / Track', 'Turbo'], ['Compensation', '9.5 LPA', '#34D399'], ['Joining Batch', 'August 2026']].map(([l, v, col]) => (
                        <div key={l}>
                          <div className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: W.muted }}>{l}</div>
                          <div className="text-base font-black" style={{ color: col || 'white' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button onClick={() => setFinalResult('selected')} className="px-10 py-4 rounded-xl font-black text-sm text-white flex items-center gap-2" style={{ backgroundColor: '#10B981', boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}>
                        <FaCheck /> Accept Offer
                      </button>
                      <button onClick={() => setFinalResult('not-selected')} className="px-10 py-4 rounded-xl font-black text-sm border flex items-center gap-2" style={{ borderColor: W.border, color: W.muted }}>
                        <FaTimes /> Decline
                      </button>
                      <button onClick={() => setActiveTab('report')} className="px-10 py-4 rounded-xl font-black text-sm border flex items-center gap-2" style={{ borderColor: W.border, color: W.text }}>
                        <FaFilePdf /> View Report
                      </button>
                    </div>
                  </div>
                </div>
                {finalResult === 'selected' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border p-10 text-center space-y-6" style={{ backgroundColor: '#10B98110', borderColor: '#10B98130' }}>
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-3xl font-black text-emerald-400">Congratulations! You're Selected!</h3>
                    <p className="text-sm" style={{ color: W.muted }}>Your Wipro Turbo offer has been accepted. Joining documentation will arrive within 48 hours.</p>
                    <div className="flex flex-wrap gap-3 justify-center text-xs font-bold">
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📍 Bangalore / Pune / Hyderabad</span>
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📅 August 2026</span>
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💰 9.5 LPA</span>
                    </div>
                  </motion.div>
                )}
                {finalResult === 'not-selected' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border p-10 space-y-6" style={{ backgroundColor: '#EF444410', borderColor: '#EF444430' }}>
                    <h3 className="text-2xl font-black text-red-400">Result: Not Selected This Round</h3>
                    <p className="text-sm" style={{ color: W.muted }}>Don't be discouraged — most successful Wipro Turbo candidates needed 2+ attempts. Here's your plan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[['Weak Areas', ['Java JVM Internals', 'DBMS Normalization (3NF)', 'OS Scheduling Algorithms'], 'text-red-400'], ['Recommended Practice', ['Solve 10 Strings problems/week', 'Mock HR with STAR format', 'Build one REST API project'], 'text-amber-400'], ['Retry Estimate', ['2–3 weeks focused prep', 'Target 90%+ overall readiness', 'Next cycle in ~3 months'], 'text-blue-400']].map(([title, items, col]) => (
                        <div key={title} className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: W.card, borderColor: W.border }}>
                          <h4 className={`text-xs font-black uppercase tracking-widest ${col}`}>{title}</h4>
                          {items.map(it => <div key={it} className="flex gap-2 text-xs" style={{ color: W.muted }}><span className="mt-0.5">→</span>{it}</div>)}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setPipelineStep(2); setOaDone(false); setTimer(90 * 60); setMsgs([]); setTechStep(-1); setHrStep(-1); setFinalResult(null); setActiveTab('oa'); }}
                      className="px-8 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2" style={{ backgroundColor: W.accent }}>
                      <FaRedo /> Retry Simulation
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ════════════ FINAL REPORT ════════════ */}
            {activeTab === 'report' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-end flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-white">Final Performance Report</h2>
                    <p className="text-sm mt-1" style={{ color: W.muted }}>Wipro Turbo — Simulation Cycle 2026</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={dlPDF} className="px-6 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: W.accent, boxShadow: `0 0 20px ${W.accentGlow}` }}>
                      <FaFilePdf /> Download PDF
                    </button>
                    <button onClick={() => toast.success('Report link copied!')} className="px-6 py-3 rounded-xl font-black text-sm border flex items-center gap-2 hover:bg-white/5 transition-all" style={{ borderColor: W.border, color: W.text }}>
                      <FaShare /> Share
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[['Assessment', '95%', '#818CF8'], ['Coding', '97%', '#34D399'], ['Technical', '93%', '#60A5FA'], ['HR Score', '96%', '#F472B6'], ['Problem Solving', '94%', W.amber], ['Professionalism', '97%', '#A78BFA'], ['Communication', '95%', '#FB923C'], ['Overall', '95%', W.accent]].map(([l, v, c]) => (
                    <div key={l} className="rounded-2xl border p-4 flex flex-col items-center justify-center text-center space-y-1" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <div className="text-2xl font-black" style={{ color: c }}>{v}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: W.muted }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 rounded-2xl border p-8 space-y-8" style={{ backgroundColor: W.card, borderColor: W.border }}>
                    <h3 className="font-black text-white text-lg">Section-wise Analysis</h3>
                    {OA_SECTIONS.map(s => (
                      <div key={s.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><s.icon className="text-xs" style={{ color: s.color }} /><span className="text-sm font-bold text-white">{s.name}</span></div>
                          <Pill color={s.color}>{s.id === 'coding' ? `${s.analytics.passed}/${s.analytics.total} passed` : `${s.analytics.accuracy}%`}</Pill>
                        </div>
                        <ProgressBar label="" value={s.id === 'coding' ? 100 : s.analytics.accuracy} color={s.color} />
                      </div>
                    ))}
                    <div className="pt-4 border-t space-y-3" style={{ borderColor: W.border }}>
                      <h4 className="font-black text-emerald-400 text-xs uppercase tracking-widest flex items-center gap-2"><FaThumbsUp /> Strengths</h4>
                      {['Exceptional analytical reasoning — 95% accuracy across all aptitude sections.', 'Optimal O(N) palindrome solution with 100% hidden test case pass rate.', 'Highly structured STAR responses with clear professional communication in HR round.'].map(s => (
                        <div key={s} className="flex items-start gap-3 text-sm" style={{ color: W.muted }}><span className="text-emerald-400 font-black mt-0.5">✓</span>{s}</div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-black text-amber-400 text-xs uppercase tracking-widest flex items-center gap-2 mb-3"><FaThumbsDown /> Weak Areas</h4>
                      {['Java JVM internals (GC algorithms) — needs deeper study.', 'DBMS normalization beyond 3NF — missing in project design explanation.'].map(s => (
                        <div key={s} className="flex items-start gap-3 text-sm" style={{ color: W.muted }}><span className="text-amber-400 font-black mt-0.5">!</span>{s}</div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="rounded-2xl border p-8 text-center space-y-4 relative overflow-hidden" style={{ backgroundColor: W.card, borderColor: `${W.accent}40`, boxShadow: `0 0 30px ${W.accentGlow}` }}>
                      <div className="relative z-10">
                        <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: W.muted }}>Hire Probability</div>
                        <div className="text-6xl font-black" style={{ color: '#34D399' }}>95%</div>
                        <div className="text-sm font-black text-white mt-2">Very High</div>
                        <div className="text-xs mt-1" style={{ color: W.muted }}>Wipro Turbo Track</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><FaGraduationCap style={{ color: W.accent }} /> Learning Roadmap</h4>
                      {[['Week 1', 'Java JVM & Collections Deep Dive', '#818CF8'], ['Week 2', 'DBMS Advanced & SQL Optimization', '#60A5FA'], ['Week 3', 'System Design & OS Fundamentals', '#34D399'], ['Week 4', 'Mock Interviews — Tech & HR', W.amber]].map(([d, t, c]) => (
                        <div key={d} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: W.card2, borderColor: W.border }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c }} />
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: W.muted }}>{d}</div>
                            <div className="text-xs font-bold text-white mt-0.5">{t}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><FaLightbulb style={{ color: W.amber }} /> Interview Tips</h4>
                      {['Lead every answer with a concrete metric (e.g. "reduced latency by 35%")', 'Use STAR consistently in all behavioral questions', 'Ask 2–3 thoughtful questions about the project or team at the end'].map(tip => (
                        <div key={tip} className="flex items-start gap-2 text-xs" style={{ color: W.muted }}>
                          <span className="text-amber-400 mt-0.5 font-bold">→</span>{tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════ BADGES ════════════ */}
            {activeTab === 'badges' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">Badges & Achievements</h2>
                  <p className="text-sm" style={{ color: W.muted }}>{BADGES.filter(b => b.earned).length} of {BADGES.length} badges earned</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {BADGES.map(b => (
                    <motion.div key={b.id} whileHover={{ y: -4 }} className="rounded-2xl border p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
                      style={{ backgroundColor: W.card, borderColor: b.earned ? `${b.color}40` : W.border, opacity: b.earned ? 1 : 0.5 }}>
                      <div className="absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full opacity-20" style={{ backgroundColor: b.color }} />
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 relative z-10" style={{ backgroundColor: `${b.color}15`, borderColor: b.earned ? b.color : W.border }}>
                        <b.icon className="text-2xl" style={{ color: b.earned ? b.color : W.muted }} />
                        {b.earned && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><FaCheck className="text-[8px] text-white" /></div>}
                      </div>
                      <div className="relative z-10">
                        <div className="font-black text-sm" style={{ color: b.earned ? 'white' : W.muted }}>{b.name}</div>
                        <div className="text-[10px] mt-1 leading-relaxed" style={{ color: W.muted }}>{b.desc}</div>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ backgroundColor: b.color, width: b.earned ? '100%' : '30%' }} />
                      </div>
                      <Pill color={b.earned ? '#34D399' : W.muted}>{b.earned ? 'Earned' : 'Locked'}</Pill>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ════════════ HISTORY ════════════ */}
            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <h2 className="text-2xl font-black text-white">Performance History</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <StatCard label="Total Attempts" value="3" icon={FaHistory} color={W.accent} />
                  <StatCard label="Highest Score" value="95%" icon={FaStar} color="#34D399" />
                  <StatCard label="Average Score" value="84%" icon={FaChartLine} color={W.amber} />
                  <StatCard label="Coding Growth" value="+22%" icon={FaBolt} color="#818CF8" />
                </div>
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: W.card, borderColor: W.border }}>
                  <div className="p-6 border-b" style={{ borderColor: W.border }}><h3 className="font-black text-white">Attempt History</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-[10px] font-black uppercase tracking-widest" style={{ borderColor: W.border, color: W.muted }}>
                          {['Date', 'Track', 'OA', 'Coding', 'Technical', 'HR', 'Overall', 'Hire %', 'Result'].map(h => <th key={h} className="px-5 py-4 text-left">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORY.map((r, i) => (
                          <tr key={i} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: W.border }}>
                            <td className="px-5 py-4 text-white font-bold">{r.date}</td>
                            <td className="px-5 py-4" style={{ color: W.muted }}>{r.track}</td>
                            <td className="px-5 py-4 font-bold text-indigo-400">{r.oa}</td>
                            <td className="px-5 py-4 font-bold text-emerald-400">{r.coding}</td>
                            <td className="px-5 py-4 font-bold text-blue-400">{r.tech}</td>
                            <td className="px-5 py-4 font-bold text-pink-400">{r.hr}</td>
                            <td className="px-5 py-4 font-black text-white">{r.overall}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                  <div className="h-full rounded-full" style={{ backgroundColor: r.hire > 80 ? '#34D399' : r.hire > 50 ? W.amber : W.red, width: `${r.hire}%` }} />
                                </div>
                                <span className="text-xs font-bold" style={{ color: r.hire > 80 ? '#34D399' : r.hire > 50 ? W.amber : W.red }}>{r.hire}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black border"
                                style={r.status === 'Selected' ? { backgroundColor: '#10B98115', color: '#34D399', borderColor: '#10B98130' } : r.status === 'Borderline' ? { backgroundColor: '#F59E0B15', color: W.amber, borderColor: '#F59E0B30' } : { backgroundColor: '#EF444415', color: '#EF4444', borderColor: '#EF444430' }}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[['Coding Improvement', HISTORY.map(h => ({ d: h.date, v: h.coding })), '#34D399'], ['Technical Improvement', HISTORY.map(h => ({ d: h.date, v: h.tech })), W.accent]].map(([title, data, color]) => (
                    <div key={title} className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: W.card, borderColor: W.border }}>
                      <h3 className="font-black text-white">{title}</h3>
                      {data.map((r, i) => (
                        <div key={r.d} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span style={{ color: W.muted }}>Attempt {i + 1} — {r.d}</span>
                            <span style={{ color }}>{r.v}</span>
                          </div>
                          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: r.v }} transition={{ duration: 1, delay: i * 0.2 }} className="h-full rounded-full" style={{ backgroundColor: color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default WiproPrepDetail;
