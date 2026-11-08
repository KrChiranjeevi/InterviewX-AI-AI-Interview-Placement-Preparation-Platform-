import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLaptopCode, FaUserTie, FaCode, FaFileAlt, FaCheck, FaVideo, FaMicrophone,
  FaArrowRight, FaClock, FaBriefcase, FaGlobe, FaVolumeUp, FaTasks, FaUpload, FaDatabase, FaFolderOpen
} from 'react-icons/fa';
import {
  Sparkles, Brain, Shield, CheckCircle2, AlertTriangle, Monitor, Wifi, Volume2,
  Users, MessageSquare, Code2, Server, Terminal, Layers, Trash2, FileText, CheckCircle,
  UploadCloud, ChevronDown, RefreshCw, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TECHNICAL_TRACKS = {
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Browser Rendering', 'DOM Manipulation', 'REST APIs', 'Performance Optimization', 'Web Accessibility'],
  'Backend Developer': ['Node.js', 'Express.js', 'Authentication', 'JWT', 'REST APIs', 'Databases', 'Caching (Redis)', 'API Security', 'Microservices'],
  'Full Stack Developer': ['React', 'Node.js', 'REST APIs', 'Database Architecture', 'System Integration', 'State Management', 'Security Best Practices'],
  'Java Developer': ['OOP Concepts', 'Collections Framework', 'JVM Internals', 'Java Streams API', 'Exception Handling', 'Multithreading & Concurrency', 'Spring Boot Basics'],
  'Python Developer': ['Core Python Syntax', 'OOP in Python', 'Memory Management', 'Decorators & Generators', 'Asyncio & Concurrency', 'Django / FastAPI'],
  'JavaScript Developer': ['Closures & Scope', 'Promises & Async/Await', 'Event Loop & Concurrency', 'ES6+ Features', 'Prototypes & Inheritance'],
  'React Developer': ['Component Lifecycle', 'React Hooks', 'State Management (Redux/Zustand)', 'Virtual DOM & Reconciliation', 'Custom Hooks & Performance'],
  'Node.js Developer': ['Node.js Event Loop', 'Node Streams & Buffers', 'Clusters & Worker Threads', 'Express Middleware Pipeline', 'Event Emitters'],
  'AI Engineer': ['Machine Learning Fundamentals', 'Deep Learning Architectures', 'Neural Networks', 'Natural Language Processing', 'Transformers', 'LLM Fine-tuning & RAG'],
  'Machine Learning Engineer': ['Supervised & Unsupervised Learning', 'Model Evaluation & Validation', 'Feature Engineering', 'Scikit-Learn / PyTorch', 'Model Deployment'],
  'Cloud Engineer': ['AWS Services', 'Docker Containerization', 'Kubernetes Orchestration', 'CI/CD Pipelines', 'Infrastructure as Code (Terraform)', 'Cloud Security'],
  'DevOps Engineer': ['Docker & Kubernetes', 'CI/CD Pipelines (GitHub Actions/Jenkins)', 'Infrastructure as Code', 'Linux Administration', 'System Monitoring & Logging'],
  'QA Engineer': ['Unit Testing Frameworks', 'Integration Testing', 'Selenium / Cypress Automation', 'Test-Driven Development (TDD)', 'API Testing (Postman)'],
  'Data Analyst': ['SQL Complex Queries', 'Data Analysis with Pandas/NumPy', 'Data Visualization', 'Statistical Analysis', 'ETL Pipelines'],
  'Software Engineer (Mixed)': ['Core CS Fundamentals', 'OOP Principles', 'DBMS & SQL', 'Operating Systems', 'Computer Networks']
};

const CODING_TRACKS = [
  'DSA', 'SQL', 'Java', 'Python', 'JavaScript', 'C++', 'C', 'React', 'Node.js', 'MongoDB', 'Express.js', 'API Development'
];

const SYSTEM_DESIGN_DOMAINS = [
  'Backend Systems', 'Distributed Systems', 'Cloud Architectures', 'Databases & Sharding',
  'Caching & CDNs', 'Microservices Architecture', 'API Design & Gateways', 'System Security & Auth'
];

const BEHAVIORAL_COMPETENCIES = [
  'Teamwork & Collaboration',
  'Conflict Resolution',
  'Leadership & Influence',
  'Ownership & Accountability',
  'Adaptability & Resilience',
  'Problem Solving & Critical Thinking',
  'Communication & Empathy',
  'Time Management & Prioritization'
];

const EXTEMPORE_CATEGORIES = [
  'Artificial Intelligence', 'Climate Change', 'Future of Work', 'Remote Jobs',
  'Coding Culture', 'Digital India', 'Women Leadership', 'Online Education',
  'Blockchain', 'Electric Vehicles', 'Cyber Security', 'Social Media',
  'Startup Ecosystem', 'Entrepreneurship', 'Healthcare', 'Sports',
  'Ethics', 'Corporate Culture', 'Random'
];

const GD_CATEGORIES = [
  'General Topic', 'Current Affairs', 'Technology', 'Business',
  'Social Issues', 'Education', 'Artificial Intelligence', 'Startups',
  'Economy', 'Environment', 'Healthcare', 'Leadership',
  'Workplace', 'Corporate Ethics', 'Placement Topics', 'Random'
];

const needsTargetRole = (type) => {
  return ['Technical Interview', 'Coding Interview', 'System Design Interview', 'Project Discussion'].includes(type);
};

const InterviewSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeSkills = location.state?.resumeSkills || [];
  const resumeText = location.state?.resumeText || '';

  // Setup state
  const [interviewType, setInterviewType] = useState(resumeSkills.length > 0 ? 'Resume Interview' : 'Technical Interview');
  
  // Technical Track state
  const [technicalTrack, setTechnicalTrack] = useState('Frontend Developer');
  const [selectedTopics, setSelectedTopics] = useState(TECHNICAL_TRACKS['Frontend Developer'] || []);

  // Coding Track state
  const [codingTrack, setCodingTrack] = useState('DSA');

  // Resume state
  const [uploadedResumeName, setUploadedResumeName] = useState(resumeSkills.length > 0 ? 'uploaded_resume.pdf' : '');
  const [uploadedResumeText, setUploadedResumeText] = useState(resumeText);
  const [parsedSkills, setParsedSkills] = useState(resumeSkills);
  const [resumeId, setResumeId] = useState(null);
  const [resumeCandidateName, setResumeCandidateName] = useState('');
  const [resumeProjects, setResumeProjects] = useState([]);
  const [resumeExperience, setResumeExperience] = useState([]);
  const [resumeEducation, setResumeEducation] = useState([]);
  const [resumeSnapshot, setResumeSnapshot] = useState(null);
  const [resumeWordCount, setResumeWordCount] = useState(0);
  const [resumeParseError, setResumeParseError] = useState('');
  const [existingResumes, setExistingResumes] = useState([]);
  const [isLoadingExistingResumes, setIsLoadingExistingResumes] = useState(false);
  const [showExistingSelector, setShowExistingSelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Project Discussion state
  const [selectedProject, setSelectedProject] = useState('E-Commerce Microservices Platform');
  const [customProjectDesc, setCustomProjectDesc] = useState('High-throughput distributed store with JWT auth, Redis caching, and Stripe integration.');

  // System Design state
  const [systemDesignDomain, setSystemDesignDomain] = useState('Distributed Systems');

  // Group Discussion & Extempore state
  const [gdCategory, setGdCategory] = useState('Placement Topics');
  const [extemporeCategory, setExtemporeCategory] = useState('Artificial Intelligence');
  const [prepTime, setPrepTime] = useState('45 Seconds');

  // Behavioral Competencies state
  const [behavioralCompetencies, setBehavioralCompetencies] = useState([
    'Teamwork & Collaboration',
    'Ownership & Accountability',
    'Conflict Resolution'
  ]);

  const toggleCompetency = (comp) => {
    if (behavioralCompetencies.includes(comp)) {
      if (behavioralCompetencies.length === 1) {
        toast.error('At least one competency must be selected!');
        return;
      }
      setBehavioralCompetencies(behavioralCompetencies.filter(c => c !== comp));
    } else {
      setBehavioralCompetencies([...behavioralCompetencies, comp]);
    }
  };

  // Shared Configs
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [duration, setDuration] = useState('30 Minutes');

  const [showCheckModal, setShowCheckModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Synchronize duration choices when interview archetype changes
  useEffect(() => {
    if (interviewType === 'Extempore Round') {
      if (!['2 Minutes', '3 Minutes', '5 Minutes'].includes(duration)) {
        setDuration('3 Minutes');
      }
    } else if (interviewType === 'Group Discussion') {
      if (!['5 Minutes', '10 Minutes', '15 Minutes', '20 Minutes'].includes(duration)) {
        setDuration('10 Minutes');
      }
    } else {
      if (!['10 Minutes', '20 Minutes', '30 Minutes', '40 Minutes', '60 Minutes'].includes(duration)) {
        setDuration('30 Minutes');
      }
    }
  }, [interviewType]);

  // Synchronize topics when technicalTrack changes
  useEffect(() => {
    if (TECHNICAL_TRACKS[technicalTrack]) {
      setSelectedTopics(TECHNICAL_TRACKS[technicalTrack]);
    }
  }, [technicalTrack]);

  // Load existing resumes from user account when Resume Interview is chosen
  useEffect(() => {
    if (interviewType === 'Resume Interview') {
      loadMyResumes();
    }
  }, [interviewType]);

  const loadMyResumes = async () => {
    setIsLoadingExistingResumes(true);
    try {
      const { data } = await api.get('/resume/my-resumes');
      if (Array.isArray(data)) {
        setExistingResumes(data);
      }
    } catch (err) {
      console.warn('Unable to fetch account resumes:', err);
    } finally {
      setIsLoadingExistingResumes(false);
    }
  };

  const interviewTypes = [
    { id: 'Technical Interview', icon: <FaLaptopCode className="text-xl text-blue-400" />, title: 'Technical Interview', desc: 'Track-focused technical theory & dynamic topics drilldown.', time: '30m', diff: 'Med-Hard', preview: 'Track + Topic Selection' },
    { id: 'Coding Interview', icon: <FaCode className="text-xl text-emerald-400" />, title: 'Coding Interview', desc: 'Real-time algorithms, SQL schemas, or framework coding.', time: '45m', diff: 'Hard', preview: 'Minimal Setup + On-fly Switcher' },
    { id: 'Resume Interview', icon: <FaFileAlt className="text-xl text-amber-400" />, title: 'Resume Interview', desc: 'Questions tailored strictly to your uploaded resume profile.', time: '30m', diff: 'Medium', preview: 'Resume Extraction' },
    { id: 'HR Interview', icon: <FaUserTie className="text-xl text-pink-400" />, title: 'HR Interview', desc: 'Behavioral, career goals, culture fit, and soft skills.', time: '20m', diff: 'Easy-Med', preview: 'Behavioral & Fit' },
    { id: 'Behavioral Interview', icon: <Brain className="w-5 h-5 text-purple-400" />, title: 'Behavioral Interview', desc: 'STAR technique scenarios evaluating leadership & choices.', time: '30m', diff: 'Medium', preview: 'STAR Scenarios' },
    { id: 'Project Discussion', icon: <FaTasks className="text-xl text-teal-400" />, title: 'Project Discussion', desc: 'Architectural drilldown on one of your specific projects.', time: '30m', diff: 'Medium', preview: 'Project Architecture' },
    { id: 'System Design Interview', icon: <Monitor className="w-5 h-5 text-cyan-400" />, title: 'System Design', desc: 'Scale, caching, databases, and structural trade-offs.', time: '45m', diff: 'Expert', preview: 'Domain-focused Design' },
    { id: 'Extempore Round', icon: <FaMicrophone className="text-xl text-emerald-400" />, title: 'Extempore Round', desc: 'Spontaneous speech & dynamic AI follow-up cross-examination.', time: '2m-5m', diff: 'Beg-Adv', preview: 'Prep Timer + Follow-up' },
    { id: 'Group Discussion', icon: <Users className="w-5 h-5 text-amber-400" />, title: 'Group Discussion (GD)', desc: 'Practice campus placement group discussions with 5 AI participants.', time: '10m', diff: 'Beg-Adv', preview: '5 AI Candidates + Moderator' }
  ];

  const roles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'SDE Intern', 'Data Analyst', 'AI Engineer', 'ML Engineer', 'Cloud Engineer', 'DevOps Engineer'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const durations = interviewType === 'Extempore Round'
    ? ['2 Minutes', '3 Minutes', '5 Minutes']
    : interviewType === 'Group Discussion' 
    ? ['5 Minutes', '10 Minutes', '15 Minutes', '20 Minutes']
    : ['10 Minutes', '20 Minutes', '30 Minutes', '40 Minutes', '60 Minutes'];

  // Handle Resume Upload & Server-side extraction
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setResumeParseError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', role || 'Software Engineer');
      const { data } = await api.post('/resume/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setResumeId(data.resumeId);
        setUploadedResumeName(data.filename || file.name);
        setUploadedResumeText(data.resumeText || '');
        setParsedSkills(data.skills || []);
        setResumeCandidateName(data.candidateName || '');
        setResumeProjects(data.projects || []);
        setResumeExperience(data.experience || []);
        setResumeEducation(data.education || []);
        setResumeSnapshot(data.snapshot || null);
        setResumeWordCount(data.wordCount || 0);
        setShowExistingSelector(false);
        toast.success('Resume parsed and verified successfully!');
      } else {
        throw new Error(data.message || 'Parsing failed');
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to extract readable text. The file may be empty, image-only (scanned), or unsupported.';
      setResumeParseError(msg);
      toast.error(msg);
      setResumeId(null);
      setUploadedResumeName('');
      setUploadedResumeText('');
      setParsedSkills([]);
      setResumeProjects([]);
      setResumeExperience([]);
      setResumeEducation([]);
      setResumeSnapshot(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Select an existing resume already saved in the account
  const handleSelectExistingResume = async (existingId) => {
    if (!existingId) return;
    setIsUploading(true);
    setResumeParseError('');
    try {
      const { data } = await api.post('/resume/select-existing', { resumeId: existingId });
      if (data.success) {
        setResumeId(data.resumeId);
        setUploadedResumeName(data.filename);
        setUploadedResumeText(data.resumeText || '');
        setParsedSkills(data.skills || []);
        setResumeCandidateName(data.candidateName || '');
        setResumeProjects(data.projects || []);
        setResumeExperience(data.experience || []);
        setResumeEducation(data.education || []);
        setResumeSnapshot(data.snapshot || null);
        setResumeWordCount(data.wordCount || 0);
        setShowExistingSelector(false);
        toast.success(`Selected "${data.filename}" successfully!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to select resume profile.';
      setResumeParseError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearResume = () => {
    setResumeId(null);
    setUploadedResumeName('');
    setUploadedResumeText('');
    setParsedSkills([]);
    setResumeCandidateName('');
    setResumeProjects([]);
    setResumeExperience([]);
    setResumeEducation([]);
    setResumeSnapshot(null);
    setResumeWordCount(0);
    setResumeParseError('');
  };

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) {
        toast.error('At least one topic must be selected!');
        return;
      }
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Preview panel expected topics
  const getExpectedTopics = () => {
    if (interviewType === 'Technical Interview') {
      return [`Track: ${technicalTrack}`, `Topics: ${selectedTopics.slice(0, 3).join(', ')}${selectedTopics.length > 3 ? '...' : ''}`];
    }
    if (interviewType === 'Coding Interview') {
      return [`Coding Track: ${codingTrack}`, codingTrack === 'DSA' ? 'Language Switcher (Java, Python, C++, C, JS) in Live Editor' : `Dedicated ${codingTrack} Environment`];
    }
    if (interviewType === 'Resume Interview') {
      return [`Parsed Skills: ${parsedSkills.slice(0, 4).join(', ') || 'Projects & Experience'}`, 'Project & Internship Drilldown'];
    }
    if (interviewType === 'Project Discussion') {
      return [`Selected Project: ${selectedProject}`, 'Architecture & System Bottlenecks'];
    }
    if (interviewType === 'System Design Interview') {
      return [`Domain: ${systemDesignDomain}`, 'Scalability, Load Balancing & Trade-offs'];
    }
    if (interviewType === 'Extempore Round') {
      return [`Topic: ${extemporeCategory}`, `Prep Time: ${prepTime}`, 'Spontaneous Speech + Cross Questions'];
    }
    if (interviewType === 'Group Discussion') {
      return [`Topic Category: ${gdCategory}`, '5 AI Candidates + Moderator'];
    }
    if (interviewType === 'HR Interview' || interviewType === 'Behavioral Interview') {
      return [
        `Competencies: ${behavioralCompetencies.slice(0, 3).join(', ')}${behavioralCompetencies.length > 3 ? '...' : ''}`,
        interviewType === 'Behavioral Interview' ? 'STAR Framework Scenarios' : 'Communication & Culture Fit'
      ];
    }
    return ['STAR framework scenarios', 'Situation Handling', 'Leadership & Decision Making'];
  };

  const isResumeValid = Boolean(uploadedResumeText && uploadedResumeText.trim().length >= 50);

  const handleLaunchRequest = () => {
    if (interviewType === 'Resume Interview' && !isResumeValid) {
      toast.error('A verified resume is required for Resume Interview. Please upload or select a PDF or DOCX resume.');
      return;
    }
    setShowCheckModal(true);
  };

  const handleStartInterview = async () => {
    if (interviewType === 'Resume Interview' && !isResumeValid) {
      toast.error('Cannot start Resume Interview without a valid resume.');
      return;
    }
    setLoading(true);
    try {
      let activeDomain = '';
      let activeSubLanguage = '';
      let activeProjectName = '';
      let activeProjectDesc = '';

      if (interviewType === 'Technical Interview') {
        activeDomain = technicalTrack;
      } else if (interviewType === 'Coding Interview') {
        activeDomain = codingTrack;
        activeSubLanguage = codingTrack === 'DSA' ? 'Java' : codingTrack;
      } else if (interviewType === 'Project Discussion') {
        activeDomain = selectedProject;
        activeProjectName = selectedProject;
        activeProjectDesc = customProjectDesc;
      } else if (interviewType === 'System Design Interview') {
        activeDomain = systemDesignDomain;
      } else if (interviewType === 'Extempore Round') {
        activeDomain = extemporeCategory;
        activeSubLanguage = prepTime;
        activeProjectName = extemporeCategory;
      } else if (interviewType === 'Group Discussion') {
        activeDomain = gdCategory;
        activeProjectName = gdCategory;
      } else {
        activeDomain = role;
      }

      const res = await api.post('/interviews/create', {
        interviewType,
        role: role || 'Software Engineer',
        difficulty,
        duration,
        resumeSkills: parsedSkills,
        resumeText: uploadedResumeText,
        resumeId: resumeId || null,
        resumeFilename: uploadedResumeName,
        resumeSnapshot,
        resumeProjects,
        resumeExperience,
        resumeEducation,
        domain: activeDomain,
        subLanguage: activeSubLanguage,
        projectName: activeProjectName,
        projectDescription: activeProjectDesc,
        technicalTrack,
        selectedTopics,
        behavioralCompetencies,
        codingTrack,
        selectedProject,
        systemDesignDomain
      });

      navigate(`/interview/live/${res.data._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initialize mock interview chamber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Dynamic background lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden relative z-10">
        <Navbar subtitle="Mock Practice Mode Setup" />

        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-4 md:p-6 min-h-0">
          
          {/* LEFT COLUMN: Dynamic Config Form */}
          <div className="flex-1 flex flex-col overflow-y-auto pr-1 no-scrollbar gap-6 pb-6">
            
            {/* Intro */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-indigo-400 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Intelligent Configuration Engine
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Configure Your Live Chamber</h1>
              <p className="text-slate-400 text-xs mt-0.5">Every interview archetype features a specialized setup experience tailored to your target field.</p>
            </div>

            {/* STEP 1: Archetype Cards */}
            <div className="space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Step 1: Select Interview Archetype</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {interviewTypes.map((type) => {
                  const isSelected = interviewType === type.id;
                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setInterviewType(type.id)}
                      className={`relative rounded-2xl cursor-pointer border p-4 flex flex-col justify-between transition-all duration-300 min-h-[130px] ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                          {type.icon}
                        </div>
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">
                          {type.time}
                        </span>
                      </div>
                      <div className="mt-3">
                        <h4 className="font-bold text-sm text-white">{type.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{type.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
                          <FaCheck className="text-white text-[8px]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: SPECIALIZED DYNAMIC CONFIGURATION ACCORDING TO ARCHETYPE */}
            <div className="space-y-5 border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Step 2: Specialized Configuration</h2>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {interviewType}
                </span>
              </div>
              
              {/* ─── 1. TECHNICAL INTERVIEW SETUP ──────────────────────────────────── */}
              {interviewType === 'Technical Interview' && (
                <div className="space-y-5 bg-slate-900/60 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Technical Track
                    </label>
                    <select
                      value={technicalTrack}
                      onChange={(e) => setTechnicalTrack(e.target.value)}
                      className="w-full bg-blue-500/10 border border-blue-500/30 rounded-2xl px-4 py-3 text-xs text-blue-200 font-semibold focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                    >
                      {Object.keys(TECHNICAL_TRACKS).map((track) => (
                        <option key={track} value={track} className="bg-slate-900 text-white">{track}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Focus Topics ({selectedTopics.length} selected)
                      </label>
                      <span className="text-[10px] text-slate-500">AI evaluates ONLY selected topics</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(TECHNICAL_TRACKS[technicalTrack] || []).map((topic) => {
                        const isSelected = selectedTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => toggleTopic(topic)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-md'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            {isSelected && <FaCheck className="w-2.5 h-2.5 text-blue-400" />}
                            {topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 2. CODING INTERVIEW SETUP (REDESIGNED MINIMAL) ───────────────── */}
              {interviewType === 'Coding Interview' && (
                <div className="space-y-5 bg-slate-900/80 border border-emerald-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> Choose Coding Track
                      </label>
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Selected: {codingTrack}
                      </span>
                    </div>

                    {/* Dropdown Selector */}
                    <select
                      value={codingTrack}
                      onChange={(e) => setCodingTrack(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-2xl px-4 py-3.5 text-xs text-emerald-200 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner mb-3"
                    >
                      {CODING_TRACKS.map((track) => (
                        <option key={track} value={track} className="bg-slate-900 text-white font-semibold">
                          {track} {track === 'DSA' ? '(LeetCode / HackerRank Style + On-fly Language Switcher)' : track === 'SQL' ? '(Database Schema & Queries)' : '(Dedicated Track Sandbox)'}
                        </option>
                      ))}
                    </select>

                    {/* Interactive Grid Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {CODING_TRACKS.map((track) => {
                        const isSelected = codingTrack === track;
                        return (
                          <button
                            key={track}
                            type="button"
                            onClick={() => setCodingTrack(track)}
                            className={`p-3.5 rounded-2xl text-xs font-black text-center border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <span>{track}</span>
                            {isSelected && <FaCheck className="text-emerald-400 text-xs" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                    <span className="font-bold text-emerald-400 block">📌 Real Coding Interview Platform Flow:</span>
                    <p className="text-slate-400">
                      • Minimal setup without language or topic choices.<br />
                      {codingTrack === 'DSA' ? (
                        <>• <strong>DSA Track:</strong> Language selector (Java, Python, C++, C, JavaScript) appears directly above the live editor for on-the-fly switching without resetting your problem.</>
                      ) : codingTrack === 'SQL' ? (
                        <>• <strong>SQL Track:</strong> Opens Database Schema, Tables, and SQL Query Editor. Generates SQL-only queries.</>
                      ) : (
                        <>• <strong>{codingTrack} Track:</strong> Opens a dedicated {codingTrack} coding environment.</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* ─── 3. RESUME INTERVIEW SETUP ──────────────────────────────────────── */}
              {interviewType === 'Resume Interview' && (
                <div className="space-y-5 bg-slate-900/80 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
                  {/* Header / Intro */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                        <FaFileAlt className="w-4 h-4" /> Dedicated Resume Chamber Setup
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload or select a verified resume. Sarah will strictly question you on your documented projects, experience, and skills.
                      </p>
                    </div>

                    {isResumeValid && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Grounded Profile Active
                      </span>
                    )}
                  </div>

                  {/* Parse Error Notification */}
                  {resumeParseError && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-rose-300 block">Resume Extraction Failed:</span>
                        <p className="text-rose-200/90 leading-relaxed">{resumeParseError}</p>
                        <p className="text-[11px] text-rose-300/80 mt-1">
                          Tip: If you uploaded a scanned image or screenshot, export it as a text-based PDF or Word document (.docx) so the AI can read your text.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Uploading State Spinner */}
                  {isUploading && (
                    <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3">
                      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="text-xs font-bold text-amber-300">Parsing and Analyzing Resume Content...</div>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Extracting candidate details, technical skillsets, projects, and work experience on the server...
                      </p>
                    </div>
                  )}

                  {/* View 1: When a Valid Resume is Verified and Loaded */}
                  {!isUploading && isResumeValid && (
                    <div className="space-y-4">
                      {/* File Card & Replacement Actions */}
                      <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{uploadedResumeName || 'candidate_resume.pdf'}</h4>
                              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                Verified
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {resumeCandidateName ? `${resumeCandidateName} • ` : ''}
                              {resumeWordCount ? `${resumeWordCount} words extracted` : `${parsedSkills.length} skills indexed`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" /> Replace Resume
                            <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeFileUpload} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={handleClearResume}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 transition-all cursor-pointer"
                            title="Remove Resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Extracted Snapshot Preview Card */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                        {/* Skills Section */}
                        {parsedSkills.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                              Verified Technical Skills ({parsedSkills.length})
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {parsedSkills.map((sk, idx) => (
                                <span key={idx} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects Section */}
                        {resumeProjects && resumeProjects.length > 0 && (
                          <div className="space-y-2 border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Documented Projects ({resumeProjects.length})
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {resumeProjects.map((p, idx) => {
                                const pTitle = typeof p === 'string' ? p : (p.name || p.title || `Project #${idx + 1}`);
                                const pDesc = typeof p === 'object' ? (p.description || p.details || (Array.isArray(p.tech) ? p.tech.join(', ') : '') || '') : '';
                                return (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                                    <span className="font-bold text-slate-200 block truncate">{pTitle}</span>
                                    {pDesc && <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">{pDesc}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Experience / Internships Section */}
                        {resumeExperience && resumeExperience.length > 0 && (
                          <div className="space-y-2 border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Work Experience &amp; Internships ({resumeExperience.length})
                            </span>
                            <div className="space-y-1.5">
                              {resumeExperience.map((e, idx) => {
                                const roleName = typeof e === 'string' ? e : (e.role || e.title || 'Role');
                                const companyName = typeof e === 'object' ? (e.company || e.organization || '') : '';
                                const desc = typeof e === 'object' ? (e.responsibilities || e.description || '') : '';
                                return (
                                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                                    <span className="font-bold text-slate-200 block">{roleName} {companyName ? `@ ${companyName}` : ''}</span>
                                    {desc && <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{desc}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Education Section */}
                        {resumeEducation && resumeEducation.length > 0 && (
                          <div className="border-t border-white/5 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                              Education Background
                            </span>
                            <div className="text-[11px] text-slate-300">
                              {resumeEducation.map((edu, idx) => {
                                const deg = typeof edu === 'string' ? edu : (edu.degree || edu.institution || 'Degree');
                                const inst = typeof edu === 'object' && edu.institution && edu.degree ? ` - ${edu.institution}` : '';
                                return <div key={idx}>• {deg}{inst}</div>;
                              })}
                            </div>
                          </div>
                        )}

                        {/* Grounding Directive Assurance */}
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-200 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <span>
                            <strong>AI Interviewer Grounding:</strong> Questions will focus exclusively on your real projects, role contributions, and listed tech stack. No generic trivia.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View 2: When No Resume is Uploaded / Need Upload */}
                  {!isUploading && !isResumeValid && (
                    <div className="space-y-4">
                      {/* Dropzone Card */}
                      <label className="border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 bg-slate-950/60 hover:bg-amber-500/5 p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-3">
                          <UploadCloud className="w-7 h-7" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Upload Your PDF or DOCX Resume</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                          Click to select a document (.pdf, .docx). The server will extract and verify your skills, projects, and background.
                        </p>
                        <span className="mt-3 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold inline-flex items-center gap-1.5">
                          <FaUpload className="w-3 h-3" /> Browse Files
                        </span>
                        <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeFileUpload} className="hidden" />
                      </label>

                      {/* Select from Existing Account Resumes */}
                      {existingResumes.length > 0 && (
                        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-400" /> Or Select Stored Resume Profile ({existingResumes.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowExistingSelector(!showExistingSelector)}
                              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {showExistingSelector ? 'Hide Resumes' : 'Choose Existing'} <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${showExistingSelector ? 'rotate-180' : ''}`} />
                            </button>
                          </div>

                          {showExistingSelector && (
                            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pt-1">
                              {existingResumes.map((resItem) => (
                                <div
                                  key={resItem._id}
                                  onClick={() => handleSelectExistingResume(resItem._id)}
                                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/40 flex items-center justify-between cursor-pointer transition-all"
                                >
                                  <div>
                                    <h5 className="text-xs font-bold text-white">{resItem.fileUrl || resItem.targetRole || 'Saved Resume'}</h5>
                                    <p className="text-[10px] text-slate-400">
                                      {resItem.targetRole ? `${resItem.targetRole} • ` : ''}
                                      {resItem.skillsFound ? `${resItem.skillsFound.length} skills • ` : ''}
                                      {new Date(resItem.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30"
                                  >
                                    Use This
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requirement Warning */}
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span>
                          <strong>Requirement:</strong> A validated resume must be uploaded or selected to unlock the mock chamber.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── 4 & 5. HR & BEHAVIORAL INTERVIEW SETUP ──────────────────────────── */}
              {(interviewType === 'HR Interview' || interviewType === 'Behavioral Interview') && (
                <div className="space-y-4 bg-slate-900/60 border border-purple-500/20 p-5 rounded-3xl backdrop-blur-md">
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 leading-relaxed">
                    {interviewType === 'HR Interview'
                      ? 'Checks communication, career motivation, corporate ethics, salary expectations, and teamwork.'
                      : 'Evaluates Leadership, Ownership, Decision Making, Conflict Resolution, and Adaptability using the STAR framework.'}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Target Behavioral Competencies ({behavioralCompetencies.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BEHAVIORAL_COMPETENCIES.map((comp) => {
                        const isSelected = behavioralCompetencies.includes(comp);
                        return (
                          <button
                            key={comp}
                            type="button"
                            onClick={() => toggleCompetency(comp)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}{comp}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── 6. PROJECT DISCUSSION SETUP ────────────────────────────────────── */}
              {interviewType === 'Project Discussion' && (
                <div className="space-y-4 bg-slate-900/60 border border-teal-500/20 p-5 rounded-3xl backdrop-blur-md">
                  {/* Quick-Pick From Verified Resume */}
                  {resumeProjects && resumeProjects.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Pick From Uploaded Resume ({resumeProjects.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {resumeProjects.map((p, idx) => {
                          const pTitle = typeof p === 'string' ? p : (p.name || p.title || `Project #${idx + 1}`);
                          const pDesc = typeof p === 'object' ? (p.description || p.details || (Array.isArray(p.tech) ? `Stack: ${p.tech.join(', ')}` : '') || '') : '';
                          const isChosen = selectedProject === pTitle;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedProject(pTitle);
                                if (pDesc) setCustomProjectDesc(pDesc);
                              }}
                              className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold border transition-all cursor-pointer ${
                                isChosen
                                  ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.3)]'
                                  : 'bg-white/[0.02] border-white/10 text-slate-300 hover:border-teal-500/40 hover:text-white'
                              }`}
                            >
                              {isChosen ? '✓ ' : '+ '}{pTitle}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FaFolderOpen className="w-3.5 h-3.5" /> Project Title
                    </label>
                    <input
                      type="text"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      placeholder="e.g. Distributed E-Commerce Microservices"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Architecture Overview &amp; Stack</label>
                    <textarea
                      value={customProjectDesc}
                      onChange={(e) => setCustomProjectDesc(e.target.value)}
                      placeholder="Briefly describe tech stack, DB, authentication, and architectural challenges..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-teal-500 h-20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ─── 7. SYSTEM DESIGN SETUP ─────────────────────────────────────────── */}
              {interviewType === 'System Design Interview' && (
                <div className="space-y-4 bg-slate-900/60 border border-cyan-500/20 p-5 rounded-3xl backdrop-blur-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> System Design Domain
                    </label>
                    <select
                      value={systemDesignDomain}
                      onChange={(e) => setSystemDesignDomain(e.target.value)}
                      className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-4 py-3 text-xs text-cyan-200 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
                    >
                      {SYSTEM_DESIGN_DOMAINS.map((domainItem) => (
                        <option key={domainItem} value={domainItem} className="bg-slate-900 text-white">{domainItem}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ─── 8 & 9. EXTEMPORE & GROUP DISCUSSION SETUP ─────────────────────── */}
              {interviewType === 'Extempore Round' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/60 border border-emerald-500/20 p-5 rounded-3xl backdrop-blur-md">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Extempore Topic Category</label>
                    <select
                      value={extemporeCategory}
                      onChange={(e) => setExtemporeCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {EXTEMPORE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preparation Time</label>
                    <select
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {['30 Seconds', '45 Seconds', '60 Seconds', '90 Seconds', '120 Seconds'].map((pt) => (
                        <option key={pt} value={pt} className="bg-slate-900">{pt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {interviewType === 'Group Discussion' && (
                <div className="space-y-1.5 bg-slate-900/60 border border-amber-500/20 p-5 rounded-3xl backdrop-blur-md">
                  <label className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">GD Topic Category</label>
                  <select
                    value={gdCategory}
                    onChange={(e) => setGdCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {GD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* SHARED CONFIGURATIONS (DIFFICULTY & DURATION, TARGET ROLE WHERE NEEDED) */}
              <div className={`grid grid-cols-1 ${needsTargetRole(interviewType) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4 pt-2`}>
                {needsTargetRole(interviewType) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r} className="bg-slate-900">{r}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d} className="bg-slate-900">{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {durations.map((dur) => (
                      <option key={dur} value={dur} className="bg-slate-900">{dur}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Real-Time Chamber Preview Panel */}
          <div className="w-full lg:w-[360px] bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between h-fit lg:h-auto">
            <div className="space-y-6">
              
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Chamber Spec</span>
                <h3 className="text-lg font-black text-white mt-1">{interviewType}</h3>
                <p className="text-xs text-slate-400 mt-1">Configured strictly for practice evaluation.</p>
              </div>

              <div className="space-y-3">
                {needsTargetRole(interviewType) && (
                  <div className="p-3.5 bg-slate-950/60 border border-white/[0.05] rounded-2xl flex items-center justify-between">
                    <span className="text-xs text-slate-400">Target Role</span>
                    <span className="text-xs font-bold text-white">{role}</span>
                  </div>
                )}
                <div className="p-3.5 bg-slate-950/60 border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">Difficulty</span>
                  <span className="text-xs font-bold text-indigo-400">{difficulty}</span>
                </div>
                <div className="p-3.5 bg-slate-950/60 border border-white/[0.05] rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-slate-400">Duration</span>
                  <span className="text-xs font-bold text-white">{duration}</span>
                </div>
              </div>

              {/* Dynamic Scope Checklist */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Configured Scope &amp; Topics</span>
                <div className="space-y-2">
                  {getExpectedTopics().map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Launch Button */}
            <div className="mt-8">
              {interviewType === 'Resume Interview' && !isResumeValid && (
                <div className="mb-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Upload or select a valid resume to unlock this interview.</span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: (interviewType !== 'Resume Interview' || isResumeValid) ? 1.02 : 1 }}
                whileTap={{ scale: (interviewType !== 'Resume Interview' || isResumeValid) ? 0.98 : 1 }}
                onClick={handleLaunchRequest}
                disabled={interviewType === 'Resume Interview' && !isResumeValid}
                className={`w-full py-3.5 rounded-2xl text-xs font-black shadow-lg tracking-wider flex items-center justify-center gap-2 group transition-all ${
                  interviewType === 'Resume Interview' && !isResumeValid
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white cursor-pointer'
                }`}
              >
                <span>{interviewType === 'Coding Interview' ? 'Start Coding Interview' : 'Launch Mock Chamber'}</span>
                <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

          </div>

        </main>
      </div>

      {/* HARDWARE CHECK MODAL OVERLAY */}
      <AnimatePresence>
        {showCheckModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl relative"
            >
              <h2 className="text-xl font-black text-white text-center mb-6">Pre-Interview Diagnostics</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaMicrophone className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Microphone Setup</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Activates inside the live interview chamber</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Ready In Chamber</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <FaVideo className="text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Camera Setup</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Activates inside the live interview chamber</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Ready In Chamber</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Volume2 className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Audio &amp; Speech Output</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">AI Interviewer Voice Engine</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Ready</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Wifi className="text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Network Sync</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Real-time AI evaluation engine</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Optimal</span>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-2xl mb-8 text-left text-[11px] text-indigo-300 leading-relaxed">
                <span className="font-bold text-indigo-400 block mb-1">🖥️ Recommendation: Fullscreen Mode</span>
                Practice in a quiet environment, maximize this browser window, and minimize notifications to simulate a professional recruitment board interview.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel Setup
                </button>
                <button
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                  ) : (
                    <>
                      <span>{interviewType === 'Coding Interview' ? 'Start Coding Interview' : 'Start Practice'}</span>
                      <FaArrowRight className="text-[8px]" />
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InterviewSetup;
