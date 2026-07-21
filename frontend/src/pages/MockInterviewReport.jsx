import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FaBookmark, FaPrint, FaShareAlt, FaRobot, FaPaperPlane, FaTimes, FaArrowLeft, FaAward, FaExclamationTriangle, FaCheckCircle, FaBookOpen, FaUserTie, FaRegClock, FaChartBar, FaBrain, FaComments, FaCode, FaChartLine, FaExclamationCircle } from 'react-icons/fa';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const MockInterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'mentor', content: 'Hi! I am your AI Career Coach. Ask me anything about your Mock Interview report, strengths, or weaknesses!' }
  ]);
  const [mentorLoading, setMentorLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.post(`/interviews/${id}/mock-report`);
        setReport(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report or it is currently being generated. Please try again.');
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

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
      
      const { data } = await api.post(`/reports/${id}/mentor`, { message: userMsg, history });
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
          <h2 className="text-2xl font-semibold text-white animate-pulse">Evaluating Evidence & Compiling Report...</h2>
          <p className="text-slate-400 mt-2">Analyzing transcript, tracking filler words, and scoring answers.</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center p-6">
        <div className="glass-card p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-800">
          <FaExclamationTriangle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-8">{error || "Report not found"}</p>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-indigo-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-indigo-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 1. Radar Chart Data
  const radarData = report.scoringBreakdown?.map(item => ({
    subject: item.category,
    A: typeof item.score === 'number' ? item.score : 0,
    fullMark: 100
  })) || [];

  // 2. Timeline Progression Chart
  const timelineData = report.questionAnalysis?.map((q, idx) => ({
    name: `Q${idx + 1}`,
    score: typeof q.score === 'number' ? q.score : 0,
  })) || [];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden relative">
      <div className="print-hidden">
        <Sidebar />
      </div>
      
      <div className="flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <div className="print-hidden">
          <Navbar subtitle={`Mock Interview Evidence Report`} />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar print:p-0">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header / Top Verdict Bar */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900/40 rounded-3xl p-6 md:p-8 border border-slate-800 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="z-10 flex-1">
                <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                  <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors print-hidden">
                    <FaArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Evidence-Based Report</h1>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide border ${
                    report.finalDecision === 'Interview Ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    report.finalDecision === 'Nearly Ready' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {report.finalDecision || 'Not Evaluated'}
                  </span>
                </div>
                <p className="text-slate-400 ml-10 flex items-center gap-2">
                  <FaChartBar className="text-indigo-400" /> All metrics are generated strictly from transcript evidence.
                </p>
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
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Score</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-black text-indigo-400">{report.overallScore || 0}</span>
                      <span className="text-sm text-slate-600 ml-0.5">/100</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${report.overallScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : report.overallScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                    <FaAward className="text-xl" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.scoringBreakdown?.map((item, idx) => (
                <div key={idx} className="bg-slate-900/40 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.category}</span>
                    <div className="text-3xl font-black text-white mt-1">
                      {typeof item.score === 'number' ? `${item.score}%` : <span className="text-lg text-slate-400">N/A</span>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <span className="font-bold text-indigo-400 block mb-1">Evidence:</span>
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>

            {/* Visual Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Radar Chart Component */}
              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 backdrop-blur-xl lg:col-span-1 flex flex-col">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <FaChartLine className="text-indigo-500" /> Skill Matrix
                </h2>
                <div className="flex-1 w-full flex justify-center min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar name="Score" dataKey="A" stroke="#818cf8" strokeWidth={2} fill="#6366f1" fillOpacity={0.25} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 backdrop-blur-xl lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500" /> Evidence Strengths
                  </h2>
                  <ul className="space-y-3">
                    {report.strengths?.map((s, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                    {(!report.strengths || report.strengths.length === 0) && (
                      <p className="text-slate-500 text-sm italic">Insufficient data to evaluate strengths.</p>
                    )}
                  </ul>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FaExclamationCircle className="text-amber-500" /> Improvement Areas
                  </h2>
                  <ul className="space-y-3">
                    {report.weaknesses?.map((w, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{w}</span>
                      </li>
                    ))}
                    {(!report.weaknesses || report.weaknesses.length === 0) && (
                      <p className="text-slate-500 text-sm italic">Insufficient data to evaluate weaknesses.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Voice & Communication Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaComments className="text-blue-500" /> Voice Analysis
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Speaking Speed</span>
                    <span className="text-sm font-bold text-white">{report.voiceAnalysis?.speakingSpeed || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Clarity</span>
                    <span className="text-sm font-bold text-white">{report.voiceAnalysis?.clarity || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Tone Stability</span>
                    <span className="text-sm font-bold text-white">{report.voiceAnalysis?.toneStability || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Professionalism</span>
                    <span className="text-sm font-bold text-white">{report.voiceAnalysis?.professionalism || 'Not Evaluated'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-pink-500 font-bold text-xl">"Um"</span> Filler Words
                </h2>
                <div className="text-center mb-4">
                  <span className="text-4xl font-black text-pink-500">{report.fillerWordAnalysis?.count ?? 'N/A'}</span>
                  <span className="text-sm text-slate-400 block mt-1">Total occurrences detected</span>
                </div>
                {report.fillerWordAnalysis?.examples?.length > 0 && (
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Examples found</span>
                    <p className="text-xs text-slate-300 italic">{report.fillerWordAnalysis.examples.join(', ')}</p>
                  </div>
                )}
                {report.fillerWordAnalysis?.suggestions?.length > 0 && (
                  <div className="bg-indigo-950/20 p-3 rounded-xl border border-indigo-500/20">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase block mb-1">Suggestion</span>
                    <p className="text-xs text-indigo-200">{report.fillerWordAnalysis.suggestions[0]}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FaUserTie className="text-purple-500" /> Body Language
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Eye Contact</span>
                    <span className="text-sm font-bold text-white">{report.bodyLanguageAnalysis?.eyeContact || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Confidence</span>
                    <span className="text-sm font-bold text-white">{report.bodyLanguageAnalysis?.confidence || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                    <span className="text-sm text-slate-400">Posture</span>
                    <span className="text-sm font-bold text-white">{report.bodyLanguageAnalysis?.posture || 'Not Evaluated'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Head Movement</span>
                    <span className="text-sm font-bold text-white">{report.bodyLanguageAnalysis?.headMovement || 'Not Evaluated'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Personalized Improvement Roadmap */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaChartLine className="text-emerald-500" /> Personalized Roadmap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.improvementRoadmap?.map((step, idx) => (
                  <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black">{idx + 1}</div>
                    <div className="flex gap-3 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium">{step}</p>
                    </div>
                  </div>
                ))}
                {(!report.improvementRoadmap || report.improvementRoadmap.length === 0) && (
                  <p className="text-slate-500 col-span-3">No specific roadmap generated from evidence.</p>
                )}
              </div>
            </div>

            {/* Question by Question Timeline */}
            <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6 md:p-8 backdrop-blur-xl mb-12">
              <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaBookOpen className="text-indigo-500" /> Question Analysis
                </h2>
              </div>
              
              <div className="space-y-6">
                {report.questionAnalysis?.map((q, idx) => (
                  <div key={idx} className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/80 transition-all hover:border-indigo-500/30">
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-1">
                        <span className="text-indigo-400 font-black">Q{idx + 1}.</span> {q.question}
                      </h3>
                      <div className="flex items-center gap-3">
                        {q.difficulty !== 'Not Evaluated' && (
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                            {q.difficulty}
                          </span>
                        )}
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                          typeof q.score === 'number' && q.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          typeof q.score === 'number' && q.score >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          typeof q.score === 'number' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {typeof q.score === 'number' ? `${q.score}% Score` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Answer Summary</span>
                      <p className="text-slate-300 text-xs leading-relaxed">{q.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-950/10 border border-emerald-500/15 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-1">Key Strength</span>
                        <p className="text-emerald-200/80 text-xs leading-relaxed">{q.strength}</p>
                      </div>
                      <div className="p-4 bg-amber-950/10 border border-amber-500/15 rounded-xl">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-1">Missing Evidence / Weakness</span>
                        <p className="text-amber-200/80 text-xs leading-relaxed">{q.weakness}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end text-xs text-slate-500 font-medium">
                      <FaRegClock className="mr-1.5" /> Time taken: {q.time}
                    </div>
                  </div>
                ))}
                {(!report.questionAnalysis || report.questionAnalysis.length === 0) && (
                  <p className="text-center text-slate-500 py-8">No transcript data available for analysis.</p>
                )}
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
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-2">
                  <FaRobot className="text-indigo-400 text-lg" />
                  <span className="text-sm font-bold text-white">InterviewX AI Mentor</span>
                </div>
                <button onClick={() => setMentorOpen(false)} className="text-slate-400 hover:text-white">
                  <FaTimes />
                </button>
              </div>

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
              </div>

              <form onSubmit={handleMentorSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={e => setMentorInput(e.target.value)}
                  placeholder="Ask me how to improve..."
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
          .bg-slate-950, .bg-slate-900\\/40, .bg-slate-950\\/50, .bg-slate-950\\/30, .bg-slate-900, .bg-slate-950\\/50 {
            background-color: white !important;
            border-color: #cbd5e1 !important;
          }
          .text-white, .text-slate-300, .text-slate-400 {
            color: black !important;
          }
          .border-slate-800, .border-slate-800\\/60, .border-slate-800\\/50, .border-slate-800\\/80 {
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MockInterviewReport;
