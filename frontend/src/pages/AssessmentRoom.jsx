import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2, ChevronLeft, ChevronRight, Bookmark, XCircle, LayoutGrid, Info, Target, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssessmentRoom = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSim = searchParams.get('sim') === 'true';
  const company = searchParams.get('company');
  const role = searchParams.get('role');
  const roundIndex = parseInt(searchParams.get('roundIndex') || '0', 10);
  const roundName = searchParams.get('roundName') || 'Online Assessment';
  
  const rawDuration = searchParams.get('duration') || '30 Mins';
  const durationMatch = rawDuration.match(/\d+/);
  const initialTimeMinutes = durationMatch ? parseInt(durationMatch[0], 10) : 30;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responses map: index -> string (selected option)
  const [responses, setResponses] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeSpentMap, setTimeSpentMap] = useState({}); // index -> seconds spent
  const [timeLeft, setTimeLeft] = useState(initialTimeMinutes * 60); // in seconds
  const [submitting, setSubmitting] = useState(false);

  // Proctoring State
  const [violationCount, setViolationCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // To show intro screen before full screen

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/assessments/${category}?limit=20`);
        // Process questions to add stable shuffled options and mock difficulty if missing
        const processed = res.data.map((q) => {
          const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
          const diffs = ['Easy', 'Medium', 'Hard'];
          const difficulty = q.difficulty || diffs[Math.floor(Math.random() * diffs.length)];
          return { ...q, shuffledOptions, difficulty };
        });
        setQuestions(processed);
      } catch (err) {
        toast.error('Failed to load assessment questions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [category]);

  // Proctoring: Block Tab Switching
  useEffect(() => {
    if (!hasStarted || submitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationCount(prev => prev + 1);
        setShowWarningModal(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasStarted, submitting]);

  // Proctoring: Block Page Reload
  useEffect(() => {
    if (!hasStarted || submitting) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStarted, submitting]);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setHasStarted(true);
    } catch (err) {
      console.warn("Fullscreen request failed", err);
      // Fallback: still let them start if their browser blocks it
      setHasStarted(true);
    }
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    
    // Format responses
    const formattedResponses = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: responses[idx] || null,
      isSkipped: !responses[idx],
      timeSpent: timeSpentMap[idx] || 0
    }));

    try {
      const res = await api.post('/assessments/submit', {
        module: category,
        company: company || 'Practice',
        role: role || 'General',
        timeTakenMinutes: Math.round((initialTimeMinutes * 60 - timeLeft) / 60) || 1,
        responses: formattedResponses
      });

      if (autoSubmit) {
        toast('Time is up! Your test has been auto-submitted.', { icon: '⏱️', duration: 5000 });
      } else {
        toast.success('Assessment submitted successfully!');
      }

      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      if (isSim && company) {
        navigate(`/companies/${company}?role=${encodeURIComponent(role)}&simComplete=true&score=${res.data.score}&round=${roundIndex}`);
      } else {
        navigate(`/assessment/report/${res.data.attemptId}`);
      }
    } catch (err) {
      toast.error('Failed to submit assessment.');
      console.error(err);
      setSubmitting(false);
    }
  }, [category, company, initialTimeMinutes, isSim, navigate, questions, responses, role, roundIndex, submitting, timeLeft]);

  // Timer Countdown and Time Spent Tracking
  useEffect(() => {
    if (loading || questions.length === 0 || !hasStarted) return;

    // Track overall timer
    const overallTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(overallTimer);
          handleSubmit(true); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Track time spent on current question
    const questionTimer = setInterval(() => {
      setTimeSpentMap((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1
      }));
    }, 1000);

    return () => {
      clearInterval(overallTimer);
      clearInterval(questionTimer);
    };
  }, [loading, questions.length, handleSubmit, hasStarted, currentIndex]);

  // Action Handlers
  const handleOptionSelect = (option) => {
    setResponses((prev) => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const clearResponse = () => {
    setResponses((prev) => {
      const newRes = { ...prev };
      delete newRes[currentIndex];
      return newRes;
    });
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  // Format Helpers
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  // ─── Render States ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Assessment Environment...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
        <div>
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Questions Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">We couldn't find any questions for the {category} module. Please contact support if this is an error.</p>
          <button onClick={() => navigate('/coding')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Return to Home Page</button>
        </div>
      </div>
    );
  }

  // ─── Start Screen ────────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{company ? `${company} - ${roundName}` : `${category} Assessment`}</h1>
              <p className="text-slate-500 text-sm mt-0.5">Duration: {initialTimeMinutes} Minutes • {questions.length} Questions</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex gap-3 text-slate-600 dark:text-slate-300 text-sm bg-blue-50/50 dark:bg-blue-500/5 p-4 rounded-xl border border-blue-100 dark:border-blue-500/10">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Important Instructions</p>
                <ul className="list-disc pl-4 space-y-1 text-blue-800/80 dark:text-blue-200/80">
                  <li>This test requires full-screen mode to begin.</li>
                  <li>Do not switch tabs, minimize the window, or exit full-screen.</li>
                  <li>Tab switching will be recorded as a proctoring violation.</li>
                  <li>The test will automatically submit when the timer expires.</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={requestFullscreen}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            I Understand, Start Test Now
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Assessment UI ──────────────────────────────────────────────────

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(responses).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const notAnsweredCount = questions.length - answeredCount;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Difficulty badge colors
  const diffColors = {
    'Easy':   'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
    'Medium': 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
    'Hard':   'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400',
  };
  const currentDiffClass = diffColors[currentQ.difficulty] || diffColors['Medium'];

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-[#0b1121] select-none text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* ─── Top Header ─── */}
      <header className="h-16 flex-shrink-0 bg-white dark:bg-[#131b2f] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black">IX</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
              {company ? `${company} ${roundName}` : `${category} Assessment`}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Candidate Id: IX-{Math.floor(Math.random()*90000) + 10000}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Time Remaining</span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono text-sm font-bold shadow-sm ${
              timeLeft < 300 
                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400 animate-pulse' 
                : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Progress Bar ─── */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800 w-full relative z-20">
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ─── Left Side: Question Area ─── */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#0b1121]">
          
          <div className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex-1 flex flex-col"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                        Q{currentIndex + 1}
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Question</h2>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${currentDiffClass}`}>
                        {currentQ.difficulty}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 rounded-md border">
                        +1 Mark
                      </span>
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="text-[17px] leading-relaxed font-medium text-slate-800 dark:text-slate-200 mb-10 text-balance prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentQ.question.replace(/\n/g, '<br/>') }} />
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-12">
                    {currentQ.shuffledOptions.map((opt, i) => {
                      const isSelected = responses[currentIndex] === opt;
                      const optionLetter = String.fromCharCode(65 + i); // A, B, C, D...
                      return (
                        <label
                          key={i}
                          className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-500/10 shadow-[0_4px_20px_rgba(79,70,229,0.08)]' 
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700/50'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name={`question-${currentIndex}`} 
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(opt)}
                            className="sr-only"
                          />
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-bold text-sm transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                          }`}>
                            {optionLetter}
                          </div>
                          <span className={`text-base font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {opt}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>
          </div>

          {/* ─── Footer Action Bar ─── */}
          <div className="h-20 flex-shrink-0 bg-white dark:bg-[#131b2f] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-20">
            <div className="flex gap-3">
              <button 
                onClick={toggleMarkForReview}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all border ${
                  markedForReview[currentIndex] 
                    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                {markedForReview[currentIndex] ? 'Unmark Review' : 'Mark for Review'}
              </button>
              
              <button 
                onClick={clearResponse}
                disabled={!responses[currentIndex]}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
              >
                <XCircle className="w-4 h-4" />
                Clear
              </button>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              
              {currentIndex === questions.length - 1 ? (
                <button 
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-8 py-2.5 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-60 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Test
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-8 py-2.5 rounded-lg font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* ─── Right Side: Question Palette ─── */}
        <aside className="w-80 bg-slate-50 dark:bg-[#131b2f] border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Question Palette</h3>
          </div>
          
          <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">{answeredCount}</div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Answered</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px] font-bold">{notAnsweredCount}</div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Not Answered</span>
              </div>
              <div className="flex items-center gap-2.5 col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-md bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">{reviewCount}</div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Marked for Review</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((_, idx) => {
                const isAnswered = !!responses[idx];
                const isMarked = !!markedForReview[idx];
                const isCurrent = idx === currentIndex;
                
                let baseClass = "h-11 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all border-2 ";
                
                if (isCurrent) {
                  baseClass += "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md scale-105 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500";
                } else if (isMarked) {
                  baseClass += "border-purple-500 bg-purple-500 text-white shadow-sm hover:bg-purple-600 hover:border-purple-600";
                } else if (isAnswered) {
                  baseClass += "border-emerald-500 bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:border-emerald-600";
                } else {
                  baseClass += "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={baseClass}
                    title={isMarked ? "Marked for review" : isAnswered ? "Answered" : "Not answered"}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button 
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Submit Assessment
            </button>
          </div>
        </aside>

      </div>

      {/* ─── Proctoring Violation Modal ─── */}
      <AnimatePresence>
        {showWarningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Proctoring Warning</h2>
                  <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Violation Count: {violationCount}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                We detected that you navigated away from the assessment window or switched tabs. This is a violation of the test rules. Continued violations may result in automatic termination of your assessment.
              </p>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  requestFullscreen();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                I Understand, Return to Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AssessmentRoom;
