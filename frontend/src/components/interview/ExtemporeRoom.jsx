import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Shield, Send, Keyboard, Activity, CheckCircle2,
  AlertCircle, Zap, Brain, Play, Pause, User,
  Check, AlertTriangle, Mic, MessageSquare, ChevronRight, X, Maximize2, Minimize2, LogOut,
  HelpCircle, RefreshCw, Volume2, VolumeX, Hand, Sparkles, Users, Award, FileText, ArrowRight, HelpCircle as QuestionMark
} from 'lucide-react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaRobot } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExtemporeRoom = ({
  interview,
  onFinishExtempore
}) => {
  const [topicData, setTopicData] = useState(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  
  // Arena Steps: 'prep' | 'speech' | 'cross' | 'finishing'
  const [arenaStep, setArenaStep] = useState('prep');
  
  // Timers
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(45);
  const [speechSecondsLeft, setSpeechSecondsLeft] = useState(120);

  // Audio / Speech Recognition states
  const [isMuted, setIsMuted] = useState(false);
  const [candidateSpeechText, setCandidateSpeechText] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live Speech HUD stats
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(115);
  const [fluency, setFluency] = useState(82);
  const [confidence, setConfidence] = useState(85);
  const [topicCoverage, setTopicCoverage] = useState(70);

  // Cross-Questions states
  const [crossQuestions, setCrossQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState([]);
  const [crossAnswerInput, setCrossAnswerInput] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const prepTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Parse duration & prep time
  useEffect(() => {
    if (interview?.duration) {
      const mins = parseInt(interview.duration);
      if (!isNaN(mins)) setSpeechSecondsLeft(mins * 60);
    }
    if (interview?.subLanguage) {
      const prepSecs = parseInt(interview.subLanguage);
      if (!isNaN(prepSecs)) setPrepSecondsLeft(prepSecs);
    }
  }, [interview]);

  // Fetch Extempore Topic
  useEffect(() => {
    const fetchSetup = async () => {
      try {
        setLoadingSetup(true);
        const { data } = await api.post('/interviews/extempore/topic', {
          category: interview?.domain || interview?.projectName || 'Artificial Intelligence'
        });
        setTopicData(data.topicData);
      } catch (err) {
        toast.error('Failed to load Extempore Topic');
        console.error(err);
      } finally {
        setLoadingSetup(false);
      }
    };
    fetchSetup();
  }, [interview]);

  // Step 1: Prep Timer Countdown
  useEffect(() => {
    if (arenaStep !== 'prep') return;
    prepTimerRef.current = setInterval(() => {
      setPrepSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          handleStartSpeechStage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(prepTimerRef.current);
  }, [arenaStep]);

  // Step 2: Speech Timer Countdown
  useEffect(() => {
    if (arenaStep !== 'speech') return;
    speechTimerRef.current = setInterval(() => {
      setSpeechSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(speechTimerRef.current);
          handleFinishSpeechStage();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(speechTimerRef.current);
  }, [arenaStep]);

  // Web Speech Synthesis (TTS)
  const speakText = (text, pitch = 1.0, rate = 1.0) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      window.speechSynthesis.speak(utterance);
    } catch (e) { console.warn(e); }
  };

  // Web Speech Recognition Setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      if (arenaStep === 'speech') {
        setCandidateSpeechText(prev => prev + ' ' + currentText);

        const lower = (candidateSpeechText + ' ' + currentText).toLowerCase();
        const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know'];
        let count = 0;
        fillers.forEach(f => {
          const matches = lower.split(f).length - 1;
          count += matches;
        });
        setFillerCount(count);
      } else if (arenaStep === 'cross') {
        setCrossAnswerInput(currentText);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.abort();
        recognition.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, [arenaStep, candidateSpeechText]);

  const toggleMic = () => {
    if (isMuted) {
      setIsMuted(false);
      try { recognitionRef.current?.start(); } catch (e) { console.warn(e); }
    } else {
      setIsMuted(true);
      try { recognitionRef.current?.stop(); } catch (e) { console.warn(e); }
    }
  };

  // Transition: Start Speech Stage
  const handleStartSpeechStage = () => {
    clearInterval(prepTimerRef.current);
    setArenaStep('speech');
    speakText(`Your preparation time is complete. Please begin your extempore speech on: ${topicData?.topic}`, 1.0, 1.0);
  };

  // Transition: Finish Speech & Trigger Cross Questions
  const handleFinishSpeechStage = async () => {
    clearInterval(speechTimerRef.current);
    setArenaStep('cross');
    setLoadingFollowUp(true);

    try {
      const fullSpeech = (candidateSpeechText + ' ' + typedInput).trim();
      const { data } = await api.post(`/interviews/${interview._id}/extempore-followup`, {
        topic: topicData?.topic,
        speechText: fullSpeech
      });

      const qList = data.questions || [
        `Can you justify your primary argument regarding ${topicData?.topic}?`,
        `What real-world evidence supports your speech?`,
        `What trade-offs or disadvantages do you foresee?`
      ];
      setCrossQuestions(qList);
      setCurrentQIndex(0);
      speakText(qList[0], 1.0, 1.0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate follow-up cross questions');
    } finally {
      setLoadingFollowUp(false);
    }
  };

  // Submit answer to current cross question
  const handleSubmitCrossAnswer = () => {
    if (!crossAnswerInput.trim()) return;
    const currentQ = crossQuestions[currentQIndex];
    const newAnswers = [...followUpAnswers, { question: currentQ, answer: crossAnswerInput.trim() }];
    setFollowUpAnswers(newAnswers);
    setCrossAnswerInput('');

    if (currentQIndex + 1 < crossQuestions.length) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      speakText(crossQuestions[nextIdx], 1.0, 1.0);
    } else {
      // All follow-up questions completed! Submit for report
      handleCompleteExtempore(newAnswers);
    }
  };

  // Complete Extempore Round
  const handleCompleteExtempore = async (finalFollowUps = followUpAnswers) => {
    setIsFinishing(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
      const fullSpeech = (candidateSpeechText + ' ' + typedInput).trim();
      const { data } = await api.post(`/interviews/${interview._id}/extempore-report`, {
        speechText: fullSpeech,
        followUpQAs: finalFollowUps
      });
      await api.put(`/interviews/${interview._id}/finish`, { confidenceScore: confidence });
      toast.success('Extempore Evaluation Report generated successfully!');
      if (onFinishExtempore) {
        onFinishExtempore(data);
      } else {
        window.location.href = `/mock-report/${interview._id}`;
      }
    } catch (err) {
      console.error(err);
      toast.error('Error generating Extempore report');
      setIsFinishing(false);
    }
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loadingSetup) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white animate-pulse">Generating Extempore Topic...</h3>
          <p className="text-slate-400 text-xs mt-1">Fetching topic statement, background context, and key discussion angles.</p>
        </div>
      </div>
    );
  }

  // ─── STEP 1: PREPARATION STAGE (30-120s TIMER) ───────────────────────────
  if (arenaStep === 'prep') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Step 1: Preparation Stage
              </span>
              <h1 className="text-2xl font-black text-white mt-2">{topicData?.topic}</h1>
            </div>
            
            <div className="flex flex-col items-center bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Prep Timer</span>
              <span className="text-3xl font-mono font-black text-emerald-300">00:{prepSecondsLeft < 10 ? '0' : ''}{prepSecondsLeft}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Background Context:</h3>
            <p className="text-xs text-slate-200 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl leading-relaxed">
              {topicData?.context}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Recommended Talking Points:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(topicData?.keyTalkingPoints || ["Introduction & core stance", "Key benefits & opportunities", "Challenges & trade-offs", "Concluding outlook"]).map((pt, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <p className="text-xs text-slate-400">Structure your speech (Intro $\rightarrow$ Body $\rightarrow$ Conclusion). AI interviewer is ready.</p>
            <button
              onClick={handleStartSpeechStage}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              I'm Ready - Start Speaking Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── STEP 2 & STEP 3: LIVE SPEECH & CROSS-QUESTIONS ARENA ─────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FaMicrophone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {arenaStep === 'speech' ? 'Step 2: Continuous Speech' : 'Step 3: Cross-Examination Q&A'}
              </span>
              <span className="text-xs font-semibold text-slate-400">• {topicData?.category}</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-xl">{topicData?.topic}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {arenaStep === 'speech' && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white">{formatTime(speechSecondsLeft)}</span>
            </div>
          )}

          {arenaStep === 'speech' ? (
            <button
              onClick={handleFinishSpeechStage}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              Finish Speech &amp; Go To Cross-Questions <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleCompleteExtempore()}
              disabled={isFinishing}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg cursor-pointer"
            >
              {isFinishing ? 'Compiling Extempore Report...' : 'Finish & View Report'}
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 p-4 gap-4 overflow-hidden">
        
        {/* LEFT 2 COLS: INTERVIEWER & SPEECH HUD */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto">
          
          {/* AI INTERVIEWER AVATAR CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex items-center gap-6 backdrop-blur-md relative overflow-hidden">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 p-0.5 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300"
                  alt="AI Interviewer"
                  className="w-full h-full rounded-full object-cover bg-slate-950"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full text-xs">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Senior Extempore Examiner
              </span>
              <h2 className="text-base font-bold text-white">Dr. Marcus Vance</h2>
              <p className="text-xs text-slate-300 italic">
                {arenaStep === 'speech'
                  ? `"Listening attentively to your continuous speech. Focus on clarity, logical flow, and evidence."`
                  : loadingFollowUp
                  ? `"Analyzing your speech transcript to formulate cross-examination questions..."`
                  : `"Cross-Question ${currentQIndex + 1} of ${crossQuestions.length}: ${crossQuestions[currentQIndex]}"`}
              </p>
            </div>
          </div>

          {/* STEP 2: CONTINUOUS SPEECH ARENA */}
          {arenaStep === 'speech' && (
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md space-y-4">
              
              {/* Live Speech Display */}
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Speech Transcript:</span>
                  <button
                    onClick={toggleMic}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isMuted ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {!isMuted ? <FaMicrophone className="w-3.5 h-3.5" /> : <FaMicrophoneSlash className="w-3.5 h-3.5" />}
                    {!isMuted ? 'Mic Live' : 'Unmute Mic'}
                  </button>
                </div>

                <div className="min-h-[140px] max-h-[220px] bg-slate-950/70 border border-slate-800 rounded-2xl p-4 overflow-y-auto text-xs text-slate-200 leading-relaxed font-mono">
                  {candidateSpeechText || typedInput ? (
                    <span>{candidateSpeechText} {typedInput}</span>
                  ) : (
                    <span className="text-slate-500 italic">Start speaking into your mic or type below to deliver your speech...</span>
                  )}
                </div>
              </div>

              {/* Text Input Fallback */}
              <div className="bg-slate-950 border border-slate-800 p-2 rounded-2xl flex items-center gap-2">
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Or type speech sentences here..."
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* LIVE HUD STATS */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fillers</span>
                  <span className="text-sm font-black text-amber-400">{fillerCount}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Speed</span>
                  <span className="text-sm font-black text-blue-400">{wpm} WPM</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fluency</span>
                  <span className="text-sm font-black text-emerald-400">{fluency}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Confidence</span>
                  <span className="text-sm font-black text-purple-400">{confidence}%</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Coverage</span>
                  <span className="text-sm font-black text-indigo-400">{topicCoverage}%</span>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: CROSS-EXAMINATION STAGE */}
          {arenaStep === 'cross' && (
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md space-y-4">
              {loadingFollowUp ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-xs text-slate-300 animate-pulse">Formulating cross-examination follow-up questions...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Cross-Question {currentQIndex + 1} of {crossQuestions.length}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {followUpAnswers.length} answered
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl">
                      <p className="text-sm font-bold text-white">{crossQuestions[currentQIndex]}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Response:</label>
                      <textarea
                        value={crossAnswerInput}
                        onChange={(e) => setCrossAnswerInput(e.target.value)}
                        placeholder="Speak or type your answer to justify your point..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-28 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={toggleMic}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        !isMuted ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {!isMuted ? <FaMicrophone /> : <FaMicrophoneSlash />} Mic Input
                    </button>

                    <button
                      onClick={handleSubmitCrossAnswer}
                      disabled={!crossAnswerInput.trim()}
                      className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      Submit &amp; Next Question <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COL: TOPIC & CROSS Q&A RECAP */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between backdrop-blur-md">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Topic Context</span>
              <h3 className="text-xs font-bold text-white mt-1">{topicData?.topic}</h3>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Recorded Follow-up Q&amp;A:</span>
              {followUpAnswers.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">Follow-up cross answers will appear here after speech completion.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {followUpAnswers.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 block">Q: {item.question}</span>
                      <p className="text-[11px] text-slate-300 italic">"{item.answer}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-400">
            💡 Extempore Tip: Deliver a clear 3-part structure (Introduction, Body argument, Conclusion) before handling follow-up cross questions.
          </div>
        </div>

      </div>
    </div>
  );
};

export default ExtemporeRoom;
