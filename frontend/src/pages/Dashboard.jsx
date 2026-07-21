import React, { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { motion, useMotionValue, useSpring, AnimatePresence, animate } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import gsap from 'gsap';
import {
  Target, Star, Flame, Trophy, ArrowRight, Brain, Sparkles,
  TrendingUp, CheckCircle2, Clock, Zap, Code2, Building2,
  FileText, BarChart3, Map, ChevronRight, Play, Users2, Award,
  AlertCircle, Mic, BookOpen, Activity, Download, Eye, RotateCcw,
  Video, Layers, Cpu, Globe, MessageSquare, Lightbulb, Rocket,
  Bot, Heart, Shield, PieChart, Hash, Timer, CheckSquare, Coins,
  ChevronUp, ExternalLink, Plus
} from 'lucide-react';

// ── Motion Variants ──────────────────────────────────────────────────────────
const fadeUp   = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } } };
const fadeIn   = { hidden: { opacity: 0 },         show: { opacity: 1, transition: { duration: 0.4 } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

// ── Animated Counter ─────────────────────────────────────────────────────────
function Counter({ from = 0, to, duration = 1.6, suffix = '', prefix = '', decimals = 0 }) {
  const [val, setVal] = useState(from);
  useEffect(() => {
    const ctrl = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setVal(decimals ? v.toFixed(decimals) : Math.floor(v)),
    });
    return ctrl.stop;
  }, [to]);
  return <>{prefix}{val}{suffix}</>;
}

// ── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ value, size = 80, stroke = 6, gradient, label, sublabel }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const id = `grad-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={gradient?.[0] || '#6366f1'} />
            <stop offset="100%" stopColor={gradient?.[1] || '#a855f7'} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-bold text-white leading-none">{value}%</span>
        {label && <span className="text-[9px] text-zinc-500 mt-0.5 leading-none">{label}</span>}
      </div>
    </div>
  );
}

// ── Floating Background ──────────────────────────────────────────────────────
const Star_ = ({ x, y, size, delay }) => (
  <motion.div
    className="absolute rounded-full bg-white pointer-events-none"
    style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, opacity: 0 }}
    animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.2, 0.8] }}
    transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

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

