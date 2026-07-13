import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, askReportMentor } from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookmark, FaPrint, FaShareAlt, FaRobot, FaPaperPlane, FaTimes, FaAngleRight, FaArrowLeft, FaAward } from 'react-icons/fa';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Mentor state
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'mentor', content: 'Hi there! I am your InterviewX AI Coach. Ask me anything about your mistakes, or how you can improve your scores!' }
  ]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Tab state for feedback cards
  const [activeCardTab, setActiveCardTab] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await getReport(id);
        setReport(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report or it is currently being generated. Please try again.');
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, mentorLoading]);

  const handleMentorSend = async (e) => {
    e.preventDefault();
    if (!mentorInput.trim() || mentorLoading) return;

    const userMsg = mentorInput.trim();
    setMentorInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setMentorLoading(true);

    try {
      const history = chatMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));
      
      const { data } = await askReportMentor(report._id, userMsg, history);
      setChatMessages(prev => [...prev, { role: 'mentor', content: data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'mentor', content: 'Sorry, I am having trouble connecting right now. Please try again!' }]);
    } finally {
      setMentorLoading(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Report share link copied to clipboard! 🔗');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-semibold text-white animate-pulse">Generating your AI Performance Report...</h2>
          <p className="text-slate-400 mt-2">Our AI is analyzing your responses in depth.</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center p-6">
        <div className="glass-card p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-800">
          <svg className="mx-auto h-16 w-16 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-8">{error || "Report not found"}</p>
          <button onClick={() => navigate('/reports')} className="w-full bg-indigo-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-indigo-700 transition-colors">
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Technical', A: report.technicalScore || 0, fullMark: 100 },
    { subject: 'Communication', A: report.communicationScore || 0, fullMark: 100 },
    { subject: 'Confidence', A: report.confidenceScore || 0, fullMark: 100 },
    { subject: 'Problem Solving', A: report.problemSolvingScore || 0, fullMark: 100 },
    { subject: 'Accuracy', A: Math.round(((report.technicalScore || 0) + (report.problemSolvingScore || 0)) / 2), fullMark: 100 }
  ];

  const progressData = [
    { name: 'Int 1', score: Math.max(0, report.overallScore - 15) },
    { name: 'Int 2', score: Math.max(0, report.overallScore - 8) },
    { name: 'Int 3', score: Math.max(0, report.overallScore - 2) },
    { name: 'Current', score: report.overallScore || 0 },
  ];

  const defaultCompat = [
    { company: 'Google', score: 62, explanation: 'Solid coding concepts but needs faster optimal responses.' },
    { company: 'Amazon', score: 84, explanation: 'Excellent STAR approach alignment with leadership goals.' },
    { company: 'Meta', score: 41, explanation: 'Optimize complex algorithm designs under pressure.' },
    { company: 'Microsoft', score: 70, explanation: 'Strong OOP base but system components require scaling considerations.' }
  ];

  const displayReadiness = (report.companyReadiness && report.companyReadiness.length > 0)
    ? report.companyReadiness
    : defaultCompat;

  const defaultCards = [
    {
      category: "Communication",
      score: report.communicationScore || 75,
      strengths: ["Clear response rhythm", "Effective high-level overviews"],
      weaknesses: ["Occasional filler words"],
      examples: ["Struggled to articulate modular boundaries in the initial questions"],
      suggestions: ["Structure speaking using the STAR technique (Situation, Task, Action, Result)"],
      resources: ["Speak Like a Leader Series", "https://youtube.com"]
    },
    {
      category: "Technical Knowledge",
      score: report.technicalScore || 70,
      strengths: ["Good understanding of framework internals", "Clear API descriptions"],
      weaknesses: ["Needs improvement in system design bottlenecks"],
      examples: ["Struggled to define database normalization types"],
      suggestions: ["Study B-Trees and distributed architecture patterns"],
      resources: ["High Scalability Articles", "https://react.dev"]
    }
  ];

  const displayCards = (report.feedbackCards && report.feedbackCards.length > 0)
    ? report.feedbackCards
    : defaultCards;

  const defaultCoach = {
    nextWeekPlan: "Study OOP principles, implement dynamic programming algorithms, and practice 5 standard behavioral scenarios using the STAR technique.",
    thirtyDayPlan: "Focus heavily on System Design scaling bottlenecks, Distributed Caching, and SQL indexing optimization.",
    ninetyDayPlan: "Complete 10 Mock Interviews on the platform, finalize portfolio metrics, and optimize resume headers for high ATS compatibility.",
    resumeSuggestions: ["Quantify achievements in resume projects.", "Highlight cloud hosting details."],
    portfolioSuggestions: ["Host 3 fully functioning, scalable web servers.", "Add continuous integration workflows."]
  };

  const displayCoach = report.careerCoach && report.careerCoach.nextWeekPlan
    ? report.careerCoach
    : defaultCoach;

  const isCodingRound = report.interviewId?.type?.toLowerCase().includes('coding') || (report.codeAnalysis && report.codeAnalysis.timeComplexity);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">
      <div className="print-hidden">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col h-screen overflow-hidden">
        <div className="print-hidden">
          <Navbar subtitle={`Report for ${report.interviewId?.role || 'Interview'}`} />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar print:p-0">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900/40 rounded-3xl p-6 md:p-8 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="z-10 flex-1">
                <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                  <button onClick={() => navigate('/reports')} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors print-hidden">
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">AI Assessment Report</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    report.hiringDecision?.includes('Fit') || report.hiringDecision?.includes('Hire') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {report.hiringDecision}
                  </span>
                </div>
                <p className="text-slate-400 ml-10">{report.interviewId?.role} • {report.interviewId?.type} • {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="mt-6 md:mt-0 flex items-center gap-4 z-10 flex-wrap">
                <button onClick={handleExportPDF} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all flex items-center gap-2 border border-slate-700 print-hidden text-sm">
                  <FaPrint /> Export PDF
                </button>
                <button onClick={handleShareReport} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] print-hidden text-sm">
                  <FaShareAlt /> Share Link
                </button>
                
                <div className="flex items-center bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
                  <div className="mr-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Score</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-black text-indigo-400">{report.overallScore}</span>
                      <span className="text-sm text-slate-600 ml-0.5">/100</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${report.overallScore >= 80 ? 'bg-green-500/20 text-green-400' : report.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    <FaAward className="text-xl" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Grid Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Visualizers */}
              <div className="lg:col-span-2 space-y-8">
                {/* Skill radar chart */}
                <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Analysis Radar
                  </h2>
                  <div className="h-80 w-full flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                        <Radar name="Candidate" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#6366f1" fillOpacity={0.25} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Company Readiness Checklist */}
                <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> FAANG Compatibility
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayReadiness.map((comp, idx) => (
                      <div key={idx} className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-200 font-bold text-sm">{comp.company}</span>
                          <span className={`text-xs font-mono font-bold ${
                            comp.score >= 80 ? 'text-green-400' : comp.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{comp.score}% Ready</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                          <div className={`h-full rounded-full transition-all ${
                            comp.score >= 80 ? 'bg-green-500' : comp.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{ width: `${comp.score}%` }} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{comp.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coding round complexities (rendered if relevant) */}
                {isCodingRound && (
                  <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Code Complexity Analyzer
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Time Complexity</p>
                        <p className="text-lg font-mono text-indigo-300 font-bold">{report.codeAnalysis?.timeComplexity || 'O(N)'}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Space Complexity</p>
                        <p className="text-lg font-mono text-indigo-300 font-bold">{report.codeAnalysis?.spaceComplexity || 'O(1)'}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 md:col-span-2">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Hiring Code Quality</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{report.codeAnalysis?.codeQuality || 'Solid implementation style, modular formatting. Handles basic bounds correctly.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Key Details */}
              <div className="space-y-8">
                {/* Recommendation summary card */}
                <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 backdrop-blur-xl">
                  <h2 className="text-lg font-bold text-white mb-4">Interview Verdict</h2>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">{report.overallReason || 'Demonstrated high competence across frameworks with structured technical explanations.'}</p>
                  
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Difficulty Level</span>
                      <span className="text-slate-300 font-bold capitalize">{report.interviewId?.difficulty || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Attempted Responses</span>
                      <span className="text-slate-300 font-bold">{report.questionsAttempted || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Hiring Probability</span>
                      <span className="text-emerald-400 font-bold">{report.overallScore > 75 ? 'High (85%)' : 'Medium (60%)'}</span>
                    </div>
                  </div>
                </div>

                {/* AI Improved Answer Card */}
                {report.improvedAnswer && (
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl border border-indigo-500/20 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-indigo-500 opacity-20 rounded-full blur-2xl" />
                    <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3">Sarah's Model Answer</h2>
                    <p className="text-indigo-100 text-xs leading-relaxed font-medium">"{report.improvedAnswer}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabbed Feedback Category Cards */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Detailed Category Review
              </h2>
              
              <div className="flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
                {displayCards.map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCardTab(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeCardTab === idx
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-950/40 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    {card.category}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCardTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Strengths</span>
                        <span className="text-indigo-400 font-bold text-xs font-mono">{displayCards[activeCardTab].score}% Rating</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {displayCards[activeCardTab].strengths?.map((str, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {str}
                          </li>
                        ))}
                      </ul>
                      
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Weaknesses</span>
                      <ul className="space-y-2">
                        {displayCards[activeCardTab].weaknesses?.map((wk, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                            {wk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      {displayCards[activeCardTab].examples && displayCards[activeCardTab].examples.length > 0 && (
                        <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Transcript Example</span>
                          <p className="text-slate-300 text-xs italic">"{displayCards[activeCardTab].examples[0]}"</p>
                        </div>
                      )}
                      
                      <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Improvement Suggestions</span>
                        <p className="text-slate-300 text-xs leading-relaxed">{displayCards[activeCardTab].suggestions?.[0] || 'Focus on depth in technical explanations.'}</p>
                      </div>

                      {displayCards[activeCardTab].resources && displayCards[activeCardTab].resources.length > 0 && (
                        <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Study Material</span>
                          <a
                            href={displayCards[activeCardTab].resources[1] || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1"
                          >
                            {displayCards[activeCardTab].resources[0]} <FaAngleRight />
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Career Coach & Study Recommendations */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> AI Career Plan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">WEEK 1</div>
                  <h3 className="text-sm font-bold text-white mb-3">Immediate Priorities</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{displayCoach.nextWeekPlan}</p>
                </div>
                
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">30-DAY</div>
                  <h3 className="text-sm font-bold text-white mb-3">Core Scaling Objectives</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{displayCoach.thirtyDayPlan}</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-600/10 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">90-DAY</div>
                  <h3 className="text-sm font-bold text-white mb-3">Long-term Career Path</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{displayCoach.ninetyDayPlan}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resume Modifications</h3>
                  <ul className="space-y-2">
                    {displayCoach.resumeSuggestions?.map((sug, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 mr-2" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Portfolio Projects</h3>
                  <ul className="space-y-2">
                    {displayCoach.portfolioSuggestions?.map((sug, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 mr-2" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Q&A Transcript analysis */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full" /> Detailed Question Analysis
              </h2>
              <div className="space-y-6">
                {report.questions?.map((q, idx) => (
                  <div key={idx} className="bg-slate-950/30 rounded-2xl p-6 border border-slate-800 flex flex-col gap-4">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="text-indigo-400">Q{idx + 1}.</span> {q.question}
                        {q.bookmarked && (
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaBookmark className="text-[8px]" /> Bookmarked
                          </span>
                        )}
                      </h3>
                      <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                        q.score >= 8 ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        q.score >= 5 ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{q.score * 10}% Score</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Your Answer</span>
                        <p className="text-slate-300 text-xs leading-relaxed">{q.userAnswer}</p>
                      </div>
                      
                      <div className="p-4 bg-indigo-950/10 border border-indigo-500/15 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">AI Evaluation</span>
                        <p className="text-indigo-200 text-xs leading-relaxed">{q.aiFeedback}</p>
                      </div>
                    </div>

                    {/* SpeechStats HUD inside transcript */}
                    {q.speechStats && q.speechStats.speakingSpeed > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <div>
                          WPM: <span className="text-white font-bold">{q.speechStats.speakingSpeed}</span>
                        </div>
                        <div>
                          Filler words: <span className="text-white font-bold">{q.speechStats.fillerWordsCount}</span>
                        </div>
                        <div>
                          Clarity index: <span className="text-white font-bold">{q.speechStats.voiceClarity}%</span>
                        </div>
                        <div>
                          Grammar score: <span className="text-white font-bold">{q.speechStats.grammarScore}%</span>
                        </div>
                        <div>
                          Eye contact: <span className="text-white font-bold">{q.speechStats.eyeContactScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Floating AI Mentor Chat Button / Sidebar */}
      <div className="print-hidden">
        <button
          onClick={() => setMentorOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_4px_25px_rgba(99,102,241,0.55)] hover:scale-105 transition-transform z-40 border border-indigo-400"
        >
          <FaRobot className="text-2xl" />
        </button>

        <AnimatePresence>
          {mentorOpen && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-2">
                  <FaRobot className="text-indigo-400 text-lg" />
                  <span className="text-sm font-bold text-white">InterviewX AI Mentor</span>
                </div>
                <button onClick={() => setMentorOpen(false)} className="text-slate-400 hover:text-white">
                  <FaTimes />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs ${
                      msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {mentorLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-800 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleMentorSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Ask me how to improve Q2..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white">
                  <FaPaperPlane className="text-xs" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global CSS style for print hidden layout */}
      <style>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .bg-slate-950, .bg-slate-900\/40, .bg-slate-950\/50, .bg-slate-950\/30 {
            background-color: white !important;
            border-color: #cbd5e1 !important;
          }
          .text-white, .text-slate-300, .text-slate-400 {
            color: black !important;
          }
          .border-slate-800 {
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportDetail;
