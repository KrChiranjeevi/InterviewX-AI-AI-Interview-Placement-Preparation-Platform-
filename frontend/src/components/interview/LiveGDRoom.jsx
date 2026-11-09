import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Shield, Send, Keyboard, Activity, CheckCircle2,
  AlertCircle, Zap, Brain, Play, Pause, User,
  Check, AlertTriangle, Mic, MessageSquare, ChevronRight, X, Maximize2, Minimize2, LogOut,
  HelpCircle, RefreshCw, Volume2, VolumeX, Hand, Sparkles, Users, Award, FileText, ArrowRight
} from 'lucide-react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaRobot } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const LiveGDRoom = ({
  interview,
  onFinishGD
}) => {
  const [topicData, setTopicData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [turnLoading, setTurnLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  // Preparation Stage states
  const [isPrepPhase, setIsPrepPhase] = useState(true);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(45);

  // Audio / Speech Recognition states
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakingMode, setIsSpeakingMode] = useState(true);
  const [typedInput, setTypedInput] = useState('');
  const [candidateSpeechText, setCandidateSpeechText] = useState('');
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);

  // Live HUD stats
  const [fillerCount, setFillerCount] = useState(0);
  const [wpm, setWpm] = useState(120);
  const [fluency, setFluency] = useState(85);
  const [confidence, setConfidence] = useState(82);
  const [leadership, setLeadership] = useState(75);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const prepTimerRef = useRef(null);

  // Parse duration from string (e.g., "10 Minutes" -> 600)
  useEffect(() => {
    if (interview?.duration) {
      const mins = parseInt(interview.duration);
      if (!isNaN(mins)) {
        setSecondsLeft(mins * 60);
      }
    }
  }, [interview]);

  // Preparation Stage 45-Second Countdown
  useEffect(() => {
    if (!isPrepPhase) return;
    prepTimerRef.current = setInterval(() => {
      setPrepSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          handleStartDiscussion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(prepTimerRef.current);
  }, [isPrepPhase]);

  // Live Discussion Timer Countdown (starts after prep phase)
  useEffect(() => {
    if (isPrepPhase) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPrepPhase]);

  // Fetch GD Topic & 5 AI Participants Setup
  useEffect(() => {
    const fetchSetup = async () => {
      try {
        setLoadingSetup(true);
        const { data } = await api.post('/interviews/gd/topic', {
          category: interview?.domain || interview?.projectName || 'Placement Topics',
          difficulty: interview?.difficulty || 'Intermediate'
        });
        setTopicData(data.topicData);
        setParticipants((data.participants || []).slice(0, 5));
      } catch (err) {
        toast.error('Failed to load GD Topic details');
        console.error(err);
      } finally {
        setLoadingSetup(false);
      }
    };

    fetchSetup();
  }, [interview]);

  // Start discussion after prep
  const handleStartDiscussion = () => {
    setIsPrepPhase(false);
    clearInterval(prepTimerRef.current);

    const moderatorMsg = {
      id: 'mod-1',
      speakerId: 'moderator',
      speakerName: 'Panel Chairperson',
      speakerRole: 'AI Moderator',
      text: topicData?.moderatorIntro || `Welcome candidates. Today's GD topic is: "${topicData?.topic}". Rules: Maintain decorum, present logical points, avoid interrupting others, and listen actively. You may begin the discussion now.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      turnType: 'moderator_nudge'
    };

    setHistory([moderatorMsg]);
    setActiveSpeakerId('moderator');
    speakText(moderatorMsg.text, 1.0, 1.0);
  };

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, activeSpeakerId]);

  // Web Speech Synthesis (TTS)
  const speakText = (text, pitch = 1.0, rate = 1.0, voiceIdx = 0) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        const selectedVoice = englishVoices[voiceIdx % englishVoices.length] || voices[0];
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
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
      setCandidateSpeechText(currentText);

      const lower = currentText.toLowerCase();
      const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know'];
      let count = 0;
      fillers.forEach(f => {
        const matches = lower.split(f).length - 1;
        count += matches;
      });
      setFillerCount(count);
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
  }, []);

  const toggleMic = () => {
    if (isMuted) {
      setIsMuted(false);
      try {
        recognitionRef.current?.start();
        setIsCandidateSpeaking(true);
      } catch (e) { console.warn(e); }
    } else {
      setIsMuted(true);
      try {
        recognitionRef.current?.stop();
        setIsCandidateSpeaking(false);
      } catch (e) { console.warn(e); }
    }
  };

  // Trigger next turn in GD
  const triggerNextTurn = async (userText = '') => {
    if (turnLoading) return;
    setTurnLoading(true);

    try {
      const minutes = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      const timeStr = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

      let updatedHistory = [...history];
      if (userText.trim()) {
        const userMsg = {
          id: `user-${Date.now()}`,
          speakerId: 'user',
          speakerName: 'You (Candidate)',
          speakerRole: 'Group Candidate',
          isUser: true,
          text: userText.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        updatedHistory.push(userMsg);
        setHistory(updatedHistory);
        setTypedInput('');
        setCandidateSpeechText('');
      }

      const { data } = await api.post(`/interviews/${interview?._id}/gd-turn`, {
        topic: topicData?.topic,
        participants,
        history: updatedHistory,
        userResponse: userText.trim(),
        timeRemaining: timeStr
      });

      if (data && data.text) {
        const nextTurnMsg = {
          id: `turn-${Date.now()}`,
          speakerId: data.speakerId,
          speakerName: data.speakerName,
          speakerRole: data.speakerRole,
          text: data.text,
          turnType: data.turnType,
          targetedParticipant: data.targetedParticipant,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setActiveSpeakerId(data.speakerId);
        setHistory(prev => [...prev, nextTurnMsg]);

        const speakerP = participants.find(p => p.id === data.speakerId);
        const pitch = speakerP?.pitch || (data.speakerId === 'moderator' ? 1.0 : 1.05);
        const rate = speakerP?.rate || 1.0;
        const voiceIdx = speakerP?.voiceIndex || 0;

        speakText(data.text, pitch, rate, voiceIdx);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to trigger next participant turn');
    } finally {
      setTurnLoading(false);
    }
  };

  // End GD and submit evaluation request
  const handleCompleteGD = async () => {
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
      const { data } = await api.post(`/interviews/${interview._id}/gd-report`, {
        transcript: history
      });
      await api.put(`/interviews/${interview._id}/finish`, { confidenceScore: confidence });
      toast.success('GD Evaluation Report generated successfully!');
      if (onFinishGD) {
        onFinishGD(data);
      } else {
        window.location.href = `/mock-report/${interview._id}`;
      }
    } catch (err) {
      console.error(err);
      toast.error('Error finishing GD evaluation');
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
          <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white animate-pulse">Initializing AI Group Discussion Room...</h3>
          <p className="text-slate-400 text-xs mt-1">Generating topic, assembling 5 candidate profiles, and setting up moderator rules.</p>
        </div>
      </div>
    );
  }

  // ─── PREPARATION STAGE SCREEN (30-60s TIMER) ─────────────────────────────
  if (isPrepPhase) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Phase 1: Topic Brainstorming &amp; Preparation
              </span>
              <h1 className="text-2xl font-black text-white mt-2">{topicData?.topic}</h1>
            </div>
            
            {/* 45s Preparation Timer Badge */}
            <div className="flex flex-col items-center bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Prep Time Left</span>
              <span className="text-3xl font-mono font-black text-amber-300">00:{prepSecondsLeft < 10 ? '0' : ''}{prepSecondsLeft}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Background Context:</h3>
            <p className="text-xs text-slate-200 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl leading-relaxed">
              {topicData?.context}
            </p>
          </div>

          {/* Key Angles to Consider */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Key Discussion Angles to Brainstorm:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(topicData?.keyAngles || ["Economic impact", "Ethical feasibility", "Short vs long term", "Solutions"]).map((angle, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{angle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <p className="text-xs text-slate-400">
              Gather your key points. 5 AI candidates and the Moderator are waiting in the room.
            </p>
            <button
              onClick={handleStartDiscussion}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              Start GD Discussion Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── LIVE GD DISCUSSION ARENA ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ─── HEADER ──────────────────────────────────────────────────────────── */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Campus Group Discussion
              </span>
              <span className="text-xs font-semibold text-slate-400">• {topicData?.category}</span>
              <span className="text-xs font-medium text-slate-500">[{interview?.difficulty || 'Intermediate'}]</span>
            </div>
            <h1 className="text-sm font-bold text-white truncate max-w-xl">{topicData?.topic}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white">{formatTime(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={handleCompleteGD}
            disabled={isFinishing}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            {isFinishing ? 'Compiling Report...' : 'End Discussion & Submit'}
          </button>
        </div>
      </header>

      {/* ─── MAIN ARENA CONTENT ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          
          {/* Moderator Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/20 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                M
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">AI Moderator Status</span>
                <p className="text-xs text-slate-200 font-medium italic">"{topicData?.context || 'Rules: Maintain decorum, support arguments with evidence, and respect peers.'}"</p>
              </div>
            </div>
            <button
              onClick={() => triggerNextTurn()}
              disabled={turnLoading}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Next Turn Nudge
            </button>
          </div>

          {/* 5 AI CANDIDATES + USER CANDIDATE GRID (6 CARDS TOTAL) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {participants.map((p) => {
              const isSpeaking = activeSpeakerId === p.id;
              return (
                <motion.div
                  key={p.id}
                  animate={{ scale: isSpeaking ? 1.02 : 1.0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative bg-slate-900/70 rounded-2xl border p-4 flex flex-col justify-between backdrop-blur-md overflow-hidden transition-all ${
                    isSpeaking
                      ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                      {p.personality}
                    </span>
                    {isSpeaking && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Speaking
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center my-2">
                    <div className="relative mb-2">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${p.badgeColor || 'from-blue-500 to-indigo-600'} p-0.5 shadow-lg`}>
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-full h-full rounded-full object-cover bg-slate-950"
                        />
                      </div>
                      {isSpeaking && (
                        <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full text-xs">
                          <Volume2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{p.speakingStyle}</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-2 mt-2">
                    <p className="text-[10px] text-slate-300 italic line-clamp-2">
                      "{p.initialOpinion}"
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* CANDIDATE (USER) CARD */}
            <div className={`relative bg-slate-900/90 rounded-2xl border p-4 flex flex-col justify-between backdrop-blur-md border-indigo-500/40 shadow-lg ${
              isCandidateSpeaking ? 'ring-2 ring-indigo-400/50' : ''
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  You (Candidate)
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active Participant
                </span>
              </div>

              <div className="flex flex-col items-center my-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shadow-lg flex items-center justify-center text-white font-black text-xl mb-2">
                  YOU
                </div>
                <h3 className="text-xs font-bold text-white">Your Perspective</h3>
                <p className="text-[10px] text-slate-400">Speak or type to join discussion</p>
              </div>

              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    !isMuted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {!isMuted ? <FaMicrophone className="w-3.5 h-3.5" /> : <FaMicrophoneSlash className="w-3.5 h-3.5" />}
                  {!isMuted ? 'Mic Live' : 'Unmute Mic'}
                </button>

                <button
                  onClick={() => triggerNextTurn("I would like to jump in and add to that point.")}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Hand className="w-3.5 h-3.5" /> Raise Hand
                </button>
              </div>
            </div>
          </div>

          {/* LIVE HUD ANALYTICS BAR */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 md:grid-cols-5 gap-3 backdrop-blur-md">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Filler Words</span>
              <span className="text-sm font-black text-amber-400">{fillerCount} detected</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Speaking Speed</span>
              <span className="text-sm font-black text-blue-400">{wpm} WPM</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fluency Score</span>
              <span className="text-sm font-black text-emerald-400">{fluency}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Confidence Gauge</span>
              <span className="text-sm font-black text-purple-400">{confidence}%</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Leadership Meter</span>
              <span className="text-sm font-black text-indigo-400">{leadership}%</span>
            </div>
          </div>

          {/* INPUT BAR FOR USER ARGUMENTS */}
          <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl flex items-center gap-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && typedInput.trim()) {
                  triggerNextTurn(typedInput);
                }
              }}
              placeholder="Type your argument or response to join the group discussion..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              onClick={() => typedInput.trim() && triggerNextTurn(typedInput)}
              disabled={turnLoading || !typedInput.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit Argument
            </button>
          </div>

        </div>

        {/* RIGHT SIDE: LIVE COLOR-CODED TRANSCRIPT */}
        <div className="w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col justify-between backdrop-blur-md">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> Live Discussion Transcript
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {history.length} turns
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {history.map((msg) => {
              const isUser = msg.isUser || msg.speakerId === 'user';
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-2xl text-xs border transition-all ${
                    isUser
                      ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100 ml-3'
                      : msg.speakerId === 'moderator'
                      ? 'bg-amber-950/30 border-amber-500/30 text-amber-100'
                      : 'bg-slate-950/60 border-slate-800 text-slate-200 mr-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-bold ${isUser ? 'text-indigo-400' : 'text-amber-400'}`}>
                      {msg.speakerName}
                    </span>
                    <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiveGDRoom;
