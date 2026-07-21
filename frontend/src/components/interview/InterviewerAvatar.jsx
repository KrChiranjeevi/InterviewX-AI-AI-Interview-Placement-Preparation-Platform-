import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   InterviewerAvatar — Premium Human Conversation Engine
   
   Props:
     aiSpeaking        {boolean} – speaking state
     isAIThinking      {boolean} – analyzing state
     interviewerName   {string}  – name shown in badge
     interviewerStatus {string}  – 'listening'|'analyzing'|'typing'|'preparing'|'speaking'|'evaluating'
     onExcellentAnswer {boolean} – triggers subtle smile for 2s
───────────────────────────────────────────────────────────────────────────── */
const InterviewerAvatar = ({
  aiSpeaking,
  isAIThinking,
  interviewerName = 'Sarah',
  interviewerStatus = 'listening',
  onExcellentAnswer = false,
}) => {
  const [eyesClosed, setEyesClosed]     = useState(false);
  const [headTilt,   setHeadTilt]       = useState(0);       // deg rotate
  const [irisOffsetX, setIrisOffsetX]   = useState(0);       // px left/right
  const [irisOffsetY, setIrisOffsetY]   = useState(0);       // px up/down
  const [smileIntensity, setSmileIntensity] = useState(0);   // 0–1
  const [nodding, setNodding]           = useState(false);
  const nodTimerRef = useRef(null);

  /* ── Eye blink scheduler ── */
  useEffect(() => {
    let timer;
    const scheduleBlink = () => {
      const delay = 2800 + Math.random() * 3500;
      timer = setTimeout(() => {
        setEyesClosed(true);
        setTimeout(() => {
          setEyesClosed(false);
          scheduleBlink();
        }, 130);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  /* ── State-driven head + iris behavior ── */
  useEffect(() => {
    if (interviewerStatus === 'analyzing' || isAIThinking) {
      setHeadTilt(-3);
      setIrisOffsetX(-3);
      setIrisOffsetY(3);
    } else if (interviewerStatus === 'typing') {
      setHeadTilt(-2);
      setIrisOffsetX(0);
      setIrisOffsetY(4);
    } else if (interviewerStatus === 'preparing') {
      setHeadTilt(1.5);
      setIrisOffsetX(2);
      setIrisOffsetY(2);
    } else if (interviewerStatus === 'speaking' || aiSpeaking) {
      setHeadTilt(0);
      setIrisOffsetX(0);
      setIrisOffsetY(0);
    } else if (interviewerStatus === 'evaluating') {
      setHeadTilt(-4);
      setIrisOffsetX(-2);
      setIrisOffsetY(4);
    } else {
      // listening
      setHeadTilt(0);
      setIrisOffsetX(0);
      setIrisOffsetY(0);
    }
  }, [interviewerStatus, aiSpeaking, isAIThinking]);

  /* ── Nod when user finishes (listening→analyzing transition) ── */
  useEffect(() => {
    if (interviewerStatus === 'analyzing') {
      setNodding(true);
      nodTimerRef.current = setTimeout(() => setNodding(false), 900);
    }
    return () => clearTimeout(nodTimerRef.current);
  }, [interviewerStatus]);

  /* ── Excellent answer smile ── */
  useEffect(() => {
    if (onExcellentAnswer) {
      setSmileIntensity(1);
      setTimeout(() => setSmileIntensity(0), 2200);
    }
  }, [onExcellentAnswer]);

  /* ── Status config ── */
  const statusConfig = {
    listening:  { label: 'Listening...',        dot: 'bg-emerald-400', text: 'text-emerald-400',  ring: 'rgba(52,211,153,0.15)' },
    analyzing:  { label: 'Analyzing...',         dot: 'bg-amber-400',   text: 'text-amber-400',    ring: 'rgba(251,191,36,0.15)' },
    typing:     { label: 'Taking notes...',      dot: 'bg-blue-400',    text: 'text-blue-400',     ring: 'rgba(96,165,250,0.15)' },
    preparing:  { label: 'Preparing follow-up...', dot: 'bg-violet-400', text: 'text-violet-400', ring: 'rgba(167,139,250,0.2)' },
    speaking:   { label: 'Speaking',             dot: 'bg-indigo-400',  text: 'text-indigo-400',   ring: 'rgba(99,102,241,0.2)' },
    evaluating: { label: 'Evaluating...',        dot: 'bg-orange-400',  text: 'text-orange-400',   ring: 'rgba(251,146,60,0.15)' },
  };

  const activeStatus = statusConfig[interviewerStatus] || statusConfig.listening;

  /* ── Body motion per state ── */
  const bodyAnimate = (() => {
    if (nodding) return { y: [0, 5, -2, 0], rotate: [0, 0, 0, 0] };
    if (isAIThinking || interviewerStatus === 'analyzing')
      return { y: [0, -3, 0], rotate: [0, headTilt, 0, headTilt * 0.5, 0] };
    if (aiSpeaking || interviewerStatus === 'speaking')
      return { y: [0, -1.5, 0] };
    if (interviewerStatus === 'typing')
      return { y: [0, -2, 0, -1, 0], rotate: [0, headTilt, 0] };
    return { y: [0, -2, 0, -1, 0] }; // natural breathing
  })();

  const bodyTransition = {
    duration: nodding ? 0.55 : isAIThinking ? 1.8 : aiSpeaking ? 0.65 : 4.2,
    repeat: nodding ? 0 : Infinity,
    ease: 'easeInOut',
  };

  /* ── Mouth shape ── */
  const mouthPath = smileIntensity > 0.5
    ? 'M97 200 Q110 216 123 200'  // wide smile
    : 'M97 202 Q110 212 123 202'; // neutral professional smile

  return (
    <div className="relative w-full h-full overflow-hidden bg-indigo-50/50 dark:bg-[#0d1325] transition-colors">

      {/* ── Office background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/80 to-slate-100 dark:from-[#1a2240] dark:via-[#0f1628] dark:to-[#070b1a]" />

      {/* Ambient window light */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-400/6 rounded-full blur-3xl pointer-events-none" />

      {/* Monitor glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-indigo-500/8 blur-3xl rounded-full pointer-events-none" />

      {/* Bookshelf silhouette */}
      <div className="absolute top-0 right-0 w-16 h-full opacity-5 dark:opacity-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute bottom-0 bg-slate-400 dark:bg-slate-500 rounded-sm"
            style={{ left: i * 10 + 4, width: 6, height: 60 + i * 12 }} />
        ))}
      </div>

      {/* ── Animated state border ring ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={interviewerStatus}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ boxShadow: `inset 0 0 40px ${activeStatus.ring}` }}
        />
      </AnimatePresence>

      {/* ── Avatar Body ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          animate={bodyAnimate}
          transition={bodyTransition}
          style={{ rotate: headTilt, transition: 'rotate 0.4s ease' }}
        >
          <svg
            width="220"
            height="310"
            viewBox="0 0 220 310"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* DESK */}
            <ellipse cx="110" cy="295" rx="100" ry="16" fill="#111827" />
            <rect x="10" y="288" width="200" height="16" rx="4" fill="#0f172a" />

            {/* BODY / BLAZER */}
            <ellipse cx="110" cy="272" rx="82" ry="58" fill="#1a2a50" />
            <path d="M68 248 L104 226 L110 252 L68 268 Z" fill="#1e3461" />
            <path d="M152 248 L116 226 L110 252 L152 268 Z" fill="#1e3461" />
            <path d="M92 240 L110 252 L128 240 L118 224 L110 232 L102 224 Z" fill="#e8eaf6" />
            <ellipse cx="110" cy="246" rx="3" ry="4" fill="#6366f1" opacity="0.7" />

            {/* NECK */}
            <rect x="100" y="218" width="20" height="32" rx="9" fill="#d4935a" />
            <rect x="100" y="218" width="8" height="32" rx="4" fill="#c07840" opacity="0.3" />

            {/* HEAD */}
            <ellipse cx="110" cy="172" rx="54" ry="58" fill="#d4935a" />
            <ellipse cx="110" cy="208" rx="42" ry="20" fill="#c07840" opacity="0.25" />
            <ellipse cx="102" cy="145" rx="22" ry="14" fill="#e0a870" opacity="0.25" />

            {/* HAIR */}
            <ellipse cx="110" cy="128" rx="54" ry="30" fill="#2d1a0e" />
            <path d="M56 155 C48 135 50 110 62 102 C74 94 88 92 100 96 C105 88 115 88 120 96 C132 92 146 94 158 102 C170 110 172 135 164 155" fill="#2d1a0e" />
            <path d="M56 172 C47 155 46 130 54 115 C56 112 58 118 59 128 C58 145 60 165 64 180" fill="#2d1a0e" />
            <path d="M164 172 C173 155 174 130 166 115 C164 112 162 118 161 128 C162 145 160 165 156 180" fill="#2d1a0e" />

            {/* EARS */}
            <ellipse cx="58" cy="175" rx="8" ry="10" fill="#c48250" />
            <ellipse cx="58" cy="175" rx="4" ry="6" fill="#b07040" />
            <ellipse cx="162" cy="175" rx="8" ry="10" fill="#c48250" />
            <ellipse cx="162" cy="175" rx="4" ry="6" fill="#b07040" />
            <circle cx="55" cy="183" r="3.5" fill="#d4af37" opacity="0.85" />
            <circle cx="165" cy="183" r="3.5" fill="#d4af37" opacity="0.85" />

            {/* EYEBROWS — raised when thinking */}
            <path
              d="M76 154 Q88 149 101 152"
              stroke="#2d1a0e"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              style={{
                transform: (isAIThinking || interviewerStatus === 'analyzing') ? 'translateY(-4px)' : 'none',
                transition: 'transform 0.3s ease',
                transformOrigin: '88px 152px'
              }}
            />
            <path
              d="M119 152 Q132 149 144 154"
              stroke="#2d1a0e"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              style={{
                transform: (isAIThinking || interviewerStatus === 'analyzing') ? 'translateY(-4px)' : 'none',
                transition: 'transform 0.3s ease',
                transformOrigin: '132px 152px'
              }}
            />

            {/* LEFT EYE */}
            <g style={{
              transformOrigin: '88px 170px',
              transform: eyesClosed ? 'scaleY(0.07)' : 'scaleY(1)',
              transition: 'transform 0.11s ease',
            }}>
              <ellipse cx="88" cy="170" rx="13" ry="9" fill="white" />
              <g style={{
                transform: `translate(${irisOffsetX}px, ${irisOffsetY}px)`,
                transition: 'transform 0.35s ease',
              }}>
                <circle cx="88" cy="170" r="6" fill="#4a3520" />
                <circle cx="88" cy="170" r="3" fill="#150e05" />
                <circle cx="90" cy="167" r="1.8" fill="white" opacity="0.9" />
              </g>
              <path d="M75 164 Q88 161 101 164" stroke="#c48250" strokeWidth="0.8" fill="none" opacity="0.4" />
            </g>

            {/* RIGHT EYE */}
            <g style={{
              transformOrigin: '132px 170px',
              transform: eyesClosed ? 'scaleY(0.07)' : 'scaleY(1)',
              transition: 'transform 0.11s ease',
            }}>
              <ellipse cx="132" cy="170" rx="13" ry="9" fill="white" />
              <g style={{
                transform: `translate(${irisOffsetX}px, ${irisOffsetY}px)`,
                transition: 'transform 0.35s ease',
              }}>
                <circle cx="132" cy="170" r="6" fill="#4a3520" />
                <circle cx="132" cy="170" r="3" fill="#150e05" />
                <circle cx="134" cy="167" r="1.8" fill="white" opacity="0.9" />
              </g>
              <path d="M119 164 Q132 161 145 164" stroke="#c48250" strokeWidth="0.8" fill="none" opacity="0.4" />
            </g>

            {/* NOSE */}
            <ellipse cx="110" cy="188" rx="5" ry="7" fill="#b87540" opacity="0.35" />
            <path d="M104 194 Q110 198 116 194" stroke="#b07040" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* MOUTH */}
            {aiSpeaking || interviewerStatus === 'speaking' ? (
              <motion.g
                animate={{ scaleY: [1, 1.4, 0.8, 1.3, 1] }}
                transition={{ duration: 0.38, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '110px 204px' }}
              >
                <ellipse cx="110" cy="204" rx="13" ry="6" fill="#8b3a1a" />
                <path d="M97 204 Q110 198 123 204" fill="#c8835a" />
                <ellipse cx="110" cy="203" rx="9" ry="3" fill="#5c1a08" opacity="0.8" />
                <path d="M94 200 Q91 205 93 209" stroke="#c48250" strokeWidth="1" fill="none" opacity="0.4" />
                <path d="M126 200 Q129 205 127 209" stroke="#c48250" strokeWidth="1" fill="none" opacity="0.4" />
              </motion.g>
            ) : (
              <g>
                <path
                  d={mouthPath}
                  stroke="#a0522d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'd 0.4s ease' }}
                />
                <path d="M97 202 Q103 198 110 199 Q117 198 123 202" fill="none" stroke="#c8835a" strokeWidth="1.2" />
              </g>
            )}

            {/* Cheek blush */}
            <ellipse cx="78" cy="193" rx="11" ry="7" fill="#ff6040" opacity="0.09" />
            <ellipse cx="142" cy="193" rx="11" ry="7" fill="#ff6040" opacity="0.09" />
          </svg>
        </motion.div>

        {/* ── Lip sync bars when speaking ── */}
        <AnimatePresence>
          {(aiSpeaking || interviewerStatus === 'speaking') && (
            <motion.div
              key="lipsync"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-end gap-0.5 h-7 -mt-1"
            >
              {[1,2,3,4,5,6,7,8,9].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['3px', `${4 + (i % 4) * 8}px`, '3px'] }}
                  transition={{ repeat: Infinity, duration: 0.32 + i * 0.035, delay: i * 0.03, ease: 'easeInOut' }}
                  className="w-1 rounded-full bg-gradient-to-t from-indigo-500 via-violet-400 to-purple-300"
                  style={{ minHeight: 3 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── State indicators ── */}
        <AnimatePresence mode="wait">
          {/* Thinking / Analyzing dots */}
          {(isAIThinking || interviewerStatus === 'analyzing' || interviewerStatus === 'evaluating') && !aiSpeaking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                />
              ))}
              <span className="text-amber-400 text-[10px] font-medium ml-1">
                {interviewerStatus === 'evaluating' ? 'Evaluating' : 'Analyzing'}
              </span>
            </motion.div>
          )}

          {/* Preparing follow-up */}
          {interviewerStatus === 'preparing' && !aiSpeaking && !isAIThinking && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.95, repeat: Infinity, delay: i * 0.25 }}
                  className="w-1.5 h-1.5 rounded-full bg-violet-400"
                />
              ))}
              <span className="text-violet-400 text-[10px] font-medium ml-1">Preparing follow-up</span>
            </motion.div>
          )}

          {/* Taking notes */}
          {interviewerStatus === 'typing' && !aiSpeaking && !isAIThinking && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-blue-400"
              />
              <span className="text-blue-400 text-[10px] font-medium">Taking notes...</span>
            </motion.div>
          )}

          {/* Listening pulse rings */}
          {interviewerStatus === 'listening' && !aiSpeaking && !isAIThinking && (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center mt-1 w-6 h-6"
            >
              <motion.div
                animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.9, repeat: Infinity }}
                className="absolute w-3 h-3 rounded-full border border-emerald-500/50"
              />
              <motion.div
                animate={{ scale: [1, 1.9], opacity: [0.4, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, delay: 0.45 }}
                className="absolute w-3 h-3 rounded-full border border-emerald-500/30"
              />
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Info Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-white/95 to-white/0 dark:from-[#070b1a]/95 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-900 dark:text-white text-sm font-semibold leading-tight">{interviewerName}</p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Senior Lead Interviewer · AI</p>
          </div>
          <motion.div
            key={interviewerStatus}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-full shadow-sm dark:shadow-none`}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeStatus.dot}`} />
            <span className={`text-[11px] font-medium ${activeStatus.text}`}>{activeStatus.label}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerAvatar;
