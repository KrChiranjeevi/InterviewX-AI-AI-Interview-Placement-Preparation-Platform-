import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCloudUploadAlt, FaFilePdf, FaCheckCircle,
  FaExclamationTriangle, FaLightbulb, FaArrowRight,
  FaChartBar, FaBuilding, FaBriefcase
} from 'react-icons/fa';
import { Upload, Sparkles, Brain, FileText, CheckCircle2, AlertTriangle, Target, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';

// ── Background blob ──────────────────────────────────────────────────────────
const Blob = ({ cx, cy, color, r, delay = 0 }) => (
  <div
    className="pointer-events-none absolute rounded-full animate-blob opacity-60"
    style={{
      left: `${cx}%`, top: `${cy}%`, width: r, height: r,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      animationDelay: `${delay}s`
    }}
  />
);

// ── Animated Circular Score ───────────────────────────────────────────────────
function ScoreRing({ score, size = 160, stroke = 10 }) {
  const r      = (size - stroke * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-4xl font-black text-foreground">{score}</motion.span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

// ── Keyword Tag ───────────────────────────────────────────────────────────────
const KwTag = ({ text, variant = 'neutral', delay = 0 }) => {
  const styles = {
    good:    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    bad:     'bg-red-500/10 border-red-500/20 text-red-400',
    neutral: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {text}
    </motion.span>
  );
};

// ── Info Card ─────────────────────────────────────────────────────────────────
const InfoCard = ({ title, icon: Icon, color, items }) => (
  <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm h-full">
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
      <Icon className={`h-4 w-4 ${color}`} />
      <h4 className="font-semibold text-foreground text-sm">{title}</h4>
    </div>
    <ul className="space-y-2">
      {items?.map((item, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="text-muted-foreground text-xs leading-relaxed flex items-start gap-2">
          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
          {item}
        </motion.li>
      ))}
    </ul>
  </div>
);

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [file, setFile]         = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Java Developer',
    'Python Developer', 'React Developer', 'Node.js Developer', 'Data Scientist',
    'Data Analyst', 'Machine Learning Engineer', 'AI Engineer', 'DevOps Engineer',
    'Cloud Engineer', 'Cyber Security', 'Mobile App Developer', 'UI/UX Designer',
    'Software Engineer', 'SDE Intern', 'Other'
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else if (e.type === 'dragleave') setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type === 'application/pdf') setFile(f);
      else alert('Please upload a PDF file.');
    }
  }, []);

  const handleFileChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };

  const handleUpload = async () => {
    if (!file) return alert('Please upload a resume first.');
    if (!targetRole) return alert('Please select a Target Job Role.');
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    try {
      const res = await api.post('/resume/upload', formData);
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
      alert('Failed to analyze resume. Make sure your OpenAI API key is set in the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Blob cx={10} cy={20}  color="rgba(6,182,212,0.55)"  r={480} delay={0} />
        <Blob cx={88} cy={12}  color="rgba(99,102,241,0.45)" r={370} delay={3} />
        <Blob cx={55} cy={82}  color="rgba(16,185,129,0.35)" r={340} delay={6} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.8) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="AI Resume Scanning & Feedback" />
        
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <main className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 pb-16 pt-6">
          <AnimatePresence mode="wait">

            {/* ── Upload View ── */}
            {!analysis && !loading && (
              <motion.div key="upload" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-2xl mx-auto space-y-5">

                {/* Hero text */}
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-blue-300 text-xs font-semibold mb-4">
                    <Brain className="h-3.5 w-3.5" /> AI-Powered Resume Scanner
                  </motion.div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight">Upload your resume,<br />get instant ATS feedback.</h1>
                  <p className="text-muted-foreground text-sm mt-2">Drag & drop your PDF to scan for keywords, skills, and formatting issues</p>
                </div>

                {/* Drag-drop zone */}
                <motion.div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  animate={{
                    scale: isDragging ? 1.02 : 1,
                  }}
                  className={`relative rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 overflow-hidden cursor-pointer ${
                    isDragging ? 'border-cyan-500/80 bg-cyan-500/10' : 'border-border bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => document.getElementById('resume-upload').click()}
                >
                  {/* Orbit rings when dragging */}
                  {isDragging && (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-20px] rounded-full border border-dashed border-cyan-500/20 pointer-events-none" />
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-10px] rounded-full border border-dashed border-blue-500/15 pointer-events-none" />
                    </>
                  )}

                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="inline-block mb-4">
                    <div className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-cyan-500/20' : 'bg-secondary'}`}>
                      <Upload className={`h-8 w-8 transition-colors ${isDragging ? 'text-cyan-400' : 'text-muted-foreground'}`} />
                    </div>
                  </motion.div>

                  <h3 className="text-lg font-bold text-foreground mb-1">{isDragging ? 'Drop it here!' : 'Drag & Drop your Resume'}</h3>
                  <p className="text-muted-foreground text-sm mb-6">Supported: PDF (Max 5MB) · Click anywhere to browse</p>

                  {/* Role selector */}
                  <div className="max-w-xs mx-auto mb-6 text-left" onClick={e => e.stopPropagation()}>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target Job Role</label>
                    <select
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border border-border bg-secondary text-foreground py-2.5 px-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all appearance-none"
                    >
                      <option value="" className="bg-background">Select a role…</option>
                      {roles.map(r => <option key={r} value={r} className="bg-background">{r}</option>)}
                    </select>
                  </div>

                  <input type="file" id="resume-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  <label htmlFor="resume-upload" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary hover:bg-secondary px-5 py-2.5 text-sm font-medium text-foreground cursor-pointer transition-all">
                    <FileText className="h-4 w-4" /> Browse Files
                  </label>
                </motion.div>

                {/* File selected */}
                {file && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-2xl border border-border bg-secondary p-4 backdrop-blur-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/20 flex-shrink-0">
                      <FaFilePdf className="text-red-400 text-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleUpload}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-foreground shadow-lg flex-shrink-0"
                    >
                      <Zap className="h-4 w-4" /> Analyze Now
                    </motion.button>
                  </motion.div>
                )}

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {['ATS Score', 'Skill Match', 'Keywords', 'Formatting', 'AI Suggestions', 'Company Fit'].map((f, i) => (
                    <motion.span key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground font-medium">
                      ✓ {f}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Loading View ── */}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[70vh]">
                <div className="relative h-32 w-32 mb-8">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-cyan-500" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                  <motion.div className="absolute inset-5 rounded-full border-2 border-transparent border-b-indigo-500" animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">🤖</div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI is analyzing your resume…</h3>
                <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="text-blue-400 text-sm">Extracting skills, evaluating experience, generating feedback…</motion.p>
                <div className="mt-6 flex gap-2">
                  {['Parsing PDF', 'Matching keywords', 'Scoring ATS', 'Generating insights'].map((t, i) => (
                    <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.5 }} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
                      {t}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Results View ── */}
            {analysis && !loading && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-5">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Analysis Complete</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">AI-powered resume audit for <span className="text-foreground font-medium">{analysis.targetRole || targetRole}</span></p>
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setAnalysis(null); setFile(null); }} className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <RefreshCw className="h-3.5 w-3.5" /> Analyze Another
                  </motion.button>
                </div>

                {/* Top row: Score + Skill match */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* ATS Score */}
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-6 flex flex-col items-center text-center backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">ATS Score</p>
                    <ScoreRing score={analysis.score} />
                    <p className={`mt-3 text-sm font-semibold ${analysis.score >= 70 ? 'text-emerald-400' : analysis.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {analysis.score >= 70 ? '🟢 Excellent match' : analysis.score >= 40 ? '🟡 Average match' : '🔴 Poor match'} for <span className="text-foreground">{analysis.targetRole || targetRole}</span>
                    </p>
                  </motion.div>

                  {/* Skill Match */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-6 backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FaChartBar className="text-indigo-400 text-sm" />
                        <h3 className="font-bold text-foreground text-sm">Skill Match</h3>
                      </div>
                      <div className="flex items-end gap-2 mb-3">
                        <span className="text-4xl font-black text-foreground">{analysis.skillMatchPercentage}</span>
                        <span className="text-lg text-muted-foreground mb-1">%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.skillMatchPercentage}%` }} transition={{ duration: 1.2, ease: [0.16,1,0.3,1], delay: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">Skills matched against {analysis.targetRole || targetRole} requirements</p>
                    </div>
                  </motion.div>

                  {/* Start Interview CTA */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-6 flex flex-col justify-between backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 shadow-lg shadow-indigo-500/30">
                        <Sparkles className="h-5 w-5 text-foreground" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-1">Practice with AI</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">Take a resume-tailored mock interview with questions from your actual skills</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/interview/setup', { state: { resumeSkills: analysis.skillsFound, resumeText: analysis.resumeText } })}
                      className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-bold text-foreground shadow-lg"
                    >
                      Generate Interview <FaArrowRight className="text-xs" />
                    </motion.button>
                  </motion.div>
                </div>

                {/* Company Compatibility */}
                {analysis.companyCompatibility?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <FaBuilding className="text-indigo-400 text-sm" />
                      <h3 className="font-bold text-foreground text-sm">Top Company Compatibility</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {analysis.companyCompatibility.map((comp, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + idx * 0.07 }} className="rounded-xl border border-border bg-secondary p-3">
                          <p className="text-foreground font-semibold text-xs mb-2">{comp.company}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${comp.matchPercent}%` }} transition={{ duration: 1, delay: 0.3 + idx * 0.07 }} className={`h-full rounded-full ${comp.matchPercent >= 70 ? 'bg-emerald-500' : comp.matchPercent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-medium">{comp.matchPercent}%</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Keywords row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaCheckCircle className="text-emerald-400 text-sm" />
                      <h4 className="font-semibold text-foreground text-sm">Matched Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchedKeywords?.length > 0 ? analysis.matchedKeywords.map((k, i) => <KwTag key={i} text={k} variant="good" delay={i * 0.04} />) : <span className="text-muted-foreground text-sm">No matched keywords</span>}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="text-red-400 h-4 w-4" />
                      <h4 className="font-semibold text-foreground text-sm">Missing Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills?.length > 0 ? analysis.missingSkills.map((k, i) => <KwTag key={i} text={k} variant="bad" delay={i * 0.04} />) : <span className="text-muted-foreground text-sm">None missing 🎉</span>}
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FaLightbulb className="text-indigo-400 text-sm" />
                      <h4 className="font-semibold text-foreground text-sm">Priority Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.priorityKeywords?.length > 0 ? analysis.priorityKeywords.map((k, i) => <KwTag key={i} text={k} variant="neutral" delay={i * 0.04} />) : <span className="text-muted-foreground text-sm">N/A</span>}
                    </div>
                  </motion.div>
                </div>

                {/* Detailed Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <InfoCard title="Strengths" icon={CheckCircle2} color="text-emerald-400" items={analysis.strengths} />
                    <InfoCard title="Weaknesses" icon={AlertTriangle} color="text-amber-400" items={analysis.weaknesses} />
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <h4 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-border">Section Analysis</h4>
                      <div className="space-y-2.5 text-xs">
                        {[
                          { label: 'Structure',   val: analysis.resumeStructure },
                          { label: 'Projects',    val: analysis.projectQuality },
                          { label: 'Experience',  val: analysis.experienceAnalysis },
                          { label: 'Education',   val: analysis.educationAnalysis },
                        ].map(({ label, val }) => val && (
                          <div key={label}>
                            <span className="text-indigo-400 font-semibold">{label}: </span>
                            <span className="text-muted-foreground">{val}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                        <FaLightbulb className="text-amber-400 text-sm" />
                        <h4 className="font-semibold text-foreground text-sm">Actionable Recommendations</h4>
                      </div>
                      <div className="space-y-2.5">
                        {analysis.recommendations?.map((rec, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }} className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3">
                            <span className="text-amber-400 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}.</span>
                            <p className="text-muted-foreground text-xs leading-relaxed">{rec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <h4 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-border">Formatting & Parsing</h4>
                      <ul className="space-y-1.5">
                        {analysis.formattingIssues?.map((f, i) => <li key={i} className="text-muted-foreground text-xs flex items-start gap-2"><span className="h-1.5 w-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />{f}</li>)}
                      </ul>
                      {analysis.keywordDensity && (
                        <div className="mt-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] p-3">
                          <strong className="text-indigo-400 text-xs block mb-1">Keyword Density:</strong>
                          <span className="text-muted-foreground text-xs">{analysis.keywordDensity}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
