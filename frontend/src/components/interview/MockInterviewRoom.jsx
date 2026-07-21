import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Shield, Send, Keyboard, Activity, CheckCircle2,
  AlertCircle, Zap, Brain, Play, Pause, Plus, Database, User,
  Check, AlertTriangle, Trash2, Mic, Code2, Layout, FileText, ArrowRight,
  MessageSquare, ChevronRight, X
} from 'lucide-react';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaStopCircle, FaRobot, FaUserAlt, FaPaperPlane,
  FaBookmark, FaRegBookmark
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
  // ── Premium Conversation Engine Props (new) ──
  interviewerStatus = 'listening',
  conversationHistory = [],
  conversationLogOpen = false,
  setConversationLogOpen = () => {},
  onExcellentAnswer = false,
  interviewStage = 'core',
}) => {

  // Local helper states to enrich the workflows
  const [activeHighlightSection, setActiveHighlightSection] = useState('experience');
  const [starStep, setStarStep] = useState(0); // For behavioral STAR tracking: 0=S, 1=T, 2=A, 3=R
  const [realtimeTips, setRealtimeTips] = useState('Welcome! Take a breath, analyze structural constraints, and answer confidently.');

  // Rotate helpful real-time AI tips dynamically
  useEffect(() => {
    const tipsList = {
      technical: [
        '💡 Pro Tip: Explain time & space complexity space before typing code.',
        '💡 Pro Tip: Structure your fundamental definitions using direct analogies.',
        '💡 Pro Tip: Relate concepts to memory/CPU layout behavior where possible.'
      ],
      hr: [
        '💡 Pro Tip: Maintain warm tone, positive eye contact and speak with moderate speed.',
        '💡 Pro Tip: Showcase alignment with general engineering growth frameworks.',
        '💡 Pro Tip: Emphasize personal ownership and clear learning metrics.'
      ],
      resume: [
        '💡 Pro Tip: Focus on the quantitative impact (e.g. 30% speedup) of your projects.',
        '💡 Pro Tip: Highlight individual architectural contributions over general team tasks.',
        '💡 Pro Tip: Relate project technologies directly to the target role standards.'
      ],
      coding: [
        '💡 Pro Tip: Dry run edge cases (null inputs, single item, overflow) before submit.',
        '💡 Pro Tip: State your approach out loud before writing solution loops.',
        '💡 Pro Tip: Use descriptive variables to show high code readability standard.'
      ],
      system_design: [
        '💡 Pro Tip: Start with high-level user flow diagram before detailed DB layers.',
        '💡 Pro Tip: Explicitly identify single points of failure and add cache/redundancy.',
        '💡 Pro Tip: Calculate network bandwidth and storage size scales out loud.'
      ],
      behavioral: [
        '💡 Pro Tip: Use "I did" instead of "We did" to clearly show your ownership.',
        '💡 Pro Tip: Ensure your Result phase shows positive, measurable outcome metrics.',
        '💡 Pro Tip: Standardize stories to focus on challenges and adaptive learning.'
      ]
    };
    const activeTips = tipsList[archetype] || tipsList.technical;
    const interval = setInterval(() => {
      const randomTip = activeTips[Math.floor(Math.random() * activeTips.length)];
      setRealtimeTips(randomTip);
    }, 12000);
    return () => clearInterval(interval);
  }, [archetype]);

  // Keep track of STAR checkbox states automatically based on conversation transcripts length
  const starChecklist = useMemo(() => {
    const count = dialogLogs.filter(l => l.sender === 'user').length;
    return {
      situation: count >= 1,
      task: count >= 2,
      action: count >= 3,
      result: count >= 4
    };
  }, [dialogLogs]);

  // Highlight resume section automatically as dialogue progresses
  useEffect(() => {
    const sections = ['experience', 'projects', 'certifications', 'education'];
    const idx = dialogLogs.filter(l => l.sender === 'user').length % sections.length;
    setActiveHighlightSection(sections[idx]);
  }, [dialogLogs]);

  // Unique visual headers and styling based on active mock interview type
  const roomStyles = useMemo(() => {
    switch (archetype) {
      case 'coding':
        return {
          title: 'AI Code Compiling Sandbox',
          badge: 'Practice Coding Room',
          accent: 'from-emerald-500 to-teal-500',
          bgGlow: 'rgba(16,185,129,0.06)'
        };
      case 'hr':
        return {
          title: 'Professional Office Suite',
          badge: 'Mock HR Screening',
          accent: 'from-pink-500 to-rose-500',
          bgGlow: 'rgba(236,72,153,0.06)'
        };
      case 'resume':
        return {
          title: 'Interactive CV Evaluation',
          badge: 'Mock Resume Drill',
          accent: 'from-amber-500 to-orange-500',
          bgGlow: 'rgba(245,158,11,0.06)'
        };
      case 'system_design':
        return {
          title: 'System Architecture Board',
          badge: 'Practice System Design',
          accent: 'from-cyan-500 to-blue-500',
          bgGlow: 'rgba(6,182,212,0.06)'
        };
      case 'behavioral':
        return {
          title: 'STAR Methodology Room',
          badge: 'Behavioral Prep',
          accent: 'from-purple-500 to-indigo-500',
          bgGlow: 'rgba(139,92,246,0.06)'
        };
      default:
        return {
          title: 'AI Engineering Sandbox',
          badge: 'Technical Practice Room',
          accent: 'from-indigo-500 to-purple-500',
          bgGlow: 'rgba(99,102,241,0.06)'
        };
    }
  }, [archetype]);

  // Video box styling
  const renderWebcamBox = () => (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden relative flex flex-col shadow-xl">
      <div className="w-full h-44 bg-slate-950/80 relative flex items-center justify-center overflow-hidden flex-shrink-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isCameraOn ? 'opacity-0 hidden' : 'opacity-100'}`}
        />

        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-[9px] text-slate-500">Camera disabled</span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[8px] text-slate-400">
          {faceStatus}
        </div>
      </div>

      {/* Control Buttons Row */}
      <div className="flex justify-around items-center p-2 bg-black/50 border-t border-white/5">
        <button
          onClick={toggleMute}
          className={`p-1.5 rounded-lg border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <FaMicrophoneSlash className="text-[10px]" /> : <FaMicrophone className="text-[10px]" />}
        </button>
        
        <button
          onClick={toggleCamera}
          className={`p-1.5 rounded-lg border transition-all ${!isCameraOn ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {!isCameraOn ? <FaVideoSlash className="text-[10px]" /> : <FaVideo className="text-[10px]" />}
        </button>
        
        <button
          onClick={toggleBookmark}
          className={`p-1.5 rounded-lg border transition-all ${isBookmarked ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
          title="Bookmark question"
        >
          <FaBookmark className="text-[10px]" />
        </button>
      </div>
    </div>
  );

  // Response Panel
  const renderResponsePanel = () => (
    <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 flex-shrink-0">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Response Input Channel</span>
        <button
          onClick={isTypingMode ? switchToSpeaking : switchToTyping}
          className="px-2 py-0.5 border border-white/10 hover:bg-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-1"
        >
          {isTypingMode ? <><Mic className="w-2.5 h-2.5" /> Speaking Mode</> : <><Keyboard className="w-2.5 h-2.5" /> Type mode</>}
        </button>
      </div>

      <div className="min-h-[50px]">
        {isTypingMode ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isAIThinking) handleTypeAnswerSubmit(); }}
              placeholder="Type your structured engineering answer here and press Enter..."
              disabled={isAIThinking}
              className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            />
            <button
              onClick={handleTypeAnswerSubmit}
              disabled={isAIThinking || !typedAnswer.trim()}
              className="px-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-1.5 border border-white/[0.04] bg-white/[0.01] rounded-xl relative">
            <WaveformVisualizer stream={stream} isActive={!isMuted && isRecording} />
            <span className="text-[10px] text-slate-400 font-semibold mt-1">
              {isMuted ? 'Microphone is currently muted' : isRecording ? 'AI is listening... Speak your answer now' : 'Wait for AI to finish prompt'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ARCHETYPE VIEWS
  return (
    <div className="flex-1 flex gap-3 overflow-hidden min-h-0 relative">
      
      {/* ── ARCHETYPE 1: TECHNICAL INTERVIEW ROOM ── */}
      {archetype === 'technical' && (
        <>
          {/* Left panel: Timeline & Knowledge map */}
          <div className="w-[280px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto no-scrollbar">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Practice Progress Map</h3>
              <div className="relative border-l border-white/10 ml-3 pl-4 space-y-4 text-xs font-semibold">
                <div className="relative">
                  <span className="absolute left-[-21px] top-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  <span className="text-emerald-400">1. Conceptual Overview</span>
                </div>
                <div className="relative">
                  <span className={`absolute left-[-21px] top-0.5 w-2.5 h-2.5 rounded-full ${dialogLogs.length > 2 ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'} ring-4 ring-indigo-500/20`} />
                  <span className={dialogLogs.length > 2 ? 'text-emerald-400' : 'text-indigo-300'}>2. System & Core Mechanics</span>
                </div>
                <div className="relative">
                  <span className={`absolute left-[-21px] top-0.5 w-2.5 h-2.5 rounded-full ${dialogLogs.length > 4 ? 'bg-emerald-500' : 'bg-slate-700'} ring-4 ring-slate-700/20`} />
                  <span className={dialogLogs.length > 4 ? 'text-emerald-400' : 'text-slate-500'}>3. Extreme Scale Scenarios</span>
                </div>
                <div className="relative">
                  <span className="absolute left-[-21px] top-0.5 w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="text-slate-500">4. Performance Summary</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase mb-3">Active Skills Evaluated</h3>
              <div className="flex flex-wrap gap-1.5">
                {['Algorithms', 'Data Structures', 'Logical Rigor', 'Complexity estimation', 'Concurrency'].map((tag, idx) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                      idx < dialogLogs.length ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center workspace: Modern AI Interview Room */}
          <div className="flex-1 bg-slate-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            {/* Header info */}
            <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">Practice Simulator Sandbox</span>
                <h2 className="text-sm font-black text-white">{roomStyles.title}</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                {roomStyles.badge}
              </span>
            </div>

            {/* Premium AI Interviewer Avatar Panel */}
            <div className="relative border-b border-white/5 overflow-hidden" style={{ height: 220 }}>
              <InterviewerAvatar
                aiSpeaking={aiSpeaking}
                isAIThinking={isAIThinking}
                interviewerName="Sarah"
                interviewerStatus={interviewerStatus}
                onExcellentAnswer={onExcellentAnswer}
              />

              {/* Conversation Log Toggle Button */}
              <button
                onClick={() => setConversationLogOpen(prev => !prev)}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl text-[9px] font-bold text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all"
              >
                <MessageSquare className="w-3 h-3" />
                Chat Log
              </button>

              {/* Interview Stage Badge */}
              <div className="absolute top-3 left-3 z-20 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                {interviewStage === 'greeting' ? '👋 Welcome' :
                 interviewStage === 'warmup' ? '🌅 Warm-up' :
                 interviewStage === 'core' ? '🎯 Core Round' :
                 interviewStage === 'deepdive' ? '🔬 Deep Dive' :
                 interviewStage === 'closing' ? '✅ Closing' : '🎯 Interview'}
              </div>
            </div>

            {/* Dialogue stream */}
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
              <div className="flex justify-start">
                <div className="max-w-xl p-4 bg-slate-950/80 border border-indigo-500/25 rounded-2xl rounded-bl-none shadow-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Simulator Question</span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-white">{currentQuestion}</p>
                </div>
              </div>

              {dialogLogs.slice(0, -1).map((log, idx) => (
                <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-xs leading-normal font-semibold ${
                    log.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-900/60 text-slate-300 rounded-bl-none'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom response bar */}
            <div className="p-3 border-t border-white/5 bg-slate-950/20">
              {renderResponsePanel()}
            </div>
          </div>

          {/* Right panel: Video & Metrics */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-4">
              <h3 className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Live telemetry gauges</h3>
              <div className="space-y-3 font-semibold">
                {[
                  { label: 'Technical Depth', score: 82, color: 'bg-emerald-500' },
                  { label: 'Complexity Focus', score: 75, color: 'bg-indigo-500' },
                  { label: 'Speech Fluency', score: hudClarity, color: 'bg-cyan-500' }
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-slate-500">{metric.label}</span>
                      <span className="font-mono text-slate-200">{(!isRecording || isMuted) ? 0 : metric.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${metric.color}`} style={{ width: `${(!isRecording || isMuted) ? 0 : metric.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                  {realtimeTips}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ARCHETYPE 2: HR OFFICE SUITE ROUND ── */}
      {archetype === 'hr' && (
        <>
          {/* Left panel: Culture values */}
          <div className="w-[280px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto no-scrollbar">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-pink-400 uppercase mb-3">Company Culture Benchmarks</h3>
              <div className="space-y-3">
                {[
                  { title: 'Customer First', desc: 'Prioritize consumer metrics over internal constraints.' },
                  { title: 'Extreme Ownership', desc: 'Take direct accountability for metrics performance.' },
                  { title: 'Collaborative Spirit', desc: 'Structure teams to facilitate cross-functional ideas.' }
                ].map(val => (
                  <div key={val.title} className="p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                    <span className="text-[10px] font-bold text-white block mb-0.5">{val.title}</span>
                    <span className="text-[9px] text-slate-500 leading-normal block">{val.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex-1">
              <h3 className="text-[10px] font-black tracking-widest text-pink-400 uppercase mb-3">Communication Analytics</h3>
              <div className="space-y-3 font-semibold">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Vocabulary Variety</span>
                    <span className="text-slate-300 font-mono">Moderate</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Speaking Pace</span>
                    <span className="text-slate-300 font-mono">{(!isRecording || isMuted) ? '0 wpm' : `${hudWpm} wpm`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center workspace: Warm HR Office */}
          <div className="flex-1 bg-gradient-to-br from-pink-950/5 via-slate-900 to-slate-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest block">HR Suite Simulator</span>
                <h2 className="text-sm font-black text-white">{roomStyles.title}</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[9px] font-black text-pink-400 uppercase tracking-widest">
                {roomStyles.badge}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
              <div className="flex justify-start">
                <div className="max-w-xl p-4 bg-slate-950/90 border border-pink-500/20 rounded-2xl rounded-bl-none shadow-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">HR Representative Prompt</span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-white">{currentQuestion}</p>
                </div>
              </div>

              {dialogLogs.slice(0, -1).map((log, idx) => (
                <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-xs leading-normal font-semibold ${
                    log.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none' : 'bg-slate-900/60 text-slate-300 rounded-bl-none'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5 bg-slate-950/20">
              {renderResponsePanel()}
            </div>
          </div>

          {/* Right panel: Video & Expression Telemetry */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-4">
              <div>
                <h3 className="text-[10px] font-black tracking-widest text-pink-400 uppercase mb-2">Micro-Expression Analysis</h3>
                <div className="p-3 rounded-xl border border-pink-500/10 bg-pink-500/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Candidate State:</span>
                  <span className="text-xs font-black text-pink-400 uppercase tracking-wider animate-pulse">
                    {!isCameraOn ? 'SCANNER OFF' : hudConfidence > 80 ? 'Highly Engaged' : 'Thinking / Focused'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-semibold">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Tone Warmth</span>
                    <span className="font-mono text-slate-200">{(!isRecording || isMuted) ? 0 : 85}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${(!isRecording || isMuted) ? 0 : 85}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Confidence Index</span>
                    <span className="font-mono text-slate-200">{!isCameraOn ? 0 : hudConfidence}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${!isCameraOn ? 0 : hudConfidence}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-pink-500/5 border border-pink-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                  {realtimeTips}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ARCHETYPE 3: RESUME BASED DRILL ROUND ── */}
      {archetype === 'resume' && (
        <>
          {/* Left panel: Simulated CV highlights */}
          <div className="w-[360px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 flex-shrink-0 overflow-y-auto no-scrollbar">
            <h3 className="text-[10px] font-black tracking-widest text-amber-500 uppercase">CV Source Analyzer</h3>
            
            <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-3 font-mono text-[10px] text-slate-400 overflow-y-auto no-scrollbar">
              <div className={`p-2 rounded-lg border transition-all ${activeHighlightSection === 'education' ? 'border-amber-500/60 bg-amber-500/10' : 'border-transparent bg-transparent'}`}>
                <span className="font-black text-white block uppercase tracking-widest text-[9px] mb-1">🎓 EDUCATION</span>
                <span>B.Tech in Computer Science &amp; Engineering<br />GPA: 8.9/10</span>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${activeHighlightSection === 'experience' ? 'border-amber-500/60 bg-amber-500/10' : 'border-transparent bg-transparent'}`}>
                <span className="font-black text-white block uppercase tracking-widest text-[9px] mb-1">💼 EXPERIENCE / INTERNSHIPS</span>
                <span>Software Engineer Intern at Tech Labs<br />• Architected API pipelines using Node.js.<br />• Optimized MySQL indexing for DB bottlenecks.</span>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${activeHighlightSection === 'projects' ? 'border-amber-500/60 bg-amber-500/10' : 'border-transparent bg-transparent'}`}>
                <span className="font-black text-white block uppercase tracking-widest text-[9px] mb-1">🚀 PROJECTS</span>
                <span>• Distributed key-value cache layer<br />• Multi-modal vector search indexing tool</span>
              </div>

              <div className={`p-2 rounded-lg border transition-all ${activeHighlightSection === 'certifications' ? 'border-amber-500/60 bg-amber-500/10' : 'border-transparent bg-transparent'}`}>
                <span className="font-black text-white block uppercase tracking-widest text-[9px] mb-1">📜 CERTIFICATIONS</span>
                <span>AWS Developer Associate · Oracle Java Specialist</span>
              </div>
            </div>
          </div>

          {/* Center workspace: Resume evaluation */}
          <div className="flex-1 bg-slate-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block">CV Evaluation Sandbox</span>
                <h2 className="text-sm font-black text-white">{roomStyles.title}</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                {roomStyles.badge}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
              <div className="flex justify-start">
                <div className="max-w-xl p-4 bg-slate-950/80 border border-amber-500/20 rounded-2xl rounded-bl-none shadow-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">AI Scanner Query</span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-white">{currentQuestion}</p>
                </div>
              </div>

              {dialogLogs.slice(0, -1).map((log, idx) => (
                <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-xs leading-normal font-semibold ${
                    log.sender === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-slate-900/60 text-slate-300 rounded-bl-none'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5 bg-slate-950/20">
              {renderResponsePanel()}
            </div>
          </div>

          {/* Right panel: Video & Project deck */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-3">
              <h3 className="text-[10px] font-black tracking-widest text-amber-500 uppercase">Interactive CV Deck</h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {[
                  { name: 'Distributed Cache Layer', role: 'Creator', detail: 'Golang, Redis, consistent hashing' },
                  { name: 'Tech Labs Intern', role: 'Backend', detail: 'REST APIs, indexing optimizations' },
                  { name: 'AWS Cloud Associate', role: 'Cert', detail: 'IAM, VPC, EC2 scales configuration' }
                ].map(item => (
                  <div key={item.name} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/20 transition-all text-left">
                    <span className="text-[10px] font-bold text-white block">{item.name}</span>
                    <span className="text-[8px] text-amber-400 font-semibold uppercase tracking-wider block mt-0.5">{item.role}</span>
                    <span className="text-[9px] text-slate-500 block leading-tight mt-1">{item.detail}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                {realtimeTips}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ARCHETYPE 4: LARGE CODING ROUND ── */}
      {archetype === 'coding' && (
        <>
          {/* Left panel: Problem description & console logs */}
          <div className="w-[320px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto no-scrollbar">
            <div>
              <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase block">Active Assignment</span>
              <h3 className="text-sm font-bold text-white mb-2">Reverse Subarray Sorting</h3>
              <p className="text-[10.5px] text-slate-400 leading-relaxed mb-3">
                Given an array of integers, evaluate if reversing a single contiguous subarray can sort the array in ascending order.
              </p>
              
              <div className="space-y-1.5 font-mono text-[9.5px]">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 block">Input Reference:</span>
                  <span className="text-slate-300">nums = [1, 2, 5, 4, 3]</span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-white/[0.04]">
                  <span className="text-slate-500 block">Expected Output:</span>
                  <span className="text-emerald-400">true</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex-1 flex flex-col min-h-0">
              <h4 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-2">Execution Console</h4>
              <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-3 font-mono text-[10px] text-slate-400 overflow-y-auto no-scrollbar">
                {sqlResult === 'running' ? (
                  <span className="text-amber-400 animate-pulse block">Compiling compiler modules...</span>
                ) : sqlResult ? (
                  <span className="text-emerald-400 block">✔ All 12 test cases compiled successfully!</span>
                ) : (
                  <span className="text-slate-600 block">Compile code to run active test validations.</span>
                )}
              </div>
            </div>
          </div>

          {/* Center workspace: Coding IDE */}
          <div className="flex-1 bg-slate-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            <div className="flex-shrink-0 bg-slate-950/40 px-4 py-2 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Compiler IDE
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-xs rounded px-2 py-0.5 text-slate-300 focus:outline-none"
                >
                  <option value="python">Python 3</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java 17</option>
                </select>
              </div>
              <button
                onClick={submitAnswer}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] font-black text-white transition-all shadow-lg"
              >
                Submit Code Solution
              </button>
            </div>

            <div className="flex-1 min-h-0 relative">
              <Editor
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                language={selectedLanguage}
                value={codeContent}
                onChange={(val) => setCodeContent(val)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineHeight: 18,
                  lineNumbers: 'on',
                  scrollbar: { vertical: 'visible' }
                }}
              />
            </div>
          </div>

          {/* Right panel: Sidebar AI evaluations & video */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-4">
              <div className="p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-left flex items-start gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/30 flex-shrink-0 mt-0.5">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Marcus" />
                </div>
                <div className="flex-1 text-[9px] leading-relaxed text-slate-400">
                  <span className="font-bold text-white block">AI Evaluator</span>
                  {currentQuestion}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                  {realtimeTips}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ARCHETYPE 5: SYSTEM DESIGN CANVAS Round ── */}
      {archetype === 'system_design' && (
        <>
          {/* Left panel: Architecture nodes deck */}
          <div className="w-[180px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 flex-shrink-0 overflow-y-auto no-scrollbar">
            <span className="text-[9px] font-black uppercase text-cyan-400 tracking-wider">Node Elements</span>
            {[
              { label: 'Client', type: 'Client' },
              { label: 'Gateway', type: 'Gateway' },
              { label: 'Balancer', type: 'Gateway' },
              { label: 'Service', type: 'Service' },
              { label: 'NoSQL DB', type: 'Database' },
              { label: 'Redis Cache', type: 'Cache' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => addBlockToDesign(item.type)}
                className="px-2.5 py-1.5 border border-white/10 bg-white/[0.02] hover:bg-white/5 rounded text-[10px] text-left font-bold text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" /> {item.label}
              </button>
            ))}
            <div className="border-t border-white/5 my-2" />
            <button
              onClick={clearDrawing}
              className="px-2 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-600 rounded text-[10px] text-left font-bold text-red-400 hover:text-white transition-colors"
            >
              Clear architecture
            </button>
          </div>

          {/* Center workspace: Canvas grid */}
          <div className="flex-1 bg-slate-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">System Topology Sandbox</span>
                <h2 className="text-sm font-black text-white">{roomStyles.title}</h2>
              </div>
              <button
                onClick={submitAnswer}
                className="px-3.5 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-[10px] font-black text-white transition-all shadow-lg"
              >
                Submit Design layout
              </button>
            </div>

            <div className="flex-1 relative bg-slate-950/30 overflow-hidden flex flex-col min-h-0 animate-grid">
              <canvas
                ref={canvasRefDraw}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="absolute inset-0 z-0 cursor-crosshair"
                width={800}
                height={600}
              />

              {/* Draggable layout block boxes */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {blocks.map(b => (
                  <div
                    key={b.id}
                    className="absolute pointer-events-auto bg-slate-900 border border-cyan-500/40 rounded-lg p-2 text-center cursor-move shadow-xl flex flex-col justify-center min-w-[85px] h-[45px] leading-tight"
                    style={{ left: b.x, top: b.y }}
                  >
                    <span className="text-[8px] uppercase font-black tracking-widest text-cyan-400">{b.type}</span>
                    <span className="text-[9px] text-white font-bold truncate mt-0.5">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Video & Design Telemetry */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-4">
              <div className="p-3 rounded-xl border border-cyan-500/10 bg-cyan-500/5 text-left">
                <span className="text-[9px] font-black text-white block mb-1">Architecture Prompt</span>
                <p className="text-[10px] leading-relaxed text-slate-400">{currentQuestion}</p>
              </div>

              <div className="space-y-3 font-semibold">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Latency Estimate</span>
                    <span className="text-cyan-400 font-mono">14ms (Low)</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">System Redundancy</span>
                    <span className="text-slate-300 font-mono">High</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                  {realtimeTips}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── ARCHETYPE 6: BEHAVIORAL STAR TIMELINE ROUND ── */}
      {archetype === 'behavioral' && (
        <>
          {/* Left panel: STAR checklist tracker */}
          <div className="w-[280px] bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto no-scrollbar">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-3">STAR Method Checklist</h3>
              <div className="space-y-3">
                {[
                  { key: 'situation', label: 'Situation', desc: 'Detail context and initial project scope.' },
                  { key: 'task', label: 'Task', desc: 'Identify targets, deadlines and obstacles.' },
                  { key: 'action', label: 'Action', desc: 'Detail your contribution and technical decisions.' },
                  { key: 'result', label: 'Result', desc: 'Describe quantitative metrics of success.' }
                ].map(step => (
                  <div key={step.key} className="flex gap-2.5 items-start">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      starChecklist[step.key] ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/10 bg-white/5 text-transparent'
                    }`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold block ${starChecklist[step.key] ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                      <span className="text-[9px] text-slate-500 leading-normal block">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex-1">
              <h3 className="text-[10px] font-black tracking-widest text-purple-400 uppercase mb-3">STAR Analytics</h3>
              <div className="space-y-3 font-semibold">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Ownership Focus</span>
                    <span className="text-purple-400 font-mono">High</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center workspace: Conversational log */}
          <div className="flex-1 bg-slate-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden min-w-0">
            <div className="bg-slate-950/40 p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block">STAR Behavioral Simulator</span>
                <h2 className="text-sm font-black text-white">{roomStyles.title}</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] font-black text-purple-400 uppercase tracking-widest">
                {roomStyles.badge}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-4">
              <div className="flex justify-start">
                <div className="max-w-xl p-4 bg-slate-950/80 border border-purple-500/25 rounded-2xl rounded-bl-none shadow-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Behavioral Rep Prompt</span>
                  </div>
                  <p className="text-xs leading-relaxed font-semibold text-white">{currentQuestion}</p>
                </div>
              </div>

              {dialogLogs.slice(0, -1).map((log, idx) => (
                <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-xl text-xs leading-normal font-semibold ${
                    log.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-900/60 text-slate-300 rounded-bl-none'
                  }`}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5 bg-slate-950/20">
              {renderResponsePanel()}
            </div>
          </div>

          {/* Right panel: Video & STAR tracking details */}
          <div className="w-[280px] flex flex-col gap-3 flex-shrink-0">
            {renderWebcamBox()}

            <div className="bg-slate-900/30 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col gap-4">
              <div className="space-y-3 font-semibold">
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Adaptability Rating</span>
                    <span className="font-mono text-slate-200">90%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '90%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-1">
                    <span className="text-slate-500">Team Leadership</span>
                    <span className="font-mono text-slate-200">85%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end">
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 text-[9px] leading-relaxed text-slate-400">
                  {realtimeTips}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── REAL-TIME CONVERSATION LOG PANEL (all archetypes) ─── */}
      <AnimatePresence>
        {conversationLogOpen && (
          <motion.div
            key="conv-log"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className="absolute right-0 top-0 bottom-0 w-80 z-40 bg-slate-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-widest">Conversation Log</span>
              </div>
              <button
                onClick={() => setConversationLogOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stage Progress */}
            <div className="px-4 py-2 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {['greeting', 'warmup', 'core', 'deepdive', 'closing'].map((stage, idx) => {
                  const stageOrder = ['greeting', 'warmup', 'core', 'deepdive', 'closing'];
                  const currentIdx = stageOrder.indexOf(interviewStage);
                  const isPast = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <div key={stage} className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                        isPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        isCurrent ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                        'bg-white/5 text-slate-600 border border-white/5'
                      }`}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </span>
                      {idx < 4 && <ChevronRight className="w-2 h-2 text-slate-700" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-scrollbar">
              {conversationHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-indigo-400 opacity-50" />
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Your conversation with Sarah will appear here in real-time as the interview progresses.
                  </p>
                </div>
              ) : (
                conversationHistory.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * Math.min(idx, 5) }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white mr-1.5 flex-shrink-0 mt-0.5">S</div>
                    )}
                    <div className={`max-w-[220px] px-3 py-2 rounded-2xl text-[10px] leading-relaxed font-medium ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                    }`}>
                      {msg.text}
                      {msg.timestamp && (
                        <div className={`text-[8px] mt-1 ${msg.sender === 'user' ? 'text-indigo-300' : 'text-slate-600'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-black text-slate-400 ml-1.5 flex-shrink-0 mt-0.5">U</div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Live status at bottom */}
            <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  interviewerStatus === 'listening' ? 'bg-emerald-400 animate-pulse' :
                  interviewerStatus === 'analyzing' ? 'bg-amber-400 animate-ping' :
                  interviewerStatus === 'speaking'  ? 'bg-indigo-400 animate-pulse' :
                  'bg-violet-400 animate-pulse'
                }`} />
                <span className="text-[10px] text-slate-400 font-medium capitalize">Sarah is {interviewerStatus}...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MockInterviewRoom;