// ── Magnetic GSAP Button ─────────────────────────────────────────────────────
function MagneticBtn({ children, className, onClick }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(ref.current, { x: x * 0.22, y: y * 0.22, duration: 0.3, ease: 'power2.out' });
  };
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
  return (
    <motion.button
      ref={ref} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ── Skill Heatmap ────────────────────────────────────────────────────────────
const HEATMAP_DATA = [
  { skill: 'Arrays',    mon: 3, tue: 2, wed: 4, thu: 1, fri: 5, sat: 2, sun: 3 },
  { skill: 'Trees',     mon: 1, tue: 4, wed: 2, thu: 3, fri: 2, sat: 4, sun: 1 },
  { skill: 'DP',        mon: 2, tue: 1, wed: 3, thu: 5, fri: 1, sat: 3, sun: 4 },
  { skill: 'Graphs',    mon: 4, tue: 3, wed: 1, thu: 2, fri: 4, sat: 1, sun: 2 },
  { skill: 'SQL',       mon: 5, tue: 2, wed: 3, thu: 1, fri: 3, sat: 5, sun: 1 },
  { skill: 'System',    mon: 1, tue: 5, wed: 2, thu: 4, fri: 2, sat: 1, sun: 5 },
];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HEAT_COLORS = ['rgba(99,102,241,0.08)','rgba(99,102,241,0.2)','rgba(99,102,241,0.4)','rgba(99,102,241,0.65)','rgba(99,102,241,0.9)','rgba(168,85,247,1)'];

function SkillHeatmap() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1 pl-14">
        {DAYS.map(d => <div key={d} className="flex-1 text-center text-[9px] text-zinc-600 font-medium">{d}</div>)}
      </div>
      {HEATMAP_DATA.map(row => (
        <div key={row.skill} className="flex items-center gap-1">
          <div className="w-14 text-[10px] text-zinc-500 text-right pr-2 font-medium">{row.skill}</div>
          {DAYS.map(d => {
            const v = row[d.toLowerCase()];
            return (
              <motion.div
                key={d}
                className="flex-1 rounded-md cursor-pointer"
                style={{ background: HEAT_COLORS[v-1], height: 22 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                title={`${row.skill} ${d}: ${v}/5`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ── Constants ────────────────────────────────────────────────────────────────
const COMPANIES = [
  { name: 'Google',    color: '#4285F4', readiness: 72, weak: ['System Design','ML'], emoji: '🔍' },
  { name: 'Amazon',    color: '#FF9900', readiness: 65, weak: ['Leadership','Algo'],  emoji: '📦' },
  { name: 'Microsoft', color: '#00A4EF', readiness: 81, weak: ['Azure','OS'],         emoji: '🪟' },
  { name: 'Meta',      color: '#0082FB', readiness: 58, weak: ['Distributed','React'],emoji: '👤' },
  { name: 'Apple',     color: '#999',    readiness: 70, weak: ['Swift','HW Design'],  emoji: '🍎' },
  { name: 'Netflix',   color: '#E50914', readiness: 63, weak: ['Kafka','Micro'],      emoji: '🎬' },
  { name: 'Uber',      color: '#000000', readiness: 75, weak: ['Maps API','Real-time'],emoji: '🚗' },
  { name: 'Adobe',     color: '#FF0000', readiness: 68, weak: ['Creative','Cloud'],   emoji: '🎨' },
];

const ACHIEVEMENTS = [
  { icon: '🔥', label: '14-Day Streak',   desc: 'Practice daily',    xp: 140,  rarity: 'Rare',   color: 'from-orange-500 to-red-500' },
  { icon: '⚡', label: 'Speed Coder',      desc: 'Solve in <5 min',   xp: 80,   rarity: 'Common', color: 'from-yellow-500 to-amber-500' },
  { icon: '🏆', label: 'Top Performer',   desc: 'Score 90%+',        xp: 250,  rarity: 'Epic',   color: 'from-purple-500 to-indigo-500' },
  { icon: '🎯', label: 'Interview Pro',   desc: '50 interviews done', xp: 500,  rarity: 'Legend', color: 'from-pink-500 to-rose-500' },
  { icon: '🤖', label: 'AI Whisperer',    desc: 'Use AI Mentor 20x', xp: 120,  rarity: 'Rare',   color: 'from-cyan-500 to-blue-500' },
  { icon: '📚', label: 'Book Worm',       desc: 'Read 10 articles',  xp: 60,   rarity: 'Common', color: 'from-emerald-500 to-teal-500' },
];

const AI_RECS = [
  { priority: 'HIGH', icon: AlertCircle, color: 'text-red-400',    bg: 'bg-red-500/10  border-red-500/15',    title: 'System Design Practice',  desc: 'Your system design score is 42%. Practice scalability patterns today.', tag: 'Weak Area', eta: '45 min' },
  { priority: 'MED',  icon: Code2,       color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/15', title: 'Dynamic Programming',     desc: 'Solve 3 DP problems to reinforce yesterday\'s concepts.',               tag: 'Coding',   eta: '30 min' },
  { priority: 'LOW',  icon: Mic,         color: 'text-blue-400',   bg: 'bg-blue-500/10  border-blue-500/15',  title: 'Mock Behavioral Round',   desc: 'Schedule a STAR-format interview to practice soft skills.',             tag: 'Interview',eta: '20 min' },
  { priority: 'LOW',  icon: BookOpen,    color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/15',title: 'Watch: OS Concepts',     desc: 'Watch "Process Management" video to close a knowledge gap.',           tag: 'Video',    eta: '15 min' },
];

const DAILY_MISSIONS = [
  { done: true,  label: 'Complete 1 coding problem',   xp: 30 },
  { done: true,  label: 'Review AI feedback report',    xp: 20 },
  { done: false, label: 'Do a mock behavioral round',   xp: 50 },
  { done: false, label: 'Watch 1 System Design video',  xp: 25 },
];

const TIMELINE = [
  { icon: Mic,         color: 'bg-indigo-500', label: 'Mock Interview',       sub: 'Frontend Engineer · Score 82%',     time: '2h ago' },
  { icon: Trophy,      color: 'bg-yellow-500', label: 'Achievement Unlocked', sub: '"Speed Coder" badge earned',         time: '5h ago' },
  { icon: Code2,       color: 'bg-emerald-500',label: 'Coding Session',       sub: 'Solved 3 LeetCode problems',        time: 'Yesterday' },
  { icon: FileText,    color: 'bg-blue-500',   label: 'Resume Uploaded',      sub: 'New version analyzed by AI',        time: '2 days ago' },
  { icon: BarChart3,   color: 'bg-purple-500', label: 'Weekly Report',        sub: 'Performance improved by 12%',       time: '3 days ago' },
  { icon: Users2,      color: 'bg-pink-500',   label: 'Community Post',       sub: 'Got 18 upvotes on your DSA tip',    time: '4 days ago' },
];

const RADAR_DATA = [
  { skill: 'Communication', value: 82 },
  { skill: 'DSA',            value: 74 },
  { skill: 'System Design',  value: 42 },
  { skill: 'Behavioral',     value: 88 },
  { skill: 'Problem Solving',value: 78 },
  { skill: 'Confidence',     value: 65 },
];

const QUICK_ACTIONS = [
  { icon: Mic,         label: 'AI Interview',     desc: 'Full mock session',    to: '/interview/setup', gradient: 'from-indigo-500 to-purple-600',  shadow: 'shadow-indigo-500/30' },
  { icon: FileText,    label: 'Resume AI',        desc: 'Score & improve',      to: '/resume',          gradient: 'from-blue-500 to-cyan-600',       shadow: 'shadow-blue-500/30' },
  { icon: Code2,       label: 'Coding Round',     desc: 'DSA challenges',       to: '/coding',          gradient: 'from-emerald-500 to-teal-600',    shadow: 'shadow-emerald-500/30' },
  { icon: Map,         label: 'Roadmap',          desc: 'Guided learning',      to: '/roadmap',         gradient: 'from-violet-500 to-purple-600',   shadow: 'shadow-violet-500/30' },
  { icon: Building2,   label: 'Company Sim',      desc: 'FAANG simulation',     to: '/companies',       gradient: 'from-orange-500 to-amber-600',    shadow: 'shadow-orange-500/30' },
  { icon: Bot,         label: 'AI Mentor',        desc: 'Ask anything',         to: '/dashboard',       gradient: 'from-pink-500 to-rose-600',       shadow: 'shadow-pink-500/30' },
  { icon: BarChart3,   label: 'Reports',          desc: 'View analytics',       to: '/reports',         gradient: 'from-purple-500 to-fuchsia-600',  shadow: 'shadow-purple-500/30' },
  { icon: Download,    label: 'Export PDF',       desc: 'Download report',      to: '/reports',         gradient: 'from-slate-500 to-zinc-600',      shadow: 'shadow-slate-500/30' },
];

const MONTHLY_DATA = [
  { month: 'Feb', score: 55, interviews: 4 },
  { month: 'Mar', score: 62, interviews: 6 },
  { month: 'Apr', score: 70, interviews: 5 },
  { month: 'May', score: 68, interviews: 8 },
  { month: 'Jun', score: 79, interviews: 7 },
  { month: 'Jul', score: 85, interviews: 9 },
];

const QUOTES = [
  "The best preparation for tomorrow is doing your best today.",
  "Every expert was once a beginner. Keep pushing.",
  "Success is where preparation meets opportunity.",
  "Confidence is built by doing the uncomfortable things daily.",
];

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, action, actionTo }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.07] border border-white/[0.07]">
        <Icon className="h-4 w-4 text-zinc-300" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white leading-none">{title}</h2>
        {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && (
      <Link to={actionTo} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
        {action} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    )}
  </div>
);

// ── Dashboard Component ───────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const heroRef  = useRef(null);

  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSims, setActiveSims] = useState([]);
  const [time, setTime]     = useState(new Date());
  const [mentorExpanded, setMentorExpanded] = useState(false);
  const [quote]             = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [ripples, setRipples] = useState({});

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const handleHeroMouse = (e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseX.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    mouseY.set(((e.clientY - r.top)  / r.height - 0.5) * 30);
  };

  const triggerRipple = (key, e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipples(prev => ({ ...prev, [key]: { x: e.clientX - r.left, y: e.clientY - r.top, t: Date.now() } }));
    setTimeout(() => setRipples(prev => { const n = { ...prev }; delete n[key]; return n; }), 700);
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
        const sims = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('recruitment_sim_')) {
            const tail = key.slice('recruitment_sim_'.length);
            const sep  = tail.indexOf('_');
            if (sep !== -1) {
              const companyName = tail.slice(0, sep);
              const role = tail.slice(sep + 1);
              try {
                const sd = JSON.parse(localStorage.getItem(key));
                sims.push({ companyName, role, currentRoundIndex: sd.currentRoundIndex, completed: !!sd.finalReport, hiringDecision: sd.finalReport?.hiringDecision });
              } catch {}
            }
          }
        }
        setActiveSims(sims);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="relative h-16 w-16">
          <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
          <motion.div className="absolute inset-3 rounded-full border-2 border-transparent border-b-cyan-500" animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
          <Brain className="absolute inset-0 m-auto h-5 w-5 text-indigo-400" />
        </div>
        <motion.p animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 2, repeat: Infinity }} className="text-sm text-zinc-500 font-medium">Preparing your workspace...</motion.p>
      </div>
    );
  }

  const totalInterviews  = stats?.totalInterviews  || 0;
  const averageScore     = stats?.averageScore      || 0;
  const confidenceLevel  = stats?.confidenceLevel   || 0;

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Global Background ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <FloatingBlob cx={10}  cy={15}  color="rgba(99,102,241,0.7)"  r={500} delay={0} />
        <FloatingBlob cx={88}  cy={8}   color="rgba(168,85,247,0.6)"  r={380} delay={3} />
        <FloatingBlob cx={65}  cy={75}  color="rgba(6,182,212,0.45)"  r={420} delay={6} />
        <FloatingBlob cx={25}  cy={82}  color="rgba(236,72,153,0.35)" r={300} delay={2} />
        <FloatingBlob cx={50}  cy={45}  color="rgba(245,158,11,0.12)" r={250} delay={8} />

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <Star_ key={i} x={Math.random()*100} y={Math.random()*100} size={Math.random()*2+0.5} delay={Math.random()*8} />
        ))}

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.8) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />

        {/* Noise overlay */}
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

        {/* Vignette */}
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col">
        <Navbar subtitle={`${fmt(time)} · ${stats?.totalInterviews || 0} sessions completed`} />

        <main className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 pb-16 pt-4">
          <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-[1400px] space-y-6">

            {/* ──────────────────────────────────────────────────────────────── */}
            {/* HERO */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <motion.div
              ref={heroRef} variants={fadeUp}
              onMouseMove={handleHeroMouse}
              onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-[#0c0c1e] to-[#090912] min-h-[220px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/15 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />
              <motion.div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-indigo-500/15 blur-[80px]" style={{ x: springX, y: springY }} />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:px-10">
                <div className="space-y-3 flex-1">
                  <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-indigo-300">AI Mentor Online · Ready to help</span>
                    <Sparkles className="h-3 w-3 text-purple-400" />
                  </motion.div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
                    Crush your next interview,{' '}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      {user?.name?.split(' ')[0] || 'Candidate'}
                    </span>
                    .
                  </h1>
                  <p className="text-zinc-400 max-w-lg leading-relaxed text-[15px]">{quote}</p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <MagneticBtn
                      onClick={() => navigate('/interview/setup')}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-shadow"
                    >
                      <Play className="h-4 w-4" /> Start Mock Interview <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </MagneticBtn>
                    <MagneticBtn
                      onClick={() => navigate('/resume')}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all backdrop-blur-md"
                    >
                      <FileText className="h-4 w-4" /> Analyze Resume
                    </MagneticBtn>
                  </div>
                </div>

                {/* Stats mini row */}
                <div className="flex gap-3 flex-shrink-0">
                  <CircularProgress value={stats?.averageScore || 0} size={88} stroke={7} gradient={['#6366f1','#a855f7']} label="Avg Score" />
                  <div className="hidden sm:flex flex-col gap-3">
                    <CircularProgress value={stats?.confidenceLevel || 0} size={64} stroke={5} gradient={['#f59e0b','#ef4444']} label="Confidence" />
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="relative border-t border-white/[0.05] bg-white/[0.02] px-8 py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5 text-orange-400" /> <b className="text-white">{stats?.streakCount || 0}-day</b> streak</span>
                <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5 text-yellow-400" /> <b className="text-white">Level {stats?.level||1}</b> · {(stats?.xp||0)%500}/500 XP</span>
              </div>
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────── */}
            {/* ANIMATED STATS GRID */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <motion.div variants={container}>
              <SectionHeader icon={Activity} title="Performance Overview" subtitle="Real-time stats across all skill dimensions" action="View analytics" actionTo="/reports" />

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {[
                  { label: 'Interview Score',   val: stats?.averageScore || 0,   suffix:'%',   gradient:['#6366f1','#8b5cf6'], icon: Star,         sub: 'Overall Average' },
                  { label: 'Total Interviews',  val: stats?.totalInterviews || 0,suffix:'',    gradient:['#0ea5e9','#10b981'], icon: Mic,         sub: 'Completed' },
                  { label: 'Confidence',        val: stats?.confidenceLevel || 0,suffix:'%',   gradient:['#f59e0b','#ef4444'], icon: Flame,       sub: 'Avg Confidence' },
                  { label: 'XP Earned',         val: stats?.xp || 0,             suffix:' XP', gradient:['#f59e0b','#a855f7'], icon: Coins,       sub: `Level ${stats?.level || 1}` },
                  { label: 'Current Level',     val: stats?.level || 1,          suffix:'',    gradient:['#a855f7','#ec4899'], icon: Trophy,      sub: 'Keep leveling up' },
                  { label: 'Streak Count',      val: stats?.streakCount || 0,    suffix:' d',  gradient:['#10b981','#0ea5e9'], icon: Target,      sub: 'Current streak' },
                ].map((s, i) => {
                  const Icon = s.icon;
                  const gradId = `sg-${i}`;
                  return (
                    <motion.div
                      key={i} variants={fadeUp}
                      whileHover={{ y: -5, scale: 1.02, transition: { type:'spring', stiffness:300, damping:20 } }}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 cursor-default select-none backdrop-blur-sm"
                      style={{ perspective: 1000 }}
                    >
                      {/* Top glow on hover */}
                      <motion.div
                        className="absolute inset-x-0 -top-px h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background: `linear-gradient(90deg,transparent,${s.gradient[0]},${s.gradient[1]},transparent)` }}
                      />
                      {/* Blob */}
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: `linear-gradient(135deg,${s.gradient[0]},${s.gradient[1]})` }} />

                      <svg width="0" height="0"><defs>
                        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={s.gradient[0]} />
                          <stop offset="100%" stopColor={s.gradient[1]} />
                        </linearGradient>
                      </defs></svg>

                      <div className="flex items-center justify-between mb-3">
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${s.gradient[0]}33,${s.gradient[1]}33)`, border: `1px solid ${s.gradient[0]}30` }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: s.gradient[0] }} />
                        </div>
                        <ChevronUp className="h-3.5 w-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div>
                        <p className="text-[10px] text-zinc-500 font-medium mb-1 uppercase tracking-wide leading-none">{s.label}</p>
                        <p className="text-2xl font-bold text-white leading-none tracking-tight">
                          <Counter to={typeof s.val === 'number' ? s.val : 0} suffix={s.suffix} duration={1.8} />
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-1">{s.sub}</p>
                      </div>

                      {/* Bottom progress bar */}
                      {s.suffix === '%' && (
                        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.val}%` }}
                            transition={{ duration: 1.4, delay: 0.3 + i * 0.04, ease: [0.16,1,0.3,1] }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg,${s.gradient[0]},${s.gradient[1]})` }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ──────────────────────────────────────────────────────────────── */}
            {/* AI MENTOR + AI RECOMMENDATIONS */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* AI Mentor Card */}
              <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-500/20 bg-gradient-to-br from-purple-100/50 to-indigo-100/50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 backdrop-blur-sm cursor-pointer group shadow-sm dark:shadow-none" onClick={() => setMentorExpanded(!mentorExpanded)}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5" />
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-purple-500/20 blur-2xl group-hover:bg-purple-500/30 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0,5,-5,0], scale: [1,1.05,1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30"
                    >
                      <Bot className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">AI Mentor</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-medium">Online · Ready</span>
                      </div>
                    </div>
                    <Sparkles className="ml-auto h-4 w-4 text-purple-500 dark:text-purple-400 animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl bg-white/40 dark:bg-white/5 border border-purple-200/50 dark:border-white/5 p-3">
                      <p className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold uppercase tracking-wider mb-1">Today's Advice</p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">Focus on System Design today. Your score dropped 8% there. Practice with the CAP theorem exercise.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl bg-red-500/10 border border-red-500/15 p-2.5">
                        <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold">⚠ Weak</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 font-medium">System Design</p>
                      </div>
                      <div className="flex-1 rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-2.5">
                        <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold">✓ Strong</p>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-0.5 font-medium">Behavioral</p>
                      </div>
                    </div>
                  </div>

                  <MagneticBtn
                    onClick={(e) => { e.stopPropagation(); navigate('/interview/setup'); }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-shadow"
                  >
                    <MessageSquare className="h-4 w-4" /> Ask AI Mentor
                  </MagneticBtn>
                </div>
              </motion.div>

              {/* AI Recommendations */}
              <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                <SectionHeader icon={Lightbulb} title="AI Recommendations" subtitle="Smart priority queue based on your profile" />
                <div className="space-y-2.5">
                  {AI_RECS.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        className={`group flex gap-3 rounded-xl border p-3.5 cursor-pointer ${r.bg} transition-colors hover:brightness-110`}
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
                          <Icon className={`h-4 w-4 ${r.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm font-semibold text-white">{r.title}</p>
                            <span className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 ${r.priority==='HIGH' ? 'bg-red-500/20 text-red-400' : r.priority==='MED' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{r.priority}</span>
                            <span className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-full">{r.tag}</span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1">{r.desc}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5"><Clock className="h-3 w-3" /> {r.eta}</span>
                          <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ──────────────────────────────────────────────────────────────── */}
            {/* RECENT ACTIVITY + RECENT REPORTS */}
            {/* ──────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Activity Timeline */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                <SectionHeader icon={Activity} title="Recent Activity" subtitle="Your last 6 events" action="Full history" actionTo="/reports" />
                <div className="relative ml-3">
                  {/* Vertical line */}
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/30 via-white/10 to-transparent" />
                  <div className="space-y-0">
                    {TIMELINE.map((ev, i) => {
                      const Icon = ev.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 300, damping: 26 }}
                          className="relative flex items-start gap-4 pb-5 group cursor-default"
                        >
                          <div className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl ${ev.color} shadow-lg mt-0.5`}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-white">{ev.label}</p>
                              <span className="text-[10px] text-zinc-600">{ev.time}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{ev.sub}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1" />
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Recent Reports */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-sm">
                <SectionHeader icon={FileText} title="Recent Reports" subtitle="Your last interview analysis" action="All reports" actionTo="/reports" />
                <div className="space-y-3">
                  {(stats?.recentInterviews?.length ? stats.recentInterviews.slice(0,4) : [
                    { name: 'Frontend Engineer Round', date: 'Jul 14', score: 82, duration: '32 min', id: '1' },
                    { name: 'System Design Mock',       date: 'Jul 12', score: 58, duration: '45 min', id: '2' },
                    { name: 'Behavioral Interview',     date: 'Jul 10', score: 91, duration: '25 min', id: '3' },
                    { name: 'DSA Coding Round',         date: 'Jul 8',  score: 74, duration: '38 min', id: '4' },
                  ]).map((iv, i) => {
                    const score = iv.score;
                    const color = score >= 80 ? 'from-emerald-500 to-teal-500' : score >= 65 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';
                    const textColor = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-red-400';
                    const bgColor = score >= 80 ? 'bg-emerald-500/10 border-emerald-500/15' : score >= 65 ? 'bg-amber-500/10 border-amber-500/15' : 'bg-red-500/10 border-red-500/15';
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.09, type: 'spring', stiffness: 300 }}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 cursor-pointer"
                      >
                        {/* Score bar */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.16,1,0.3,1] }}
                          className={`absolute left-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r ${color}`}
                        />
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${bgColor} border`}>
                            <span className={`text-sm font-bold ${textColor}`}>{score}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{iv.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {iv.duration || '30 min'}</span>
                              <span>·</span>
                              <span>{iv.date}</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={() => navigate(`/report/${iv.id}`)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-indigo-500/20 text-zinc-500 hover:text-indigo-400 transition-colors" title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-colors" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => navigate('/interview/setup')} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 transition-colors" title="Replay">
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ──────────────────────────────────────────────────────────────── */}
            {/* ACTIVE SIMULATIONS (if any) */}
            {/* ──────────────────────────────────────────────────────────────── */}
            {activeSims.length > 0 && (
              <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-indigo-500/[0.15] bg-indigo-500/[0.03] p-5">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent" />
                <div className="relative z-10">
                  <SectionHeader icon={Building2} title="Active Simulations" subtitle={`${activeSims.length} ongoing recruitment process${activeSims.length>1?'es':''}`} action="All companies" actionTo="/companies" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeSims.map((sim, idx) => (
                      <motion.div key={idx} whileHover={{ x: 4 }} className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-white text-sm">{sim.companyName}</span>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">{sim.role}</span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {sim.completed
                              ? <span className="text-emerald-400 font-medium">Decision: {sim.hiringDecision} 🎉</span>
                              : `Round ${sim.currentRoundIndex + 1} pending`}
                          </p>
                        </div>
                        <button onClick={() => navigate(`/companies/${sim.companyName}?role=${encodeURIComponent(sim.role)}`)}
                          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${sim.completed ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}>
                          {sim.completed ? 'View' : 'Continue'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
