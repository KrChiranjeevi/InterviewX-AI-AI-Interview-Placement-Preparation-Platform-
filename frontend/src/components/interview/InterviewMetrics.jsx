import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────────────────
   MetricBar  –  single metric with animated fill bar
───────────────────────────────────────────────────────────────────────────── */
const MetricBar = ({ label, value, maxVal = 100, unit = '%', invert = false }) => {
  /* pct for the progress bar (inverted metrics: lower is better) */
  const raw = Math.min(maxVal, Math.max(0, value));
  const pct = invert ? Math.max(0, 100 - (raw / maxVal) * 100) : (raw / maxVal) * 100;

  const barColor =
    pct >= 80 ? '#10b981' :   /* emerald */
    pct >= 55 ? '#f59e0b' :   /* amber   */
               '#ef4444';     /* red     */

  const textColor =
    pct >= 80 ? 'text-emerald-400' :
    pct >= 55 ? 'text-amber-400' :
               'text-red-400';

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold leading-none">{label}</span>
        <span className={`text-[10px] font-bold leading-none ${textColor}`}>
          {unit === 'wpm' ? `${value}` : `${value}${unit}`}
        </span>
      </div>
      <div className="h-[3px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   InterviewMetrics  –  6-metric floating panel
───────────────────────────────────────────────────────────────────────────── */
const InterviewMetrics = ({ wpm, clarity, eyeContact, fillers, confidence, fluency }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="w-44 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-xl p-2.5 shadow-xl space-y-2 transition-colors"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Live Analytics</span>
      </div>

      <MetricBar label="Speaking Speed" value={wpm} maxVal={200} unit=" wpm" />
      <MetricBar label="Clarity"        value={clarity}    />
      <MetricBar label="Eye Contact"    value={eyeContact} />
      <MetricBar label="Confidence"     value={confidence} />
      <MetricBar label="Fluency"        value={fluency}    />
      <MetricBar label="Filler Words"   value={fillers}    maxVal={15} unit="" invert />
    </motion.div>
  );
};

export default InterviewMetrics;
