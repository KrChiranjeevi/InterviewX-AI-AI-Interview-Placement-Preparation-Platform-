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
            <span className="font-mono text-slate-300 font-bold">{sessionTimeLeft || '15:00'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Live Connected</span>
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
                <span className="text-xs font-bold text-slate-300 capitalize">{interviewerStatus}</span>
                <span className={`h-2 w-2 rounded-full ${
                  interviewerStatus === 'listening' ? 'bg-emerald-400' :
                  interviewerStatus === 'analyzing' || interviewerStatus === 'typing' ? 'bg-amber-400 animate-pulse' :
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
          
          <div className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col justify-between">
            
            {/* ARCHETYPE CONDITIONAL WORKSPACE */}
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* CODING MODE WORKSPACE */}
              {archetype === 'coding' ? (
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0 overflow-hidden mb-6">
                  {/* Left: Problem statement */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col overflow-y-auto no-scrollbar justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">DSA CHALLENGE</span>
                        <span className="text-[10px] font-mono text-slate-500">Language: {selectedLanguage || 'Java'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-2">Coding Problem Statement</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{currentQuestion}</p>
                      
                      <div className="bg-slate-950 border border-white/5 rounded-xl p-3 mb-4 space-y-2 text-[11px]">
                        <span className="font-bold text-indigo-400 block">Expected Constraints:</span>
                        <p className="text-slate-400">Time Complexity: O(N log N) or optimal linear complexity.</p>
                        <p className="text-slate-400">Space Complexity: O(1) auxiliary space restrictions.</p>
                      </div>
                    </div>
                  </div>
                  {/* Right: Code Sandbox */}
                  <div className="bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[300px]">
                    <div className="bg-slate-950 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solution Editor</span>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded px-2.5 py-1 text-[10px] text-white focus:outline-none"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                    <div className="flex-1 min-h-0">
                      <Editor
                        theme="vs-dark"
                        language={selectedLanguage}
                        value={codeContent}
                        onChange={setCodeContent}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 11,
                          scrollBeyondLastLine: false,
                          lineNumbersMinChars: 3
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : archetype === 'resume' ? (
                /* RESUME SPLIT SCREEN */
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4 min-h-0 overflow-hidden mb-6">
                  {/* Left: Resume Section highlights */}
                  <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 flex flex-col overflow-y-auto no-scrollbar">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-4">Resume Profiler</span>
                    
                    <div className="space-y-4 font-mono text-[10px] text-slate-400">
                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'projects' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">🚀 Projects Highlighted</span>
                        <p className="text-slate-300 leading-relaxed">System microservices controller utilizing Redis key-value stores. Mapped scalable REST controllers with automated caching layers.</p>
                      </div>

                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'skills' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">🛠️ Technical Skillsets</span>
                        <p className="text-slate-300 leading-relaxed">Node.js, Express, Java, Spring Framework, SQL indexing, Docker pipelines.</p>
                      </div>

                      <div className={`p-4 rounded-xl border transition-all ${activeHighlightSection === 'experience' ? 'border-amber-500/60 bg-amber-500/5' : 'border-white/5 bg-transparent'}`}>
                        <span className="font-black text-white block uppercase tracking-widest mb-1.5">💼 Target Experience</span>
                        <p className="text-slate-300 leading-relaxed">Software Intern at Tech Labs. Directed API architecture integration workflows.</p>
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
                <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full mb-6">
                  <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Interviewer Prompt</span>
                    </div>

                    <h2 className="text-sm md:text-base font-black text-white leading-relaxed tracking-tight">
                      {currentQuestion}
                    </h2>
                  </div>
                </div>
              )}

            </div>

            {/* TRANSCRIPT & RESPONSE AREA */}
            <div className="space-y-4">
              
              {/* Dynamic Subtitles / Transcription Feed */}
              {isRecording && !isMuted && (
                <div className="bg-slate-900/40 border border-white/5 p-3 rounded-2xl flex gap-3 items-center">
                  <Mic className="w-4 h-4 text-rose-500 animate-pulse shrink-0" />
                  <div className="flex-1 text-[11px] text-slate-400 italic leading-relaxed">
                    Voice response stream: Speaking detected...
                  </div>
                </div>
              )}

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
                        disabled={isAIThinking}
                        rows={1}
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed no-scrollbar"
                      />
                      <button
                        onClick={handleTypeAnswerSubmit}
                        disabled={isAIThinking || !typedAnswer.trim()}
                        className="px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border border-white/[0.05] bg-slate-950/60 rounded-2xl">
                      <span className="text-xs text-slate-400 font-bold mb-2">Speak your response aloud</span>
                      <p className="text-[10px] text-slate-600">The AI will automatically capture and evaluate your speech flow.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM BAR PANEL SHORTCUTS */}
          <footer className="flex-shrink-0 bg-slate-950 border-t border-white/[0.06] p-3 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsAIThinking(true);
                  setTimeout(() => {
                    setIsAIThinking(false);
                    alert("Sarah: 'Certainly, let me repeat the question for you: ' + currentQuestion");
                  }, 1200);
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Repeat Question
              </button>
              <button
                onClick={() => {
                  alert("Sarah: 'Could you clarify if you'd like me to repeat the scenario description or the technical bounds of the prompt?'");
                }}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
              >
                Request Clarification
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
                <Edit className="w-3 h-3 text-indigo-400" /> Take Notes
              </button>
            </div>
          </footer>

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
