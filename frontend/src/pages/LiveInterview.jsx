// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  LiveInterview.jsx  –  Production-Grade AI Interview Platform           ║
// ║  All existing logic PRESERVED. Full Light/Dark Mode Support Added.      ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaStopCircle, FaRobot, FaUserAlt, FaPaperPlane,
  FaBookmark, FaRegBookmark, FaPlay, FaPause
} from 'react-icons/fa';
import {
  Clock, Maximize2, Minimize2, Wifi, Shield, Send, Keyboard,
  X, Activity, CheckCircle2, AlertCircle, Zap, Brain,
  ChevronRight, SkipForward
} from 'lucide-react';
import api from '../services/api';
import * as faceapi from '@vladmandic/face-api';

// Premium components
import InterviewerAvatar from '../components/interview/InterviewerAvatar';
import WaveformVisualizer from '../components/interview/WaveformVisualizer';
import InterviewMetrics   from '../components/interview/InterviewMetrics';

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTO_SUBMIT_DELAY = 60 * 1000;

const ENDING_STEPS = [
  { label: 'Interview Completed',             icon: CheckCircle2, color: 'text-emerald-500 dark:text-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30' },
  { label: 'Processing your responses…',      icon: Activity,     color: 'text-blue-500 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/30'       },
  { label: 'Analyzing communication patterns…', icon: Zap,        color: 'text-purple-500 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30'   },
  { label: 'Evaluating technical answers…',   icon: Brain,        color: 'text-indigo-500 dark:text-indigo-400',   bg: 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30'   },
  { label: 'Generating AI performance report…', icon: Activity,   color: 'text-violet-500 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/30'   },
  { label: 'Preparing personalized recommendations…', icon: Zap,  color: 'text-pink-500 dark:text-pink-400',     bg: 'bg-pink-50 dark:bg-pink-500/15 border-pink-200 dark:border-pink-500/30'       },
];

// ─── LiveInterview Component ───────────────────────────────────────────────────
const LiveInterview = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);            // kept for existing audio analyser compat
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const animationFrameRef = useRef(null);

  // ── Existing state (ALL PRESERVED) ────────────────────────────────────────
  const [interview, setInterview]     = useState(null);
  const [isCameraOn, setIsCameraOn]   = useState(true);
  const [isMuted, setIsMuted]         = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream]           = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState('Loading AI question...');
  const [isAIThinking, setIsAIThinking]       = useState(true);
  const [aiSpeaking, setAiSpeaking]           = useState(false);

  const [finalTranscript,   setFinalTranscript]   = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTypingMode, setIsTypingMode]            = useState(false);
  const [typedAnswer,  setTypedAnswer]             = useState('');

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceStatus,   setFaceStatus]   = useState('Loading scanner...');
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [sessionTimeLeft,     setSessionTimeLeft]     = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  // HUD metrics
  const [hudWpm,        setHudWpm]        = useState(130);
  const [hudClarity,    setHudClarity]    = useState(92);
  const [hudFillers,    setHudFillers]    = useState(0);
  const [hudEyeContact, setHudEyeContact] = useState(88);
  const [isPaused,      setIsPaused]      = useState(false);
  const [isBookmarked,  setIsBookmarked]  = useState(false);

  // ── New state ──────────────────────────────────────────────────────────────
  const [hudConfidence,   setHudConfidence]   = useState(78);
  const [hudFluency,      setHudFluency]      = useState(85);
  const [questionNumber,  setQuestionNumber]  = useState(1);
  const [showEndConfirm,  setShowEndConfirm]  = useState(false);
  const [endingStep,      setEndingStep]      = useState(-1);
  const [toasts,          setToasts]          = useState([]);
  const [isFullscreen,    setIsFullscreen]    = useState(false);

  // ── Existing refs (ALL PRESERVED) ─────────────────────────────────────────
  const recognitionRef     = useRef(null);
  const synthRef           = useRef(window.speechSynthesis);
  const autoSubmitTimer    = useRef(null);
  const countdownInterval  = useRef(null);
  const silenceTimer       = useRef(null);
  const currentQuestionRef = useRef('Loading AI question...');
  const isAIThinkingRef    = useRef(true);
  const finalTranscriptRef = useRef('');
  const isTypingModeRef    = useRef(false);
  const isPausedRef        = useRef(false);
  const confidenceData     = useRef({ total: 0, count: 0 });
  const faceInterval       = useRef(null);
  const sessionTimerRef    = useRef(null);
  const voiceRef           = useRef(null);
  const toastTimers        = useRef([]);

  // ── Ref sync effects (PRESERVED) ──────────────────────────────────────────
  useEffect(() => { currentQuestionRef.current = currentQuestion;  }, [currentQuestion]);
  useEffect(() => { isAIThinkingRef.current    = isAIThinking;    }, [isAIThinking]);
  useEffect(() => { finalTranscriptRef.current = finalTranscript; }, [finalTranscript]);
  useEffect(() => { isTypingModeRef.current    = isTypingMode;    }, [isTypingMode]);
  useEffect(() => { isPausedRef.current        = isPaused;        }, [isPaused]);

  /* ─── Web Audio Analyser Visualizer (PRESERVED – canvas not rendered) ───── */
  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current  = audioContext;
      analyserRef.current  = analyser;

      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray    = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(15,23,42,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
          ctx.fillStyle = `rgb(${Math.floor(99+i*4)},${Math.floor(102-i)},${Math.floor(241-i)})`;
          ctx.fillRect(x, (canvas.height - barHeight)/2, barWidth - 1, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) { console.warn('Analyser not initialized', e); }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [stream]);

  /* ─── Transcript Analysis for HUD (PRESERVED + fluency added) ─────────── */
  useEffect(() => {
    if (!finalTranscript) return;
    const fillers = ['um', 'uh', 'like', 'so', 'actually', 'you know'];
    const words   = finalTranscript.toLowerCase().split(/\s+/);
    let count = 0;
    words.forEach(w => { if (fillers.includes(w)) count++; });
    setHudFillers(count);
    const wpm = Math.round(110 + (words.length % 35));
    setHudWpm(wpm);
    const fluency = Math.max(0, Math.min(100, 100 - count * 8 - Math.abs(wpm - 130) * 0.3));
    setHudFluency(Math.round(fluency));

    if (count === 3)  addToast('Try to reduce filler words like "um" and "uh"', 'warning');
    if (wpm > 170)    addToast('Try speaking a little slower for clarity', 'warning');
  }, [finalTranscript]);

  /* ─── Eye Contact Simulated Metrics (PRESERVED + confidence) ───────────── */
  useEffect(() => {
    if (faceStatus.includes('active')) {
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        setHudEyeContact(prev => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const next  = Math.min(100, Math.max(70, prev + delta));
          if (next > 90) addToast('Great eye contact! Keep it up 👁️', 'success');
          return next;
        });
        setHudClarity(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          return Math.min(100, Math.max(80, prev + delta));
        });
        setHudConfidence(prev => {
          const delta = Math.floor(Math.random() * 7) - 2;
          return Math.min(100, Math.max(60, prev + delta));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [faceStatus]);

  /* ─── Pre-load best female voice (PRESERVED) ──────────────────────────── */
  useEffect(() => {
    const PREFERRED_FEMALE_VOICES = [
      'Google UK English Female',
      'Microsoft Sonia Online (Natural) - English (United Kingdom)',
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft Zira Desktop - English (United States)',
      'Samantha', 'Karen', 'Moira', 'Victoria', 'Google US English',
    ];
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      for (const name of PREFERRED_FEMALE_VOICES) {
        const v = voices.find(v => v.name === name);
        if (v) { voiceRef.current = v; return; }
      }
      const femaleEn = voices.find(v => v.lang.startsWith('en') && /female|woman|girl/i.test(v.name));
      if (femaleEn) { voiceRef.current = femaleEn; return; }
      const anyEn = voices.find(v => v.lang.startsWith('en'));
      if (anyEn) voiceRef.current = anyEn;
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  /* ─── Session duration countdown (PRESERVED) ──────────────────────────── */
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

  /* ─── Face-API models (PRESERVED) ─────────────────────────────────────── */
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
      } catch { setFaceStatus('Scanner unavailable'); }
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
              const s = e.happy*100 + e.neutral*85 + e.surprised*50 + e.sad*10 + e.fearful*5 + e.angry*5;
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

  /* ─── Camera + Recognition init (MODIFIED: refactored initCamera) ─────── */
  const initCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 3840 }, height: { ideal: 2160 } },
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraOn(mediaStream.getVideoTracks()[0]?.enabled ?? true);
      setIsMuted(!(mediaStream.getAudioTracks()[0]?.enabled ?? true));
      return mediaStream;
    } catch (err) {
      console.error('Camera access denied', err);
      setFaceStatus('Camera access denied');
      setIsCameraOn(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchInterviewAndStart = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        setInterview(res.data);
        fetchNextQuestion();
      } catch { navigate('/dashboard'); }
    };

    initCamera();
    fetchInterviewAndStart();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous      = true;
      recognition.interimResults  = true;
      recognition.lang            = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        if (isAIThinkingRef.current || isTypingModeRef.current) return;
        handleUserSpeaking();
        let newFinal = '';
        let interim  = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) { newFinal += transcript + ' '; }
          else                           { interim  += transcript; }
        }
        if (newFinal) {
          setFinalTranscript(prev => {
            const updated = prev + newFinal;
            finalTranscriptRef.current = updated;
            return updated;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interim);
        }
      };

      recognition.onsoundstart = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) handleUserSpeaking();
      };
      recognition.onspeechstart = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) handleUserSpeaking();
      };
      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') console.error('Speech error:', e.error);
        if (e.error === 'no-speech' || e.error === 'aborted') {
          setTimeout(() => {
            if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) {
              try { recognition.start(); } catch {}
            }
          }, 300);
        }
      };
      recognition.onend = () => {
        if (!isAIThinkingRef.current && !isTypingModeRef.current && !isPausedRef.current) {
          setTimeout(() => { try { recognition.start(); } catch {} }, 300);
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
  }, [id, initCamera]); // stream is intentionally omitted from dependencies so it doesn't remount

  /* ─── Ending step sequencer ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isEnding) return;
    setEndingStep(0);
    const delays = [0, 1000, 2200, 3400, 4600, 5800];
    const timers = delays.map((ms, i) => setTimeout(() => setEndingStep(i), ms));
    return () => timers.forEach(clearTimeout);
  }, [isEnding]);

  /* ─── Keyboard shortcuts ──────────────────────────────────────────────── */
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (isEnding) return;
      if (e.code === 'Space')   { e.preventDefault(); toggleMute(); }
      else if (e.code === 'KeyC') { e.preventDefault(); toggleCamera(); }
      else if (e.code === 'KeyF') { e.preventDefault(); handleFullscreen(); }
      else if (e.code === 'Escape') { e.preventDefault(); setShowEndConfirm(prev => !prev); }
    };
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [stream, isMuted, isCameraOn, isEnding]);

  /* ─── Auto-submit timer helpers (PRESERVED) ───────────────────────────── */
  const clearAutoSubmitTimers = () => {
    if (autoSubmitTimer.current)   clearTimeout(autoSubmitTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (silenceTimer.current)      clearTimeout(silenceTimer.current);
    autoSubmitTimer.current   = null;
    countdownInterval.current = null;
    silenceTimer.current      = null;
    setAutoSubmitCountdown(null);
  };

  const handleUserSpeaking = () => {
    clearAutoSubmitTimers();
    silenceTimer.current = setTimeout(() => { startSilenceCountdown(); }, 2500);
  };

  const startSilenceCountdown = () => {
    if (autoSubmitTimer.current)   clearTimeout(autoSubmitTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    autoSubmitTimer.current = setTimeout(() => {
      setAutoSubmitCountdown(null);
      submitAnswer();
    }, AUTO_SUBMIT_DELAY);
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
  };

  /* ─── TTS with natural female voice (PRESERVED) ───────────────────────── */
  const speakText = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.lang   = 'en-US';
    utterance.rate   = 0.92;
    utterance.pitch  = 1.08;
    utterance.volume = 1.0;
    utterance.onstart = () => { setAiSpeaking(true);  recognitionRef.current?.stop(); setIsRecording(false); };
    utterance.onend   = () => { setAiSpeaking(false); startListening(); };
    utterance.onerror = () => { setAiSpeaking(false); startListening(); };
    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current && !isMuted && !isTypingMode) {
      try { recognitionRef.current.start(); setIsRecording(true); startSilenceCountdown(); }
      catch { /* already running */ }
    }
  };

  /* ─── Questions (PRESERVED) ───────────────────────────────────────────── */
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
    } finally { setIsAIThinking(false); }
  };

  /* ─── Submit answer (PRESERVED + question counter) ────────────────────── */
  const submitAnswer = async () => {
    const answer = isTypingModeRef.current ? typedAnswer.trim() : finalTranscriptRef.current.trim();
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
        bookmarked: wasBookmarked,
      });
      if (res.data.isClarification) {
        speakText(res.data.feedback);
        setCurrentQuestion(prev => prev + '\n\n💡 AI Clarification:\n' + res.data.feedback);
        setIsAIThinking(false);
      } else {
        setQuestionNumber(prev => prev + 1);
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

  /* ─── Skip question (PRESERVED) ───────────────────────────────────────── */
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
        answer:   'Skipped',
      });
      setQuestionNumber(prev => prev + 1);
      if (res.data.nextQuestion) {
        setCurrentQuestion(res.data.nextQuestion);
        speakText(res.data.nextQuestion);
        setIsAIThinking(false);
      } else {
        fetchNextQuestion();
      }
    } catch { setIsAIThinking(false); startListening(); }
  };

  /* ─── Typing mode toggle (PRESERVED) ──────────────────────────────────── */
  const switchToTyping = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    clearAutoSubmitTimers();
    setTypedAnswer(finalTranscript.trim());
    setFinalTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
    setIsTypingMode(true);
  };

  const switchToSpeaking = () => {
    setIsTypingMode(false);
    isTypingModeRef.current = false;
    setFinalTranscript(typedAnswer);
    finalTranscriptRef.current = typedAnswer;
    setTypedAnswer('');
    startListening();
  };

  const handleTypedChange = (e) => setTypedAnswer(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); }
  };

  /* ─── Pause / Bookmark / Camera / Mic (MODIFIED to dynamically fetch stream) ── */
  const togglePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      if (next) { recognitionRef.current?.stop(); setIsRecording(false); synthRef.current.cancel(); clearAutoSubmitTimers(); }
      else        { startListening(); }
      return next;
    });
  };

  const toggleBookmark = () => setIsBookmarked(prev => !prev);

  const toggleCamera = async () => {
    if (stream && stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !isCameraOn;
      setIsCameraOn(v => !v);
    } else {
      await initCamera();
    }
  };

  const toggleMute = async () => {
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = isMuted;
      setIsMuted(m => {
        if (!m) { recognitionRef.current?.stop(); setIsRecording(false); }
        else if (!isAIThinking && !aiSpeaking) startListening();
        return !m;
      });
    } else {
      await initCamera();
    }
  };

  /* ─── Fullscreen toggle ────────────────────────────────────────────────── */
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  /* ─── Toast notifications ──────────────────────────────────────────────── */
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => {
      if (prev.slice(-2).some(t => t.message === message)) return prev;
      return [...prev.slice(-3), { id, message, type }];
    });
    const t = setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
    toastTimers.current.push(t);
  };

  /* ─── End interview ────────────────────────────────────────────────────── */
  const endInterview = () => setShowEndConfirm(true);

  const confirmEndInterview = async () => {
    setShowEndConfirm(false);
    setIsEnding(true);

    stream?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
    synthRef.current.cancel();
    recognitionRef.current?.stop();
    clearAutoSubmitTimers();

    const avgConf = confidenceData.current.count > 0
      ? Math.round(confidenceData.current.total / confidenceData.current.count)
      : 0;

    const delay = (ms) => new Promise(r => setTimeout(r, ms));
    let finalScore = 70;

    try {
      const [res] = await Promise.all([
        api.put(`/interviews/${id}/finish`, { confidenceScore: avgConf }),
        delay(7000),
      ]);
      if (res?.data?.score !== undefined) finalScore = res.data.score;
    } catch (err) {
      console.error('Failed to finish interview', err);
      await delay(7000);
    }

    const params  = new URLSearchParams(window.location.search);
    const isSim   = params.get('sim') === 'true';
    if (isSim) {
      const companyName  = params.get('company');
      const role         = params.get('role');
      const roundIndex   = parseInt(params.get('roundIndex') || '0', 10);
      const simKey       = `recruitment_sim_${companyName}_${role}`;
      let simData        = JSON.parse(localStorage.getItem(simKey)) || { currentRoundIndex: 0, scores: {} };
      simData.scores[roundIndex] = finalScore;
      if (finalScore >= 60) simData.currentRoundIndex = Math.max(simData.currentRoundIndex, roundIndex + 1);
      localStorage.setItem(simKey, JSON.stringify(simData));
      navigate(`/companies/${companyName}?role=${encodeURIComponent(role)}&simComplete=true&round=${roundIndex}&score=${finalScore}`);
      return;
    }
    navigate(`/report/${id}`);
  };

  /* ─── Derived values ──────────────────────────────────────────────────── */
  const displayText = isTypingMode
    ? typedAnswer
    : finalTranscript + (interimTranscript ? `\u00A0\u00A0[${interimTranscript}]` : '');

  const canSubmit = isTypingMode
    ? typedAnswer.trim().length > 0
    : finalTranscript.trim().length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (!interview) {
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#070b1a] flex flex-col items-center justify-center gap-6 transition-colors">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-indigo-500"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-slate-200 dark:border-slate-800 border-b-violet-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/40 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-slate-900 dark:text-white text-xl font-semibold">Preparing Interview Room</h2>
          <p className="text-slate-500 text-sm mt-1.5">Setting up your personalized AI session…</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENDING SCREEN
  // ─────────────────────────────────────────────────────────────────────────
  if (isEnding) {
    const progress = ((endingStep + 1) / ENDING_STEPS.length) * 100;
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#070b1a] flex flex-col items-center justify-center relative overflow-hidden transition-colors">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/6 rounded-full blur-3xl" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-6"
        >
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#8b5cf6' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 rounded-full"
              style={{ border: '1px solid transparent', borderBottomColor: '#a855f7', borderLeftColor: '#6366f1' }}
            />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/10 dark:from-indigo-500/20 to-violet-500/10 dark:to-violet-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Interview Completed!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Generating your personalized performance report…</p>
          </div>

          <div className="w-full space-y-3">
            {ENDING_STEPS.map((step, i) => {
              const Icon    = step.icon;
              const done    = endingStep > i;
              const current = endingStep === i;
              const pending = endingStep < i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: pending ? 0.28 : 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center gap-3 py-2 px-3 rounded-xl border transition-all duration-500 ${
                    current ? step.bg : done ? 'bg-emerald-50 dark:bg-emerald-500/8 border-emerald-200 dark:border-emerald-500/20' : 'bg-transparent border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-all duration-500 ${
                    done    ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400 dark:border-emerald-500'
                    : current ? `border-current ${step.bg}`.replace('border-', 'border-opacity-60 border-')
                    : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {done ? (
                      <svg className="w-3 h-3 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : current ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className={`w-3 h-3 rounded-full border border-t-transparent ${step.color}`}
                        style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
                      />
                    ) : (
                      <Icon className={`w-3 h-3 ${step.color} opacity-50 dark:opacity-30`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${done ? 'text-emerald-600 dark:text-emerald-400' : current ? step.color : 'text-slate-500 dark:text-slate-600'}`}>
                    {step.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="w-full space-y-1.5">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-600 text-right">{Math.round(progress)}% complete</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN INTERVIEW ROOM
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-slate-50 dark:bg-[#070b1a] flex flex-col overflow-hidden select-none transition-colors">

      <canvas ref={canvasRef} className="absolute opacity-0 pointer-events-none" width={1} height={1} />

      {/* ════════════════════════════════════════════════════════════════════
          STATUS BAR
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 z-30 transition-colors">

        {/* Left: Brand + REC */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-[10px] font-black">IX</span>
            </div>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/30 px-2.5 py-1 rounded-full flex-shrink-0"
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <span className="text-red-500 dark:text-red-400 text-[11px] font-bold tracking-wide">REC</span>
          </motion.div>
        </div>

        {/* Center: Interview info */}
        <div className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
          <div className="text-center">
            <p className="text-slate-900 dark:text-white text-sm font-semibold leading-tight">{interview.role}</p>
            <p className="text-slate-500 text-[11px]">{interview.company || 'Mock Interview'}</p>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
            interview.difficulty === 'Hard'   ? 'bg-red-50 dark:bg-red-500/12 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400' :
            interview.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-500/12 border-amber-200 dark:border-amber-500/30 text-amber-500 dark:text-amber-400' :
                                                'bg-emerald-50 dark:bg-emerald-500/12 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>{interview.difficulty}</div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <span className="text-indigo-500 dark:text-indigo-400 font-semibold">Q{questionNumber}</span>
          </div>
        </div>

        {/* Right: Status indicators + controls */}
        <div className="flex items-center gap-2">

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-all ${
            sessionTimeLeft !== null && sessionTimeLeft < 120 ? 'bg-red-50 dark:bg-red-500/12 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400' :
            sessionTimeLeft !== null && sessionTimeLeft < 300 ? 'bg-amber-50 dark:bg-amber-500/12 border-amber-200 dark:border-amber-500/30 text-amber-500 dark:text-amber-400' :
            'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-3 h-3" />
            {sessionTimeLeft !== null
              ? `${String(Math.floor(sessionTimeLeft/60)).padStart(2,'0')}:${String(sessionTimeLeft%60).padStart(2,'0')}`
              : interview.duration}
          </div>

          {/* Mic status */}
          <button
            onClick={toggleMute}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              isMuted ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400' 
                      : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Space"
          >
            {isMuted ? <FaMicrophoneSlash className="text-xs" /> : <FaMicrophone className="text-xs" />}
          </button>

          {/* Camera status */}
          <button
            onClick={toggleCamera}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
              !isCameraOn ? 'bg-red-50 dark:bg-red-500/15 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400' 
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="C"
          >
            {!isCameraOn ? <FaVideoSlash className="text-xs" /> : <FaVideo className="text-xs" />}
          </button>

          {/* AI status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-medium ${
            isAIThinking ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' :
            aiSpeaking   ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                          'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isAIThinking ? 'bg-amber-500 dark:bg-amber-400' : aiSpeaking ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-emerald-500 dark:bg-emerald-400'
            }`} />
            <span>AI {isAIThinking ? 'Thinking' : aiSpeaking ? 'Speaking' : 'Ready'}</span>
          </div>

          {/* Network */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50">
            <Wifi className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <Shield className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
          </div>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            title="F"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Pause */}
          <button
            onClick={togglePause}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isPaused ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' 
                       : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPaused ? <FaPlay className="text-xs text-emerald-500 dark:text-emerald-400" /> : <FaPause className="text-xs" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          {/* End */}
          <button
            onClick={endInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white text-xs font-medium transition-all"
          >
            <FaStopCircle className="text-xs" /> End
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden min-h-0">

        {/* ══════════════════════════════════════════
            LEFT PANEL: AI Interviewer + Question
            ══════════════════════════════════════════ */}
        <div className="w-[38%] flex flex-col gap-3 min-h-0 flex-shrink-0">

          <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-800/60 shadow-sm dark:shadow-2xl min-h-0 transition-colors">
            <InterviewerAvatar
              aiSpeaking={aiSpeaking}
              isAIThinking={isAIThinking}
              interviewerName="Sarah"
            />
          </div>

          <div className="h-[36%] flex-shrink-0 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4 flex flex-col min-h-0 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/12 border border-indigo-200 dark:border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                  Q{questionNumber}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  interview.difficulty === 'Hard'   ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'
                  : interview.difficulty === 'Medium'? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                  :                                   'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
                }`}>{interview.difficulty}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-600">~2 min</span>
              </div>
              <button
                onClick={toggleBookmark}
                className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/12' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                {isBookmarked ? <FaBookmark className="text-xs" /> : <FaRegBookmark className="text-xs" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {isAIThinking ? (
                  <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 pt-1">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i}
                          animate={{ opacity: [0.3,1,0.3] }}
                          transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.3 }}
                          className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400"
                        />
                      ))}
                    </div>
                    <span className="text-slate-500 text-sm">Generating question…</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-slate-800 dark:text-slate-100 text-sm font-medium leading-relaxed whitespace-pre-wrap"
                  >
                    {currentQuestion}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL: Candidate + Answer
            ══════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">

          <div className="flex-1 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800/50 relative overflow-hidden group min-h-0 shadow-sm dark:shadow-2xl transition-colors">
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${!isCameraOn ? 'opacity-0 hidden' : 'opacity-100'}`}
            />

            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/90 gap-4 transition-colors">
                <div className="relative">
                  <motion.div animate={{ scale: [1,1.6], opacity: [0.3,0] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute w-20 h-20 rounded-full border border-slate-300 dark:border-slate-700 top-0 left-0" />
                  <motion.div animate={{ scale: [1,2.4], opacity: [0.15,0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }} className="absolute w-20 h-20 rounded-full border border-slate-200 dark:border-slate-800 top-0 left-0" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white dark:from-slate-800 to-slate-100 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md dark:shadow-xl">
                    <FaUserAlt className="text-3xl text-slate-300 dark:text-slate-500" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-slate-800 dark:text-slate-300 text-sm font-semibold">Camera is currently disabled</p>
                  <p className="text-slate-500 dark:text-slate-600 text-xs mt-0.5">Your video is not visible to the interviewer</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={toggleCamera}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-colors"
                >
                  <FaVideo className="text-xs" /> Enable Camera
                </motion.button>
              </div>
            )}

            {isRecording && (
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-indigo-500/40 pointer-events-none"
              />
            )}

            <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-1.5 z-10 transition-colors">
              <span className={`w-1.5 h-1.5 rounded-full ${faceStatus.includes('active') ? 'bg-emerald-500 animate-pulse' : faceStatus.includes('No face') ? 'bg-amber-500' : 'bg-slate-500'}`} />
              <span className="text-[10px] text-slate-700 dark:text-slate-300">{faceStatus}</span>
            </div>

            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-1.5 z-10 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-700 dark:text-slate-200 font-semibold">You</span>
            </div>

            <div className="absolute bottom-16 right-3 z-10">
              <InterviewMetrics
                wpm={hudWpm}
                clarity={hudClarity}
                eyeContact={hudEyeContact}
                fillers={hudFillers}
                confidence={hudConfidence}
                fluency={hudFluency}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-14 z-10 bg-gradient-to-t from-white/80 dark:from-slate-950/80 to-transparent pointer-events-none">
              <WaveformVisualizer stream={stream} isActive={!isMuted && isRecording} />
            </div>

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700/50 z-20 shadow-xl transition-colors">

              <button
                onClick={toggleMute}
                title="Space"
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-medium ${
                  isMuted ? 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {isMuted ? <FaMicrophoneSlash className="text-sm" /> : <FaMicrophone className="text-sm" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                onClick={toggleCamera}
                title="C"
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-medium ${
                  !isCameraOn ? 'bg-red-50 dark:bg-red-500/15 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {!isCameraOn ? <FaVideoSlash className="text-sm" /> : <FaVideo className="text-sm" />}
                <span>Camera</span>
              </button>

              <div className="w-px h-7 bg-slate-200 dark:bg-slate-700/60" />

              <button
                onClick={togglePause}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-medium ${
                  isPaused ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {isPaused ? <FaPlay className="text-sm text-emerald-500 dark:text-emerald-400" /> : <FaPause className="text-sm" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={toggleBookmark}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all text-[10px] font-medium ${
                  isBookmarked ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                {isBookmarked ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
                <span>Bookmark</span>
              </button>

              <div className="w-px h-7 bg-slate-200 dark:bg-slate-700/60" />

              <button
                onClick={endInterview}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/12 hover:border hover:border-red-200 dark:hover:border-red-500/30 transition-all text-[10px] font-medium"
              >
                <FaStopCircle className="text-sm" />
                <span>End</span>
              </button>
            </div>
          </div>

          <div className="h-[38%] flex-shrink-0 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4 flex flex-col min-h-0 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Your Answer</h3>
                {isRecording && !isTypingMode && (
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/25 text-red-500 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Live Recording
                  </motion.div>
                )}
                {autoSubmitCountdown !== null && !isTypingMode && (
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/25 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" />
                    Auto-submit in {autoSubmitCountdown}s
                  </div>
                )}
              </div>
              <button
                onClick={isTypingMode ? switchToSpeaking : switchToTyping}
                disabled={isAIThinking || aiSpeaking}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border transition-all disabled:opacity-40 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {isTypingMode
                  ? <><FaMicrophone className="text-xs" /> Voice Mode</>
                  : <><Keyboard className="w-3 h-3" /> Type Mode</>}
              </button>
            </div>

            <div className="flex-1 min-h-0">
              {isTypingMode ? (
                <div className="h-full flex flex-col gap-2">
                  <textarea
                    value={typedAnswer}
                    onChange={handleTypedChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer… (Enter to submit, Shift+Enter for new line)"
                    disabled={isAIThinking || aiSpeaking}
                    className="flex-1 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 text-slate-800 dark:text-slate-100 text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 min-h-0 placeholder:text-slate-400 dark:placeholder:text-slate-700 leading-relaxed"
                  />
                  <div className="flex justify-end gap-2 flex-shrink-0">
                    <button
                      onClick={skipQuestion}
                      disabled={isAIThinking || aiSpeaking}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl text-sm transition-all disabled:opacity-40"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={submitAnswer}
                      disabled={!canSubmit || isAIThinking || aiSpeaking}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Answer
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 rounded-xl p-3 overflow-y-auto no-scrollbar min-h-0 transition-colors">
                    {displayText ? (
                      <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                        {finalTranscript}
                        {interimTranscript && (
                          <span className="text-slate-500 italic"> {interimTranscript}</span>
                        )}
                      </p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex items-end gap-1 h-8">
                          {[1,2,3,4,5].map(i => (
                            <motion.div
                              key={i}
                              animate={{ height: isRecording ? ['4px','18px','4px'] : '4px' }}
                              transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.12, ease: 'easeInOut' }}
                              className="w-1.5 bg-indigo-500/35 rounded-full"
                              style={{ minHeight: 4 }}
                            />
                          ))}
                        </div>
                        <p className="text-slate-500 dark:text-slate-600 text-xs text-center">
                          {isAIThinking || aiSpeaking
                            ? 'Listening to the interviewer…'
                            : 'Speak your answer clearly. Auto-submits after 60 seconds of silence.'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 flex-shrink-0">
                    <button
                      onClick={skipQuestion}
                      disabled={isAIThinking || aiSpeaking}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl text-sm transition-all disabled:opacity-40"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={submitAnswer}
                      disabled={!canSubmit || isAIThinking || aiSpeaking}
                      className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" /> Submit Answer
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-700 text-center mt-1.5 flex-shrink-0">
              {isTypingMode
                ? 'Enter to submit · Shift+Enter for new line'
                : 'Space = mute · C = camera · F = fullscreen · Esc = end interview'}
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          END INTERVIEW CONFIRMATION MODAL
          ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl shadow-black/20 dark:shadow-black/60"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/12 border border-red-200 dark:border-red-500/25 flex items-center justify-center flex-shrink-0">
                  <FaStopCircle className="text-red-500 dark:text-red-400 text-lg" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">End Interview?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                    This will stop the session and generate your detailed AI performance report.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 mb-6">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                  <span>You can't resume once the interview ends. Your answers have been saved.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors"
                >
                  Keep Going
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={confirmEndInterview}
                  className="flex-1 py-2.5 bg-red-50 dark:bg-red-500/15 hover:bg-red-500 dark:hover:bg-red-500 border border-red-200 dark:border-red-500/35 text-red-600 dark:text-red-400 hover:text-white rounded-xl font-semibold text-sm transition-all"
                >
                  End &amp; Get Report
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          SMART TOAST NOTIFICATIONS
          ════════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-[72px] right-4 flex flex-col gap-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl max-w-[260px] pointer-events-auto ${
                toast.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25' :
                toast.type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25' :
                                           'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/25'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-500 dark:bg-emerald-400' :
                toast.type === 'warning' ? 'bg-amber-500 dark:bg-amber-400' :
                                           'bg-indigo-500 dark:bg-indigo-400'
              }`} />
              <p className="text-slate-700 dark:text-slate-200 text-xs leading-snug">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default LiveInterview;
