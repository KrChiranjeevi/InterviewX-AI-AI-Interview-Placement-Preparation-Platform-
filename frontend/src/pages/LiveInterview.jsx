import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaStopCircle, FaRobot, FaUserAlt, FaPaperPlane,
  FaBookmark, FaRegBookmark, FaPlay, FaPause
} from 'react-icons/fa';
import api from '../services/api';
import * as faceapi from '@vladmandic/face-api';

const AUTO_SUBMIT_DELAY = 60 * 1000; // 1 minute after last speech

const LiveInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [interview, setInterview]     = useState(null);
  const [isCameraOn, setIsCameraOn]   = useState(true);
  const [isMuted, setIsMuted]         = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream]           = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState('Loading AI question...');
  const [isAIThinking, setIsAIThinking]       = useState(true);
  const [aiSpeaking, setAiSpeaking]           = useState(false);

  // Speech recognition state
  const [finalTranscript, setFinalTranscript]   = useState('');   // confirmed words
  const [interimTranscript, setInterimTranscript] = useState(''); // live preview
  const [isTypingMode, setIsTypingMode]          = useState(false); // user switched to keyboard
  const [typedAnswer, setTypedAnswer]            = useState('');    // keyboard input

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceStatus, setFaceStatus]     = useState('Loading scanner...');
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [sessionTimeLeft, setSessionTimeLeft]         = useState(null); // seconds

  // HUD and performance indicators
  const [hudWpm, setHudWpm] = useState(130);
  const [hudClarity, setHudClarity] = useState(92);
  const [hudFillers, setHudFillers] = useState(0);
  const [hudEyeContact, setHudEyeContact] = useState(88);
  const [isPaused, setIsPaused] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Refs
  const recognitionRef      = useRef(null);
  const synthRef            = useRef(window.speechSynthesis);
  const autoSubmitTimer     = useRef(null);
  const countdownInterval   = useRef(null);
  const currentQuestionRef  = useRef('Loading AI question...');
  const isAIThinkingRef     = useRef(true);
  const finalTranscriptRef  = useRef('');
  const isTypingModeRef     = useRef(false);
  const isPausedRef         = useRef(false);
  const confidenceData      = useRef({ total: 0, count: 0 });
  const faceInterval        = useRef(null);
  const sessionTimerRef     = useRef(null);
  const voiceRef            = useRef(null); // selected female voice

  useEffect(() => { currentQuestionRef.current  = currentQuestion; }, [currentQuestion]);
  useEffect(() => { isAIThinkingRef.current     = isAIThinking;    }, [isAIThinking]);
  useEffect(() => { finalTranscriptRef.current  = finalTranscript; }, [finalTranscript]);
  useEffect(() => { isTypingModeRef.current     = isTypingMode;    }, [isTypingMode]);
  useEffect(() => { isPausedRef.current         = isPaused;        }, [isPaused]);

  /* ─── Web Audio Analyser Visualizer ─── */
  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = audioContext;
      analyserRef.current = analyser;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(15, 23, 42, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          const red = Math.floor(99 + i * 4);
          const green = Math.floor(102 - i);
          const blue = Math.floor(241 - i);
          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 1, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) {
      console.warn('Analyser not initialized', e);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [stream]);

  /* ─── Transcript Analysis for HUD ─── */
  useEffect(() => {
    if (!finalTranscript) return;
    const fillers = ['um', 'uh', 'like', 'so', 'actually', 'you know'];
    const words = finalTranscript.toLowerCase().split(/\s+/);
    let count = 0;
    words.forEach(w => {
      if (fillers.includes(w)) count++;
    });
    setHudFillers(count);
    setHudWpm(Math.round(110 + (words.length % 35)));
  }, [finalTranscript]);

  /* ─── Eye Contact Simulated Metrics ─── */
  useEffect(() => {
    if (faceStatus.includes('active')) {
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        setHudEyeContact(prev => {
          const delta = Math.floor(Math.random() * 7) - 3;
          return Math.min(100, Math.max(70, prev + delta));
        });
        setHudClarity(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.min(100, Math.max(80, prev + delta));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [faceStatus]);

  /* ─── Pre-load best female voice ─── */
  useEffect(() => {
    const PREFERRED_FEMALE_VOICES = [
      'Google UK English Female',
      'Microsoft Sonia Online (Natural) - English (United Kingdom)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Zira Desktop - English (United States)',
      'Samantha',
      'Karen',
      'Moira',
      'Victoria',
      'Google US English',
    ];
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      for (const name of PREFERRED_FEMALE_VOICES) {
        const v = voices.find(v => v.name === name);
        if (v) { voiceRef.current = v; return; }
      }
      const femaleEn = voices.find(
        v => v.lang.startsWith('en') && /female|woman|girl/i.test(v.name)
      );
      if (femaleEn) { voiceRef.current = femaleEn; return; }
      const anyEn = voices.find(v => v.lang.startsWith('en'));
      if (anyEn) voiceRef.current = anyEn;
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  /* ─── Session duration countdown ─── */
  useEffect(() => {
    if (!interview) return;
    const parseDuration = (dur) => {
      const match = dur.match(/(\d+)/);
      return match ? parseInt(match[1], 10) * 60 : 15 * 60;
    };
    let secs = parseDuration(interview.duration);
    setSessionTimeLeft(secs);
    sessionTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return;
      secs -= 1;
      setSessionTimeLeft(secs);
      if (secs <= 0) clearInterval(sessionTimerRef.current);
    }, 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [interview]);

  /* ─── Face-API models ─── */
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setFaceStatus('Scanner ready');
      } catch {
        setFaceStatus('Scanner unavailable');
      }
    };
    loadModels();
    return () => { if (faceInterval.current) clearInterval(faceInterval.current); };
  }, []);

  useEffect(() => {
    if (modelsLoaded && isCameraOn && videoRef.current) {
      faceInterval.current = setInterval(async () => {
        if (isPausedRef.current) return;
        if (videoRef.current?.readyState === 4 && !videoRef.current.paused) {
          try {
            const det = await faceapi
              .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();
            if (det) {
              setFaceStatus('Scanning active...');
              const e = det.expressions;
              const s = e.happy * 100 + e.neutral * 85 + e.surprised * 50 + e.sad * 10 + e.fearful * 5 + e.angry * 5;
              confidenceData.current.total += Math.min(100, Math.max(0, s));
              confidenceData.current.count += 1;
            } else {
              setFaceStatus('No face detected');
            }
          } catch { /* silent */ }
        }
      }, 1500);
    } else {
      if (faceInterval.current) clearInterval(faceInterval.current);
      if (!isCameraOn) setFaceStatus('Camera is off');
    }
    return () => { if (faceInterval.current) clearInterval(faceInterval.current); };
  }, [modelsLoaded, isCameraOn]);

  /* ─── Camera + Recognition init ─── */
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 3840 }, height: { ideal: 2160 } }, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error('Camera access denied', err);
      }
    };

    const fetchInterviewAndStart = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data);
        fetchNextQuestion();
      } catch {
        navigate('/dashboard');
      }
    };

    initCamera();
    fetchInterviewAndStart();

    /* ── Speech Recognition setup ── */
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous      = true;
      recognition.interimResults  = true;
      recognition.lang            = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        if (isAIThinkingRef.current || isTypingModeRef.current) return;

        let newFinal  = '';
        let interim   = '';

        // Only process results from where we left off
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        if (newFinal) {
          setFinalTranscript(prev => {
            const updated = prev + newFinal;
            finalTranscriptRef.current = updated;
            return updated;
          });
          setInterimTranscript('');
          // Reset the 1-minute auto-submit countdown on each new final word
          scheduleAutoSubmit();
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.error('Speech error:', e.error);
        }
      };

      // Auto restart on end (browser cuts recognition after ~1 min silence)
      recognition.onend = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current) {
          try { recognition.start(); } catch { /* already running */ }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      synthRef.current.cancel();
      recognitionRef.current?.stop();
      clearAutoSubmitTimers();
    };
  }, [id]);

  /* ─── Auto-submit timer helpers ─── */
  const clearAutoSubmitTimers = () => {
    if (autoSubmitTimer.current)   clearTimeout(autoSubmitTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    autoSubmitTimer.current   = null;
    countdownInterval.current = null;
    setAutoSubmitCountdown(null);
  };

  const scheduleAutoSubmit = () => {
    // Always reset the 1-min timeout (silence window restarts on each spoken word)
    if (autoSubmitTimer.current) clearTimeout(autoSubmitTimer.current);
    autoSubmitTimer.current = setTimeout(() => {
      setAutoSubmitCountdown(null);
      submitAnswer();
    }, AUTO_SUBMIT_DELAY);

    // Start the visual countdown interval only if not already running
    if (!countdownInterval.current) {
      setAutoSubmitCountdown(60);
      countdownInterval.current = setInterval(() => {
        setAutoSubmitCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  /* ─── TTS with natural female voice ─── */
  const speakText = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply best female voice
    if (voiceRef.current) utterance.voice = voiceRef.current;

    // Natural, warm, conversational settings
    utterance.lang  = 'en-US';
    utterance.rate  = 0.92;   // slightly slower than default — feels human
    utterance.pitch = 1.08;   // slightly higher for feminine, NOT robotic
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setAiSpeaking(true);
      recognitionRef.current?.stop();
      setIsRecording(false);
    };
    utterance.onend = () => {
      setAiSpeaking(false);
      startListening();
    };
    utterance.onerror = () => {
      setAiSpeaking(false);
      startListening();
    };
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isMuted && !isTypingMode) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch { /* already running */ }
    }
  };

  /* ─── Questions ─── */
  const fetchNextQuestion = async () => {
    setIsAIThinking(true);
    setCurrentQuestion('AI is generating the next question...');
    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();

    try {
      const res = await api.post(`/interviews/${id}/question`);
      setCurrentQuestion(res.data.question);
      speakText(res.data.question);
    } catch {
      const fallback = 'Could you tell me more about your previous experience?';
      setCurrentQuestion(fallback);
      speakText(fallback);
    } finally {
      setIsAIThinking(false);
    }
  };

  /* ─── Submit answer ─── */
  const submitAnswer = async () => {
    const answer = isTypingModeRef.current
      ? typedAnswer.trim()
      : finalTranscriptRef.current.trim();

    if (!answer || isAIThinkingRef.current) return;

    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setIsAIThinking(true);
    setFinalTranscript('');
    setInterimTranscript('');
    setTypedAnswer('');
    finalTranscriptRef.current = '';

    const wasBookmarked = isBookmarked;
    setIsBookmarked(false);

    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        question: currentQuestionRef.current,
        answer,
        bookmarked: wasBookmarked
      });

      if (res.data.isClarification) {
        // AI speaks the clarification
        speakText(res.data.feedback);
        // Append to current question text so user sees the context
        setCurrentQuestion(prev => prev + '\n\n💡 AI Clarification:\n' + res.data.feedback);
        setIsAIThinking(false);
      } else {
        if (res.data.nextQuestion) {
          setCurrentQuestion(res.data.nextQuestion);
          speakText(res.data.nextQuestion);
          setIsAIThinking(false);
        } else {
          fetchNextQuestion();
        }
      }
    } catch {
      setIsAIThinking(false);
      startListening();
    }
  };

  const skipQuestion = async () => {
    if (isAIThinkingRef.current) return;

    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setIsAIThinking(true);
    setFinalTranscript('');
    setInterimTranscript('');
    setTypedAnswer('');
    finalTranscriptRef.current = '';

    try {
      const res = await api.post(`/interviews/${id}/answer`, {
        question: currentQuestionRef.current,
        answer: 'Skipped',
      });

      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        speakText(res.data.nextQuestion);
        setIsAIThinking(false);
      } else {
        fetchNextQuestion();
      }
    } catch {
      setIsAIThinking(false);
      startListening();
    }
  };

  /* ─── Typing mode toggle ─── */
  const switchToTyping = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    // Move any spoken text to the typed box
    setTypedAnswer(finalTranscript.trim());
    setFinalTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setIsTypingMode(true);
  };

  const switchToSpeaking = () => {
    setIsTypingMode(false);
    isTypingModeRef.current = false;
    // Move typed text back to spoken
    setFinalTranscript(typedAnswer);
    finalTranscriptRef.current = typedAnswer;
    setTypedAnswer('');
    startListening();
  };

  const handleTypedChange = (e) => {
    setTypedAnswer(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) {
        recognitionRef.current?.stop();
        setIsRecording(false);
        synthRef.current.cancel();
      } else {
        startListening();
      }
      return next;
    });
  };

  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
  };

  /* ─── Camera / Mic toggles ─── */
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isCameraOn;
      setIsCameraOn(v => !v);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(m => {
        if (!m) { recognitionRef.current?.stop(); setIsRecording(false); }
        else if (!isAIThinking && !aiSpeaking) startListening();
        return !m;
      });
    }
  };

  const endInterview = async () => {
    if (window.confirm('Are you sure you want to end the interview?')) {
      // Immediately stop media to show responsiveness
      stream?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
      synthRef.current.cancel();
      recognitionRef.current?.stop();
      clearAutoSubmitTimers();

      const avgConf = confidenceData.current.count > 0
        ? Math.round(confidenceData.current.total / confidenceData.current.count)
        : 0;
      
      let finalScore = 70;
      try {
        const res = await api.put(`/interviews/${id}/finish`, { confidenceScore: avgConf });
        if (res.data && res.data.score !== undefined) {
          finalScore = res.data.score;
        }
      } catch (err) {
        console.error('Failed to finish interview', err);
      }

      // Check if this was launched from a recruitment simulation
      const params = new URLSearchParams(window.location.search);
      const isSim = params.get('sim') === 'true';
      if (isSim) {
        const companyName = params.get('company');
        const role = params.get('role');
        const roundIndex = parseInt(params.get('roundIndex') || '0', 10);
        
        // Save status to localStorage
        const simKey = `recruitment_sim_${companyName}_${role}`;
        let simData = JSON.parse(localStorage.getItem(simKey)) || { currentRoundIndex: 0, scores: {} };
        
        simData.scores[roundIndex] = finalScore;
        
        // If passing score is met (most rounds pass with >= 60%)
        if (finalScore >= 60) {
          simData.currentRoundIndex = Math.max(simData.currentRoundIndex, roundIndex + 1);
        }
        
        localStorage.setItem(simKey, JSON.stringify(simData));
        navigate(`/companies/${companyName}?role=${encodeURIComponent(role)}&simComplete=true&round=${roundIndex}&score=${finalScore}`);
        return;
      }

      navigate('/dashboard');
    }
  };

  if (!interview) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Loading Room...</div>;
  }

  /* Composed display text (what user will see) */
  const displayText = isTypingMode
    ? typedAnswer
    : finalTranscript + (interimTranscript ? `\u00A0\u00A0[${interimTranscript}]` : '');

  const canSubmit = isTypingMode
    ? typedAnswer.trim().length > 0
    : finalTranscript.trim().length > 0;

  return (
    <div className="h-screen bg-slate-950 flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-4 bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-lg flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse mr-3" />
            Live Mock Interview
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">{interview.role} • {interview.difficulty}</p>
        </div>
        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePause} className="bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-slate-700 flex items-center text-sm">
            {isPaused ? <><FaPlay className="mr-2 text-green-400 animate-pulse" /> Resume</> : <><FaPause className="mr-2 text-amber-400" /> Pause</>}
          </button>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border font-mono tracking-wider transition-colors ${
            sessionTimeLeft !== null && sessionTimeLeft < 120
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-slate-800 border-slate-700 text-white'
          }`}>
            {sessionTimeLeft !== null
              ? `⏱ ${String(Math.floor(sessionTimeLeft / 60)).padStart(2,'0')}:${String(sessionTimeLeft % 60).padStart(2,'0')}`
              : `⏳ ${interview.duration}`}
          </div>
          <button onClick={endInterview} className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-medium transition-colors border border-red-500/50 flex items-center text-sm">
            <FaStopCircle className="mr-2" /> End
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Left: AI Panel */}
        <div className="w-1/3 flex flex-col gap-3 min-h-0">
          {/* AI Avatar — full panel realistic image */}
          <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden min-h-0">
            {/* Background image */}
            <img
              src="/ai_interviewer.png"
              alt="AI Interviewer"
              className="w-full h-full object-cover object-top"
            />

            {/* Subtle gradient overlay always present */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent pointer-events-none" />

            {/* Speaking pulse ring */}
            {aiSpeaking && (
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-3xl border-2 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)] pointer-events-none"
              />
            )}

            {/* Thinking shimmer overlay */}
            {isAIThinking && (
              <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] pointer-events-none rounded-3xl" />
            )}

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-slate-950 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold leading-tight">Sarah — HR Interviewer</p>
                  <p className={`text-xs font-medium mt-0.5 ${isAIThinking ? 'text-amber-400' : aiSpeaking ? 'text-indigo-400' : 'text-emerald-400'}`}>
                    {isAIThinking ? '🤔 Analyzing your answer...' : aiSpeaking ? '🎙️ Speaking...' : '👂 Listening...'}
                  </p>
                </div>
                {/* Lip-sync bars when speaking */}
                {aiSpeaking && (
                  <div className="flex items-end gap-0.5 h-6">
                    {[1,2,3,4,5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: ['4px','20px','4px'] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.08 }}
                        className="w-1 bg-indigo-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="h-1/3 bg-indigo-900/30 rounded-3xl border border-indigo-500/30 p-4 flex flex-col min-h-0">
            <h3 className="text-indigo-300 font-medium mb-2 text-xs flex items-center flex-shrink-0">
              <FaRobot className="mr-2" /> Current Question
            </h3>
            <p className="text-white text-sm font-medium leading-relaxed overflow-y-auto no-scrollbar whitespace-pre-wrap">
              {currentQuestion}
            </p>
          </div>
        </div>

        {/* Right: Candidate Panel */}
        <div className="w-2/3 flex flex-col gap-3 min-h-0">
          {/* Webcam */}
          <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden group min-h-0">
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`} />
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                <FaUserAlt className="text-5xl text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">Camera is off</p>
              </div>
            )}

            {/* Face scanner badge */}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-2 z-10">
              <span className={`w-1.5 h-1.5 rounded-full ${faceStatus.includes('active') ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-xs text-slate-300">{faceStatus}</span>
            </div>

            {/* HUD Indicators Grid */}
            <div className="absolute top-14 left-3 flex flex-col gap-2 z-10">
              <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
                <span>⏱️ WPM:</span>
                <span className="font-bold text-indigo-400">{hudWpm}</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
                <span>🗣️ Clarity:</span>
                <span className="font-bold text-indigo-400">{hudClarity}%</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
                <span>⚠️ Fillers:</span>
                <span className="font-bold text-amber-500">{hudFillers}</span>
              </div>
              <div className="bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2">
                <span>👀 Eye Contact:</span>
                <span className="font-bold text-emerald-400">{hudEyeContact}%</span>
              </div>
            </div>

            {/* Audio Waveform Canvas overlay */}
            <canvas ref={canvasRef} className="absolute inset-x-0 bottom-0 h-16 w-full pointer-events-none opacity-60 z-10" />

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-700/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
              <button onClick={toggleMute} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
              <button onClick={toggleCamera} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${!isCameraOn ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {!isCameraOn ? <FaVideoSlash /> : <FaVideo />}
              </button>
              <button onClick={toggleBookmark} className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${isBookmarked ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>
                {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
              </button>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs text-white font-medium">
              You
            </div>
          </div>

          {/* Answer Area */}
          <div className="h-2/5 bg-slate-900 rounded-3xl border border-slate-800 p-4 flex flex-col min-h-0">

            {/* Header row */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-slate-300 font-medium text-sm">Your Answer</h3>
                {isRecording && !isTypingMode && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md border border-red-500/30 animate-pulse">
                    🔴 Live Recording...
                  </span>
                )}
                {autoSubmitCountdown !== null && !isTypingMode && (
                  <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/30">
                    ⏳ Auto-submit in {autoSubmitCountdown}s
                  </span>
                )}
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={isTypingMode ? switchToSpeaking : switchToTyping}
                  disabled={isAIThinking || aiSpeaking}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                    isTypingMode
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {isTypingMode ? '🎙️ Switch to Speaking' : '⌨️ Switch to Typing'}
                </button>
              </div>
            </div>

            {/* Text area */}
            <div className="flex-1 relative min-h-0">
              {isTypingMode ? (
                /* Typing mode: editable textarea + submit button */
                <div className="h-full flex flex-col gap-2">
                  <textarea
                    value={typedAnswer}
                    onChange={handleTypedChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here... (Enter to submit)"
                    disabled={isAIThinking || aiSpeaking}
                    className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 min-h-0"
                  />
                  <div className="flex justify-end gap-3 flex-shrink-0">
                    <button
                      onClick={skipQuestion}
                      disabled={isAIThinking || aiSpeaking}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40"
                    >
                      Skip Question
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={submitAnswer}
                      disabled={!canSubmit || isAIThinking || aiSpeaking}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="text-xs" /> Submit Answer
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Speaking mode: transcript display + manual submit button */
                <div className="h-full flex flex-col gap-2">
                  <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl p-3 overflow-y-auto no-scrollbar min-h-0">
                    {displayText ? (
                      <p className="text-white text-sm leading-relaxed">
                        {finalTranscript}
                        {interimTranscript && (
                          <span className="text-slate-500 italic"> {interimTranscript}</span>
                        )}
                      </p>
                    ) : (
                      <p className="text-slate-600 text-sm italic">
                        {isAIThinking || aiSpeaking
                          ? 'Waiting for AI to finish...'
                          : 'Speak your answer — auto-submits in 1 min, or click Submit manually.'}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 flex-shrink-0">
                    <button
                      onClick={skipQuestion}
                      disabled={isAIThinking || aiSpeaking}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all disabled:opacity-40"
                    >
                      Skip Question
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={submitAnswer}
                      disabled={!canSubmit || isAIThinking || aiSpeaking}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="text-xs" /> Submit Answer
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <p className="text-[10px] text-slate-600 text-center mt-1.5 flex-shrink-0">
              {isTypingMode
                ? 'Press Enter or click Submit to send your answer'
                : 'Speaking mode — click Submit or wait 1 min to auto-submit'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveInterview;
