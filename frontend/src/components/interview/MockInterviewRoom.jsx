import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Shield, Send, Keyboard, Activity, CheckCircle2,
  AlertCircle, Zap, Brain, Play, Pause, Plus, Database, User,
  Check, AlertTriangle, Trash2, Mic, Code2, Layout, FileText, ArrowRight,
  MessageSquare, ChevronRight, X, Maximize2, Minimize2, LogOut,
  HelpCircle, RefreshCw, Edit, Terminal, ListCollapse
} from 'lucide-react';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaRobot, FaBookmark, FaRegBookmark
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import WaveformVisualizer from './WaveformVisualizer';
import InterviewerAvatar from './InterviewerAvatar';

const MockInterviewRoom = ({
  interview,
  archetype,
  currentQuestion,
  setCurrentQuestion,
  isAIThinking,
  setIsAIThinking,
  aiSpeaking,
  setAiSpeaking,
  interviewState = 'IDLE',
  isSubmitting = false,
  clearTranscript = () => {},
  isMuted,
  toggleMute,
  isCameraOn,
  toggleCamera,
  videoRef,
  stream,
  hudConfidence,
  hudClarity,
  hudWpm,
  faceStatus,
  codeContent,
  setCodeContent,
  selectedLanguage,
  setSelectedLanguage,
  sqlResult,
  setSqlResult,
  blocks,
  setBlocks,
  addBlockToDesign,
  clearDrawing,
  canvasRefDraw,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp,
  submitAnswer,
  dialogLogs,
  isTypingMode,
  switchToSpeaking,
  switchToTyping,
  typedAnswer,
  setTypedAnswer,
  handleTypeAnswerSubmit,
  theme,
  sessionTimeLeft,
  togglePause,
  isPaused,
  endInterview,
  isRecording,
  isBookmarked,
  toggleBookmark,
  interviewerStatus = 'listening',
  conversationHistory = [],
  conversationLogOpen = false,
  setConversationLogOpen = () => {},
  onExcellentAnswer = false,
  interviewStage = 'core',
  finalTranscript = '',
  setFinalTranscript = () => {},
  interimTranscript = '',
  setInterimTranscript = () => {},
  speakText = null,
  micPermissionStatus = 'granted',
  speechRecognitionSupported = true,
  activeMicDeviceName = 'Microphone',
  repeatQuestion = () => {},
  skipAiSpeakingAndListen = () => {},
  retryMicrophone = () => {},
  networkError = null,
  retryLastSubmission = () => {},
}) => {

  const [activeHighlightSection, setActiveHighlightSection] = useState('projects');
  const [realtimeTips, setRealtimeTips] = useState('Welcome! Take a breath and answer confidently.');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState('');

  // Auto-scrolling transcript ref
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dialogLogs, isAIThinking]);

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Unique visual headers and styling based on active mock interview type
  const roomStyles = useMemo(() => {
    switch (archetype) {
      case 'coding':
        return {
          title: 'Premium Coding Sandbox',
          badge: 'Coding Round',
          accent: 'from-emerald-500 to-teal-500',
          accentHex: '#10b981'
        };
      case 'hr':
        return {
          title: 'Corporate Board Room',
          badge: 'HR Round',
          accent: 'from-pink-500 to-rose-500',
          accentHex: '#ec4899'
        };
      case 'resume':
        return {
          title: 'Portfolio Audit Room',
          badge: 'Resume Round',
          accent: 'from-amber-500 to-orange-500',
          accentHex: '#f59e0b'
        };
      case 'system_design':
        return {
          title: 'Architecture Design Studio',
          badge: 'System Design',
          accent: 'from-cyan-500 to-blue-500',
          accentHex: '#06b6d4'
        };
      case 'behavioral':
        return {
          title: 'STAR Behavioral Room',
          badge: 'Behavioral Round',
          accent: 'from-purple-500 to-indigo-500',
          accentHex: '#8b5cf6'
        };
      default:
        return {
          title: 'Technical Practice Chamber',
          badge: 'Technical Round',
          accent: 'from-blue-500 to-indigo-500',
          accentHex: '#3b82f6'
        };
    }
  }, [archetype]);

  // Dynamic Expected topics based on archetype
  const getFlowTopics = () => {
    if (archetype === 'coding') return { current: 'DSA Algorithms', next: 'Complexity Trade-offs' };
    if (archetype === 'system_design') return { current: 'Scalability / Caching', next: 'Database Partitioning' };
    if (archetype === 'hr') return { current: 'STAR Behavioral Case', next: 'Career Trajectory' };
    if (archetype === 'resume') return { current: 'Project Infrastructure', next: 'Skill Verification' };
    return { current: 'OOP / DBMS Basics', next: 'Framework Lifecycle' };
  };

  // Highlights resume section when AI asks about it
  useEffect(() => {
    const qLower = currentQuestion.toLowerCase();
    if (qLower.includes('project') || qLower.includes('build')) {
      setActiveHighlightSection('projects');
    } else if (qLower.includes('skill') || qLower.includes('language') || qLower.includes('tech')) {
      setActiveHighlightSection('skills');
    } else if (qLower.includes('experience') || qLower.includes('work') || qLower.includes('intern')) {
      setActiveHighlightSection('experience');
    } else if (qLower.includes('education') || qLower.includes('college') || qLower.includes('degree')) {
      setActiveHighlightSection('education');
    }
  }, [currentQuestion]);

  const formatSessionTime = (seconds) => {
    if (typeof seconds === 'number') {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return seconds || '15:00';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* ================================================== */}
      {/* 1. TOP BAR */}
      {/* ================================================== */}
      <header className="flex-shrink-0 h-16 bg-slate-900/60 border-b border-white/[0.06] backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-indigo-500 animate-pulse`} />
            <h1 className="text-sm font-black tracking-tight">{interview?.type || 'AI Practice Session'}</h1>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border bg-indigo-500/10 border-indigo-500/20 text-indigo-400`}>
            {roomStyles.badge}
          </span>
        </div>

        {/* Diagnostic HUD */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-slate-300 font-bold">{formatSessionTime(sessionTimeLeft)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Live Connected</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
            <Mic className={`w-3 h-3 ${micPermissionStatus === 'denied' ? 'text-rose-400' : isMuted ? 'text-slate-500' : 'text-emerald-400'}`} />
            <span className="truncate max-w-[120px]">{micPermissionStatus === 'denied' ? 'Mic Blocked' : activeMicDeviceName}</span>
          </div>

          {isRecording && !isMuted && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider text-rose-400">REC</span>
            </div>
          )}

          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl transition-all ${isMuted ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <FaMicrophoneSlash className="text-sm" /> : <FaMicrophone className="text-sm" />}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-xl transition-all ${!isCameraOn ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}
              title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {!isCameraOn ? <FaVideoSlash className="text-sm" /> : <FaVideo className="text-sm" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={endInterview}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 font-bold text-[11px] transition-all ml-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* 2. BODY LAYOUT */}
      {/* ================================================== */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative z-10">

        {/* LEFT PANEL: AI Interviewer */}
        <section className="w-[300px] bg-slate-900/20 border-r border-white/[0.06] flex flex-col justify-between p-4 flex-shrink-0 relative overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Recruiter</h3>
            
            {/* Large Avatar Containment */}
            <div className="aspect-[4/3] w-full rounded-2xl border border-white/10 overflow-hidden bg-slate-950/80 relative flex items-center justify-center">
              <InterviewerAvatar interviewerStatus={interviewerStatus} onExcellentAnswer={onExcellentAnswer} />
            </div>

            {/* Speaking/Waveform metrics */}
            {aiSpeaking && (
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3 flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400 mb-1.5">Voice Synthesis Stream</span>
                <WaveformVisualizer stream={null} isActive={true} />
              </div>
            )}

            {/* Diagnostic status label */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">AI Recruiter State</span>
              <div className="bg-slate-950 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {interviewerStatus === 'answer_received' ? 'Answer received' :
                   interviewerStatus === 'processing' || interviewerStatus === 'analyzing' || interviewerStatus === 'evaluating' ? 'Processing answer...' :
                   interviewerStatus === 'preparing_followup' ? 'Preparing follow-up...' :
                   interviewerStatus === 'moving_to_next' ? 'Moving to next question...' :
                   interviewerStatus === 'speaking' ? 'Interviewer speaking' :
                   interviewerStatus === 'listening' ? 'Listening' :
                   interviewerStatus}
                </span>
                <span className={`h-2 w-2 rounded-full ${
                  interviewerStatus === 'listening' ? 'bg-emerald-400' :
                  interviewerStatus === 'answer_received' ? 'bg-sky-400' :
                  interviewerStatus === 'processing' || interviewerStatus === 'analyzing' || interviewerStatus === 'typing' ? 'bg-amber-400 animate-pulse' :
                  interviewerStatus === 'preparing_followup' ? 'bg-violet-400 animate-pulse' :
                  interviewerStatus === 'moving_to_next' ? 'bg-blue-400 animate-pulse' :
                  'bg-indigo-500 animate-ping'
                }`} />
              </div>
            </div>
          </div>

          {/* Web Camera container */}
          <div className="mt-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Candidate Stream</span>
            <div className="aspect-[4/3] w-full rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative">
              {isCameraOn ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-1.5 bg-slate-900/40">
                  <User className="w-8 h-8 opacity-40" />
                  <span className="text-[9px] uppercase font-bold tracking-widest">Camera Stream Blocked</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CENTER PANEL: Main Conversation & Workspaces */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-950/20">

          {/* ============================================================ */}
          {/* CODING MODE — dedicated full-height layout, no scrolling mix */}
          {/* ============================================================ */}
          {archetype === 'coding' ? (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-3 gap-3">

              {/* TOP ROW: Problem | Editor — fills all remaining height */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-hidden min-h-0">

                {/* Left: Problem Statement */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 flex-shrink-0">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg">DSA CHALLENGE</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Lang: {selectedLanguage || 'java'}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3">
                    <h3 className="text-sm font-bold text-white">Problem Statement</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">{currentQuestion}</p>
                    <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3 space-y-1.5 text-[11px] mt-2">
                      <span className="font-bold text-indigo-400 block">Constraints:</span>
                      <p className="text-slate-400">• Time Complexity: O(N log N) or better</p>
                      <p className="text-slate-400">• Space Complexity: O(1) auxiliary</p>
                    </div>
                  </div>
                </div>

                {/* Right: Monaco Solution Editor */}
                <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                  {/* Editor toolbar */}
                  <div className="bg-slate-950 px-4 py-2 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Solution Editor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="sql">SQL</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => submitAnswer && submitAnswer()}
                        disabled={isAIThinking}
                        className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Code
                      </button>
                    </div>
                  </div>
                  {/* Monaco Editor fills remaining height */}
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      theme="vs-dark"
                      language={selectedLanguage === 'cpp' || selectedLanguage === 'c' ? 'cpp' : selectedLanguage}
                      value={codeContent}
                      onChange={setCodeContent}
                      onMount={(editor) => {
                        // Prevent keyboard events from bubbling to page (fixes Space/C camera toggle)
                        editor.getDomNode()?.addEventListener('keydown', (e) => {
                          e.stopPropagation();
                        }, true);
                        editor.getDomNode()?.addEventListener('keyup', (e) => {
                          e.stopPropagation();
                        }, true);
                        editor.getDomNode()?.addEventListener('keypress', (e) => {
                          e.stopPropagation();
                        }, true);
                      }}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: '"Fira Code", "Cascadia Code", monospace',
                        fontLigatures: true,
                        scrollBeyondLastLine: false,
                        lineNumbersMinChars: 3,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        padding: { top: 12, bottom: 12 },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM STRIP: Compact voice/answer area for coding mode */}
              <div className="flex-shrink-0 bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-4">
                {/* Voice status indicator */}
                <div className="flex items-center gap-2 min-w-0">
                  {aiSpeaking || interviewerStatus === 'speaking' || interviewState === 'AI_SPEAKING' ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex-shrink-0">Interviewer Speaking</span>
                      <span className="text-[11px] text-amber-300/80 truncate max-w-[200px]">
                        Mic transcription paused
                      </span>
                      <button
                        onClick={skipAiSpeakingAndListen}
                        className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                        title="Interrupt AI and speak immediately"
                      >
                        <Zap className="w-3 h-3 text-amber-300" /> Speak Now
                      </button>
                    </>
                  ) : isRecording && !isMuted ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex-shrink-0">Listening</span>
                      <span className="text-[11px] text-slate-300 truncate max-w-[300px] font-mono">
                        {interimTranscript || finalTranscript || 'Speak your explanation…'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-[11px] text-slate-500">Mic off — explain your approach verbally or just submit code above</span>
                    </>
                  )}
                </div>

                {/* Voice submit / clear buttons */}
                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  {(finalTranscript || interimTranscript) && (
                    <>
                      <button
                        onClick={clearTranscript}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-400 transition-all flex items-center gap-1"
                        title="Clear speech transcript"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                      <button
                        onClick={() => submitAnswer()}
                        disabled={isSubmitting || isAIThinking || aiSpeaking || !finalTranscript.trim()}
                        className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Activity className="w-3 h-3 animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" /> Submit Voice
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={isTypingMode ? switchToSpeaking : switchToTyping}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-300 transition-all flex items-center gap-1.5"
                  >
                    {isTypingMode ? <><Mic className="w-3 h-3 text-indigo-400" /> Voice</> : <><Keyboard className="w-3 h-3 text-indigo-400" /> Type</>}
                  </button>
                </div>
              </div>

              {/* Warning/Error strips in coding mode if active */}
              {networkError && (
                <div className="bg-rose-950/40 border border-rose-500/30 px-4 py-2 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-300">
                  <span className="truncate">{networkError}</span>
                  <button onClick={retryLastSubmission} className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}
              {micPermissionStatus === 'denied' && (
                <div className="bg-amber-950/40 border border-amber-500/30 px-4 py-2 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
                  <span>Microphone access blocked. Click <strong>Retry Microphone</strong> or use Solution Editor.</span>
                  <button onClick={retryMicrophone} className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-bold rounded-lg flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Retry Mic
                  </button>
                </div>
              )}

              {/* Bottom bar shortcuts for coding mode */}
              <div className="flex-shrink-0 bg-slate-950 border-t border-white/[0.06] py-2 flex justify-between items-center gap-4 rounded-b-xl px-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (repeatQuestion) repeatQuestion();
                      else if (speakText) speakText(`Let me repeat the question for you: ${currentQuestion}`);
                    }}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                  >
                    Repeat Question
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConversationLogOpen(!conversationLogOpen)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-indigo-400" /> Chat Log
                  </button>
                  <button
                    onClick={() => setShowNotesModal(true)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3 text-indigo-400" /> Notes
                  </button>
                </div>
              </div>
            </div>

          ) : (
            /* ============================================================ */
            /* ALL OTHER ARCHETYPES — scrollable flex-col layout            */
            /* ============================================================ */
            <>
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col justify-between">

              <div className="flex-1 flex flex-col min-h-0">

                {archetype === 'resume' ? (
                /* RESUME SPLIT SCREEN */
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0 overflow-hidden mb-6">
                  {/* Left: Resume Section highlights */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">Candidate Resume Profile</span>
                      {interview?.resumeFilename && (
                        <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[180px]">
                          {interview.resumeFilename}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4 font-mono text-[10px] text-slate-400">
                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'projects' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">🚀 Projects Documented</span>
                        {interview?.resumeProjects && interview.resumeProjects.length > 0 ? (
                          <div className="space-y-2">
                            {interview.resumeProjects.map((p, idx) => {
                              const pTitle = typeof p === 'string' ? p : (p.name || p.title || 'Project');
                              const pDesc = typeof p === 'object' ? (p.description || p.details || (Array.isArray(p.tech) ? p.tech.join(', ') : '') || '') : '';
                              return (
                                <div key={idx} className="border-l-2 border-amber-500/40 pl-2">
                                  <span className="font-bold text-slate-200 block">{pTitle}</span>
                                  {pDesc && <p className="text-slate-400 text-[10px] mt-0.5">{pDesc}</p>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-300 leading-relaxed">{interview?.resumeText ? interview.resumeText.substring(0, 180) + '...' : 'Projects listed in candidate resume.'}</p>
                        )}
                      </div>

                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'skills' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">🛠️ Verified Skillsets</span>
                        {interview?.resumeSkills && interview.resumeSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {interview.resumeSkills.map((sk, idx) => (
                              <span key={idx} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[10px]">
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-300 leading-relaxed">Technical skills extracted from verified resume profile.</p>
                        )}
                      </div>

                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'experience' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">💼 Experience &amp; Internships</span>
                        {interview?.resumeExperience && interview.resumeExperience.length > 0 ? (
                          <div className="space-y-2">
                            {interview.resumeExperience.map((e, idx) => {
                              const role = typeof e === 'string' ? e : (e.role || e.title || 'Position');
                              const org = typeof e === 'object' ? (e.company || e.organization || '') : '';
                              const details = typeof e === 'object' ? (e.responsibilities || e.description || '') : '';
                              return (
                                <div key={idx} className="border-l-2 border-amber-500/40 pl-2">
                                  <span className="font-bold text-slate-200 block">{role} {org ? `@ ${org}` : ''}</span>
                                  {details && <p className="text-slate-400 text-[10px] mt-0.5">{details}</p>}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-300 leading-relaxed">Experience and academic background documented in resume.</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Right: Immersive Conversation */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto no-scrollbar">
                    <div className="space-y-4">
                      <div className="flex gap-2.5 items-start">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] font-black text-white shrink-0 mt-0.5">S</div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-xs text-slate-300 leading-relaxed">
                          {currentQuestion}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : archetype === 'system_design' ? (
                /* SYSTEM DESIGN WHITEBOARD CONTAINER */
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0 overflow-hidden mb-6">
                  {/* Left 2 cols: Whiteboard canvas */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 xl:col-span-2 flex flex-col overflow-hidden min-h-[300px]">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Whiteboard Drawing Canvas</span>
                      <button onClick={clearDrawing} className="px-2.5 py-1 bg-rose-950/20 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg text-[9px] transition-all">
                        Clear Workspace
                      </button>
                    </div>
                    {/* Architectural block choices */}
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {['User/Client', 'Load Balancer', 'API Gateway', 'Web Service', 'Database Server', 'Redis Cache', 'Message Queue'].map(item => (
                        <button
                          key={item}
                          onClick={() => addBlockToDesign(item)}
                          className="bg-white/5 border border-white/10 hover:border-cyan-500/30 text-[9px] font-bold text-slate-300 rounded-lg px-2.5 py-1 transition-all"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 bg-slate-950 border border-white/5 rounded-xl overflow-hidden relative">
                      <canvas
                        ref={canvasRefDraw}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        className="w-full h-full cursor-crosshair"
                      />
                      {/* Render architectural blocks */}
                      {blocks.map((block, idx) => (
                        <div
                          key={idx}
                          className="absolute bg-cyan-950/80 border border-cyan-500 text-cyan-300 text-[9px] font-bold px-3 py-1.5 rounded-lg shadow-lg cursor-move flex items-center gap-1.5"
                          style={{ left: `${block.x}px`, top: `${block.y}px` }}
                        >
                          <Database className="w-3 h-3 shrink-0" />
                          <span>{block.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right 1 col: Conversational analysis panel */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">System Architect Prompt</span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 border border-white/5 p-4 rounded-xl">{currentQuestion}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* DEFAULT TECHNICAL / HR / BEHAVIORAL QUESTIONS CARD */
                <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full my-auto py-2">
                  <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 md:p-6 backdrop-blur-xl relative shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Interviewer Prompt</span>
                      </div>
                      <button
                        onClick={repeatQuestion}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-slate-200 text-[10px] transition-all flex items-center gap-1 cursor-pointer"
                        title="Repeat question audio"
                      >
                        <RefreshCw className="w-3 h-3" /> Repeat
                      </button>
                    </div>
                    <div className="overflow-y-auto pr-1 text-slate-100 font-sans max-h-[200px] no-scrollbar">
                      <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-wrap">{currentQuestion}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* TRANSCRIPT & RESPONSE AREA */}
            <div className="space-y-4">
              
              {/* Headphones Advisory Banner */}
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 text-xs">
                <span className="text-base flex-shrink-0">🎧</span>
                <p className="text-indigo-200/90 text-[11px] leading-relaxed">
                  <span className="font-semibold text-indigo-100">Headphones Recommended:</span> Using earphones or a headset prevents the interviewer's voice from echoing into your microphone.
                </p>
              </div>

              {/* Diagnostic Alert Banners */}
              {networkError && (
                <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 text-rose-300 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{networkError}</span>
                  </div>
                  <button
                    onClick={retryLastSubmission}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Question
                  </button>
                </div>
              )}

              {micPermissionStatus === 'denied' && (
                <div className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Microphone access blocked. Click <strong>Retry Microphone</strong> or use <strong>Typing Mode</strong> below.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={retryMicrophone}
                      className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Microphone
                    </button>
                    {!isTypingMode && (
                      <button
                        onClick={switchToTyping}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Use Typing Mode
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!speechRecognitionSupported && (
                <div className="bg-slate-900 border border-white/10 p-3 rounded-2xl flex items-center gap-2.5 text-slate-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Speech recognition is unavailable in this browser. Please use Typing Mode to complete your interview.</span>
                </div>
              )}

              {/* Dynamic State Machine Subtitles / Transcription Feed */}
              {aiSpeaking || interviewerStatus === 'speaking' || interviewState === 'AI_SPEAKING' ? (
                <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <div className="flex-1 text-[11px] text-amber-300 leading-relaxed">
                      <span className="font-bold">Interviewer is speaking...</span> Microphone transcription is paused to prevent voice echo.
                    </div>
                  </div>
                  <button
                    onClick={skipAiSpeakingAndListen}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                    title="Interrupt AI and start speaking immediately"
                  >
                    <Zap className="w-3 h-3 text-amber-300" /> I'm Ready — Speak Now
                  </button>
                </div>
              ) : interviewState === 'WAITING_FOR_CANDIDATE' ? (
                <div className="bg-slate-900/60 border border-white/10 p-3 rounded-2xl flex gap-3 items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                  <div className="flex-1 text-[11px] text-slate-400 leading-relaxed">
                    Ready for your answer. Microphone activating shortly...
                  </div>
                </div>
              ) : interviewState === 'PROCESSING_ANSWER' || interviewState === 'GENERATING_NEXT_QUESTION' ? (
                <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-2xl flex gap-3 items-center">
                  <Activity className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  <div className="flex-1 text-[11px] text-indigo-300 leading-relaxed">
                    Evaluating your response and formulating next question...
                  </div>
                </div>
              ) : isRecording && !isMuted ? (
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl flex gap-3 items-center">
                  <Mic className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <div className="flex-1 text-[11px] text-slate-300 italic leading-relaxed truncate">
                    {(interimTranscript || finalTranscript) ? (
                      <span className="text-emerald-400 font-medium font-mono not-italic">
                        "{interimTranscript || finalTranscript}"
                      </span>
                    ) : (
                      <span className="text-emerald-300">Listening to your response... Speak clearly into your microphone</span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Response Panel Container */}
              <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Candidate Answer Area</span>
                  <button
                    onClick={isTypingMode ? switchToSpeaking : switchToTyping}
                    className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-bold text-slate-300 transition-all flex items-center gap-1.5"
                  >
                    {isTypingMode ? <><Mic className="w-3 h-3 text-indigo-400" /> Voice Mode</> : <><Keyboard className="w-3 h-3 text-indigo-400" /> Typing Mode</>}
                  </button>
                </div>

                <div>
                  {isTypingMode ? (
                    <div className="flex gap-2">
                      <textarea
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTypeAnswerSubmit(); } }}
                        placeholder="Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                        disabled={isSubmitting || isAIThinking}
                        rows={1}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed no-scrollbar"
                      />
                      <button
                        onClick={handleTypeAnswerSubmit}
                        disabled={isSubmitting || isAIThinking || !typedAnswer.trim()}
                        className="px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <div className="border border-white/[0.08] bg-slate-950/80 rounded-2xl p-4 transition-all">
                      {aiSpeaking || interviewerStatus === 'speaking' || interviewState === 'AI_SPEAKING' ? (
                        <div className="flex items-center justify-between py-3 px-4 border border-amber-500/20 bg-amber-950/20 rounded-xl text-left flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            </div>
                            <div>
                              <span className="text-[11px] text-amber-200 font-bold block">Interviewer is speaking</span>
                              <p className="text-[10px] text-amber-300/70">Listening is temporarily paused so AI audio is not transcribed as your response.</p>
                            </div>
                          </div>
                          <button
                            onClick={skipAiSpeakingAndListen}
                            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-amber-300" /> I'm Ready — Speak Now
                          </button>
                        </div>
                      ) : (finalTranscript || interimTranscript) ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Live Speech Transcribing</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={clearTranscript}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-400 transition-all border border-white/5 flex items-center gap-1"
                                title="Clear speech transcript"
                              >
                                <Trash2 className="w-3 h-3" /> Clear
                              </button>
                              <button
                                onClick={() => submitAnswer()}
                                disabled={isSubmitting || isAIThinking || !finalTranscript.trim() || aiSpeaking}
                                className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-[11px] font-bold text-white transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Activity className="w-3 h-3 animate-spin" /> Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" /> Submit Answer
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="min-h-[70px] text-xs md:text-sm text-slate-100 font-normal leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5 break-words">
                            <span>{finalTranscript}</span>
                            <span className="text-indigo-400 font-semibold animate-pulse">{interimTranscript ? ` ${interimTranscript}` : ''}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            💡 The AI is capturing your voice live. Speak your full answer and stop speaking or click 'Submit Answer'.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between py-2.5 px-4 border border-dashed border-white/10 bg-slate-950/80 rounded-xl text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-200 font-bold block">Speak your response aloud or type solution</span>
                              <p className="text-[10px] text-slate-400">The AI interviewer is listening in real-time or click 'Submit Code'.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM BAR PANEL SHORTCUTS — non-coding modes */}
          <footer className="flex-shrink-0 bg-slate-950 border-t border-white/[0.06] p-3 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (repeatQuestion) repeatQuestion();
                  else if (speakText) speakText(`Let me repeat the question for you: ${currentQuestion}`);
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Repeat Question
              </button>
              <button
                onClick={() => {
                  const msg = `Could you please clarify: ${currentQuestion}`;
                  if (speakText) { speakText(msg); } else if (window.speechSynthesis) { window.speechSynthesis.cancel(); const utt = new SpeechSynthesisUtterance(msg); utt.lang = 'en-US'; window.speechSynthesis.speak(utt); }
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Request Clarification
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConversationLogOpen(!conversationLogOpen)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-indigo-400" /> Chat Log
              </button>
              <button onClick={() => setShowNotesModal(true)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1">
                <Edit className="w-3 h-3 text-indigo-400" /> Take Notes
              </button>
            </div>
          </footer>

            </>
          )}

        </section>


        {/* RIGHT PANEL: Dynamic telemetry & Progress logs */}
        {rightPanelOpen && (
          <section className="w-[280px] bg-slate-900/20 border-l border-white/[0.06] p-4 flex flex-col justify-between flex-shrink-0 relative overflow-y-auto no-scrollbar hidden md:flex">
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Progress</h3>
                <button onClick={() => setRightPanelOpen(false)} className="text-slate-500 hover:text-white">
                  <ListCollapse className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Tracker */}
              <div className="bg-slate-950 p-4 border border-white/5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Question</span>
                  <span className="text-white font-bold font-mono">Q{interview?.questions?.length + 1 || 1}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="text-indigo-400 font-bold uppercase tracking-wide">{interview?.difficulty || 'Medium'}</span>
                </div>

                {/* Progress Timeline steps */}
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2 items-center text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-400">Current: {getFlowTopics().current}</span>
                  </div>
                  <div className="flex gap-2 items-center text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    <span className="text-slate-500">Next: {getFlowTopics().next}</span>
                  </div>
                </div>
              </div>

              {/* Speech Telemetry */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Speech Analysis HUD</span>
                <div className="space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Speech Clarity</span>
                      <span className="text-slate-300 font-mono">{hudClarity}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${hudClarity}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Confidence Rating</span>
                      <span className="text-slate-300 font-mono">{hudConfidence}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${hudConfidence}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3 text-[10px] text-indigo-300 leading-relaxed mt-6">
              {realtimeTips}
            </div>
          </section>
        )}

      </div>

      {/* ================================================== */}
      {/* 3. FLOATING CONVERSATION LOG DRAWER */}
      {/* ================================================== */}
      <AnimatePresence>
        {conversationLogOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-40 bg-slate-900 border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-950">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Dialogue History</span>
              <button onClick={() => setConversationLogOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {conversationHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTES MODAL */}
      <AnimatePresence>
        {showNotesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6"
            >
              <h3 className="text-sm font-bold text-white mb-3">Self Notes &amp; Scratchpad</h3>
              <textarea
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder="Jot down formulas, keywords, algorithms or reminders for yourself during the session..."
                className="w-full h-40 bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Save Notes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MockInterviewRoom;
