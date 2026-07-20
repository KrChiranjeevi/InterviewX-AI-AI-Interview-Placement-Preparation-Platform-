import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaPlay, FaCheckCircle, FaLock, 
  FaUndo, FaClock, FaCheck, FaAward, FaSlidersH, FaBrain,
  FaTimesCircle, FaTrophy, FaLightbulb, FaBriefcase, FaChevronDown, 
  FaChevronUp, FaCode, FaRobot, FaUsers, FaLaptopCode, FaUpload, 
  FaTerminal, FaSync, FaExclamationTriangle, FaPaperPlane, FaUserTie, FaChevronRight, FaPrint, FaStream, FaDatabase, FaCompress, FaExpand, FaTimes, FaExternalLinkAlt
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

const ROLES_LIST = [
  'Software Engineer', 'Java Developer', 'Frontend Developer', 
  'Backend Developer', 'Full Stack Developer', 'Cloud Engineer', 
  'QA Engineer', 'Data Analyst', 'System Engineer'
];

const CompanyDetail = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();

  // ── CORE LIFECYCLE STATES ──
  const [companySpec, setCompanySpec] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isDriveActive, setIsDriveActive] = useState(false);
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);
  const [scores, setScores] = useState({});
  const [roundDetails, setRoundDetails] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hiringCommitteeStatus, setHiringCommitteeStatus] = useState('convening');
  const [committeeProgress, setCommitteeProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // New placement allocation states for Service companies
  const [allocatedRole, setAllocatedRole] = useState('');
  const [allocatedBU, setAllocatedBU] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTrainingRunning, setIsTrainingRunning] = useState(false);
  const [isAllocatingBU, setIsAllocatingBU] = useState(false);
  const [buRollLabel, setBuRollLabel] = useState('');

  const companyLogo = companySpec?.logo || '/assets/default-company.png';
  const companyColor = companySpec?.color || '#6366F1';

  // Front-end service companies identifier list to ensure robust rendering even if database/cache is out of sync
  const serviceCompaniesList = ['tcs', 'infosys', 'accenture', 'capgemini', 'cognizant', 'wipro', 'deloitte'];
  const isService = companySpec?.companyType === 'Service' || serviceCompaniesList.includes(companyName.toLowerCase());

  // Dynamic role allocation rules based on track tier
  const getAllocatedRoleForTrack = (trackId) => {
    const tid = trackId?.toLowerCase() || '';
    if (tid.includes('prime') || tid.includes('sp') || tid.includes('pro') || tid.includes('turbo') || tid.includes('senior') || tid.includes('l4')) {
      const roles = ['Systems Architect', 'Full Stack Developer', 'Cloud Engineer', 'Data Engineer'];
      return roles[Math.floor(Math.random() * roles.length)];
    } else if (tid.includes('digital') || tid.includes('dse') || tid.includes('associate') || tid.includes('elevate') || tid.includes('consultant')) {
      const roles = ['Software Engineer', 'Java Developer', 'Frontend Developer', 'Backend Developer'];
      return roles[Math.floor(Math.random() * roles.length)];
    } else {
      const roles = ['System Engineer', 'QA Engineer', 'Support Engineer', 'Business Analyst'];
      return roles[Math.floor(Math.random() * roles.length)];
    }
  };

  // ── INTERACTIVE MOCK OA STATES ──
  const [activeOASection, setActiveOASection] = useState('quant');
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [editorCode, setEditorCode] = useState('// Write your optimized code here\nfunction solution() {\n  // Code goes here\n}\n');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isProctorMode, setIsProctorMode] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [oaCompleted, setOaCompleted] = useState(false);
  const [oaAnswers, setOaAnswers] = useState({});

  // ── INTERACTIVE CHAT INTERVIEW STATES ──
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewScore, setInterviewScore] = useState(null);
  const [interviewEvaluated, setInterviewEvaluated] = useState(false);
  const [interviewProgress, setInterviewProgress] = useState(0);

  // Load company data and placement simulation state
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        setLogoError(false);
        
        // 1. Fetch Company Spec with Session Storage Cache
        const cacheKey = `company_intel_cache_${companyName.toLowerCase()}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        let specData = null;
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (parsed && parsed.companyType) {
            specData = parsed;
          }
        }
        
        if (!specData) {
          const res = await api.get(`/company/${companyName}`);
          specData = res.data;
          sessionStorage.setItem(cacheKey, JSON.stringify(specData));
        }
        setCompanySpec(specData);

        // 2. Load placement simulation state from localStorage
        const saved = localStorage.getItem(`placement_simulation_${companyName}`);
        if (saved) {
          const data = JSON.parse(saved);
          const localIsService = specData?.companyType === 'Service' || serviceCompaniesList.includes(companyName.toLowerCase());
          if (data.selectedTrack && data.isDriveActive && (localIsService || data.selectedRole)) {
            setSelectedTrack(data.selectedTrack);
            setSelectedRole(data.selectedRole || '');
            setIsDriveActive(true);
            setCurrentPipelineStep(data.currentPipelineStep || 0);
            setScores(data.scores || {});
            setRoundDetails(data.roundDetails || {});
            setActiveTab(data.activeTab || 'dashboard');
            if (data.allocatedRole) setAllocatedRole(data.allocatedRole);
            if (data.allocatedBU) setAllocatedBU(data.allocatedBU);
            if (data.hiringCommitteeStatus) setHiringCommitteeStatus(data.hiringCommitteeStatus);
          } else {
            setSelectedTrack(null);
            setSelectedRole('');
            setIsDriveActive(false);
            setCurrentPipelineStep(0);
            setScores({});
            setRoundDetails({});
            setActiveTab('dashboard');
            setAllocatedRole('');
            setAllocatedBU('');
          }
        } else {
          setSelectedTrack(null);
          setSelectedRole('');
          setIsDriveActive(false);
          setCurrentPipelineStep(0);
          setScores({});
          setRoundDetails({});
          setActiveTab('dashboard');
          setAllocatedRole('');
          setAllocatedBU('');
        }
      } catch (err) {
        console.error('Failed to load company config/state:', err);
        // Fallback for non-seeded companies
        setCompanySpec({
          name: companyName,
          logo: `https://logo.clearbit.com/${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          color: '#6366F1',
          tracks: [
            { id: 'default', name: 'Software Track', package: '6.0 LPA', difficulty: 'Medium', timeline: '4 Weeks', eligibility: 'All Graduates' }
          ],
          pipeline: [
            { id: 'resume', title: 'Resume Screening' },
            { id: 'oa', title: 'Online Assessment' },
            { id: 'tech', title: 'Technical Interview' },
            { id: 'hr', title: 'HR Round' },
            { id: 'offer', title: 'Offer Letter' }
          ],
          info: {
            overview: "Information not publicly available.",
            description: "Information not publicly available.",
            headquarters: "Information not publicly available.",
            industry: "Information not publicly available.",
            founded: "Information not publicly available.",
            employees: "Information not publicly available.",
            careersUrl: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' careers')}`,
            hiringType: "Information not publicly available.",
            availability: "Information not publicly available.",
            eligibility: "Information not publicly available.",
            degrees: "Information not publicly available.",
            cgpa: "Information not publicly available.",
            process: "Information not publicly available.",
            rounds: "Information not publicly available.",
            flow: "Information not publicly available.",
            techTopics: "Information not publicly available.",
            behavioralTopics: "Information not publicly available.",
            skillsPreferred: "Information not publicly available.",
            technologies: "Information not publicly available.",
            projectsExpected: "Information not publicly available.",
            prepTips: "Information not publicly available.",
            timeline: "Information not publicly available.",
            package: "Information not publicly available.",
            notes: "Information not publicly available.",
            faqs: []
          }
        });
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [companyName]);

  // Hiring Committee convene progress driver
  useEffect(() => {
    if (activeTab === 'report' && hiringCommitteeStatus === 'convening') {
      setCommitteeProgress(0);
      const interval = setInterval(() => {
        setCommitteeProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setHiringCommitteeStatus('resolved');
            saveStateToStorage({ hiringCommitteeStatus: 'resolved' });
            return 100;
          }
          return prev + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [activeTab, hiringCommitteeStatus]);

  // Persist Placement simulation state to localStorage whenever it changes
  const saveStateToStorage = (updatedFields) => {
    try {
      const currentObj = {
        selectedTrack,
        selectedRole,
        isDriveActive,
        currentPipelineStep,
        scores,
        roundDetails,
        activeTab,
        allocatedRole,
        allocatedBU,
        hiringCommitteeStatus,
        ...updatedFields
      };
      localStorage.setItem(`placement_simulation_${companyName}`, JSON.stringify(currentObj));
    } catch (e) {
      console.error('Failed to save placement state to localStorage:', e);
    }
  };

  // ── HANDLERS ──
  const handleStartDrive = () => {
    const isService = companySpec?.companyType === 'Service';
    if (!selectedTrack) {
      toast.error('Please select a hiring track.');
      return;
    }
    if (!isService && !selectedRole) {
      toast.error('Please select a target job role.');
      return;
    }

    const newFields = {
      isDriveActive: true,
      currentPipelineStep: 0,
      scores: {},
      roundDetails: {},
      activeTab: 'dashboard',
      allocatedRole: '',
      allocatedBU: ''
    };
    setIsDriveActive(true);
    setCurrentPipelineStep(0);
    setScores({});
    setRoundDetails({});
    setActiveTab('dashboard');
    setAllocatedRole('');
    setAllocatedBU('');
    saveStateToStorage(newFields);
    toast.success('Placement Simulation Initialized! Best of luck.');
  };

  const handleResetDrive = () => {
    if (window.confirm('Are you sure you want to reset this hiring drive simulation? This will clear all scores.')) {
      localStorage.removeItem(`placement_simulation_${companyName}`);
      setSelectedTrack(null);
      setSelectedRole('');
      setIsDriveActive(false);
      setCurrentPipelineStep(0);
      setScores({});
      setRoundDetails({});
      setActiveTab('dashboard');
      setOaCompleted(false);
      setOaAnswers({});
      setChatMessages([]);
      setInterviewActive(false);
      setInterviewEvaluated(false);
      setAllocatedRole('');
      setAllocatedBU('');
      toast.success('Drive reset completed.');
    }
  };

  // Training and Allocation Handlers for Service Companies
  const handleStartTraining = () => {
    setIsTrainingRunning(true);
    setTrainingProgress(0);
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const nextStep = 6;
            const updatedScores = { ...scores, 5: 100 };
            const updatedDetails = {
              ...roundDetails,
              5: {
                score: 100,
                passed: true,
                feedback: 'Successfully mastered training curriculum in modern system integrations and deployment pipelines.',
                timeTaken: '4 Weeks Simulated',
                difficulty: selectedTrack?.difficulty || 'Medium'
              }
            };
            setScores(updatedScores);
            setRoundDetails(updatedDetails);
            setCurrentPipelineStep(nextStep);
            saveStateToStorage({ scores: updatedScores, roundDetails: updatedDetails, currentPipelineStep: nextStep });
            setIsTrainingRunning(false);
            setActiveTab('bu');
            toast.success('Training Program completed! Proceed to BU allocation.');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleRunBUAllocation = () => {
    setIsAllocatingBU(true);
    const units = [
      '🏦 BFSI (Banking, Financial Services & Insurance)',
      '🛒 Retail, Logistical Services & E-commerce',
      '🧬 Life Sciences, Biotech & Healthcare Systems',
      '☁️ Cloud Platform (Systems & Infrastructure)',
      '🔒 Cybersecurity Operations & Incident Response'
    ];
    let ticks = 0;
    const interval = setInterval(() => {
      setBuRollLabel(units[ticks % units.length]);
      ticks++;
      if (ticks >= 15) {
        clearInterval(interval);
        const selectedBU = units[Math.floor(Math.random() * units.length)];
        setBuRollLabel(selectedBU);
        setAllocatedBU(selectedBU);
        
        setTimeout(() => {
          const nextStep = 7;
          const updatedScores = { ...scores, 6: 100 };
          const updatedDetails = {
            ...roundDetails,
            6: {
              score: 100,
              passed: true,
              feedback: `Allocated to the ${selectedBU} vertical based on assessment scores and team demand.`,
              timeTaken: 'Instant',
              difficulty: selectedTrack?.difficulty || 'Medium'
            }
          };
          setScores(updatedScores);
          setRoundDetails(updatedDetails);
          setCurrentPipelineStep(nextStep);
          const allocatedRoleName = getAllocatedRoleForTrack(selectedTrack?.id);
          setAllocatedRole(allocatedRoleName);
          
          saveStateToStorage({ 
            scores: updatedScores, 
            roundDetails: updatedDetails, 
            currentPipelineStep: nextStep,
            allocatedRole: allocatedRoleName,
            allocatedBU: selectedBU
          });
          setIsAllocatingBU(false);
          setActiveTab('role');
          toast.success(`Allocated to ${selectedBU} vertical!`);
        }, 800);
      }
    }, 150);
  };

  // Step 1: Resume Verification (Real Parsing using AI Resume Analyzer backend)
  const handleVerifyResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a PDF resume first.');
      return;
    }

    setResumeUploading(true);
    const toastId = toast.loading('Uploading and analyzing your resume...');

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('targetRole', selectedRole || 'SDE Intern');
    formData.append('targetCompany', companyName);

    try {
      const res = await api.post('/resume/upload', formData);
      const analysis = res.data;
      const atsScore = analysis.atsScore || 70;
      const passed = atsScore >= 60;
      
      const nextStep = passed ? 1 : 0;
      const updatedScores = { ...scores, 0: atsScore };
      
      const updatedDetails = {
        ...roundDetails,
        0: {
          score: atsScore,
          passed,
          feedback: passed 
            ? `Resume verification passed successfully! Found strong technical skill alignment for ${selectedRole || 'target track'}.`
            : `ATS Screening failed. The matching score did not meet the required threshold of 60%.`,
          missingKeywordsList: analysis.missingKeywords || [],
          formattingFeedback: analysis.formattingFeedback || 'Missing dynamic quantifiable impact metrics or single-column structure.',
          timeTaken: 'Instant',
          difficulty: selectedTrack?.difficulty || 'Medium'
        }
      };

      setScores(updatedScores);
      setRoundDetails(updatedDetails);
      
      if (passed) {
        setCurrentPipelineStep(nextStep);
        saveStateToStorage({ scores: updatedScores, roundDetails: updatedDetails, currentPipelineStep: nextStep });
        toast.success(`Resume Verification Passed! Score: ${atsScore}%`, { id: toastId });
      } else {
        setCurrentPipelineStep(0);
        saveStateToStorage({ scores: updatedScores, roundDetails: updatedDetails, currentPipelineStep: 0 });
        toast.error(`Resume Verification Failed. Score: ${atsScore}% (Requires 60%+). Please improve your resume.`, { id: toastId, duration: 4000 });
      }
    } catch (err) {
      console.error('Failed to parse resume:', err);
      toast.error('Failed to analyze resume. Please ensure the PDF is valid.', { id: toastId });
    } finally {
      setResumeUploading(false);
    }
  };

  const handleImproveResume = () => {
    // Clear previous scores & round details for step 0 so they can upload again
    setScores(prev => {
      const n = { ...prev };
      delete n[0];
      return n;
    });
    setRoundDetails(prev => {
      const n = { ...prev };
      delete n[0];
      return n;
    });
    setResumeFile(null);
    toast.success('Ready to re-upload. Please select your optimized resume.');
  };

  // Step 2: Assessment Submission
  const handleRunCode = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      toast.success('Code compiled successfully! 12/12 Test cases passed.');
    }, 1500);
  };

  const toggleProctorMode = () => {
    if (!isProctorMode) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.error('Fullscreen access denied by browser.');
      });
      setIsProctorMode(true);
      toast.success('Fullscreen proctored assessment active.');
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsProctorMode(false);
    }
  };

  // Simulate Tab Switch warnings in Proctor mode
  useEffect(() => {
    const handleBlur = () => {
      if (isProctorMode) {
        setProctorWarnings(prev => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error('Proctoring Violation: Repeated window switches. Automatic submission triggered.');
            submitOA();
          } else {
            toast.error(`Warning: Do not switch tabs or windows. Proctor Warning #${next}/3.`);
          }
          return next;
        });
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isProctorMode]);

  const submitOA = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsProctorMode(false);

    const score = Math.floor(Math.random() * (95 - 78 + 1)) + 78;
    const updatedScores = { ...scores, 1: score };
    const updatedDetails = {
      ...roundDetails,
      1: {
        score,
        passed: true,
        feedback: 'Superb numerical and logic proficiency. Coding problem optimized safely.',
        timeTaken: '38 mins',
        difficulty: selectedTrack.difficulty
      }
    };

    const nextStep = 2;
    setScores(updatedScores);
    setRoundDetails(updatedDetails);
    setCurrentPipelineStep(nextStep);
    setOaCompleted(true);
    saveStateToStorage({ scores: updatedScores, roundDetails: updatedDetails, currentPipelineStep: nextStep });
    toast.success(`Online Assessment Completed! Score: ${score}%`);
  };

  // Step 3 & 4: Live Interview Simulations
  const startInterviewRound = async (roundIndex) => {
    const roundName = companySpec?.pipeline?.[roundIndex]?.title || 'Interview';
    const stepId = companySpec?.pipeline?.[roundIndex]?.id || 'tech';
    
    const toastId = toast.loading('Initializing premium AI interview room...');
    
    try {
      // Call backend to create standard interview database record
      const res = await api.post('/interviews/create', {
        interviewType: stepId === 'hr' ? 'HR Interview' : 'Technical Interview',
        role: selectedRole || 'SDE Intern',
        difficulty: selectedTrack?.difficulty || 'Medium',
        duration: '30 min',
        resumeSkills: [],
        resumeText: ''
      });
      
      const interviewId = res.data?._id || 'fallback-id';
      toast.success('Interview room ready! Launching...', { id: toastId });
      
      // Redirect to the premium full-screen live workspace
      navigate(`/interview/live/${interviewId}?company=${companyName.toLowerCase()}&round=${stepId}&role=${encodeURIComponent(selectedRole || 'SDE Intern')}`);
    } catch (err) {
      console.error('Failed to create interview session:', err);
      // Fallback redirection with mock ID if backend api breaks
      const fallbackId = 'simulation-' + Date.now();
      toast.success('Launching simulation room...', { id: toastId });
      navigate(`/interview/live/${fallbackId}?company=${companyName.toLowerCase()}&round=${stepId}&role=${encodeURIComponent(selectedRole || 'SDE Intern')}`);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const isService = companySpec?.companyType === 'Service';
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInputText = chatInput;
    setChatInput('');

    setTimeout(() => {
      const nextProgress = interviewProgress + 1;
      setInterviewProgress(nextProgress);

      if (nextProgress >= 3) {
        // Complete interview
        const score = Math.floor(Math.random() * (92 - 80 + 1)) + 80;
        const updatedScores = { ...scores, [currentPipelineStep]: score };
        const updatedDetails = {
          ...roundDetails,
          [currentPipelineStep]: {
            score,
            passed: true,
            feedback: 'Candidate displayed deep technical understanding, structured delivery, and confidence.',
            timeTaken: '20 mins',
            difficulty: selectedTrack.difficulty
          }
        };

        const nextStep = currentPipelineStep + 1;
        setScores(updatedScores);
        setRoundDetails(updatedDetails);
        setCurrentPipelineStep(nextStep);
        setInterviewActive(false);
        setInterviewEvaluated(true);
        setInterviewScore(score);
        saveStateToStorage({ scores: updatedScores, roundDetails: updatedDetails, currentPipelineStep: nextStep });
        toast.success(`Round Cleared with ${score}%! Pipeline advanced.`);
      } else {
        const questions = [
          isService
            ? `Great. Speaking of database engineering, how would you construct a relational database query to retrieve data from multiple related tables?`
            : `Great. Speaking of ${selectedRole} concepts, how would you design a distributed caching database strategy to handle 10,000 requests/sec?`,
          `That makes sense. Can you explain a scenario where you made a critical technical trade-off under a tight delivery timeline?`,
          `Excellent. What is your understanding of the core operational values at ${companyName}, and how do they impact code standards?`
        ];
        setChatMessages(prev => [...prev, { sender: 'ai', text: questions[nextProgress - 1] || 'Describe how you maintain test code safety.' }]);
      }
    }, 1500);
  };

  if (loading || !companySpec) {
    return (
      <div className="flex bg-slate-950 min-h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Readiness Metric Dynamic calculation
  const totalRoundsCount = companySpec.pipeline.length - 1;
  const completedRounds = Object.keys(scores).length;
  const overallAvg = completedRounds > 0 
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / completedRounds)
    : 0;

  const renderDetailsModal = () => {
    const info = companySpec?.info || {
      overview: "Information not publicly available.",
      description: "Information not publicly available.",
      headquarters: "Information not publicly available.",
      industry: "Information not publicly available.",
      founded: "Information not publicly available.",
      employees: "Information not publicly available.",
      careersUrl: `https://www.google.com/search?q=${encodeURIComponent(companyName + ' careers')}`,
      hiringType: "Information not publicly available.",
      availability: "Information not publicly available.",
      eligibility: "Information not publicly available.",
      degrees: "Information not publicly available.",
      cgpa: "Information not publicly available.",
      process: "Information not publicly available.",
      rounds: "Information not publicly available.",
      flow: "Information not publicly available.",
      techTopics: "Information not publicly available.",
      behavioralTopics: "Information not publicly available.",
      skillsPreferred: "Information not publicly available.",
      technologies: "Information not publicly available.",
      projectsExpected: "Information not publicly available.",
      prepTips: "Information not publicly available.",
      timeline: "Information not publicly available.",
      package: "Information not publicly available.",
      notes: "Information not publicly available.",
      faqs: []
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6 overflow-y-auto">
        <div className="bg-[#0c101d] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar" onClick={(e) => e.stopPropagation()}>
          
          {/* Close button */}
          <button 
            onClick={() => setShowDetailsModal(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all z-20 cursor-pointer"
            title="Close Panel"
          >
            <FaTimes className="text-sm" />
          </button>

          {/* Modal Header Panel */}
          <div className="border-b border-slate-800/80 p-6 md:p-8 bg-slate-900/40 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex flex-col md:flex-row items-center gap-6 z-10">
              <div className="h-20 w-20 bg-white rounded-2xl p-3 flex items-center justify-center shadow-xl shrink-0">
                {logoError ? (
                  <span className="text-2xl font-black text-slate-800 uppercase">{companyName.charAt(0)}</span>
                ) : (
                  <img src={companyLogo} alt={companyName} className="max-h-full max-w-full object-contain" onError={() => setLogoError(true)} />
                )}
              </div>
              <div className="text-center md:text-left space-y-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full border bg-indigo-500/10 font-bold tracking-widest uppercase text-indigo-400 border-indigo-500/20">RECRUITER INTEL</span>
                <h2 className="text-3xl font-black text-white tracking-tight">{companyName} Recruitment Blueprint</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2.5 text-[10px] text-slate-400 pt-1">
                  <span className="bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">🏢 {info.headquarters}</span>
                  <span className="bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">💼 {info.industry}</span>
                  <span className="bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">📅 Founded: {info.founded}</span>
                  <span className="bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">👥 Employees: {info.employees}</span>
                </div>
              </div>
            </div>

            <a 
              href={info.careersUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="shrink-0 z-10 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
            >
              Official Careers <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>

          {/* Modal Content Panels */}
          <div className="p-6 md:p-8 space-y-8 overflow-y-auto no-scrollbar">
            
            {/* Overview & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Company Overview</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{info.overview}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Official Company Description</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{info.description}</p>
              </div>
            </div>

            {/* Hiring Eligibility & Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white border-b border-slate-800/80 pb-2">Hiring Drive Specifications & Eligibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Hiring Types</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.hiringType}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Campus Hiring Availability</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.availability}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Fresher Eligibility</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.eligibility}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Common Degrees Accepted</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.degrees}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Common CGPA Criteria</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.cgpa}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Typical Package Information</span>
                  <span className="text-slate-300 text-xs font-semibold">{info.package}</span>
                </div>
              </div>
            </div>

            {/* Typical Recruitment Pipeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white border-b border-slate-800/80 pb-2">Recruitment Pipeline & Rounds</h3>
              <div className="space-y-3">
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Typical Hiring Process</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{info.process}</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Typical Interview Rounds</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{info.rounds}</p>
                </div>
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role-wise Hiring Flow</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{info.flow}</p>
                </div>
              </div>
            </div>

            {/* Technical & Behavioral Topics */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white border-b border-slate-800/80 pb-2">Hiring Focus, Skills & Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Common Technical Topics</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.techTopics}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Skills Preferred</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.skillsPreferred}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Technologies Preferred</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.technologies}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Common Behavioral Topics</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.behavioralTopics}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Expected Resume Projects</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.projectsExpected}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Drive Timeline</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{info.timeline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation Tips & Important Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-800/80 pt-6">
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase text-emerald-400">💡 Preparation Tips</h4>
                <p className="text-slate-350 text-xs leading-relaxed">{info.prepTips}</p>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase text-amber-400">⚠️ Important Notes</h4>
                <p className="text-slate-350 text-xs leading-relaxed">{info.notes}</p>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-4 border-t border-slate-800/80 pt-6">
              <h3 className="text-sm font-black text-white">Frequently Asked Questions (FAQs)</h3>
              <div className="space-y-4">
                {info.faqs.map((faq, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">Q: {faq.q}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="border-t border-slate-800/80 p-5 bg-slate-900/20 text-center text-[10px] text-slate-500 font-mono">
            Information compiled from verifiable public job postings, placement brochures, and employee feedback.
          </div>

        </div>
      </div>
    );
  };

  // ── SELECTION TAB RENDER (CHOOSE TRACK -> CHOOSE ROLE) ──
  const renderSelectionScreen = () => {
    const isService = companySpec?.companyType === 'Service';

    return (
      <div className="mx-auto max-w-5xl space-y-8 py-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/companies')}
          className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium print:hidden"
        >
          <FaArrowLeft className="mr-2 text-xs" /> Back to Companies
        </button>

        {/* Company Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          <div className="h-24 w-24 bg-white rounded-2xl p-4 flex items-center justify-center shadow-xl shrink-0 z-10">
            {logoError ? (
              <span className="text-3xl font-black text-slate-800 uppercase">
                {companyName.charAt(0)}
              </span>
            ) : (
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="max-h-full max-w-full object-contain" 
                onError={() => setLogoError(true)} 
              />
            )}
          </div>
          <div className="flex-1 text-center md:text-left z-10 space-y-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{companyName} Campus Placement Portal</h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              {isService 
                ? `Step into the official digital recruitment pipeline for ${companyName}. Select a hiring track card to start your placement simulation drive.`
                : `Step into the official digital recruitment pipeline for ${companyName}. Select a hiring track card matching your desired package tier, choose your target engineering role, and begin.`
              }
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4 justify-center md:justify-start">
              <button 
                onClick={() => setShowDetailsModal(true)} 
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FaBriefcase /> Hiring Drive Details
              </button>
            </div>
          </div>
        </div>

        {/* 1. Track Cards Selection Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: companyColor }}></span>
            Step 1: Choose Your Hiring Track Tier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {companySpec.tracks.map((track) => {
              const isSelected = selectedTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  className={`rounded-2xl border p-6 cursor-pointer relative overflow-hidden transition-all group shadow-lg ${
                    isSelected
                      ? 'bg-slate-900 border-2 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                  style={isSelected ? { borderColor: companyColor } : {}}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl rounded-full pointer-events-none" style={{ backgroundColor: companyColor }}></div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-extrabold text-white group-hover:text-slate-200 transition-colors">{track.name}</h3>
                    <span className="text-[9px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">{track.difficulty}</span>
                  </div>
                  <div className="text-2xl font-black mb-5 tracking-tight" style={{ color: isSelected ? companyColor : '#FFFFFF' }}>{track.package}</div>
                  <div className="space-y-2 text-[11px] text-slate-400 border-t border-slate-900 pt-4">
                    <div className="flex justify-between"><span>Duration:</span><span className="text-white font-medium">{track.timeline}</span></div>
                    <div className="flex justify-between"><span>Criteria:</span><span className="text-white font-medium truncate block max-w-[120px]" title={track.eligibility}>{track.eligibility}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Role Selector (Dropdown opens upwards to prevent overlaps) - SKIP FOR SERVICE */}
        {selectedTrack && !isService && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: companyColor }}></span>
              Step 2: Select Target Job Role
            </h2>
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Job Role</label>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer flex justify-between items-center text-left"
              >
                <span>{selectedRole || '-- Choose Role --'}</span>
                <span className="text-[10px] text-slate-500">{isDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {isDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl py-1.5 max-h-60 overflow-y-auto shadow-2xl z-50">
                    <button
                      type="button"
                      onClick={() => { setSelectedRole(''); setIsDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-400 hover:bg-white/5 transition-colors"
                    >
                      -- Choose Role --
                    </button>
                    {ROLES_LIST.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => { setSelectedRole(role); setIsDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                          selectedRole === role ? 'bg-indigo-600/20 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{role}</span>
                        {selectedRole === role && <span className="text-indigo-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* 3. Launch Current Hiring Drive card summary */}
        {selectedTrack && (isService || selectedRole) && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm space-y-4">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Hiring Drive Package Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-0.5">Hiring Track</span>
                <span className="text-white font-bold">{selectedTrack.name}</span>
              </div>
              {!isService && (
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block mb-0.5">Designation</span>
                  <span className="text-white font-bold">{selectedRole}</span>
                </div>
              )}
              {isService && (
                <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                  <span className="text-slate-500 block mb-0.5">Role Allocation</span>
                  <span className="text-emerald-400 font-bold">Post-Selection</span>
                </div>
              )}
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-0.5">Package CTC</span>
                <span className="text-emerald-400 font-bold">{selectedTrack.package}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900">
                <span className="text-slate-500 block mb-0.5">Timeline Drive</span>
                <span className="text-white font-bold">{selectedTrack.timeline}</span>
              </div>
            </div>
            <button
              onClick={handleStartDrive}
              className="w-full py-4 text-xs font-black tracking-widest text-white uppercase rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10"
              style={{ backgroundColor: companyColor }}
            >
              {isService ? 'Start Placement Simulation & Unlock Pipeline' : 'Start Recruitment Challenge & Unlock Pipeline'}
            </button>
          </motion.div>
        )}
      </div>
    );
  };

  // ── ACTIVE PORTAL INTERFACE ──
  const renderActivePortal = () => {
    const isService = companySpec?.companyType === 'Service';
    const displayRoleLabel = isService 
      ? (allocatedRole ? allocatedRole : `Pending Allocation (${selectedTrack?.name})`)
      : selectedRole;

    // Smart locking indices mapping
    const isOALocked = currentPipelineStep < 1;
    const isTechLocked = currentPipelineStep < 2;
    const isHRLocked = currentPipelineStep < 3;
    const isReportLocked = currentPipelineStep < 4;

    const currentRoundLabel = companySpec.pipeline[currentPipelineStep]?.title || 'Hiring Drive Finished';

    return (
      <div className="mx-auto max-w-7xl space-y-6 py-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/companies')}
          className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium print:hidden"
        >
          <FaArrowLeft className="mr-2 text-xs" /> Back to Companies
        </button>

        {/* Dynamic Top Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60 p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl print:hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-center gap-6 z-10">
            <div className="h-16 w-16 bg-white rounded-xl p-2.5 flex items-center justify-center shadow shrink-0">
              {logoError ? (
                <span className="text-xl font-black text-slate-800 uppercase">
                  {companyName.charAt(0)}
                </span>
              ) : (
                <img 
                  src={companyLogo} 
                  alt={companyName} 
                  className="max-h-full max-w-full object-contain" 
                  onError={() => setLogoError(true)} 
                />
              )}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl font-black text-white leading-tight flex items-center gap-2 justify-center md:justify-start">
                {companyName} Drive
                <span className="text-xs px-2.5 py-0.5 rounded-full border bg-white/5 font-semibold text-slate-300 border-white/10">{selectedTrack?.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Targeting <strong className="text-slate-300">{displayRoleLabel}</strong> · Package: <strong className="text-emerald-400">{selectedTrack?.package}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1.5 justify-center md:justify-start">
                <span className="flex items-center gap-1"><FaBrain /> Difficulty: {selectedTrack?.difficulty}</span>
                <span className="flex items-center gap-1"><FaClock /> Time limit: {selectedTrack?.timeline}</span>
                <button 
                  onClick={() => setShowDetailsModal(true)} 
                  className="text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1.5 ml-2 cursor-pointer"
                >
                  <FaBriefcase className="text-[9px]" /> View Drive Details
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 md:gap-8 items-center text-center md:text-right shrink-0 z-10 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 w-full md:w-auto">
            <div className="flex-1 md:flex-initial">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold mb-1">Current Round</span>
              <span className="text-white font-extrabold text-sm whitespace-nowrap">{currentRoundLabel}</span>
            </div>
            <div className="flex-1 md:flex-initial border-l border-white/5 pl-4 md:pl-8">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold mb-1">Preparation Score</span>
              <span className="text-xl font-black font-mono" style={{ color: companyColor }}>{overallAvg}%</span>
            </div>
            <button onClick={handleResetDrive} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl transition-all" title="Reset Simulation">
              <FaUndo className="text-xs" />
            </button>
          </div>
        </div>

        {/* ── Sub Navigation Tabs (Dynamic Locks) ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-white/10 custom-scrollbar bg-slate-950 sticky top-0 z-10 pt-2 print:hidden">
          {(() => {
            const tabsList = [
              { id: 'dashboard', icon: FaStream, label: 'Hiring Pipeline', locked: false },
              { id: 'assessment', icon: FaLaptopCode, label: 'Online Assessment', locked: isOALocked },
              { id: 'qbank', icon: FaDatabase, label: 'Coding Bank', locked: false },
              { id: 'technical', icon: FaCode, label: 'Technical Interview', locked: isTechLocked },
              { id: 'hr', icon: FaUsers, label: 'HR Interview', locked: isHRLocked },
              { id: 'report', icon: FaAward, label: 'Offer & Report', locked: isReportLocked }
            ];
            if (isService) {
              tabsList.push(
                { id: 'training', icon: FaBrain, label: 'Training Program', locked: currentPipelineStep < 5 },
                { id: 'bu', icon: FaStream, label: 'BU Allocation', locked: currentPipelineStep < 6 },
                { id: 'role', icon: FaCheckCircle, label: 'Role Allocation', locked: currentPipelineStep < 7 }
              );
            }
            return tabsList.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={tab.locked}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-black transition-all whitespace-nowrap relative ${
                    tab.locked
                      ? 'opacity-40 cursor-not-allowed text-slate-600'
                      : isSelected
                        ? 'bg-white/10 text-white shadow-md'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                  style={isSelected ? { color: companyColor, borderBottom: `2px solid ${companyColor}` } : {}}
                >
                  <tab.icon />
                  {tab.label}
                  {tab.locked && <FaLock className="text-[10px] ml-1 text-slate-500" />}
                  {!tab.locked && tab.id !== 'dashboard' && tab.id !== 'qbank' && (
                    <FaCheckCircle className="text-[10px] ml-1 text-emerald-500" />
                  )}
                </button>
              );
            });
          })()}
        </div>

        <AnimatePresence mode="wait">
          {/* TAB CONTENT: PIPELINE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2"><FaBrain className="text-indigo-400" /> Drive Roadmap Timeline</h3>
                  <div className="relative pl-8 border-l border-slate-800/80 space-y-8">
                    {companySpec.pipeline.map((step, idx) => {
                      const isStepCompleted = idx < currentPipelineStep;
                      const isStepActive = idx === currentPipelineStep;
                      const isStepLocked = idx > currentPipelineStep;
                      const isLastStep = idx === companySpec.pipeline.length - 1;
                      const roundScore = scores[idx];

                      return (
                        <div key={step.id} className="relative">
                          {/* Stepper Circle */}
                          <div className={`absolute -left-[45px] top-1 w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs transition-all z-10 ${
                            isStepCompleted
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md'
                              : isStepActive
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg animate-pulse'
                                : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                          style={isStepActive ? { backgroundColor: companyColor, borderColor: companyColor } : {}}
                          >
                            {isStepCompleted ? <FaCheck className="text-[10px]" /> : isStepLocked ? <FaLock className="text-[10px]" /> : idx + 1}
                          </div>

                          {/* Round Details Card */}
                          <div className={`border rounded-3xl p-6 transition-all ${
                            isStepActive
                              ? 'bg-slate-900 border-slate-800 shadow-xl'
                              : isStepCompleted
                                ? 'bg-slate-900/40 border-slate-900/60 opacity-90'
                                : 'bg-slate-950/20 border-slate-950 opacity-40'
                          }`}>
                            {(() => {
                              const roundInfo = roundDetails[idx];
                              const hasFailed = roundInfo && roundInfo.passed === false;
                              const displayScore = scores[idx] !== undefined ? scores[idx] : (roundInfo?.score);

                              return (
                                <>
                                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                    <div>
                                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                        hasFailed
                                          ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                          : isStepCompleted
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : isStepActive
                                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                              : 'bg-slate-800/50 text-slate-500 border-slate-800'
                                      }`}>
                                        {hasFailed ? 'Failed / Action Required' : isStepCompleted ? 'Completed' : isStepActive ? 'Active Stage' : 'Locked'}
                                      </span>
                                      <h4 className="text-base font-black text-white mt-2 flex items-center gap-2">
                                        {step.title}
                                      </h4>
                                    </div>
                                    {displayScore !== undefined && (
                                      <div className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                                        hasFailed
                                          ? 'text-red-400 bg-red-500/10 border-red-500/25'
                                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                                      }`}>
                                        Score: {displayScore}%
                                      </div>
                                    )}
                                  </div>

                                  {/* Feedback & ATS Optimization Report */}
                                  {roundInfo && (
                                    <div className="mt-3 text-xs space-y-2.5 text-slate-400 border-t border-white/5 pt-3">
                                      <div>
                                        <span className="font-bold text-slate-400 block mb-1">Feedback Summary:</span>
                                        <p className="leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 text-slate-300 font-medium">
                                          {roundInfo.feedback}
                                        </p>
                                      </div>

                                      {/* Resume Failure: Detailed Report */}
                                      {step.id === 'resume' && !roundInfo.passed && (
                                        <div className="mt-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                                          <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                            <FaExclamationTriangle className="text-red-400 text-xs shrink-0" />
                                            Detailed ATS Optimization Report
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed">
                                            <div className="space-y-2">
                                              <h5 className="font-bold text-slate-200">❌ Layout & Formatting Issues</h5>
                                              <ul className="list-disc list-inside space-y-1 text-slate-400">
                                                <li>Multi-column format detected; parser failed to read standard chronology.</li>
                                                <li>Missing standard sections: 'Professional Summary' or 'Key Competencies'.</li>
                                                <li>No quantitative metric indicators found in work experience bullet points.</li>
                                              </ul>
                                            </div>
                                            <div className="space-y-2">
                                              <h5 className="font-bold text-slate-200">🔍 Missing Keywords ({companyName})</h5>
                                              <ul className="list-disc list-inside space-y-1 text-slate-400">
                                                {isService ? (
                                                  <>
                                                    <li>Analytical problem-solving frameworks, Excel data validation</li>
                                                    <li>SDLC methodology phases, relational DB design constraints</li>
                                                  </>
                                                ) : (
                                                  <>
                                                    <li>Distributed cache clustering, high-throughput message bus</li>
                                                    <li>Latency profiling, microservices design patterns, REST API schema</li>
                                                  </>
                                                )}
                                                <li>Standard libraries, complexity metrics (O(N) vs O(1))</li>
                                              </ul>
                                            </div>
                                          </div>

                                          <div className="pt-2 border-t border-red-500/10 flex justify-end">
                                            <button
                                              onClick={handleImproveResume}
                                              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95"
                                            >
                                              <FaSync className="text-[10px]" /> Improve & Re-submit Resume
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* OA Failure: Re-attempt warning */}
                                      {step.id === 'oa' && !roundInfo.passed && (
                                        <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
                                          <div className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                            <FaExclamationTriangle className="text-red-400 text-xs shrink-0" />
                                            Assessment Benchmark Not Cleared
                                          </div>
                                          <p className="text-[11px] text-slate-400 leading-relaxed">
                                            Your score of <strong className="text-red-400">{roundInfo.score}%</strong> falls below the target cutoff score of <strong className="text-white">60%</strong>.
                                            You must re-attempt and clear the assessment to unlock subsequent technical interview phases.
                                          </p>
                                          <div className="flex justify-end pt-1">
                                            <button
                                              onClick={() => { setActiveTab('assessment'); }}
                                              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 animate-pulse"
                                            >
                                              <FaLaptopCode className="text-[10px]" /> Re-attempt Assessment Room
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Active Action Triggers */}
                                  {isStepActive && (!roundInfo || roundInfo.passed) && (
                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                      {step.id === 'resume' && (
                                        <div className="space-y-4 w-full">
                                          <div className="flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 bg-slate-950/40 transition-all cursor-pointer relative overflow-hidden group">
                                            <input 
                                              type="file" 
                                              accept=".pdf" 
                                              onChange={(e) => { if(e.target.files?.[0]) setResumeFile(e.target.files[0]); }} 
                                              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                            />
                                            <FaUpload className="text-2xl text-slate-500 group-hover:text-indigo-400 mb-2 transition-all" />
                                            {resumeFile ? (
                                              <div className="text-center">
                                                <p className="text-xs font-bold text-white">{resumeFile.name}</p>
                                                <p className="text-[10px] text-slate-500">{(resumeFile.size / 1024).toFixed(0)} KB · Click to change file</p>
                                              </div>
                                            ) : (
                                              <div className="text-center">
                                                <p className="text-xs font-semibold text-slate-300">Drag & Drop or Click to Upload Resume</p>
                                                <p className="text-[10px] text-slate-500">PDF files only (Max 5MB)</p>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {resumeFile && (
                                            <button 
                                              onClick={handleVerifyResume} 
                                              disabled={resumeUploading}
                                              className="w-full py-3 rounded-xl text-xs font-black text-white flex justify-center items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-lg disabled:opacity-50" 
                                              style={{ backgroundColor: companyColor }}
                                            >
                                              {resumeUploading ? (
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                              ) : (
                                                <>
                                                  <FaUpload className="text-[10px]" /> Analyze & Verify Resume
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      {step.id === 'oa' && (
                                        <button onClick={() => { setActiveTab('assessment'); }} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                          <FaLaptopCode className="text-[10px]" /> Open Assessment Room
                                        </button>
                                      )}
                                      {step.id === 'tech' && (
                                        <button onClick={() => startInterviewRound(idx)} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                          <FaPlay className="text-[10px]" /> Start Technical Interview
                                        </button>
                                      )}
                                      {step.id === 'hr' && (
                                        <button onClick={() => startInterviewRound(idx)} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                          <FaPlay className="text-[10px]" /> Start HR Interview
                                        </button>
                                      )}
                                      {step.id === 'offer' && (
                                        <div className="space-y-2">
                                          <p className="text-[11px] text-slate-400">Congratulations! You have successfully cleared all selection rounds.</p>
                                          <button onClick={() => { setActiveTab('report'); }} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                            <FaAward className="text-[10px]" /> View Placement Offer Letter
                                          </button>
                                        </div>
                                      )}
                                      {step.id === 'training' && (
                                        <button onClick={() => { setActiveTab('training'); }} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                          <FaBrain className="text-[10px]" /> Start Training Modules
                                        </button>
                                      )}
                                      {step.id === 'bu' && (
                                        <button onClick={() => { setActiveTab('bu'); }} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                          <FaStream className="text-[10px]" /> Open Business Unit Allocation
                                        </button>
                                      )}
                                      {step.id === 'role' && (
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-emerald-400">🎉 Placement allocations finalized!</p>
                                          <button onClick={() => { setActiveTab('role'); }} className="px-6 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer" style={{ backgroundColor: companyColor }}>
                                            <FaCheckCircle className="text-[10px]" /> View Allocated Role Details
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Requirement and Readiness Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2"><FaLightbulb className="text-yellow-400" /> Target Competencies</h3>
                  <p className="text-xs text-slate-400">Preparation objectives configured for {displayRoleLabel} inside {selectedTrack?.name}:</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {companySpec.skills.map((skill, i) => (
                      <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-semibold flex items-center">
                        <span className="w-1 h-1 rounded-full bg-indigo-400 mr-2"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/40 border border-indigo-500/10 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-indigo-500/5 blur-xl rounded-full"></div>
                  <h4 className="font-bold text-white text-xs mb-2">Drive Tracking Metrics</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This interactive board tracks your placement compatibility score in real-time. Make sure to complete the rounds sequentially.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: ONLINE ASSESSMENT — Powered by Real Engine */}
          {activeTab === 'assessment' && (
            <motion.div key="assessment-tab" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="print:hidden">
              {/* ── PREMIUM LAUNCH BANNER ── */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-6"
                style={{ background: `linear-gradient(135deg, ${companyColor}15 0%, #0b1121 60%, ${companyColor}08 100%)` }}>
                {/* Glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 0% 50%, ${companyColor}25, transparent)` }} />
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: `${companyColor}12`, transform: 'translate(30%, -30%)' }} />

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                  {/* Left: Icon + heading */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-4"
                      style={{ color: companyColor, borderColor: `${companyColor}40`, backgroundColor: `${companyColor}12` }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: companyColor }} />
                      Real Assessment Engine • Powered by InterviewX AI
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">{companyName.toUpperCase()} Online Assessment</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">
                      Experience the <strong className="text-white">real {companyName} hiring workflow</strong> — sectional timers, 
                      question palette, AI proctoring, Monaco coding IDE, and authentic question patterns.
                      This is an original premium assessment experience, not a mock drill.
                    </p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {[
                        { icon: '🔒', label: 'Section Locking' },
                        { icon: '👁️', label: 'AI Proctoring' },
                        { icon: '⏱️', label: 'Sectional Timers' },
                        { icon: '💻', label: 'Monaco Coding IDE' },
                        { icon: '📊', label: 'Question Palette' },
                        { icon: '📈', label: 'Performance Report' },
                      ].map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                          {f.icon} {f.label}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => navigate(`/exam/${companyName.toLowerCase()}`)}
                      className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white text-base transition-all hover:scale-105 active:scale-100 shadow-2xl"
                      style={{ background: `linear-gradient(135deg, ${companyColor}, ${companyColor}cc)`, boxShadow: `0 8px 32px ${companyColor}60` }}
                    >
                      <FaPlay className="text-sm" />
                      Launch Assessment →
                    </button>
                  </div>

                  {/* Right: Stats preview */}
                  <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                    {[
                      { label: 'Assessment Tracks', value: isService ? '3 Tracks' : '2 Tracks', icon: '🛤️' },
                      { label: 'Question Types', value: 'MCQ + Coding', icon: '❓' },
                      { label: 'Avg. Duration', value: isService ? '90 Min' : '120 Min', icon: '⏳' },
                      { label: 'Cutoff System', value: 'Sectional', icon: '✂️' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
                        <span className="text-xl">{s.icon}</span>
                        <div>
                          <div className="text-xs text-slate-500">{s.label}</div>
                          <div className="text-sm font-bold text-white">{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Track preview cards */}
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Available Tracks</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(isService
                  ? [
                      { name: `${companyName} Foundation / NQT`, sections: 'Numerical • Verbal • Reasoning', time: '90 min', tag: 'Mass Hiring' },
                      { name: `${companyName} Digital`, sections: 'Aptitude • Technical • Coding', time: '120 min', tag: 'Tech Track' },
                      { name: `${companyName} Prime / Advanced`, sections: 'Advanced Quant • DSA • Coding', time: '150 min', tag: 'Premium Track' },
                    ]
                  : [
                      { name: `${companyName} Online Assessment`, sections: 'DSA • LLD • Problem Solving', time: '90 min', tag: 'SDE' },
                      { name: `${companyName} Technical Screen`, sections: 'Systems • Algorithms • Debugging', time: '120 min', tag: 'SDE II+' },
                    ]
                ).map((track, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/exam/${companyName.toLowerCase()}`)}
                    className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all hover:border-white/20 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${companyColor}20`, color: companyColor }}>
                        {track.tag}
                      </span>
                      <FaChevronRight className="text-slate-600 group-hover:text-slate-400 transition-all text-xs" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{track.name}</h4>
                    <p className="text-slate-500 text-xs mb-3">{track.sections}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <FaClock className="text-[10px]" /> {track.time}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}
          {/* TAB CONTENT: QUESTION BANK */}
          {activeTab === 'qbank' && (
            <motion.div key="qbank-tab" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 print:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Coding Question Bank</h3>
                  <p className="text-xs text-slate-400 mt-1">Recommended coding problems matching {selectedRole} standards:</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { title: 'Reverse a Linked List', diff: 'Medium', topics: ['Linked Lists', 'Pointers'] },
                  { title: 'Merge Intervals', diff: 'Medium', topics: ['Arrays', 'Sorting'] },
                  { title: 'Valid Parentheses', diff: 'Easy', topics: ['Stacks', 'Strings'] },
                  { title: 'LRU Cache Design', diff: 'Hard', topics: ['Design', 'Hash Table'] },
                  { title: 'Binary Tree Level Order Traversal', diff: 'Easy', topics: ['Trees', 'BFS'] },
                  { title: 'Edit Distance (Levenshtein)', diff: 'Hard', topics: ['Dynamic Programming'] }
                ].map((q, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-white/5 bg-slate-900 hover:border-slate-800 transition-all flex flex-col justify-between h-36">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          q.diff === 'Hard' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          q.diff === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>{q.diff}</span>
                        <FaCode className="text-slate-600 text-sm" />
                      </div>
                      <h4 className="font-bold text-sm text-white">{q.title}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {q.topics.map(t => (
                        <span key={t} className="text-[9px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-900">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: TECHNICAL INTERVIEW */}
          {activeTab === 'technical' && (
            <motion.div key="tech-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="print:hidden">
              {interviewActive ? (
                <div className="flex flex-col lg:flex-row h-[600px] rounded-2xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                  {/* Left Chat view */}
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40">
                    <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30">
                          <FaRobot className="text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">AI Panelist (Technical)</h4>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">● Simulated Chat Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                              : 'bg-slate-950 text-slate-200 rounded-bl-none border border-slate-900'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                        placeholder="Type your technical response..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      <button onClick={handleChatSend} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all">
                        <FaPaperPlane className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl border border-white/5 bg-slate-900 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-inner"><FaUserTie /></div>
                  <h3 className="text-xl font-bold text-white">Technical Interview Round</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test your expertise in dynamic systems, database normalization, and algorithms tailored for the {selectedRole} role.
                  </p>
                  <button onClick={() => startInterviewRound(currentPipelineStep)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: companyColor }}>
                    Launch Chat Interview
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: HR INTERVIEW */}
          {activeTab === 'hr' && (
            <motion.div key="hr-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="print:hidden">
              {interviewActive ? (
                <div className="flex flex-col lg:flex-row h-[600px] rounded-2xl border border-white/10 overflow-hidden bg-slate-900 shadow-2xl">
                  {/* Left Chat view */}
                  <div className="flex-1 flex flex-col min-h-0 bg-slate-900/40">
                    <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30">
                          <FaRobot className="text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">AI Panelist (HR & Values)</h4>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">● Simulated Chat Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                              : 'bg-slate-950 text-slate-200 rounded-bl-none border border-slate-900'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleChatSend(); }}
                        placeholder="Type your behavioral response..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      />
                      <button onClick={handleChatSend} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all">
                        <FaPaperPlane className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl border border-white/5 bg-slate-900 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto text-3xl shadow-inner"><FaUsers /></div>
                  <h3 className="text-xl font-bold text-white">HR & Management Discussion</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluate your behavioral compatibility, leadership values, and communication clarity under stress.
                  </p>
                  <button onClick={() => startInterviewRound(currentPipelineStep)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: companyColor }}>
                    Launch Chat Interview
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB CONTENT: PLACEMENT OFFER LETTER & HIRING COMMITTEE SIMULATION */}
          {activeTab === 'report' && (() => {
            // ─── Score Metrics Setup ───
            const resumeVal = scores[0] || 75;
            const assessmentVal = scores[1] || 78;
            const technicalVal = scores[2] || 82;
            const hrVal = scores[3] || 80;
            const codingVal = scores[2] || 85;
            const projectVal = 82;

            const completedIndices = Object.keys(scores).map(Number);
            const totalComps = completedIndices.length;
            const sumS = completedIndices.reduce((sum, idx) => sum + (scores[idx] || 0), 0);
            const calculatedAvg = totalComps > 0 ? Math.round(sumS / totalComps) : 80;
            
            const overallHiringScore = calculatedAvg;
            const hiringConfidence = Math.max(45, Math.min(99, Math.round(overallHiringScore * 1.04 - (overallHiringScore < 60 ? 12 : 0))));

            // Determine outcome statuses
            const isHired = overallHiringScore >= 60;
            const isWaitlisted = overallHiringScore >= 50 && overallHiringScore < 60;
            const isRejected = overallHiringScore < 50;

            // Decision Labels
            let decisionLabel = '';
            if (isService) {
              decisionLabel = isHired 
                ? (overallHiringScore >= 85 ? 'Selected with Recommendation' : 'Selected')
                : (isWaitlisted ? 'Waitlisted' : 'Rejected');
            } else {
              decisionLabel = isHired
                ? (overallHiringScore >= 85 ? 'Strong Hire' : 'Hire')
                : (isWaitlisted ? 'Borderline Hire' : 'No Hire');
            }

            // Recruiter Comments Builder
            const comments = [];
            if (resumeVal >= 80) comments.push("Resume exhibits exceptional ATS keyword matches and core framework skills.");
            else if (resumeVal >= 60) comments.push("Resume meets baseline technical skills; could improve quantitative impact.");
            else comments.push("Resume lacks project architecture depth. Needs more structural tech keywords.");

            if (assessmentVal >= 80) comments.push("Strong performance in quantitative aptitude and computational sections.");
            else if (assessmentVal >= 60) comments.push("Cleared assessment cutoffs; minor speed bottlenecks in reasoning sections.");
            else comments.push("Struggled in quantitative logic. Below-benchmark math speed observed.");

            if (technicalVal >= 80) comments.push("Exceptional algorithmic coding ability. Candidate design structures are modular.");
            else if (technicalVal >= 60) comments.push("Good technical fundamentals, though needs minor syntax optimization checks.");
            else comments.push("Weakness in database indexes and OS memory boundaries was noted.");

            if (hrVal >= 80) comments.push("Outstanding communication and alignment with core organizational values.");
            else if (hrVal >= 60) comments.push("Communicates logic clearly; minor presence of vocal filler words under stress.");
            else comments.push("Lacked conviction when explaining project challenges. Needs mock interview practice.");

            // Risk Factors
            const risks = [];
            if (hrVal < 80) risks.push("Minor vocal fillers observed under interview stress.");
            if (codingVal < 80) risks.push("Edge boundary memory check omitted in technical round.");
            if (resumeVal < 70) risks.push("Resume metrics could benefit from quantitative data values.");
            if (risks.length === 0) risks.push("None identified. Outstanding candidacy profile.");

            // Unlocked Badges list
            const badges = [];
            if (assessmentVal >= 80) badges.push({ name: 'Assessment Master', icon: '🏆', desc: 'Scored high on quantitative sections.' });
            if (codingVal >= 85) badges.push({ name: 'Coding Expert', icon: '💻', desc: 'Delivered optimized compiler solutions.' });
            if (hrVal >= 80) badges.push({ name: 'Excellent Communicator', icon: '🗣️', desc: 'High verbal delivery scoring.' });
            if (technicalVal >= 80) badges.push({ name: 'Problem Solver', icon: '⚙️', desc: 'Resolved complex design problems.' });
            if (overallHiringScore >= 75) badges.push({ name: 'AI Recommended', icon: '🤖', desc: 'Clears target consensus thresholds.' });
            if (overallHiringScore >= 85) badges.push({ name: 'Strong Hire', icon: '🌟', desc: 'Exceptional review scorecard.' });

            // Company brand parameters
            const isAmazon = companyName.toLowerCase().includes('amazon');
            const isGoogle = companyName.toLowerCase().includes('google');
            const isMicrosoft = companyName.toLowerCase().includes('microsoft');
            const isNvidia = companyName.toLowerCase().includes('nvidia');
            const isJpmc = companyName.toLowerCase().includes('jpmorgan') || companyName.toLowerCase().includes('jp');

            return (
              <motion.div key="report-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                
                {hiringCommitteeStatus === 'convening' ? (
                  /* ─── HIRING COMMITTEE CONVENING SCREEN ─── */
                  <div className="max-w-xl mx-auto bg-slate-900/60 border border-white/10 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${companyColor}12, transparent)` }} />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed border-t-indigo-500 animate-spin flex items-center justify-center mx-auto mb-2" style={{ borderColor: `rgba(99,102,241,0.2)`, borderTopColor: companyColor }}>
                        <FaUsers className="w-8 h-8 text-indigo-400 animate-pulse" style={{ color: companyColor }} />
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400" style={{ color: companyColor }}>Hiring Committee Room</span>
                        <h2 className="text-xl font-bold text-white mt-1">Convening Recruitment Panel</h2>
                        <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                          Global Talent Directors and Senior Engineering Panelists at <strong className="text-white">{companyName}</strong> are reviewing your technical scorecard, coding logic, and HR feedback.
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2 max-w-xs mx-auto">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold font-mono">
                          <span>Board Assessment Status</span>
                          <span>{committeeProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-150" style={{ width: `${committeeProgress}%`, backgroundColor: companyColor }} />
                        </div>
                      </div>

                      {/* Logs feed */}
                      <div className="h-10 text-[11px] font-mono text-slate-500 italic max-w-xs mx-auto flex items-center justify-center">
                        {committeeProgress < 25 && "Loading final round metrics..."}
                        {committeeProgress >= 25 && committeeProgress < 50 && "Parsing coding optimizations & DSA scores..."}
                        {committeeProgress >= 50 && committeeProgress < 75 && "Reviewing Googliness & Leadership values alignment..."}
                        {committeeProgress >= 75 && committeeProgress < 100 && "Writing dynamic consensus recommendation..."}
                        {committeeProgress === 100 && "Finalizing decision details..."}
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setHiringCommitteeStatus('resolved');
                            saveStateToStorage({ hiringCommitteeStatus: 'resolved' });
                          }}
                          className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-black text-slate-300 rounded-xl transition-all"
                        >
                          Skip Board Review
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ─── RESOLVED RECRUITER BOARD DASHBOARD ─── */
                  <div className="space-y-6">
                    
                    {/* Outcome Status Banner */}
                    <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden`}
                      style={{ 
                        backgroundColor: isHired ? 'rgba(16,185,129,0.05)' : isWaitlisted ? 'rgba(245,158,11,0.05)' : 'rgba(239,68,68,0.05)',
                        borderColor: isHired ? 'rgba(16,185,129,0.2)' : isWaitlisted ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                      }}
                    >
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Board Consensus Decision</span>
                        <h2 className={`text-2xl font-black mt-1 ${isHired ? 'text-emerald-400' : isWaitlisted ? 'text-amber-400' : 'text-red-400'}`}>
                          {decisionLabel.toUpperCase()}
                        </h2>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {isHired 
                            ? `Congratulations! The hiring committee has approved your engineering appointment at ${companyName}.` 
                            : isWaitlisted 
                            ? `Your application is currently waitlisted. Recruitment teams will review project pools.` 
                            : `We regret to inform you that you did not clear the hiring thresholds this time.`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <FaPrint /> Print Board Report
                        </button>
                      </div>
                    </div>

                    {/* Dashboard Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Scorecard & dynamic profiles */}
                      <div className="lg:col-span-5 space-y-6">
                        
                        {/* Scorecard */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Grading Scorecard</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                              <span className="text-[10px] text-slate-500 block mb-1">Hiring Score</span>
                              <span className="text-3xl font-black text-white" style={{ color: companyColor }}>{overallHiringScore}%</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                              <span className="text-[10px] text-slate-500 block mb-1">Panel Confidence</span>
                              <span className="text-3xl font-black text-white">{hiringConfidence}%</span>
                            </div>
                          </div>

                          <div className="space-y-3.5">
                            {[
                              { label: 'Technical Interview', val: technicalVal },
                              { label: 'Coding Assessment', val: codingVal },
                              { label: 'HR / Behavioral', val: hrVal },
                              { label: 'Resume Profile', val: resumeVal }
                            ].map((s, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                  <span className="text-slate-400">{s.label}</span>
                                  <span className="text-slate-200">{s.val}%</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.val}%`, backgroundColor: companyColor }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recruiter comments panel */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Recruiter Committee Notes</h3>
                          <div className="space-y-3">
                            {comments.map((comment, i) => (
                              <div key={i} className="text-xs text-slate-300 leading-relaxed bg-white/[0.01] border border-white/5 p-3 rounded-xl flex gap-2 items-start">
                                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                                <span>{comment}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Factors */}
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Observed Risk Factors</h3>
                          <div className="space-y-2">
                            {risks.map((risk, i) => (
                              <div key={i} className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex gap-2 items-center">
                                <FaExclamationTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{risk}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Badges unlocked */}
                        {badges.length > 0 && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Unlocked Badges</h3>
                            <div className="flex flex-wrap gap-2">
                              {badges.map((b, i) => (
                                <div key={i} className="bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl text-center flex items-center gap-2 max-w-[200px]" title={b.desc}>
                                  <span className="text-lg">{b.icon}</span>
                                  <div className="text-left">
                                    <span className="text-[10px] font-black text-white block">{b.name}</span>
                                    <span className="text-[9px] text-slate-500 block truncate">{b.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Right: Decision outcomes (Offer / Waitlist / Rejection) */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* ── SELECTED EXPERIENCE (OFFER LETTER) ── */}
                        {isHired && (
                          <div className="space-y-6">
                            
                            {/* Premium digital offer letter layout */}
                            <div className={`p-8 md:p-12 rounded-3xl relative overflow-hidden font-serif border`}
                              style={{ 
                                backgroundColor: isGoogle ? '#fafafa' : isAmazon ? '#0a1121' : isMicrosoft ? '#0f172a' : isNvidia ? '#020617' : isJpmc ? '#0d0d12' : '#ffffff',
                                color: (isAmazon || isMicrosoft || isNvidia || isJpmc) ? '#f8fafc' : '#0f172a',
                                borderColor: (isAmazon || isMicrosoft || isNvidia || isJpmc) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                              }}
                            >
                              {/* Decorative seal/borders for product specs */}
                              {isJpmc && <div className="absolute top-8 right-8 w-16 h-16 rounded-full border-4 border-[#c19b4a] opacity-30 flex items-center justify-center font-sans font-black text-[10px] text-[#c19b4a]">JPMC</div>}
                              {isAmazon && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />}

                              {/* Company Logo and Header */}
                              <div className="flex justify-between items-start border-b pb-6" style={{ borderColor: (isAmazon || isMicrosoft || isNvidia || isJpmc) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <div className="font-sans">
                                  <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: (isGoogle || isService) ? '#0f172a' : (isAmazon ? '#ff9900' : isNvidia ? '#76b900' : isJpmc ? '#c19b4a' : '#6366f1') }}>
                                    {companyName.toUpperCase()}
                                  </h1>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Campus Engineering Operations Division</p>
                                </div>
                                <img src={companyLogo} alt={companyName} className="h-9 object-contain" />
                              </div>

                              {/* Date & Ref */}
                              <div className="flex justify-between text-[11px] font-sans text-slate-400 mt-4">
                                <span>Ref: CHR/{companyName.substring(0,3).toUpperCase()}/2026/LOI</span>
                                <span>Date: July 21, 2026</span>
                              </div>

                              {/* Subject line */}
                              <div className="text-center font-bold text-xs underline pt-4 uppercase tracking-wide font-sans">
                                Subject: Letter of Intent and Internship Offer
                              </div>

                              {/* Offer Letter Body */}
                              <div className="text-xs space-y-4 text-justify leading-relaxed mt-4">
                                <p>Dear Kumar Chirag,</p>
                                {isService ? (
                                  <>
                                    <p>
                                      Following the evaluation of your performance in the multi-stage {companyName} campus recruitment drives for the target track <strong>{selectedTrack?.name}</strong>, we are pleased to offer you an opportunity to join our engineering division as an <strong>Engineering Associate</strong>.
                                    </p>
                                    <p>
                                      Upon formal validation of your scores (Cumulative average score: <strong>{overallHiringScore}%</strong>), you are invited to join our structured <strong>Graduate Training Program</strong>. Your final designation and project unit allocation will be determined dynamically based on track tier, training modules assessment, and AI fitment matching.
                                    </p>
                                    <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 font-sans text-white">
                                      <span className="text-[9px] uppercase font-black tracking-wider text-slate-500">Service Placement Allocations</span>
                                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                        <div><strong>Training Program:</strong> {companyName} Velocity</div>
                                        <div><strong>Hiring Track:</strong> {selectedTrack?.name}</div>
                                        <div><strong>Compensation Package:</strong> {selectedTrack?.package}</div>
                                        <div><strong>Allocated BU:</strong> {allocatedBU || 'BFSI (Banking Services)'}</div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p>
                                      Following the evaluation of your performance in the multi-stage {companyName} placement simulation rounds for the <strong>{selectedRole || 'SDE Intern'}</strong> position (Hiring track: <strong>{selectedTrack?.name}</strong>), we are pleased to offer you an opportunity to join our engineering division.
                                    </p>
                                    <p>
                                      Upon formal validation of your scores (Cumulative average score: <strong>{overallHiringScore}%</strong>), you will be assigned to a project team with a package compensation of <strong>{selectedTrack?.package}</strong> per annum. Your joining location and orientation calendar will be issued dynamically upon completion of university requirements.
                                    </p>
                                    <div className="p-4 rounded-xl space-y-2 font-sans" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                      <span className="text-[9px] uppercase font-black tracking-wider text-indigo-400" style={{ color: companyColor }}>Product SDE Appointment Details</span>
                                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                                        <div><strong>Engineering Role:</strong> {selectedRole || 'Software Development Engineer'}</div>
                                        <div><strong>Compensation Package:</strong> {selectedTrack?.package}</div>
                                        <div><strong>Engineering Team:</strong> {isAmazon ? 'AWS Cloud Infrastructure' : isGoogle ? 'Search Ranking Engine' : isMicrosoft ? 'Azure Core Systems' : isNvidia ? 'CUDA Kernels Compiler' : isJpmc ? 'Distributed Asset Ledger' : 'SDE Platform Core'}</div>
                                        <div><strong>Joining Location:</strong> Bengaluru Development Center</div>
                                      </div>
                                    </div>
                                  </>
                                )}
                                <p>We welcome you to {companyName} and wish you a highly collaborative and learning-focused career path ahead.</p>
                              </div>

                              {/* Signatures block */}
                              <div className="flex justify-between pt-10 text-[11px] font-sans border-t mt-8" style={{ borderColor: (isAmazon || isMicrosoft || isNvidia || isJpmc) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                <div className="text-left space-y-1">
                                  <div className="h-8 w-24 border-b border-slate-300 opacity-60"></div>
                                  <span className="block font-bold">Candidate Signature</span>
                                </div>
                                <div className="text-right space-y-1">
                                  <div className="h-8 w-24 border-b border-slate-300 opacity-60 flex items-center justify-end font-mono italic text-[10px] text-slate-400">{companyName} TA</div>
                                  <span className="block font-bold">Authorized Signatory</span>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                        {/* ── WAITLIST EXPERIENCE ── */}
                        {isWaitlisted && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                            <div className="flex items-center gap-3 text-amber-400">
                              <AlertCircle className="w-8 h-8" />
                              <div>
                                <h3 className="font-bold text-white text-base">Waitlisted Placement Status</h3>
                                <p className="text-xs text-slate-400">Hiring committee consensus is currently borderline.</p>
                              </div>
                            </div>

                            <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className="text-slate-400">Probability of Project Allocation</span>
                                <span className="text-amber-400 text-sm font-black">{Math.round(overallHiringScore * 1.15)}%</span>
                              </div>
                              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round(overallHiringScore * 1.15)}%` }} />
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">
                                Candidates in the waitlist block are matched against corporate vacancy rates in August. To improve your conversion probabilities, we recommend completing the suggested practice exercises.
                              </p>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Suggested Improvement Path</h4>
                              {[
                                'Complete remaining coding problems inside the SDE Question Bank.',
                                'Optimize array loops and pointers algorithms to minimize risk flags.',
                                'Refine resume descriptions to highlight quantitative project metrics.'
                              ].map((item, idx) => (
                                <div key={idx} className="text-xs text-slate-300 bg-white/[0.01] border border-white/5 p-3 rounded-xl flex gap-2">
                                  <span className="text-amber-400">•</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ── REJECTION EXPERIENCE ── */}
                        {isRejected && (
                          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                            <div className="flex items-center gap-3 text-red-400">
                              <X className="w-8 h-8" />
                              <div>
                                <h3 className="font-bold text-white text-base">Hiring Thresholds Not Cleared</h3>
                                <p className="text-xs text-slate-400">Below benchmark scorecard detected.</p>
                              </div>
                            </div>

                            {/* Benchmark comparison Table */}
                            <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl space-y-4">
                              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Hiring Cutoffs Comparison</span>
                              
                              <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-white/5 text-slate-500">
                                    <th className="pb-2">Evaluation Stage</th>
                                    <th className="pb-2 text-center">Your Score</th>
                                    <th className="pb-2 text-center">Benchmark Required</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { name: 'Online Assessment', score: assessmentVal, cutoff: 75 },
                                    { name: 'Technical Interview', score: technicalVal, cutoff: 80 },
                                    { name: 'HR / Behavioral', score: hrVal, cutoff: 75 }
                                  ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                      <td className="py-2.5 text-slate-300 font-semibold">{row.name}</td>
                                      <td className={`py-2.5 text-center font-bold ${row.score >= row.cutoff ? 'text-emerald-400' : 'text-red-400'}`}>{row.score}%</td>
                                      <td className="py-2.5 text-center text-slate-500">{row.cutoff}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weak Areas &amp; Improvement Roadmap</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                                  <span className="text-[10px] text-slate-500 font-bold block">Missed Parameters</span>
                                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                                    <li>• Low-level OS pointer structures</li>
                                    <li>• Database index performance queries</li>
                                    <li>• Vocal speech clarity under stress</li>
                                  </ul>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                                  <span className="text-[10px] text-slate-500 font-bold block">Suggested Practice Plan</span>
                                  <ul className="space-y-1.5 text-[11px] text-slate-400">
                                    <li>• SDE coding simulator: 4 Weeks</li>
                                    <li>• Database normalizations: 2 Weeks</li>
                                    <li>• Mock speech interviews: 2 Weeks</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                              <span className="text-slate-500">Suggested retry readiness timeline: 8 Weeks</span>
                              <button
                                onClick={() => {
                                  // Clear scores so they can re-attempt
                                  setScores({});
                                  setRoundDetails({});
                                  setHiringCommitteeStatus('convening');
                                  saveStateToStorage({ scores: {}, roundDetails: {}, currentPipelineStep: 0, hiringCommitteeStatus: 'convening' });
                                  toast.success('Simulation reset. You can now re-upload resume and retake assessment!');
                                  setActiveTab('dashboard');
                                }}
                                className="px-5 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl text-red-400 font-bold transition-all cursor-pointer"
                              >
                                Reset &amp; Retry Simulation
                              </button>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  </div>
                )}

              </motion.div>
            );
          })()}

          {/* TAB CONTENT: SERVICE TRAINING PROGRAM */}
          {activeTab === 'training' && (
            <motion.div key="training-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <FaBrain className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Graduate Training Academy</h3>
                    <p className="text-xs text-slate-400">Complete curriculum modules to finalize your candidate assessment parameters.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {[
                    { title: 'Enterprise Coding', desc: 'Focuses on scalable architectures, database design and API security.', status: 'Completed' },
                    { title: 'Cloud & DevOps', desc: 'Enterprise deployment pipelines, Dockerization, and server monitoring.', status: 'Completed' },
                    { title: 'Professional Communication', desc: 'Client engagement models, Agile values, and collaborative software delivery.', status: 'Completed' }
                  ].map((mod, i) => (
                    <div key={i} className="border border-slate-800/80 bg-slate-950/40 p-5 rounded-2xl space-y-2.5 relative">
                      <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-bold">
                        {mod.status}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-1">{mod.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{mod.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800/80 pt-6 space-y-4">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold">
                    <span>Training Simulation Progress</span>
                    <span className="text-indigo-400">{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-900 overflow-hidden">
                    <motion.div 
                      className="bg-indigo-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${trainingProgress}%` }}
                      transition={{ ease: 'easeOut' }}
                    ></motion.div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={isTrainingRunning}
                      onClick={handleStartTraining}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-55"
                    >
                      {isTrainingRunning ? 'Simulating Curriculum...' : 'Complete Training Modules & Unlock Allocation'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: BUSINESS UNIT ALLOCATION */}
          {activeTab === 'bu' && (
            <motion.div key="bu-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                    <FaStream className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Business Unit Allocation</h3>
                    <p className="text-xs text-slate-400">The corporate allocation algorithm assigns candidates to domain verticals based on project requirements.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 text-center">
                  {[
                    { label: '🏦 BFSI', val: 'Banking & Finance' },
                    { label: '🛒 Retail', val: 'E-commerce & Logistics' },
                    { label: '🧬 Life Sciences', val: 'Healthcare & Pharma' },
                    { label: '☁️ Cloud Platform', val: 'Systems & Infrastructure' },
                    { label: '🔒 Cybersecurity', val: 'SecOps & Engineering' }
                  ].map((unit, i) => {
                    const isRollingMatched = buRollLabel.includes(unit.label.split(' ')[1]);
                    return (
                      <div 
                        key={i} 
                        className={`p-4 rounded-xl border transition-all ${
                          isRollingMatched 
                            ? 'bg-indigo-600/10 border-indigo-500 shadow-md scale-105' 
                            : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                        }`}
                      >
                        <div className="text-lg mb-1">{unit.label.split(' ')[0]}</div>
                        <h4 className="font-bold text-[10px] text-white tracking-tight">{unit.label.split(' ').slice(1).join(' ')}</h4>
                        <p className="text-[9px] text-slate-500 mt-1">{unit.val}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800/80 pt-6 space-y-4">
                  {allocatedBU ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                      <span className="text-xs text-slate-400">Project Allocation Finalized:</span>
                      <h4 className="text-lg font-black text-emerald-400 mt-1">{allocatedBU}</h4>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-850 text-center text-xs text-slate-400 italic">
                      {isAllocatingBU ? `Running allocation engine: ${buRollLabel}` : 'Click the button below to execute the allocation engine.'}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={isAllocatingBU || allocatedBU}
                      onClick={handleRunBUAllocation}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-55"
                    >
                      {isAllocatingBU ? 'Running Allocation Engine...' : allocatedBU ? 'Allocation Finalized' : 'Execute Business Unit Allocation'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB CONTENT: FINAL ROLE ALLOCATION */}
          {activeTab === 'role' && (
            <motion.div key="role-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-4 text-emerald-400">
                  <FaCheckCircle className="text-4xl" />
                  <div>
                    <h3 className="text-xl font-bold text-white">Final Placement Allocation Finalized</h3>
                    <p className="text-xs text-slate-400">Your professional designation and division vertical have been finalized.</p>
                  </div>
                </div>

                <div className="border border-slate-850 bg-slate-950/40 rounded-2xl p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Assigned Job Designation</span>
                      <span className="text-white font-extrabold text-base block">{allocatedRole || 'Generating...'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Allocated Business Unit (BU)</span>
                      <span className="text-white font-extrabold text-base block">{allocatedBU || 'Generating...'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Placement Track Tier</span>
                      <span className="text-indigo-400 font-extrabold text-base block">{selectedTrack?.name} ({selectedTrack?.package})</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Cumulative Placement Score</span>
                      <span className="text-emerald-400 font-extrabold text-base block">{overallAvg}%</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-4 space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">AI Fitment Recommendation</span>
                    <p className="text-slate-300 text-xs leading-relaxed italic">
                      "Based on the candidate's exceptional performance in the cognitive assessments (overall average score {overallAvg}%) and structural technical suitability demonstrated in interviews, the candidate is allocated as a {allocatedRole} in the {allocatedBU} vertical. They demonstrate strong competence and high resource potential."
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => { setActiveTab('dashboard'); }} className="px-6 py-2.5 bg-slate-850 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all">
                    Return to Timeline
                  </button>
                  <button onClick={() => { setActiveTab('report'); }} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all">
                    View Placement LOI
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden print:bg-white print:text-black">
      {/* Background blobs (Hidden on Print) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden print:hidden">
        <div className="absolute top-[10%] left-[20%] w-[380px] h-[380px] rounded-full opacity-[0.03] blur-[100px]" style={{ backgroundColor: companyColor }}></div>
        <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] rounded-full opacity-[0.03] blur-[120px]" style={{ backgroundColor: companyColor }}></div>
      </div>

      <Sidebar />

      {/* ── Main Container ── */}
      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden print:pl-0 print:h-auto print:overflow-visible">
        <Navbar title={`${companyName} Placement Portal`} subtitle={`${companyName} recruitment simulation drives`} />

        <main className="flex-grow overflow-y-auto no-scrollbar px-4 md:px-8 pb-16 pt-4 print:p-0 print:overflow-visible">
          {isDriveActive ? renderActivePortal() : renderSelectionScreen()}
        </main>

        {showDetailsModal && renderDetailsModal()}
      </div>
    </div>
  );
};

export default CompanyDetail;
