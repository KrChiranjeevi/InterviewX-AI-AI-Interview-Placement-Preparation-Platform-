import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { COMPANY_CODING_PYQS } from '../data/companyCodingPYQs';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  FaArrowLeft, FaMicrosoft, FaCheckCircle, FaLock, 
  FaUndo, FaClock, FaCheck, FaAward, FaSlidersH, FaBrain,
  FaTimesCircle, FaTrophy, FaLightbulb, FaBriefcase, FaChevronDown, 
  FaChevronUp, FaCode, FaRobot, FaUsers, FaLaptopCode, FaUpload, 
  FaTerminal, FaSync, FaExclamationTriangle, FaPaperPlane, FaUserTie, FaPlay, FaChartLine, FaMinus, FaPlus
} from 'react-icons/fa';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';

// Microsoft Brand Colors for Themes
const MS_BLUE = '#00a4ef';
const MS_GREEN = '#7fba00';
const MS_YELLOW = '#ffb900';
const MS_RED = '#f25022';

const MICROSOFT_ROLES = [
  {
    _id: 'ms_role_01',
    roleName: 'Software Engineer',
    department: 'Engineering',
    level: 'L59 - L67',
    locations: ['Redmond', 'Seattle', 'Bengaluru', 'Hyderabad'],
    avgSalary: '$140k - $220k',
    description: 'Build core Microsoft products, from Windows to Office and cloud infrastructure.',
    difficulty: 'Hard',
    prepTime: '6-8 Weeks',
    demand: 'High',
    interviewStages: ['Resume Screening', 'Online Assessment', 'Technical 1', 'Technical 2', 'System Design', 'Behavioral'],
    requiredSkills: ['C#', 'C++', 'Java', 'Data Structures', 'Algorithms', 'System Design', 'OOP']
  },
  {
    _id: 'ms_role_02',
    roleName: 'Cloud Engineer (Azure)',
    department: 'Azure',
    level: 'L60 - L65',
    locations: ['Redmond', 'Remote', 'Bengaluru'],
    avgSalary: '$135k - $210k',
    description: 'Design, build, and maintain highly scalable Azure cloud services and infrastructure.',
    difficulty: 'Very Hard',
    prepTime: '8-10 Weeks',
    demand: 'Very High',
    interviewStages: ['Resume Screening', 'Online Assessment', 'Technical 1', 'Technical 2', 'System Design (Distributed)', 'Behavioral'],
    requiredSkills: ['Distributed Systems', 'Azure', 'C#', 'Go', 'Networking', 'Kubernetes']
  },
  {
    _id: 'ms_role_03',
    roleName: 'Data Scientist / AI Engineer',
    department: 'Microsoft AI',
    level: 'L60 - L64',
    locations: ['Redmond', 'Atlanta', 'Hyderabad'],
    avgSalary: '$150k - $230k',
    description: 'Develop cutting edge AI models, integrate OpenAI technologies, and build intelligent products.',
    difficulty: 'Hard',
    prepTime: '6-10 Weeks',
    demand: 'High',
    interviewStages: ['Resume Screening', 'ML Assessment', 'Technical 1', 'ML System Design', 'Behavioral'],
    requiredSkills: ['Python', 'PyTorch', 'Machine Learning', 'NLP', 'Statistics', 'SQL']
  }
];

const MICROSOFT_PIPELINE = [
  { id: 'resume', name: 'Resume Screening', icon: FaBriefcase, duration: '24-48 Hours', category: 'screening' },
  { id: 'oa', name: 'Online Assessment', icon: FaLaptopCode, duration: '90 Mins', category: 'coding' },
  { id: 'tech1', name: 'Technical Interview 1', icon: FaCode, duration: '45 Mins', category: 'technical' },
  { id: 'tech2', name: 'Technical Interview 2', icon: FaCode, duration: '45 Mins', category: 'technical' },
  { id: 'system_design', name: 'System Design', icon: FaBrain, duration: '60 Mins', category: 'system' },
  { id: 'behavioral', name: 'Behavioral / AA', icon: FaUsers, duration: '45 Mins', category: 'hr' }
];

const MICROSOFT_OA_QUESTIONS = [
  {
    id: 'ms_oa_1',
    title: 'Minimum Deletions to Make Character Frequencies Unique',
    difficulty: 'Medium',
    timeLimit: '45 mins',
    description: `A string s is called good if there are no two different characters in s that have the same frequency.
Given a string s, return the minimum number of characters you need to delete to make s good.
The frequency of a character in a string is the number of times it appears in the string. For example, in the string "aab", the frequency of 'a' is 2, while the frequency of 'b' is 1.`,
    examples: [
      { input: 's = "aab"', output: '0', explanation: 's is already good.' },
      { input: 's = "aaabbbcc"', output: '2', explanation: 'You can delete two \\\'b\\\'s resulting in the good string "aaabcc".' }
    ],
    testCases: [
      { input: '"aab"', output: '0' },
      { input: '"aaabbbcc"', output: '2' },
      { input: '"ceabaacb"', output: '2' }
    ],
    constraints: ['1 <= s.length <= 10^5', 's contains only lowercase English letters.']
  }
];

