import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    { subject: 'Technical', A: report.technicalScore, fullMark: 100 },
    { subject: 'Communication', A: report.communicationScore, fullMark: 100 },
    { subject: 'Confidence', A: report.confidenceScore, fullMark: 100 },
    { subject: 'Problem Solving', A: Math.round((report.technicalScore + report.confidenceScore) / 2), fullMark: 100 },
    { subject: 'Answer Quality', A: Math.round((report.technicalScore + report.communicationScore) / 2), fullMark: 100 },
  ];

  // Dummy progress data for the line chart (in a real app, you'd fetch history)
  const progressData = [
    { name: 'Int 1', score: Math.max(0, report.overallScore - 15) },
    { name: 'Int 2', score: Math.max(0, report.overallScore - 8) },
    { name: 'Int 3', score: Math.max(0, report.overallScore - 2) },
    { name: 'Current', score: report.overallScore },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Navbar subtitle={`Report for ${report.interviewId?.role || 'Interview'}`} />
        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Section */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between glass-card rounded-3xl p-8 shadow-sm border border-slate-800">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <button onClick={() => navigate('/reports')} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </button>
                  <h1 className="text-4xl font-extrabold text-white tracking-tight">Performance Report</h1>
                </div>
                <p className="text-slate-400 text-lg ml-14">{report.interviewId?.role || 'Interview'} • {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="mt-6 md:mt-0 ml-14 md:ml-0 flex items-center bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
                <div className="mr-6">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Overall Score</p>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-indigo-400">{report.overallScore}</span>
                    <span className="text-xl text-slate-500 ml-1 font-semibold">/100</span>
                  </div>
                </div>
                <div className={`h-16 w-16 rounded-full flex items-center justify-center ${report.overallScore >= 80 ? 'bg-green-500/20 text-green-400' : report.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {report.overallScore >= 80 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /> : report.overallScore >= 60 ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />}
                  </svg>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Charts Section */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-8">
                
                <div className="glass-card rounded-3xl shadow-sm border border-slate-800 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Skill Breakdown</h2>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                        <Radar name="Score" dataKey="A" stroke="#818cf8" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4 mt-8 pt-8 border-t border-slate-800">
                    <h3 className="text-base font-bold text-slate-300 mb-2">Score Explanations & Transparency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Technical Score</p>
                          <p className="text-3xl font-black text-white mb-2">{report.technicalScore || 0}%</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{report.technicalReason || 'Graded based on response accuracy.'}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Communication Score</p>
                          <p className="text-3xl font-black text-white mb-2">{report.communicationScore || 0}%</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{report.communicationReason || 'Graded on structural clarity.'}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence Score</p>
                          <p className="text-3xl font-black text-white mb-2">{report.confidenceScore || 0}%</p>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{report.confidenceReason || 'Graded on speaking cues.'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-3xl shadow-sm border border-slate-800 p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Progress Trend</h2>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 14 }} dy={10} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#f8fafc' }} />
                        <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={4} dot={{ r: 6, fill: '#818cf8', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
              </motion.div>

              {/* AI Feedback Section */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
                
                <div className="glass-card rounded-3xl shadow-sm border border-slate-800 overflow-hidden">
                  <div className="bg-green-500/20 border-b border-green-500/20 p-6">
                    <h2 className="text-xl font-bold text-green-400 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Strengths
                    </h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {report.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mt-0.5 mr-3">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </span>
                          <span className="text-slate-300 leading-relaxed">{strength}</span>
                        </li>
                      ))}
                      {(!report.strengths || report.strengths.length === 0) && <li className="text-slate-500 italic">No specific strengths recorded.</li>}
                    </ul>
                  </div>
                </div>

                <div className="glass-card rounded-3xl shadow-sm border border-slate-800 overflow-hidden">
                  <div className="bg-red-500/20 border-b border-red-500/20 p-6">
                    <h2 className="text-xl font-bold text-red-400 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Areas to Improve
                    </h2>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-4">
                      {report.weakness?.map((weak, index) => (
                        <li key={index} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mt-0.5 mr-3">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </span>
                          <span className="text-slate-300 leading-relaxed">{weak}</span>
                        </li>
                      ))}
                      {(!report.weakness || report.weakness.length === 0) && <li className="text-slate-500 italic">No specific weaknesses recorded.</li>}
                    </ul>
                  </div>
                </div>

                {report.improvedAnswer && (
                  <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl shadow-lg p-8 relative overflow-hidden border border-indigo-500/20">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center relative z-10">
                      <svg className="w-6 h-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      AI Improved Answer Example
                    </h2>
                    <div className="bg-slate-950/50 rounded-xl p-5 relative z-10 border border-indigo-500/20">
                      <p className="text-indigo-100 leading-relaxed font-medium">"{report.improvedAnswer}"</p>
                    </div>
                  </div>
                )}

                <div className="glass-card rounded-3xl shadow-sm border border-slate-800 p-8">
                  <h2 className="text-xl font-bold text-white mb-6">Interview Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Hiring Decision</span>
                      <span className={`font-extrabold uppercase px-3 py-1 rounded-lg text-xs ${
                        report.hiringDecision?.includes('Hire') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{report.hiringDecision || 'Not Selected'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Questions Asked</span>
                      <span className="text-white font-bold bg-slate-800 px-3 py-1 rounded-full">{report.questionsAsked || report.interviewId?.questions?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Attempted Responses</span>
                      <span className="text-white font-bold bg-slate-800 px-3 py-1 rounded-full">{report.questionsAttempted || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Skipped Questions</span>
                      <span className="text-white font-bold bg-slate-800 px-3 py-1 rounded-full">{report.questionsSkipped || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Correct Responses</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full">{report.correctResponses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Incorrect Responses</span>
                      <span className="text-red-400 font-bold bg-red-500/10 px-3 py-1 rounded-full">{report.incorrectResponses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-slate-400 font-medium">Interview Type</span>
                      <span className="text-white font-bold capitalize">{report.interviewId?.type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-slate-400 font-medium">Difficulty</span>
                      <span className="text-white font-bold capitalize">{report.interviewId?.difficulty || 'N/A'}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Detailed Q&A Breakdown */}
            {(() => {
              const detailedQuestions = (report.questions && report.questions.length > 0)
                ? report.questions
                : (report.interviewId?.questions || []);

              if (detailedQuestions.length === 0) return null;

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-12">
                  <h2 className="text-3xl font-extrabold text-white mb-8 border-b border-slate-800 pb-4">Detailed Question Analysis</h2>
                  <div className="space-y-6">
                    {detailedQuestions.map((q, idx) => (
                      <div key={idx} className="glass-card rounded-3xl p-8 border border-slate-800 shadow-sm transition-all hover:border-indigo-500/30">
                        <div className="flex items-start justify-between mb-6">
                          <h3 className="text-xl font-semibold text-white leading-relaxed pr-8">
                            <span className="text-indigo-400 mr-2">Q{idx + 1}.</span> 
                            {q.question}
                          </h3>
                          <div className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap ${q.score >= 8 ? 'bg-green-500/20 text-green-400' : q.score >= 5 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {q.score * 10}% Score
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              Your Answer
                            </h4>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{q.userAnswer || <span className="italic text-slate-500">No answer provided</span>}</p>
                          </div>
                          
                          <div className="bg-indigo-900/10 rounded-2xl p-6 border border-indigo-500/20">
                            <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              AI Feedback
                            </h4>
                            <p className="text-indigo-100 leading-relaxed whitespace-pre-wrap">{q.aiFeedback}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportDetail;
