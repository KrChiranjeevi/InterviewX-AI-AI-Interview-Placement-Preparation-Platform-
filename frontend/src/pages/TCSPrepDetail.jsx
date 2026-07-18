import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  FaArrowLeft, FaCheckCircle, FaLock, FaBuilding,
  FaUndo, FaClock, FaCheck, FaAward, FaSlidersH, FaBrain,
  FaTimesCircle, FaTrophy, FaLightbulb, FaBriefcase, FaChevronDown, 
  FaChevronUp, FaCode, FaRobot, FaUsers, FaLaptopCode, FaUpload, 
  FaTerminal, FaSync, FaExclamationTriangle, FaPaperPlane, FaUserTie, FaPlay, FaChartLine, FaMinus, FaPlus,
  FaUserLock, FaDatabase, FaServer, FaCogs, FaAward as FaBadge
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

// TCS Brand Colors
const TCS_BLUE = '#002b49';
const NQT_BLUE = '#0080ff';

const TCS_CATEGORIES = [
  {
    name: 'TCS Prime',
    packageRange: '9.0 LPA',
    difficulty: 'Hard',
    expectedSkills: 'Advanced System Architecture, ML/AI Stack, Distributed Compute, Parallel Processing',
    codingLevel: 'Hard (2 Questions)',
    interviewDifficulty: 'Very Hard',
    eligibility: 'B.E/B.Tech/M.E/M.Tech (CGPA >= 8.0)',
    prepTime: '4-6 Weeks',
    selectionRatio: '1.5%'
  },
  {
    name: 'TCS Digital',
    packageRange: '7.0 - 7.5 LPA',
    difficulty: 'Medium-Hard',
    expectedSkills: 'Enterprise Cloud Stack, Full Stack Architectures, Advanced DBMS, Automation Engineering',
    codingLevel: 'Medium-Hard (2 Questions)',
    interviewDifficulty: 'Hard',
    eligibility: 'B.E/B.Tech/M.E/M.Tech/MCA (CGPA >= 7.0)',
    prepTime: '3-4 Weeks',
    selectionRatio: '4.5%'
  },
  {
    name: 'TCS Ninja',
    packageRange: '3.3 - 3.6 LPA',
    difficulty: 'Medium',
    expectedSkills: 'Core Java/C++, Basic SQL Database Queries, Software Lifecycle fundamentals',
    codingLevel: 'Medium (1-2 Questions)',
    interviewDifficulty: 'Medium',
    eligibility: 'All Engineering Graduates (CGPA >= 6.0)',
    prepTime: '1-2 Weeks',
    selectionRatio: '15.0%'
  }
];

const TCS_ROLES = [
  "Software Engineer",
  "Assistant System Engineer",
  "System Engineer",
  "Developer",
  "Full Stack Developer",
  "Java Developer",
  "Frontend Developer",
  "Backend Developer",
  "Support Engineer",
  "QA Engineer"
];

const TCS_PIPELINE = [
  { id: 'resume', name: 'Resume Verification', icon: FaBriefcase, duration: '24-48 Hours', category: 'screening' },
  { id: 'nqt', name: 'TCS NQT Exam', icon: FaLaptopCode, duration: '90 Mins', category: 'coding' },
  { id: 'tech', name: 'Technical Interview', icon: FaCode, duration: '30 Mins', category: 'technical' },
  { id: 'managerial', name: 'Managerial Interview', icon: FaBrain, duration: '30 Mins', category: 'technical' },
  { id: 'hr', name: 'HR Interview', icon: FaUsers, duration: '15 Mins', category: 'hr' }
];

const TCS_NQT_QUESTIONS = {
  numerical: [
    {
      id: 'num_1',
      q: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
      o: ["150 metres", "324 metres", "120 metres", "180 metres"],
      a: "150 metres",
      explain: "Speed = 60 * 5/18 = 50/3 m/s. Length = Speed * Time = 50/3 * 9 = 150 metres."
    },
    {
      id: 'num_2',
      q: "A & B can do a piece of work in 12 days, B & C in 15 days, C & A in 20 days. How long will A take to finish it alone?",
      o: ["30 Days", "40 Days", "24 Days", "20 Days"],
      a: "30 Days",
      explain: "Combined rate 2(A+B+C) = 1/12 + 1/15 + 1/20 = 12/60 = 1/5 => A+B+C = 1/10. A's rate = 1/10 - 1/15 = 1/30. So A takes 30 days."
    }
  ],
  verbal: [
    {
      id: 'verb_1',
      q: "Choose the correct synonym for the word 'ABSTAIN':",
      o: ["Refrain", "Accept", "Permit", "Indulge"],
      a: "Refrain",
      explain: "Abstain means to refrain from doing something."
    },
    {
      id: 'verb_2',
      q: "Identify the error in: 'Each of the students are required to submit the assignment.'",
      o: ["Each of", "the students", "are required", "to submit"],
      a: "are required",
      explain: "'Each' takes a singular verb, so it should be 'is required'."
    }
  ],
  logical: [
    {
      id: 'log_1',
      q: "Point A is 5m West of B. Point C is 10m North of B. In which direction is Point A with respect to Point C?",
      o: ["South-West", "North-West", "South-East", "North-East"],
      a: "South-West",
      explain: "Going west from B, and then south from C (since C is north of B) indicates South-West."
    },
    {
      id: 'log_2',
      q: "If COLD is coded as DPME, how is WARM coded?",
      o: ["XBSN", "XBTN", "YCSO", "VZQJ"],
      a: "XBSN",
      explain: "Shift each character forward by 1 (+1 logic)."
    }
  ],
  coding: {
    title: "Array Equilibrium Index Finder",
    difficulty: "Medium",
    description: `Given an array of integers arr, write a function to find the equilibrium index.
An equilibrium index of an array is an index such that the sum of elements at lower indexes is equal to the sum of elements at higher indexes.
If no such index exists, return -1.`,
    examples: [
      { input: "arr = [-7, 1, 5, 2, -4, 3, 0]", output: "3", explanation: "Sum of lower indices (-7+1+5 = -1) equals higher indices (-4+3+0 = -1)." }
    ],
    testCases: [
      { input: "[-7, 1, 5, 2, -4, 3, 0]", output: "3" },
      { input: "[1, 2, 3]", output: "-1" }
    ],
    constraints: ["3 <= arr.length <= 10^5", "-10^4 <= arr[i] <= 10^4"]
  }
};

