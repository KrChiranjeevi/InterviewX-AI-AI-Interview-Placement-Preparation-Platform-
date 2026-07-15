import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Target, Clock, Zap, CheckCircle2, XCircle, 
  MinusCircle, BrainCircuit, ChevronDown, Sparkles, AlertCircle, ArrowLeft, BarChart3, Info
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssessmentReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, solutions
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/assessments/attempt/${id}`);
        setReport(res.data);
      } catch (err) {
        toast.error('Failed to load assessment report.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Generating Your Analytics Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Report Not Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">We couldn't find this assessment attempt.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  // ─── Metrics Calculations ───
  const totalTimeSeconds = report.responses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
  const avgTime = report.responses.length > 0 ? Math.round(totalTimeSeconds / report.responses.length) : 0;
  
  // Topic Analysis
  const topicStats = {};
  report.responses.forEach(r => {
    if (!r.subCategory) return;
    if (!topicStats[r.subCategory]) {
      topicStats[r.subCategory] = { total: 0, correct: 0, time: 0 };
    }
    topicStats[r.subCategory].total += 1;
    topicStats[r.subCategory].time += (r.timeSpent || 0);
    if (r.isCorrect) topicStats[r.subCategory].correct += 1;
  });

  const topicsArray = Object.entries(topicStats).map(([name, data]) => ({
    name,
    accuracy: Math.round((data.correct / data.total) * 100),
    avgTime: Math.round(data.time / data.total),
    total: data.total
  })).sort((a, b) => b.accuracy - a.accuracy);

  const formatTime = (sec) => {
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec/60)}m ${sec%60}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1121] text-slate-900 dark:text-slate-200 p-6 md:p-8 font-sans pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              Assessment Results <span className="text-indigo-600 dark:text-indigo-400">#{(report._id.slice(-6)).toUpperCase()}</span>
            </h1>
            <p className="text-slate-500 mt-1">{report.company || 'Practice'} • {report.module.toUpperCase()} • Submitted on {new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              Analytics Overview
            </button>
            <button 
              onClick={() => setActiveTab('solutions')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'solutions' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
            >
              Detailed Solutions
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            
            {/* ─── Top Summary Cards ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md">Score</span>
                </div>
                <h3 className={`text-4xl font-black ${getScoreColor(report.score)}`}>{report.score}%</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Overall Performance</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-md">Accuracy</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">{report.accuracy}%</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Correct / Attempted</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-md">Speed</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">{formatTime(avgTime)}</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Avg Time per Question</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md">Completion</span>
                </div>
                <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">
                  {report.correctAnswers + report.incorrectAnswers}<span className="text-lg text-slate-400 font-medium">/{report.totalQuestions}</span>
                </h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Questions Attempted</p>
              </div>
            </div>

            {/* ─── AI Recommendations ─── */}
            {report.aiFeedback && (
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BrainCircuit className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-200" />
                    <h2 className="text-xl font-bold">AI Career Coach Feedback</h2>
                  </div>
                  <p className="text-indigo-50 text-lg leading-relaxed max-w-4xl font-medium">
                    {report.aiFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* ─── Topic-wise Performance & Stats ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Topic-wise Performance</h3>
                <div className="space-y-5">
                  {topicsArray.map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{topic.name}</span>
                          <span className="text-xs text-slate-500 ml-2">Avg {formatTime(topic.avgTime)}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(topic.accuracy)}`}>{topic.accuracy}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            topic.accuracy >= 80 ? 'bg-emerald-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {topicsArray.length === 0 && <p className="text-slate-500 text-sm">Not enough topic data available.</p>}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Attempt Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl text-center border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{report.correctAnswers}</div>
                    <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500 uppercase tracking-wider mt-1">Correct</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl text-center border border-red-100 dark:border-red-500/20">
                    <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-black text-red-700 dark:text-red-400">{report.incorrectAnswers}</div>
                    <div className="text-xs font-bold text-red-600/70 dark:text-red-500 uppercase tracking-wider mt-1">Incorrect</div>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                    <MinusCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{report.skippedQuestions}</div>
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Skipped</div>
                  </div>
                </div>

                <div className="mt-8 bg-blue-50 dark:bg-blue-500/5 rounded-xl p-5 border border-blue-100 dark:border-blue-500/10">
                   <div className="flex gap-3">
                     <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                     <div>
                       <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Did you know?</h4>
                       <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
                         Most top-tier candidates maintain an accuracy above 85% while keeping their average time per question strictly under 60 seconds.
                       </p>
                     </div>
                   </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 mb-6 sticky top-4 z-10 shadow-sm">
               <span className="text-sm font-semibold text-slate-500">Filter:</span>
               <div className="flex gap-2">
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">All ({report.responses.length})</span>
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Correct ({report.correctAnswers})</span>
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">Incorrect ({report.incorrectAnswers})</span>
               </div>
            </div>

            {report.responses.map((q, idx) => (
              <div 
                key={idx} 
                className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                  q.isCorrect ? 'border-emerald-200 dark:border-emerald-900/50' : 
                  q.isSkipped ? 'border-slate-200 dark:border-slate-800' : 'border-red-200 dark:border-red-900/50'
                }`}
              >
                <div 
                  className="p-5 cursor-pointer flex gap-4 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    q.isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 
                    q.isSkipped ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                  }`}>
                    {q.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : q.isSkipped ? <MinusCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded border bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">Q{idx + 1}</span>
                      {q.subCategory && <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{q.subCategory}</span>}
                      {q.difficulty && <span className="text-xs font-semibold text-slate-500">• {q.difficulty}</span>}
                      <span className="text-xs font-semibold text-slate-500">• {formatTime(q.timeSpent || 0)}</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium text-[15px]" dangerouslySetInnerHTML={{ __html: q.questionText.replace(/\n/g, '<br/>') }} />
                  </div>

                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedQ === idx ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedQ === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0d1425]"
                    >
                      <div className="p-6 pt-4 space-y-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-xl border ${q.isCorrect ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10' : q.isSkipped ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700' : 'bg-red-50 border-red-100 dark:bg-red-500/5 dark:border-red-500/10'}`}>
                            <span className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Your Answer</span>
                            <span className="font-semibold">{q.isSkipped ? 'Skipped' : q.selectedOption}</span>
                          </div>
                          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                            <span className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70 text-emerald-700 dark:text-emerald-400">Correct Answer</span>
                            <span className="font-semibold text-emerald-900 dark:text-emerald-300">{q.correctOption}</span>
                          </div>
                        </div>

                        {q.explanation && (
                          <div className="mt-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Step-by-step Solution</h4>
                            </div>
                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                          </div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AssessmentReport;