const MICROSOFT_TECH_QUESTIONS = {
  tech1: {
    title: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    companies: ['Microsoft'],
    acceptanceRate: '54.2%',
    tags: ['Array', 'Hash Table', 'Matrix'],
    description: `Given an m x n integer matrix matrix, if an element is 0, set its entire row and column to 0's.
You must do it in place.`,
    examples: [
      { input: 'matrix = [[1,1,1],[1,0,1],[1,1,1]]', output: '[[1,0,1],[0,0,0],[1,0,1]]' },
      { input: 'matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]', output: '[[0,0,0,0],[0,4,5,0],[0,3,1,0]]' }
    ],
    constraints: ['m == matrix.length', 'n == matrix[0].length', '1 <= m, n <= 200', '-2^31 <= matrix[i][j] <= 2^31 - 1'],
    expectedComplexity: 'Time: O(m * n), Space: O(1)'
  },
  tech2: {
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    companies: ['Microsoft'],
    acceptanceRate: '56.3%',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Design', 'String', 'Binary Tree'],
    description: `Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.
Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.`,
    examples: [
      { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' }
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-1000 <= Node.val <= 1000'],
    expectedComplexity: 'Time: O(N), Space: O(N)'
  }
};

const MicrosoftPrepDetail = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  
  const [company, setCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedRoleData, setSelectedRoleData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationRounds, setSimulationRounds] = useState([]);
  
  const [simState, setSimState] = useState({
    attemptId: null,
    currentRoundIndex: 0,
    scores: {},
    roundDetails: {},
    finalReport: null
  });

  const [activeRoundSim, setActiveRoundSim] = useState(null); 

  // Resume Simulation States
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);

  // OA Simulation States
  const [oaLanguage, setOaLanguage] = useState('csharp');
  const [currentOaQuestion, setCurrentOaQuestion] = useState(MICROSOFT_OA_QUESTIONS[0]);
  const [activeOaTab, setActiveOaTab] = useState('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const [consoleExpanded, setConsoleExpanded] = useState(true);
  const [oaCode, setOaCode] = useState('');
  const [oaTimeLeft, setOaTimeLeft] = useState(5400); // 90 mins
  const [oaWarningCount, setOaWarningCount] = useState(0);
  const [oaSubmitting, setOaSubmitting] = useState(false);
  const [oaRunLoading, setOaRunLoading] = useState(false);
  const [oaRunResult, setOaRunResult] = useState(null);
  const [oaTestCases, setOaTestCases] = useState([]);
  const [oaResult, setOaResult] = useState(null);

  // Technical Interview States
  const [interviewId, setInterviewId] = useState(null);
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [userResponseText, setUserResponseText] = useState('');
  
  const [whiteboardActiveTab, setWhiteboardActiveTab] = useState('Approach');
  const [whiteboardData, setWhiteboardData] = useState({
    'Approach': '// Explain your high-level approach here...\\n',
    'Pseudo Code': '// Write some pseudo code...\\n',
    'Edge Cases': '// List edge cases to handle...\\n',
    'Complexity': '// Time & Space Complexity analysis...\\n'
  });
  
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorMinimap, setEditorMinimap] = useState(false);
  const [interviewCode, setInterviewCode] = useState('// Microsoft Live Coding Environment\\n');
  const [techLanguage, setTechLanguage] = useState('csharp');
  
  const [terminalActiveTab, setTerminalActiveTab] = useState('Console');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalMetrics, setTerminalMetrics] = useState(null);
  const [terminalCustomInput, setTerminalCustomInput] = useState('');

  const [liveEvaluation, setLiveEvaluation] = useState({
    problemSolving: 50,
    communication: 50,
    codeQuality: 50,
    optimization: 50
  });

  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState('setup'); 
  const [currentRoundQuestion, setCurrentRoundQuestion] = useState('');
  const [interviewResult, setInterviewResult] = useState(null);
  const [interviewRunLoading, setInterviewRunLoading] = useState(false);
  const [interviewRunOutput, setInterviewRunOutput] = useState('');
  const [currentTechProblem, setCurrentTechProblem] = useState(null);

  // System Design States
  const [sysDesignActiveTab, setSysDesignActiveTab] = useState('Architecture');
  const [sysDesignData, setSysDesignData] = useState({
    'Architecture': '// Draw architecture or describe components here...\\n// Example: LB -> API Gateway -> Microservices -> Azure Cosmos DB',
    'Database': '// SQL/NoSQL schemas, Sharding, Replication...\\n',
    'API Design': '// REST / gRPC endpoints...\\n',
    'Tradeoffs': '// Scalability, Security, Bottlenecks, Caching (Redis/Memcached)...\\n'
  });

  // Behavioral / HR States
  const [hrCurrentQuestion, setHrCurrentQuestion] = useState('Tell me about a time you had a disagreement with a team member. How did you resolve it with a Growth Mindset?');
  const [starAnalysis, setStarAnalysis] = useState(null);
  
  // Dashboard / Final Result States
  const [showFinalReport, setShowFinalReport] = useState(false);

  // Initial Load & Animations
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/prep/companies/Microsoft');
        const fetchedCompany = res.data.company;
        setCompany(fetchedCompany);
        
        const dbRoles = res.data.roles || [];
        const mergedRoles = MICROSOFT_ROLES.map(hr => {
          const matchingDbRole = dbRoles.find(dr => dr.roleName.toLowerCase() === hr.roleName.toLowerCase());
          return {
            ...hr,
            _id: matchingDbRole ? matchingDbRole._id : hr._id
          };
        });
        setRoles(mergedRoles);
        
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        if (roleParam) {
          const targetRole = mergedRoles.find(r => r.roleName === decodeURIComponent(roleParam));
          if (targetRole) {
            setSelectedRoleData(targetRole);
            setSimulationRounds(MICROSOFT_PIPELINE);
            
            try {
              const resAttempt = await api.post('/prep/attempt', { companyId: fetchedCompany._id, roleId: targetRole._id });
              setSimState({
                attemptId: resAttempt.data._id,
                currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
                scores: resAttempt.data.scores || {},
                roundDetails: resAttempt.data.roundDetails || {},
                finalReport: resAttempt.data.finalReport || null
              });
            } catch (attemptErr) {
              console.error('Attempt API failed', attemptErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch Microsoft details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    if (!loading && !selectedRoleData && heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [loading, selectedRoleData]);

  // Handle back button isolation
  useEffect(() => {
    const handlePopState = (e) => {
      if (activeRoundSim) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname + window.location.search);
        toast.error('Please exit the simulation using the Exit button before navigating back.');
      } else if (selectedRoleData) {
        e.preventDefault();
        const newSearch = new URLSearchParams(window.location.search);
        newSearch.delete('role');
        window.history.pushState(null, '', window.location.pathname + '?' + newSearch.toString());
        setSelectedRoleData(null);
        setActiveRoundSim(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeRoundSim, selectedRoleData]);

  // Online Assessment timer
  useEffect(() => {
    let timer;
    if (activeRoundSim?.category === 'coding' && oaTimeLeft > 0) {
      timer = setInterval(() => {
        setOaTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeRoundSim, oaTimeLeft]);

  // Placeholder for missing helper functions
  const handleExitSimulation = () => {
    setActiveRoundSim(null);
  };

  const loadRolePipeline = async (roleObj) => {
    try {
      setSimulationRounds(MICROSOFT_PIPELINE);
      const resAttempt = await api.post('/prep/attempt', { companyId: company?._id || '500000000000000000000003', roleId: roleObj._id });
      setSimState({
        attemptId: resAttempt.data._id,
        currentRoundIndex: resAttempt.data.currentRoundIndex || 0,
        scores: resAttempt.data.scores || {},
        roundDetails: resAttempt.data.roundDetails || {},
        finalReport: resAttempt.data.finalReport || null
      });
      setSelectedRoleData(roleObj);
    } catch(err) {
      console.error(err);
      toast.error('Failed to load pipeline.');
    }
  };

  const startSimulationStage = (round) => {
    if (round.id === 'oa') {
      enterFullscreen();
    }
    
    if (round.id === 'tech1') {
      setCurrentTechProblem(MICROSOFT_TECH_QUESTIONS.tech1);
      setInterviewMessages([{ sender: 'ai', text: "Welcome to Microsoft! I'm your interviewer for today. Are you ready to begin with our first technical problem?", timestamp: new Date().toLocaleTimeString() }]);
    } else if (round.id === 'tech2') {
      setCurrentTechProblem(MICROSOFT_TECH_QUESTIONS.tech2);
      setInterviewMessages([{ sender: 'ai', text: "Hello! Let's dive deeper into some complex data structures and system optimizations today. Ready?", timestamp: new Date().toLocaleTimeString() }]);
    } else if (round.id === 'system_design') {
      setInterviewMessages([{ sender: 'ai', text: "Welcome to the System Design round. Today, we want you to design a highly scalable, globally distributed URL shortener (like bit.ly) using Azure services. How would you start?", timestamp: new Date().toLocaleTimeString() }]);
    } else if (round.id === 'behavioral') {
      setInterviewMessages([{ sender: 'ai', text: "Welcome to the Behavioral round. At Microsoft, we value a growth mindset. " + hrCurrentQuestion, timestamp: new Date().toLocaleTimeString() }]);
    }
    
    setActiveRoundSim({ roundName: round.name, roundIndex: simulationRounds.indexOf(round), category: round.category, id: round.id });
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log('Fullscreen request deferred:', err.message));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err.message));
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen bg-[#050b14] items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00a4ef]/30 border-t-[#00a4ef] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b14] flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-[#050b14] text-slate-200">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8">
            <button 
              onClick={() => {
                if (activeRoundSim) {
                  toast.error("Please exit the simulation first.");
                  return;
                }
                if (selectedRoleData) {
                  const newSearch = new URLSearchParams(window.location.search);
                  newSearch.delete('role');
                  window.history.pushState(null, '', window.location.pathname + '?' + newSearch.toString());
                  setSelectedRoleData(null);
                } else {
                  navigate(-1);
                }
              }}
              className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors font-semibold"
            >
              <FaArrowLeft className="mr-2" /> 
              {activeRoundSim ? 'Exit Simulation' : (selectedRoleData ? 'Back to Roles' : 'Back')}
            </button>
            
            {!selectedRoleData ? (
               <div ref={heroRef} className="space-y-12">
                 <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#004f87] to-[#002b4d] border border-white/10 p-10 lg:p-16 flex flex-col md:flex-row items-center gap-10">
                   <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(20px)" }}></div>
                   <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,164,239,0.3)] z-10 p-4">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-full h-full object-contain" />
                   </div>
                   <div className="flex-1 z-10 text-center md:text-left">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                       <span className="bg-[#00a4ef]/20 text-[#00a4ef] border border-[#00a4ef]/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Tier 1 Tech</span>
                       <span className="bg-[#7fba00]/20 text-[#7fba00] border border-[#7fba00]/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Active Hiring</span>
                     </div>
                     <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Microsoft <span className="text-[#00a4ef]">University</span></h1>
                     <p className="text-lg text-blue-200/80 max-w-2xl font-light leading-relaxed">
                       Empower every person and every organization on the planet to achieve more. Master the Microsoft engineering culture and technical bar.
                     </p>
                   </div>
                 </div>
                 
                 {/* Roles Section */}
                 <div>
                   <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FaBriefcase className="text-[#00a4ef]" /> Available Roles</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {roles.map((role, i) => (
                       <motion.div 
                         key={role._id}
                         whileHover={{ y: -5, scale: 1.02 }}
                         className="bg-[#0a1220] border border-[#00a4ef]/20 rounded-2xl p-6 cursor-pointer hover:shadow-[0_10px_30px_rgba(0,164,239,0.15)] transition-all flex flex-col"
                         onClick={() => {
                           const newSearch = new URLSearchParams(window.location.search);
                           newSearch.set('role', role.roleName);
                           window.history.pushState(null, '', window.location.pathname + '?' + newSearch.toString());
                           loadRolePipeline(role);
                         }}
                       >
                         <div className="flex justify-between items-start mb-4">
                           <h3 className="text-lg font-bold text-white">{role.roleName}</h3>
                           <span className="bg-[#7fba00]/20 text-[#7fba00] text-[10px] font-bold px-2 py-1 rounded">{role.demand} Demand</span>
                         </div>
                         <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-2">{role.description}</p>
                         <div className="space-y-2 mb-4">
                           <div className="flex items-center text-xs text-slate-300"><FaBrain className="mr-2 text-[#00a4ef] w-4" /> Difficulty: <strong className="ml-1 text-white">{role.difficulty}</strong></div>
                           <div className="flex items-center text-xs text-slate-300"><FaClock className="mr-2 text-[#ffb900] w-4" /> Prep Time: <strong className="ml-1 text-white">{role.prepTime}</strong></div>
                         </div>
                         <div className="flex flex-wrap gap-1 mt-auto">
                           {role.requiredSkills.slice(0, 3).map((skill, idx) => (
                             <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-300">{skill}</span>
                           ))}
                           {role.requiredSkills.length > 3 && <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-300">+{role.requiredSkills.length - 3}</span>}
                         </div>
                       </motion.div>
                     ))}
                   </div>
                 </div>
               </div>
            ) : (
              <div>
                {/* Role Details and Pipeline */}
                {!activeRoundSim && !showFinalReport ? (
                   <div className="space-y-8 animate-fade-in-up">
                     {/* Role Details Overview */}
                     <div className="bg-[#0a1220] border border-[#00a4ef]/20 rounded-3xl p-8 lg:p-10 shadow-[0_10px_40px_rgba(0,164,239,0.05)] relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-[#00a4ef]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                       <h2 className="text-3xl font-black text-white mb-2">{selectedRoleData.roleName}</h2>
                       <p className="text-blue-200/60 mb-8 max-w-3xl leading-relaxed">{selectedRoleData.description}</p>
                       
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                         <div className="bg-[#050b14] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                           <FaCheckCircle className="text-[#7fba00] text-2xl mb-2" />
                           <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Difficulty</div>
                           <div className="text-white font-bold">{selectedRoleData.difficulty}</div>
                         </div>
                         <div className="bg-[#050b14] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                           <FaClock className="text-[#00a4ef] text-2xl mb-2" />
                           <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Timeline</div>
                           <div className="text-white font-bold">{selectedRoleData.prepTime}</div>
                         </div>
                         <div className="bg-[#050b14] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                           <FaAward className="text-[#ffb900] text-2xl mb-2" />
                           <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Avg Package</div>
                           <div className="text-white font-bold">{selectedRoleData.avgSalary}</div>
                         </div>
                         <div className="bg-[#050b14] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                           <FaUsers className="text-[#f25022] text-2xl mb-2" />
                           <div className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">Demand</div>
                           <div className="text-white font-bold">{selectedRoleData.demand}</div>
                         </div>
                       </div>
                       
                       <h3 className="text-lg font-bold text-white mb-4">Required Skills</h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedRoleData.requiredSkills.map(skill => (
                           <span key={skill} className="bg-[#00a4ef]/10 text-[#00a4ef] border border-[#00a4ef]/20 px-4 py-2 rounded-xl text-sm font-medium">
                             {skill}
                           </span>
                         ))}
                       </div>
                     </div>
                     
                     {/* Microsoft Hiring Pipeline Flow */}
                     <h2 className="text-2xl font-bold text-white mt-12 mb-6">Your Hiring Pipeline</h2>
                     <div className="space-y-4">
                       {simulationRounds.map((round, idx) => {
                         const isLocked = idx > simState.currentRoundIndex;
                         const isCurrent = idx === simState.currentRoundIndex;
                         const isCompleted = idx < simState.currentRoundIndex;
                         
                         return (
                           <div 
                             key={idx} 
                             className={`relative overflow-hidden rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${
                               isCurrent ? 'bg-gradient-to-r from-[#00a4ef]/10 to-[#0a1220] border-[#00a4ef]/40 shadow-[0_0_20px_rgba(0,164,239,0.15)] transform hover:scale-[1.01]' :
                               isCompleted ? 'bg-[#0a1220] border-[#7fba00]/30' :
                               'bg-[#050b14] border-white/5 opacity-70'
                             }`}
                           >
                             <div className="flex items-center gap-5">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                                 isCurrent ? 'bg-[#00a4ef] text-white shadow-lg' :
                                 isCompleted ? 'bg-[#7fba00]/20 text-[#7fba00]' :
                                 'bg-white/5 text-slate-500'
                               }`}>
                                 {isLocked ? <FaLock /> : (isCompleted ? <FaCheck /> : <round.icon />)}
                               </div>
                               <div>
                                 <h3 className={`text-lg font-bold ${isLocked ? 'text-slate-400' : 'text-white'}`}>{round.name}</h3>
                                 <div className="flex items-center text-xs mt-1 text-slate-400 gap-3">
                                   <span className="flex items-center"><FaClock className="mr-1" /> {round.duration}</span>
                                   <span className="capitalize bg-white/10 px-2 py-0.5 rounded text-[10px]">{round.category}</span>
                                 </div>
                               </div>
                             </div>
                             
                             <div className="w-full md:w-auto">
                               {isLocked ? (
                                 <button disabled className="w-full md:w-32 py-2.5 rounded-xl bg-white/5 text-slate-500 text-sm font-semibold cursor-not-allowed">
                                   Locked
                                 </button>
                               ) : isCompleted ? (
                                 <div className="flex items-center gap-3">
                                   <div className="px-4 py-2 rounded-xl bg-[#7fba00]/10 text-[#7fba00] text-sm font-bold flex items-center">
                                     <FaCheckCircle className="mr-2" /> Passed
                                   </div>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => startSimulationStage(round)}
                                   className="w-full md:w-32 py-2.5 rounded-xl bg-[#00a4ef] hover:bg-[#008cce] text-white text-sm font-bold shadow-lg shadow-[#00a4ef]/20 transition-colors flex items-center justify-center gap-2 group"
                                 >
                                   Start <FaPlay className="text-[10px] group-hover:translate-x-1 transition-transform" />
                                 </button>
                               )}
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                ) : (
                   <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col">
                     {activeRoundSim?.category === 'screening' && (
                        <div className="flex-1 bg-[#0a1220] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                          <FaBriefcase className="text-6xl text-[#00a4ef] mb-6" />
                          <h2 className="text-2xl font-bold text-white mb-2">Resume Screening</h2>
                          <p className="text-slate-400 max-w-md mb-8">Microsoft's ATS scans for exact keywords, impactful metrics, and core required skills for the {selectedRoleData.roleName} role.</p>
                          <div className="w-full max-w-md p-8 border-2 border-dashed border-[#00a4ef]/30 rounded-2xl hover:border-[#00a4ef] transition-colors cursor-pointer bg-[#00a4ef]/5 group">
                            <FaUpload className="text-3xl text-[#00a4ef] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-white font-medium mb-1">Upload Resume (PDF/TXT)</p>
                            <p className="text-xs text-slate-400">or click to auto-generate mock analysis</p>
                          </div>
                          <button 
                            className="mt-8 bg-[#00a4ef] hover:bg-[#008cce] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#00a4ef]/20"
                            onClick={() => {
                              toast.success("Resume passes screening! Advancing to OA.");
                              setSimState(prev => ({...prev, currentRoundIndex: 1}));
                              setActiveRoundSim(null);
                            }}
                          >
                            Bypass for Testing
                          </button>
                        </div>
                     )}
                     
                     {activeRoundSim?.category === 'coding' && (
                        <div className="flex-1 flex flex-col border border-white/10 rounded-2xl overflow-hidden bg-[#0a1220]">
                          {/* OA Header */}
                          <div className="h-14 bg-[#111928] border-b border-white/10 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                              <FaLaptopCode className="text-[#00a4ef]" />
                              <span className="font-bold text-white">Online Assessment</span>
                              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded ml-2">Recording</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center text-slate-300 font-mono">
                                <FaClock className="mr-2 text-[#00a4ef]" />
                                {Math.floor(oaTimeLeft / 60)}:{(oaTimeLeft % 60).toString().padStart(2, '0')}
                              </div>
                              <button onClick={() => { exitFullscreen(); setActiveRoundSim(null); }} className="text-xs text-slate-400 hover:text-white border border-slate-600 px-3 py-1 rounded">Exit</button>
                            </div>
                          </div>
                          
                          {/* OA Split View */}
                          <div className="flex-1 flex overflow-hidden">
                            {/* Left Panel: Problem */}
                            <div className="w-1/2 border-r border-white/10 flex flex-col overflow-hidden bg-[#0a1220]">
                              <div className="flex border-b border-white/10 bg-[#050b14]">
                                <button className="px-4 py-3 text-sm font-semibold border-b-2 border-[#00a4ef] text-white">Description</button>
                                <button className="px-4 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-white">Submissions</button>
                              </div>
                              <div className="flex-1 overflow-y-auto p-6 no-scrollbar text-slate-300">
                                <h1 className="text-2xl font-bold text-white mb-2">{currentOaQuestion.title}</h1>
                                <div className="flex gap-2 mb-6">
                                  <span className="text-[#ffb900] bg-[#ffb900]/10 px-2 py-1 rounded text-xs font-semibold">{currentOaQuestion.difficulty}</span>
                                </div>
                                <div className="prose prose-invert max-w-none text-sm whitespace-pre-wrap mb-8">
                                  {currentOaQuestion.description}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4">Examples:</h3>
                                <div className="space-y-4 mb-8">
                                  {currentOaQuestion.examples.map((ex, i) => (
                                    <div key={i} className="bg-[#111928] p-4 rounded-xl border border-white/5 font-mono text-sm">
                                      <div><span className="text-slate-500">Input:</span> {ex.input}</div>
                                      <div><span className="text-slate-500">Output:</span> {ex.output}</div>
                                      {ex.explanation && <div className="text-slate-400 mt-2 text-xs">// {ex.explanation}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Panel: Editor */}
                            <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
                              <div className="h-10 bg-[#111928] flex items-center justify-between px-4 border-b border-white/10">
                                <select 
                                  value={oaLanguage} 
                                  onChange={(e) => setOaLanguage(e.target.value)}
                                  className="bg-[#1e1e1e] text-white text-xs border border-white/10 rounded px-2 py-1 outline-none"
                                >
                                  <option value="csharp">C#</option>
                                  <option value="java">Java</option>
                                  <option value="python">Python</option>
                                  <option value="cpp">C++</option>
                                  <option value="javascript">JavaScript</option>
                                </select>
                                <div className="flex gap-2">
                                  <button className="text-slate-400 hover:text-white"><FaSync className="text-xs" /></button>
                                  <button className="text-slate-400 hover:text-white"><FaSlidersH className="text-xs" /></button>
                                </div>
                              </div>
                              <div className="flex-1 relative">
                                <Editor
                                  height="100%"
                                  language={oaLanguage}
                                  theme="vs-dark"
                                  value={oaCode}
                                  onChange={setOaCode}
                                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                                />
                              </div>
                              <div className="h-48 border-t border-white/10 bg-[#111928] flex flex-col">
                                <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
                                  <div className="flex gap-4">
                                    <button className="text-sm font-semibold text-white border-b-2 border-[#00a4ef]">Testcases</button>
                                    <button className="text-sm font-semibold text-slate-400">Result</button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="px-4 py-1.5 rounded bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">Run Code</button>
                                    <button 
                                      className="px-4 py-1.5 rounded bg-[#7fba00] text-white text-sm font-bold shadow-lg hover:bg-[#6da100] transition-colors"
                                      onClick={() => {
                                        toast.success("Assessment Submitted Successfully!");
                                        exitFullscreen();
                                        setSimState(prev => ({...prev, currentRoundIndex: 2}));
                                        setActiveRoundSim(null);
                                      }}
                                    >Submit</button>
                                  </div>
                                </div>
                                <div className="flex-1 p-4 overflow-y-auto no-scrollbar font-mono text-sm text-slate-300">
                                  Input: <br/>
                                  <span className="text-white">{currentOaQuestion.testCases[0].input}</span><br/><br/>
                                  Expected Output: <br/>
                                  <span className="text-white">{currentOaQuestion.testCases[0].output}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                     )}

                     {activeRoundSim?.category === 'technical' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* Col 1: Video & AI Evaluation */}
                          <div className="w-full lg:w-[280px] flex flex-col gap-4">
                            <div className="bg-[#0a1220] border border-white/10 rounded-2xl overflow-hidden relative">
                              <div className="aspect-video bg-[#111928] flex items-center justify-center border-b border-white/10 relative">
                                <FaRobot className="text-4xl text-[#00a4ef]/50" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> AI Interviewer
                                </div>
                              </div>
                              <div className="aspect-video bg-[#1a2235] flex items-center justify-center relative">
                                <FaUserTie className="text-4xl text-slate-500" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur">You (Candidate)</div>
                              </div>
                            </div>
                            
                            <div className="bg-[#0a1220] border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden">
                              <div className="p-3 border-b border-white/10 bg-[#111928]">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><FaChartLine className="text-[#00a4ef]" /> Live Evaluation</h3>
                              </div>
                              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                <div>
                                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Problem Solving</span><span className="text-white font-bold">{liveEvaluation.problemSolving}%</span></div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#00a4ef]" style={{width: `${liveEvaluation.problemSolving}%`}}></div></div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Code Quality</span><span className="text-white font-bold">{liveEvaluation.codeQuality}%</span></div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#7fba00]" style={{width: `${liveEvaluation.codeQuality}%`}}></div></div>
                                </div>
                                <div>
                                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Optimization</span><span className="text-white font-bold">{liveEvaluation.optimization}%</span></div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#ffb900]" style={{width: `${liveEvaluation.optimization}%`}}></div></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="h-48 bg-[#0a1220] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                              <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar text-sm">
                                {interviewMessages.map((msg, idx) => (
                                  <div key={idx} className={`p-2 rounded-lg ${msg.sender === 'ai' ? 'bg-[#00a4ef]/10 text-blue-100 border border-[#00a4ef]/20 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                                    {msg.text}
                                  </div>
                                ))}
                              </div>
                              <div className="p-2 border-t border-white/10 bg-[#111928] flex">
                                <input type="text" className="flex-1 bg-transparent text-sm text-white px-2 outline-none" placeholder="Reply..." value={userResponseText} onChange={(e) => setUserResponseText(e.target.value)} />
                                <button className="text-[#00a4ef] p-2" onClick={() => {
                                  if(userResponseText.trim()){
                                    setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                    setUserResponseText('');
                                  }
                                }}><FaPaperPlane/></button>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Problem & Whiteboard */}
                          <div className="w-full lg:w-[400px] bg-[#0a1220] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="h-1/2 border-b border-white/10 overflow-y-auto p-5 no-scrollbar">
                              <h2 className="text-xl font-bold text-white mb-2">{currentTechProblem?.title}</h2>
                              <div className="flex gap-2 mb-4">
                                <span className="text-[#f25022] bg-[#f25022]/10 px-2 py-1 rounded text-xs font-semibold">{currentTechProblem?.difficulty}</span>
                                <span className="text-slate-400 bg-white/5 px-2 py-1 rounded text-xs font-semibold">{currentTechProblem?.acceptanceRate}</span>
                              </div>
                              <div className="text-sm text-slate-300 whitespace-pre-wrap mb-4">{currentTechProblem?.description}</div>
                              {currentTechProblem?.examples.map((ex, i) => (
                                <div key={i} className="bg-[#111928] p-3 rounded-lg border border-white/5 font-mono text-xs text-slate-400 mb-2">
                                  <div className="text-white">Input: {ex.input}</div>
                                  <div className="text-white">Output: {ex.output}</div>
                                </div>
                              ))}
                              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-200">
                                <strong>Expected:</strong> {currentTechProblem?.expectedComplexity}
                              </div>
                            </div>
                            
                            <div className="h-1/2 flex flex-col bg-[#050b14]">
                              <div className="flex bg-[#111928] border-b border-white/10 overflow-x-auto no-scrollbar">
                                {['Approach', 'Pseudo Code', 'Edge Cases', 'Complexity'].map(tab => (
                                  <button 
                                    key={tab} 
                                    className={`px-4 py-2 text-xs font-semibold whitespace-nowrap ${whiteboardActiveTab === tab ? 'border-b-2 border-[#00a4ef] text-white bg-[#00a4ef]/5' : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent'}`}
                                    onClick={() => setWhiteboardActiveTab(tab)}
                                  >
                                    {tab}
                                  </button>
                                ))}
                              </div>
                              <textarea 
                                className="flex-1 w-full bg-transparent text-slate-300 p-4 font-mono text-sm resize-none outline-none focus:ring-1 focus:ring-[#00a4ef]/30"
                                value={whiteboardData[whiteboardActiveTab]}
                                onChange={(e) => setWhiteboardData({...whiteboardData, [whiteboardActiveTab]: e.target.value})}
                                spellCheck="false"
                              />
                            </div>
                          </div>

                          {/* Col 3: Editor & Console */}
                          <div className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="h-12 bg-[#111928] flex items-center justify-between px-4 border-b border-white/10">
                              <div className="flex items-center gap-3">
                                <select className="bg-[#1e1e1e] text-white text-xs border border-white/10 rounded px-2 py-1 outline-none" value={techLanguage} onChange={(e)=>setTechLanguage(e.target.value)}>
                                  <option value="csharp">C#</option>
                                  <option value="java">Java</option>
                                  <option value="python">Python</option>
                                  <option value="cpp">C++</option>
                                </select>
                                <select className="bg-[#1e1e1e] text-white text-xs border border-white/10 rounded px-2 py-1 outline-none" value={editorTheme} onChange={(e)=>setEditorTheme(e.target.value)}>
                                  <option value="vs-dark">Dark</option>
                                  <option value="light">Light</option>
                                  <option value="hc-black">High Contrast</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="text-white hover:text-[#00a4ef] px-2" onClick={() => setEditorFontSize(prev => Math.min(24, prev + 2))}><FaPlus className="text-xs"/></button>
                                <button className="text-white hover:text-[#00a4ef] px-2" onClick={() => setEditorFontSize(prev => Math.max(10, prev - 2))}><FaMinus className="text-xs"/></button>
                              </div>
                            </div>
                            
                            <div className="flex-1 relative">
                              <Editor
                                height="100%"
                                language={techLanguage}
                                theme={editorTheme}
                                value={interviewCode}
                                onChange={setInterviewCode}
                                options={{ minimap: { enabled: false }, fontSize: editorFontSize, scrollBeyondLastLine: false }}
                              />
                            </div>
                            
                            <div className="h-56 bg-[#111928] border-t border-white/10 flex flex-col">
                              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                                <div className="flex gap-4">
                                  {['Console', 'Testcases'].map(tab => (
                                    <button 
                                      key={tab} 
                                      className={`text-sm font-semibold ${terminalActiveTab === tab ? 'text-white border-b-2 border-[#00a4ef]' : 'text-slate-500 hover:text-white'}`}
                                      onClick={() => setTerminalActiveTab(tab)}
                                    >
                                      {tab}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded text-sm transition-colors" onClick={() => setTerminalOutput('Compiling...\nTest Case 1: Passed\nTest Case 2: Passed\nAll tests clear.')}>Run</button>
                                  <button className="bg-[#00a4ef] hover:bg-[#008cce] text-white px-4 py-1.5 rounded text-sm font-bold shadow-lg shadow-[#00a4ef]/20 transition-colors" onClick={() => {
                                      toast.success("Round completed successfully!");
                                      setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                      setActiveRoundSim(null);
                                  }}>Submit Round</button>
                                </div>
                              </div>
                              <div className="flex-1 bg-[#0a0a0a] p-4 overflow-y-auto font-mono text-sm">
                                {terminalActiveTab === 'Console' ? (
                                  <div className="text-slate-300 whitespace-pre-wrap">{terminalOutput || '> Terminal ready. Execute code to see output.'}</div>
                                ) : (
                                  <div className="text-slate-400">Custom Testcases interface would render here.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                     )}
                     
                     {activeRoundSim?.category === 'system' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* Col 1: AI Interviewer */}
                          <div className="w-full lg:w-[320px] flex flex-col gap-4">
                            <div className="bg-[#0a1220] border border-white/10 rounded-2xl overflow-hidden relative">
                              <div className="aspect-video bg-[#111928] flex items-center justify-center relative">
                                <FaRobot className="text-5xl text-[#00a4ef]/50" />
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white backdrop-blur flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div> System Design AI
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-[#0a1220] border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden">
                              <div className="p-3 border-b border-white/10 bg-[#111928] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">Design Discussion</h3>
                                <span className="bg-[#00a4ef]/20 text-[#00a4ef] text-[10px] px-2 py-0.5 rounded font-bold">Recording</span>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-sm">
                                {interviewMessages.map((msg, idx) => (
                                  <div key={idx} className={`p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-[#00a4ef]/10 text-blue-100 border border-[#00a4ef]/20 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                                    {msg.text}
                                  </div>
                                ))}
                              </div>
                              <div className="p-3 border-t border-white/10 bg-[#111928] flex gap-2">
                                <input 
                                  type="text" 
                                  className="flex-1 bg-black/30 border border-white/10 rounded-lg text-sm text-white px-3 py-2 outline-none focus:border-[#00a4ef]/50 transition-colors" 
                                  placeholder="Explain your design..." 
                                  value={userResponseText} 
                                  onChange={(e) => setUserResponseText(e.target.value)} 
                                  onKeyDown={(e) => {
                                    if(e.key === 'Enter' && userResponseText.trim()){
                                      setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                      setUserResponseText('');
                                      setTimeout(() => {
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'How would you ensure this system scales globally across multiple Azure regions without high latency?'}]);
                                      }, 1500);
                                    }
                                  }}
                                />
                                <button className="bg-[#00a4ef] hover:bg-[#008cce] text-white p-2.5 rounded-lg transition-colors flex items-center justify-center" onClick={() => {
                                  if(userResponseText.trim()){
                                    setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                    setUserResponseText('');
                                    setTimeout(() => {
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'How would you ensure this system scales globally across multiple Azure regions without high latency?'}]);
                                    }, 1500);
                                  }
                                }}><FaPaperPlane/></button>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Interactive System Design Whiteboard */}
                          <div className="flex-1 bg-[#0a1220] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                            <div className="h-14 bg-[#111928] border-b border-white/10 flex items-center justify-between px-4">
                              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                                {['Architecture', 'Database', 'API Design', 'Tradeoffs'].map(tab => (
                                  <button 
                                    key={tab} 
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${sysDesignActiveTab === tab ? 'bg-[#00a4ef]/20 text-[#00a4ef]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setSysDesignActiveTab(tab)}
                                  >
                                    {tab}
                                  </button>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <button className="bg-[#7fba00] hover:bg-[#6da100] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-[#7fba00]/20 transition-colors" onClick={() => {
                                    toast.success("System Design evaluation completed!");
                                    setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                    setActiveRoundSim(null);
                                }}>Submit Design</button>
                              </div>
                            </div>
                            
                            <div className="flex-1 relative bg-[#050b14]">
                              {/* Overlay grid background */}
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                              <textarea 
                                className="w-full h-full bg-transparent text-slate-300 p-6 font-mono text-sm resize-none outline-none relative z-10"
                                value={sysDesignData[sysDesignActiveTab]}
                                onChange={(e) => setSysDesignData({...sysDesignData, [sysDesignActiveTab]: e.target.value})}
                                spellCheck="false"
                              />
                            </div>
                          </div>
                        </div>
                     )}

                     {activeRoundSim?.category === 'hr' && (
                        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                          {/* HR Left Col */}
                          <div className="w-full lg:w-[400px] flex flex-col gap-4">
                            <div className="bg-[#0a1220] border border-white/10 rounded-2xl p-6 text-center">
                              <FaUserTie className="text-5xl text-[#7fba00] mx-auto mb-4" />
                              <h2 className="text-xl font-bold text-white mb-2">Behavioral Interview</h2>
                              <p className="text-slate-400 text-sm">Microsoft heavily evaluates the "Growth Mindset" and cultural fit based on past experiences.</p>
                            </div>

                            <div className="flex-1 bg-[#0a1220] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
                              <div className="p-3 border-b border-white/10 bg-[#111928] flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">Discussion</h3>
                              </div>
                              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-sm">
                                {interviewMessages.map((msg, idx) => (
                                  <div key={idx} className={`p-3 rounded-xl ${msg.sender === 'ai' ? 'bg-[#7fba00]/10 text-[#7fba00] border border-[#7fba00]/20 mr-4' : 'bg-white/10 text-white ml-4'}`}>
                                    {msg.text}
                                  </div>
                                ))}
                                {starAnalysis && (
                                  <div className="p-3 rounded-xl bg-[#ffb900]/10 border border-[#ffb900]/20 mt-4 mr-4 text-xs">
                                    <div className="font-bold text-[#ffb900] mb-2 border-b border-[#ffb900]/20 pb-1">STAR Analysis Feedback</div>
                                    <div className="space-y-1 text-yellow-100/80">
                                      <p><strong className="text-white">Situation:</strong> {starAnalysis.s}</p>
                                      <p><strong className="text-white">Task:</strong> {starAnalysis.t}</p>
                                      <p><strong className="text-white">Action:</strong> {starAnalysis.a}</p>
                                      <p><strong className="text-white">Result:</strong> {starAnalysis.r}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 border-t border-white/10 bg-[#111928] flex flex-col gap-2">
                                <textarea 
                                  className="w-full bg-black/30 border border-white/10 rounded-lg text-sm text-white p-3 outline-none focus:border-[#7fba00]/50 transition-colors resize-none h-24" 
                                  placeholder="Use the STAR method to answer..." 
                                  value={userResponseText} 
                                  onChange={(e) => setUserResponseText(e.target.value)} 
                                />
                                <div className="flex justify-end gap-2">
                                  <button className="bg-[#7fba00] hover:bg-[#6da100] text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors flex items-center" onClick={() => {
                                    if(userResponseText.trim()){
                                      setInterviewMessages([...interviewMessages, {sender:'user', text: userResponseText}]);
                                      setUserResponseText('');
                                      
                                      setTimeout(() => {
                                        setStarAnalysis({
                                          s: "Clear context provided.",
                                          t: "Goal was well defined.",
                                          a: "Action steps showed good leadership but lacked technical detail.",
                                          r: "Result was impactful but could use harder metrics (e.g. % improvement)."
                                        });
                                        setInterviewMessages(prev => [...prev, {sender:'ai', text: 'Thanks for sharing. Can you tell me about a time you had to learn a completely new technology very quickly under pressure?'}]);
                                      }, 2000);
                                    }
                                  }}>Reply <FaPaperPlane className="ml-2 text-xs"/></button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* HR Right Col (Evaluation Metrics) */}
                          <div className="flex-1 bg-[#0a1220] border border-white/10 rounded-2xl p-8 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Live Assessment Metrics</h3>
                            
                            <div className="grid grid-cols-2 gap-6 flex-1 content-start">
                              {/* Metric Cards */}
                              {[
                                {name: 'Growth Mindset', score: 85, color: '#00a4ef'},
                                {name: 'Communication', score: 92, color: '#7fba00'},
                                {name: 'Leadership', score: 78, color: '#ffb900'},
                                {name: 'Collaboration', score: 88, color: '#f25022'}
                              ].map(m => (
                                <div key={m.name} className="bg-[#111928] border border-white/5 rounded-xl p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-300 font-medium">{m.name}</span>
                                    <span className="text-white font-bold">{m.score}%</span>
                                  </div>
                                  <div className="h-2 bg-black rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{width: `${m.score}%`, backgroundColor: m.color}}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <button 
                               className="mt-8 bg-[#00a4ef] hover:bg-[#008cce] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#00a4ef]/20 w-full"
                               onClick={() => {
                                 toast.success(`Behavioral Round completed!`);
                                 setSimState(prev => ({...prev, currentRoundIndex: activeRoundSim.roundIndex + 1}));
                                 setActiveRoundSim(null);
                                 setShowFinalReport(true); // Trigger Final Report when last round completes
                               }}
                             >
                               Complete Interview Process
                            </button>
                          </div>
                        </div>
                     )}
                   </div>
                )}
                
                {/* Final Report / Hiring Committee View */}
                {!activeRoundSim && showFinalReport && (
                   <div className="animate-fade-in-up space-y-6">
                     <div className="bg-gradient-to-r from-[#00a4ef]/10 via-[#0a1220] to-[#0a1220] border border-[#00a4ef]/30 rounded-3xl p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
                       <div className="w-32 h-32 rounded-full bg-[#00a4ef]/20 flex items-center justify-center border-4 border-[#00a4ef]/30 shadow-[0_0_50px_rgba(0,164,239,0.4)] shrink-0">
                         <FaTrophy className="text-5xl text-[#00a4ef]" />
                       </div>
                       <div>
                         <h1 className="text-4xl font-black text-white mb-2">Hiring Committee Decision</h1>
                         <p className="text-lg text-slate-300 mb-4">Based on your performance across 6 rigorous rounds, the Microsoft hiring panel has reached a conclusion.</p>
                         <div className="inline-block bg-[#7fba00] text-white px-4 py-1.5 rounded-full font-bold shadow-[0_0_20px_rgba(127,186,0,0.5)]">
                           Decision: STRONG HIRE
                         </div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {[
                         {title: 'Online Assessment', result: 'Passed (98%)', icon: FaLaptopCode, color: '#00a4ef'},
                         {title: 'Technical 1', result: 'Strong Hire', icon: FaCode, color: '#7fba00'},
                         {title: 'System Design', result: 'Hire', icon: FaBrain, color: '#ffb900'},
                         {title: 'Behavioral', result: 'Strong Hire', icon: FaUsers, color: '#00a4ef'}
                       ].map(r => (
                         <div key={r.title} className="bg-[#0a1220] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5" style={{color: r.color}}>
                             <r.icon className="text-2xl" />
                           </div>
                           <div>
                             <div className="text-xs text-slate-400 font-medium mb-1">{r.title}</div>
                             <div className="text-white font-bold">{r.result}</div>
                           </div>
                         </div>
                       ))}
                     </div>
                     
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                       {/* AI Notes */}
                       <div className="bg-[#0a1220] border border-white/10 rounded-2xl p-6">
                         <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Committee Notes</h3>
                         <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                           <p><strong className="text-[#00a4ef]">Strengths:</strong> Exceptional problem-solving skills demonstrated in Technical Round 1. Highly modular code structure and excellent time complexity optimization.</p>
                           <p><strong className="text-[#ffb900]">Areas for Improvement:</strong> System design trade-off analysis (specifically around NoSQL vs SQL scaling) took longer than expected. Familiarity with Azure distributed caching could be improved.</p>
                           <p><strong className="text-[#7fba00]">Behavioral Fit:</strong> Strong demonstration of the Growth Mindset. Handled ambiguity extremely well.</p>
                         </div>
                       </div>
                       
                       {/* Mock Offer */}
                       <div className="bg-[#111928] border border-[#7fba00]/30 rounded-2xl p-6 relative overflow-hidden">
                         <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#7fba00]/10 rounded-full blur-2xl"></div>
                         <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-3">Simulated Offer Letter</h3>
                         <div className="space-y-3">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Role</span>
                             <span className="text-white font-bold">{selectedRoleData.roleName} (L60)</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Team</span>
                             <span className="text-white font-bold">{selectedRoleData.department}</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                             <span className="text-slate-400">Base Salary</span>
                             <span className="text-white font-bold">{selectedRoleData.avgSalary}</span>
                           </div>
                           <div className="flex justify-between pb-2">
                             <span className="text-slate-400">Location</span>
                             <span className="text-white font-bold">{selectedRoleData.locations[0]}</span>
                           </div>
                         </div>
                         <button className="w-full mt-6 bg-[#7fba00] hover:bg-[#6da100] text-white py-3 rounded-xl font-bold transition-colors">
                           Accept Mock Offer
                         </button>
                       </div>
                     </div>
                   </div>
                )}

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicrosoftPrepDetail;
