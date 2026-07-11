import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
  const roundName = searchParams.get('roundName') || 'Assessment';
  
  // Parse duration like "30 Mins" or "45 Mins"
  const rawDuration = searchParams.get('duration') || '30 Mins';
  const durationMatch = rawDuration.match(/\d+/);
  const initialTimeMinutes = durationMatch ? parseInt(durationMatch[0], 10) : 30;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTimeMinutes * 60); // in seconds
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/assessments/${category}?limit=20`);
        setQuestions(res.data);
      } catch (err) {
        toast.error('Failed to load assessment questions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [category]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Format responses
    const formattedResponses = questions.map((q, idx) => ({
      questionId: q._id,
      selectedOption: responses[idx] || null,
      isSkipped: !responses[idx]
    }));

    try {
      const res = await api.post('/assessments/submit', {
        module: category,
        company: company || 'Practice',
        role: role || 'General',
        timeTakenMinutes: Math.round((initialTimeMinutes * 60 - timeLeft) / 60) || 1,
        responses: formattedResponses
      });

      toast.success('Assessment submitted successfully!');
      
      if (isSim && company) {
        navigate(`/companies/${company}?role=${encodeURIComponent(role)}&simComplete=true&score=${res.data.score}&round=${roundIndex}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Failed to submit assessment.');
      console.error(err);
      setSubmitting(false);
    }
  }, [category, company, initialTimeMinutes, isSim, navigate, questions, responses, role, roundIndex, submitting, timeLeft]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length, handleSubmit]);

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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>No questions found for this module.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  // Stats for palette
  const answeredCount = Object.keys(responses).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;
  const notAnsweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-white capitalize">{company ? `${company} - ${roundName}` : `${category} Assessment`}</h1>
          <p className="text-sm text-slate-500">{questions.length} Questions</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Time Left</p>
            <p className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 flex flex-col">
          <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
            
            {/* Question Info Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-indigo-400">Question {currentIndex + 1}</h2>
              <div className="flex gap-2">
                <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                  Multiple Choice
                </span>
                <span className="text-xs font-semibold bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                  +1 Correct | 0 Incorrect
                </span>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-lg md:text-xl text-white font-medium mb-8 leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options */}
            <div className="space-y-4 mb-10 flex-1">
              {currentQ.options.map((opt, i) => {
                const isSelected = responses[currentIndex] === opt;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                      isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                    </div>
                    <span className="text-lg">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-6 border-t border-slate-800 mt-auto">
              <div className="flex gap-3">
                <button 
                  onClick={toggleMarkForReview}
                  className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                    markedForReview[currentIndex] 
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {markedForReview[currentIndex] ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <button 
                  onClick={clearResponse}
                  disabled={!responses[currentIndex]}
                  className="px-4 py-2 rounded-lg font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear Response
                </button>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-6 py-2 rounded-lg font-bold bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="px-6 py-2 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Sidebar / Palette */}
        <aside className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-white mb-6">Question Palette</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">{answeredCount}</div>
              <span className="text-xs text-slate-400 font-medium">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">{notAnsweredCount}</div>
              <span className="text-xs text-slate-400 font-medium">Not Answered</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-6 h-6 rounded-md bg-purple-500 text-white flex items-center justify-center text-xs font-bold">{reviewCount}</div>
              <span className="text-xs text-slate-400 font-medium">Marked for Review</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const isAnswered = !!responses[idx];
              const isMarked = !!markedForReview[idx];
              const isCurrent = idx === currentIndex;
              
              let baseClass = "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all border-2 ";
              
              if (isCurrent) {
                baseClass += "border-indigo-500 bg-indigo-500/20 text-indigo-300";
              } else if (isMarked) {
                baseClass += "border-purple-500 bg-purple-500 text-white";
              } else if (isAnswered) {
                baseClass += "border-emerald-500 bg-emerald-500 text-white";
              } else {
                baseClass += "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:border-slate-600";
              }

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={baseClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AssessmentRoom;
