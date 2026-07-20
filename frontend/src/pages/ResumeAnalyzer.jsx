import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCloudUploadAlt, FaFilePdf, FaCheckCircle,
  FaExclamationTriangle, FaLightbulb, FaArrowRight,
  FaChartBar, FaBuilding, FaBriefcase, FaLinkedin, FaGithub, FaGlobe
} from 'react-icons/fa';
import { Upload, Sparkles, Brain, FileText, CheckCircle2, AlertTriangle, Target, ArrowRight, Zap, RefreshCw, ChevronDown, User, Mail, Phone, GraduationCap, Award, FolderGit2, Calendar, Percent } from 'lucide-react';
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
  const [file, setFile]                 = useState(null);
  const [targetRole, setTargetRole]     = useState('');
  const [targetCompany, setTargetCompany] = useState('General ATS');
  const [isDragging, setIsDragging]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [analysis, setAnalysis]         = useState(null);
  const [isRoleOpen, setIsRoleOpen]     = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState('overview');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const roles = [
    'Software Engineer', 'SDE Intern', 'SDE 1', 'Frontend Developer', 'React Developer',
    'Backend Developer', 'Node.js Developer', 'Express.js Developer', 'MERN Stack Developer',
    'MEAN Stack Developer', 'Full Stack Developer', 'Java Developer', 'Python Developer',
    'C++ Developer', 'JavaScript Developer', 'TypeScript Developer', 'PHP Developer',
    'Android Developer', 'Cloud Engineer', 'DevOps Engineer', 'QA Engineer',
    'Automation Tester', 'AI Engineer', 'Machine Learning Engineer', 'Data Engineer',
    'Data Analyst', 'Business Analyst', 'Cyber Security Engineer', 'Database Developer',
    'API Developer', 'System Engineer', 'Support Engineer', 'Graduate Engineer Trainee',
    'Software Developer', 'Web Developer', 'Technical Consultant', 'Product Engineer',
    'Platform Engineer', 'Site Reliability Engineer'
  ];

  const companies = [
    'General ATS', 'Amazon', 'Microsoft', 'Google', 'NVIDIA', 'TCS', 'Infosys',
    'Accenture', 'Capgemini', 'Cognizant', 'Wipro', 'Deloitte', 'JPMorgan Chase'
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
    formData.append('targetCompany', targetCompany);
    try {
      const res = await api.post('/resume/upload', formData);
      setAnalysis(res.data);
      // Reset active tab to overview
      setActiveReportTab('overview');
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to analyze resume. Error details: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const reanalyze = async (text, role, company) => {
    setLoading(true);
    try {
      const res = await api.post('/resume/reanalyze', {
        resumeText: text,
        targetRole: role,
        targetCompany: company
      });
      setAnalysis(res.data);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to update analysis for the new role/company. Error details: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    setTargetRole(newRole);
    if (analysis && analysis.resumeText) {
      await reanalyze(analysis.resumeText, newRole, targetCompany);
    }
  };

  const handleCompanyChange = async (newCompany) => {
    setTargetCompany(newCompany);
    if (analysis && analysis.resumeText) {
      await reanalyze(analysis.resumeText, targetRole, newCompany);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden">
        <Blob cx={10} cy={20}  color="rgba(6,182,212,0.55)"  r={480} delay={0} />
        <Blob cx={88} cy={12}  color="rgba(99,102,241,0.45)" r={370} delay={3} />
        <Blob cx={55} cy={82}  color="rgba(16,185,129,0.35)" r={340} delay={6} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.8) 1px,transparent 1px)', backgroundSize: '72px 72px' }} />
        <div className="absolute inset-0 vignette-overlay pointer-events-none" />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main ── */}
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden print:pl-0 print:h-auto print:overflow-visible">
        <Navbar subtitle="AI Resume Scanning & Feedback" />
        
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent print:hidden" />

        <main className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 pb-16 pt-6 print:p-0 print:overflow-visible">
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

                  {/* Selector Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-6 text-left" onClick={e => e.stopPropagation()}>
                    {/* Role selector */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target Job Role</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsRoleOpen(!isRoleOpen); setIsCompanyOpen(false); }}
                          className="w-full flex items-center justify-between rounded-xl border border-border bg-secondary text-foreground py-2.5 px-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-left"
                        >
                          <span className={targetRole ? "text-foreground font-medium truncate" : "text-muted-foreground truncate"}>
                            {targetRole || 'Select a role…'}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isRoleOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isRoleOpen && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsRoleOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute left-0 right-0 bottom-full mb-2 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-slate-950/95 backdrop-blur-md shadow-2xl z-50 custom-scrollbar py-1"
                              >
                                {roles.map(r => (
                                  <div
                                    key={r}
                                    onClick={() => { handleRoleChange(r); setIsRoleOpen(false); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                      targetRole === r 
                                        ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                        : 'text-zinc-300 hover:bg-slate-800/50 hover:text-foreground'
                                    }`}
                                  >
                                    {r}
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Company selector */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Target Company</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsRoleOpen(false); }}
                          className="w-full flex items-center justify-between rounded-xl border border-border bg-secondary text-foreground py-2.5 px-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-left"
                        >
                          <span className="text-foreground font-medium truncate">
                            {targetCompany}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isCompanyOpen && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsCompanyOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute left-0 right-0 bottom-full mb-2 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-slate-950/95 backdrop-blur-md shadow-2xl z-50 custom-scrollbar py-1"
                              >
                                {companies.map(c => (
                                  <div
                                    key={c}
                                    onClick={() => { handleCompanyChange(c); setIsCompanyOpen(false); }}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                      targetCompany === c 
                                        ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                        : 'text-zinc-300 hover:bg-slate-800/50 hover:text-foreground'
                                    }`}
                                  >
                                    {c}
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
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
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-5 print:p-0 print:space-y-4 print:text-black print:bg-white print:max-w-full">
                
                {/* Header row (Hidden on Print) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Analysis Complete</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      AI-powered resume audit for <span className="text-foreground font-semibold">{analysis.targetRole || targetRole}</span> at <span className="text-foreground font-semibold">{analysis.targetCompany || targetCompany}</span>
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={() => { setAnalysis(null); setFile(null); }} 
                    className="flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Analyze Another
                  </motion.button>
                </div>

                {/* Dynamic Re-Selector Panel (Hidden on Print) */}
                <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm print:hidden">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Adjust Target settings to live-recalculate ATS score & feedback</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" onClick={e => e.stopPropagation()}>
                    {/* Role Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Target Job Role</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsRoleOpen(!isRoleOpen); setIsCompanyOpen(false); }}
                          className="w-full flex items-center justify-between rounded-xl border border-border bg-slate-900/60 text-foreground py-2 px-3 text-xs focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer text-left"
                        >
                          <span className="truncate">{targetRole || analysis.targetRole || 'Select a role…'}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        </button>
                        <AnimatePresence>
                          {isRoleOpen && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsRoleOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-slate-950/95 backdrop-blur-md shadow-2xl z-50 custom-scrollbar py-1"
                              >
                                {roles.map(r => (
                                  <div
                                    key={r}
                                    onClick={() => { handleRoleChange(r); setIsRoleOpen(false); }}
                                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                                      targetRole === r 
                                        ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                        : 'text-zinc-300 hover:bg-slate-800/50 hover:text-foreground'
                                    }`}
                                  >
                                    {r}
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Company Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Target Company</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { setIsCompanyOpen(!isCompanyOpen); setIsRoleOpen(false); }}
                          className="w-full flex items-center justify-between rounded-xl border border-border bg-slate-900/60 text-foreground py-2 px-3 text-xs focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer text-left"
                        >
                          <span className="truncate">{targetCompany || analysis.targetCompany}</span>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        </button>
                        <AnimatePresence>
                          {isCompanyOpen && (
                            <>
                              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsCompanyOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                className="absolute left-0 right-0 bottom-full mb-1 max-h-60 overflow-y-auto rounded-xl border border-border/80 bg-slate-950/95 backdrop-blur-md shadow-2xl z-50 custom-scrollbar py-1"
                              >
                                {companies.map(c => (
                                  <div
                                    key={c}
                                    onClick={() => { handleCompanyChange(c); setIsCompanyOpen(false); }}
                                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                                      targetCompany === c 
                                        ? 'bg-cyan-500/10 text-cyan-400 font-bold' 
                                        : 'text-zinc-300 hover:bg-slate-800/50 hover:text-foreground'
                                    }`}
                                  >
                                    {c}
                                  </div>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation (Hidden on Print) */}
                <div className="flex border-b border-border gap-2 overflow-x-auto no-scrollbar py-1.5 print:hidden">
                  {[
                    { id: 'overview', label: 'ATS Overview' },
                    { id: 'parser', label: 'Parsed Resume' },
                    { id: 'projects', label: 'Project & Experience Audit' },
                    { id: 'practice', label: 'Practice with AI' },
                    { id: 'export', label: 'Export & Roadmap' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                        activeReportTab === tab.id
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT */}
                
                {/* 1. OVERVIEW TAB */}
                {activeReportTab === 'overview' && (
                  <div className="space-y-5 print:hidden">
                    {/* Top row: Score + Skill match */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:grid-cols-3">
                      {/* ATS Score */}
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-6 flex flex-col items-center text-center backdrop-blur-sm print:border-slate-300 print:p-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent print:hidden" />
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 print:text-black">ATS Score</p>
                        <ScoreRing score={analysis.score} />
                        <p className={`mt-3 text-sm font-semibold ${analysis.score >= 70 ? 'text-emerald-400' : analysis.score >= 40 ? 'text-amber-400' : 'text-red-400'} print:text-black`}>
                          {analysis.score >= 70 ? '🟢 Excellent Match' : analysis.score >= 40 ? '🟡 Average Match' : '🔴 Weak Match'}
                        </p>
                      </motion.div>

                      {/* Skill Match */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-border bg-secondary p-6 backdrop-blur-sm flex flex-col justify-between print:border-slate-300 print:p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FaChartBar className="text-indigo-400 text-sm print:text-black" />
                            <h3 className="font-bold text-foreground text-sm print:text-black">Skill Match</h3>
                          </div>
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl font-black text-foreground print:text-black">{analysis.skillMatchPercentage}%</span>
                            <span className="text-xs text-muted-foreground mb-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-semibold print:text-black">
                              {analysis.skillMatchLevel || 'Average'}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2 print:bg-slate-200">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.skillMatchPercentage}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal print:text-black">Skills compatibility matches against required expectations for {analysis.targetRole || targetRole} at {analysis.targetCompany || targetCompany}.</p>
                        </div>
                      </motion.div>

                      {/* Start Interview CTA (Hidden on Print) */}
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-6 flex flex-col justify-between backdrop-blur-sm print:hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
                        <div className="relative z-10">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 shadow-lg shadow-indigo-500/30">
                            <Sparkles className="h-5 w-5 text-foreground" />
                          </div>
                          <h3 className="font-bold text-foreground text-sm mb-1">Practice with AI</h3>
                          <p className="text-muted-foreground text-xs leading-relaxed">Take a mock interview with questions generated dynamically from your actual skills and projects.</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => navigate('/interview/setup', { state: { resumeSkills: analysis.skillsFound, resumeText: analysis.resumeText } })}
                          className="relative z-10 mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-bold text-foreground shadow-lg cursor-pointer"
                        >
                          Generate Interview <FaArrowRight className="text-xs" />
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Company Compatibility */}
                    {analysis.companyCompatibility?.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm print:border-slate-300">
                        <div className="flex items-center gap-2 mb-4">
                          <FaBuilding className="text-indigo-400 text-sm print:text-black" />
                          <h3 className="font-bold text-foreground text-sm print:text-black">Enterprise Company Compatibility</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
                          {analysis.companyCompatibility.map((comp, idx) => {
                            const isTarget = comp.company.toLowerCase() === (analysis.targetCompany || targetCompany).toLowerCase();
                            return (
                              <div key={idx} className={`rounded-xl border p-3 transition-all ${isTarget ? 'border-cyan-500/50 bg-cyan-500/5 shadow-md shadow-cyan-500/5' : 'border-border bg-secondary'} print:border-slate-300`}>
                                <p className="text-foreground font-semibold text-xs mb-1.5 flex items-center justify-between print:text-black">
                                  {comp.company}
                                  {isTarget && <span className="text-[9px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1 py-0.5 rounded uppercase font-black">Target</span>}
                                </p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden print:bg-slate-200">
                                    <div style={{ width: `${comp.matchPercent}%` }} className={`h-full rounded-full ${comp.matchPercent >= 70 ? 'bg-emerald-500' : comp.matchPercent >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                  </div>
                                  <span className="text-[11px] text-muted-foreground font-medium print:text-black">{comp.matchPercent}%</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Keywords Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 print:grid-cols-3">
                      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5 print:border-slate-300">
                        <div className="flex items-center gap-2 mb-3">
                          <FaCheckCircle className="text-emerald-400 text-sm print:text-black" />
                          <h4 className="font-semibold text-foreground text-sm print:text-black font-bold">Matched Keywords</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.matchedKeywords?.length > 0 ? analysis.matchedKeywords.map((k, i) => <KwTag key={i} text={k} variant="good" delay={i * 0.02} />) : <span className="text-muted-foreground text-sm print:text-black">No matched keywords</span>}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5 print:border-slate-300">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="text-red-400 h-4 w-4 print:text-black" />
                          <h4 className="font-semibold text-foreground text-sm print:text-black font-bold">Missing Keywords</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.missingSkills?.length > 0 ? analysis.missingSkills.map((k, i) => <KwTag key={i} text={k} variant="bad" delay={i * 0.02} />) : <span className="text-muted-foreground text-sm print:text-black">None missing 🎉</span>}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-5 print:border-slate-300">
                        <div className="flex items-center gap-2 mb-3">
                          <FaLightbulb className="text-indigo-400 text-sm print:text-black" />
                          <h4 className="font-semibold text-foreground text-sm print:text-black font-bold">Priority Keywords</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.priorityKeywords?.length > 0 ? analysis.priorityKeywords.map((k, i) => <KwTag key={i} text={k} variant="neutral" delay={i * 0.02} />) : <span className="text-muted-foreground text-sm print:text-black">N/A</span>}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 print:grid-cols-2">
                      <div className="space-y-4">
                        <InfoCard title="Strengths" icon={CheckCircle2} color="text-emerald-400" items={analysis.strengths} />
                        <InfoCard title="Weaknesses" icon={AlertTriangle} color="text-amber-400" items={analysis.weaknesses} />
                        <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm print:border-slate-300">
                          <h4 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-border print:text-black">Section Analysis</h4>
                          <div className="space-y-2.5 text-xs">
                            {[
                              { label: 'Structure',   val: analysis.resumeStructure },
                              { label: 'Projects',    val: analysis.projectQuality },
                              { label: 'Experience',  val: analysis.experienceAnalysis },
                              { label: 'Education',   val: analysis.educationAnalysis },
                            ].map(({ label, val }) => val && (
                              <div key={label} className="print:text-black">
                                <span className="text-indigo-400 font-semibold print:text-black">{label}: </span>
                                <span className="text-muted-foreground print:text-black">{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm print:border-slate-300">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                            <FaLightbulb className="text-amber-400 text-sm print:text-black" />
                            <h4 className="font-semibold text-foreground text-sm print:text-black">Actionable Recommendations</h4>
                          </div>
                          <div className="space-y-2.5">
                            {analysis.recommendations?.map((rec, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 print:border-slate-300">
                                <span className="text-amber-400 font-bold text-xs flex-shrink-0 mt-0.5 print:text-black">{i + 1}.</span>
                                <p className="text-muted-foreground text-xs leading-relaxed print:text-black">{rec}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm print:border-slate-300">
                          <h4 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-border print:text-black font-bold">Formatting & Parsing Audit</h4>
                          <ul className="space-y-1.5">
                            {analysis.formattingIssues?.map((f, i) => <li key={i} className="text-muted-foreground text-xs flex items-start gap-2 print:text-black"><span className="h-1.5 w-1.5 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0 print:bg-black" />{f}</li>)}
                          </ul>
                          {analysis.keywordDensity && (
                            <div className="mt-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] p-3 print:border-slate-300">
                              <strong className="text-indigo-400 text-xs block mb-1 print:text-black">Keyword Density:</strong>
                              <span className="text-muted-foreground text-xs print:text-black">{analysis.keywordDensity}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PARSED RESUME TAB */}
                {activeReportTab === 'parser' && (
                  <div className="space-y-5 print:hidden">
                    {/* Summary */}
                    {analysis.resumeSummary && (
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-foreground mb-2">Resume Professional Summary</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{analysis.resumeSummary}</p>
                      </div>
                    )}

                    {/* Personal Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm md:col-span-1">
                        <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><User className="h-4 w-4 text-cyan-400" /> Personal Details</h3>
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate" title={analysis.personalInfo?.name || 'Not found'}><strong className="text-foreground font-semibold">Name:</strong> {analysis.personalInfo?.name || 'Not found'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate" title={analysis.personalInfo?.email || 'Not found'}><strong className="text-foreground font-semibold">Email:</strong> {analysis.personalInfo?.email || 'Not found'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate" title={analysis.personalInfo?.phone || 'Not found'}><strong className="text-foreground font-semibold">Phone:</strong> {analysis.personalInfo?.phone || 'Not found'}</span>
                          </div>
                           <div className="flex items-center gap-2.5">
                            <FaLinkedin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate"><strong className="text-foreground font-semibold">LinkedIn:</strong> {analysis.personalInfo?.linkedin ? <a href={analysis.personalInfo.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{analysis.personalInfo.linkedin}</a> : 'Not found'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <FaGithub className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate"><strong className="text-foreground font-semibold">GitHub:</strong> {analysis.personalInfo?.github ? <a href={analysis.personalInfo.github} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{analysis.personalInfo.github}</a> : 'Not found'}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <FaGlobe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate"><strong className="text-foreground font-semibold">Portfolio:</strong> {analysis.personalInfo?.portfolio ? <a href={analysis.personalInfo.portfolio} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">{analysis.personalInfo.portfolio}</a> : 'Not found'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Extracted Skills Taxonomy */}
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm md:col-span-2">
                        <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><Target className="h-4 w-4 text-cyan-400" /> Extracted Skill Taxonomy</h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {analysis.skills && Object.keys(analysis.skills).map((cat) => {
                            const val = analysis.skills[cat];
                            if (!Array.isArray(val) || val.length === 0) return null;
                            const title = cat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            return (
                              <div key={cat} className="space-y-1.5">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{title}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {val.map((s, idx) => <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">{s}</span>)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Data: Experience & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Experience */}
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                        <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><FaBriefcase className="h-4 w-4 text-cyan-400" /> Professional Experience</h3>
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                          {analysis.experience?.length > 0 ? analysis.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-cyan-500/30 pl-3.5 space-y-1">
                              <h4 className="text-xs font-bold text-foreground">{exp.role} · <span className="text-cyan-400">{exp.company}</span></h4>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {exp.dates}</p>
                              <ul className="list-disc list-inside text-[11px] text-muted-foreground space-y-0.5 mt-1.5 pl-1">
                                {exp.responsibilities?.map((r, rIdx) => <li key={rIdx} className="leading-relaxed pl-1">{r}</li>)}
                              </ul>
                              {exp.impact && <p className="text-[11px] text-cyan-300/90 italic mt-1.5"><strong className="font-semibold text-cyan-400">Impact:</strong> {exp.impact}</p>}
                            </div>
                          )) : <p className="text-xs text-muted-foreground">No professional experience parsed.</p>}
                        </div>
                      </div>

                      {/* Education & Other lists */}
                      <div className="space-y-4">
                        {/* Education */}
                        <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                          <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><GraduationCap className="h-4 w-4 text-cyan-400" /> Education</h3>
                          <div className="space-y-4">
                            {analysis.education?.length > 0 ? analysis.education.map((edu, idx) => (
                              <div key={idx} className="border-l-2 border-indigo-500/30 pl-3.5 space-y-1">
                                <h4 className="text-xs font-bold text-foreground">{edu.degree}</h4>
                                <p className="text-[11px] text-slate-300 font-semibold">{edu.institution}</p>
                                <div className="flex gap-4 text-[10px] text-muted-foreground mt-0.5">
                                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {edu.dates}</span>
                                  {edu.cgpa && <span className="flex items-center gap-1"><Percent className="h-3 w-3" /> CGPA: {edu.cgpa}</span>}
                                </div>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">No education history parsed.</p>}
                          </div>
                        </div>

                        {/* Certificates & Achievements */}
                        <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                          <h3 className="text-sm font-bold text-foreground mb-3 pb-1.5 border-b border-border flex items-center gap-2"><Award className="h-4 w-4 text-cyan-400" /> Certifications & Achievements</h3>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Certifications</h4>
                              <ul className="space-y-1 text-[11px] text-muted-foreground">
                                {analysis.certificates?.length > 0 ? analysis.certificates.map((c, i) => <li key={i} className="truncate">• {c}</li>) : <li>None parsed</li>}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Achievements</h4>
                              <ul className="space-y-1 text-[11px] text-muted-foreground">
                                {analysis.achievements?.length > 0 ? analysis.achievements.map((a, i) => <li key={i} className="truncate">• {a}</li>) : <li>None parsed</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROJECT & WORK AUDIT TAB */}
                {activeReportTab === 'projects' && (
                  <div className="space-y-5 print:hidden">
                    {/* Projects Section */}
                    <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><FolderGit2 className="h-4 w-4 text-cyan-400" /> Deep Project Analysis</h3>
                      <div className="space-y-5 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                        {analysis.projects?.length > 0 ? analysis.projects.map((proj, idx) => (
                          <div key={idx} className="rounded-xl border border-border bg-slate-900/50 p-4 space-y-2">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground uppercase">{proj.title}</h4>
                                <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{proj.description}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${proj.complexity === 'High' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : proj.complexity === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>{proj.complexity} Complexity</span>
                                <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold">Coding Level: {proj.codingLevel || '7'}/10</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] pt-1">
                              <div>
                                <strong className="text-cyan-400 block mb-0.5">Role Relevance</strong>
                                <span className="text-muted-foreground">{proj.roleRelevance}</span>
                              </div>
                              <div>
                                <strong className="text-cyan-400 block mb-0.5">Business / Utility Value</strong>
                                <span className="text-muted-foreground">{proj.businessValue}</span>
                              </div>
                              <div>
                                <strong className="text-cyan-400 block mb-0.5">ATS Strength / Impact</strong>
                                <span className="text-muted-foreground">{proj.resumeImpact}</span>
                              </div>
                            </div>

                            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-border/40 mt-1">
                              <strong className="text-[10px] uppercase tracking-wider text-amber-400 block mb-1">Suggestions to improve ATS Score:</strong>
                              <ul className="list-disc list-inside text-[10px] text-muted-foreground space-y-0.5">
                                {proj.suggestions?.map((s, sIdx) => <li key={sIdx}>{s}</li>)}
                              </ul>
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {proj.techStack?.map((t, i) => <span key={i} className="bg-slate-950 border border-border/30 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{t}</span>)}
                            </div>
                          </div>
                        )) : <p className="text-xs text-muted-foreground">No projects found to audit.</p>}
                      </div>
                    </div>

                    {/* Internship Section */}
                    <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <h3 className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2"><FaBriefcase className="h-4 w-4 text-cyan-400" /> Internship Work Experience Audit</h3>
                      <div className="space-y-4">
                        {analysis.internships?.length > 0 ? analysis.internships.map((intern, idx) => (
                          <div key={idx} className="rounded-xl border border-border bg-slate-900/50 p-4 space-y-3">
                            <div className="flex justify-between flex-wrap gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-foreground">{intern.role}</h4>
                                <span className="text-[11px] text-cyan-400 font-semibold">{intern.company} · {intern.dates}</span>
                              </div>
                              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase">ATS Strength: {intern.atsStrength || 'Good'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-2">
                                <div>
                                  <strong className="text-cyan-400 block mb-0.5 text-[11px]">Action Verbs Used</strong>
                                  <div className="flex flex-wrap gap-1">
                                    {intern.actionVerbs?.map((v, i) => <span key={i} className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[10px] font-semibold">{v}</span>) || 'No strong action verbs identified'}
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-cyan-400 block mb-0.5 text-[11px]">Business Impact</strong>
                                  <span className="text-muted-foreground">{intern.businessImpact || 'Metrics missing. Add clear key-performance-indicators.'}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <strong className="text-cyan-400 block mb-0.5 text-[11px]">Leadership & Initiative</strong>
                                  <span className="text-muted-foreground">{intern.leadership || 'Collaborated with team to deliver software features.'}</span>
                                </div>
                                <div>
                                  <strong className="text-cyan-400 block mb-0.5 text-[11px]">Technologies Used</strong>
                                  <div className="flex flex-wrap gap-1">
                                    {intern.technologies?.map((t, i) => <span key={i} className="bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{t}</span>) || 'None listed'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : <p className="text-xs text-muted-foreground">No internship listings found to audit.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PRACTICE WITH AI TAB */}
                {activeReportTab === 'practice' && (
                  <div className="space-y-5 print:hidden">
                    <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                        <Brain className="h-5 w-5 text-cyan-400" />
                        <div>
                          <h3 className="font-bold text-foreground text-sm">Resume-Based Mock Interview Questions</h3>
                          <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">Prepare with these highly targeted questions prepared directly from your skills, experience, and target role.</p>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4">
                        {analysis.practiceQuestions?.length > 0 ? analysis.practiceQuestions.map((item, idx) => {
                          const isExpanded = expandedQuestion === idx;
                          return (
                            <div key={idx} className="rounded-xl border border-border bg-slate-900/40 overflow-hidden transition-all">
                              <div 
                                onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                                className="flex justify-between items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                              >
                                <div className="space-y-1">
                                  <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded uppercase font-semibold">Source: {item.source}</span>
                                  <h4 className="text-xs font-bold text-foreground">{item.question}</h4>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>

                              {isExpanded && (
                                <div className="p-4 bg-slate-950/60 border-t border-border/40 text-xs space-y-2">
                                  <div>
                                    <strong className="text-cyan-400 block mb-0.5">Why this question is asked:</strong>
                                    <p className="text-muted-foreground leading-relaxed">{item.context}</p>
                                  </div>
                                  <div className="bg-slate-900/50 p-2.5 rounded-lg border border-border/20 mt-2">
                                    <strong className="text-amber-400 block mb-1">Answer Strategy:</strong>
                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                      Structure your response using the STAR method (Situation, Task, Action, Result). Explicitly outline your design decisions, the technologies you selected, and the quantifiable results you achieved.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }) : <p className="text-xs text-muted-foreground">No custom practice questions generated.</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. EXPORT TAB */}
                {activeReportTab === 'export' && (
                  <div className="space-y-5 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* PDF download */}
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm flex flex-col justify-between h-full">
                        <div>
                          <h4 className="font-bold text-foreground text-sm mb-1">Print ATS PDF Report</h4>
                          <p className="text-muted-foreground text-xs leading-relaxed">Download a professional, printable report containing the complete analysis profile and recommendations.</p>
                        </div>
                        <button 
                          onClick={() => window.print()}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          <FileText className="h-4 w-4" /> Download PDF Report
                        </button>
                      </div>

                      {/* Copy feedback */}
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm flex flex-col justify-between h-full">
                        <div>
                          <h4 className="font-bold text-foreground text-sm mb-1">Resume Feedback Summary</h4>
                          <p className="text-muted-foreground text-xs leading-relaxed">Copy the AI suggestions and actionable resume fixes directly to your clipboard.</p>
                        </div>
                        <button 
                          onClick={() => {
                            const summaryText = `ATS Score: ${analysis.score}\n\nStrengths:\n${analysis.strengths?.map(s => `- ${s}`).join('\n')}\n\nWeaknesses:\n${analysis.weaknesses?.map(w => `- ${w}`).join('\n')}\n\nRecommendations:\n${analysis.recommendations?.map((r, i) => `${i+1}. ${r}`).join('\n')}`;
                            navigator.clipboard.writeText(summaryText);
                            alert('Copied to clipboard!');
                          }}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Copy Summary Text
                        </button>
                      </div>

                      {/* Learning roadmap link */}
                      <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm flex flex-col justify-between h-full">
                        <div>
                          <h4 className="font-bold text-foreground text-sm mb-1">Generate Roadmap</h4>
                          <p className="text-muted-foreground text-xs leading-relaxed">Create a custom learning path with interactive guides targeting your missing technical skills.</p>
                        </div>
                        <button 
                          onClick={() => navigate('/roadmap', { state: { missingSkills: analysis.missingSkills, role: targetRole, company: targetCompany } })}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Create Learning Roadmap
                        </button>
                      </div>
                    </div>

                    {/* Learning Roadmap Detail preview */}
                    <div className="rounded-2xl border border-border bg-secondary p-5 backdrop-blur-sm">
                      <h3 className="text-sm font-bold text-foreground mb-3 pb-2 border-b border-border">Dynamic Skill Upskilling Roadmap</h3>
                      <p className="text-xs text-muted-foreground mb-4">Based on your target company's ({analysis.targetCompany || targetCompany}) tech stacks and required keywords, focus on these self-learning areas:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-border/40">
                          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Priority Skills to Learn</h4>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {analysis.missingSkills?.length > 0 ? analysis.missingSkills.slice(0, 5).map((s, idx) => (
                              <li key={idx}><span className="text-foreground font-semibold">{s}</span></li>
                            )) : <li>No missing skills identified</li>}
                          </ul>
                        </div>
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-border/40">
                          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Recommended Certifications</h4>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {analysis.recommendedSkills?.length > 0 ? analysis.recommendedSkills.map((s, idx) => (
                              <li key={idx}>Study/Certify: <span className="text-foreground font-semibold">{s}</span></li>
                            )) : (
                              <>
                                <li>AWS Cloud Practitioner / Solution Architect (Associate)</li>
                                <li>Docker and Kubernetes Certified Developer</li>
                                <li>Certified Professional Backend Engineer</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRINT-ONLY COMPLETE ATS DOCUMENT CONTAINER */}
                <div className="hidden print:block text-black bg-white p-8 max-w-full space-y-6">
                  <div className="border-b-2 border-black pb-4 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tight">Enterprise ATS Evaluation Report</h1>
                    <p className="text-sm mt-1">Generated by InterviewX AI · Target: {analysis.targetRole || targetRole} at {analysis.targetCompany || targetCompany}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <strong className="block text-xs uppercase tracking-wide text-slate-500">Applicant Details</strong>
                      <p><strong>Name:</strong> {analysis.personalInfo?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {analysis.personalInfo?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {analysis.personalInfo?.phone || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <strong className="block text-xs uppercase tracking-wide text-slate-500">Evaluation Metrics</strong>
                      <p className="text-lg font-black">ATS Score: {analysis.score}/100</p>
                      <p><strong>Skill Match:</strong> {analysis.skillMatchPercentage}% ({analysis.skillMatchLevel})</p>
                    </div>
                  </div>

                  <hr className="border-black" />

                  <div className="space-y-2">
                    <h3 className="text-md font-bold uppercase tracking-wider">Candidate Profile Summary</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{analysis.resumeSummary || 'Profile analysis complete.'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="border border-slate-300 p-4 rounded-xl">
                      <h3 className="text-xs font-bold uppercase mb-2 text-emerald-700">Identified Strengths</h3>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                        {analysis.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="border border-slate-300 p-4 rounded-xl">
                      <h3 className="text-xs font-bold uppercase mb-2 text-red-700">Weak Areas</h3>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                        {analysis.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider">Matched & Missing Keywords</h3>
                    <p className="text-[11px]"><strong>Matched:</strong> {analysis.matchedKeywords?.join(', ') || 'None'}</p>
                    <p className="text-[11px]"><strong>Missing:</strong> {analysis.missingSkills?.join(', ') || 'None'}</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider">Critical ATS Recommendations</h3>
                    <div className="space-y-2 text-xs">
                      {analysis.recommendations?.map((rec, i) => (
                        <p key={i}><strong>{i+1}.</strong> {rec}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider">Formatting & Compatibility Checks</h3>
                    <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                      {analysis.formattingIssues?.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
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