const TCSPrepDetail = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  
  const [company, setCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(TCS_ROLES[0]);
  const [simulationRounds, setSimulationRounds] = useState([]);
  
  const [simState, setSimState] = useState({
    attemptId: null,
    currentRoundIndex: 0,
    scores: {},
    roundDetails: {},
    finalReport: null
  });

  const [activeRoundSim, setActiveRoundSim] = useState(null);

  // Resume screening state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeResult, setResumeResult] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  // NQT states
  const [nqtActiveSection, setNqtActiveSection] = useState('numerical'); 
  const [nqtAnswers, setNqtAnswers] = useState({});
  const [nqtCodingLang, setNqtCodingLang] = useState('java');
  const [nqtCodingCode, setNqtCodingCode] = useState('// Java equilibrium index solution\npublic class Solution {\n    public static int findEquilibrium(int[] arr) {\n        // Write code here\n        return -1;\n    }\n}');
  const [nqtRunResult, setNqtRunResult] = useState(null);
  const [nqtTimeLeft, setNqtTimeLeft] = useState(5400); // 90 mins
  const [nqtSubmitting, setNqtSubmitting] = useState(false);
  const [proctorWarnings, setProctorWarnings] = useState(0);
  const [proctorFullscreen, setProctorFullscreen] = useState(false);
  const [markedReview, setMarkedReview] = useState({});
  
  // Sectional Analysis Report States
  const [showSectionalAnalysis, setShowSectionalAnalysis] = useState(false);
  const [sectionalScores, setSectionalScores] = useState(null);

  // Interview States
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [userResponseText, setUserResponseText] = useState('');
  const [whiteboardData, setWhiteboardData] = useState('// Design patterns or database schemas...\n');
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewCode, setInterviewCode] = useState('// Live interview coding workspace\n');
  const [isSubmittingRound, setIsSubmittingRound] = useState(false);

  // Live Scoreboard
  const [liveEvaluation, setLiveEvaluation] = useState({
    aptitude: 60,
    coding: 50,
    technical: 50,
    communication: 65,
    confidence: 60,
    hrReadiness: 50
  });

  // Achievements & History Mocks
  const [achievements, setAchievements] = useState([
    { name: "Numerical Master", desc: "100% accuracy in Quantitative Aptitude", icon: "🧮", unlocked: true },
    { name: "Coding Expert", desc: "Pass all hidden testcases on first submit", icon: "💻", unlocked: true },
    { name: "SQL Specialist", desc: "Write flawless relational algebra queries", icon: "📊", unlocked: false },
    { name: "Communication Star", desc: "Clear HR rounds with high professional scores", icon: "🌟", unlocked: false }
  ]);

  const [history, setHistory] = useState([
    { date: "12-07-2026", category: "TCS Ninja", score: "68%", duration: "48 Mins", result: "Select" },
    { date: "15-07-2026", category: "TCS Digital", score: "74%", duration: "55 Mins", result: "Select" }
  ]);

  const [showFinalReport, setShowFinalReport] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/prep/companies/TCS');
        const fetchedCompany = res.data.company;
        setCompany(fetchedCompany);
        
        const dbRoles = res.data.roles || [];
        const mergedRoles = TCS_ROLES.map((roleName, i) => {
          const matchingDbRole = dbRoles.find(dr => dr.roleName.toLowerCase() === roleName.toLowerCase());
          return {
            _id: matchingDbRole ? matchingDbRole._id : `tcs_role_${i}`,
            roleName,
            department: 'Services',
            avgSalary: '3.3 - 9.0 LPA'
          };
        });
        setRoles(mergedRoles);
        
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category');
        if (catParam) {
          const targetCat = TCS_CATEGORIES.find(c => c.name === decodeURIComponent(catParam));
          if (targetCat) {
            setSelectedCategory(targetCat);
            setSimulationRounds(TCS_PIPELINE);
            
            try {
              const resAttempt = await api.post('/prep/attempt', { 
                companyId: fetchedCompany._id, 
                roleId: mergedRoles[0]._id 
              });
              setSimState({
                attemptId: resAttempt.data._id,
                currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
                scores: resAttempt.data.scores || {},
                roundDetails: resAttempt.data.roundDetails || {},
                finalReport: resAttempt.data.finalReport || null
              });
            } catch (err) {
              console.error(err);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load TCS details', err);
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  // GSAP animation
  useEffect(() => {
    if (!loading && heroRef.current) {
      gsap.fromTo(heroRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [loading]);

  // NQT Timer
  useEffect(() => {
    let timer = null;
    if (activeRoundSim?.id === 'nqt' && nqtTimeLeft > 0) {
      timer = setInterval(() => {
        setNqtTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (nqtTimeLeft === 0 && activeRoundSim?.id === 'nqt') {
      triggerNQTSubmission();
    }
    return () => clearInterval(timer);
  }, [activeRoundSim, nqtTimeLeft]);

  // Tab switch listener simulation
  useEffect(() => {
    const handleBlur = () => {
      if (activeRoundSim?.id === 'nqt') {
        setProctorWarnings(prev => {
          const next = prev + 1;
          toast.error(`Proctor Warning: Tab switch detected! Violation ${next}/3`, { duration: 4000 });
          if (next >= 3) {
            toast.error("Submitting exam automatically due to multiple violations.");
            triggerNQTSubmission();
          }
          return next;
        });
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeRoundSim]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat);
    setSimulationRounds(TCS_PIPELINE);
    
    localStorage.setItem(`last_role_${company?.name || 'TCS'}`, cat.name);
    
    try {
      const resAttempt = await api.post('/prep/attempt', { 
        companyId: company?._id || '500000000000000000000004', 
        roleId: roles[0]._id 
      });
      setSimState({
        attemptId: resAttempt.data._id,
        currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
        scores: resAttempt.data.scores || {},
        roundDetails: resAttempt.data.roundDetails || {},
        finalReport: resAttempt.data.finalReport || null
      });
    } catch (err) {
      console.error(err);
      setSimState({
        attemptId: 'mock_tcs_attempt_' + Date.now(),
        currentRoundIndex: 0,
        scores: {},
        roundDetails: {},
        finalReport: null
      });
    }
  };

  const startRoundSimulation = (round) => {
    setInterviewStep(0);
    if (round.id === 'tech') {
      setInterviewMessages([{
        sender: 'ai',
        text: "Welcome to the TCS Technical Interview. I am your interviewer today. Let's start with project details. Explain your final-year project's architecture.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } else if (round.id === 'managerial') {
      setInterviewMessages([{
        sender: 'ai',
        text: "Hello! Welcome to the Managerial Round. As a developer at TCS, client management is critical. A client suddenly changes the requirements of your module right before the release deadline. How do you handle this?",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } else if (round.id === 'hr') {
      setInterviewMessages([{
        sender: 'ai',
        text: "Hi! Welcome to the HR round. Introduce yourself, and tell us why you are interested in starting your career with TCS.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    
    setActiveRoundSim({ 
      roundName: round.name, 
      roundIndex: simulationRounds.indexOf(round), 
      category: round.category, 
      id: round.id 
    });
  };

  // Resume round
  const handleResumeVerification = () => {
    setAnalyzingResume(true);
    setTimeout(() => {
      setAnalyzingResume(false);
      setResumeResult({
        score: 78,
        passed: true,
        details: "ATS Verification: Education criteria matched (CGPA >= 7.0), no active backlogs. Java/C++ keywords parsed successfully."
      });
      toast.success("Resume verification completed!");
    }, 1800);
  };

  const handleFinishResume = async () => {
    try {
      if (simState.attemptId) {
        await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
          roundIndex: 0,
          score: 78,
          passed: true,
          details: { verified: true }
        });
      }
      setSimState(prev => ({ ...prev, currentRoundIndex: 1 }));
      setActiveRoundSim(null);
    } catch (err) {
      console.error(err);
      setSimState(prev => ({ ...prev, currentRoundIndex: 1 }));
      setActiveRoundSim(null);
    }
  };

  // NQT section analysis generator
  const triggerNQTSubmission = () => {
    setNqtSubmitting(true);
    setTimeout(async () => {
      // Calculate scores
      let correctNum = 0, correctVerb = 0, correctLog = 0;
      if (nqtAnswers['numerical_0'] === TCS_NQT_QUESTIONS.numerical[0].a) correctNum++;
      if (nqtAnswers['numerical_1'] === TCS_NQT_QUESTIONS.numerical[1].a) correctNum++;
      if (nqtAnswers['verbal_0'] === TCS_NQT_QUESTIONS.verbal[0].a) correctVerb++;
      if (nqtAnswers['verbal_1'] === TCS_NQT_QUESTIONS.verbal[1].a) correctVerb++;
      if (nqtAnswers['logical_0'] === TCS_NQT_QUESTIONS.logical[0].a) correctLog++;
      if (nqtAnswers['logical_1'] === TCS_NQT_QUESTIONS.logical[1].a) correctLog++;

      const numericalAccuracy = Math.round((correctNum / 2) * 100);
      const verbalAccuracy = Math.round((correctVerb / 2) * 100);
      const logicalAccuracy = Math.round((correctLog / 2) * 100);

      const generatedAnalytics = {
        numerical: {
          attempted: Object.keys(nqtAnswers).filter(k => k.startsWith('numerical')).length,
          correct: correctNum,
          wrong: 2 - correctNum,
          accuracy: numericalAccuracy,
          avgTime: '45s',
          weakTopics: correctNum < 2 ? ['Time & Work', 'Distance Calculation'] : [],
          recommendedPractice: 'Solve Time Speed Distance sets on the Coding Practice section.'
        },
        verbal: {
          grammar: verbalAccuracy,
          vocabulary: 85,
          reading: 90,
          communication: 'High Readiness',
          suggestions: 'Practicing synonyms and sentence structure correction exercises.'
        },
        logical: {
          accuracy: logicalAccuracy,
          puzzleSolving: 80,
          patternRecognition: 85,
          criticalThinking: 75,
          suggestions: 'Solve syllogism logic structures.'
        },
        coding: {
          passed: 2,
          hiddenPassed: 3,
          runtime: '14ms',
          memory: '2.4 MB',
          quality: 'Optimal',
          optimization: 'Efficient',
          rating: 'Expert'
        }
      };

      setSectionalScores(generatedAnalytics);
      setShowSectionalAnalysis(true);
      setNqtSubmitting(false);
      toast.success("NQT Submission Complete!");
    }, 2000);
  };

  const handleFinishNQTSectional = async () => {
    try {
      if (simState.attemptId) {
        await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
          roundIndex: 1,
          score: 85,
          passed: true,
          details: sectionalScores
        });
      }
      setSimState(prev => ({ ...prev, currentRoundIndex: 2 }));
      setShowSectionalAnalysis(false);
      setActiveRoundSim(null);
    } catch (err) {
      console.error(err);
      setSimState(prev => ({ ...prev, currentRoundIndex: 2 }));
      setShowSectionalAnalysis(false);
      setActiveRoundSim(null);
    }
  };

  // Technical Round steps flow helper
  const handleTechnicalReply = () => {
    if (!userResponseText.trim()) return;
    const userMsg = userResponseText;
    setInterviewMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setUserResponseText('');
    
    // Simulate natural dynamic steps
    setTimeout(() => {
      const nextStep = interviewStep + 1;
      setInterviewStep(nextStep);
      let aiText = '';
      if (nextStep === 1) {
        aiText = "Interesting final-year setup. Why did you choose this technology stack over alternative frameworks?";
      } else if (nextStep === 2) {
        aiText = "Understood. Let's talk about the database schema. Explain your design structure and how normalizations are applied.";
      } else if (nextStep === 3) {
        aiText = "Let's test SQL knowledge. Write a query to find the second highest salary from an Employee table.";
      } else if (nextStep === 4) {
        aiText = "Excellent. Now, please look at the code workspace. Solve this coding problem: Write a function to check if a string is an anagram of another. Use the editor to draft it.";
        setInterviewCode("// Code anagram checker\npublic boolean isAnagram(String s, String t) {\n    \n}");
      } else if (nextStep === 5) {
        aiText = "What is the time complexity and space complexity of your anagram checker?";
      } else if (nextStep === 6) {
        aiText = "How can we optimize this solution if memory constraints are extremely tight?";
      } else if (nextStep === 7) {
        aiText = "Explain one major challenge you faced during your project development and how you debugged it.";
      } else {
        aiText = "Perfect. I have gathered enough technical indicators. Let's wrap up this round.";
      }
      setInterviewMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1500);
  };

  const handleFinishTechnicalRound = async () => {
    setIsSubmittingRound(true);
    setTimeout(async () => {
      try {
        if (simState.attemptId) {
          await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
            roundIndex: activeRoundSim.roundIndex,
            score: 80,
            passed: true,
            details: { rating: 'Hire', indicators: liveEvaluation }
          });
        }
        const nextIdx = activeRoundSim.roundIndex + 1;
        setSimState(prev => ({ ...prev, currentRoundIndex: nextIdx }));
        setActiveRoundSim(null);
        setIsSubmittingRound(false);
        toast.success("Stage cleared!");
      } catch (err) {
        console.error(err);
        const nextIdx = activeRoundSim.roundIndex + 1;
        setSimState(prev => ({ ...prev, currentRoundIndex: nextIdx }));
        setActiveRoundSim(null);
        setIsSubmittingRound(false);
      }
    }, 1500);
  };

  // Managerial Reply
  const handleManagerialReply = () => {
    if (!userResponseText.trim()) return;
    const userMsg = userResponseText;
    setInterviewMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setUserResponseText('');

    setTimeout(() => {
      const nextStep = interviewStep + 1;
      setInterviewStep(nextStep);
      let aiText = '';
      if (nextStep === 1) {
        aiText = "Very professional. Next scenario: A teammate is not contributing to your project deliverables. How do you handle it without harming team relations?";
      } else if (nextStep === 2) {
        aiText = "Good. What if a critical release deadline is about to be missed? What action plans do you initiate immediately?";
      } else if (nextStep === 3) {
        aiText = "Last scenario: You strongly disagree with your team lead's design decision. What do you do?";
      } else {
        aiText = "Excellent. I have evaluated your decision-making metrics. Let's finish.";
      }
      setInterviewMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1500);
  };

  // HR Reply
  const handleHRReply = () => {
    if (!userResponseText.trim()) return;
    const userMsg = userResponseText;
    setInterviewMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setUserResponseText('');

    setTimeout(() => {
      const nextStep = interviewStep + 1;
      setInterviewStep(nextStep);
      let aiText = '';
      if (nextStep === 1) {
        aiText = "TCS operates across major global regions. Are you comfortable with relocation and night shift work rotations?";
      } else if (nextStep === 2) {
        aiText = "Understood. TCS requires a service agreement bond of 1 year for new recruits. Are you willing to sign this agreement?";
      } else if (nextStep === 3) {
        aiText = "Excellent. Where do you see yourself in five years within TCS?";
      } else {
        aiText = "Perfect! We are done. Let's proceed to the final hiring committee decisions.";
      }
      setInterviewMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1500);
  };

  const handleFinishHRRound = async () => {
    setIsSubmittingRound(true);
    setTimeout(async () => {
      try {
        if (simState.attemptId) {
          await api.post(`/prep/attempt/${simState.attemptId}/submit`, {
            roundIndex: 4,
            score: 85,
            passed: true,
            details: { hrStatus: 'Recommended' }
          });
        }
        setSimState(prev => ({ ...prev, currentRoundIndex: 5 }));
        setActiveRoundSim(null);
        setShowFinalReport(true);
        setIsSubmittingRound(false);
        toast.success("Simulation Complete!");
      } catch (err) {
        console.error(err);
        setSimState(prev => ({ ...prev, currentRoundIndex: 5 }));
        setActiveRoundSim(null);
        setShowFinalReport(true);
        setIsSubmittingRound(false);
      }
    }, 1500);
  };

  const activeRound = simulationRounds[simState.currentRoundIndex];

  return (
    <div className="flex min-h-screen bg-[#020710] text-slate-200 overflow-x-hidden font-sans">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03] blur-[120px]" style={{ backgroundColor: NQT_BLUE }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03] blur-[120px]" style={{ backgroundColor: NQT_BLUE }}></div>
      </div>

      <Sidebar />

      <div className="relative z-10 flex-1 pl-0 md:pl-[72px] flex flex-col h-screen overflow-hidden">
        <Navbar subtitle="TCS Campus Hiring Simulator" />

        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-[#0080ff]/50 to-transparent" />

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* Back Button */}
            {(selectedCategory || activeRoundSim) && (
              <button 
                onClick={() => {
                  if (activeRoundSim) {
                    if (window.confirm("Active round progress will be lost. Exit?")) {
                      setActiveRoundSim(null);
                    }
                  } else {
                    setSelectedCategory(null);
                    setShowFinalReport(false);
                  }
                }} 
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaArrowLeft /> Back to {activeRoundSim ? 'Campus Portal' : 'Placement Directory'}
              </button>
            )}

            {/* DIRECTORY VIEW */}
            {!selectedCategory && (
              <div className="space-y-8" ref={heroRef}>
                {/* Hero header */}
                <div className="bg-gradient-to-br from-[#041122] to-[#020710] border border-white/5 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
                  <div className="absolute top-0 right-0 w-96 h-96 opacity-[0.02] blur-3xl pointer-events-none rounded-full" style={{ backgroundColor: NQT_BLUE }}></div>
                  <div className="w-24 h-24 rounded-2xl bg-white p-3 flex items-center justify-center shrink-0 shadow-lg">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" alt="TCS Logo" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="space-y-4 flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0080ff]/10 border border-[#0080ff]/25 text-[#0080ff] text-xs font-semibold">
                      <FaBuilding /> TCS NQT Placement Simulation
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">TCS Placement Simulation</h1>
                    <p className="text-slate-400 max-w-2xl text-xs leading-relaxed">
                      Evaluate your parameters against Ninja, Digital, and Prime standards. Prepare with simulated proctored quizzes and structured panels.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10">
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Difficulty</div>
                      <div className="text-sm font-black text-amber-500 font-mono mt-1">Medium</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Salary package</div>
                      <div className="text-sm font-black text-[#0080ff] font-mono mt-1">3.3-9.0 LPA</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Selection Rate</div>
                      <div className="text-sm font-black text-slate-100 font-mono mt-1">12%</div>
                    </div>
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest">Eligibility</div>
                      <div className="text-sm font-black text-slate-100 font-mono mt-1">Graduates</div>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-wide">AVAILABLE PLACEMENT CATEGORIES</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TCS_CATEGORIES.map(cat => (
                      <div key={cat.name} className="p-6 rounded-2xl bg-[#041122] border border-white/5 shadow-md flex flex-col justify-between hover:border-[#0080ff]/20 transition-all group">
                        <div className="space-y-3">
                          <h4 className="text-lg font-black text-white group-hover:text-[#0080ff] transition-colors">{cat.name}</h4>
                          <div className="text-2xl font-black text-[#0080ff] font-mono">{cat.packageRange}</div>
                          <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{cat.expectedSkills}</p>
                        </div>
                        
                        <div className="border-t border-white/5 mt-6 pt-4 space-y-3 text-[11px] text-slate-400">
                          <div className="flex justify-between"><span>Eligibility Criteria:</span><span className="text-white font-semibold block max-w-[120px] truncate">{cat.eligibility}</span></div>
                          <div className="flex justify-between"><span>Coding Levels:</span><span className="text-white font-semibold">{cat.codingLevel}</span></div>
                          
                          <button 
                            onClick={() => handleCategorySelect(cat)}
                            className="w-full bg-[#0080ff] hover:bg-[#0066cc] text-white py-2.5 rounded-xl text-xs font-bold transition-all mt-4 cursor-pointer"
                          >
                            Enter placement track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles list */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white tracking-wide">AVAILABLE DESIGNATIONS</h3>
                  <div className="flex flex-wrap gap-2">
                    {TCS_ROLES.map(role => (
                      <span key={role} className="text-xs bg-[#041122] border border-white/5 px-4 py-2 rounded-xl text-slate-300 font-medium">{role}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TCS NQT PORTAL DASHBOARD */}
            {selectedCategory && !activeRoundSim && !showFinalReport && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Header dashboard widgets */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Status */}
                  <div className="bg-[#041122] border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Application Status</span>
                    <h3 className="text-lg font-black text-white">Active Evaluation</h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Active hiring 2026
                    </div>
                  </div>
                  
                  {/* Track */}
                  <div className="bg-[#041122] border border-[#0080ff]/20 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-[#0080ff] uppercase font-bold tracking-wider">Hiring Track Category</span>
                    <h3 className="text-lg font-black text-white">{selectedCategory.name}</h3>
                    <p className="text-xs text-slate-400">Expectations: {selectedCategory.codingLevel}</p>
                  </div>

                  {/* Readiness */}
                  <div className="bg-[#041122] border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Preparation Readiness</span>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-black text-white font-mono">78%</h3>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">High</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0080ff] rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-[#041122] border border-white/5 p-5 rounded-2xl space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Placement Recommendation</span>
                    <p className="text-xs text-slate-300 leading-tight">Focus on SQL Joins and Probability aptitude topics to boost score.</p>
                  </div>
                </div>

                {/* Pipeline / Navigation widget */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pipeline Timeline */}
                  <div className="bg-[#041122] border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recruitment Stages</h3>
                    
                    <div className="relative pl-6 border-l border-white/10 space-y-6">
                      {simulationRounds.map((round, idx) => {
                        const isCompleted = idx < simState.currentRoundIndex;
                        const isActive = idx === simState.currentRoundIndex;
                        const isLocked = idx > simState.currentRoundIndex;
                        const RoundIcon = round.icon;
                        
                        return (
                          <div key={round.id} className="relative flex justify-between items-center gap-4">
                            {/* Point on timeline */}
                            <div className={`absolute left-[-31px] w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isActive ? 'bg-[#0080ff] border-[#0080ff]' : isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-black border-white/10'
                            }`}></div>
                            
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                                isActive ? 'bg-[#0080ff]/10 text-[#0080ff]' : isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'
                              }`}>
                                <RoundIcon />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white">{round.name}</h4>
                                <p className="text-[10px] text-slate-500">{round.duration}</p>
                              </div>
                            </div>

                            <div>
                              {isActive ? (
                                <button onClick={() => startRoundSimulation(round)} className="bg-[#0080ff] hover:bg-[#0066cc] text-white px-4 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer">Start</button>
                              ) : isCompleted ? (
                                <span className="text-[10px] text-emerald-400 font-bold">Cleared ✓</span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Locked</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* History & Achievements */}
                  <div className="space-y-6">
                    {/* Performance History */}
                    <div className="bg-[#041122] border border-white/5 p-6 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Performance History</h3>
                      <div className="space-y-2.5">
                        {history.map((hist, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5 text-[11px]">
                            <div>
                              <div className="font-bold text-white">{hist.category}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{hist.date} • {hist.duration}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold block">{hist.score}</span>
                              <span className="text-[10px] text-slate-500 uppercase">{hist.result}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-[#041122] border border-white/5 p-6 rounded-2xl space-y-4">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Unlocked Badges</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {achievements.map((ach, i) => (
                          <div key={i} className={`p-2.5 rounded-xl border text-center space-y-1.5 transition-all ${
                            ach.unlocked ? 'border-[#0080ff]/20 bg-[#0080ff]/5' : 'border-white/5 bg-white/[0.01] opacity-50'
                          }`}>
                            <div className="text-xl">{ach.icon}</div>
                            <div className="text-[9px] font-bold text-white truncate">{ach.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVE TEST / INTERVIEW SIMULATIONS */}
            {activeRoundSim && (
              <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
                
                {/* NQT QUIZ EXAM + PROCTORING */}
                {activeRoundSim.id === 'nqt' && !showSectionalAnalysis && (
                  <div className="flex-1 flex flex-col lg:flex-row border border-white/10 rounded-2xl overflow-hidden bg-[#041122] relative">
                    
                    {/* Proctor Notification Panel */}
                    <div className="absolute top-2 right-4 z-50 bg-black/80 px-3 py-1.5 rounded-xl border border-red-500/20 backdrop-blur text-[10px] flex items-center gap-1.5 text-red-400 font-mono">
                      <FaUserLock className="animate-pulse" /> Proctor warnings: {proctorWarnings}/3
                    </div>

                    {/* Left Pane: Question Section */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2 capitalize"><FaLaptopCode /> NQT {nqtActiveSection} section</h2>
                        <span className="bg-[#0080ff]/25 text-[#0080ff] text-xs px-2.5 py-0.5 rounded font-mono font-bold flex items-center gap-1.5">
                          <FaClock /> {formatTime(nqtTimeLeft)}
                        </span>
                      </div>

                      {nqtActiveSection !== 'coding' ? (
                        <div className="space-y-6">
                          {TCS_NQT_QUESTIONS[nqtActiveSection].map((qObj, qIdx) => {
                            const qKey = `${nqtActiveSection}_${qIdx}`;
                            return (
                              <div key={qIdx} className="bg-black/20 border border-white/5 p-5 rounded-2xl space-y-4">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="text-slate-500 font-bold uppercase tracking-wider">Question {qIdx + 1}</span>
                                  <button 
                                    onClick={() => setMarkedReview({...markedReview, [qKey]: !markedReview[qKey]})}
                                    className={`px-3 py-1 rounded border text-[9px] font-bold ${
                                      markedReview[qKey] ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'border-white/10 text-slate-500 hover:text-white'
                                    }`}
                                  >
                                    {markedReview[qKey] ? 'Marked for Review' : 'Mark for Review'}
                                  </button>
                                </div>
                                <p className="text-sm text-white font-medium">{qObj.q}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  {qObj.o.map(opt => (
                                    <button 
                                      key={opt}
                                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                                        nqtAnswers[qKey] === opt 
                                          ? 'border-[#0080ff] bg-[#0080ff]/10 text-white' 
                                          : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/[0.05]'
                                      }`}
                                      onClick={() => setNqtAnswers({...nqtAnswers, [qKey]: opt})}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                          <div className="bg-black/25 border border-white/5 p-4 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold text-[#0080ff]">{TCS_NQT_QUESTIONS.coding.title}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{TCS_NQT_QUESTIONS.coding.description}</p>
                            <div className="text-[11px] font-mono text-slate-500">Constraints: {TCS_NQT_QUESTIONS.coding.constraints.join(', ')}</div>
                          </div>
                          
                          <div className="flex-1 flex flex-col h-[350px] border border-white/10 rounded-xl overflow-hidden">
                            <div className="h-10 bg-black/40 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                              <select 
                                className="bg-black/60 text-[10px] border border-white/10 rounded px-2 py-1 outline-none text-slate-300 font-bold"
                                value={nqtCodingLang}
                                onChange={(e) => setNqtCodingLang(e.target.value)}
                              >
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                              </select>
                            </div>
                            <div className="flex-1 relative">
                              <Editor 
                                height="100%"
                                language={nqtCodingLang === 'java' ? 'java' : nqtCodingLang}
                                theme="vs-dark"
                                value={nqtCodingCode}
                                onChange={(val) => setNqtCodingCode(val)}
                                options={{ fontSize: 13, minimap: { enabled: false } }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Side: Question Palette & Navigation */}
                    <div className="w-full lg:w-[280px] border-l border-white/10 bg-[#050b14]/50 p-5 flex flex-col justify-between shrink-0">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">NQT Sections</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['numerical', 'verbal', 'logical', 'coding'].map(sec => (
                              <button 
                                key={sec}
                                className={`py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                                  nqtActiveSection === sec ? 'bg-[#0080ff] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                                onClick={() => setNqtActiveSection(sec)}
                              >
                                {sec}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Question Palette</h4>
                          <div className="grid grid-cols-4 gap-2 text-center font-mono">
                            {['numerical_0', 'numerical_1', 'verbal_0', 'verbal_1', 'logical_0', 'logical_1', 'coding_0'].map((qKey, i) => {
                              const attempted = nqtAnswers[qKey] || (qKey === 'coding_0' && nqtCodingCode.length > 50);
                              const review = markedReview[qKey];
                              return (
                                <div 
                                  key={qKey}
                                  className={`p-2 rounded text-xs font-bold ${
                                    review 
                                      ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' 
                                      : attempted 
                                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
                                        : 'bg-white/5 text-slate-500'
                                  }`}
                                >
                                  Q{i + 1}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-white/5 pt-4">
                        {nqtActiveSection === 'coding' && (
                          <button onClick={handleRunNQTCode} className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                            Run Code
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (window.confirm("Do you want to submit your final NQT solutions?")) {
                              triggerNQTSubmission();
                            }
                          }}
                          className="w-full bg-[#0080ff] hover:bg-[#0066cc] text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-[#0080ff]/20 transition-all cursor-pointer"
                        >
                          Submit NQT Exam
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sectional Analysis report view */}
                {showSectionalAnalysis && sectionalScores && (
                  <div className="flex-1 overflow-y-auto bg-[#041122] border border-white/10 rounded-2xl p-6 space-y-6 no-scrollbar">
                    <div className="border-b border-white/5 pb-4">
                      <h2 className="text-2xl font-black text-white">NQT Sectional Analysis</h2>
                      <p className="text-xs text-slate-400 mt-1">Detailed performance indices across individual subjects.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Numerical */}
                      <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">1. Numerical Ability Analysis</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-slate-500">Attempted Qs:</span> <strong className="text-white block mt-0.5">{sectionalScores.numerical.attempted} / 2</strong></div>
                          <div><span className="text-slate-500">Accuracy Index:</span> <strong className="text-[#0080ff] block mt-0.5">{sectionalScores.numerical.accuracy}%</strong></div>
                          <div><span className="text-slate-500">Average Time:</span> <strong className="text-white block mt-0.5">{sectionalScores.numerical.avgTime}</strong></div>
                          <div><span className="text-slate-500">Weak Areas:</span> <strong className="text-red-400 block mt-0.5">{sectionalScores.numerical.weakTopics.join(', ') || 'None'}</strong></div>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">Recommendation: {sectionalScores.numerical.recommendedPractice}</div>
                      </div>

                      {/* Verbal */}
                      <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">2. Verbal Ability Analysis</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-slate-500">Grammar Score:</span> <strong className="text-white block mt-0.5">{sectionalScores.verbal.grammar}%</strong></div>
                          <div><span className="text-slate-500">Vocabulary Rating:</span> <strong className="text-white block mt-0.5">{sectionalScores.verbal.vocabulary}%</strong></div>
                          <div><span className="text-slate-500">Reading speed:</span> <strong className="text-white block mt-0.5">{sectionalScores.verbal.reading}%</strong></div>
                          <div><span className="text-slate-500">HR Readiness:</span> <strong className="text-emerald-400 block mt-0.5">{sectionalScores.verbal.communication}</strong></div>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">Suggestions: {sectionalScores.verbal.suggestions}</div>
                      </div>

                      {/* Logical */}
                      <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">3. Logical Reasoning Analysis</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-slate-500">Logical Accuracy:</span> <strong className="text-white block mt-0.5">{sectionalScores.logical.accuracy}%</strong></div>
                          <div><span className="text-slate-500">Puzzle Solving:</span> <strong className="text-white block mt-0.5">{sectionalScores.logical.puzzleSolving}%</strong></div>
                          <div><span className="text-slate-500">Pattern Recognition:</span> <strong className="text-white block mt-0.5">{sectionalScores.logical.patternRecognition}%</strong></div>
                          <div><span className="text-slate-500">Critical Thinking:</span> <strong className="text-white block mt-0.5">{sectionalScores.logical.criticalThinking}%</strong></div>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">Suggestions: {sectionalScores.logical.suggestions}</div>
                      </div>

                      {/* Coding */}
                      <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">4. Advanced Coding Analysis</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div><span className="text-slate-500">Test Cases Passed:</span> <strong className="text-white block mt-0.5">{sectionalScores.coding.passed} / 2</strong></div>
                          <div><span className="text-slate-500">Hidden cases ratio:</span> <strong className="text-white block mt-0.5">{sectionalScores.coding.hiddenPassed} / 3</strong></div>
                          <div><span className="text-slate-500">CPU Execution:</span> <strong className="text-[#0080ff] block mt-0.5">{sectionalScores.coding.runtime}</strong></div>
                          <div><span className="text-slate-500">Memory footprint:</span> <strong className="text-white block mt-0.5">{sectionalScores.coding.memory}</strong></div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleFinishNQTSectional}
                      className="w-full bg-[#0080ff] hover:bg-[#0066cc] text-white py-3 rounded-xl font-bold shadow-lg shadow-[#0080ff]/20 transition-all cursor-pointer"
                    >
                      Proceed to Interview Stage
                    </button>
                  </div>
                )}

                {/* INTERVIEWS PLACEMENT DIALOGS */}
                {['technical', 'hr'].includes(activeRoundSim?.category) && (
                  <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                    {/* Interview Left Column: Chat & Interviewer */}
                    <div className="w-full lg:w-[400px] flex flex-col gap-4">
                      <div className="bg-[#041122] border border-white/10 rounded-2xl p-4 text-center">
                        <div className="aspect-video bg-black/45 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden mb-3">
                          <FaRobot className="text-5xl text-[#0080ff]/40" />
                          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> Active Panel Interviewer
                          </div>
                        </div>
                        <h2 className="text-base font-bold text-white capitalize">{activeRoundSim.roundName}</h2>
                        <p className="text-slate-400 text-[10px] mt-1">Interviewer evaluates domain concepts and response communication.</p>
                      </div>

                      {/* Chat messages */}
                      <div className="flex-1 bg-[#041122] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
                          {interviewMessages.map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-[#0080ff]/10 text-blue-100 border border-[#0080ff]/20 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                              {msg.text}
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-white/10 bg-black/20 flex flex-col gap-2">
                          <textarea 
                            className="w-full bg-black/40 border border-white/10 rounded-lg text-xs text-white p-3 outline-none focus:border-[#0080ff]/50 transition-colors resize-none h-20" 
                            placeholder="Type your response here..." 
                            value={userResponseText} 
                            onChange={(e) => setUserResponseText(e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (activeRoundSim.id === 'tech') handleTechnicalReply();
                                else if (activeRoundSim.id === 'managerial') handleManagerialReply();
                                else if (activeRoundSim.id === 'hr') handleHRReply();
                              }
                            }}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              className="bg-[#0080ff] hover:bg-[#0066cc] text-white px-5 py-2 rounded-lg font-bold shadow-lg text-xs transition-colors flex items-center cursor-pointer" 
                              onClick={() => {
                                if (activeRoundSim.id === 'tech') handleTechnicalReply();
                                else if (activeRoundSim.id === 'managerial') handleManagerialReply();
                                else if (activeRoundSim.id === 'hr') handleHRReply();
                              }}
                            >
                              Reply <FaPaperPlane className="ml-2 text-[10px]"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interview Right Column: Workspaces */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                      {/* Live Scorecard */}
                      <div className="bg-[#041122] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shrink-0">
                        <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2 mb-4">Live Performance indicators</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {[
                            {name: 'Aptitude Skill', score: liveEvaluation.aptitude},
                            {name: 'Coding execution', score: liveEvaluation.coding},
                            {name: 'Technical Depth', score: liveEvaluation.technical},
                            {name: 'Communication', score: liveEvaluation.communication},
                            {name: 'Confidence Level', score: liveEvaluation.confidence},
                            {name: 'HR Readiness', score: liveEvaluation.hrReadiness}
                          ].map(m => (
                            <div key={m.name} className="space-y-1">
                              <div className="flex justify-between text-[9px] text-slate-400">
                                <span>{m.name}</span>
                                <span>{m.score}%</span>
                              </div>
                              <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{width: `${m.score}%`, backgroundColor: NQT_BLUE}}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Whiteboard/Workspace (For writing code, designing database schemas) */}
                      <div className="flex-1 bg-[#041122] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                        <div className="h-10 bg-black/20 border-b border-white/10 flex items-center px-4 justify-between shrink-0">
                          <span className="text-xs font-semibold text-slate-400">Workspace / Whiteboard</span>
                        </div>
                        <div className="flex-1 relative bg-[#020710]">
                          <Editor 
                            height="100%"
                            language={activeRoundSim.id === 'tech' ? 'java' : 'text'}
                            theme="vs-dark"
                            value={activeRoundSim.id === 'tech' ? interviewCode : whiteboardData}
                            onChange={(val) => activeRoundSim.id === 'tech' ? setInterviewCode(val) : setWhiteboardData(val)}
                            options={{ fontSize: 13, minimap: { enabled: false } }}
                          />
                        </div>
                        <div className="p-3 border-t border-white/5 bg-black/10 flex justify-end shrink-0">
                          <button 
                            disabled={isSubmittingRound}
                            className="bg-[#0080ff] hover:bg-[#0066cc] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            onClick={() => {
                              if (activeRoundSim.id === 'tech') handleFinishTechnicalRound();
                              else if (activeRoundSim.id === 'managerial') {
                                // Transition to HR Round
                                setSimState(prev => ({ ...prev, currentRoundIndex: 4 }));
                                setActiveRoundSim(null);
                                toast.success("Managerial Interview completed!");
                              }
                              else if (activeRoundSim.id === 'hr') handleFinishHRRound();
                            }}
                          >
                            {isSubmittingRound ? 'Submitting evaluations...' : 'Submit Stage'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FINAL COMMITTEE REPORT & MOCK OFFER */}
            {!activeRoundSim && showFinalReport && (
              <div className="animate-fade-in-up space-y-6">
                <div className="bg-gradient-to-r from-[#0080ff]/10 via-[#041122] to-[#041122] border border-[#0080ff]/30 rounded-3xl p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                  <div className="w-32 h-32 rounded-full bg-[#0080ff]/20 flex items-center justify-center border-4 border-[#0080ff]/30 shadow-[0_0_50px_rgba(0,128,255,0.4)] shrink-0">
                    <FaTrophy className="text-5xl text-[#0080ff]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white mb-2">Hiring Committee Consensus</h1>
                    <p className="text-sm text-slate-300 mb-4">Placement committee has analyzed NQT indices and live interview diagnostics.</p>
                    <div className="inline-block bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                      Consensus: SELECT ({selectedCategory.name})
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {title: 'NQT Aptitude', result: 'Clear (88%)', icon: FaLaptopCode, color: '#0080ff'},
                    {title: 'Technical Panel', result: 'Recommend (80%)', icon: FaCode, color: '#0080ff'},
                    {title: 'Managerial Round', result: 'Select', icon: FaBrain, color: '#0080ff'},
                    {title: 'HR Panel', result: 'Verified', icon: FaUsers, color: '#0080ff'}
                  ].map(r => (
                    <div key={r.title} className="bg-[#041122] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5" style={{color: r.color}}>
                        <r.icon className="text-xl" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium mb-1">{r.title}</div>
                        <div className="text-white font-bold text-xs">{r.result}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Detailed Performance Report */}
                  <div className="bg-[#041122] border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3">Final Performance Report</h3>
                    <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                      <p><strong className="text-[#0080ff]">NQT Score Summary:</strong> Attempted 6/6 aptitude questions with 85% accuracy. Advanced coding task resolved using linear time logic.</p>
                      <p><strong className="text-[#0080ff]">Technical Knowledge:</strong> Sound understanding of normalized relational database patterns, SQL Subqueries, and balanced binary tree logic complexities.</p>
                      <p><strong className="text-emerald-400">Communication & Leadership:</strong> Outstanding STAR structured descriptions during both HR relocation flexibilities and managerial requirements change discussions.</p>
                    </div>
                  </div>
                  
                  {/* Mock Offer Letter */}
                  <div className="bg-[#041122] border border-[#0080ff]/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0080ff]/10 rounded-full blur-2xl"></div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3">Offer Letter Simulation</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Hiring Track</span>
                        <span className="text-white font-bold">{selectedCategory.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Designation Designation</span>
                        <span className="text-white font-bold">{selectedRole}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Expected Compensation</span>
                        <span className="text-white font-bold">{selectedCategory.packageRange}</span>
                      </div>
                      <div className="flex justify-between pb-2">
                        <span className="text-slate-400">Acceptance Status</span>
                        <span className="text-emerald-400 font-bold">Offer Released</span>
                      </div>
                    </div>
                    <button className="w-full mt-6 bg-[#0080ff] hover:bg-[#0066cc] text-white py-3 rounded-xl font-bold transition-colors cursor-pointer" onClick={() => toast.success("Congratulations! Offer accepted. Practice other modules to improve!")}>
                      Accept Mock Offer
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TCSPrepDetail;
