import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   InterviewerAvatar
   A fully CSS/SVG-animated professional recruiter avatar.
   Props:
     aiSpeaking   {boolean} – mouth open + waveform bars
     isAIThinking {boolean} – eyes look down + amber thinking dots
     interviewerName {string}
───────────────────────────────────────────────────────────────────────────── */
const InterviewerAvatar = ({ aiSpeaking, isAIThinking, interviewerName = 'Sarah' }) => {
  const [eyesClosed, setEyesClosed] = useState(false);

  /* ── Eye blink scheduler ── */
  useEffect(() => {
    let timer;
    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 4000;
      timer = setTimeout(() => {
        setEyesClosed(true);
        setTimeout(() => {
          setEyesClosed(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timer);
  }, []);

  /* ── Status label + color ── */
  const statusLabel = isAIThinking ? 'Analyzing answer…' : aiSpeaking ? 'Speaking' : 'Listening';
  const statusColor  = isAIThinking ? 'text-amber-400'   : aiSpeaking ? 'text-indigo-400' : 'text-emerald-400';
  const dotColor     = isAIThinking ? 'bg-amber-400'     : aiSpeaking ? 'bg-indigo-400'   : 'bg-emerald-400';

  /* ── Eye iris vertical offset when thinking ── */
  const irisOffset = isAIThinking ? 4 : 0;

  return (
    <div className="relative w-full h-full overflow-hidden bg-indigo-50/50 dark:bg-[#0d1325] transition-colors">

      {/* ── Office Background ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/80 to-slate-100 dark:from-[#1a2240] dark:via-[#0f1628] dark:to-[#070b1a]" />

      {/* Ambient window light (top-left corner) */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-400/6 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle monitor glow from below */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-indigo-500/8 blur-3xl rounded-full pointer-events-none" />

      {/* Bookshelf silhouette far bg */}
      <div className="absolute top-0 right-0 w-16 h-full opacity-5 dark:opacity-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute bottom-0 bg-slate-400 dark:bg-slate-500 rounded-sm"
            style={{ left: i * 10 + 4, width: 6, height: 60 + i * 12 }} />
        ))}
      </div>

      {/* ── State border ring ── */}
      <AnimatePresence>
        {aiSpeaking && (
          <motion.div
            key="speaking-ring"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ boxShadow: 'inset 0 0 40px rgba(99,102,241,0.25)' }}
          />
        )}
        {isAIThinking && (
          <motion.div
            key="thinking-ring"
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ boxShadow: 'inset 0 0 40px rgba(251,191,36,0.15)' }}
          />
        )}
      </AnimatePresence>

      {/* ── Avatar Body ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          /* Gentle breathing + state motion */
          animate={
            isAIThinking
              ? { y: [0, -4, 0], rotate: [0, 0.8, 0, -0.8, 0] }
              : aiSpeaking
              ? { y: [0, -2, 0] }
              : { y: [0, -3, 0, -1, 0] }
          }
          transition={{
            duration: isAIThinking ? 1.8 : aiSpeaking ? 0.7 : 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg
            width="220"
            height="310"
            viewBox="0 0 220 310"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ── DESK SURFACE ── */}
            <ellipse cx="110" cy="295" rx="100" ry="16" fill="#111827" />
            <rect x="10" y="288" width="200" height="16" rx="4" fill="#0f172a" />

            {/* ── BODY / BLAZER ── */}
            <ellipse cx="110" cy="272" rx="82" ry="58" fill="#1a2a50" />
            {/* Jacket lapels */}
            <path d="M68 248 L104 226 L110 252 L68 268 Z" fill="#1e3461" />
            <path d="M152 248 L116 226 L110 252 L152 268 Z" fill="#1e3461" />
            {/* Shirt/collar */}
            <path d="M92 240 L110 252 L128 240 L118 224 L110 232 L102 224 Z" fill="#e8eaf6" />
            {/* Tie/button detail */}
            <ellipse cx="110" cy="246" rx="3" ry="4" fill="#6366f1" opacity="0.7" />

            {/* ── NECK ── */}
            <rect x="100" y="218" width="20" height="32" rx="9" fill="#d4935a" />
            {/* Neck shadow */}
            <rect x="100" y="218" width="8" height="32" rx="4" fill="#c07840" opacity="0.3" />

            {/* ── HEAD ── */}
            <ellipse cx="110" cy="172" rx="54" ry="58" fill="#d4935a" />
            {/* Jaw shadow */}
            <ellipse cx="110" cy="208" rx="42" ry="20" fill="#c07840" opacity="0.25" />
            {/* Forehead highlight */}
            <ellipse cx="102" cy="145" rx="22" ry="14" fill="#e0a870" opacity="0.25" />

            {/* ── HAIR ── */}
            {/* Top hair */}
            <ellipse cx="110" cy="128" rx="54" ry="30" fill="#2d1a0e" />
            {/* Parting + volume */}
            <path d="M56 155 C48 135 50 110 62 102 C74 94 88 92 100 96 C105 88 115 88 120 96 C132 92 146 94 158 102 C170 110 172 135 164 155" fill="#2d1a0e" />
            {/* Side hair left */}
            <path d="M56 172 C47 155 46 130 54 115 C56 112 58 118 59 128 C58 145 60 165 64 180" fill="#2d1a0e" />
            {/* Side hair right */}
            <path d="M164 172 C173 155 174 130 166 115 C164 112 162 118 161 128 C162 145 160 165 156 180" fill="#2d1a0e" />

            {/* ── EARS ── */}
            <ellipse cx="58" cy="175" rx="8" ry="10" fill="#c48250" />
            <ellipse cx="58" cy="175" rx="4" ry="6" fill="#b07040" />
            <ellipse cx="162" cy="175" rx="8" ry="10" fill="#c48250" />
            <ellipse cx="162" cy="175" rx="4" ry="6" fill="#b07040" />
            {/* Earrings */}
            <circle cx="55" cy="183" r="3.5" fill="#d4af37" opacity="0.85" />
            <circle cx="165" cy="183" r="3.5" fill="#d4af37" opacity="0.85" />

            {/* ── EYEBROWS ── */}
            <path d="M76 154 Q88 149 101 152" stroke="#2d1a0e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M119 152 Q132 149 144 154" stroke="#2d1a0e" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* Raised brows when thinking */}
            {isAIThinking && (
              <>
                <path d="M76 150 Q88 144 101 148" stroke="#2d1a0e" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.7" />
                <path d="M119 148 Q132 144 144 150" stroke="#2d1a0e" strokeWidth="2.8" strokeLinecap="round" fill="none" opacity="0.7" />
              </>
            )}

            {/* ── EYES ── */}
            {/* Left eye */}
            <g style={{
              transformOrigin: '88px 170px',
              transform: eyesClosed ? 'scaleY(0.08)' : 'scaleY(1)',
              transition: 'transform 0.12s ease',
            }}>
              <ellipse cx="88" cy="170" rx="13" ry="9" fill="white" />
              <g style={{
                transformOrigin: '88px 170px',
                transform: `translateY(${irisOffset}px)`,
                transition: 'transform 0.3s ease',
              }}>
                <circle cx="88" cy="170" r="6" fill="#4a3520" />
                <circle cx="88" cy="170" r="3" fill="#150e05" />
                <circle cx="90" cy="167" r="1.8" fill="white" opacity="0.9" />
              </g>
              {/* Eyelid crease */}
              <path d="M75 164 Q88 161 101 164" stroke="#c48250" strokeWidth="0.8" fill="none" opacity="0.4" />
            </g>

            {/* Right eye */}
            <g style={{
              transformOrigin: '132px 170px',
              transform: eyesClosed ? 'scaleY(0.08)' : 'scaleY(1)',
              transition: 'transform 0.12s ease',
            }}>
              <ellipse cx="132" cy="170" rx="13" ry="9" fill="white" />
              <g style={{
                transformOrigin: '132px 170px',
                transform: `translateY(${irisOffset}px)`,
                transition: 'transform 0.3s ease',
              }}>
                <circle cx="132" cy="170" r="6" fill="#4a3520" />
                <circle cx="132" cy="170" r="3" fill="#150e05" />
                <circle cx="134" cy="167" r="1.8" fill="white" opacity="0.9" />
              </g>
              <path d="M119 164 Q132 161 145 164" stroke="#c48250" strokeWidth="0.8" fill="none" opacity="0.4" />
            </g>

            {/* ── NOSE ── */}
            <ellipse cx="110" cy="188" rx="5" ry="7" fill="#b87540" opacity="0.35" />
            <path d="M104 194 Q110 198 116 194" stroke="#b07040" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* ── MOUTH ── */}
            {aiSpeaking ? (
              /* Speaking - mouth open */
              <g>
                <ellipse cx="110" cy="204" rx="13" ry="6" fill="#8b3a1a" />
                <path d="M97 204 Q110 198 123 204" fill="#c8835a" />
                <ellipse cx="110" cy="203" rx="9" ry="3" fill="#5c1a08" opacity="0.8" />
                {/* Smile lines */}
                <path d="M94 200 Q91 205 93 209" stroke="#c48250" strokeWidth="1" fill="none" opacity="0.4" />
                <path d="M126 200 Q129 205 127 209" stroke="#c48250" strokeWidth="1" fill="none" opacity="0.4" />
              </g>
            ) : (
              /* Neutral professional smile */
              <g>
                <path d="M97 202 Q110 212 123 202" stroke="#a0522d" strokeWidth="2" strokeLinecap="round" fill="none" />
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
          {aiSpeaking && (
            <motion.div
              key="lipsync"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex items-end gap-0.5 h-7 -mt-1"
            >
              {[1,2,3,4,5,6,7,8].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['3px', `${5 + (i % 3) * 9}px`, '3px'] }}
                  transition={{ repeat: Infinity, duration: 0.35 + i * 0.04, delay: i * 0.04, ease: 'easeInOut' }}
                  className="w-1 rounded-full bg-gradient-to-t from-indigo-500 via-violet-400 to-purple-300"
                  style={{ minHeight: 3 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Thinking dots ── */}
        <AnimatePresence>
          {isAIThinking && !aiSpeaking && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
                  className="w-1.5 h-1.5 rounded-full bg-amber-400"
                />
              ))}
              <span className="text-amber-400 text-[10px] font-medium ml-1">Thinking</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Listening pulse rings ── */}
        <AnimatePresence>
          {!aiSpeaking && !isAIThinking && (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center mt-1 w-6 h-6"
            >
              <motion.div
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute w-3 h-3 rounded-full border border-emerald-500/50"
              />
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
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
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">Senior HR Interviewer</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-full shadow-sm dark:shadow-none">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColor}`} />
            <span className={`text-[11px] font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerAvatar;
