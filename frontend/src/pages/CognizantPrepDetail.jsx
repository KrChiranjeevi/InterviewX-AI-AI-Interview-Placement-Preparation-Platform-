import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLaptopCode, FaBrain, FaUsers, FaCheckCircle, FaLock,
  FaClock, FaTrophy, FaBriefcase, FaCode, FaChartLine,
  FaRobot, FaPlay, FaPaperPlane, FaChevronRight, FaChevronDown,
  FaFilePdf, FaStar, FaDatabase, FaStream, FaExclamationTriangle,
  FaExpand, FaCompress, FaCheck, FaHistory, FaMedal, FaCloud,
  FaShare, FaShieldAlt, FaLightbulb, FaBookOpen, FaGraduationCap,
  FaAward, FaBolt, FaArrowRight, FaThumbsUp, FaThumbsDown,
  FaRedo, FaFlag, FaEye, FaSave, FaTimes, FaBars, FaListUl
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

// ─────────────────────────────────────────────────────────
//  COGNIZANT THEME
// ─────────────────────────────────────────────────────────
const C = {
  bg: '#04080F',
  card: '#0A1628',
  card2: '#0F1E35',
  border: '#1B2F50',
  accent: '#0055FF',
  accentDark: '#0033A0',
  accentGlow: 'rgba(0,85,255,0.35)',
  emerald: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  text: '#E2E8F0',
  muted: '#64748B',
};const startHR = async () => {
    try {
      toast.loading('Initializing Live HR Interview...', { id: 'hr-start' });
      const res = await api.post('/interviews/create', {
        interviewType: 'HR Interview',
        role: 'Candidate',
        difficulty: 'Medium',
        duration: 30,
        company: 'Cognizant'
      });
      toast.success('Interview ready!', { id: 'hr-start' });
      navigate('/interview/live/' + res.data._id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start interview', { id: 'hr-start' });
    }
  };const startHR = () => {
    setHrStep(0);
    setMessages([{ from: 'ai', text: HR_FLOW[0].q, step: HR_FLOW[0].step }]);
    setEvalRunning(true);
    setEval(prev => ({ ...prev, comms: 65, leadership: 55, confidence: 60, professionalism: 70, overall: 65 }));
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      if (activeTab === 'tech') {
        if (techStep < TECH_FLOW.length - 1) {
          const next = techStep + 1;
          setTechStep(next);
          setMessages(prev => [...prev, { from: 'ai', text: TECH_FLOW[next].q, step: TECH_FLOW[next].step }]);
        } else {
          setMessages(prev => [...prev, { from: 'ai', text: "Excellent performance! That concludes your technical interview. Our team will review your responses. Please proceed to the HR round.", step: 'Completed' }]);
          setInterviewDone(p => ({ ...p, tech: true }));
          setEvalRunning(false);
          setPipelineStep(4);
        }
      } else {
        if (hrStep < HR_FLOW.length - 1) {
          const next = hrStep + 1;
          setHrStep(next);
          setMessages(prev => [...prev, { from: 'ai', text: HR_FLOW[next].q, step: HR_FLOW[next].step }]);
        } else {
          setMessages(prev => [...prev, { from: 'ai', text: "Thank you so much for your time today. It was a pleasure speaking with you. The hiring committee will now deliberate and you'll hear from us shortly. Best of luck!", step: 'Completed' }]);
          setInterviewDone(p => ({ ...p, hr: true }));
          setEvalRunning(false);
          setPipelineStep(5);
        }
      }
    }, 1400);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const runCode = () => {
    setCompiling(true);
    setCodeResult(null);
    setTimeout(() => {
      setCompiling(false);
      setCodeResult({ passed: 4, total: 4, runtime: '12ms', memory: '32 MB', verdict: 'Accepted' });
      toast.success('All 4 / 4 test cases passed!', { icon: '✅' });
    }, 2200);
  };

  const generateResult = (selected) => {
    setFinalResult(selected ? 'selected' : 'not-selected');
    setPipelineStep(5);
    if (selected) setShowOffer(true);
  };

  const downloadPDF = () => {
    toast.success('Generating your Cognizant Readiness Report PDF…', { icon: '📄' });
    setTimeout(() => toast.success('Cognizant_GenCNext_Report_2026.pdf downloaded!', { icon: '✅' }), 1800);
  };

  // ─────────────────────────────────────────────────────────
  //  CURRENT OA SECTION DATA
  // ─────────────────────────────────────────────────────────
  const currentSection = OA_SECTIONS.find(s => s.id === oaSectionId);
  const currentQuestions = SAMPLE_QUESTIONS[oaSectionId] || [];
  const currentQ = currentQuestions[oaQuestionIdx];

  // ─────────────────────────────────────────────────────────
  //  NAV TABS
  // ─────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────
  //  LIVE SCORECARD WIDGET
  // ─────────────────────────────────────────────────────────
  const LiveScorecard = () => (
    <div className="rounded-2xl border p-5 space-y-4" style={{ backgroundColor: C.card, borderColor: C.border }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live AI Scorecard</span>
      </div>
      {[
        { l: 'Assessment', v: eval_.assessment, c: '#818CF8' },
        { l: 'Coding', v: eval_.coding, c: '#34D399' },
        { l: 'Technical', v: Math.round(eval_.tech), c: '#60A5FA' },
        { l: 'Communication', v: Math.round(eval_.comms), c: '#F472B6' },
        { l: 'Leadership', v: Math.round(eval_.leadership), c: '#FB923C' },
        { l: 'Confidence', v: Math.round(eval_.confidence), c: '#FBBF24' },
        { l: 'Professionalism', v: Math.round(eval_.professionalism), c: '#A78BFA' },
        { l: 'Problem Solving', v: Math.round(eval_.problemSolving), c: '#34D399' },
        { l: 'Overall Readiness', v: Math.round(eval_.overall), c: C.accent },
      ].map(m => (
        <div key={m.l} className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold">
            <span style={{ color: C.muted }}>{m.l}</span>
            <span className="text-white">{m.v}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <motion.div className="h-full rounded-full" style={{ backgroundColor: m.c, boxShadow: `0 0 6px ${m.c}80` }}
              initial={{ width: 0 }} animate={{ width: `${m.v}%` }} transition={{ duration: 0.8 }}/>
          </div>
        </div>
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────
  //  SECTION ANALYTICS OVERLAY
  // ─────────────────────────────────────────────────────────
  const SectionAnalytics = () => {
    const sec = OA_SECTIONS.find(s => s.id === analyticsSection);
    const isCoding = analyticsSection === 'coding';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-white">Section-wise Analytics</h2>
          <button onClick={() => { setShowAnalytics(false); setActiveTab('tech'); }} className="px-6 py-2.5 rounded-xl text-sm font-black text-white flex items-center gap-2"
            style={{ backgroundColor: C.accent, boxShadow: `0 0 20px ${C.accentGlow}` }}>
            Proceed to Technical Interview <FaChevronRight/>
          </button>
        </div>

        {/* Section Selector */}
        <div className="flex gap-3 flex-wrap">
          {OA_SECTIONS.map(s => (
            <button key={s.id} onClick={() => setAnalyticsSection(s.id)}
              className="px-5 py-2.5 rounded-xl text-xs font-black border transition-all"
              style={analyticsSection === s.id
                ? { backgroundColor: `${s.color}20`, borderColor: s.color, color: s.color }
                : { backgroundColor: C.card, borderColor: C.border, color: C.muted }}>
              <s.icon className="inline mr-2"/>{s.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Metrics */}
          <div className="rounded-2xl border p-8 space-y-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <sec.icon className="text-xl" style={{ color: sec.color }}/>
              {sec.name} — Performance
            </h3>
            {isCoding ? (
              <div className="space-y-5">
                {[
                  { l: 'Passed Test Cases', v: `${sec.analytics.passed} / ${sec.analytics.hidden}`, badge: 'text-emerald-400' },
                  { l: 'Runtime', v: sec.analytics.runtime, badge: 'text-blue-400' },
                  { l: 'Memory Usage', v: sec.analytics.memory, badge: 'text-blue-400' },
                  { l: 'Optimization Score', v: `${sec.analytics.optScore}/100`, badge: 'text-yellow-400' },
                  { l: 'Code Quality', v: sec.analytics.quality, badge: 'text-emerald-400' },
                  { l: 'Maintainability', v: sec.analytics.maintainability, badge: 'text-emerald-400' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between items-center py-2 border-b" style={{ borderColor: C.border }}>
                    <span className="text-sm" style={{ color: C.muted }}>{r.l}</span>
                    <span className={`font-black text-sm ${r.badge}`}>{r.v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  { l: 'Questions Attempted', v: `${sec.analytics.attempted} / ${sec.questions}`, badge: 'text-white' },
                  { l: 'Correct', v: sec.analytics.correct, badge: 'text-emerald-400' },
                  { l: 'Wrong', v: sec.analytics.wrong, badge: 'text-red-400' },
                  { l: 'Accuracy', v: `${sec.analytics.accuracy}%`, badge: 'text-blue-400' },
                  { l: 'Avg. Time per Question', v: sec.analytics.avgTime, badge: 'text-yellow-400' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between items-center py-2 border-b" style={{ borderColor: C.border }}>
                    <span className="text-sm" style={{ color: C.muted }}>{r.l}</span>
                    <span className={`font-black text-sm ${r.badge}`}>{r.v}</span>
                  </div>
                ))}
                {!isCoding && (
                  <div className="pt-2">
                    <ProgressBar label="Section Accuracy" value={sec.analytics.accuracy} color={sec.color}/>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Weak Topics & Recommendations */}
          <div className="space-y-6">
            {sec.weakTopics.length > 0 && (
              <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: C.card, borderColor: C.border }}>
                <h4 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><FaExclamationTriangle/> Weak Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {sec.weakTopics.map(t => (
                    <span key={t} className="px-4 py-2 rounded-xl text-xs font-bold border" style={{ backgroundColor: '#F59E0B10', borderColor: '#F59E0B30', color: '#F59E0B' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: C.card, borderColor: C.border }}>
              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><FaLightbulb/> AI Recommendations</h4>
              <ul className="space-y-3 text-sm" style={{ color: C.muted }}>
                {isCoding ? (
                  <>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Your solution was optimal. Practice similar Sliding Window and Two-Pointer patterns.</li>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Try implementing the same in multiple languages (Python + Java).</li>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Focus on Edge Cases: empty strings, single character, all unique characters.</li>
                  </>
                ) : (
                  <>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Practice {sec.weakTopics[0] || 'complex'} problems daily for the next 7 days.</li>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Aim to bring accuracy to 95%+ by solving 15 questions per topic.</li>
                    <li className="flex gap-3"><span className="text-emerald-400 font-bold mt-0.5">→</span> Work on reducing per-question time by 10–15 seconds through pattern recognition.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.bg, color: C.text }}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-16">

          {/* ── HERO ── */}
          <section className="relative px-8 pt-10 pb-14 border-b overflow-hidden" style={{ borderColor: C.border, background: `linear-gradient(160deg, ${C.accentDark}1A 0%, ${C.bg} 70%)` }}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 blur-[120px] rounded-full" style={{ backgroundColor: `${C.accent}20` }}></div>
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 mb-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center border font-black text-2xl" style={{ backgroundColor: C.card, borderColor: C.border, color: C.accent, boxShadow: `0 0 30px ${C.accentGlow}` }}>C</div>
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-4xl font-black text-white tracking-tight">Cognizant Campus Hiring Simulation</h1>
                    <span className="px-3 py-1 rounded-full text-xs font-black border" style={{ backgroundColor: `${C.accent}15`, borderColor: `${C.accent}40`, color: C.accent }}>2025 – 2026</span>
                  </div>
                  <p className="text-sm max-w-2xl leading-relaxed" style={{ color: C.muted }}>End-to-end AI-powered GenC · GenC Elevate · GenC Next hiring simulation with proctored assessment, dynamic interviews, and live performance analytics.</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'Hiring Difficulty', value: 'High', color: C.amber },
                  { label: 'Average Package', value: '6.75 LPA', color: '#34D399' },
                  { label: 'Selection Rate', value: '3.2%', color: '#F472B6' },
                  { label: 'Preparation Progress', value: '65%', color: C.accent },
                  { label: 'AI Readiness Score', value: '88/100', color: '#818CF8' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border p-4 flex flex-col gap-1" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.muted }}>{s.label}</span>
                    <span className="text-2xl font-black" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-8 pt-6 space-y-8">

            {/* ── NAV TABS ── */}
            <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-2 sticky top-0 z-20 pt-2 -mx-8 px-8" style={{ backgroundColor: `${C.bg}F0`, backdropFilter: 'blur(12px)' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); if (t.id === 'tech' && techStep === -1) {}; if (t.id === 'hr' && hrStep === -1) {}; }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border"
                  style={activeTab === t.id
                    ? { backgroundColor: `${C.accent}20`, borderColor: C.accent, color: '#60A5FA' }
                    : { backgroundColor: 'transparent', borderColor: 'transparent', color: C.muted }}>
                  <t.icon/> {t.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════
                TAB: DASHBOARD
            ══════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Top Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Application Status" value="In Progress" sub="Track: GenC Next" icon={FaChartLine} color={C.accent} glow={C.accentGlow}/>
                  <StatCard label="Current Round" value="Online Assessment" sub="Step 3 of 6" icon={FaLaptopCode} color="#818CF8"/>
                  <StatCard label="Overall Readiness" value="88%" sub="Estimated: 1 week prep needed" icon={FaBolt} color="#34D399"/>
                </div>

                {/* Progress Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border p-8 space-y-6" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Hiring Stage Progress</h3>
                    <div className="space-y-4">
                      <ProgressBar label="Assessment Readiness" value={94} color="#818CF8" sub="Quantitative, Logical, Verbal, Coding"/>
                      <ProgressBar label="Interview Readiness" value={82} color="#F472B6" sub="Technical & HR"/>
                      <ProgressBar label="Overall Readiness" value={88} color={C.accent} sub="Combined across all rounds"/>
                    </div>
                  </div>

                  {/* Animated Timeline */}
                  <div className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Hiring Timeline</h3>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5" style={{ backgroundColor: C.border }}></div>
                      {PIPELINE_STEPS.map((s, i) => {
                        const done = i < pipelineStep;
                        const cur = i === pipelineStep;
                        return (
                          <div key={s.id} className="relative mb-5 last:mb-0">
                            <div className="absolute -left-4 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                              style={{ backgroundColor: done ? '#10B981' : cur ? C.accent : C.bg, borderColor: done ? '#10B981' : cur ? C.accent : C.border }}>
                              {done && <FaCheck className="text-[6px] text-white"/>}
                              {cur && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                            </div>
                            <div className="ml-4">
                              <div className={`text-xs font-black ${done ? 'text-emerald-400' : cur ? 'text-white' : ''}`} style={!done && !cur ? { color: C.muted } : {}}>
                                {s.label} {cur && <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider" style={{ backgroundColor: `${C.accent}20`, color: C.accent }}>Current</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AI Recommendation */}
                <div className="rounded-2xl border p-8" style={{ backgroundColor: C.card2, borderColor: C.border }}>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.accent}20` }}>
                      <FaRobot className="text-xl" style={{ color: C.accent }}/>
                    </div>
                    <div>
                      <h3 className="font-black text-white mb-2 flex items-center gap-2">AI Readiness Recommendation <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Live Analysis</span></h3>
                      <p className="text-sm leading-relaxed" style={{ color: C.muted }}>
                        You are performing strongly in the Assessment and Coding dimensions. Your GenC Next readiness is at <strong className="text-white">88%</strong>. 
                        Focus on deepening your Java Collections knowledge and practice STAR-format answers for HR. 
                        Estimated full preparation: <strong className="text-white">1 week</strong> at 2 hours/day.
                      </p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {['Revise Java Collections', 'Practice System Design', 'Mock HR Interview', 'Solve 5 DP Problems'].map(tip => (
                          <span key={tip} className="px-3 py-1.5 rounded-lg text-xs font-bold border" style={{ backgroundColor: `${C.accent}10`, borderColor: `${C.accent}30`, color: '#60A5FA' }}>{tip}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: TRACKS & ROLES
            ══════════════════════════════════════════════════ */}
            {activeTab === 'tracks' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div>
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><FaTrophy style={{ color: C.accent }}/> Hiring Tracks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TRACKS.map((t, i) => (
                      <motion.div key={t.id} whileHover={{ y: -4 }} className="rounded-2xl border p-7 relative overflow-hidden cursor-pointer group"
                        style={{ backgroundColor: C.card, borderColor: C.border }}>
                        <div className="absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full opacity-0 group-hover:opacity-30 transition-all" style={{ backgroundColor: C.accent }}></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-black text-white">{t.name}</h3>
                            <Pill color={i===2 ? C.red : i===1 ? C.amber : '#34D399'}>{t.diff}</Pill>
                          </div>
                          <div className="text-2xl font-black mb-5" style={{ color: C.accent }}>{t.pkg}</div>
                          <div className="space-y-2.5 text-xs">
                            {[
                              ['Eligibility', t.elig],
                              ['Coding Level', t.coding],
                              ['Interview Difficulty', t.iv],
                              ['Career Growth', t.growth, '#34D399'],
                              ['Preparation Time', t.prep, '#60A5FA'],
                              ['Hiring Frequency', t.freq],
                            ].map(([k, v, col]) => (
                              <div key={k} className="flex justify-between py-1.5 border-b" style={{ borderColor: C.border }}>
                                <span style={{ color: C.muted }}>{k}</span>
                                <span className="font-black text-right max-w-[55%]" style={{ color: col || C.text }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><FaBriefcase style={{ color: C.accent }}/> Available Roles</h2>
                  <div className="flex flex-wrap gap-3">
                    {ROLES.map(r => (
                      <motion.div key={r} whileHover={{ scale: 1.04 }} className="px-5 py-3 rounded-xl border text-sm font-bold cursor-default transition-all"
                        style={{ backgroundColor: C.card, borderColor: C.border, color: C.muted }}>
                        {r}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: PIPELINE
            ══════════════════════════════════════════════════ */}
            {activeTab === 'pipeline' && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-10">
                <h2 className="text-2xl font-black text-white text-center mb-20">Cognizant Recruitment Pipeline</h2>
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 px-8">
                  <div className="hidden md:block absolute top-7 left-12 right-12 h-px" style={{ backgroundColor: C.border }}></div>
                  {PIPELINE_STEPS.map((s, i) => {
                    const done = i < pipelineStep;
                    const cur = i === pipelineStep;
                    return (
                      <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setPipelineStep(i)}>
                        <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all font-black text-xl"
                          style={{
                            backgroundColor: done ? '#10B98120' : cur ? `${C.accent}20` : C.bg,
                            borderColor: done ? '#10B981' : cur ? C.accent : C.border,
                            color: done ? '#10B981' : cur ? C.accent : C.muted,
                            boxShadow: cur ? `0 0 24px ${C.accentGlow}` : 'none',
                          }}>
                          {done ? <FaCheckCircle/> : cur ? <span>{i+1}</span> : <FaLock/>}
                        </motion.div>
                        <span className="text-xs font-black text-center" style={{ color: cur ? 'white' : C.muted }}>{s.label}</span>
                        {cur && <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase absolute -bottom-7 whitespace-nowrap" style={{ backgroundColor: `${C.accent}20`, color: C.accent, border: `1px solid ${C.accent}40` }}>Current</motion.span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: ONLINE ASSESSMENT
            ══════════════════════════════════════════════════ */}
            {activeTab === 'oa' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {oaDone && showAnalytics ? <SectionAnalytics/> : oaDone ? (
                  <div className="text-center py-20 space-y-6">
                    <div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl" style={{ backgroundColor: '#10B98120', color: '#10B981', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}><FaCheck/></div>
                    <h2 className="text-3xl font-black text-white">Assessment Completed!</h2>
                    <div className="flex gap-4 justify-center">
                      <button onClick={() => setShowAnalytics(true)} className="px-8 py-3 rounded-xl font-black text-white text-sm flex items-center gap-2" style={{ backgroundColor: C.accent }}>
                        View Analytics <FaChevronRight/>
                      </button>
                      <button onClick={() => { setActiveTab('tech'); setPipelineStep(3); }} className="px-8 py-3 rounded-xl font-black text-sm border" style={{ borderColor: C.border, color: C.text }}>
                        Technical Interview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div ref={oaRef} className={`flex gap-6 ${isProctored ? 'bg-[#04080F] p-6 fixed inset-0 z-50 h-screen w-screen overflow-auto' : 'h-[780px]'}`}>

                    {/* ── Left Sidebar ── */}
                    <div className="w-60 shrink-0 flex flex-col gap-3">
                      {/* Timer */}
                      <div className="rounded-2xl border p-5 space-y-4 relative overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
                        <div className="absolute -top-8 -right-8 w-24 h-24 blur-[30px] rounded-full" style={{ backgroundColor: oaTimer < 600 ? '#EF444430' : `${C.accent}20` }}></div>
                        <div className="text-[10px] font-black uppercase tracking-widest flex justify-between relative z-10" style={{ color: C.muted }}>
                          <span>Time Left</span>
                          {isProctored && <span className="text-red-400 flex items-center gap-1 animate-pulse"><FaShieldAlt/> PROCTORED</span>}
                        </div>
                        <div className="text-4xl font-black relative z-10" style={{ color: oaTimer < 600 ? C.red : 'white', fontFamily: 'monospace' }}>{fmtTime(oaTimer)}</div>
                        {tabWarnings > 0 && <div className="text-[10px] font-bold text-red-400 flex items-center gap-1 relative z-10"><FaExclamationTriangle/> {tabWarnings} violation{tabWarnings>1?'s':''} flagged</div>}
                        <button onClick={isProctored ? exitProctor : enterProctor} className="w-full py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-2 transition-all hover:bg-white/5 relative z-10"
                          style={{ borderColor: C.border, color: C.muted }}>
                          {isProctored ? <><FaCompress/> Exit Fullscreen</> : <><FaExpand/> Enter Fullscreen</>}
                        </button>
                        <button onClick={() => setShowPalette(!showPalette)} className="w-full py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-2 transition-all hover:bg-white/5 relative z-10"
                          style={{ borderColor: C.border, color: C.muted }}>
                          <FaListUl/> {showPalette ? 'Hide' : 'Show'} Palette
                        </button>
                      </div>

                      {/* Section Nav */}
                      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
                        {OA_SECTIONS.map(s => (
                          <button key={s.id} onClick={() => { setOaSectionId(s.id); setOaQuestionIdx(0); }}
                            className="w-full text-left p-4 rounded-xl border transition-all"
                            style={oaSectionId === s.id
                              ? { backgroundColor: `${s.color}15`, borderColor: s.color }
                              : { backgroundColor: C.card, borderColor: C.border }}>
                            <div className="flex items-center gap-2 mb-1">
                              <s.icon className="text-xs" style={{ color: s.color }}/>
                              <span className="text-xs font-black" style={{ color: oaSectionId === s.id ? s.color : C.muted }}>{s.name}</span>
                            </div>
                            <div className="text-[10px]" style={{ color: C.muted }}>{s.questions} Qs · {s.time} min</div>
                            <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full transition-all" style={{ backgroundColor: s.color, width: oaSectionId === s.id ? '40%' : '0%' }}></div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button onClick={() => setShowSubmitConfirm(true)} className="py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2"
                        style={{ backgroundColor: C.accent, boxShadow: `0 0 20px ${C.accentGlow}` }}>
                        <FaSave/> Submit Assessment
                      </button>
                    </div>

                    {/* ── Main Question Area ── */}
                    <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
                      {oaSectionId === 'coding' ? (
                        // Coding Editor
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b flex justify-between items-center bg-black/30" style={{ borderColor: C.border }}>
                            <div>
                              <h3 className="font-black text-white flex items-center gap-2"><FaCode style={{ color: C.accent }}/> Coding Assessment</h3>
                              <p className="text-[10px] mt-1 font-bold text-emerald-400">● Auto-saving enabled</p>
                            </div>
                            <select value={lang} onChange={e => setLang(e.target.value)} className="bg-black/60 border rounded-lg text-xs font-bold p-2 text-white outline-none" style={{ borderColor: C.border }}>
                              {['java','python','cpp','c','javascript'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-1">
                            <div className="w-1/3 p-6 border-r overflow-y-auto space-y-4" style={{ borderColor: C.border }}>
                              <h4 className="font-black text-white text-sm">Two Sum — GenC Next Pattern</h4>
                              <div className="flex gap-2">
                                <Pill color={C.amber}>Medium</Pill>
                                <Pill color="#818CF8">Arrays / HashMap</Pill>
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: C.muted }}>Given an array of integers and a target, return indices of two numbers that add up to the target. You may assume exactly one solution exists. Use O(N) time complexity.</p>
                              <div className="rounded-xl p-4 font-mono text-xs space-y-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: `1px solid ${C.border}` }}>
                                <div style={{ color: C.muted }}>Input:</div>
                                <div className="text-emerald-400">nums = [2,7,11,15], target = 9</div>
                                <div className="mt-2" style={{ color: C.muted }}>Output:</div>
                                <div className="text-emerald-400">[0, 1]</div>
                              </div>
                              {codeResult && (
                                <div className="rounded-xl p-4 space-y-2 text-xs" style={{ backgroundColor: '#10B98110', border: '1px solid #10B98130' }}>
                                  <div className="font-black text-emerald-400">{codeResult.verdict}</div>
                                  <div style={{ color: C.muted }}>Test Cases: {codeResult.passed}/{codeResult.total}</div>
                                  <div style={{ color: C.muted }}>Runtime: {codeResult.runtime} · Memory: {codeResult.memory}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <Editor language={lang} theme="vs-dark" value={code} onChange={c => setCode(c || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, cursorBlinking: 'smooth', smoothScrolling: true }}/>
                            </div>
                          </div>
                          <div className="p-4 border-t flex justify-between items-center bg-black/30" style={{ borderColor: C.border }}>
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                              {codeResult ? (
                                <><FaCheckCircle /> All tests passed</>
                              ) : (
                                <><FaEye style={{ color: C.muted }} /> <span style={{ color: C.muted }}>4 Hidden Test Cases</span></>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <button onClick={runCode} disabled={compiling} className="px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border transition-all" style={{ borderColor: C.border, color: C.text }}>
                                <FaPlay/> {compiling ? 'Running…' : 'Run & Test'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Aptitude Question
                        <div className="flex flex-col h-full">
                          <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: C.border }}>
                            <div className="text-xs font-black uppercase tracking-widest" style={{ color: C.muted }}>{currentSection?.name}</div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold" style={{ color: C.muted }}>Q {oaQuestionIdx + 1} / {currentQuestions.length}</span>
                              {reviewLater.has(`${oaSectionId}-${oaQuestionIdx}`) && <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase"><FaFlag className="inline mr-1"/>Review</span>}
                            </div>
                          </div>

                          {/* Question Palette Overlay */}
                          <AnimatePresence>
                            {showPalette && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b overflow-hidden" style={{ borderColor: C.border }}>
                                <div className="p-4 flex flex-wrap gap-2">
                                  {currentQuestions.map((_, qi) => {
                                    const key = `${oaSectionId}-${qi}`;
                                    const answered = oaAnswers[key] !== undefined;
                                    const review = reviewLater.has(key);
                                    return (
                                      <button key={qi} onClick={() => setOaQuestionIdx(qi)} className="w-9 h-9 rounded-lg text-xs font-black border transition-all"
                                        style={{
                                          backgroundColor: answered ? '#10B98120' : review ? '#F59E0B20' : C.bg,
                                          borderColor: qi === oaQuestionIdx ? C.accent : answered ? '#10B981' : review ? '#F59E0B' : C.border,
                                          color: answered ? '#10B981' : review ? '#F59E0B' : C.muted,
                                        }}>
                                        {qi + 1}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex-1 p-8 flex flex-col justify-between">
                            {currentQ ? (
                              <>
                                <div>
                                  <p className="text-lg text-white leading-relaxed mb-8 font-medium">{currentQ.q}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {currentQ.opts.map((opt, oi) => {
                                      const key = `${oaSectionId}-${oaQuestionIdx}`;
                                      const selected = oaAnswers[key] === oi;
                                      return (
                                        <motion.button key={oi} whileHover={{ scale: 1.01 }} onClick={() => setOaAnswers(prev => ({ ...prev, [key]: oi }))}
                                          className="p-5 rounded-xl border text-left font-semibold text-sm transition-all"
                                          style={{
                                            backgroundColor: selected ? `${C.accent}20` : C.card2,
                                            borderColor: selected ? C.accent : C.border,
                                            color: selected ? '#60A5FA' : C.text,
                                            boxShadow: selected ? `0 0 15px ${C.accentGlow}` : 'none',
                                          }}>
                                          <span className="font-black mr-3" style={{ color: C.muted }}>{String.fromCharCode(65+oi)}.</span>{opt}
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center pt-6 border-t" style={{ borderColor: C.border }}>
                                  <button onClick={() => { const key = `${oaSectionId}-${oaQuestionIdx}`; setReviewLater(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; }); }}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black border flex items-center gap-2 transition-all hover:bg-white/5"
                                    style={{ borderColor: C.border, color: reviewLater.has(`${oaSectionId}-${oaQuestionIdx}`) ? C.amber : C.muted }}>
                                    <FaFlag/> {reviewLater.has(`${oaSectionId}-${oaQuestionIdx}`) ? 'Marked for Review' : 'Review Later'}
                                  </button>
                                  <div className="flex gap-3">
                                    {oaQuestionIdx > 0 && <button onClick={() => setOaQuestionIdx(q => q - 1)} className="px-6 py-2.5 rounded-xl text-xs font-black border transition-all hover:bg-white/5" style={{ borderColor: C.border, color: C.muted }}>← Prev</button>}
                                    {oaQuestionIdx < currentQuestions.length - 1
                                      ? <button onClick={() => setOaQuestionIdx(q => q + 1)} className="px-8 py-2.5 rounded-xl text-xs font-black text-white" style={{ backgroundColor: C.accent }}>Save & Next →</button>
                                      : <button onClick={() => setShowSubmitConfirm(true)} className="px-8 py-2.5 rounded-xl text-xs font-black text-white" style={{ backgroundColor: C.accent }}>Finish Section</button>
                                    }
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <FaCheckCircle className="text-5xl text-emerald-400"/>
                                <p className="text-lg font-black text-white">Section Complete</p>
                                <p className="text-sm" style={{ color: C.muted }}>Navigate to the next section or submit your assessment.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submit Confirm Dialog */}
                    <AnimatePresence>
                      {showSubmitConfirm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border p-10 max-w-md w-full mx-4 space-y-6 text-center" style={{ backgroundColor: C.card, borderColor: C.border }}>
                            <FaExclamationTriangle className="text-4xl text-amber-400 mx-auto"/>
                            <h3 className="text-2xl font-black text-white">Submit Assessment?</h3>
                            <p className="text-sm" style={{ color: C.muted }}>Once submitted, you cannot revisit any questions. Make sure you've reviewed all flagged questions.</p>
                            <div className="flex gap-4">
                              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3 rounded-xl font-black text-sm border transition-all hover:bg-white/5" style={{ borderColor: C.border, color: C.muted }}>Cancel</button>
                              <button onClick={handleSubmitOA} className="flex-1 py-3 rounded-xl font-black text-sm text-white" style={{ backgroundColor: C.accent }}>Confirm Submit</button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: QUESTION BANK
            ══════════════════════════════════════════════════ */}
            {activeTab === 'qbank' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  {QBANK_CATS.map(c => (
                    <button key={c} onClick={() => setQbankCat(c)} className="px-4 py-2 rounded-full text-xs font-black border transition-all"
                      style={qbankCat === c
                        ? { backgroundColor: `${C.accent}20`, borderColor: C.accent, color: '#60A5FA' }
                        : { backgroundColor: 'transparent', borderColor: C.border, color: C.muted }}>
                      {c}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(COMPANY_CODING_PYQS['Cognizant'] || COMPANY_CODING_PYQS['Wipro']).map((q, i) => (
                    <motion.div key={i} whileHover={{ y: -3 }} className="rounded-2xl border p-6 space-y-4 group cursor-pointer relative overflow-hidden"
                      style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <div className="absolute top-0 right-0 w-20 h-20 blur-[40px] rounded-full opacity-0 group-hover:opacity-30 transition-all" style={{ backgroundColor: C.accent }}></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-2 flex-wrap">
                          <Pill color={q.diff==='Easy' ? '#34D399' : q.diff==='Medium' ? C.amber : C.red}>{q.diff}</Pill>
                          <Pill color="#60A5FA">{qbankCat}</Pill>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-wider" style={{ color: C.muted }}>freq: {q.freq}</div>
                      </div>
                      <div className="relative z-10">
                        <h4 className="font-black text-white group-hover:text-blue-400 transition-colors">{q.title}</h4>
                        <p className="text-xs mt-2 leading-relaxed" style={{ color: C.muted }}>{q.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: TECHNICAL / HR INTERVIEW
            ══════════════════════════════════════════════════ */}
            {(activeTab === 'tech' || activeTab === 'hr') && (() => {
              const isTech = activeTab === 'tech';
              const step = isTech ? techStep : hrStep;
              const flow = isTech ? TECH_FLOW : HR_FLOW;
              const started = step !== -1;
              return (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col xl:flex-row gap-6" style={{ minHeight: '680px' }}>
                  {/* Chat */}
                  <div className="flex-1 flex flex-col rounded-2xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    {/* Header */}
                    <div className="p-5 border-b flex items-center justify-between bg-black/30" style={{ borderColor: C.border }}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${C.accent}20`, borderColor: `${C.accent}40`, boxShadow: `0 0 15px ${C.accentGlow}` }}>
                          <FaRobot className="text-xl" style={{ color: C.accent }}/>
                        </div>
                        <div>
                          <div className="font-black text-sm text-white">Cognizant AI {isTech ? 'Technical' : 'HR'} Panelist</div>
                          <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                            {started ? 'LIVE INTERVIEW' : 'READY'}
                          </div>
                        </div>
                      </div>
                      {started && (
                        <div className="hidden md:flex gap-1.5">
                          {flow.map((f, i) => (
                            <div key={f.step} className="h-2 rounded-sm transition-all" style={{ width: `${Math.max(16, 60 / flow.length)}px`, backgroundColor: i <= step ? C.accent : 'rgba(255,255,255,0.08)', boxShadow: i <= step ? `0 0 6px ${C.accentGlow}` : 'none' }} title={f.step}></div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                      {!started ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6">
                          <div className="w-24 h-24 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${C.accent}10`, borderColor: `${C.accent}30`, boxShadow: `0 0 40px ${C.accentGlow}` }}>
                            {isTech ? <FaLaptopCode className="text-4xl" style={{ color: C.accent }}/> : <FaUsers className="text-4xl" style={{ color: C.accent }}/>}
                          </div>
                          <h3 className="text-3xl font-black text-white">{isTech ? 'Technical Panel Round' : 'HR Discussion'}</h3>
                          <p className="text-sm max-w-md leading-relaxed" style={{ color: C.muted }}>
                            {isTech
                              ? 'A 10-step AI technical interview covering your project, architecture, databases, live coding, and system design — calibrated for the GenC Next benchmark.'
                              : 'A structured 10-topic HR conversation evaluating your communication, alignment with Cognizant values, and career goals using the STAR framework.'}
                          </p>
                          <button onClick={isTech ? startTech : startHR} className="px-10 py-4 rounded-xl font-black text-white text-sm flex items-center gap-2"
                            style={{ backgroundColor: C.accent, boxShadow: `0 0 25px ${C.accentGlow}` }}>
                            <FaPlay/> START INTERVIEW
                          </button>
                        </div>
                      ) : messages.map((m, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 text-sm leading-relaxed rounded-2xl ${m.from === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                            style={m.from === 'user'
                              ? { backgroundColor: C.accent, color: 'white' }
                              : { backgroundColor: C.card2, border: `1px solid ${C.border}`, color: C.text }}>
                            {m.step && m.from === 'ai' && <div className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: C.muted }}>{m.step}</div>}
                            {m.text}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={chatEndRef}/>
                    </div>

                    {/* Input */}
                    <div className="p-5 border-t bg-black/40" style={{ borderColor: C.border }}>
                      <div className="flex gap-3">
                        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                          disabled={!started} placeholder={started ? "Type your professional response… (Enter to send)" : "Start the interview first"}
                          className="flex-1 bg-black/60 border rounded-xl px-5 py-4 text-sm text-white outline-none transition-all"
                          style={{ borderColor: C.border }}/>
                        <button onClick={sendMessage} disabled={!started || !input.trim()} className="w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          style={{ backgroundColor: C.accent }}>
                          <FaPaperPlane className="text-sm text-white"/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel */}
                  <div className="w-full xl:w-80 shrink-0 space-y-5">
                    <LiveScorecard/>
                    {/* Flow Topics */}
                    <div className="rounded-2xl border p-5 space-y-3" style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.muted }}>Interview Flow</h4>
                      {flow.slice(0, 6).map((f, i) => (
                        <div key={f.step} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: i <= step ? C.accent : C.border }}></div>
                          <span className="text-xs font-semibold" style={{ color: i === step ? 'white' : i < step ? '#34D399' : C.muted }}>{f.step}</span>
                          {i === step && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-auto shrink-0"></div>}
                        </div>
                      ))}
                    </div>
                    {isTech && (
                      <div className="rounded-2xl border p-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: C.muted }}>Live Whiteboard</h4>
                        <div style={{ height: 200 }}>
                          <Editor language="java" theme="vs-dark" defaultValue="// Draft code / pseudocode here" options={{ minimap: { enabled: false }, fontSize: 12, padding: { top: 8 }, lineNumbers: 'off' }}/>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })()}

            {/* ══════════════════════════════════════════════════
                TAB: HIRING COMMITTEE
            ══════════════════════════════════════════════════ */}
            {activeTab === 'panel' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
                <div className="text-center">
                  <h2 className="text-3xl font-black text-white mb-3">Final Hiring Committee Verdict</h2>
                  <p className="text-sm" style={{ color: C.muted }}>Aggregated review across all Cognizant GenC Next recruitment rounds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {COMMITTEE_PANELISTS.map(p => (
                    <motion.div key={p.role} whileHover={{ y: -4 }} className="rounded-2xl border p-8 text-center space-y-4 relative overflow-hidden"
                      style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10" style={{ backgroundColor: p.color }}></div>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border relative z-10" style={{ backgroundColor: `${p.color}15`, borderColor: `${p.color}30` }}>
                        <p.icon className="text-2xl" style={{ color: p.color }}/>
                      </div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: C.muted }}>{p.role}</div>
                        <div className="text-2xl font-black mb-1" style={{ color: p.verdict === 'Strong Hire' ? '#34D399' : '#60A5FA' }}>{p.verdict}</div>
                        <div className="text-4xl font-black text-white">{p.rating}<span className="text-lg text-slate-500">/100</span></div>
                      </div>
                      <p className="text-xs leading-relaxed relative z-10 text-left" style={{ color: C.muted }}>"{p.comment}"</p>
                    </motion.div>
                  ))}
                </div>

                {/* Overall Verdict */}
                <div className="rounded-3xl border p-12 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.card} 0%, ${C.accentDark}20 100%)`, borderColor: `${C.accent}50`, boxShadow: `0 20px 60px ${C.accentGlow}` }}>
                  <div className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] rounded-full" style={{ backgroundColor: `${C.accent}15` }}></div>
                  <div className="relative z-10 flex flex-col items-center text-center gap-8">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ backgroundColor: '#10B98120', border: '2px solid #10B981', color: '#10B981', boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}>
                      <FaCheck/>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-white mb-2">Overall Verdict: Strong Hire</h3>
                      <p className="text-sm" style={{ color: C.muted }}>Unanimous recommendation for GenC Next track placement</p>
                    </div>

                    {/* Offer Letter */}
                    <div className="w-full rounded-2xl border p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-left" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${C.accent}20` }}>
                      {[['Company', 'Cognizant Technology Solutions'], ['Role / Track', 'GenC Next'], ['Compensation', '8.0 LPA', '#34D399'], ['Joining Batch', 'August 2026']].map(([l, v, col]) => (
                        <div key={l}>
                          <div className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: C.muted }}>{l}</div>
                          <div className="text-base font-black" style={{ color: col || 'white' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                      <button onClick={() => generateResult(true)} className="px-10 py-4 rounded-xl font-black text-sm text-white flex items-center gap-2" style={{ backgroundColor: '#10B981', boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}>
                        <FaCheck/> Accept Offer
                      </button>
                      <button onClick={() => generateResult(false)} className="px-10 py-4 rounded-xl font-black text-sm border flex items-center gap-2" style={{ borderColor: C.border, color: C.muted }}>
                        <FaTimes/> Decline
                      </button>
                      <button onClick={() => setActiveTab('report')} className="px-10 py-4 rounded-xl font-black text-sm border flex items-center gap-2" style={{ borderColor: C.border, color: C.text }}>
                        <FaFilePdf/> View Full Report
                      </button>
                    </div>
                  </div>
                </div>

                {/* Final Result Panels */}
                {finalResult === 'selected' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border p-10 text-center space-y-6" style={{ backgroundColor: '#10B98110', borderColor: '#10B98130' }}>
                    <div className="text-6xl">🎉</div>
                    <h3 className="text-3xl font-black text-emerald-400">Congratulations! You're Selected!</h3>
                    <p className="text-sm" style={{ color: C.muted }}>Your Cognizant GenC Next offer has been accepted. Check your email for the official joining documentation.</p>
                    <div className="flex flex-wrap gap-3 justify-center text-xs font-bold">
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📍 Chennai / Pune / Bangalore</span>
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">📅 August 2026</span>
                      <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💰 8.0 LPA</span>
                    </div>
                  </motion.div>
                )}
                {finalResult === 'not-selected' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border p-10 space-y-6" style={{ backgroundColor: '#EF444410', borderColor: '#EF444430' }}>
                    <h3 className="text-2xl font-black text-red-400">Result: Not Selected This Round</h3>
                    <p className="text-sm" style={{ color: C.muted }}>Don't be discouraged — 68% of selected candidates needed 2+ attempts. Here's your improvement plan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[['Weak Areas', ['Java Internals', 'System Design Scale-Out', 'DBMS Normalization'],'text-red-400'], ['Recommended Practice', ['Solve 10 DP problems/week', 'Mock HR with STAR', 'Build 1 system design daily'],'text-amber-400'], ['Retry Estimate', ['2–3 weeks of focused prep', '90%+ readiness target', 'Next hiring cycle in 3 months'],'text-blue-400']].map(([title, items, col]) => (
                        <div key={title} className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: C.card, borderColor: C.border }}>
                          <h4 className={`text-xs font-black uppercase tracking-widest ${col}`}>{title}</h4>
                          {items.map(i => <div key={i} className="text-xs flex items-start gap-2" style={{ color: C.muted }}><span className="mt-0.5">→</span>{i}</div>)}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setPipelineStep(2); setOaDone(false); setOaTimer(90*60); setMessages([]); setTechStep(-1); setHrStep(-1); setFinalResult(null); setActiveTab('oa'); }} className="px-8 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2" style={{ backgroundColor: C.accent }}>
                      <FaRedo/> Retry Simulation
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: FINAL REPORT
            ══════════════════════════════════════════════════ */}
            {activeTab === 'report' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-end flex-wrap gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-white">Final Performance Report</h2>
                    <p className="text-sm mt-1" style={{ color: C.muted }}>Cognizant GenC Next — Simulation Cycle 2026</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={downloadPDF} className="px-6 py-3 rounded-xl font-black text-sm text-white flex items-center gap-2 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: C.accent, boxShadow: `0 0 20px ${C.accentGlow}` }}>
                      <FaFilePdf/> Download PDF
                    </button>
                    <button onClick={() => toast.success('Report link copied!')} className="px-6 py-3 rounded-xl font-black text-sm border flex items-center gap-2 hover:bg-white/5 transition-all" style={{ borderColor: C.border, color: C.text }}>
                      <FaShare/> Share
                    </button>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { l: 'Assessment', v: '94%', c: '#818CF8' }, { l: 'Coding', v: '98%', c: '#34D399' },
                    { l: 'Technical', v: '92%', c: '#60A5FA' }, { l: 'Communication', v: '96%', c: '#F472B6' },
                    { l: 'Problem Solving', v: '93%', c: C.amber }, { l: 'Professionalism', v: '97%', c: '#A78BFA' },
                    { l: 'Leadership', v: '90%', c: '#FB923C' }, { l: 'Overall', v: '95%', c: C.accent },
                  ].map(s => (
                    <div key={s.l} className="rounded-2xl border p-4 flex flex-col items-center justify-center text-center space-y-1" style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <div className="text-2xl font-black" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Section-wise */}
                  <div className="lg:col-span-2 rounded-2xl border p-8 space-y-8" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <h3 className="font-black text-white text-lg">Section-wise Analysis</h3>
                    {OA_SECTIONS.map(s => (
                      <div key={s.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><s.icon className="text-xs" style={{ color: s.color }}/><span className="text-sm font-bold text-white">{s.name}</span></div>
                          <Pill color={s.color}>{s.id === 'coding' ? `${s.analytics.passed}/${s.analytics.hidden} passed` : `${s.analytics.accuracy}%`}</Pill>
                        </div>
                        <ProgressBar label="" value={s.id === 'coding' ? 100 : s.analytics.accuracy} color={s.color}/>
                      </div>
                    ))}

                    <div className="pt-4 border-t" style={{ borderColor: C.border }}>
                      <h4 className="font-black text-emerald-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><FaThumbsUp/> Strengths</h4>
                      <ul className="space-y-3">
                        {['Exceptional analytical reasoning with 94% accuracy across cognitive sections.', 'Optimal O(N) coding solution with 100% test case pass rate.', 'Highly structured STAR-formatted HR responses demonstrating strong communication.'].map(s => (
                          <li key={s} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}><span className="text-emerald-400 font-black mt-0.5">✓</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-black text-amber-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><FaThumbsDown/> Weak Areas</h4>
                      <ul className="space-y-3">
                        {['Java JVM internals — Garbage Collection algorithms could be explained in more depth.', 'System Design — Horizontal scaling strategies and CAP theorem applications need practice.'].map(s => (
                          <li key={s} className="flex items-start gap-3 text-sm" style={{ color: C.muted }}><span className="text-amber-400 font-black mt-0.5">!</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Hire Probability + Study Plan */}
                  <div className="space-y-5">
                    <div className="rounded-2xl border p-8 text-center space-y-4 relative overflow-hidden" style={{ backgroundColor: C.card, borderColor: `${C.accent}40`, boxShadow: `0 0 30px ${C.accentGlow}` }}>
                      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                      <div className="relative z-10">
                        <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.muted }}>Hiring Probability</div>
                        <div className="text-6xl font-black" style={{ color: '#34D399' }}>94%</div>
                        <div className="text-sm font-black text-white mt-2">Very High</div>
                        <div className="text-xs mt-1" style={{ color: C.muted }}>GenC Next Track</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><FaGraduationCap style={{ color: C.accent }}/> Personalized Study Plan</h4>
                      {[
                        { d: 'Week 1', t: 'Java Internals & JVM', c: '#818CF8' },
                        { d: 'Week 2', t: 'System Design Fundamentals', c: '#60A5FA' },
                        { d: 'Week 3', t: 'Advanced SQL & DB Design', c: '#34D399' },
                        { d: 'Week 4', t: 'Mock Interviews (Tech + HR)', c: C.amber },
                      ].map(p => (
                        <div key={p.d} className="flex items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: C.card2, borderColor: C.border }}>
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.c }}></div>
                          <div>
                            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: C.muted }}>{p.d}</div>
                            <div className="text-xs font-bold text-white mt-0.5">{p.t}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: C.card, borderColor: C.border }}>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><FaLightbulb style={{ color: C.amber }}/> Interview Tips</h4>
                      {['Lead answers with concrete metrics (e.g. "reduced latency by 40%")', 'Use the STAR method consistently in all behavioral answers', 'Ask 2–3 thoughtful questions about the team at the end'].map(tip => (
                        <div key={tip} className="flex items-start gap-2 text-xs" style={{ color: C.muted }}>
                          <span className="text-amber-400 mt-0.5 font-bold">→</span>{tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: BADGES
            ══════════════════════════════════════════════════ */}
            {activeTab === 'badges' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">Badges & Achievements</h2>
                  <p className="text-sm" style={{ color: C.muted }}>{ALL_BADGES.filter(b => b.earned).length} of {ALL_BADGES.length} badges earned</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {ALL_BADGES.map(b => (
                    <motion.div key={b.id} whileHover={{ y: -4 }} className="rounded-2xl border p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
                      style={{ backgroundColor: C.card, borderColor: b.earned ? `${b.color}40` : C.border, opacity: b.earned ? 1 : 0.5 }}>
                      <div className="absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full opacity-20" style={{ backgroundColor: b.color }}></div>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 relative z-10" style={{ backgroundColor: `${b.color}15`, borderColor: b.earned ? b.color : C.border }}>
                        <b.icon className="text-2xl" style={{ color: b.earned ? b.color : C.muted }}/>
                        {b.earned && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><FaCheck className="text-[8px] text-white"/></div>}
                      </div>
                      <div className="relative z-10">
                        <div className="font-black text-sm" style={{ color: b.earned ? 'white' : C.muted }}>{b.name}</div>
                        <div className="text-[10px] mt-1 leading-relaxed" style={{ color: C.muted }}>{b.desc}</div>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden relative z-10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div className="h-full rounded-full" style={{ backgroundColor: b.color, width: b.earned ? '100%' : '30%' }}></div>
                      </div>
                      <Pill color={b.earned ? '#34D399' : C.muted}>{b.earned ? 'Earned' : 'Locked'}</Pill>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                TAB: HISTORY
            ══════════════════════════════════════════════════ */}
            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <h2 className="text-2xl font-black text-white">Performance History</h2>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  <StatCard label="Total Attempts" value="3" icon={FaHistory} color={C.accent}/>
                  <StatCard label="Highest Score" value="95%" icon={FaStar} color="#34D399"/>
                  <StatCard label="Average Score" value="82%" icon={FaChartLine} color={C.amber}/>
                  <StatCard label="Coding Growth" value="+26%" icon={FaBolt} color="#818CF8"/>
                </div>

                {/* History Table */}
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: C.card, borderColor: C.border }}>
                  <div className="p-6 border-b" style={{ borderColor: C.border }}>
                    <h3 className="font-black text-white">Attempt History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-[10px] font-black uppercase tracking-widest" style={{ borderColor: C.border, color: C.muted }}>
                          {['Date', 'Track', 'OA Score', 'Coding', 'Technical', 'HR', 'Overall', 'Hire %', 'Result'].map(h => (
                            <th key={h} className="px-5 py-4 text-left">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {HISTORY_DATA.map((row, i) => (
                          <tr key={i} className="border-b transition-colors hover:bg-white/5" style={{ borderColor: C.border }}>
                            <td className="px-5 py-4 text-white font-bold">{row.date}</td>
                            <td className="px-5 py-4" style={{ color: C.muted }}>{row.track}</td>
                            <td className="px-5 py-4 font-bold text-indigo-400">{row.oa}</td>
                            <td className="px-5 py-4 font-bold text-emerald-400">{row.coding}</td>
                            <td className="px-5 py-4 font-bold text-blue-400">{row.tech}</td>
                            <td className="px-5 py-4 font-bold text-pink-400">{row.hr}</td>
                            <td className="px-5 py-4 font-black text-white">{row.overall}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                  <div className="h-full rounded-full" style={{ backgroundColor: row.hire > 80 ? '#34D399' : row.hire > 50 ? C.amber : C.red, width: `${row.hire}%` }}></div>
                                </div>
                                <span className="text-xs font-bold" style={{ color: row.hire > 80 ? '#34D399' : row.hire > 50 ? C.amber : C.red }}>{row.hire}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-3 py-1 rounded-full text-[10px] font-black border"
                                style={row.status === 'Selected' ? { backgroundColor: '#10B98115', color: '#34D399', borderColor: '#10B98130' } : row.status === 'Borderline' ? { backgroundColor: '#F59E0B15', color: C.amber, borderColor: '#F59E0B30' } : { backgroundColor: '#EF444415', color: '#EF4444', borderColor: '#EF444430' }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Improvement Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <h3 className="font-black text-white">Coding Improvement</h3>
                    {HISTORY_DATA.map((h, i) => (
                      <div key={h.date} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold"><span style={{ color: C.muted }}>Attempt {i+1} — {h.date}</span><span className="text-emerald-400">{h.coding}</span></div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: h.coding }} transition={{ duration: 1, delay: i * 0.2 }} className="h-full rounded-full" style={{ backgroundColor: '#34D399' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border p-8 space-y-5" style={{ backgroundColor: C.card, borderColor: C.border }}>
                    <h3 className="font-black text-white">Interview Improvement</h3>
                    {HISTORY_DATA.map((h, i) => (
                      <div key={h.date} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold"><span style={{ color: C.muted }}>Attempt {i+1} — {h.date}</span><span className="text-blue-400">{h.tech}</span></div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: h.tech }} transition={{ duration: 1, delay: i * 0.2 }} className="h-full rounded-full" style={{ backgroundColor: C.accent }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );


export default CognizantPrepDetail;
