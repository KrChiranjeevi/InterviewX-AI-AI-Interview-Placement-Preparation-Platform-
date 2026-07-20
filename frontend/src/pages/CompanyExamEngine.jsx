import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, ChevronRight, Bookmark, XCircle,
  LayoutGrid, AlertTriangle, CheckCircle2, Send, Lock,
  Eye, Monitor, Wifi, Shield, RefreshCw, Info, BarChart3,
  Code2, BookOpen, Cpu, Award, AlertCircle, Maximize2
} from 'lucide-react';
import { getCompanyConfig, getTrackConfig } from '../data/examConfigs';
import { getQuestionsForSection, getCodingProblemsForSection, getDebuggingQuestions } from '../data/questionBank';
import CodingIDE from '../components/exam/CodingIDE';

// ─── Question Palette Status Colors ───────────────────────────────────────────
const PALETTE_STATUS = {
  not_visited: { bg: 'bg-slate-800', border: 'border-slate-700', text: 'text-slate-500', label: 'Not Visited' },
  visited: { bg: 'bg-white/5', border: 'border-slate-600', text: 'text-slate-400', label: 'Visited' },
  answered: { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-white', label: 'Answered' },
  marked: { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white', label: 'Marked for Review' },
  answered_marked: { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white', label: 'Answered & Marked' },
  current: { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-slate-900', label: 'Current' },
};

// ─── Format time ──────────────────────────────────────────────────────────────
const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  if (h > 0) return `${h}:${m}:${s}`;
  return `${m}:${s}`;
};

// ─── Difficulty badge ─────────────────────────────────────────────────────────
const DiffBadge = ({ difficulty }) => {
  const styles = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${styles[difficulty] || styles.Medium}`}>
      {difficulty}
    </span>
  );
};

// ─── Main Engine ──────────────────────────────────────────────────────────────
const CompanyExamEngine = () => {
  const { company: companyId, track: trackId } = useParams();
  const navigate = useNavigate();

  const company = useMemo(() => getCompanyConfig(companyId), [companyId]);
  const track = useMemo(() => getTrackConfig(companyId, trackId), [companyId, trackId]);

  // ── Phase: pre | exam | submitted ─────────────────────────────────────────
  const [phase, setPhase] = useState('pre'); // pre = intro screen

  // ── Sections & Questions ──────────────────────────────────────────────────
  const [sections, setSections] = useState([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [lockedSections, setLockedSections] = useState({}); // { sectionIdx: true } when submitted

  // ── Responses ─────────────────────────────────────────────────────────────
  const [responses, setResponses] = useState({}); // key: `${secIdx}-${qIdx}` → answer
  const [markedForReview, setMarkedForReview] = useState({}); // same key → bool
  const [visited, setVisited] = useState({}); // same key → bool
  const [codingSubmissions, setCodingSubmissions] = useState({}); // `${secIdx}-${qIdx}` → submission

  // ── Timer ─────────────────────────────────────────────────────────────────
  const [overallTimer, setOverallTimer] = useState(0);
  const [sectionTimer, setSectionTimer] = useState(0);
  const overallTimerRef = useRef(null);
  const sectionTimerRef = useRef(null);
  const deliberateExitRef = useRef(false);

  // ── Proctoring ────────────────────────────────────────────────────────────
  const [violations, setViolations] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSectionSubmitModal, setShowSectionSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [evaluationPhase, setEvaluationPhase] = useState('break');
  const [breakTimer, setBreakTimer] = useState(120);

  // Calculate score based on actual correct answers
  const calculateFinalScore = useCallback(() => {
    let correctCount = 0;
    let totalQuestions = 0;

    sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        totalQuestions++;
        const response = responses[`${si}-${qi}`];
        if (response) {
          if (sec.questionType === 'coding' || q.isCoding) {
            if (response === 'accepted' || response.allPassed) {
              correctCount++;
            }
          } else if (q.type === 'multiple') {
            const expected = q.answer;
            if (Array.isArray(response) && Array.isArray(expected)) {
              const matched = response.length === expected.length && response.every(val => expected.includes(val));
              if (matched) correctCount++;
            }
          } else if (q.type === 'fill_blank') {
            if (String(response).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) {
              correctCount++;
            }
          } else {
            if (response === q.answer) {
              correctCount++;
            }
          }
        }
      });
    });

    return totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  }, [sections, responses]);

  const saveExamResultToStorage = useCallback((finalScore) => {
    try {
      const storageKey = `placement_simulation_${company.name}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        
        const passed = finalScore >= 63;
        const updatedScores = { ...data.scores, 1: finalScore };
        const updatedDetails = {
          ...data.roundDetails,
          1: {
            score: finalScore,
            passed,
            feedback: passed 
              ? 'Excellent performance on the Online Assessment! Your analytical skills and coding efficiency met the benchmarks.'
              : 'Assessment failed to meet the passing threshold of 60%. Try again to improve your score and progress.',
            timeTaken: 'Completed',
            difficulty: track.difficulty || 'Medium'
          }
        };

        const nextStep = passed ? 2 : 1;

        const updatedData = {
          ...data,
          scores: updatedScores,
          roundDetails: updatedDetails,
          currentPipelineStep: nextStep
        };

        localStorage.setItem(storageKey, JSON.stringify(updatedData));
      }
    } catch (e) {
      console.error('Failed to save exam results to storage:', e);
    }
  }, [company, track]);

  const handleAutoSubmit = useCallback(() => {
    deliberateExitRef.current = true;
    clearInterval(overallTimerRef.current);
    clearInterval(sectionTimerRef.current);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    
    const finalScore = calculateFinalScore();
    saveExamResultToStorage(finalScore);

    setPhase('submitted');
  }, [calculateFinalScore, saveExamResultToStorage]);

  // ── Build sections with questions ─────────────────────────────────────────
  useEffect(() => {
    if (!track) return;
    const built = track.sections.map(sec => {
      if (sec.isCoding) {
        const problems = getCodingProblemsForSection(sec.difficulty, sec.questions);
        return { ...sec, questions: problems, questionType: 'coding' };
      } else if (sec.questionTypes?.includes('debugging')) {
        const dbgQs = getDebuggingQuestions(Math.ceil(sec.questions / 3));
        const regularQs = getQuestionsForSection(sec, sec.questions - dbgQs.length);
        return { ...sec, questions: [...regularQs, ...dbgQs], questionType: 'mixed' };
      } else {
        const qs = getQuestionsForSection(sec, sec.questions);
        return { ...sec, questions: qs, questionType: 'mcq' };
      }
    });
    setSections(built);

    // Set overall timer from track duration
    const totalMins = parseInt(track.duration) || 90;
    setOverallTimer(totalMins * 60);

    // Section timer from first section
    if (built[0]) setSectionTimer((built[0].duration || 20) * 60);
  }, [track]);

  // ── Start timers on exam start ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;

    overallTimerRef.current = setInterval(() => {
      setOverallTimer(prev => {
        if (prev <= 1) {
          clearInterval(overallTimerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    sectionTimerRef.current = setInterval(() => {
      setSectionTimer(prev => {
        if (prev <= 1) {
          clearInterval(sectionTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(overallTimerRef.current);
      clearInterval(sectionTimerRef.current);
    };
  }, [phase]);

  // ── Auto save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    const saveInterval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [phase, responses]);

  // ── Proctoring: tab switch ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    const handleVisibility = () => {
      if (document.hidden) {
        setViolations(v => {
          const next = v + 1;
          if (next >= 3) {
            handleAutoSubmit();
          } else {
            setShowViolationModal(true);
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  // ── Proctoring: beforeunload ──────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  // ── Fullscreen & Proctoring ───────────────────────────────────────────────
  const enterFullscreen = async () => {
    try {
      deliberateExitRef.current = false;
      await document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } catch { /* allowed */ }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      
      // Exit fullscreen proctor violation logic
      if (phase === 'exam' && !isFs && !deliberateExitRef.current && !showViolationModal && !submitting) {
        setViolations(v => {
          const next = v + 1;
          if (next >= 3) {
            handleAutoSubmit();
          } else {
            setShowViolationModal(true);
          }
          return next;
        });
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [phase, showViolationModal, submitting, handleAutoSubmit]);

  // ── Mark visited on question load ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exam') return;
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setVisited(prev => ({ ...prev, [key]: true }));
  }, [currentSectionIdx, currentQuestionIdx, phase]);

  // ── Section timer reset when section changes ──────────────────────────────
  useEffect(() => {
    if (sections[currentSectionIdx]) {
      setSectionTimer((sections[currentSectionIdx].duration || 20) * 60);
    }
  }, [currentSectionIdx, sections]);

  // ── Break timer countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'submitted' || evaluationPhase !== 'break') return;
    if (breakTimer <= 0) {
      setEvaluationPhase('report');
      return;
    }
    const t = setInterval(() => {
      setBreakTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [phase, evaluationPhase, breakTimer]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = async () => {
    await enterFullscreen();
    setPhase('exam');
  };



  const handleFinalSubmit = useCallback(() => {
    setSubmitting(true);
    deliberateExitRef.current = true;
    clearInterval(overallTimerRef.current);
    clearInterval(sectionTimerRef.current);

    const finalScore = calculateFinalScore();
    saveExamResultToStorage(finalScore);

    setTimeout(() => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setPhase('submitted');
      setSubmitting(false);
    }, 1500);
  }, [calculateFinalScore, saveExamResultToStorage]);

  const handleSectionSubmit = useCallback(() => {
    const isLastSection = currentSectionIdx === sections.length - 1;
    if (isLastSection) {
      setShowSubmitModal(true);
      return;
    }
    // Lock current section
    setLockedSections(prev => ({ ...prev, [currentSectionIdx]: true }));
    const nextIdx = currentSectionIdx + 1;
    setCurrentSectionIdx(nextIdx);
    setCurrentQuestionIdx(0);
    setSectionTimer((sections[nextIdx]?.duration || 20) * 60);
    setShowSectionSubmitModal(false);
  }, [currentSectionIdx, sections]);

  const handleOptionSelect = (answer) => {
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setResponses(prev => ({ ...prev, [key]: answer }));
  };

  const handleMultiSelect = (answer) => {
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setResponses(prev => {
      const current = prev[key] || [];
      if (current.includes(answer)) return { ...prev, [key]: current.filter(a => a !== answer) };
      return { ...prev, [key]: [...current, answer] };
    });
  };

  const handleClearResponse = () => {
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setResponses(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const toggleMarkForReview = () => {
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setMarkedForReview(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNext = () => {
    const sec = sections[currentSectionIdx];
    if (!sec) return;
    if (currentQuestionIdx < sec.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleCodingSubmit = (result) => {
    const key = `${currentSectionIdx}-${currentQuestionIdx}`;
    setCodingSubmissions(prev => ({ ...prev, [key]: result }));
    setResponses(prev => ({ ...prev, [key]: result.allPassed ? 'accepted' : 'attempted' }));
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const currentSection = sections[currentSectionIdx];
  const currentQ = currentSection?.questions?.[currentQuestionIdx];

  const getQuestionKey = (si, qi) => `${si}-${qi}`;

  const getQuestionStatus = (si, qi) => {
    const key = getQuestionKey(si, qi);
    const isCurrent = si === currentSectionIdx && qi === currentQuestionIdx;
    if (isCurrent) return 'current';
    const isAnswered = !!responses[key];
    const isMarked = !!markedForReview[key];
    const isVisited = !!visited[key];
    if (isAnswered && isMarked) return 'answered_marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    if (isVisited) return 'visited';
    return 'not_visited';
  };

  const sectionStats = (si) => {
    const sec = sections[si];
    if (!sec) return { answered: 0, marked: 0, total: 0 };
    let answered = 0, marked = 0;
    for (let qi = 0; qi < sec.questions.length; qi++) {
      const key = getQuestionKey(si, qi);
      if (responses[key]) answered++;
      if (markedForReview[key]) marked++;
    }
    return { answered, marked, total: sec.questions.length };
  };

  // ── Accent style helpers ──────────────────────────────────────────────────
  const accent = company?.accent || '#6366f1';
  const accentLight = company?.accentLight || '#818cf8';
  const accentGlow = company?.accentGlow || 'rgba(99,102,241,0.4)';
  const accentStyle = { color: accentLight };
  const accentBg = { backgroundColor: accent };
  const accentGlowStyle = { boxShadow: `0 0 20px ${accentGlow}` };

  // ─────────────────────────────────────────────────────────────────────────
  // PRE-EXAM INTRO SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!company || !track) {
    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Assessment Not Found</h2>
          <p className="text-slate-400 mb-4">Invalid company or track. Please go back and select again.</p>
          <button onClick={() => navigate('/companies')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold">
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRE-EXAM SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'pre') {
    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accentGlow}, transparent)` }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl relative backdrop-blur-xl"
        >
          {/* Company Logo */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, boxShadow: `0 8px 24px ${accentGlow}` }}
            >
              {company.logo}
            </div>
            <div>
              <p className="text-slate-400 text-sm">{company.fullName}</p>
              <h1 className="text-2xl font-black text-white">{track.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">{company.tagline}</p>
            </div>
          </div>

          {/* Assessment Structure */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Assessment Sections</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {sections.map((sec, i) => (
                <React.Fragment key={sec.id}>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: `${accent}15`, color: accentLight, border: `1px solid ${accent}30` }}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.name}</span>
                  </div>
                  {i < sections.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Clock className="w-5 h-5" />, label: 'Duration', value: track.duration },
              { icon: <BookOpen className="w-5 h-5" />, label: 'Sections', value: `${sections.length}` },
              { icon: <LayoutGrid className="w-5 h-5" />, label: 'Total Qs', value: `${sections.reduce((a, s) => a + (s.questions?.length || 0), 0)}` },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="flex justify-center mb-1" style={accentStyle}>{stat.icon}</div>
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300 space-y-1">
                <p className="font-semibold text-amber-300">Before you begin:</p>
                <p className="text-slate-400 text-xs">• This test requires Full Screen mode. Do not exit full screen.</p>
                <p className="text-slate-400 text-xs">• Tab switching is monitored. 3 violations = auto-submit.</p>
                <p className="text-slate-400 text-xs">• {track.locked ? 'Sections are locked — complete each before proceeding.' : 'Sections can be navigated freely.'}</p>
                <p className="text-slate-400 text-xs">• The timer begins as soon as you click Start.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, ...accentGlowStyle }}
          >
            <Maximize2 className="w-5 h-5" />
            Start Assessment
          </button>
          <p className="text-center text-xs text-slate-500 mt-3">
            Clicking Start will enter Full Screen mode and begin the timer
          </p>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMITTED SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (phase === 'submitted' && evaluationPhase === 'break') {
    const mins = Math.floor(breakTimer / 60);
    const secs = (breakTimer % 60).toString().padStart(2, '0');

    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center p-4 relative overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accentGlow}, transparent)` }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative backdrop-blur-xl"
        >
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-indigo-500/40 border-t-indigo-500 animate-spin flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">2-Minute Breather Break</h2>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              Our grading engine is compiling code executions, checking test outputs, and analyzing logic criteria. Take a short rest!
            </p>
          </div>

          {/* Countdown display */}
          <div className="text-5xl font-mono font-black tracking-wider text-slate-200 mb-6 bg-white/5 border border-white/5 py-4 rounded-2xl">
            {mins}:{secs}
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 mb-6 text-left">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Grading Queue Status</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              Running logic analyzer checks on programming syntax submissions...
            </p>
          </div>

          <button
            onClick={() => setEvaluationPhase('report')}
            className="w-full py-3.5 rounded-xl font-black text-white text-xs tracking-wider uppercase transition-all shadow-md hover:opacity-90 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, ...accentGlowStyle }}
          >
            Skip Break & View AI Grading Report
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'submitted' && evaluationPhase === 'report') {
    const score = calculateFinalScore();
    const passed = score >= 60;

    let totalAnswered = 0, totalQuestions = 0;
    sections.forEach((sec, si) => {
      sec.questions.forEach((_, qi) => {
        totalQuestions++;
        if (responses[`${si}-${qi}`]) totalAnswered++;
      });
    });

    // Breakdown metrics
    let correctCount = 0;
    const questionsBreakdown = [];
    sections.forEach((sec, si) => {
      sec.questions.forEach((q, qi) => {
        const response = responses[`${si}-${qi}`];
        let isCorrect = false;
        let details = '';

        if (response) {
          if (sec.questionType === 'coding' || q.isCoding) {
            if (response === 'accepted' || response.allPassed) {
              isCorrect = true;
              details = 'All compilation criteria and test suites passed successfully.';
            } else {
              details = 'Compilation failed, syntax error, or incomplete logical structure.';
            }
          } else if (q.type === 'multiple') {
            const expected = q.answer;
            if (Array.isArray(response) && Array.isArray(expected)) {
              isCorrect = response.length === expected.length && response.every(val => expected.includes(val));
              details = isCorrect ? 'All matching options selected.' : 'Partially or fully incorrect options selected.';
            }
          } else if (q.type === 'fill_blank') {
            isCorrect = String(response).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
            details = isCorrect ? 'Matching input filled correctly.' : `Incorrect response. Correct answer: ${q.answer}`;
          } else {
            isCorrect = response === q.answer;
            details = isCorrect ? 'Selected correct MCQ choice.' : `Incorrect choice. Selected: "${response}". Expected: "${q.answer}".`;
          }
        } else {
          details = 'Question skipped. No response was submitted.';
        }

        if (isCorrect) correctCount++;
        
        questionsBreakdown.push({
          title: q.title || q.question?.slice(0, 50) + '...',
          section: sec.name,
          isCorrect,
          details
        });
      });
    });

    return (
      <div className="min-h-screen bg-[#070711] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accentGlow}, transparent)` }} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl"
        >
          {/* Header Status */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                passed 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              {passed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </motion.div>

            <h1 className="text-2xl font-black mb-1">
              {passed ? 'Assessment Cleared!' : 'Better Luck Next Time'}
            </h1>
            <p className="text-xs text-slate-400">
              Recruitment Assessment results for <span className="text-slate-200 font-bold">{company.name} — {track.name}</span>
            </p>
          </div>

          {/* Score Badge */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className={`text-3xl font-black ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {score}%
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Final Score</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-black text-slate-300">
                {correctCount} / {totalQuestions}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Correct Qs</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-3xl font-black text-slate-300">
                {passed ? 'Passed' : 'Failed'}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Benchmark (60%)</div>
            </div>
          </div>

          {/* Detailed Question breakdown */}
          <div className="mb-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Grading Evaluation Breakdown</h3>
            
            <div className="max-h-60 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-3 bg-slate-950/40 custom-scrollbar">
              {questionsBreakdown.map((q, idx) => (
                <div key={idx} className="flex gap-3 text-xs p-3 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                  <div className="mt-0.5 shrink-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4.5 h-4.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-semibold text-slate-200 truncate pr-2">{q.title}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{q.section}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{q.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action redirects */}
          <div className="flex gap-3">
            {passed ? (
              <button
                onClick={() => navigate(`/companies/${companyId}`)}
                className="w-full py-3.5 rounded-xl font-black text-white text-xs tracking-wider uppercase transition-all shadow-md hover:opacity-90 active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})`, ...accentGlowStyle }}
              >
                Proceed to Next Round (Technical Interview)
              </button>
            ) : (
              <button
                onClick={() => navigate(`/companies/${companyId}`)}
                className="w-full py-3.5 rounded-xl font-black text-white text-xs tracking-wider uppercase transition-all shadow-md hover:opacity-90 bg-red-600 hover:bg-red-500 active:scale-[0.98]"
              >
                Return to Assessment Board (Re-attempt)
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN ASSESSMENT UI
  // ─────────────────────────────────────────────────────────────────────────
  const isCodingSection = currentSection?.isCoding || currentSection?.questionType === 'coding';
  const isLocked = lockedSections[currentSectionIdx];
  const stats = sectionStats(currentSectionIdx);

  return (
    <div className="h-screen flex flex-col bg-[#0b1121] overflow-hidden select-none text-white">

      {/* ─── TOP HEADER ─── */}
      <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/10 z-30"
        style={{ background: 'rgba(11,17,33,0.98)', backdropFilter: 'blur(20px)' }}>

        {/* Left: Company + Assessment name */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})` }}
          >
            {company.logo.slice(0, 2)}
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-bold text-sm leading-tight">{company.name} — {track.name}</div>
            <div className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
              {currentSection?.name} • Q{currentQuestionIdx + 1}/{currentSection?.questions?.length || 0}
            </div>
          </div>
        </div>

        {/* Center: Section Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {sections.map((sec, si) => {
            const sStat = sectionStats(si);
            const isCurrentSec = si === currentSectionIdx;
            const isLockd = lockedSections[si];
            const canNavigate = !track.locked || isLockd || si === currentSectionIdx;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  if (!canNavigate && !isLockd) return;
                  if (!track.locked || isLockd || si <= currentSectionIdx) {
                    setCurrentSectionIdx(si);
                    setCurrentQuestionIdx(0);
                  }
                }}
                disabled={track.locked && si > currentSectionIdx && !isLockd}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrentSec
                    ? 'text-white'
                    : isLockd
                    ? 'text-slate-500 cursor-not-allowed'
                    : !track.locked
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                style={isCurrentSec ? { backgroundColor: `${accent}20`, color: accentLight, border: `1px solid ${accent}40` } : {}}
              >
                {isLockd && <Lock className="w-2.5 h-2.5" />}
                <span>{sec.icon}</span>
                <span className="hidden lg:inline">{sec.name}</span>
                {sStat.answered > 0 && (
                  <span className="w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-black"
                    style={{ backgroundColor: accent, color: 'white' }}>
                    {sStat.answered}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Timers + Status */}
        <div className="flex items-center gap-3">
          {/* Auto save indicator */}
          {lastSaved && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Saved
            </div>
          )}

          {/* Violations */}
          {violations > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs font-bold">{violations}/3</span>
            </div>
          )}

          {/* Section Timer */}
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Section</span>
            <span className={`font-mono text-sm font-bold ${sectionTimer < 120 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
              {formatTime(sectionTimer)}
            </span>
          </div>

          {/* Overall Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm border ${
              overallTimer < 300
                ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(overallTimer)}
          </div>
        </div>
      </header>

      {/* ─── PROGRESS BAR ─── */}
      <div className="h-1 bg-white/5 flex-shrink-0 z-20">
        <motion.div
          className="h-full"
          style={{ backgroundColor: accent, width: `${(stats.answered / Math.max(stats.total, 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* ─── MAIN BODY ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ─── LEFT: QUESTION AREA ─── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Question container */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSectionIdx}-${currentQuestionIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {isCodingSection ? (
                  // ── CODING QUESTION ──────────────────────────────────────
                  <div className="h-full flex flex-col lg:flex-row gap-0">
                    {/* Problem Statement */}
                    <div className="w-full lg:w-[42%] overflow-y-auto no-scrollbar p-5 border-r border-white/10">
                      {currentQ && (
                        <>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Code2 className="w-4 h-4" style={accentStyle} />
                                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Problem {currentQuestionIdx + 1}</span>
                              </div>
                              <h2 className="text-xl font-black text-white">{currentQ.title}</h2>
                            </div>
                            <DiffBadge difficulty={currentQ.difficulty} />
                          </div>

                          <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-slate-300 leading-relaxed mb-4 text-sm">{currentQ.description}</p>

                            {currentQ.examples?.map((ex, i) => (
                              <div key={i} className="mb-4 p-4 bg-white/[0.04] rounded-xl border border-white/10">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Example {i + 1}</p>
                                <div className="space-y-1 font-mono text-xs">
                                  <div className="text-slate-300"><span className="text-slate-500">Input: </span>{ex.input}</div>
                                  <div className="text-slate-300"><span className="text-slate-500">Output: </span>{ex.output}</div>
                                  {ex.explanation && <div className="text-slate-400 text-[11px] mt-1">{ex.explanation}</div>}
                                </div>
                              </div>
                            ))}

                            {currentQ.constraints?.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Constraints:</p>
                                <ul className="space-y-1">
                                  {currentQ.constraints.map((c, i) => (
                                    <li key={i} className="text-slate-400 text-xs font-mono">• {c}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* IDE */}
                    <div className="flex-1 min-h-0 h-[60vh] lg:h-auto p-3">
                      {currentQ && (
                        <CodingIDE
                          problem={currentQ}
                          accentColor={accent}
                          onSubmit={handleCodingSubmit}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  // ── MCQ / APTITUDE QUESTION ──────────────────────────────
                  <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">
                    {currentQ ? (
                      <>
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                              style={{ background: `linear-gradient(135deg, ${accent}, ${accentLight})` }}
                            >
                              Q{currentQuestionIdx + 1}
                            </div>
                            <div>
                              <h2 className="text-lg font-bold text-white">Question {currentQuestionIdx + 1}</h2>
                              <p className="text-xs text-slate-500 capitalize">{currentSection?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DiffBadge difficulty={currentQ.difficulty} />
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-400 rounded-md">
                              +{currentQ.difficulty === 'Hard' ? 3 : currentQ.difficulty === 'Medium' ? 2 : 1} Mark{currentQ.difficulty === 'Easy' ? '' : 's'}
                            </span>
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="text-[16px] leading-relaxed font-medium text-slate-200 mb-8 whitespace-pre-wrap">
                          {currentQ.question}
                        </div>

                        {/* Options */}
                        {currentQ.type !== 'fill_blank' && currentQ.shuffledOptions && (
                          <div className="space-y-3">
                            {currentQ.shuffledOptions.map((opt, i) => {
                              const key = `${currentSectionIdx}-${currentQuestionIdx}`;
                              const currentResponse = responses[key];
                              const isMulti = currentQ.type === 'multiple';
                              const isSelected = isMulti
                                ? Array.isArray(currentResponse) && currentResponse.includes(opt)
                                : currentResponse === opt;

                              return (
                                <label
                                  key={i}
                                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group ${
                                    isSelected
                                      ? 'border-opacity-100 bg-white/[0.05]'
                                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                  }`}
                                  style={isSelected ? { borderColor: accent, boxShadow: `0 0 12px ${accentGlow}` } : {}}
                                >
                                  <input
                                    type={isMulti ? 'checkbox' : 'radio'}
                                    name={`q-${currentQuestionIdx}`}
                                    value={opt}
                                    checked={isSelected}
                                    onChange={() => isMulti ? handleMultiSelect(opt) : handleOptionSelect(opt)}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-bold text-sm flex-shrink-0 transition-all ${
                                      isSelected ? 'text-white' : 'text-slate-400 bg-white/5'
                                    }`}
                                    style={isSelected ? { backgroundColor: accent } : {}}
                                  >
                                    {isMulti
                                      ? (isSelected ? '✓' : String.fromCharCode(65 + i))
                                      : String.fromCharCode(65 + i)
                                    }
                                  </div>
                                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                    {opt}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* Fill in blank */}
                        {currentQ.type === 'fill_blank' && (
                          <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">Enter your answer:</label>
                            <input
                              type="text"
                              value={responses[`${currentSectionIdx}-${currentQuestionIdx}`] || ''}
                              onChange={(e) => handleOptionSelect(e.target.value)}
                              placeholder="Type your answer here..."
                              className="w-full max-w-xs bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-opacity-100"
                              style={{ '--tw-ring-color': accent }}
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <div className="text-4xl mb-3">📝</div>
                        <p className="text-slate-400">No question available</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── FOOTER ACTION BAR ─── */}
          {!isCodingSection && (
            <div
              className="h-[68px] flex-shrink-0 flex items-center justify-between px-4 sm:px-6 border-t border-white/10"
              style={{ background: 'rgba(11,17,33,0.98)' }}
            >
              {/* Left actions */}
              <div className="flex gap-2">
                <button
                  onClick={toggleMarkForReview}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    markedForReview[`${currentSectionIdx}-${currentQuestionIdx}`]
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {markedForReview[`${currentSectionIdx}-${currentQuestionIdx}`] ? 'Unmark' : 'Mark Review'}
                  </span>
                </button>
                <button
                  onClick={handleClearResponse}
                  disabled={!responses[`${currentSectionIdx}-${currentQuestionIdx}`]}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>

              {/* Right: Navigation */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center gap-1 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
                </button>

                {currentQuestionIdx < (currentSection?.questions?.length || 1) - 1 ? (
                  <button
                    onClick={handleSaveNext}
                    className="flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl text-xs font-bold text-white transition-all"
                    style={{ backgroundColor: accent }}
                  >
                    Save & Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const isLastSec = currentSectionIdx === sections.length - 1;
                      if (isLastSec) setShowSubmitModal(true);
                      else setShowSectionSubmitModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl text-xs font-bold text-white transition-all"
                    style={{ backgroundColor: currentSectionIdx === sections.length - 1 ? '#10b981' : accent }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {currentSectionIdx === sections.length - 1 ? 'Submit Test' : 'Submit Section'}
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ─── RIGHT SIDEBAR: QUESTION PALETTE ─── */}
        <aside
          className="hidden lg:flex w-72 flex-col border-l border-white/10 flex-shrink-0 z-20"
          style={{ background: 'rgba(11,17,33,0.98)' }}
        >
          {/* Palette header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" style={accentStyle} />
              <span className="font-bold text-white text-sm">Question Palette</span>
            </div>
            <span className="text-xs text-slate-500">{currentSection?.name}</span>
          </div>

          {/* Legend */}
          <div className="px-3 pt-3 pb-2 border-b border-white/5">
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(PALETTE_STATUS).filter(([k]) => k !== 'current').map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <div className={`w-4 h-4 rounded-sm ${val.bg} border ${val.border}`} />
                  <span className="truncate">{val.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="px-3 pt-3 pb-2 border-b border-white/5">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-black text-emerald-400">{stats.answered}</div>
                <div className="text-[10px] text-slate-500">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-slate-400">{stats.total - stats.answered}</div>
                <div className="text-[10px] text-slate-500">Not Ans.</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-purple-400">{stats.marked}</div>
                <div className="text-[10px] text-slate-500">Review</div>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {(currentSection?.questions || []).map((_, qi) => {
                const status = getQuestionStatus(currentSectionIdx, qi);
                const st = PALETTE_STATUS[status];
                return (
                  <button
                    key={qi}
                    onClick={() => setCurrentQuestionIdx(qi)}
                    title={st.label}
                    className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold border-2 transition-all ${st.bg} ${st.border} ${st.text} ${
                      status === 'current' ? 'ring-2 ring-yellow-400/50 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {qi + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => {
                const isLastSec = currentSectionIdx === sections.length - 1;
                if (isLastSec) setShowSubmitModal(true);
                else setShowSectionSubmitModal(true);
              }}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: currentSectionIdx === sections.length - 1
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : `linear-gradient(135deg, ${accent}, ${accentLight})`
              }}
            >
              <Send className="w-4 h-4" />
              {currentSectionIdx === sections.length - 1 ? 'Submit Assessment' : 'Submit Section'}
            </button>

            {track.locked && currentSectionIdx < sections.length - 1 && (
              <p className="text-[10px] text-slate-500 text-center mt-2">
                ⚠️ Submitted sections are locked permanently
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* ─── SECTION SUBMIT CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {showSectionSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f1729] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Submit Section?</h3>
                  <p className="text-amber-400 text-xs">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4">
                You are about to submit <strong className="text-white">{currentSection?.name}</strong>.
                {track.locked && ' Once submitted, this section will be locked and you cannot return to it.'}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-white/5 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-black text-emerald-400">{stats.answered}</div>
                  <div className="text-[10px] text-slate-500">Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-slate-400">{stats.total - stats.answered}</div>
                  <div className="text-[10px] text-slate-500">Skipped</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-purple-400">{stats.marked}</div>
                  <div className="text-[10px] text-slate-500">Marked</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSectionSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-slate-300 hover:text-white font-semibold text-sm transition-all">
                  Continue Answering
                </button>
                <button
                  onClick={handleSectionSubmit}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all"
                  style={{ backgroundColor: accent }}
                >
                  Submit & Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FINAL SUBMIT MODAL ─── */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0f1729] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Final Submission</h3>
                  <p className="text-slate-400 text-xs">Submit your complete assessment</p>
                </div>
              </div>

              {/* All sections summary */}
              <div className="space-y-2 mb-5">
                {sections.map((sec, si) => {
                  const ss = sectionStats(si);
                  return (
                    <div key={sec.id} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded-lg">
                      <span className="text-slate-400">{sec.icon} {sec.name}</span>
                      <span className="text-white font-semibold">{ss.answered}/{ss.total} answered</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
                <p className="text-red-300 text-xs leading-relaxed">
                  ⚠️ Once submitted, you cannot return to the assessment. Make sure you have answered all questions you wish to.
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/15 text-slate-300 hover:text-white font-semibold text-sm transition-all">
                  Go Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PROCTORING VIOLATION MODAL ─── */}
      <AnimatePresence>
        {showViolationModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-[#0f1729] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Proctoring Alert</h3>
                  <p className="text-red-400 font-bold text-sm">Violation {violations} of 3</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                You navigated away from the assessment window. This is a violation.
                <strong className="text-red-300"> {3 - violations} violation(s) remaining</strong> before auto-submit.
              </p>

              <div className="w-full bg-white/10 rounded-full h-2 mb-5">
                <div className="bg-red-500 h-full rounded-full transition-all" style={{ width: `${(violations / 3) * 100}%` }} />
              </div>

              <button
                onClick={() => {
                  setShowViolationModal(false);
                  enterFullscreen();
                }}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all"
              >
                I Understand — Return to Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CompanyExamEngine;
